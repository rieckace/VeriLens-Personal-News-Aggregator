const axios = require('axios');

function isAiEnabled() {
  return String(process.env.ENABLE_AI_ENRICHMENT || 'false').toLowerCase() === 'true';
}

function getLlmConfig() {
  const provider = String(process.env.LLM_PROVIDER || 'openai').toLowerCase().trim();
  const maxChars = Number(process.env.LLM_MAX_CHARS || process.env.OPENAI_MAX_CHARS || 6000);

  if (provider === 'groq') {
    const apiKey = (process.env.GROQ_API_KEY || '').trim();
    const model = (process.env.GROQ_MODEL || 'llama-3.1-8b-instant').trim();
    const baseUrl = (process.env.GROQ_BASE_URL || 'https://api.groq.com/openai/v1').trim();
    return { provider, apiKey, model, baseUrl, maxChars };
  }

  // Default: OpenAI
  const apiKey = (process.env.OPENAI_API_KEY || '').trim();
  const model = (process.env.OPENAI_MODEL || 'gpt-4o-mini').trim();
  const baseUrl = (process.env.OPENAI_BASE_URL || 'https://api.openai.com/v1').trim();
  return { provider: 'openai', apiKey, model, baseUrl, maxChars };
}

function clampText(text, maxChars) {
  const s = String(text || '');
  if (!maxChars || !Number.isFinite(maxChars) || maxChars <= 0) return s;
  if (s.length <= maxChars) return s;
  return s.slice(0, maxChars);
}

function extractOpenAiError(err) {
  const statusCode = err?.response?.status;
  const apiError = err?.response?.data?.error;

  if (!statusCode) return null;

  const message =
    (apiError && (apiError.message || apiError.code || apiError.type)) ||
    err?.response?.statusText ||
    err?.message ||
    'OpenAI request failed';

  const hint =
    statusCode === 429
      ? 'Rate limit or quota exceeded. Try again later or check your OpenAI account billing/limits.'
      : statusCode === 401
        ? 'Unauthorized. Check OPENAI_API_KEY.'
        : statusCode >= 500
          ? 'OpenAI service error. Try again later.'
          : null;

  return {
    statusCode,
    message: hint ? `${message} (${hint})` : message,
  };
}

async function generateArticleEnrichment({ title, description, content, source, url }) {
  if (!isAiEnabled()) {
    const err = new Error('AI enrichment is disabled');
    err.statusCode = 503;
    throw err;
  }

  const { provider, apiKey, model, baseUrl, maxChars } = getLlmConfig();
  if (!apiKey) {
    const err = new Error(provider === 'groq' ? 'Missing GROQ_API_KEY' : 'Missing OPENAI_API_KEY');
    err.statusCode = 503;
    throw err;
  }

  const inputText = clampText(
    [title, description, content].filter(Boolean).join('\n\n'),
    maxChars
  );

  const system =
    'You are an assistant for a news app. Generate a short, neutral summary and key takeaways. ' +
    'Return ONLY valid JSON. No markdown, no extra text.';

  const user =
    `Article metadata:\n` +
    `- source: ${source || 'unknown'}\n` +
    `- url: ${url || 'unknown'}\n\n` +
    `Article text:\n${inputText}\n\n` +
    `Return JSON with this shape:\n` +
    `{"summary": string, "takeaways": string[], "topics": string[]}\n` +
    `Rules:\n` +
    `- summary: 50-90 words, neutral tone\n` +
    `- takeaways: exactly 3 items, each <= 16 words\n` +
    `- topics: 3 to 6 short lowercase keywords (no hashtags)\n`;

  let resp;
  try {
    resp = await axios.post(
      `${baseUrl.replace(/\/$/, '')}/chat/completions`,
      {
        model,
        temperature: 0.2,
        messages: [
          { role: 'system', content: system },
          { role: 'user', content: user },
        ],
        max_tokens: 350,
      },
      {
        headers: {
          Authorization: `Bearer ${apiKey}`,
          'Content-Type': 'application/json',
        },
        timeout: 20000,
      }
    );
  } catch (err) {
    const extracted = extractOpenAiError(err);
    if (extracted) {
      const e = new Error(extracted.message);
      e.statusCode = extracted.statusCode;
      throw e;
    }
    throw err;
  }

  const contentText = resp?.data?.choices?.[0]?.message?.content || '';
  let parsed;
  try {
    parsed = JSON.parse(contentText);
  } catch {
    const err = new Error('OpenAI response was not valid JSON');
    err.statusCode = 502;
    err.details = contentText.slice(0, 500);
    throw err;
  }

  const summary = typeof parsed.summary === 'string' ? parsed.summary.trim() : '';
  const takeaways = Array.isArray(parsed.takeaways)
    ? parsed.takeaways.map((x) => String(x).trim()).filter(Boolean).slice(0, 5)
    : [];
  const topics = Array.isArray(parsed.topics)
    ? parsed.topics
        .map((x) => String(x).trim().toLowerCase())
        .filter(Boolean)
        .slice(0, 8)
    : [];

  if (!summary) {
    const err = new Error('OpenAI enrichment missing summary');
    err.statusCode = 502;
    throw err;
  }

  return { summary, takeaways, topics, model, provider };
}

module.exports = { generateArticleEnrichment, isAiEnabled, getLlmConfig };
