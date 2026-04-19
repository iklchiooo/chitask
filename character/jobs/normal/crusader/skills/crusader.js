// ═══════════════════════════════════════════════════════════════
//  JOB SKILLS — Crusader
//  Kesatria pelindung yang menyerang dengan perisai dan pedang.
//  Armor pierce terkuat, damage stabil, sesekali double hit dari momentum.
// ═══════════════════════════════════════════════════════════════

CT_JobSkills.register('crusader', [
  {
    id: 'shield_bash',
    name: 'Shield Bash',
    icon: '🛡️',
    sprite: 'character/jobs/normal/crusader/sprites/skill/shield_bash.webp',
    description: 'Menghantam musuh dengan perisai baja berat. Meninggalkan luka tumpul yang terasa di serangan berikutnya.',
    flavor: 'Perisai bukan hanya untuk bertahan. Itu juga senjata.',
    weight: 55,
    damage: [28, 48],
    effects: [
      { type: 'armor_pierce', amount: 0.07, label: '🛡️ Shield Impact (+7% dmg)' },
      { type: 'debuff_dot', amount: 8, duration: 1, label: '💢 Dazed (+8 dmg next task)' }
    ]
  },
  {
    id: 'crusader_slash',
    name: 'Crusader Slash',
    icon: '⚔️',
    sprite: 'character/jobs/normal/crusader/sprites/skill/crusader_slash.webp',
    description: 'Tebasan lebar yang menembus pertahanan musuh dengan kekuatan penuh.',
    flavor: 'Bukan soal keberanian saja. Tapi soal keyakinan di setiap ayunan.',
    weight: 30,
    damage: [42, 72],
    effects: [
      { type: 'armor_pierce', amount: 0.15, label: '⚔️ Armor Cleave (+15% dmg)' },
      { type: 'double_hit', chance: 0.20, label: '🗡️ Follow-up Strike (extra hit)' }
    ]
  },
  {
    id: 'holy_charge',
    name: 'Holy Charge',
    icon: '🏇',
    sprite: 'character/jobs/normal/crusader/sprites/skill/holy_charge.webp',
    description: 'Serangan penuh kuda perang dan cahaya suci. Menghancurkan pertahanan dan langsung menyerang lagi.',
    flavor: 'Seorang kesatria tidak menyerang — ia menghancurkan.',
    weight: 15,
    damage: [65, 115],
    effects: [
      { type: 'critical', chance: 0.20, multiplier: 2.0, label: '🏇 Charge Critical!' },
      { type: 'armor_pierce', amount: 0.20, label: '💥 Full Breach (+20% dmg)' },
      { type: 'double_hit', chance: 0.25, label: '✝️ Holy Echo (extra hit)' }
    ]
  }
]);
