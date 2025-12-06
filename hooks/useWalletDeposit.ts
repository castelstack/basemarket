import { useMemo, useEffect, useState, useCallback, useRef } from "react";
import {
  useSendTransaction,
  useWaitForTransactionReceipt,
  useAccount,
  useChainId,
  useSwitchChain,
  useConfig,
} from "wagmi";
import { useSendUserOperation, useCurrentUser } from "@coinbase/cdp-hooks";
import { parseUnits, encodeFunctionData, createPublicClient, http } from "viem";
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
  const wagmiConfig = useConfig();

  // Track if we initiated a deposit (prevents stale state from showing toasts)
  const hasInitiatedDeposit = useRef(false);

  // Track OnchainKit transaction for mobile wallet polling
  const [onchainKitTxHash, setOnchainKitTxHash] = useState<
    `0x${string}` | null
  >(null);
  const [callsId, setCallsId] = useState<string | null>(null);
  const onchainKitSuccessHandled = useRef(false);

  // Reset deposit tracking when disconnected or logged out
  useEffect(() => {
    if (!isConnected || !isAuthenticated) {
      hasInitiatedDeposit.current = false;
      setOnchainKitTxHash(null);
      setCallsId(null);
      onchainKitSuccessHandled.current = false;
    }
  }, [isConnected, isAuthenticated]);

  // Poll for OnchainKit transaction receipt (fixes mobile wallet apps not sending callbacks)
  useEffect(() => {
    // DEBUG: Show effect triggered
    console.log("Polling effect triggered, hash:", onchainKitTxHash, "handled:", onchainKitSuccessHandled.current);

    if (!onchainKitTxHash || onchainKitSuccessHandled.current || !wagmiConfig) {
      console.log("Polling skipped - conditions not met");
      return;
    }

    // DEBUG: Show polling started (remove in production)
    toast.info(`Polling tx: ${onchainKitTxHash.slice(0, 10)}...`, { duration: 3000 });

    let cancelled = false;
    let pollCount = 0;
    const pollInterval = setInterval(async () => {
      pollCount++;
      toast.info(`Poll #${pollCount}`, { duration: 1000 });

      if (cancelled || onchainKitSuccessHandled.current) {
        toast.warning(`Polling stopped: cancelled=${cancelled}, handled=${onchainKitSuccessHandled.current}`);
        return;
      }

      try {
        // Use public RPC directly (bypasses wagmi config issues on mobile)
        const publicClient = EXPECTED_CHAIN_ID === 84532 ? baseSepoliaClient : baseClient;
        const receipt = await publicClient.getTransactionReceipt({
          hash: onchainKitTxHash,
        });

        // DEBUG: Show receipt status
        toast.info(`Receipt found: ${receipt?.status || "null"}`, { duration: 2000 });

        if (
          receipt &&
          receipt.status === "success" &&
          !onchainKitSuccessHandled.current
        ) {
          onchainKitSuccessHandled.current = true;
          clearInterval(pollInterval);
          toast.success("Deposit confirmed! Your balance will update shortly.");
          setAmount(0);
          setOnchainKitTxHash(null);
          options?.onSuccess?.();
        } else if (receipt && receipt.status === "reverted") {
          onchainKitSuccessHandled.current = true;
          clearInterval(pollInterval);
          toast.error("Transaction failed on chain");
          setOnchainKitTxHash(null);
          options?.onError?.("Transaction reverted");
        }
      } catch (err: any) {
        // DEBUG: Show actual error message
        const errMsg = err?.shortMessage || err?.message || "unknown error";
        toast.error(`Err: ${errMsg.slice(0, 60)}`, { duration: 3000 });
      }
    }, 2000); // Poll every 2 seconds

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
  }, [onchainKitTxHash, options, wagmiConfig]);

  // Poll using wallet_getCallsStatus for mobile wallets (more reliable than tx hash)
  useEffect(() => {
    if (!callsId || onchainKitSuccessHandled.current || !wagmiConfig) return;

    // DEBUG: Show polling started (remove in production)
    toast.info("Polling via wallet_getCallsStatus...", { duration: 3000 });

    let cancelled = false;
    const pollInterval = setInterval(async () => {
      if (cancelled || onchainKitSuccessHandled.current) return;

      try {
        const client = wagmiConfig.getClient();
        const status = await client.request({
          method: "wallet_getCallsStatus" as any,
          params: [callsId] as any,
        });

        console.log("wallet_getCallsStatus result:", status);

        // Check if transaction is complete
        const statusObj = status as { status?: number; receipts?: Array<{ transactionHash?: string }> };
        if (statusObj.status === 200 || (statusObj.receipts && statusObj.receipts.length > 0)) {
          onchainKitSuccessHandled.current = true;
          clearInterval(pollInterval);
          toast.success("Deposit confirmed! Your balance will update shortly.");
          setAmount(0);
          setCallsId(null);
          setOnchainKitTxHash(null);
          options?.onSuccess?.();
        }
      } catch (err) {
        // Method may not be supported or transaction not ready
        console.log("Polling wallet_getCallsStatus...", err);
      }
    }, 2000);

    // Cleanup and timeout after 5 minutes
    const timeout = setTimeout(() => {
      clearInterval(pollInterval);
      if (!onchainKitSuccessHandled.current) {
        setCallsId(null);
      }
    }, 5 * 60 * 1000);

    return () => {
      cancelled = true;
      clearInterval(pollInterval);
      clearTimeout(timeout);
    };
  }, [callsId, options, wagmiConfig]);

  // Check if on wrong network
  const isWrongNetwork = currentChainId !== EXPECTED_CHAIN_ID;

  // Switch to correct network
  const switchToCorrectNetwork = useCallback(async () => {
    try {
      await switchChain({ chainId: EXPECTED_CHAIN_ID });
      toast.success("Switched to Base network");
    } catch (err: any) {
      console.error("Network switch error:", err);
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
  console.log(
    "isDepositPending:",
    depositTxHash,
    "isDepositConfirming:",
    isDepositConfirming,
    "isDepositSuccess:",
    isDepositSuccess
  );
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
      setAmount(0);
      hasInitiatedDeposit.current = false;
      options?.onSuccess?.();
    }
  }, [
    isSmartWallet,
    isDepositSuccess,
    depositTxHash,
    isAuthenticated,
    options,
  ]);

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
    if (
      isSmartWallet &&
      cdpStatus === "success" &&
      cdpData &&
      hasInitiatedDeposit.current &&
      isAuthenticated
    ) {
      toast.success("Deposit confirmed! Your balance will update shortly.");
      setAmount(0);
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
      console.log("OnchainKit status:", status);
      console.log(
        "OnchainKit statusData:",
        JSON.stringify(status.statusData, (_, v) =>
          typeof v === "bigint" ? v.toString() : v
        , 2)
      );

      // DEBUG: Only show toast for actual transaction activity (remove in production)
      const activeStatuses = [
        "transactionApproved",
        "transactionLegacyExecuted",
        "success",
        "error",
      ];
      if (activeStatuses.includes(status.statusName)) {
        toast.info(`Status: ${status.statusName}`, { duration: 3000 });
      }

      // Try to capture transaction hash from multiple possible property names
      // Mobile wallets may return the hash in different formats
      const extractTxHash = (data: unknown): `0x${string}` | undefined => {
        if (!data || typeof data !== "object") return undefined;
        const d = data as Record<string, unknown>;
        return (
          (d.transactionHash as `0x${string}`) ||
          (d.hash as `0x${string}`) ||
          (d.txHash as `0x${string}`) ||
          (d.transahash as `0x${string}`) ||
          (d.transactionHashList as `0x${string}`[])?.[0] ||
          (d.transactionHashes as `0x${string}`[])?.[0] ||
          (
            d.transactionReceipts as Array<{ transactionHash?: `0x${string}` }>
          )?.[0]?.transactionHash
        );
      };

      // Extract callsId for wallet_getCallsStatus polling (mobile wallet fallback)
      const extractCallsId = (data: unknown): string | undefined => {
        if (!data || typeof data !== "object") return undefined;
        const d = data as Record<string, unknown>;
        return (d.id as string) || (d.callsId as string) || (d.batchId as string);
      };

      // Capture transaction hash or callsId when available (for mobile wallet polling)
      if (status.statusName === "transactionPending") {
        const txHash = extractTxHash(status.statusData);
        const capturedCallsId = extractCallsId(status.statusData);
        const keys = status.statusData
          ? Object.keys(status.statusData as object)
          : [];

        if (txHash) {
          console.log("Captured tx hash for polling:", txHash);
          toast.info(`Hash captured: ${txHash.slice(0, 10)}...`, {
            duration: 5000,
          });
          onchainKitSuccessHandled.current = false;
          setOnchainKitTxHash(txHash);
        } else if (capturedCallsId) {
          console.log("Captured callsId for polling:", capturedCallsId);
          toast.info(`CallsId captured: ${capturedCallsId.slice(0, 10)}...`, {
            duration: 5000,
          });
          onchainKitSuccessHandled.current = false;
          setCallsId(capturedCallsId);
        } else if (keys.length > 0) {
          console.warn(
            "No tx hash or callsId found in transactionPending status:",
            status.statusData
          );
          toast.warning(`No hash/callsId. Keys: ${keys.join(", ")}`, {
            duration: 5000,
          });
        }
      }

      // Also try to capture hash/callsId from other statuses
      const hashStatuses = [
        "transactionLegacyExecuted",
        "transactionExecutionLegacy",
        "buildingTransaction",
      ];
      if (hashStatuses.includes(status.statusName)) {
        const txHash = extractTxHash(status.statusData);
        const capturedCallsId = extractCallsId(status.statusData);
        const keys = status.statusData
          ? Object.keys(status.statusData as object)
          : [];

        if (txHash && !onchainKitTxHash && !callsId) {
          console.log("Captured tx hash from", status.statusName, ":", txHash);
          toast.info(`Hash from ${status.statusName}: ${txHash.slice(0, 10)}...`, {
            duration: 5000,
          });
          onchainKitSuccessHandled.current = false;
          setOnchainKitTxHash(txHash);
        } else if (capturedCallsId && !onchainKitTxHash && !callsId) {
          console.log("Captured callsId from", status.statusName, ":", capturedCallsId);
          toast.info(`CallsId from ${status.statusName}: ${capturedCallsId.slice(0, 10)}...`, {
            duration: 5000,
          });
          onchainKitSuccessHandled.current = false;
          setCallsId(capturedCallsId);
        } else if (keys.length > 0 && !onchainKitTxHash && !callsId) {
          // DEBUG: Show keys and their values
          const d = status.statusData as Record<string, unknown>;
          const keyValues = keys.map((k) => {
            const v = d[k];
            if (typeof v === "string") return `${k}:${v.slice(0, 15)}`;
            if (Array.isArray(v)) return `${k}:[${v.length}]`;
            return `${k}:${typeof v}`;
          });
          toast.warning(`${status.statusName}: ${keyValues.join(", ")}`, {
            duration: 8000,
          });
        }
      }

      if (status.statusName === "success") {
        // Mark as handled to prevent polling from firing duplicate success
        onchainKitSuccessHandled.current = true;
        setOnchainKitTxHash(null);
        setCallsId(null);
        toast.success("Deposit confirmed! Your balance will update shortly.");
        setAmount(0);
        options?.onSuccess?.();
      } else if (status.statusName === "error") {
        onchainKitSuccessHandled.current = true;
        setOnchainKitTxHash(null);
        setCallsId(null);
        const errorMessage =
          (status.statusData as { message?: string })?.message ||
          "Transaction failed";
        toast.error(errorMessage);
        options?.onError?.(errorMessage);
      }
    },
    [options, onchainKitTxHash, callsId]
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
