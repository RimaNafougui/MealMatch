export interface RawIngredient {
  name: string;
  quantity: number;
  unit: string;
}

export interface AisleInfo {
  aisle: string;
  category: string;
  emoji: string;
  sortOrder: number;
}

export interface OrganizedItem {
  name: string;
  quantity: number;
  unit: string;
  price: number | null;
  checked: boolean;
  aisle: string;
  category: string;
  emoji: string;
  sortOrder: number;
}

// ─── Unit normalisation ───────────────────────────────────────────────────────
// All plural forms collapse to singular so that "11 gousses" + "1 gousse" share
// the same dedup key.  Size/serving descriptors map to "" (treated as unitless).

const UNIT_MAP: Record<string, string> = {
  // tablespoon
  tablespoon: "c. à s.",
  tablespoons: "c. à s.",
  tbsp: "c. à s.",
  "cuillère à soupe": "c. à s.",
  "cuillères à soupe": "c. à s.",
  "c. à soupe": "c. à s.",
  "c.à.s.": "c. à s.",
  "c. à s.": "c. à s.",
  // teaspoon
  teaspoon: "c. à t.",
  teaspoons: "c. à t.",
  tsp: "c. à t.",
  "cuillère à thé": "c. à t.",
  "cuillères à thé": "c. à t.",
  "c. à thé": "c. à t.",
  "c.à.t.": "c. à t.",
  "c. à t.": "c. à t.",
  // cup
  cup: "tasse",
  cups: "tasse",
  tasse: "tasse",
  tasses: "tasse",
  // gram / kilogram
  gram: "g",
  grams: "g",
  gramme: "g",
  grammes: "g",
  g: "g",
  kilogram: "kg",
  kilograms: "kg",
  kilogramme: "kg",
  kilogrammes: "kg",
  kg: "kg",
  // milliliter / liter
  milliliter: "ml",
  milliliters: "ml",
  millilitre: "ml",
  millilitres: "ml",
  ml: "ml",
  liter: "L",
  liters: "L",
  litre: "L",
  litres: "L",
  // ounce / pound
  ounce: "oz",
  ounces: "oz",
  oz: "oz",
  pound: "lb",
  pounds: "lb",
  lb: "lb",
  lbs: "lb",
  // piece — all plural forms → singular
  piece: "pièce",
  pieces: "pièce",
  "pièce": "pièce",
  "pièces": "pièce",
  pce: "pièce",
  // pinch — all → singular
  pinch: "pincée",
  pinches: "pincée",
  "pincée": "pincée",
  "pincées": "pincée",
  // slice — all → singular
  slice: "tranche",
  slices: "tranche",
  tranche: "tranche",
  tranches: "tranche",
  // bunch — all → singular
  bunch: "botte",
  bunches: "botte",
  botte: "botte",
  bottes: "botte",
  // can — all → singular
  can: "boîte",
  cans: "boîte",
  "boîte": "boîte",
  "boîtes": "boîte",
  // clove — all → singular
  clove: "gousse",
  cloves: "gousse",
  gousse: "gousse",
  gousses: "gousse",
  // size / serving descriptors → treated as unitless
  small: "",
  medium: "",
  large: "",
  "extra large": "",
  xl: "",
  serving: "",
  servings: "",
  portion: "",
  portions: "",
};

export function normalizeUnit(unit: string): string {
  const lower = unit.toLowerCase().trim();
  if (lower === "") return "";
  return lower in UNIT_MAP ? UNIT_MAP[lower] : unit.trim();
}

// ─── Ingredient name normalisation ───────────────────────────────────────────
// Maps French variants, common English plurals, and known synonyms to a single
// canonical lowercase form used only for dedup keying.

const INGREDIENT_SYNONYMS: Record<string, string> = {
  // French → canonical
  courgette: "zucchini",
  courgettes: "zucchini",
  poivron: "bell pepper",
  poivrons: "bell pepper",
  "poivron rouge": "red bell pepper",
  "poivron vert": "green bell pepper",
  "épinard": "spinach",
  "épinards": "spinach",
  tomate: "tomato",
  tomates: "tomato",
  oignon: "onion",
  oignons: "onion",
  carotte: "carrot",
  carottes: "carrot",
  champignon: "mushroom",
  champignons: "mushroom",
  aubergine: "eggplant",
  aubergines: "eggplant",
  "haricot vert": "green bean",
  "haricots verts": "green bean",
  "pomme de terre": "potato",
  "pommes de terre": "potato",
  ail: "garlic",
  "citron vert": "lime",
  poire: "pear",
  poires: "pear",
  fraise: "strawberry",
  fraises: "strawberry",
  // English plurals → singular
  tomatoes: "tomato",
  potatoes: "potato",
  "bell peppers": "bell pepper",
  "red bell peppers": "red bell pepper",
  "green bell peppers": "green bell pepper",
  mushrooms: "mushroom",
  carrots: "carrot",
  onions: "onion",
  bananas: "banana",
  apples: "apple",
  lemons: "lemon",
  oranges: "orange",
  avocados: "avocado",
  "green onions": "green onion",
  "spring onions": "green onion",
  "cherry tomatoes": "cherry tomato",
  eggs: "egg",
  almonds: "almond",
  walnuts: "walnut",
  raisins: "raisin",
  strawberries: "strawberry",
  raspberries: "raspberry",
  blueberries: "blueberry",
  // Common long-form / alternate
  "asparagus spears": "asparagus",
  "grape tomatoes": "cherry tomato",
};

