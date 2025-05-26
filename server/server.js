import app from './app.js';
import config from './config/env.js';
import prisma from './services/prisma.js';
import redis from './services/redis.js';
import { createServer } from 'http';

const startServer = async () => {
  try {
    // Connexion à la base de données Prisma
    await prisma.$connect();
    
    // Connexion à Redis
    await redis.connect();

    // Création du serveur HTTP avec Express app
    const server = createServer(app);

    // Démarrage du serveur
    server.listen(config.PORT, () => {
      console.log(`Server running on port ${config.PORT}`);
    });
  } catch (error) {
    console.error('Failed to start server:', error);
    process.exit(1);
  }
};

startServer();
