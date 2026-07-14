import type { AssetCategory } from "./styleLock";

export type EntityProfile = {
  id: string;
  label: string;
  keywords: string[];
  category: AssetCategory;
  filenameSlug: string;
  traits: string[];
  colors: string[];
  avoid: string[];
};

export type EnrichedPrompt = {
  original: string;
  subject: string;
  category: AssetCategory;
  filenameSlug: string;
  profileId: string | null;
  profileLabel: string | null;
  traits: string[];
  colors: string[];
  avoid: string[];
};

const PROFILES: EntityProfile[] = [
  // --- Monsters ---
  {
    id: "zombie",
    label: "Зомби",
    keywords: ["зомби", "zombie", "undead", "нежить"],
    category: "monster",
    filenameSlug: "zombie",
    colors: ["#6b8f71", "#4a7c59", "#5c7a5c", "#6c757d", "#5c4033"],
    traits: [
      "green-gray decaying skin, clearly undead",
      "torn dirty clothes in dull brown or gray",
      "arms forward or hanging limply, unnatural posture",
      "slumped staggered walk pose, slightly hunched",
      "vacant eyes or dark eye sockets — never a friendly smile",
      "humanoid but instantly readable as zombie, not a healthy person",
    ],
    avoid: ["red healthy face", "smile", "clean uniform", "hero pose"],
  },
  {
    id: "skeleton_warrior",
    label: "Скелет-воин",
    keywords: [
      "скелет-воин",
      "skeleton warrior",
      "skeleton_warrior",
      "bone warrior",
    ],
    category: "monster",
    filenameSlug: "skeleton_warrior",
    colors: ["#e9ecef", "#d8d0b8", "#6c757d", "#3d5a80"],
    traits: [
      "white/bone colored skull and ribcage visible",
      "hollow dark eye sockets",
      "simple weapon hint: sword or spear (small, top-down readable)",
      "bony limbs, no flesh",
      "optional tattered cloth or rusted armor pieces",
    ],
    avoid: ["flesh skin", "smile", "full human face"],
  },
  {
    id: "skeleton",
    label: "Скелет",
    keywords: ["скелет", "skeleton", "bones", "кости"],
    category: "monster",
    filenameSlug: "skeleton",
    colors: ["#e9ecef", "#d8d0b8", "#6c757d"],
    traits: [
      "white/bone colored skull head",
      "visible ribcage or spine hint on torso",
      "hollow dark eye sockets",
      "thin bony arms and legs, no flesh",
      "clearly a skeleton, not a person in white clothes",
    ],
    avoid: ["skin", "smile", "muscle", "helmet covering skull shape"],
  },
  {
    id: "slime",
    label: "Слизь",
    keywords: ["слизь", "slime", "ooze", "blob monster", "желе"],
    category: "monster",
    filenameSlug: "slime",
    colors: ["#4a7c59", "#2d6a4f", "#6b8f71", "#3d5a80"],
    traits: [
      "single blob body, no humanoid proportions",
      "wobbly rounded silhouette with drips or puddle base",
      "simple eyes or no eyes inside the blob",
      "semi-transparent look using flat color only (no gradients)",
    ],
    avoid: ["human body", "legs", "arms", "skeleton"],
  },
  {
    id: "demon",
    label: "Демон",
    keywords: ["демон", "demon", "devil", "imp"],
    category: "monster",
    filenameSlug: "demon",
    colors: ["#9b2226", "#5c4033", "#2b2b2b", "#8b6914"],
    traits: [
      "red or dark skin tone",
      "horns on head (simple triangles)",
      "menacing silhouette, hunched or wide stance",
      "tail optional, small and readable",
      "glowing eyes optional as small bright dots",
    ],
    avoid: ["friendly smile", "human worker clothes", "dog shape"],
  },
  {
    id: "mutant",
    label: "Мутант",
    keywords: ["мутант", "mutant", "mutated"],
    category: "monster",
    filenameSlug: "mutant",
    colors: ["#6b8f71", "#9b2226", "#6c757d", "#5c4033"],
    traits: [
      "humanoid but wrong proportions: extra limb, big arm, or hunch",
      "sickly green-purple or gray skin patches",
      "asymmetric body hints, clearly monstrous",
    ],
    avoid: ["normal healthy human", "cute animal"],
  },

  // --- Animals ---
  {
    id: "dog",
    label: "Собака",
    keywords: ["собака", "dog", "puppy", "hound", "пес", "пёс"],
    category: "animal",
    filenameSlug: "dog",
    colors: ["#8b6914", "#5c4033", "#c4a574", "#6c757d"],
    traits: [
      "quadruped body, four legs visible from top-down",
      "snout/muzzle pointing forward",
      "floppy or pointed ears",
      "tail (curved or short)",
      "clear dog silhouette, not a wolf unless requested",
    ],
    avoid: ["two legs", "humanoid", "horns"],
  },
  {
    id: "wolf",
    label: "Волк",
    keywords: ["волк", "wolf"],
    category: "animal",
    filenameSlug: "wolf",
    colors: ["#6c757d", "#5c4033", "#2b2b2b", "#8b6914"],
    traits: [
      "quadruped, lean predator body",
      "long snout, pointed ears",
      "bushy tail",
      "gray or dark fur colors",
      "more angular/aggressive silhouette than a dog",
    ],
    avoid: ["domestic collar", "floppy ears only", "two legs"],
  },
  {
    id: "cow",
    label: "Корова",
    keywords: ["корова", "cow", "bull", "бык"],
    category: "animal",
    filenameSlug: "cow",
    colors: ["#c4a574", "#5c4033", "#e9ecef", "#2b2b2b"],
    traits: [
      "large quadruped body",
      "horns optional (small curves)",
      "wide torso, udder hint optional for cow",
      "short legs, big body mass from top-down",
    ],
    avoid: ["humanoid", "wings"],
  },
  {
    id: "horse",
    label: "Лошадь",
    keywords: ["лошадь", "horse", "pony", "конь"],
    category: "animal",
    filenameSlug: "horse",
    colors: ["#5c4033", "#8b6914", "#2b2b2b", "#c4a574"],
    traits: [
      "quadruped with long neck and head",
      "long legs, elongated body",
      "mane hint on neck",
      "tail behind body",
    ],
    avoid: ["wings", "humanoid", "two legs"],
  },
  {
    id: "bird",
    label: "Птица",
    keywords: ["птица", "bird", "chicken", "курица", "crow", "ворона"],
    category: "animal",
    filenameSlug: "bird",
    colors: ["#5c4033", "#2b2b2b", "#c4a574", "#9b2226"],
    traits: [
      "round body with wings spread or folded (simple shapes)",
      "small head with beak pointing forward",
      "two thin legs or tucked legs",
      "tail feathers hint",
    ],
    avoid: ["four mammal legs", "humanoid"],
  },
  {
    id: "cat",
    label: "Кошка",
    keywords: ["кошка", "cat", "kitten", "кот"],
    category: "animal",
    filenameSlug: "cat",
    colors: ["#8b6914", "#5c4033", "#6c757d", "#c4a574"],
    traits: [
      "quadruped, smaller than dog",
      "pointed ears, short snout",
      "long tail curved upward",
      "compact body from top-down",
    ],
    avoid: ["dog snout length", "humanoid"],
  },

  // --- Characters ---
  {
    id: "guard",
    label: "Охранник",
    keywords: ["охранник", "guard", "security", "warden"],
    category: "character",
    filenameSlug: "guard",
    colors: ["#3d5a80", "#2b2b2b", "#6c757d", "#5c4033"],
    traits: [
      "humanoid worker/colony-sim unit",
      "simple uniform shirt (blue/gray/dark)",
      "cap or helmet hint",
      "optional baton or rifle silhouette (small, not dominant)",
      "upright neutral stance",
    ],
    avoid: ["monster features", "four legs", "green zombie skin"],
  },
  {
    id: "worker",
    label: "Рабочий",
    keywords: ["рабочий", "worker", "laborer", "строитель", "builder"],
    category: "character",
    filenameSlug: "worker",
    colors: ["#c4a574", "#8b6914", "#5c4033", "#6c757d"],
    traits: [
      "humanoid colonist/worker",
      "simple work clothes, earthy tones",
      "optional hard hat or tool belt hint",
      "friendly neutral posture, healthy skin tone",
    ],
    avoid: ["monster", "weapon focus", "animal body"],
  },
  {
    id: "doctor",
    label: "Врач",
    keywords: ["врач", "doctor", "medic", "медик", "nurse"],
    category: "character",
    filenameSlug: "doctor",
    colors: ["#e9ecef", "#6c757d", "#3d5a80", "#c4a574"],
    traits: [
      "humanoid colonist",
      "white coat or light scrubs hint",
      "cross or medkit badge optional (tiny)",
      "calm upright stance",
    ],
    avoid: ["monster", "military armor focus"],
  },
  {
    id: "soldier",
    label: "Солдат",
    keywords: ["солдат", "soldier", "trooper", "воин", "warrior"],
    category: "character",
    filenameSlug: "soldier",
    colors: ["#4a7c59", "#3d5a80", "#5c4033", "#2b2b2b"],
    traits: [
      "humanoid military unit",
      "helmet and simple armor vest",
      "rifle or sword hint (small)",
      "combat-ready stance",
      "healthy human, not undead",
    ],
    avoid: ["skeleton bones", "green decay skin", "unless skeleton requested"],
  },
  {
    id: "settler",
    label: "Поселенец",
    keywords: ["поселенец", "settler", "colonist", "npc", "citizen"],
    category: "character",
    filenameSlug: "settler",
    colors: ["#c4a574", "#8b6914", "#6c757d", "#5c4033"],
    traits: [
      "generic humanoid colonist",
      "simple casual clothes",
      "neutral standing pose",
      "readable human head and body",
    ],
    avoid: ["monster traits", "animal body"],
  },

  // --- Props ---
  {
    id: "barrel",
    label: "Бочка",
    keywords: ["бочка", "barrel", "cask"],
    category: "prop",
    filenameSlug: "barrel",
    colors: ["#8b6914", "#5c4033", "#6c757d"],
    traits: [
      "cylinder/oval body from top-down or slight angle",
      "two horizontal metal bands/hoops",
      "wood brown fill",
      "no face, no limbs",
    ],
    avoid: ["humanoid", "animal", "legs"],
  },
  {
    id: "crate",
    label: "Ящик",
    keywords: ["ящик", "crate", "box", "chest", "сундук"],
    category: "prop",
    filenameSlug: "crate",
    colors: ["#8b6914", "#5c4033", "#6c757d"],
    traits: [
      "square wooden box shape",
      "plank lines or cross braces hint",
      "optionally metal corners",
      "static object, no limbs",
    ],
    avoid: ["humanoid", "face"],
  },
  {
    id: "table",
    label: "Стол",
    keywords: ["стол", "table", "desk"],
    category: "prop",
    filenameSlug: "table",
    colors: ["#8b6914", "#5c4033", "#6c757d"],
    traits: [
      "flat rectangular tabletop",
      "four short legs visible from top-down angle",
      "wood furniture object",
    ],
    avoid: ["humanoid", "animal"],
  },
  {
    id: "bed",
    label: "Кровать",
    keywords: ["кровать", "bed"],
    category: "prop",
    filenameSlug: "bed",
    colors: ["#8b6914", "#e9ecef", "#6c757d", "#3d5a80"],
    traits: [
      "rectangular mattress shape",
      "pillow at one end",
      "frame/legs hint",
      "furniture prop, top-down readable",
    ],
    avoid: ["humanoid standing figure"],
  },
  {
    id: "campfire",
    label: "Костёр",
    keywords: ["костёр", "костер", "campfire", "fire pit", "fire"],
    category: "prop",
    filenameSlug: "campfire",
    colors: ["#9b2226", "#f4a261", "#8b6914", "#5c4033"],
    traits: [
      "circle of stones or logs",
      "orange/red/yellow flame shapes in center",
      "no humanoid body",
      "small world prop scale",
    ],
    avoid: ["character body", "full tree"],
  },
  {
    id: "tree",
    label: "Дерево",
    keywords: ["дерево", "tree", "pine", "елка", "ёлка"],
    category: "prop",
    filenameSlug: "tree",
    colors: ["#4a7c59", "#2d6a4f", "#5c4033", "#8b6914"],
    traits: [
      "round or triangle canopy (green)",
      "short brown trunk at center/bottom",
      "top-down: circular foliage blob with trunk dot",
      "plant prop, not a creature",
    ],
    avoid: ["face", "legs", "humanoid"],
  },
  {
    id: "rock",
    label: "Камень",
    keywords: ["камень", "rock", "boulder", "stone"],
    category: "prop",
    filenameSlug: "rock",
    colors: ["#6c757d", "#5c4033", "#2b2b2b"],
    traits: [
      "irregular gray oval/ polygon blob",
      "no limbs, no face",
      "small environment prop",
    ],
    avoid: ["humanoid", "wood planks"],
  },
];

