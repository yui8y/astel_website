const KEY = 'astel-ticket'; // 保存するときの名前

const pad = (n) => String(n).padStart(2, '0');
const dateKey = (d) => `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;

// 記録を読む（読めなければ null）
function load() {
  try {
    return JSON.parse(localStorage.getItem(KEY));
  } catch {
    return null;
  }
}

// 記録を書く（書けなくても、サイトは止めない）
function save(data) {
  try {
    localStorage.setItem(KEY, JSON.stringify(data));
  } catch {
    // プライベートモードなどで保存できないこともある
  }
}

// 今日もう受け取っていれば、その記録を返す
export function getTodayTicket() {
  const data = load();
  return data && data.date === dateKey(new Date()) ? data : null;
}

// 新しく切符を発行して、記録する
export function issueTicket(state) {
  const prev = load();
  const data = {
    date: dateKey(state.now),
    issuedAt: state.now.toISOString(), // 時刻は文字にして保存
    timeOfDay: state.timeOfDay,
    season: state.season,
    weather: state.weather,
    count: (prev?.count ?? 0) + 1,     // 乗車回数
  };
  save(data);
  return data;
}

// 記録を、切符の絵を描ける形（state と同じ形）に戻す
export function toTicketState(data) {
  return { ...data, now: new Date(data.issuedAt) };
}