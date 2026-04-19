// ═══════════════════════════════════════════════════════════════
//  CT_JobSkills — Job Skill Engine v2
//
//  Cara kerja:
//  1. Tiap file [job].js memanggil CT_JobSkills.register(jobId, skillArray)
//  2. Saat task selesai, boss.js memanggil CT_JobSkills.rollSkill(jobId)
//     yang mengembalikan skill terpilih + damage + efek aktif
//  3. Damage dari rollSkill menggantikan flat damage lama
//
//  EFFECT_TYPES yang tersedia (SEMUA berefek nyata ke boss):
//  { type:'critical',    chance:0-1, multiplier:number, label:string }
//      → Damage dikalikan multiplier jika proc
//
//  { type:'variance',    variance:0-1, label:string }
//      → Damage ±variance% secara random
//
//  { type:'armor_pierce', amount:0-1, label:string }
//      → Damage bonus flat % dari hit ini
//
//  { type:'double_hit',  chance:0-1, label:string }
//      → Chance untuk hit kedua (50% dari damage utama)
//      → MENGGANTIKAN stun_chance yang tidak ada efek gameplay
//
//  { type:'debuff_dot',  amount:number, duration:number, label:string }
//      → Menyimpan bonus damage ke bossState._debuffStacks
//      → Tiap task berikutnya: damage += amount (selama duration task)
//      → MENGGANTIKAN debuff defense/speed yang tidak diterapkan
//
//  { type:'rage',        buff_amount:0-1, label:string }
//      → Damage hit INI dikalikan (1 + buff_amount)
//      → Jujur: efek berlaku sekarang, bukan persist
//
//  { type:'xp_drain',    amount:number, label:string }
//      → Bonus XP + rasa "menyerap" energi musuh
//      → MENGGANTIKAN recoil yang cosmetic-only
//
//  { type:'bonus_xp',    amount:number, label:string }
//      → Bonus XP saat skill ini muncul
// ═══════════════════════════════════════════════════════════════

var CT_JobSkills = (function () {

  var _registry = {};   // { jobId: [skillDef, ...] }
  var _lastRoll = null; // cache hasil roll terakhir untuk display

  // ── Register skills for a job ─────────────────────────────────
  function register(jobId, skills) {
    if (!jobId || !Array.isArray(skills)) {
      console.warn('[CT_JobSkills] register: jobId dan skills array wajib ada');
      return;
    }
    _registry[jobId] = skills;
    console.log('[CT_JobSkills] Registered', skills.length, 'skills for', jobId);
  }

  // ── Weighted random pick ──────────────────────────────────────
  function _weightedPick(skills) {
    var total = skills.reduce(function (s, sk) { return s + (sk.weight || 1); }, 0);
    var r = Math.random() * total;
    var acc = 0;
    for (var i = 0; i < skills.length; i++) {
      acc += skills[i].weight || 1;
      if (r < acc) return skills[i];
    }
    return skills[skills.length - 1];
  }

  // ── Apply pending debuff_dot stacks to damage ─────────────────
  // Dipanggil dari boss.js sebelum _rollJobDamage untuk ambil bonus
  function popDebuffBonus() {
    if (typeof bossState === 'undefined') return 0;
    if (!bossState._debuffStacks || bossState._debuffStacks.length === 0) return 0;
    var bonus = 0;
    var remaining = [];
    bossState._debuffStacks.forEach(function(stack) {
      bonus += stack.amount;
      stack.duration--;
      if (stack.duration > 0) remaining.push(stack);
    });
    bossState._debuffStacks = remaining;
    return Math.round(bonus);
  }

  // ── Resolve all effects and compute final damage ──────────────
  function _resolveEffects(skill) {
    var baseDmg = skill.damage[0] + Math.random() * (skill.damage[1] - skill.damage[0]);
    var finalDmg = baseDmg;
    var activeEffects = [];
    var bonusXP = 0;
    var extraHit = 0;

    (skill.effects || []).forEach(function (eff) {
      switch (eff.type) {

        case 'critical':
          if (Math.random() < eff.chance) {
            finalDmg *= eff.multiplier;
            activeEffects.push(eff.label);
          }
          break;

        case 'variance':
          var v = (Math.random() * 2 - 1) * eff.variance;
          finalDmg *= (1 + v);
          if (Math.abs(v) > eff.variance * 0.5) activeEffects.push(eff.label);
          break;

        case 'armor_pierce':
          finalDmg *= (1 + eff.amount);
          activeEffects.push(eff.label);
          break;

        case 'double_hit':
          // Chance untuk extra hit 50% dari damage utama
          if (Math.random() < eff.chance) {
            extraHit = Math.round(finalDmg * 0.5);
            activeEffects.push(eff.label);
          }
          break;

        case 'debuff_dot':
          // Simpan ke bossState._debuffStacks — berlaku di task-task berikutnya
          if (typeof bossState !== 'undefined') {
            if (!bossState._debuffStacks) bossState._debuffStacks = [];
            bossState._debuffStacks.push({
              amount: eff.amount,
              duration: eff.duration
            });
            if (typeof bossSave === 'function') bossSave();
          }
          activeEffects.push(eff.label);
          break;

        case 'rage':
          // Damage hit ini dikalikan
          finalDmg *= (1 + eff.buff_amount);
          activeEffects.push(eff.label);
          break;

        case 'xp_drain':
          // Bonus XP dari "menyerap" energi musuh — menggantikan recoil cosmetic
          bonusXP += eff.amount;
          activeEffects.push(eff.label);
          break;

        case 'bonus_xp':
          bonusXP += eff.amount;
          activeEffects.push(eff.label);
          break;
      }
    });

    var mainDmg = Math.round(finalDmg);
    return {
      damage: mainDmg + extraHit,
      mainDamage: mainDmg,
      extraHit: extraHit,
      activeEffects: activeEffects,
      bonusXP: bonusXP
    };
  }

  // ── Public: roll a skill for the given job ────────────────────
  function rollSkill(jobId) {
    var skills = _registry[jobId];
    if (!skills || skills.length === 0) {
      _lastRoll = {
        skill: { id: 'basic_attack', name: 'Basic Attack', icon: '⚔️', sprite: '' },
        damage: 70 + Math.floor(Math.random() * 51),
        activeEffects: [],
        bonusXP: 0
      };
      return _lastRoll;
    }

    var skill = _weightedPick(skills);
    var resolved = _resolveEffects(skill);

    // Tambahkan bonus dari debuff_dot stacks sebelumnya
    var dotBonus = popDebuffBonus();
    if (dotBonus > 0) {
      resolved.damage += dotBonus;
    }

    _lastRoll = {
      skill: skill,
      damage: resolved.damage,
      activeEffects: resolved.activeEffects,
      bonusXP: resolved.bonusXP
    };
    return _lastRoll;
  }

  function getLastRoll() { return _lastRoll; }
  function getSkills(jobId) { return _registry[jobId] || []; }
  function getRegisteredJobs() { return Object.keys(_registry); }

  return {
    register: register,
    rollSkill: rollSkill,
    popDebuffBonus: popDebuffBonus,
    getLastRoll: getLastRoll,
    getSkills: getSkills,
    getRegisteredJobs: getRegisteredJobs
  };

})();
