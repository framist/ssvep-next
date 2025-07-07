import React, { useState, useCallback, useEffect } from "react";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Box,
  TextField,
  Typography,
  Alert,
  CircularProgress,
  Switch,
  FormControlLabel,
  Accordion,
  AccordionSummary,
  AccordionDetails,
} from "@mui/material";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import Editor from "react-simple-code-editor";
import { highlight, languages } from "prismjs";
import "prismjs/components/prism-json";
import "prismjs/themes/prism.css";
import { useTranslation } from "react-i18next";
import { useStore } from "../stores/canvasStore";
import { ProjectManager } from "../utils/projectManager";

interface JsonEditorModalProps {
  open: boolean;
  onClose: () => void;
}

const SYSTEM_PROMPT = `You are an expert assistant for designing SSVEP (Steady-State Visually Evoked Potential) experiments. Your task is to modify and generate the JSON configuration for an SSVEP project based on the user's request.

### JSON Structure Overview:
- \`items\`: An object containing all elements on the canvas. The key for each element should be a unique ID (e.g., "stim-1", "text-title").
- \`globalConfig\`: An object for global settings that affect the entire experiment.

### Global Config (\`globalConfig\`) Fields:
- \`canvasSize\`: { "width": number, "height": number } - The dimensions of the design canvas.
- \`backgroundColor\`: string - The background color of the canvas (e.g., "#222222").
- \`duration\`: number - The total duration of the experiment in seconds.
- \`waveformType\`: "square" | "sine" - The waveform used for stimulus flashing.
- \`snapToGrid\`: boolean - If true, elements snap to a grid.
- \`gridSize\`: number - The size of the grid cells in pixels.
- \`showTimeDisplay\`: boolean - If true, a timer is shown during the experiment.
- \`defaultStimulus\`: object - Default properties for new stimulus boxes.

### Element Types (\`items\`)
1.  **\`stimulus\`**: A flashing box.
    - \`type\`: "stimulus"
    - \`position\`: { "x": number, "y": number }
    - \`size\`: { "width": number, "height": number }
    - \`frequency\`: number - **Required**. The flashing frequency in Hz (e.g., 8.0, 12.5).
    - \`text\`: string - Text displayed on the box.
    - \`color\`: string - The color of the box when lit (e.g., "#ffffff").
2.  **\`text\`**: A static text label.
    - \`type\`: "text"
    - \`position\`: { "x": number, "y": number }
    - \`text\`: string - The content of the label.
    - \`fontSize\`: number
    - \`fontWeight\`: string (e.g., "normal", "bold")
    - \`color\`: string
3.  **\`iframe\`**: An embedded webpage.
    - \`type\`: "iframe"
    - \`position\`: { "x": number, "y": number }
    - \`size\`: { "width": number, "height": number }
    - \`url\`: string - **Required**. The URL to embed.

### Example items‘ JSON Structure:

"items": {
  "demo-1": {
    "id": "demo-1",
    "type": "stimulus",
    "text": "刺激 A",
    "frequency": 8,
    "position": {
      "x": 20,
      "y": 20
    },
    "size": {
      "width": 120,
      "height": 120
    },
    "color": "#ff4444"
  },
  ...
}

### Your Instructions:
1.  **Adhere to Schema**: Strictly follow the JSON structure and field types described above.
2.  **Maintain Valid JSON**: The output must always be a perfectly valid JSON object.
3.  **Use Sensible Values**: When creating new stimulus boxes, assign reasonable frequency values (e.g., 8-15 Hz).
4.  **Respect Boundaries**: Ensure the position coordinates (\`x\`, \`y\`) are within the canvas dimensions defined in \`globalConfig\`.
5.  **Return Complete JSON**: Always return the full, complete JSON configuration. Do not omit any existing fields or elements unless requested.
6.  **Output Raw JSON Only**: Your final output must be ONLY the JSON configuration text, without any surrounding text, explanations, or markdown code blocks (like \`\`\`json\`).`;

