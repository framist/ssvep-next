import { useRef, useState } from 'react';
import { Box, Typography, Button, Divider, Dialog, DialogTitle, DialogContent, DialogActions, TextField } from '@mui/material';
import { useDraggable } from '@dnd-kit/core';
import { useTranslation } from 'react-i18next';
import { useStore } from '../stores/canvasStore';
import { ProjectManager } from '../utils/projectManager';
import { useDemoSetup } from '../hooks/useDemoSetup';

function DraggableStimulusBox() {
  const { t } = useTranslation();
  const { attributes, listeners, setNodeRef, transform } = useDraggable({
    id: 'new-stimulus-box',
    data: {
      type: 'stimulus'
    }
  });

  const style = transform ? {
    transform: `translate3d(${transform.x}px, ${transform.y}px, 0)`,
  } : undefined;

  return (
    <Box
      ref={setNodeRef}
      style={style}
      {...listeners}
      {...attributes}
      data-testid="toolbox-draggable"
      sx={{
        width: 80,
        height: 80,
        border: '2px dashed #1976d2',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        cursor: 'grab',
        backgroundColor: '#f5f5f5',
        mb: 2,
        '&:hover': {
          backgroundColor: '#e3f2fd',
        },
      }}
    >
      <Typography variant="caption" align="center">
        {t('toolbox.stimulusBox')}
      </Typography>
    </Box>
  );
}

function DraggableTextBox() {
  const { t } = useTranslation();
  const { attributes, listeners, setNodeRef, transform } = useDraggable({
    id: 'new-text-box',
    data: {
      type: 'text'
    }
  });

  const style = transform ? {
    transform: `translate3d(${transform.x}px, ${transform.y}px, 0)`,
  } : undefined;

  return (
    <Box
      ref={setNodeRef}
      style={style}
      {...listeners}
      {...attributes}
      data-testid="toolbox-draggable-text"
      sx={{
        width: 80,
        height: 40,
        border: '2px dashed #4caf50',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        cursor: 'grab',
        backgroundColor: '#f5f5f5',
        mb: 2,
        '&:hover': {
          backgroundColor: '#e8f5e9',
        },
      }}
    >
      <Typography variant="caption" align="center">
        {t('toolbox.textBox')}
      </Typography>
    </Box>
  );
}

function DraggableIframeBox() {
  const { t } = useTranslation();
  const { attributes, listeners, setNodeRef, transform } = useDraggable({
    id: 'new-iframe-box',
    data: {
      type: 'iframe'
    }
  });

  const style = transform ? {
    transform: `translate3d(${transform.x}px, ${transform.y}px, 0)`,
  } : undefined;

  return (
    <Box
      ref={setNodeRef}
      style={style}
      {...listeners}
      {...attributes}
      data-testid="toolbox-draggable-iframe"
      sx={{
        width: 80,
        height: 40,
        border: '2px dashed #ff9800',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        cursor: 'grab',
        backgroundColor: '#f5f5f5',
        mb: 2,
        '&:hover': {
          backgroundColor: '#fff3e0',
        },
      }}
    >
      <Typography variant="caption" align="center">
        {t('toolbox.iframeBox')}
      </Typography>
    </Box>
  );
}

