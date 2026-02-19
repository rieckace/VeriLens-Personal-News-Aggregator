const Sentiment = require('sentiment');

const sentiment = new Sentiment();

function scoreText(text) {
  if (!text) return { score: 0, label: 'neutral' };
  const result = sentiment.analyze(text);
  const score = result.score || 0;
  let label = 'neutral';
  if (score > 1) label = 'positive';
  else if (score < -1) label = 'negative';
  return { score, label };
}

module.exports = { scoreText };
