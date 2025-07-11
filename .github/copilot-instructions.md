# SSVEP-Next Copilot Instructions

## Architecture Overview

SSVEP-Next is a React/TypeScript SPA for creating visual stimulation experiments. The architecture centers around:

- **Zustand store** (`src/stores/canvasStore.ts`) - Single source of truth for canvas items, global config, and view state
- **High-precision stimulation engine** (`src/hooks/useStimulation.ts`) - Uses `requestAnimationFrame` for accurate frequency control
- **Drag-and-drop canvas** with `@dnd-kit/core` for visual design
- **Project persistence** via URL sharing, localStorage, and JSON import/export

## Key Components & Data Flow

### Core State Management
- `canvasStore.ts` manages three item types: `stimulus`, `text`, `iframe`
- Each item has `id`, `type`, `position`, `size`, `color` + type-specific properties
- Global config includes `waveformType` (square/sine), `duration`, `backgroundColor`, `canvasSize`, `defaultStimulus`
- View config handles canvas pan/zoom with `scale`, `panX`, `panY`

### Stimulation Engine (`useStimulation.ts`)
- **Critical**: Uses direct frequency measurement algorithm (compatible with quick-ssvep)
- Tracks state changes per item with `StimulationStateTracker` for instantaneous and sliding-window average frequencies
- Supports square wave (toggle visibility) and sine wave (brightness modulation via sampling)
- Never modify timing logic without understanding the precision requirements

### Component Architecture
```
App.tsx (main layout)
├── Toolbox.tsx (draggable item creation)
├── Canvas.tsx (viewport with pan/zoom)
│   └── StimulusBox.tsx / TextBox.tsx / IframeBox.tsx
├── PropertiesPanel.tsx (item editing)
└── FullscreenMode.tsx (stimulation execution)
```

## Development Patterns

### Adding New Canvas Item Types
1. Extend `ItemType` union in `canvasStore.ts`
2. Add type-specific properties to `StimulusItem` interface
3. Create component in `src/components/` following existing patterns
4. Add to `Toolbox.tsx` draggable items
5. Update drag handling in `App.tsx` `handleDragEnd`
6. Add property controls in `PropertiesPanel.tsx`

### State Updates
```typescript
// Always use store actions, never mutate state directly
const { updateItemProperty, addItem, removeItem } = useStore();

// Use typed property updates
updateItemProperty(itemId, 'frequency', newFrequency);
updateItemProperty(itemId, 'size', { width: 100, height: 100 });
```

### I18n Usage
- Translation keys follow dot notation: `properties.element.frequency`
- Use `useTranslation()` hook: `const { t } = useTranslation();`
- All user-facing strings must be translatable
- Locale files: `src/i18n/locales/{en-US,zh-CN}.json`

### Project Management Pattern
- `ProjectManager` class handles all serialization/validation
- Always use `ProjectManager.validateProjectData()` for imports
- URL sharing encodes entire project state in base64
- Maintain backwards compatibility with existing shared URLs

## Critical Workflows

### Development
```bash
npm run dev          # Start dev server on localhost:5173
npm run lint         # ESLint check (required before commits)
npm run build        # TypeScript compilation + Vite build
npm run preview      # Preview production build
```

### Stimulation Precision
- Frequency accuracy depends on `requestAnimationFrame` timing
- Test with `globalConfig.isRunning = true` to verify timing
- Monitor `StimulationStats.actualFrequencies` for validation
- Frame rate monitoring helps debug performance issues

### AI Assistant Integration
- `JsonEditorModal.tsx` provides natural language project editing
- Uses configurable API endpoint (stored in localStorage)
- Validates JSON before applying changes via `ProjectManager`

## Common Gotchas

1. **Canvas Coordinates**: Always transform between screen and canvas coordinate systems using `viewConfig.scale/panX/panY`
2. **Grid Snapping**: Apply `snapToGrid()` helper when `globalConfig.snapToGrid` is enabled
3. **Frequency Ranges**: Stimulation frequencies should typically be 1-60 Hz for SSVEP effectiveness
4. **TypeScript Strict Mode**: All properties must be properly typed; use discriminated unions for item types
5. **Memory Leaks**: Always cleanup `useEffect` intervals/animations when components unmount

## Integration Points

### External Dependencies
- `@dnd-kit/core` for drag-and-drop (don't mix with HTML5 drag API)
- `@mui/material` for UI components (use theme tokens)
- `zustand` for state (prefer actions over direct mutations)
- `i18next` for translations (initialize in `src/i18n/index.ts`)

### Build & Deploy
- Vite config sets `base: '/ssvep-next/'` for GitHub Pages
- Manual chunks split vendor/ui/dnd for optimal loading
- `APP_VERSION` injected from `package.json` for project versioning
- GitHub Actions handle automatic deployment on main branch pushes

Focus on maintaining the high-precision stimulation engine and intuitive drag-and-drop UX that makes SSVEP experiment design accessible to researchers.
