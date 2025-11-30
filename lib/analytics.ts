import posthog from 'posthog-js';

// Check if PostHog is initialized
const isPostHogInitialized = () => {
  return typeof window !== 'undefined' && posthog && posthog._isIdentified !== undefined;
};

// User Events
export const trackUserSignup = (method: 'google' | 'email', userId?: string) => {
  if (!isPostHogInitialized()) return;
  
  posthog.capture('user_signup', {
    method,
    user_id: userId,
  });
};

export const trackUserLogin = (method: 'google' | 'email', userId?: string) => {
  if (!isPostHogInitialized()) return;
  
  posthog.capture('user_login', {
    method,
    user_id: userId,
  });
  if (userId) {
    posthog.identify(userId);
  }
};

export const trackUserLogout = () => {
  if (!isPostHogInitialized()) return;
  
  posthog.capture('user_logout');
  posthog.reset();
};

// Poll Events
export const trackPollView = (pollId: string, pollTitle: string, category: string) => {
  if (!isPostHogInitialized()) return;
  
  posthog.capture('poll_viewed', {
    poll_id: pollId,
    poll_title: pollTitle,
    category,
  });
};

export const trackPollCreated = (pollId: string, category: string) => {
  if (!isPostHogInitialized()) return;
  
  posthog.capture('poll_created', {
    poll_id: pollId,
    category,
  });
};

export const trackPollShared = (pollId: string, method: 'twitter' | 'whatsapp' | 'link') => {
  if (!isPostHogInitialized()) return;
  
  posthog.capture('poll_shared', {
    poll_id: pollId,
    share_method: method,
  });
};

// Stake Events
export const trackStakePlaced = (
  pollId: string,
  optionId: string,
  amount: number,
  category: string
) => {
  if (!isPostHogInitialized()) return;
  
  posthog.capture('stake_placed', {
    poll_id: pollId,
    option_id: optionId,
    stake_amount: amount,
    category,
  });
};

export const trackStakeAttemptFailed = (
  pollId: string,
  reason: 'insufficient_balance' | 'poll_closed' | 'already_staked' | 'error'
) => {
  if (!isPostHogInitialized()) return;
  
  posthog.capture('stake_attempt_failed', {
    poll_id: pollId,
    failure_reason: reason,
  });
};

// Wallet Events
export const trackWalletTopup = (amount: number, method: string) => {
  if (!isPostHogInitialized()) return;
  
  posthog.capture('wallet_topup', {
    amount,
    payment_method: method,
  });
};

export const trackWalletWithdrawal = (amount: number) => {
  if (!isPostHogInitialized()) return;
  
  posthog.capture('wallet_withdrawal', {
    amount,
  });
};

// Error Tracking
export const trackError = (error: string, context?: any) => {
  if (!isPostHogInitialized()) return;
  
  posthog.capture('error_occurred', {
    error_message: error,
    context,
    page_url: window.location.href,
  });
};

// Feature Usage
export const trackFeatureUsed = (feature: string, details?: any) => {
  if (!isPostHogInitialized()) return;
  
  posthog.capture('feature_used', {
    feature_name: feature,
    ...details,
  });
};

// Admin Events
export const trackAdminAction = (action: string, target?: string, details?: any) => {
  if (!isPostHogInitialized()) return;
  
  posthog.capture('admin_action', {
    action,
    target,
    ...details,
  });
};

// Set User Properties
export const setUserProperties = (properties: {
  email?: string;
  firstName?: string;
  lastName?: string;
  role?: string;
  walletBalance?: number;
  isEmailVerified?: boolean;
  isPhoneVerified?: boolean;
  kycCompleted?: boolean;
}) => {
  if (!isPostHogInitialized()) return;
  
  posthog.people.set(properties);
};