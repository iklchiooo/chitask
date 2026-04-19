// ═══════════════════════════════════════════════════════════════
//  JOB SKILLS — Warrior
//  Pejuang fisik murni. Senjata: pedang besar, kapak, badan sendiri.
//  Identity: damage paling tinggi dari 3 job dasar, serangan kasar,
//  rage burst, bisa double hit dari momentum berserker.
// ═══════════════════════════════════════════════════════════════

CT_JobSkills.register('Warrior', [
  {
    id: 'iron_strike',
    name: 'Iron Strike',
    icon: '⚔️',
    sprite: 'character/jobs/normal/warrior/sprites/skill/iron_strike.webp',
    description: 'Hantaman besi langsung ke badan musuh. Tidak ada teknik — hanya kekuatan murni.',
    flavor: 'Bukan soal gaya. Soal kekuatan.',
    weight: 60,
    damage: [30, 52],
    effects: [
      { type: 'armor_pierce', amount: 0.10, label: '🛡️ Armor Crush (+10% dmg)' }
    ]
  },
  {
    id: 'battle_cry',
    name: 'Battle Cry',
    icon: '🔥',
    sprite: 'character/jobs/normal/warrior/sprites/skill/battle_cry.webp',
    description: 'Teriakan perang yang membakar adrenalin — serangan ini keluar jauh lebih keras dari biasanya.',
    flavor: 'Suara yang cukup keras bisa mematahkan semangat sebelum pukulan pertama.',
    weight: 25,
    damage: [40, 72],
    effects: [
      { type: 'rage', buff_amount: 0.15, label: '😤 Enraged! (+15% hit ini)' },
      { type: 'debuff_dot', amount: 10, duration: 1, label: '💢 Shaken (+10 dmg next)' }
    ]
  },
  {
    id: 'berserker_rush',
    name: 'Berserker Rush',
    icon: '💥',
    sprite: 'character/jobs/normal/warrior/sprites/skill/berserker_rush.webp',
    description: 'Menerjang dengan seluruh bobot tubuh — menghantam keras lalu langsung menyerang lagi.',
    flavor: 'Ada momen ketika rasa sakit sudah tidak relevan lagi.',
    weight: 15,
    damage: [65, 115],
    effects: [
      { type: 'critical', chance: 0.25, multiplier: 2.2, label: '💀 Berserk Crit!' },
      { type: 'double_hit', chance: 0.30, label: '💥 Rush Follow-up (extra hit)' }
    ]
  }
]);
