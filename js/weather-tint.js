import * as THREE from 'three';

// 天気ごとの、くすませ方
const WEATHER_TINT = {
  clear:   { gray: 0,    dark: 0 },
  cloudy:  { gray: 0.45, dark: 0.1 },
  fog:     { gray: 0.6,  dark: 0 },     // 霧は暗くせず、白っぽく
  rain:    { gray: 0.6,  dark: 0.2 },
  snow:    { gray: 0.5,  dark: 0 },
  thunder: { gray: 0.7,  dark: 0.35 },
};

// パレットに、天気のフィルターをかける
export function tintForWeather(palette, weather) {
  const tint = WEATHER_TINT[weather];
  if (!tint) return palette; // まだ分からない天気（unknown）は、そのまま

  const result = {};
  const c = new THREE.Color();
  const hsl = {};

  for (const key in palette) {
    c.set(palette[key]);
    c.getHSL(hsl);                 // RGB → 色相・彩度・明るさ に分ける
    hsl.s *= 1 - tint.gray;        // 鮮やかさを下げる
    hsl.l *= 1 - tint.dark;        // 明るさを下げる
    c.setHSL(hsl.h, hsl.s, hsl.l); // 元に戻す
    result[key] = c.getHex();      // パレットと同じ「数字」の形で返す
  }
  return result;
}