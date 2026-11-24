const TIME_LABELS = { dawn: '朝焼け', day: '昼', dusk: '夕暮れ', night: '夜' };
const SEASON_LABELS = { spring: '春', summer: '夏', autumn: '秋', winter: '冬' };

function make(tag, className) {
  const el = document.createElement(tag);
  el.className = className;
  return el;
}

export function createHud() {
  const root = make('div', 'hud');
  const time = make('span', 'hud-time');
  const windowEl = make('div', 'hud-window');
  const scroll = make('span', 'hud-scroll');    // 流れる文字

  windowEl.appendChild(scroll);
  root.append(time, windowEl);
  document.body.appendChild(root);

  // 流れる文字を差し替える（車内放送もここに流す？）
  function setMessage(text) {
    if (scroll.textContent !== text) scroll.textContent = text;
  }

  function update(state) {
    time.textContent = state.now.toLocaleTimeString('ja-JP', { hour: '2-digit', minute: '2-digit' });
    setMessage(`▶ ${SEASON_LABELS[state.season]}・${TIME_LABELS[state.timeOfDay]}の銀河鉄道へようこそ`);
  }

  return { update, setMessage };
}