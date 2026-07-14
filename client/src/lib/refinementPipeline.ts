import type { AssetCategory } from "./styleLock";
import { enrichUserRequest } from "./styleLock";
import { generateAssetOnce } from "./generate";
import { GenerationCancelledError, throwIfAborted } from "./llmClient";
import { reviewAssetSvg } from "./semanticReview";
import type { AppSettings } from "./settings";
import { validateSvg } from "./validateSvg";

export type StepPhase =
  | "generating"
  | "reviewing"
  | "approved"
  | "needs_fix"
  | "cancelled";

export type GenerationStep = {
  id: number;
  phase: StepPhase;
  label: string;
  svg: string;
  filename: string;
  category: AssetCategory;
  reviewSummary?: string;
  reviewIssues?: string[];
};

export type GenerationSession = {
  prompt: string;
  profileLabel: string | null;
  steps: GenerationStep[];
  selectedStepId: number;
  finished: boolean;
  cancelled: boolean;
  statusText: string;
};

export type RefinementCallbacks = {
  onUpdate: (session: GenerationSession) => void;
  signal?: AbortSignal;
};

const MAX_REFINEMENT_ROUNDS = 3;

function buildFilename(
  resultFilename: string,
  enrichmentSlug: string,
): string {
  if (resultFilename !== "asset.svg" && resultFilename.length > 0) {
    return resultFilename;
  }
  return `${enrichmentSlug}.svg`;
}

export async function generateWithRefinement(
  settings: AppSettings,
  prompt: string,
  callbacks: RefinementCallbacks,
): Promise<GenerationSession> {
  const trimmed = prompt.trim();
  const enrichment = enrichUserRequest(trimmed);

  let steps: GenerationStep[] = [];
  let selectedStepId = 0;
  let finished = false;
  let statusText = "Подготовка…";

  const publish = (patch: Partial<GenerationSession> = {}) => {
    if (patch.steps) steps = patch.steps;
    if (patch.selectedStepId !== undefined) selectedStepId = patch.selectedStepId;
    if (patch.finished !== undefined) finished = patch.finished;
    if (patch.statusText !== undefined) statusText = patch.statusText;

    callbacks.onUpdate({
      prompt: trimmed,
      profileLabel: enrichment.profileLabel,
      steps,
      selectedStepId,
      finished,
      cancelled: false,
      statusText,
      ...patch,
    });
  };

  let previousSvg: string | undefined;
  let pendingIssues: string[] = [];
  let pendingQcErrors: string[] = [];
  let lastGoodStepId = 0;

  for (let round = 0; round <= MAX_REFINEMENT_ROUNDS; round += 1) {
    throwIfAborted(callbacks.signal);

    const stepId = round + 1;
    publish({
      statusText:
        round === 0
          ? `Шаг ${stepId}: первая генерация…`
          : `Шаг ${stepId}: улучшение…`,
    });

    let result = await generateAssetOnce(settings, trimmed, enrichment, {
      qcErrors: pendingQcErrors.length ? pendingQcErrors : undefined,
      reviewIssues: pendingIssues.length ? pendingIssues : undefined,
      previousSvg,
      signal: callbacks.signal,
    });

    const qc = validateSvg(result.svg);
    if (!qc.ok) {
      pendingQcErrors = qc.errors;
      pendingIssues = [];
      previousSvg = result.svg;

      const failStep: GenerationStep = {
        id: stepId,
        phase: "needs_fix",
        label:
          round === 0
            ? `Шаг ${stepId}: генерация (тех. ошибки)`
            : `Шаг ${stepId}: улучшение (тех. ошибки)`,
        svg: result.svg,
        filename: buildFilename(result.filename, enrichment.filenameSlug),
        category: result.category || enrichment.category,
        reviewSummary: "SVG не прошёл техническую проверку.",
        reviewIssues: qc.errors,
      };

      steps = [...steps, failStep];
      lastGoodStepId = stepId;
      publish({
        steps,
        selectedStepId: stepId,
        statusText: `Шаг ${stepId}: технические ошибки, пробуем исправить…`,
      });

      if (round >= MAX_REFINEMENT_ROUNDS) {
        break;
      }
      continue;
    }

    pendingQcErrors = [];
    const cleanSvg = qc.svg;
    result = { ...result, svg: cleanSvg };
    previousSvg = cleanSvg;

    publish({
      statusText: `Шаг ${stepId}: проверка результата…`,
    });

    throwIfAborted(callbacks.signal);

    const review = await reviewAssetSvg(
      settings,
      enrichment,
      cleanSvg,
      callbacks.signal,
    );

    const reviewedStep: GenerationStep = {
      id: stepId,
      phase: review.approved ? "approved" : "needs_fix",
      label: review.approved
        ? round === 0
          ? `Шаг ${stepId}: принято`
          : `Шаг ${stepId}: улучшение принято`
        : round === 0
          ? `Шаг ${stepId}: генерация`
          : `Шаг ${stepId}: улучшение`,
      svg: cleanSvg,
      filename: buildFilename(result.filename, enrichment.filenameSlug),
      category: result.category || enrichment.category,
      reviewSummary: review.summary,
      reviewIssues: review.allIssues,
    };

    steps = [...steps, reviewedStep];
    lastGoodStepId = stepId;

    publish({
      steps,
      selectedStepId: stepId,
      statusText: review.approved
        ? `Шаг ${stepId}: результат принят`
        : `Шаг ${stepId}: найдены проблемы, улучшаем…`,
    });

    if (review.approved) {
      publish({
        finished: true,
        selectedStepId: stepId,
        statusText: `Готово за ${stepId} шаг(ов).`,
      });
      return {
        prompt: trimmed,
        profileLabel: enrichment.profileLabel,
        steps,
        selectedStepId: stepId,
        finished: true,
        cancelled: false,
        statusText: `Готово за ${stepId} шаг(ов).`,
      };
    }

    pendingIssues = review.allIssues;

    if (round >= MAX_REFINEMENT_ROUNDS) {
      break;
    }
  }

  const finalStatus =
    "Достигнут лимит улучшений — показан лучший доступный шаг.";

  publish({
    finished: true,
    selectedStepId: lastGoodStepId || selectedStepId,
    statusText: finalStatus,
  });

  return {
    prompt: trimmed,
    profileLabel: enrichment.profileLabel,
    steps,
    selectedStepId: lastGoodStepId || selectedStepId,
    finished: true,
    cancelled: false,
    statusText: finalStatus,
  };
}

export { GenerationCancelledError };
