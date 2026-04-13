// ══════════════════════════════════════════════
// ⚔️ BOSS: Master Wacana (wacana)
// Canvas: 120×120, P=4, origin translate(60, 66)
// Batas aman: X -15..+15, Y -16..+13
// ══════════════════════════════════════════════
CT_Boss.register({
  id:     'wacana',
  name:   'Master Wacana',
  sub:    'Planus Infinitus · Tier A',
  maxHp:  850,
  col:    '#10b981',
  glow:   '#6ee7b7',
  aura:   'rgba(16,185,129,0.30)',
  death:  'WACANA DIKALAHKAN!\nEksekusi mengalahkan seribu rencana! 🚀',

  phrase: [
    'Nanti deh kalau udah ada modal...',
    'Ide ini bagus banget, tinggal dijalanin... besok deh...',
    'Gue udah tau mau ngapain, tinggal mulai aja...',
    'Kalau gue serius jalanin ini, pasti berhasil...',
    'Udah gue omongin ke semua orang, tinggal action-nya...',
    'Rencananya udah mateng di kepala, belum sempet ditulis aja...',
    'Nunggu waktu yang tepat dulu buat mulai...',
    'Gue tuh penuh ide, masalahnya cuma eksekusi...',
    'Tahun depan fix gue mulai, serius...',
    'Kalau kondisinya udah pas, langsung gue gas...',
    'Gue udah riset banget soal ini, tinggal prakteknya...',
    'Nanti kalau udah nabung cukup, baru mulai...',
    'Konsepnya udah ada, tinggal nyari partner yang cocok...',
    'Bukan nggak mau mulai, tapi harus disiapkan dulu...',
    'Gue punya visi besar, nggak bisa asal-asalan mulai...',
    'Udah gue tulis di notes, nanti gue jalanin deh...',
    'Masih nunggu sign dari alam semesta...',
    'Kalau ada yang support, pasti langsung jalan...',
    'Udah hampir siap kok, kurang dikit lagi...',
    'Rencananya sempurna, tinggal nunggu momen yang tepat...'
  ],

  ragePhrases: [
    'T-tapi rencananya belum selesai!!',
    'TIDAK!! Gue belum sempet mulai beneran!!',
    'Tunggu!! Gue mau action mulai besok, beneran!!',
    'Ini nggak adil!! Ide gue yang paling bagus!!',
    'WACANA TIDAK BISA DIKALAHKAN SEBELUM DIMULAI!!'
  ],

  sprite: function(ctx, pct, defeated, P) {
    // Canvas 120×120, origin di (60,66)
    // Safe zone: X -15..+15, Y -16..+13
    var t     = Date.now();
    var rage  = pct < 0.3;
    var grn   = rage ? '#059669' : '#10b981';
    var grnD  = rage ? '#047857' : '#065f46';
    var grnL  = rage ? '#34d399' : '#6ee7b7';
    var skin  = '#fef3c7';
    var skinD = '#fde68a';
    var drk   = '#064e3b';
    var hair  = '#1c1917';
    var eye   = rage ? '#dc2626' : '#064e3b';
    var board = rage ? '#fee2e2' : '#ecfdf5';
    var mkr   = rage ? '#dc2626' : '#059669';

    // ══ GROUND SHADOW ══
    ctx.globalAlpha = 0.18 + 0.05*Math.sin(t/600);
    ctx.fillStyle = '#000';
    ctx.beginPath(); ctx.ellipse(0, 13, 10, 2, 0, 0, Math.PI*2); ctx.fill();
    ctx.globalAlpha = 1;

    // ══ BODY AURA RING — behind sprite ══
    ctx.globalAlpha = 0.12 + 0.09*Math.sin(t/480);
    ctx.shadowColor = rage ? '#dc2626' : grn;
    ctx.shadowBlur  = 16;
    ctx.beginPath();
    ctx.ellipse(0, 4, 14+Math.sin(t/400), 20+Math.sin(t/400), 0, 0, Math.PI*2);
    ctx.strokeStyle = (rage?'#ef4444':grnL)+'99';
    ctx.lineWidth   = 1.5;
    ctx.stroke();
    ctx.shadowBlur  = 0; ctx.globalAlpha = 1;

    // ══ RAGE: shockwave rings — behind sprite ══
    if (rage) {
      [0, 0.4, 0.8].forEach(function(offset) {
        var phase = ((t/550) + offset) % 1;
        ctx.globalAlpha = (1-phase)*0.22;
        ctx.strokeStyle = '#ef4444';
        ctx.lineWidth   = 2;
        ctx.shadowColor = '#ef4444'; ctx.shadowBlur = 8;
        ctx.beginPath();
        ctx.ellipse(0, 3, 15+phase*12, (15+phase*12)*0.38, 0, 0, Math.PI*2);
        ctx.stroke();
        ctx.shadowBlur = 0; ctx.globalAlpha = 1;
      });
    }

    // ══ SHOES — Y: +10..+13 ══
    [
      [-7,10,6,4,'#1c1917'],[-8,11,3,3,'#374151'],[-7,12,6,2,'#111827'],[-6,10,2,1,'#4b5563'+'77'],
      [2,10,6,4,'#1c1917'],[2,11,3,3,'#374151'],[2,12,6,2,'#111827'],[3,10,2,1,'#4b5563'+'77'],
    ].forEach(function(r){ px(ctx,r[0],r[1],r[2],r[3],r[4],P); });

    // ══ LEGS / TROUSERS — Y: +4..+11 ══
    [
      [-6,4,5,8,grnD],[-5,4,3,7,grn+'cc'],[-5,4,1,8,grnL+'33'],
      [2,4,5,8,grnD],[3,4,3,7,grn+'cc'],[4,4,1,8,grnL+'33'],
    ].forEach(function(r){ px(ctx,r[0],r[1],r[2],r[3],r[4],P); });

    // ══ BODY / BLAZER — Y: -8..+6 ══
    [
      // Core blazer layers
      [-7,-8,14,14,grnD],
      [-6,-7,12,12,grn],
      [-5,-6,10,10,grn+'dd'],
      // Side shading
      [-7,-6,2,12,drk+'55'],[5,-6,2,12,drk+'55'],
      // Lapels
      [-6,-7,3,8,drk+'cc'],[-5,-6,2,6,'#022c22'],
      [4,-7,3,8,drk+'cc'],[5,-6,2,6,'#022c22'],
      // Lapel highlight fold
      [-4,-5,1,5,grnL+'33'],[5,-5,1,5,grnL+'33'],
      // Shirt (white between lapels)
      [-2,-7,4,8,'#f0fdf4'],[-2,-6,4,6,'#fff'],
      // Tie
      [-1,-7,2,12,grnD],[-1,-5,2,10,grn+'bb'],[0,-7,1,1,grnL+'88'],
      // Tie dimple
      [-1,2,2,2,drk+'66'],
      // Buttons
      [0,-3,1,1,grnD],[0,-1,1,1,grnD],[0,1,1,1,grnD],
      // Pocket square
      [-6,-4,3,3,grnL+'cc'],[-6,-4,3,1,grnL],[-5,-4,1,2,'#fff8'],
      // Blazer vent
      [-1,5,2,1,drk+'44'],
      // Blazer hem
      [-7,5,14,2,grnD+'cc'],
    ].forEach(function(r){ px(ctx,r[0],r[1],r[2],r[3],r[4],P); });

    // ══ ARMS — Y: -6..+5 ══
    [
      // Left arm (holds whiteboard)
      [-11,-6,4,11,grnD],[-11,-5,3,9,grn+'cc'],[-11,-4,3,7,skin],
      [-11,-6,4,2,grnD],[-11,-4,3,2,grnL+'55'],// sleeve + cuff
      // Right arm (holds marker)
      [8,-6,4,11,grnD],[9,-5,3,9,grn+'cc'],[9,-4,3,7,skin],
      [8,-6,4,2,grnD],[9,-4,3,2,grnL+'55'],
      // Wristwatch (left wrist)
      [-11,2,3,2,'#1c1917'],[-11,2,3,1,'#374151'],[-10,2,1,1,grnL],
    ].forEach(function(r){ px(ctx,r[0],r[1],r[2],r[3],r[4],P); });

    // ══ WHITEBOARD (left hand) — Y: -10..+6, X: -15..-9 ══
    [
      // Frame
      [-15,-10,7,17,'#374151'],
      [-15,-9,7,15,'#1f2937'],
      // Surface
      [-14,-9,5,15,board],
      [-14,-8,5,13,rage?'#fef2f2':'#f0fdf4'],
      // Top bar + bottom tray
      [-15,-10,7,2,'#4b5563'],
      [-15,6,7,2,'#374151'],[-15,7,5,1,'#4b5563'],
      // Borders
      [-15,-10,1,17,'#4b5563'],[-9,-10,1,17,'#4b5563'],
      // Flow diagram content
      [-14,-7,4,2,mkr+'cc'],[-14,-7,4,1,mkr],[-14,-6,4,1,mkr],
      [-14,-7,1,2,mkr],[-11,-7,1,2,mkr],
      [-14,-4,4,2,mkr+'99'],[-14,-4,4,1,mkr+'88'],[-14,-3,4,1,mkr+'88'],
      [-11,-6,1,2,mkr+'88'],// vertical arrow
      // Box 2
      [-14,-2,4,2,mkr+'88'],[-14,-2,4,1,mkr+'77'],[-14,-1,4,1,mkr+'77'],
      // Note lines
      [-14,1,5,1,drk+'33'],[-14,3,4,1,drk+'33'],[-14,5,5,1,drk+'33'],
      // Circle node
      [-13,-4,2,2,mkr+'55'],
    ].forEach(function(r){ px(ctx,r[0],r[1],r[2],r[3],r[4],P); });

    // ══ MARKER (right hand) — Y: -13..-1, X: +11..+14 ══
    [
      // Body
      [12,-13,3,14,mkr],
      [12,-12,2,12,rage?'#b91c1c':'#047857'],// shade
      [13,-13,1,12,grnL+'44'],// highlight
      // Cap
      [12,-15,3,4,'#f9fafb'],[12,-16,3,2,'#e2e8f0'],[13,-15,1,1,'#fff8'],
      [14,-15,1,4,drk+'66'],// clip
      // Tip
      [12,-13,3,2,drk+'cc'],
      // Grip rings
      [12,-6,3,1,drk+'44'],[12,-4,3,1,drk+'44'],[12,-2,3,1,drk+'44'],
      // End cap
      [12,-0,3,1,drk+'88'],
    ].forEach(function(r){ px(ctx,r[0],r[1],r[2],r[3],r[4],P); });

    // ══ HEAD — Y: -14..-7 ══
    [
      [-4,-14,8,8,skin],
      [-4,-14,2,8,skinD+'88'],[3,-14,1,6,skinD+'66'],
      [-2,-7,4,1,skin],// chin
      // Ears
      [-5,-12,2,4,skin],[-5,-11,1,3,skinD+'88'],
      [4,-12,2,4,skin],[5,-11,1,3,skinD+'88'],
      // Hair
      [-4,-15,8,3,hair],[-4,-14,8,2,hair+'ee'],[-3,-15,4,1,'#374151'],
      // Eyebrows
      [-3,-11,3,2,hair],[-2,-12,2,1,hair+'cc'],
      [1,-11,3,2,hair],[2,-12,2,1,hair+'cc'],
      // Eyes
      [-3,-10,3,4,drk],[1,-10,3,4,drk],
      [-3,-10,3,3,'#fff'],[1,-10,3,3,'#fff'],
      [-3,-10,2,3,eye],[1,-10,2,3,eye],
      [-3,-10,1,2,hair],[1,-10,1,2,hair],
      [-2,-10,1,1,'#fff'],[2,-10,1,1,'#fff'],
      // Nose
      [0,-8,2,2,skinD],[0,-7,2,1,skinD+'cc'],
    ].forEach(function(r){ px(ctx,r[0],r[1],r[2],r[3],r[4],P); });

    if (!rage) {
      [
        // Glasses
        [-4,-11,4,4,drk+'88'],[-4,-11,4,3,'#bfdbfe'+'44'],
        [1,-11,4,4,drk+'88'],[1,-11,4,3,'#bfdbfe'+'44'],
        [-4,-11,4,1,drk+'cc'],[-4,-8,4,1,drk+'cc'],
        [-4,-11,1,4,drk+'cc'],[-1,-11,1,4,drk+'cc'],
        [1,-11,4,1,drk+'cc'],[1,-8,4,1,drk+'cc'],
        [1,-11,1,4,drk+'cc'],[4,-11,1,4,drk+'cc'],
        [0,-10,1,1,drk+'cc'],// bridge
        // Lens glare
        [-3,-10,2,2,'#bfdbfe'+'77'],[-3,-10,1,1,'#fff8'],
        [2,-10,2,2,'#bfdbfe'+'77'],[2,-10,1,1,'#fff8'],
        // Pupils (behind glasses)
        [-2,-9,1,2,drk],[2,-9,1,2,drk],
        [-2,-10,1,1,'#fff'],[2,-10,1,1,'#fff'],
        // Smile
        [-2,-6,5,1,drk],[-2,-5,2,1,drk+'55'],[2,-5,2,1,drk+'55'],
        // Dimples
        [-4,-6,1,1,skinD+'cc'],[4,-6,1,1,skinD+'cc'],
      ].forEach(function(r){ px(ctx,r[0],r[1],r[2],r[3],r[4],P); });
    } else {
      [
        // Furious brows
        [-3,-12,4,2,hair],[-2,-13,2,1,hair],
        [1,-12,4,2,hair],[2,-13,2,1,hair],
        // Eyes bloodshot
        [-3,-10,3,3,'#fecaca'],[1,-10,3,3,'#fecaca'],
        [-3,-10,2,3,'#dc2626'],[1,-10,2,3,'#dc2626'],
        [-3,-10,1,2,hair],[1,-10,1,2,hair],
        [-2,-10,1,1,'#fff'],[2,-10,1,1,'#fff'],
        [-3,-10,1,1,'#ef4444'+'88'],[3,-9,1,1,'#ef4444'+'88'],
        // Shouting mouth
        [-2,-6,5,5,drk],
        [-2,-5,2,3,'#fff'],[1,-5,2,3,'#fff'],
        [-2,-6,5,2,drk+'88'],[-2,-2,5,1,drk+'88'],
        [-1,-4,2,2,'#f87171'],// tongue
        // Vein
        [-1,-13,1,2,'#ef4444'+'88'],[-1,-13,2,1,'#ef4444'+'88'],
        // Flush
        [-4,-10,2,3,'#fca5a5'+'77'],[3,-10,2,3,'#fca5a5'+'77'],
        // Sweat
        [5,-12,1,2,'#bfdbfe'+'cc'],
      ].forEach(function(r){ px(ctx,r[0],r[1],r[2],r[3],r[4],P); });
    }

    // ══ ANIMATED: Sticky notes orbiting (normal) ══
    if (!rage) {
      [{col:'#fef9c3',bdr:'#d97706',cx:-14,cy:-14,i:0,spd:1900},
       {col:'#dbeafe',bdr:'#1d4ed8',cx: 14,cy:-13,i:1,spd:2200},
       {col:'#fce7f3',bdr:'#9d174d',cx: 14,cy:  3,i:2,spd:1700}]
      .forEach(function(n) {
        var ang = t/n.spd + n.i*2.09;
        var ox = Math.cos(ang)*1.5, oy = Math.sin(ang)*1;
        ctx.globalAlpha = 0.88;
        px(ctx, n.cx+ox, n.cy+oy, 4, 4, n.col, P);
        px(ctx, n.cx+ox, n.cy+oy, 4, 1, n.bdr+'44', P);
        px(ctx, n.cx+1+ox, n.cy+2+oy, 2, 1, drk+'44', P);
        px(ctx, n.cx+1+ox, n.cy+3+oy, 2, 1, drk+'44', P);
        ctx.globalAlpha = 0.12;
        px(ctx, n.cx+1+ox, n.cy+1+oy, 4, 4, '#000', P);
        ctx.globalAlpha = 1;
      });

      // Idea bubble above head
      var by = -16 + Math.sin(t/800)*0.8;
      ctx.globalAlpha = 0.55 + 0.3*Math.sin(t/650);
      px(ctx, -1, by, 4, 4, '#fff', P);
      px(ctx, 0, by+1, 2, 2, '#f0fdf4', P);
      px(ctx, 0, by+1, 1, 2, '#fbbf24', P);// bulb
      px(ctx, -1, by, 1, 1, '#fff8', P);
      // Bubble tail dots
      ctx.globalAlpha = 0.4;
      px(ctx, 0, by+5, 1, 1, '#fff', P);
      px(ctx, 0, by+7, 1, 1, '#ffffff88', P);
      ctx.globalAlpha = 1;
    } else {
      // Rage: notes flying scattered
      var cols = ['#fef9c3','#fca5a5','#dbeafe','#fce7f3'];
      [[-14,-12],[-14, 2],[13,-12],[13, 2]].forEach(function(pos, i) {
        var ang = t/320 + i*1.57;
        var ox  = Math.cos(ang)*2 + i*0.5;
        var oy  = Math.sin(ang)*2 - i*0.3;
        ctx.globalAlpha = 0.72 + 0.25*Math.abs(Math.sin(t/260+i));
        px(ctx, pos[0]+ox, pos[1]+oy, 3, 3, cols[i], P);
        px(ctx, pos[0]+1+ox, pos[1]+1+oy, 1, 1, drk+'55', P);
        ctx.globalAlpha = 1;
      });
    }

    // ══ ANIMATED: Blazer shimmer ══
    ctx.globalAlpha = 0.07 + 0.05*Math.sin(t/650);
    px(ctx, -5, -6, 10, 12, '#6ee7b7', P);
    ctx.globalAlpha = 1;

  }
});
