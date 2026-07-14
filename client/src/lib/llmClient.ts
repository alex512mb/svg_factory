import type { AppSettings } from "./settings";
import { getActiveApiKey, getActiveModel } from "./settings";

export class GenerationCancelledError extends Error {
  constructor() {
    super("Генерация прервана пользователем.");
    this.name = "GenerationCancelledError";
  }
}

type ChatCompletionResponse = {
  choices?: Array<{ message?: { content?: string | null } }>;
};

export function throwIfAborted(signal?: AbortSignal): void {
  if (signal?.aborted) {
    throw new GenerationCancelledError();
  }
}

function resolveEndpoint(settings: AppSettings): {
  url: string;
  model: string;
  headers: Record<string, string>;
} {
  const apiKey = getActiveApiKey(settings);
  if (!apiKey) {
    throw new Error("Укажите API-ключ в настройках.");
  }

  const model = getActiveModel(settings);

  if (settings.provider === "openrouter") {
    return {
      url: "https://openrouter.ai/api/v1/chat/completions",
      model,
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
        "HTTP-Referer": window.location.origin,
        "X-Title": "2D Content Generator",
      },
    };
  }

  const normalizedModel = model.includes("/")
    ? model.split("/").pop() || model
    : model;

  return {
    url: "https://api.deepseek.com/chat/completions",
    model: normalizedModel,
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
    },
  };
}

function mapApiError(status: number, body: string, provider: string): Error {
  let message = body;
  try {
    const parsed = JSON.parse(body) as { error?: { message?: string } };
    message = parsed.error?.message || body;
  } catch {
    /* keep raw */
  }

  if (/Access denied by security policy/i.test(message)) {
    return new Error(
      `${provider}: доступ заблокирован сетью/регионом. Попробуйте VPN или другой провайдер.`,
    );
  }

  if (status === 401) {
    return new Error("Неверный API-ключ. Проверьте настройки.");
  }

  if (status === 402) {
    return new Error("Недостаточно средств на балансе API-провайдера.");
  }

  return new Error(message || `Ошибка API (${status})`);
}

export async function callLlm(
  settings: AppSettings,
  messages: Array<{ role: "system" | "user"; content: string }>,
  options?: {
    signal?: AbortSignal;
    jsonObject?: boolean;
    temperature?: number;
  },
): Promise<string> {
  throwIfAborted(options?.signal);

  const { url, model, headers } = resolveEndpoint(settings);
  const body: Record<string, unknown> = {
    model,
    temperature: options?.temperature ?? 0.35,
    messages,
  };

  if (options?.jsonObject !== false) {
    body.response_format = { type: "json_object" };
  }

  let res: Response;
  try {
    res = await fetch(url, {
      method: "POST",
      headers,
      body: JSON.stringify(body),
      signal: options?.signal,
    });
  } catch (err) {
    if (options?.signal?.aborted) {
      throw new GenerationCancelledError();
    }
    if (err instanceof TypeError) {
      throw new Error(
        "Не удалось связаться с API. Проверьте интернет, VPN или выберите другой провайдер.",
      );
    }
    throw err;
  }

  throwIfAborted(options?.signal);

  const text = await res.text();

  if (!res.ok) {
    throw mapApiError(
      res.status,
      text,
      settings.provider === "openrouter" ? "OpenRouter" : "DeepSeek",
    );
  }

  const data = JSON.parse(text) as ChatCompletionResponse;
  const content = data.choices?.[0]?.message?.content;
  if (!content) {
    throw new Error("Модель вернула пустой ответ.");
  }

  return content;
}

export function extractJson(content: string): unknown {
  const trimmed = content.trim();
  try {
    return JSON.parse(trimmed);
  } catch {
    const match = trimmed.match(/\{[\s\S]*\}/);
    if (!match) {
      throw new Error("Модель вернула ответ без JSON.");
    }
    return JSON.parse(match[0]);
  }
}

export async function callLlmJson(
  settings: AppSettings,
  messages: Array<{ role: "system" | "user"; content: string }>,
  options?: {
    signal?: AbortSignal;
    temperature?: number;
  },
): Promise<unknown> {
  try {
    const content = await callLlm(settings, messages, {
      ...options,
      jsonObject: true,
    });
    return extractJson(content);
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    if (/response_format|json_object|not supported/i.test(message)) {
      const content = await callLlm(settings, messages, {
        ...options,
        jsonObject: false,
      });
      return extractJson(content);
    }
    throw err;
  }
}
