const Article = require('../models/Article');
const User = require('../models/User');

function computeBoostedCategories(historyArticles = []) {
  const counts = {};
  for (const a of historyArticles) {
    const c = a.category || 'unknown';
    counts[c] = (counts[c] || 0) + 1;
  }
  return counts;
}

async function buildPersonalizedFeed({ userId, filters = {}, page = 1, limit = 20 }) {
  const user = await User.findById(userId).populate('readingHistory').select('preferences readingHistory');
  const preferences = user?.preferences || [];
  const boosted = computeBoostedCategories(user?.readingHistory || []);

  const query = {};

  // If real provider is configured, hide any legacy mock articles.
  if ((process.env.NEWS_API_KEY || '').trim()) {
    query.source = { $ne: 'MockNews' };
  }

  if (filters.search) {
    query.$text = { $search: filters.search };
  }

  const filterCategory = filters.category ? String(filters.category).toLowerCase() : null;
  const filterSentiment = filters.sentiment ? String(filters.sentiment).toLowerCase() : null;

  if (filterCategory) {
    query.category = filterCategory;
  } else if (preferences.length) {
    query.category = { $in: preferences.map((p) => String(p).toLowerCase()) };
  }

  if (filterSentiment) {
    query.sentimentLabel = filterSentiment;
  }

  const skip = (Math.max(page, 1) - 1) * limit;

  const articles = await Article.find(query)
    .sort({ publishedAt: -1 })
    .skip(skip)
    .limit(limit * 3); // fetch extra then rank

  const ranked = articles
    .map((a) => {
      const cat = a.category || 'unknown';
      const preferenceMatch = preferences.includes(cat) ? 2 : 0;
      const boost = boosted[cat] ? Math.min(boosted[cat], 5) * 0.2 : 0;
      const score = preferenceMatch + boost;
      return { a, score };
    })
    .sort((x, y) => {
      if (y.score !== x.score) return y.score - x.score;
      return (y.a.publishedAt?.getTime?.() || 0) - (x.a.publishedAt?.getTime?.() || 0);
    })
    .slice(0, limit);

  const total = await Article.countDocuments(query);

  return {
    page: Math.max(page, 1),
    limit,
    total,
    articles: ranked.map((x) => x.a),
  };
}

module.exports = { buildPersonalizedFeed };
