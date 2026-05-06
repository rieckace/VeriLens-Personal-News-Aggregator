const Article = require('../models/Article');
const User = require('../models/User');

const { fetchAndStoreLatestNews } = require('../services/newsService');
const { buildPersonalizedFeed } = require('../services/recommendationService');
const { generateArticleEnrichment } = require('../services/openaiService');

async function refreshArticles(req, res, next) {
  try {
    const result = await fetchAndStoreLatestNews({
      categories: req.user.preferences,
    });
    return res.json(result);
  } catch (err) {
    return next(err);
  }
}

async function getPersonalizedFeed(req, res, next) {
  try {
    const { category, sentiment, search, page = 1, limit = 20 } = req.query;

    const feed = await buildPersonalizedFeed({
      userId: req.user._id,
      filters: {
        category: category ? String(category) : undefined,
        sentiment: sentiment ? String(sentiment) : undefined,
        search: search ? String(search) : undefined,
      },
      page: Number(page),
      limit: Math.min(Number(limit), 50),
    });

    return res.json(feed);
  } catch (err) {
    return next(err);
  }
}

async function getArticleById(req, res, next) {
  try {
    const article = await Article.findById(req.params.id);
    if (!article) {
      return res.status(404).json({ message: 'Article not found' });
    }
    return res.json({ article });
  } catch (err) {
    return next(err);
  }
}

async function enrichArticle(req, res, next) {
  try {
    const article = await Article.findById(req.params.id);
    if (!article) {
      return res.status(404).json({ message: 'Article not found' });
    }

    // If we already have AI enrichment, return it (avoid repeated API calls).
    if (article.aiSummary && article.aiGeneratedAt) {
      return res.json({ article });
    }

    try {
      const out = await generateArticleEnrichment({
        title: article.title,
        description: article.description,
        content: article.content,
        source: article.source,
        url: article.url,
      });

      article.aiSummary = out.summary;
      article.aiTakeaways = out.takeaways;
      article.aiTopics = out.topics;
      article.aiProvider = out.provider || 'openai';
      article.aiModel = out.model;
      article.aiGeneratedAt = new Date();
      article.aiError = undefined;
      await article.save();

      return res.json({ article });
    } catch (err) {
      article.aiProvider = article.aiProvider || 'openai';
      article.aiGeneratedAt = new Date();
      article.aiError = err?.message || 'AI enrichment failed';
      await article.save();

      const status = err?.statusCode || err?.response?.status || 502;
      return res.status(status).json({ message: article.aiError });
    }
  } catch (err) {
    return next(err);
  }
}

async function markRead(req, res, next) {
  try {
    const articleId = req.params.id;
    const exists = await Article.exists({ _id: articleId });
    if (!exists) {
      return res.status(404).json({ message: 'Article not found' });
    }

    await User.findByIdAndUpdate(req.user._id, {
      $addToSet: { readingHistory: articleId },
    });

    return res.json({ ok: true });
  } catch (err) {
    return next(err);
  }
}

async function addBookmark(req, res, next) {
  try {
    const articleId = req.params.id;
    const exists = await Article.exists({ _id: articleId });
    if (!exists) {
      return res.status(404).json({ message: 'Article not found' });
    }

    await User.findByIdAndUpdate(req.user._id, {
      $addToSet: { bookmarks: articleId },
    });

    return res.json({ ok: true });
  } catch (err) {
    return next(err);
  }
}

async function removeBookmark(req, res, next) {
  try {
    const articleId = req.params.id;
    await User.findByIdAndUpdate(req.user._id, {
      $pull: { bookmarks: articleId },
    });

    return res.json({ ok: true });
  } catch (err) {
    return next(err);
  }
}

module.exports = {
  refreshArticles,
  getPersonalizedFeed,
  getArticleById,
  enrichArticle,
  markRead,
  addBookmark,
  removeBookmark,
};
