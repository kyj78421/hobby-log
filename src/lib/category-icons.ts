// 대분류 아이콘 (대분류 id 기준). 새 대분류가 생겨도 깨지지 않도록 기본 아이콘을 둔다.
const ICONS: Record<number, string> = {
  1: "🏃",
  2: "🎬",
  3: "🎨",
  4: "📚",
  5: "⛺",
  6: "☕",
  7: "🎮",
  8: "🌿",
  9: "💕",
};

export const categoryIcon = (id: number) => ICONS[id] ?? "✨";
