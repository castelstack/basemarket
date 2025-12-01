import { useState, useCallback, useEffect, useRef } from "react";
import {
  useAccount,
  useSignMessage,
  useChainId,
  useSwitchChain,
  usePublicClient,
} from "wagmi";
import { verifyMessage } from "viem";
import { useQueryClient } from "@tanstack/react-query";
import { useGetWalletMessage, useWalletSignIn, authApi } from "@/lib/auth";
import { useUserProfile } from "@/lib/user";
import { useAuthStore } from "@/stores/authStore";
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
  const profileChecked = useRef(false);

  const { address, isConnected } = useAccount();
  const chainId = useChainId();
  const { signMessageAsync } = useSignMessage();
  const { switchChain, isPending: isSwitchingNetwork } = useSwitchChain();
  const publicClient = usePublicClient();
  const queryClient = useQueryClient();

  const getMessageMutation = useGetWalletMessage();
  const signInMutation = useWalletSignIn();

  const { user, updateUserData, logout: storeLogout } = useAuthStore();

  // Check if user is on wrong network
  const isWrongNetwork = isConnected && chainId !== EXPECTED_CHAIN_ID;

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
      updateUserData(profileData.data, profileData.data.wallet?.balance);
      profileChecked.current = true;
    }
  }, [profileData, isConnected, updateUserData]);

  // Reset when wallet disconnects
  useEffect(() => {
    if (!isConnected) {
      profileChecked.current = false;
    }
  }, [isConnected]);

  // Computed states
  const isWalletConnected = isConnected;
  const isAuthenticated = !!user && isConnected;

  // Show sign-in only when:
  // 1. Wallet is connected
  // 2. No user in store
  // 3. Profile fetch is done (not loading)
  // 4. Profile fetch was attempted (isFetched or error)
  const showSignIn =
    isConnected && !user && !isLoadingProfile && (isFetched || isProfileError);

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

      const message = messageResponse.data.message;

      // Step 2: Sign the message with wallet
      const signature = await signMessageAsync({ message });

      // Step 3: Check if smart wallet and verify on frontend
      let verified: boolean | undefined;
      if (publicClient && address) {
        try {
          const code = await publicClient.getCode({ address });
          const isSmartWallet = code && code !== "0x";

          if (isSmartWallet) {
            // Smart wallet - try to verify signature on frontend
            try {
              const isValid = await verifyMessage({
                address,
                message,
                signature,
              });
              verified = isValid;
            } catch {
              // Verification failed, let backend handle it
              verified = undefined;
            }
          }
        } catch {
          // Could not check code, proceed without verified flag
        }
      }
      console.log(address, "Verified:", verified ? "yes" : "no or undefined");
      // Step 4: Verify with backend and get tokens
      const signInResponse = await signInMutation.mutateAsync({
        message,
        signature,
        verified: true,
      });

      if (signInResponse.data?.user) {
        // Update auth store with user data
        updateUserData(
          signInResponse.data.user,
          signInResponse.data.user.wallet?.balance
        );

        // Invalidate user profile query to sync state
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
    updateUserData,
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
