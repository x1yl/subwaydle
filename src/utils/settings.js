import {
  loadSettingsFromLocalStorage,
  saveSettingsToLocalStorage,
} from "./localStorage";

export const defaultSettings = {
  display: {
    showAnswerStatusBadges: false,
    darkMode:
      window.matchMedia &&
      window.matchMedia("(prefers-color-scheme: dark)").matches,
  },
  gameplay: {
    includeWeekend: true,
  },
};

export const getFullSettings = (settings) => {
  return {
    ...defaultSettings,
    display: {
      ...defaultSettings.display,
      ...(settings?.display || {}),
    },
    gameplay: {
      ...defaultSettings.gameplay,
      ...(settings?.gameplay || {}),
    },
  };
};

export const saveSettings = (gameSettings) => {
  saveSettingsToLocalStorage(gameSettings);
};

export const loadSettings = () => {
  const savedSettings = loadSettingsFromLocalStorage();
  return getFullSettings(savedSettings);
};
