// ═══════════════════════════════════════════════════════════════
//  JOB SKILLS — Archmage
//  Penyihir agung dengan kekuatan sihir tertinggi di antara semua job normal.
//  Damage tinggi, crit kuat, efek ganda — tapi sesekali mana overload (debuff_dot diri).
// ═══════════════════════════════════════════════════════════════

CT_JobSkills.register('archmage', [
  {
    id: 'mana_bolt',
    name: 'Mana Bolt',
    icon: '🔮',
    sprite: 'character/jobs/normal/archmage/sprites/skill/mana_bolt.webp',
    description: 'Tembakan energi mana terkonsentrasi. Cepat, presisi, dan menembus pertahanan.',
    flavor: 'Sihir yang paling efisien adalah yang tidak buang-buang kata.',
    weight: 55,
    damage: [30, 52],
    effects: [
      { type: 'critical', chance: 0.10, multiplier: 1.7, label: '🔮 Mana Crit!' },
      { type: 'armor_pierce', amount: 0.10, label: '✨ Magic Pierce (+10%)' }
    ]
  },
  {
    id: 'arcane_storm',
    name: 'Arcane Storm',
    icon: '⚡',
    sprite: 'character/jobs/normal/archmage/sprites/skill/arcane_storm.webp',
    description: 'Badai arkana yang menerjang musuh dari segala arah. Meninggalkan luka energi yang terus menggerogoti.',
    flavor: 'Ada alasan "badai" selalu di akhir nama-nama mantra arkana.',
    weight: 28,
    damage: [48, 85],
    effects: [
      { type: 'variance', variance: 0.20, label: '⚡ Storm Surge (±20%)' },
      { type: 'debuff_dot', amount: 12, duration: 2, label: '🌪️ Static Burn (+12 dmg, 2 task)' }
    ]
  },
  {
    id: 'extinction_spell',
    name: 'Extinction Spell',
    icon: '☄️',
    sprite: 'character/jobs/normal/archmage/sprites/skill/extinction_spell.webp',
    description: 'Mantra kepunahan yang membutuhkan seluruh cadangan mana. Damage paling besar dari semua job normal.',
    flavor: 'Beberapa mantra tidak bisa diulang — bukan karena dilarang, tapi karena melelahkan.',
    weight: 17,
    damage: [75, 130],
    effects: [
      { type: 'critical', chance: 0.28, multiplier: 2.5, label: '☄️ EXTINCTION CRIT!' },
      { type: 'armor_pierce', amount: 0.25, label: '💀 Total Bypass (+25% dmg)' },
      { type: 'xp_drain', amount: 8, label: '🌀 Mana Surge (+8 XP)' }
    ]
  }
]);
