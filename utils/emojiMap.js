const groceryEmojis = {
  // Dairy
  "milk": "🥛",
  "cheese": "🧀",
  "butter": "🧈",
  "yogurt": "🥣",
  "egg": "🥚",

  // Meat & Protein
  "chicken": "🍗",
  "beef": "🥩",
  "fish": "🐟",
  "shrimp": "🍤",
  "bacon": "🥓",

  // Vegetables
  "garlic": "🧄",
  "ginger": "🫚",
  "onion": "🧅",
  "potato": "🥔",
  "sweet potato": "🍠",
  "carrot": "🥕",
  "broccoli": "🥦",
  "corn": "🌽",
  "pepper": "🫑",
  "cucumber": "🥒",
  "lettuce": "🥬",

  // Fruits
  "apple": "🍎",
  "banana": "🍌",
  "orange": "🍊",
  "grapes": "🍇",
  "strawberry": "🍓",
  "blueberry": "🫐",
  "pineapple": "🍍",
  "mango": "🥭",

  // Grains & Pantry
  "bread": "🍞",
  "rice": "🍚",
  "pasta": "🍝",
  "flour": "🌾",
  "oats": "🥣",
  "cereal": "🥣",

  // Drinks
  "coffee": "☕",
  "tea": "🍵",
  "juice": "🧃",
  "water": "💧",

  // Misc
  "honey": "🍯",
  "salt": "🧂",
  "sugar": "🍬",
  "chocolate": "🍫",
  "ice cream": "🍨"
};

function getEmojiForItem(itemName) {
  if (!itemName) return "🛒";
  
  const normalized = itemName.toLowerCase().trim();
  
  // 1. Exact match (e.g., "milk" → "🥛")
  if (groceryEmojis[normalized]) {
    return groceryEmojis[normalized];
  }
  
  // 2. Substring match (e.g., "whole milk" contains "milk")
  for (const [key, emoji] of Object.entries(groceryEmojis)) {
    if (normalized.includes(key)) {
      return emoji;
    }
  }
  
  // 3. Reverse substring (e.g., "egg" in "eggs")
  for (const [key, emoji] of Object.entries(groceryEmojis)) {
    if (key.includes(normalized)) {
      return emoji;
    }
  }
  
  // 4. Singular/Plural handling
  const singular = normalized.endsWith('s') ? normalized.slice(0, -1) : normalized;
  if (groceryEmojis[singular]) {
    return groceryEmojis[singular];
  }
  
  // 5. Default fallback
  return "🛒";
}

module.exports = { groceryEmojis, getEmojiForItem };
