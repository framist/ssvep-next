import { useStore } from "../stores/canvasStore";
import { ProjectManager } from "../utils/projectManager";

export function useDemoSetup() {
  const { loadProject } = useStore();

  /**
   * 加载指定的演示项目
   * @param demoName 演示项目名称，如 'basic', 'keyboard', 'gamepad'
   */
  const loadDemo = async (demoName: string) => {
    try {
      const response = await fetch(`/demos/${demoName}.json`);
      if (!response.ok) {
        throw new Error(
          `Failed to load demo: ${response.status} ${response.statusText}`
        );
      }

      const jsonString = await response.text();
      const projectData = ProjectManager.parseProjectFromJson(jsonString);

      loadProject(projectData.items, projectData.globalConfig);
    } catch (error) {
      console.error(`Failed to load ${demoName} demo:`, error);
      throw error;
    }
  };

  // 为了保持向后兼容，保留原有的具体函数
  const loadBasicDemoProject = () => loadDemo("basic");
  const loadKeyboardDemoProject = () => loadDemo("keyboard");
  const loadGamepadDemoProject = () => loadDemo("gamepad");

  return {
    loadDemo,
    // 为了保持向后兼容，保留原有的函数
    loadBasicDemoProject,
    loadKeyboardDemoProject,
    loadGamepadDemoProject,
    loadDemoProject: loadBasicDemoProject,
  };
}
