// 天気を調べる場所
const LATITUDE = 35.68;
const LONGITUDE = 139.76;

// 天気の番号を6種類にまとめる
function codeToKind(code) {
  if (code <= 1) return 'clear';
  if (code <= 3) return 'cloudy';
  if (code === 45 || code === 48) return 'fog';
  if ((code >= 51 && code <= 67) || (code >= 80 && code <= 82)) return 'rain';
  if ((code >= 71 && code <= 77) || code === 85 || code === 86) return 'snow';
  if (code >= 95) return 'thunder';
  return 'unknown';
}

// 今の天気を取りに行く
export async function fetchWeather() {
  const url = 'https://api.open-meteo.com/v1/forecast'
    + `?latitude=${LATITUDE}&longitude=${LONGITUDE}`
    + '&current=weather_code,temperature_2m'
    + '&timezone=auto';

  const res = await fetch(url);       // 注文して、ベルが鳴るまで待つ
  if (!res.ok) {
    throw new Error(`天気の取得に失敗しました（${res.status}）`);
  }
  const data = await res.json();      // 届いた中身を、JSのデータに変換

  // 🔒 届いた中身が、思った形かどうか確かめる
  const code = data?.current?.weather_code;
  if (typeof code !== 'number') {
    throw new Error('天気のデータの形が想定と違います');
  }

  return {
    kind: codeToKind(code),
    temperature: Math.round(data.current.temperature_2m),
  };
}