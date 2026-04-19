// ═══════════════════════════════════════════════════════════════
//  JOB SKILLS — Sage
//  Orang bijak yang menggunakan hukum alam sebagai senjata.
//  Damage konsisten, debuff_dot terkuat di semua job, bonus XP dari kebijaksanaan.
// ═══════════════════════════════════════════════════════════════

CT_JobSkills.register('sage', [
  {
    id: 'nature_bind',
    name: 'Nature Bind',
    icon: '🌿',
    sprite: 'character/jobs/normal/sage/sprites/skill/nature_bind.webp',
    description: 'Memanggil akar alam untuk mencekik musuh dari dalam. Luka perlahan yang terus mengalir.',
    flavor: 'Alam tidak terburu-buru, namun semuanya selesai tepat waktu.',
    weight: 60,
    damage: [20, 36],
    effects: [
      { type: 'debuff_dot', amount: 8, duration: 2, label: '🌿 Nature Wound (+8 dmg, 2 task)' }
    ]
  },
  {
    id: 'arcane_torrent',
    name: 'Arcane Torrent',
    icon: '🌊',
    sprite: 'character/jobs/normal/sage/sprites/skill/arcane_torrent.webp',
    description: 'Arus energi arkana yang terus-menerus mengalir. Damage bertumpuk semakin lama semakin kuat.',
    flavor: 'Seperti sungai — pelan di awal, tak tertahankan di akhir.',
    weight: 25,
    damage: [35, 60],
    effects: [
      { type: 'debuff_dot', amount: 15, duration: 3, label: '🌊 Mana Torrent (+15 dmg, 3 task)' },
      { type: 'variance', variance: 0.15, label: '🎲 Flow Variance' }
    ]
  },
  {
    id: 'world_will',
    name: 'World Will',
    icon: '🌍',
    sprite: 'character/jobs/normal/sage/sprites/skill/world_will.webp',
    description: 'Menggunakan kehendak alam semesta sebagai senjata. Damage masif dengan luka alam yang tak terhapus.',
    flavor: 'Ketika kebijaksanaan mencapai puncaknya, semesta sendiri yang menyerang.',
    weight: 15,
    damage: [58, 95],
    effects: [
      { type: 'critical', chance: 0.22, multiplier: 2.1, label: '🌍 Worldshatter!' },
      { type: 'debuff_dot', amount: 20, duration: 3, label: '💀 World Scar (+20 dmg, 3 task)' }
    ]
  }
]);
