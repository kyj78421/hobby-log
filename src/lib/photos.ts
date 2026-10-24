export const PHOTO_BUCKET = "activity-photos";
export const MAX_PHOTO_BYTES = 5 * 1024 * 1024;
export const PHOTO_TYPES: Record<string, string> = {
  "image/jpeg": "jpg",
  "image/png": "png",
  "image/webp": "webp",
};

// 서버·클라이언트 공용 검증. 문제가 없으면 null.
export function validatePhoto(file: { type: string; size: number }): string | null {
  if (!(file.type in PHOTO_TYPES)) return "지원하지 않는 이미지 형식이에요. JPG, PNG, WebP만 올릴 수 있어요.";
  if (file.size > MAX_PHOTO_BYTES) return "5MB 이하 사진을 선택해 주세요.";
  return null;
}
