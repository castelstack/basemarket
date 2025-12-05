'use client';

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { AlertTriangle, Wallet, ArrowRight } from 'lucide-react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';

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
      <DialogContent className='bg-black/95 backdrop-blur-xl border-white/10 text-white max-w-sm'>
        <DialogHeader className="text-center">
          <div className="mx-auto w-12 h-12 rounded-full bg-amber-500/20 flex items-center justify-center mb-3">
            <AlertTriangle className='w-6 h-6 text-amber-500' />
          </div>
          <DialogTitle className='text-lg font-bold text-white'>
            Insufficient Balance
          </DialogTitle>
          <DialogDescription className='text-gray-400 text-sm'>
            You need more USDC to place this stake
          </DialogDescription>
        </DialogHeader>

        <div className='space-y-4 mt-4'>
          {/* Balance Info */}
          <div className='p-4 rounded-xl bg-white/[0.03] border border-white/[0.06] space-y-3'>
            <div className='flex justify-between items-center'>
              <span className='text-gray-400 text-sm'>Current Balance</span>
              <span className='text-white font-medium inline-flex items-center gap-1'>
                <Image src="/usdc.svg" alt="USDC" width={14} height={14} />
                {currentBalance.toLocaleString()}
              </span>
            </div>
            <div className='flex justify-between items-center'>
              <span className='text-gray-400 text-sm'>Required</span>
              <span className='text-white font-medium inline-flex items-center gap-1'>
                <Image src="/usdc.svg" alt="USDC" width={14} height={14} />
                {requiredAmount.toLocaleString()}
              </span>
            </div>
            <div className='border-t border-white/10 pt-3'>
              <div className='flex justify-between items-center'>
                <span className='text-gray-400 text-sm'>Shortfall</span>
                <span className='text-red-400 font-bold inline-flex items-center gap-1'>
                  <Image src="/usdc.svg" alt="USDC" width={14} height={14} />
                  {shortfall.toLocaleString()}
                </span>
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className='flex gap-2'>
            <Button
              onClick={onClose}
              variant='outline'
              className='flex-1'
            >
              Cancel
            </Button>
            <Button
              onClick={handleDeposit}
              variant='gradient'
              className='flex-1'
            >
              <Wallet className='w-4 h-4 mr-2' />
              Deposit
              <ArrowRight className='w-4 h-4 ml-1' />
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
