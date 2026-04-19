// ═══════════════════════════════════════════════════════════════
//  JOB SKILLS — Hunter
//  "Pemburu pengalaman" — haus ilmu, haus level, haus petualangan.
//  Senjata: panah/busur (ranged), jebakan, insting predator.
//  Identity: serangan jarak jauh, poison trap (debuff_dot), crit dari blind spot.
//  NOTE: Hunter pakai BOW & TRAP, bukan buku. Scholar yang pakai pena/tinta.
// ═══════════════════════════════════════════════════════════════

CT_JobSkills.register('Hunter', [
  {
    id: 'arrow_shot',
    name: 'Arrow Shot',
    icon: '🏹',
    sprite: 'character/jobs/normal/Hunter/sprites/skill/ink_bolt.webp',
    description: 'Anak panah yang diluncurkan tepat ke titik lemah musuh. Akurat dan konsisten.',
    flavor: 'Pemburu yang baik tidak menembak sembarangan.',
    weight: 60,
    damage: [20, 36],
    effects: [
      { type: 'critical', chance: 0.12, multiplier: 1.6, label: '🎯 Bullseye Crit!' }
    ]
  },
  {
    id: 'venom_trap',
    name: 'Venom Trap',
    icon: '🪤',
    sprite: 'character/jobs/normal/Hunter/sprites/skill/tome_slam.webp',
    description: 'Memasang jebakan racun yang melukai musuh terus-menerus setelah terkena.',
    flavor: 'Jebakan terbaik adalah yang tidak pernah terlihat sampai terlambat.',
    weight: 28,
    damage: [25, 48],
    effects: [
      { type: 'debuff_dot', amount: 14, duration: 3, label: '🪤 Venom Trap (+14 dmg, 3 task)' }
    ]
  },
  {
    id: 'predator_instinct',
    name: 'Predator Instinct',
    icon: '🐾',
    sprite: 'character/jobs/normal/Hunter/sprites/skill/ancient_formula.webp',
    description: 'Insting predator yang memuncak — menyerang dua kali cepat dari arah berbeda.',
    flavor: 'Ilmu yang cukup lama dibiarkan mengendap bisa menjadi insting.',
    weight: 12,
    damage: [42, 72],
    effects: [
      { type: 'double_hit', chance: 0.40, label: '🐾 Twin Strike! (extra hit)' },
      { type: 'bonus_xp', amount: 10, label: '✨ +10 XP bonus' }
    ]
  }
]);
