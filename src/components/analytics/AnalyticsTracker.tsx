'use client';

import { useEffect, useRef } from 'react';
import { usePathname, useSearchParams } from 'next/navigation';

export default function AnalyticsTracker() {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const sessionIdRef = useRef<string | null>(null);

  useEffect(() => {
    // Generate or get session ID from sessionStorage
    if (typeof window !== 'undefined') {
      let storedId = sessionStorage.getItem('analytics_session_id');
      if (!storedId) {
        storedId = Math.random().toString(36).substring(2, 15);
        sessionStorage.setItem('analytics_session_id', storedId);
      }
      sessionIdRef.current = storedId;
    }
  }, []);

  useEffect(() => {
    const trackPageView = async () => {
      if (!sessionIdRef.current) return;

      try {
        await fetch('/api/analytics/track', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            event_name: 'page_view',
            path: pathname + (searchParams.toString() ? `?${searchParams.toString()}` : ''),
            session_id: sessionIdRef.current,
            user_agent: navigator.userAgent,
            referrer: document.referrer,
          }),
        });
      } catch (error) {
        // Silently ignore tracking errors to avoid affecting UX
        console.error('Analytics tracking failed', error);
      }
    };

    trackPageView();
  }, [pathname, searchParams]);

  return null; // This component doesn't render anything
}
