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
  private static readonly VERSION = process.env.APP_VERSION || '0.0.0';

  /**
   * 创建标准的 ProjectData 对象
   */
  private static createProjectData(items: Record<string, StimulusItem>, globalConfig: GlobalConfig): ProjectData {
    return {
      items,
      globalConfig,
      version: this.VERSION,
      timestamp: Date.now(),
    };
  }

  /**
   * 验证 ProjectData 对象的结构和类型
   */
  static validateProjectData(data: unknown): ProjectData {
    if (!data || typeof data !== 'object') {
      throw new Error('Invalid project data: not an object');
    }

    const projectData = data as Record<string, unknown>;

    // 验证基本字段
    if (!projectData.items || typeof projectData.items !== 'object') {
      throw new Error('Invalid project data: missing or invalid "items" field');
    }

    if (!projectData.globalConfig || typeof projectData.globalConfig !== 'object') {
      throw new Error('Invalid project data: missing or invalid "globalConfig" field');
    }

    // 验证 items 中的每个元素
    Object.values(projectData.items as Record<string, unknown>).forEach((item: unknown, index) => {
      const itemObj = item as Record<string, unknown>;
      if (!itemObj.id || !itemObj.type) {
        throw new Error(`Invalid item at index ${index}: missing id or type`);
      }
      if (!['stimulus', 'text', 'iframe'].includes(itemObj.type as string)) {
        throw new Error(`Invalid item type: ${itemObj.type}`);
      }
      const position = itemObj.position as Record<string, unknown>;
      if (!position || typeof position.x !== 'number' || typeof position.y !== 'number') {
        throw new Error(`Invalid item position at index ${index}`);
      }
    });

    // 验证 globalConfig 的必要字段
    const config = projectData.globalConfig as Record<string, unknown>;
    if (typeof config.duration !== 'number' || 
        typeof config.backgroundColor !== 'string' ||
        typeof config.isRunning !== 'boolean') {
      throw new Error('Invalid globalConfig: missing required fields');
    }

    return {
      items: projectData.items as Record<string, StimulusItem>,
      globalConfig: projectData.globalConfig as GlobalConfig,
      version: (projectData.version as string) || this.VERSION,
      timestamp: (projectData.timestamp as number) || Date.now(),
    };
  }

  /**
   * 将 ProjectData 格式化为 JSON 字符串
   */
  static formatProjectToJson(items: Record<string, StimulusItem>, globalConfig: GlobalConfig): string {
    const projectData = this.createProjectData(items, globalConfig);
    return JSON.stringify(projectData, null, 2);
  }

  /**
   * 从 JSON 字符串解析并验证 ProjectData
   */
  static parseProjectFromJson(jsonString: string): ProjectData {
    try {
      const parsed = JSON.parse(jsonString);
      return this.validateProjectData(parsed);
    } catch (error) {
      throw new Error(`JSON parsing error: ${(error as Error).message}`);
    }
  }

  static saveProject(items: Record<string, StimulusItem>, globalConfig: GlobalConfig): void {
    const projectData = this.createProjectData(items, globalConfig);

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
    const projectData = this.createProjectData(items, globalConfig);

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
          const projectData = this.parseProjectFromJson(result);
          resolve(projectData);
        } catch (error) {
          reject(new Error(`${i18n.t('messages.invalidFileFormat')}: ${(error as Error).message}`));
        }
      };
      reader.onerror = () => reject(new Error(i18n.t('messages.fileLoadError')));
      reader.readAsText(file);
    });
  }

  static generateShareableLink(items: Record<string, StimulusItem>, globalConfig: GlobalConfig): string {
    const projectData = this.createProjectData(items, globalConfig);

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
      return this.validateProjectData(JSON.parse(decoded));
    } catch (error) {
      console.error('Failed to load from shareable link:', error);
      return null;
    }
  }
}
