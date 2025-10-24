# Repository Guidelines

## 项目结构与模块组织
- `src/` 主要包含 React + TypeScript 组件、hooks、Zustand stores；核心文件有 `Canvas.tsx`、`Toolbox.tsx`、`PropertiesPanel.tsx` 和 `hooks/useStimulation.ts`。
- `public/` 存放静态资源与国际化入口配置；`index.html` 用于 Vite 注入。
- `dist/` 为 `npm run build` 生成的产物，调试时无需手动修改。
- 根目录下的 `vite.config.ts`、`tsconfig.*`、`eslint.config.js` 描述构建、类型检查与 Lint 规则。

## 构建、测试与开发命令
- `npm run dev` 启动 Vite 开发服务器并热更新实验画布。
- `npm run lint` 按 ESLint 规则检查 TypeScript/TSX；提交前必须通过。
- `npm run build` 执行 `tsc -b` 与 Vite 生产构建，验证类型与打包配置。
- `npm run preview` 在本地以生产模式验证刺激渲染表现。

## 编码风格与命名约定
- 使用 TypeScript 严格模式，组件命名采用 PascalCase，hooks 以 `use` 前缀的 camelCase。
- Zustand action 与工具函数保持动词开头的 camelCase，避免直接改写 store。
- UI 文案统一从 `src/i18n` 加载，翻译键使用点号层级，如 `properties.element.frequency`。
- 代码默认两空格缩进，提交前运行 ESLint 自动修复轻微格式问题。

## 测试指南
- 目前未引入单元测试框架；每次功能变更需运行 `npm run lint` 与 `npm run build`。
- 对刺激精度相关改动，应在 `FullscreenMode` 中实测频率统计，并观察 `StimulationStats` 输出。
- 若新增模块，优先补充 store 或 hook 层的可测逻辑，为后续引入 Vitest 做好拆分。

## 提交与 Pull Request 指南
- 推荐遵循类似 Conventional Commits 的前缀（如 `feat:`, `fix:`, `doc:`），简述影响范围与目的。
- PR 描述需明确变更点、影响界面、验证步骤；涉及 UI 变化时附截图或录屏。
- 引用相关 issue 或待办任务，确保审核者可追踪上下文与验收标准。

## 代理协作提示
- 与用户互动时保持中文回复，并在响应中解释关键决策。
- 改动完成后主动给出建议的自测命令与潜在风险提醒。

## 待完成任务清单
- [ ] 左右工具箱与属性面板支持拖拽调整宽度与折叠
- [ ] 分享优化：引入 pako Gzip 压缩 URL，新增 `ShareModal` 展示复制按钮与二维码 `qrcode.react` ，同步更新分享按钮逻辑。修改现有“分享”按钮的逻辑，使其不再直接生成链接，而是打开 `ShareModal` 对话框。
