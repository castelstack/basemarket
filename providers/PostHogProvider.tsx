'use client';

import posthog from 'posthog-js';
import { PostHogProvider as PHProvider } from 'posthog-js/react';
import { useEffect } from 'react';

export function PostHogPageView(): JSX.Element {
  
  useEffect(() => {
    posthog.init(`${process.env.NEXT_PUBLIC_POSTHOG_KEY}`, {
      api_host: 'https://us.i.posthog.com',
      person_profiles: 'identified_only',
    });
  }, []);
    return <></>;
  }

export function PostHogProvider({ children }: { children: React.ReactNode }) {
  return <PHProvider client={posthog}>{children}</PHProvider>;
}
