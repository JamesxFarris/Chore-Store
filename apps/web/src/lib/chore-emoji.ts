const choreKeywords: [string[], string][] = [
  [["bed", "make bed"], "🛏️"],
  [["brush", "teeth", "tooth"], "🪥"],
  [["dish", "dishes", "wash dish", "load dishwasher", "unload dishwasher"], "🍽️"],
  [["laundry", "clothes", "fold", "washing"], "👕"],
  [["trash", "garbage", "bin", "rubbish", "take out"], "🗑️"],
  [["vacuum", "hoover", "carpet"], "🧹"],
  [["sweep", "broom", "mop", "floor"], "🧹"],
  [["homework", "study", "read", "book"], "📚"],
  [["dog", "walk dog", "pet", "feed pet", "cat", "fish"], "🐾"],
  [["cook", "dinner", "lunch", "breakfast", "meal"], "🍳"],
  [["clean", "tidy", "room", "organize"], "✨"],
  [["water", "plant", "garden", "yard"], "🌱"],
  [["shower", "bath", "wash"], "🚿"],
  [["recycle", "sort"], "♻️"],
  [["car", "wash car"], "🚗"],
];

export function getChoreEmoji(title: string): string {
  const lower = title.toLowerCase();
  for (const [keywords, emoji] of choreKeywords) {
    if (keywords.some((kw) => lower.includes(kw))) return emoji;
  }
  return "✅";
}
