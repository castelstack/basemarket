"use client";

import Image from "next/image";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Pagination } from "@/components/ui/pagination";
import { cn } from "@/lib/utils";
import { usePlatformLimits } from "@/lib/platform-settings";
import {
  useTransactions,
  useWalletBalance,
  useWithdraw,
  useCalculateWithdrawal,
} from "@/lib/wallet";
import { useAuthStore } from "@/stores/authStore";
import { useWalletDeposit } from "@/hooks/useWalletDeposit";
import {
  Activity,
  AlertCircle,
  ArrowDownLeft,
  CheckCircle,
  Clock,
  Coins,
  Copy,
  Download,
  Gift,
  Hash,
  Loader2,
  Plus,
  Send,
  Shield,
  TrendingUp,
  Trophy,
  Wallet,
  XCircle,
} from "lucide-react";
import { useState, useEffect } from "react";
import { toast } from "sonner";
import {
  Transaction,
  TransactionButton,
  TransactionStatus,
  TransactionStatusLabel,
  TransactionStatusAction,
  TransactionSponsor,
} from "@coinbase/onchainkit/transaction";
import numeral from "numeral";
import { useAccount } from "wagmi";
const EXPECTED_CHAIN_ID = Number(process.env.NEXT_PUBLIC_CHAIN_ID) || 8453;

