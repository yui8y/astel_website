import { TIME_LABELS, SEASON_LABELS, WEATHER_LABELS } from './label/labels.js';
const FADE_MS = 600;

function make(tag, className, parent) {
  const el = document.createElement(tag);
  el.className = className;
  parent.appendChild(el);
  return el;
}

export function createHud() {
  const root = make('div', 'hud', document.body);

  const row1 = make('div', 'hud-row', root);
  make('span', 'hud-star', row1);              // 小さな星
  const time = make('span', 'hud-time', row1);

  const row2 = make('div', 'hud-row', root);
  make('span', 'hud-line', row2);              // 細い線
  const info = make('span', 'hud-info', row2);

  const message = make('p', 'hud-message', root);
  const weather = make('div', 'hud-weather', document.body);

  // メッセージを、一度消してから新しい文でふわっと出す
  function setMessage(text) {
    if (message.textContent === text) return; // 同じ文なら何もしない
    message.classList.remove('is-visible');
    setTimeout(() => {
      message.textContent = text;
      message.classList.add('is-visible');
    }, FADE_MS);
  }

  function update(state) {
        time.textContent = state.now.toLocaleTimeString('ja-JP', { hour: '2-digit', minute: '2-digit' });
    info.textContent = `${SEASON_LABELS[state.season]} · ${TIME_LABELS[state.timeOfDay]}`; // ← 戻す
    const temp = state.temperature !== null ? `　${state.temperature}℃` : '';
    weather.textContent = `${WEATHER_LABELS[state.weather]}${temp}`;
  }

  return { update, setMessage };
}