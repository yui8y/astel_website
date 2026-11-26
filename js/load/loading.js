const MIN_SHOW_MS = 1200; // 最低でもこれだけは見せる

const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));
const nextFrame = () => new Promise((resolve) => requestAnimationFrame(resolve));

// 準備ができたら、ローディング画面をふわっと消す
export async function finishLoading() {
  const el = document.getElementById('loading');
  if (!el) return;

  await document.fonts.ready;   // フォントの読み込みを待つ
  await nextFrame();            // 最初の景色が描かれるのを待つ
  await nextFrame();

  // 一瞬で消えるとチラつくから、最低限の時間は見せる
  const shown = performance.now();
  if (shown < MIN_SHOW_MS) await sleep(MIN_SHOW_MS - shown);

  el.classList.add('is-hidden');
  await Promise.race([
    new Promise((resolve) => el.addEventListener('transitionend', resolve, { once: true })),
    sleep(1200),
  ]);
  el.remove();
}