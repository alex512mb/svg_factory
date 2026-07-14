# 2D Content Generator

Статический веб-генератор игровых SVG-ассетов в стиле colony-sim (RimWorld / Prison Architect).

Работает полностью в браузере — каждый пользователь вводит **свой** API-ключ (OpenRouter или DeepSeek). Ключи сохраняются **локально** в `localStorage` и никуда не отправляются, кроме выбранного API-провайдера.

## Возможности

- Короткий запрос → SVG в вшитом стиле colony-sim
- OpenRouter (рекомендуется) или DeepSeek
- Превью и скачивание `.svg`
- Деплой на GitHub Pages

## Локальный запуск

```bash
npm install
npm run dev
```

Откройте http://localhost:5173, введите API-ключ в настройках и сохраните.

## GitHub Pages

1. Загрузите репозиторий на GitHub.
2. **Settings → Pages → Build and deployment → Source: GitHub Actions** (не «Deploy from a branch»).
3. Запушьте в ветку `main` или `master` — workflow соберёт `dist/` и опубликует его.

Сайт: `https://<username>.github.io/<repo-name>/`

### Если вместо приложения показывается README

Это значит, GitHub отдаёт **исходники репозитория**, а не собранный `dist/`.

**Исправление:**
1. **Settings → Pages → Source** → выберите **GitHub Actions**
2. Убедитесь, что **не** выбрано «Deploy from a branch / main / (root)»
3. **Actions** → **Deploy to GitHub Pages** → **Run workflow**
4. Откройте сайт с `/` в конце: `https://alex512mb.github.io/svg_factory/`

`index.html` в папке `client/` — это нормально для исходников. На опубликованном сайте после сборки он лежит в корне автоматически.

## Настройки API

| Провайдер | Где взять ключ | Модель по умолчанию |
|---|---|---|
| OpenRouter | [openrouter.ai/keys](https://openrouter.ai/keys) | `deepseek/deepseek-v4-flash` |
| DeepSeek | [platform.deepseek.com](https://platform.deepseek.com/api_keys) | `deepseek-chat` |

OpenRouter надёжнее работает из браузера. DeepSeek может быть заблокирован CORS.

## Безопасность

- Не коммитьте `.env` и API-ключи.
- Ключи хранятся только в браузере пользователя.
- При публикации на GitHub Pages секретов в коде нет.

## Стек

- Vite + React + TypeScript
- OpenRouter / DeepSeek Chat Completions (fetch из браузера)
- Style-lock + QC с одним retry
