// ── ChiTask Boss Debug Script ──
// Paste di browser console untuk diagnosa sprite

(function(){
  console.group('🔍 Boss Debug');

  // 1. Cek BOSS_DEFS
  console.log('BOSS_DEFS length:', typeof BOSS_DEFS !== 'undefined' ? BOSS_DEFS.length : 'UNDEFINED');
  
  // 2. Cek bossState
  console.log('bossState:', typeof bossState !== 'undefined' ? JSON.stringify(bossState) : 'UNDEFINED');
  
  // 3. Cek canvas
  var cvs = document.getElementById('bossSpriteCanvas');
  if(!cvs){ console.error('❌ Canvas tidak ditemukan!'); console.groupEnd(); return; }
  console.log('Canvas found:', cvs);
  console.log('Canvas width attr:', cvs.width, 'height attr:', cvs.height);
  console.log('Canvas offsetWidth:', cvs.offsetWidth, 'offsetHeight:', cvs.offsetHeight);
  console.log('Canvas getBoundingClientRect:', JSON.stringify(cvs.getBoundingClientRect()));
  
  // 4. Cek parent visibility
  var el = cvs;
  var chain = [];
  while(el && el !== document.body){
    var s = window.getComputedStyle(el);
    chain.push({
      id: el.id || el.tagName,
      display: s.display,
      visibility: s.visibility,
      opacity: s.opacity,
      overflow: s.overflow,
      width: s.width,
      height: s.height
    });
    el = el.parentElement;
  }
  console.log('Parent chain:', chain);
  
  // 5. Test draw langsung
  var ctx = cvs.getContext('2d');
  console.log('ctx:', ctx ? 'OK' : 'NULL');
  if(ctx){
    // Gambar kotak merah terang — harus kelihatan
    ctx.clearRect(0,0,cvs.width,cvs.height);
    ctx.fillStyle = '#ff0000';
    ctx.fillRect(10, 10, cvs.width-20, cvs.height-20);
    ctx.fillStyle = '#ffffff';
    ctx.font = '14px sans-serif';
    ctx.fillText('TEST OK', 20, cvs.height/2);
    console.log('✅ Test draw selesai — harusnya ada kotak merah di canvas');
  }
  
  // 6. Cek bossSpriteRaf
  console.log('bossSpriteRaf:', typeof bossSpriteRaf !== 'undefined' ? bossSpriteRaf : 'UNDEFINED');
  
  console.groupEnd();
})();
