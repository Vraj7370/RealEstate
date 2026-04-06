require('dotenv').config();
const express    = require('express');
const cors       = require('cors');
const helmet     = require('helmet');
const morgan     = require('morgan');
const compression= require('compression');
const rateLimit  = require('express-rate-limit');
const path       = require('path');
const connectDB  = require('./config/db');
const errorHandler = require('./middleware/errorHandler');

connectDB();

const app = express();

// ── CORS ────────────────────────────────────────────────────
const corsOptions = {
  origin: (origin, callback) => {
    if (!origin || process.env.NODE_ENV === 'development') return callback(null, true);
    const allowed = [
      'http://localhost:3000',
      'http://localhost:3001',
      process.env.CLIENT_URL,
    ].filter(Boolean);
    if (allowed.includes(origin)) return callback(null, true);
    callback(new Error(`CORS: ${origin} not allowed`));
  },
  credentials: true,
  methods: ['GET','POST','PUT','PATCH','DELETE','OPTIONS'],
  allowedHeaders: ['Content-Type','Authorization','X-Requested-With'],
  optionsSuccessStatus: 200,
};
app.use(cors(corsOptions));
app.options('*', cors(corsOptions));

// ── Security ────────────────────────────────────────────────
app.use(helmet({
  crossOriginResourcePolicy: false,
  contentSecurityPolicy: false,
}));

// ── Perf ────────────────────────────────────────────────────
app.use(compression());
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true, limit: '50mb' }));

// ── Logging ─────────────────────────────────────────────────
if (process.env.NODE_ENV !== 'test') {
  app.use(morgan(process.env.NODE_ENV === 'production' ? 'combined' : 'dev'));
}

// ── Rate Limits ──────────────────────────────────────────────
const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: process.env.NODE_ENV === 'production' ? 200 : 1000,
  message: { success: false, message: 'Too many requests. Please try again later.' },
  standardHeaders: true,
  legacyHeaders: false,
});
app.use('/api/', apiLimiter);

// ── API Routes ───────────────────────────────────────────────
app.use('/api/auth',       require('./routes/auth'));
app.use('/api/properties', require('./routes/properties'));
app.use('/api',            require('./routes/other'));

// ── Health check ─────────────────────────────────────────────
app.get('/api/health', (req, res) => res.json({
  status: 'OK',
  env: process.env.NODE_ENV,
  time: new Date().toISOString(),
}));

// ── Serve React build in production ──────────────────────────
if (process.env.NODE_ENV === 'production') {
  app.use(express.static(path.join(__dirname, '../frontend/build')));
  app.get('*', (req, res) => {
    // Don't serve index.html for API routes
    if (req.path.startsWith('/api')) return res.status(404).json({ message: 'Not found' });
    res.sendFile(path.join(__dirname, '../frontend/build', 'index.html'));
  });
}

// ── Error Handler ────────────────────────────────────────────
app.use(errorHandler);

const PORT = process.env.PORT || 5001;
app.listen(PORT, () => {
  console.log(`\n🚀 PropFinder API running on port ${PORT}`);
  console.log(`📦 Environment: ${process.env.NODE_ENV}`);
  console.log(`🌐 Client URL:  ${process.env.CLIENT_URL || 'http://localhost:3000'}\n`);
});

module.exports = app;
