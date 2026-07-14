import type { AssetCategory } from "./lib/styleLock";
import type { AppSettings } from "./lib/settings";
import {
  generateWithRefinement,
  GenerationCancelledError,
  type GenerationSession,
  type GenerationStep,
  type RefinementCallbacks,
} from "./lib/refinementPipeline";

export { GenerationCancelledError };
export type { GenerationSession, GenerationStep };

export type GenerateResponse = {
  filename: string;
  category: AssetCategory;
  svg: string;
  profileLabel: string | null;
  session: GenerationSession;
};

const CATEGORY_LABELS: Record<AssetCategory, string> = {
  character: "Персонаж",
  animal: "Животное",
  monster: "Монстр",
  prop: "Объект мира",
};

export function categoryLabel(category: AssetCategory): string {
  return CATEGORY_LABELS[category] ?? category;
}

export function getSelectedStep(session: GenerationSession): GenerationStep | null {
  return (
    session.steps.find((step) => step.id === session.selectedStepId) ??
    session.steps[session.steps.length - 1] ??
    null
  );
}

export async function generateAsset(
  settings: AppSettings,
  prompt: string,
  callbacks: RefinementCallbacks,
): Promise<GenerateResponse> {
  const session = await generateWithRefinement(settings, prompt, callbacks);
  const selected = getSelectedStep(session);

  if (!selected) {
    throw new Error("Генерация не дала результата.");
  }

  return {
    filename: selected.filename,
    category: selected.category,
    svg: selected.svg,
    profileLabel: session.profileLabel,
    session,
  };
}

export function downloadSvg(filename: string, svg: string): void {
  const blob = new Blob([svg], { type: "image/svg+xml;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
}
