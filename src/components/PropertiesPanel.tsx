import { 
  Box, 
  Typography, 
  TextField, 
  Slider, 
  Button,
  Divider,
  FormControlLabel,
  Switch,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
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
    <Box sx={{ 
      borderLeft: '1px solid #ccc', 
      p: 2, 
      height: '100vh',
      overflowX: 'hidden',
      overflowY: 'scroll',
    }}>
      <Typography variant="h6" gutterBottom>
        属性面板
      </Typography>

      {selectedItem ? (
        <Box>
          <Typography variant="subtitle1" gutterBottom>
            {selectedItem.type === 'stimulus' 
              ? '刺激方块属性' 
              : selectedItem.type === 'text' 
                ? '文本控件属性' 
                : 'iframe控件属性'}
          </Typography>

          <TextField
            label="文本"
            value={selectedItem.text}
            onChange={(e) => handleItemUpdate('text', e.target.value)}
            fullWidth
            margin="normal"
            size="small"
          />

          {selectedItem.type === 'stimulus' && (
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
          )}

          {selectedItem.type === 'text' && (
            <>
              <Box sx={{ mt: 2, mb: 2 }}>
                <Typography gutterBottom>
                  字体大小：{selectedItem.fontSize}px
                </Typography>
                <Slider
                  value={selectedItem.fontSize || 16}
                  onChange={(_, value) => handleItemUpdate('fontSize', value)}
                  min={10}
                  max={72}
                  step={1}
                  valueLabelDisplay="auto"
                />
              </Box>

              <FormControl fullWidth margin="normal" size="small">
                <InputLabel>字体粗细</InputLabel>
                <Select
                  value={selectedItem.fontWeight || 'normal'}
                  label="字体粗细"
                  onChange={(e) => handleItemUpdate('fontWeight', e.target.value)}
                >
                  <MenuItem value="normal">正常</MenuItem>
                  <MenuItem value="bold">粗体</MenuItem>
                  <MenuItem value="lighter">细体</MenuItem>
                </Select>
              </FormControl>
            </>
          )}

          {selectedItem.type === 'iframe' && (
            <TextField
              label="URL"
              value={selectedItem.url || ''}
              onChange={(e) => handleItemUpdate('url', e.target.value)}
              fullWidth
              margin="normal"
              size="small"
              placeholder="https://example.com"
            />
          )}

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
              />
              <TextField
                label="高度"
                type="number"
                value={selectedItem.size.height}
                onChange={(e) => handleSizeUpdate('height', parseInt(e.target.value) || 100)}
                size="small"
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

      <Divider sx={{ my: 2 }} />
      <Typography variant="h6" gutterBottom>
        全局设置
      </Typography>

      <FormControl fullWidth margin="normal" size="small">
        <InputLabel>波形类型</InputLabel>
        <Select
          value={globalConfig.waveformType}
          label="波形类型"
          onChange={(e) => updateGlobalConfig({ waveformType: e.target.value as 'square' | 'sine' })}
        >
          <MenuItem value="square">方波</MenuItem>
          <MenuItem value="sine">正弦波</MenuItem>
        </Select>
      </FormControl>

      <Box sx={{ mt: 2, mb: 2 }}>
        <Box sx={{ display: 'flex', gap: 1, mb: 2, alignItems: 'center' }}>
          <Typography gutterBottom
            sx={{ flex: 2 }}>
            实验时间：{globalConfig.duration === -1 ? '无限' : `${globalConfig.duration} 秒`}
          </Typography>
          <Button
            variant="outlined"
            size="small"
            onClick={() => updateGlobalConfig({ duration: -1 })}
            sx={{  flex: 1 }}
          >
            无限
          </Button>
        </Box>
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

      <Divider sx={{ my: 2 }} />

      <Typography variant="subtitle1" gutterBottom>
        画布设置
      </Typography>

      <Box sx={{ display: 'flex', gap: 1, mb: 2 }}>
        <TextField
          label="画布宽度"
          type="number"
          value={globalConfig.canvasSize.width}
          onChange={(e) => updateGlobalConfig({ 
            canvasSize: { 
              ...globalConfig.canvasSize, 
              width: Math.max(400, parseInt(e.target.value) || 1920) 
            } 
          })}
          size="small"
        />
        <TextField
          label="画布高度"
          type="number"
          value={globalConfig.canvasSize.height}
          onChange={(e) => updateGlobalConfig({ 
            canvasSize: { 
              ...globalConfig.canvasSize, 
              height: Math.max(300, parseInt(e.target.value) || 1080) 
            } 
          })}
          size="small"
        />
      </Box>

      <Divider sx={{ my: 2 }} />

      <Typography variant="subtitle1" gutterBottom>
        方块默认属性
      </Typography>

      <TextField
        label="默认文本"
        value={globalConfig.defaultStimulus.text}
        onChange={(e) => updateGlobalConfig({ 
          defaultStimulus: { 
            ...globalConfig.defaultStimulus, 
            text: e.target.value 
          } 
        })}
        fullWidth
        margin="normal"
        size="small"
      />

      <Box sx={{ mt: 2, mb: 2 }}>
        <Typography gutterBottom>
          默认频率：{globalConfig.defaultStimulus.frequency} Hz
        </Typography>
        <Slider
          value={globalConfig.defaultStimulus.frequency}
          onChange={(_, value) => updateGlobalConfig({ 
            defaultStimulus: { 
              ...globalConfig.defaultStimulus, 
              frequency: value as number 
            } 
          })}
          min={1}
          max={60}
          step={0.1}
          valueLabelDisplay="auto"
        />
      </Box>

      <TextField
        label="默认颜色"
        type="color"
        value={globalConfig.defaultStimulus.color}
        onChange={(e) => updateGlobalConfig({ 
          defaultStimulus: { 
            ...globalConfig.defaultStimulus, 
            color: e.target.value 
          } 
        })}
        fullWidth
        margin="normal"
        size="small"
      />

      <Box sx={{ mt: 2 }}>
        <Typography gutterBottom>默认尺寸</Typography>
        <Box sx={{ display: 'flex', gap: 1 }}>
          <TextField
            label="默认宽度"
            type="number"
            value={globalConfig.defaultStimulus.size.width}
            onChange={(e) => updateGlobalConfig({ 
              defaultStimulus: { 
                ...globalConfig.defaultStimulus, 
                size: { 
                  ...globalConfig.defaultStimulus.size, 
                  width: Math.max(50, parseInt(e.target.value) || 120) 
                } 
              } 
            })}
            size="small"
          />
          <TextField
            label="默认高度"
            type="number"
            value={globalConfig.defaultStimulus.size.height}
            onChange={(e) => updateGlobalConfig({ 
              defaultStimulus: { 
                ...globalConfig.defaultStimulus, 
                size: { 
                  ...globalConfig.defaultStimulus.size, 
                  height: Math.max(50, parseInt(e.target.value) || 120) 
                } 
              } 
            })}
            size="small"
          />
        </Box>
      </Box>

      <Box sx={{ mt: 2 }}>
        <Typography variant="body2" color="text.secondary">
          状态：{globalConfig.isRunning ? '运行中' : '已停止'}
        </Typography>
      </Box>
    </Box>
  );
}
