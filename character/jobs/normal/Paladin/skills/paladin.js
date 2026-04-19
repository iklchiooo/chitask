// ═══════════════════════════════════════════════════════════════
//  JOB SKILLS — Paladin
//  Penjaga kesehatan jiwa dan raga. Senjata: gada suci, perisai cahaya,
//  sinar penyembuh yang dibalikkan jadi serangan.
//  Identity: damage medium, bonus XP besar, life drain, efek suci.
// ═══════════════════════════════════════════════════════════════

CT_JobSkills.register('paladin', [
  {
    id: 'holy_smite',
    name: 'Holy Smite',
    icon: '✨',
    sprite: 'character/jobs/normal/paladin/sprites/skill/holy_smite.webp',
    description: 'Gada suci yang diayunkan dengan energi cahaya. Membakar ketidakmurnian musuh.',
    flavor: 'Cahaya tidak meminta izin untuk menyinari kegelapan.',
    weight: 60,
    damage: [18, 34],
    effects: [
      { type: 'bonus_xp', amount: 6, label: '✨ Blessed Task (+6 XP)' }
    ]
  },
  {
    id: 'radiant_wave',
    name: 'Radiant Wave',
    icon: '🌟',
    sprite: 'character/jobs/normal/paladin/sprites/skill/radiant_wave.webp',
    description: 'Gelombang energi suci yang melemahkan musuh secara berkelanjutan.',
    flavor: 'Apa yang menyembuhkan juga bisa meluka, tergantung niat di baliknya.',
    weight: 25,
    damage: [30, 54],
    effects: [
      { type: 'debuff_dot', amount: 12, duration: 2, label: '💫 Radiant Break (+12 dmg, 2 task)' },
      { type: 'bonus_xp', amount: 10, label: '✨ +10 XP bonus' }
    ]
  },
  {
    id: 'divine_judgment',
    name: 'Divine Judgment',
    icon: '⚡',
    sprite: 'character/jobs/normal/paladin/sprites/skill/divine_judgment.webp',
    description: 'Hukuman ilahi yang tidak bisa dihindari. Serangan terkuat Paladin.',
    flavor: 'Belas kasih memiliki batas. Setelah itu — penghakiman.',
    weight: 15,
    damage: [48, 78],
    effects: [
      { type: 'critical', chance: 0.20, multiplier: 2.0, label: '⚡ Divine Wrath!' },
      { type: 'double_hit', chance: 0.18, label: '😇 Sacred Echo (extra hit)' },
      { type: 'bonus_xp', amount: 14, label: '✨ +14 XP bonus' }
    ]
  }
]);
