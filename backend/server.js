import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import { checkDatabase } from './db.js';

const app = express();
const PORT = Number(process.env.PORT || 5000);
const allowedOrigins = (process.env.CORS_ORIGIN || 'http://localhost:5173')
  .split(',')
  .map((item) => item.trim())
  .filter(Boolean);

app.use(
  cors({
    origin(origin, callback) {
      if (!origin || allowedOrigins.includes(origin)) {
        callback(null, true);
        return;
      }
      callback(new Error('Origin không được phép bởi CORS'));
    },
    credentials: true,
  }),
);
app.use(express.json({ limit: '20mb' }));
app.use(express.urlencoded({ extended: true, limit: '20mb' }));

app.get('/', (_req, res) => {
  res.json({
    name: 'DocShare API',
    status: 'running',
    message: 'Backend DocShare đang hoạt động.',
  });
});

app.get('/api/health', (_req, res) => {
  res.json({ ok: true, service: 'docshare-backend' });
});

app.get('/api/db-health', async (_req, res) => {
  const result = await checkDatabase();
  res.status(result.connected ? 200 : 503).json(result);
});

app.use((error, _req, res, _next) => {
  console.error(error);
  res.status(500).json({
    ok: false,
    message: error.message || 'Lỗi máy chủ.',
  });
});

app.listen(PORT, () => {
  console.log(`DocShare backend: http://localhost:${PORT}`);
});
