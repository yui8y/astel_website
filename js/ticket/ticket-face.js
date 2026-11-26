import { TIME_LABELS, SEASON_LABELS, WEATHER_LABELS } from '../labels.js';

const W = 480;   // 切符の絵の横幅（ピクセル）
const H = 256;   // 縦幅

const COLORS = {
  paper: '#f4ead6',  // 紙
  ink:   '#3a3022',  // 文字
  line:  '#8a7a5a',  // 枠線
};

// 2桁にそろえる（5 → "05"）
const pad = (n) => String(n).padStart(2, '0');

// 今の状態から、切符の絵を描いて返す
export async function drawTicketFace(state) {
  await document.fonts.load('16px DotGothic16'); // フォントの準備を待つ

  const canvas = document.createElement('canvas');
  canvas.width = W;
  canvas.height = H;
  const ctx = canvas.getContext('2d');

  // 紙と枠
  ctx.fillStyle = COLORS.paper;
  ctx.fillRect(0, 0, W, H);
  ctx.strokeStyle = COLORS.line;
  ctx.lineWidth = 4;
  ctx.strokeRect(8, 8, W - 16, H - 16);

  // 文字の基本設定
  ctx.fillStyle = COLORS.ink;
  ctx.textBaseline = 'top';

  // 上の段：路線名と番号
  ctx.font = '16px DotGothic16';
  ctx.fillText('銀河鉄道', 32, 32);
  ctx.textAlign = 'right';
  ctx.fillText('No.0', W - 32, 32);
  ctx.textAlign = 'left';

  // 点線
  ctx.setLineDash([8, 8]);
  ctx.beginPath();
  ctx.moveTo(24, 64);
  ctx.lineTo(W - 24, 64);
  ctx.stroke();
  ctx.setLineDash([]);

  // 駅名（大きく）
  ctx.font = '32px DotGothic16';
  ctx.fillText('銀河ステーション', 32, 88);

  // 日付・時刻・状態
  const d = state.now;
  const date = `${d.getFullYear()}.${pad(d.getMonth() + 1)}.${pad(d.getDate())}`;
  const time = `${pad(d.getHours())}:${pad(d.getMinutes())}`;
  ctx.font = '16px DotGothic16';
  ctx.fillText(`${date}　${time} 発`, 32, 152);
  ctx.fillText(
    `${SEASON_LABELS[state.season]}・${TIME_LABELS[state.timeOfDay]}・${WEATHER_LABELS[state.weather]}`,
    32, 184
  );

  // 右下：乗車記念
  ctx.textAlign = 'right';
  ctx.fillText('乗車記念', W - 32, 208);
  ctx.textAlign = 'left';

  return canvas;
}