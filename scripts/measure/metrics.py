"""指标计算逻辑。"""

from __future__ import annotations

import logging
from collections import defaultdict
from statistics import mean, pvariance, pstdev
from typing import Dict, Iterable, List, Optional, Sequence, Tuple

from .models import FrameSample, FrameStats, MeasurementData, RunResult, StimResult, ToggleEvent

LOG = logging.getLogger(__name__)


def analyze_measurement(
    measurement: MeasurementData,
    warmup_s: float = 2.0,
    window_s: float = 10.0,
    epsilon: float = 0.2,
) -> RunResult:
    """计算单次测量的帧率与刺激指标。"""
    frame_stats = _compute_frame_stats(
        frames=measurement.frames,
        warmup_s=warmup_s,
        refresh_hz=measurement.meta.refresh_hz,
    )
    stim_results = _compute_stim_results(
        measurement=measurement,
        frame_stats=frame_stats,
        warmup_s=warmup_s,
        window_s=window_s,
        epsilon=epsilon,
    )
    return RunResult(measurement=measurement, frame_stats=frame_stats, stims=stim_results)


def _compute_frame_stats(
    frames: Sequence[FrameSample],
    warmup_s: float,
    refresh_hz: Optional[float],
) -> FrameStats:
    if not frames:
        return FrameStats(variance=None, p95=None, drop_ratio=None, dt_values=[])

    warmup_ms = warmup_s * 1000.0
    dt_values = [frame.dt_ms for frame in frames if frame.t_ms >= warmup_ms]
    if not dt_values:
        return FrameStats(variance=None, p95=None, drop_ratio=None, dt_values=[])

    variance = pvariance(dt_values) if len(dt_values) > 1 else 0.0
    p95 = _percentile(dt_values, 95)
    drop_ratio = None
    if refresh_hz:
        threshold = 1.5 * (1000.0 / refresh_hz)
        drops = sum(1 for dt in dt_values if dt > threshold)
        drop_ratio = drops / len(dt_values) if dt_values else None

    return FrameStats(
        variance=variance,
        p95=p95,
        drop_ratio=drop_ratio,
        dt_values=dt_values,
    )


def _compute_stim_results(
    measurement: MeasurementData,
    frame_stats: FrameStats,
    warmup_s: float,
    window_s: float,
    epsilon: float,
) -> List[StimResult]:
    grouped = _group_toggles(measurement.toggles, warmup_s=warmup_s)
    results: List[StimResult] = []
    for stim_id, toggles in grouped.items():
        stim_meta = measurement.stims.get(stim_id)
        f_cfg = stim_meta.f_cfg if stim_meta else None

        f_meas, abs_err, jitter_std = _freq_metrics(
            toggles=toggles,
            f_cfg=f_cfg,
            warmup_s=warmup_s,
            window_s=window_s,
        )
        usable = None
        if abs_err is not None:
            usable = abs_err < epsilon

        results.append(
            StimResult(
                source_path=measurement.meta.source_path,
                stim_id=stim_id,
                f_cfg=f_cfg,
                f_meas=f_meas,
                abs_err=abs_err,
                jitter_std=jitter_std,
                frame_variance=frame_stats.variance,
                frame_p95=frame_stats.p95,
                drop_ratio=frame_stats.drop_ratio,
                usable=usable,
                browser=measurement.meta.browser,
                refresh_hz=measurement.meta.refresh_hz,
                mode=measurement.meta.mode,
                date=measurement.meta.date,
            )
        )

    # 若存在 stim 定义但没有 toggle 记录，也应输出占位结果。
    missing_ids = set(measurement.stims.keys()) - set(grouped.keys())
    for stim_id in sorted(missing_ids):
        stim_meta = measurement.stims.get(stim_id)
        results.append(
            StimResult(
                source_path=measurement.meta.source_path,
                stim_id=stim_id,
                f_cfg=stim_meta.f_cfg if stim_meta else None,
                f_meas=None,
                abs_err=None,
                jitter_std=None,
                frame_variance=frame_stats.variance,
                frame_p95=frame_stats.p95,
                drop_ratio=frame_stats.drop_ratio,
                usable=None,
                browser=measurement.meta.browser,
                refresh_hz=measurement.meta.refresh_hz,
                mode=measurement.meta.mode,
                date=measurement.meta.date,
            )
        )

    return sorted(results, key=lambda item: item.stim_id)


def _group_toggles(toggles: Iterable[ToggleEvent], warmup_s: float) -> Dict[str, List[ToggleEvent]]:
    grouped: Dict[str, List[ToggleEvent]] = defaultdict(list)
    warmup_ms = warmup_s * 1000.0
    for toggle in toggles:
        if toggle.t_ms < warmup_ms:
            continue
        if toggle.edge != "rise":
            continue
        grouped[toggle.stim_id].append(toggle)
    return grouped


def _freq_metrics(
    toggles: Sequence[ToggleEvent],
    f_cfg: Optional[float],
    warmup_s: float,
    window_s: float,
) -> Tuple[Optional[float], Optional[float], Optional[float]]:
    if len(toggles) < 2:
        return None, None, None

    periods_ms: List[float] = []
    midpoints: List[float] = []
    for prev, curr in zip(toggles, toggles[1:]):
        delta = curr.t_ms - prev.t_ms
        if delta <= 0:
            LOG.debug("检测到非正周期，已忽略：prev=%s curr=%s", prev, curr)
            continue
        periods_ms.append(delta)
        midpoints.append((curr.t_ms + prev.t_ms) * 0.5)

    if not periods_ms:
        return None, None, None

    mean_period = mean(periods_ms)
    f_meas = 1000.0 / mean_period if mean_period else None
    abs_err = None
    if f_meas is not None and f_cfg is not None:
        abs_err = abs(f_meas - f_cfg)

    jitter_std = _windowed_jitter(periods_ms, midpoints, window_s=window_s)

    return f_meas, abs_err, jitter_std


def _windowed_jitter(
    periods_ms: Sequence[float],
    midpoints_ms: Sequence[float],
    window_s: float,
) -> Optional[float]:
    """计算给定刺激的划窗频率标准差。"""
    if not periods_ms or not midpoints_ms:
        return None

    freqs = [1000.0 / period for period in periods_ms if period > 0]
    if len(freqs) < 2:
        return None

    window_ms = window_s * 1000.0
    window_stds: List[float] = []
    left = 0
    for right in range(len(freqs)):
        while left < right and midpoints_ms[right] - midpoints_ms[left] > window_ms:
            left += 1
        window_values = freqs[left : right + 1]
        if len(window_values) >= 2:
            window_stds.append(pstdev(window_values))

    if window_stds:
        return mean(window_stds)
    return None


def _percentile(values: Sequence[float], percentile: float) -> float:
    if not values:
        raise ValueError("values 为空，无法计算百分位")
    if not 0 <= percentile <= 100:
        raise ValueError("percentile 必须处于 [0, 100]")

    sorted_vals = sorted(values)
    if len(sorted_vals) == 1:
        return sorted_vals[0]

    rank = (percentile / 100) * (len(sorted_vals) - 1)
    lower_idx = int(rank)
    upper_idx = min(lower_idx + 1, len(sorted_vals) - 1)
    weight = rank - lower_idx
    return sorted_vals[lower_idx] * (1 - weight) + sorted_vals[upper_idx] * weight
