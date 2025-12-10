
import React, { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { apiRequest } from '@/lib/queryClient';

export default function TelegramLink() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { user, isAuthenticated } = useAuth();
  const { toast } = useToast();
  const [isLinking, setIsLinking] = useState(false);
  const [linkStatus, setLinkStatus] = useState<'pending' | 'success' | 'error'>('pending');
  const [errorMessage, setErrorMessage] = useState('');
  const [authCheckComplete, setAuthCheckComplete] = useState(false);

  useEffect(() => {
    const linkAccount = async () => {
      const token = searchParams.get('token');
      
      if (!token) {
        setLinkStatus('error');
        setErrorMessage('Invalid link. Please use /start in Telegram to get a new link.');
        return;
      }

      // Wait a moment for auth state to settle
      if (!authCheckComplete) {
        setTimeout(() => setAuthCheckComplete(true), 500);
        return;
      }

      if (!isAuthenticated) {
        // Redirect to login with return URL
        navigate(`/?telegram_token=${token}`);
        return;
      }

      setIsLinking(true);

      try {
        const response = await apiRequest(`/api/telegram/verify-link?token=${token}`, {
          method: 'GET',
        });

        if (response.success) {
          setLinkStatus('success');
          toast({
            title: 'Account Linked!',
            description: 'Your Telegram account has been successfully linked.',
          });
          
          // Redirect to profile after 3 seconds
          setTimeout(() => {
            navigate('/profile');
          }, 3000);
        } else {
          setLinkStatus('error');
          setErrorMessage(response.message || 'Failed to link account');
          toast({
            title: 'Link Failed',
            description: response.message,
            variant: 'destructive',
          });
        }
      } catch (error) {
        setLinkStatus('error');
        setErrorMessage('An error occurred. Please try again.');
        toast({
          title: 'Error',
          description: 'Failed to link Telegram account',
          variant: 'destructive',
        });
      } finally {
        setIsLinking(false);
      }
    };

    linkAccount();
  }, [user, searchParams, isAuthenticated, authCheckComplete, navigate, toast]);

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-900 flex items-center justify-center p-4">
      <Card className="max-w-md w-full">
        <CardHeader>
          <CardTitle className="text-center">
            {linkStatus === 'pending' && '🔗 Linking Telegram Account...'}
            {linkStatus === 'success' && '✅ Account Linked!'}
            {linkStatus === 'error' && '❌ Link Failed'}
          </CardTitle>
        </CardHeader>
        <CardContent className="text-center">
          {isLinking && (
            <div className="space-y-4">
              <div className="w-16 h-16 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto"></div>
              <p className="text-slate-600 dark:text-slate-400">
                Linking your Telegram account...
              </p>
            </div>
          )}

          {linkStatus === 'success' && (
            <div className="space-y-4">
              <div className="text-6xl">🎉</div>
              <p className="text-lg font-semibold text-slate-900 dark:text-slate-100">
                Success!
              </p>
              <p className="text-slate-600 dark:text-slate-400">
                Your Telegram account is now linked to Bantah.
              </p>
              <p className="text-sm text-slate-500">
                Redirecting to your profile...
              </p>
            </div>
          )}

          {linkStatus === 'error' && (
            <div className="space-y-4">
              <div className="text-6xl">⚠️</div>
              <p className="text-lg font-semibold text-red-600 dark:text-red-400">
                Link Failed
              </p>
              <p className="text-slate-600 dark:text-slate-400">
                {errorMessage}
              </p>
              <div className="space-y-2">
                <Button 
                  onClick={() => navigate('/profile')}
                  className="w-full"
                >
                  Go to Profile
                </Button>
                <p className="text-xs text-slate-500">
                  Open Telegram and use /start to get a new link
                </p>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
