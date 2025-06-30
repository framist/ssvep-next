import { useEffect, useState } from 'react';
import { Box } from '@mui/material';
import { DndContext, type DragEndEvent } from '@dnd-kit/core';
import { Toolbox } from './components/Toolbox';
import { Canvas } from './components/Canvas';
import { PropertiesPanel } from './components/PropertiesPanel';
import { FullscreenMode } from './components/FullscreenMode';
import { useStore } from './stores/canvasStore';
import { ProjectManager } from './utils/projectManager';

function App() {
  const { addItem, moveItem, globalConfig, loadProject } = useStore();
  const [showFullscreen, setShowFullscreen] = useState(false);

  // 网格吸附辅助函数
  const snapToGrid = (value: number, gridSize: number): number => {
    return Math.round(value / gridSize) * gridSize;
  };

  // 在应用启动时检查是否有分享链接
  useEffect(() => {
    const sharedProject = ProjectManager.loadFromShareableLink();
    if (sharedProject) {
      // 加载共享项目数据
      loadProject(sharedProject.items, sharedProject.globalConfig);
      
      // 清理 URL 参数
      const url = new URL(window.location.href);
      url.searchParams.delete('data');
      window.history.replaceState({}, '', url.toString());
    }
  }, [loadProject]);

  // 监听全屏刺激状态
  useEffect(() => {
    setShowFullscreen(globalConfig.isRunning);
  }, [globalConfig.isRunning]);

  function handleDragEnd(event: DragEndEvent) {
    const { over, active } = event;

    if (over && over.id === 'canvas') {
      // 从工具箱拖拽新项目到画布
      if (active.id === 'new-stimulus-box') {
        const canvasRect = document.getElementById('canvas')?.getBoundingClientRect();
        if (canvasRect && event.activatorEvent) {
          const mouseEvent = event.activatorEvent as MouseEvent;
          let x = Math.max(0, mouseEvent.clientX - canvasRect.left - 50);
          let y = Math.max(0, mouseEvent.clientY - canvasRect.top - 50);
          
          // 应用网格吸附
          if (globalConfig.snapToGrid) {
            x = snapToGrid(x, globalConfig.gridSize);
            y = snapToGrid(y, globalConfig.gridSize);
          }
          
          addItem(
            { 
              text: 'Stimulus', 
              frequency: 10, 
              size: { width: 100, height: 100 }, 
              color: '#ffffff',
              position: { x: 0, y: 0 } // 临时位置，会被覆盖
            }, 
            { x, y }
          );
        }
      }
    }
    
    // 处理画布上现有项目的拖拽 - 修复位置计算
    if (active.id !== 'new-stimulus-box' && event.delta && over?.id === 'canvas') {
      const activeId = active.id as string;
      const canvasRect = document.getElementById('canvas')?.getBoundingClientRect();
      const currentItem = useStore.getState().items[activeId];
      
      if (canvasRect && currentItem) {
        // 基于当前位置和拖拽偏移量计算新位置
        let newX = Math.max(0, currentItem.position.x + event.delta.x);
        let newY = Math.max(0, currentItem.position.y + event.delta.y);
        
        // 应用网格吸附
        if (globalConfig.snapToGrid) {
          newX = snapToGrid(newX, globalConfig.gridSize);
          newY = snapToGrid(newY, globalConfig.gridSize);
        }
        
        moveItem(activeId, { x: newX, y: newY });
      }
    }
  }

  const handleExitFullscreen = () => {
    setShowFullscreen(false);
  };

  if (showFullscreen && globalConfig.isRunning) {
    return <FullscreenMode onExit={handleExitFullscreen} />;
  }

  return (
    <DndContext onDragEnd={handleDragEnd}>
      <Box sx={{ display: 'flex', height: '100vh' }}>
        <Toolbox />
        <Canvas />
        <PropertiesPanel />
      </Box>
    </DndContext>
  );
}

export default App;
