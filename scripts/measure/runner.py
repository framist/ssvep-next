"""高层 orchestration。"""

from __future__ import annotations

import csv
import logging
from pathlib import Path
from typing import Dict, Iterable, List, Sequence

from .io import load_measurement
from .metrics import analyze_measurement
from .models import RunResult, StimResult
from .plotting import generate_plots
from .report import write_report

LOG = logging.getLogger(__name__)


def discover_measurements(candidates: Sequence[str]) -> List[Path]:
    """从候选路径中发现测量 JSON 文件（兼容旧目录结构）。"""
    sources: List[Path] = []
    visited: set[Path] = set()

    def add(path: Path) -> None:
        resolved = path.resolve()
        if resolved in visited:
            return
        visited.add(resolved)
        sources.append(resolved)

    for item in candidates:
        path = Path(item).resolve()
        if path in visited:
            continue

        if path.is_file():
            if path.suffix.lower() == ".json":
                add(path)
            else:
                LOG.warning("忽略非 JSON 文件：%s", path)
            continue

        if not path.is_dir():
            LOG.warning("忽略无效路径：%s", path)
            continue

        measurement_json = path / "measurement.json"
        if measurement_json.exists():
            add(measurement_json)
            continue

        json_files = sorted(p for p in path.glob("*.json") if p.is_file())
        if json_files:
            for json_file in json_files:
                add(json_file)
            continue

        for sub in sorted(path.iterdir()):
            if not sub.is_dir():
                continue
            legacy = sub / "measurement.json"
            if legacy.exists():
                add(legacy)

    return sources


def analyze_runs(
    inputs: Sequence[str],
    output_dir: str,
    epsilon: float = 0.2,
    warmup_s: float = 2.0,
    window_s: float = 10.0,
) -> Dict[str, Path]:
    """执行完整评测流程。"""
    measurement_sources = discover_measurements(inputs)
    if not measurement_sources:
        raise FileNotFoundError("未找到可用的测量 JSON 文件")

    LOG.info("发现 %d 份测量数据", len(measurement_sources))

    run_results: List[RunResult] = []
    for source in measurement_sources:
        try:
            measurement = load_measurement(source)
            run_result = analyze_measurement(
                measurement,
                warmup_s=warmup_s,
                window_s=window_s,
                epsilon=epsilon,
            )
            run_results.append(run_result)
        except Exception as exc:
            LOG.error("处理测量 %s 时出错：%s", source, exc)
            raise

    output_path = Path(output_dir).resolve()
    output_path.mkdir(parents=True, exist_ok=True)

    summary_path = output_path / "summary.csv"
    _write_summary(run_results, summary_path)

    plots_dir = output_path / "plots"
    plot_paths = generate_plots(run_results, plots_dir)

    report_path = write_report(
        run_results=run_results,
        summary_csv=summary_path,
        plot_paths=[path.relative_to(output_path) for path in plot_paths],
        output_dir=output_path,
    )

    return {
        "summary": summary_path,
        "report": report_path,
        "plots_dir": plots_dir,
    }


def _write_summary(run_results: Iterable[RunResult], summary_path: Path) -> None:
    rows: List[Dict[str, str]] = []
    for run in run_results:
        run_name = run.measurement.meta.source_path.stem
        for stim in run.stims:
            rows.append(_stim_to_row(run_name, stim))

    with summary_path.open("w", encoding="utf-8", newline="") as fp:
        fieldnames = [
            "run",
            "stim_id",
            "f_cfg",
            "f_meas",
            "abs_err",
            "jitter_std",
            "frame_variance",
            "frame_p95",
            "drop_ratio",
            "usable",
            "browser",
            "refresh_hz",
            "mode",
            "date",
        ]
        writer = csv.DictWriter(fp, fieldnames=fieldnames)
        writer.writeheader()
        for row in rows:
            writer.writerow(row)


def _stim_to_row(run_name: str, stim: StimResult) -> Dict[str, str]:
    return {
        "run": run_name,
        "stim_id": stim.stim_id,
        "f_cfg": _fmt_float(stim.f_cfg),
        "f_meas": _fmt_float(stim.f_meas),
        "abs_err": _fmt_float(stim.abs_err),
        "jitter_std": _fmt_float(stim.jitter_std),
        "frame_variance": _fmt_float(stim.frame_variance),
        "frame_p95": _fmt_float(stim.frame_p95),
        "drop_ratio": _fmt_float(stim.drop_ratio),
        "usable": "" if stim.usable is None else ("true" if stim.usable else "false"),
        "browser": stim.browser or "",
        "refresh_hz": _fmt_float(stim.refresh_hz),
        "mode": stim.mode or "",
        "date": stim.date or "",
    }


def _fmt_float(value) -> str:
    if value is None:
        return ""
    return f"{float(value):.6f}"
