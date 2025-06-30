import { useStore } from '../stores/canvasStore';

export function useDemoSetup() {
  const { loadProject } = useStore();

  const loadDemoProject = () => {
    const demoItems = {
      'demo-1': {
        id: 'demo-1',
        text: '刺激 A',
        frequency: 8.0,
        position: { x: 200, y: 150 },
        size: { width: 120, height: 120 },
        color: '#ff4444',
      },
      'demo-2': {
        id: 'demo-2',
        text: '刺激 B',
        frequency: 10.0,
        position: { x: 400, y: 150 },
        size: { width: 120, height: 120 },
        color: '#44ff44',
      },
      'demo-3': {
        id: 'demo-3',
        text: '刺激 C',
        frequency: 12.0,
        position: { x: 600, y: 150 },
        size: { width: 120, height: 120 },
        color: '#4444ff',
      },
      'demo-4': {
        id: 'demo-4',
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
    };

    loadProject(demoItems, demoConfig);
  };

  return { loadDemoProject };
}
