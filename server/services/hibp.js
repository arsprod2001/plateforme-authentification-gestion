import axios from 'axios';
import crypto from 'crypto';

export const checkPasswordBreach = async (password) => {
  try {
    const hash = crypto.createHash('sha1').update(password).digest('hex').toUpperCase();
    const prefix = hash.substring(0, 5);
    const suffix = hash.substring(5);

    const response = await axios.get(`${process.env.HIBP_API_URL}${prefix}`, {
      headers: { 'Add-Padding': true }
    });

    return response.data.includes(suffix);
  } catch (error) {
    console.error('HIBP Check Error:', error);
    throw new Error('Impossible de vérifier la sécurité du mot de passe');
  }
};