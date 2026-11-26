const NAMES = { astel: 'アステル', outis: 'ウーティス' };

// ms ミリ秒待つ
const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

export function createConversationPlayer(view, ready = Promise.resolve()) {
  let playing = 0; // 今流している会話の番号

  async function play(conversation) {
    if (!conversation) return;
    const myNumber = ++playing; // 自分の番号を受け取る

    await ready;                        // ローディングが終わるまで待つ
    if (myNumber !== playing) return;   // 待っている間に別の会話を頼まれたら、そっちに譲る

    for (const line of conversation.lines) {
      if (myNumber !== playing) return;
      await view.showLine(line);                     // 打ち終わるまで待つ
      if (myNumber !== playing) return;
      await sleep(1200 + line.text.length * 50);    // 読む時間
    }
    if (myNumber === playing) view.clear();
  }

  return { play };
}