import { useState, useRef } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useAuth } from '../context/AuthContext';
import { Link, useNavigate } from 'react-router-dom';
import ReCAPTCHA from 'react-google-recaptcha';
import api from '../services/api';



const schema = z.object({
  email: z.string().email({ message: "Veuillez entrer un email valide" }),
  password: z.string().min(6, { message: "Le mot de passe doit contenir au moins 6 caractères" })
});

type FormData = z.infer<typeof schema>;

interface ApiError {
  response?: {
    data?: {
      error?: string;
    };
  };
}

export default function Login() {
  const { login } = useAuth();
  const navigate = useNavigate();
  
  const { 
    register, 
    handleSubmit, 
    formState: { errors, isSubmitting } 
  } = useForm<FormData>({
    resolver: zodResolver(schema)
  });

  const [apiError, setApiError] = useState<string | null>(null);
  const [recaptchaToken, setRecaptchaToken] = useState<string | null>(null);
  const recaptchaRef = useRef<ReCAPTCHA>(null);

  const onSubmit = async (data: FormData) => {
    try {
      setApiError(null);

      if (!recaptchaToken) {
        setApiError('Veuillez valider le reCAPTCHA');
        return;
      }

      const response = await api.post('/auth/login', {
        ...data,
        recaptchaToken
      });
      
      await login(response.data.token);
      navigate('/dashboard');
      
    } catch (error) {
      console.error('Login error:', error);
      
      const apiError = error as ApiError;
      setApiError(
        apiError?.response?.data?.error || 
        'Erreur de connexion. Veuillez réessayer.'
      );
      
      recaptchaRef.current?.reset();
      setRecaptchaToken(null);
    }
  };

  const handleRecaptchaChange = (token: string | null) => {
    setRecaptchaToken(token);
    if (apiError && token) setApiError(null);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 flex items-center justify-center p-4 relative overflow-hidden">
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-cyan-500/10 to-transparent mix-blend-screen" />
      <div className="absolute w-96 h-96 bg-cyan-500/5 rounded-full -top-48 -left-48 blur-3xl animate-pulse" />
      <div className="absolute w-96 h-96 bg-purple-500/5 rounded-full -bottom-48 -right-48 blur-3xl animate-pulse delay-1000" />

      <form 
        onSubmit={handleSubmit(onSubmit)}
        className="relative bg-gray-800/80 backdrop-blur-lg p-8 rounded-xl border border-cyan-500/30 shadow-2xl shadow-cyan-500/20 w-full max-w-md space-y-8"
      >
        <h2 className="text-4xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-blue-500 text-center">
          Connexion
        </h2>
        
        {apiError && (
          <div className="bg-red-500/10 border border-red-500/30 text-red-300 px-4 py-3 rounded-lg">
            {apiError}
          </div>
        )}

        <div className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-3">Email</label>
            <div className="relative group">
              <input
                {...register('email')}
                type="email"
                autoComplete="username"
                className="w-full px-4 py-3 bg-gray-700/50 border-2 border-gray-600 rounded-lg focus:outline-none focus:border-cyan-500 focus:ring-2 focus:ring-cyan-500/30 text-gray-100 placeholder-gray-400 transition-all duration-200"
                placeholder="exemple@email.com"
              />
              {errors.email && (
                <p className="text-red-400 text-sm mt-2 animate-pulse">
                  ⚠ {errors.email.message}
                </p>
              )}
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-300 mb-3">Mot de passe</label>
            <div className="relative group">
              <input
                type="password"
                {...register('password')}
                autoComplete="current-password"
                className="w-full px-4 py-3 bg-gray-700/50 border-2 border-gray-600 rounded-lg focus:outline-none focus:border-cyan-500 focus:ring-2 focus:ring-cyan-500/30 text-gray-100 placeholder-gray-400 transition-all duration-200"
                placeholder="••••••••"
              />
              {errors.password && (
                <p className="text-red-400 text-sm mt-2 animate-pulse">
                  ⚠ {errors.password.message}
                </p>
              )}
            </div>
          </div>

          <ReCAPTCHA
            ref={recaptchaRef}
            sitekey={import.meta.env.VITE_RECAPTCHA_SITE_KEY}
            onChange={handleRecaptchaChange}
            theme="dark"
            size="normal"
            className="flex justify-center"
          />

          <button
            type="submit"
            disabled={isSubmitting || !recaptchaToken}
            className={`w-full bg-gradient-to-r from-cyan-500 to-blue-500 text-gray-900 font-bold py-3 px-6 rounded-lg transition-all duration-300 transform hover:scale-[1.02] shadow-lg hover:shadow-cyan-500/20 flex items-center justify-center gap-2 ${
              isSubmitting || !recaptchaToken ? 'opacity-70 cursor-not-allowed' : ''
            }`}
          >
            {isSubmitting ? (
              <span className="animate-spin">🌀</span>
            ) : (
              <>
                <span className="text-xl">🚀</span>
                Se connecter
              </>
            )}
          </button>

          <div className="text-center text-sm text-gray-400">
            <Link 
              to="/forgot-password" 
              className="text-cyan-400 hover:text-cyan-300 font-semibold underline underline-offset-4 hover:no-underline transition-all"
            >
              Mot de passe oublié ?
            </Link>
            <span className="mx-2">•</span>
            <Link 
              to="/signup" 
              className="text-cyan-400 hover:text-cyan-300 font-semibold underline underline-offset-4 hover:no-underline transition-all"
            >
              Créer un compte
            </Link>
          </div>
        </div>
      </form>
    </div>
  );
}