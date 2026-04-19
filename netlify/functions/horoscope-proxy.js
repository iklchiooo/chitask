// ═══════════════════════════════════════════════════════════════
//  Netlify Function: horoscope-proxy
//  Source API: https://freehoroscopeapi.com/
//  Endpoint: /.netlify/functions/horoscope-proxy?sign=capricorn
//
//  Flow: Browser → Netlify → freehoroscopeapi.com (EN)
//              → Groq (terjemah ke ID) → Browser
//
//  Env vars yang dibutuhkan:
//    GROQ_API_KEY  → sama dengan yang dipakai groq-proxy.js
// ═══════════════════════════════════════════════════════════════

const CORS = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type'
};

const VALID_SIGNS = [
  'aries','taurus','gemini','cancer','leo','virgo',
  'libra','scorpio','sagittarius','capricorn','aquarius','pisces'
];

// ── Terjemahkan teks via Groq ─────────────────────────────────
async function translateToID(text) {
  if (!process.env.GROQ_API_KEY) throw new Error('GROQ_API_KEY belum diset');

  const res = await fetch('https://api.groq.com/openai/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${process.env.GROQ_API_KEY}`
    },
    body: JSON.stringify({
      model: 'llama-3.3-70b-versatile',
      max_tokens: 400,
      temperature: 0.3,
      messages: [
        {
          role: 'system',
          content:
            'Kamu adalah penerjemah ramalan zodiak ke Bahasa Indonesia. ' +
            'Terjemahkan teks berikut ke Bahasa Indonesia yang natural, mengalir, dan enak dibaca. ' +
            'Gunakan gaya bahasa yang hangat dan personal seperti sedang berbicara langsung kepada pembaca. ' +
            'Panjang terjemahan boleh sedikit lebih panjang dari aslinya agar terasa lebih kaya dan ekspresif. ' +
            'Jangan tambahkan catatan, penjelasan, atau teks apapun selain terjemahannya saja.'
        },
        {
          role: 'user',
          content: text
        }
      ]
    })
  });

  if (!res.ok) throw new Error(`Groq HTTP ${res.status}`);
  const data = await res.json();
  const translated = data?.choices?.[0]?.message?.content?.trim();
  if (!translated) throw new Error('Groq tidak mengembalikan terjemahan');
  return translated;
}

// ── Handler utama ─────────────────────────────────────────────
exports.handler = async (event) => {
  if (event.httpMethod === 'OPTIONS') {
    return { statusCode: 200, headers: CORS, body: '' };
  }

  const sign = (event.queryStringParameters?.sign || '').toLowerCase().trim();

  if (!sign || !VALID_SIGNS.includes(sign)) {
    return {
      statusCode: 400,
      headers: { ...CORS, 'Content-Type': 'application/json' },
      body: JSON.stringify({ error: 'Parameter ?sign= tidak valid' })
    };
  }

  try {
    // 1. Ambil ramalan dari sumber (Bahasa Inggris)
    const url = `https://freehoroscopeapi.com/api/v1/get-horoscope/daily?sign=${sign}`;
    const res  = await fetch(url);
    if (!res.ok) throw new Error(`Horoscope API returned HTTP ${res.status}`);
    const json = await res.json();

    const data = json.data || json;
    const originalText = data.horoscope || data.description || '';

    // 2. Terjemahkan ke Bahasa Indonesia via Groq
    let horoscopeID = originalText;
    if (originalText) {
      try {
        horoscopeID = await translateToID(originalText);
      } catch (translateErr) {
        // Kalau Groq gagal, fallback ke teks asli (Inggris) daripada error total
        console.warn('[horoscope-proxy] Groq translate gagal, pakai teks asli:', translateErr.message);
        horoscopeID = originalText;
      }
    }

    // 3. Return dengan field horoscope sudah dalam Bahasa Indonesia
    return {
      statusCode: 200,
      headers: { ...CORS, 'Content-Type': 'application/json' },
      body: JSON.stringify({
        ...data,
        horoscope: horoscopeID
      })
    };

  } catch (err) {
    return {
      statusCode: 500,
      headers: { ...CORS, 'Content-Type': 'application/json' },
      body: JSON.stringify({ error: err.message || 'Gagal fetch horoscope' })
    };
  }
};
