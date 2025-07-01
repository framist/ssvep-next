import { useEffect, useRef } from 'react';
import { useStore } from '../stores/canvasStore';

export interface StimulationStats {
  actualFrequencies: Record<string, number>;
  frameRate: number;
  isRunning: boolean;
}

// 用于追踪每个刺激项状态变化的接口
interface StimulationStateTracker {
  isVisible: boolean;
  lastOnTime: number;
  lastOffTime: number;
  instantaneousFreq: number;
  avgFreq: number;
  history: number[]; // 用于计算平均频率的历史记录
}

export function useStimulation() {
  const { globalConfig, items, stopStimulation, updateStimulationState } = useStore();
  const startTimeRef = useRef<number | null>(null);
  const frameCountRef = useRef<number>(0);
  const lastFpsUpdateTimeRef = useRef<number>(0);
  const statsRef = useRef<StimulationStats>({
    actualFrequencies: {},
    frameRate: 0,
    isRunning: false,
  });

  // 用于直接频率测量的状态追踪器
  const stateTrackersRef = useRef<Record<string, StimulationStateTracker>>({});

  useEffect(() => {
    if (!globalConfig.isRunning) {
      startTimeRef.current = null;
      frameCountRef.current = 0;
      lastFpsUpdateTimeRef.current = 0;
      statsRef.current.isRunning = false;
      statsRef.current.frameRate = 0;
      statsRef.current.actualFrequencies = {};
      // 清空状态追踪器
      stateTrackersRef.current = {};
      return;
    }

    statsRef.current.isRunning = true;
    const startTime = performance.now();
    startTimeRef.current = startTime;
    lastFpsUpdateTimeRef.current = startTime;
    frameCountRef.current = 0;

    // 自动停止计时器（只有在设置了有限时长时才启用）
    let stopTimer: number | undefined;
    if (globalConfig.duration > 0) {
      stopTimer = window.setTimeout(() => {
        stopStimulation();
      }, globalConfig.duration * 1000);
    }

    let animationFrameId: number;

    // 性能监控和刺激渲染
    const monitorPerformance = (currentTime: DOMHighResTimeStamp) => {
      frameCountRef.current++;
      const timeSinceLastUpdate = currentTime - lastFpsUpdateTimeRef.current;
      const elapsedTime = currentTime - startTimeRef.current!;

      // 计算每个刺激方块的当前状态（基于全局统一时间）
      const stimulationStates: Record<string, { isVisible: boolean; actualFrequency: number }> = {};
      
      for (const id in items) {
        const item = items[id];
        if (item.frequency > 0) {
          // 初始化该刺激项的状态追踪器
          if (!stateTrackersRef.current[id]) {
            stateTrackersRef.current[id] = {
              isVisible: false,
              lastOnTime: 0,
              lastOffTime: 0,
              instantaneousFreq: 0,
              avgFreq: 0,
              history: []
            };
          }
          const stateTracker = stateTrackersRef.current[id];

          // 使用与原项目相同的逻辑：基于全局时间的半周期取模
          const halfPeriod = (1000 / item.frequency) / 2; // 半周期（毫秒）
          const currentPhase = Math.floor(elapsedTime / halfPeriod) % 2;
          const isVisible = currentPhase === 0;
          
          // 检测状态变化并计算实际频率（直接测量法）
          let actualFrequency = stateTracker.avgFreq; // 默认使用上次的平均频率
          
          if (isVisible && !stateTracker.isVisible) {
            // 状态从 OFF -> ON，记录完整周期
            if (stateTracker.lastOnTime > 0) {
              const period = currentTime - stateTracker.lastOnTime; // 完整周期时间
              const instantaneousFreq = 1000 / period; // 瞬时频率
              
              stateTracker.instantaneousFreq = instantaneousFreq;
              
              // 使用滑动窗口平均（最近 10 次）来平滑频率
              stateTracker.history.push(instantaneousFreq);
              if (stateTracker.history.length > 10) {
                stateTracker.history.shift();
              }
              
              // 计算平均频率
              stateTracker.avgFreq = stateTracker.history.reduce((a, b) => a + b, 0) / stateTracker.history.length;
              actualFrequency = stateTracker.avgFreq;
            }
            stateTracker.lastOnTime = currentTime;
          } else if (!isVisible && stateTracker.isVisible) {
            // 状态从 ON -> OFF
            stateTracker.lastOffTime = currentTime;
          }
          
          // 更新状态追踪器的当前状态
          stateTracker.isVisible = isVisible;
          
          stimulationStates[id] = { isVisible, actualFrequency };
        } else {
          stimulationStates[id] = { isVisible: true, actualFrequency: 0 };
        }
      }
      
      // 更新刺激状态到 store
      updateStimulationState(stimulationStates);

      // 每秒更新一次帧率统计
      if (timeSinceLastUpdate >= 1000) {
        const measuredFrameRate = (frameCountRef.current * 1000) / timeSinceLastUpdate;
        statsRef.current.frameRate = measuredFrameRate;

        // 将直接测量的频率同步到统计数据中
        const newActualFrequencies: Record<string, number> = {};
        for (const id in items) {
          const item = items[id];
          if (item.frequency > 0 && stateTrackersRef.current[id]) {
            // 使用直接测量的平均频率，如果没有则回退到理论计算
            if (stateTrackersRef.current[id].avgFreq > 0) {
              newActualFrequencies[id] = stateTrackersRef.current[id].avgFreq;
            } else {
              // 回退到基于帧率的理论计算（用于刚开始运行时）
              const frameCycle = Math.round(measuredFrameRate / item.frequency);
              if (frameCycle > 0) {
                newActualFrequencies[id] = measuredFrameRate / frameCycle;
              } else {
                newActualFrequencies[id] = 0;
              }
            }
          } else {
            newActualFrequencies[id] = 0;
          }
        }
        statsRef.current.actualFrequencies = newActualFrequencies;

        // 为下一次计算重置计数器和时间
        lastFpsUpdateTimeRef.current = currentTime;
        frameCountRef.current = 0;
      }

      if (globalConfig.isRunning) {
        animationFrameId = requestAnimationFrame(monitorPerformance);
      }
    };

    animationFrameId = requestAnimationFrame(monitorPerformance);

    return () => {
      cancelAnimationFrame(animationFrameId);
      if (stopTimer) {
        clearTimeout(stopTimer);
      }
    };
  }, [globalConfig.isRunning, globalConfig.duration, stopStimulation, updateStimulationState, items]);

  const getStats = (): StimulationStats => {
    return statsRef.current;
  };

  return {
    stats: getStats(),
    isRunning: globalConfig.isRunning,
  };
}