export function Toolbox() {
  const { t } = useTranslation();
  const {
    startStimulation,
    globalConfig,
    items,
    loadProject,
    clearAll,
    addItem,
  } = useStore();

  const [openMatrixDialog, setOpenMatrixDialog] = useState(false);
  const [rows, setRows] = useState(3);
  const [columns, setColumns] = useState(3);
  const [spacing, setSpacing] = useState(100);

  const { loadBasicDemoProject, loadKeyboardDemoProject, loadGamepadDemoProject } = useDemoSetup();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleSave = () => {
    try {
      ProjectManager.saveProject(items, globalConfig);
      alert(t('messages.projectSaved'));
    } catch (error) {
      alert(t('messages.saveFailed') + ': ' + (error as Error).message);
    }
  };

  const handleLoad = () => {
    const project = ProjectManager.loadProject();
    if (project) {
      // 加载项目数据到 store
      loadProject(project.items, project.globalConfig);
      alert(t('messages.projectLoaded'));
    } else {
      alert(t('messages.noSavedProject'));
    }
  };

  const handleExport = () => {
    try {
      ProjectManager.exportProject(items, globalConfig);
    } catch (error) {
      alert(t('messages.fileLoadError') + ': ' + (error as Error).message);
    }
  };

  const handleImport = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    try {
      const project = await ProjectManager.importProject(file);
      // 加载项目数据到 store
      loadProject(project.items, project.globalConfig);
      alert(t('messages.projectLoaded'));
    } catch (error) {
      alert(t('messages.fileLoadError') + ': ' + (error as Error).message);
    }

    // 清空文件输入
    event.target.value = '';
  };

  const handleShare = () => {
    try {
      const link = ProjectManager.generateShareableLink(items, globalConfig);
      navigator.clipboard.writeText(link).then(() => {
        alert(t('messages.linkCopied'));
      }).catch(() => {
        // 如果复制失败，显示链接让用户手动复制
        prompt('请复制以下链接：', link);
      });
    } catch (error) {
      alert(t('messages.fileLoadError') + ': ' + (error as Error).message);
    }
  };

  const handleClearCanvas = () => {
    if (confirm('Are you sure you want to empty the canvas? All stimulus squares will be removed. \n确定要清空画布吗？所有刺激方块将被移除。')) {
      clearAll();
    }
  };

  const handleOpenMatrixDialog = () => {
    setOpenMatrixDialog(true);
  };

  const handleCloseMatrixDialog = () => {
    setOpenMatrixDialog(false);
  };

  const handleCreateMatrix = () => {
    // 获取默认刺激属性
    const defaultStimulus = globalConfig.defaultStimulus;
    const itemWidth = defaultStimulus.size.width;
    const itemHeight = defaultStimulus.size.height;

    // 计算矩阵起始位置（居中放置）
    const totalWidth = columns * itemWidth + (columns - 1) * spacing;
    const totalHeight = rows * itemHeight + (rows - 1) * spacing;
    const startX = (globalConfig.canvasSize.width - totalWidth) / 2;
    const startY = (globalConfig.canvasSize.height - totalHeight) / 2;

    // 创建矩阵
    for (let r = 0; r < rows; r++) {
      for (let c = 0; c < columns; c++) {
        const x = startX + c * (itemWidth + spacing);
        const y = startY + r * (itemHeight + spacing);

        // 计算频率变化（可选：按位置变化频率）
        const baseFrequency = defaultStimulus.frequency;
        const frequency = baseFrequency + (r * columns + c) * 0.5;

        addItem(
          {
            type: 'stimulus',
            text: `${r + 1}-${c + 1}`,
            frequency,
            size: { width: itemWidth, height: itemHeight },
            color: defaultStimulus.color,
            position: { x: 0, y: 0 } // 临时位置
          },
          { x, y }
        );
        console.log(`Created item ${r + 1}-${c + 1} at position (${x}, ${y})`);
      }
    }

    setOpenMatrixDialog(false);
  };

  const handleStartStimulation = () => {
    if (Object.keys(items).length === 0) {
      alert(t('messages.noStimulusBoxes'));
      return;
    }
    startStimulation();
  };

  return (
    <>
      <Box sx={{
        borderRight: '1px solid #ccc', 
        p: 2,
        overflowX: 'hidden',
        overflowY: 'scroll',
      }}>
        <Typography variant="h6" gutterBottom>
          {t('toolbox.title')}
        </Typography>

        <Typography variant="body2" sx={{ mb: 1 }}>
          {t('canvas.dropHere')}:
        </Typography>
        <DraggableStimulusBox />
        <DraggableTextBox />
        <DraggableIframeBox />

        <Box sx={{ display: 'flex', gap: 1, mb: 2 }}>
          <Button
            variant="outlined"
            size="small"
            color="primary"
            onClick={handleOpenMatrixDialog}
            sx={{ flex: 1 }}
          >
            {t('toolbox.addMatrix')}
          </Button>

          <Button
            variant="outlined"
            size="small"
            color="error"
            onClick={handleClearCanvas}
            sx={{ flex: 1 }}
          >
            {t('toolbox.clearCanvas')}
          </Button>

        </Box>

        <Divider sx={{ my: 2 }} />

        <Box sx={{ mb: 2 }}>
          <Typography variant="h6" gutterBottom>
            {t('properties.simulation')}
          </Typography>
          <Button
            variant="contained"
            color="primary"
            fullWidth
            sx={{ mb: 1 }}
            onClick={handleStartStimulation}
            disabled={globalConfig.isRunning}
          >
            {t('properties.startStop')}
          </Button>
          {/* <Button
            variant="outlined"
            color="secondary"
            fullWidth
            onClick={stopStimulation}
            disabled={!globalConfig.isRunning}
          >
            {t('properties.startStop')}
          </Button> */}
        </Box>

        <Divider sx={{ my: 2 }} />

        <Box>
          <Typography variant="h6" gutterBottom>
            {t('toolbox.project.title')}
          </Typography>

          <Button
            variant="contained"
            size="small"
            fullWidth
            sx={{ mb: 1 }}
            onClick={handleSave}
          >
            {t('toolbox.project.save')}
          </Button>
          <Button
            variant="outlined"
            size="small"
            fullWidth
            sx={{ mb: 1 }}
            onClick={handleLoad}
          >
            {t('toolbox.project.load')}
          </Button>
          <Button
            variant="outlined"
            size="small"
            fullWidth
            sx={{ mb: 1 }}
            onClick={handleExport}
          >
            {t('toolbox.project.export')}
          </Button>
          <Button
            variant="outlined"
            size="small"
            fullWidth
            sx={{ mb: 1 }}
            onClick={handleImport}
          >
            {t('toolbox.project.import')}
          </Button>
          <Button
            variant="outlined"
            size="small"
            fullWidth
            onClick={handleShare}
          >
            {t('toolbox.project.share')}
          </Button>
        </Box>

        <Box
          component="input"
          type="file"
          ref={fileInputRef}
          onChange={handleFileChange}
          accept=".json"
          sx={{ display: 'none' }}
          aria-label={t('toolbox.project.importAriaLabel')}
        />

        <Typography variant="subtitle2" sx={{ my: 1, mb: 1, color: 'text.secondary' }}>
          {t('toolbox.project.examples')}
        </Typography>
        <Button
          color="secondary"
          variant="outlined"
          size="small"
          fullWidth
          sx={{ mb: 1 }}
          onClick={loadBasicDemoProject}
        >
          {t('toolbox.examples.basic')}
        </Button>
        <Button
          color="secondary"
          variant="outlined"
          size="small"
          fullWidth
          sx={{ mb: 1 }}
          onClick={loadKeyboardDemoProject}
        >
          {t('toolbox.examples.keyboard')}
        </Button>
        <Button
          color="secondary"
          variant="outlined"
          size="small"
          fullWidth
          sx={{ mb: 2 }}
          onClick={loadGamepadDemoProject}
        >
          {t('toolbox.examples.gamepad')}
        </Button>

        <Divider sx={{ my: 2 }} />


        <Box sx={{ textAlign: 'center', color: '#999' }}>
          <Typography variant="caption">
            {t('toolbox.version', { version: import.meta.env.VITE_APP_VERSION })}
          </Typography>
          <br />
          <Typography variant="caption">
            ♥️ by Framist | <a href="https://github.com/framist/ssvep-next">Github</a> ⭐
          </Typography>
        </Box>

      </Box>

      {/* 矩阵创建对话框 */}
      <MatrixDialog
        open={openMatrixDialog}
        onClose={handleCloseMatrixDialog}
        onConfirm={handleCreateMatrix}
        rows={rows}
        setRows={setRows}
        columns={columns}
        setColumns={setColumns}
        spacing={spacing}
        setSpacing={setSpacing}
      />
    </>
  );
}