const CATEGORY_FALLBACKS: Record<
  AssetCategory,
  Pick<EntityProfile, "traits" | "colors" | "avoid">
> = {
  monster: {
    colors: ["#6b8f71", "#6c757d", "#9b2226", "#5c4033"],
    traits: [
      "clearly monstrous silhouette, not a normal human or animal",
      "include 2-3 iconic traits that match the request subject",
      "menacing or unnatural posture",
    ],
    avoid: ["friendly smile", "clean modern clothes", "cute pet look"],
  },
  animal: {
    colors: ["#8b6914", "#5c4033", "#6c757d", "#c4a574"],
    traits: [
      "correct animal anatomy for the species (quadruped, wings, etc.)",
      "species-specific head shape and tail",
      "instantly recognizable animal silhouette",
    ],
    avoid: ["humanoid two-leg stance", "clothes", "weapons"],
  },
  character: {
    colors: ["#c4a574", "#3d5a80", "#6c757d", "#5c4033"],
    traits: [
      "humanoid colonist/worker proportions",
      "simple clothing matching the role",
      "upright readable pose",
    ],
    avoid: ["monster skin", "animal body", "excessive detail"],
  },
  prop: {
    colors: ["#8b6914", "#5c4033", "#6c757d", "#4a7c59"],
    traits: [
      "static object silhouette, no face or limbs",
      "function-readable shape (container, furniture, resource)",
      "appropriate scale for colony-sim world prop",
    ],
    avoid: ["humanoid", "animal features", "character face"],
  },
};

