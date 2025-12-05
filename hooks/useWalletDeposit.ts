import { useMemo, useEffect, useState, useCallback, useRef } from "react";
import {
  useSendTransaction,
  useWaitForTransactionReceipt,
  useAccount,
  useChainId,
  useSwitchChain,
} from "wagmi";
import { useSendUserOperation, useCurrentUser } from "@coinbase/cdp-hooks";
import { parseUnits, encodeFunctionData } from "viem";
import { toast } from "sonner";
import type { LifecycleStatus } from "@coinbase/onchainkit/transaction";
import { useAuthStore } from "@/stores/authStore";

// USDC contract address on Base mainnet
const USDC_ADDRESS_MAINNET = "0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913" as const;
// USDC contract address on Base Sepolia
const USDC_ADDRESS_SEPOLIA = "0x036CbD53842c5426634e7929541eC2318f3dCF7e" as const;
// Platform deposit address from env
const DEPOSIT_ADDRESS = (process.env.NEXT_PUBLIC_DEPOSIT_ADDRESS || "0x0000000000000000000000000000000000000000") as `0x${string}`;

// Get expected chain ID from env
const EXPECTED_CHAIN_ID = Number(process.env.NEXT_PUBLIC_CHAIN_ID) || 8453;
const USDC_ADDRESS = EXPECTED_CHAIN_ID === 84532 ? USDC_ADDRESS_SEPOLIA : USDC_ADDRESS_MAINNET;
const CDP_NETWORK = EXPECTED_CHAIN_ID === 84532 ? "base-sepolia" : "base";

// ERC20 ABI for transfer
const ERC20_ABI = [
  {
    name: "transfer",
    type: "function",
    inputs: [
      { name: "to", type: "address" },
      { name: "amount", type: "uint256" },
    ],
    outputs: [{ name: "", type: "bool" }],
    stateMutability: "nonpayable",
  },
] as const;

interface UseWalletDepositOptions {
  onSuccess?: () => void;
  onError?: (error: string) => void;
}

interface UseWalletDepositReturn {
  amount: number;
  setAmount: (amount: number) => void;
  isDepositing: boolean;
  handleDeposit: () => void;
  depositCalls: Array<{
    to: `0x${string}`;
    data: `0x${string}`;
  }>;
  handleOnchainStatus: (status: LifecycleStatus) => void;
  userAddress: `0x${string}` | undefined;
  isSmartWallet: boolean;
  isWrongNetwork: boolean;
  isSwitchingNetwork: boolean;
  switchToCorrectNetwork: () => Promise<void>;
}