/** Returns a canonical lowercase key for deduplication (never used for display). */
function normalizeIngredientName(name: string): string {
  const lower = name.toLowerCase().trim();

  // 1. Explicit synonym / alias map
  if (lower in INGREDIENT_SYNONYMS) return INGREDIENT_SYNONYMS[lower];

  // 2. Strip common English plural suffixes
  //    "berries" → "berry"
  if (lower.endsWith("rries") && lower.length > 6) {
    return lower.slice(0, -3) + "y";
  }
  //    "ies" → "y"  (e.g. strawberries handled above; others like "fries" → "fry")
  if (lower.endsWith("ies") && lower.length > 5) {
    return lower.slice(0, -3) + "y";
  }
  //    "oes" → strip "es"  (tomatoes → tomato, potatoes → potato)
  if (lower.endsWith("oes") && lower.length > 5) {
    return lower.slice(0, -2);
  }
  //    plain "s" → strip, with exclusions for words that naturally end in s
  if (
    lower.endsWith("s") &&
    lower.length > 5 &&
    !lower.endsWith("ss") &&
    !lower.endsWith("us") && // asparagus, hummus
    !lower.endsWith("is") && // artichokis, etc.
    !lower.endsWith("as") &&
    !lower.endsWith("es") && // already handled or intentional (e.g. "spices")
    !lower.endsWith("cs") &&
    !lower.endsWith("xs")
  ) {
    return lower.slice(0, -1);
  }

  return lower;
}

// ─── Aisle classification ────────────────────────────────────────────────────

