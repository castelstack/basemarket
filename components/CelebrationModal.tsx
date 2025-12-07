"use client";

import { Dialog, DialogContent } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Share2, Check } from "lucide-react";
import Image from "next/image";
import confetti from "canvas-confetti";
import { useEffect } from "react";
import { toast } from "sonner";

interface CelebrationModalProps {
  open: boolean;
  onClose: () => void;
  type: "win" | "stake_placed" | "first_prediction" | "win_streak" | "claim";
  pollTitle?: string;
  amount?: number;
  winnings?: number;
  streakCount?: number;
  pollId?: string;
}

const celebrationConfig = {
  win: {
    title: "You Won",
    subtitle: "Your prediction was correct",
  },
  stake_placed: {
    title: "Stake Placed",
    subtitle: "Good luck with your prediction",
  },
  first_prediction: {
    title: "First Prediction",
    subtitle: "Welcome to ShowStakr",
  },
  win_streak: {
    title: "Win Streak",
    subtitle: "You're on fire",
  },
  claim: {
    title: "Claimed",
    subtitle: "Sent to your wallet",
  },
};

const celebrationMessages = {
  win: (pollTitle?: string, winnings?: number) =>
    `Just called it right on "${pollTitle}" and won ${winnings?.toFixed(2)} USDC on @showstakr`,
  stake_placed: (pollTitle?: string, amount?: number) =>
    `I'm putting my money where my mouth is - staked ${amount?.toFixed(2)} USDC on "${pollTitle}" on @showstakr`,
  first_prediction: () =>
    `Made my first prediction on @showstakr! Let's see if I called it right...`,
  win_streak: (streakCount?: number) =>
    `${streakCount} wins in a row on @showstakr - who wants to challenge me?`,
  claim: (winnings?: number) =>
    `Just claimed ${winnings?.toFixed(2)} USDC in winnings from @showstakr`,
};

export function CelebrationModal({
  open,
  onClose,
  type,
  pollTitle,
  amount,
  winnings,
  streakCount,
  pollId,
}: CelebrationModalProps) {
  const config = celebrationConfig[type];
  const displayAmount = winnings || amount;

  // Trigger confetti on open
  useEffect(() => {
    if (open) {
      confetti({
        particleCount: 60,
        spread: 50,
        origin: { y: 0.7 },
        colors: ["#EDEDED", "#D8D8D8", "#9A9A9A"],
        disableForReducedMotion: true,
      });
    }
  }, [open]);

  const handleShare = async () => {
    let message = "";
    if (type === "win") message = celebrationMessages.win(pollTitle, winnings);
    else if (type === "stake_placed") message = celebrationMessages.stake_placed(pollTitle, amount);
    else if (type === "first_prediction") message = celebrationMessages.first_prediction();
    else if (type === "win_streak") message = celebrationMessages.win_streak(streakCount);
    else if (type === "claim") message = celebrationMessages.claim(winnings);

    const appUrl = pollId
      ? `${window.location.origin}/polls/${pollId}`
      : window.location.origin;
    const shareText = `${message}\n\n${appUrl}`;

    if (navigator.share) {
      try {
        await navigator.share({ text: shareText });
        return;
      } catch {
        // Fall through to clipboard
      }
    }

    await navigator.clipboard.writeText(shareText);
    toast.success("Copied to clipboard");
  };

  return (
    <Dialog open={open} onOpenChange={(o) => !o && onClose()}>
      <DialogContent className="bg-[#0A0A0A] border-[#1F1F1F] max-w-[320px] p-0 gap-0 rounded-2xl overflow-hidden">
        {/* Content */}
        <div className="px-6 pt-8 pb-6 text-center">
          {/* Success indicator */}
          <div className="w-12 h-12 rounded-full bg-[#151515] border border-[#1F1F1F] flex items-center justify-center mx-auto mb-5">
            <Check className="w-5 h-5 text-[#EDEDED]" />
          </div>

          {/* Title */}
          <h2 className="text-lg font-medium text-[#EDEDED] mb-1">
            {config.title}
          </h2>
          <p className="text-[#9A9A9A] text-sm font-light">{config.subtitle}</p>

          {/* Amount */}
          {displayAmount && (
            <div className="mt-6 mb-2">
              <p className="text-3xl font-semibold text-[#EDEDED] flex items-center justify-center gap-2">
                <Image src="/usdc.svg" alt="USDC" width={24} height={24} />
                {displayAmount.toFixed(2)}
              </p>
            </div>
          )}

          {/* Win streak */}
          {type === "win_streak" && streakCount && (
            <div className="mt-6 mb-2">
              <p className="text-3xl font-semibold text-[#EDEDED]">
                {streakCount} wins
              </p>
            </div>
          )}

          {/* Poll title */}
          {pollTitle && (
            <p className="text-xs text-[#9A9A9A] mt-4 line-clamp-1 font-light">
              {pollTitle}
            </p>
          )}
        </div>

        {/* Actions */}
        <div className="px-6 pb-6 space-y-2">
          <Button
            onClick={handleShare}
            className="w-full h-11 bg-[#EDEDED] hover:bg-[#D8D8D8] text-[#0A0A0A] text-sm font-medium rounded-full"
          >
            <Share2 className="w-4 h-4 mr-2" />
            Share
          </Button>
          <Button
            onClick={onClose}
            variant="ghost"
            className="w-full h-11 text-[#9A9A9A] hover:text-[#EDEDED] hover:bg-[#151515] text-sm rounded-full"
          >
            Done
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
