import { fetchWeather } from './weather.js';

const TIMES = ['dawn', 'day', 'dusk', 'night'];
const CHECK_INTERVAL = 10 * 1000; // 10秒ごとに確認
const WEATHER_INTERVAL = 15 * 60 * 1000; // 天気は15分ごと
const WEATHERS = ['clear', 'cloudy', 'fog', 'rain', 'snow', 'thunder'];

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
  const m = date.getMonth() + 1;
  if (m >= 3 && m <= 5) return 'spring';
  if (m >= 6 && m <= 8) return 'summer';
  if (m >= 9 && m <= 11) return 'autumn';
  return 'winter';
}

// 掲示板を作る
export function createEnvironment() {
  // 確認用：?time=night など。
  const debugTime = new URLSearchParams(location.search).get('time');
  const fixedTime = TIMES.includes(debugTime) ? debugTime : null;
    // 確認用：?weather=rain など。
  const debugWeather = new URLSearchParams(location.search).get('weather');
  const fixedWeather = WEATHERS.includes(debugWeather) ? debugWeather : null;

  function read(now) {
    return {
      now,
      timeOfDay: fixedTime ?? getTimeOfDay(now),
      season: getSeason(now),
    };
  }

  const state = read(new Date()); // 作った瞬間の状態
  state.weather = fixedWeather ?? 'unknown'; // 最初はまだ分からない
  state.temperature = null;

  // 見張りを始める
  function start({ onTick, onTimeChange, onWeatherChange }) {
    function check() {
      const next = read(new Date());
      const timeChanged = next.timeOfDay !== state.timeOfDay;
      Object.assign(state, next); // 掲示板を書き換える

      onTick(state);                          // 毎回：時計の表示など
      if (timeChanged) onTimeChange(state);   // 変わったときだけ：景色の切り替え
    }
    async function checkWeather() {
      if (fixedWeather) return; // 確認用の天気を使っているときは取りに行かない
      try {
        const w = await fetchWeather();
        const changed = w.kind !== state.weather;
        state.weather = w.kind;
        state.temperature = w.temperature;
        if (changed) onWeatherChange(state);
      } catch (e) {
        console.warn(e); // 失敗しても、サイトは止めない（今の天気のまま続ける）
      }
    }

    check();
    setInterval(check, CHECK_INTERVAL);
    checkWeather();
    setInterval(checkWeather, WEATHER_INTERVAL);
    if (fixedWeather) onWeatherChange(state); // 確認用の天気を、最初に一度反映
  }

  return { state, start };
}