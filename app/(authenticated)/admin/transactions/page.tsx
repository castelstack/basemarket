'use client';

import {
  useAdminTransactions,
  useAdminPendingWithdrawals,
  useApproveWithdrawal,
  useRejectWithdrawal,
  useReconcileTransaction,
  useReconcileAllTransactions,
} from '@/lib/admin';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { useState, useEffect } from 'react';
import { Pagination } from '@/components/ui/pagination';
import {
  DollarSign,
  Shield,
  Crown,
  ArrowUpRight,
  ArrowDownRight,
  Clock,
  CheckCircle2,
  XCircle,
  User,
  Calendar,
  Search,
  Filter,
  AlertTriangle,
  CreditCard,
  Wallet,
  TrendingUp,
  Eye,
  RefreshCw,
  Loader2,
  Copy,
  CheckCircle,
  Hash,
  UserCircle,
  Link2,
  ExternalLink,
} from 'lucide-react';
import Link from 'next/link';
import { toast } from 'sonner';

export default function AdminTransactionsPage() {
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState<
    'all' | 'deposit' | 'withdrawal' | 'stake' | 'win'
  >('all');
  const [filterStatus, setFilterStatus] = useState<
    'all' | 'completed' | 'processing' | 'pending' | 'failed'
  >('all');
  const [selectedTxId, setSelectedTxId] = useState<string | null>(null);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [isMobile, setIsMobile] = useState(false);

  // Pass filters to API
  const { data, isLoading, isError, error, refetch } = useAdminTransactions({
    page: currentPage,
    limit: itemsPerPage,
    type: filterType !== 'all' ? filterType : undefined,
    status: filterStatus !== 'all' ? filterStatus : undefined,
    search: searchTerm || undefined,
  });

  const { data: pendingData } = useAdminPendingWithdrawals();
  const approveWithdrawal = useApproveWithdrawal();
  const rejectWithdrawal = useRejectWithdrawal();
  const reconcileTransaction = useReconcileTransaction();
  const reconcileAllTransactions = useReconcileAllTransactions();

  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  // Reset to page 1 when filters change
  useEffect(() => {
    setCurrentPage(1);
  }, [filterType, filterStatus, searchTerm]);

  const responseData = data?.data as any;
  const transactions = responseData?.docs || [];
  const totalPages = responseData?.totalPages || 1;
  const hasNextPage = responseData?.hasNextPage || false;
  const hasPrevPage = responseData?.hasPrevPage || false;
  const totalDocs = responseData?.totalDocs || 0;
  const pendingWithdrawals = pendingData?.data || [];

  // No client-side filtering needed - server handles it
  const filteredTransactions = transactions;

  // Get processing transactions
  const processingTransactions = transactions.filter(
    (tx: any) => tx.status === 'processing'
  );

  const copyToClipboard = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    toast.success('Copied to clipboard!');
    setTimeout(() => setCopiedId(null), 2000);
  };

  const handleRetryTransaction = async (tx: any) => {
    reconcileTransaction.mutate(tx.id, {
      onSuccess: () => {
        toast.success(`Transaction ${tx.reference} reconciliation initiated`);
        refetch();
      },
      onError: (error: any) => {
        toast.error(
          error?.message || `Failed to reconcile transaction ${tx.reference}`
        );
      },
    });
  };

  const handleRetryAll = async () => {
    const processingTxs = transactions.filter(
      (tx: any) => tx.status === 'processing' || tx.status === 'failed'
    );

    if (processingTxs.length === 0) {
      toast.info('No transactions to reconcile');
      return;
    }

    reconcileAllTransactions.mutate(undefined, {
      onSuccess: () => {
        toast.success(
          `Reconciliation initiated for all pending/failed transactions`
        );
        refetch();
      },
      onError: (error: any) => {
        toast.error(error?.message || 'Failed to reconcile transactions');
      },
    });
  };

  if (isLoading) {
    return (
      <div className='min-h-screen bg-black flex items-center justify-center'>
        <div className='text-center'>
          <div className='animate-spin rounded-full h-12 w-12 border-b-2 border-violet-400 mb-4'></div>
          <p className='text-gray-400'>Loading transactions...</p>
        </div>
      </div>
    );
  }

  if (isError) {
    return (
      <div className='min-h-screen bg-black flex items-center justify-center'>
        <div className='text-center'>
          <AlertTriangle className='w-12 h-12 text-red-400 mx-auto mb-4' />
          <p className='text-red-400 text-lg mb-4'>
            Error: {error?.message || 'Failed to load transactions'}
          </p>
          <Button onClick={() => window.location.reload()}>Try Again</Button>
        </div>
      </div>
    );
  }

  // Calculate stats - use server stats if available
  const serverStats = responseData?.stats;
  const totalTransactions =
    serverStats?.totalTransactions || totalDocs || transactions.length;
  const pendingCount =
    serverStats?.pendingWithdrawals || pendingWithdrawals.length;
  const processingCount = transactions.filter(
    (t: any) => t.status === 'processing' || t.status === 'failed'
  ).length;
  const totalDeposits =
    serverStats?.totalDeposits ||
    transactions.filter((t: any) => t.type === 'deposit').length;
  const totalWithdrawals =
    serverStats?.totalWithdrawals ||
    transactions.filter((t: any) => t.type === 'withdrawal').length;

  const getTransactionIcon = (type: string) => {
    switch (type) {
      case 'deposit':
        return (
          <ArrowDownRight className='w-4 sm:w-5 h-4 sm:h-5 text-emerald-400' />
        );
      case 'withdrawal':
        return <ArrowUpRight className='w-4 sm:w-5 h-4 sm:h-5 text-red-400' />;
      case 'stake':
        return <TrendingUp className='w-4 sm:w-5 h-4 sm:h-5 text-blue-400' />;
      case 'win':
        return (
          <CheckCircle2 className='w-4 sm:w-5 h-4 sm:h-5 text-amber-400' />
        );
      default:
        return <DollarSign className='w-4 sm:w-5 h-4 sm:h-5 text-gray-400' />;
    }
  };

  const getTransactionColor = (type: string) => {
    switch (type) {
      case 'deposit':
        return 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30';
      case 'withdrawal':
        return 'bg-red-500/20 text-red-400 border-red-500/30';
      case 'stake':
        return 'bg-blue-500/20 text-blue-400 border-blue-500/30';
      case 'win':
        return 'bg-amber-500/20 text-amber-400 border-amber-500/30';
      default:
        return 'bg-gray-500/20 text-gray-400 border-gray-500/30';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed':
        return 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30';
      case 'processing':
        return 'bg-blue-500/20 text-blue-400 border-blue-500/30';
      case 'pending':
        return 'bg-amber-500/20 text-amber-400 border-amber-500/30';
      case 'failed':
      case 'rejected':
        return 'bg-red-500/20 text-red-400 border-red-500/30';
      default:
        return 'bg-gray-500/20 text-gray-400 border-gray-500/30';
    }
  };

  return (
    <div className='min-h-screen bg-black'>
      {/* Animated Background */}
      <div className='fixed inset-0 bg-gradient-to-br from-violet-950/20 via-black to-pink-950/20' />
      <div className='fixed inset-0 bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-purple-900/10 via-transparent to-transparent' />

      <div className='relative max-w-7xl mx-auto px-3 sm:px-4 lg:px-6 xl:px-8 py-4 sm:py-6 lg:py-8'>
        {/* Hero Section */}
        <div className='mb-4 sm:mb-6 lg:mb-8'>
          <div className='relative overflow-hidden rounded-xl sm:rounded-2xl lg:rounded-3xl bg-gradient-to-br from-violet-600/10 via-purple-600/5 to-pink-600/10 border border-white/10 p-4 sm:p-6 lg:p-8 xl:p-12'>
            {/* Animated elements */}
            <div className='absolute top-0 right-0 w-32 sm:w-48 lg:w-64 h-32 sm:h-48 lg:h-64 bg-gradient-to-br from-violet-500/20 to-pink-500/20 rounded-full blur-3xl' />
            <div className='absolute bottom-0 left-0 w-24 sm:w-36 lg:w-48 h-24 sm:h-36 lg:h-48 bg-gradient-to-tr from-orange-500/20 to-amber-500/20 rounded-full blur-3xl' />

            <div className='relative z-10'>
              <div className='flex flex-wrap items-center gap-2 mb-3 sm:mb-4'>
                <div className='flex items-center gap-2 px-2 sm:px-3 py-1 sm:py-1.5 rounded-full bg-gradient-to-r from-emerald-500/20 to-teal-500/20 border border-emerald-500/30'>
                  <DollarSign className='w-3 sm:w-4 h-3 sm:h-4 text-emerald-400' />
                  <span className='text-xs sm:text-sm font-medium text-emerald-400'>
                    Transaction Management
                  </span>
                </div>
                <Badge className='bg-amber-500/20 text-amber-400 border-amber-500/30 text-xs sm:text-sm'>
                  <Crown className='w-3 h-3 mr-1' />
                  Admin Panel
                </Badge>
              </div>

              <h1 className='text-xl sm:text-2xl md:text-3xl lg:text-4xl xl:text-5xl font-black mb-2 sm:mb-3'>
                <span className='bg-gradient-to-r from-violet-400 via-pink-400 to-orange-400 bg-clip-text text-transparent'>
                  Manage Transactions
                </span>
              </h1>

              <p className='text-xs sm:text-sm md:text-base lg:text-lg xl:text-xl text-gray-400 mb-3 sm:mb-4 lg:mb-6 max-w-2xl'>
                Monitor all financial transactions and approve pending
                withdrawals
              </p>

              <div className='flex flex-col sm:flex-row gap-2 sm:gap-3'>
                {processingCount > 0 && (
                  <Button
                    onClick={handleRetryAll}
                    disabled={reconcileAllTransactions.isPending}
                    className='w-full sm:w-auto px-3 sm:px-4 lg:px-6 py-2 sm:py-3 lg:py-4 rounded-lg sm:rounded-xl lg:rounded-2xl bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-700 hover:to-cyan-700 font-semibold text-xs sm:text-sm lg:text-base'
                  >
                    {reconcileAllTransactions.isPending ? (
                      <Loader2 className='w-3 sm:w-4 h-3 sm:h-4 mr-1 sm:mr-2 animate-spin' />
                    ) : (
                      <RefreshCw className='w-3 sm:w-4 h-3 sm:h-4 mr-1 sm:mr-2' />
                    )}
                    Reconcile All ({processingCount})
                  </Button>
                )}
                <Link href='/admin/dashboard' className='w-full sm:w-auto'>
                  <Button
                    variant='outline'
                    className='w-full px-3 sm:px-4 lg:px-6 py-2 sm:py-3 lg:py-4 rounded-lg sm:rounded-xl lg:rounded-2xl border-white/20 text-white hover:bg-white/10 font-semibold text-xs sm:text-sm lg:text-base'
                  >
                    <Shield className='w-3 sm:w-4 h-3 sm:h-4 mr-1 sm:mr-2' />
                    Dashboard
                  </Button>
                </Link>
              </div>
            </div>
          </div>
        </div>

        {/* Quick Stats */}
        <div className='grid grid-cols-2 lg:grid-cols-4 gap-2 sm:gap-3 lg:gap-4 mb-4 sm:mb-6 lg:mb-8'>
          <Card className='bg-white/5 backdrop-blur-sm border-white/10'>
            <CardContent className='p-3 sm:p-4 lg:p-6'>
              <div className='flex flex-col sm:flex-row items-start sm:items-center gap-2 sm:gap-3 lg:gap-4'>
                <div className='p-2 sm:p-2.5 lg:p-3 rounded-lg sm:rounded-xl bg-gradient-to-r from-blue-500/20 to-cyan-500/20'>
                  <CreditCard className='w-4 sm:w-5 lg:w-6 h-4 sm:h-5 lg:h-6 text-blue-400' />
                </div>
                <div>
                  <p className='text-gray-400 text-xs sm:text-sm'>Total</p>
                  <p className='text-lg sm:text-xl lg:text-2xl font-bold text-white'>
                    {totalTransactions}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className='bg-white/5 backdrop-blur-sm border-white/10'>
            <CardContent className='p-3 sm:p-4 lg:p-6'>
              <div className='flex flex-col sm:flex-row items-start sm:items-center gap-2 sm:gap-3 lg:gap-4'>
                <div className='p-2 sm:p-2.5 lg:p-3 rounded-lg sm:rounded-xl bg-gradient-to-r from-blue-500/20 to-indigo-500/20'>
                  <RefreshCw className='w-4 sm:w-5 lg:w-6 h-4 sm:h-5 lg:h-6 text-blue-400' />
                </div>
                <div>
                  <p className='text-gray-400 text-xs sm:text-sm'>Reconcile</p>
                  <p className='text-lg sm:text-xl lg:text-2xl font-bold text-white'>
                    {processingCount}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className='bg-white/5 backdrop-blur-sm border-white/10'>
            <CardContent className='p-3 sm:p-4 lg:p-6'>
              <div className='flex flex-col sm:flex-row items-start sm:items-center gap-2 sm:gap-3 lg:gap-4'>
                <div className='p-2 sm:p-2.5 lg:p-3 rounded-lg sm:rounded-xl bg-gradient-to-r from-emerald-500/20 to-teal-500/20'>
                  <ArrowDownRight className='w-4 sm:w-5 lg:w-6 h-4 sm:h-5 lg:h-6 text-emerald-400' />
                </div>
                <div>
                  <p className='text-gray-400 text-xs sm:text-sm'>Deposits</p>
                  <p className='text-lg sm:text-xl lg:text-2xl font-bold text-white'>
                    {totalDeposits}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className='bg-white/5 backdrop-blur-sm border-white/10'>
            <CardContent className='p-3 sm:p-4 lg:p-6'>
              <div className='flex flex-col sm:flex-row items-start sm:items-center gap-2 sm:gap-3 lg:gap-4'>
                <div className='p-2 sm:p-2.5 lg:p-3 rounded-lg sm:rounded-xl bg-gradient-to-r from-red-500/20 to-pink-500/20'>
                  <ArrowUpRight className='w-4 sm:w-5 lg:w-6 h-4 sm:h-5 lg:h-6 text-red-400' />
                </div>
                <div>
                  <p className='text-gray-400 text-xs sm:text-sm'>
                    Withdrawals
                  </p>
                  <p className='text-lg sm:text-xl lg:text-2xl font-bold text-white'>
                    {totalWithdrawals}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Pending Withdrawals */}
        {pendingWithdrawals.length > 0 && (
          <Card className='bg-white/5 backdrop-blur-sm border-white/10 mb-4 sm:mb-6 lg:mb-8'>
            <CardHeader className='p-4 sm:p-6'>
              <CardTitle className='text-white flex items-center gap-2 text-base sm:text-lg lg:text-xl'>
                <Clock className='w-4 sm:w-5 h-4 sm:h-5 text-amber-400' />
                Pending Withdrawals ({pendingWithdrawals.length})
              </CardTitle>
            </CardHeader>
            <CardContent className='p-4 sm:p-6'>
              <div className='space-y-3 sm:space-y-4'>
                {pendingWithdrawals.map((tx: any) => (
                  <div
                    key={tx.id}
                    className='p-3 sm:p-4 lg:p-6 rounded-xl sm:rounded-2xl bg-gradient-to-r from-amber-500/5 to-orange-500/5 border border-amber-500/20'
                  >
                    <div className='flex items-start justify-between mb-3 sm:mb-4'>
                      <div className='flex-1'>
                        <div className='flex items-center gap-2 sm:gap-3 mb-2'>
                          <div className='p-1.5 sm:p-2 rounded-lg sm:rounded-xl bg-gradient-to-r from-amber-500/20 to-orange-500/20'>
                            <ArrowUpRight className='w-4 sm:w-5 h-4 sm:h-5 text-amber-400' />
                          </div>
                          <div>
                            <h3 className='text-sm sm:text-base lg:text-lg font-bold text-white'>
                              Withdrawal Request
                            </h3>
                            <p className='text-amber-400 font-semibold text-sm sm:text-base'>
                              ₦{tx.amount?.toLocaleString()}
                            </p>
                          </div>
                        </div>

                        <div className='flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4 mb-2 sm:mb-3'>
                          <div className='flex items-center gap-2'>
                            <User className='w-3 sm:w-4 h-3 sm:h-4 text-gray-400' />
                            <span className='text-white font-medium text-xs sm:text-sm'>
                              {
                                (typeof tx.user === 'object'
                                  ? tx.user
                                  : tx.user
                                )?.firstName
                              }{' '}
                              {
                                (typeof tx.user === 'object'
                                  ? tx.user
                                  : tx.user
                                )?.lastName
                              }
                            </span>
                            <span className='text-gray-400 text-xs sm:text-sm'>
                              (
                              {
                                (typeof tx.user === 'object'
                                  ? tx.user
                                  : tx.user
                                )?.email
                              }
                              )
                            </span>
                          </div>
                          <Badge
                            className={`${getStatusColor(tx.status)} text-xs`}
                          >
                            <Clock className='w-3 h-3 mr-1' />
                            {tx.status}
                          </Badge>
                        </div>

                        {tx.createdAt && (
                          <div className='flex items-center gap-1 sm:gap-2 text-xs text-gray-500'>
                            <Calendar className='w-3 sm:w-4 h-3 sm:h-4' />
                            <span className='hidden sm:inline'>
                              Requested{' '}
                              {new Date(tx.createdAt).toLocaleDateString()} at{' '}
                              {new Date(tx.createdAt).toLocaleTimeString()}
                            </span>
                            <span className='sm:hidden'>
                              {new Date(tx.createdAt).toLocaleDateString()}
                            </span>
                          </div>
                        )}
                      </div>
                    </div>

                    <div className='flex gap-2 sm:gap-3'>
                      <Button
                        size='sm'
                        className='bg-emerald-600 hover:bg-emerald-700 text-white text-xs sm:text-sm'
                        disabled={
                          approveWithdrawal.isPending && selectedTxId === tx.id
                        }
                        onClick={() => {
                          setSelectedTxId(tx.id);
                          approveWithdrawal.mutate(tx.id);
                        }}
                      >
                        <CheckCircle2 className='w-3 sm:w-4 h-3 sm:h-4 mr-1 sm:mr-2' />
                        Approve
                      </Button>
                      <Button
                        size='sm'
                        variant='destructive'
                        className='bg-red-600 hover:bg-red-700 text-white text-xs sm:text-sm'
                        disabled={
                          rejectWithdrawal.isPending && selectedTxId === tx.id
                        }
                        onClick={() => {
                          setSelectedTxId(tx.id);
                          rejectWithdrawal.mutate(tx.id);
                        }}
                      >
                        <XCircle className='w-3 sm:w-4 h-3 sm:h-4 mr-1 sm:mr-2' />
                        Reject
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Filters */}
        <Card className='bg-white/5 backdrop-blur-sm border-white/10 mb-4 sm:mb-6 lg:mb-8'>
          <CardContent className='p-3 sm:p-4 lg:p-6'>
            <div className='flex flex-col gap-3 sm:gap-4'>
              <div className='flex-1'>
                <div className='relative'>
                  <Search className='w-4 sm:w-5 h-4 sm:h-5 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400' />
                  <Input
                    placeholder={
                      isMobile
                        ? 'Search...'
                        : 'Search by user, reference, or user ID...'
                    }
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className='pl-9 sm:pl-10 h-9 sm:h-10 lg:h-12 text-xs sm:text-sm lg:text-base bg-black/50 border-white/20 text-white placeholder-gray-400 focus:border-violet-500 rounded-lg sm:rounded-xl'
                  />
                </div>
              </div>

              {isMobile ? (
                <div className='grid grid-cols-2 gap-2'>
                  <Select
                    value={filterStatus}
                    onValueChange={(value: any) => setFilterStatus(value)}
                  >
                    <SelectTrigger className='bg-black/50 border-white/20 text-white h-9 text-xs'>
                      <SelectValue placeholder='Status' />
                    </SelectTrigger>
                    <SelectContent className='bg-black/95 border-white/20'>
                      <SelectItem
                        value='all'
                        className='text-white hover:bg-white/10'
                      >
                        All Status
                      </SelectItem>
                      <SelectItem
                        value='completed'
                        className='text-white hover:bg-white/10'
                      >
                        Completed
                      </SelectItem>
                      <SelectItem
                        value='processing'
                        className='text-white hover:bg-white/10'
                      >
                        Processing
                      </SelectItem>
                      <SelectItem
                        value='pending'
                        className='text-white hover:bg-white/10'
                      >
                        Pending
                      </SelectItem>
                      <SelectItem
                        value='failed'
                        className='text-white hover:bg-white/10'
                      >
                        Failed
                      </SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              ) : (
                <div className='flex flex-wrap gap-2'>
                  <div className='flex flex-wrap gap-2'>
                    {[
                      'all',
                      'completed',
                      'processing',
                      'pending',
                      'failed',
                    ].map((status) => (
                      <Button
                        key={status}
                        size='sm'
                        variant={
                          filterStatus === status ? 'default' : 'outline'
                        }
                        onClick={() => setFilterStatus(status as any)}
                        className={
                          filterStatus === status
                            ? 'bg-pink-600 hover:bg-pink-700 text-white'
                            : 'border-white/20 text-gray-300 hover:bg-white/10'
                        }
                      >
                        {status.charAt(0).toUpperCase() + status.slice(1)}
                      </Button>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* All Transactions */}
        <Card className='bg-white/5 backdrop-blur-sm border-white/10'>
          <CardHeader className='p-4 sm:p-6'>
            <CardTitle className='text-white flex items-center justify-between text-base sm:text-lg lg:text-xl'>
              <div className='flex items-center gap-2'>
                <CreditCard className='w-4 sm:w-5 h-4 sm:h-5 text-violet-400' />
                All Transactions ({totalDocs})
              </div>
              <Button
                size='sm'
                variant='outline'
                onClick={() => refetch()}
                className='border-white/20 text-gray-300 hover:bg-white/10 p-2'
              >
                <RefreshCw className='w-3 sm:w-4 h-3 sm:h-4' />
              </Button>
            </CardTitle>
          </CardHeader>
          <CardContent className='p-3 sm:p-4 lg:p-6'>
            {filteredTransactions.length === 0 ? (
              <div className='text-center py-8 sm:py-12'>
                <Wallet className='w-10 sm:w-12 h-10 sm:h-12 text-gray-500 mx-auto mb-3 sm:mb-4' />
                <h3 className='text-base sm:text-lg font-semibold text-white mb-2'>
                  {searchTerm || filterType !== 'all' || filterStatus !== 'all'
                    ? 'No matching transactions found'
                    : 'No transactions found'}
                </h3>
                <p className='text-gray-400 text-xs sm:text-sm mb-4 sm:mb-6 px-4'>
                  {searchTerm || filterType !== 'all' || filterStatus !== 'all'
                    ? 'Try adjusting your search or filter criteria'
                    : 'Transactions will appear here as users make deposits and withdrawals'}
                </p>
              </div>
            ) : (
              <div className='space-y-3 sm:space-y-4'>
                {filteredTransactions.map((tx: any) => (
                  <div
                    key={tx.id}
                    className='group p-3 sm:p-4 lg:p-6 rounded-lg sm:rounded-xl lg:rounded-2xl bg-gradient-to-r from-white/[0.02] to-white/[0.05] backdrop-blur-sm border border-white/10 hover:from-white/[0.05] hover:to-white/[0.08] transition-all'
                  >
                    <div className='flex items-start justify-between'>
                      <div className='flex-1'>
                        {/* Header Row */}
                        <div className='flex flex-col sm:flex-row sm:items-start sm:justify-between gap-2 sm:gap-0 mb-3 sm:mb-4'>
                          <div className='flex items-center gap-2 sm:gap-3'>
                            <div className='p-1.5 sm:p-2 lg:p-2.5 rounded-lg sm:rounded-xl bg-gradient-to-br from-white/10 to-white/5'>
                              {getTransactionIcon(tx.type)}
                            </div>
                            <div>
                              <h3 className='text-sm sm:text-base lg:text-lg font-bold text-white capitalize'>
                                {tx.type} Transaction
                              </h3>
                              <p className='text-lg sm:text-xl lg:text-2xl font-black text-transparent bg-gradient-to-r from-violet-400 to-pink-400 bg-clip-text'>
                                ₦{tx.amount?.toLocaleString()}
                              </p>
                              {tx.description && (
                                <p className='text-xs text-gray-500 mt-1'>
                                  {tx.description}
                                </p>
                              )}
                            </div>
                          </div>

                          {/* Status and Action */}
                          <div className='flex flex-row sm:flex-col lg:flex-row items-start sm:items-end lg:items-center gap-2'>
                            <Badge
                              className={`${getStatusColor(tx.status)} text-xs`}
                            >
                              {tx.status === 'processing' && (
                                <Loader2 className='w-3 h-3 mr-1 animate-spin' />
                              )}
                              {tx.status}
                            </Badge>
                            {(tx.status === 'processing' ||
                              tx.status === 'failed') && (
                              <Button
                                size='sm'
                                onClick={() => handleRetryTransaction(tx)}
                                disabled={
                                  reconcileTransaction.isPending &&
                                  reconcileTransaction.variables === tx.id
                                }
                                className='bg-blue-600 hover:bg-blue-700 text-white text-xs h-7 px-2'
                              >
                                {reconcileTransaction.isPending &&
                                reconcileTransaction.variables === tx.id ? (
                                  <Loader2 className='w-3 h-3 animate-spin' />
                                ) : (
                                  <RefreshCw className='w-3 h-3' />
                                )}
                                <span className='ml-1'>Retry</span>
                              </Button>
                            )}
                          </div>
                        </div>

                        {/* Info Grid */}
                        <div className='grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2 sm:gap-3 mb-3 sm:mb-4'>
                          {/* User Info */}
                          <div className='flex items-center gap-2 p-2 sm:p-3 rounded-lg bg-white/5'>
                            <UserCircle className='w-3 sm:w-4 h-3 sm:h-4 text-gray-400 flex-shrink-0' />
                            <div className='text-xs sm:text-sm flex-1 min-w-0'>
                              <p className='text-gray-400'>User</p>
                              <p className='text-white font-medium truncate'>
                                {
                                  (typeof tx.user === 'object'
                                    ? tx.user
                                    : tx.user
                                  )?.firstName
                                }{' '}
                                {
                                  (typeof tx.user === 'object'
                                    ? tx.user
                                    : tx.user
                                  )?.lastName
                                }
                              </p>
                              {typeof tx.user === 'object' &&
                                tx.user?.username && (
                                  <div className='flex items-center gap-2'>
                                    <span className='text-gray-500 text-xs truncate'>
                                      @{tx.user.username}
                                    </span>
                                    {tx.user?.roles?.includes('admin') && (
                                      <Badge className='bg-purple-500/20 text-purple-400 border-purple-500/30 text-xs py-0'>
                                        Admin
                                      </Badge>
                                    )}
                                  </div>
                                )}
                              <p className='text-gray-500 text-xs truncate'>
                                {
                                  (typeof tx.user === 'object'
                                    ? tx.user
                                    : tx.user
                                  )?.email
                                }
                              </p>
                            </div>
                          </div>

                          {/* Reference */}
                          <div className='flex items-center gap-2 p-2 sm:p-3 rounded-lg bg-white/5'>
                            <Hash className='w-3 sm:w-4 h-3 sm:h-4 text-gray-400 flex-shrink-0' />
                            <div className='text-xs sm:text-sm flex-1 min-w-0'>
                              <p className='text-gray-400'>Reference</p>
                              <div className='flex items-center gap-1'>
                                <p className='text-white font-mono text-xs truncate'>
                                  {tx.reference}
                                </p>
                                <button
                                  onClick={() =>
                                    copyToClipboard(
                                      tx.reference,
                                      `ref-${tx.id}`
                                    )
                                  }
                                  className='text-gray-400 hover:text-white transition-colors flex-shrink-0'
                                >
                                  {copiedId === `ref-${tx.id}` ? (
                                    <CheckCircle className='w-3 h-3 text-emerald-400' />
                                  ) : (
                                    <Copy className='w-3 h-3' />
                                  )}
                                </button>
                              </div>
                            </div>
                          </div>

                          {/* User ID */}
                          <div className='flex items-center gap-2 p-2 sm:p-3 rounded-lg bg-white/5'>
                            <User className='w-3 sm:w-4 h-3 sm:h-4 text-gray-400 flex-shrink-0' />
                            <div className='text-xs sm:text-sm flex-1 min-w-0'>
                              <p className='text-gray-400'>User ID</p>
                              <div className='flex items-center gap-1'>
                                <p className='text-white font-mono text-xs truncate'>
                                  {typeof tx.user === 'string'
                                    ? tx.user
                                    : tx.user?.id}
                                </p>
                                <button
                                  onClick={() => {
                                    const id =
                                      typeof tx.user === 'string'
                                        ? tx.user
                                        : tx.user?.id;
                                    if (id)
                                      copyToClipboard(id, `user-${tx.id}`);
                                  }}
                                  className='text-gray-400 hover:text-white transition-colors flex-shrink-0'
                                >
                                  {copiedId === `user-${tx.id}` ? (
                                    <CheckCircle className='w-3 h-3 text-emerald-400' />
                                  ) : (
                                    <Copy className='w-3 h-3' />
                                  )}
                                </button>
                              </div>
                            </div>
                          </div>

                          {/* Wallet ID */}
                          {(tx.walletId ||
                            (typeof tx.user === 'object' &&
                              tx.user?.walletId)) && (
                            <div className='flex items-center gap-2 p-2 sm:p-3 rounded-lg bg-white/5'>
                              <Wallet className='w-3 sm:w-4 h-3 sm:h-4 text-gray-400 flex-shrink-0' />
                              <div className='text-xs sm:text-sm min-w-0'>
                                <p className='text-gray-400'>Wallet ID</p>
                                <p className='text-white font-mono text-xs truncate'>
                                  {tx.walletId || tx.user?.walletId}
                                </p>
                              </div>
                            </div>
                          )}

                          {/* Balance Info */}
                          {tx.balanceBefore !== undefined && (
                            <div className='flex items-center gap-2 p-2 sm:p-3 rounded-lg bg-white/5'>
                              <TrendingUp className='w-3 sm:w-4 h-3 sm:h-4 text-gray-400 flex-shrink-0' />
                              <div className='text-xs sm:text-sm min-w-0'>
                                <p className='text-gray-400'>Balance Change</p>
                                <p className='text-white text-xs'>
                                  ₦{tx.balanceBefore?.toLocaleString()} → ₦
                                  {(tx.type === 'deposit'
                                    ? tx.balanceBefore + tx.amount
                                    : tx.balanceBefore - tx.amount
                                  )?.toLocaleString()}
                                </p>
                              </div>
                            </div>
                          )}

                          {/* Payment Link */}
                          {tx.metadata?.paymentLink && (
                            <div className='flex items-center gap-2 p-2 sm:p-3 rounded-lg bg-white/5'>
                              <Link2 className='w-3 sm:w-4 h-3 sm:h-4 text-gray-400 flex-shrink-0' />
                              <div className='text-xs sm:text-sm flex-1 min-w-0'>
                                <p className='text-gray-400'>Payment Link</p>
                                <a
                                  href={tx.metadata.paymentLink}
                                  target='_blank'
                                  rel='noopener noreferrer'
                                  className='text-blue-400 hover:text-blue-300 flex items-center gap-1'
                                >
                                  <span className='text-xs truncate'>
                                    View Payment
                                  </span>
                                  <ExternalLink className='w-3 h-3 flex-shrink-0' />
                                </a>
                              </div>
                            </div>
                          )}
                        </div>

                        {/* Footer */}
                        <div className='flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 pt-2 sm:pt-3 border-t border-white/10'>
                          <div className='flex items-center gap-2 sm:gap-3'>
                            <Badge
                              className={`${getTransactionColor(
                                tx.type
                              )} text-xs`}
                            >
                              {tx.type}
                            </Badge>
                            {!isMobile && tx.description && (
                              <span className='text-xs text-gray-500 hidden lg:inline'>
                                {tx.description}
                              </span>
                            )}
                          </div>

                          {tx.createdAt && (
                            <div className='flex items-center gap-1 sm:gap-2 text-xs text-gray-500'>
                              <Calendar className='w-3 h-3' />
                              <span className='hidden sm:inline'>
                                {new Date(tx.createdAt).toLocaleDateString()} at{' '}
                                {new Date(tx.createdAt).toLocaleTimeString()}
                              </span>
                              <span className='sm:hidden'>
                                {new Date(tx.createdAt).toLocaleDateString()}
                              </span>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* Pagination Controls */}
            {!isLoading && filteredTransactions.length > 0 && (
              <Pagination
                currentPage={currentPage}
                totalPages={totalPages}
                totalDocs={totalDocs}
                hasNextPage={hasNextPage}
                hasPrevPage={hasPrevPage}
                onPageChange={setCurrentPage}
                itemName='transactions'
              />
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
