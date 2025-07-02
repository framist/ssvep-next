import { create } from 'zustand';

export interface StimulusItem {
  id: string;
  text: string;
  frequency: number;
  position: { x: number; y: number };
  size: { width: number; height: number };
  color: string;
  isRunning?: boolean;
}

export type WaveformType = 'square' | 'sine';

export interface ViewConfig {
  scale: number; // 缩放比例
  panX: number; // X 轴偏移
  panY: number; // Y 轴偏移
}

export interface GlobalConfig {
  duration: number; // -1 表示无限时长
  backgroundColor: string;
  isRunning: boolean;
  snapToGrid: boolean; // 是否启用网格吸附
  gridSize: number; // 网格大小
  waveformType: WaveformType; // 波形类型
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
  },
  addItem: (item: Omit<StimulusItem, 'id'>, position: { x: number; y: number }) => {
    const id = `stimulus-${Date.now()}`;
    set((state) => ({
      items: { 
        ...state.items, 
        [id]: { 
          ...item, 
          id,
          position, // 使用传入的 position 覆盖 item 中的 position
          frequency: item.frequency || 10,
          size: item.size || { width: 100, height: 100 },
          color: item.color || '#ffffff',
        } 
      },
    }));
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
  clearAll: () => set({
    items: {},
    selectedItemId: null,
    stimulationState: {},
    viewConfig: {
      scale: 1,
      panX: 0,
      panY: 0,
    },
    globalConfig: {
      duration: -1,
      backgroundColor: '#000000',
      isRunning: false,
      snapToGrid: true,
      gridSize: 20,
      waveformType: 'square',
    },
  }),
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
