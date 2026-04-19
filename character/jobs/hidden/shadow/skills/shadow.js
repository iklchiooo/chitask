// ═══════════════════════════════════════════════════════════════
//  JOB SKILLS — Shadow Walker (Hidden Job)
//  Assassin bayangan yang menyerang dari kegelapan.
//  Critical rate tertinggi, damage burst, poison dari bayangan.
//  Unlock: 7 hari perfect day berturut-turut.
// ═══════════════════════════════════════════════════════════════

CT_JobSkills.register('shadow', [
  {
    id: 'shadow_step',
    name: 'Shadow Step',
    icon: '👣',
    sprite: 'character/jobs/hidden/shadow/sprites/skill/shadow_step.webp',
    description: 'Bergerak dalam bayangan dan menyerang dari titik buta musuh. Hampir tidak terdeteksi.',
    flavor: 'Langkah terbaik adalah yang tidak pernah terdengar.',
    weight: 50,
    damage: [25, 48],
    effects: [
      { type: 'critical', chance: 0.18, multiplier: 1.8, label: '👣 Backstab Crit!' },
      { type: 'debuff_dot', amount: 8, duration: 2, label: '🩸 Shadow Wound (+8 dmg, 2 task)' }
    ]
  },
  {
    id: 'void_slash',
    name: 'Void Slash',
    icon: '🌑',
    sprite: 'character/jobs/hidden/shadow/sprites/skill/void_slash.webp',
    description: 'Tebasan dari dimensi bayangan yang menembus pertahanan fisik sepenuhnya.',
    flavor: 'Kegelapan bukan absensi cahaya. Ia adalah senjata tersendiri.',
    weight: 30,
    damage: [45, 80],
    effects: [
      { type: 'armor_pierce', amount: 0.22, label: '🌑 Void Pierce (+22% dmg)' },
      { type: 'double_hit', chance: 0.25, label: '🕳️ Shadow Echo (extra hit)' }
    ]
  },
  {
    id: 'death_mark',
    name: 'Death Mark',
    icon: '💀',
    sprite: 'character/jobs/hidden/shadow/sprites/skill/death_mark.webp',
    description: 'Menandai musuh untuk kematian. Racun bayangan yang meledak sekaligus dalam serangan fatal.',
    flavor: 'Tidak ada yang lebih menakutkan dari bayangan yang diam.',
    weight: 20,
    damage: [65, 120],
    effects: [
      { type: 'critical', chance: 0.35, multiplier: 2.8, label: '💀 MARKED FOR DEATH!' },
      { type: 'armor_pierce', amount: 0.30, label: '🩸 Lethal Pierce (+30%)' },
      { type: 'debuff_dot', amount: 25, duration: 2, label: '☠️ Death Poison (+25 dmg, 2 task)' }
    ]
  }
]);
