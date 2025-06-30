import { Box, Typography } from '@mui/material';
import { useDroppable } from '@dnd-kit/core';
import { useStore } from '../stores/canvasStore';
import { StimulusBox } from './StimulusBox';

export function Canvas() {
  const { setNodeRef } = useDroppable({
    id: 'canvas',
  });
  const { items, selectItem, globalConfig } = useStore();

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

  return (
    <Box 
      id="canvas"
      ref={setNodeRef} 
      onClick={handleCanvasClick}
      sx={{ 
        flexGrow: 1, 
        p: 2, 
        position: 'relative', 
        backgroundColor: globalConfig.backgroundColor || '#f0f0f0',
        minHeight: '100vh',
        overflow: 'hidden',
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
            top: '50%',
            left: '50%',
            transform: 'translate(-50%, -50%)',
            textAlign: 'center',
            color: '#999',
            pointerEvents: 'none',
          }}
        >
          <Typography variant="h6" gutterBottom>
            从左侧工具栏拖拽刺激方块到这里开始设计
          </Typography>
          <Typography variant="body2">
            或者点击"加载演示"查看示例
          </Typography>
        </Box>
      )}
    </Box>
  );
}