const STYLE_LOCK_CATEGORIES: AssetCategory[] = [
  "character",
  "animal",
  "monster",
  "prop",
];

const CATEGORY_KEYWORDS: Record<AssetCategory, string[]> = {
  monster: [
    "монстр",
    "monster",
    "enemy",
    "враг",
    "undead",
    "нежить",
    "orc",
    "орк",
    "goblin",
    "гоблин",
    "ghost",
    "призрак",
  ],
  animal: [
    "животное",
    "animal",
    "beast",
    "зверь",
    "pet",
    "питомец",
    "creature",
  ],
  character: [
    "человек",
    "human",
    "person",
    "character",
    "персонаж",
    "npc",
    "hero",
    "герой",
  ],
  prop: [
    "объект",
    "prop",
    "item",
    "предмет",
    "мебель",
    "furniture",
    "resource",
    "ресурс",
    "decor",
    "декор",
  ],
};

function normalize(text: string): string {
  return text
    .toLowerCase()
    .replace(/[_-]+/g, " ")
    .replace(/[^\p{L}\p{N}\s]/gu, " ")
    .replace(/\s+/g, " ")
    .trim();
}

function scoreProfile(profile: EntityProfile, normalized: string): number {
  let best = 0;
  for (const keyword of profile.keywords) {
    const key = normalize(keyword);
    if (!key) continue;
    if (normalized === key) {
      best = Math.max(best, 100 + key.length);
    } else if (normalized.includes(key)) {
      best = Math.max(best, 50 + key.length);
    } else {
      const words = normalized.split(" ");
      if (words.some((w) => w === key || key.includes(w) || w.includes(key))) {
        best = Math.max(best, 30 + key.length);
      }
    }
  }
  return best;
}

