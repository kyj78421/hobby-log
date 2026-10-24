// PRD 4.3 ⑨ 감정 이모지 8종. key는 DB(activities.emotion)에 저장되는 값.
export const EMOTIONS = [
  { key: "excited", emoji: "😆", label: "신남" },
  { key: "happy", emoji: "🥰", label: "행복" },
  { key: "calm", emoji: "😌", label: "평온" },
  { key: "proud", emoji: "😎", label: "뿌듯" },
  { key: "neutral", emoji: "😐", label: "보통" },
  { key: "tired", emoji: "😴", label: "피곤" },
  { key: "sad", emoji: "😢", label: "슬픔" },
  { key: "frustrated", emoji: "😤", label: "답답함" },
] as const;

export type EmotionKey = (typeof EMOTIONS)[number]["key"];

export const getEmotion = (key: string | null | undefined) =>
  EMOTIONS.find((e) => e.key === key);
