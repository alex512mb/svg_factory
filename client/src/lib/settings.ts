export type ProviderId = "openrouter" | "deepseek";

export type AppSettings = {
  provider: ProviderId;
  openrouterApiKey: string;
  openrouterModel: string;
  deepseekApiKey: string;
  deepseekModel: string;
};

const STORAGE_KEY = "colony-ink-settings-v1";

export const DEFAULT_SETTINGS: AppSettings = {
  provider: "openrouter",
  openrouterApiKey: "",
  openrouterModel: "deepseek/deepseek-v4-flash",
  deepseekApiKey: "",
  deepseekModel: "deepseek-chat",
};

export function loadSettings(): AppSettings {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) {
      return { ...DEFAULT_SETTINGS };
    }
    const parsed = JSON.parse(raw) as Partial<AppSettings>;
    return {
      ...DEFAULT_SETTINGS,
      ...parsed,
    };
  } catch {
    return { ...DEFAULT_SETTINGS };
  }
}

export function saveSettings(settings: AppSettings): void {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(settings));
}

export function getActiveApiKey(settings: AppSettings): string {
  return settings.provider === "openrouter"
    ? settings.openrouterApiKey.trim()
    : settings.deepseekApiKey.trim();
}

export function getActiveModel(settings: AppSettings): string {
  return settings.provider === "openrouter"
    ? settings.openrouterModel.trim() || DEFAULT_SETTINGS.openrouterModel
    : settings.deepseekModel.trim() || DEFAULT_SETTINGS.deepseekModel;
}

export function hasConfiguredKey(settings: AppSettings): boolean {
  return getActiveApiKey(settings).length > 0;
}
