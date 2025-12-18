/* eslint-disable @typescript-eslint/no-explicit-any */
import { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router';
import { useMutation } from '@tanstack/react-query';
import { authApi } from '@/api/auth';
import { useAuthStore } from '@/stores/authStore';
import { Button } from '@ui/button';
import { Input } from '@ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@ui/card';
import { Label } from '@ui/label';
import { Alert, AlertDescription } from '@ui/alert';

export default function SignInPage() {
  const navigate = useNavigate();
  const { isAuthenticated, isLoading, setAuth, setIsLoading } = useAuthStore();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  // Redirect if already authenticated (only after initial auth check)
  useEffect(() => {
    if (!isLoading && isAuthenticated) {
      navigate('/', { replace: true });
    }
  }, [isAuthenticated, isLoading, navigate]);

  // Reset loading state for signin page to avoid infinite loading
  useEffect(() => {
    if (isLoading) {
      // Small delay to avoid flash, but ensure page becomes interactive
      const timer = setTimeout(() => {
        if (isLoading && !isAuthenticated) {
          setIsLoading(false);
        }
      }, 1000);
      return () => clearTimeout(timer);
    }
  }, [isLoading, isAuthenticated, setIsLoading]);

  const signInMutation = useMutation({
    mutationFn: authApi.signIn,
    onSuccess: (data) => {
      setAuth(data.user, data.token);
      navigate('/');
    },
    onError: (error: any) => {
      setError(error.response?.data?.error || 'Sign in failed');
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    signInMutation.mutate({ email, password });
  };

  // Show loading while checking auth
  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center" role="status" aria-live="polite">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900 mx-auto" aria-hidden="true"></div>
          <p className="mt-4 text-muted-foreground">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 p-4">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle>Sign In</CardTitle>
          <CardDescription>Enter your credentials to access your account</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4" aria-busy={signInMutation.isPending}>
            {error && (
              <Alert variant="destructive" role="alert">
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}
            
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                placeholder="you@example.com"
                aria-required="true"
                aria-invalid={error ? 'true' : 'false'}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <Input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                placeholder="••••••••"
                aria-required="true"
                aria-invalid={error ? 'true' : 'false'}
              />
            </div>

            <Button 
              type="submit" 
              className="w-full" 
              disabled={signInMutation.isPending}
            >
              {signInMutation.isPending ? 'Signing in...' : 'Sign In'}
            </Button>

            <p className="text-center text-sm text-muted-foreground">
              Don't have an account?{' '}
              <Link to="/signup" className="text-primary hover:underline">
                Sign up
              </Link>
            </p>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
