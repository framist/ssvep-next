import React from 'react';
import { Box } from '@mui/material';
import { useDraggable } from '@dnd-kit/core';
import DragIndicatorIcon from '@mui/icons-material/DragIndicator';
import { useStore, type StimulusItem } from '../stores/canvasStore';

interface IframeBoxProps {
  item: StimulusItem;
  onClick?: () => void;
  style?: React.CSSProperties;
}

export function IframeBox({ item, onClick, style }: IframeBoxProps) {
  const { attributes, listeners, setNodeRef, transform, isDragging } = useDraggable({
    id: item.id,
  });
  
  const { selectedItemId, globalConfig } = useStore();
  
  const isSelected = selectedItemId === item.id;
  
  const combinedStyle: React.CSSProperties = {
    ...style,
  };

  const handleClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (onClick) {
      onClick();
    }
  };

  return (
    <Box
      ref={setNodeRef}
      style={combinedStyle}
      onClick={handleClick}
      sx={{
        position: 'relative',
        width: item.size.width,
        height: item.size.height,
        border: isSelected ? '2px solid #1976d2' : '2px solid rgba(255, 255, 255, 0.2)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        cursor: 'pointer',
        backgroundColor: 'white',
        opacity: isDragging ? 0.5 : 1,
        transition: 'all 0.2s ease',
        transform: transform ? `translate3d(${transform.x}px, ${transform.y}px, 0)` : 'none',
        '&:hover': {
          border: isSelected ? '2px solid #1976d2' : '2px solid rgba(0, 0, 0, 0.3)',
          boxShadow: '0 2px 8px rgba(0,0,0,0.2)',
        },
        overflow: 'hidden'
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
            zIndex: 10,
            '&:hover': {
              backgroundColor: 'rgba(0, 0, 0, 0.04)',
              borderRadius: '50%',
            }
          }}
        >
          <DragIndicatorIcon fontSize="small" />
        </Box>
      )}
      
      {item.url && ( // 如果有 URL，则渲染 iframe
        <Box
          component="iframe"
          src={item.url}
          title={item.text}
          sx={{
            width: '100%',
            height: '100%',
            border: 'none',
            pointerEvents: globalConfig.isRunning ? 'auto' : 'none' // 只有在运行模式下才允许交互
          }}
        />
      )}
      
      {!item.url && ( // 如果没有 URL，则显示提示信息
        <Box sx={{ 
          display: 'flex', 
          alignItems: 'center', 
          justifyContent: 'center',
          color: '#666',
          width: '100%',
          height: '100%'
        }}>
          未设置 URL
        </Box>
      )}
    </Box>
  );
}
