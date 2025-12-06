import { useMemo, useEffect, useState, useCallback, useRef } from "react";
import {
  useSendTransaction,
  useWaitForTransactionReceipt,
  useAccount,
  useChainId,
  useSwitchChain,
} from "wagmi";
import { useSendUserOperation, useCurrentUser } from "@coinbase/cdp-hooks";
import {
  parseUnits,
  encodeFunctionData,
  createPublicClient,
  http,
} from "viem";
import { base, baseSepolia } from "viem/chains";
import { toast } from "sonner";
import type { LifecycleStatus } from "@coinbase/onchainkit/transaction";
import { useAuthStore } from "@/stores/authStore";

// Public RPC clients for direct polling (bypasses wagmi config issues on mobile)
const baseClient = createPublicClient({
  chain: base,
  transport: http("https://mainnet.base.org"),
});
const baseSepoliaClient = createPublicClient({
  chain: baseSepolia,
  transport: http("https://sepolia.base.org"),
});

// USDC contract address on Base mainnet
const USDC_ADDRESS_MAINNET =
  "0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913" as const;
// USDC contract address on Base Sepolia
const USDC_ADDRESS_SEPOLIA =
  "0x036CbD53842c5426634e7929541eC2318f3dCF7e" as const;
// Platform deposit address from env
const DEPOSIT_ADDRESS = (process.env.NEXT_PUBLIC_DEPOSIT_ADDRESS ||
  "0x0000000000000000000000000000000000000000") as `0x${string}`;

