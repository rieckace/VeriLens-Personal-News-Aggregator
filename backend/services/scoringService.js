const LEFT_KEYWORDS = [
  'progressive',
  'equality',
  'climate',
  'carbon',
  'emissions',
  'renewable',
  'regulation',
  'social justice',
  'racial justice',
  'diversity',
  'equity',
  'inclusion',
  'minimum wage',
  'union',
  'universal healthcare',
  'single-payer',
  'student debt',
  'green new deal',
  'gun control',
  'abortion rights',
];

const RIGHT_KEYWORDS = [
  'tax cut',
  'tax cuts',
  'border',
  'immigration crackdown',
  'freedom',
  'gun rights',
  'second amendment',
  'traditional values',
  'family values',
  'law and order',
  'small government',
  'deregulation',
  'patriot',
  'woke',
  'cancel culture',
  'pro-life',
  'anti-abortion',
];

const CLICKBAIT_KEYWORDS = [
  'shocking',
  "you won't believe",
  'unbelievable',
  'secret',
  'miracle',
  'exposed',
  'truth',
  'what happened next',
  'must see',
  'gone wrong',
  'insane',
  'jaw-dropping',
  'do this now',
  'breaking',
];

const TRUSTED_SOURCES = [
  'reuters',
  'associated press',
  'ap news',
  'bbc',
  'bloomberg',
  'financial times',
  'the wall street journal',
  'the new york times',
  'the washington post',
  'npr',
  'al jazeera',
];

function countOccurrences(haystack, needle) {
  if (!haystack || !needle) return 0;
  let count = 0;
  let idx = 0;
  while (true) {
    idx = haystack.indexOf(needle, idx);
    if (idx === -1) break;
    count += 1;
    idx += needle.length;
  }
  return count;
}

function biasScoreFromText(text) {
  const t = (text || '').toLowerCase();
  let left = 0;
  let right = 0;

  for (const k of LEFT_KEYWORDS) left += countOccurrences(t, k);
  for (const k of RIGHT_KEYWORDS) right += countOccurrences(t, k);

  const totalSignals = left + right;
  if (totalSignals === 0) {
    return { score: 0, label: 'unknown' };
  }

  const score = right - left; // positive => right leaning
  const dominance = Math.abs(score) / totalSignals;

  // Only label left/right if we have enough signal and it's not a tie.
  let label = 'center';
  if (totalSignals >= 2 && dominance >= 0.6) {
    if (score > 0) label = 'right';
    else if (score < 0) label = 'left';
  }

  return { score, label };
}

function fakeProbabilityFromText(text, source) {
  const t = (text || '').toLowerCase();
  let score = 0.05;

  // Clickbait phrases
  for (const k of CLICKBAIT_KEYWORDS) {
    const hits = countOccurrences(t, k);
    if (hits) score += Math.min(hits, 3) * 0.12;
  }

  // Sensational punctuation
  const exclamations = countOccurrences(text || '', '!');
  const questions = countOccurrences(text || '', '?');
  if (exclamations > 0) score += Math.min(exclamations, 3) * 0.05;
  if (questions > 0) score += Math.min(questions, 3) * 0.03;

  // All-caps words (common in sensational headlines)
  const capsMatches = String(text || '').match(/\b[A-Z]{4,}\b/g);
  if (capsMatches?.length) score += Math.min(capsMatches.length, 3) * 0.05;

  // “Listicle” style patterns
  if (/\b\d{1,2}\s+(ways|reasons|things|signs)\b/i.test(text || '')) score += 0.07;

  // Source signal
  const src = (source || '').toLowerCase().trim();
  if (!src || src.length < 2) score += 0.12;
  if (src && TRUSTED_SOURCES.some((s) => src.includes(s))) score -= 0.03;

  // clamp 0..0.95
  score = Math.max(0.01, Math.min(score, 0.95));
  return score;
}

module.exports = { biasScoreFromText, fakeProbabilityFromText };
