const TIME_LABELS = { dawn: '朝焼け', day: '昼', dusk: '夕暮れ', night: '夜' };
const SEASON_LABELS = { spring: '春', summer: '夏', autumn: '秋', winter: '冬' };

export function createHud() {
  const el = document.createElement('div');
  el.id = 'hud';
  document.body.appendChild(el);

  function update(date, state) {
    const time = date.toLocaleTimeString('ja-JP', { hour: '2-digit', minute: '2-digit' });
    el.textContent = `${time}　${SEASON_LABELS[state.season]}・${TIME_LABELS[state.timeOfDay]}`;
  }

  return { update };
}