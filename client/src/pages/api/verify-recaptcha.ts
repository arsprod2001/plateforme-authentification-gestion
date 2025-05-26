import type { NextApiRequest, NextApiResponse } from 'next';

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== 'POST') {
    return res.status(405).json({ success: false, message: "Method Not Allowed" });
  }

  const { recaptchaToken } = req.body;

  try {
    const response = await fetch(
      `https://www.google.com/recaptcha/api/siteverify?secret=${process.env.RECAPTCHA_SECRET_KEY}&response=${recaptchaToken}`,
      { method: 'POST' }
    );
    const data = await response.json();
    res.status(200).json(data);
  } catch (error) {
    console.error('Erreur reCAPTCHA:', error);
    res.status(500).json({ success: false });
  }
}
