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
import { useTranslation } from 'react-i18next';
import { useStore } from '../stores/canvasStore';

const MAX_DURATION_MS = 4000;
const MIN_DURATION_MS = 60;
const DURATION_STEP_MS = 60;

export function PropertiesPanel() {
  const { t } = useTranslation();
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
        {t('properties.title')}
      </Typography>

      {selectedItem ? (
        <Box>
          <Typography variant="subtitle1" gutterBottom>
            {selectedItem.type === 'stimulus'
              ? t('toolbox.stimulusBox')
              : selectedItem.type === 'text'
                ? t('toolbox.textBox')
                : t('toolbox.iframeBox')}
          </Typography>

          <TextField
            label={t('properties.element.text')}
            value={selectedItem.text}
            onChange={(e) => handleItemUpdate('text', e.target.value)}
            fullWidth
            margin="normal"
            size="small"
          />

          {selectedItem.type === 'stimulus' && (
            <Box sx={{ mt: 2, mb: 2 }}>
              <Typography gutterBottom>
                {t('properties.frequency')}：{selectedItem.frequency} Hz
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
                  {t('properties.element.fontSize')}：{selectedItem.fontSize}px
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
                <InputLabel>{t('properties.element.fontWeight')}</InputLabel>
                <Select
                  value={selectedItem.fontWeight || 'normal'}
                  label={t('properties.element.fontWeight')}
                  onChange={(e) => handleItemUpdate('fontWeight', e.target.value)}
                >
                  <MenuItem value="normal">{t('properties.fontWeight.normal')}</MenuItem>
                  <MenuItem value="bold">{t('properties.fontWeight.bold')}</MenuItem>
                  <MenuItem value="lighter">{t('properties.fontWeight.lighter')}</MenuItem>
                </Select>
              </FormControl>
            </>
          )}

          {selectedItem.type === 'iframe' && (
            <TextField
              label={t('properties.element.url')}
              value={selectedItem.url || ''}
              onChange={(e) => handleItemUpdate('url', e.target.value)}
              fullWidth
              margin="normal"
              size="small"
              placeholder="https://example.com"
            />
          )}

          <TextField
            label={t('properties.foregroundColor')}
            type="color"
            value={selectedItem.color}
            onChange={(e) => handleItemUpdate('color', e.target.value)}
            fullWidth
            margin="normal"
            size="small"
          />

          <Box sx={{ mt: 2 }}>
            <Typography gutterBottom>{t('properties.size')}</Typography>
            <Box sx={{ display: 'flex', gap: 1 }}>
              <TextField
                label={t('properties.width')}
                type="number"
                value={selectedItem.size.width}
                onChange={(e) => handleSizeUpdate('width', parseInt(e.target.value) || 100)}
                size="small"
              />
              <TextField
                label={t('properties.height')}
                type="number"
                value={selectedItem.size.height}
                onChange={(e) => handleSizeUpdate('height', parseInt(e.target.value) || 100)}
                size="small"
              />
            </Box>
          </Box>

          <Box sx={{ mt: 2 }}>
            <Typography gutterBottom>{t('properties.element.position')}</Typography>
            <Box sx={{ display: 'flex', gap: 1 }}>
              <TextField
                label={t('properties.element.x')}
                type="number"
                value={Math.round(selectedItem.position.x)}
                onChange={(e) => handlePositionUpdate('x', parseInt(e.target.value) || 0)}
                size="small"
              />
              <TextField
                label={t('properties.element.y')}
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
            {t('properties.deleteItem')}
          </Button>

          <Divider sx={{ my: 3 }} />
        </Box>
      ) : (
        <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
          {t('properties.noSelection')}
        </Typography>
      )}

      <Divider sx={{ my: 2 }} />
      <Typography variant="h6" gutterBottom>
        {t('properties.globalSettings')}
      </Typography>

      <FormControl fullWidth margin="normal" size="small">
        <InputLabel>{t('properties.waveform')}</InputLabel>
        <Select
          value={globalConfig.waveformType}
          label={t('properties.waveform')}
          onChange={(e) => updateGlobalConfig({ waveformType: e.target.value as 'square' | 'sine' })}
        >
          <MenuItem value="square">{t('properties.square')}</MenuItem>
          <MenuItem value="sine">{t('properties.sine')}</MenuItem>
        </Select>
      </FormControl>

      <Box sx={{ mt: 2, mb: 2 }}>
        <Box sx={{ display: 'flex', gap: 1, mb: 2, alignItems: 'center' }}>
          <Typography gutterBottom
            sx={{ flex: 2 }}>
            {t('properties.duration')}：{globalConfig.duration === -1 ? t('properties.infinite') : `${globalConfig.duration} ${t('properties.seconds')}`}
          </Typography>
          <Button
            variant="outlined"
            size="small"
            onClick={() => updateGlobalConfig({ duration: -1 })}
            sx={{ flex: 1 }}
          >
            {t('properties.infinite')}
          </Button>
        </Box>
        <Slider
          value={globalConfig.duration === -1 ? MAX_DURATION_MS : globalConfig.duration}
          onChange={(_, value) => {
            // 当滑块拖到最大值时，设置为无限时长
            updateGlobalConfig({ duration: value === MAX_DURATION_MS ? -1 : value as number });
          }}
          min={MIN_DURATION_MS}
          max={MAX_DURATION_MS}
          step={DURATION_STEP_MS}
          valueLabelDisplay="auto"
          marks={[
            { value: MIN_DURATION_MS, label: '1m' },
            { value: 600, label: '10m' },
            { value: 1200, label: '20m' },
            { value: 1800, label: '30m' },
            { value: 3600, label: '1h' },
            { value: MAX_DURATION_MS, label: '♾️' } // 显示为无限
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
        label={t('properties.snapToGrid')}
        sx={{ mb: 2 }}
      />

      {globalConfig.snapToGrid && (
        <Box sx={{ mb: 2 }}>
          <Typography gutterBottom>
            {t('properties.gridSize')}：{globalConfig.gridSize}px
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
        label={t('properties.backgroundColor')}
        type="color"
        value={globalConfig.backgroundColor}
        onChange={(e) => updateGlobalConfig({ backgroundColor: e.target.value })}
        fullWidth
        margin="normal"
        size="small"
      />

      <Divider sx={{ my: 2 }} />

      <Typography variant="subtitle1" gutterBottom>
        {t('properties.canvasSize')}
      </Typography>

      <Box sx={{ display: 'flex', gap: 1, mb: 2 }}>
        <TextField
          label={t('properties.width')}
          type="number"
          value={globalConfig.canvasSize.width}
          onChange={(e) => updateGlobalConfig({
            canvasSize: {
              ...globalConfig.canvasSize,
              width: parseInt(e.target.value)
            }
          })}
          size="small"
        />
        <TextField
          label={t('properties.height')}
          type="number"
          value={globalConfig.canvasSize.height}
          onChange={(e) => updateGlobalConfig({
            canvasSize: {
              ...globalConfig.canvasSize,
              height: parseInt(e.target.value)
            }
          })}
          size="small"
        />
      </Box>

      <Divider sx={{ my: 2 }} />

      <Typography variant="subtitle1" gutterBottom>
        {t('properties.defaultProperties')}
      </Typography>

      <TextField
        label={t('properties.element.text')}
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
          {t('properties.frequency')}：{globalConfig.defaultStimulus.frequency} Hz
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
        label={t('properties.foregroundColor')}
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
        <Typography gutterBottom>{t('properties.size')}</Typography>
        <Box sx={{ display: 'flex', gap: 1 }}>
          <TextField
            label={t('properties.width')}
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
            label={t('properties.height')}
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


    </Box>
  );
}
