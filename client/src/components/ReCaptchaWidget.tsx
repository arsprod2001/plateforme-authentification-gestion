import ReCAPTCHA from "react-google-recaptcha";
import { useRef } from "react";

interface ReCaptchaWidgetProps {
  onChange: (token: string | null) => void;
}

export default function ReCaptchaWidget({ onChange }: ReCaptchaWidgetProps) {
  const recaptchaRef = useRef<ReCAPTCHA>(null);

  return (
    <ReCAPTCHA
      ref={recaptchaRef}
      sitekey={import.meta.env.VITE_RECAPTCHA_SITE_KEY}
      onChange={onChange}
      theme="dark"
      size="normal"
      className="my-4"
      aria-label="reCAPTCHA widget"
    />
  );
}
