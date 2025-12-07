'use client';

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { AlertTriangle, Wallet } from 'lucide-react';
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
      <DialogContent className="bg-[#0A0A0A] border-[#1F1F1F] text-[#EDEDED] max-w-sm mx-4">
        <DialogHeader className="text-center">
          <div className="mx-auto w-12 h-12 rounded-full bg-amber-500/15 border border-amber-500/20 flex items-center justify-center mb-3">
            <AlertTriangle className="w-5 h-5 text-amber-400" />
          </div>
          <DialogTitle className="text-lg font-semibold text-[#EDEDED]">
            Insufficient Balance
          </DialogTitle>
          <DialogDescription className="text-[#9A9A9A] text-sm font-light">
            You need more USDC to place this stake
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 mt-2">
          {/* Balance Info */}
          <div className="p-4 rounded-xl bg-[#151515] border border-[#1F1F1F] space-y-3">
            <div className="flex justify-between items-center">
              <span className="text-[#9A9A9A] text-sm">Current Balance</span>
              <span className="text-[#EDEDED] font-medium inline-flex items-center gap-1">
                {currentBalance.toLocaleString()}
                <Image src="/usdc.svg" alt="USDC" width={14} height={14} />
              </span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-[#9A9A9A] text-sm">Required</span>
              <span className="text-[#EDEDED] font-medium inline-flex items-center gap-1">
                {requiredAmount.toLocaleString()}
                <Image src="/usdc.svg" alt="USDC" width={14} height={14} />
              </span>
            </div>
            <div className="border-t border-[#1F1F1F] pt-3">
              <div className="flex justify-between items-center">
                <span className="text-[#9A9A9A] text-sm">Shortfall</span>
                <span className="text-red-400 font-semibold inline-flex items-center gap-1">
                  {shortfall.toLocaleString()}
                  <Image src="/usdc.svg" alt="USDC" width={14} height={14} />
                </span>
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex gap-2">
            <Button
              onClick={onClose}
              variant="outline"
              className="flex-1 h-11 border-[#1F1F1F] text-[#9A9A9A] hover:text-[#EDEDED] hover:bg-[#151515] rounded-xl"
            >
              Cancel
            </Button>
            <Button
              onClick={handleDeposit}
              className="flex-1 h-11 bg-[#EDEDED] hover:bg-[#D8D8D8] text-[#0A0A0A] font-medium rounded-full"
            >
              <Wallet className="w-4 h-4 mr-2" />
              Deposit
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
