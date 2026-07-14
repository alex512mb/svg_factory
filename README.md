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
2. **Settings → Pages → Build and deployment → Source: GitHub Actions**.
3. Запушьте в ветку `main` или `master` — workflow `.github/workflows/deploy-pages.yml` соберёт и опубликует сайт.

Сайт будет доступен по адресу:

```
https://<username>.github.io/<repo-name>/
```

`base: './'` в Vite уже настроен — путь не зависит от имени репозитория.

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
