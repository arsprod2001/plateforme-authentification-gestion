import type { NextApiRequest, NextApiResponse } from "next";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== "POST") {
    return res.status(405).json({ success: false, message: "Method Not Allowed" });
  }

  const { recaptchaToken } = req.body;

  try {
    const verification = await fetch(
      `https://www.google.com/recaptcha/api/siteverify?secret=${process.env.RECAPTCHA_SECRET_KEY}&response=${recaptchaToken}`,
      { method: "POST" }
    );
    const recaptchaData = await verification.json();

    if (!recaptchaData.success) {
      return res.status(400).json({
        success: false,
        message: "Échec de la vérification reCAPTCHA",
      });
    }

    return res.status(200).json({
      success: true,
      message: "Inscription réussie (recaptcha OK)",
    });
  } catch (error) {
    console.error("Erreur d'inscription :", error);
    return res.status(500).json({
      success: false,
      message: "Erreur lors de l'inscription",
    });
  }
}
