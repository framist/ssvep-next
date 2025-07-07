import { useStore } from '../stores/canvasStore';

export function useDemoSetup() {
  const { loadProject } = useStore();

  const loadBasicDemoProject = () => {
    const demoItems = {
      'demo-1': {
        id: 'demo-1',
        type: 'stimulus' as const,
        text: '刺激 A',
        frequency: 8.0,
        position: { x: 200, y: 150 },
        size: { width: 120, height: 120 },
        color: '#ff4444',
      },
      'demo-2': {
        id: 'demo-2',
        type: 'stimulus' as const,
        text: '刺激 B',
        frequency: 10.0,
        position: { x: 400, y: 150 },
        size: { width: 120, height: 120 },
        color: '#44ff44',
      },
      'demo-3': {
        id: 'demo-3',
        type: 'stimulus' as const,
        text: '刺激 C',
        frequency: 12.0,
        position: { x: 600, y: 150 },
        size: { width: 120, height: 120 },
        color: '#4444ff',
      },
      'demo-4': {
        id: 'demo-4',
        type: 'stimulus' as const,
        text: '刺激 D',
        frequency: 15.0,
        position: { x: 300, y: 350 },
        size: { width: 120, height: 120 },
        color: '#ffff44',
      },
    };

    const demoConfig = {
      duration: 60,
      backgroundColor: '#222222',
      isRunning: false,
      snapToGrid: true,
      gridSize: 20,
      waveformType: 'square' as const,
      canvasSize: { width: 800, height: 600 },
      showTimeDisplay: true,
      defaultStimulus: {
        text: 'Stimulus',
        frequency: 10,
        size: { width: 120, height: 120 },
        color: '#ffffff',
      },
    };

    loadProject(demoItems, demoConfig);
  };

  const loadKeyboardDemoProject = () => {
    // 模拟键盘 QWERTY 布局的前两行
    const keyboardItems = {
      // 第一行：Q W E R T Y U I O P
      'key-q': {
        id: 'key-q',
        type: 'stimulus' as const,
        text: 'Q',
        frequency: 8.0,
        position: { x: 50, y: 100 },
        size: { width: 60, height: 60 },
        color: '#ffffff',
      },
      'key-w': {
        id: 'key-w',
        type: 'stimulus' as const,
        text: 'W',
        frequency: 8.5,
        position: { x: 120, y: 100 },
        size: { width: 60, height: 60 },
        color: '#ffffff',
      },
      'key-e': {
        id: 'key-e',
        type: 'stimulus' as const,
        text: 'E',
        frequency: 9.0,
        position: { x: 190, y: 100 },
        size: { width: 60, height: 60 },
        color: '#ffffff',
      },
      'key-r': {
        id: 'key-r',
        type: 'stimulus' as const,
        text: 'R',
        frequency: 9.5,
        position: { x: 260, y: 100 },
        size: { width: 60, height: 60 },
        color: '#ffffff',
      },
      'key-t': {
        id: 'key-t',
        type: 'stimulus' as const,
        text: 'T',
        frequency: 10.0,
        position: { x: 330, y: 100 },
        size: { width: 60, height: 60 },
        color: '#ffffff',
      },
      'key-y': {
        id: 'key-y',
        type: 'stimulus' as const,
        text: 'Y',
        frequency: 10.5,
        position: { x: 400, y: 100 },
        size: { width: 60, height: 60 },
        color: '#ffffff',
      },
      'key-u': {
        id: 'key-u',
        type: 'stimulus' as const,
        text: 'U',
        frequency: 11.0,
        position: { x: 470, y: 100 },
        size: { width: 60, height: 60 },
        color: '#ffffff',
      },
      'key-i': {
        id: 'key-i',
        type: 'stimulus' as const,
        text: 'I',
        frequency: 11.5,
        position: { x: 540, y: 100 },
        size: { width: 60, height: 60 },
        color: '#ffffff',
      },
      'key-o': {
        id: 'key-o',
        type: 'stimulus' as const,
        text: 'O',
        frequency: 12.0,
        position: { x: 610, y: 100 },
        size: { width: 60, height: 60 },
        color: '#ffffff',
      },
      'key-p': {
        id: 'key-p',
        type: 'stimulus' as const,
        text: 'P',
        frequency: 12.5,
        position: { x: 680, y: 100 },
        size: { width: 60, height: 60 },
        color: '#ffffff',
      },
      // 第二行：A S D F G H J K L
      'key-a': {
        id: 'key-a',
        type: 'stimulus' as const,
        text: 'A',
        frequency: 13.0,
        position: { x: 85, y: 170 },
        size: { width: 60, height: 60 },
        color: '#ffffff',
      },
      'key-s': {
        id: 'key-s',
        type: 'stimulus' as const,
        text: 'S',
        frequency: 13.5,
        position: { x: 155, y: 170 },
        size: { width: 60, height: 60 },
        color: '#ffffff',
      },
      'key-d': {
        id: 'key-d',
        type: 'stimulus' as const,
        text: 'D',
        frequency: 14.0,
        position: { x: 225, y: 170 },
        size: { width: 60, height: 60 },
        color: '#ffffff',
      },
      'key-f': {
        id: 'key-f',
        type: 'stimulus' as const,
        text: 'F',
        frequency: 14.5,
        position: { x: 295, y: 170 },
        size: { width: 60, height: 60 },
        color: '#ffffff',
      },
      'key-g': {
        id: 'key-g',
        type: 'stimulus' as const,
        text: 'G',
        frequency: 15.0,
        position: { x: 365, y: 170 },
        size: { width: 60, height: 60 },
        color: '#ffffff',
      },
      'key-h': {
        id: 'key-h',
        type: 'stimulus' as const,
        text: 'H',
        frequency: 15.5,
        position: { x: 435, y: 170 },
        size: { width: 60, height: 60 },
        color: '#ffffff',
      },
      'key-j': {
        id: 'key-j',
        type: 'stimulus' as const,
        text: 'J',
        frequency: 16.0,
        position: { x: 505, y: 170 },
        size: { width: 60, height: 60 },
        color: '#ffffff',
      },
      'key-k': {
        id: 'key-k',
        type: 'stimulus' as const,
        text: 'K',
        frequency: 16.5,
        position: { x: 575, y: 170 },
        size: { width: 60, height: 60 },
        color: '#ffffff',
      },
      'key-l': {
        id: 'key-l',
        type: 'stimulus' as const,
        text: 'L',
        frequency: 17.0,
        position: { x: 645, y: 170 },
        size: { width: 60, height: 60 },
        color: '#ffffff',
      },
      // 第三行：Z X C V B N M
      'key-z': {
        id: 'key-z',
        type: 'stimulus' as const,
        text: 'Z',
        frequency: 17.5,
        position: { x: 155, y: 240 },
        size: { width: 60, height: 60 },
        color: '#ffffff',
      },
      'key-x': {
        id: 'key-x',
        type: 'stimulus' as const,
        text: 'X',
        frequency: 18.0,
        position: { x: 225, y: 240 },
        size: { width: 60, height: 60 },
        color: '#ffffff',
      },
      'key-c': {
        id: 'key-c',
        type: 'stimulus' as const,
        text: 'C',
        frequency: 18.5,
        position: { x: 295, y: 240 },
        size: { width: 60, height: 60 },
        color: '#ffffff',
      },
      'key-v': {
        id: 'key-v',
        type: 'stimulus' as const,
        text: 'V',
        frequency: 19.0,
        position: { x: 365, y: 240 },
        size: { width: 60, height: 60 },
        color: '#ffffff',
      },
      'key-b': {
        id: 'key-b',
        type: 'stimulus' as const,
        text: 'B',
        frequency: 19.5,
        position: { x: 435, y: 240 },
        size: { width: 60, height: 60 },
        color: '#ffffff',
      },
      'key-n': {
        id: 'key-n',
        type: 'stimulus' as const,
        text: 'N',
        frequency: 20.0,
        position: { x: 505, y: 240 },
        size: { width: 60, height: 60 },
        color: '#ffffff',
      },
      'key-m': {
        id: 'key-m',
        type: 'stimulus' as const,
        text: 'M',
        frequency: 20.5,
        position: { x: 575, y: 240 },
        size: { width: 60, height: 60 },
        color: '#ffffff',
      },
      // 空格键
      'key-space': {
        id: 'key-space',
        type: 'stimulus' as const,
        text: 'SPACE',
        frequency: 21.0,
        position: { x: 300, y: 310 },
        size: { width: 180, height: 60 },
        color: '#ffffff',
      },
      // 输入显示区域
      'input-display': {
        id: 'input-display',
        type: 'text' as const,
        text: 'Hello, SSVEP!',
        position: { x: 50, y: 30 },
        size: { width: 680, height: 40 },
        color: '#cccccc',
        fontSize: 24,
        fontWeight: 'normal',
      },
    };

    const keyboardConfig = {
      duration: 120,
      backgroundColor: '#1a1a1a',
      isRunning: false,
      snapToGrid: true,
      gridSize: 20,
      waveformType: 'square' as const,
      canvasSize: { width: 800, height: 400 },
      showTimeDisplay: true,
      defaultStimulus: {
        text: 'Key',
        frequency: 10,
        size: { width: 60, height: 60 },
        color: '#ffffff',
      },
    };

    loadProject(keyboardItems, keyboardConfig);
  };

  const loadGamepadDemoProject = () => {
    const gamepadItems = {
      "item-1751870734316-seouchb": {
        id: "item-1751870734316-seouchb",
        type: "stimulus" as const,
        text: "←",
        frequency: 10,
        size: {
          width: 200,
          height: 200
        },
        color: "#ffffff",
        position: {
          x: 200,
          y: 450
        }
      },
      "item-1751870750368-ehkq39l": {
        id: "item-1751870750368-ehkq39l",
        type: "stimulus" as const,
        text: "→",
        frequency: 11,
        size: {
          width: 200,
          height: 200
        },
        color: "#ffffff",
        position: {
          x: 700,
          y: 450
        }
      },
      "item-1751870753700-cgndhw8": {
        id: "item-1751870753700-cgndhw8",
        type: "stimulus" as const,
        text: "↑",
        frequency: 13,
        size: {
          width: 200,
          height: 200
        },
        color: "#ffffff",
        position: {
          x: 450,
          y: 200
        }
      },
      "item-1751870821961-d4vwofi": {
        id: "item-1751870821961-d4vwofi",
        type: "stimulus" as const,
        text: "↓",
        frequency: 9,
        size: {
          width: 200,
          height: 200
        },
        color: "#ffffff",
        position: {
          x: 450,
          y: 700
        }
      },
      "item-1751870827709-jxfhqqo": {
        id: "item-1751870827709-jxfhqqo",
        type: "stimulus" as const,
        text: "x",
        frequency: 8,
        size: {
          width: 200,
          height: 200
        },
        color: "#ffffff",
        position: {
          x: 1300,
          y: 450
        }
      }
    };

    const gamepadConfig = {
      duration: -1,
      backgroundColor: "#000000",
      isRunning: false,
      snapToGrid: true,
      gridSize: 50,
      waveformType: "square" as const,
      canvasSize: {
        width: 1920,
        height: 1080
      },
      showTimeDisplay: false,
      defaultStimulus: {
        text: "Stimulus",
        frequency: 10,
        size: {
          width: 200,
          height: 200
        },
        color: "#ffffff"
      }
    };

    loadProject(gamepadItems, gamepadConfig);
  };

  return { 
    loadBasicDemoProject, 
    loadKeyboardDemoProject, 
    loadGamepadDemoProject,
    // 为了保持向后兼容，保留原有的 loadDemoProject 函数
    loadDemoProject: loadBasicDemoProject
  };
}
