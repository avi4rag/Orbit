import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { connectDB, isDbConnected } from './db.js';
import { authRouter } from './routes/auth.js';
import { profileRouter } from './routes/profile.js';
import { aiRouter } from './routes/ai.js';
import { ritualsRouter } from './routes/rituals.js';
import { actionsRouter } from './routes/actions.js';
import { catalogRouter } from './routes/catalog.js';
import { subliminalsRouter } from './routes/subliminals.js';
import sessionRoutes from './routes/sessionRoutes.js';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config();

const app = express();
const PORT = process.env.PORT || 4000;

app.use(cors());
app.use(express.json());

// Static Media with HTTP 206 Range support
app.use('/media', express.static(path.resolve(__dirname, '../media')));

// Routes
app.use('/api/auth', authRouter);
app.use('/api/profile', profileRouter);
app.use('/api/ai', aiRouter);
app.use('/api/rituals', ritualsRouter);
app.use('/api/actions', actionsRouter);
app.use('/api/catalog', catalogRouter);
app.use('/api/subliminals', subliminalsRouter);
app.use('/api/sessions', sessionRoutes);

// Health Check
app.get('/api/health', (req, res) => {
  res.json({
    status: 'ok',
    app: 'Orbit API Server',
    version: '3.0.0-pivot',
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
