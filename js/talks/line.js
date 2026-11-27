export const conversations = [
  {
    when: { timeOfDay: 'dusk', weather: 'clear' }, // 夕暮れの晴れ
    lines: [
        { who: 'outis',  text: 'またこんなところで呆けていたのか？' },
        { who: 'astel', text: 'みて。もうすぐ、オリオン座がのぼってくるよ' },
        { who: 'outis',  text: 'お前っ、少しは私の話をだな……' },
    ],
  },
  {
    when: { timeOfDay: 'night' },  // 夜なら天気は問わない
    lines: [
        { who: 'astel', text: 'ウー、流星。よく見えるよ' },
        { who: 'outis',  text: '……ああ、そうだな。' },
    ],
  },
  {
    when: {},                       // いつでも（予備）
    lines: [
        { who: 'astel', text: '今日の空気、きれい' },
        { who: 'astel', text: '……ウー、まだこないのかな' },
      ],
  },
  {
    when: { event: 'ticket' },
    lines: [
      { who: 'astel', text: '切符。なくさないでね' },
    ],
  },
    {
    when: {},
    lines: [
      { who: 'astel', text: 'ウー、今日の空、すこしにじんでる' },
      { who: 'outis', text: '……天気のせいだろう。風邪を引く前に戻るように。' },
    ],
  },
  {
    when: {},
    lines: [
      { who: 'outis', text: 'また持ち場を離れていたのか。' },
      { who: 'astel', text: 'ほしのこえ、きいてた' },
    ],
  },
];

// 今の状態に合う会話を1つ選ぶ
export function pickConversation(state) {
  const matches = conversations.filter((c) =>
    Object.entries(c.when).every(([key, value]) => state[key] === value)
  );
  if (matches.length === 0) return null;

  const best = Math.max(...matches.map((c) => Object.keys(c.when).length));
  const top = matches.filter((c) => Object.keys(c.when).length === best);
  return top[Math.floor(Math.random() * top.length)];
}