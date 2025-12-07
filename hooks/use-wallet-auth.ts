import { useCallback, useEffect, useRef, useState } from "react";
import {
  useAccount,
  useChainId,
  usePublicClient,
  useSignMessage,
  useSwitchChain,
} from "wagmi";

import { authApi, useGetWalletMessage, useWalletSignIn } from "@/lib/auth";
import { useUserProfile } from "@/lib/user";
import { useAuthStore } from "@/stores/authStore";
import { useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

// Expected chain ID from environment
const EXPECTED_CHAIN_ID = Number(process.env.NEXT_PUBLIC_CHAIN_ID) || 8453;

interface UseWalletAuthReturn {
  isWalletConnected: boolean;
  isAuthenticated: boolean;
  isLoading: boolean;
  showSignIn: boolean;
  error: string | null;
  isWrongNetwork: boolean;
  isSwitchingNetwork: boolean;
  switchToCorrectNetwork: () => Promise<void>;
  signIn: () => Promise<void>;
  signOut: () => Promise<void>;
}

export const useWalletAuth = (): UseWalletAuthReturn => {
  const [isSigningIn, setIsSigningIn] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [authCleared, setAuthCleared] = useState(false);
  const profileChecked = useRef(false);

  const { address, isConnected } = useAccount();
  const chainId = useChainId();
  const { signMessageAsync } = useSignMessage();
  const { switchChain, isPending: isSwitchingNetwork } = useSwitchChain();
  const publicClient = usePublicClient();
  const queryClient = useQueryClient();

  const getMessageMutation = useGetWalletMessage();
  const signInMutation = useWalletSignIn();

  const { user, setUser, updateAdmin, updateSubAdmin, updateBalance, logout: storeLogout } = useAuthStore();

  // Check if user is on wrong network
  const isWrongNetwork = isConnected && chainId !== EXPECTED_CHAIN_ID;
  console.log("Current chainId:", address, "Expected:", EXPECTED_CHAIN_ID);
  // Switch to correct network
  const switchToCorrectNetwork = useCallback(async () => {
    try {
      await switchChain({ chainId: EXPECTED_CHAIN_ID });
      toast.success("Switched to correct network");
    } catch (err: any) {
      console.error("Network switch error:", err);
      toast.error("Failed to switch network. Please switch manually.");
    }
  }, [switchChain]);
  // Only fetch profile once when wallet connects
  const {
    data: profileData,
    isLoading: isLoadingProfile,
    isError: isProfileError,
    isFetched,
  } = useUserProfile(isConnected && !user);

  // Update auth store when profile is fetched successfully
  useEffect(() => {
    if (profileData?.data && isConnected) {
      const userData = profileData.data;

      // Set user data
      setUser(userData);

      // Check for admin roles
      if (
        userData.roles?.includes("admin") ||
        userData.roles?.includes("super_admin")
      ) {
        updateAdmin(true);
        updateSubAdmin(false);
      } else if (userData.roles?.includes("sub_admin")) {
        updateAdmin(false);
        updateSubAdmin(true);
      } else {
        updateAdmin(false);
        updateSubAdmin(false);
      }

      // Update balance
      if (userData.wallet?.balance !== undefined) {
        updateBalance(userData.wallet.balance);
      }

      profileChecked.current = true;
    }
  }, [profileData, isConnected, setUser, updateAdmin, updateSubAdmin, updateBalance]);

  // Clear user from store when profile fetch fails
  useEffect(() => {
    if (isProfileError && isConnected) {
      setUser(null);
      updateAdmin(false);
      updateSubAdmin(false);
      setAuthCleared(true);
    }
  }, [isProfileError, isConnected, setUser, updateAdmin, updateSubAdmin]);

  // Reset when wallet disconnects
  useEffect(() => {
    if (!isConnected) {
      profileChecked.current = false;
      setAuthCleared(false);
    }
  }, [isConnected]);

  // Check auth on mount
  useEffect(() => {
    const hasToken = !!localStorage.getItem("accessToken");
    if (!hasToken && isConnected && !user) {
      setAuthCleared(true);
    }
  }, [isConnected, user]);

  // Computed states
  const isWalletConnected = isConnected;
  const isAuthenticated = isConnected && !!profileData?.data && !isProfileError;

  // Show sign in when:
  // 1. Wallet is connected but no user in store
  // 2. Profile is not loading
  // 3. Either profile was fetched (but returned no user), profile errored, or auth was cleared (401)
  const showSignIn =
    isConnected && !user && !isLoadingProfile && (isFetched || isProfileError || authCleared);

  // Combined loading state
  const isLoading =
    isSigningIn || getMessageMutation.isPending || signInMutation.isPending;

  // Sign in with wallet (SIWE flow)
  const signIn = useCallback(async () => {
    if (!address || !isConnected) {
      setError("Wallet not connected");
      toast.error("Please connect your wallet first");
      return;
    }

    // Check if on wrong network
    if (chainId !== EXPECTED_CHAIN_ID) {
      setError("Wrong network");
      toast.error("Please switch to the correct network");
      return;
    }

    setIsSigningIn(true);
    setError(null);

    try {
      // Step 1: Get SIWE message from backend
      const messageResponse = await getMessageMutation.mutateAsync({
        address,
        chainId: EXPECTED_CHAIN_ID,
      });

      if (!messageResponse.data?.message) {
        throw new Error("Failed to get message");
      }

      // Message is already prepared by backend, sign it directly
      const message = messageResponse.data.message;

      // Step 2: Sign the message with wallet
      const signature = await signMessageAsync({ message });

      // Step 3: Check if smart wallet and verify on frontend (same pattern as backend)
      let verified: boolean | undefined;
      if (publicClient && address) {
        try {
          const bytecode = await publicClient.getCode({ address });
          console.log("Contract bytecode:", bytecode);
          const isSmartWallet = bytecode && bytecode !== "0x";

          if (isSmartWallet) {
            toast.info("Smart wallet detected");
            verified = true;
          }
        } catch {
          // Could not check bytecode, proceed without verified flag
        }
      }

      // Step 4: Verify with backend and get tokens
      const signInResponse = await signInMutation.mutateAsync({
        message,
        signature,
        ...(verified === true && { verified: true }),
      });

      if (signInResponse.data?.user) {
        const userData = signInResponse.data.user;

        // Set user data in auth store
        setUser(userData);

        // Check for admin roles (same pattern as login page)
        if (
          userData.roles?.includes("admin") ||
          userData.roles?.includes("super_admin")
        ) {
          updateAdmin(true);
          updateSubAdmin(false);
        } else if (userData.roles?.includes("sub_admin")) {
          updateAdmin(false);
          updateSubAdmin(true);
        } else {
          updateAdmin(false);
          updateSubAdmin(false);
        }

        // Update balance if available
        if (userData.wallet?.balance !== undefined) {
          updateBalance(userData.wallet.balance);
        }

        // Reset auth cleared flag and invalidate queries
        setAuthCleared(false);
        queryClient.invalidateQueries({ queryKey: ["user", "profile"] });

        toast.success("Successfully signed in!");
      }
    } catch (err: any) {
      console.error("Wallet sign-in error:", err);
      const errorMessage = err?.message || "Failed to sign in with wallet";
      setError(errorMessage);

      // Show appropriate toast based on error type
      const isUserRejection =
        errorMessage.toLowerCase().includes("rejected") ||
        errorMessage.toLowerCase().includes("denied") ||
        errorMessage.toLowerCase().includes("user refused");

      if (isUserRejection) {
        toast.error("Sign in cancelled");
      } else {
        toast.error(errorMessage);
      }
    } finally {
      setIsSigningIn(false);
    }
  }, [
    address,
    isConnected,
    chainId,
    getMessageMutation,
    signInMutation,
    signMessageAsync,
    publicClient,
    setUser,
    updateAdmin,
    updateSubAdmin,
    updateBalance,
    queryClient,
  ]);

  // Sign out
  const signOut = useCallback(async () => {
    try {
      const refreshToken = localStorage.getItem("refreshToken");
      if (refreshToken) {
        await authApi.logout({ refreshToken });
      }
    } catch (err) {
      console.error("Logout error:", err);
    } finally {
      storeLogout();
      localStorage.removeItem("accessToken");
      localStorage.removeItem("refreshToken");
      localStorage.removeItem("user");
      profileChecked.current = false;
      queryClient.clear();
    }
  }, [storeLogout, queryClient]);

  return {
    isWalletConnected,
    isAuthenticated,
    isLoading,
    showSignIn,
    error,
    isWrongNetwork,
    isSwitchingNetwork,
    switchToCorrectNetwork,
    signIn,
    signOut,
  };
};
