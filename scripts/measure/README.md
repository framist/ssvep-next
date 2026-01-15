# 浏览器刺激测量脚本

本目录包含用于解析浏览器端导出的刺激日志、计算指标并生成报告的 Python 脚本。

## 快速开始

```bash
python -m scripts.measure scripts/data/*.json -o scripts/out/measure
```

- 支持直接传入一个或多个导出的测量 JSON 文件。
- 若提供目录，脚本会自动向下扫描并收集其中的 JSON（兼容旧版 `measurement.json` 目录结构）。

### 常用参数

| 参数 | 说明 | 默认值 |
| --- | --- | --- |
| `--epsilon` | 误差阈值，用于判断刺激是否“可用” | `0.2` |
| `--warmup` | 预热剔除时长（秒），统计数据时忽略首段 | `2.0` |
| `--window` | 抖动统计的滑窗时长（秒） | `1.0` |

## 输出

- `summary.csv`：按测量文件与 `stim_id` 汇总的指标表（默认保存在 `scripts/out/` 下）。
- `plots/`：若安装 `matplotlib`，将生成误差曲线（误差棒为 ±1 标准差）、抖动箱线图、帧间隔直方图。
- `report.md`：简要结论与图表引用，可直接嵌入团队文档。

## 环境依赖

- Python 3.10+。
- 图表生成需要 `matplotlib`（可选）。
- 后续若需生成更多统计，可在 `scripts/measure/metrics.py` 中扩展。
