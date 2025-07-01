import { useRef } from 'react';
import { Box, Typography, Button, Divider } from '@mui/material';
import { useDraggable } from '@dnd-kit/core';
import { useStore } from '../stores/canvasStore';
import { ProjectManager } from '../utils/projectManager';
import { useDemoSetup } from '../hooks/useDemoSetup';

function DraggableStimulusBox() {
  const { attributes, listeners, setNodeRef, transform } = useDraggable({
    id: 'new-stimulus-box',
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
        刺激方块
      </Typography>
    </Box>
  );
}

export function Toolbox() {
  const { 
    startStimulation, 
    stopStimulation, 
    globalConfig, 
    items,
    loadProject,
  } = useStore();
  
  const { loadDemoProject } = useDemoSetup();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleSave = () => {
    try {
      ProjectManager.saveProject(items, globalConfig);
      alert('项目已保存到本地存储');
    } catch (error) {
      alert('保存失败：' + (error as Error).message);
    }
  };

  const handleLoad = () => {
    const project = ProjectManager.loadProject();
    if (project) {
      // 加载项目数据到 store
      loadProject(project.items, project.globalConfig);
      alert('项目已加载');
    } else {
      alert('没有找到保存的项目');
    }
  };

  const handleExport = () => {
    try {
      ProjectManager.exportProject(items, globalConfig);
    } catch (error) {
      alert('导出失败：' + (error as Error).message);
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
      alert('项目已导入');
    } catch (error) {
      alert('导入失败：' + (error as Error).message);
    }

    // 清空文件输入
    event.target.value = '';
  };

  const handleShare = () => {
    try {
      const link = ProjectManager.generateShareableLink(items, globalConfig);
      navigator.clipboard.writeText(link).then(() => {
        alert('分享链接已复制到剪贴板');
      }).catch(() => {
        // 如果复制失败，显示链接让用户手动复制
        prompt('请复制以下链接：', link);
      });
    } catch (error) {
      alert('生成分享链接失败：' + (error as Error).message);
    }
  };

  const handleStartStimulation = () => {
    if (Object.keys(items).length === 0) {
      alert('请先添加至少一个刺激方块');
      return;
    }
    startStimulation();
  };

  return (
    <>
      <Box sx={{ width: '200px', borderRight: '1px solid #ccc', p: 2 }}>
        <Typography variant="h6" gutterBottom>
          工具箱
        </Typography>
        
        <Typography variant="body2" sx={{ mb: 1 }}>
          拖拽到画布：
        </Typography>
        <DraggableStimulusBox />
        
        <Divider sx={{ my: 2 }} />
        
        <Box sx={{ mb: 2 }}>
          <Typography variant="h6" gutterBottom>
            控制
          </Typography>
          <Button
            variant="contained"
            color="primary"
            fullWidth
            sx={{ mb: 1 }}
            onClick={handleStartStimulation}
            disabled={globalConfig.isRunning}
          >
            开始刺激
          </Button>
          <Button
            variant="outlined"
            color="secondary"
            fullWidth
            onClick={stopStimulation}
            disabled={!globalConfig.isRunning}
          >
            停止刺激
          </Button>
        </Box>

        <Divider sx={{ my: 2 }} />

        <Box>
          <Typography variant="h6" gutterBottom>
            项目管理
          </Typography>
          <Button
            variant="contained"
            size="small"
            fullWidth
            sx={{ mb: 1 }}
            onClick={loadDemoProject}
          >
            加载演示
          </Button>
          <Button
            variant="outlined"
            size="small"
            fullWidth
            sx={{ mb: 1 }}
            onClick={handleSave}
          >
            保存项目
          </Button>
          <Button
            variant="outlined"
            size="small"
            fullWidth
            sx={{ mb: 1 }}
            onClick={handleLoad}
          >
            加载项目
          </Button>
          <Button
            variant="outlined"
            size="small"
            fullWidth
            sx={{ mb: 1 }}
            onClick={handleExport}
          >
            导出文件
          </Button>
          <Button
            variant="outlined"
            size="small"
            fullWidth
            sx={{ mb: 1 }}
            onClick={handleImport}
          >
            导入文件
          </Button>
          <Button
            variant="outlined"
            size="small"
            fullWidth
            onClick={handleShare}
          >
            生成分享链接
          </Button>
        </Box>

        <Box
          component="input"
          type="file"
          ref={fileInputRef}
          onChange={handleFileChange}
          accept=".json"
          sx={{ display: 'none' }}
          aria-label="导入项目文件"
        />

        <Divider sx={{ my: 2 }} />

        <Box sx={{ textAlign: 'center', color: '#999' }}>
          <Typography variant="caption">
            版本：{import.meta.env.VITE_APP_VERSION}
          </Typography>
          <br />
          <Typography variant="caption">
            by Framist | <a href="https://github.com/framist/ssvep-next">Github</a>
          </Typography>
        </Box>

      </Box>
    </>
  );
}