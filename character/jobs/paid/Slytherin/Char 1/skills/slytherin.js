// ═══════════════════════════════════════════════════════════════
//  JOB SKILLS — Slytherin
//  Penyihir licik dari Hogwarts bermottokan "cunning & ambition".
//  Menguasai sihir gelap, kutukan, dan kekuatan tersembunyi.
// ═══════════════════════════════════════════════════════════════

CT_JobSkills.register('Slytherin_Char1', [
  {
    id: 'avada_kedavra',
    name: 'Avada Kedavra',
    icon: '💀',
    sprite: 'character/jobs/paid/Slytherin/Char 1/sprites/skill/serpent_fang.webp',
    description: 'Kutukan tak terampuni yang paling ditakuti di dunia sihir. Menembus semua pertahanan sekaligus.',
    flavor: 'Tidak ada counter-curse untuk yang satu ini.',
    weight: 15,
    damage: [80, 130],
    effects: [
      { type: 'armor_pierce', amount: 0.30, label: '💀 Unforgivable (+30% pierce)' },
      { type: 'bonus_xp', amount: 20, label: '✨ +20 XP bonus' }
    ]
  },
  {
    id: 'crucio',
    name: 'Crucio',
    icon: '🔥',
    sprite: 'character/jobs/paid/Slytherin/Char 1/sprites/skill/dark_ambition.webp',
    description: 'Kutukan Cruciatus menyiksa musuh hingga tak berdaya. Rasa sakit yang terus menggerogoti di setiap serangan berikutnya.',
    flavor: 'Penderitaan adalah senjata paling ampuh.',
    weight: 35,
    damage: [40, 70],
    effects: [
      { type: 'debuff_dot', amount: 20, duration: 3, label: '😵 Cruciatus (+20 dmg, 3 task)' },
      { type: 'double_hit', chance: 0.20, label: '🌀 Torment! (extra hit)' }
    ]
  },
  {
    id: 'legilimens',
    name: 'Legilimens',
    icon: '🐍',
    sprite: 'character/jobs/paid/Slytherin/Char 1/sprites/skill/cunning_strike.webp',
    description: 'Menyelami pikiran musuh dan menyerangnya dari dalam. Serangan presisi yang menyerap energi lawan.',
    flavor: 'Pikiran adalah medan perang yang sesungguhnya.',
    weight: 50,
    damage: [28, 55],
    effects: [
      { type: 'xp_drain', amount: 18, label: '🐍 Mind Drain (+18 XP)' },
      { type: 'critical', chance: 0.25, multiplier: 2.2, label: '⚡ LEGILIMENS CRIT!' }
    ]
  }
]);
