// ═══════════════════════════════════════════════════════════════
//  JOB SKILLS — Knight
//  Kesatria disiplin. Senjata: perisai, pedang, teknik tempur terlatih.
//  Identity: armor pierce tinggi, damage stabil, sesekali double hit dari momentum.
// ═══════════════════════════════════════════════════════════════

CT_JobSkills.register('knight', [
  {
    id: 'shield_bash',
    name: 'Shield Bash',
    icon: '🛡️',
    sprite: 'character/jobs/normal/knight/sprites/skill/shield_bash.webp',
    description: 'Hantaman perisai baja langsung ke badan musuh. Bukan elegan — tapi sangat efektif.',
    flavor: 'Perisai bukan hanya untuk bertahan. Itu juga senjata.',
    weight: 55,
    damage: [28, 50],
    effects: [
      { type: 'armor_pierce', amount: 0.08, label: '🛡️ Shield Impact (+8% dmg)' },
      { type: 'debuff_dot', amount: 8, duration: 1, label: '🗡️ Dazed (+8 dmg next task)' }
    ]
  },
  {
    id: 'precision_slash',
    name: 'Precision Slash',
    icon: '⚔️',
    sprite: 'character/jobs/normal/knight/sprites/skill/crusader_slash.webp',
    description: 'Tebasan presisi ke celah armor musuh. Teknik yang hanya bisa dilakukan dengan disiplin tinggi.',
    flavor: 'Bukan soal keberanian saja. Tapi keyakinan di setiap ayunan.',
    weight: 30,
    damage: [42, 72],
    effects: [
      { type: 'armor_pierce', amount: 0.18, label: '⚔️ Armor Cleave (+18% dmg)' }
    ]
  },
  {
    id: 'cavalry_charge',
    name: 'Cavalry Charge',
    icon: '🏇',
    sprite: 'character/jobs/normal/knight/sprites/skill/holy_charge.webp',
    description: 'Serangan momentum penuh — menghantam keras dan langsung menyerang lagi dari sudut berbeda.',
    flavor: 'Seorang kesatria tidak menyerang — ia menghancurkan.',
    weight: 15,
    damage: [60, 110],
    effects: [
      { type: 'critical', chance: 0.22, multiplier: 2.0, label: '🏇 Charge Critical!' },
      { type: 'double_hit', chance: 0.30, label: '💥 Second Charge! (extra hit)' }
    ]
  }
]);
