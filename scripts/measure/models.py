"""数据结构定义。"""

from __future__ import annotations

from dataclasses import dataclass, field
from pathlib import Path
from typing import Dict, List, Optional


@dataclass
class StimMetadata:
    """刺激配置元信息。"""

    stim_id: str
    wave: Optional[str]
    f_cfg: Optional[float]


@dataclass
class MeasurementMeta:
    """单次测量的环境描述。"""

    source_path: Path
    date: Optional[str] = None
    commit: Optional[str] = None
    browser: Optional[str] = None
    os: Optional[str] = None
    refresh_hz: Optional[float] = None
    mode: Optional[str] = None
    resolution: Optional[str] = None

    def label(self) -> str:
        """用于标识测量条件的简洁标签。"""
        hz = f"{int(self.refresh_hz)}Hz" if self.refresh_hz else "unknownHz"
        browser = self.browser or "unknownBrowser"
        # mode = self.mode or "windowed"
        return f"{browser} {hz}"


@dataclass
class FrameSample:
    """帧记录条目。"""

    t_ms: float
    dt_ms: float


@dataclass
class ToggleEvent:
    """刺激状态切换事件。"""

    stim_id: str
    t_ms: float
    edge: str


@dataclass
class MeasurementData:
    """封装原始测量数据。"""

    meta: MeasurementMeta
    stims: Dict[str, StimMetadata]
    frames: List[FrameSample]
    toggles: List[ToggleEvent]


@dataclass
class FrameStats:
    """帧率稳定性统计。"""

    variance: Optional[float]
    p95: Optional[float]
    drop_ratio: Optional[float]
    dt_values: List[float] = field(default_factory=list)


@dataclass
class StimResult:
    """单个刺激的分析结果。"""

    source_path: Path
    stim_id: str
    f_cfg: Optional[float]
    f_meas: Optional[float]
    abs_err: Optional[float]
    jitter_std: Optional[float]
    frame_variance: Optional[float]
    frame_p95: Optional[float]
    drop_ratio: Optional[float]
    usable: Optional[bool]
    browser: Optional[str]
    refresh_hz: Optional[float]
    mode: Optional[str]
    date: Optional[str]


@dataclass
class RunResult:
    """单次测量的聚合结果。"""

    measurement: MeasurementData
    frame_stats: FrameStats
    stims: List[StimResult]
