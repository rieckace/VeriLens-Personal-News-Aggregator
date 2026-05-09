const axios = require('axios');

const Article = require('../models/Article');
const { scoreText } = require('./sentimentService');
const { biasScoreFromText, fakeProbabilityFromText } = require('./scoringService');
const { notifyUsersForNewArticle } = require('./notificationService');

// NewsAPI supported categories: business, entertainment, general, health, science, sports, technology
// We also allow extra “interest” categories (e.g. war, politics) by mapping them to a query-based fetch.
const DEFAULT_CATEGORIES = [
  'technology',
  'sports',
  'health',
  'business',
  'science',
  'entertainment',
  'politics',
  'war',
];

const NEWSAPI_CATEGORIES = new Set([
  'business',
  'entertainment',
  'general',
  'health',
  'science',
  'sports',
  'technology',
]);

const PROVIDER_NEWSAPI = 'newsapi';
const PROVIDER_CURRENTS = 'currents';

function getQueryForCustomCategory(category) {
  const c = String(category || '').toLowerCase().trim();
  if (!c) return null;
  if (c === 'war') return 'war';
  if (c === 'politics') return 'politics';
  return c;
}

function normalizeCategory(cat) {
  if (!cat) return null;
  return String(cat).toLowerCase().trim();
}

function getActiveNewsProvider() {
  const configured = String(process.env.NEWS_PROVIDER || 'auto')
    .toLowerCase()
    .trim();

  if (configured === PROVIDER_NEWSAPI) return PROVIDER_NEWSAPI;
  if (configured === PROVIDER_CURRENTS || configured === 'currentnews' || configured === 'current-news') {
    return PROVIDER_CURRENTS;
  }

  // auto
  const newsApiKey = (process.env.NEWS_API_KEY || '').trim();
  const currentsKey = (process.env.CURRENTS_API_KEY || process.env.CURRENTNEWS_API_KEY || '').trim();
  if (currentsKey && !newsApiKey) return PROVIDER_CURRENTS;
  return PROVIDER_NEWSAPI;
}

function normalizeNewsApiArticle(a, category) {
  const title = a.title || '';
  const description = a.description || '';
  const content = a.content || '';
  const source = a?.source?.name || a.source || '';
  const url = a.url;
  const publishedAt = a.publishedAt ? new Date(a.publishedAt) : undefined;

  const textForScoring = [title, description, content].filter(Boolean).join(' ');
  const sentiment = scoreText(textForScoring);
  const bias = biasScoreFromText(textForScoring);
  const fakeProbability = fakeProbabilityFromText(textForScoring, source);

  return {
    title,
    description,
    content,
    source,
    url,
    imageUrl: a.urlToImage,
    category,
    sentimentScore: sentiment.score,
    sentimentLabel: sentiment.label,
    biasScore: bias.score,
    biasLabel: bias.label,
    fakeProbability,
    publishedAt,
  };
}

function normalizeCurrentsArticle(a, category) {
  const title = a.title || '';
  const description = a.description || '';
  const content = a.content || a.snippet || '';
  const source = a?.author || a?.publisher || a?.source || 'Currents';
  const url = a.url;
  const publishedAt = a.published ? new Date(a.published) : undefined;

  const textForScoring = [title, description, content].filter(Boolean).join(' ');
  const sentiment = scoreText(textForScoring);
  const bias = biasScoreFromText(textForScoring);
  const fakeProbability = fakeProbabilityFromText(textForScoring, source);

  // Currents commonly uses `image` for the URL
  const imageUrl = a.image || a.imageUrl || null;

  return {
    title,
    description,
    content,
    source,
    url,
    imageUrl,
    category,
    sentimentScore: sentiment.score,
    sentimentLabel: sentiment.label,
    biasScore: bias.score,
    biasLabel: bias.label,
    fakeProbability,
    publishedAt,
  };
}

