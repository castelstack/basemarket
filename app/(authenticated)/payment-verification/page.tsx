'use client';

import { useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useVerifyPayment, useWalletBalance } from '@/lib/wallet';
import { useAuthStore } from '@/stores/authStore';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import {
  CheckCircle,
  XCircle,
  Clock,
  Loader2,
  ArrowRight,
  AlertCircle,
  Home,
  Wallet,
  RefreshCw,
  Sparkles,
  Trophy,
  Zap,
  PartyPopper,
} from 'lucide-react';
import { toast } from 'sonner';
import Link from 'next/link';

export default function PaymentVerificationPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { updateBalance } = useAuthStore();
  const { refetch: refetchBalance } = useWalletBalance();
  
  // Get query parameters
  const status = searchParams.get('status');
  const txRef = searchParams.get('tx_ref');
  const transactionId = searchParams.get('transaction_id');
  
  const [verificationStatus, setVerificationStatus] = useState<'loading' | 'success' | 'failed' | 'pending'>('loading');
  const [verificationMessage, setVerificationMessage] = useState('');
  const [transactionAmount, setTransactionAmount] = useState<number>(0);
  
  const verifyPaymentMutation = useVerifyPayment();

  useEffect(() => {
    // Only verify if we have the necessary parameters
    if (txRef && status) {
      verifyTransaction();
    } else {
      setVerificationStatus('failed');
      setVerificationMessage('Invalid payment verification link');
    }
  }, [txRef, status]);

  const verifyTransaction = async () => {
    setVerificationStatus('loading');
    
    // Use the tx_ref as the reference for verification
    verifyPaymentMutation.mutate(txRef!, {
      onSuccess: (response) => {
        const transaction = response?.data;
        
        // Check the transaction status from the API response
        if (transaction?.status === 'completed') {
          setVerificationStatus('success');
          setVerificationMessage('Payment verified successfully!');
          setTransactionAmount(transaction?.amount || 0);
          
          // Refetch balance to update the user's wallet
          refetchBalance().then((result) => {
            if (result.data?.data?.totalBalance) {
              updateBalance(result.data.data.totalBalance);
            }
          });
          
          toast.success('Deposit successful! Your balance has been updated 🎉');
        } else if (transaction?.status === 'pending') {
          setVerificationStatus('pending');
          setVerificationMessage('Your payment is being processed. Please check back later.');
        } else if (transaction?.status === 'failed') {
          setVerificationStatus('failed');
          setVerificationMessage('Payment failed. If money was deducted, it will be refunded within 24 hours.');
        } else {
          // Unknown status
          setVerificationStatus('failed');
          setVerificationMessage('Unable to verify payment status. Please contact support.');
        }
      },
      onError: (error: any) => {
        // If verification fails, check the query parameter status as fallback
        if (status === 'completed') {
          // Payment might already be verified
          setVerificationStatus('success');
          setVerificationMessage('Payment processing completed!');
          refetchBalance();
        } else if (status === 'pending') {
          setVerificationStatus('pending');
          setVerificationMessage('Your payment is still being processed.');
        } else {
          setVerificationStatus('failed');
          setVerificationMessage(error?.response?.data?.message || error?.message || 'Payment verification failed');
        }
      },
    });
  };

  const handleRetry = () => {
    verifyTransaction();
  };

  const getStatusIcon = () => {
    switch (verificationStatus) {
      case 'success':
        return <CheckCircle className="w-16 h-16 text-emerald-400" />;
      case 'failed':
        return <XCircle className="w-16 h-16 text-red-400" />;
      case 'pending':
        return <Clock className="w-16 h-16 text-amber-400" />;
      default:
        return <Loader2 className="w-16 h-16 text-violet-400 animate-spin" />;
    }
  };

  const getStatusGradient = () => {
    switch (verificationStatus) {
      case 'success':
        return 'from-emerald-500 to-teal-500';
      case 'failed':
        return 'from-red-500 to-pink-500';
      case 'pending':
        return 'from-amber-500 to-orange-500';
      default:
        return 'from-violet-500 to-purple-500';
    }
  };

  return (
    <div className="min-h-screen bg-black flex items-center justify-center p-4 relative overflow-hidden">
      {/* Background Effects */}
      <div className="absolute inset-0">
        <div className="absolute inset-0 bg-gradient-to-br from-violet-950/30 via-black to-emerald-950/30" />
        <div className="absolute top-1/4 right-1/4 w-96 h-96 bg-emerald-500/10 rounded-full blur-3xl animate-pulse" />
        <div className="absolute bottom-1/4 left-1/4 w-96 h-96 bg-violet-500/10 rounded-full blur-3xl animate-pulse delay-1000" />
      </div>

      <div className="relative z-10 w-full max-w-md">
        <Card className="bg-white/5 backdrop-blur-xl border-white/10 shadow-2xl">
          <CardHeader className="text-center pb-6">
            <div className="mb-6 inline-flex items-center justify-center">
              <div className={`p-6 rounded-3xl bg-gradient-to-br ${getStatusGradient()} bg-opacity-20`}>
                {getStatusIcon()}
              </div>
            </div>
            <CardTitle className="text-3xl font-black mb-2">
              <span className={`bg-gradient-to-r ${getStatusGradient()} bg-clip-text text-transparent`}>
                {verificationStatus === 'loading' && 'Verifying Payment'}
                {verificationStatus === 'success' && 'Payment Successful!'}
                {verificationStatus === 'failed' && 'Payment Failed'}
                {verificationStatus === 'pending' && 'Payment Pending'}
              </span>
            </CardTitle>
            <CardDescription className="text-gray-400 text-lg">
              {verificationMessage}
            </CardDescription>
          </CardHeader>

          <CardContent className="space-y-6">
            {/* Transaction Details */}
            {(txRef || transactionId) && (
              <div className="p-4 rounded-xl bg-white/5 border border-white/10 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-gray-500 text-sm">Reference</span>
                  <span className="text-white font-mono text-xs">{txRef || 'N/A'}</span>
                </div>
                {transactionId && (
                  <div className="flex items-center justify-between">
                    <span className="text-gray-500 text-sm">Transaction ID</span>
                    <span className="text-white font-mono text-xs">{transactionId}</span>
                  </div>
                )}
                {transactionAmount > 0 && verificationStatus === 'success' && (
                  <div className="flex items-center justify-between pt-2 border-t border-white/10">
                    <span className="text-gray-400 text-sm">Amount</span>
                    <span className="text-emerald-400 font-bold text-lg">
                      ₦{transactionAmount.toLocaleString()}
                    </span>
                  </div>
                )}
              </div>
            )}

            {/* Success Animation */}
            {verificationStatus === 'success' && (
              <div className="p-4 rounded-xl bg-gradient-to-r from-emerald-500/10 to-teal-500/10 border border-emerald-500/30">
                <div className="flex items-center gap-3">
                  <PartyPopper className="w-6 h-6 text-emerald-400 flex-shrink-0" />
                  <div>
                    <p className="text-emerald-400 font-bold mb-1">Funds Added!</p>
                    <p className="text-gray-300 text-sm">
                      Your deposit has been credited to your wallet. Time to make some winning predictions!
                    </p>
                  </div>
                </div>
              </div>
            )}

            {/* Failed Info */}
            {verificationStatus === 'failed' && (
              <div className="p-4 rounded-xl bg-gradient-to-r from-red-500/10 to-pink-500/10 border border-red-500/30">
                <div className="flex items-center gap-3">
                  <AlertCircle className="w-6 h-6 text-red-400 flex-shrink-0" />
                  <div>
                    <p className="text-red-400 font-bold mb-1">Payment Issue</p>
                    <p className="text-gray-300 text-sm">
                      If money was deducted from your account, it will be refunded within 24 hours.
                    </p>
                  </div>
                </div>
              </div>
            )}

            {/* Pending Info */}
            {verificationStatus === 'pending' && (
              <div className="p-4 rounded-xl bg-gradient-to-r from-amber-500/10 to-orange-500/10 border border-amber-500/30">
                <div className="flex items-center gap-3">
                  <Clock className="w-6 h-6 text-amber-400 flex-shrink-0" />
                  <div>
                    <p className="text-amber-400 font-bold mb-1">Processing Payment</p>
                    <p className="text-gray-300 text-sm">
                      Your payment is being processed. This usually takes a few minutes.
                    </p>
                  </div>
                </div>
              </div>
            )}

            {/* Action Buttons */}
            <div className="flex gap-3">
              {verificationStatus === 'success' ? (
                <>
                  <Link href="/wallet" className="flex-1">
                    <Button className="w-full rounded-xl bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-600 hover:to-teal-600 font-bold">
                      <Wallet className="w-4 h-4 mr-2" />
                      View Wallet
                    </Button>
                  </Link>
                  <Link href="/polls" className="flex-1">
                    <Button
                      variant="outline"
                      className="w-full rounded-xl border-white/20 text-white hover:bg-white/10"
                    >
                      <Zap className="w-4 h-4 mr-2" />
                      Start Predicting
                    </Button>
                  </Link>
                </>
              ) : verificationStatus === 'failed' ? (
                <>
                  <Button
                    onClick={handleRetry}
                    variant="outline"
                    disabled={verifyPaymentMutation.isPending}
                    className="flex-1 rounded-xl border-white/20 text-white hover:bg-white/10"
                  >
                    {verifyPaymentMutation.isPending ? (
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    ) : (
                      <RefreshCw className="w-4 h-4 mr-2" />
                    )}
                    Retry
                  </Button>
                  <Link href="/wallet" className="flex-1">
                    <Button className="w-full rounded-xl bg-gradient-to-r from-violet-500 to-pink-500 hover:from-violet-600 hover:to-pink-600 font-bold">
                      <Wallet className="w-4 h-4 mr-2" />
                      Back to Wallet
                    </Button>
                  </Link>
                </>
              ) : verificationStatus === 'pending' ? (
                <>
                  <Button
                    onClick={handleRetry}
                    variant="outline"
                    disabled={verifyPaymentMutation.isPending}
                    className="flex-1 rounded-xl border-white/20 text-white hover:bg-white/10"
                  >
                    {verifyPaymentMutation.isPending ? (
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    ) : (
                      <RefreshCw className="w-4 h-4 mr-2" />
                    )}
                    Check Status
                  </Button>
                  <Link href="/dashboard" className="flex-1">
                    <Button className="w-full rounded-xl bg-gradient-to-r from-violet-500 to-pink-500 hover:from-violet-600 hover:to-pink-600 font-bold">
                      <Home className="w-4 h-4 mr-2" />
                      Dashboard
                    </Button>
                  </Link>
                </>
              ) : (
                <div className="flex items-center justify-center">
                  <Loader2 className="w-6 h-6 text-violet-400 animate-spin" />
                  <span className="ml-3 text-gray-400">Verifying payment...</span>
                </div>
              )}
            </div>

            {/* Support Link */}
            <div className="text-center pt-4 border-t border-white/10">
              <p className="text-gray-500 text-sm">
                Need help?{' '}
                <a
                  href="mailto:support@showstakr.com"
                  className="text-violet-400 hover:text-violet-300 transition-colors"
                >
                  Contact Support
                </a>
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Success Celebration Effect */}
        {verificationStatus === 'success' && (
          <div className="absolute inset-0 pointer-events-none">
            <div className="absolute top-10 left-10 animate-bounce">
              <Sparkles className="w-8 h-8 text-emerald-400" />
            </div>
            <div className="absolute top-20 right-20 animate-bounce delay-100">
              <Trophy className="w-6 h-6 text-amber-400" />
            </div>
            <div className="absolute bottom-20 left-20 animate-bounce delay-200">
              <Zap className="w-7 h-7 text-violet-400" />
            </div>
            <div className="absolute bottom-10 right-10 animate-bounce delay-300">
              <PartyPopper className="w-8 h-8 text-pink-400" />
            </div>
          </div>
        )}
      </div>
    </div>
  );
}