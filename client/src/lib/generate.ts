import {
  buildSystemPrompt,
  buildUserPrompt,
  enrichUserRequest,
  type AssetCategory,
} from "./styleLock";
import type { EnrichedPrompt } from "./entityTraits";
import { callLlmJson } from "./llmClient";
import type { AppSettings } from "./settings";

export type GenerateResult = {
  filename: string;
  category: AssetCategory;
  svg: string;
};

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

export async function generateAssetOnce(
  settings: AppSettings,
  userPrompt: string,
  enrichment: EnrichedPrompt,
  options?: {
    qcErrors?: string[];
    previousSvg?: string;
    reviewIssues?: string[];
    signal?: AbortSignal;
  },
): Promise<GenerateResult> {
  const raw = await callLlmJson(
    settings,
    [
      { role: "system", content: buildSystemPrompt() },
      {
        role: "user",
        content: buildUserPrompt(
          userPrompt,
          enrichment,
          options?.qcErrors,
          options?.previousSvg,
          options?.reviewIssues,
        ),
      },
    ],
    { signal: options?.signal, temperature: 0.35 },
  );

  return normalizeResult(raw);
}

export function resolveEnrichment(userPrompt: string): EnrichedPrompt {
  return enrichUserRequest(userPrompt);
}
