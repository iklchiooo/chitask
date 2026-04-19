// ═══════════════════════════════════════════════════════════════
//  JOB SKILLS — Bard
//  Penghibur yang menggunakan musik dan kata-kata sebagai senjata.
//  Damage penuh RNG, bonus XP tinggi, sesekali double hit dari hype.
// ═══════════════════════════════════════════════════════════════

CT_JobSkills.register('bard', [
  {
    id: 'ballad_strike',
    name: 'Ballad Strike',
    icon: '🎵',
    sprite: 'character/jobs/normal/bard/sprites/skill/ballad_strike.webp',
    description: 'Melantunkan lagu perang yang resonansinya langsung menghantam musuh. Kadang memang keluar fals.',
    flavor: 'Tidak semua nada perlu tepat. Cukup cukup keras.',
    weight: 55,
    damage: [15, 45],
    effects: [
      { type: 'variance', variance: 0.25, label: '🎵 Off-Key Swing (±25%)' },
      { type: 'bonus_xp', amount: 4, label: '✨ +4 XP bonus' }
    ]
  },
  {
    id: 'encore',
    name: 'Encore!',
    icon: '🎭',
    sprite: 'character/jobs/normal/bard/sprites/skill/encore.webp',
    description: 'Penampilan ulang yang lebih keras dari sebelumnya — energi penonton membakar serangan berikutnya.',
    flavor: '"Satu lagi!" — kata semua orang kecuali yang sedang dihajar.',
    weight: 30,
    damage: [30, 62],
    effects: [
      { type: 'rage', buff_amount: 0.15, label: '🎭 Crowd Pumped! (+15% dmg)' },
      { type: 'debuff_dot', amount: 8, duration: 2, label: '🔊 Ear-Splitting! (+8 dmg, 2 task)' }
    ]
  },
  {
    id: 'legendary_performance',
    name: 'Legendary Performance',
    icon: '🎸',
    sprite: 'character/jobs/normal/bard/sprites/skill/legendary_performance.webp',
    description: 'Solo legendaris yang menghancurkan semangat musuh. Serangan ganda dari hype yang meluap-luap.',
    flavor: 'Ada momen ketika musik bukan hiburan — tapi kehancuran.',
    weight: 15,
    damage: [50, 100],
    effects: [
      { type: 'critical', chance: 0.30, multiplier: 2.3, label: '🎸 Standing Ovation Crit!' },
      { type: 'double_hit', chance: 0.25, label: '🎶 Encore Strike! (extra hit)' },
      { type: 'bonus_xp', amount: 10, label: '✨ +10 XP bonus' }
    ]
  }
]);
