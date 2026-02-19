const cron = require('node-cron');
const { fetchAndStoreLatestNews } = require('./newsService');

let task = null;

function scheduleNewsFetch() {
  const enabled = String(process.env.ENABLE_SCHEDULED_FETCH || 'true').toLowerCase() === 'true';
  const expr = process.env.NEWS_FETCH_INTERVAL_CRON || '*/30 * * * *';

  if (!enabled) return;

  if (!cron.validate(expr)) {
    // eslint-disable-next-line no-console
    console.warn(`Invalid NEWS_FETCH_INTERVAL_CRON: ${expr}`);
    return;
  }

  task = cron.schedule(expr, async () => {
    try {
      await fetchAndStoreLatestNews();
      // eslint-disable-next-line no-console
      console.log('Scheduled news fetch complete');
    } catch (err) {
      // eslint-disable-next-line no-console
      console.warn('Scheduled news fetch failed:', err.message);
    }
  });

  task.start();
}

module.exports = { scheduleNewsFetch };
