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
        { who: 'astel', text: 'ウー、流星。よく見えるよ' },
        { who: 'outis',  text: '……ああ、そうだな。' },
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