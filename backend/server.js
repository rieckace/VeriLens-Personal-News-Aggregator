const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const dotenv = require('dotenv');
const path = require('path');

const { connectDb } = require('./config/db');
const { scheduleNewsFetch } = require('./services/newsScheduler');

const authRoutes = require('./routes/authRoutes');
const userRoutes = require('./routes/userRoutes');
const articleRoutes = require('./routes/articleRoutes');
const analyticsRoutes = require('./routes/analyticsRoutes');

const { notFound, errorHandler } = require('./middleware/errorMiddleware');

// Always load env from backend/.env, regardless of where node is started from.
dotenv.config({ path: path.join(__dirname, '.env') });

// eslint-disable-next-line no-console
console.log(
  `Env loaded. NEWS_API_KEY: ${process.env.NEWS_API_KEY ? 'set' : 'missing'}`
);

if (!process.env.JWT_SECRET) {
  if (process.env.NODE_ENV === 'production') {
    throw new Error('Missing JWT_SECRET in environment');
  }
  // eslint-disable-next-line no-console
  console.warn(
    'JWT_SECRET not set. Using an insecure development fallback. Set JWT_SECRET in backend/.env'
  );
  process.env.JWT_SECRET = 'dev_insecure_jwt_secret_change_me';
}

const app = express();

const clientOriginEnv = process.env.CLIENT_ORIGIN;
const allowedOrigins = clientOriginEnv
  ? clientOriginEnv
      .split(',')
      .map((s) => s.trim())
      .filter(Boolean)
  : [];

app.use(helmet());
app.use(express.json({ limit: '1mb' }));
app.use(
  cors({
    origin: (origin, callback) => {
      if (!origin) return callback(null, true);
      if (!allowedOrigins.length) return callback(null, true);
      if (allowedOrigins.includes('*')) return callback(null, true);
      if (allowedOrigins.includes(origin)) return callback(null, true);
      return callback(new Error('Not allowed by CORS'));
    },
    credentials: true,
  })
);
app.use(morgan('dev'));

app.get('/health', (req, res) => {
  res.json({ status: 'ok' });
});

app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/articles', articleRoutes);
app.use('/api/analytics', analyticsRoutes);

app.use(notFound);
app.use(errorHandler);

const port = process.env.PORT || 5000;

(async () => {
  await connectDb();
  scheduleNewsFetch();
  app.listen(port, () => {
    // eslint-disable-next-line no-console
    console.log(`Backend listening on http://localhost:${port}`);
  });
})();
