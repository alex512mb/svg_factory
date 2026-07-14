import { useEffect, useRef, useState, type FormEvent } from "react";
import {
  categoryLabel,
  downloadSvg,
  generateAsset,
  getSelectedStep,
  GenerationCancelledError,
  type GenerationSession,
} from "./api";
import HistoryPanel from "./components/HistoryPanel";
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
  const [session, setSession] = useState<GenerationSession | null>(null);
  const [selectedStepId, setSelectedStepId] = useState(0);
  const abortRef = useRef<AbortController | null>(null);

  const keyReady = hasConfiguredKey(settings);
  const selectedStep = session ? getSelectedStep({
    ...session,
    selectedStepId,
  }) : null;

  useEffect(() => {
    if (!settingsSaved) return;
    const timer = window.setTimeout(() => setSettingsSaved(false), 2000);
    return () => window.clearTimeout(timer);
  }, [settingsSaved]);

  function handleSaveSettings() {
    saveSettings(settings);
    setSettingsSaved(true);
  }

  function handleCancel() {
    abortRef.current?.abort();
  }

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    const trimmed = prompt.trim();
    if (!trimmed || loading) return;

    if (!keyReady) {
      setError("Сначала укажите и сохраните API-ключ в настройках.");
      return;
    }

    abortRef.current?.abort();
    const controller = new AbortController();
    abortRef.current = controller;

    setLoading(true);
    setError(null);
    setSession(null);
    setSelectedStepId(0);

    try {
      await generateAsset(settings, trimmed, {
        signal: controller.signal,
        onUpdate: (nextSession) => {
          setSession(nextSession);
          setSelectedStepId(nextSession.selectedStepId);
        },
      });
    } catch (err) {
      if (err instanceof GenerationCancelledError) {
        setSession((prev) =>
          prev
            ? {
                ...prev,
                cancelled: true,
                finished: true,
                statusText: "Генерация прервана. Можно выбрать любой готовый шаг.",
              }
            : prev,
        );
        return;
      }
      setError(err instanceof Error ? err.message : "Неизвестная ошибка");
    } finally {
      setLoading(false);
      abortRef.current = null;
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
            Короткий запрос — готовый SVG в стиле colony-sim. Генератор сам
            проверяет результат и улучшает его при необходимости.
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
          {loading ? (
            <button type="button" className="cancel-btn" onClick={handleCancel}>
              Прервать
            </button>
          ) : (
            <button type="submit" disabled={!prompt.trim() || !keyReady}>
              Сгенерировать
            </button>
          )}
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

        {loading && session?.statusText && (
          <div className="banner info" role="status">
            {session.statusText}
          </div>
        )}

        {error && (
          <div className="banner error" role="alert">
            {error}
          </div>
        )}

        <HistoryPanel
          session={session}
          selectedStepId={selectedStepId}
          onSelectStep={setSelectedStepId}
        />

        <section className="preview-panel" aria-live="polite">
          {selectedStep ? (
            <>
              <div className="preview-meta">
                <span className="meta-item">
                  Тип: {categoryLabel(selectedStep.category)}
                </span>
                {session?.profileLabel && (
                  <span className="meta-item">
                    Образ: {session.profileLabel}
                  </span>
                )}
                <span className="meta-item">Файл: {selectedStep.filename}</span>
                <span className="meta-item">{selectedStep.label}</span>
              </div>
              <div
                className="preview-stage"
                dangerouslySetInnerHTML={{ __html: selectedStep.svg }}
              />
              <button
                type="button"
                className="download"
                onClick={() =>
                  downloadSvg(selectedStep.filename, selectedStep.svg)
                }
              >
                Скачать SVG
              </button>
            </>
          ) : (
            <div className="preview-empty">
              {loading
                ? "Собираем и проверяем силуэт…"
                : "Превью появится здесь после генерации"}
            </div>
          )}
        </section>
      </main>
    </div>
  );
}
