/**
 * 半角英数字を全角に変換
 */
export function toFullWidth(str: string): string {
  return str.replace(/[A-Za-z0-9]/g, (char) => {
    return String.fromCharCode(char.charCodeAt(0) + 0xfee0);
  });
}

/**
 * 全角英数字を半角に変換
 */
export function toHalfWidth(str: string): string {
  return str.replace(/[Ａ-Ｚａ-ｚ０-９]/g, (char) => {
    return String.fromCharCode(char.charCodeAt(0) - 0xfee0);
  });
}

/**
 * 検索用のパターンを生成（半角版と全角版）
 */
export function generateSearchPatterns(str: string): string[] {
  const halfWidth = toHalfWidth(str);
  const fullWidth = toFullWidth(str);

  // 重複を除去して返す
  const patterns = new Set([str, halfWidth, fullWidth]);
  return Array.from(patterns);
}
