const rewardKeywords: [string[], string][] = [
  [["screen", "tablet", "ipad", "phone", "device"], "📱"],
  [["movie", "film", "cinema"], "🎬"],
  [["game", "gaming", "video game", "playstation", "xbox", "nintendo"], "🎮"],
  [["ice cream", "icecream", "gelato"], "🍦"],
  [["candy", "sweet", "chocolate", "treat", "snack", "cookie"], "🍬"],
  [["pizza", "food", "meal", "restaurant", "eat out", "dinner out"], "🍕"],
  [["toy", "lego", "playset"], "🧸"],
  [["book", "comic", "reading"], "📖"],
  [["bike", "scooter", "skateboard", "sport"], "🚲"],
  [["sleepover", "friend", "playdate", "party"], "🎉"],
  [["money", "cash", "allowance", "dollar"], "💰"],
  [["trip", "outing", "park", "zoo", "adventure"], "🏖️"],
  [["music", "song", "spotify"], "🎵"],
  [["art", "craft", "draw", "paint"], "🎨"],
  [["stay up", "bedtime", "late night"], "🌙"],
];

export function getRewardEmoji(name: string): string {
  const lower = name.toLowerCase();
  for (const [keywords, emoji] of rewardKeywords) {
    if (keywords.some((kw) => lower.includes(kw))) return emoji;
  }
  return "🎁";
}
