"use client";

import Image from "next/image";
import {
  useAdminTransactions,
  useAdminPendingWithdrawals,
  useApproveWithdrawal,
  useRejectWithdrawal,
  useReconcileTransaction,
  useReconcileAllTransactions,
} from "@/lib/admin";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useState, useEffect } from "react";
import { Pagination } from "@/components/ui/pagination";
import {
  DollarSign,
  Crown,
  ArrowUpRight,
  ArrowDownRight,
  Clock,
  CheckCircle2,
  XCircle,
  User,
  Calendar,
  Search,
  AlertTriangle,
  CreditCard,
  Wallet,
  TrendingUp,
  RefreshCw,
  Loader2,
  Copy,
  CheckCircle,
  Hash,
} from "lucide-react";
import { toast } from "sonner";
import numeral from "numeral";

export default function AdminTransactionsPage() {
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;
  const [searchTerm, setSearchTerm] = useState("");
  const [filterStatus, setFilterStatus] = useState<"all" | "completed" | "processing" | "pending" | "failed">("all");
  const [selectedTxId, setSelectedTxId] = useState<string | null>(null);
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const { data, isLoading, isError, error, refetch } = useAdminTransactions({
    page: currentPage,
    limit: itemsPerPage,
    status: filterStatus !== "all" ? filterStatus : undefined,
    search: searchTerm || undefined,
  });

  const { data: pendingData } = useAdminPendingWithdrawals();
  const approveWithdrawal = useApproveWithdrawal();
  const rejectWithdrawal = useRejectWithdrawal();
  const reconcileTransaction = useReconcileTransaction();
  const reconcileAllTransactions = useReconcileAllTransactions();

  useEffect(() => {
    setCurrentPage(1);
  }, [filterStatus, searchTerm]);

  const responseData = data?.data as any;
  const transactions = responseData?.docs || [];
  const totalPages = responseData?.totalPages || 1;
  const hasNextPage = responseData?.hasNextPage || false;
  const hasPrevPage = responseData?.hasPrevPage || false;
  const totalDocs = responseData?.totalDocs || 0;
  const pendingWithdrawals = pendingData?.data || [];

  const processingCount = transactions.filter((tx: any) => tx.status === "processing" || tx.status === "failed").length;

  const copyToClipboard = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    toast.success("Copied");
    setTimeout(() => setCopiedId(null), 2000);
  };

  const handleRetryTransaction = async (tx: any) => {
    reconcileTransaction.mutate(tx.id, {
      onSuccess: () => {
        toast.success("Reconciliation initiated");
        refetch();
      },
      onError: (error: any) => toast.error(error?.message || "Failed to reconcile"),
    });
  };

  const handleRetryAll = async () => {
    if (processingCount === 0) {
      toast.info("No transactions to reconcile");
      return;
    }
    reconcileAllTransactions.mutate(undefined, {
      onSuccess: () => {
        toast.success("Reconciliation initiated for all pending transactions");
        refetch();
      },
      onError: (error: any) => toast.error(error?.message || "Failed to reconcile"),
    });
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-[#000000] flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-8 h-8 text-[#EDEDED] animate-spin mx-auto mb-3" />
          <p className="text-[#9A9A9A] text-sm font-light">Loading...</p>
        </div>
      </div>
    );
  }

  if (isError) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center px-4">
        <div className="text-center">
          <AlertTriangle className="w-12 h-12 text-red-400 mx-auto mb-4" />
          <p className="text-red-400 mb-4">{error?.message || "Failed to load transactions"}</p>
          <Button onClick={() => window.location.reload()}>Try Again</Button>
        </div>
      </div>
    );
  }

  const totalDeposits = transactions.filter((t: any) => t.type === "deposit").length;
  const totalWithdrawals = transactions.filter((t: any) => t.type === "withdrawal").length;

  const getTransactionIcon = (type: string) => {
    switch (type) {
      case "deposit": return <ArrowDownRight className="w-4 h-4 text-emerald-400" />;
      case "withdrawal": return <ArrowUpRight className="w-4 h-4 text-red-400" />;
      case "stake": return <TrendingUp className="w-4 h-4 text-indigo-400" />;
      case "win": return <CheckCircle2 className="w-4 h-4 text-amber-400" />;
      default: return <DollarSign className="w-4 h-4 text-gray-400" />;
    }
  };

  const getStatusBadge = (status: string) => {
    const colors: Record<string, string> = {
      completed: "bg-emerald-500/20 text-emerald-400 border-emerald-500/30",
      processing: "bg-blue-500/20 text-blue-400 border-blue-500/30",
      pending: "bg-amber-500/20 text-amber-400 border-amber-500/30",
      failed: "bg-red-500/20 text-red-400 border-red-500/30",
      rejected: "bg-red-500/20 text-red-400 border-red-500/30",
    };
    return colors[status] || "bg-gray-500/20 text-gray-400 border-gray-500/30";
  };

  return (
    <div className="min-h-screen bg-black">
      {/* Background */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[600px] h-[600px] bg-violet-600/10 rounded-full blur-[120px]" />
      </div>

      <div className="relative px-4 sm:px-6 py-6 max-w-3xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <Badge className="bg-violet-500/20 text-violet-400 border-violet-500/30 text-xs">
                <Crown className="w-3 h-3 mr-1" />
                Admin
              </Badge>
            </div>
            <h1 className="text-2xl font-black text-white">Transactions</h1>
            <p className="text-gray-500 text-sm">Manage all transactions</p>
          </div>
          {processingCount > 0 && (
            <Button
              size="sm"
              onClick={handleRetryAll}
              disabled={reconcileAllTransactions.isPending}
              className="bg-indigo-500 hover:bg-indigo-600 rounded-xl h-9 px-3 text-xs"
            >
              {reconcileAllTransactions.isPending ? (
                <Loader2 className="w-3 h-3 mr-1 animate-spin" />
              ) : (
                <RefreshCw className="w-3 h-3 mr-1" />
              )}
              Reconcile ({processingCount})
            </Button>
          )}
        </div>

        {/* Quick Stats */}
        <div className="grid sm:grid-cols-4 grid-cols-2 gap-2 mb-6">
          <div className="p-3 rounded-xl bg-white/[0.03] border border-white/[0.06] text-center">
            <CreditCard className="w-4 h-4 text-violet-400 mx-auto mb-1" />
            <p className="text-lg font-bold text-white">{totalDocs}</p>
            <p className="text-xs text-gray-500">Total</p>
          </div>
          <div className="p-3 rounded-xl bg-white/[0.03] border border-white/[0.06] text-center">
            <RefreshCw className="w-4 h-4 text-blue-400 mx-auto mb-1" />
            <p className="text-lg font-bold text-white">{processingCount}</p>
            <p className="text-xs text-gray-500">Pending</p>
          </div>
          <div className="p-3 rounded-xl bg-white/[0.03] border border-white/[0.06] text-center">
            <ArrowDownRight className="w-4 h-4 text-emerald-400 mx-auto mb-1" />
            <p className="text-lg font-bold text-white">{totalDeposits}</p>
            <p className="text-xs text-gray-500">Deposits</p>
          </div>
          <div className="p-3 rounded-xl bg-white/[0.03] border border-white/[0.06] text-center">
            <ArrowUpRight className="w-4 h-4 text-red-400 mx-auto mb-1" />
            <p className="text-lg font-bold text-white">{totalWithdrawals}</p>
            <p className="text-xs text-gray-500">Withdrawals</p>
          </div>
        </div>

        {/* Pending Withdrawals */}
        {pendingWithdrawals.length > 0 && (
          <Card className="bg-amber-500/5 border-amber-500/20 mb-6">
            <CardHeader className="pb-3">
              <CardTitle className="text-white flex items-center gap-2 text-base">
                <Clock className="w-4 h-4 text-amber-400" />
                Pending Withdrawals ({pendingWithdrawals.length})
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {pendingWithdrawals.map((tx: any) => (
                <div
                  key={tx.id}
                  className="p-3 rounded-xl bg-white/[0.03] border border-white/[0.05]"
                >
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <ArrowUpRight className="w-4 h-4 text-amber-400" />
                      <span className="text-white font-bold inline-flex items-center gap-1">
                        <Image src="/usdc.svg" alt="USDC" width={14} height={14} />
                        {numeral(tx.amount).format("0,0.00")}
                      </span>
                    </div>
                    <Badge className="bg-amber-500/20 text-amber-400 border-amber-500/30 text-xs">
                      <Clock className="w-3 h-3 mr-1" />
                      {tx.status}
                    </Badge>
                  </div>
                  <div className="flex items-center gap-2 text-xs text-gray-500 mb-2">
                    <User className="w-3 h-3" />
                    {tx.user?.firstName} {tx.user?.lastName}
                  </div>
                  <div className="flex gap-2">
                    <Button
                      size="sm"
                      className="h-7 px-2 text-xs bg-emerald-500 hover:bg-emerald-600 rounded-lg"
                      disabled={approveWithdrawal.isPending && selectedTxId === tx.id}
                      onClick={() => {
                        setSelectedTxId(tx.id);
                        approveWithdrawal.mutate(tx.id);
                      }}
                    >
                      <CheckCircle2 className="w-3 h-3 mr-1" />
                      Approve
                    </Button>
                    <Button
                      size="sm"
                      className="h-7 px-2 text-xs bg-red-500 hover:bg-red-600 rounded-lg"
                      disabled={rejectWithdrawal.isPending && selectedTxId === tx.id}
                      onClick={() => {
                        setSelectedTxId(tx.id);
                        rejectWithdrawal.mutate(tx.id);
                      }}
                    >
                      <XCircle className="w-3 h-3 mr-1" />
                      Reject
                    </Button>
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>
        )}

        {/* Search & Filters */}
        <div className="mb-4 space-y-3">
          <div className="relative">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" />
            <Input
              placeholder="Search transactions..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 h-11 bg-white/[0.03] border-white/[0.06] text-white placeholder-gray-500 rounded-xl"
            />
          </div>
          <div className="flex gap-2 flex-wrap">
            {["all", "completed", "processing", "pending", "failed"].map((status) => (
              <Button
                key={status}
                size="sm"
                onClick={() => setFilterStatus(status as any)}
                className={`h-8 rounded-lg text-xs ${
                  filterStatus === status
                    ? "bg-violet-500 hover:bg-violet-600 text-white"
                    : "bg-white/[0.03] border-white/[0.06] text-gray-400 hover:text-white hover:bg-white/10"
                }`}
              >
                {status.charAt(0).toUpperCase() + status.slice(1)}
              </Button>
            ))}
          </div>
        </div>

        {/* Transactions List */}
        <Card className="bg-white/[0.03] border-white/[0.06]">
          <CardHeader className="pb-3">
            <CardTitle className="text-white flex items-center justify-between text-base">
              <div className="flex items-center gap-2">
                <CreditCard className="w-4 h-4 text-violet-400" />
                All Transactions ({totalDocs})
              </div>
              <Button
                size="sm"
                variant="outline"
                onClick={() => refetch()}
                className="h-7 px-2 border-white/10 text-gray-400"
              >
                <RefreshCw className="w-3 h-3" />
              </Button>
            </CardTitle>
          </CardHeader>
          <CardContent>
            {transactions.length === 0 ? (
              <div className="text-center py-12">
                <Wallet className="w-10 h-10 text-gray-600 mx-auto mb-3" />
                <p className="text-gray-400 text-sm">No transactions found</p>
              </div>
            ) : (
              <div className="space-y-3">
                {transactions.map((tx: any) => (
                  <div
                    key={tx.id}
                    className="p-4 rounded-xl bg-white/[0.02] border border-white/[0.05] hover:bg-white/[0.04] transition-colors"
                  >
                    <div className="flex items-start justify-between mb-2">
                      <div className="flex items-center gap-3">
                        <div className="p-2 rounded-lg bg-white/10">
                          {getTransactionIcon(tx.type)}
                        </div>
                        <div>
                          <h3 className="text-white font-semibold capitalize text-sm">
                            {tx.type}
                          </h3>
                          <p className="text-lg font-bold text-violet-400 inline-flex items-center gap-1">
                            <Image src="/usdc.svg" alt="USDC" width={16} height={16} />
                            {numeral(tx.amount).format("0,0.00")}
                          </p>
                        </div>
                      </div>
                      <div className="flex flex-col items-end gap-1">
                        <Badge className={`${getStatusBadge(tx.status)} text-xs`}>
                          {tx.status === "processing" && <Loader2 className="w-3 h-3 mr-1 animate-spin" />}
                          {tx.status}
                        </Badge>
                        {(tx.status === "processing" || tx.status === "failed") && (
                          <Button
                            size="sm"
                            onClick={() => handleRetryTransaction(tx)}
                            disabled={reconcileTransaction.isPending && reconcileTransaction.variables === tx.id}
                            className="h-6 px-2 text-xs bg-indigo-500 hover:bg-indigo-600 rounded"
                          >
                            {reconcileTransaction.isPending && reconcileTransaction.variables === tx.id ? (
                              <Loader2 className="w-3 h-3 animate-spin" />
                            ) : (
                              <RefreshCw className="w-3 h-3" />
                            )}
                          </Button>
                        )}
                      </div>
                    </div>

                    {/* User Info */}
                    <div className="flex items-center gap-2 text-xs text-gray-500 mb-2">
                      <User className="w-3 h-3" />
                      {tx.user?.firstName} {tx.user?.lastName}
                      <span className="text-gray-600">({tx.user?.email})</span>
                    </div>

                    {/* Reference */}
                    {tx.reference && (
                      <div className="flex items-center gap-2 text-xs text-gray-500 mb-2">
                        <Hash className="w-3 h-3" />
                        <span className="font-mono truncate max-w-[200px]">{tx.reference}</span>
                        <button
                          onClick={() => copyToClipboard(tx.reference, `ref-${tx.id}`)}
                          className="text-gray-400 hover:text-white"
                        >
                          {copiedId === `ref-${tx.id}` ? (
                            <CheckCircle className="w-3 h-3 text-emerald-400" />
                          ) : (
                            <Copy className="w-3 h-3" />
                          )}
                        </button>
                      </div>
                    )}

                    {/* Date */}
                    {tx.createdAt && (
                      <div className="flex items-center gap-1 text-xs text-gray-500">
                        <Calendar className="w-3 h-3" />
                        {new Date(tx.createdAt).toLocaleDateString()} {new Date(tx.createdAt).toLocaleTimeString()}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}

            {!isLoading && totalPages > 1 && (
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
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
