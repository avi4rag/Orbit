import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { connectDB, isDbConnected } from './db.js';
import { authRouter } from './routes/auth.js';
import { profileRouter } from './routes/profile.js';
import { aiRouter } from './routes/ai.js';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 4000;

app.use(cors());
app.use(express.json());

// Routes
app.use('/api/auth', authRouter);
app.use('/api/profile', profileRouter);
app.use('/api/ai', aiRouter);

// Health Check
app.get('/api/health', (req, res) => {
  res.json({
    status: 'ok',
    app: 'Orbit API Server',
    version: '2.0.0',
    timestamp: new Date().toISOString(),
    database: isDbConnected() ? 'connected (mongodb)' : 'in-memory (offline fallback)'
  });
});

async function bootstrap() {
  await connectDB();
  app.listen(PORT, () => {
    console.log(`[Orbit API] Server listening on http://localhost:${PORT}`);
  });
}

bootstrap();

export default app;
