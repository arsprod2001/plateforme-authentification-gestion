import { body, validationResult } from 'express-validator';
import { checkPasswordBreach } from '../services/hibp';

export const validateSignup = [
  body('name')
    .trim()
    .isLength({ min: 3 })
    .withMessage('Le nom doit contenir au moins 3 caractères'),
  
  body('email')
    .isEmail()
    .normalizeEmail()
    .custom(async (email) => {
      const user = await prisma.user.findUnique({ where: { email } });
      if (user) throw new Error('Cet email est déjà utilisé');
    }),
  
  body('password')
    .isLength({ min: 8 })
    .withMessage('Le mot de passe doit contenir au moins 8 caractères')
    .custom(async (password) => {
      if (await checkPasswordBreach(password)) {
        throw new Error('Ce mot de passe a été compromis');
      }
    }),
  
  body('confirmPassword')
    .custom((value, { req }) => value === req.body.password)
    .withMessage('Les mots de passe ne correspondent pas')
];

export const validateLogin = [
  body('email').isEmail().normalizeEmail(),
  body('password').isLength({ min: 8 })
];

export const handleValidationErrors = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }
  next();
};