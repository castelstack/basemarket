'use client';

import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import html2canvas from 'html2canvas';
import {
  Check,
  Copy,
  Download,
  Loader2,
  Share2,
} from 'lucide-react';
import numeral from 'numeral';
import Image from 'next/image';
import { useRef, useState } from 'react';
import { toast } from 'sonner';

interface SharePollDialogProps {
  isOpen: boolean;
  onClose: () => void;
  poll: any;
}

export default function SharePollDialog({
  isOpen,
  onClose,
  poll,
}: SharePollDialogProps) {
  const [isCopied, setIsCopied] = useState(false);
  const [isCapturing, setIsCapturing] = useState(false);
  const pollCardRef = useRef<HTMLDivElement>(null);

  const pollUrl =
    typeof window !== 'undefined'
      ? `${window.location.origin}/polls/${poll.id}`
      : '';

  const handleCopyLink = async () => {
    try {
      await navigator.clipboard.writeText(pollUrl);
      setIsCopied(true);
      toast.success('Link copied!');
      setTimeout(() => setIsCopied(false), 2000);

      import('@/lib/analytics').then(({ trackPollShared }) => {
        trackPollShared(poll.id, 'link');
      });
    } catch (error) {
      toast.error('Failed to copy link');
    }
  };

  const handleCaptureAndDownload = async () => {
    if (!pollCardRef.current) return;

    setIsCapturing(true);
    try {
      const canvas = await html2canvas(pollCardRef.current, {
        backgroundColor: '#000000',
        scale: 2,
        logging: false,
        useCORS: true,
        allowTaint: true,
        removeContainer: false,
      });

      const croppedCanvas = document.createElement('canvas');
      const ctx = croppedCanvas.getContext('2d');
      croppedCanvas.width = canvas.width;
      croppedCanvas.height = canvas.height;
      ctx?.drawImage(canvas, 0, 0);

      const image = croppedCanvas.toDataURL('image/png');
      const link = document.createElement('a');
      link.href = image;
      link.download = `poll-${poll.id}.png`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);

      toast.success('Image downloaded!');
    } catch (error) {
      console.error('Error capturing poll card:', error);
      toast.error('Failed to download image');
    } finally {
      setIsCapturing(false);
    }
  };

  const handleNativeShare = async () => {
    const text = `${poll.title}\n\n${pollUrl}`;

    if (navigator.share) {
      try {
        await navigator.share({ text });
        import('@/lib/analytics').then(({ trackPollShared }) => {
          trackPollShared(poll.id, 'native');
        });
      } catch {
        // User cancelled
      }
    } else {
      await navigator.clipboard.writeText(text);
      toast.success('Copied to clipboard!');
    }
  };

  const totalAmount = poll.statistics?.totalAmount || poll.totalStakeAmount || 0;
  const totalParticipants = poll.statistics?.totalParticipants || poll.totalParticipants || 0;

  const formatNumber = (num: number) => {
    if (num >= 1000000) return numeral(num).format('0.0a').toUpperCase();
    if (num >= 1000) return numeral(num).format('0.0a');
    return numeral(num).format('0,0.00');
  };

  // Get sorted options with percentages
  const sortedOptions = poll.options
    ?.map((option: any) => {
      const optionStat = poll.statistics?.options?.find((o: any) => o.id === option.id);
      return {
        ...option,
        percentage: optionStat?.percentage || 0,
      };
    })
    .sort((a: any, b: any) => b.percentage - a.percentage)
    .slice(0, 3) || [];

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="bg-[#0A0A0A] border-[#1F1F1F] text-[#EDEDED] max-w-sm mx-4">
        <DialogHeader>
          <DialogTitle className="text-lg font-semibold text-[#EDEDED]">
            Share Poll
          </DialogTitle>
          <DialogDescription className="text-[#9A9A9A] text-sm font-light">
            Share this poll with others
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 mt-2">
          {/* Hidden Poll Card for Capture */}
          <div style={{ position: 'absolute', left: '-9999px', top: '-9999px' }}>
            <div
              ref={pollCardRef}
              style={{
                width: '480px',
                background: '#000000',
                fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
                position: 'relative',
                overflow: 'hidden',
              }}
            >
              {/* Background decorative elements */}
              <div style={{
                position: 'absolute',
                top: '0',
                left: '0',
                right: '0',
                bottom: '0',
                pointerEvents: 'none',
              }}>
                {/* Grid lines */}
                <div style={{
                  position: 'absolute',
                  top: '0',
                  left: '50%',
                  width: '1px',
                  height: '100%',
                  background: 'linear-gradient(to bottom, transparent, #1F1F1F 20%, #1F1F1F 80%, transparent)',
                  opacity: '0.5',
                }} />
                <div style={{
                  position: 'absolute',
                  top: '50%',
                  left: '0',
                  width: '100%',
                  height: '1px',
                  background: 'linear-gradient(to right, transparent, #1F1F1F 20%, #1F1F1F 80%, transparent)',
                  opacity: '0.5',
                }} />
                {/* Corner accents */}
                <div style={{
                  position: 'absolute',
                  top: '24px',
                  left: '24px',
                  width: '40px',
                  height: '40px',
                  borderTop: '1px solid #1F1F1F',
                  borderLeft: '1px solid #1F1F1F',
                  opacity: '0.6',
                }} />
                <div style={{
                  position: 'absolute',
                  top: '24px',
                  right: '24px',
                  width: '40px',
                  height: '40px',
                  borderTop: '1px solid #1F1F1F',
                  borderRight: '1px solid #1F1F1F',
                  opacity: '0.6',
                }} />
                <div style={{
                  position: 'absolute',
                  bottom: '24px',
                  left: '24px',
                  width: '40px',
                  height: '40px',
                  borderBottom: '1px solid #1F1F1F',
                  borderLeft: '1px solid #1F1F1F',
                  opacity: '0.6',
                }} />
                <div style={{
                  position: 'absolute',
                  bottom: '24px',
                  right: '24px',
                  width: '40px',
                  height: '40px',
                  borderBottom: '1px solid #1F1F1F',
                  borderRight: '1px solid #1F1F1F',
                  opacity: '0.6',
                }} />
                {/* Radial glow */}
                <div style={{
                  position: 'absolute',
                  top: '50%',
                  left: '50%',
                  transform: 'translate(-50%, -50%)',
                  width: '300px',
                  height: '300px',
                  background: 'radial-gradient(circle, rgba(34,211,211,0.03) 0%, transparent 70%)',
                  borderRadius: '50%',
                }} />
              </div>
              <table style={{ width: '100%', borderCollapse: 'collapse', position: 'relative', zIndex: '1' }}>
                <tbody>
                  {/* Spacer */}
                  <tr><td style={{ height: '32px' }}></td></tr>

                  {/* Logo */}
                  <tr>
                    <td style={{ textAlign: 'center' }}>
                      <table style={{ margin: '0 auto', borderCollapse: 'collapse' }}>
                        <tbody>
                          <tr>
                            <td style={{ textAlign: 'center' }}>
                              <img
                                src="https://res.cloudinary.com/dnvsfxlan/image/upload/v1754824130/Group_1000001891_2_tybmb9.svg"
                                alt="Logo"
                                style={{ width: '36px', height: '36px', display: 'block', margin: '0 auto' }}
                              />
                            </td>
                          </tr>
                        </tbody>
                      </table>
                    </td>
                  </tr>

                  {/* Spacer */}
                  <tr><td style={{ height: '20px' }}></td></tr>

                  {/* Title */}
                  <tr>
                    <td
                      style={{
                        fontSize: '22px',
                        fontWeight: '600',
                        color: '#EDEDED',
                        textAlign: 'center',
                        lineHeight: '1.4',
                      }}
                    >
                      {poll.title}
                    </td>
                  </tr>

                  {/* Spacer */}
                  <tr><td style={{ height: '24px' }}></td></tr>

                  {/* Stats */}
                  <tr>
                    <td style={{ textAlign: 'center' }}>
                      <span style={{ color: '#9A9A9A', fontSize: '13px' }}>
                        {formatNumber(totalAmount)} USDC pool
                      </span>
                      <span style={{ color: '#9A9A9A', fontSize: '13px', marginLeft: '20px' }}>
                        {totalParticipants} players
                      </span>
                    </td>
                  </tr>

                  {/* Spacer */}
                  <tr><td style={{ height: '28px' }}></td></tr>

                  {/* Options */}
                  {sortedOptions.map((option: any, index: number) => (
                    <tr key={option.id}>
                      <td>
                        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                          <tbody>
                            <tr>
                              <td style={{ width: '32px' }}></td>
                              <td style={{ color: '#9A9A9A', fontSize: '13px', width: '24px' }}>
                                {index + 1}.
                              </td>
                              <td style={{ color: '#EDEDED', fontSize: '14px' }}>
                                {option.text}
                              </td>
                              <td style={{ color: '#22D3D3', fontSize: '14px', fontWeight: '600', textAlign: 'right' }}>
                                {option.percentage.toFixed(1)}%
                              </td>
                              <td style={{ width: '32px' }}></td>
                            </tr>
                            <tr><td colSpan={5} style={{ height: '12px' }}></td></tr>
                          </tbody>
                        </table>
                      </td>
                    </tr>
                  ))}

                  {poll.options && poll.options.length > 3 && (
                    <tr>
                      <td style={{ textAlign: 'center', color: '#9A9A9A', fontSize: '12px' }}>
                        +{poll.options.length - 3} more options
                      </td>
                    </tr>
                  )}

                  {/* Spacer */}
                  <tr><td style={{ height: '28px' }}></td></tr>

                  {/* Footer */}
                  <tr>
                    <td style={{ textAlign: 'center', color: '#9A9A9A', fontSize: '12px' }}>
                      showstakr.com
                    </td>
                  </tr>

                  {/* Spacer */}
                  <tr><td style={{ height: '32px' }}></td></tr>
                </tbody>
              </table>
            </div>
          </div>

          {/* Preview Card */}
          <div className="p-4 rounded-xl bg-[#151515] border border-[#1F1F1F]">
            <p className="text-sm text-[#EDEDED] font-medium line-clamp-2 mb-3">
              {poll.title}
            </p>
            <div className="flex items-center gap-4 text-xs text-[#9A9A9A]">
              <span className="inline-flex items-center gap-1">
                <Image src="/usdc.svg" alt="USDC" width={12} height={12} />
                {formatNumber(totalAmount)}
              </span>
              <span>{totalParticipants} players</span>
            </div>
          </div>

          {/* URL Copy */}
          <div className="flex gap-2">
            <Input
              value={pollUrl}
              readOnly
              className="h-10 bg-[#151515] border-[#1F1F1F] text-[#9A9A9A] text-sm rounded-xl"
            />
            <Button
              onClick={handleCopyLink}
              variant="outline"
              className="h-10 px-3 border-[#1F1F1F] text-[#9A9A9A] hover:text-[#EDEDED] hover:bg-[#151515] rounded-xl"
            >
              {isCopied ? (
                <Check className="w-4 h-4 text-emerald-400" />
              ) : (
                <Copy className="w-4 h-4" />
              )}
            </Button>
          </div>

          {/* Action Buttons */}
          <div className="flex gap-2">
            <Button
              onClick={handleNativeShare}
              className="flex-1 h-11 bg-[#EDEDED] hover:bg-[#D8D8D8] text-[#0A0A0A] font-medium rounded-full"
            >
              <Share2 className="w-4 h-4 mr-2" />
              Share
            </Button>
            <Button
              onClick={handleCaptureAndDownload}
              disabled={isCapturing}
              variant="outline"
              className="h-11 px-4 border-[#1F1F1F] text-[#D8D8D8] hover:text-[#EDEDED] hover:bg-[#151515] rounded-xl"
            >
              {isCapturing ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <Download className="w-4 h-4" />
              )}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
