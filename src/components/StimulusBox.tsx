import React from 'react';
import { Box, Typography } from '@mui/material';
import { useDraggable } from '@dnd-kit/core';
import DragIndicatorIcon from '@mui/icons-material/DragIndicator';
import { useStore, type StimulusItem } from '../stores/canvasStore';

interface StimulusBoxProps {
  item: StimulusItem;
  onClick?: () => void;
  style?: React.CSSProperties;
}

export function StimulusBox({ item, onClick, style }: StimulusBoxProps) {
  const { attributes, listeners, setNodeRef, transform, isDragging } = useDraggable({
    id: item.id,
  });
  
  const { selectedItemId, globalConfig, stimulationState } = useStore();
  
  const isSelected = selectedItemId === item.id;
  
  // 从 store 获取当前刺激状态，如果不存在则默认为可见
  const currentStimulationState = stimulationState[item.id];
  const brightness = currentStimulationState?.brightness ?? 1;

  const getOpacity = () => {
    if (!globalConfig.isRunning) {
      return 1; // 非运行状态下完全不透明
    }
    return brightness;
  };

  const getTextColor = () => {
    // todo
    if (!globalConfig.isRunning) {
      return '#000000';
    }
    return '#00000088';

    // if (globalConfig.waveformType === 'sine') {
    //   // 正弦波模式：根据透明度和背景选择合适的文本颜色
    //   // 当透明度较高时使用深色文本，透明度较低时使用浅色文本
    //   return brightness > 0.5 ? '#000000' : '#ffffff';
    // } else {
    //   // 方波模式：使用原始逻辑
    //   return isVisible ? '#000000' : '#ffffff';
    // }
  };

  const combinedStyle: React.CSSProperties = {
    ...style,
  };

  const handleClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    // 拖动由拖动手柄处理，因此对框本身的任何单击都是用于选择的。
    if (onClick) {
      onClick();
    }
  };

  return (
    <Box
      ref={setNodeRef}
      style={combinedStyle}
      // {...listeners} and {...attributes} are removed from here
      onClick={handleClick}
      sx={{
        position: 'relative', // Needed to position the drag handle
        width: item.size.width,
        height: item.size.height,
        border: globalConfig.isRunning 
          ? ('2px solid transparent')
          : (isSelected ? '2px solid #1976d2' : '2px solid rgba(0, 0, 0, 0.1)'),
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        cursor: 'pointer', // Changed from 'grab' to 'pointer'
        backgroundColor: item.color,
        color: getTextColor(),
        opacity: globalConfig.isRunning 
          ? getOpacity()
          : (isDragging ? 0.5 : 1),
        transition: globalConfig.isRunning ? 'none' : 'all 0.2s ease',
        userSelect: 'none',
        transform: transform ? `translate3d(${transform.x}px, ${transform.y}px, 0)` : 'none',
        '&:hover': {
          border: isSelected ? '2px solid #1976d2' : '2px solid rgba(0, 0, 0, 0.5)',
          boxShadow: '0 2px 8px rgba(0,0,0,0.2)',
        },
      }}
    >      
      {!globalConfig.isRunning && ( // 仅在非运行状态下显示拖动手柄
        <Box
          {...listeners}
          {...attributes}
          sx={{
            position: 'absolute',
            top: 0,
            right: 0,
            cursor: isDragging ? 'grabbing' : 'grab',
            touchAction: 'none',
            color: 'rgba(0, 0, 0, 0.54)',
            padding: '2px',
            '&:hover': {
              backgroundColor: 'rgba(0, 0, 0, 0.04)',
              borderRadius: '50%',
            }
          }}
        >
          <DragIndicatorIcon fontSize="small" />
        </Box>
      )}
      <Typography 
        variant="body2" 
        align="center"
        sx={{
          width: '100%',
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          fontSize: Math.min(item.size.width, item.size.height) / 8,
          fontWeight: 'bold',
          pointerEvents: 'none', // 让文字不干扰点击
        }}
      >
        {item.text}
        {!globalConfig.isRunning && (
          <Box component="span" sx={{ display: 'block', fontSize: '0.8em', opacity: 0.7 }}>
            {item.frequency}Hz
          </Box>
        )}
      </Typography>
    </Box>
  );
}