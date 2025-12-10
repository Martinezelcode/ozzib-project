import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { ThemeProvider } from "@/contexts/ThemeProvider";
  import { EventsSearchProvider } from "./context/EventsSearchContext";
import { useAuth } from "@/hooks/useAuth";
import { useNotifications } from "@/hooks/useNotifications";
import { useEffect, useState } from "react";
import NotFound from "@/pages/not-found";
import Landing from "@/pages/Landing";
import Home from "@/pages/Home";
import Events from "./pages/Events";
import EventCreate from "./pages/EventCreate";
import Challenges from "./pages/Challenges";
import Friends from "./pages/Friends";
import Profile from "./pages/Profile";
import ProfileEdit from "./pages/ProfileEdit";
import ProfileSettings from "./pages/ProfileSettings";
import History from "./pages/History";
import Notifications from "./pages/Notifications";
import WalletPage from "@/pages/WalletPage";
import Shop from "@/pages/Shop";
import ReferralNew from "./pages/ReferralNew";
import Settings from "@/pages/Settings";
import SupportChat from "@/pages/SupportChat";
import HelpSupport from "@/pages/HelpSupport";
import TermsOfService from "@/pages/TermsOfService";
import PrivacyPolicy from "@/pages/PrivacyPolicy";
import DataDeletionRequest from "@/pages/DataDeletionRequest";
import Leaderboard from "./pages/Leaderboard";
import PointsAndBadges from "./pages/PointsAndBadges";
import ChallengeDetail from "./pages/ChallengeDetail";
import Recommendations from "./pages/Recommendations";
import EventChatPage from "./pages/EventChatPage";
import AdminDashboardOverview from "./pages/AdminDashboardOverview";
import AdminEventPayouts from "./pages/AdminEventPayouts";
import AdminChallengePayouts from "./pages/AdminChallengePayouts";
import AdminPayouts from "./pages/AdminPayouts";
import AdminAnalytics from "./pages/AdminAnalytics";
import AdminNotifications from "@/pages/AdminNotifications";
import AdminUsersManagement from "./pages/AdminUsersManagement";
import AdminSettings from "./pages/AdminSettings";

import { DailyLoginModal } from '@/components/DailyLoginModal';
import { useDailyLoginPopup } from '@/hooks/useDailyLoginPopup';
import AdminLogin from "@/pages/AdminLogin"; // Assuming you have an AdminLogin component
import { WebsiteTour, useTour } from "@/components/WebsiteTour";
import { SplashScreen } from "@/components/SplashScreen"; //Import Splashscreen
import TelegramTest from "./pages/TelegramTest";
import TelegramLink from "@/pages/TelegramLink";
import Bantzz from "./pages/Bantzz";
import Stories from "./pages/Stories";
import BantMap from "./pages/BantMap";
import NotificationTest from "./pages/NotificationTest";
import PublicProfile from "@/pages/PublicProfile";
import { Navigation } from "@/components/Navigation";
import { ErrorBoundary } from "react-error-boundary";
import React, { Suspense, lazy } from "react";
import EventDetails from "./pages/EventDetails";
import { PrivyProvider } from '@privy-io/react-auth';
import { privyConfig } from './lib/privyConfig';

