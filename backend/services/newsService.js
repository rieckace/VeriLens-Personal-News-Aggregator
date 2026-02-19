const axios = require('axios');

const Article = require('../models/Article');
const { scoreText } = require('./sentimentService');
const { biasScoreFromText, fakeProbabilityFromText } = require('./scoringService');

const DEFAULT_CATEGORIES = ['technology', 'sports', 'health', 'business', 'science', 'entertainment'];

function normalizeCategory(cat) {
  if (!cat) return null;
  return String(cat).toLowerCase().trim();
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

async function fetchNewsFromProvider({ category }) {
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
        url: `https://example.com/${category}/${Date.now()}`,
        urlToImage: null,
        publishedAt: new Date().toISOString(),
      },
    ];
  }

  const url = `${baseUrl}/top-headlines`;
  try {
    const resp = await axios.get(url, {
      params: {
        country,
        category,
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
      `News provider request failed for category="${category}": ${
        err?.response?.status || err?.code || err?.message || 'unknown error'
      }`
    );
    return [];
  }
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

      const doc = normalizeNewsApiArticle(a, category);

      const result = await Article.updateOne(
        { url: doc.url },
        { $set: doc },
        { upsert: true }
      );
      if (result.upsertedCount > 0 || result.modifiedCount > 0) upserted += 1;
    }
  }

  return { fetched, upserted, categories: uniqueCats };
}

module.exports = { fetchAndStoreLatestNews };