function inferCategory(normalized: string): AssetCategory {
  let best: AssetCategory = "prop";
  let bestScore = 0;
  for (const category of STYLE_LOCK_CATEGORIES) {
    for (const keyword of CATEGORY_KEYWORDS[category]) {
      const key = normalize(keyword);
      if (normalized.includes(key)) {
        const score = key.length;
        if (score > bestScore) {
          bestScore = score;
          best = category;
        }
      }
    }
  }
  return best;
}

function slugify(text: string): string {
  const map: Record<string, string> = {
    а: "a",
    б: "b",
    в: "v",
    г: "g",
    д: "d",
    е: "e",
    ё: "e",
    ж: "zh",
    з: "z",
    и: "i",
    й: "y",
    к: "k",
    л: "l",
    м: "m",
    н: "n",
    о: "o",
    п: "p",
    р: "r",
    с: "s",
    т: "t",
    у: "u",
    ф: "f",
    х: "h",
    ц: "ts",
    ч: "ch",
    ш: "sh",
    щ: "sch",
    ы: "y",
    э: "e",
    ю: "yu",
    я: "ya",
  };
  return normalize(text)
    .split(" ")
    .map((word) =>
      word
        .split("")
        .map((ch) => map[ch] ?? ch)
        .join(""),
    )
    .join("_")
    .replace(/[^a-z0-9_]+/g, "")
    .replace(/_+/g, "_")
    .replace(/^_|_$/g, "")
    .slice(0, 40);
}

