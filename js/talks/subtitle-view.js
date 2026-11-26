const FADE_MS = 600; // 消えてから次が出るまで（CSSの transition と合わせる）

function make(tag, className) {
  const el = document.createElement(tag);
  el.className = className;
  return el;
}

export function createSubtitleView() {
  const root = make('div', 'subtitle');
  const text = make('p', 'subtitle-text');
  root.appendChild(text);
  document.body.appendChild(root);

  // セリフを1つ見せる（前のセリフは一度消してから）
  function showLine(line) {
    text.classList.remove('is-visible');
    setTimeout(() => {
      text.textContent = line.text;
      text.dataset.who = line.who; // 名前は出さないけど、誰の言葉かは覚えておく
      text.classList.add('is-visible');
    }, FADE_MS);
  }

  // 字幕を消す
  function clear() {
    text.classList.remove('is-visible');
  }

  return { showLine, clear };
}