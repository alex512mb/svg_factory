import { STYLE_LOCK } from "./styleLock";

export type QcResult =
  | { ok: true; svg: string }
  | { ok: false; errors: string[] };

const FORBIDDEN_TAGS = [
  "image",
  "foreignObject",
  "script",
  "iframe",
  "use",
  "filter",
  "feGaussianBlur",
  "linearGradient",
  "radialGradient",
  "pattern",
  "text",
  "tspan",
];

const MAX_ELEMENTS = 80;

function countTags(svg: string): number {
  const matches = svg.match(/<\s*[a-zA-Z][\w:-]*/g);
  return matches?.length ?? 0;
}

function hasForbidden(svg: string): string[] {
  const found: string[] = [];
  for (const tag of FORBIDDEN_TAGS) {
    const re = new RegExp(`<\\s*${tag}\\b`, "i");
    if (re.test(svg)) {
      found.push(tag);
    }
  }
  return found;
}

export function sanitizeSvg(input: string): string {
  let svg = input.trim();
  if (svg.startsWith("```")) {
    svg = svg
      .replace(/^```(?:svg|xml)?\s*/i, "")
      .replace(/\s*```$/, "")
      .trim();
  }

  if (!/<svg[\s>]/i.test(svg)) {
    return svg;
  }

  if (!/viewBox\s*=/i.test(svg)) {
    svg = svg.replace(/<svg\b/i, `<svg viewBox="${STYLE_LOCK.viewBox}"`);
  }

  if (!/xmlns\s*=/i.test(svg)) {
    svg = svg.replace(
      /<svg\b/i,
      `<svg xmlns="http://www.w3.org/2000/svg"`,
    );
  }

  return svg;
}

export function validateSvg(rawSvg: string): QcResult {
  const errors: string[] = [];
  const svg = sanitizeSvg(rawSvg);

  if (!svg) {
    errors.push("SVG пустой.");
    return { ok: false, errors };
  }

  if (!/<svg[\s>]/i.test(svg)) {
    errors.push("Отсутствует корневой элемент <svg>.");
  }

  if (!/<\/svg\s*>/i.test(svg)) {
    errors.push("Отсутствует закрывающий тег </svg>.");
  }

  if (!/viewBox\s*=\s*["']0\s+0\s+128\s+128["']/i.test(svg)) {
    errors.push(`viewBox должен быть "${STYLE_LOCK.viewBox}".`);
  }

  const forbidden = hasForbidden(svg);
  if (forbidden.length) {
    errors.push(
      `Запрещённые элементы: ${forbidden.join(", ")}. Используй только простые примитивы.`,
    );
  }

  if (/url\s*\(/i.test(svg) || /data:image/i.test(svg)) {
    errors.push(
      "Нельзя использовать внешние URL или встроенные растровые изображения.",
    );
  }

  const elementCount = countTags(svg);
  if (elementCount > MAX_ELEMENTS) {
    errors.push(
      `Слишком много элементов (${elementCount}). Упрости до ${MAX_ELEMENTS} или меньше.`,
    );
  }

  if (elementCount < 3) {
    errors.push("Слишком мало геометрии — силуэт не будет читаемым.");
  }

  if (errors.length) {
    return { ok: false, errors };
  }

  return { ok: true, svg };
}
