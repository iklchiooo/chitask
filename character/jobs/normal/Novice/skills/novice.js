// ═══════════════════════════════════════════════════════════════
//  JOB SKILLS — Novice
//  Pemula serba bisa. Senjata: apapun yang tersedia.
//  Identity: damage random, sesekali lucky, belajar dari setiap serangan.
// ═══════════════════════════════════════════════════════════════

CT_JobSkills.register('Novice', [
  {
    id: 'quick_stab',
    name: 'Quick Stab',
    icon: '🗡️',
    sprite: 'character/jobs/normal/Novice/sprites/skill/quick_stab.webp',
    description: 'Tusukan cepat dari jarak dekat. Serangan andalan pemula yang andal.',
    flavor: 'Tidak elegan, tapi cukup untuk meninggalkan bekas.',
    weight: 60,
    damage: [20, 38],
    effects: [
      { type: 'critical', chance: 0.07, multiplier: 1.5, label: '⚡ Lucky Stab!' }
    ]
  },
  {
    id: 'bold_charge',
    name: 'Bold Charge',
    icon: '💨',
    sprite: 'character/jobs/normal/Novice/sprites/skill/bold_charge.webp',
    description: 'Bergegas maju tanpa rencana. Kadang menghantam keras, kadang sedikit meleset.',
    flavor: 'Keberanian lebih penting dari akurasi.',
    weight: 30,
    damage: [18, 60],
    effects: [
      { type: 'variance', variance: 0.25, label: '🎲 Wild Swing (±25%)' }
    ]
  },
  {
    id: 'survival_instinct',
    name: 'Survival Instinct',
    icon: '🌟',
    sprite: 'character/jobs/normal/Novice/sprites/skill/survival_instinct.webp',
    description: 'Naluri bertahan hidup memuncak — menyerang dua kali dari insting murni.',
    flavor: 'Tidak ada yang lebih berbahaya dari seseorang yang baru saja belajar kekuatannya.',
    weight: 10,
    damage: [45, 78],
    effects: [
      { type: 'double_hit', chance: 0.30, label: '💥 Instinct Double! (extra hit)' },
      { type: 'bonus_xp', amount: 5, label: '✨ +5 XP bonus' }
    ]
  }
]);
