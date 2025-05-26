import { Navigate, Outlet, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useEffect, useState } from 'react';

export default function ProtectedRoute() {
  const { user, refreshToken } = useAuth();
  const location = useLocation();
  const [isValidating, setIsValidating] = useState(true);

  useEffect(() => {
    const verifySession = async () => {
      try {
        await refreshToken();
      } finally {
        setIsValidating(false);
      }
    };

    if (user) {
      verifySession();
    } else {
      setIsValidating(false);
    }
  }, [user, refreshToken]);

  if (isValidating) {
    return <div className="text-cyan-400 text-center p-8">Vérification de sécurité...</div>;
  }

  return user ? <Outlet /> : <Navigate to="/login" state={{ from: location }} replace />;
}
