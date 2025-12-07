"use client";

import { Dialog, DialogContent } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { useCelebrate } from "@/hooks/useCelebrate";
import { Share2, Trophy, Flame, Sparkles, X } from "lucide-react";
import Image from "next/image";
import confetti from "canvas-confetti";
import { useEffect } from "react";

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
    icon: Trophy,
    iconColor: "text-amber-400",
    iconBg: "bg-amber-500/20",
    title: "You Called It!",
    subtitle: "Your prediction was correct",
  },
  stake_placed: {
    icon: Sparkles,
    iconColor: "text-cyan-400",
    iconBg: "bg-cyan-500/20",
    title: "Stake Placed!",
    subtitle: "Good luck with your prediction",
  },
  first_prediction: {
    icon: Sparkles,
    iconColor: "text-violet-400",
    iconBg: "bg-violet-500/20",
    title: "Welcome to the Game!",
    subtitle: "You made your first prediction",
  },
  win_streak: {
    icon: Flame,
    iconColor: "text-orange-400",
    iconBg: "bg-orange-500/20",
    title: "You're On Fire!",
    subtitle: "Keep the streak going",
  },
  claim: {
    icon: Trophy,
    iconColor: "text-emerald-400",
    iconBg: "bg-emerald-500/20",
    title: "Winnings Claimed!",
    subtitle: "USDC sent to your wallet",
  },
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
  const { celebrate } = useCelebrate();
  const config = celebrationConfig[type];
  const Icon = config.icon;

  // Trigger confetti on win
  useEffect(() => {
    if (open && (type === "win" || type === "win_streak" || type === "claim")) {
      confetti({
        particleCount: 100,
        spread: 70,
        origin: { y: 0.6 },
        colors: ["#fbbf24", "#34d399", "#60a5fa", "#a78bfa"],
      });
    }
  }, [open, type]);

  const handleShare = () => {
    celebrate({
      type,
      pollTitle,
      amount,
      winnings,
      streakCount,
      pollId,
    });
  };

  return (
    <Dialog open={open} onOpenChange={(o) => !o && onClose()}>
      <DialogContent className="bg-[#0A0A0A] border-[#1F1F1F] text-center max-w-sm mx-4 p-6">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-[#9A9A9A] hover:text-[#EDEDED]"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Icon */}
        <div
          className={`w-20 h-20 rounded-full ${config.iconBg} flex items-center justify-center mx-auto mb-4`}
        >
          <Icon className={`w-10 h-10 ${config.iconColor}`} />
        </div>

        {/* Title */}
        <h2 className="text-2xl font-semibold text-[#EDEDED] mb-1">
          {config.title}
        </h2>
        <p className="text-[#9A9A9A] text-sm mb-4">{config.subtitle}</p>

        {/* Amount display */}
        {(winnings || amount) && (
          <div className="p-4 rounded-xl bg-[#151515] border border-[#1F1F1F] mb-6">
            <p className="text-xs text-[#9A9A9A] mb-1">
              {type === "win" || type === "claim" ? "You won" : "You staked"}
            </p>
            <p className="text-3xl font-semibold text-[#EDEDED] flex items-center justify-center gap-2">
              <Image src="/usdc.svg" alt="USDC" width={28} height={28} />
              {(winnings || amount)?.toFixed(2)}
            </p>
          </div>
        )}

        {/* Win streak display */}
        {type === "win_streak" && streakCount && (
          <div className="p-4 rounded-xl bg-[#151515] border border-[#1F1F1F] mb-6">
            <p className="text-xs text-[#9A9A9A] mb-1">Win Streak</p>
            <p className="text-3xl font-semibold text-orange-400 flex items-center justify-center gap-2">
              <Flame className="w-7 h-7" />
              {streakCount}
            </p>
          </div>
        )}

        {/* Poll title */}
        {pollTitle && (
          <p className="text-sm text-[#9A9A9A] mb-6 line-clamp-2">
            &ldquo;{pollTitle}&rdquo;
          </p>
        )}

        {/* Actions */}
        <div className="space-y-2">
          <Button
            onClick={handleShare}
            className="w-full h-12 bg-[#EDEDED] hover:bg-[#D8D8D8] text-[#0A0A0A] font-medium rounded-full"
          >
            <Share2 className="w-4 h-4 mr-2" />
            Share Your {type === "win" ? "Win" : type === "win_streak" ? "Streak" : "Prediction"}
          </Button>
          <Button
            onClick={onClose}
            variant="ghost"
            className="w-full h-12 text-[#9A9A9A] hover:text-[#EDEDED] hover:bg-[#151515] rounded-full"
          >
            Continue
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