// Get expected chain ID from env
const EXPECTED_CHAIN_ID = Number(process.env.NEXT_PUBLIC_CHAIN_ID) || 8453;
const USDC_ADDRESS =
  EXPECTED_CHAIN_ID === 84532 ? USDC_ADDRESS_SEPOLIA : USDC_ADDRESS_MAINNET;
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
  amount: string;
  setAmount: (amount: string) => void;
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
  const [amount, setAmount] = useState("");
  const { address: userAddress, isConnected } = useAccount();
  const { user } = useAuthStore();
  const isAuthenticated = !!user;
  const currentChainId = useChainId();
  const { switchChain, isPending: isSwitchingNetwork } = useSwitchChain();

  // Track if we initiated a deposit (prevents stale state from showing toasts)
  const hasInitiatedDeposit = useRef(false);

  // Track OnchainKit transaction for mobile wallet polling
  const [onchainKitTxHash, setOnchainKitTxHash] = useState<
    `0x${string}` | null
  >(null);
  const onchainKitSuccessHandled = useRef(false);

  // Reset deposit tracking when disconnected or logged out
  useEffect(() => {
    if (!isConnected || !isAuthenticated) {
      hasInitiatedDeposit.current = false;
      setOnchainKitTxHash(null);
      onchainKitSuccessHandled.current = false;
    }
  }, [isConnected, isAuthenticated]);

  // Poll for OnchainKit transaction receipt (fixes mobile wallet apps not sending callbacks)
  useEffect(() => {
    if (!onchainKitTxHash || onchainKitSuccessHandled.current) {
      return;
    }

    let cancelled = false;
    const pollInterval = setInterval(async () => {
      if (cancelled || onchainKitSuccessHandled.current) {
        return;
      }

      try {
        // Use public RPC directly (bypasses wagmi config issues on mobile)
        const publicClient =
          EXPECTED_CHAIN_ID === 84532 ? baseSepoliaClient : baseClient;
        const receipt = await publicClient.getTransactionReceipt({
          hash: onchainKitTxHash,
        });

        if (
          receipt &&
          receipt.status === "success" &&
          !onchainKitSuccessHandled.current
        ) {
          onchainKitSuccessHandled.current = true;
          clearInterval(pollInterval);
          toast.success("Deposit confirmed! Your balance will update shortly.");
          setAmount("");
          setOnchainKitTxHash(null);
          options?.onSuccess?.();
        } else if (receipt && receipt.status === "reverted") {
          onchainKitSuccessHandled.current = true;
          clearInterval(pollInterval);
          toast.error("Transaction failed on chain");
          setOnchainKitTxHash(null);
          options?.onError?.("Transaction reverted");
        }
      } catch {
        // Transaction not yet mined, continue polling
      }
    }, 2000);

    // Cleanup and timeout after 5 minutes
    const timeout = setTimeout(() => {
      clearInterval(pollInterval);
      if (!onchainKitSuccessHandled.current) {
        setOnchainKitTxHash(null);
      }
    }, 5 * 60 * 1000);

    return () => {
      cancelled = true;
      clearInterval(pollInterval);
      clearTimeout(timeout);
    };
  }, [onchainKitTxHash, options]);

  // Check if on wrong network
  const isWrongNetwork = currentChainId !== EXPECTED_CHAIN_ID;

  // Switch to correct network
  const switchToCorrectNetwork = useCallback(async () => {
    try {
      await switchChain({ chainId: EXPECTED_CHAIN_ID });
      toast.success("Switched to Base network");
    } catch {
      toast.error(
        "Failed to switch network. Please switch manually in your wallet."
      );
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

  // Computed deposit loading state (includes OnchainKit polling)
  const isPollingOnchainKit =
    !!onchainKitTxHash && !onchainKitSuccessHandled.current;
  const isDepositing = isSmartWallet
    ? cdpStatus === "pending"
    : isDepositPending || isDepositConfirming || isPollingOnchainKit;

  // Handle EOA deposit transaction success
  useEffect(() => {
    if (
      !isSmartWallet &&
      isDepositSuccess &&
      depositTxHash &&
      hasInitiatedDeposit.current &&
      isAuthenticated
    ) {
      toast.success("Deposit confirmed! Your balance will update shortly.");
      setAmount("");
      hasInitiatedDeposit.current = false;
      options?.onSuccess?.();
    }
  }, [isSmartWallet, isDepositSuccess, depositTxHash, isAuthenticated, options]);

  // Handle EOA deposit error
  useEffect(() => {
    if (!isSmartWallet && depositError && hasInitiatedDeposit.current) {
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
    if (
      isSmartWallet &&
      cdpStatus === "success" &&
      cdpData &&
      hasInitiatedDeposit.current &&
      isAuthenticated
    ) {
      toast.success("Deposit confirmed! Your balance will update shortly.");
      setAmount("");
      hasInitiatedDeposit.current = false;
      options?.onSuccess?.();
    }
  }, [isSmartWallet, cdpStatus, cdpData, isAuthenticated, options]);

  // Handle CDP smart wallet error
  useEffect(() => {
    if (
      isSmartWallet &&
      cdpStatus === "error" &&
      cdpError &&
      hasInitiatedDeposit.current
    ) {
      const errorMessage = cdpError?.message || "Transaction failed";
      hasInitiatedDeposit.current = false;
      toast.error(errorMessage.slice(0, 100));
      options?.onError?.(errorMessage);
    }
  }, [isSmartWallet, cdpStatus, cdpError, options]);

  // OnchainKit Transaction calls for USDC transfer
  const depositCalls = useMemo(() => {
    const numAmount = parseFloat(amount);
    if (!amount || isNaN(numAmount) || numAmount <= 0 || !userAddress) return [];

    const amountInUnits = parseUnits(amount, 6);

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
    const numAmount = parseFloat(amount);
    if (!amount || isNaN(numAmount) || numAmount <= 0) {
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
    const amountInUnits = parseUnits(amount, 6);

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
          useCdpPaymaster: true,
        });
      } catch (err: any) {
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
  }, [
    amount,
    isSmartWallet,
    isWrongNetwork,
    smartAccount,
    sendUserOperation,
    sendTransaction,
    switchChain,
  ]);

  // Handle OnchainKit transaction status (with polling fallback for mobile wallets)
  const handleOnchainStatus = useCallback(
    (status: LifecycleStatus) => {
      // Extract transaction hash from status data
      const extractTxHash = (data: unknown): `0x${string}` | undefined => {
        if (!data || typeof data !== "object") return undefined;
        const d = data as Record<string, unknown>;
        return (
          (d.transactionHash as `0x${string}`) ||
          (d.hash as `0x${string}`) ||
          (d.txHash as `0x${string}`) ||
          (d.transactionHashList as `0x${string}`[])?.[0] ||
          (d.transactionHashes as `0x${string}`[])?.[0] ||
          (
            d.transactionReceipts as Array<{ transactionHash?: `0x${string}` }>
          )?.[0]?.transactionHash
        );
      };

      // Capture transaction hash for polling (mobile wallet fallback)
      if (status.statusName === "transactionPending") {
        const txHash = extractTxHash(status.statusData);
        if (txHash && !onchainKitTxHash) {
          onchainKitSuccessHandled.current = false;
          setOnchainKitTxHash(txHash);
        }
      }

      // Also try to capture hash from other statuses
      const hashStatuses = [
        "transactionLegacyExecuted",
        "transactionExecutionLegacy",
      ];
      if (hashStatuses.includes(status.statusName)) {
        const txHash = extractTxHash(status.statusData);
        if (txHash && !onchainKitTxHash) {
          onchainKitSuccessHandled.current = false;
          setOnchainKitTxHash(txHash);
        }
      }

      if (status.statusName === "success") {
        // Mark as handled to prevent polling from firing duplicate success
        onchainKitSuccessHandled.current = true;
        setOnchainKitTxHash(null);
        toast.success("Deposit confirmed! Your balance will update shortly.");
        setAmount("");
        options?.onSuccess?.();
      } else if (status.statusName === "error") {
        onchainKitSuccessHandled.current = true;
        setOnchainKitTxHash(null);
        const errorMessage =
          (status.statusData as { message?: string })?.message ||
          "Transaction failed";
        toast.error(errorMessage);
        options?.onError?.(errorMessage);
      }
    },
    [options, onchainKitTxHash]
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
