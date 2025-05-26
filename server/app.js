import express from 'express';
import { corsMiddleware, helmetMiddleware, rateLimitMiddleware } from './middlewares/security.js';
import authRoutes from './routes/authRoute.js';

const app = express();

// Middlewares pour parser le JSON et les données URL-encodées, avec une limite de taille
app.use(express.json({ limit: '10kb' }));
app.use(express.urlencoded({ extended: true, limit: '10kb' }));

// Middleware de sécurité
app.use(helmetMiddleware);
app.use(corsMiddleware);

// Limiter les requêtes sur les routes d'authentification
app.use('/api/auth', rateLimitMiddleware);

// Routes d'authentification
app.use('/api/auth', authRoutes);

// Gestion des routes non trouvées (404)
app.use('*', (req, res) => {
  res.status(404).json({
    status: 'fail',
    message: `Can't find ${req.originalUrl} on this server`
  });
});

export default app;
