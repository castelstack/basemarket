'use client';

import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  Rocket,
  Sparkles,
  Target,
  Trophy,
  Zap
} from 'lucide-react';
import { useRouter } from 'next/navigation';

interface BonusEligibilityModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function BonusEligibilityModal({ 
  isOpen, 
  onClose 
}: BonusEligibilityModalProps) {
  const router = useRouter();

  const handleStartPredicting = () => {
    onClose();
    router.push('/polls');
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className='bg-black/95 border border-white/10 text-white max-w-md'>
        <DialogHeader>
          <DialogTitle className='sr-only'>Bonus Status</DialogTitle>
        </DialogHeader>
        
        <div className='flex flex-col items-center text-center py-4'>
          {/* Icon */}
          <div className='relative mb-6'>
            <div className='absolute inset-0 bg-gradient-to-br from-amber-500 to-orange-500 rounded-3xl blur-2xl opacity-50 animate-pulse' />
            <div className='relative w-20 h-20 bg-gradient-to-br from-amber-500 via-orange-500 to-pink-500 rounded-3xl flex items-center justify-center'>
              <Trophy className='w-10 h-10 text-white' />
            </div>
            <div className='absolute -top-2 -right-2 w-8 h-8 bg-black rounded-full flex items-center justify-center border-2 border-amber-500'>
              <Sparkles className='w-4 h-4 text-amber-400' />
            </div>
          </div>

          {/* Main Message */}
          <h2 className='text-2xl sm:text-3xl font-black mb-3'>
            <span className='bg-gradient-to-r from-amber-400 via-orange-400 to-pink-400 bg-clip-text text-transparent'>
              Hold Up Chief! 🫸
            </span>
          </h2>

          <p className='text-gray-300 text-base sm:text-lg mb-2 font-medium'>
            You&apos;re not eligible for the bonus yet, fam!
          </p>

          <p className='text-gray-400 text-sm sm:text-base mb-6 max-w-sm'>
            Keep dropping those fire predictions and stacking your wins. 
            The bag will come when you&apos;re ready! 💯
          </p>

          {/* Progress Indicators */}
          {/* <div className='w-full bg-white/5 rounded-2xl p-4 mb-6 border border-white/10'>
            <div className='flex items-center justify-between mb-3'>
              <span className='text-sm text-gray-400'>We Vibe Check You</span>
            </div>
            
            <div className='space-y-3'>
              <div className='flex items-center gap-3'>
                <Target className='w-4 h-4 text-violet-400' />
                <div className='flex-1'>
                  <div className='h-2 bg-white/10 rounded-full overflow-hidden'>
                    <div className='h-full w-[30%] bg-gradient-to-r from-violet-500 to-pink-500 rounded-full' />
                  </div>
                </div>
                <span className='text-xs text-gray-500'>3/10 Predictions</span>
              </div>

              <div className='flex items-center gap-3'>
                <Zap className='w-4 h-4 text-emerald-400' />
                <div className='flex-1'>
                  <div className='h-2 bg-white/10 rounded-full overflow-hidden'>
                    <div className='h-full w-[15%] bg-gradient-to-r from-emerald-500 to-teal-500 rounded-full' />
                  </div>
                </div>
                <span className='text-xs text-gray-500'>Win Streak: 1</span>
              </div>
            </div>
          </div> */}

          {/* Motivational Tags */}
          <div className='flex flex-wrap gap-2 justify-center mb-6'>
            <div className='px-3 py-1 rounded-full bg-violet-500/10 border border-violet-500/30'>
              <span className='text-xs text-violet-400 font-medium'>🎯 Keep Grinding</span>
            </div>
            <div className='px-3 py-1 rounded-full bg-pink-500/10 border border-pink-500/30'>
              <span className='text-xs text-pink-400 font-medium'>🔥 Stay Locked In</span>
            </div>
            <div className='px-3 py-1 rounded-full bg-amber-500/10 border border-amber-500/30'>
              <span className='text-xs text-amber-400 font-medium'>💪 Chase The Bag</span>
            </div>
          </div>

          {/* CTA Buttons */}
          <div className='flex flex-col sm:flex-row gap-3 w-full'>
            <Button
              onClick={handleStartPredicting}
              className='flex-1 bg-gradient-to-r from-violet-500 to-pink-500 hover:from-violet-600 hover:to-pink-600 text-white font-bold rounded-xl'
            >
              <Rocket className='w-4 h-4 mr-2' />
              Let&apos;s Ball! 🚀
            </Button>
            <Button
              onClick={onClose}
              variant='outline'
              className='flex-1 border-white/20 text-gray-400 hover:text-white hover:bg-white/10 rounded-xl'
            >
              Maybe Later
            </Button>
          </div>

          {/* Bottom Text */}
          <p className='text-xs text-gray-500 mt-4'>
            Pro tip: Winners who predict daily unlock bonuses faster 🎰
          </p>
        </div>
      </DialogContent>
    </Dialog>
  );
}