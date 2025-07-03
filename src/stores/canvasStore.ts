import { create } from 'zustand';

export type ItemType = 'stimulus' | 'text' | 'iframe';

export interface StimulusItem {
  id: string;
  type: ItemType;
  text: string;
  frequency?: number;
  position: { x: number; y: number };
  size: { width: number; height: number };
  color: string;
  isRunning?: boolean;
  // text 控件特有属性
  fontSize?: number;
  fontWeight?: string;
  // iframe 控件特有属性
  url?: string;
}

export type WaveformType = 'square' | 'sine';

export interface ViewConfig {
  scale: number; // 缩放比例
  panX: number; // X 轴偏移
  panY: number; // Y 轴偏移
}

export interface CanvasSize {
  width: number;
  height: number;
}

export interface DefaultStimulusProperties {
  text: string;
  frequency: number;
  size: { width: number; height: number };
  color: string;
}

export interface GlobalConfig {
  duration: number; // -1 表示无限时长
  backgroundColor: string;
  isRunning: boolean;
  snapToGrid: boolean; // 是否启用网格吸附
  gridSize: number; // 网格大小
  waveformType: WaveformType; // 波形类型
  canvasSize: CanvasSize; // 画布大小
  defaultStimulus: DefaultStimulusProperties; // 新刺激方块的默认属性
}

export interface StimulusState {
  isVisible: boolean;
  actualFrequency: number;
  brightness: number; // 0-1 之间，用于正弦波的连续亮度控制
}

interface CanvasStore {
  items: Record<string, StimulusItem>;
  selectedItemId: string | null;
  globalConfig: GlobalConfig;
  viewConfig: ViewConfig; // 视图配置
  stimulationState: Record<string, StimulusState>; // 存储每个刺激方块的实时状态
  addItem: (item: Omit<StimulusItem, 'id'>, position: { x: number; y: number }) => void;
  updateItem: (id: string, updates: Partial<StimulusItem>) => void;
  moveItem: (id: string, position: { x: number; y: number }) => void;
  removeItem: (id: string) => void;
  selectItem: (id: string | null) => void;
  updateGlobalConfig: (config: Partial<GlobalConfig>) => void;
  updateViewConfig: (config: Partial<ViewConfig>) => void; // 更新视图配置
  updateStimulationState: (states: Record<string, StimulusState>) => void; // 更新刺激状态
  loadProject: (items: Record<string, StimulusItem>, config: GlobalConfig) => void;
  clearAll: () => void;
  startStimulation: () => void;
  stopStimulation: () => void;
  resetView: () => void; // 重置视图
}

export const useStore = create<CanvasStore>((set) => ({
  items: {},
  selectedItemId: null,
  stimulationState: {}, // 初始化刺激状态
  viewConfig: {
    scale: 1,
    panX: 0,
    panY: 0,
  },
  globalConfig: {
    duration: -1, // 默认无限时长
    backgroundColor: '#000000',
    isRunning: false,
    snapToGrid: true, // 默认启用网格吸附
    gridSize: 20, // 默认网格大小 20px
    waveformType: 'square', // 默认方波
    canvasSize: { width: 1920, height: 1080 }, // 默认画布大小
    defaultStimulus: {
      text: 'Stimulus',
      frequency: 10,
      size: { width: 120, height: 120 },
      color: '#ffffff',
    },
  },
  addItem: (item: Omit<StimulusItem, 'id'>, position: { x: number; y: number }) => {
    const id = `item-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`;
    set((state) => {
      const defaultProps = state.globalConfig.defaultStimulus;
      const itemType = item.type || 'stimulus';

      // 创建基本项目属性
      const baseItem = {
        ...item,
        id,
        position, // 使用传入的 position 覆盖 item 中的 position
        type: itemType,
        size: item.size || defaultProps.size,
        color: item.color || defaultProps.color,
      };

      // 根据类型添加特定属性
      let finalItem = { ...baseItem };

      switch (itemType) {
        case 'stimulus':
          finalItem = {
            ...finalItem,
            text: item.text || defaultProps.text || 'Stimulus',
            frequency: item.frequency || defaultProps.frequency,
          };
          break;
        case 'text':
          finalItem = {
            ...finalItem,
            text: item.text || 'Text',
            fontSize: item.fontSize || 16,
            fontWeight: item.fontWeight || 'normal',
          };
          break;
        case 'iframe':
          finalItem = {
            ...finalItem,
            text: item.text || 'iframe',
            url: item.url || 'https://example.com',
          };
          break;
      }

      return {
        items: {
          ...state.items,
          [id]: finalItem
        },
      };
    });
  },
  updateItem: (id, updates) => set((state) => ({
    items: {
      ...state.items,
      [id]: { ...state.items[id], ...updates }
    },
  })),
  moveItem: (id, position) => set((state) => ({
    items: {
      ...state.items,
      [id]: { ...state.items[id], position }
    },
  })),
  removeItem: (id) => set((state) => {
    const newItems = { ...state.items };
    delete newItems[id];
    const newStimulationState = { ...state.stimulationState };
    delete newStimulationState[id];
    return {
      items: newItems,
      stimulationState: newStimulationState,
      selectedItemId: state.selectedItemId === id ? null : state.selectedItemId,
    };
  }),
  selectItem: (id) => set({ selectedItemId: id }),
  updateGlobalConfig: (config) => set((state) => ({
    globalConfig: { ...state.globalConfig, ...config },
  })),
  updateViewConfig: (config) => set((state) => ({
    viewConfig: { ...state.viewConfig, ...config },
  })),
  updateStimulationState: (states) => set((state) => ({
    stimulationState: { ...state.stimulationState, ...states },
  })),
  loadProject: (items, config) => set({
    items,
    globalConfig: config,
    selectedItemId: null,
  }),
  clearAll: () => set((state) => ({
    items: {},
    selectedItemId: null,
    stimulationState: {},
    viewConfig: {
      scale: 1,
      panX: 0,
      panY: 0,
    },
    globalConfig: {
      ...state.globalConfig,
      isRunning: false,
    },
  })),
  startStimulation: () => set((state) => ({
    globalConfig: { ...state.globalConfig, isRunning: true },
  })),
  stopStimulation: () => set((state) => ({
    globalConfig: { ...state.globalConfig, isRunning: false },
    stimulationState: {}, // 停止时清空刺激状态
  })),
  resetView: () => set(() => ({
    viewConfig: {
      scale: 1,
      panX: 0,
      panY: 0,
    },
  })),
}));
