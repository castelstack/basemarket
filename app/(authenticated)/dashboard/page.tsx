"use client";

import Image from "next/image";
import { Button } from "@/components/ui/button";
import { useAllPolls } from "@/lib/polls";
import { useMyStakes } from "@/lib/stakes";
import { useUserStatistics } from "@/lib/user";
import { useAuthStore } from "@/stores/authStore";
import type { Poll } from "@/types/api";
import {
  ArrowRight,
  ArrowDownRight,
  ChevronRight,
  Trophy,
  Target,
  Wallet,
  RefreshCw,
} from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";

export default function DashboardPage() {
  const { user, balance } = useAuthStore();
  const { data: pollsData, isLoading } = useAllPolls();
  const { data: userStatsResponse } = useUserStatistics();
  const { data: stakesData } = useMyStakes();
  const router = useRouter();

  const userStats = userStatsResponse?.data;
  const stakes = stakesData?.data?.docs || [];
  const polls: Poll[] = (pollsData?.data as any)?.docs || [];
  const activePolls = polls.filter((p) => p.status === "active").slice(0, 3);

  // Recent activity from stakes
  const recentActivity = stakes.slice(0, 4).map((stake: any) => {
    const isWin = stake.status === "won";
    const isLoss = stake.status === "lost";
    const isRefund = stake.status === "refunded";

    return {
      id: stake.id,
      title: stake.poll?.title || "Prediction",
      amount: isWin
        ? stake.winningsAmount || 0
        : isRefund
        ? stake.amount
        : stake.amount,
      isPositive: isWin || isRefund,
      status: stake.status,
    };
  });

  return (
    <div className="min-h-screen bg-[#000000]">
      {/* Subtle ambient glow */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[600px] h-[600px] bg-[#1F1F1F]/20 rounded-full blur-[150px]" />
      </div>

      <div className="relative px-4 sm:px-6 py-6 max-w-3xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <p className="text-[#9A9A9A] text-sm font-light mb-1">
            Welcome back{user?.firstName ? `, ${user.firstName}` : ""}
          </p>
          <h1 className="text-2xl font-semibold text-[#EDEDED]">Dashboard</h1>
        </div>

        {/* Balance Card */}
        <div className="p-5 rounded-xl bg-[#0A0A0A] border border-[#1F1F1F] mb-6">
          <p className="text-sm text-[#9A9A9A] font-light mb-1">Your Balance</p>
          <div className="flex items-end justify-between">
            <div className="flex items-center gap-2">
              <Image src="/usdc.svg" alt="USDC" width={28} height={28} />
              <span className="text-3xl font-semibold text-[#EDEDED]">
                {balance.toLocaleString()}
              </span>
            </div>
            <Link href="/wallet">
              <Button
                size="sm"
                className="bg-[#151515] hover:bg-[#1F1F1F] text-[#D8D8D8] border border-[#1F1F1F] rounded-xl h-9 px-4 font-normal transition-colors"
              >
                <Wallet className="w-4 h-4 mr-1.5" />
                Manage
              </Button>
            </Link>
          </div>
        </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-3 gap-3 mb-8">
          <div className="p-4 rounded-xl bg-[#0A0A0A] border border-[#1F1F1F]">
            <p className="text-xs text-[#9A9A9A] font-light mb-1">Win Rate</p>
            <p className="text-lg font-medium text-[#EDEDED]">
              {userStats?.winRate ? `${userStats.winRate.toFixed(0)}%` : "0%"}
            </p>
          </div>
          <div className="p-4 rounded-xl bg-[#0A0A0A] border border-[#1F1F1F]">
            <p className="text-xs text-[#9A9A9A] font-light mb-1">Total Won</p>
            <p className="text-lg font-medium text-[#D8D8D8] inline-flex items-center gap-1">
              <Image src="/usdc.svg" alt="USDC" width={14} height={14} />
              {userStats?.totalWon?.toLocaleString() || "0"}
            </p>
          </div>
          <div className="p-4 rounded-xl bg-[#0A0A0A] border border-[#1F1F1F]">
            <p className="text-xs text-[#9A9A9A] font-light mb-1">Stakes</p>
            <p className="text-lg font-medium text-[#EDEDED]">
              {userStats?.completedStakes || 0}
            </p>
          </div>
        </div>

        {/* Active Predictions */}
        <div className="mb-8 p-4 rounded-2xl bg-emerald-500/[0.03] border border-emerald-500/10">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
              <h2 className="text-base font-medium text-[#EDEDED]">Live Predictions</h2>
            </div>
            <Link
              href="/polls"
              className="text-sm text-emerald-400 hover:text-emerald-300 flex items-center gap-1 transition-colors"
            >
              View all
              <ChevronRight className="w-4 h-4" />
            </Link>
          </div>

          {isLoading ? (
            <div className="flex justify-center py-8">
              <div className="w-6 h-6 border-2 border-emerald-400 border-t-transparent rounded-full animate-spin" />
            </div>
          ) : activePolls.length === 0 ? (
            <div className="text-center py-6">
              <p className="text-[#9A9A9A] text-sm font-light mb-4">
                No active predictions right now
              </p>
              <Link href="/polls">
                <Button
                  variant="outline"
                  size="sm"
                  className="border-emerald-500/20 text-emerald-400 hover:bg-emerald-500/10 hover:text-emerald-300"
                >
                  Browse All
                </Button>
              </Link>
            </div>
          ) : (
            <div className="space-y-2">
              {activePolls.map((poll) => {
                const timeLeft =
                  new Date(poll.endTime ?? 0).getTime() - Date.now();
                const hoursLeft = Math.max(
                  0,
                  Math.floor(timeLeft / (1000 * 60 * 60))
                );
                const daysLeft = Math.floor(hoursLeft / 24);

                return (
                  <div
                    key={poll.id}
                    onClick={() => router.push(`/polls/${poll.id}`)}
                    className="group p-4 rounded-xl bg-[#0A0A0A] border border-[#1F1F1F] hover:border-emerald-500/30 transition-colors cursor-pointer"
                  >
                    <div className="flex items-center justify-between gap-3">
                      <div className="flex-1 min-w-0">
                        <h3 className="font-medium text-[#EDEDED] truncate text-sm group-hover:text-emerald-300 transition-colors">
                          {poll.title}
                        </h3>
                        <div className="flex items-center gap-3 mt-1.5 text-xs text-[#9A9A9A]">
                          {poll.totalStakeAmount > 0 && (
                            <span className="text-emerald-400 font-normal inline-flex items-center gap-1">
                              <Image src="/usdc.svg" alt="USDC" width={12} height={12} />
                              {poll.totalStakeAmount}
                            </span>
                          )}
                          {poll.totalParticipants > 0 && (
                            <span>{poll.totalParticipants} players</span>
                          )}
                          {timeLeft > 0 && (
                            <span>
                              {daysLeft > 0 ? `${daysLeft}d` : `${hoursLeft}h`}
                            </span>
                          )}
                        </div>
                      </div>
                      <ChevronRight className="w-4 h-4 text-[#9A9A9A]/50 group-hover:text-emerald-400 transition-colors" />
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Recent Activity */}
        <div className="mb-8">
          <h2 className="text-base font-medium text-[#EDEDED] mb-4">Recent Activity</h2>

          {recentActivity.length === 0 ? (
            <div className="text-center py-8 rounded-xl bg-[#0A0A0A] border border-[#1F1F1F]">
              <Target className="w-8 h-8 text-[#9A9A9A]/50 mx-auto mb-3" />
              <p className="text-[#9A9A9A] text-sm font-light mb-1">No activity yet</p>
              <p className="text-[#9A9A9A]/60 text-xs font-light">
                Make your first prediction
              </p>
            </div>
          ) : (
            <div className="space-y-2">
              {recentActivity.map((activity, i) => (
                <div
                  key={activity.id || i}
                  className="flex items-center justify-between p-3 rounded-xl bg-[#0A0A0A] border border-[#1F1F1F]"
                >
                  <div className="flex items-center gap-3">
                    <div
                      className={`p-2 rounded-lg ${
                        activity.status === "won"
                          ? "bg-emerald-500/10"
                          : activity.status === "lost"
                          ? "bg-red-500/10"
                          : activity.status === "refunded"
                          ? "bg-blue-500/10"
                          : "bg-[#151515]"
                      }`}
                    >
                      {activity.status === "won" ? (
                        <Trophy className="w-4 h-4 text-emerald-400" />
                      ) : activity.status === "lost" ? (
                        <ArrowDownRight className="w-4 h-4 text-red-400" />
                      ) : activity.status === "refunded" ? (
                        <RefreshCw className="w-4 h-4 text-blue-400" />
                      ) : (
                        <Target className="w-4 h-4 text-[#9A9A9A]" />
                      )}
                    </div>
                    <div>
                      <p className="text-sm text-[#EDEDED] font-normal truncate max-w-[180px]">
                        {activity.title}
                      </p>
                      <p className="text-xs text-[#9A9A9A] capitalize font-light">
                        {activity.status}
                      </p>
                    </div>
                  </div>
                  <span
                    className={`text-sm font-medium inline-flex items-center gap-1 ${
                      activity.status === "won"
                        ? "text-emerald-400"
                        : activity.status === "refunded"
                        ? "text-blue-400"
                        : "text-red-400"
                    }`}
                  >
                    {activity.isPositive ? "+" : "-"}
                    <Image src="/usdc.svg" alt="USDC" width={12} height={12} />
                    {activity.amount}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* CTA */}
        <Link href="/polls" className="block">
          <Button className="w-full h-14 bg-[#EDEDED] hover:bg-[#D8D8D8] text-[#0A0A0A] font-medium rounded-full transition-colors">
            Make a Prediction
            <ArrowRight className="w-5 h-5 ml-2" />
          </Button>
        </Link>
      </div>
    </div>
  );
}
