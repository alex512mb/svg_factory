import type { EnrichedPrompt } from "./entityTraits";
import { callLlmJson, throwIfAborted } from "./llmClient";
import {
  heuristicReview,
  mergeReviewIssues,
  type SemanticReview,
} from "./heuristicReview";
import type { AppSettings } from "./settings";

const MAX_SVG_CHARS = 7000;

function buildReviewSystemPrompt(): string {
  return `You are a strict QA reviewer for simple colony-sim SVG game assets.

Judge whether the SVG clearly matches the requested subject and mandatory visual traits.
Be practical: simple geometry is OK, but obvious mistakes must fail review.

Return ONLY JSON:
{
  "approved": boolean,
  "issues": ["short actionable issue", ...],
  "summary": "one sentence in Russian"
}

Approve ONLY if the subject is instantly recognizable and no mandatory trait is clearly violated.
If unsure, fail with specific fixes — do not approve generic placeholder shapes.`;
}

function buildReviewUserPrompt(
  enrichment: EnrichedPrompt,
  svg: string,
): string {
  const traits = enrichment.traits.map((t) => `- ${t}`).join("\n");
  const avoid = enrichment.avoid.map((a) => `- ${a}`).join("\n");
  const clippedSvg =
    svg.length > MAX_SVG_CHARS
      ? `${svg.slice(0, MAX_SVG_CHARS)}\n<!-- truncated -->`
      : svg;

  return `Review this generated SVG asset.

REQUESTED SUBJECT: ${enrichment.subject}
EXPECTED CATEGORY: ${enrichment.category}
ARCHETYPE: ${enrichment.profileLabel ?? "generic"}

MANDATORY TRAITS:
${traits}

PREFERRED COLORS: ${enrichment.colors.join(", ")}

AVOID:
${avoid}

SVG TO REVIEW:
${clippedSvg}

List only clear, fixable problems. If approved, issues must be an empty array.`;
}

function normalizeReview(raw: unknown): SemanticReview {
  if (!raw || typeof raw !== "object") {
    return {
      approved: false,
      issues: ["Не удалось разобрать ответ проверки."],
      summary: "Ошибка проверки",
    };
  }

  const obj = raw as Record<string, unknown>;
  const issues = Array.isArray(obj.issues)
    ? obj.issues.map((item) => String(item).trim()).filter(Boolean)
    : [];
  const approved = Boolean(obj.approved) && issues.length === 0;
  const summary = String(obj.summary ?? "").trim() || "Проверка завершена";

  return { approved, issues, summary };
}

export async function reviewAssetSvg(
  settings: AppSettings,
  enrichment: EnrichedPrompt,
  svg: string,
  signal?: AbortSignal,
): Promise<SemanticReview & { allIssues: string[] }> {
  throwIfAborted(signal);

  const heuristicIssues = heuristicReview(enrichment, svg);

  const raw = await callLlmJson(
    settings,
    [
      { role: "system", content: buildReviewSystemPrompt() },
      { role: "user", content: buildReviewUserPrompt(enrichment, svg) },
    ],
    { signal, temperature: 0.2 },
  );

  throwIfAborted(signal);

  const semantic = normalizeReview(raw);
  const allIssues = mergeReviewIssues(heuristicIssues, semantic.issues);
  const approved = allIssues.length === 0;

  return {
    approved,
    issues: allIssues,
    summary: approved
      ? semantic.summary || "Результат принят."
      : semantic.summary || "Нужны исправления.",
    allIssues,
  };
}
