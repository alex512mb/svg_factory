import type { EnrichedPrompt } from "./entityTraits";

export type SemanticReview = {
  approved: boolean;
  issues: string[];
  summary: string;
};

const GREENISH = /#(?:[4-7][0-9a-f]{5}|6b8f71|4a7c59|5c7a5c|6b8f[0-9a-f]{2})/i;
const RED_HEAD = /#(?:9b2226|e[0-9a-f]{5}|f[0-9a-f]{5})/i;

export function heuristicReview(
  enrichment: EnrichedPrompt,
  svg: string,
): string[] {
  const issues: string[] = [];

  if (enrichment.profileId === "zombie") {
    if (!GREENISH.test(svg)) {
      issues.push(
        "Зомби должен иметь зелёно-серую кожу; добавьте оттенки вроде #6b8f71 или #4a7c59.",
      );
    }
    if (RED_HEAD.test(svg)) {
      issues.push(
        "Красная «здоровая» кожа не подходит зомби; замените на зелёно-серые тона.",
      );
    }
  }

  if (
    enrichment.avoid.some((item) => /smile|улыб/i.test(item)) &&
    /path[^>]*d="[^"]*[QqAa][^"]*"/.test(svg)
  ) {
    issues.push(
      "Обнаружена дуга, похожая на улыбку; используйте нейтральное или мрачное выражение.",
    );
  }

  if (enrichment.category === "animal") {
    const legHints =
      (svg.match(/<(?:rect|ellipse|path|line)\b/gi)?.length ?? 0) >= 4;
    if (!legHints && !/leg/i.test(svg)) {
      issues.push(
        "Животное должно читаться как четвероногое/птица; добавьте читаемые ноги или крылья.",
      );
    }
  }

  if (enrichment.category === "prop") {
    if (/<g[^>]*id="(?:head|legs|arms)"/i.test(svg)) {
      issues.push("Объект мира не должен иметь гуманоидные части тела.");
    }
  }

  return issues;
}

export function mergeReviewIssues(
  heuristic: string[],
  semantic: string[],
): string[] {
  return [...new Set([...heuristic, ...semantic].filter(Boolean))];
}

export function isReviewApproved(issues: string[]): boolean {
  return issues.length === 0;
}
