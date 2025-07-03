import type { StimulusItem, GlobalConfig } from '../stores/canvasStore';
import i18n from '../i18n';

export interface ProjectData {
  items: Record<string, StimulusItem>;
  globalConfig: GlobalConfig;
  version: string;
  timestamp: number;
}

export class ProjectManager {
  private static readonly STORAGE_KEY = 'ssvep-project';
  private static readonly VERSION = '1.0.1'; // 项目数据版本号

  static saveProject(items: Record<string, StimulusItem>, globalConfig: GlobalConfig): void {
    const projectData: ProjectData = {
      items,
      globalConfig,
      version: this.VERSION,
      timestamp: Date.now(),
    };

    try {
      localStorage.setItem(this.STORAGE_KEY, JSON.stringify(projectData));
    } catch (error) {
      console.error('Failed to save project:', error);
      throw new Error(i18n.t('messages.projectSaveError'));
    }
  }

  static loadProject(): ProjectData | null {
    try {
      const data = localStorage.getItem(this.STORAGE_KEY);
      if (!data) return null;

      const projectData: ProjectData = JSON.parse(data);
      return projectData;
    } catch (error) {
      console.error('Failed to load project:', error);
      return null;
    }
  }

  static exportProject(items: Record<string, StimulusItem>, globalConfig: GlobalConfig): void {
    const projectData: ProjectData = {
      items,
      globalConfig,
      version: this.VERSION,
      timestamp: Date.now(),
    };

    const dataStr = JSON.stringify(projectData, null, 2);
    const dataBlob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(dataBlob);
    
    const link = document.createElement('a');
    link.href = url;
    link.download = `ssvep-project-${new Date().toISOString().split('T')[0]}.json`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  }

  static importProject(file: File): Promise<ProjectData> {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = (e) => {
        try {
          const result = e.target?.result as string;
          const projectData: ProjectData = JSON.parse(result);
          resolve(projectData);
        } catch {
          reject(new Error(i18n.t('messages.invalidFileFormat')));
        }
      };
      reader.onerror = () => reject(new Error(i18n.t('messages.fileLoadError')));
      reader.readAsText(file);
    });
  }

  static generateShareableLink(items: Record<string, StimulusItem>, globalConfig: GlobalConfig): string {
    const projectData: ProjectData = {
      items,
      globalConfig,
      version: this.VERSION,
      timestamp: Date.now(),
    };

    try {
      // 使用 encodeURIComponent 替代 btoa，支持 Unicode 字符
      const encoded = encodeURIComponent(JSON.stringify(projectData));
      const url = new URL(window.location.href);
      url.searchParams.set('data', encoded);
      return url.toString();
    } catch (error) {
      console.error('Failed to generate shareable link:', error);
      throw new Error(i18n.t('messages.shareGenError'));
    }
  }

  static loadFromShareableLink(): ProjectData | null {
    try {
      const url = new URL(window.location.href);
      const encoded = url.searchParams.get('data');
      if (!encoded) return null;

      // 使用 decodeURIComponent 替代 atob，与编码函数匹配
      const decoded = decodeURIComponent(encoded);
      const projectData: ProjectData = JSON.parse(decoded);
      return projectData;
    } catch (error) {
      console.error('Failed to load from shareable link:', error);
      return null;
    }
  }
}