async function fetchFromNewsApi({ category }) {
  const apiKey = (process.env.NEWS_API_KEY || '').trim();
  const baseUrl = process.env.NEWS_API_BASE_URL || 'https://newsapi.org/v2';
  const country = process.env.NEWS_DEFAULT_COUNTRY || 'us';

  // If no API key, return mocked data so the system is runnable.
  if (!apiKey) {
    return [
      {
        title: `Mock ${category} headline`,
        description: `Mock description for ${category}.`,
        content: `This is mock content for ${category}.`,
        source: { name: 'MockNews' },
        // Stable URL so scheduled fetch doesn't endlessly grow the DB in mock mode.
        url: `https://example.com/mock/${encodeURIComponent(String(category || 'general'))}`,
        urlToImage: null,
        publishedAt: new Date().toISOString(),
      },
    ];
  }

  const url = `${baseUrl}/top-headlines`;
  const normalizedCategory = normalizeCategory(category);
  const useCategoryParam = normalizedCategory && NEWSAPI_CATEGORIES.has(normalizedCategory);
  const q = !useCategoryParam ? getQueryForCustomCategory(normalizedCategory) : undefined;

  try {
    const resp = await axios.get(url, {
      params: {
        country,
        category: useCategoryParam ? normalizedCategory : undefined,
        q,
        pageSize: 50,
      },
      headers: {
        'X-Api-Key': apiKey,
      },
      timeout: 15000,
    });

    return resp.data?.articles || [];
  } catch (err) {
    // Keep the app runnable even if provider errors (bad key, rate-limit, network).
    // eslint-disable-next-line no-console
    console.warn(
      `News provider (newsapi) request failed for category="${category}": ${
        err?.response?.status || err?.code || err?.message || 'unknown error'
      }`
    );
    return [];
  }
}

async function fetchFromCurrents({ category }) {
  const apiKey = (process.env.CURRENTS_API_KEY || process.env.CURRENTNEWS_API_KEY || '').trim();
  const baseUrl = process.env.CURRENTS_API_BASE_URL || 'https://api.currentsapi.services/v1';
  const language = (process.env.CURRENTS_DEFAULT_LANGUAGE || 'en').trim();

  // If no API key, return mocked data so the system is runnable.
  if (!apiKey) {
    return [
      {
        title: `Mock ${category} headline`,
        description: `Mock description for ${category}.`,
        content: `This is mock content for ${category}.`,
        author: 'MockNews',
        url: `https://example.com/mock/${encodeURIComponent(String(category || 'general'))}`,
        image: null,
        published: new Date().toISOString(),
      },
    ];
  }

  // Currents API supports both latest-news and search; search is the most flexible for category-like keywords.
  const normalizedCategory = normalizeCategory(category);
  const keywords = getQueryForCustomCategory(normalizedCategory) || normalizedCategory || 'news';
  const url = `${baseUrl}/search`;

  try {
    const resp = await axios.get(url, {
      params: {
        apiKey,
        keywords,
        language,
        page_size: 50,
      },
      timeout: 15000,
    });

    return resp.data?.news || [];
  } catch (err) {
    // eslint-disable-next-line no-console
    console.warn(
      `News provider (currents) request failed for category="${category}": ${
        err?.response?.status || err?.code || err?.message || 'unknown error'
      }`
    );
    return [];
  }
}

async function fetchNewsFromProvider({ category }) {
  const provider = getActiveNewsProvider();
  if (provider === PROVIDER_CURRENTS) {
    return fetchFromCurrents({ category });
  }
  return fetchFromNewsApi({ category });
}

async function fetchAndStoreLatestNews({ categories } = {}) {
  const cats = Array.isArray(categories) && categories.length ? categories : DEFAULT_CATEGORIES;
  const normalized = cats.map(normalizeCategory).filter(Boolean);
  const uniqueCats = [...new Set(normalized)].slice(0, 10);

  let fetched = 0;
  let upserted = 0;

  for (const category of uniqueCats) {
    const providerArticles = await fetchNewsFromProvider({ category });
    fetched += providerArticles.length;

    for (const a of providerArticles) {
      if (!a.url || !a.title) continue;

      const provider = getActiveNewsProvider();
      const doc = provider === PROVIDER_CURRENTS
        ? normalizeCurrentsArticle(a, category)
        : normalizeNewsApiArticle(a, category);

      const result = await Article.updateOne(
        { url: doc.url },
        { $set: doc },
        { upsert: true }
      );
      if (result.upsertedCount > 0 || result.modifiedCount > 0) upserted += 1;

      // Only create notifications when a new article is inserted.
      if (result.upsertedCount > 0) {
        const insertedId =
          result.upsertedId && typeof result.upsertedId === 'object'
            ? result.upsertedId._id || result.upsertedId
            : result.upsertedId;
        try {
          const inserted = insertedId
            ? await Article.findById(insertedId)
            : await Article.findOne({ url: doc.url });
          await notifyUsersForNewArticle(inserted);
        } catch {
          // ignore notification failures so fetch remains resilient
        }
      }
    }
  }

  return { fetched, upserted, categories: uniqueCats };
}

module.exports = { fetchAndStoreLatestNews };
