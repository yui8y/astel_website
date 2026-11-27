const BROADCAST_URL = 'http://localhost:8787'; // 後で、本番の住所に変える

// サーバーに会話を作ってもらう（失敗したら null）
export async function fetchBroadcast(state) {
  try {
    const res = await fetch(BROADCAST_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        timeOfDay: state.timeOfDay,
        season: state.season,
        weather: state.weather,
        event: state.event ?? null,
        count: state.count ?? null,
      }),
    });
    if (!res.ok) return null;

    const data = await res.json();
    if (!Array.isArray(data.lines)) return null; // 形を確かめる
    return data;
  } catch {
    return null; // つながらなくても、サイトは止めない
  }
}