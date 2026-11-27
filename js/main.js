//GameManager
import * as THREE from 'three';
import { Timer } from 'three/addons/misc/Timer.js';
import { finishLoading } from './load/loading.js'; // ロード画面
import { createRenderer, createCamera, handleResize } from './renderer.js';//カメラ・映写機
import { createEnvironment } from './environment.js';//時刻・天気呼び出し
import { createSky, createStars, paintSky } from './sky.js';//空処理
import { palettes } from './palettes.js';//空の色リスト
import { createPaletteFader } from './palette-fader.js';//時刻による空の色変更処理
import { tintForWeather } from './weather-tint.js';//天気ごとの空色フィルタ処理
import { createHud } from './hud.js';//時刻・天気UI処理
import { createWater, excludeFromReflection } from './water.js';//海3D処理
import { createRipples } from './ripples.js';//波紋3D処理
import { createTrain } from './train.js';//列車3D処理
import { createRain } from './weather_particles/rain.js';//雨3D処理
import { createSnow } from './weather_particles/snow.js';//雪3D処理
import { pickConversation } from './talks/line.js';//会話ログ
import { createConversationPlayer } from './talks/conversation.js';//会話処理
import { fetchBroadcast } from './talks/broadcast.js';//会話自動生成
import { createSubtitleView } from './talks/subtitle-view.js'; //会話表示
import { createTicket } from './ticket/ticket.js';//チケット3D呼び出し処理
import { showTicketCard } from './ticket/ticket-card.js';//チケット2D処理
import { createTicketButton } from './ticket/ticket-button.js';//チケット保存処理
import { getTodayTicket, issueTicket, toTicketState } from './ticket/ticket-store.js'; //チケット発行回数保存


// ===== 状態とパレット =====
const env = createEnvironment();
// 時間帯のパレットに、天気のフィルターをかけたもの
function targetPalette(state) {
  return tintForWeather(palettes[state.timeOfDay], state.weather);
}
const palette = targetPalette(env.state);

const scene = new THREE.Scene();
scene.fog = new THREE.Fog(palette.horizon, 30, 400); // 水面より先に作る

// ===== 舞台・カメラ・ライト =====
const camera = createCamera();
const renderer = createRenderer();
handleResize(renderer, camera);

// ライト
const light = new THREE.DirectionalLight(palette.sun, 2);
light.position.set(0, 1, -5);
scene.add(light);
const ambient = new THREE.AmbientLight(palette.ambient, 1.2);
scene.add(ambient);


// ===== 景色（空・海・波紋・天気・列車） =====
// 空
const sky = createSky(palette);
scene.add(sky);
scene.add(createStars());

// 水面
const water = createWater(palette);
scene.add(water);

// 波紋
const ripples = createRipples(scene, water.position.y);

// 天気処理
// 雨（水面に落ちたら、波紋を出す）
const rain = createRain((x, z) => ripples.spawn(x, z));
scene.add(rain.object);
// 雪
const snow = createSnow();
scene.add(snow.object);
excludeFromReflection(water, [rain.object, snow.object]);

//色塗り
function applyPalette(p) {
  paintSky(sky, p);
  scene.fog.color.set(p.horizon);                           // 霧
  water.material.uniforms.waterColor.value.set(p.water);    // 海
  water.material.uniforms.sunColor.value.set(p.sun);        // 海のきらめき
  light.color.set(p.sun);                                   // 光
  ambient.color.set(p.ambient);                             // 全体の明るさ
}

// 列車
const train = createTrain();
scene.add(train.object);

// 掲示板作成
const hud = createHud();
const fader = createPaletteFader(palette, applyPalette);
//会話
const ready = finishLoading();
const subtitles = createSubtitleView();
const talk = createConversationPlayer(subtitles, ready);
// 車内放送を頼んで、だめなら固定セリフで話す
function speak(state) {
  fetchBroadcast(state).then((conversation) => {
    talk.play(conversation ?? pickConversation(state));
  });
}

// ===== 見張り開始（env.start） =====
env.start({
  onTick: (state) => hud.update(state),
  onTimeChange: (state) => {
    fader.fadeTo(targetPalette(state));
    speak(state);
  },
  onWeatherChange: (state) => {
    hud.update(state);
    rain.setActive(state.weather === 'rain' || state.weather === 'thunder');
    snow.setActive(state.weather === 'snow');
    fader.fadeTo(targetPalette(state));
    speak(state);
  },
});
hud.setMessage('銀河ステーション - 星の休息地');
speak(env.state);    
// デバッグ：T キーで時間帯を順番に切り替える
/*const ORDER = ['dawn', 'day', 'dusk', 'night'];
let debugIndex = ORDER.indexOf(env.state.timeOfDay);
window.addEventListener('keydown', (e) => {
  if (e.key !== 't') return;
  debugIndex = (debugIndex + 1) % ORDER.length; // 最後まで行ったら最初に戻る
  fader.fadeTo(palettes[ORDER[debugIndex]]);
});*/

// チケット
let ticket = null;
let ticketCard = null;
const ticketButton = createTicketButton(() => startTicket());
ticketButton.setEnabled(false);
if (getTodayTicket()) ticketButton.setLabel('切符確認');
ready.then(() => ticketButton.setEnabled(true));

async function startTicket() {
  if (ticket) return;
  ticketButton.setEnabled(false);

  const today = getTodayTicket();
  const isNew = !today;
  const data = today ?? issueTicket(env.state);
  if (isNew) ticketButton.setLabel('切符確認');

  // 2Dの切符を出す（1回目は着地したとき、2回目以降はすぐ）
  function showCard() {
    ticketCard = showTicketCard(ticket.canvas, {
      rect: ticket.getScreenRect(camera),
      onClose: () => {
        scene.remove(ticket.object);
        ticket.dispose();
        ticket = null;
        ticketCard = null;
        ticketButton.setEnabled(true);
        if (isNew) speak({ ...env.state, event: 'ticket', count: data.count });
      },
    });
    setTimeout(() => (ticket.object.visible = false), 250);
  }

  ticket = await createTicket(toTicketState(data), {
    camera,
    instant: !isNew,     // 2回目以降は、舞う演出をとばす
    onLanded: showCard,  // 1回目は、着地したら出す
  });
  scene.add(ticket.object);

  if (!isNew) showCard(); // 2回目以降は、すぐ出す
}

// 画面の大きさが変わったら、切符を置き直す
window.addEventListener('resize', () => {
  if (!ticket) return;                                    // 切符が出ていなければ何もしない
  ticket.refit(camera);
  if (ticketCard) ticketCard.moveTo(ticket.getScreenRect(camera));
});


// ===== アニメーション（必ず最後） =====
const timer = new Timer();
function animate(timestamp) {
  timer.update(timestamp);          // ← 毎フレーム最初に呼ぶ！
  const delta = timer.getDelta();

  water.material.uniforms.time.value += delta * 0.01;
  ripples.update(delta);
  train.update(delta);
  fader.update(delta);
  snow.update(delta);
  rain.update(delta);
  if (ticket) ticket.update(delta);
  renderer.render(scene, camera);
}
renderer.setAnimationLoop(animate);
