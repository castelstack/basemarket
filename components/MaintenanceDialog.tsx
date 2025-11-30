'use client';

import { useEffect, useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { AlertTriangle, Clock, Wrench, Zap } from 'lucide-react';
import { Button } from '@/components/ui/button';

export default function MaintenanceDialog() {
  const [isOpen, setIsOpen] = useState(false);
  const [maintenanceMessage, setMaintenanceMessage] = useState('');
  const [estimatedTime, setEstimatedTime] = useState('');

  useEffect(() => {
    // Check if maintenance mode is enabled
    const isMaintenanceMode = process.env.NEXT_PUBLIC_MAINTENANCE_MODE === 'true';
    const message = process.env.NEXT_PUBLIC_MAINTENANCE_MESSAGE || 'We are currently performing scheduled maintenance to improve your experience.';
    const time = process.env.NEXT_PUBLIC_MAINTENANCE_ETA || 'a few hours';

    if (isMaintenanceMode) {
      setIsOpen(true);
      setMaintenanceMessage(message);
      setEstimatedTime(time);
    }
  }, []);

  // Allow closing only in development mode
  const canClose = process.env.NODE_ENV === 'development';

  return (
    <Dialog open={isOpen} onOpenChange={canClose ? setIsOpen : undefined}>
      <DialogContent 
        className='bg-black/95 backdrop-blur-xl border-white/10 text-white max-w-lg sm:mx-auto'
        onPointerDownOutside={(e) => !canClose && e.preventDefault()}
        onEscapeKeyDown={(e) => !canClose && e.preventDefault()}
      >
        <DialogHeader>
          <DialogTitle className='text-xl sm:text-2xl font-bold flex items-center gap-2 sm:gap-3'>
            <div className='p-2 sm:p-3 rounded-full bg-gradient-to-r from-amber-500/20 to-orange-500/20 animate-pulse'>
              <Wrench className='w-5 h-5 sm:w-6 sm:h-6 text-amber-400' />
            </div>
            <span className='bg-gradient-to-r from-amber-400 to-orange-400 bg-clip-text text-transparent text-lg sm:text-2xl'>
              Maintenance Mode
            </span>
          </DialogTitle>
        </DialogHeader>

        <div className='space-y-4 sm:space-y-6 mt-3 sm:mt-4'>
          {/* Animated Icon */}
          <div className='flex justify-center'>
            <div className='relative'>
              <div className='absolute inset-0 bg-gradient-to-r from-violet-500 to-pink-500 rounded-full blur-xl opacity-50 animate-pulse' />
              <div className='relative p-4 sm:p-6 rounded-full bg-gradient-to-r from-violet-500/20 to-pink-500/20 border border-white/10'>
                <AlertTriangle className='w-12 h-12 sm:w-16 sm:h-16 text-amber-400 animate-pulse' />
              </div>
            </div>
          </div>

          {/* Message */}
          <div className='text-center space-y-3 sm:space-y-4 px-2 sm:px-0'>
            <p className='text-gray-300 text-base sm:text-lg leading-relaxed'>
              {maintenanceMessage}
            </p>

            <div className='flex items-center justify-center gap-2 text-xs sm:text-sm text-gray-400'>
              <Clock className='w-3 h-3 sm:w-4 sm:h-4' />
              <span>Estimated downtime: {estimatedTime}</span>
            </div>
          </div>

          {/* Features Being Worked On */}
          <div className='p-3 sm:p-4 rounded-xl bg-gradient-to-r from-violet-500/10 to-pink-500/10 border border-white/10'>
            <div className='flex items-start gap-2 sm:gap-3'>
              <Zap className='w-4 h-4 sm:w-5 sm:h-5 text-violet-400 flex-shrink-0 mt-0.5' />
              <div className='space-y-1 sm:space-y-2'>
                <p className='text-xs sm:text-sm font-semibold text-violet-400'>What we&apos;re working on:</p>
                <ul className='text-xs sm:text-sm text-gray-300 space-y-0.5 sm:space-y-1'>
                  <li>• Performance improvements</li>
                  <li>• New features and enhancements</li>
                  <li>• Security updates</li>
                  <li>• Bug fixes and optimizations</li>
                </ul>
              </div>
            </div>
          </div>

          {/* Status Updates */}
          <div className='text-center space-y-2 sm:space-y-3'>
            <p className='text-xs sm:text-sm text-gray-400'>
              Follow us for updates
            </p>
            <div className='flex justify-center gap-4'>
              <Button
                variant='outline'
                size='sm'
                className='border-white/20 text-gray-300 hover:text-white hover:bg-white/10 text-xs sm:text-sm px-3 sm:px-4 py-1.5 sm:py-2'
                onClick={() => window.open('https://twitter.com/showstakr', '_blank')}
              >
                <svg className='w-3 h-3 sm:w-4 sm:h-4 mr-1.5 sm:mr-2' fill='currentColor' viewBox='0 0 24 24'>
                  <path d='M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z' />
                </svg>
                @showstakr
              </Button>
            </div>
          </div>

          {/* Development Mode Close Button */}
          {canClose && (
            <div className='pt-3 sm:pt-4 border-t border-white/10'>
              <p className='text-xs text-gray-500 text-center mb-2 sm:mb-3'>
                Development mode: You can close this dialog
              </p>
              <Button
                onClick={() => setIsOpen(false)}
                className='w-full bg-gradient-to-r from-violet-500 to-pink-500 hover:from-violet-600 hover:to-pink-600 text-sm sm:text-base py-2 sm:py-2.5'
              >
                Close (Dev Only)
              </Button>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}