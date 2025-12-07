"use client";

import InsufficientBalanceModal from "@/components/modals/InsufficientBalanceModal";
import EditPollDialog from "@/components/dialogs/EditPollDialog";
import SharePollDialog from "@/components/dialogs/SharePollDialog";
import { CelebrationModal } from "@/components/CelebrationModal";
import { Badge } from "@/components/ui/badge";
import { getStatusBadge, getCategoryBadge } from "@/lib/poll-badges";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { usePollById, usePollStats } from "@/lib/polls";
import { useCalculateWinnings, useCreateStake, useMyStakes } from "@/lib/stakes";
import { usePlatformLimits } from "@/lib/platform-settings";
import { cn } from "@/lib/utils";
import { useAuthStore } from "@/stores/authStore";
import dayjs from "dayjs";
import relativeTime from "dayjs/plugin/relativeTime";
import {
  ArrowLeft,
  Coins,
  Edit,
  Loader2,
  Share2,
  Target,
  Timer,
  Trophy,
  XCircle,
} from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import numeral from "numeral";
import { useState, useEffect } from "react";
import { toast } from "sonner";
import { trackPollView, trackStakePlaced } from "@/lib/analytics";

dayjs.extend(relativeTime);

export default function PollDetailsPage() {
  const params = useParams();
  const router = useRouter();
  const { user, balance, updateBalance, isAdmin, isSubAdmin } = useAuthStore();
  const pollId = params.id as string;

  // Data fetching
  const {
    data: pollData,
    isLoading: isPollLoading,
    refetch,
  } = usePollById(pollId);
  const { data: statsData, isLoading: isStatsLoading } = usePollStats(pollId);
  const { data: limitsData } = usePlatformLimits();
  const platformLimits = limitsData?.data;
  const minStake = platformLimits?.minStakeAmount || 100; // Default to 100 if not loaded
  const maxStake = platformLimits?.maxStakeAmount || 10000;

  // State
  const [selectedOptionId, setSelectedOptionId] = useState("");
  const [stakeAmount, setStakeAmount] = useState("");
  const [isStakeDialogOpen, setIsStakeDialogOpen] = useState(false);
  const [insufficientBalanceOpen, setInsufficientBalanceOpen] = useState(false);
  const [requiredStakeAmount, setRequiredStakeAmount] = useState(0);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isShareDialogOpen, setIsShareDialogOpen] = useState(false);
  const [celebrationOpen, setCelebrationOpen] = useState(false);
  const [celebrationType, setCelebrationType] = useState<"stake_placed" | "first_prediction">("stake_placed");
  const [celebrationAmount, setCelebrationAmount] = useState(0);
  const createStakeMutation = useCreateStake();

  // Get user's stakes to detect first prediction
  const { data: myStakesData } = useMyStakes();

  // Calculate potential winnings
  const { data: winningsData } = useCalculateWinnings({
    pollId: pollId,
    selectedOptionId: selectedOptionId,
    amount: parseFloat(stakeAmount) || 0,
  });

  const poll = pollData?.data;
  const stats = statsData?.data;

  // Track poll view when poll data loads - MUST be before any conditional returns
  useEffect(() => {
    if (poll && poll.id) {
      trackPollView(poll.id, poll.title, poll.category);
    }
  }, [poll?.id, poll?.title, poll?.category]);

  if (isPollLoading || isStatsLoading) {
    return (
      <div className="min-h-screen bg-[#000000] flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-8 h-8 text-[#EDEDED] animate-spin mx-auto mb-3" />
          <p className="text-[#9A9A9A] text-sm font-light">Loading...</p>
        </div>
      </div>
    );
  }

  // Check if user has already staked on this poll
  const hasUserStaked = () => {
    if (!user || !poll?.statistics?.stakerUserIds) return false;
    return poll.statistics.stakerUserIds.includes(user.id);
  };

  if (!poll) {
    return (
      <div className="min-h-screen bg-[#000000] flex items-center justify-center">
        <div className="text-center">
          <XCircle className="w-12 h-12 text-red-400 mx-auto mb-4" />
          <h1 className="text-2xl font-semibold text-[#EDEDED] mb-4">Poll Not Found</h1>
          <p className="text-[#9A9A9A] font-light mb-6">
            {` The poll you're looking for doesn't exist.`}
          </p>
          <Link href="/polls">
            <Button className="bg-[#EDEDED] hover:bg-[#D8D8D8] text-[#0A0A0A] font-medium rounded-full">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Polls
            </Button>
          </Link>
        </div>
      </div>
    );
  }

  // Format numbers
  const formatNumber = (num: number) => {
    if (num >= 1000000) {
      return numeral(num).format("0.0a").toUpperCase();
    } else if (num >= 1000) {
      return numeral(num).format("0.0a");
    }
    return numeral(num).format("0,0");
  };

  // Calculate statistics
  const totalStakes = stats?.totalStakes || poll.totalParticipants || 0;
  const totalAmount = stats?.totalAmount || poll.totalStakeAmount || 0;
  const averageStake = totalStakes > 0 ? totalAmount / totalStakes : 0;

  const handleStakeClick = () => {
    if (poll.status !== "active") {
      toast.error("This poll is closed for staking!");
      return;
    }

    // Check if poll has expired
    const timeLeft = poll.endTime
      ? new Date(poll.endTime).getTime() - Date.now()
      : 0;
    if (timeLeft <= 0) {
      toast.error("This poll has ended. Stakes are no longer accepted.");
      return;
    }

    if (!user) {
      toast.error("Please sign in to place a stake");
      router.push("/");
      return;
    }

    // Check if user has already staked
    if (hasUserStaked()) {
      toast.info("You have already placed a stake on this poll!");
      return;
    }

    setIsStakeDialogOpen(true);
  };

  const handlePlaceStake = () => {
    if (!selectedOptionId || !stakeAmount) {
      toast.error("Please select an option and enter amount");
      return;
    }

    // Check if poll has expired
    const timeLeft = poll.endTime
      ? new Date(poll.endTime).getTime() - Date.now()
      : 0;
    if (timeLeft <= 0) {
      toast.error("This poll has ended. Stakes are no longer accepted.");
      return;
    }

    const amount = parseFloat(stakeAmount);
    if (amount < minStake) {
      toast.error(`Minimum stake is ${minStake} USDC!`);
      return;
    }
    if (amount > maxStake) {
      toast.error(`Maximum stake is ${maxStake.toLocaleString()} USDC!`);
      return;
    }
    if (amount > balance) {
      setRequiredStakeAmount(amount);
      setInsufficientBalanceOpen(true);
      setIsStakeDialogOpen(false);
      return;
    }

    createStakeMutation.mutate(
      {
        pollId: poll.id,
        selectedOptionId: selectedOptionId,
        amount,
      },
      {
        onSuccess: () => {
          updateBalance(balance - amount);
          const selectedOption = poll.options.find(
            (opt: any) => opt.id === selectedOptionId
          );

          // Track successful stake
          trackStakePlaced(poll.id, selectedOptionId, amount, poll.category);

          // Check if this is user's first prediction
          const isFirstPrediction = !myStakesData?.data?.docs?.length;

          // Set celebration data and show modal
          setCelebrationAmount(amount);
          setCelebrationType(isFirstPrediction ? "first_prediction" : "stake_placed");
          setIsStakeDialogOpen(false);
          setStakeAmount("");
          setSelectedOptionId("");
          refetch();

          // Show celebration modal after a brief delay
          setTimeout(() => {
            setCelebrationOpen(true);
          }, 300);
        },
        onError: (error: any) => {
          toast.error(
            error?.response?.data?.message || "Failed to place stake"
          );
        },
      }
    );
  };

  const quickAmounts = [100, 500, 1000, 5000];
  const timeLeft = poll.endTime
    ? new Date(poll.endTime).getTime() - Date.now()
    : 0;
  const daysLeft = Math.ceil(timeLeft / (1000 * 60 * 60 * 24));

  return (
    <div className="min-h-screen bg-[#000000]">
      {/* Background */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[600px] h-[600px] bg-[#1F1F1F]/20 rounded-full blur-[150px]" />
      </div>

      <div className="relative px-4 sm:px-6 py-6 max-w-3xl mx-auto">
        {/* Back Button */}
        <Link href="/polls" className="inline-flex items-center gap-2 text-[#9A9A9A] hover:text-[#EDEDED] text-sm mb-4 transition-colors">
          <ArrowLeft className="w-4 h-4" />
          Back
        </Link>

        {/* Header Card */}
        <div className="bg-[#0A0A0A] border border-[#1F1F1F] rounded-2xl p-4 sm:p-6 mb-6">
          {/* Badges */}
          <div className="flex items-center gap-2 mb-3 flex-wrap">
            {getCategoryBadge(poll.category)}
            {getStatusBadge(poll.status)}
            {poll.status === "active" && timeLeft > 0 && (
              <Badge className="bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                <Timer className="w-3 h-3 mr-1" />
                {daysLeft}d left
              </Badge>
            )}
          </div>

          {/* Title */}
          <h1 className="text-xl sm:text-2xl font-semibold text-[#EDEDED] mb-2">{poll.title}</h1>
          <p className="text-[#9A9A9A] text-sm font-light mb-4">{poll.description}</p>

          {/* Stats Grid */}
          <div className="grid grid-cols-2 gap-3 mb-4">
            <div className="bg-[#151515] rounded-xl p-3">
              <p className="text-[#9A9A9A] text-xs font-light">Pool</p>
              <p className="text-emerald-400 font-semibold inline-flex items-center gap-1">
                <Image src="/usdc.svg" alt="USDC" width={16} height={16} />
                {formatNumber(totalAmount)}
              </p>
            </div>
            <div className="bg-[#151515] rounded-xl p-3">
              <p className="text-[#9A9A9A] text-xs font-light">Players</p>
              <p className="text-[#EDEDED] font-semibold">{formatNumber(totalStakes)}</p>
            </div>
            <div className="bg-[#151515] rounded-xl p-3">
              <p className="text-[#9A9A9A] text-xs font-light">Ends</p>
              <p className="text-[#EDEDED] font-medium text-sm">
                {poll.endTime ? dayjs(poll.endTime).format("MMM D, h:mm A") : "Manual"}
              </p>
            </div>
            <div className="bg-[#151515] rounded-xl p-3">
              <p className="text-[#9A9A9A] text-xs font-light">Avg Stake</p>
              <p className="text-[#EDEDED] font-semibold inline-flex items-center gap-1">
                <Image src="/usdc.svg" alt="USDC" width={16} height={16} />
                {formatNumber(averageStake)}
              </p>
            </div>
          </div>

          {/* Actions */}
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="icon"
              onClick={() => setIsShareDialogOpen(true)}
              className="shrink-0 border-[#1F1F1F] text-[#9A9A9A] hover:text-[#EDEDED] hover:bg-[#151515]"
            >
              <Share2 className="w-4 h-4" />
            </Button>
            {(isAdmin || isSubAdmin) && (
              <Button
                variant="outline"
                size="icon"
                onClick={() => setIsEditDialogOpen(true)}
                className="shrink-0 border-[#1F1F1F] text-[#9A9A9A] hover:text-[#EDEDED] hover:bg-[#151515]"
              >
                <Edit className="w-4 h-4" />
              </Button>
            )}
            {poll.status === "active" && (
              <Button
                disabled={timeLeft <= 0 || hasUserStaked()}
                className="flex-1 bg-[#EDEDED] hover:bg-[#D8D8D8] text-[#0A0A0A] font-medium rounded-full disabled:opacity-50"
                onClick={handleStakeClick}
              >
                <Coins className="w-4 h-4 mr-2" />
                {timeLeft <= 0 ? "Ended" : hasUserStaked() ? "Staked" : "Place Stake"}
              </Button>
            )}
          </div>
        </div>

        {/* Options Section */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-[#EDEDED] font-medium flex items-center gap-2">
              <Target className="w-4 h-4 text-cyan-400" />
              Options
            </h2>
            {hasUserStaked() && (
              <Badge className="bg-blue-500/10 text-blue-400 border-blue-500/20">
                <Trophy className="w-3 h-3 mr-1" />
                Staked
              </Badge>
            )}
          </div>

          <div className="space-y-2">
            {poll.options?.map((option: any, index: number) => {
              const statisticsOption = poll.statistics?.options?.find(
                (o: any) => o.id === option.id
              );
              const optionStat = stats?.optionStats?.find(
                (s: any) => s.optionId === option.id
              );
              const optionAmount =
                statisticsOption?.stakeAmount ||
                optionStat?.amount ||
                poll.stakesPerOption?.[option.id] ||
                0;
              const percentage =
                statisticsOption?.percentage !== undefined
                  ? statisticsOption.percentage
                  : totalAmount > 0
                  ? (optionAmount / totalAmount) * 100
                  : 0;
              const isWinner =
                poll.status === "resolved" &&
                (poll.winningOptionId === option.id || poll.correctOptionId === option.id);

              return (
                <div
                  key={option.id || index}
                  className={cn(
                    "p-3 rounded-xl border transition-all",
                    isWinner
                      ? "bg-emerald-500/10 border-emerald-500/30"
                      : poll.status === "active"
                      ? "bg-[#0A0A0A] border-[#1F1F1F] hover:border-[#9A9A9A]/30 cursor-pointer"
                      : "bg-[#0A0A0A] border-[#1F1F1F]"
                  )}
                  onClick={() => {
                    if (poll.status === "active" && !hasUserStaked()) {
                      setSelectedOptionId(option.id);
                      handleStakeClick();
                    }
                  }}
                >
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-[#EDEDED] text-sm font-medium flex items-center gap-2">
                      {option.text}
                      {isWinner && (
                        <Badge className="bg-emerald-500/20 text-emerald-400 border-emerald-500/30 text-xs">
                          Winner
                        </Badge>
                      )}
                    </span>
                    <span className={cn(
                      "text-sm font-semibold",
                      isWinner ? "text-emerald-400" : "text-cyan-400"
                    )}>
                      {percentage.toFixed(1)}%
                    </span>
                  </div>
                  <div className="relative h-1.5 bg-[#1F1F1F] rounded-full overflow-hidden">
                    <div
                      className="absolute inset-y-0 left-0 rounded-full transition-all duration-500"
                      style={{
                        width: `${Math.min(percentage, 100)}%`,
                        background: isWinner
                          ? "linear-gradient(to right, rgb(16 185 129), rgb(20 184 166))"
                          : "linear-gradient(to right, rgb(34 211 238), rgb(6 182 212))",
                      }}
                    />
                  </div>
                  <div className="flex justify-between mt-1.5 text-xs text-[#9A9A9A]">
                    <span className="inline-flex items-center gap-1">
                      <Image src="/usdc.svg" alt="USDC" width={12} height={12} />
                      {formatNumber(optionAmount)}
                    </span>
                    <span>{statisticsOption?.participantCount || optionStat?.stakes || 0} stakes</span>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Stake CTA for active polls */}
          {poll.status === "active" && !hasUserStaked() && timeLeft > 0 && (
            <div className="mt-4 p-4 rounded-xl bg-[#0A0A0A] border border-[#1F1F1F]">
              <p className="text-[#9A9A9A] text-sm mb-3 inline-flex items-center gap-1 flex-wrap font-light">
                Min: <Image src="/usdc.svg" alt="USDC" width={12} height={12} />{minStake} • Balance: <Image src="/usdc.svg" alt="USDC" width={12} height={12} />{balance.toLocaleString()}
              </p>
              <Button
                className="w-full bg-[#EDEDED] hover:bg-[#D8D8D8] text-[#0A0A0A] font-medium rounded-full"
                onClick={handleStakeClick}
              >
                <Coins className="w-4 h-4 mr-2" />
                Place Your Stake
              </Button>
            </div>
          )}

          {/* Resolved winner */}
          {poll.status === "resolved" && poll.winningOptionId && (
            <div className="mt-4 p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/30">
              <p className="text-emerald-400 font-medium flex items-center gap-2">
                <Trophy className="w-4 h-4" />
                Winner: {poll.options.find((opt: any) => opt.id === poll.winningOptionId)?.text}
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Floating Action Button for Mobile */}
      {poll.status === "active" && timeLeft > 0 && !hasUserStaked() && (
        <div className="fixed bottom-24 right-6 z-40 md:hidden">
          <Button
            onClick={handleStakeClick}
            className="rounded-full w-14 h-14 shadow-xl bg-[#EDEDED] hover:bg-[#D8D8D8] text-[#0A0A0A]"
          >
            <Coins className="w-6 h-6" />
          </Button>
        </div>
      )}

      {/* Stake Dialog */}
      <Dialog
        open={isStakeDialogOpen}
        onOpenChange={(open) => {
          setIsStakeDialogOpen(open);
          if (!open) {
            setSelectedOptionId("");
            setStakeAmount("");
          }
        }}
      >
        <DialogContent className="bg-[#0A0A0A] border-[#1F1F1F] text-[#EDEDED]">
          <DialogHeader>
            <DialogTitle className="text-lg font-semibold text-[#EDEDED]">Place Your Stake</DialogTitle>
            <DialogDescription className="text-[#9A9A9A] text-sm font-light">{poll.title}</DialogDescription>
          </DialogHeader>

          <div className="space-y-4 overflow-y-auto max-h-[60vh]">
            {/* Option Selection */}
            <div className="space-y-2">
              <Label className="text-[#9A9A9A] text-sm font-light">Select prediction</Label>
              <Select value={selectedOptionId} onValueChange={setSelectedOptionId}>
                <SelectTrigger className="bg-[#151515] border-[#1F1F1F] text-[#EDEDED] rounded-xl">
                  <SelectValue placeholder="Choose an option" />
                </SelectTrigger>
                <SelectContent className="bg-[#0A0A0A] border-[#1F1F1F] max-h-[200px]">
                  {poll.options?.map((option: any) => (
                    <SelectItem key={option.id} value={option.id} className="text-[#EDEDED] hover:bg-[#151515]">
                      {option.text}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {selectedOptionId && (
              <>
                {/* Amount Input */}
                <div className="space-y-2">
                  <Label className="text-[#9A9A9A] text-sm font-light">Amount (USDC)</Label>
                  <Input
                    type="number"
                    step="0.01"
                    placeholder={`Min: ${minStake}`}
                    value={stakeAmount}
                    onChange={(e) => setStakeAmount(e.target.value)}
                    min={minStake}
                    className="bg-[#151515] border-[#1F1F1F] text-[#EDEDED] rounded-xl"
                  />
                  <div className="flex flex-wrap gap-2">
                    {quickAmounts.map((amount) => (
                      <Button
                        key={amount}
                        onClick={() => setStakeAmount(amount.toString())}
                        variant="outline"
                        size="sm"
                        className="text-xs inline-flex items-center gap-1 border-[#1F1F1F] text-[#9A9A9A] hover:text-[#EDEDED] hover:bg-[#151515]"
                      >
                        <Image src="/usdc.svg" alt="USDC" width={12} height={12} />
                        {amount}
                      </Button>
                    ))}
                  </div>
                </div>

                {/* Potential Winnings */}
                {winningsData?.data && parseFloat(stakeAmount) >= minStake && (
                  <div className="p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/20">
                    <div className="flex justify-between text-sm">
                      <span className="text-[#9A9A9A] font-light">Potential Win</span>
                      <span className="text-emerald-400 font-semibold inline-flex items-center gap-1">
                        <Image src="/usdc.svg" alt="USDC" width={12} height={12} />
                        {winningsData.data.grossWinnings.toLocaleString()}
                      </span>
                    </div>
                  </div>
                )}

                {/* Balance Info */}
                <div className="p-3 rounded-xl bg-[#151515] border border-[#1F1F1F]">
                  <div className="flex justify-between text-sm">
                    <span className="text-[#9A9A9A] font-light">Balance</span>
                    <span className="text-[#EDEDED] inline-flex items-center gap-1">
                      <Image src="/usdc.svg" alt="USDC" width={12} height={12} />
                      {balance.toLocaleString()}
                    </span>
                  </div>
                  <div className="flex justify-between text-sm mt-1">
                    <span className="text-[#9A9A9A] font-light">After</span>
                    <span className={cn("inline-flex items-center gap-1", parseFloat(stakeAmount) > balance ? "text-red-400" : "text-emerald-400")}>
                      <Image src="/usdc.svg" alt="USDC" width={12} height={12} />
                      {(balance - parseFloat(stakeAmount || "0")).toLocaleString()}
                    </span>
                  </div>
                </div>

                {/* Submit */}
                <Button
                  onClick={handlePlaceStake}
                  disabled={createStakeMutation.isPending || !stakeAmount || parseFloat(stakeAmount) < minStake}
                  className="w-full bg-[#EDEDED] hover:bg-[#D8D8D8] text-[#0A0A0A] font-medium rounded-full disabled:opacity-50"
                >
                  {createStakeMutation.isPending ? (
                    <><Loader2 className="w-4 h-4 mr-2 animate-spin" />Placing...</>
                  ) : (
                    <><Coins className="w-4 h-4 mr-2" />Stake <Image src="/usdc.svg" alt="USDC" width={16} height={16} className="mx-1" />{parseFloat(stakeAmount || "0").toLocaleString()}</>
                  )}
                </Button>
              </>
            )}
          </div>
        </DialogContent>
      </Dialog>

      {/* Insufficient Balance Modal */}
      <InsufficientBalanceModal
        isOpen={insufficientBalanceOpen}
        onClose={() => {
          setInsufficientBalanceOpen(false);
          setRequiredStakeAmount(0);
        }}
        requiredAmount={requiredStakeAmount}
        currentBalance={balance}
      />

      {/* Edit Poll Dialog for SubAdmins */}
      {poll && (isAdmin || isSubAdmin) && (
        <EditPollDialog
          isOpen={isEditDialogOpen}
          onClose={() => setIsEditDialogOpen(false)}
          poll={{
            id: poll.id,
            title: poll.title,
            description: poll.description,
          }}
          onSuccess={() => {
            refetch();
            setIsEditDialogOpen(false);
          }}
        />
      )}

      {/* Share Poll Dialog */}
      {poll && (
        <SharePollDialog
          isOpen={isShareDialogOpen}
          onClose={() => setIsShareDialogOpen(false)}
          poll={poll}
        />
      )}

      {/* Celebration Modal */}
      <CelebrationModal
        open={celebrationOpen}
        onClose={() => setCelebrationOpen(false)}
        type={celebrationType}
        pollTitle={poll?.title}
        amount={celebrationAmount}
        pollId={poll?.id}
      />
    </div>
  );
}
