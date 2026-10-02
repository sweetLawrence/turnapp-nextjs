"use client"

import { Suspense, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation'
import { toast } from 'sonner';
import { Loader2 } from 'lucide-react';

const OAuthCallbackInner = () => {
  const router = useRouter();
  const searchParams = useSearchParams();

  useEffect(() => {
    const handleOAuthCallback = () => {
      const token = searchParams.get('token');
      const userEncoded = searchParams.get('user');
      const messageEncoded = searchParams.get('message');
      const messageType = searchParams.get('message_type') || 'success';

      if (token && userEncoded) {
        try {
          const user = JSON.parse(atob(userEncoded));
          localStorage.setItem('auth_token', token);
          localStorage.setItem('user', JSON.stringify(user));

          if (messageEncoded) {
            const message = atob(messageEncoded);
            if (messageType === 'success') {
              toast.success(message);
            } else {
              toast.error(message);
            }
          }

          if (user.user_type === 'Admin' || user.user_type === 'Organiser') {
            router.replace('/dashboard');
          } else if (user.user_type === 'affiliate') {
            router.replace('/dashboard');
          } else {
            router.replace('/');
          }
        } catch (error) {
          console.error('Error processing OAuth callback:', error);
          toast.error('Authentication failed. Please try again.');
          router.replace('/login');
        }
      } else {
        if (messageEncoded) {
          const message = atob(messageEncoded);
          toast.error(message);
        } else {
          toast.error('Authentication failed. Please try again.');
        }
        router.replace('/login');
      }
    };

    handleOAuthCallback();
  }, [searchParams, router]);

  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="text-center">
        <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4 text-primary" />
        <p className="text-white">Completing authentication...</p>
      </div>
    </div>
  );
};

const OAuthCallback = () => (
  <Suspense fallback={
    <div className="min-h-screen flex items-center justify-center">
      <Loader2 className="h-8 w-8 animate-spin text-primary" />
    </div>
  }>
    <OAuthCallbackInner />
  </Suspense>
);

export default OAuthCallback;