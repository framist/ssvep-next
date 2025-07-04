[![GitHub License](https://img.shields.io/github/license/framist/ssvep-next)](https://github.com/framist/ssvep-next/blob/main/LICENSE)
[![GitHub Stars](https://img.shields.io/github/stars/framist/ssvep-next?style=social)](https://github.com/framist/ssvep-next/stargazers)

**SSVEP Visualization Web Fast Implementation** - drag-and-drop interface, and real-time stimulation rendering. i18n support, AI assistance, and more.

**SSVEP 可视化 Web 快速实现** —— 拖拽界面和实时刺激渲染。i18n 支持，AI 助手，还有更多功能。

![demo](demo.png)

[Demo | 在线使用](https://framist.github.io/ssvep-next/)

# SSVEP Next

SSVEP-Next is a single-page application (SPA) built using React, TypeScript, and Vite. It offers an intuitive and efficient graphical interface for designing and executing visual stimuli in steady-state visual evoked potential (SSVEP) experiments. Users can effortlessly create and manage SSVEP stimulation interfaces on the canvas through drag-and-drop operations and property configuration. This project draws inspiration from [quick-ssvep](https://github.com/OmidS/quickssvep) and aims to combine its core scientific capabilities with modern web development paradigms, delivering a more powerful and flexible experimental design tool.

SSVEP-Next 是一个基于 React、TypeScript 和 Vite 构建的单页面应用 (SPA)，旨在提供一个直观、高效的图形化界面，用于设计和运行稳态视觉诱发电位 (SSVEP) 实验中的视觉刺激。用户可以通过拖拽、配置属性的方式，在画布上轻松创建和管理 SSVEP 刺激界面。本项目深受 [quick-ssvep](https://github.com/OmidS/quickssvep) 的启发，并旨在将其核心科学功能与现代 Web 开发范式相结合，提供更强大、更灵活的实验设计工具。


> [!Note]
> The performance of the stimulator (the exact frequency of stimulations) highly depends on the machine and the web browser running it. It is not intended for rigorous academic use, rather it is a fast solution to test simple SSVEP setups.
>
> 注意：刺激器的性能（刺激的确切频率）在很大程度上取决于机器和运行它的 Web 浏览器。它不是为严格的学术用途而设计的，而是测试简单 SSVEP 设置的快速解决方案。

## 核心功能

- **可视化设计器：** 通过拖拽方式在画布上布局刺激方块、文本和iframe控件。
- **属性配置：** 实时调整控件的频率、文本、颜色、位置和大小等属性。
- **刺激渲染：** 精确渲染配置好的 SSVEP 刺激，支持全屏运行模式。
- **频率测量**: 实时测量刺激的瞬时和平均频率，支持滑动窗口平滑。
- **画布自定义**: 自由设置画布大小，适应不同屏幕和实验需求。
- **矩阵一键生成**: 快速创建行列均匀分布的刺激矩阵。
- **全局默认配置**: 统一设置新刺激块的初始属性，简化重复操作。
- **多种控件支持**: 除了刺激方块外，还支持文本控件和iframe嵌入控件。
- **国际化支持**: 支持中英文界面切换，自动检测浏览器语言偏好。
- **模块化组件：** 清晰的项目结构，便于功能扩展和维护。
- **AI 辅助编辑**: 集成 AI 助手，支持自然语言指令修改 JSON 配置，实现智能化编辑。

## 技术栈

- **前端框架：** React 18
- **开发工具：** Vite
- **语言：** TypeScript
- **拖拽库：** dnd-kit
- **状态管理：** Zustand

## 项目优势

| 特性 | quick-ssvep | SSVEP-Next (本项目) |
| :--- | :--- | :--- |
| **核心范式** | 参数化配置，代码驱动 | ✅ **可视化、拖拽式设计** |
| **技术架构** | 原生 JavaScript, HTML, CSS | ✅ **React, TypeScript, Vite** (现代 Web 架构) |
| **刺激类型** | 仅支持方波，颜色与样式固定 | 多种波形类型支持：方波、正弦波；用户可自定义颜色与样式 |
| **多种控件支持** | 仅支持刺激方块 | ✅ **刺激方块、文本控件、iframe嵌入控件** |
| **状态管理** | 全局变量，DOM 查询 | ✅ **Zustand** (集中式、可预测的状态管理) |
| **频率测量** | 直接测量瞬时/平均频率 | ✅ **继承并优化**：实现相同的直接测量法，并增加滑动窗口平滑 |
| **帧率监控** | 启动前预估 | ✅ **实时动态监控**，运行时反馈更准确 |
| **分享与协作**| 生成静态 URL | ✅ **继承并优化** 一键分享链接，轻松复现实验设计 |
| **AI 辅助编辑** | 无 | ✅ **集成 AI 助手**，支持自然语言指令修改 JSON 配置 |
| **国际化** | 无 | ✅ **i18n 支持** (中英文切换) |
| **部署** | 手动上传文件 | ✅ **CI/CD 自动化部署** (GitHub Actions) |


## 项目结构

```
src/
├── assets/             # 静态资源
├── components/         # React 组件 (Canvas, Toolbox, PropertiesPanel, StimulusBox 等)
├── hooks/              # 自定义 React Hooks (useStimulation, useDemoSetup 等)
├── stores/             # Zustand 状态管理 Store (canvasStore 等)
├── utils/              # 工具函数
├── App.tsx             # 主应用组件
└── main.tsx            # 应用入口
```

## 快速开始

1.  **克隆仓库：**

    ```bash
    git clone https://github.com/your-username/ssvep-next.git
    cd ssvep-next
    ```

2.  **安装依赖：**

    ```bash
    npm install
    ```

3.  **运行开发服务器：**

    ```bash
    npm run dev
    ```

    应用将在 `http://localhost:5173` (或类似地址) 启动。

4.  **构建生产版本：**
    ```bash
    npm run build
    ```
    构建产物将生成在 `dist/` 目录下。

## 部署

### 自动部署到 GitHub Pages

本项目已配置 GitHub Actions 自动部署。当代码推送到 `main` 分支时，将自动构建并部署到 GitHub Pages。

**首次设置 GitHub Pages：**

1. 在 GitHub 仓库中，进入 Settings > Pages
2. 在 "Source" 部分选择 "GitHub Actions"
3. 推送代码到 `main` 分支即可触发自动部署

**访问地址：** `https://framist.github.io/ssvep-next/`

### 手动部署

如果需要手动部署，可以使用以下命令：

```bash
npm run deploy
```

这将构建项目并将构建产物推送到 `gh-pages` 分支。

### 本地预览

要预览生产构建版本：

```bash
npm run preview
```

## 开发指南

### 添加新组件

1. 在 `src/components/` 中创建新组件
2. 在相应的 store 中添加状态管理逻辑
3. 更新类型定义
4. 添加必要的测试

## 贡献

欢迎提交 Issue 和 Pull Request！

## 许可证

本项目采用 MIT 许可证。

---

*AI 赋能，参见 [prompt.md](prompt.md)*
