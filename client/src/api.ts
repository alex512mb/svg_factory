import type { AssetCategory } from "./lib/styleLock";
import type { AppSettings } from "./lib/settings";
import { generateAsset as generateAssetCore } from "./lib/generate";
import { validateSvg } from "./lib/validateSvg";

export type GenerateResponse = {
  filename: string;
  category: AssetCategory;
  svg: string;
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

export async function generateAsset(
  settings: AppSettings,
  prompt: string,
): Promise<GenerateResponse> {
  let result = await generateAssetCore(settings, prompt);
  let qc = validateSvg(result.svg);

  if (!qc.ok) {
    result = await generateAssetCore(settings, prompt, qc.errors);
    qc = validateSvg(result.svg);
  }

  if (!qc.ok) {
    throw new Error(
      `Генерация не прошла проверку качества.\n${qc.errors.join("\n")}`,
    );
  }

  return {
    filename: result.filename,
    category: result.category,
    svg: qc.svg,
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
