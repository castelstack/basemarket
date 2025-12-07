"use client";

import Image from "next/image";
import InsufficientBalanceModal from "@/components/modals/InsufficientBalanceModal";
import { Badge } from "@/components/ui/badge";
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
import { Pagination } from "@/components/ui/pagination";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { POLL_CATEGORIES } from "@/constants/categories";
import { usePlatformLimits } from "@/lib/platform-settings";
import { getStatusBadge, getCategoryBadge } from "@/lib/poll-badges";
import {
  useAllPolls,
  useCancelPoll,
  useClosePoll,
  useDeletePoll,
  usePollStats,
  useResolvePoll,
} from "@/lib/polls";
import { useCalculateWinnings, useCreateStake } from "@/lib/stakes";
import { cn } from "@/lib/utils";
import { useAuthStore } from "@/stores/authStore";
import type { Poll, PollOption } from "@/types/api";
import {
  ChevronRight,
  Coins,
  Eye,
  Filter,
  Loader2,
  Plus,
  Search,
  Settings,
  Timer,
  Trophy,
} from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import numeral from "numeral";
import { useState } from "react";
import { toast } from "sonner";

export default function PollsPage() {
  const router = useRouter();
  const { user, updateBalance, balance, isAdmin, isSubAdmin } = useAuthStore();
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [selectedStatus, setSelectedStatus] = useState("all");
  const [sortBy, setSortBy] = useState("createdAt");
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("desc");
  const [currentPage, setCurrentPage] = useState(1);
  const [showFilters, setShowFilters] = useState(false);
  const itemsPerPage = 9;

  const apiParams = {
    page: currentPage,
    limit: itemsPerPage,
    search: searchQuery || undefined,
    status: selectedStatus === "all" ? undefined : selectedStatus,
    category: selectedCategory === "all" ? undefined : selectedCategory,
    sortBy,
    sortOrder,
  };

  const { data, isLoading, refetch } = useAllPolls(apiParams);
  const { data: limitsData } = usePlatformLimits();
  const platformLimits = limitsData?.data;
  const minStake = platformLimits?.minStakeAmount || 100;
  const maxStake = platformLimits?.maxStakeAmount || 10000;
  const closePollMutation = useClosePoll();
  const resolvePollMutation = useResolvePoll();
  const cancelPollMutation = useCancelPoll();
  const deletePollMutation = useDeletePoll();

  const [selectedPoll, setSelectedPoll] = useState<Poll | null>(null);
  const [selectedOption, setSelectedOption] = useState<PollOption | null>(null);
  const [stakeAmount, setStakeAmount] = useState("");
  const [isStakeDialogOpen, setIsStakeDialogOpen] = useState(false);
  const [viewOptionsDialogOpen, setViewOptionsDialogOpen] = useState(false);
  const [insufficientBalanceOpen, setInsufficientBalanceOpen] = useState(false);
  const [requiredStakeAmount, setRequiredStakeAmount] = useState(0);
  const createStakeMutation = useCreateStake();
  const [isAdminDialogOpen, setIsAdminDialogOpen] = useState(false);
  const [adminAction, setAdminAction] = useState<
    "close" | "resolve" | "cancel" | "delete"
  >("resolve");
  const [selectedWinnerId, setSelectedWinnerId] = useState("");

  const { data: selectedPollStats } = usePollStats(selectedPoll?.id || "");
  const { data: winningsData } = useCalculateWinnings({
    pollId: selectedPoll?.id || "",
    selectedOptionId: selectedOption?.id || "",
    amount: parseInt(stakeAmount) || 0,
  });

  const responseData = data?.data as any;
  const polls: Poll[] = responseData?.docs || [];
  const totalPages = responseData?.totalPages || 1;
  const hasNextPage = responseData?.hasNextPage || false;
  const hasPrevPage = responseData?.hasPrevPage || false;
  const totalDocs = responseData?.totalDocs || 0;

  const allCategories = [
    { value: "all", label: "All Categories" },
    ...POLL_CATEGORIES,
  ];

  const hasUserStaked = (poll: Poll) => {
    if (!user || !poll.statistics?.stakerUserIds) return false;
    return poll.statistics.stakerUserIds.includes(user.id);
  };

  const handleStakeClick = (poll: Poll, option?: PollOption) => {
    if (poll.status !== "active") {
      toast.error("This poll is closed for staking");
      return;
    }
    if (!user) {
      toast.error("Please sign in to place a stake");
      router.push("/");
      return;
    }
    if (hasUserStaked(poll)) {
      toast.error("You already staked on this poll");
      return;
    }
    setSelectedPoll(poll);
    setSelectedOption(option || null);
    setIsStakeDialogOpen(true);
  };

  const handlePlaceStake = () => {
    if (!selectedPoll || !selectedOption || !stakeAmount) return;

    const timeLeft =
      new Date(selectedPoll?.endTime ?? 0).getTime() - Date.now();
    if (timeLeft <= 0) {
      toast.error("This poll has ended");
      return;
    }

    const amount = parseFloat(stakeAmount);
    if (amount < minStake) {
      toast.error(`Minimum stake is ${minStake} USDC`);
      return;
    }
    if (amount > maxStake) {
      toast.error(`Maximum stake is ${maxStake.toLocaleString()} USDC`);
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
        pollId: selectedPoll.id,
        selectedOptionId: selectedOption.id!,
        amount,
      },
      {
        onSuccess: () => {
          updateBalance(balance - amount);
          toast.success(`Staked ${amount} USDC on ${selectedOption.text}`);
          setIsStakeDialogOpen(false);
          setStakeAmount("");
          setSelectedOption(null);
          setSelectedPoll(null);
          refetch();
        },
        onError: (error: any) => {
          toast.error(error?.response?.data?.message || "Failed to place stake");
        },
      }
    );
  };

  const handleAdminAction = () => {
    if (!selectedPoll) return;

    if (adminAction === "close") {
      closePollMutation.mutate(selectedPoll.id, {
        onSuccess: () => {
          toast.success("Poll closed");
          setIsAdminDialogOpen(false);
          refetch();
        },
        onError: (error: any) => {
          toast.error(error?.response?.data?.message || "Failed to close poll");
        },
      });
    } else if (adminAction === "resolve") {
      if (!selectedWinnerId) {
        toast.error("Please select a winner");
        return;
      }

      if (selectedPoll.status === "active") {
        closePollMutation.mutate(selectedPoll.id, {
          onSuccess: () => {
            resolvePollMutation.mutate(
              { id: selectedPoll.id, data: { correctOptionId: selectedWinnerId } },
              {
                onSuccess: () => {
                  toast.success("Poll resolved");
                  setIsAdminDialogOpen(false);
                  setSelectedWinnerId("");
                  refetch();
                },
                onError: (error: any) => {
                  toast.error(error?.response?.data?.message || "Failed to resolve");
                },
              }
            );
          },
          onError: (error: any) => {
            toast.error(error?.response?.data?.message || "Failed to close poll");
          },
        });
      } else {
        resolvePollMutation.mutate(
          { id: selectedPoll.id, data: { correctOptionId: selectedWinnerId } },
          {
            onSuccess: () => {
              toast.success("Poll resolved");
              setIsAdminDialogOpen(false);
              setSelectedWinnerId("");
              refetch();
            },
            onError: (error: any) => {
              toast.error(error?.response?.data?.message || "Failed to resolve");
            },
          }
        );
      }
    } else if (adminAction === "cancel") {
      cancelPollMutation.mutate(selectedPoll.id, {
        onSuccess: () => {
          toast.success("Poll cancelled, stakes refunded");
          setIsAdminDialogOpen(false);
          refetch();
        },
        onError: (error: any) => {
          toast.error(error?.response?.data?.message || "Failed to cancel");
        },
      });
    } else if (adminAction === "delete") {
      deletePollMutation.mutate(selectedPoll.id, {
        onSuccess: () => {
          toast.success("Poll deleted");
          setIsAdminDialogOpen(false);
          refetch();
        },
        onError: (error: any) => {
          toast.error(error?.response?.data?.message || "Failed to delete");
        },
      });
    }
  };

  const quickAmounts = [0.01, 0.05, 0.1, 0.5];

  return (
    <div className="min-h-screen bg-[#000000]">
      {/* Background */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[600px] h-[600px] bg-[#1F1F1F]/20 rounded-full blur-[150px]" />
      </div>

      <div className="relative px-4 sm:px-6 py-6 max-w-3xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl font-semibold text-[#EDEDED]">Predictions</h1>
            <p className="text-[#9A9A9A] text-sm font-light">Pick winners, stack wins</p>
          </div>
          {user && (isAdmin || isSubAdmin) && (
            <Link href="/admin/create">
              <Button
                size="sm"
                className="bg-[#EDEDED] hover:bg-[#D8D8D8] text-[#0A0A0A] font-medium rounded-full h-10 px-4 transition-colors"
              >
                <Plus className="w-4 h-4 mr-1" />
                Create
              </Button>
            </Link>
          )}
        </div>

        {/* Search & Filter Toggle */}
        <div className="flex gap-2 mb-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#9A9A9A]" />
            <Input
              type="text"
              placeholder="Search polls..."
              value={searchQuery}
              onChange={(e) => {
                setSearchQuery(e.target.value);
                setCurrentPage(1);
              }}
              className="pl-10 h-11 bg-[#0A0A0A] border-[#1F1F1F] text-[#EDEDED] placeholder-[#9A9A9A] rounded-xl"
            />
          </div>
          <Button
            variant="outline"
            onClick={() => setShowFilters(!showFilters)}
            className={cn(
              "h-11 px-3 rounded-xl border-[#1F1F1F]",
              showFilters ? "bg-[#151515] border-[#9A9A9A]/30 text-[#EDEDED]" : "text-[#9A9A9A]"
            )}
          >
            <Filter className="w-4 h-4" />
          </Button>
        </div>

        {/* Filters Panel */}
        {showFilters && (
          <div className="p-4 mb-4 rounded-xl bg-[#0A0A0A] border border-[#1F1F1F] space-y-3">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium text-[#EDEDED]">Filters</span>
              <button
                onClick={() => {
                  setSelectedCategory("all");
                  setSelectedStatus("all");
                  setSortBy("createdAt");
                  setCurrentPage(1);
                }}
                className="text-xs text-[#9A9A9A] hover:text-[#D8D8D8] transition-colors"
              >
                Reset
              </button>
            </div>

            <Select
              value={selectedCategory}
              onValueChange={(v) => { setSelectedCategory(v); setCurrentPage(1); }}
            >
              <SelectTrigger className="h-10 bg-[#151515] border-[#1F1F1F] text-[#EDEDED] rounded-xl">
                <SelectValue placeholder="Category" />
              </SelectTrigger>
              <SelectContent className="bg-[#0A0A0A] border-[#1F1F1F]">
                {allCategories.map((cat) => (
                  <SelectItem key={cat.value} value={cat.value} className="text-[#EDEDED] hover:bg-[#151515]">
                    {cat.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Select
              value={selectedStatus}
              onValueChange={(v) => { setSelectedStatus(v); setCurrentPage(1); }}
            >
              <SelectTrigger className="h-10 bg-[#151515] border-[#1F1F1F] text-[#EDEDED] rounded-xl">
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent className="bg-[#0A0A0A] border-[#1F1F1F]">
                <SelectItem value="all" className="text-[#EDEDED] hover:bg-[#151515]">All Status</SelectItem>
                <SelectItem value="active" className="text-[#EDEDED] hover:bg-[#151515]">Active</SelectItem>
                <SelectItem value="closed" className="text-[#EDEDED] hover:bg-[#151515]">Closed</SelectItem>
                <SelectItem value="resolved" className="text-[#EDEDED] hover:bg-[#151515]">Resolved</SelectItem>
              </SelectContent>
            </Select>

            <div className="flex gap-2">
              <Select
                value={sortBy}
                onValueChange={(v) => { setSortBy(v); setCurrentPage(1); }}
              >
                <SelectTrigger className="h-10 bg-[#151515] border-[#1F1F1F] text-[#EDEDED] rounded-xl flex-1">
                  <SelectValue placeholder="Sort by" />
                </SelectTrigger>
                <SelectContent className="bg-[#0A0A0A] border-[#1F1F1F]">
                  <SelectItem value="createdAt" className="text-[#EDEDED] hover:bg-[#151515]">Latest</SelectItem>
                  <SelectItem value="endTime" className="text-[#EDEDED] hover:bg-[#151515]">Ending Soon</SelectItem>
                  <SelectItem value="totalStakeAmount" className="text-[#EDEDED] hover:bg-[#151515]">Pool Size</SelectItem>
                  <SelectItem value="totalParticipants" className="text-[#EDEDED] hover:bg-[#151515]">Popular</SelectItem>
                </SelectContent>
              </Select>
              <Button
                variant="outline"
                onClick={() => { setSortOrder(sortOrder === "asc" ? "desc" : "asc"); setCurrentPage(1); }}
                className="h-10 px-3 border-[#1F1F1F] text-[#9A9A9A] rounded-xl hover:bg-[#151515]"
              >
                {sortOrder === "desc" ? "↓" : "↑"}
              </Button>
            </div>
          </div>
        )}

        {/* Polls List */}
        {isLoading ? (
          <div className="space-y-3">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="h-32 rounded-xl bg-[#0A0A0A] animate-pulse" />
            ))}
          </div>
        ) : polls.length === 0 ? (
          <div className="text-center py-16">
            <Trophy className="w-12 h-12 text-[#9A9A9A]/50 mx-auto mb-3" />
            <h3 className="text-lg font-medium text-[#EDEDED] mb-1">No polls found</h3>
            <p className="text-[#9A9A9A] text-sm font-light">Try adjusting your filters</p>
          </div>
        ) : (
          <div className="space-y-3">
            {polls.map((poll: any) => {
              const timeLeft = new Date(poll.endTime).getTime() - Date.now();
              const hoursLeft = Math.max(0, Math.floor(timeLeft / (1000 * 60 * 60)));
              const daysLeft = Math.floor(hoursLeft / 24);
              const isExpired = timeLeft <= 0;
              const userStaked = hasUserStaked(poll);

              return (
                <div
                  key={poll.id}
                  onClick={() => router.push(`/polls/${poll.id}`)}
                  className="group p-4 rounded-xl bg-[#0A0A0A] border border-[#1F1F1F] hover:border-[#9A9A9A]/30 transition-colors cursor-pointer"
                >
                  {/* Badges */}
                  <div className="flex items-center gap-2 mb-2 flex-wrap">
                    {getStatusBadge(poll.status)}
                    {getCategoryBadge(poll.category)}
                    {userStaked && (
                      <Badge className="bg-blue-500/10 text-blue-400 border-blue-500/20 text-xs">
                        Staked
                      </Badge>
                    )}
                    {poll.status === "active" && timeLeft > 0 && (
                      <Badge className="bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 text-xs ml-auto">
                        <Timer className="w-3 h-3 mr-1" />
                        {daysLeft > 0 ? `${daysLeft}d` : `${hoursLeft}h`}
                      </Badge>
                    )}
                  </div>

                  {/* Title */}
                  <h3 className="font-medium text-[#EDEDED] mb-2 line-clamp-2 group-hover:text-[#D8D8D8] transition-colors">
                    {poll.title}
                  </h3>

                  {/* Stats */}
                  <div className="flex items-center gap-4 text-xs text-[#9A9A9A] mb-3">
                    {poll.totalStakeAmount > 0 && (
                      <span className="text-[#D8D8D8] font-normal inline-flex items-center gap-1">
                        <Image src="/usdc.svg" alt="USDC" width={12} height={12} />
                        {numeral(poll.totalStakeAmount).format("0,0.00")}
                      </span>
                    )}
                    <span>{poll.totalParticipants || 0} players</span>
                    <span>{poll.options.length} options</span>
                  </div>

                  {/* Actions */}
                  <div className="flex gap-2">
                    {poll.status === "active" && !isExpired && (
                      <Button
                        size="sm"
                        onClick={(e) => {
                          e.stopPropagation();
                          if (!userStaked) handleStakeClick(poll);
                        }}
                        disabled={userStaked}
                        className={cn(
                          "flex-1 h-9 rounded-full font-medium text-sm transition-colors",
                          userStaked
                            ? "bg-[#151515] text-[#9A9A9A] cursor-not-allowed"
                            : "bg-[#EDEDED] hover:bg-[#D8D8D8] text-[#0A0A0A]"
                        )}
                      >
                        {userStaked ? "Staked" : "Stake"}
                        <Coins className="w-3.5 h-3.5 ml-1.5" />
                      </Button>
                    )}
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={(e) => {
                        e.stopPropagation();
                        setSelectedPoll(poll);
                        setViewOptionsDialogOpen(true);
                      }}
                      className="h-9 px-3 rounded-xl border-[#1F1F1F] text-[#9A9A9A] hover:text-[#EDEDED] hover:bg-[#151515]"
                    >
                      <Eye className="w-3.5 h-3.5" />
                    </Button>
                    {(isAdmin || isSubAdmin) && (poll.status === "active" || poll.status === "closed") && (
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={(e) => {
                          e.stopPropagation();
                          setSelectedPoll(poll);
                          setIsAdminDialogOpen(true);
                        }}
                        className="h-9 px-3 rounded-xl border-[#1F1F1F] text-[#9A9A9A] hover:text-[#EDEDED] hover:bg-[#151515]"
                      >
                        <Settings className="w-3.5 h-3.5" />
                      </Button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* Pagination */}
        {!isLoading && totalPages > 1 && (
          <Pagination
            currentPage={currentPage}
            totalPages={totalPages}
            totalDocs={totalDocs}
            hasNextPage={hasNextPage}
            hasPrevPage={hasPrevPage}
            onPageChange={setCurrentPage}
            itemName="polls"
            className="mt-6"
          />
        )}
      </div>

      {/* Stake Dialog */}
      <Dialog
        open={isStakeDialogOpen}
        onOpenChange={(open) => {
          setIsStakeDialogOpen(open);
          if (!open) {
            setSelectedOption(null);
            setStakeAmount("");
            setSelectedPoll(null);
          }
        }}
      >
        <DialogContent className="bg-[#0A0A0A] border-[#1F1F1F] text-[#EDEDED] max-w-md mx-4">
          <DialogHeader>
            <DialogTitle className="text-xl font-semibold">Place Stake</DialogTitle>
            <DialogDescription className="text-[#9A9A9A] line-clamp-2">
              {selectedPoll?.title}
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 mt-2">
            <div className="space-y-2">
              <Label className="text-[#9A9A9A] text-sm">Select prediction</Label>
              <Select
                value={selectedOption?.id || ""}
                onValueChange={(value) => {
                  const option = selectedPoll?.options.find((opt: any) => opt.id === value);
                  setSelectedOption(option || null);
                }}
              >
                <SelectTrigger className="bg-[#151515] border-[#1F1F1F] text-[#EDEDED] rounded-xl">
                  <SelectValue placeholder="Choose an option" />
                </SelectTrigger>
                <SelectContent className="bg-[#0A0A0A] border-[#1F1F1F] max-h-[240px]">
                  {selectedPoll?.options.map((option: any) => {
                    const optionStats = selectedPollStats?.data?.optionStats?.find(
                      (s: any) => s.optionId === option.id
                    );
                    const percentage = optionStats
                      ? ((optionStats.stakes / (selectedPollStats?.data?.totalStakes || 1)) * 100).toFixed(1)
                      : "0.0";

                    return (
                      <SelectItem key={option.id} value={option.id} className="text-[#EDEDED] hover:bg-[#151515]">
                        <div className="flex items-center justify-between w-full">
                          <span>{option.text}</span>
                          {optionStats && optionStats.stakes > 0 && (
                            <span className="text-xs text-[#9A9A9A] ml-2">
                              {percentage}% • {optionStats.odds.toFixed(2)}x
                            </span>
                          )}
                        </div>
                      </SelectItem>
                    );
                  })}
                </SelectContent>
              </Select>
            </div>

            {selectedOption && (
              <>
                <div className="space-y-2">
                  <Label className="text-sm text-[#9A9A9A]">Amount (USDC)</Label>
                  <Input
                    type="number"
                    step="0.0001"
                    placeholder="Enter amount"
                    value={stakeAmount}
                    onChange={(e) => setStakeAmount(e.target.value)}
                    min={minStake}
                    className="bg-[#151515] border-[#1F1F1F] text-[#EDEDED] rounded-xl"
                  />
                  <div className="flex gap-2 mt-2 flex-wrap">
                    {quickAmounts.map((amount) => (
                      <Button
                        key={amount}
                        onClick={() => setStakeAmount(amount.toString())}
                        variant="outline"
                        size="sm"
                        className="rounded-lg border-[#1F1F1F] text-[#D8D8D8] hover:bg-[#151515] text-xs h-8"
                      >
                        {numeral(amount).format("0,0.00")}
                      </Button>
                    ))}
                  </div>
                </div>

                {winningsData?.data && parseFloat(stakeAmount) >= minStake && (
                  <div className="p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/20">
                    <div className="flex justify-between text-sm mb-1">
                      <span className="text-[#9A9A9A]">Share</span>
                      <span className="text-[#EDEDED] font-medium">
                        {winningsData.data.userSharePercentage.toFixed(2)}%
                      </span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-[#9A9A9A]">Potential Win</span>
                      <span className="text-emerald-400 font-medium">
                        {winningsData.data.grossWinnings.toLocaleString()} USDC
                      </span>
                    </div>
                  </div>
                )}

                <div className="p-3 rounded-xl bg-[#151515] border border-[#1F1F1F]">
                  <div className="flex justify-between text-sm mb-1">
                    <span className="text-[#9A9A9A]">Balance</span>
                    <span className="text-[#EDEDED] font-normal">{balance.toLocaleString()} USDC</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-[#9A9A9A]">After</span>
                    <span className={cn(
                      "font-normal",
                      parseFloat(stakeAmount) > balance ? "text-red-400" : "text-emerald-400"
                    )}>
                      {(balance - parseFloat(stakeAmount || "0")).toLocaleString()} USDC
                    </span>
                  </div>
                </div>

                <Button
                  onClick={handlePlaceStake}
                  disabled={createStakeMutation.isPending || !stakeAmount}
                  className="w-full h-12 rounded-full bg-[#EDEDED] hover:bg-[#D8D8D8] text-[#0A0A0A] font-medium transition-colors"
                >
                  {createStakeMutation.isPending ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Placing...
                    </>
                  ) : (
                    "Confirm Stake"
                  )}
                </Button>
              </>
            )}
          </div>
        </DialogContent>
      </Dialog>

      {/* View Options Dialog */}
      <Dialog
        open={viewOptionsDialogOpen}
        onOpenChange={(open) => {
          setViewOptionsDialogOpen(open);
          if (!open) setSelectedPoll(null);
        }}
      >
        <DialogContent className="bg-[#0A0A0A] border-[#1F1F1F] text-[#EDEDED] max-w-md mx-4">
          <DialogHeader>
            <DialogTitle className="text-xl font-semibold">Options</DialogTitle>
            <DialogDescription className="text-[#9A9A9A] line-clamp-2">
              {selectedPoll?.title}
            </DialogDescription>
          </DialogHeader>

          <div className="mt-2 max-h-[50vh] overflow-y-auto space-y-2">
            {selectedPoll?.options.map((option: any, index: number) => {
              const statisticsOption = selectedPoll?.statistics?.options?.find(
                (o: any) => o.id === option.id
              );
              const optionStakeAmount =
                statisticsOption?.stakeAmount || selectedPoll?.stakesPerOption?.[option.id] || 0;
              const totalStakeAmount = selectedPoll?.totalStakeAmount || 0;
              const percentage =
                statisticsOption?.percentage !== undefined
                  ? statisticsOption.percentage
                  : totalStakeAmount > 0
                  ? (optionStakeAmount / totalStakeAmount) * 100
                  : 0;
              const isWinner =
                selectedPoll.status === "resolved" &&
                (selectedPoll.winningOptionId === option.id || selectedPoll.correctOptionId === option.id);

              return (
                <div
                  key={option.id}
                  className={cn(
                    "p-3 rounded-xl border",
                    isWinner ? "bg-emerald-500/10 border-emerald-500/20" : "bg-[#151515] border-[#1F1F1F]"
                  )}
                >
                  <div className="flex items-center justify-between mb-2">
                    <span className="font-normal text-[#EDEDED] text-sm flex items-center gap-2">
                      <span className="text-[#9A9A9A]">#{index + 1}</span>
                      {option.text}
                      {isWinner && (
                        <Trophy className="w-3.5 h-3.5 text-emerald-400" />
                      )}
                    </span>
                    <span
                      className={cn(
                        "text-sm font-medium",
                        isWinner ? "text-emerald-400" : "text-cyan-400"
                      )}
                    >
                      {percentage.toFixed(1)}%
                    </span>
                  </div>
                  <div className="h-1.5 bg-[#1F1F1F] rounded-full overflow-hidden">
                    <div
                      className="h-full rounded-full transition-all duration-500"
                      style={{
                        width: `${Math.min(percentage, 100)}%`,
                        background: isWinner
                          ? "linear-gradient(to right, rgb(16 185 129), rgb(20 184 166))"
                          : "linear-gradient(to right, rgb(34 211 238), rgb(6 182 212))",
                      }}
                    />
                  </div>
                </div>
              );
            })}
          </div>

          {/* Summary */}
          <div className="mt-4 p-3 rounded-xl bg-[#151515] border border-[#1F1F1F]">
            <div className="grid grid-cols-3 gap-3 text-center">
              <div>
                <p className="text-xs text-[#9A9A9A]">Pool</p>
                <p className="text-sm font-medium text-[#D8D8D8] inline-flex items-center justify-center gap-1">
                  <Image src="/usdc.svg" alt="USDC" width={12} height={12} />
                  {numeral(selectedPoll?.totalStakeAmount || 0).format("0,0.00")}
                </p>
              </div>
              <div>
                <p className="text-xs text-[#9A9A9A]">Players</p>
                <p className="text-sm font-medium text-[#EDEDED]">{selectedPoll?.totalParticipants || 0}</p>
              </div>
              <div>
                <p className="text-xs text-[#9A9A9A]">Options</p>
                <p className="text-sm font-medium text-[#D8D8D8]">{selectedPoll?.options.length || 0}</p>
              </div>
            </div>
          </div>

          <div className="flex gap-2 mt-4">
            {selectedPoll?.status === "active" && (
              <Button
                onClick={() => {
                  setViewOptionsDialogOpen(false);
                  if (!hasUserStaked(selectedPoll)) handleStakeClick(selectedPoll);
                }}
                disabled={hasUserStaked(selectedPoll)}
                className={cn(
                  "flex-1 h-11 rounded-full font-medium transition-colors",
                  hasUserStaked(selectedPoll)
                    ? "bg-[#151515] text-[#9A9A9A] cursor-not-allowed"
                    : "bg-[#EDEDED] hover:bg-[#D8D8D8] text-[#0A0A0A]"
                )}
              >
                <Coins className="w-4 h-4 mr-2" />
                {hasUserStaked(selectedPoll) ? "Staked" : "Stake"}
              </Button>
            )}
            <Button
              onClick={() => router.push(`/polls/${selectedPoll?.id}`)}
              variant="outline"
              className="flex-1 h-11 rounded-xl border-[#1F1F1F] text-[#D8D8D8] hover:bg-[#151515]"
            >
              View Details
              <ChevronRight className="w-4 h-4 ml-1" />
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Admin Dialog */}
      {(isAdmin || isSubAdmin) && (
        <Dialog open={isAdminDialogOpen} onOpenChange={setIsAdminDialogOpen}>
          <DialogContent className="bg-[#0A0A0A] border-[#1F1F1F] text-[#EDEDED] max-w-md mx-4">
            <DialogHeader>
              <DialogTitle className="text-xl font-semibold">Manage Poll</DialogTitle>
              <DialogDescription className="text-[#9A9A9A] line-clamp-2">
                {selectedPoll?.title}
              </DialogDescription>
            </DialogHeader>

            <div className="space-y-4 mt-2">
              <div className="space-y-2">
                <Label className="text-sm text-[#9A9A9A]">Action</Label>
                <Select value={adminAction} onValueChange={(value: any) => setAdminAction(value)}>
                  <SelectTrigger className="bg-[#151515] border-[#1F1F1F] text-[#EDEDED] rounded-xl">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="bg-[#0A0A0A] border-[#1F1F1F]">
                    {selectedPoll?.status === "active" && (
                      <SelectItem value="close" className="text-[#EDEDED] hover:bg-[#151515]">
                        Close Poll
                      </SelectItem>
                    )}
                    {isAdmin && (
                      <SelectItem value="resolve" className="text-[#EDEDED] hover:bg-[#151515]">
                        {selectedPoll?.status === "active" ? "Close & Select Winner" : "Select Winner"}
                      </SelectItem>
                    )}
                    <SelectItem value="cancel" className="text-[#EDEDED] hover:bg-[#151515]">
                      Cancel (Refund)
                    </SelectItem>
                    {isAdmin && (
                      <SelectItem value="delete" className="text-[#EDEDED] hover:bg-[#151515]">
                        Delete Poll
                      </SelectItem>
                    )}
                  </SelectContent>
                </Select>
              </div>

              {adminAction === "resolve" && isAdmin && (
                <div className="space-y-2">
                  <Label className="text-sm text-[#9A9A9A]">Winner</Label>
                  <Select value={selectedWinnerId} onValueChange={setSelectedWinnerId}>
                    <SelectTrigger className="bg-[#151515] border-[#1F1F1F] text-[#EDEDED] rounded-xl">
                      <SelectValue placeholder="Choose winning option" />
                    </SelectTrigger>
                    <SelectContent className="bg-[#0A0A0A] border-[#1F1F1F]">
                      {selectedPoll?.options.map((option) => (
                        <SelectItem key={option.id} value={option.id || ""} className="text-[#EDEDED] hover:bg-[#151515]">
                          {option.text}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              )}

              {adminAction === "close" && (
                <p className="text-amber-400 text-sm font-light">Closes poll and prevents new stakes.</p>
              )}
              {adminAction === "cancel" && (
                <p className="text-amber-400 text-sm font-light">Cancels poll and refunds all stakes.</p>
              )}
              {adminAction === "delete" && (
                <p className="text-red-400 text-sm font-light">Permanently deletes the poll.</p>
              )}

              <Button
                onClick={handleAdminAction}
                disabled={
                  closePollMutation.isPending ||
                  resolvePollMutation.isPending ||
                  cancelPollMutation.isPending ||
                  deletePollMutation.isPending ||
                  (adminAction === "resolve" && !selectedWinnerId)
                }
                className="w-full h-11 rounded-full bg-red-500 hover:bg-red-600 text-white font-medium transition-colors"
              >
                {closePollMutation.isPending ||
                resolvePollMutation.isPending ||
                cancelPollMutation.isPending ||
                deletePollMutation.isPending ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Processing...
                  </>
                ) : (
                  "Confirm"
                )}
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      )}

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
    </div>
  );
}
