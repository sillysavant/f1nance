import { useState } from 'react';
import { AlertCircle } from 'lucide-react';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { useToast } from '@/components/ui/use-toast';
import { resendVerification } from '@/lib/authApi';
import { getCookie } from '@/lib/cookie';

export const EmailVerificationAlert = () => {
  const { toast } = useToast();
  const [isResending, setIsResending] = useState(false);

  const handleResendVerification = async () => {
    try {
      setIsResending(true);
      const token = getCookie('token');
      if (!token) throw new Error('No authentication token found');
      
      await resendVerification(token);
      toast({
        title: 'Verification email sent',
        description: 'Please check your inbox for the verification link.',
      });
    } catch (error) {
      toast({
        variant: 'destructive',
        title: 'Error',
        description: error instanceof Error ? error.message : 'Failed to resend verification email',
      });
    } finally {
      setIsResending(false);
    }
  };

  return (
    <Alert variant="destructive" className="mb-4">
      <AlertCircle className="h-4 w-4" />
      <AlertTitle>Email verification required</AlertTitle>
      <AlertDescription className="flex items-center justify-between">
        <span>Please verify your email address to access all features.</span>
        <Button 
          variant="outline" 
          size="sm"
          disabled={isResending}
          onClick={handleResendVerification}
        >
          {isResending ? 'Sending...' : 'Resend verification email'}
        </Button>
      </AlertDescription>
    </Alert>
  );
};
