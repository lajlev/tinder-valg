// OpenAI API integration for generating dilemmas and result analysis

function getApiKey() {
  return localStorage.getItem('openai_api_key') || '';
}

function saveApiKey(key) {
  localStorage.setItem('openai_api_key', key);
}

function hasApiKey() {
  return !!getApiKey();
}

async function callOpenAI(messages, temperature = 0.9, jsonMode = false) {
  const key = getApiKey();
  if (!key) throw new Error('Ingen API-nøgle');

  const body = {
    model: 'gpt-4o-mini',
    messages,
    temperature,
    max_tokens: 10000
  };
  if (jsonMode) body.response_format = { type: 'json_object' };

  const res = await fetch('https://api.openai.com/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${key}`
    },
    body: JSON.stringify(body)
  });

  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.error?.message || `API fejl: ${res.status}`);
  }

  const data = await res.json();
  return data.choices[0].message.content;
}

function buildPartyPositionsContext() {
  return Object.entries(partyPositions).map(([code, p]) => {
    const positions = Object.entries(p.positions)
      .map(([topic, stance]) => `  ${topic}: ${stance}`)
      .join('\n');
    return `${code} (${p.name}):\n${positions}`;
  }).join('\n\n');
}

async function generateDilemmas() {
  const partyList = Object.entries(candidates)
    .map(([code, c]) => `${code}: ${c.party} (${c.name})`)
    .join(', ');

  const positionsContext = buildPartyPositionsContext();

  const prompt = `Du er ekspert i dansk politik. Generér 25 politiske dilemmaer til en "Valg Tinder"-app for det danske valg 2026.

VIGTIGT: Hvert dilemma skal sætte to FORSKELLIGE politiske emner op mod hinanden (kryds-dilemma). Brugeren vælger hvad der er vigtigst. F.eks. "Byg atomkraftværker" vs "12 måneders værnepligt" - IKKE to sider af samme sag.

Dæk bredt: klima, skat, forsvar, sundhed, uddannelse, udlændinge, bolig, transport, EU, retspolitik, kultur, digitalisering, landdistrikter, værdipolitik, arbejdsmarked.

Danske partier: ${partyList}

=== PARTIERNES FAKTISKE HOLDNINGER (brug dette som grundlag for scoring) ===
${positionsContext}
=== SLUT PÅ HOLDNINGER ===

KRITISK VIGTIGT FOR SCORING: Du SKAL basere al scoring på partiernes faktiske holdninger ovenfor. Giv IKKE point til et parti for en position de ikke støtter. Tjek hver scoring mod de dokumenterede holdninger. Scoring skal afspejle hvor stærkt partiet reelt bakker op om det pågældende forslag baseret på deres kendte politik.

Returnér KUN valid JSON (ingen markdown, ingen forklaring) i dette format:
[
  {
    "id": 1,
    "category": "Emne A vs. Emne B",
    "optionA": "Kort konkret forslag (max 10 ord)",
    "optionB": "Kort konkret forslag (max 10 ord)",
    "argumentA": "Dramatisk/sjovt argument for A (1-2 sætninger, overdrevet og underholdende)",
    "argumentB": "Dramatisk/sjovt argument for B (1-2 sætninger, overdrevet og underholdende)",
    "scoring": {
      "optionA": {"PARTIKODE": point_1_til_10, ...},
      "optionB": {"PARTIKODE": point_1_til_10, ...}
    }
  }
]

Argumenterne skal være dramatiserede, sjove og overdrevne — tænk clickbait møder standup. De skal overtale brugeren til at vælge den pågældende mulighed.

Scoring skal realistisk afspejle partiernes faktiske holdninger fra listen ovenfor. Brug point 1-10. Hvert valg skal have mindst 3 partier med point. Sørg for at alle 11 partier får point fordelt jævnt hen over de 25 dilemmaer.`;

  const result = await callOpenAI([
    { role: 'system', content: 'Du returnerer altid valid JSON.' },
    { role: 'user', content: prompt }
  ], 0.9, true);

  // Parse JSON - handle both array and wrapped object
  const cleaned = result.replace(/```json?\n?/g, '').replace(/```\n?/g, '').trim();
  const parsed = JSON.parse(cleaned);
  const dilemmas = Array.isArray(parsed) ? parsed : (parsed.dilemmas || parsed.data || Object.values(parsed)[0]);

  if (!Array.isArray(dilemmas) || dilemmas.length < 20) {
    throw new Error(`Ugyldigt format fra API (fik ${Array.isArray(dilemmas) ? dilemmas.length : 0} dilemmaer)`);
  }

  return dilemmas;
}

async function generateResultAnalysis(top5, userChoices) {
  const top5Text = top5.map(([party, score], i) => {
    const c = candidates[party];
    return `${i + 1}. ${c.name} (${c.party}) - ${score} point`;
  }).join('\n');

  const prompt = `En bruger har gennemført "Valg Tinder 26" - en dansk politisk quiz med 25 dilemmaer.

Resultater:
${top5Text}

Skriv en kort, personlig analyse (3-4 sætninger, på dansk) af brugerens politiske profil. Vær konkret om hvilke værdier der driver dem. Undgå at være nedladende. Brug en engagerende tone.`;

  return await callOpenAI([{ role: 'user', content: prompt }], 0.7);
}
