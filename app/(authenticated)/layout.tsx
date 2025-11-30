'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useMiniKit, useQuickAuth } from '@coinbase/onchainkit/minikit';
import { useAuthStore } from '@/stores/authStore';
import { useWalletBalance } from '@/lib';

interface AuthResponse {
  success: boolean;
  user?: {
    fid: number;
    issuedAt?: number;
    expiresAt?: number;
  };
  message?: string;
}

export default function AuthenticatedLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();
  const { isFrameReady, setFrameReady, context } = useMiniKit();
  const { setUser, updateAdmin, updateSubAdmin, updateBalance } = useAuthStore();
  const [isInitialized, setIsInitialized] = useState(false);

  // Initialize the miniapp frame
  useEffect(() => {
    if (!isFrameReady) {
      setFrameReady();
    }
  }, [setFrameReady, isFrameReady]);

  // Authenticate via Farcaster Quick Auth
  const { data: authData, isLoading: isAuthLoading, error: authError } = useQuickAuth<AuthResponse>(
    '/api/auth',
    { method: 'GET' }
  );

  // Fetch wallet balance
  const { data: balanceData, isSuccess: balanceSuccess } = useWalletBalance(!!authData?.success);

  // Set up user data from Farcaster context
  useEffect(() => {
    if (authData?.success && context?.user) {
      // Create user object from Farcaster context
      const farcasterUser = {
        id: String(authData.user?.fid || context.user.fid),
        fid: authData.user?.fid || context.user.fid,
        username: context.user.username || `user_${context.user.fid}`,
        firstName: context.user.displayName?.split(' ')[0] || 'Player',
        lastName: context.user.displayName?.split(' ').slice(1).join(' ') || '',
        email: '', // Not available from Farcaster
        roles: ['user'],
        isEmailVerified: true,
        isTwoFactorAuthEnabled: false,
        isPhoneVerified: false,
        kycCompleted: false,
        status: 'active',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        walletAddress: '',
        wallet: {
          balance: 0,
          bonusBalance: 0,
          isLocked: false,
          totalDeposits: 0,
          totalStakes: 0,
          totalWinnings: 0,
          totalWithdrawals: 0,
        },
      };

      setUser(farcasterUser);
      updateAdmin(false);
      updateSubAdmin(false);
      setIsInitialized(true);
    }
  }, [authData, context, setUser, updateAdmin, updateSubAdmin]);

  // Update balance when wallet balance is fetched successfully
  useEffect(() => {
    if (balanceSuccess && balanceData?.data) {
      updateBalance(balanceData.data.totalBalance || 0);
    }
  }, [balanceData, balanceSuccess, updateBalance]);

  // Show loading state while initializing
  if (!isFrameReady || isAuthLoading) {
    return (
      <div className='min-h-screen bg-black flex items-center justify-center'>
        <div className='text-center flex flex-col items-center'>
          <div className='animate-spin rounded-full h-12 w-12 border-b-2 border-violet-400 mb-4'></div>
          <p className='text-gray-400'>Connecting to Farcaster...</p>
        </div>
      </div>
    );
  }

  // Show error if auth failed
  if (authError || (authData && !authData.success)) {
    return (
      <div className='min-h-screen bg-black flex items-center justify-center'>
        <div className='text-center flex flex-col items-center max-w-md px-4'>
          <div className='w-16 h-16 bg-red-500/20 rounded-full flex items-center justify-center mb-4'>
            <span className='text-2xl'>⚠️</span>
          </div>
          <h2 className='text-xl font-bold text-white mb-2'>Authentication Required</h2>
          <p className='text-gray-400 mb-4'>
            Please open this app from within Farcaster to authenticate.
          </p>
          <p className='text-sm text-gray-500'>
            {authData?.message || 'Unable to verify your identity'}
          </p>
        </div>
      </div>
    );
  }

  return <>{children}</>;
}
