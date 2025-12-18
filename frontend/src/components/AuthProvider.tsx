import { useEffect } from 'react';
import { useAuthStore } from '@/stores/authStore';
import { authApi } from '@/api/auth';

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const { token, setAuth, setIsLoading } = useAuthStore();

  useEffect(() => {
    const checkAuth = async () => {
      // If no token, user is not authenticated
      if (!token) {
        setAuth(null, null);
        setIsLoading(false);
        return;
      }

      try {
        const data = await authApi.me();
        setAuth(data.user, token);
      } catch {
        // Token is invalid, clear it
        setAuth(null, null);
      } finally {
        setIsLoading(false);
      }
    };

    checkAuth();
  }, [token, setAuth, setIsLoading]);

  return <>{children}</>;
}
