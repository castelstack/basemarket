"use client";

import InsufficientBalanceModal from "@/components/modals/InsufficientBalanceModal";
import EditPollDialog from "@/components/dialogs/EditPollDialog";
import SharePollDialog from "@/components/dialogs/SharePollDialog";
import { Badge } from "@/components/ui/badge";
import { getStatusBadge, getCategoryBadge } from "@/lib/poll-badges";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
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
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { usePollById, usePollStats } from "@/lib/polls";
import { useCalculateWinnings, useCreateStake } from "@/lib/stakes";
import { usePlatformLimits } from "@/lib/platform-settings";
import { cn } from "@/lib/utils";
import { useAuthStore } from "@/stores/authStore";
import dayjs from "dayjs";
import relativeTime from "dayjs/plugin/relativeTime";
import {
  Activity,
  ArrowLeft,
  Calendar,
  Clock,
  Coins,
  DollarSign,
  Edit,
  Info,
  Loader2,
  Plus,
  Share2,
  Sparkles,
  Target,
  Timer,
  TrendingUp,
  Trophy,
  Users,
  XCircle,
} from "lucide-react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import numeral from "numeral";
import { useState, useEffect } from "react";
import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Legend,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { toast } from "sonner";
import { POLL_CATEGORIES } from "@/constants/categories";
import {
  trackPollView,
  trackStakePlaced,
  trackStakeAttemptFailed,
  trackPollShared,
} from "@/lib/analytics";

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
  const createStakeMutation = useCreateStake();

  // Calculate potential winnings
  const { data: winningsData } = useCalculateWinnings({
    pollId: pollId,
    selectedOptionId: selectedOptionId,
    amount: parseInt(stakeAmount) || 0,
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
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-violet-400 mb-4"></div>
          <p className="text-gray-400">Loading poll details...</p>
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
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="text-center">
          <XCircle className="w-12 h-12 text-red-400 mx-auto mb-4" />
          <h1 className="text-2xl font-bold text-white mb-4">Poll Not Found</h1>
          <p className="text-gray-400 mb-6">
            {` The poll you're looking for doesn't exist.`}
          </p>
          <Link href="/polls">
            <Button>
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

  // Prepare chart data
  const optionChartData =
    poll.options?.map((option: any) => {
      // First check if statistics has the option data with percentage
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

      // Use percentage from API if available
      const percentage =
        statisticsOption?.percentage !== undefined
          ? statisticsOption.percentage.toFixed(1)
          : totalAmount > 0
          ? ((optionAmount / totalAmount) * 100).toFixed(1)
          : "0";

      return {
        name: option.text,
        stakes: statisticsOption?.participantCount || optionStat?.stakes || 0,
        amount: optionAmount,
        percentage: percentage,
        odds: optionStat?.odds || 0,
      };
    }) || [];

  // Colors for charts
  const COLORS = [
    "#8b5cf6",
    "#ec4899",
    "#f97316",
    "#10b981",
    "#3b82f6",
    "#eab308",
    "#ef4444",
    "#06b6d4",
    "#84cc16",
    "#f43f5e",
  ];

  // Status colors and badges

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
      toast.error("Please login to place a stake!");
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

    const amount = parseInt(stakeAmount);
    if (amount < minStake) {
      toast.error(`Minimum stake is ₦${minStake}!`);
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

          toast.success(
            `Stake placed! ₦${amount.toLocaleString()} on ${
              selectedOption?.text
            }`
          );
          setIsStakeDialogOpen(false);
          setStakeAmount("");
          setSelectedOptionId("");
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

  const quickAmounts = [100, 500, 1000, 5000];
  const timeLeft = poll.endTime
    ? new Date(poll.endTime).getTime() - Date.now()
    : 0;
  const daysLeft = Math.ceil(timeLeft / (1000 * 60 * 60 * 24));

  return (
    <div className="min-h-screen bg-black">
      {/* Background */}
      <div className="fixed inset-0 bg-gradient-to-br from-violet-950/20 via-black to-pink-950/20" />
      <div className="fixed inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-purple-900/10 via-transparent to-transparent" />

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-4 mb-6">
            <Link href="/polls">
              <Button
                variant="outline"
                size="sm"
                className="border-white/20 text-white hover:bg-white/10"
              >
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back to Polls
              </Button>
            </Link>
          </div>

          <div className="bg-gradient-to-br from-violet-600/10 via-purple-600/5 to-pink-600/10 border border-white/10 rounded-2xl sm:rounded-3xl p-4 xs:p-6 sm:p-8">
            <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-4 mb-6">
              <div>
                <div className="flex items-center gap-3 mb-3 flex-wrap">
                  {getCategoryBadge(poll.category)}
                  {getStatusBadge(poll.status)}

                  {poll.status === "active" && timeLeft > 0 && (
                    <Badge
                      variant="outline"
                      className="border-red-500/30 text-red-400"
                    >
                      <Timer className="w-3 h-3 mr-1" />
                      {daysLeft}d left
                    </Badge>
                  )}
                </div>
                <h1 className="text-3xl sm:text-4xl font-black mb-3">
                  <span className="bg-gradient-to-r from-violet-400 via-pink-400 to-orange-400 bg-clip-text text-transparent">
                    {poll.title}
                  </span>
                </h1>
                <p className="text-gray-400 text-lg max-w-3xl">
                  {poll.description}
                </p>
              </div>
              <div className="flex flex-col lg:flex-row gap-3">
                <Button
                  size="icon"
                  variant="outline"
                  className="border-white/20 text-white hover:bg-white/10 w-12 h-12 rounded-xl"
                  onClick={() => setIsShareDialogOpen(true)}
                  title="Share Poll"
                >
                  <Share2 className="w-5 h-5" />
                </Button>
                {(isAdmin || isSubAdmin) && (
                  <Button
                    size="icon"
                    variant="outline"
                    className="border-white/20 text-white hover:bg-white/10 w-12 h-12 rounded-xl"
                    onClick={() => setIsEditDialogOpen(true)}
                    title="Edit Poll"
                  >
                    <Edit className="w-5 h-5" />
                  </Button>
                )}
                {poll.status === "active" && (
                  <Button
                    size="lg"
                    disabled={timeLeft <= 0 || hasUserStaked()}
                    className={`font-bold shadow-lg w-full lg:w-auto ${
                      timeLeft <= 0 || hasUserStaked()
                        ? "bg-gray-600 cursor-not-allowed opacity-50"
                        : "bg-gradient-to-r from-violet-500 to-pink-500 hover:from-violet-600 hover:to-pink-600 shadow-purple-500/25"
                    }`}
                    onClick={handleStakeClick}
                  >
                    <Coins className="w-4 sm:w-5 h-4 sm:h-5 mr-2" />
                    {timeLeft <= 0
                      ? "Poll Ended"
                      : hasUserStaked()
                      ? "Already Staked"
                      : "Place Your Stake"}
                  </Button>
                )}
              </div>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4">
              <div className="flex items-center gap-3">
                <Calendar className="w-5 h-5 text-gray-400" />
                <div>
                  <p className="text-gray-500 text-xs">Created</p>
                  <p className="text-white font-medium">
                    {dayjs(poll.createdAt).format("MMM D, YYYY")}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <Clock className="w-5 h-5 text-gray-400" />
                <div>
                  <p className="text-gray-500 text-xs">Ends</p>
                  <p className="text-white font-medium">
                    {poll.endTime
                      ? dayjs(poll.endTime).format("MMM D, h:mm A")
                      : "Manual"}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <Users className="w-5 h-5 text-gray-400" />
                <div>
                  <p className="text-gray-500 text-xs">Participants</p>
                  <p className="text-white font-medium">
                    {formatNumber(totalStakes)}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <DollarSign className="w-5 h-5 text-gray-400" />
                <div>
                  <p className="text-gray-500 text-xs">Total Pool</p>
                  <p className="text-emerald-400 font-medium">
                    ₦{formatNumber(totalAmount)}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Main Content Tabs */}
        <Tabs defaultValue="options" className="space-y-6">
          <TabsList className="bg-white/5 border border-white/10">
            <TabsTrigger value="options">Options & Stakes</TabsTrigger>
            <TabsTrigger value="analytics">Analytics</TabsTrigger>
            <TabsTrigger value="info">Information</TabsTrigger>
          </TabsList>

          {/* Options Tab */}
          <TabsContent value="options" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 items-start">
              {/* Options List */}
              <Card className="bg-white/5 backdrop-blur-sm border-white/10">
                <CardHeader>
                  <CardTitle className="text-white flex items-center gap-2">
                    <Target className="w-5 h-5 text-violet-400" />
                    Poll Options
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {/* Stake Button for Active Polls */}
                  {poll.status === "active" && (
                    <div className="mb-4">
                      <Button
                        onClick={handleStakeClick}
                        disabled={timeLeft <= 0 || hasUserStaked()}
                        className={`w-full rounded-xl font-bold ${
                          timeLeft <= 0 || hasUserStaked()
                            ? "bg-gray-600 cursor-not-allowed opacity-50"
                            : "bg-gradient-to-r from-violet-500 to-pink-500 hover:from-violet-600 hover:to-pink-600 shadow-lg shadow-purple-500/25"
                        }`}
                      >
                        <Coins className="w-4 h-4 mr-2" />
                        {timeLeft <= 0
                          ? "Poll Ended"
                          : hasUserStaked()
                          ? "Already Staked"
                          : "Place Your Stake Now"}
                      </Button>
                      {hasUserStaked() && (
                        <Badge className="w-full mt-2 justify-center bg-emerald-500/20 text-emerald-400 border-emerald-500/30">
                          <Trophy className="w-3 h-3 mr-1" />
                          You have staked on this poll
                        </Badge>
                      )}
                      <p className="text-xs text-gray-400 text-center mt-2">
                        Minimum stake: ₦{minStake} • Your balance: ₦
                        {balance.toLocaleString()}
                      </p>
                    </div>
                  )}
                  <div className="space-y-3 max-h-[600px] overflow-y-auto pr-2">
                    {poll.options?.map((option: any, index: number) => {
                      // First check if statistics has the option data with percentage
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

                      // Use percentage from API if available, otherwise calculate
                      const percentage =
                        statisticsOption?.percentage !== undefined
                          ? statisticsOption.percentage
                          : totalAmount > 0
                          ? (optionAmount / totalAmount) * 100
                          : 0;
                      const isWinner =
                        poll.status === "resolved" &&
                        (poll.winningOptionId === option.id ||
                          poll.correctOptionId === option.id);

                      return (
                        <div
                          key={option.id || index}
                          className={cn(
                            "p-4 rounded-xl border transition-all cursor-pointer hover:border-violet-500/50",
                            isWinner
                              ? "bg-emerald-500/10 border-emerald-500/30"
                              : poll.status === "active"
                              ? "bg-white/5 border-white/10 hover:bg-violet-500/10"
                              : "bg-white/5 border-white/10"
                          )}
                          onClick={() => {
                            if (poll.status === "active") {
                              setSelectedOptionId(option.id);
                              handleStakeClick();
                            }
                          }}
                        >
                          <div className="flex items-center justify-between mb-2">
                            <span className="font-medium text-white flex items-center gap-2">
                              {poll.status === "active" && (
                                <div className="w-4 h-4 rounded-full border-2 border-violet-400 group-hover:bg-violet-400 transition-colors" />
                              )}
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
                                    : "bg-white/10 text-white border-white/20"
                                )}
                              >
                                {percentage.toFixed(1)}%
                              </Badge>
                            </div>
                          </div>
                          <div className="relative h-2 bg-white/10 rounded-full overflow-hidden mb-2">
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
                        </div>
                      );
                    })}
                  </div>
                </CardContent>
              </Card>

              {/* Distribution Chart */}
              <Card className="bg-white/5 backdrop-blur-sm border-white/10">
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-white flex items-center gap-2">
                      <Activity className="w-5 h-5 text-violet-400" />
                      Stakes Distribution
                    </CardTitle>
                    {poll.status === "active" && !hasUserStaked() && (
                      <Button
                        size="sm"
                        onClick={handleStakeClick}
                        className="bg-violet-500/20 hover:bg-violet-500/30 text-violet-400 border border-violet-500/30"
                      >
                        <Plus className="w-3 h-3 mr-1" />
                        Add Stake
                      </Button>
                    )}
                  </div>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={400}>
                    <PieChart>
                      <Pie
                        data={optionChartData.filter((d) => d.amount > 0)}
                        cx="50%"
                        cy="50%"
                        labelLine={false}
                        label={(entry) => `${entry.percentage}%`}
                        outerRadius={120}
                        fill="#8884d8"
                        dataKey="amount"
                      >
                        {optionChartData.map((entry, index) => (
                          <Cell
                            key={`cell-${index}`}
                            fill={COLORS[index % COLORS.length]}
                          />
                        ))}
                      </Pie>
                      <Tooltip
                        contentStyle={{
                          backgroundColor: "rgba(250, 250, 250, 0.6)",
                          border: "1px solid #374151",
                          borderRadius: "8px",
                          color: "#fff",
                        }}
                        formatter={(value: any) => `₦${value.toLocaleString()}`}
                      />
                      <Legend />
                    </PieChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Analytics Tab */}
          <TabsContent value="analytics" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card className="bg-white/5 backdrop-blur-sm border-white/10">
                <CardHeader>
                  <CardTitle className="text-white">Stakes by Option</CardTitle>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={300}>
                    <BarChart data={optionChartData}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                      <XAxis
                        dataKey="name"
                        stroke="#9ca3af"
                        tick={{ fill: "#9ca3af", fontSize: 12 }}
                        angle={-45}
                        textAnchor="end"
                        height={80}
                      />
                      <YAxis
                        stroke="#9ca3af"
                        tick={{ fill: "#9ca3af", fontSize: 12 }}
                      />
                      <Tooltip
                        contentStyle={{
                          backgroundColor: "rgba(0, 0, 0, 0.8)",
                          border: "1px solid #374151",
                          borderRadius: "8px",
                        }}
                      />
                      <Bar dataKey="stakes" radius={[8, 8, 0, 0]}>
                        {optionChartData.map((entry, index) => (
                          <Cell
                            key={`cell-${index}`}
                            fill={COLORS[index % COLORS.length]}
                          />
                        ))}
                      </Bar>
                    </BarChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>

              <Card className="bg-white/5 backdrop-blur-sm border-white/10">
                <CardHeader>
                  <CardTitle className="text-white">
                    Amount Distribution
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={300}>
                    <BarChart data={optionChartData}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                      <XAxis
                        dataKey="name"
                        stroke="#9ca3af"
                        tick={{ fill: "#9ca3af", fontSize: 12 }}
                        angle={-45}
                        textAnchor="end"
                        height={80}
                      />
                      <YAxis
                        stroke="#9ca3af"
                        tick={{ fill: "#9ca3af", fontSize: 12 }}
                        tickFormatter={(value) =>
                          `₦${(value / 1000).toFixed(0)}k`
                        }
                      />
                      <Tooltip
                        contentStyle={{
                          backgroundColor: "rgba(0, 0, 0, 0.8)",
                          border: "1px solid #374151",
                          borderRadius: "8px",
                        }}
                        formatter={(value: any) => `₦${value.toLocaleString()}`}
                      />
                      <Bar dataKey="amount" radius={[8, 8, 0, 0]}>
                        {optionChartData.map((entry, index) => (
                          <Cell
                            key={`cell-${index}`}
                            fill={COLORS[index % COLORS.length]}
                          />
                        ))}
                      </Bar>
                    </BarChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>
            </div>

            {/* Quick Stats */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mt-6">
              <Card className="bg-white/5 backdrop-blur-sm border-white/10">
                <CardContent className="p-6">
                  <div className="flex items-center gap-4">
                    <div className="p-3 rounded-xl bg-gradient-to-r from-violet-500/20 to-purple-500/20">
                      <Coins className="w-6 h-6 text-violet-400" />
                    </div>
                    <div>
                      <p className="text-gray-400 text-sm">Avg Stake</p>
                      <p className="text-2xl font-bold text-white">
                        ₦{formatNumber(averageStake)}
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-white/5 backdrop-blur-sm border-white/10">
                <CardContent className="p-6">
                  <div className="flex items-center gap-4">
                    <div className="p-3 rounded-xl bg-gradient-to-r from-blue-500/20 to-cyan-500/20">
                      <Target className="w-6 h-6 text-blue-400" />
                    </div>
                    <div>
                      <p className="text-gray-400 text-sm">Options</p>
                      <p className="text-2xl font-bold text-white">
                        {poll.options?.length || 0}
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-white/5 backdrop-blur-sm border-white/10">
                <CardContent className="p-6">
                  <div className="flex items-center gap-4">
                    <div className="p-3 rounded-xl bg-gradient-to-r from-emerald-500/20 to-teal-500/20">
                      <TrendingUp className="w-6 h-6 text-emerald-400" />
                    </div>
                    <div>
                      <p className="text-gray-400 text-sm">Highest Stake</p>
                      <p className="text-2xl font-bold text-white">
                        ₦
                        {formatNumber(
                          Math.max(...optionChartData.map((d) => d.amount))
                        )}
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-white/5 backdrop-blur-sm border-white/10">
                <CardContent className="p-6">
                  <div className="flex items-center gap-4">
                    <div className="p-3 rounded-xl bg-gradient-to-r from-amber-500/20 to-orange-500/20">
                      <Trophy className="w-6 h-6 text-amber-400" />
                    </div>
                    <div>
                      <p className="text-gray-400 text-sm">Leading Option</p>
                      <p className="text-lg font-bold text-white truncate">
                        {optionChartData.sort((a, b) => b.amount - a.amount)[0]
                          ?.name || "None"}
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Information Tab */}
          <TabsContent value="info" className="space-y-6">
            <Card className="bg-white/5 backdrop-blur-sm border-white/10">
              <CardHeader>
                <CardTitle className="text-white flex items-center gap-2">
                  <Info className="w-5 h-5 text-violet-400" />
                  Poll Information
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div>
                  <h3 className="text-white font-semibold mb-2">Description</h3>
                  <p className="text-gray-400">{poll.description}</p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <h3 className="text-white font-semibold mb-2">Timeline</h3>
                    <div className="space-y-2">
                      <div className="flex justify-between">
                        <span className="text-gray-400">Created</span>
                        <span className="text-white">
                          {dayjs(poll.createdAt).format("MMM D, YYYY h:mm A")}
                        </span>
                      </div>
                      {poll.endTime && (
                        <div className="flex justify-between">
                          <span className="text-gray-400">Ends</span>
                          <span className="text-white">
                            {dayjs(poll.endTime).format("MMM D, YYYY h:mm A")}
                          </span>
                        </div>
                      )}
                      {poll.status === "active" && timeLeft > 0 && (
                        <div className="flex justify-between">
                          <span className="text-gray-400">Time Remaining</span>
                          <span className="text-amber-400">
                            {dayjs(poll.endTime).fromNow()}
                          </span>
                        </div>
                      )}
                    </div>
                  </div>

                  <div>
                    <h3 className="text-white font-semibold mb-2">
                      Statistics
                    </h3>
                    <div className="space-y-2">
                      <div className="flex justify-between">
                        <span className="text-gray-400">Total Stakes</span>
                        <span className="text-white">
                          {formatNumber(totalStakes)}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-400">Total Amount</span>
                        <span className="text-emerald-400">
                          ₦{formatNumber(totalAmount)}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-400">Average Stake</span>
                        <span className="text-white">
                          ₦{formatNumber(averageStake)}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Call to Action for Active Polls */}
                {poll.status === "active" && !hasUserStaked() && (
                  <div className="p-4 rounded-xl bg-gradient-to-r from-violet-500/10 to-pink-500/10 border border-violet-500/30">
                    <h3 className="text-violet-400 font-semibold mb-2 flex items-center gap-2">
                      <Sparkles className="w-5 h-5" />
                      Ready to Predict?
                    </h3>
                    <p className="text-gray-300 mb-3">
                      Place your stake on the option you think will win and get
                      a share of the total pool!
                    </p>
                    <Button
                      onClick={handleStakeClick}
                      disabled={timeLeft <= 0}
                      className={`w-full rounded-xl font-bold ${
                        timeLeft <= 0
                          ? "bg-gray-600 cursor-not-allowed opacity-50"
                          : "bg-gradient-to-r from-violet-500 to-pink-500 hover:from-violet-600 hover:to-pink-600"
                      }`}
                    >
                      <Coins className="w-4 h-4 mr-2" />
                      {timeLeft <= 0 ? "Poll Ended" : "Place Your Stake Now"}
                    </Button>
                  </div>
                )}

                {/* Show user has already staked */}
                {poll.status === "active" && hasUserStaked() && (
                  <div className="p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/30">
                    <h3 className="text-emerald-400 font-semibold mb-2 flex items-center gap-2">
                      <Trophy className="w-5 h-5" />
                      You&apos;ve Already Staked
                    </h3>
                    <p className="text-gray-300">
                      You have already placed your stake on this poll. Sit back
                      and wait for the results!
                    </p>
                  </div>
                )}

                {poll.status === "resolved" && poll.winningOptionId && (
                  <div className="p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/30 mt-4">
                    <h3 className="text-emerald-400 font-semibold mb-2 flex items-center gap-2">
                      <Trophy className="w-5 h-5" />
                      Winning Option
                    </h3>
                    <p className="text-white font-medium">
                      {
                        poll.options.find(
                          (opt: any) => opt.id === poll.winningOptionId
                        )?.text
                      }
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>

      {/* Floating Action Button for Mobile - Active Polls Only */}
      {poll.status === "active" && timeLeft > 0 && !hasUserStaked() && (
        <div className="fixed bottom-6 right-6 z-40 lg:hidden">
          <Button
            onClick={handleStakeClick}
            className="rounded-full w-14 h-14 sm:w-16 sm:h-16 bg-gradient-to-r from-violet-500 to-pink-500 hover:from-violet-600 hover:to-pink-600 shadow-2xl shadow-purple-500/50 transform hover:scale-110 transition-all"
          >
            <Coins className="w-6 h-6 sm:w-7 sm:h-7" />
          </Button>
          <div className="absolute -top-1 -right-1 w-3 h-3 bg-red-500 rounded-full animate-pulse" />
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
        <DialogContent className="bg-black/95 backdrop-blur-xl border-white/10 text-white">
          <DialogHeader>
            <DialogTitle className="text-xl sm:text-2xl font-bold bg-gradient-to-r from-violet-400 to-pink-400 bg-clip-text text-transparent">
              Place Your Stake
            </DialogTitle>
            <DialogDescription className="text-gray-400">
              {poll.title}
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 mt-4 px-1 py-2 overflow-y-auto max-h-[600px]">
            {/* Quick Stats */}
            <div className="grid grid-cols-2 gap-3 p-3 rounded-xl bg-white/5 border border-white/10">
              <div>
                <p className="text-xs text-gray-400">Total Pool</p>
                <p className="text-lg font-bold text-emerald-400">
                  ₦{formatNumber(totalAmount)}
                </p>
              </div>
              <div>
                <p className="text-xs text-gray-400">Players</p>
                <p className="text-lg font-bold text-white">{totalStakes}</p>
              </div>
            </div>
            <div className="space-y-2">
              <Label className="text-gray-300">Select your prediction</Label>
              <Select
                value={selectedOptionId}
                onValueChange={setSelectedOptionId}
              >
                <SelectTrigger className="bg-white/5 border-white/10 text-white rounded-xl">
                  <SelectValue placeholder="Choose an option" />
                </SelectTrigger>
                <SelectContent className="bg-black border-white/10 max-h-[300px]">
                  {poll.options?.map((option: any) => {
                    const optionStat = stats?.optionStats?.find(
                      (s: any) => s.optionId === option.id
                    );
                    const optionAmount =
                      optionStat?.amount ||
                      poll.stakesPerOption?.[option.id] ||
                      0;

                    return (
                      <SelectItem
                        key={option.id}
                        value={option.id}
                        className="text-white hover:bg-white/10"
                      >
                        <div className="flex items-center justify-between w-full">
                          <span>{option.text}</span>
                        </div>
                      </SelectItem>
                    );
                  })}
                </SelectContent>
              </Select>
            </div>

            {selectedOptionId && (
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
                  <div className="flex flex-wrap gap-2 mt-2">
                    {quickAmounts.map((amount) => (
                      <Button
                        key={amount}
                        onClick={() => setStakeAmount(amount.toString())}
                        variant="outline"
                        size="sm"
                        className="rounded-lg border-white/20 text-white hover:bg-white/10 text-xs sm:text-sm"
                      >
                        ₦{amount.toLocaleString()}
                      </Button>
                    ))}
                  </div>
                </div>

                {/* Stake Warning for High Amounts */}
                {parseInt(stakeAmount) > 10000 && (
                  <div className="p-3 rounded-xl bg-amber-500/10 border border-amber-500/30">
                    <p className="text-amber-400 text-sm flex items-center gap-2">
                      <Info className="w-4 h-4" />
                      High stake amount! Make sure you want to stake ₦
                      {parseInt(stakeAmount).toLocaleString()}
                    </p>
                  </div>
                )}

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
              </>
            )}
            {selectedOptionId && (
              <Button
                onClick={handlePlaceStake}
                disabled={
                  createStakeMutation.isPending ||
                  !stakeAmount ||
                  parseInt(stakeAmount) < minStake
                }
                className="w-full rounded-xl bg-gradient-to-r from-violet-500 to-pink-500 hover:from-violet-600 hover:to-pink-600 font-bold py-3"
              >
                {createStakeMutation.isPending ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Placing Stake...
                  </>
                ) : (
                  <>
                    <Coins className="w-4 h-4 mr-2" />
                    Confirm Stake - ₦
                    {parseInt(stakeAmount || "0").toLocaleString()}
                  </>
                )}
              </Button>
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
    </div>
  );
}
