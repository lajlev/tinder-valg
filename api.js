// OpenAI API integration for generating dilemmas and result analysis

let partyDataCache = null;

function getApiKey() {
  return localStorage.getItem('openai_api_key') || '';
}

function saveApiKey(key) {
  localStorage.setItem('openai_api_key', key);
}

function hasApiKey() {
  return !!getApiKey();
}

async function loadPartyData() {
  if (partyDataCache) return partyDataCache;
  const res = await fetch('data-2026.json');
  if (!res.ok) throw new Error('Kunne ikke hente data-2026.json');
  partyDataCache = await res.json();
  return partyDataCache;
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

async function generateDilemmas() {
  const partyData = await loadPartyData();
  const partyDataJson = JSON.stringify(partyData, null, 2);

  const partyList = partyData.partier
    .map(p => `${p.forkortelse}: ${p.navn} (${p.topkandidat})`)
    .join(', ');

  const partyCodes = partyData.partier.map(p => p.forkortelse).join(', ');

  const prompt = `Du er ekspert i dansk politik. Generér 25 politiske dilemmaer til en "Valg Tinder"-app for det danske valg 2026.

VIGTIGT REGEL: Hvert dilemma skal ALTID sammenligne to forslag fra SAMME kategori:
- "flere_penge_paa" vs "flere_penge_paa" — to ting vi kan INVESTERE mere i (f.eks. "Byg atomkraftværker" vs "Gratis tandlæge til alle")
- "faerre_penge_paa" vs "faerre_penge_paa" — to ting vi kan SPARE/SKÆRE på (f.eks. "Halvér momsen på mad" vs "Sænk indkomstskatten")

Bland ALDRIG kategorierne! Begge valgmuligheder skal enten handle om at bruge flere penge, eller om at spare/ændre afgifter.
Lav ca. 13 "flere_penge_paa"-dilemmaer og ca. 12 "faerre_penge_paa"-dilemmaer.

Dæk bredt: klima, skat, forsvar, sundhed, uddannelse, udlændinge, bolig, transport, EU, retspolitik, kultur, digitalisering, landdistrikter, værdipolitik, arbejdsmarked.

Danske partier og topkandidater: ${partyList}

Gyldige partikoder til scoring: ${partyCodes}

=== FAKTISKE PARTIDATA MED ØKONOMISKE ESTIMATER (brug dette som grundlag for scoring) ===
${partyDataJson}
=== SLUT PÅ PARTIDATA ===

KRITISK VIGTIGT FOR SCORING:
- Du SKAL basere al scoring på partiernes faktiske holdninger og økonomiske prioriteringer fra datasættet ovenfor.
- Brug partiernes "flere_penge_paa" og "faerre_penge_paa" til at vurdere hvor stærkt de støtter hvert forslag.
- Giv IKKE point til et parti for en position de ikke støtter.
- Brug KUN de partikoder der er listet ovenfor (${partyCodes}).

Returnér KUN valid JSON (ingen markdown, ingen forklaring) i dette format:
[
  {
    "id": 1,
    "type": "flere_penge_paa",
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

Scoring skal realistisk afspejle partiernes faktiske holdninger fra datasættet ovenfor. Brug point 1-10. Hvert valg skal have mindst 3 partier med point. Sørg for at alle ${partyData.partier.length} partier får point fordelt jævnt hen over de 25 dilemmaer.`;

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
