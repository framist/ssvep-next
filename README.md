# SSVEP-Next: 现代 SSVEP 刺激界面构建工具

SSVEP-Next 是一个基于 React、TypeScript 和 Vite 构建的单页面应用 (SPA)，旨在提供一个直观、高效的图形化界面，用于设计和运行稳态视觉诱发电位 (SSVEP) 实验中的视觉刺激。用户可以通过拖拽、配置属性的方式，在画布上轻松创建和管理 SSVEP 刺激界面。

## 核心功能

-   **可视化设计器：** 通过拖拽方式在画布上布局刺激方块。
-   **属性配置：** 实时调整刺激方块的频率、文本、颜色、位置和大小等属性。
-   **刺激渲染：** 精确渲染配置好的 SSVEP 刺激，支持全屏运行模式。
-   **模块化组件：** 清晰的项目结构，便于功能扩展和维护。

## 技术栈

-   **前端框架：** React 18
-   **开发工具：** Vite
-   **语言：** TypeScript
-   **拖拽库：** dnd-kit
-   **状态管理：** Zustand
-   **UI 组件：** (待定，可根据项目需求引入如 MUI 或 Ant Design)

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

## 许可证

本项目采用 MIT 许可证。