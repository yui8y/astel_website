const FADE_MS = 600;  // 前の字幕が消えるまで（CSSの transition と合わせる）
const TYPE_MS = 60;   // 1文字ごとの間隔

// 文字ごとの「間」（息つぎ）
const PAUSE_MS = { '、': 200, '。': 350, '？': 350, '！': 350, '…': 150 };

const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

// 動きを減らす設定の人には、タイピングせず一度に出す
const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

function make(tag, className, parent) {
  const el = document.createElement(tag);
  el.className = className;
  if (parent) parent.appendChild(el);
  return el;
}

export function createSubtitleView() {
  const root = make('div', 'subtitle', document.body);
  const text = make('p', 'subtitle-text', root);
  const shown = make('span', 'subtitle-shown', text); // 打ち終わった部分
  const rest = make('span', 'subtitle-rest', text);   // まだ透明な部分（幅を確保する）

  let typing = 0; // 今打っているセリフの番号

  // セリフを1つ、タイピングで見せる（打ち終わるまで待てる）
  async function showLine(line) {
    const myNumber = ++typing;

    text.classList.remove('is-visible');
    await sleep(FADE_MS);
    if (myNumber !== typing) return; // 待っている間に次が来たら、やめる

    const chars = Array.from(line.text); // 1文字ずつに分ける
    shown.textContent = '';
    rest.textContent = line.text;        // 最初は全部透明
    text.dataset.who = line.who;
    text.classList.add('is-visible');

    if (reduceMotion) {
      shown.textContent = line.text;
      rest.textContent = '';
      return;
    }

    for (let i = 1; i <= chars.length; i++) {
      if (myNumber !== typing) return;  // 打っている途中で次が来たら、やめる
      shown.textContent = chars.slice(0, i).join('');
      rest.textContent = chars.slice(i).join('');
      await sleep(PAUSE_MS[chars[i - 1]] ?? TYPE_MS); // 句読点なら長めに待つ
    }
  }

  function clear() {
    typing++; // 打っている途中のものを止める
    text.classList.remove('is-visible');
  }

  return { showLine, clear };
}