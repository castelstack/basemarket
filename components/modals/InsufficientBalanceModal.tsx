'use client';

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { AlertTriangle, CreditCard, X, Wallet, ArrowRight } from 'lucide-react';
import { useRouter } from 'next/navigation';

interface InsufficientBalanceModalProps {
  isOpen: boolean;
  onClose: () => void;
  requiredAmount: number;
  currentBalance: number;
}

export default function InsufficientBalanceModal({
  isOpen,
  onClose,
  requiredAmount,
  currentBalance,
}: InsufficientBalanceModalProps) {
  const router = useRouter();
  const shortfall = requiredAmount - currentBalance;

  const handleDeposit = () => {
    onClose();
    router.push('/wallet?action=deposit');
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className='bg-black/95 backdrop-blur-xl border-white/10 text-white max-w-md'>
        <DialogHeader>
          <DialogTitle className='flex items-center gap-2 text-xl'>
            <AlertTriangle className='w-5 h-5 text-amber-500' />
            <span className='bg-gradient-to-r from-amber-400 to-orange-400 bg-clip-text text-transparent'>
              Insufficient Balance
            </span>
          </DialogTitle>
          <DialogDescription className='text-gray-400 mt-2'>
            You need more funds to place this stake
          </DialogDescription>
        </DialogHeader>

        <div className='space-y-4 mt-6'>
          {/* Balance Info */}
          <div className='p-4 rounded-xl bg-red-500/10 border border-red-500/20'>
            <div className='space-y-3'>
              <div className='flex justify-between items-center'>
                <span className='text-gray-400 text-sm'>Current Balance</span>
                <span className='text-white font-bold'>
                  ₦{currentBalance.toLocaleString()}
                </span>
              </div>
              <div className='flex justify-between items-center'>
                <span className='text-gray-400 text-sm'>Required Amount</span>
                <span className='text-white font-bold'>
                  ₦{requiredAmount.toLocaleString()}
                </span>
              </div>
              <div className='border-t border-white/10 pt-3'>
                <div className='flex justify-between items-center'>
                  <span className='text-gray-400 text-sm'>You need</span>
                  <span className='text-red-400 font-bold text-lg'>
                    ₦{shortfall.toLocaleString()} more
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Quick Info */}
          <div className='p-4 rounded-xl bg-gradient-to-r from-violet-500/10 to-pink-500/10 border border-violet-500/20'>
            <p className='text-sm text-gray-300'>
              <span className='font-semibold text-violet-400'>Pro tip:</span>{' '}
              Deposit at least ₦{Math.ceil(shortfall / 100) * 100} to cover this 
              stake and have some balance left for future predictions!
            </p>
          </div>

          {/* Action Buttons */}
          <div className='flex gap-3 mt-6'>
            <Button
              onClick={onClose}
              variant='outline'
              className='flex-1 rounded-xl border-white/20 text-white hover:bg-white/10'
            >
              <X className='w-4 h-4 mr-2' />
              Cancel
            </Button>
            <Button
              onClick={handleDeposit}
              className='flex-1 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-600 hover:to-teal-600 font-bold'
            >
              <Wallet className='w-4 h-4 mr-2' />
              Deposit Now
              <ArrowRight className='w-4 h-4 ml-1' />
            </Button>
          </div>

          {/* Alternative Actions */}
          <div className='text-center pt-2'>
            <button
              onClick={() => {
                onClose();
                router.push('/polls');
              }}
              className='text-xs text-gray-500 hover:text-gray-400 transition-colors'
            >
              Browse other polls with lower stakes
            </button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}