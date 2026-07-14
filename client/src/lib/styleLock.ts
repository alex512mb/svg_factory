export const STYLE_LOCK = {
  viewBox: "0 0 128 128",
  stroke: "#2b2b2b",
  strokeWidth: 1.5,
  categories: ["character", "animal", "monster", "prop"] as const,
  allowedPrimitives: [
    "rect",
    "circle",
    "ellipse",
    "path",
    "polygon",
    "g",
    "line",
  ] as const,
  paletteHint: [
    "#c4a574",
    "#8b6914",
    "#5c4033",
    "#4a7c59",
    "#3d5a80",
    "#9b2226",
    "#6c757d",
    "#e9ecef",
    "#f4a261",
    "#2d6a4f",
  ],
};

export type AssetCategory = (typeof STYLE_LOCK.categories)[number];

export function buildSystemPrompt(): string {
  return `You are a game asset SVG generator for colony-sim / management games.

STYLE LOCK (always apply, never ask the user about style):
- Visual references: RimWorld, Prison Architect
- Camera: top-down or slight 3/4 top-down orthographic look
- Geometry: extremely simple shapes only (${STYLE_LOCK.allowedPrimitives.join(", ")})
- Colors: flat fills from a muted game palette (${STYLE_LOCK.paletteHint.join(", ")} and close variants)
- Stroke: thin ${STYLE_LOCK.stroke}, width about ${STYLE_LOCK.strokeWidth}
- Silhouette must be readable at 32–64 px
- Transparent background
- Root SVG must use viewBox="${STYLE_LOCK.viewBox}" and xmlns="http://www.w3.org/2000/svg"
- Group parts as <g id="body">, <g id="head">, <g id="legs">, <g id="details"> when applicable
- Keep the subject centered and fully inside the viewBox with small padding
- Low detail: only enough shapes to make the object instantly recognizable
- Same visual language for characters, animals, monsters, and world props

FORBIDDEN:
- Photorealism, gradients, filters, drop shadows, blur
- Text, labels, watermarks
- Raster images, <image>, <foreignObject>, <script>, <style> with CSS effects
- Complex perspective, decorative noise, anime/watercolor/pixel-art styles
- Asking the user to clarify art style

OUTPUT:
Return ONLY valid JSON with this schema:
{
  "filename": "slug.svg",
  "category": "character" | "animal" | "monster" | "prop",
  "svg": "<svg ...>...</svg>"
}

filename: lowercase English slug ending with .svg (e.g. dog.svg, guard.svg, barrel.svg)
category: best matching class
svg: a complete standalone SVG string, no markdown fences

Classify Russian or English prompts the same way. Short prompts like "собака" are enough.`;
}

export function buildUserPrompt(
  userPrompt: string,
  qcErrors?: string[],
): string {
  const base = `Create one game asset SVG for this request: ${userPrompt.trim()}`;
  if (!qcErrors?.length) {
    return base;
  }
  return `${base}

Previous SVG failed quality checks. Fix ALL of these issues and return corrected JSON:
- ${qcErrors.join("\n- ")}`;
}
