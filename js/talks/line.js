export const conversations = [
  {
    when: { timeOfDay: 'dusk', weather: 'clear' }, // 夕暮れの晴れ
    lines: [
        { who: 'outis',  text: 'またこんなところで呆けていたのか？' },
        { who: 'astel', text: 'みて。もうすぐ、オリオン座がのぼってくるよ' },
        { who: 'outis',  text: '……お前、少しは私の話をだな……' },
    ],
  },
  {
    when: { timeOfDay: 'night' },  // 夜なら天気は問わない
    lines: [
        { who: 'outis',  text: 'またこんなところで呆けていたのか？' },
        { who: 'astel', text: 'みて。もうすぐ、オリオン座がのぼってくるよ' },
        { who: 'outis',  text: '……お前、少しは私の話をだな……' },
    ],
  },
  {
    when: {},                       // いつでも（予備）
    lines: [ /* ... */ ],
  },
];