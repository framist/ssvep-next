"""命令行入口。"""

from __future__ import annotations

import argparse
import logging
import sys
from typing import Sequence

from pathlib import Path

from .runner import analyze_runs

DEFAULT_OUTPUT = Path("scripts/out")


def main(argv: Sequence[str] | None = None) -> int:
    parser = argparse.ArgumentParser(description="SSVEP 浏览器测量分析")
    parser.add_argument(
        "inputs",
        nargs="+",
        help="测量 JSON 文件或包含它们的目录",
    )
    parser.add_argument(
        "-o",
        "--output",
        default=str(DEFAULT_OUTPUT),
        help="分析结果输出目录（默认：项目 scripts/out）",
    )
    parser.add_argument(
        "--epsilon",
        type=float,
        default=0.2,
        help="频率误差阈值，判断刺激是否可用",
    )
    parser.add_argument(
        "--warmup",
        type=float,
        default=2.0,
        help="预热剔除时长，单位秒",
    )
    parser.add_argument(
        "--window",
        type=float,
        default=1.0,
        help="抖动计算的滑窗长度，单位秒",
    )
    parser.add_argument(
        "--log-level",
        default="INFO",
        help="日志级别（DEBUG/INFO/WARNING/ERROR）",
    )

    args = parser.parse_args(argv)

    logging.basicConfig(
        level=getattr(logging, str(args.log_level).upper(), logging.DEBUG),
        format="%(levelname)s %(message)s",
    )

    try:
        analyze_runs(
            inputs=args.inputs,
            output_dir=args.output,
            epsilon=args.epsilon,
            warmup_s=args.warmup,
            window_s=args.window,
        )
    except FileNotFoundError as exc:
        logging.error("%s", exc)
        return 1
    return 0


if __name__ == "__main__":
    sys.exit(main())
