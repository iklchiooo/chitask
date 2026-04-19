// ═══════════════════════════════════════════════════════════════
//  Netlify Function: horoscope-proxy
//  Source API: https://freehoroscopeapi.com/
//  Endpoint: /.netlify/functions/horoscope-proxy?sign=capricorn
//
//  Browser → Netlify Function (same origin, no CORS) → freehoroscopeapi.com
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
    const url = `https://freehoroscopeapi.com/api/v1/get-horoscope/daily?sign=${sign}`;
    const res  = await fetch(url);

    if (!res.ok) throw new Error(`API returned HTTP ${res.status}`);

    const json = await res.json();

    return {
      statusCode: 200,
      headers: { ...CORS, 'Content-Type': 'application/json' },
      body: JSON.stringify(json)
    };

  } catch (err) {
    return {
      statusCode: 500,
      headers: { ...CORS, 'Content-Type': 'application/json' },
      body: JSON.stringify({ error: err.message || 'Gagal fetch horoscope' })
    };
  }
};
