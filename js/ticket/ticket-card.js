const FADE_MS = 500; // CSSの transition と合わせる

const pad = (n) => String(n).padStart(2, '0');

// 決まったクラスの要素を作って、親に入れる
function make(tag, className, parent) {
  const el = document.createElement(tag);
  el.className = className;
  parent.appendChild(el);
  return el;
}

// canvas の絵を、画像ファイルとして保存する
function download(canvas) {
  const d = new Date();
  const filename = `galaxy-ticket-${d.getFullYear()}${pad(d.getMonth() + 1)}${pad(d.getDate())}.png`;

  canvas.toBlob((blob) => {
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    link.click();
    URL.revokeObjectURL(url);               // 使い終わった住所を片付ける
  }, 'image/png');
}

export function showTicketCard(canvas, { onClose } = {}) {
  const card = make('div', 'ticket-card', document.body);
  card.appendChild(canvas);

  const actions = make('div', 'ticket-actions', card);
  const save = make('button', 'ticket-action', actions);
  save.type = 'button';
  save.textContent = '受け取る（保存）';
  const close = make('button', 'ticket-action', actions);
  close.type = 'button';
  close.textContent = '閉じる';

  save.addEventListener('click', () => download(canvas));
  close.addEventListener('click', () => {
    card.classList.remove('is-visible');
    setTimeout(() => {
      card.remove();
      if (onClose) onClose();
    }, FADE_MS);
  });

  requestAnimationFrame(() => card.classList.add('is-visible'));
}