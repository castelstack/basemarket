"use client";

import InsufficientBalanceModal from "@/components/modals/InsufficientBalanceModal";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
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
import { getCategoryBadge, getStatusBadge } from "@/lib/poll-badges";
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
  ArrowRight,
  Coins,
  Eye,
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
  const itemsPerPage = 9;

  // Build API parameters
  const apiParams = {
    page: currentPage,
    limit: itemsPerPage,
    search: searchQuery || undefined,
    status: selectedStatus === "all" ? undefined : selectedStatus,
    category: selectedCategory === "all" ? undefined : selectedCategory,
    sortBy,
    sortOrder,
  };

  const { data, isLoading, isError, refetch } = useAllPolls(apiParams);
  const { data: limitsData } = usePlatformLimits();
  const platformLimits = limitsData?.data;
  const minStake = platformLimits?.minStakeAmount || 100; // Default to 100 if not loaded
  const maxStake = platformLimits?.maxStakeAmount || 10000;
  const closePollMutation = useClosePoll();
  const resolvePollMutation = useResolvePoll();
  const cancelPollMutation = useCancelPoll();
  const deletePollMutation = useDeletePoll();

  // Helper function to format numbers with k/m
  const formatNumber = (num: number) => {
    if (num >= 1000000) {
      return numeral(num).format("0.0a").toUpperCase();
    } else if (num >= 1000) {
      return numeral(num).format("0.0a");
    }
    return numeral(num).format("0,0");
  };

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

  // Get poll stats for the selected poll
  const { data: selectedPollStats } = usePollStats(selectedPoll?.id || "");

  // Calculate potential winnings
  const { data: winningsData } = useCalculateWinnings({
    pollId: selectedPoll?.id || "",
    selectedOptionId: selectedOption?.id || "",
    amount: parseInt(stakeAmount) || 0,
  });

  // Get polls from API with new format
  const responseData = data?.data as any;
  const polls: Poll[] = responseData?.docs || [];
  const totalPages = responseData?.totalPages || 1;
  const hasNextPage = responseData?.hasNextPage || false;
  const hasPrevPage = responseData?.hasPrevPage || false;
  const totalDocs = responseData?.totalDocs || 0;

  // Polls are now filtered on the server, so we use them directly
  const filteredPolls = polls;

  // Add 'All' option to categories
  const allCategories = [
    { value: "all", label: "All Categories" },
    ...POLL_CATEGORIES,
  ];

  // Check if user has already staked on a poll
  const hasUserStaked = (poll: Poll) => {
    if (!user || !poll.statistics?.stakerUserIds) return false;
    return poll.statistics.stakerUserIds.includes(user.id);
  };

  const handleStakeClick = (poll: Poll, option?: PollOption) => {
    if (poll.status !== "active") {
      toast.error("This poll is closed for staking!");
      return;
    }
    if (!user) {
      toast.error("Please login to place a stake!");
      router.push("/");
      return;
    }
    if (hasUserStaked(poll)) {
      toast.error("You have already placed a stake on this poll!");
      return;
    }
    setSelectedPoll(poll);
    setSelectedOption(option || null);
    setIsStakeDialogOpen(true);
  };

  const handlePlaceStake = () => {
    if (!selectedPoll || !selectedOption || !stakeAmount) return;

    // Check if poll has expired
    const timeLeft =
      new Date(selectedPoll?.endTime ?? 0).getTime() - Date.now();
    if (timeLeft <= 0) {
      toast.error("This poll has ended. Stakes are no longer accepted.");
      return;
    }

    const amount = parseInt(stakeAmount);
    if (amount < minStake) {
      toast.error(`Minimum stake is ₦${minStake} fam!`);
      return;
    }
    if (amount > maxStake) {
      toast.error(`Maximum stake is ₦${maxStake.toLocaleString()}!`);
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
          toast.success(
            `Stake placed! ₦${amount.toLocaleString()} on ${
              selectedOption.text
            }`
          );
          setIsStakeDialogOpen(false);
          setStakeAmount("");
          setSelectedOption(null);
          setSelectedPoll(null);
          refetch();
        },
        onError: (error: any) => {
          toast.error(
            error?.response?.data?.message || "Failed to place stake"
          );
        },
      }
    );
  };

  const handleAdminAction = () => {
    if (!selectedPoll) return;

    if (adminAction === "close") {
      closePollMutation.mutate(selectedPoll.id, {
        onSuccess: () => {
          toast.success("Poll closed successfully! Stakes are now locked.");
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

      // Close first if active, then resolve
      if (selectedPoll.status === "active") {
        closePollMutation.mutate(selectedPoll.id, {
          onSuccess: () => {
            resolvePollMutation.mutate(
              {
                id: selectedPoll.id,
                data: { correctOptionId: selectedWinnerId },
              },
              {
                onSuccess: () => {
                  toast.success(
                    "Poll closed and winner selected successfully!"
                  );
                  setIsAdminDialogOpen(false);
                  setSelectedWinnerId("");
                  refetch();
                },
                onError: (error: any) => {
                  toast.error(
                    error?.response?.data?.message || "Failed to resolve poll"
                  );
                },
              }
            );
          },
          onError: (error: any) => {
            toast.error(
              error?.response?.data?.message || "Failed to close poll"
            );
          },
        });
      } else {
        // Already closed, just resolve
        resolvePollMutation.mutate(
          {
            id: selectedPoll.id,
            data: { correctOptionId: selectedWinnerId },
          },
          {
            onSuccess: () => {
              toast.success("Poll resolved successfully!");
              setIsAdminDialogOpen(false);
              setSelectedWinnerId("");
              refetch();
            },
            onError: (error: any) => {
              toast.error(
                error?.response?.data?.message || "Failed to resolve poll"
              );
            },
          }
        );
      }
    } else if (adminAction === "cancel") {
      cancelPollMutation.mutate(selectedPoll.id, {
        onSuccess: () => {
          toast.success("Poll cancelled and stakes refunded");
          setIsAdminDialogOpen(false);
          refetch();
        },
        onError: (error: any) => {
          toast.error(
            error?.response?.data?.message || "Failed to cancel poll"
          );
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
          toast.error(
            error?.response?.data?.message || "Failed to delete poll"
          );
        },
      });
    }
  };

  const quickAmounts = [100, 500, 1000, 5000];

  return (
    <div className="min-h-screen bg-black">
      {/* Background Effects */}
      <div className="fixed inset-0 bg-gradient-to-br from-violet-950/20 via-black to-pink-950/20" />
      <div className="fixed inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-purple-900/10 via-transparent to-transparent" />

      <div className="relative max-w-7xl mx-auto px-3 sm:px-4 md:px-6 lg:px-8 py-4 sm:py-6 md:py-8">
        {/* Header */}
        <div className="mb-4 sm:mb-6 md:mb-8">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 sm:gap-4 mb-4 sm:mb-6">
            <div>
              <h1 className="text-3xl sm:text-4xl font-black mb-1 sm:mb-2">
                <span className="bg-gradient-to-r from-violet-400 via-pink-400 to-orange-400 bg-clip-text text-transparent">
                  Active Predictions
                </span>
              </h1>
              <p className="text-gray-400 text-sm sm:text-base">
                Pick your winners and stack your cash
              </p>
            </div>

            {/* Create Poll Button - Shows for Admin and Sub-Admin */}
            {user && (isAdmin || isSubAdmin) ? (
              <Link href="/admin/create">
                <Button className="bg-gradient-to-r from-violet-500 to-pink-500 hover:from-violet-600 hover:to-pink-600 font-bold shadow-lg shadow-purple-500/25 text-sm sm:text-base px-4 py-2">
                  <Plus className="w-4 h-4 sm:w-5 sm:h-5 mr-2" />
                  <span className="hidden sm:inline">Create Poll</span>
                  <span className="sm:hidden">Create</span>
                </Button>
              </Link>
            ) : null}
          </div>

          {/* Stats Bar */}
          {/* <div className='grid grid-cols-2 sm:grid-cols-4 gap-2 sm:gap-3 md:gap-4 mb-4 sm:mb-6'>
            <div className='p-3 sm:p-4 rounded-xl sm:rounded-2xl bg-white/5 backdrop-blur-sm border border-white/10'>
              <div className='flex items-center gap-2 mb-1'>
                <Flame className='w-4 h-4 text-orange-400' />
                <span className='text-xs text-gray-500'>Active Polls</span>
              </div>
              <p className='text-xl sm:text-2xl font-bold text-white'>
                {polls.filter((p) => p.status === 'active').length}
              </p>
            </div>
            <div className='p-3 sm:p-4 rounded-xl sm:rounded-2xl bg-white/5 backdrop-blur-sm border border-white/10'>
              <div className='flex items-center gap-2 mb-1'>
                <Users className='w-4 h-4 text-blue-400' />
                <span className='text-xs text-gray-500'>Total Players</span>
              </div>
              <p className='text-xl sm:text-2xl font-bold text-white'>
                {polls.reduce(
                  (acc, p: any) => acc + (p.totalParticipants || 0),
                  0
                )}
              </p>
            </div>
            <div className='p-3 sm:p-4 rounded-xl sm:rounded-2xl bg-white/5 backdrop-blur-sm border border-white/10'>
              <div className='flex items-center gap-2 mb-1'>
                <DollarSign className='w-4 h-4 text-emerald-400' />
                <span className='text-xs text-gray-500'>Total Pool</span>
              </div>
              <p className='text-xl sm:text-2xl font-bold text-emerald-400'>
                ₦
                {formatNumber(
                  polls.reduce(
                    (acc, p: any) => acc + (p.totalStakeAmount || 0),
                    0
                  )
                )}
              </p>
            </div>
            <div className='p-3 sm:p-4 rounded-xl sm:rounded-2xl bg-white/5 backdrop-blur-sm border border-white/10'>
              <div className='flex items-center gap-2 mb-1'>
                <Coins className='w-4 h-4 text-amber-400' />
                <span className='text-xs text-gray-500'>Your Balance</span>
              </div>
              <p className='text-xl sm:text-2xl font-bold text-amber-400'>
                ₦{formatNumber(balance)}
              </p>
            </div>
          </div> */}

          {/* Filters */}
          <div className="space-y-3 sm:space-y-4">
            {/* All Filters in Responsive Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
              {/* Search Bar */}
              <div className="relative sm:col-span-2 lg:col-span-1">
                <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-500 w-5 h-5" />
                <Input
                  type="text"
                  placeholder="Search polls..."
                  value={searchQuery}
                  onChange={(e) => {
                    setSearchQuery(e.target.value);
                    setCurrentPage(1);
                  }}
                  className="pl-12 h-10 sm:h-12 bg-white/5 border-white/10 text-white placeholder-gray-500 rounded-xl focus:border-violet-500/50 focus:bg-white/10 text-sm sm:text-base w-full"
                />
              </div>

              {/* Category Select */}
              <div>
                <Select
                  value={selectedCategory}
                  onValueChange={(value) => {
                    setSelectedCategory(value);
                    setCurrentPage(1);
                  }}
                >
                  <SelectTrigger className="h-10 sm:h-12 bg-white/5 border-white/10 text-white rounded-xl hover:bg-white/10 w-full">
                    <SelectValue placeholder="Category" />
                  </SelectTrigger>
                  <SelectContent className="bg-black border-white/10 rounded-xl">
                    {allCategories.map((cat) => (
                      <SelectItem
                        key={cat.value}
                        value={cat.value}
                        className="text-white hover:bg-white/10"
                      >
                        {cat.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Status Select */}
              <div>
                <Select
                  value={selectedStatus}
                  onValueChange={(value) => {
                    setSelectedStatus(value);
                    setCurrentPage(1);
                  }}
                >
                  <SelectTrigger className="h-10 sm:h-12 bg-white/5 border-white/10 text-white rounded-xl hover:bg-white/10 w-full">
                    <SelectValue placeholder="Status" />
                  </SelectTrigger>
                  <SelectContent className="bg-black border-white/10 rounded-xl">
                    <SelectItem
                      value="all"
                      className="text-white hover:bg-white/10"
                    >
                      All Status
                    </SelectItem>
                    <SelectItem
                      value="active"
                      className="text-white hover:bg-white/10"
                    >
                      Active
                    </SelectItem>
                    <SelectItem
                      value="closed"
                      className="text-white hover:bg-white/10"
                    >
                      Closed
                    </SelectItem>
                    <SelectItem
                      value="resolved"
                      className="text-white hover:bg-white/10"
                    >
                      Resolved
                    </SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Sort Select */}
              <div className="flex gap-2">
                <Select
                  value={sortBy}
                  onValueChange={(value) => {
                    setSortBy(value);
                    setCurrentPage(1);
                  }}
                >
                  <SelectTrigger className="h-10 sm:h-12 bg-white/5 border-white/10 text-white rounded-xl hover:bg-white/10 flex-1">
                    <SelectValue placeholder="Sort by" />
                  </SelectTrigger>
                  <SelectContent className="bg-black border-white/10 rounded-xl">
                    <SelectItem
                      value="createdAt"
                      className="text-white hover:bg-white/10"
                    >
                      Latest
                    </SelectItem>
                    <SelectItem
                      value="endTime"
                      className="text-white hover:bg-white/10"
                    >
                      Ending Soon
                    </SelectItem>
                    <SelectItem
                      value="totalStakeAmount"
                      className="text-white hover:bg-white/10"
                    >
                      Pool Size
                    </SelectItem>
                    <SelectItem
                      value="totalParticipants"
                      className="text-white hover:bg-white/10"
                    >
                      Popular
                    </SelectItem>
                  </SelectContent>
                </Select>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => {
                    setSortOrder(sortOrder === "asc" ? "desc" : "asc");
                    setCurrentPage(1);
                  }}
                  className="border-white/20 text-gray-300 hover:bg-white/10 h-10 sm:h-12 px-3"
                  title={
                    sortOrder === "desc" ? "Sort Descending" : "Sort Ascending"
                  }
                >
                  {sortOrder === "desc" ? "↓" : "↑"}
                </Button>
              </div>
            </div>
          </div>
        </div>

        {/* Polls Grid */}
        {isLoading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
            {[...Array(6)].map((_, i) => (
              <div
                key={i}
                className="h-96 rounded-2xl bg-white/5 animate-pulse"
              />
            ))}
          </div>
        ) : filteredPolls.length === 0 ? (
          <div className="text-center py-12 sm:py-20">
            <Trophy className="w-12 h-12 sm:w-16 sm:h-16 text-gray-600 mx-auto mb-3 sm:mb-4" />
            <h3 className="text-lg sm:text-xl font-bold text-white mb-1 sm:mb-2">
              No polls found
            </h3>
            <p className="text-gray-400">
              Try adjusting your filters or check back later
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
            {filteredPolls.map((poll: any) => {
              const timeLeft = new Date(poll.endTime).getTime() - Date.now();
              const daysLeft = Math.ceil(timeLeft / (1000 * 60 * 60 * 24));
              const isExpired = timeLeft <= 0;

              return (
                <Card
                  key={poll.id}
                  className="group bg-white/5 backdrop-blur-sm border-white/10 hover:bg-white/10 hover:border-violet-500/30 transition-all overflow-hidden relative cursor-pointer"
                  onClick={(e) => {
                    // Navigate to details page unless clicking on a button
                    if (!(e.target as HTMLElement).closest("button")) {
                      router.push(`/polls/${poll.id}`);
                    }
                  }}
                >
                  {/* Click indicator */}
                  <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity z-10">
                    <div className="bg-violet-500/20 backdrop-blur-sm rounded-full p-1.5">
                      <ArrowRight className="w-4 h-4 text-violet-400" />
                    </div>
                  </div>
                  <CardHeader className="pb-4">
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex gap-2 flex-wrap">
                        {getStatusBadge(poll.status)}
                        {getCategoryBadge(poll.category)}
                        {hasUserStaked(poll) && (
                          <Badge className="bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                            ✓ Staked
                          </Badge>
                        )}
                      </div>
                      {poll.status === "active" && timeLeft > 0 && (
                        <Badge
                          variant="outline"
                          className="border-red-500/30 text-red-400 whitespace-nowrap"
                        >
                          <Timer className="w-3 h-3 mr-1" />
                          {daysLeft}d left
                        </Badge>
                      )}
                    </div>
                    <CardTitle className="text-xl font-bold text-white group-hover:text-transparent group-hover:bg-gradient-to-r group-hover:from-violet-400 group-hover:to-pink-400 group-hover:bg-clip-text transition-all line-clamp-2">
                      {poll.title}
                    </CardTitle>
                    <CardDescription className="text-gray-400 line-clamp-2">
                      {poll.description}
                    </CardDescription>
                  </CardHeader>

                  <CardContent className="space-y-4">
                    {/* Poll Stats */}
                    <div className="grid grid-cols-3 gap-2 p-3 rounded-xl bg-black/30">
                      <div className="text-center">
                        <p className="text-xs text-gray-500">Pool</p>
                        <p className="text-sm font-bold text-emerald-400">
                          ₦{formatNumber(poll.totalStakeAmount || 0)}
                        </p>
                      </div>
                      <div className="text-center border-x border-white/10">
                        <p className="text-xs text-gray-500">Players</p>
                        <p className="text-sm font-bold text-white">
                          {poll.totalParticipants || 0}
                        </p>
                      </div>
                      <div className="text-center">
                        <p className="text-xs text-gray-500">Min Stake</p>
                        <p className="text-sm font-bold text-amber-400">
                          ₦{minStake}
                        </p>
                      </div>
                    </div>

                    {/* Options Count */}
                    <div className="p-3 rounded-xl bg-gradient-to-r from-violet-500/10 to-pink-500/10 border border-violet-500/20">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-xs text-gray-400">
                            Options Available
                          </p>
                          <p className="text-lg font-bold text-white">
                            {poll.options.length}
                          </p>
                        </div>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={(e) => {
                            e.stopPropagation();
                            setSelectedPoll(poll);
                            setViewOptionsDialogOpen(true);
                          }}
                          className="border-violet-500/30 text-violet-400 hover:bg-violet-500/10 hover:text-violet-300"
                        >
                          <Eye className="w-4 h-4 mr-1" />
                          View Options
                        </Button>
                      </div>
                    </div>

                    {/* Action Buttons */}
                    <div className="flex gap-2">
                      {poll.status === "active" && (
                        <Button
                          onClick={(e) => {
                            e.stopPropagation();
                            if (!isExpired && !hasUserStaked(poll)) {
                              handleStakeClick(poll);
                            }
                          }}
                          disabled={isExpired || hasUserStaked(poll)}
                          className={`flex-1 rounded-xl font-bold ${
                            isExpired || hasUserStaked(poll)
                              ? "bg-gray-600 cursor-not-allowed opacity-50"
                              : "bg-gradient-to-r from-violet-500 to-pink-500 hover:from-violet-600 hover:to-pink-600"
                          }`}
                        >
                          {isExpired
                            ? "Poll Ended"
                            : hasUserStaked(poll)
                            ? "Already Staked"
                            : "Place Your Stake"}
                          <Coins className="w-4 h-4 ml-2" />
                        </Button>
                      )}
                    </div>

                    {/* Admin Actions */}
                    {(isAdmin || isSubAdmin) &&
                      (poll.status === "active" ||
                        poll.status === "closed") && (
                        <Button
                          onClick={(e) => {
                            e.stopPropagation();
                            setSelectedPoll(poll);
                            setIsAdminDialogOpen(true);
                          }}
                          variant="outline"
                          className="w-full rounded-xl border-white/20 text-gray-400 hover:text-white hover:bg-white/10"
                        >
                          <Settings className="w-4 h-4 mr-2" />
                          Manage Poll
                        </Button>
                      )}
                  </CardContent>
                </Card>
              );
            })}
          </div>
        )}

        {/* Pagination Controls */}
        {!isLoading && (
          <Pagination
            currentPage={currentPage}
            totalPages={totalPages}
            totalDocs={totalDocs}
            hasNextPage={hasNextPage}
            hasPrevPage={hasPrevPage}
            onPageChange={setCurrentPage}
            itemName="polls"
            className="mt-8"
          />
        )}
      </div>

      {/* Stake Dialog */}
      <Dialog
        open={isStakeDialogOpen}
        onOpenChange={(open) => {
          setIsStakeDialogOpen(open);
          if (!open) {
            // Reset state when dialog closes
            setSelectedOption(null);
            setStakeAmount("");
            setSelectedPoll(null);
          }
        }}
      >
        <DialogContent className="bg-black/95 backdrop-blur-xl border-white/10 text-white">
          <DialogHeader>
            <DialogTitle className="text-2xl font-bold bg-gradient-to-r from-violet-400 to-pink-400 bg-clip-text text-transparent">
              Place Your Stake
            </DialogTitle>
            <DialogDescription className="text-gray-400">
              {selectedPoll?.title}
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 mt-4">
            <div className="space-y-2">
              <Label className="text-gray-300">Select your prediction</Label>
              <Select
                value={selectedOption?.id || ""}
                onValueChange={(value) => {
                  const option = selectedPoll?.options.find(
                    (opt: any) => opt.id === value
                  );
                  setSelectedOption(option || null);
                }}
              >
                <SelectTrigger className="bg-white/5 border-white/10 text-white rounded-xl">
                  <SelectValue placeholder="Choose an option" />
                </SelectTrigger>
                <SelectContent className="bg-black border-white/10 max-h-[300px]">
                  {selectedPoll?.options.map((option: any) => {
                    const optionStats =
                      selectedPollStats?.data?.optionStats?.find(
                        (s: any) => s.optionId === option.id
                      );
                    const percentage = optionStats
                      ? (
                          (optionStats.stakes /
                            (selectedPollStats?.data?.totalStakes || 1)) *
                          100
                        ).toFixed(1)
                      : "0.0";

                    return (
                      <SelectItem
                        key={option.id}
                        value={option.id}
                        className="text-white hover:bg-white/10"
                      >
                        <div className="flex items-center justify-between w-full">
                          <span>{option.text}</span>
                          {optionStats && optionStats.stakes > 0 && (
                            <span className="text-xs text-gray-400 ml-2">
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
                  <Label>Stake Amount (₦)</Label>
                  <Input
                    type="number"
                    placeholder="Enter amount"
                    value={stakeAmount}
                    onChange={(e) => setStakeAmount(e.target.value)}
                    min="100"
                    className="bg-white/5 border-white/10 text-white placeholder-gray-500 rounded-xl"
                  />
                  <div className="flex gap-2 mt-2">
                    {quickAmounts.map((amount) => (
                      <Button
                        key={amount}
                        onClick={() => setStakeAmount(amount.toString())}
                        variant="outline"
                        size="sm"
                        className="rounded-lg border-white/20 text-white hover:bg-white/10"
                      >
                        ₦{amount.toLocaleString()}
                      </Button>
                    ))}
                  </div>
                </div>

                {/* Potential Winnings */}
                {winningsData?.data && parseInt(stakeAmount) >= 100 && (
                  <div className="p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/30">
                    <div className="flex justify-between text-sm mb-1">
                      <span className="text-gray-400">Share Percentage</span>
                      <span className="text-white font-bold">
                        {winningsData.data.userSharePercentage.toFixed(2)}%
                      </span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-400">Potential Win</span>
                      <span className="text-emerald-400 font-bold">
                        ₦{winningsData.data.grossWinnings.toLocaleString()}
                      </span>
                    </div>
                  </div>
                )}

                <div className="p-4 rounded-xl bg-white/5 border border-white/10">
                  <div className="flex justify-between text-sm mb-2">
                    <span className="text-gray-400">Your Balance</span>
                    <span className="text-white font-bold">
                      ₦{balance.toLocaleString()}
                    </span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-400">After Stake</span>
                    <span
                      className={cn(
                        "font-bold",
                        parseInt(stakeAmount) > balance
                          ? "text-red-400"
                          : "text-emerald-400"
                      )}
                    >
                      ₦
                      {(
                        balance - parseInt(stakeAmount || "0")
                      ).toLocaleString()}
                    </span>
                  </div>
                </div>

                <Button
                  onClick={handlePlaceStake}
                  disabled={createStakeMutation.isPending || !stakeAmount}
                  className="w-full rounded-xl bg-gradient-to-r from-violet-500 to-pink-500 hover:from-violet-600 hover:to-pink-600 font-bold"
                >
                  {createStakeMutation.isPending ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Placing Stake...
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
          if (!open) {
            setSelectedPoll(null);
          }
        }}
      >
        <DialogContent className="bg-black/95 backdrop-blur-xl border-white/10 text-white max-w-2xl">
          <DialogHeader>
            <DialogTitle className="text-2xl font-bold bg-gradient-to-r from-violet-400 to-pink-400 bg-clip-text text-transparent">
              Poll Options
            </DialogTitle>
            <DialogDescription className="text-gray-400">
              {selectedPoll?.title}
            </DialogDescription>
          </DialogHeader>

          <div className="mt-4 max-h-[60vh] overflow-y-auto pr-2">
            <div className="space-y-3">
              {selectedPoll?.options.map((option: any, index: number) => {
                // First check if statistics has the option data with percentage
                const statisticsOption =
                  selectedPoll?.statistics?.options?.find(
                    (o: any) => o.id === option.id
                  );

                const optionStakeAmount =
                  statisticsOption?.stakeAmount ||
                  selectedPoll?.stakesPerOption?.[option.id] ||
                  0;
                const totalStakeAmount = selectedPoll?.totalStakeAmount || 0;

                // Use percentage from API if available, otherwise calculate
                const percentage =
                  statisticsOption?.percentage !== undefined
                    ? statisticsOption.percentage
                    : totalStakeAmount > 0
                    ? (optionStakeAmount / totalStakeAmount) * 100
                    : 0;
                const isWinner =
                  selectedPoll.status === "resolved" &&
                  (selectedPoll.winningOptionId === option.id ||
                    selectedPoll.correctOptionId === option.id);

                return (
                  <div
                    key={option.id}
                    className={cn(
                      "p-4 rounded-xl border transition-all",
                      isWinner
                        ? "bg-emerald-500/10 border-emerald-500/30"
                        : "bg-white/5 border-white/10"
                    )}
                  >
                    <div className="flex items-center justify-between mb-2">
                      <span className="font-medium text-white flex items-center gap-2">
                        <span className="text-gray-500">#{index + 1}</span>
                        {option.text}
                        {isWinner && (
                          <Badge className="bg-emerald-500/20 text-emerald-400 border-emerald-500/30">
                            <Trophy className="w-3 h-3 mr-1" />
                            Winner
                          </Badge>
                        )}
                      </span>
                      <div className="flex items-center gap-2">
                        <Badge
                          variant="secondary"
                          className={cn(
                            isWinner
                              ? "bg-emerald-500/20 text-emerald-400 border-emerald-500/30"
                              : "bg-violet-500/20 text-violet-400 border-violet-500/30"
                          )}
                        >
                          {percentage.toFixed(1)}%
                        </Badge>
                      </div>
                    </div>

                    {/* Progress Bar */}
                    <div className="relative h-2 bg-white/10 rounded-full overflow-hidden">
                      <div
                        className="absolute inset-y-0 left-0 rounded-full transition-all duration-500"
                        style={{
                          width: `${Math.min(percentage, 100)}%`,
                          background: isWinner
                            ? "linear-gradient(to right, rgb(16 185 129), rgb(20 184 166))"
                            : "linear-gradient(to right, rgb(139 92 246), rgb(236 72 153))",
                        }}
                      />
                    </div>

                    {/* <div className='flex justify-between text-xs text-gray-400 mt-2'>
                      <span>₦{formatNumber(optionStakeAmount)} staked</span>
                      {selectedPoll.totalParticipants > 0 && (
                        <span>
                          {Math.round(
                            (optionStakeAmount / totalStakeAmount) * selectedPoll.totalParticipants
                          )} players
                        </span>
                      )}
                    </div> */}
                  </div>
                );
              })}
            </div>

            {/* Summary Stats */}
            <div className="mt-6 p-4 rounded-xl bg-gradient-to-r from-violet-500/10 to-pink-500/10 border border-violet-500/20">
              <div className="grid grid-cols-3 gap-4 text-center">
                <div>
                  <p className="text-xs text-gray-400">Total Pool</p>
                  <p className="text-lg font-bold text-emerald-400">
                    ₦{formatNumber(selectedPoll?.totalStakeAmount || 0)}
                  </p>
                </div>
                <div>
                  <p className="text-xs text-gray-400">Participants</p>
                  <p className="text-lg font-bold text-white">
                    {selectedPoll?.totalParticipants || 0}
                  </p>
                </div>
                <div>
                  <p className="text-xs text-gray-400">Options</p>
                  <p className="text-lg font-bold text-violet-400">
                    {selectedPoll?.options.length || 0}
                  </p>
                </div>
              </div>
            </div>
          </div>

          <div className="flex gap-3 max-sm:flex-col mt-6">
            {selectedPoll?.status === "active" && (
              <Button
                onClick={() => {
                  setViewOptionsDialogOpen(false);
                  if (!hasUserStaked(selectedPoll)) {
                    handleStakeClick(selectedPoll);
                  }
                }}
                disabled={hasUserStaked(selectedPoll)}
                className={`flex-1 font-bold rounded-xl ${
                  hasUserStaked(selectedPoll)
                    ? "bg-gray-600 cursor-not-allowed opacity-50"
                    : "bg-gradient-to-r from-violet-500 to-pink-500 hover:from-violet-600 hover:to-pink-600"
                }`}
              >
                <Coins className="w-4 h-4 mr-2" />
                {hasUserStaked(selectedPoll)
                  ? "Already Staked"
                  : "Place Your Stake"}
              </Button>
            )}
            <Button
              onClick={() => router.push(`/polls/${selectedPoll?.id}`)}
              variant="outline"
              className="flex-1 border-white/20 text-white hover:bg-white/10 rounded-xl"
            >
              <Eye className="w-4 h-4 mr-2" />
              View Full Details
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Admin Dialog */}
      {(isAdmin || isSubAdmin) && (
        <Dialog open={isAdminDialogOpen} onOpenChange={setIsAdminDialogOpen}>
          <DialogContent className="bg-black/95 backdrop-blur-xl border-white/10 text-white">
            <DialogHeader>
              <DialogTitle className="text-2xl font-bold">
                Manage Poll
              </DialogTitle>
              <DialogDescription className="text-gray-400">
                {selectedPoll?.title}
              </DialogDescription>
            </DialogHeader>

            <div className="space-y-4 mt-4">
              <div className="space-y-2">
                <Label>Select Action</Label>
                <Select
                  value={adminAction}
                  onValueChange={(value: any) => setAdminAction(value)}
                >
                  <SelectTrigger className="bg-white/5 border-white/10 text-white rounded-xl">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {selectedPoll?.status === "active" && (
                      <SelectItem value="close">
                        Close Poll (Stop Staking)
                      </SelectItem>
                    )}
                    {isAdmin && (
                      <SelectItem value="resolve">
                        {selectedPoll?.status === "active"
                          ? "Close & Select Winner"
                          : "Select Winner"}
                      </SelectItem>
                    )}
                    <SelectItem value="cancel">
                      Cancel Poll (Refund Stakes)
                    </SelectItem>
                    {isAdmin && (
                      <SelectItem value="delete">Delete Poll</SelectItem>
                    )}
                  </SelectContent>
                </Select>
              </div>

              {adminAction === "close" && (
                <p className="text-amber-400 text-sm">
                  This will close the poll and prevent new stakes. You can still
                  select a winner later.
                </p>
              )}

              {adminAction === "resolve" && isAdmin && (
                <div className="space-y-2">
                  <Label className="text-gray-300">Select Winner</Label>
                  <Select
                    value={selectedWinnerId}
                    onValueChange={setSelectedWinnerId}
                  >
                    <SelectTrigger className="bg-white/5 border-white/10 text-white rounded-xl">
                      <SelectValue placeholder="Choose winning option" />
                    </SelectTrigger>
                    <SelectContent className="bg-black border-white/10">
                      {selectedPoll?.options.map((option) => (
                        <SelectItem
                          key={option.id}
                          value={option.id || ""}
                          className="text-white hover:bg-white/10"
                        >
                          {option.text}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              )}

              {adminAction === "cancel" && (
                <p className="text-amber-400 text-sm">
                  This will cancel the poll and refund all stakes to users.
                </p>
              )}

              {adminAction === "delete" && (
                <p className="text-red-400 text-sm">
                  This will permanently delete the poll. This action cannot be
                  undone.
                </p>
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
                className="w-full rounded-xl bg-gradient-to-r from-red-500 to-pink-500 hover:from-red-600 hover:to-pink-600 font-bold"
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
                  "Confirm Action"
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