const AISLE_RULES: Array<{
  keywords: string[];
  aisle: string;
  category: string;
  emoji: string;
  sortOrder: number;
}> = [
  {
    keywords: [
      // FR
      "pomme", "poire", "banane", "orange", "citron", "raisin", "fraise", "framboise",
      "mangue", "ananas", "melon", "pastèque", "cerise", "pêche", "abricot", "kiwi",
      "tomate", "carotte", "oignon", "ail", "poireau", "poivron", "courgette", "aubergine",
      "concombre", "salade", "laitue", "épinard", "brocoli", "chou-fleur", "céleri",
      "asperge", "haricot vert", "petit pois", "champignon", "pomme de terre", "patate",
      "courge", "citrouille", "betterave", "navet", "radis", "fenouil", "artichaut",
      "avocat", "maïs", "coriandre", "persil", "menthe", "basilic", "thym", "romarin",
      // EN
      "apple", "pear", "banana", "orange", "lemon", "grape", "strawberry", "raspberry",
      "mango", "pineapple", "melon", "watermelon", "cherry", "peach", "apricot",
      "tomato", "carrot", "onion", "garlic", "leek", "bell pepper", "zucchini", "eggplant",
      "cucumber", "lettuce", "spinach", "broccoli", "cauliflower", "celery", "asparagus",
      "green bean", "pea", "mushroom", "potato", "squash", "pumpkin", "beet", "turnip",
      "radish", "fennel", "artichoke", "avocado", "corn", "cilantro", "parsley", "mint",
      "basil", "thyme", "rosemary",
    ],
    aisle: "Fruits & Légumes",
    category: "produce",
    emoji: "🥦",
    sortOrder: 1,
  },
  {
    keywords: [
      // FR
      "poulet", "bœuf", "veau", "porc", "agneau", "dinde", "bacon", "jambon",
      "saucisse", "merguez", "steak", "côtelette", "rôti", "escalope",
      "saumon", "thon", "cabillaud", "truite", "crevette", "moule", "homard",
      "filet de poulet", "poitrine", "viande hachée",
      // EN
      "chicken", "beef", "veal", "pork", "lamb", "turkey", "bacon", "ham",
      "sausage", "steak", "chop", "roast", "escalope",
      "salmon", "tuna", "cod", "trout", "shrimp", "mussel", "lobster",
      "fish fillet", "ground beef", "ground meat",
    ],
    aisle: "Viandes & Poissons",
    category: "meat",
    emoji: "🥩",
    sortOrder: 2,
  },
  {
    keywords: [
      // FR
      "lait", "beurre", "fromage", "crème", "yaourt", "yogourt", "œuf", "oeuf",
      "mozzarella", "parmesan", "cheddar", "ricotta", "gruyère", "feta",
      "crème fraîche", "crème sure", "mascarpone", "brie", "camembert",
      // EN
      "milk", "butter", "cheese", "cream", "yogurt", "egg",
      "mozzarella", "parmesan", "cheddar", "ricotta", "gruyere", "feta",
      "sour cream", "mascarpone", "brie", "camembert",
    ],
    aisle: "Produits Laitiers & Œufs",
    category: "dairy",
    emoji: "🥛",
    sortOrder: 3,
  },
  {
    keywords: [
      // FR
      "pain", "baguette", "brioche", "croissant", "pain de mie", "muffin", "bagel",
      "pita", "tortilla", "naan",
      // EN
      "bread", "baguette", "brioche", "croissant", "sandwich bread", "muffin", "bagel",
      "pita", "tortilla", "naan",
    ],
    aisle: "Boulangerie & Pains",
    category: "bakery",
    emoji: "🍞",
    sortOrder: 4,
  },
  {
    keywords: [
      // FR
      "pâtes", "riz", "farine", "sucre", "quinoa", "couscous", "orge", "semoule",
      "céréale", "avoine", "flocon", "granola", "muesli", "blé",
      "nouille", "spaghetti", "fusilli", "penne", "macaroni", "vermicelle",
      // EN
      "pasta", "rice", "flour", "sugar", "quinoa", "couscous", "barley", "semolina",
      "cereal", "oat", "flake", "granola", "muesli", "wheat",
      "noodle", "spaghetti", "fusilli", "penne", "macaroni", "vermicelli",
    ],
    aisle: "Épicerie & Céréales",
    category: "grains",
    emoji: "🌾",
    sortOrder: 5,
  },
  {
    keywords: [
      // FR
      "conserve", "boîte de", "haricot rouge", "haricot blanc", "lentille", "pois chiche",
      "fève", "tomate concassée", "soupe en boîte", "thon en conserve", "sardine",
      // EN
      "canned", "kidney bean", "white bean", "lentil", "chickpea", "legume",
      "canned tomato", "canned tuna", "sardine",
    ],
    aisle: "Conserves & Légumineuses",
    category: "canned",
    emoji: "🥫",
    sortOrder: 6,
  },
  {
    keywords: [
      // FR
      "huile", "vinaigrette", "sauce soja", "sauce tomate", "ketchup", "moutarde",
      "mayonnaise", "vinaigre", "sriracha", "tabasco", "worcestershire", "pesto",
      "bouillon", "fond de veau", "tahini", "miso",
      // EN
      "oil", "dressing", "soy sauce", "tomato sauce", "ketchup", "mustard",
      "mayonnaise", "vinegar", "sriracha", "tabasco", "worcestershire", "pesto",
      "broth", "stock", "tahini", "miso",
    ],
    aisle: "Huiles, Sauces & Condiments",
    category: "condiments",
    emoji: "🫙",
    sortOrder: 7,
  },
  {
    keywords: [
      // FR
      "sel", "poivre", "cumin", "curcuma", "paprika", "cannelle", "gingembre",
      "muscade", "cardamome", "clou de girofle", "aneth", "origan", "laurier",
      "piment", "chili", "curry", "épice", "assaisonnement", "herbes de provence",
      // EN
      "salt", "pepper", "cumin", "turmeric", "paprika", "cinnamon", "ginger",
      "nutmeg", "cardamom", "clove", "dill", "oregano", "bay leaf",
      "chili", "curry", "spice", "seasoning",
    ],
    aisle: "Épices & Assaisonnements",
    category: "spices",
    emoji: "🌿",
    sortOrder: 8,
  },
  {
    keywords: [
      // FR
      "surgelé", "congelé", "glace", "sorbet", "légume surgelé", "pizza surgelée",
      // EN
      "frozen", "ice cream", "sorbet", "frozen vegetable", "frozen pizza",
    ],
    aisle: "Produits Surgelés",
    category: "frozen",
    emoji: "🧊",
    sortOrder: 9,
  },
  {
    keywords: [
      // FR
      "eau", "jus de", "lait de soja", "lait d'amande", "thé", "café", "tisane",
      "limonade", "soda", "boisson", "bière", "vin",
      // EN
      "water", "juice", "soy milk", "almond milk", "tea", "coffee", "herbal tea",
      "lemonade", "soda", "beverage", "beer", "wine",
    ],
    aisle: "Boissons",
    category: "beverages",
    emoji: "🧃",
    sortOrder: 10,
  },
  {
    keywords: [
      // FR
      "noix", "amande", "noisette", "cajou", "pistache", "cacahuète",
      "beurre d'amande", "beurre d'arachide", "chips", "craquelin",
      "biscuit", "chocolat", "bonbon", "confiture", "miel",
      // EN
      "nut", "almond", "hazelnut", "cashew", "pistachio", "peanut",
      "almond butter", "peanut butter", "chips", "cracker",
      "cookie", "chocolate", "candy", "jam", "honey",
    ],
    aisle: "Collations & Noix",
    category: "snacks",
    emoji: "🥜",
    sortOrder: 11,
  },
];

