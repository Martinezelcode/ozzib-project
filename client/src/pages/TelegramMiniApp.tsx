import React, { useEffect, useState } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';

export default function TelegramMiniApp() {
  const { user, isAuthenticated, isLoading, login } = useAuth();
  const { toast } = useToast();
  const [isTelegramWebApp, setIsTelegramWebApp] = useState(false);
  const [isClosing, setIsClosing] = useState(false);

  // Detect Telegram WebApp and auto-close on auth
  useEffect(() => {
    const tg = (window as any).Telegram?.WebApp;
    if (tg) {
      console.log('✅ Telegram WebApp detected');
      tg.ready();
      tg.expand();
      setIsTelegramWebApp(true);
    } else {
      console.warn('⚠️ Not in Telegram WebApp context');
      setIsTelegramWebApp(false);
    }
  }, []);

  // Auto-close mini-app after successful auth
  useEffect(() => {
    if (!isLoading && isAuthenticated && user && !isClosing) {
      console.log('✅ User authenticated:', user.username);
      setIsClosing(true);

      // Show success message and close
      toast({
        title: 'Account Linked!',
        description: `Welcome ${user.firstName || user.username || 'User'}! Closing mini-app...`,
      });

      setTimeout(() => {
        const tg = (window as any).Telegram?.WebApp;
        if (tg) {
          console.log('👋 Closing mini-app');
          tg.close();
        }
      }, 1500);
    }
  }, [isAuthenticated, isLoading, user, isClosing, toast]);

  const handleSignIn = async () => {
    try {
      console.log('🔑 Triggering Privy login...');
      await login();
    } catch (err: any) {
      const errMsg = err?.message || String(err);
      console.error('❌ Login error:', errMsg);
      toast({
        title: 'Sign In Failed',
        description: errMsg,
        variant: 'destructive',
      });
    }
  };

  // Initialize Telegram WebApp
  useEffect(() => {
    const initTelegramApp = async () => {
      if (typeof window === 'undefined') return;

      try {
        // Check if we're in a Telegram mini-app context
        const tg = (window as any).Telegram?.WebApp;
        if (!tg) {
          setLinkStatus('error');
          setErrorMessage('This page must be opened from Telegram');
          return;
        }

        // Initialize the WebApp
        tg.ready();
        tg.expand();

        // Get the initData (contains user + signed hash)
        const initData = tg.initData;
        console.log('🔍 Telegram WebApp initData:', initData);
        if (!initData) {
          console.error('❌ initData is empty or undefined');
          setLinkStatus('error');
          setErrorMessage('Unable to verify Telegram session');
          return;
        }

        // Parse initData to extract user info
        const params = new URLSearchParams(initData);
        const userStr = params.get('user');
        if (!userStr) {
          setLinkStatus('error');
          setErrorMessage('Unable to get Telegram user info');
          return;
        }

        const userData: TelegramWebAppData = {
          user: JSON.parse(userStr),
          start_param: params.get('start_param') || undefined,
          auth_date: parseInt(params.get('auth_date') || '0'),
          hash: params.get('hash') || '',
        };

        setTelegramData(userData);
        console.log('✅ Telegram WebApp initialized:', userData);
        console.log('🔐 isAuthenticated:', isAuthenticated);

        // If user is already authenticated, attempt to link immediately
        if (isAuthenticated && userData.user) {
          console.log('👤 User authenticated, attempting link...');
          await attemptLink(userData);
        } else {
          // Otherwise show auth prompt
          console.log('⏳ Awaiting authentication...');
          setLinkStatus('awaiting-auth');
        }
      } catch (error) {
        console.error('Error initializing Telegram WebApp:', error);
        setLinkStatus('error');
        setErrorMessage('Failed to initialize. Please restart from Telegram.');
      }
    };

    initTelegramApp();
  }, [isAuthenticated]);

  const attemptLink = async (data: TelegramWebAppData) => {
    if (!data.user || !data.hash) {
      setLinkStatus('error');
      setErrorMessage('Missing Telegram data');
      return;
    }

    setLinkStatus('linking');
    setIsLinking(true);

    try {
      console.log('📤 Sending link request with data:', {
        telegramId: data.user?.id,
        telegramUsername: data.user?.username,
        hash: data.hash?.substring(0, 20) + '...',
      });

      const response = await apiRequest('POST', '/api/telegram/mini-app/link', {
        telegramId: data.user.id,
        telegramUsername: data.user.username,
        telegramFirstName: data.user.first_name,
        initData: {
          user: data.user,
          auth_date: data.auth_date,
          hash: data.hash,
        },
      });

      console.log('✅ Link response:', response);
      if (response.success) {
        console.log('🎉 Account linked successfully!');
        setLinkStatus('success');
        toast({
          title: 'Account Linked!',
          description: 'Your Telegram account has been linked successfully.',
        });

        // Close mini-app and return to bot
        setTimeout(() => {
          const tg = (window as any).Telegram?.WebApp;
          if (tg) {
            tg.close();
          }
        }, 2000);
      } else {
        console.error('❌ Link failed:', response.message);
        setLinkStatus('error');
        setErrorMessage(response.message || 'Failed to link account');
        toast({
          title: 'Link Failed',
          description: response.message,
          variant: 'destructive',
        });
      }
    } catch (err: any) {
      const errMsg = err?.message || String(err);
      console.error('❌ Link request failed:', errMsg, err);
      setLinkStatus('error');
      setErrorMessage('An error occurred. Please try again.');
      toast({
        title: 'Error',
        description: 'Failed to link Telegram account: ' + errMsg,
        variant: 'destructive',
      });
    } finally {
      setIsLinking(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-900 dark:to-slate-800 flex items-center justify-center p-4">
      <Card className="w-full max-w-md shadow-lg">
        <CardHeader>
          <CardTitle className="text-center">Link Your Telegram Account</CardTitle>
        </CardHeader>
        <CardContent className="text-center space-y-4">
          {isLoading ? (
            <div className="space-y-4 py-8">
              <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto"></div>
              <p className="text-slate-600 dark:text-slate-400">Loading...</p>
            </div>
          ) : isAuthenticated && user ? (
            <div className="space-y-4 py-8">
              <div className="text-5xl animate-bounce">✅</div>
              <div>
                <p className="text-lg font-bold text-green-600 dark:text-green-400">
                  Success!
                </p>
                <p className="text-sm text-slate-600 dark:text-slate-400 mt-2">
                  Your Telegram account is linked. Closing mini-app...
                </p>
              </div>
            </div>
          ) : (
            <div className="space-y-4 py-8">
              <div className="text-4xl">🔗</div>
              <div>
                <p className="text-lg font-semibold text-slate-900 dark:text-slate-100 mb-2">
                  Get Started
                </p>
                <p className="text-sm text-slate-600 dark:text-slate-400 mb-6">
                  Sign in with your Telegram account (or email/wallet) to link and start using Bantah.
                </p>
              </div>
              <Button onClick={handleSignIn} className="w-full" size="lg" disabled={isLoading}>
                Sign In / Sign Up
              </Button>
              {!isTelegramWebApp && (
                <p className="text-xs text-yellow-600 dark:text-yellow-400">
                  ⚠️ Open this in the Telegram mobile app for best experience.
                </p>
              )}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
