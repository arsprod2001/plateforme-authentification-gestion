import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import axios from 'axios';
import prisma from '../services/prisma.js';
import redis from '../services/redis.js';
import config from '../config/env.js';

class AuthController {
  async signup(req, res) {
    try {
      const { recaptchaToken, name, email, password } = req.body;

      // Vérification reCAPTCHA
      const recaptchaResponse = await axios.post(
        `https://www.google.com/recaptcha/api/siteverify?secret=${config.RECAPTCHA_SECRET_KEY}&response=${recaptchaToken}`
      );

      if (!recaptchaResponse.data?.success) {
        return res.status(400).json({ error: 'Échec de la vérification reCAPTCHA' });
      }

      // Vérification email existant
      const existingUser = await prisma.user.findUnique({ where: { email } });
      if (existingUser) {
        return res.status(409).json({ error: 'Email déjà utilisé' });
      }

      // Hachage mot de passe
      const hashedPassword = await bcrypt.hash(password, 12);

      // Création utilisateur
      const user = await prisma.user.create({
        data: { name, email, password: hashedPassword }
      });

      // Génération JWT
      const token = jwt.sign(
        { userId: user.id },
        config.JWT_SECRET,
        { expiresIn: config.JWT_EXPIRES_IN }
      );

      // Stockage Redis
      await redis.set(`user:${user.id}:token`, token);

      return res.status(201).json({
        user: {
          id: user.id,
          name: user.name,
          email: user.email,
          createdAt: user.createdAt
        },
        token
      });
    } catch (error) {
      console.error('Signup error:', error);
      return res.status(500).json({ error: 'Erreur serveur' });
    }
  }

  async login(req, res) {
    try {
      const { email, password, recaptchaToken } = req.body;

      // Validation reCAPTCHA en production
      if (process.env.NODE_ENV === 'production') {
        const recaptchaResponse = await axios.post(
          `https://www.google.com/recaptcha/api/siteverify?secret=${config.RECAPTCHA_SECRET_KEY}&response=${recaptchaToken}`
        );

        if (!recaptchaResponse.data?.success || recaptchaResponse.data.score < 0.5) {
          return res.status(400).json({
            error: 'Échec de la vérification de sécurité'
          });
        }
      }

      // Vérification de l'existence de l'utilisateur
      const user = await prisma.user.findUnique({ where: { email } });

      if (!user) {
        // Délai constant pour éviter timing attack
        await bcrypt.compare(password, '$2a$12$fakehashforsecurity');
        return res.status(401).json({ error: 'Identifiants invalides' });
      }

      // Vérification mot de passe
      const passwordMatch = await bcrypt.compare(password, user.password);
      if (!passwordMatch) {
        return res.status(401).json({ error: 'Identifiants invalides' });
      }

      // Vérification tentative brute force
      const failedAttempts = await redis.get(`login:attempts:${user.id}`) || 0;
      if (failedAttempts >= 5) {
        return res.status(429).json({
          error: 'Trop de tentatives. Veuillez réessayer dans 15 minutes'
        });
      }

      // Génération token JWT
      const token = jwt.sign(
        {
          userId: user.id,
          role: user.role || 'user'
        },
        config.JWT_SECRET,
        {
          expiresIn: config.JWT_EXPIRES_IN,
          issuer: 'your-app-name'
        }
      );

      // Stockage token Redis
      await redis.set(`user:${user.id}:token`, token);

      // Reset compteur tentatives
      await redis.del(`login:attempts:${user.id}`);

      // Log connexion réussie
      await prisma.loginLog.create({
        data: {
          userId: user.id,
          ipAddress: req.ip,
          userAgent: req.headers['user-agent'],
          status: 'SUCCESS'
        }
      });

      const userData = {
        id: user.id,
        name: user.name,
        email: user.email,
        createdAt: user.createdAt,
        lastLogin: new Date() // à adapter si lastLogin est en base
      };

      // Set cookie sécurisé
      res.cookie('token', token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'strict',
        maxAge: 3600000 // 1h
      });

      return res.status(200).json({ user: userData, token });
    } catch (error) {
      // Incrémenter compteur tentatives en cas d'erreur
      if (req.body.email) {
        const user = await prisma.user.findUnique({ where: { email: req.body.email } });
        if (user) {
          const attempts = await redis.incr(`login:attempts:${user.id}`);
          await redis.expire(`login:attempts:${user.id}`, 900); // 15min

          await prisma.loginLog.create({
            data: {
              userId: user.id,
              ipAddress: req.ip,
              userAgent: req.headers['user-agent'],
              status: 'FAILED'
            }
          });
        }
      }
      console.error('Login error:', error);
      return res.status(500).json({ error: 'Erreur lors de la connexion' });
    }
  }

  async logout(req, res) {
    try {
      const token = req.headers.authorization?.split(' ')[1];
      if (!token) return res.status(401).json({ error: 'Token manquant' });

      const decoded = jwt.verify(token, config.JWT_SECRET);
      await redis.del(`user:${decoded.userId}:token`);

      return res.status(200).json({ message: 'Déconnexion réussie' });
    } catch (error) {
      console.error('Logout error:', error);
      return res.status(500).json({ error: 'Erreur serveur' });
    }
  }
}

export default new AuthController();
