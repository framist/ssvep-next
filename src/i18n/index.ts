import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import zhCN from './locales/zh-CN.json';
import enUS from './locales/en-US.json';

const resources = {
  'zh-CN': {
    translation: zhCN,
  },
  'en-US': {
    translation: enUS,
  },
};

// 获取浏览器语言设置
const getBrowserLanguage = (): string => {
  const browserLang = navigator.language || (navigator as { userLanguage?: string }).userLanguage || 'en-US';
  // 根据浏览器语言返回支持的语言
  if (browserLang.startsWith('zh')) {
    return 'zh-CN';
  }
  return 'en-US';
};

// 从本地存储获取保存的语言设置，如果没有则使用浏览器语言
const savedLanguage = localStorage.getItem('ssvep-language') || getBrowserLanguage();

i18n
  .use(initReactI18next)
  .init({
    resources,
    lng: savedLanguage,
    fallbackLng: 'en-US',
    interpolation: {
      escapeValue: false,
    },
  });

// 保存语言选择到本地存储
i18n.on('languageChanged', (lng) => {
  localStorage.setItem('ssvep-language', lng);
});

export default i18n;
