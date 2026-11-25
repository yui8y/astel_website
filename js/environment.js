const TIMES = ['dawn', 'day', 'dusk', 'night'];
const CHECK_INTERVAL = 10 * 1000; // 10秒ごとに確認

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
  // 確認用：?time=night など。知っている名前のときだけ使う
  const debugTime = new URLSearchParams(location.search).get('time');
  const fixedTime = TIMES.includes(debugTime) ? debugTime : null;

  function read(now) {
    return {
      now,
      timeOfDay: fixedTime ?? getTimeOfDay(now),
      season: getSeason(now),
    };
  }

  const state = read(new Date()); // 作った瞬間の状態

  // 見張りを始める
  function start({ onTick, onTimeChange }) {
    function check() {
      const next = read(new Date());
      const timeChanged = next.timeOfDay !== state.timeOfDay;
      Object.assign(state, next); // 掲示板を書き換える

      onTick(state);                          // 毎回：時計の表示など
      if (timeChanged) onTimeChange(state);   // 変わったときだけ：景色の切り替え
    }
    check();
    setInterval(check, CHECK_INTERVAL);
  }

  return { state, start };
}