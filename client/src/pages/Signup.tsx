import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { useEffect, useRef, useState } from 'react'
import ReCAPTCHA from 'react-google-recaptcha'

const schema = z.object({
  name: z.string().min(3, { message: "Le nom doit contenir au moins 3 caractères" }),
  email: z.string().email({ message: "Veuillez entrer un email valide" }),
  password: z.string().min(6, { message: "Le mot de passe doit contenir au moins 6 caractères" }),
  confirmPassword: z.string()
}).refine(data => data.password === data.confirmPassword, {
  message: "Les mots de passe ne correspondent pas",
  path: ["confirmPassword"]
})

type FormData = z.infer<typeof schema>

export default function Signup() {
  const { login } = useAuth()
  const navigate = useNavigate()

  const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm<FormData>({
    resolver: zodResolver(schema)
  })

  const recaptchaRef = useRef<ReCAPTCHA>(null)
  const [recaptchaToken, setRecaptchaToken] = useState<string | null>(null)
  const [recaptchaLoaded, setRecaptchaLoaded] = useState(false)
  const [recaptchaError, setRecaptchaError] = useState<string | null>(null)
  const [apiError, setApiError] = useState<string | null>(null)

  useEffect(() => {
    const checkRecaptchaLoad = () => {
      if (typeof window.grecaptcha !== 'undefined') {
        window.grecaptcha.ready(() => {
          setRecaptchaLoaded(true)
        })
      } else {
        setTimeout(checkRecaptchaLoad, 100)
      }
    }
    checkRecaptchaLoad()
  }, [])

  const handleRecaptchaChange = (token: string | null) => {
    setRecaptchaToken(token)
    setRecaptchaError(null)
  }

  const onSubmit = async (data: FormData) => {
    setApiError(null)

    if (!recaptchaToken) {
      setRecaptchaError("Veuillez valider le reCAPTCHA")
      return
    }

    try {
      const response = await fetch(`${import.meta.env.VITE_API_URL}/signup`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        },
        body: JSON.stringify({ ...data, recaptchaToken })
      })

      const responseData = await response.json()

      if (!response.ok) {
        throw new Error(responseData.error || "Échec de l'inscription")
      }

      if (responseData.token) {
        login(responseData.token)
        navigate('/')
      } else {
        throw new Error("Réponse inattendue du serveur")
      }

    } catch (error) {
      console.error("Erreur lors de l'inscription:", error)
      if (error instanceof Error) {
        setApiError(error.message)
      } else {
        setApiError("Une erreur inconnue est survenue.")
      }
      recaptchaRef.current?.reset()
      setRecaptchaToken(null)
    }
  }

  if (!recaptchaLoaded) {
    return <div className="text-cyan-400 text-center p-8">Chargement des sécurités...</div>
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 flex items-center justify-center p-4 relative overflow-hidden">
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-purple-500/10 to-transparent mix-blend-screen" />
      <div className="absolute w-96 h-96 bg-purple-500/5 rounded-full -top-48 -left-48 blur-3xl animate-pulse" />
      <div className="absolute w-96 h-96 bg-cyan-500/5 rounded-full -bottom-48 -right-48 blur-3xl animate-pulse delay-1000" />

      <form
        onSubmit={handleSubmit(onSubmit)}
        className="relative bg-gray-800/80 backdrop-blur-lg p-8 rounded-xl border border-purple-500/30 shadow-2xl shadow-purple-500/20 w-full max-w-md space-y-6"
      >
        <h2 className="text-4xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-cyan-500 text-center">
          Créer un compte
        </h2>

        <div className="space-y-5">
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-3">Nom complet</label>
            <input
              {...register('name')}
              className="w-full px-4 py-3 bg-gray-700/50 border-2 border-gray-600 rounded-lg focus:outline-none focus:border-purple-500 focus:ring-2 focus:ring-purple-500/30 text-gray-100 placeholder-gray-400 transition-all duration-200"
              placeholder="John Doe"
            />
            {errors.name && <p className="text-red-400 text-sm mt-2 animate-pulse">⚠ {errors.name.message}</p>}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-300 mb-3">Email</label>
            <input
              type="email"
              {...register('email')}
              className="w-full px-4 py-3 bg-gray-700/50 border-2 border-gray-600 rounded-lg focus:outline-none focus:border-purple-500 focus:ring-2 focus:ring-purple-500/30 text-gray-100 placeholder-gray-400 transition-all duration-200"
              placeholder="exemple@email.com"
            />
            {errors.email && <p className="text-red-400 text-sm mt-2 animate-pulse">⚠ {errors.email.message}</p>}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-300 mb-3">Mot de passe</label>
            <input
              type="password"
              {...register('password')}
              className="w-full px-4 py-3 bg-gray-700/50 border-2 border-gray-600 rounded-lg focus:outline-none focus:border-purple-500 focus:ring-2 focus:ring-purple-500/30 text-gray-100 placeholder-gray-400 transition-all duration-200"
              placeholder="••••••••"
            />
            {errors.password && <p className="text-red-400 text-sm mt-2 animate-pulse">⚠ {errors.password.message}</p>}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-300 mb-3">Confirmation</label>
            <input
              type="password"
              {...register('confirmPassword')}
              className="w-full px-4 py-3 bg-gray-700/50 border-2 border-gray-600 rounded-lg focus:outline-none focus:border-purple-500 focus:ring-2 focus:ring-purple-500/30 text-gray-100 placeholder-gray-400 transition-all duration-200"
              placeholder="••••••••"
            />
            {errors.confirmPassword && <p className="text-red-400 text-sm mt-2 animate-pulse">⚠ {errors.confirmPassword.message}</p>}
          </div>

          <div className="mt-4">
            <ReCAPTCHA
              ref={recaptchaRef}
              sitekey={import.meta.env.VITE_RECAPTCHA_SITE_KEY}
              onChange={handleRecaptchaChange}
              theme="dark"
              className="flex justify-center my-4"
            />
            {recaptchaError && <p className="text-red-400 text-sm mt-2 animate-pulse text-center">⚠ {recaptchaError}</p>}
          </div>

          {apiError && <p className="text-red-500 text-center text-sm animate-pulse">⚠ {apiError}</p>}

          <button
            type="submit"
            disabled={isSubmitting || !recaptchaToken}
            className={`w-full bg-gradient-to-r from-purple-500 to-cyan-500 text-gray-900 font-bold py-3 px-6 rounded-lg transition-all duration-300 transform hover:scale-[1.02] shadow-lg hover:shadow-purple-500/20 flex items-center justify-center gap-2 ${isSubmitting || !recaptchaToken ? 'opacity-70 cursor-not-allowed' : ''}`}
          >
            {isSubmitting ? <span className="animate-spin">🌀</span> : <>🎉 S'inscrire</>}
          </button>

          <p className="text-center text-sm text-gray-400">
            Déjà un compte ?{' '}
            <Link to="/login" className="text-purple-400 hover:text-purple-300 font-semibold underline underline-offset-4 hover:no-underline transition-all">
              Se connecter
            </Link>
          </p>
        </div>
      </form>
    </div>
  )
}
