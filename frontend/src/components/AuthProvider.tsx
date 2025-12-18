import { useEffect } from 'react';
import { useAuthStore } from '@/stores/authStore';
import { authApi } from '@/api/auth';

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const { setUser, setIsLoading } = useAuthStore();

  useEffect(() => {
    const checkAuth = async () => {
      try {
        const data = await authApi.me();
        setUser(data.user);
      } catch {
        // On auth check failure, set user to null
        // Don't set loading to false here - let it happen in finally
        setUser(null);
      } finally {
        setIsLoading(false);
      }
    };

    checkAuth();
  }, [setUser, setIsLoading]);

  return <>{children}</>;
}
