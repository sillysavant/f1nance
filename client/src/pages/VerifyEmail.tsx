import { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { Loader2 } from 'lucide-react';
import { verifyEmail } from '@/lib/authApi';
import { getCookie } from '@/lib/cookie';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';

export const VerifyEmail = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [status, setStatus] = useState<'verifying' | 'success' | 'error'>('verifying');
  const [error, setError] = useState<string>('');

  useEffect(() => {
    const verify = async () => {
      const token = searchParams.get('token');
      if (!token) {
        setStatus('error');
        setError('No verification token found');
        return;
      }

      try {
        const authToken = getCookie('token');
        if (!authToken) {
          // If user is not logged in, we'll need them to log in first
          // Store the verification token in sessionStorage so we can use it after login
          sessionStorage.setItem('pendingVerificationToken', token);
          navigate('/auth?mode=login&redirect=verify');
          return;
        }

        await verifyEmail(token, authToken);
        setStatus('success');
        // Wait a moment before redirecting to dashboard
        setTimeout(() => navigate('/dashboard'), 2000);
      } catch (err) {
        setStatus('error');
        setError(err instanceof Error ? err.message : 'Failed to verify email');
      }
    };

    verify();
  }, [searchParams, navigate]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-4">
      <div className="w-full max-w-md space-y-4">
        {status === 'verifying' && (
          <div className="flex flex-col items-center space-y-4">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
            <p className="text-lg font-medium">Verifying your email...</p>
          </div>
        )}

        {status === 'success' && (
          <Alert className="bg-success/15 border-success text-success">
            <AlertTitle>Email verified successfully!</AlertTitle>
            <AlertDescription>
              Redirecting you to the dashboard...
            </AlertDescription>
          </Alert>
        )}

        {status === 'error' && (
          <Alert variant="destructive">
            <AlertTitle>Verification failed</AlertTitle>
            <AlertDescription className="space-y-4">
              <p>{error}</p>
              <Button 
                variant="outline" 
                onClick={() => navigate('/dashboard')}
                className="w-full"
              >
                Return to Dashboard
              </Button>
            </AlertDescription>
          </Alert>
        )}
      </div>
    </div>
  );
};

export default VerifyEmail;
