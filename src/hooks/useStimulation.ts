import { useEffect, useRef } from 'react';
import { useStore } from '../stores/canvasStore';

export interface StimulationStats {
  actualFrequencies: Record<string, number>;
  frameRate: number;
  isRunning: boolean;
}

export function useStimulation() {
  const { globalConfig, items, stopStimulation } = useStore();
  const startTimeRef = useRef<number | null>(null);
  const frameCountRef = useRef<number>(0);
  const lastFrameTimeRef = useRef<number | null>(null);
  const statsRef = useRef<StimulationStats>({
    actualFrequencies: {},
    frameRate: 0,
    isRunning: false,
  });

  useEffect(() => {
    if (!globalConfig.isRunning) {
      startTimeRef.current = null;
      frameCountRef.current = 0;
      lastFrameTimeRef.current = null;
      statsRef.current.isRunning = false;
      return;
    }

    statsRef.current.isRunning = true;
    const startTime = Date.now();
    startTimeRef.current = startTime;
    
    // 自动停止计时器
    const stopTimer = setTimeout(() => {
      stopStimulation();
    }, globalConfig.duration * 1000);

    // 性能监控
    const monitorPerformance = () => {
      const currentTime = Date.now();
      if (lastFrameTimeRef.current) {
        const deltaTime = currentTime - lastFrameTimeRef.current;
        statsRef.current.frameRate = 1000 / deltaTime;
      }
      lastFrameTimeRef.current = currentTime;
      frameCountRef.current++;

      if (globalConfig.isRunning) {
        requestAnimationFrame(monitorPerformance);
      }
    };

    requestAnimationFrame(monitorPerformance);

    return () => {
      clearTimeout(stopTimer);
    };
  }, [globalConfig.isRunning, globalConfig.duration, stopStimulation]);

  const getStats = (): StimulationStats => {
    return {
      ...statsRef.current,
      actualFrequencies: Object.fromEntries(
        Object.entries(items).map(([id, item]) => [
          id,
          item.frequency,
        ])
      ),
    };
  };

  return {
    stats: getStats(),
    isRunning: globalConfig.isRunning,
  };
}
