import {
  buildSystemPrompt,
  buildUserPrompt,
  enrichUserRequest,
  type AssetCategory,
} from "./styleLock";
import type { AppSettings } from "./settings";
import { getActiveApiKey, getActiveModel } from "./settings";

export type GenerateResult = {
  filename: string;
  category: AssetCategory;
  svg: string;
};

type ChatCompletionResponse = {
  choices?: Array<{ message?: { content?: string | null } }>;
  error?: { message?: string };
};

function extractJson(content: string): unknown {
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

function normalizeResult(raw: unknown): GenerateResult {
  if (!raw || typeof raw !== "object") {
    throw new Error("Некорректный формат ответа модели.");
  }
  const obj = raw as Record<string, unknown>;
  const filename = String(obj.filename ?? "asset.svg").trim();
  const category = String(obj.category ?? "prop").trim() as AssetCategory;
  let svg = String(obj.svg ?? "").trim();

  if (svg.startsWith("```")) {
    svg = svg.replace(/^```(?:svg|xml)?\s*/i, "").replace(/\s*```$/, "");
  }

  const allowed: AssetCategory[] = ["character", "animal", "monster", "prop"];
  if (!allowed.includes(category)) {
    throw new Error(`Неизвестная категория: ${category}`);
  }

  return {
    filename: filename.toLowerCase().endsWith(".svg")
      ? filename.toLowerCase().replace(/[^a-z0-9._-]/g, "_")
      : `${filename.toLowerCase().replace(/[^a-z0-9._-]/g, "_")}.svg`,
    category,
    svg,
  };
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
      `${provider}: доступ заблокирован сетью/регионом. Попробуйте VPN или другой провайдер в настройках.`,
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

async function callChatCompletion(
  settings: AppSettings,
  userPrompt: string,
  qcErrors?: string[],
  useJsonObject = true,
): Promise<string> {
  const { url, model, headers } = resolveEndpoint(settings);
  const enrichment = enrichUserRequest(userPrompt);

  const body: Record<string, unknown> = {
    model,
    temperature: 0.35,
    messages: [
      { role: "system", content: buildSystemPrompt() },
      {
        role: "user",
        content: buildUserPrompt(userPrompt, enrichment, qcErrors),
      },
    ],
  };

  if (useJsonObject) {
    body.response_format = { type: "json_object" };
  }

  const res = await fetch(url, {
    method: "POST",
    headers,
    body: JSON.stringify(body),
  });

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

export async function generateAsset(
  settings: AppSettings,
  userPrompt: string,
  qcErrors?: string[],
): Promise<GenerateResult> {
  let content: string;

  try {
    try {
      content = await callChatCompletion(
        settings,
        userPrompt,
        qcErrors,
        true,
      );
    } catch (err) {
      const message = err instanceof Error ? err.message : String(err);
      if (/response_format|json_object|not supported/i.test(message)) {
        content = await callChatCompletion(
          settings,
          userPrompt,
          qcErrors,
          false,
        );
      } else {
        throw err;
      }
    }
  } catch (err) {
    if (err instanceof TypeError && /fetch/i.test(err.message)) {
      throw new Error(
        "Не удалось связаться с API. Проверьте интернет, VPN или выберите другой провайдер.",
      );
    }
    throw err;
  }

  return normalizeResult(extractJson(content));
}
