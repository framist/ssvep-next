import { 
  Box, 
  Typography, 
  TextField, 
  Slider, 
  Button,
  Divider,
  FormControlLabel,
  Switch,
} from '@mui/material';
import { useStore } from '../stores/canvasStore';

export function PropertiesPanel() {
  const { 
    items, 
    selectedItemId, 
    updateItem, 
    removeItem, 
    globalConfig, 
    updateGlobalConfig 
  } = useStore();

  const selectedItem = selectedItemId ? items[selectedItemId] : null;

  const handleItemUpdate = (field: string, value: string | number | { x: number; y: number } | { width: number; height: number }) => {
    if (selectedItemId && selectedItem) {
      updateItem(selectedItemId, { [field]: value });
    }
  };

  const handleSizeUpdate = (dimension: 'width' | 'height', value: number) => {
    if (selectedItemId && selectedItem) {
      const newSize = { ...selectedItem.size, [dimension]: Math.max(50, value) };
      updateItem(selectedItemId, { size: newSize });
    }
  };

  const handlePositionUpdate = (axis: 'x' | 'y', value: number) => {
    if (selectedItemId && selectedItem) {
      const newPosition = { ...selectedItem.position, [axis]: Math.max(0, value) };
      updateItem(selectedItemId, { position: newPosition });
    }
  };

  const handleDelete = () => {
    if (selectedItemId) {
      removeItem(selectedItemId);
    }
  };

  return (
    <Box sx={{ width: '300px', borderLeft: '1px solid #ccc', p: 2, height: '100vh', overflow: 'auto' }}>
      <Typography variant="h6" gutterBottom>
        属性面板
      </Typography>

      {selectedItem ? (
        <Box>
          <Typography variant="subtitle1" gutterBottom>
            刺激方块属性
          </Typography>

          <TextField
            label="文本"
            value={selectedItem.text}
            onChange={(e) => handleItemUpdate('text', e.target.value)}
            fullWidth
            margin="normal"
            size="small"
          />

          <Box sx={{ mt: 2, mb: 2 }}>
            <Typography gutterBottom>
              频率：{selectedItem.frequency} Hz
            </Typography>
            <Slider
              value={selectedItem.frequency}
              onChange={(_, value) => handleItemUpdate('frequency', value)}
              min={1}
              max={60}
              step={0.1}
              valueLabelDisplay="auto"
            />
          </Box>

          <TextField
            label="颜色"
            type="color"
            value={selectedItem.color}
            onChange={(e) => handleItemUpdate('color', e.target.value)}
            fullWidth
            margin="normal"
            size="small"
          />

          <Box sx={{ mt: 2 }}>
            <Typography gutterBottom>尺寸</Typography>
            <Box sx={{ display: 'flex', gap: 1 }}>
              <TextField
                label="宽度"
                type="number"
                value={selectedItem.size.width}
                onChange={(e) => handleSizeUpdate('width', parseInt(e.target.value) || 100)}
                size="small"
                inputProps={{ min: 50, max: 500 }}
              />
              <TextField
                label="高度"
                type="number"
                value={selectedItem.size.height}
                onChange={(e) => handleSizeUpdate('height', parseInt(e.target.value) || 100)}
                size="small"
                inputProps={{ min: 50, max: 500 }}
              />
            </Box>
          </Box>

          <Box sx={{ mt: 2 }}>
            <Typography gutterBottom>位置</Typography>
            <Box sx={{ display: 'flex', gap: 1 }}>
              <TextField
                label="X"
                type="number"
                value={Math.round(selectedItem.position.x)}
                onChange={(e) => handlePositionUpdate('x', parseInt(e.target.value) || 0)}
                size="small"
              />
              <TextField
                label="Y"
                type="number"
                value={Math.round(selectedItem.position.y)}
                onChange={(e) => handlePositionUpdate('y', parseInt(e.target.value) || 0)}
                size="small"
              />
            </Box>
          </Box>

          <Button
            variant="outlined"
            color="error"
            onClick={handleDelete}
            fullWidth
            sx={{ mt: 2 }}
          >
            删除方块
          </Button>

          <Divider sx={{ my: 3 }} />
        </Box>
      ) : (
        <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
          选择一个刺激方块来编辑属性
        </Typography>
      )}

      <Typography variant="subtitle1" gutterBottom>
        全局设置
      </Typography>

      <Box sx={{ mt: 2, mb: 2 }}>
        <Typography gutterBottom>
          实验持续时间：{globalConfig.duration === -1 ? '无限' : `${globalConfig.duration} 秒`}
        </Typography>
        <Slider
          value={globalConfig.duration === -1 ? 360 : globalConfig.duration}
          onChange={(_, value) => {
            // 当滑块拖到最大值时，设置为无限时长
            updateGlobalConfig({ duration: value === 360 ? -1 : value as number });
          }}
          min={5}
          max={360}
          step={5}
          valueLabelDisplay="auto"
          marks={[
            { value: 5, label: '5s' },
            { value: 60, label: '1m' },
            { value: 120, label: '2m' },
            { value: 300, label: '5m' },
            { value: 360, label: '无限' }
          ]}
        />
        <Button
          variant="outlined"
          size="small"
          onClick={() => updateGlobalConfig({ duration: -1 })}
          sx={{ mt: 1 }}
        >
          设为无限时长
        </Button>
      </Box>

      <FormControlLabel
        control={
          <Switch
            checked={globalConfig.snapToGrid}
            onChange={(e) => updateGlobalConfig({ snapToGrid: e.target.checked })}
          />
        }
        label="启用网格吸附"
        sx={{ mb: 2 }}
      />

      {globalConfig.snapToGrid && (
        <Box sx={{ mb: 2 }}>
          <Typography gutterBottom>
            网格大小：{globalConfig.gridSize}px
          </Typography>
          <Slider
            value={globalConfig.gridSize}
            onChange={(_, value) => updateGlobalConfig({ gridSize: value as number })}
            min={10}
            max={50}
            step={5}
            valueLabelDisplay="auto"
          />
        </Box>
      )}

      <TextField
        label="背景颜色"
        type="color"
        value={globalConfig.backgroundColor}
        onChange={(e) => updateGlobalConfig({ backgroundColor: e.target.value })}
        fullWidth
        margin="normal"
        size="small"
      />

      <Box sx={{ mt: 2 }}>
        <Typography variant="body2" color="text.secondary">
          状态：{globalConfig.isRunning ? '运行中' : '已停止'}
        </Typography>
      </Box>
    </Box>
  );
}