export function matchEntityProfile(userPrompt: string): EntityProfile | null {
  const normalized = normalize(userPrompt);
  if (!normalized) return null;

  let best: EntityProfile | null = null;
  let bestScore = 0;

  for (const profile of PROFILES) {
    const score = scoreProfile(profile, normalized);
    if (score > bestScore) {
      bestScore = score;
      best = profile;
    }
  }

  return bestScore >= 30 ? best : null;
}

export function enrichPrompt(userPrompt: string): EnrichedPrompt {
  const original = userPrompt.trim();
  const normalized = normalize(original);
  const matched = matchEntityProfile(original);

  if (matched) {
    return {
      original,
      subject: original,
      category: matched.category,
      filenameSlug: matched.filenameSlug,
      profileId: matched.id,
      profileLabel: matched.label,
      traits: matched.traits,
      colors: matched.colors,
      avoid: matched.avoid,
    };
  }

  const category = inferCategory(normalized);
  const fallback = CATEGORY_FALLBACKS[category];

  return {
    original,
    subject: original,
    category,
    filenameSlug: slugify(original) || "asset",
    profileId: null,
    profileLabel: null,
    traits: [
      ...fallback.traits,
      `subject must clearly depict: ${original}`,
    ],
    colors: fallback.colors,
    avoid: fallback.avoid,
  };
}

export function getProfileLabel(profileId: string | null): string | null {
  if (!profileId) return null;
  return PROFILES.find((p) => p.id === profileId)?.label ?? null;
}
