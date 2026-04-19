// ═══════════════════════════════════════════════════════════════
//  JOB SKILLS — Alchemist
//  Ilmuwan gila yang melempar ramuan dan eksperimen ke musuh.
//  Damage beragam, efek debuff_dot (racun/asam), bonus XP dari eksperimen.
// ═══════════════════════════════════════════════════════════════

CT_JobSkills.register('alchemist', [
  {
    id: 'acid_vial',
    name: 'Acid Vial',
    icon: '🧪',
    sprite: 'character/jobs/normal/alchemist/sprites/skill/acid_vial.webp',
    description: 'Melempar botol asam yang perlahan menggerogoti tubuh musuh. Damage berlanjut di serangan berikutnya.',
    flavor: 'Kimia tidak perlu buru-buru. Ia bekerja dengan caranya sendiri.',
    weight: 55,
    damage: [20, 38],
    effects: [
      { type: 'debuff_dot', amount: 10, duration: 2, label: '🧪 Acid Burn (+10 dmg, 2 task)' }
    ]
  },
  {
    id: 'explosive_flask',
    name: 'Explosive Flask',
    icon: '💣',
    sprite: 'character/jobs/normal/alchemist/sprites/skill/explosive_flask.webp',
    description: 'Ramuan peledak yang tidak selalu meledak tepat waktu — tapi ketika meledak, efeknya luar biasa.',
    flavor: 'Bahan bakar + oksigen + ide gila = boom.',
    weight: 30,
    damage: [32, 65],
    effects: [
      { type: 'variance', variance: 0.30, label: '💣 Unstable Mix (±30%)' },
      { type: 'critical', chance: 0.15, multiplier: 1.8, label: '💥 Overload Explosion!' }
    ]
  },
  {
    id: 'philosopher_stone',
    name: "Philosopher's Stone",
    icon: '💎',
    sprite: 'character/jobs/normal/alchemist/sprites/skill/philosopher_stone.webp',
    description: 'Energi dari batu filsuf mengubah usaha menjadi kekuatan murni. Serangan terkuat Alchemist dengan racun pekat.',
    flavor: 'Emas bukan yang paling berharga yang bisa dihasilkan batu ini.',
    weight: 15,
    damage: [55, 95],
    effects: [
      { type: 'critical', chance: 0.25, multiplier: 2.2, label: '💎 Transmutation Crit!' },
      { type: 'bonus_xp', amount: 12, label: '✨ +12 XP bonus' },
      { type: 'debuff_dot', amount: 18, duration: 3, label: '⚗️ Corrupted (+18 dmg, 3 task)' }
    ]
  }
]);
