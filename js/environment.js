// 時間帯を調べる
export function getTimeOfDay(date = new Date()) {
  const h = date.getHours();
  if (h >= 4 && h < 7) return 'dawn';   // 朝焼け
  if (h >= 7 && h < 16) return 'day';   // 昼
  if (h >= 16 && h < 19) return 'dusk'; // 夕暮れ
  return 'night';                        // 夜
}

// 季節を調べる
export function getSeason(date = new Date()) {
  const m = date.getMonth() + 1; // ⚠️ JSの月は0始まり（1月が0）だから +1 する
  if (m >= 3 && m <= 5) return 'spring';
  if (m >= 6 && m <= 8) return 'summer';
  if (m >= 9 && m <= 11) return 'autumn';
  return 'winter';
}