// 添加矩阵对话框组件
interface MatrixDialogProps {
  open: boolean;
  onClose: () => void;
  onConfirm: () => void;
  rows: number;
  setRows: (rows: number) => void;
  columns: number;
  setColumns: (columns: number) => void;
  spacing: number;
  setSpacing: (spacing: number) => void;
}

function MatrixDialog({
  open,
  onClose,
  onConfirm,
  rows,
  setRows,
  columns,
  setColumns,
  spacing,
  setSpacing
}: MatrixDialogProps) {
  const { t } = useTranslation();

  return (
    <Dialog open={open} onClose={onClose}>
      <DialogTitle>{t('toolbox.matrixDialog.title')}</DialogTitle>
      <DialogContent>
        <Box sx={{ pt: 1, minWidth: 300 }}>
          <TextField
            label={t('toolbox.matrixDialog.rows')}
            type="number"
            value={rows}
            onChange={(e) => setRows(Math.max(1, parseInt(e.target.value) || 1))}
            fullWidth
            margin="normal"
            size="small"
          />
          <TextField
            label={t('toolbox.matrixDialog.columns')}
            type="number"
            value={columns}
            onChange={(e) => setColumns(Math.max(1, parseInt(e.target.value) || 1))}
            fullWidth
            margin="normal"
            size="small"
          />
          <TextField
            label={t('toolbox.matrixDialog.spacing')}
            type="number"
            value={spacing}
            onChange={(e) => setSpacing(Math.max(0, parseInt(e.target.value) || 0))}
            fullWidth
            margin="normal"
            size="small"
          />
        </Box>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>{t('toolbox.matrixDialog.cancel')}</Button>
        <Button onClick={onConfirm} variant="contained">{t('toolbox.matrixDialog.create')}</Button>
      </DialogActions>
    </Dialog>
  );
}