export function classifyIngredient(name: string): AisleInfo {
  const normalized = name.toLowerCase().trim();

  for (const rule of AISLE_RULES) {
    for (const keyword of rule.keywords) {
      if (normalized.includes(keyword)) {
        return {
          aisle: rule.aisle,
          category: rule.category,
          emoji: rule.emoji,
          sortOrder: rule.sortOrder,
        };
      }
    }
  }

  return { aisle: "Autres", category: "other", emoji: "🛒", sortOrder: 99 };
}

// ─── Parsing ──────────────────────────────────────────────────────────────────

export function parseIngredientsSummary(summary: string): RawIngredient[] {
  if (!summary) return [];

  return summary
    .split(",")
    .map((s) => s.trim())
    .filter(Boolean)
    .map((part) => {
      // Pattern: "2 cups flour" or "2 c. à s. sauce soja"
      const quantityMatch = part.match(
        /^(\d+(?:[.,]\d+)?)\s+([a-zA-Zàâäéèêëîïôùûüç.]+(?:\s+[a-zA-Zàâäéèêëîïôùûüç.]+)?)\s+(.+)$/
      );
      if (quantityMatch) {
        const quantity = parseFloat(quantityMatch[1].replace(",", "."));
        const unit = normalizeUnit(quantityMatch[2]);
        const name = quantityMatch[3].trim();
        return { name, quantity, unit };
      }

      // Pattern: "garlic gousse" or "onion small" — trailing word is a known unit/descriptor
      const words = part.trim().split(/\s+/);
      if (words.length > 1) {
        const lastWord = words[words.length - 1].toLowerCase();
        const normalized = normalizeUnit(lastWord);
        // Only split if the last word was actually recognised as a unit key
        if (lastWord in UNIT_MAP) {
          const name = words.slice(0, -1).join(" ");
          return { name, quantity: 1, unit: normalized };
        }
      }

      // Plain name only
      return { name: part, quantity: 1, unit: "" };
    });
}

// ─── Aggregation ──────────────────────────────────────────────────────────────

export function aggregateIngredients(rawIngredients: RawIngredient[]): OrganizedItem[] {
  // Key = normalizedName + normalizedUnit  → ensures e.g. "carrots"/"carrot"
  // and "gousse"/"gousses" share the same bucket while different units stay
  // separate (3 tbsp lemon juice ≠ 3 tsp lemon juice).
  const map = new Map<string, OrganizedItem>();

  for (const ingredient of rawIngredients) {
    if (!ingredient.name?.trim()) continue;

    const normalizedName = normalizeIngredientName(ingredient.name);
    const normalizedUnit = normalizeUnit(ingredient.unit ?? "");
    const key = `${normalizedName}::${normalizedUnit}`;

    const classification = classifyIngredient(normalizedName);

    if (map.has(key)) {
      const existing = map.get(key)!;
      existing.quantity =
        Math.round((existing.quantity + (ingredient.quantity || 1)) * 100) / 100;
    } else {
      map.set(key, {
        // Use the original (display-friendly) name from the first occurrence
        name: ingredient.name.trim(),
        quantity: ingredient.quantity || 1,
        unit: normalizedUnit,
        price: null,
        checked: false,
        aisle: classification.aisle,
        category: classification.category,
        emoji: classification.emoji,
        sortOrder: classification.sortOrder,
      });
    }
  }

  // Sort by aisle order, then alphabetically within each aisle
  return Array.from(map.values()).sort((a, b) => {
    if (a.sortOrder !== b.sortOrder) return a.sortOrder - b.sortOrder;
    return a.name.localeCompare(b.name, "fr");
  });
}
