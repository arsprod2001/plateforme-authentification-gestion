import express from 'express';
import authController from '../controllers/authController.js';

const router = express.Router();

router.post('/signup', authController.signup.bind(authController));
router.post('/login', authController.login.bind(authController));
router.post('/logout', authController.logout.bind(authController));

export default router;
