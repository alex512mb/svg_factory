import { useEffect, useState, type FormEvent } from "react";
import {
  categoryLabel,
  downloadSvg,
  generateAsset,
  type GenerateResponse,
} from "./api";
import SettingsPanel from "./components/SettingsPanel";
import {
  hasConfiguredKey,
  loadSettings,
  saveSettings,
  type AppSettings,
} from "./lib/settings";

const EXAMPLES = ["собака", "охранник", "бочка", "зомби", "скелет-воин"];

export default function App() {
  const [settings, setSettings] = useState<AppSettings>(() => loadSettings());
  const [settingsSaved, setSettingsSaved] = useState(false);
  const [prompt, setPrompt] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<GenerateResponse | null>(null);

  const keyReady = hasConfiguredKey(settings);

  useEffect(() => {
    if (!settingsSaved) return;
    const timer = window.setTimeout(() => setSettingsSaved(false), 2000);
    return () => window.clearTimeout(timer);
  }, [settingsSaved]);

  function handleSaveSettings() {
    saveSettings(settings);
    setSettingsSaved(true);
  }

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    const trimmed = prompt.trim();
    if (!trimmed || loading) return;

    if (!keyReady) {
      setError("Сначала укажите и сохраните API-ключ в настройках.");
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const data = await generateAsset(settings, trimmed);
      setResult(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Неизвестная ошибка");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="page">
      <div className="atmosphere" aria-hidden="true" />

      <main className="shell">
        <header className="brand">
          <p className="brand-mark">Colony Ink</p>
          <h1>2D Content Generator</h1>
          <p className="lede">
            Короткий запрос — готовый SVG в стиле colony-sim. Стиль уже вшит:
            объяснять RimWorld или Prison Architect не нужно.
          </p>
        </header>

        <SettingsPanel
          settings={settings}
          onChange={setSettings}
          onSave={handleSaveSettings}
          saved={settingsSaved}
        />

        {!keyReady && (
          <div className="banner warn" role="status">
            Укажите API-ключ в настройках выше, чтобы начать генерацию.
          </div>
        )}

        <form className="generate-form" onSubmit={onSubmit}>
          <label htmlFor="prompt" className="sr-only">
            Что создать
          </label>
          <input
            id="prompt"
            type="text"
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            placeholder="Например: собака, охранник, бочка…"
            autoComplete="off"
            disabled={loading}
          />
          <button
            type="submit"
            disabled={loading || !prompt.trim() || !keyReady}
          >
            {loading ? "Генерация…" : "Сгенерировать"}
          </button>
        </form>

        <div className="examples">
          {EXAMPLES.map((ex) => (
            <button
              key={ex}
              type="button"
              className="chip"
              disabled={loading}
              onClick={() => setPrompt(ex)}
            >
              {ex}
            </button>
          ))}
        </div>

        {error && (
          <div className="banner error" role="alert">
            {error}
          </div>
        )}

        <section className="preview-panel" aria-live="polite">
          {result ? (
            <>
              <div className="preview-meta">
                <span className="meta-item">
                  Тип: {categoryLabel(result.category)}
                </span>
                <span className="meta-item">Файл: {result.filename}</span>
              </div>
              <div
                className="preview-stage"
                dangerouslySetInnerHTML={{ __html: result.svg }}
              />
              <button
                type="button"
                className="download"
                onClick={() => downloadSvg(result.filename, result.svg)}
              >
                Скачать SVG
              </button>
            </>
          ) : (
            <div className="preview-empty">
              {loading
                ? "Собираем силуэт…"
                : "Превью появится здесь после генерации"}
            </div>
          )}
        </section>
      </main>
    </div>
  );
}
