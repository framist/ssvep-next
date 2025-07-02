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
  const { addItem, moveItem, globalConfig, viewConfig, loadProject } = useStore();
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
        const canvasElement = document.getElementById('canvas');
        const canvasRect = canvasElement?.getBoundingClientRect();
        const toolboxElement = document.querySelector('[data-testid="toolbox-draggable"]');
        
        if (canvasRect && toolboxElement && event.delta) {
          // 获取工具箱元素的位置
          const toolboxRect = toolboxElement.getBoundingClientRect();
          
          const finalX = toolboxRect.left - canvasRect.left;
          const finalY = toolboxRect.top - canvasRect.top;

          // 考虑画布的缩放和平移，转换到画布坐标系
          let x = (finalX - viewConfig.panX) / viewConfig.scale;
          let y = (finalY - viewConfig.panY) / viewConfig.scale;

          // 确保不超出画布边界
          x = Math.max(0, x);
          y = Math.max(0, y);

          // 应用网格吸附
          if (globalConfig.snapToGrid) {
            x = snapToGrid(x, globalConfig.gridSize);
            y = snapToGrid(y, globalConfig.gridSize);
          }
          
          addItem(
            { 
              text: globalConfig.defaultStimulus.text,
              frequency: globalConfig.defaultStimulus.frequency,
              size: globalConfig.defaultStimulus.size,
              color: globalConfig.defaultStimulus.color,
              position: { x: 0, y: 0 } // 临时位置，会被覆盖
            }, 
            { x, y }
          );
        }
      }
    }
    
    // 处理画布上现有项目的拖拽
    if (active.id !== 'new-stimulus-box' && event.delta && over?.id === 'canvas') {
      const activeId = active.id as string;
      const currentItem = useStore.getState().items[activeId];
      
      if (currentItem) {
        // 考虑缩放因子调整拖拽距离
        const deltaX = event.delta.x / viewConfig.scale;
        const deltaY = event.delta.y / viewConfig.scale;
        
        // 基于当前位置和拖拽偏移量计算新位置
        let newX = Math.max(0, currentItem.position.x + deltaX);
        let newY = Math.max(0, currentItem.position.y + deltaY);
        
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
      <Box sx={{ display: 'flex', height: '100vh', overflow: 'hidden' }}>
        {/* 左侧工具箱 */}
        <Box 
          sx={{ 
            width: '240px', 
            flexShrink: 0, 
            borderRight: '1px solid rgba(0, 0, 0, 0.12)',
          }}
        >
          <Toolbox />
        </Box>

        {/* 中间画布 */}
        <Box sx={{ flexGrow: 1, overflow: 'auto', position: 'relative' }}>
          <Canvas />
        </Box>

        {/* 右侧属性面板 */}
        <Box 
          sx={{ 
            width: '320px', 
            flexShrink: 0, 
            borderLeft: '1px solid rgba(0, 0, 0, 0.12)',
            overflowY: 'auto'
          }}
        >
          <PropertiesPanel />
        </Box>
      </Box>
    </DndContext>
  );
}

export default App;
