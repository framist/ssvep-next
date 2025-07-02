import { Box, Typography, IconButton } from '@mui/material';
import { ZoomIn, ZoomOut, CenterFocusStrong } from '@mui/icons-material';
import { useDroppable } from '@dnd-kit/core';
import { useStore } from '../stores/canvasStore';
import { StimulusBox } from './StimulusBox';
import { useRef, useCallback, useState } from 'react';

export function Canvas() {
  const { setNodeRef } = useDroppable({
    id: 'canvas',
  });
  const { items, selectItem, globalConfig, viewConfig, updateViewConfig, resetView } = useStore();
  const containerRef = useRef<HTMLDivElement>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });

  const handleItemClick = (itemId: string) => {
    console.log('Canvas handleItemClick:', itemId); // 调试日志
    selectItem(itemId);
  };

  const handleCanvasClick = (e: React.MouseEvent) => {
    // 点击画布空白区域时取消选择
    if (e.target === e.currentTarget) {
      selectItem(null);
    }
  };

  // 缩放功能
  const handleZoomIn = useCallback(() => {
    const newScale = Math.min(viewConfig.scale * 1.2, 5); // 最大缩放 5x
    updateViewConfig({ scale: newScale });
  }, [viewConfig.scale, updateViewConfig]);

  const handleZoomOut = useCallback(() => {
    const newScale = Math.max(viewConfig.scale / 1.2, 0.1); // 最小缩放 0.1x
    updateViewConfig({ scale: newScale });
  }, [viewConfig.scale, updateViewConfig]);

  // 重置视图
  const handleResetView = useCallback(() => {
    resetView();
  }, [resetView]);

  // 鼠标滚轮缩放
  const handleWheel = useCallback((e: React.WheelEvent) => {
    e.preventDefault();
    const delta = e.deltaY > 0 ? 0.9 : 1.1;
    const newScale = Math.min(Math.max(viewConfig.scale * delta, 0.1), 5);
    updateViewConfig({ scale: newScale });
  }, [viewConfig.scale, updateViewConfig]);

  // 平移功能
  const handleMouseDown = useCallback((e: React.MouseEvent) => {
    if (e.button === 1 || (e.button === 0 && e.ctrlKey)) { // Middle button or Ctrl+Left click
      e.preventDefault();
      setIsDragging(true);
      setDragStart({ x: e.clientX - viewConfig.panX, y: e.clientY - viewConfig.panY });
    }
  }, [viewConfig.panX, viewConfig.panY]);

  const handleMouseMove = useCallback((e: React.MouseEvent) => {
    if (isDragging) {
      const newPanX = e.clientX - dragStart.x;
      const newPanY = e.clientY - dragStart.y;
      updateViewConfig({ panX: newPanX, panY: newPanY });
    }
  }, [isDragging, dragStart, updateViewConfig]);

  const handleMouseUp = useCallback(() => {
    setIsDragging(false);
  }, []);

  return (
    <Box sx={{ position: 'relative', flexGrow: 1, overflow: 'hidden' }}>
      {/* 视图控制按钮 */}
      <Box
        sx={{
          position: 'absolute',
          top: 16,
          right: 16,
          zIndex: 1000,
          display: 'flex',
          flexDirection: 'column',
          gap: 1,
          backgroundColor: 'rgba(255, 255, 255, 0.9)',
          borderRadius: 1,
          p: 0.5,
        }}
      >
        <IconButton size="small" onClick={handleZoomIn} title="放大">
          <ZoomIn />
        </IconButton>
        <IconButton size="small" onClick={handleZoomOut} title="缩小">
          <ZoomOut />
        </IconButton>
        <IconButton size="small" onClick={handleResetView} title="重置视图">
          <CenterFocusStrong />
        </IconButton>
      </Box>

      {/* 画布容器 */}
      <Box
        ref={containerRef}
        sx={{
          width: '100%',
          height: '100vh',
          overflow: 'hidden',
          cursor: isDragging ? 'grabbing' : 'grab',
        }}
        onWheel={handleWheel}
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseUp}
      >
        <Box 
          id="canvas"
          ref={setNodeRef} 
          onClick={handleCanvasClick}
          sx={{ 
            width: globalConfig.canvasSize.width,
            height: globalConfig.canvasSize.height,
            position: 'relative', 
            backgroundColor: globalConfig.backgroundColor || '#f0f0f0',
            transform: `translate(${viewConfig.panX}px, ${viewConfig.panY}px) scale(${viewConfig.scale})`,
            transformOrigin: '0 0',
            // 添加网格背景（当启用网格吸附时）
            backgroundImage: globalConfig.snapToGrid 
              ? `radial-gradient(circle, #ccc 1px, transparent 1px)`
              : 'none',
            backgroundSize: globalConfig.snapToGrid 
              ? `${globalConfig.gridSize}px ${globalConfig.gridSize}px`
              : 'initial',
          }}
        >
          {Object.values(items).map((item) => (
            <StimulusBox 
              key={item.id} 
              item={item}
              onClick={() => handleItemClick(item.id)}
              style={{ 
                position: 'absolute', 
                left: item.position.x, 
                top: item.position.y,
                width: item.size.width,
                height: item.size.height,
              }}
            />
          ))}
          
          {/* 如果没有项目，显示提示信息 */}
          {Object.keys(items).length === 0 && (
            <Box
              sx={{
                position: 'absolute',
                top: '10%',
                left: '5%',
                textAlign: 'left',
                color: '#999',
                pointerEvents: 'none',
              }}
            >
              <Typography variant="h4" gutterBottom>
                从左侧工具栏拖拽刺激方块到这里开始设计
              </Typography>
              <Typography variant="h6" gutterBottom>
                或者点击"加载演示"查看示例
              </Typography>
              <Typography variant="body2">
                <br />
                <br />
                <br />
                <br />
                鼠标滚轮缩放画布，按住中键或 Ctrl+ 左键平移画布
              </Typography>
            </Box>
          )}
        </Box>
      </Box>
    </Box>
  );
}