export default function WalletPage() {
  const { user } = useAuthStore();
  const { address: connectedAddress } = useAccount();
  const [currentPage, setCurrentPage] = useState(1);
  const [isDepositDialogOpen, setIsDepositDialogOpen] = useState(false);
  const [isWithdrawDialogOpen, setIsWithdrawDialogOpen] = useState(false);
  const [withdrawalAmount, setWithdrawalAmount] = useState("");
  const [activeTab, setActiveTab] = useState("all");
  const [copiedRef, setCopiedRef] = useState<string | null>(null);
  const itemsPerPage = 10;

  const {
    data: balanceData,
    isLoading: isBalanceLoading,
    refetch: refetchBalance,
  } = useWalletBalance();
  const withdrawMutation = useWithdraw();

  const {
    data: transactionsData,
    isLoading: isTransactionsLoading,
    refetch: refetchTransactions,
  } = useTransactions({
    page: currentPage,
    limit: itemsPerPage,
    type:
      activeTab === "deposits"
        ? "deposit"
        : activeTab === "withdrawals"
        ? "withdrawal"
        : undefined,
  });

  const {
    amount: depositAmount,
    setAmount: setDepositAmount,
    isDepositing,
    handleDeposit,
    depositCalls,
    handleOnchainStatus,
  } = useWalletDeposit({
    onSuccess: () => {
      setIsDepositDialogOpen(false);
      setTimeout(() => {
        refetchBalance();
        refetchTransactions();
      }, 3000);
    },
  });

  const { data: limitsData } = usePlatformLimits();
  const platformLimits = limitsData?.data;
  const minWithdrawalAmount = platformLimits?.minWithdrawalAmount || 10;

  const { data: withdrawalCalc, isLoading: isCalcLoading } =
    useCalculateWithdrawal(
      withdrawalAmount ? parseFloat(withdrawalAmount) : undefined,
      isWithdrawDialogOpen &&
        !!connectedAddress &&
        !!withdrawalAmount &&
        parseFloat(withdrawalAmount) >= minWithdrawalAmount
    );

  useEffect(() => {
    setCurrentPage(1);
  }, [activeTab]);

  if (!user) return null;

  const balance = balanceData?.data?.totalBalance || 0;
  const responseData = transactionsData?.data as any;
  const transactions = responseData?.docs || [];
  const totalPages = responseData?.totalPages || 1;
  const hasNextPage = responseData?.hasNextPage || false;
  const hasPrevPage = responseData?.hasPrevPage || false;
  const totalDocs = responseData?.totalDocs || 0;
  const isLoading = isBalanceLoading || isTransactionsLoading;

  const quickAmounts = [0.5, 1, 5, 10];

  const isValidWalletAddress = (address: string) => {
    return /^0x[a-fA-F0-9]{40}$/.test(address);
  };

  const handleWithdraw = async () => {
    if (!withdrawalAmount || !connectedAddress) {
      toast.error("Please fill in all fields");
      return;
    }
    if (!isValidWalletAddress(connectedAddress || "")) {
      toast.error("Please enter a valid wallet address");
      return;
    }
    const amount = parseFloat(withdrawalAmount);
    if (amount < minWithdrawalAmount) {
      toast.error(`Minimum withdrawal is ${minWithdrawalAmount} USDC`);
      return;
    }
    if (amount > balance) {
      toast.error("Insufficient funds");
      return;
    }

    withdrawMutation.mutate(
      { amount, accountNumber: connectedAddress || "" },
      {
        onSuccess: () => {
          toast.success("Withdrawal initiated");
          setWithdrawalAmount("");
          setIsWithdrawDialogOpen(false);
          refetchTransactions();
        },
        onError: (error: any) => {
          toast.error(error?.message || "Withdrawal failed");
        },
      }
    );
  };

  const getTransactionIcon = (type: string) => {
    if (!type) return <Activity className="w-4 h-4 text-gray-400" />;
    switch (type.toLowerCase()) {
      case "deposit":
        return <Download className="w-4 h-4 text-emerald-400" />;
      case "withdrawal":
      case "withdraw":
        return <Send className="w-4 h-4 text-violet-400" />;
      case "stake":
        return <TrendingUp className="w-4 h-4 text-indigo-400" />;
      case "win":
      case "winnings":
        return <Trophy className="w-4 h-4 text-amber-400" />;
      case "refund":
      case "refund_stake":
        return <ArrowDownLeft className="w-4 h-4 text-blue-400" />;
      case "bonus":
        return <Gift className="w-4 h-4 text-violet-400" />;
      default:
        return <Activity className="w-4 h-4 text-gray-400" />;
    }
  };

  const getStatusBadge = (status: string) => {
    if (!status) return null;
    switch (status.toLowerCase()) {
      case "completed":
      case "success":
        return (
          <Badge className="text-xs bg-emerald-500/20 text-emerald-400 border-emerald-500/30">
            <CheckCircle className="w-3 h-3 mr-1" />
            Done
          </Badge>
        );
      case "pending":
        return (
          <Badge className="text-xs bg-amber-500/20 text-amber-400 border-amber-500/30">
            <Clock className="w-3 h-3 mr-1" />
            Pending
          </Badge>
        );
      case "processing":
        return (
          <Badge className="text-xs bg-violet-500/20 text-violet-400 border-violet-500/30">
            <Loader2 className="w-3 h-3 mr-1 animate-spin" />
            Processing
          </Badge>
        );
      case "failed":
        return (
          <Badge className="text-xs bg-red-500/20 text-red-400 border-red-500/30">
            <XCircle className="w-3 h-3 mr-1" />
            Failed
          </Badge>
        );
      default:
        return (
          <Badge className="text-xs bg-gray-500/20 text-gray-400 border-gray-500/30">
            {status}
          </Badge>
        );
    }
  };

  const formatAmount = (amount: number, type: string) => {
    const isCredit = [
      "deposit",
      "win",
      "winnings",
      "refund",
      "refund_stake",
      "bonus",
    ].includes((type || "").toLowerCase());
    return (
      <span
        className={cn(
          "font-bold text-sm inline-flex items-center gap-1",
          isCredit ? "text-emerald-400" : "text-violet-400"
        )}
      >
        {isCredit ? "+" : "-"}
        <Image src="/usdc.svg" alt="USDC" width={12} height={12} />
        {numeral(amount).format("0,0.00")}
      </span>
    );
  };

  const copyToClipboard = (text: string, refId: string) => {
    navigator.clipboard.writeText(text);
    setCopiedRef(refId);
    toast.success("Copied");
    setTimeout(() => setCopiedRef(null), 2000);
  };

  return (
    <div className="min-h-screen bg-black">
      {/* Background */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[600px] h-[600px] bg-violet-600/10 rounded-full blur-[120px]" />
      </div>

      <div className="relative px-4 sm:px-6 py-6 max-w-3xl mx-auto">
        {/* Header */}
        <div className="mb-6">
          <h1 className="text-2xl font-black text-white">Wallet</h1>
          <p className="text-gray-500 text-sm">Manage your funds</p>
        </div>

        {/* Balance Card */}
        <div className="p-5 rounded-2xl bg-gradient-to-br from-violet-500/20 to-indigo-500/20 border border-violet-500/20 mb-6">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <div className="p-2.5 rounded-xl bg-white/10">
                <Wallet className="w-5 h-5 text-white" />
              </div>
              <div>
                <p className="text-sm text-gray-400">Total Balance</p>
                <p className="text-2xl font-black text-white inline-flex items-center gap-2">
                  <Image src="/usdc.svg" alt="USDC" width={24} height={24} />
                  {numeral(balance).format("0,0.00")}
                </p>
              </div>
            </div>
            <Badge className="bg-emerald-500/20 text-emerald-400 border-emerald-500/30">
              USDC
            </Badge>
          </div>
          <div className="flex gap-2">
            <Button
              onClick={() => setIsDepositDialogOpen(true)}
              className="flex-1 h-11 bg-gradient-to-r from-violet-500 to-indigo-500 hover:from-violet-600 hover:to-indigo-600 font-bold rounded-xl"
            >
              <Plus className="w-4 h-4 mr-2" />
              Deposit
            </Button>
            <Button
              onClick={() => setIsWithdrawDialogOpen(true)}
              variant="outline"
              className="flex-1 h-11 border-white/10 text-white hover:bg-white/10 rounded-xl"
            >
              <Send className="w-4 h-4 mr-2" />
              Withdraw
            </Button>
          </div>
        </div>

        {/* Info Banner */}
        <div className="p-4 rounded-xl bg-blue-500/10 border border-blue-500/20 mb-6">
          <div className="flex items-center gap-3">
            {/* <Image src="/base.jpeg" alt="Base" width={32} height={32} className="rounded-lg flex-shrink-0" /> */}
            <div>
              <div className="flex gap-1 items-end">
                <p className="text-xs text-gray-200">Using</p>
                <Image
                  src="/base-text.svg"
                  alt="Base Network"
                  width={80}
                  height={20}
                  className="mb-1"
                />
                <p className="text-xs text-gray-200">Network</p>
              </div>
              <p className="text-xs text-gray-400">
                Fast, secure USDC transactions
              </p>
            </div>
          </div>
        </div>

        {/* Transaction History */}
        <div className="rounded-2xl bg-white/[0.03] border border-white/[0.06] overflow-hidden">
          <div className="p-4 border-b border-white/[0.06]">
            <h2 className="text-lg font-bold text-white mb-3">Transactions</h2>
            {/* Filter Tabs */}
            <div className="flex gap-2">
              {[
                { value: "all", label: "All" },
                { value: "deposits", label: "Deposits" },
                { value: "withdrawals", label: "Withdrawals" },
              ].map((tab) => (
                <button
                  key={tab.value}
                  onClick={() => setActiveTab(tab.value)}
                  className={cn(
                    "px-3 py-1.5 rounded-lg text-sm font-medium transition-colors",
                    activeTab === tab.value
                      ? "bg-violet-500/20 text-violet-400"
                      : "text-gray-500 hover:text-white"
                  )}
                >
                  {tab.label}
                </button>
              ))}
            </div>
          </div>

          <div className="p-4">
            {isLoading ? (
              <div className="flex justify-center py-8">
                <Loader2 className="w-6 h-6 text-gray-400 animate-spin" />
              </div>
            ) : transactions.length === 0 ? (
              <div className="text-center py-8">
                <Coins className="w-10 h-10 text-gray-600 mx-auto mb-3" />
                <p className="text-gray-400 text-sm">No transactions yet</p>
                <p className="text-gray-500 text-xs mt-1">
                  Make a deposit to get started
                </p>
              </div>
            ) : (
              <div className="space-y-2">
                {transactions.map((tx: any) => (
                  <div
                    key={tx.id}
                    className="p-3 rounded-xl bg-white/[0.02] border border-white/[0.05] hover:bg-white/[0.04] transition-colors"
                  >
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-3">
                        <div className="p-2 rounded-lg bg-white/10">
                          {getTransactionIcon(tx.type)}
                        </div>
                        <div>
                          <p className="text-sm font-medium text-white capitalize">
                            {tx.type || "Transaction"}
                          </p>
                          <p className="text-xs text-gray-500">
                            {new Date(tx.createdAt).toLocaleDateString()}
                          </p>
                        </div>
                      </div>
                      {formatAmount(tx.amount, tx.type)}
                    </div>
                    <div className="flex items-center justify-between">
                      {getStatusBadge(tx.status)}
                      {tx.reference && (
                        <button
                          onClick={() => copyToClipboard(tx.reference, tx.id)}
                          className="flex items-center gap-1 text-xs text-gray-500 hover:text-white transition-colors"
                        >
                          <Hash className="w-3 h-3" />
                          <span className="font-mono truncate max-w-[100px]">
                            {tx.reference.slice(0, 8)}...
                          </span>
                          {copiedRef === tx.id ? (
                            <CheckCircle className="w-3 h-3 text-emerald-400" />
                          ) : (
                            <Copy className="w-3 h-3" />
                          )}
                        </button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}

            {!isLoading && transactions.length > 0 && totalPages > 1 && (
              <Pagination
                currentPage={currentPage}
                totalPages={totalPages}
                totalDocs={totalDocs}
                hasNextPage={hasNextPage}
                hasPrevPage={hasPrevPage}
                onPageChange={setCurrentPage}
                itemName="transactions"
                className="mt-4"
              />
            )}
          </div>
        </div>
      </div>

      {/* Deposit Dialog */}
      <Dialog
        open={isDepositDialogOpen}
        onOpenChange={(open) => {
          if (!isDepositing) {
            setIsDepositDialogOpen(open);
            if (!open) setDepositAmount(0);
          }
        }}
      >
        <DialogContent className="bg-gray-900 border-white/10 text-white max-w-md mx-4">
          <DialogHeader>
            <DialogTitle className="text-xl font-bold">
              Deposit USDC
            </DialogTitle>
            <DialogDescription className="text-gray-400">
              Transfer USDC from your wallet
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 mt-2">
            <div className="space-y-2">
              <Label className="text-sm">Amount (USDC)</Label>
              <Input
                type="number"
                min="0"
                step="0.01"
                value={depositAmount}
                onChange={(e) => setDepositAmount(parseFloat(e.target.value))}
                placeholder="Enter amount"
                disabled={isDepositing}
                className="h-11 bg-white/[0.03] border-white/[0.06] text-white rounded-xl"
              />
            </div>

            <div className="space-y-2">
              <Label className="text-sm text-gray-400">Quick Select</Label>
              <div className="grid grid-cols-4 gap-2">
                {quickAmounts.map((amount) => (
                  <Button
                    key={amount}
                    variant="outline"
                    size="sm"
                    onClick={() => setDepositAmount(amount)}
                    disabled={isDepositing}
                    className="border-white/10 text-white hover:bg-white/10 rounded-lg text-xs h-9 inline-flex items-center gap-1"
                  >
                    <Image src="/usdc.svg" alt="USDC" width={12} height={12} />
                    {amount}
                  </Button>
                ))}
              </div>
            </div>

            <div className="p-3 rounded-xl bg-violet-500/10 border border-violet-500/30">
              <div className="flex items-start gap-2">
                <Shield className="w-4 h-4 text-violet-400 flex-shrink-0 mt-0.5" />
                <p className="text-xs text-gray-400">
                  USDC will be transferred directly on Base network. Ensure you
                  have enough USDC.
                </p>
              </div>
            </div>

            {depositAmount && depositAmount > 0 && (
              <Transaction
                chainId={EXPECTED_CHAIN_ID}
                calls={depositCalls}
                onStatus={handleOnchainStatus}
              >
                <TransactionButton
                  className="w-full bg-gradient-to-r from-violet-500 to-indigo-500 hover:from-violet-600 hover:to-indigo-600 font-bold rounded-xl py-3"
                  text="Deposit USDC"
                />
                <TransactionSponsor />
                <TransactionStatus>
                  <TransactionStatusLabel />
                  <TransactionStatusAction />
                </TransactionStatus>
              </Transaction>
            )}

            <div className="flex gap-2">
              <Button
                variant="outline"
                onClick={() => {
                  setIsDepositDialogOpen(false);
                  setDepositAmount(0);
                }}
                disabled={isDepositing}
                className="flex-1 h-11 border-white/10 text-gray-400 hover:text-white hover:bg-white/10 rounded-xl"
              >
                Cancel
              </Button>
              <Button
                onClick={handleDeposit}
                disabled={!depositAmount || isDepositing || depositAmount <= 0}
                className="flex-1 h-11 bg-gradient-to-r from-violet-500 to-indigo-500 hover:from-violet-600 hover:to-indigo-600 font-bold rounded-xl"
              >
                {isDepositing ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Processing...
                  </>
                ) : (
                  "Deposit"
                )}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Withdraw Dialog */}
      <Dialog
        open={isWithdrawDialogOpen}
        onOpenChange={(open) => {
          setIsWithdrawDialogOpen(open);
          if (!open) {
            setWithdrawalAmount("");
          }
        }}
      >
        <DialogContent className="bg-gray-900 border-white/10 text-white max-w-md mx-4 max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-xl font-bold">
              Withdraw USDC
            </DialogTitle>
            <DialogDescription className="text-gray-400">
              Send USDC to your wallet
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 mt-2">
            <div className="space-y-2">
              <Label className="text-sm">Wallet Address</Label>
              <Input
                type="text"
                value={connectedAddress || ""}
                readOnly
                disabled
                className="h-11 bg-white/[0.03] border-white/[0.06] text-white rounded-xl font-mono text-sm opacity-70 cursor-not-allowed"
              />
              <p className="text-xs text-gray-500">
                Withdrawals will be sent to your connected wallet
              </p>
            </div>

            <div className="space-y-2">
              <Label className="text-sm">Amount (USDC)</Label>
              <Input
                type="number"
                min={minWithdrawalAmount}
                max={balance}
                step="0.01"
                value={withdrawalAmount}
                onChange={(e) => setWithdrawalAmount(e.target.value)}
                placeholder={`Min. ${minWithdrawalAmount} USDC`}
                className="h-11 bg-white/[0.03] border-white/[0.06] text-white rounded-xl"
              />
              <div className="flex justify-between text-xs">
                <span className="text-gray-500">Available</span>
                <span className="text-white inline-flex items-center gap-1">
                  <Image src="/usdc.svg" alt="USDC" width={12} height={12} />
                  {numeral(balance).format("0,0.00")}
                </span>
              </div>
              <div className="grid grid-cols-4 gap-2">
                {quickAmounts.map((amount) => (
                  <Button
                    key={amount}
                    variant="outline"
                    size="sm"
                    onClick={() => setWithdrawalAmount(amount.toString())}
                    disabled={amount > balance}
                    className="border-white/10 text-white hover:bg-white/10 rounded-lg text-xs h-8 inline-flex items-center gap-1"
                  >
                    <Image src="/usdc.svg" alt="USDC" width={10} height={10} />
                    {amount}
                  </Button>
                ))}
              </div>
            </div>

            {connectedAddress &&
              withdrawalAmount &&
              parseFloat(withdrawalAmount) >= minWithdrawalAmount && (
                <div className="space-y-3">
                  {isCalcLoading ? (
                    <div className="p-3 rounded-xl bg-violet-500/10 border border-violet-500/30">
                      <div className="flex items-center gap-2">
                        <Loader2 className="w-4 h-4 text-violet-400 animate-spin" />
                        <span className="text-sm text-violet-400">
                          Calculating...
                        </span>
                      </div>
                    </div>
                  ) : withdrawalCalc?.data ? (
                    <>
                      <div className="p-3 rounded-xl bg-white/[0.03] border border-white/[0.06] space-y-2">
                        <div className="flex justify-between text-sm">
                          <span className="text-gray-400">Amount</span>
                          <span className="text-white inline-flex items-center gap-1">
                            <Image
                              src="/usdc.svg"
                              alt="USDC"
                              width={12}
                              height={12}
                            />
                            {withdrawalCalc.data.requestedAmount.toLocaleString()}
                          </span>
                        </div>
                        <div className="flex justify-between text-sm">
                          <span className="text-gray-400">
                            Fee ({withdrawalCalc.data.platformFeePercentage}%)
                          </span>
                          <span className="text-violet-400 inline-flex items-center gap-1">
                            -
                            <Image
                              src="/usdc.svg"
                              alt="USDC"
                              width={12}
                              height={12}
                            />
                            {withdrawalCalc.data.platformFee.toLocaleString()}
                          </span>
                        </div>
                        <div className="flex justify-between text-sm">
                          <span className="text-gray-400">Network Fee</span>
                          <span className="text-violet-400 inline-flex items-center gap-1">
                            -
                            <Image
                              src="/usdc.svg"
                              alt="USDC"
                              width={12}
                              height={12}
                            />
                            {withdrawalCalc.data.transferFee.toLocaleString()}
                          </span>
                        </div>
                        <div className="h-px bg-white/10" />
                        <div className="flex justify-between">
                          <span className="text-gray-300 font-medium">
                            You receive
                          </span>
                          <span className="text-emerald-400 font-bold inline-flex items-center gap-1">
                            <Image
                              src="/usdc.svg"
                              alt="USDC"
                              width={14}
                              height={14}
                            />
                            {withdrawalCalc.data.netAmount.toLocaleString()}
                          </span>
                        </div>
                      </div>

                      {!withdrawalCalc.data.canWithdraw && (
                        <div className="p-3 rounded-xl bg-red-500/10 border border-red-500/30">
                          <div className="flex items-start gap-2">
                            <XCircle className="w-4 h-4 text-red-400 flex-shrink-0 mt-0.5" />
                            <p className="text-xs text-red-400 inline-flex items-center gap-1">
                              Insufficient balance. Need{" "}
                              <Image
                                src="/usdc.svg"
                                alt="USDC"
                                width={10}
                                height={10}
                              />
                              {withdrawalCalc.data.totalDebit.toLocaleString()}
                            </p>
                          </div>
                        </div>
                      )}
                    </>
                  ) : null}
                </div>
              )}

            <div className="p-3 rounded-xl bg-amber-500/10 border border-amber-500/30">
              <div className="flex items-start gap-2">
                <AlertCircle className="w-4 h-4 text-amber-400 flex-shrink-0 mt-0.5" />
                <p className="text-xs text-gray-400">
                  Withdrawals are processed on Base network. Ensure your wallet
                  supports Base.
                </p>
              </div>
            </div>

            <div className="flex gap-2">
              <Button
                variant="outline"
                onClick={() => {
                  setIsWithdrawDialogOpen(false);
                  setWithdrawalAmount("");
                }}
                className="flex-1 h-11 border-white/10 text-gray-400 hover:text-white hover:bg-white/10 rounded-xl"
              >
                Cancel
              </Button>
              <Button
                onClick={handleWithdraw}
                disabled={
                  !withdrawalAmount ||
                  !connectedAddress ||
                  parseFloat(withdrawalAmount) < minWithdrawalAmount ||
                  parseFloat(withdrawalAmount) > balance ||
                  (withdrawalCalc?.data && !withdrawalCalc.data.canWithdraw) ||
                  withdrawMutation.isPending
                }
                className="flex-1 h-11 bg-gradient-to-r from-violet-500 to-indigo-500 hover:from-violet-600 hover:to-indigo-600 font-bold rounded-xl"
              >
                {withdrawMutation.isPending ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Processing...
                  </>
                ) : (
                  "Withdraw"
                )}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