export function useWalletDeposit(
  options?: UseWalletDepositOptions
): UseWalletDepositReturn {
  const [amount, setAmount] = useState(0);
  const { address: userAddress, isConnected } = useAccount();
  const { user } = useAuthStore();
  const isAuthenticated = !!user;
  const currentChainId = useChainId();
  const { switchChain, isPending: isSwitchingNetwork } = useSwitchChain();

  // Track if we initiated a deposit (prevents stale state from showing toasts)
  const hasInitiatedDeposit = useRef(false);

  // Reset deposit tracking when disconnected or logged out
  useEffect(() => {
    if (!isConnected || !isAuthenticated) {
      hasInitiatedDeposit.current = false;
    }
  }, [isConnected, isAuthenticated]);

  // Check if on wrong network
  const isWrongNetwork = currentChainId !== EXPECTED_CHAIN_ID;

  // Switch to correct network
  const switchToCorrectNetwork = useCallback(async () => {
    try {
      await switchChain({ chainId: EXPECTED_CHAIN_ID });
      toast.success("Switched to Base network");
    } catch (err: any) {
      console.error("Network switch error:", err);
      toast.error("Failed to switch network. Please switch manually in your wallet.");
    }
  }, [switchChain]);

  // CDP hooks for smart wallet
  const { currentUser } = useCurrentUser();
  const {
    sendUserOperation,
    status: cdpStatus,
    data: cdpData,
    error: cdpError,
  } = useSendUserOperation();

  // Check if user has a smart account
  const smartAccount = currentUser?.evmSmartAccounts?.[0];
  const isSmartWallet = !!smartAccount;
console.log("isSmartWallet:", isSmartWallet);
  // Wagmi sendTransaction hook for EOA wallets
  const {
    sendTransaction,
    data: depositTxHash,
    isPending: isDepositPending,
    error: depositError,
  } = useSendTransaction();

  // Wait for transaction confirmation (EOA only)
  const { isLoading: isDepositConfirming, isSuccess: isDepositSuccess } =
    useWaitForTransactionReceipt({
      hash: depositTxHash,
    });
console.log("isDepositPending:", depositTxHash, "isDepositConfirming:", isDepositConfirming, "isDepositSuccess:", isDepositSuccess);
  // Computed deposit loading state
  const isDepositing = isSmartWallet
    ? cdpStatus === "pending"
    : isDepositPending || isDepositConfirming;

  // Handle EOA deposit transaction success
  useEffect(() => {
    if (!isSmartWallet && isDepositSuccess && depositTxHash && hasInitiatedDeposit.current && isAuthenticated) {
      toast.success("Deposit confirmed! Your balance will update shortly.");
      setAmount(0);
      hasInitiatedDeposit.current = false;
      options?.onSuccess?.();
    }
  }, [isSmartWallet, isDepositSuccess, depositTxHash, isAuthenticated, options]);

  // Handle EOA deposit error
  useEffect(() => {
    if (!isSmartWallet && depositError && hasInitiatedDeposit.current) {
      console.error("Deposit error:", depositError);
      const errorMessage = depositError?.message || "Transaction failed";
      hasInitiatedDeposit.current = false;

      if (
        errorMessage.includes("User rejected") ||
        errorMessage.includes("user rejected")
      ) {
        toast.error("Transaction cancelled");
      } else if (
        errorMessage.includes("insufficient") ||
        errorMessage.includes("exceeds balance")
      ) {
        toast.error("Insufficient USDC balance");
      } else {
        toast.error(errorMessage.slice(0, 100));
      }
      options?.onError?.(errorMessage);
    }
  }, [isSmartWallet, depositError, options]);

  // Handle CDP smart wallet success
  useEffect(() => {
    if (isSmartWallet && cdpStatus === "success" && cdpData && hasInitiatedDeposit.current && isAuthenticated) {
      toast.success("Deposit confirmed! Your balance will update shortly.");
      setAmount(0);
      hasInitiatedDeposit.current = false;
      options?.onSuccess?.();
    }
  }, [isSmartWallet, cdpStatus, cdpData, isAuthenticated, options]);

  // Handle CDP smart wallet error
  useEffect(() => {
    if (isSmartWallet && cdpStatus === "error" && cdpError && hasInitiatedDeposit.current) {
      console.error("CDP Deposit error:", cdpError);
      const errorMessage = cdpError?.message || "Transaction failed";
      hasInitiatedDeposit.current = false;
      toast.error(errorMessage.slice(0, 100));
      options?.onError?.(errorMessage);
    }
  }, [isSmartWallet, cdpStatus, cdpError, options]);

  // OnchainKit Transaction calls for USDC transfer
  const depositCalls = useMemo(() => {
    if (!amount || amount <= 0 || !userAddress) return [];

    const depositAmount = amount;
    const amountInUnits = parseUnits(depositAmount.toString(), 6);

    return [
      {
        to: USDC_ADDRESS as `0x${string}`,
        data: encodeFunctionData({
          abi: ERC20_ABI,
          functionName: "transfer",
          args: [DEPOSIT_ADDRESS, amountInUnits],
        }),
      },
    ];
  }, [amount, userAddress]);

  // Handle deposit - uses CDP for smart wallet, wagmi for EOA
  const handleDeposit = useCallback(async () => {
    if (!amount) {
      toast.error("Please enter an amount!");
      return;
    }

    const depositAmount = amount;
    if (isNaN(depositAmount) || depositAmount <= 0) {
      toast.error("Please enter a valid amount!");
      return;
    }

    // Check if on wrong network (for EOA wallets)
    if (!isSmartWallet && isWrongNetwork) {
      toast.error("Please switch to Base network first!");
      try {
        await switchChain({ chainId: EXPECTED_CHAIN_ID });
        toast.success("Switched to Base network. Please try again.");
      } catch {
        toast.error("Failed to switch network. Please switch manually.");
      }
      return;
    }

    // USDC has 6 decimals
    const amountInUnits = parseUnits(depositAmount.toString(), 6);

    // Encode the ERC20 transfer call
    const transferData = encodeFunctionData({
      abi: ERC20_ABI,
      functionName: "transfer",
      args: [DEPOSIT_ADDRESS, amountInUnits],
    });

    // Mark that we initiated a deposit
    hasInitiatedDeposit.current = true;

    if (isSmartWallet && smartAccount) {
      // Use CDP hooks for smart wallet
      try {
        await sendUserOperation({
          evmSmartAccount: smartAccount,
          network: CDP_NETWORK,
          calls: [
            {
              to: USDC_ADDRESS,
              data: transferData,
              value: BigInt(0),
            },
          ],
          useCdpPaymaster: true, // Gas sponsorship
        });
      } catch (err: any) {
        console.error("CDP transfer failed:", err);
        hasInitiatedDeposit.current = false;
        toast.error(err?.message || "Transfer failed");
      }
    } else {
      // Use wagmi for EOA
      sendTransaction({
        to: USDC_ADDRESS,
        data: transferData,
      });
    }
  }, [amount, isSmartWallet, isWrongNetwork, smartAccount, sendUserOperation, sendTransaction, switchChain]);

  // Handle OnchainKit transaction status (fallback)
  const handleOnchainStatus = useCallback(
    (status: LifecycleStatus) => {
      console.log("OnchainKit status:", status);
      if (status.statusName === "success") {
        toast.success("Deposit confirmed! Your balance will update shortly.");
        setAmount(0);
        options?.onSuccess?.();
      } else if (status.statusName === "error") {
        const errorMessage =
          (status.statusData as { message?: string })?.message ||
          "Transaction failed";
        toast.error(errorMessage);
        options?.onError?.(errorMessage);
      }
    },
    [options]
  );

  return {
    amount,
    setAmount,
    isDepositing,
    handleDeposit,
    depositCalls,
    handleOnchainStatus,
    userAddress,
    isSmartWallet,
    isWrongNetwork,
    isSwitchingNetwork,
    switchToCorrectNetwork,
  };
}
