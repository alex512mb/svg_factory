import type { AppSettings, ProviderId } from "../lib/settings";

type Props = {
  settings: AppSettings;
  onChange: (settings: AppSettings) => void;
  onSave: () => void;
  saved: boolean;
};

export default function SettingsPanel({
  settings,
  onChange,
  onSave,
  saved,
}: Props) {
  function setProvider(provider: ProviderId) {
    onChange({ ...settings, provider });
  }

  return (
    <section className="settings-panel">
      <div className="settings-head">
        <h2>Настройки API</h2>
        <p>
          Ключи хранятся только в вашем браузере (localStorage). На сервер не
          отправляются.
        </p>
      </div>

      <div className="provider-tabs">
        <button
          type="button"
          className={settings.provider === "openrouter" ? "active" : ""}
          onClick={() => setProvider("openrouter")}
        >
          OpenRouter
        </button>
        <button
          type="button"
          className={settings.provider === "deepseek" ? "active" : ""}
          onClick={() => setProvider("deepseek")}
        >
          DeepSeek
        </button>
      </div>

      {settings.provider === "openrouter" ? (
        <div className="settings-fields">
          <label>
            OpenRouter API Key
            <input
              type="password"
              value={settings.openrouterApiKey}
              onChange={(e) =>
                onChange({ ...settings, openrouterApiKey: e.target.value })
              }
              placeholder="sk-or-v1-..."
              autoComplete="off"
            />
          </label>
          <label>
            Модель
            <input
              type="text"
              value={settings.openrouterModel}
              onChange={(e) =>
                onChange({ ...settings, openrouterModel: e.target.value })
              }
              placeholder="deepseek/deepseek-v4-flash"
            />
          </label>
          <p className="settings-hint">
            Ключ:{" "}
            <a
              href="https://openrouter.ai/keys"
              target="_blank"
              rel="noreferrer"
            >
              openrouter.ai/keys
            </a>
          </p>
        </div>
      ) : (
        <div className="settings-fields">
          <label>
            DeepSeek API Key
            <input
              type="password"
              value={settings.deepseekApiKey}
              onChange={(e) =>
                onChange({ ...settings, deepseekApiKey: e.target.value })
              }
              placeholder="sk-..."
              autoComplete="off"
            />
          </label>
          <label>
            Модель
            <input
              type="text"
              value={settings.deepseekModel}
              onChange={(e) =>
                onChange({ ...settings, deepseekModel: e.target.value })
              }
              placeholder="deepseek-chat"
            />
          </label>
          <p className="settings-hint">
            Ключ:{" "}
            <a
              href="https://platform.deepseek.com/api_keys"
              target="_blank"
              rel="noreferrer"
            >
              platform.deepseek.com
            </a>
            . Из браузера может не работать из‑за CORS — предпочтительнее
            OpenRouter.
          </p>
        </div>
      )}

      <div className="settings-actions">
        <button type="button" className="save-settings" onClick={onSave}>
          Сохранить настройки
        </button>
        {saved && <span className="saved-badge">Сохранено</span>}
      </div>
    </section>
  );
}
