"use client";

import Image from "next/image";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  useAdminDashboardStats,
  useAdminRevenueStats,
  useAdminUserStats,
} from "@/lib/admin";
import {
  Activity,
  ArrowUpRight,
  BarChart3,
  Calendar,
  Crown,
  DollarSign,
  Loader2,
  Plus,
  TrendingUp,
  Users,
} from "lucide-react";
import Link from "next/link";
import { useState, useEffect } from "react";
import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  CartesianGrid,
  Legend,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

export default function AdminDashboardPage() {
  const { data: statsData, isLoading, isError, error } = useAdminDashboardStats();
  const [dateRange, setDateRange] = useState<{ start: string; end: string }>({
    start: "2025-08-01",
    end: "",
  });

  useEffect(() => {
    const currentDate = new Date().toISOString().split("T")[0];
    setDateRange((prev) => ({ ...prev, end: currentDate }));
  }, []);

  const { data: revenueData } = useAdminRevenueStats(dateRange.start, dateRange.end);
  const { data: userStatsData } = useAdminUserStats(dateRange.start, dateRange.end);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-[#000000] flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-8 h-8 text-[#EDEDED] animate-spin mx-auto mb-3" />
          <p className="text-[#9A9A9A] text-sm font-light">Loading...</p>
        </div>
      </div>
    );
  }

  if (isError) {
    return (
      <div className="min-h-screen bg-[#000000] flex items-center justify-center px-4">
        <div className="text-center">
          <p className="text-red-400 mb-4">Error: {error?.message || "Failed to load"}</p>
          <Button onClick={() => window.location.reload()} className="bg-[#EDEDED] hover:bg-[#D8D8D8] text-[#0A0A0A]">Try Again</Button>
        </div>
      </div>
    );
  }

  const stats = statsData?.data;
  const revenueStats = revenueData?.data;
  const userStats = userStatsData?.data;

  const quickStats = [
    {
      title: "Total Users",
      value: stats?.users?.total?.toLocaleString() ?? "-",
      icon: Users,
      change: `${stats?.users?.activeToday || 0} active today`,
    },
    {
      title: "Total Revenue",
      value: stats?.revenue?.total?.toLocaleString() ?? "-",
      icon: DollarSign,
      change: `${stats?.revenue?.pendingWithdrawals?.toLocaleString() || 0} pending`,
      isUsdc: true,
    },
    {
      title: "Total Polls",
      value: stats?.polls?.total?.toLocaleString() ?? "-",
      icon: BarChart3,
      change: `${stats?.polls?.active || 0} active`,
    },
  ];

  return (
    <div className="min-h-screen bg-black">
      {/* Background */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[600px] h-[600px] bg-violet-600/10 rounded-full blur-[120px]" />
      </div>

      <div className="relative px-4 sm:px-6 py-6 max-w-3xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <Badge className="bg-violet-500/20 text-violet-400 border-violet-500/30 text-xs">
                <Crown className="w-3 h-3 mr-1" />
                Admin
              </Badge>
            </div>
            <h1 className="text-2xl font-black text-white">Dashboard</h1>
            <p className="text-gray-500 text-sm">Platform overview</p>
          </div>
          <Link href="/admin/create">
            <Button
              size="sm"
              className="bg-gradient-to-r from-violet-500 to-indigo-500 hover:from-violet-600 hover:to-indigo-600 font-bold rounded-xl h-10 px-4"
            >
              <Plus className="w-4 h-4 mr-1" />
              Create
            </Button>
          </Link>
        </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mb-6">
          {quickStats.map((stat: any, index) => (
            <div
              key={index}
              className="p-4 rounded-2xl bg-white/[0.03] border border-white/[0.06]"
            >
              <div className="flex items-center gap-3 mb-2">
                <div className="p-2 rounded-xl bg-violet-500/10">
                  <stat.icon className="w-4 h-4 text-violet-400" />
                </div>
                <span className="text-xs text-emerald-400 flex items-center gap-1">
                  <ArrowUpRight className="w-3 h-3" />
                  {stat.isUsdc && <Image src="/usdc.svg" alt="USDC" width={10} height={10} />}
                  {stat.change}
                </span>
              </div>
              <p className="text-xs text-gray-500 mb-1">{stat.title}</p>
              <p className="text-xl font-bold text-white inline-flex items-center gap-1">
                {stat.isUsdc && <Image src="/usdc.svg" alt="USDC" width={16} height={16} />}
                {stat.value}
              </p>
            </div>
          ))}
        </div>

        {/* Quick Actions */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-6">
          {[
            { href: "/admin/users", icon: Users, label: "Users", color: "text-blue-400" },
            { href: "/admin/transactions", icon: DollarSign, label: "Transactions", color: "text-emerald-400" },
            { href: "/admin/polls", icon: BarChart3, label: "Polls", color: "text-violet-400" },
            { href: "/admin/settings", icon: Activity, label: "Settings", color: "text-indigo-400" },
          ].map((item) => (
            <Link key={item.href} href={item.href}>
              <div className="p-4 rounded-xl bg-white/[0.03] border border-white/[0.06] hover:bg-violet-500/10 hover:border-violet-500/20 transition-all text-center">
                <item.icon className={`w-5 h-5 ${item.color} mx-auto mb-2`} />
                <p className="text-sm font-medium text-white">{item.label}</p>
              </div>
            </Link>
          ))}
        </div>

        {/* Analytics */}
        <Card className="bg-white/[0.03] border-white/[0.06] mb-6">
          <CardHeader className="pb-3">
            <CardTitle className="text-white flex items-center gap-2 text-base">
              <Calendar className="w-4 h-4 text-violet-400" />
              Analytics
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Date Range */}
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1">
                <Label className="text-xs text-gray-400">Start</Label>
                <Input
                  type="date"
                  value={dateRange.start}
                  onChange={(e) => setDateRange((r) => ({ ...r, start: e.target.value }))}
                  max={dateRange.end || undefined}
                  className="h-9 text-sm bg-white/[0.03] border-white/[0.06] text-white rounded-xl [&::-webkit-calendar-picker-indicator]:invert"
                />
              </div>
              <div className="space-y-1">
                <Label className="text-xs text-gray-400">End</Label>
                <Input
                  type="date"
                  value={dateRange.end}
                  onChange={(e) => setDateRange((r) => ({ ...r, end: e.target.value }))}
                  min={dateRange.start}
                  className="h-9 text-sm bg-white/[0.03] border-white/[0.06] text-white rounded-xl [&::-webkit-calendar-picker-indicator]:invert"
                />
              </div>
            </div>

            {/* User Activity Chart */}
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <Users className="w-4 h-4 text-blue-400" />
                <h3 className="text-sm font-medium text-white">User Activity</h3>
              </div>
              <div className="bg-black/30 rounded-xl p-3">
                {userStats && (Array.isArray(userStats) ? userStats : userStats?.dailyUsers)?.length > 0 ? (
                  <ResponsiveContainer width="100%" height={200}>
                    <AreaChart
                      data={Array.isArray(userStats) ? userStats : userStats?.dailyUsers}
                      margin={{ top: 5, right: 5, left: -20, bottom: 5 }}
                    >
                      <defs>
                        <linearGradient id="colorNew" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="#8b5cf6" stopOpacity={0.8} />
                          <stop offset="95%" stopColor="#8b5cf6" stopOpacity={0} />
                        </linearGradient>
                        <linearGradient id="colorActive" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="#6366f1" stopOpacity={0.8} />
                          <stop offset="95%" stopColor="#6366f1" stopOpacity={0} />
                        </linearGradient>
                      </defs>
                      <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                      <XAxis dataKey="date" stroke="#6b7280" tick={{ fill: "#6b7280", fontSize: 10 }} />
                      <YAxis stroke="#6b7280" tick={{ fill: "#6b7280", fontSize: 10 }} />
                      <Tooltip
                        contentStyle={{ backgroundColor: "#1f2937", border: "1px solid #374151", borderRadius: "8px" }}
                        labelStyle={{ color: "#e5e7eb" }}
                      />
                      <Legend wrapperStyle={{ fontSize: "12px" }} />
                      <Area type="monotone" dataKey="newUsers" stroke="#8b5cf6" fill="url(#colorNew)" name="New" strokeWidth={2} />
                      <Area type="monotone" dataKey="activeUsers" stroke="#6366f1" fill="url(#colorActive)" name="Active" strokeWidth={2} />
                    </AreaChart>
                  </ResponsiveContainer>
                ) : (
                  <div className="flex items-center justify-center h-[200px] text-gray-500 text-sm">
                    No user data available
                  </div>
                )}
              </div>
            </div>

            {/* Revenue Chart */}
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <TrendingUp className="w-4 h-4 text-emerald-400" />
                <h3 className="text-sm font-medium text-white">Revenue</h3>
              </div>
              <div className="bg-black/30 rounded-xl p-3">
                {revenueStats?.dailyRevenue && revenueStats.dailyRevenue.length > 0 ? (
                  <ResponsiveContainer width="100%" height={200}>
                    <BarChart
                      data={revenueStats?.dailyRevenue}
                      margin={{ top: 5, right: 5, left: -20, bottom: 5 }}
                    >
                      <defs>
                        <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="#8b5cf6" stopOpacity={0.8} />
                          <stop offset="95%" stopColor="#6366f1" stopOpacity={0.4} />
                        </linearGradient>
                      </defs>
                      <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                      <XAxis dataKey="date" stroke="#6b7280" tick={{ fill: "#6b7280", fontSize: 10 }} />
                      <YAxis stroke="#6b7280" tick={{ fill: "#6b7280", fontSize: 10 }} tickFormatter={(v) => `${(v / 1000).toFixed(0)}k`} />
                      <Tooltip
                        contentStyle={{ backgroundColor: "#1f2937", border: "1px solid #374151", borderRadius: "8px" }}
                        labelStyle={{ color: "#e5e7eb" }}
                        formatter={(value: any) => [`${value.toLocaleString()} USDC`, "Revenue"]}
                      />
                      <Bar dataKey="revenue" fill="url(#colorRevenue)" radius={[4, 4, 0, 0]} name="Revenue" />
                    </BarChart>
                  </ResponsiveContainer>
                ) : (
                  <div className="flex items-center justify-center h-[200px] text-gray-500 text-sm">
                    No revenue data available
                  </div>
                )}
              </div>
            </div>

            {/* Summary Stats */}
            {(userStats || revenueStats?.dailyRevenue) && (
              <div className="grid grid-cols-2 gap-3">
                {userStats && (
                  <div className="p-3 rounded-xl bg-violet-500/10 border border-violet-500/20">
                    <p className="text-xs text-gray-400 mb-1">Total New Users</p>
                    <p className="text-lg font-bold text-violet-400">
                      {(Array.isArray(userStats) ? userStats : userStats?.dailyUsers)?.reduce(
                        (sum: number, d: any) => sum + (d.newUsers || 0),
                        0
                      )}
                    </p>
                  </div>
                )}
                {revenueStats?.dailyRevenue && revenueStats.dailyRevenue.length > 0 && (
                  <div className="p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/20">
                    <p className="text-xs text-gray-400 mb-1">Total Revenue</p>
                    <p className="text-lg font-bold text-emerald-400 inline-flex items-center gap-1">
                      <Image src="/usdc.svg" alt="USDC" width={14} height={14} />
                      {revenueStats.dailyRevenue.reduce((sum: number, d: any) => sum + (d.revenue || 0), 0).toLocaleString()}
                    </p>
                  </div>
                )}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
