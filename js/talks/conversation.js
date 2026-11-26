const NAMES = { astel: 'アステル', outis: 'ウーティス' };

// ms ミリ秒待つ
const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

export function createConversationPlayer(view) {
  let playing = 0; // 今流している会話の番号

  async function play(conversation) {
    if (!conversation) return;
    const myNumber = ++playing; // 自分の番号を受け取る

    for (const line of conversation.lines) {
      if (myNumber !== playing) return; // 新しい会話が始まったら、古い方は途中でやめる
      view.showLine(line);
      await sleep(1500 + line.text.length * 120); // 長いセリフほど長く表示
    }
    if (myNumber === playing) view.clear();
  }

  return { play };
}