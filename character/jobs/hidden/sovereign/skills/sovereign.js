// ═══════════════════════════════════════════════════════════════
//  JOB SKILLS — Sovereign (Hidden Job)
//  Raja/Ratu tertinggi yang memerintah dengan kekuasaan absolut.
//  Damage tertinggi di semua job, efek ganda, bonus XP besar.
//  Unlock: mencapai Level 30.
// ═══════════════════════════════════════════════════════════════

CT_JobSkills.register('sovereign', [
  {
    id: 'royal_decree',
    name: 'Royal Decree',
    icon: '👑',
    sprite: 'character/jobs/hidden/sovereign/sprites/skill/royal_decree.webp',
    description: 'Perintah kerajaan yang mengubah kenyataan di medan tempur. Musuh tidak punya pilihan selain menerima.',
    flavor: 'Seorang penguasa tidak meminta. Ia memerintah.',
    weight: 50,
    damage: [35, 60],
    effects: [
      { type: 'armor_pierce', amount: 0.15, label: '👑 Royal Authority (+15%)' },
      { type: 'bonus_xp', amount: 8, label: '✨ +8 XP bonus' }
    ]
  },
  {
    id: 'sovereign_wrath',
    name: 'Sovereign Wrath',
    icon: '⚔️',
    sprite: 'character/jobs/hidden/sovereign/sprites/skill/sovereign_wrath.webp',
    description: 'Amarah seorang penguasa dilampiaskan langsung. Serangan ganda yang meninggalkan luka berkepanjangan.',
    flavor: 'Ada perbedaan antara kemarahan biasa dan kemarahan seseorang yang berkuasa.',
    weight: 30,
    damage: [60, 100],
    effects: [
      { type: 'rage', buff_amount: 0.18, label: '🔥 Royal Rage (+18% dmg)' },
      { type: 'debuff_dot', amount: 18, duration: 2, label: '👁️ Subjugated (+18 dmg, 2 task)' },
      { type: 'bonus_xp', amount: 15, label: '✨ +15 XP bonus' }
    ]
  },
  {
    id: 'absolute_dominion',
    name: 'Absolute Dominion',
    icon: '🌌',
    sprite: 'character/jobs/hidden/sovereign/sprites/skill/absolute_dominion.webp',
    description: 'Penguasaan absolut atas medan perang. Serangan yang tidak dapat dihindari, tidak dapat diblokir.',
    flavor: 'Di tingkat ini, pertarungan sudah selesai sebelum dimulai.',
    weight: 20,
    damage: [90, 150],
    effects: [
      { type: 'critical', chance: 0.30, multiplier: 2.6, label: '🌌 ABSOLUTE CRIT!' },
      { type: 'armor_pierce', amount: 0.35, label: '💥 Dominion Break (+35%)' },
      { type: 'double_hit', chance: 0.30, label: '👑 Royal Echo (extra hit)' },
      { type: 'bonus_xp', amount: 25, label: '✨ +25 XP bonus' }
    ]
  }
]);
