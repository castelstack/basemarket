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
import dayjs from 'dayjs';
import html2canvas from 'html2canvas';
import {
  Check,
  Copy,
  Download,
  Loader2,
  MessageCircle,
  Twitter
} from 'lucide-react';
import numeral from 'numeral';
import { useRef, useState } from 'react';
import { toast } from 'sonner';

interface SharePollDialogProps {
  isOpen: boolean;
  onClose: () => void;
  poll: any
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
      toast.success('Link copied to clipboard!');
      setTimeout(() => setIsCopied(false), 2000);
      
      // Track share event
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
      // Capture the element
      const canvas = await html2canvas(pollCardRef.current, {
        backgroundColor: '#0f0f1e',
        scale: 2,
        logging: false,
        useCORS: true,
        allowTaint: true,
        removeContainer: false,
      });

      // Create a new canvas to crop any extra space
      const croppedCanvas = document.createElement('canvas');
      const ctx = croppedCanvas.getContext('2d');

      // Set the cropped canvas size
      croppedCanvas.width = canvas.width;
      croppedCanvas.height = canvas.height;

      // Draw the captured image without any offset
      ctx?.drawImage(canvas, 0, 0);

      const image = croppedCanvas.toDataURL('image/png');

      // Download the image immediately
      const link = document.createElement('a');
      link.href = image;
      link.download = `poll-${poll.id}.png`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);

      toast.success('Poll card downloaded!');
    } catch (error) {
      console.error('Error capturing poll card:', error);
      toast.error('Failed to capture poll card');
    } finally {
      setIsCapturing(false);
    }
  };

  const handleShareTwitter = () => {
    const text = `Check out this poll on ShowStakr: ${poll.title}\n\n${poll.description}`;
    const url = `https://twitter.com/intent/tweet?text=${encodeURIComponent(
      text
    )}&url=${encodeURIComponent(pollUrl)}`;
    window.open(url, '_blank');
    
    // Track share event
    import('@/lib/analytics').then(({ trackPollShared }) => {
      trackPollShared(poll.id, 'twitter');
    });
  };

  const handleShareWhatsApp = () => {
    const text = `Check out this poll on ShowStakr:\n\n*${poll.title}*\n\n${poll.description}\n\n${pollUrl}`;
    const url = `https://wa.me/?text=${encodeURIComponent(text)}`;
    window.open(url, '_blank');
    
    // Track share event
    import('@/lib/analytics').then(({ trackPollShared }) => {
      trackPollShared(poll.id, 'whatsapp');
    });
  };

  // Calculate total amount and participants
  const totalAmount =
    poll.statistics?.totalAmount || poll.totalStakeAmount || 0;
  const totalParticipants =
    poll.statistics?.totalParticipants || poll.totalParticipants || 0;

  const formatNumber = (num: number) => {
    if (num >= 1000000) {
      return numeral(num).format('0.0a').toUpperCase();
    } else if (num >= 1000) {
      return numeral(num).format('0.0a');
    }
    return numeral(num).format('0,0');
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className='bg-black/95 backdrop-blur-xl border-white/10 text-white max-w-2xl max-h-[90vh] overflow-y-auto'>
        <DialogHeader>
          <DialogTitle className='text-xl sm:text-2xl font-bold bg-gradient-to-r from-violet-400 to-pink-400 bg-clip-text text-transparent flex items-center gap-2'>
            Share Poll
          </DialogTitle>
          <DialogDescription className='text-gray-400 text-left'>
            Share this poll with others or download as an image
          </DialogDescription>
        </DialogHeader>

        <div className='space-y-6 mt-4'>
          {/* Hidden Poll Card for Capture */}
          <div
            style={{ position: 'absolute', left: '-9999px', top: '-9999px' }}
          >
            <div
              ref={pollCardRef}
              id='poll-card-capture'
              style={{
                width: '600px',
                background: 'linear-gradient(180deg, #0a0a0f 0%, #0f0f1a 100%)',
                border: '1px solid rgba(255, 255, 255, 0.08)',
                borderRadius: '16px',
                padding: '32px',
                fontFamily:
                  '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif',
                position: 'relative',
                boxShadow:
                  '0 20px 25px -5px rgba(0, 0, 0, 0.5), 0 10px 10px -5px rgba(0, 0, 0, 0.4)',
              }}
            >
              <table
                style={{
                  width: '100%',
                  borderCollapse: 'collapse',
                }}
              >
                {/* Logo and Header Row */}
                <tr>
                  <td
                    colSpan={2}
                    style={{
                      padding: '0 0 24px 0',
                      textAlign: 'center',
                    }}
                  >
                    <div
                      style={{
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: 'center',
                        gap: '8px',
                      }}
                    >
                      <img
                        src='https://res.cloudinary.com/dnvsfxlan/image/upload/v1754824130/Group_1000001891_2_tybmb9.svg'
                        alt='Logo'
                        style={{
                          width: '48px',
                          height: '48px',
                          objectFit: 'contain',
                        }}
                      />
                      <div
                        style={{
                          fontSize: '24px',
                          fontWeight: '800',
                          color: '#ffffff',
                          letterSpacing: '-0.5px',
                        }}
                      >
                        ShowStakr
                      </div>
                    </div>
                  </td>
                </tr>

                {/* Title Row */}
                <tr>
                  <td
                    colSpan={2}
                    style={{
                      fontSize: '32px',
                      fontWeight: '700',
                      color: '#ffffff',
                      padding: '20px 0 12px 0',
                      letterSpacing: '-0.5px',
                    }}
                  >
                    {poll.title}
                  </td>
                </tr>

                {/* Description Row */}
                <tr>
                  <td
                    colSpan={2}
                    style={{
                      color: 'rgba(255, 255, 255, 0.6)',
                      fontSize: '14px',
                      padding: '0 0 24px 0',
                      lineHeight: '1.5',
                    }}
                  >
                    {poll.description}
                  </td>
                </tr>

                {/* Stats Row */}
                <tr>
                  <td
                    style={{
                      width: '50%',
                      padding: '20px',
                      background: 'rgba(255, 255, 255, 0.03)',
                      backdropFilter: 'blur(10px)',
                      border: '1px solid rgba(255, 255, 255, 0.08)',
                      textAlign: 'center',
                      borderRadius: '12px',
                    }}
                  >
                    <div
                      style={{
                        color: 'rgba(255, 255, 255, 0.5)',
                        fontSize: '11px',
                        marginBottom: '6px',
                        fontWeight: '600',
                        letterSpacing: '0.5px',
                      }}
                    >
                      TOTAL POOL
                    </div>
                    <div
                      style={{
                        color: '#10b981',
                        fontWeight: '700',
                        fontSize: '28px',
                      }}
                    >
                      ₦{formatNumber(totalAmount)}
                    </div>
                  </td>
                  <td
                    style={{
                      width: '50%',
                      padding: '20px',
                      background: 'rgba(255, 255, 255, 0.03)',
                      backdropFilter: 'blur(10px)',
                      border: '1px solid rgba(255, 255, 255, 0.08)',
                      textAlign: 'center',
                      borderRadius: '12px',
                    }}
                  >
                    <div
                      style={{
                        color: 'rgba(255, 255, 255, 0.5)',
                        fontSize: '11px',
                        marginBottom: '6px',
                        fontWeight: '600',
                        letterSpacing: '0.5px',
                      }}
                    >
                      PLAYERS
                    </div>
                    <div
                      style={{
                        color: '#a78bfa',
                        fontWeight: '700',
                        fontSize: '28px',
                      }}
                    >
                      {formatNumber(totalParticipants)}
                    </div>
                  </td>
                </tr>

                {/* Spacer Row */}
                <tr>
                  <td colSpan={2} style={{ padding: '10px' }}></td>
                </tr>

                {/* Options Header */}
                {poll.options && poll.options.length > 0 && (
                  <>
                    <tr>
                      <td
                        colSpan={2}
                        style={{
                          color: 'rgba(255, 255, 255, 0.5)',
                          fontSize: '11px',
                          fontWeight: '600',
                          padding: '16px 0 12px 0',
                          letterSpacing: '0.5px',
                        }}
                      >
                        POLL OPTIONS
                      </td>
                    </tr>

                    {/* Options List - sorted by percentage */}
                    {(() => {
                      const sortedOptions = poll.options
                        .map((option: any) => {
                          const optionStat = poll.statistics?.options?.find(
                            (o: any) => o.id === option.id
                          );
                          return {
                            ...option,
                            percentage: optionStat?.percentage || 0,
                          };
                        })
                        .sort((a: any, b: any) => b.percentage - a.percentage)
                        .slice(0, 4);

                      const colors = [
                        '#a78bfa',
                        '#ec4899',
                        '#10b981',
                        '#f59e0b',
                      ];

                      return sortedOptions.map((option: any, index: number) => (
                        <tr key={option.id}>
                          <td colSpan={2} style={{ padding: '0 0 8px 0' }}>
                            <table
                              style={{
                                width: '100%',
                                background: 'rgba(255, 255, 255, 0.02)',
                                border: '1px solid rgba(255, 255, 255, 0.06)',
                                borderRadius: '8px',
                                overflow: 'hidden',
                              }}
                            >
                              <tr>
                                <td
                                  style={{
                                    width: '30px',
                                    padding: '10px',
                                    textAlign: 'center',
                                    backgroundColor: colors[index],
                                    color: '#ffffff',
                                    fontWeight: 'bold',
                                    fontSize: '14px',
                                  }}
                                >
                                  {index + 1}
                                </td>
                                <td
                                  style={{
                                    padding: '10px',
                                    color: '#ffffff',
                                    fontSize: '14px',
                                  }}
                                >
                                  {option.text}
                                </td>
                                <td
                                  style={{
                                    width: '60px',
                                    padding: '10px',
                                    textAlign: 'center',
                                    color: colors[index],
                                    fontWeight: 'bold',
                                    fontSize: '14px',
                                  }}
                                >
                                  {option.percentage.toFixed(1)}%
                                </td>
                              </tr>
                            </table>
                          </td>
                        </tr>
                      ));
                    })()}

                    {poll.options.length > 4 && (
                      <tr>
                        <td
                          colSpan={2}
                          style={{
                            textAlign: 'center',
                            color: '#6b7280',
                            fontSize: '12px',
                            padding: '5px 0',
                          }}
                        >
                          +{poll.options.length - 4} more options
                        </td>
                      </tr>
                    )}
                  </>
                )}

                {/* Footer Section */}
                <tr>
                  <td colSpan={2} style={{ padding: '20px 0 0 0' }}>
                    <table
                      style={{
                        width: '100%',
                        background: 'rgba(0, 0, 0, 0.3)',
                        borderTop: '1px solid rgba(255, 255, 255, 0.08)',
                        marginTop: '8px',
                      }}
                    >
                      <tr>
                        <td
                          style={{
                            padding: '16px',
                            color: 'rgba(255, 255, 255, 0.5)',
                            fontSize: '11px',
                            fontWeight: '500',
                          }}
                        >
                          📅{' '}
                          {dayjs(poll.createdAt).format('MMM D, YYYY • h:mm A')}
                        </td>
                        <td
                          style={{
                            padding: '16px',
                            textAlign: 'right',
                            color: 'rgba(255, 255, 255, 0.5)',
                            fontSize: '11px',
                            fontWeight: '500',
                          }}
                        >
                          Powered by{' '}
                          <span
                            style={{
                              color: '#ffffff',
                              fontWeight: '700',
                            }}
                          >
                            Tournest
                          </span>
                        </td>
                      </tr>
                    </table>
                  </td>
                </tr>
              </table>
            </div>
          </div>

          {/* Share Options */}
          <div className='space-y-4'>
            <div className='flex items-center justify-between'>
              <h3 className='text-sm font-medium text-gray-300'>
                Share Options
              </h3>
              <Button
                size='sm'
                onClick={handleCaptureAndDownload}
                disabled={isCapturing}
                className='bg-gradient-to-r from-violet-500 to-pink-500 hover:from-violet-600 hover:to-pink-600'
              >
                {isCapturing ? (
                  <>
                    <Loader2 className='w-4 h-4 mr-2 animate-spin' />
                    Capturing...
                  </>
                ) : (
                  <>
                    <Download className='w-4 h-4 mr-2' />
                    Download Card
                  </>
                )}
              </Button>
            </div>

            {/* URL Copy */}
            <div className='flex gap-2'>
              <Input
                value={pollUrl}
                readOnly
                className='bg-white/5 border-white/10 text-white rounded-xl'
              />
              <Button
                onClick={handleCopyLink}
                variant='outline'
                className='border-white/20 text-white hover:bg-white/10'
              >
                {isCopied ? (
                  <Check className='w-4 h-4' />
                ) : (
                  <Copy className='w-4 h-4' />
                )}
              </Button>
            </div>

            {/* Social Share Buttons */}
            <div className='grid grid-cols-2 gap-3'>
              <Button
                onClick={handleShareTwitter}
                variant='outline'
                className='border-white/20 text-white hover:bg-white/10'
              >
                <Twitter className='w-4 h-4 mr-2' />
                Share on X
              </Button>
              <Button
                onClick={handleShareWhatsApp}
                variant='outline'
                className='border-white/20 text-white hover:bg-white/10'
              >
                <MessageCircle className='w-4 h-4 mr-2' />
                WhatsApp
              </Button>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
