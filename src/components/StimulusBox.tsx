import React, { useEffect, useRef, useState } from 'react';
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
  
  const { selectedItemId, globalConfig } = useStore();
  const [isVisible, setIsVisible] = useState(true);
  const animationRef = useRef<number | null>(null);
  const startTimeRef = useRef<number | null>(null);
  
  const isSelected = selectedItemId === item.id;

  // SSVEP 刺激渲染逻辑
  useEffect(() => {
    if (!globalConfig.isRunning) {
      setIsVisible(true);
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
      return;
    }

    const frequency = item.frequency;
    const period = 1000 / frequency; // 周期（毫秒）
    
    const animate = (currentTime: number) => {
      if (!startTimeRef.current) {
        startTimeRef.current = currentTime;
      }
      
      const elapsed = currentTime - startTimeRef.current;
      const phase = (elapsed % period) / period;
      
      // 使用方波刺激（50% 占空比）
      setIsVisible(phase < 0.5);
      
      animationRef.current = requestAnimationFrame(animate);
    };
    
    animationRef.current = requestAnimationFrame(animate);
    
    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
      startTimeRef.current = null;
    };
  }, [item.frequency, globalConfig.isRunning]);

  const combinedStyle: React.CSSProperties = {
    ...style,
    // 不在这里设置 transform，统一在 sx 中处理
  };

  const handleClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    // Dragging is handled by the drag handle, so any click on the box itself is for selection.
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
        border: isSelected ? '2px solid #1976d2' : '1px solid #ccc',
        borderRadius: 1,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        cursor: 'pointer', // Changed from 'grab' to 'pointer'
        backgroundColor: globalConfig.isRunning 
          ? (isVisible ? item.color : '#000000')
          : item.color,
        color: globalConfig.isRunning 
          ? (isVisible ? '#000000' : item.color)
          : '#000000',
        transition: globalConfig.isRunning ? 'none' : 'all 0.2s ease',
        userSelect: 'none',
        opacity: isDragging ? 0.5 : 1,
        transform: transform ? `translate3d(${transform.x}px, ${transform.y}px, 0)` : 'none',
        '&:hover': {
          borderColor: isSelected ? '#1976d2' : '#999',
          boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
        },
      }}
    >
      {!globalConfig.isRunning && (
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