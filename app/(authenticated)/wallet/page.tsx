'use client';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Pagination } from '@/components/ui/pagination';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { usePublicBanks, useVerifyAccount } from '@/lib/banks';
import { cn } from '@/lib/utils';
import { capitalize } from '@/lib/capitalize';
import { usePlatformLimits } from '@/lib/platform-settings';
import {
  useDeposit,
  useTransactions,
  useWalletBalance,
  useWithdraw,
  useCalculateWithdrawal,
} from '@/lib/wallet';
import { useAuthStore } from '@/stores/authStore';
import {
  Activity,
  AlertCircle,
  ArrowDownLeft,
  ArrowRight,
  Banknote,
  CheckCircle,
  CircleDollarSign,
  Clock,
  Coins,
  Copy,
  CreditCardIcon,
  Download,
  Gift,
  Hash,
  History,
  Loader2,
  Plus,
  Search,
  Send,
  Shield,
  Smartphone,
  TrendingUp,
  Trophy,
  Wallet,
  XCircle,
  Zap,
} from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useState, useEffect } from 'react';
import { toast } from 'sonner';

export default function WalletPage() {
  const { user, balance: storeBalance } = useAuthStore();
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  // Wallet API hooks
  const { data: balanceData, isLoading: isBalanceLoading } = useWalletBalance();

  const depositMutation = useDeposit();
  const withdrawMutation = useWithdraw();

  // Platform limits
  const { data: limitsData } = usePlatformLimits();
  const platformLimits = limitsData?.data;
  
  const minWithdrawalAmount = platformLimits?.minWithdrawalAmount || 1000; // Default to 1000 if not loaded
  const minDepositAmount = 500; // Keep deposit at 500 as it's payment gateway specific

  // Banks hooks
  const { data: banksData, isLoading: isBanksLoading } = usePublicBanks();
  const verifyAccountMutation = useVerifyAccount();

  const [isDepositDialogOpen, setIsDepositDialogOpen] = useState(false);
  const [isWithdrawDialogOpen, setIsWithdrawDialogOpen] = useState(false);
  const [amount, setAmount] = useState('');
  const [phoneNumber, setPhoneNumber] = useState(user?.phoneNumber || '');
  const [accountNumber, setAccountNumber] = useState('');
  const [bankCode, setBankCode] = useState('');
  const [accountName, setAccountName] = useState('');
  const [isAccountVerified, setIsAccountVerified] = useState(false);
  const [activeTab, setActiveTab] = useState('all');
  const [bankSearch, setBankSearch] = useState('');
  const [showBankDropdown, setShowBankDropdown] = useState(false);
  const [selectedBankName, setSelectedBankName] = useState('');
  const [copiedRef, setCopiedRef] = useState<string | null>(null);

  // Pass filter type to API
  const transactionType =
    activeTab === 'deposits'
      ? 'deposit'
      : activeTab === 'withdrawals'
      ? 'withdrawal'
      : undefined;

  const {
    data: transactionsData,
    isLoading: isTransactionsLoading,
    refetch: refetchTransactions,
  } = useTransactions({
    page: currentPage,
    limit: itemsPerPage,
    type: transactionType,
  });

  // Withdrawal calculation hook - must be after state declarations
  const { data: withdrawalCalc, isLoading: isCalcLoading } =
    useCalculateWithdrawal(
      amount ? parseInt(amount) : undefined,
      isAccountVerified && !!amount && parseInt(amount) >= 1000
    );

  // Reset to page 1 when tab changes
  useEffect(() => {
    setCurrentPage(1);
  }, [activeTab]);

  // Close bank dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as HTMLElement;
      if (!target.closest('.bank-search-container')) {
        setShowBankDropdown(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  if (!user) {
    return null;
  }

  const balance = balanceData?.data?.totalBalance || storeBalance || 0;
  const responseData = transactionsData?.data as any;
  const transactions = responseData?.docs || [];
  const totalPages = responseData?.totalPages || 1;
  const hasNextPage = responseData?.hasNextPage || false;
  const hasPrevPage = responseData?.hasPrevPage || false;
  const totalDocs = responseData?.totalDocs || 0;
  const isLoading = isBalanceLoading || isTransactionsLoading;

  const quickAmounts = [1000, 5000, 10000, 20000];

  const handleDeposit = async () => {
    if (!amount || !phoneNumber) {
      toast.error('Fill in all the details fam!');
      return;
    }

    const depositAmount = parseInt(amount);

    if (depositAmount < minDepositAmount) {
      toast.error(`Minimum deposit is ₦${minDepositAmount} chief!`);
      return;
    }

    const depositRequest = {
      amount: depositAmount,
      email: user.email,
      phoneNumber,
      name: capitalize(user.firstName) + ' ' + capitalize(user.lastName),
    };

    depositMutation.mutate(depositRequest, {
      onSuccess: (data) => {
        toast.success('Deposit initiated! Complete payment to add funds 💰');
        setAmount('');
        setPhoneNumber(user?.phoneNumber || '');
        setIsDepositDialogOpen(false);
        refetchTransactions();
        window.open(data?.data?.metadata.paymentLink);
      },
      onError: (error: any) => {
        toast.error(error?.message || 'Deposit failed. Try again!');
      },
    });
  };

  const handleWithdraw = async () => {
    if (!amount || !accountNumber || !bankCode || !isAccountVerified) {
      toast.error('Complete all fields and verify your account!');
      return;
    }

    const withdrawAmount = parseInt(amount);

    if (withdrawAmount < minWithdrawalAmount) {
      toast.error(
        `Minimum withdrawal is ₦${minWithdrawalAmount.toLocaleString()} fam!`
      );
      return;
    }

    if (withdrawAmount > balance) {
      toast.error('Insufficient funds! Top up first 💸');
      return;
    }

    const selectedBank = banksData?.data?.find((b: any) => b.code === bankCode);
    const withdrawalRequest = {
      amount: withdrawAmount,
      accountNumber,
      accountName,
      bankCode,
      bankName: selectedBank?.name || '',
    };

    withdrawMutation.mutate(withdrawalRequest, {
      onSuccess: () => {
        toast.success('Withdrawal processing! Check your bank soon 🏦');
        setAmount('');
        setAccountNumber('');
        setAccountName('');
        setBankCode('');
        setSelectedBankName('');
        setBankSearch('');
        setShowBankDropdown(false);
        setIsAccountVerified(false);
        setIsWithdrawDialogOpen(false);
        refetchTransactions();
      },
      onError: (error: any) => {
        toast.error(error?.message || 'Withdrawal failed. Try again!');
      },
    });
  };

  const getTransactionIcon = (type: string) => {
    if (!type) return <Activity className='w-4 h-4 text-gray-400' />;
    switch (type.toLowerCase()) {
      case 'deposit':
        return <Download className='w-4 h-4 text-emerald-400' />;
      case 'withdrawal':
      case 'withdraw':
        return <Send className='w-4 h-4 text-pink-400' />;
      case 'stake':
        return <TrendingUp className='w-4 h-4 text-violet-400' />;
      case 'win':
      case 'winnings':
        return <Trophy className='w-4 h-4 text-amber-400' />;
      case 'refund':
        return <ArrowDownLeft className='w-4 h-4 text-blue-400' />;
      default:
        return <Activity className='w-4 h-4 text-gray-400' />;
    }
  };

  const getStatusBadge = (status: string) => {
    if (!status) return null;
    switch (status.toLowerCase()) {
      case 'completed':
      case 'success':
        return (
          <Badge className='text-[10px] xs:text-xs bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 px-1.5 xs:px-2 py-0.5'>
            <CheckCircle className='w-2.5 xs:w-3 h-2.5 xs:h-3 mr-0.5 xs:mr-1' />
            <span className='hidden xs:inline'>Completed</span>
            <span className='xs:hidden'>Done</span>
          </Badge>
        );
      case 'pending':
        return (
          <Badge className='text-[10px] xs:text-xs bg-amber-500/20 text-amber-400 border border-amber-500/30 px-1.5 xs:px-2 py-0.5'>
            <Clock className='w-2.5 xs:w-3 h-2.5 xs:h-3 mr-0.5 xs:mr-1' />
            Pending
          </Badge>
        );
      case 'failed':
        return (
          <Badge className='text-[10px] xs:text-xs bg-red-500/20 text-red-400 border border-red-500/30 px-1.5 xs:px-2 py-0.5'>
            <XCircle className='w-2.5 xs:w-3 h-2.5 xs:h-3 mr-0.5 xs:mr-1' />
            Failed
          </Badge>
        );
      default:
        return (
          <Badge className='text-[10px] xs:text-xs bg-gray-500/20 text-gray-400 border border-gray-500/30 px-1.5 xs:px-2 py-0.5'>
            <Clock className='w-2.5 xs:w-3 h-2.5 xs:h-3 mr-0.5 xs:mr-1' />
            {status}
          </Badge>
        );
    }
  };

  const formatAmount = (amount: number, type: string) => {
    const typeStr = type || 'unknown';
    const isCredit = ['deposit', 'win', 'winnings', 'refund'].includes(
      typeStr.toLowerCase()
    );

    if (type === 'processing') {
      return (
        <span
          className={cn(
            'font-bold text-sm xs:text-base sm:text-lg text-gray-100'
          )}
        >
          +₦{Math.abs(amount).toLocaleString()}
        </span>
      );
    }
    return (
      <span
        className={cn(
          'font-bold text-sm xs:text-base sm:text-lg',
          isCredit ? 'text-emerald-400' : 'text-pink-400'
        )}
      >
        {isCredit ? '+' : '-'}₦{Math.abs(amount).toLocaleString()}
      </span>
    );
  };

  const copyToClipboard = (text: string, refId: string) => {
    navigator.clipboard.writeText(text);
    setCopiedRef(refId);
    toast.success('Reference copied!');
    setTimeout(() => setCopiedRef(null), 2000);
  };

  // No client-side filtering needed - server handles it
  const filteredTransactions = transactions;

  return (
    <div className='min-h-screen bg-black'>
      {/* Background Effects */}
      <div className='fixed inset-0 bg-gradient-to-br from-violet-950/20 via-black to-emerald-950/20' />
      <div className='fixed inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-purple-900/10 via-transparent to-transparent' />

      <div className='relative max-w-7xl mx-auto px-3 sm:px-4 md:px-6 lg:px-8 py-4 sm:py-6 md:py-8'>
        {/* Header */}
        <div className='mb-4 sm:mb-6 md:mb-8'>
          <h1 className='text-3xl sm:text-4xl font-black mb-1 sm:mb-2'>
            <span className='bg-gradient-to-r from-violet-400 via-emerald-400 to-amber-400 bg-clip-text text-transparent'>
              Your Bag
            </span>
          </h1>
          <p className='text-gray-400 text-sm sm:text-base'>
            Stack your cash, track your moves 💰
          </p>
        </div>

        {/* Balance Cards */}
        <div className='grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-6 mb-6 sm:mb-8'>
          {/* Main Balance Card */}
          <div className='lg:col-span-3'>
            <Card className='bg-gradient-to-br from-violet-900/50 via-purple-900/50 to-pink-900/50 border-white/10 backdrop-blur-xl shadow-2xl overflow-hidden'>
              <div className='absolute inset-0 bg-gradient-to-br from-violet-500/10 to-pink-500/10 animate-pulse' />
              <CardHeader className='relative'>
                <div className='flex items-center justify-between'>
                  <div className='flex items-center gap-3'>
                    <div className='p-3 rounded-2xl bg-white/10 backdrop-blur-sm'>
                      <Wallet className='w-6 h-6 text-white' />
                    </div>
                    <div>
                      <CardTitle className='text-white'>
                        Total Balance
                      </CardTitle>
                      <CardDescription className='text-gray-300'>
                        Ready to stake
                      </CardDescription>
                    </div>
                  </div>
                  <Badge className='bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'>
                    <Zap className='w-3 h-3 mr-1' />
                    Active
                  </Badge>
                </div>
              </CardHeader>
              <CardContent className='relative'>
                <div className='text-3xl sm:text-4xl md:text-5xl font-black text-white mb-3 sm:mb-6'>
                  ₦{balance.toLocaleString()}
                </div>
                <div className='flex flex-col sm:flex-row gap-2 sm:gap-3'>
                  <Button
                    onClick={() => setIsDepositDialogOpen(true)}
                    className='bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-600 hover:to-teal-600 text-white font-bold shadow-lg shadow-emerald-500/25 rounded-xl'
                  >
                    <Plus className='w-4 h-4 mr-2' />
                    Add Money
                  </Button>
                  <Button
                    onClick={() => setIsWithdrawDialogOpen(true)}
                    variant='outline'
                    className='border-white/20 text-white hover:bg-white/10 rounded-xl'
                  >
                    <Send className='w-4 h-4 mr-2' />
                    Cash Out
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Quick Stats Card */}
          {/* <Card className='bg-white/5 backdrop-blur-sm border-white/10'>
            <CardHeader>
              <CardTitle className='text-white text-lg'>Quick Stats</CardTitle>
            </CardHeader>
            <CardContent className='space-y-4'>
              <div className='flex items-center justify-between'>
                <div className='flex items-center gap-2'>
                  <Download className='w-4 h-4 text-emerald-400' />
                  <span className='text-gray-400 text-sm'>Total Deposits</span>
                </div>
                <span className='text-white font-bold'>
                  ₦{balanceData?.data?.totalDeposits?.toLocaleString() || '0'}
                </span>
              </div>
              <div className='flex items-center justify-between'>
                <div className='flex items-center gap-2'>
                  <Send className='w-4 h-4 text-pink-400' />
                  <span className='text-gray-400 text-sm'>
                    Total Withdrawals
                  </span>
                </div>
                <span className='text-white font-bold'>
                  ₦
                  {balanceData?.data?.totalWithdrawals?.toLocaleString() || '0'}
                </span>
              </div>
              <div className='flex items-center justify-between'>
                <div className='flex items-center gap-2'>
                  <Trophy className='w-4 h-4 text-amber-400' />
                  <span className='text-gray-400 text-sm'>Total Winnings</span>
                </div>
                <span className='text-white font-bold'>₦0</span>
              </div>
            </CardContent>
          </Card> */}
        </div>

        {/* Promotional Banner */}
        <div className='mb-6 sm:mb-8 p-4 sm:p-6 rounded-xl sm:rounded-2xl bg-gradient-to-r from-amber-500/10 to-orange-500/10 border border-amber-500/20'>
          <div className='flex items-center gap-3 sm:gap-4'>
            <Gift className='w-6 sm:w-8 h-6 sm:h-8 text-amber-400 flex-shrink-0' />
            <div>
              <h3 className='text-white font-bold text-base sm:text-lg mb-0.5 sm:mb-1'>
                Instant Deposits
              </h3>
              <p className='text-gray-300 text-xs sm:text-sm'>
                Fast, secure deposits to start predicting immediately!
              </p>
            </div>
          </div>
        </div>

        {/* Transaction History */}
        <Card className='bg-white/5 backdrop-blur-sm border-white/10'>
          <CardHeader className='px-4 sm:px-6'>
            <div className='flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2'>
              <div>
                <CardTitle className='text-white text-xl sm:text-2xl'>
                  Transaction History
                </CardTitle>
                <CardDescription className='text-gray-400 text-sm sm:text-base'>
                  Track all your money moves
                </CardDescription>
              </div>
              <History className='hidden sm:block w-6 h-6 text-gray-400' />
            </div>
          </CardHeader>
          <CardContent className='px-3 xs:px-4 sm:px-6'>
            {/* Tabs - Mobile Responsive */}
            <Tabs
              value={activeTab}
              onValueChange={setActiveTab}
              className='mb-4 sm:mb-6'
            >
              {/* Mobile Select */}
              <div className='sm:hidden mb-4'>
                <select
                  value={activeTab}
                  onChange={(e) => setActiveTab(e.target.value)}
                  className='w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white appearance-none cursor-pointer focus:outline-none focus:border-violet-500/50'
                  style={{
                    backgroundImage: `url("data:image/svg+xml;charset=UTF-8,%3csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='none' stroke='white' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'%3e%3cpolyline points='6 9 12 15 18 9'%3e%3c/polyline%3e%3c/svg%3e")`,
                    backgroundRepeat: 'no-repeat',
                    backgroundPosition: 'right 1rem center',
                    backgroundSize: '1.5em 1.5em',
                    paddingRight: '3rem',
                  }}
                >
                  <option value='all' className='bg-black'>
                    📋 All Transactions
                  </option>
                  <option value='deposits' className='bg-black'>
                    💰 Deposits
                  </option>
                  <option value='withdrawals' className='bg-black'>
                    💸 Withdrawals
                  </option>
                </select>
              </div>

              {/* Desktop Tabs */}
              <TabsList className='hidden sm:flex w-full h-auto bg-white/5 border border-white/10 p-1 gap-1'>
                <TabsTrigger
                  value='all'
                  className='flex-1 text-sm data-[state=active]:bg-gradient-to-r data-[state=active]:from-violet-500/20 data-[state=active]:to-pink-500/20 data-[state=active]:text-white'
                >
                  All
                </TabsTrigger>
                <TabsTrigger
                  value='deposits'
                  className='flex-1 text-sm data-[state=active]:bg-gradient-to-r data-[state=active]:from-emerald-500/20 data-[state=active]:to-teal-500/20 data-[state=active]:text-emerald-400'
                >
                  Deposits
                </TabsTrigger>
                <TabsTrigger
                  value='withdrawals'
                  className='flex-1 text-sm data-[state=active]:bg-gradient-to-r data-[state=active]:from-pink-500/20 data-[state=active]:to-rose-500/20 data-[state=active]:text-pink-400'
                >
                  Withdrawals
                </TabsTrigger>
              </TabsList>
            </Tabs>

            {/* Transactions List - Mobile Responsive */}
            <div className='space-y-2 sm:space-y-3'>
              {isLoading ? (
                <div className='flex items-center justify-center py-8 sm:py-12'>
                  <Loader2 className='w-6 sm:w-8 h-6 sm:h-8 text-gray-400 animate-spin' />
                </div>
              ) : filteredTransactions.length === 0 ? (
                <div className='text-center py-8 sm:py-12'>
                  <Coins className='w-10 sm:w-12 h-10 sm:h-12 text-gray-600 mx-auto mb-3 sm:mb-4' />
                  <p className='text-gray-400 text-sm sm:text-base'>
                    No transactions yet
                  </p>
                  <p className='text-gray-500 text-xs sm:text-sm mt-1 sm:mt-2'>
                    Start by adding money to your wallet
                  </p>
                </div>
              ) : (
                filteredTransactions.map((transaction: any) => (
                  <div
                    key={transaction.id}
                    className='flex flex-col xs:flex-row xs:items-center xs:justify-between p-3 sm:p-4 rounded-xl bg-white/5 border border-white/10 hover:bg-white/10 transition-all gap-3 xs:gap-0'
                  >
                    {/* Mobile Layout - Stacked */}
                    <div className='flex items-start xs:items-center gap-3 xs:gap-4 flex-1'>
                      {/* Icon */}
                      <div className='p-2 xs:p-2.5 sm:p-3 rounded-lg xs:rounded-xl bg-white/10 flex-shrink-0'>
                        {getTransactionIcon(transaction.type)}
                      </div>
                      {/* Details */}
                      <div className='flex-1 min-w-0'>
                        <div className='flex flex-col xs:flex-row xs:items-center xs:gap-3'>
                          <p className='text-white font-medium text-sm sm:text-base truncate'>
                            {transaction.type
                              ? transaction.type.charAt(0).toUpperCase() +
                                transaction.type.slice(1)
                              : 'Transaction'}
                          </p>
                          {/* Amount - Mobile visible on top right */}
                          <div className='xs:hidden mt-0.5'>
                            {formatAmount(
                              transaction.amount,
                              transaction.type || 'unknown'
                            )}
                          </div>
                        </div>
                        <div className='flex flex-wrap items-center gap-2 xs:gap-3 mt-1'>
                          <span className='text-gray-400 text-xs sm:text-sm'>
                            {new Date(
                              transaction.createdAt
                            ).toLocaleDateString()}
                          </span>
                          {getStatusBadge(transaction.status)}
                        </div>
                        {/* Reference with copy button */}
                        {transaction.reference && (
                          <div className='flex items-center gap-2 mt-2'>
                            <Hash className='w-3 h-3 text-gray-500' />
                            <span className='text-xs text-gray-500 font-mono truncate max-w-[150px] xs:max-w-[200px]'>
                              {transaction.reference}
                            </span>
                            <button
                              onClick={() =>
                                copyToClipboard(
                                  transaction.reference,
                                  transaction.id
                                )
                              }
                              className='text-gray-400 hover:text-white transition-colors p-1'
                              title='Copy reference'
                            >
                              {copiedRef === transaction.id ? (
                                <CheckCircle className='w-3.5 h-3.5 text-emerald-400' />
                              ) : (
                                <Copy className='w-3.5 h-3.5' />
                              )}
                            </button>
                          </div>
                        )}
                      </div>
                    </div>
                    {/* Amount - Desktop position */}
                    <div className='hidden xs:block flex-shrink-0'>
                      {formatAmount(transaction.amount, transaction.type)}
                    </div>
                  </div>
                ))
              )}
            </div>

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

      {/* Deposit Dialog */}
      <Dialog open={isDepositDialogOpen} onOpenChange={setIsDepositDialogOpen}>
        <DialogContent className='bg-black/95 backdrop-blur-xl border-white/10 text-white'>
          <DialogHeader>
            <DialogTitle className='text-2xl font-bold bg-gradient-to-r from-emerald-400 to-teal-400 bg-clip-text text-transparent'>
              Add Money to Your Bag
            </DialogTitle>
            <DialogDescription className='text-gray-400'>
              Top up your wallet to start winning big
            </DialogDescription>
          </DialogHeader>

          <div className='space-y-6 mt-4'>
            <div className='space-y-2'>
              <Label className='text-gray-300'>Amount (₦)</Label>
              <div className='relative'>
                <CircleDollarSign className='absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-500 w-5 h-5' />
                <Input
                  type='number'
                  min='500'
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  placeholder={`Enter amount (min. ₦${minDepositAmount})`}
                  className='pl-12 h-12 bg-white/5 border-white/10 text-white placeholder-gray-500 rounded-xl focus:border-emerald-500/50 focus:bg-white/10'
                />
              </div>
            </div>

            <div className='space-y-2'>
              <Label className='text-gray-300'>Quick Select</Label>
              <div className='grid grid-cols-4 gap-2'>
                {quickAmounts.map((quickAmount) => (
                  <Button
                    key={quickAmount}
                    variant='outline'
                    onClick={() => setAmount(quickAmount.toString())}
                    className='border-white/20 text-white hover:bg-white/10 rounded-lg'
                  >
                    ₦{quickAmount.toLocaleString()}
                  </Button>
                ))}
              </div>
            </div>

            <div className='space-y-2'>
              <div className='flex items-center justify-between'>
                <Label className='text-gray-300'>Phone Number</Label>
                <span className='text-xs text-gray-500'>
                  Include country code
                </span>
              </div>
              <div className='relative'>
                <Smartphone className='absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-500 w-5 h-5' />
                <Input
                  type='tel'
                  value={phoneNumber}
                  onChange={(e) => setPhoneNumber(e.target.value)}
                  placeholder='e.g., +2348100000000 or +447123456789'
                  className='pl-12 h-12 bg-white/5 border-white/10 text-white placeholder-gray-500 rounded-xl focus:border-emerald-500/50 focus:bg-white/10'
                />
              </div>
              <p className='text-xs text-gray-500 mt-1'>
                Enter your phone number with country code for payment
                confirmation
              </p>
            </div>

            <div className='p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/30'>
              <div className='flex items-start gap-3'>
                <Shield className='w-5 h-5 text-emerald-400 flex-shrink-0 mt-0.5' />
                <div>
                  <p className='text-emerald-400 font-medium mb-1'>
                    Secure Payment
                  </p>
                  <p className='text-gray-400 text-sm'>
                    Your payment is processed securely through our trusted
                    payment partners
                  </p>
                </div>
              </div>
            </div>

            <div className='flex gap-3'>
              <Button
                variant='outline'
                onClick={() => setIsDepositDialogOpen(false)}
                className='flex-1 border-white/20 text-gray-400 hover:text-white hover:bg-white/10 rounded-xl'
              >
                Cancel
              </Button>
              <Button
                onClick={handleDeposit}
                disabled={!amount || !phoneNumber || depositMutation.isPending}
                className='flex-1 bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-600 hover:to-teal-600 font-bold rounded-xl'
              >
                {depositMutation.isPending ? (
                  <>
                    <Loader2 className='mr-2 h-4 w-4 animate-spin' />
                    Processing...
                  </>
                ) : (
                  <>
                    Add Money
                    <ArrowRight className='ml-2 w-4 h-4' />
                  </>
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
            // Reset all withdrawal form states when dialog closes
            setAmount('');
            setAccountNumber('');
            setAccountName('');
            setBankCode('');
            setSelectedBankName('');
            setBankSearch('');
            setShowBankDropdown(false);
            setIsAccountVerified(false);
          }
        }}
      >
        <DialogContent className='bg-black/95 backdrop-blur-xl border-white/10 text-white w-[95vw] max-w-lg max-h-[90vh] overflow-y-auto mx-2 sm:mx-auto'>
          <DialogHeader>
            <DialogTitle className='text-xl sm:text-2xl font-bold bg-gradient-to-r from-pink-400 to-violet-400 bg-clip-text text-transparent'>
              Cash Out Your Winnings
            </DialogTitle>
            <DialogDescription className='text-gray-400 text-sm sm:text-base'>
              Withdraw to your bank account
            </DialogDescription>
          </DialogHeader>

          <div className='space-y-4 sm:space-y-6 mt-4'>
            {/* Step 1: Account Number */}
            <div className='space-y-2'>
              <Label className='text-gray-300 text-sm sm:text-base'>
                Account Number
              </Label>
              <div className='relative'>
                <CreditCardIcon className='absolute left-3 sm:left-4 top-1/2 transform -translate-y-1/2 text-gray-500 w-4 h-4 sm:w-5 sm:h-5' />
                <Input
                  type='text'
                  maxLength={10}
                  value={accountNumber}
                  onChange={(e) => {
                    const value = e.target.value.replace(/\D/g, '');
                    setAccountNumber(value);
                    setIsAccountVerified(false);
                    setAccountName('');
                  }}
                  placeholder='Enter 10-digit account number'
                  className='pl-10 sm:pl-12 h-10 sm:h-12 bg-white/5 border-white/10 text-white placeholder-gray-500 rounded-xl focus:border-pink-500/50 focus:bg-white/10 text-sm sm:text-base'
                  autoFocus
                />
              </div>
            </div>

            {/* Step 2: Bank Selection with Search */}
            {accountNumber.length === 10 && (
              <div className='space-y-2'>
                <Label className='text-gray-300 text-sm sm:text-base'>
                  Bank Name
                </Label>
                <div className='relative bank-search-container'>
                  <div className='relative'>
                    <Banknote className='absolute left-3 sm:left-4 top-1/2 transform -translate-y-1/2 text-gray-500 w-4 h-4 sm:w-5 sm:h-5' />
                    <Input
                      type='text'
                      value={selectedBankName || bankSearch}
                      onChange={(e) => {
                        setBankSearch(e.target.value);
                        setSelectedBankName('');
                        setBankCode('');
                        setShowBankDropdown(true);
                        setIsAccountVerified(false);
                        setAccountName('');
                      }}
                      onFocus={() => setShowBankDropdown(true)}
                      placeholder='Start typing your bank name...'
                      className='pl-10 sm:pl-12 pr-3 sm:pr-4 h-10 sm:h-12 bg-white/5 border-white/10 text-white placeholder-gray-500 rounded-xl focus:border-pink-500/50 focus:bg-white/10 text-sm sm:text-base'
                    />
                    {selectedBankName && (
                      <CheckCircle className='absolute right-3 sm:right-4 top-1/2 transform -translate-y-1/2 text-emerald-400 w-4 h-4 sm:w-5 sm:h-5' />
                    )}
                  </div>

                  {/* Dropdown */}
                  {showBankDropdown && (bankSearch || !selectedBankName) && (
                    <div className='absolute z-50 w-full mt-1 sm:mt-2 bg-black/95 backdrop-blur-xl border border-white/10 rounded-xl shadow-2xl max-h-[200px] sm:max-h-[300px] overflow-hidden'>
                      <div className='overflow-y-auto max-h-[200px] sm:max-h-[300px] scrollbar-thin scrollbar-thumb-white/20 scrollbar-track-transparent'>
                        {/* Loading state */}
                        {isBanksLoading && (
                          <div className='p-4 text-center'>
                            <Loader2 className='w-5 h-5 mx-auto text-gray-400 animate-spin' />
                            <p className='text-xs sm:text-sm text-gray-500 mt-2'>
                              Loading banks...
                            </p>
                          </div>
                        )}

                        {/* Bank list */}
                        {!isBanksLoading &&
                          banksData?.data
                            ?.filter((bank: any) => {
                              if (!bankSearch) return true;
                              return bank.name
                                .toLowerCase()
                                .includes(bankSearch.toLowerCase());
                            })
                            .slice(0, 15)
                            .map((bank: any) => (
                              <button
                                key={bank.code}
                                type='button'
                                onClick={() => {
                                  setBankCode(bank.code);
                                  setSelectedBankName(bank.name);
                                  setBankSearch('');
                                  setShowBankDropdown(false);

                                  // Auto-verify when bank is selected
                                  if (
                                    bank.code &&
                                    accountNumber.length === 10
                                  ) {
                                    verifyAccountMutation.mutate(
                                      { accountNumber, bankCode: bank.code },
                                      {
                                        onSuccess: (res) => {
                                          if (
                                            res?.data &&
                                            res.data.accountName
                                          ) {
                                            setAccountName(
                                              res.data.accountName
                                            );
                                            setIsAccountVerified(true);
                                          } else {
                                            setAccountName('');
                                            setIsAccountVerified(false);
                                            toast.error(
                                              'Could not verify account. Check details!'
                                            );
                                          }
                                        },
                                        onError: () => {
                                          setAccountName('');
                                          setIsAccountVerified(false);
                                          toast.error(
                                            'Verification failed. Try again!'
                                          );
                                        },
                                      }
                                    );
                                  }
                                }}
                                className='w-full px-3 sm:px-4 py-2.5 sm:py-3 text-left text-white hover:bg-gradient-to-r hover:from-pink-500/10 hover:to-violet-500/10 transition-all flex items-center gap-2 sm:gap-3 group'
                              >
                                <div className='w-8 h-8 sm:w-10 sm:h-10 rounded-lg bg-white/5 group-hover:bg-white/10 flex items-center justify-center flex-shrink-0'>
                                  <Banknote className='w-4 h-4 sm:w-5 sm:h-5 text-gray-400 group-hover:text-pink-400' />
                                </div>
                                <span className='text-sm sm:text-base truncate'>
                                  {bank.name}
                                </span>
                              </button>
                            ))}

                        {/* No results */}
                        {!isBanksLoading &&
                          banksData?.data?.filter((bank: any) =>
                            bank.name
                              .toLowerCase()
                              .includes(bankSearch.toLowerCase())
                          ).length === 0 && (
                            <div className='p-4 text-center'>
                              <AlertCircle className='w-5 h-5 sm:w-6 sm:h-6 mx-auto text-amber-400 mb-2' />
                              <p className='text-xs sm:text-sm text-gray-400'>
                                No banks found
                              </p>
                              <p className='text-xs text-gray-500 mt-1'>
                                Try a different search
                              </p>
                            </div>
                          )}
                      </div>
                    </div>
                  )}
                </div>

                {/* Verification Status */}
                {verifyAccountMutation.isPending && (
                  <div className='p-3 rounded-xl bg-violet-500/10 border border-violet-500/30'>
                    <div className='flex items-center gap-2'>
                      <Loader2 className='w-4 h-4 text-violet-400 animate-spin' />
                      <span className='text-violet-400'>
                        Verifying account...
                      </span>
                    </div>
                  </div>
                )}

                {isAccountVerified && accountName && (
                  <div className='p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/30'>
                    <div className='flex items-center gap-2'>
                      <CheckCircle className='w-4 h-4 text-emerald-400' />
                      <span className='text-emerald-400 font-medium'>
                        {accountName}
                      </span>
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Step 3: Amount Input */}
            {isAccountVerified && (
              <div className='space-y-2'>
                <Label className='text-gray-300 text-sm sm:text-base'>
                  Amount (₦)
                </Label>
                <div className='relative'>
                  <Banknote className='absolute left-3 sm:left-4 top-1/2 transform -translate-y-1/2 text-gray-500 w-4 h-4 sm:w-5 sm:h-5' />
                  <Input
                    type='number'
                    min='1000'
                    max={balance}
                    value={amount}
                    onChange={(e) => setAmount(e.target.value)}
                    placeholder='Enter amount (min. ₦1,000)'
                    className='pl-10 sm:pl-12 h-10 sm:h-12 bg-white/5 border-white/10 text-white placeholder-gray-500 rounded-xl focus:border-pink-500/50 focus:bg-white/10 text-sm sm:text-base'
                    autoFocus
                  />
                </div>
                <div className='flex items-center justify-between text-xs sm:text-sm'>
                  <span className='text-gray-500'>Available balance:</span>
                  <span className='text-white font-medium'>
                    ₦{balance.toLocaleString()}
                  </span>
                </div>

                {/* Quick amount buttons */}
                <div className='grid grid-cols-2 sm:flex gap-2 mt-2'>
                  {[1000, 5000, 10000, 20000].map((quickAmount) => (
                    <Button
                      key={quickAmount}
                      variant='outline'
                      size='sm'
                      onClick={() => setAmount(quickAmount.toString())}
                      disabled={quickAmount > balance}
                      className='border-white/20 text-white hover:bg-white/10 rounded-lg text-xs sm:text-sm py-2'
                    >
                      ₦
                      {quickAmount >= 1000
                        ? `${quickAmount / 1000}k`
                        : quickAmount}
                    </Button>
                  ))}
                </div>
              </div>
            )}

            {/* Withdrawal Fee Breakdown */}
            {isAccountVerified && amount && parseInt(amount) >= 1000 && (
              <div className='space-y-3'>
                {isCalcLoading ? (
                  <div className='p-3 sm:p-4 rounded-xl bg-violet-500/10 border border-violet-500/30'>
                    <div className='flex items-center gap-2'>
                      <Loader2 className='w-4 h-4 text-violet-400 animate-spin' />
                      <span className='text-violet-400 text-sm'>
                        Calculating fees...
                      </span>
                    </div>
                  </div>
                ) : withdrawalCalc?.data ? (
                  <>
                    <div className='p-3 sm:p-4 rounded-xl bg-gradient-to-r from-violet-500/10 to-pink-500/10 border border-violet-500/30'>
                      <div className='space-y-3'>
                        <div className='flex items-center justify-between text-sm'>
                          <span className='text-gray-400'>Amount:</span>
                          <span className='text-white font-medium'>
                            ₦
                            {withdrawalCalc.data.requestedAmount.toLocaleString()}
                          </span>
                        </div>
                        <div className='flex items-center justify-between text-sm'>
                          <span className='text-gray-400'>
                            Platform Fee (
                            {withdrawalCalc.data.platformFeePercentage}%):
                          </span>
                          <span className='text-pink-400'>
                            -₦{withdrawalCalc.data.platformFee.toLocaleString()}
                          </span>
                        </div>
                        <div className='flex items-center justify-between text-sm'>
                          <span className='text-gray-400'>Transfer Fee:</span>
                          <span className='text-pink-400'>
                            -₦{withdrawalCalc.data.transferFee.toLocaleString()}
                          </span>
                        </div>
                        <div className='h-px bg-white/10' />
                        <div className='flex items-center justify-between'>
                          <span className='text-gray-300 font-medium'>
                            You&apos;ll Receive:
                          </span>
                          <span className='text-emerald-400 font-bold text-lg'>
                            ₦{withdrawalCalc.data.netAmount.toLocaleString()}
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Insufficient balance warning */}
                    {!withdrawalCalc.data.canWithdraw && (
                      <div className='p-3 rounded-xl bg-red-500/10 border border-red-500/30'>
                        <div className='flex items-start gap-2'>
                          <XCircle className='w-4 h-4 text-red-400 flex-shrink-0 mt-0.5' />
                          <div className='text-sm'>
                            <p className='text-red-400 font-medium'>
                              Insufficient Balance
                            </p>
                            <p className='text-gray-400 text-xs mt-1'>
                              You need ₦
                              {withdrawalCalc.data.totalDebit.toLocaleString()}{' '}
                              but your balance is ₦{balance.toLocaleString()}
                            </p>
                          </div>
                        </div>
                      </div>
                    )}
                  </>
                ) : null}
              </div>
            )}

            {/* Processing Time Info */}
            <div className='p-3 sm:p-4 rounded-xl bg-amber-500/10 border border-amber-500/30'>
              <div className='flex items-start gap-2 sm:gap-3'>
                <AlertCircle className='w-4 h-4 sm:w-5 sm:h-5 text-amber-400 flex-shrink-0 mt-0.5' />
                <div>
                  <p className='text-amber-400 font-medium mb-1 text-sm sm:text-base'>
                    Processing Time
                  </p>
                  <p className='text-gray-400 text-xs sm:text-sm'>
                    Withdrawals typically process within 24 hours
                  </p>
                </div>
              </div>
            </div>

            {/* Action Buttons */}
            <div className='flex gap-2 sm:gap-3'>
              <Button
                variant='outline'
                onClick={() => {
                  setIsWithdrawDialogOpen(false);
                  // Reset form
                  setAmount('');
                  setAccountNumber('');
                  setAccountName('');
                  setBankCode('');
                  setIsAccountVerified(false);
                }}
                className='flex-1 border-white/20 text-gray-400 hover:text-white hover:bg-white/10 rounded-xl text-sm sm:text-base py-2 sm:py-2.5'
              >
                Cancel
              </Button>
              <Button
                onClick={handleWithdraw}
                disabled={
                  !amount ||
                  !accountNumber ||
                  !bankCode ||
                  !isAccountVerified ||
                  parseInt(amount) < 100 ||
                  parseInt(amount) > balance ||
                  (withdrawalCalc?.data && !withdrawalCalc.data.canWithdraw) ||
                  withdrawMutation.isPending
                }
                className='flex-1 bg-gradient-to-r from-pink-500 to-violet-500 hover:from-pink-600 hover:to-violet-600 font-bold rounded-xl disabled:opacity-50 disabled:cursor-not-allowed text-sm sm:text-base py-2 sm:py-2.5'
              >
                {withdrawMutation.isPending ? (
                  <>
                    <Loader2 className='mr-2 h-4 w-4 animate-spin' />
                    Processing...
                  </>
                ) : (
                  <>
                    Cash Out
                    <Send className='ml-2 w-4 h-4' />
                  </>
                )}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
