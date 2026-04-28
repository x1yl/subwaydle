import {
  loadSettingsFromLocalStorage,
  saveSettingsToLocalStorage,
} from './localStorage'

export const defaultSettings = {
  display: {
    showAnswerStatusBadges: false,
    darkMode:  window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches,
  }
}

// settings related to practice mode
defaultSettings.practice = {
  includeWeekend: false,
  includeWeekday: true,
}

export const saveSettings = (gameSettings) => {
  saveSettingsToLocalStorage(gameSettings);
}

export const loadSettings = () => {
  return loadSettingsFromLocalStorage() || defaultSettings;
}