function Router() {
  const { user, isAuthenticated, isLoading } = useAuth();

  // Initialize tour
  const tour = useTour();

  // Add global tour event listener
  useEffect(() => {
    const handleStartTour = () => {
      tour.startTour();
    };

    window.addEventListener('start-tour', handleStartTour);

    return () => {
      window.removeEventListener('start-tour', handleStartTour);
    };
  }, [tour]);

  // Initialize notifications for authenticated users
  const notifications = useNotifications();

  // Initialize automatic daily login popup
  const { showDailyLoginPopup, closeDailyLoginPopup, dailyLoginStatus } = useDailyLoginPopup();

  // Show loading state while checking authentication
  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50 dark:bg-slate-900">
        <div className="text-center">
          <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-slate-600 dark:text-slate-400">Loading...</p>
        </div>
      </div>
    );
  }



  return (
    <div className="min-h-screen transition-all duration-300 ease-in-out">
      {/* Only show Navigation for authenticated users, not on landing page */}
      {isAuthenticated && (
        <div className="sticky top-0 z-50">
          <Navigation />
        </div>
      )}

      <Switch>
      {/* Admin Login Route - Always Available */}
      <Route path="/admin/login" component={AdminLogin} />
      <Route path="/admin-login" component={AdminLogin} />

      {/* Public profile routes - accessible to everyone */}
      <Route path="/@:username" component={PublicProfile} />
      <Route path="/u/:username" component={PublicProfile} />

      {/* Public Routes - Accessible to everyone */}
      <Route path="/events/:id/chat" component={EventChatPage} />
      <Route path="/events/:id" component={EventDetails} />
      <Route path="/event/:id" component={EventChatPage} />

      {/* Admin routes - accessible regardless of main authentication state */}
      <Route path="/admin" component={AdminDashboardOverview} />
      <Route path="/admin/payouts" component={AdminPayouts} />
      <Route path="/admin/events" component={AdminEventPayouts} />
      <Route path="/admin/challenges" component={AdminChallengePayouts} />
      <Route path="/admin/analytics" component={AdminAnalytics} />
      <Route path="/admin/notifications" component={AdminNotifications} />
      <Route path="/admin/users" component={AdminUsersManagement} />
      <Route path="/admin/settings" component={AdminSettings} />

      {isLoading || !isAuthenticated ? (
        <>
          <Route path="/" component={Landing} />
          <Route path="/ref/:code" component={Landing} />
        </>
      ) : (
        <>
          <Route path="/" component={Events} />
          <Route path="/events" component={Events} />
          <Route path="/home" component={Home} />
          <Route path="/events/create" component={EventCreate} />
          <Route path="/create" component={EventCreate} />
          <Route path="/recommendations" component={Recommendations} />
          <Route path="/challenges" component={Challenges} />
          <Route path="/challenges/:id" component={ChallengeDetail} />
          <Route path="/friends" component={Friends} />
          <Route path="/wallet" component={WalletPage} />
          <Route path="/shop" component={Shop} />
          <Route path="/leaderboard" component={Leaderboard} />
          <Route path="/points" component={PointsAndBadges} />
          <Route path="/notifications" component={Notifications} />
          <Route path="/profile" component={Profile} />
          <Route path="/profile/edit" component={ProfileEdit} />
          <Route path="/profile/settings" component={ProfileSettings} />
          <Route path="/referrals" component={ReferralNew} />
          <Route path="/history" component={History} />
          <Route path="/settings" component={Settings} />
          <Route path="/support-chat" component={SupportChat} />
          <Route path="/help-support" component={HelpSupport} />
          <Route path="/terms-of-service" component={TermsOfService} />
          <Route path="/privacy-policy" component={PrivacyPolicy} />
          <Route path="/data-deletion-request" component={DataDeletionRequest} />
          <Route path="/telegram/test" component={TelegramTest} />
          <Route path="/telegram-auth" component={TelegramLink} />
          <Route path="/telegram-link" component={TelegramLink} />
          <Route path="/bantzz" component={Bantzz} />
          <Route path="/stories" component={Stories} />
          <Route path="/bant-map" component={BantMap} />
          <Route path="/notifications/test" component={NotificationTest} />
          <Route path="/ref/:code" component={Landing} />
        </>
      )}

      {/* Catch-all route for undefined paths - must be last */}
      <Route path="/:rest*" component={NotFound} />
    </Switch>



    {/* Automatic Daily Login Popup */}
    {isAuthenticated && (
      <DailyLoginModal 
        isOpen={showDailyLoginPopup}
        onClose={closeDailyLoginPopup}
        currentStreak={(dailyLoginStatus as any)?.streak || 0}
        hasClaimedToday={(dailyLoginStatus as any)?.hasSignedInToday || false}
        canClaim={(dailyLoginStatus as any)?.canClaim || false}
      />
    )}

    {/* Website Tour */}
    {isAuthenticated && (
      <WebsiteTour 
        isOpen={tour.isOpen}
        onClose={tour.closeTour}
      />
    )}
    </div>
  );
}

function App() {
  const [showSplash, setShowSplash] = useState(true);
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };

    checkMobile();
    window.addEventListener('resize', checkMobile);

    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  const handleSplashComplete = () => {
    setShowSplash(false);
  };

  return (
    <QueryClientProvider client={queryClient}>
      <PrivyProvider
        appId={privyConfig.appId}
        config={privyConfig.config}
      >
        <ThemeProvider>
          <EventsSearchProvider>
            <div className={`${isMobile ? 'mobile-app' : ''}`}>
              {showSplash ? (
                <SplashScreen onComplete={handleSplashComplete} />
              ) : (
                <TooltipProvider>
                  <Toaster />
                  <ErrorBoundary
                    fallback={<div className="p-4 text-center">Something went wrong. Please refresh the page.</div>}
                    onError={(error) => console.error("App Error:", error)}
                  >
                    <Router />
                  </ErrorBoundary>
                </TooltipProvider>
              )}
            </div>
          </EventsSearchProvider>
        </ThemeProvider>
      </PrivyProvider>
    </QueryClientProvider>
  );
}

export default App;