export const JsonEditorModal: React.FC<JsonEditorModalProps> = ({
  open,
  onClose,
}) => {
  const { t } = useTranslation();
  const { items, globalConfig, loadProject } = useStore();

  const [jsonContent, setJsonContent] = useState("");
  const [userPrompt, setUserPrompt] = useState("");
  const [apiKey, setApiKey] = useState("");
  const [saveApiKey, setSaveApiKey] = useState(false);
  const [apiUrl, setApiUrl] = useState(
    "https://api.openai.com/v1/chat/completions"
  );
  const [modelName, setModelName] = useState("gpt-4.1");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");

  // 从 localStorage 加载 AI 设置
  useEffect(() => {
    const savedApiKey = localStorage.getItem("openai-api-key");
    if (savedApiKey) {
      setApiKey(savedApiKey);
      setSaveApiKey(true);
    }
    const savedApiUrl = localStorage.getItem("openai-api-url");
    if (savedApiUrl) {
      setApiUrl(savedApiUrl);
    }
    const savedModelName = localStorage.getItem("openai-model-name");
    if (savedModelName) {
      setModelName(savedModelName);
    }
  }, []);

  // 初始化 JSON 内容
  useEffect(() => {
    if (open) {
      setJsonContent(ProjectManager.formatProjectToJson(items, globalConfig));
      setError("");
    }
  }, [open, items, globalConfig]);

  const handleJsonChange = useCallback((code: string) => {
    setJsonContent(code);
    setError("");
  }, []);

  const validateAndParseJson = useCallback(() => {
    return ProjectManager.parseProjectFromJson(jsonContent);
  }, [jsonContent]);

  const handleApply = useCallback(() => {
    try {
      const projectData = validateAndParseJson();
      loadProject(projectData.items, projectData.globalConfig);
      setError("");
    } catch (error) {
      setError((error as Error).message);
    }
  }, [validateAndParseJson, loadProject]);

  const handleSave = useCallback(() => {
    try {
      const projectData = validateAndParseJson();
      loadProject(projectData.items, projectData.globalConfig);
      setError("");
      onClose();
    } catch (error) {
      setError((error as Error).message);
    }
  }, [validateAndParseJson, loadProject, onClose]);

  const handleAiGenerate = useCallback(async () => {
    if (!apiKey.trim()) {
      setError("Please enter your OpenAI API Key");
      return;
    }

    if (!userPrompt.trim()) {
      setError("Please enter your request");
      return;
    }

    setIsLoading(true);
    setError("");

    try {
      // 保存设置到 localStorage
      if (saveApiKey) {
        localStorage.setItem("openai-api-key", apiKey);
        localStorage.setItem("openai-api-url", apiUrl);
        localStorage.setItem("openai-model-name", modelName);
      } else {
        localStorage.removeItem("openai-api-key");
        localStorage.removeItem("openai-api-url");
        localStorage.removeItem("openai-model-name");
      }

      const response = await fetch(apiUrl, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
          Authorization: `Bearer ${apiKey}`,
        },
        body: JSON.stringify({
          model: modelName,
          messages: [
            {
              role: "system",
              content: SYSTEM_PROMPT,
            },
            {
              role: "user",
              content: `Current JSON configuration:\n${jsonContent}\n\nUser request: ${userPrompt}`,
            },
          ],
          temperature: 0.1,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => null);
        throw new Error(
          errorData?.error?.message ||
          `OpenAI API error: ${response.status} ${response.statusText}`
        );
      }

      const data = await response.json();
      const aiResponse = data.choices?.[0]?.message?.content;

      if (!aiResponse) {
        throw new Error("Empty response from OpenAI API");
      }

      // 尝试提取 JSON 从 AI 响应中
      let cleanedResponse = aiResponse.trim();

      // 移除可能的代码块标记
      if (cleanedResponse.startsWith("```json")) {
        cleanedResponse = cleanedResponse
          .replace(/^```json\s*/, "")
          .replace(/\s*```$/, "");
      } else if (cleanedResponse.startsWith("```")) {
        cleanedResponse = cleanedResponse
          .replace(/^```\s*/, "")
          .replace(/\s*```$/, "");
      }

      // 验证 AI 返回的 JSON
      JSON.parse(cleanedResponse);

      setJsonContent(cleanedResponse);
      setUserPrompt("");
    } catch (error) {
      console.error("AI generation error:", error);
      setError(`AI generation failed: ${(error as Error).message}`);
    } finally {
      setIsLoading(false);
    }
  }, [apiKey, userPrompt, jsonContent, saveApiKey, apiUrl, modelName]);

  return (
    <Dialog open={open} onClose={onClose} maxWidth="lg" fullWidth>
      <DialogTitle>{t("toolbox.editJson")}</DialogTitle>

      <DialogContent dividers>
        <Box
          sx={{
            display: "flex",
            flexDirection: "column",
            gap: 2,
            height: "80vh",
          }}
        >
          {/* JSON 编辑器 */}
          <Box
            sx={{
              flex: 1,
              border: "1px solid #ccc",
              borderRadius: 1,
              overflow: "auto",
            }}
          >
            <Editor
              value={jsonContent}
              onValueChange={handleJsonChange}
              highlight={(code) => highlight(code, languages.json, "json")}
              padding={16}
              style={{
                fontFamily: '"Fira code", "Fira Mono", monospace',
                fontSize: 12,
                lineHeight: 1.5,
              }}
              placeholder={t("toolbox.jsonPlaceholder")}
            />
          </Box>

          {/* AI 助手面板 */}
          <Accordion>
            <AccordionSummary expandIcon={<ExpandMoreIcon />}>
              <Typography variant="h6">{t("toolbox.aiAssistant")}</Typography>
            </AccordionSummary>
            <AccordionDetails>
              <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
                <TextField
                  label={t("toolbox.openaiApiKey")}
                  type="password"
                  value={apiKey}
                  onChange={(e) => setApiKey(e.target.value)}
                  placeholder="sk-..."
                  size="small"
                  fullWidth
                />

                <TextField
                  label={t("toolbox.apiUrl")}
                  value={apiUrl}
                  onChange={(e) => setApiUrl(e.target.value)}
                  placeholder="https://api.openai.com/v1/chat/completions"
                  size="small"
                  fullWidth
                />

                <TextField
                  label={t("toolbox.modelName")}
                  value={modelName}
                  onChange={(e) => setModelName(e.target.value)}
                  placeholder="gpt-4-turbo"
                  size="small"
                  fullWidth
                />

                <FormControlLabel
                  control={
                    <Switch
                      checked={saveApiKey}
                      onChange={(e) => setSaveApiKey(e.target.checked)}
                    />
                  }
                  label={t("toolbox.saveApiKey")}
                />

                <TextField
                  label={t("toolbox.aiPrompt")}
                  multiline
                  rows={3}
                  value={userPrompt}
                  onChange={(e) => setUserPrompt(e.target.value)}
                  placeholder={t("toolbox.aiPromptPlaceholder")}
                  size="small"
                  fullWidth
                />

                <Button
                  variant="contained"
                  onClick={handleAiGenerate}
                  disabled={isLoading || !apiKey.trim() || !userPrompt.trim()}
                  startIcon={isLoading ? <CircularProgress size={16} /> : null}
                >
                  {isLoading
                    ? t("toolbox.aiGenerating")
                    : t("toolbox.aiGenerate")}
                </Button>
              </Box>
            </AccordionDetails>
          </Accordion>

          {/* 错误提示 */}
          {error && (
            <Alert severity="error" sx={{ mt: 1 }}>
              {error}
            </Alert>
          )}
        </Box>
      </DialogContent>

      <DialogActions>
        <Button onClick={onClose}>{t("toolbox.matrixDialog.cancel")}</Button>
        <Button onClick={handleApply} variant="outlined">
          {t("toolbox.apply")}
        </Button>
        <Button onClick={handleSave} variant="contained">
          {t("toolbox.save")}
        </Button>
      </DialogActions>
    </Dialog>
  );
};
