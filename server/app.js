import express from 'express';
import { corsMiddleware, helmetMiddleware, rateLimitMiddleware } from './middlewares/security.js';
import authRoutes from './routes/authRoute.js';

const app = express();

app.use(express.json({ limit: '10kb' }));
app.use(express.urlencoded({ extended: true, limit: '10kb' }));

app.use(helmetMiddleware);
app.use(corsMiddleware);

app.use('/api/auth', rateLimitMiddleware);

app.use('/api/auth', authRoutes);

app.use('*', (req, res) => {
  res.status(404).json({
    status: 'fail',
    message: `Can't find ${req.originalUrl} on this server`
  });
});

export default app;
