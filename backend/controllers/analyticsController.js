const User = require('../models/User');
const Article = require('../models/Article');

function bucketSentiment(score) {
  if (score > 1) return 'positive';
  if (score < -1) return 'negative';
  return 'neutral';
}

async function getAnalytics(req, res, next) {
  try {
    const user = await User.findById(req.user._id).populate('readingHistory').populate('bookmarks');

    const history = user?.readingHistory || [];

    const categoryCounts = {};
    const sentimentCounts = { positive: 0, neutral: 0, negative: 0 };

    for (const a of history) {
      const category = a.category || 'unknown';
      categoryCounts[category] = (categoryCounts[category] || 0) + 1;
      const bucket = a.sentimentLabel || bucketSentiment(a.sentimentScore || 0);
      sentimentCounts[bucket] = (sentimentCounts[bucket] || 0) + 1;
    }

    let mostReadCategory = null;
    let mostReadCount = 0;
    for (const [cat, count] of Object.entries(categoryCounts)) {
      if (count > mostReadCount) {
        mostReadCategory = cat;
        mostReadCount = count;
      }
    }

    const bookmarkCount = user?.bookmarks?.length || 0;
    const totalArticlesRead = history.length;

    // Reading frequency: simple weekly buckets (last 7 days)
    const last7 = Array.from({ length: 7 }, (_, i) => ({ dayOffset: i, count: 0 }));
    const now = Date.now();
    for (const a of history) {
      const t = new Date(a.publishedAt || a.createdAt || now).getTime();
      const daysAgo = Math.floor((now - t) / (1000 * 60 * 60 * 24));
      if (daysAgo >= 0 && daysAgo < 7) last7[daysAgo].count += 1;
    }

    const totalArticlesInDb = await Article.countDocuments();

    return res.json({
      mostReadCategory,
      sentimentDistribution: sentimentCounts,
      categoryPreference: categoryCounts,
      totalArticlesRead,
      bookmarkCount,
      readingFrequencyLast7Days: last7.map((x) => x.count),
      totalArticlesInDb,
    });
  } catch (err) {
    return next(err);
  }
}

module.exports = { getAnalytics };
