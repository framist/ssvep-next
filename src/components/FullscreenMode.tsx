import { useEffect, useState } from 'react';
import { Box, Button, Typography, IconButton } from '@mui/material';
import { Close as CloseIcon } from '@mui/icons-material';
import { useTranslation } from 'react-i18next';
import { useStore } from '../stores/canvasStore';
import { StimulusBox } from './StimulusBox';
import { useStimulation } from '../hooks/useStimulation';
import { IframeBox } from './IframeBox';
import { TextBox } from './TextBox';

interface FullscreenModeProps {
  onExit: () => void;
}

export function FullscreenMode({ onExit }: FullscreenModeProps) {
  const { t } = useTranslation();
  const { items, globalConfig, stopStimulation } = useStore();
  const { stats } = useStimulation();
  const [elapsedTime, setElapsedTime] = useState(0);
  const [showDebugInfo, setShowDebugInfo] = useState(false);

  // 当刺激开始时重置计时器
  useEffect(() => {
    if (globalConfig.isRunning) {
      setElapsedTime(0); // 重置计时器
    }
  }, [globalConfig.isRunning]);

  // 处理计时逻辑
  useEffect(() => {
    if (!globalConfig.isRunning) return;

    const interval = setInterval(() => {
      setElapsedTime((prev) => prev + 1);
    }, 1000);

    return () => {
      clearInterval(interval);
    };
  }, [globalConfig.isRunning]);

  // 处理自动停止逻辑
  useEffect(() => {
    if (!globalConfig.isRunning || globalConfig.duration <= 0) return;

    const timeout = window.setTimeout(() => {
      stopStimulation();
      onExit();
    }, globalConfig.duration * 1000);

    return () => {
      window.clearTimeout(timeout);
    };
  }, [globalConfig.isRunning, globalConfig.duration, stopStimulation, onExit]);

  const handleExit = () => {
    stopStimulation();
    onExit();
    // 退出全屏
    if (document.fullscreenElement) {
      document.exitFullscreen();
    }
  };

  const toggleDebugInfo = () => {
    setShowDebugInfo(!showDebugInfo);
  };

  // 进入全屏
  useEffect(() => {
    const enterFullscreen = async () => {
      try {
        await document.documentElement.requestFullscreen();
      } catch (error) {
        console.log('Fullscreen not available:', error);
      }
    };
    enterFullscreen();
  }, []);

  return (
    <Box
      sx={{
        position: 'fixed',
        top: 0,
        left: 0,
        width: '100vw',
        height: '100vh',
        backgroundColor: globalConfig.backgroundColor,
        zIndex: 9999,
        overflow: 'hidden',
      }}
    >
      {/* 控制面板 */}
      <Box
        sx={{
          position: 'absolute',
          top: 20,
          right: 20,
          display: 'flex',
          gap: 1,
          zIndex: 10000,
        }}
      >
        <Button
          variant="outlined"
          size="small"
          onClick={toggleDebugInfo}
        >
          {t('fullscreen.debugInfo')}
        </Button>
        <IconButton
          onClick={handleExit}
          sx={{
            backgroundColor: 'rgba(255, 255, 255, 0.5)',
            '&:hover': {
              backgroundColor: 'rgba(255, 255, 255, 0.9)',
            },
          }}
        >
          <CloseIcon />
        </IconButton>
      </Box>

      {/* 调试信息面板 */}
      {showDebugInfo && (
        <Box
          sx={{
            position: 'absolute',
            top: 20,
            left: 20,
            backgroundColor: 'rgba(0, 0, 0, 0.8)',
            color: 'white',
            p: 2,
            borderRadius: 1,
            minWidth: 200,
            zIndex: 10000,
            overflow: 'auto',
            maxHeight: 'calc(100vh - 40px)',
          }}
        >
          <Typography variant="h6" gutterBottom>
            {t('fullscreen.debugInfo')}
          </Typography>
          <Typography variant="body2">
            {t('fullscreen.elapsedTime')}：{elapsedTime}s
          </Typography>
          {globalConfig.duration > 0 && (
            <Typography variant="body2">
              {t('fullscreen.remainingTime')}：{Math.max(0, globalConfig.duration - elapsedTime)}s
            </Typography>
          )}
          <Typography variant="body2">
            {t('fullscreen.frameRate')}：{stats.frameRate.toFixed(2)} FPS
          </Typography>
          <Typography variant="body2">
            {t('fullscreen.stimulusCount')}：{Object.keys(items).length}
          </Typography>
          {Object.entries(stats.actualFrequencies).filter(([id]) => items[id]?.type === 'stimulus').map(([id, freq]) => (
            <Typography key={id} variant="body2">
              {items[id]?.text || id}：{items[id]?.frequency} Hz ({freq.toFixed(2)} Hz)
            </Typography>
          ))}
        </Box>
      )}

      {/* 时间显示 */}
      {globalConfig.showTimeDisplay && (
        <Box
          sx={{
            position: 'absolute',
            top: 20,
            left: '50%',
            transform: 'translateX(-50%)',
            color: 'white',
            zIndex: 10000,
          }}
        >
          <Typography variant="h4">
            {globalConfig.duration === -1
              ? `${Math.floor(elapsedTime / 60)}:${(elapsedTime % 60).toString().padStart(2, '0')}`
              : `${Math.max(0, globalConfig.duration - elapsedTime)}s`
            }
          </Typography>
        </Box>
      )}

      {/* 刺激方块 */}
      {Object.values(items).map((item) => {
        const commonProps = {
          item: item,
          style: {
            position: 'absolute' as const,
            left: item.position.x,
            top: item.position.y,
            width: item.size.width,
            height: item.size.height,
            pointerEvents: 'none' as const, // 禁止交互
          }
        };

        switch (item.type) {
          case 'text':
            return <TextBox key={item.id} {...commonProps} />;
          case 'iframe':
            return <IframeBox key={item.id} {...commonProps} />;
          case 'stimulus':
            return <StimulusBox key={item.id} {...commonProps} />;
          default:
            return null;
        }
      })}
    </Box>
  );
}
