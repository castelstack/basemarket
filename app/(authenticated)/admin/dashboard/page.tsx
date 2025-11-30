'use client';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  useAdminDashboardStats,
  useAdminRevenueStats,
  useAdminUserStats,
} from '@/lib/admin';
import {
  Activity,
  ArrowDownRight,
  ArrowUpRight,
  BarChart3,
  Calendar,
  Crown,
  DollarSign,
  Shield,
  Sparkles,
  TrendingUp,
  Users,
} from 'lucide-react';
import Link from 'next/link';
import { useState, useEffect } from 'react';
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
} from 'recharts';

export default function AdminDashboardPage() {
  const {
    data: statsData,
    isLoading,
    isError,
    error,
  } = useAdminDashboardStats();
  const [dateRange, setDateRange] = useState<{ start: string; end: string }>({
    start: '2025-08-01',
    end: '', // Will be set in useEffect to avoid hydration issues
  });
  
  // Set current date on client side to avoid hydration issues
  useEffect(() => {
    const currentDate = new Date().toISOString().split('T')[0];
    setDateRange(prev => ({ ...prev, end: currentDate }));
  }, []);
  const { data: revenueData } = useAdminRevenueStats(
    dateRange.start,
    dateRange.end
  );
  const { data: userStatsData } = useAdminUserStats(
    dateRange.start,
    dateRange.end
  );

  if (isLoading)
    return (
      <div className='min-h-screen bg-black flex items-center justify-center'>
        <div className='text-center'>
          <div className='animate-spin rounded-full h-12 w-12 border-b-2 border-violet-400 mb-4'></div>
          <p className='text-gray-400'>Loading admin dashboard...</p>
        </div>
      </div>
    );
  if (isError)
    return (
      <div className='min-h-screen bg-black flex items-center justify-center'>
        <div className='text-center'>
          <p className='text-red-400 text-lg mb-4'>
            Error: {error?.message || 'Failed to load dashboard.'}
          </p>
          <Button onClick={() => window.location.reload()}>Try Again</Button>
        </div>
      </div>
    );

  const stats = statsData?.data;
  const revenueStats = revenueData?.data;
  const userStats = userStatsData?.data;

  const quickStats = [
    {
      title: 'Total Users',
      value: stats?.users?.total?.toLocaleString() ?? '-',
      icon: Users,
      gradient: 'from-blue-500 to-cyan-500',
      change: `${stats?.users?.activeToday || 0} active today`,
      isPositive: true,
    },
    {
      title: 'Total Revenue',
      value: `₦${stats?.revenue?.total?.toLocaleString() ?? '-'}`,
      icon: DollarSign,
      gradient: 'from-emerald-500 to-teal-500',
      change: `₦${
        stats?.revenue?.pendingWithdrawals?.toLocaleString() || 0
      } pending`,
      isPositive: true,
    },
    {
      title: 'Total Polls',
      value: stats?.polls?.total?.toLocaleString() ?? '-',
      icon: BarChart3,
      gradient: 'from-violet-500 to-purple-500',
      change: `${stats?.polls?.active || 0} active`,
      isPositive: true,
    },
  ];

  return (
    <div className='min-h-screen bg-black'>
      {/* Animated Background */}
      <div className='fixed inset-0 bg-gradient-to-br from-violet-950/20 via-black to-pink-950/20' />
      <div className='fixed inset-0 bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-purple-900/10 via-transparent to-transparent' />

      <div className='relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8'>
        {/* Hero Section */}
        <div className='mb-10'>
          <div className='relative overflow-hidden rounded-3xl bg-gradient-to-br from-violet-600/10 via-purple-600/5 to-pink-600/10 border border-white/10 p-8 lg:p-12'>
            {/* Animated elements */}
            <div className='absolute top-0 right-0 w-64 h-64 bg-gradient-to-br from-violet-500/20 to-pink-500/20 rounded-full blur-3xl' />
            <div className='absolute bottom-0 left-0 w-48 h-48 bg-gradient-to-tr from-orange-500/20 to-amber-500/20 rounded-full blur-3xl' />

            <div className='relative z-10'>
              <div className='flex items-center gap-2 mb-4'>
                <div className='flex items-center gap-2 px-3 py-1.5 rounded-full bg-gradient-to-r from-purple-500/20 to-pink-500/20 border border-purple-500/30'>
                  <Shield className='w-4 h-4 text-purple-400' />
                  <span className='text-sm font-medium text-purple-400'>
                    Admin Control Center
                  </span>
                </div>
                <Badge className='bg-amber-500/20 text-amber-400 border-amber-500/30'>
                  <Crown className='w-3 h-3 mr-1' />
                  Super Admin
                </Badge>
              </div>

              <h1 className='text-3xl sm:text-4xl lg:text-5xl font-black mb-2 sm:mb-3'>
                <span className='bg-gradient-to-r from-violet-400 via-pink-400 to-orange-400 bg-clip-text text-transparent'>
                  Admin Dashboard
                </span>
              </h1>

              <p className='text-lg sm:text-xl text-gray-400 mb-6 sm:mb-8 max-w-2xl'>
                Monitor platform performance and manage the ShowStakr ecosystem
              </p>

              <div className='flex flex-wrap gap-4'>
                <Link href='/admin/create'>
                  <Button className='group relative px-8 py-6 rounded-2xl bg-gradient-to-r from-violet-500 to-pink-500 hover:from-violet-600 hover:to-pink-600 text-white font-bold text-lg shadow-2xl shadow-purple-500/25 transform hover:scale-105 transition-all'>
                    <Sparkles className='w-5 h-5 mr-2' />
                    Create Poll
                  </Button>
                </Link>
                <Link href='/admin/polls'>
                  <Button
                    variant='outline'
                    className='px-8 py-6 rounded-2xl border-white/20 text-white hover:bg-white/10 font-semibold text-lg'
                  >
                    <Activity className='w-5 h-5 mr-2' />
                    Manage Polls
                  </Button>
                </Link>
              </div>
            </div>
          </div>
        </div>

        {/* Quick Stats */}
        <div className='grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4 mb-6 sm:mb-8 lg:mb-10'>
          {quickStats.map((stat, index) => (
            <div
              key={index}
              className='group relative overflow-hidden rounded-xl sm:rounded-2xl bg-white/5 backdrop-blur-sm border border-white/10 p-4 sm:p-5 lg:p-6 hover:bg-white/10 transition-all'
            >
              <div
                className={`absolute top-0 right-0 w-24 h-24 bg-gradient-to-br ${stat.gradient} opacity-10 rounded-full blur-2xl group-hover:opacity-20 transition-opacity`}
              />

              <div className='relative'>
                <div className='flex items-center justify-between mb-4'>
                  <div
                    className={`p-2 rounded-xl bg-gradient-to-r ${stat.gradient} bg-opacity-20`}
                  >
                    <stat.icon className='w-5 h-5 text-white' />
                  </div>
                  <span
                    className={`text-xs font-medium flex items-center gap-1 ${
                      stat.isPositive ? 'text-emerald-400' : 'text-red-400'
                    }`}
                  >
                    {stat.isPositive ? (
                      <ArrowUpRight className='w-3 h-3' />
                    ) : (
                      <ArrowDownRight className='w-3 h-3' />
                    )}
                    {stat.change}
                  </span>
                </div>
                <p className='text-gray-400 text-xs sm:text-sm mb-1'>
                  {stat.title}
                </p>
                <p className='text-xl sm:text-2xl font-bold text-white'>
                  {stat.value}
                </p>
              </div>
            </div>
          ))}
        </div>

        {/* Date Range Filter */}
        <div className='mb-8'>
          <Card className='bg-white/5 backdrop-blur-sm border-white/10'>
            <CardHeader>
              <CardTitle className='text-white flex items-center gap-2'>
                <Calendar className='w-5 h-5 text-violet-400' />
                Analytics by Date Range
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className='grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6'>
                <div className='space-y-2'>
                  <Label className='text-gray-300'>Start Date</Label>
                  <div className='relative'>
                    <Input
                      type='date'
                      value={dateRange.start}
                      onChange={(e) =>
                        setDateRange((r) => ({ ...r, start: e.target.value }))
                      }
                      max={dateRange.end || undefined}
                      className='bg-black/50 border-white/20 text-white rounded-xl focus:border-violet-500 [&::-webkit-calendar-picker-indicator]:filter [&::-webkit-calendar-picker-indicator]:invert [&::-webkit-calendar-picker-indicator]:opacity-60 [&::-webkit-calendar-picker-indicator]:hover:opacity-100 [&::-webkit-calendar-picker-indicator]:cursor-pointer'
                    />
                  </div>
                </div>
                <div className='space-y-2'>
                  <Label className='text-gray-300'>End Date</Label>
                  <div className='relative'>
                    <Input
                      type='date'
                      value={dateRange.end}
                      onChange={(e) =>
                        setDateRange((r) => ({ ...r, end: e.target.value }))
                      }
                      min={dateRange.start}
                      max={dateRange.end || undefined}
                      className='bg-black/50 border-white/20 text-white rounded-xl focus:border-violet-500 [&::-webkit-calendar-picker-indicator]:filter [&::-webkit-calendar-picker-indicator]:invert [&::-webkit-calendar-picker-indicator]:opacity-60 [&::-webkit-calendar-picker-indicator]:hover:opacity-100 [&::-webkit-calendar-picker-indicator]:cursor-pointer'
                    />
                  </div>
                </div>
              </div>
              
              {/* Quick Actions */}
              <div className='flex gap-2 mb-6'>
                <Button
                  size='sm'
                  variant='outline'
                  onClick={() => setDateRange({ start: '2025-08-01', end: dateRange.end || '' })}
                  className='border-white/20 hover:bg-white/10'
                >
                  Reset to Default
                </Button>
              </div>

              {/* Charts Grid */}
              <div className='grid grid-cols-1 gap-6'>
                {/* User Activity Chart */}
                <div className='space-y-4'>
                  <div className='flex items-center gap-2'>
                    <Users className='w-5 h-5 text-blue-400' />
                    <h3 className='text-lg font-semibold text-white'>
                      User Activity Trends
                    </h3>
                  </div>
                  <div className='bg-black/30 rounded-xl p-4'>
                    {userStats &&
                    (Array.isArray(userStats)
                      ? userStats
                      : userStats?.dailyUsers
                    )?.length > 0 ? (
                      <ResponsiveContainer width='100%' height={300}>
                        <AreaChart
                          data={
                            Array.isArray(userStats)
                              ? userStats
                              : userStats?.dailyUsers
                          }
                          margin={{ top: 10, right: 30, left: 0, bottom: 40 }}
                        >
                          <defs>
                            <linearGradient
                              id='colorNew'
                              x1='0'
                              y1='0'
                              x2='0'
                              y2='1'
                            >
                              <stop
                                offset='5%'
                                stopColor='#3b82f6'
                                stopOpacity={0.8}
                              />
                              <stop
                                offset='95%'
                                stopColor='#3b82f6'
                                stopOpacity={0}
                              />
                            </linearGradient>
                            <linearGradient
                              id='colorActive'
                              x1='0'
                              y1='0'
                              x2='0'
                              y2='1'
                            >
                              <stop
                                offset='5%'
                                stopColor='#10b981'
                                stopOpacity={0.8}
                              />
                              <stop
                                offset='95%'
                                stopColor='#10b981'
                                stopOpacity={0}
                              />
                            </linearGradient>
                          </defs>
                          <CartesianGrid
                            strokeDasharray='3 3'
                            stroke='#374151'
                          />
                          <XAxis
                            dataKey='date'
                            stroke='#9ca3af'
                            tick={{ fill: '#9ca3af', fontSize: 12 }}
                            angle={-45}
                            textAnchor='end'
                            height={60}
                          />
                          <YAxis
                            stroke='#9ca3af'
                            tick={{ fill: '#9ca3af', fontSize: 12 }}
                          />
                          <Tooltip
                            contentStyle={{
                              backgroundColor: 'rgba(0, 0, 0, 0.8)',
                              border: '1px solid #374151',
                              borderRadius: '8px',
                            }}
                            labelStyle={{ color: '#e5e7eb' }}
                          />
                          <Legend
                            wrapperStyle={{ paddingTop: '20px' }}
                            iconType='circle'
                          />
                          <Area
                            type='monotone'
                            dataKey='newUsers'
                            stroke='#3b82f6'
                            fillOpacity={1}
                            fill='url(#colorNew)'
                            name='New Users'
                            strokeWidth={2}
                          />
                          <Area
                            type='monotone'
                            dataKey='activeUsers'
                            stroke='#10b981'
                            fillOpacity={1}
                            fill='url(#colorActive)'
                            name='Active Users'
                            strokeWidth={2}
                          />
                        </AreaChart>
                      </ResponsiveContainer>
                    ) : (
                      <div className='flex items-center justify-center h-[300px] text-gray-500'>
                        <div className='text-center'>
                          <BarChart3 className='w-12 h-12 mx-auto mb-2 opacity-50' />
                          <p>No user data available</p>
                          <p className='text-sm mt-1'>
                            Select a date range to view analytics
                          </p>
                        </div>
                      </div>
                    )}
                  </div>
                </div>

                {/* Revenue Chart */}
                <div className='space-y-4'>
                  <div className='flex items-center gap-2'>
                    <TrendingUp className='w-5 h-5 text-emerald-400' />
                    <h3 className='text-lg font-semibold text-white'>
                      Revenue Analytics
                    </h3>
                  </div>
                  <div className='bg-black/30 rounded-xl p-4'>
                    {revenueStats?.dailyRevenue && revenueStats.dailyRevenue.length > 0 ? (
                      <ResponsiveContainer width='100%' height={300}>
                        <BarChart
                          data={revenueStats?.dailyRevenue}
                          margin={{ top: 10, right: 30, left: 0, bottom: 40 }}
                        >
                          <defs>
                            <linearGradient
                              id='colorRevenue'
                              x1='0'
                              y1='0'
                              x2='0'
                              y2='1'
                            >
                              <stop
                                offset='5%'
                                stopColor='#10b981'
                                stopOpacity={0.8}
                              />
                              <stop
                                offset='95%'
                                stopColor='#10b981'
                                stopOpacity={0.4}
                              />
                            </linearGradient>
                          </defs>
                          <CartesianGrid
                            strokeDasharray='3 3'
                            stroke='#374151'
                          />
                          <XAxis
                            dataKey='date'
                            stroke='#9ca3af'
                            tick={{ fill: '#9ca3af', fontSize: 12 }}
                            angle={-45}
                            textAnchor='end'
                            height={60}
                          />
                          <YAxis
                            stroke='#9ca3af'
                            tick={{ fill: '#9ca3af', fontSize: 12 }}
                            tickFormatter={(value) =>
                              `₦${(value / 1000).toFixed(0)}k`
                            }
                          />
                          <Tooltip
                            contentStyle={{
                              backgroundColor: 'rgba(0, 0, 0, 0.8)',
                              border: '1px solid #374151',
                              borderRadius: '8px',
                            }}
                            labelStyle={{ color: '#e5e7eb' }}
                            formatter={(value: any) =>
                              `₦${value.toLocaleString()}`
                            }
                          />
                          <Bar
                            dataKey='revenue'
                            fill='url(#colorRevenue)'
                            radius={[8, 8, 0, 0]}
                            name='Revenue'
                          />
                        </BarChart>
                      </ResponsiveContainer>
                    ) : (
                      <div className='flex items-center justify-center h-[300px] text-gray-500'>
                        <div className='text-center'>
                          <DollarSign className='w-12 h-12 mx-auto mb-2 opacity-50' />
                          <p>No revenue data available</p>
                          <p className='text-sm mt-1'>
                            Revenue analytics will appear here
                          </p>
                        </div>
                      </div>
                    )}
                  </div>
                </div>

                {/* Combined Overview (Optional) */}
                {(((Array.isArray(userStats) && userStats.length > 0) ||
                  (userStats?.dailyUsers && userStats.dailyUsers.length > 0)) ||
                  (revenueStats?.dailyRevenue && revenueStats.dailyRevenue.length > 0)) && (
                  <div className='grid grid-cols-1 lg:grid-cols-2 gap-6 mt-6'>
                    {/* Summary Stats */}
                    <div className='bg-black/30 rounded-xl p-4'>
                      <h4 className='text-white font-semibold mb-3'>
                        Quick Stats
                      </h4>
                      <div className='space-y-2'>
                        {((Array.isArray(userStats) && userStats.length > 0) ||
                          (userStats?.dailyUsers && userStats.dailyUsers.length > 0)) && (
                          <>
                            <div className='flex justify-between items-center'>
                              <span className='text-gray-400'>
                                Total New Users
                              </span>
                              <span className='text-blue-400 font-bold'>
                                {(Array.isArray(userStats)
                                  ? userStats
                                  : userStats?.dailyUsers
                                )?.reduce(
                                  (sum: number, d: any) =>
                                    sum + (d.newUsers || 0),
                                  0
                                )}
                              </span>
                            </div>
                            <div className='flex justify-between items-center'>
                              <span className='text-gray-400'>
                                Avg Active Users
                              </span>
                              <span className='text-emerald-400 font-bold'>
                                {Math.round(
                                  (Array.isArray(userStats)
                                    ? userStats
                                    : userStats?.dailyUsers
                                  )?.reduce(
                                    (sum: number, d: any) =>
                                      sum + (d.activeUsers || 0),
                                    0
                                  ) /
                                    ((Array.isArray(userStats)
                                      ? userStats
                                      : userStats?.dailyUsers
                                    )?.length || 1)
                                )}
                              </span>
                            </div>
                          </>
                        )}
                        {revenueStats?.dailyRevenue && revenueStats.dailyRevenue.length > 0 && (
                          <>
                            <div className='flex justify-between items-center'>
                              <span className='text-gray-400'>
                                Total Revenue
                              </span>
                              <span className='text-emerald-400 font-bold'>
                                ₦
                                {revenueStats?.dailyRevenue
                                  ?.reduce(
                                    (sum: number, d: any) =>
                                      sum + (d.revenue || 0),
                                    0
                                  )
                                  .toLocaleString()}
                              </span>
                            </div>
                            <div className='flex justify-between items-center'>
                              <span className='text-gray-400'>
                                Avg Daily Revenue
                              </span>
                              <span className='text-amber-400 font-bold'>
                                ₦
                                {Math.round(
                                  (revenueStats?.dailyRevenue?.reduce(
                                    (sum: number, d: any) =>
                                      sum + (d.revenue || 0),
                                    0
                                  ) || 0) / (revenueStats?.dailyRevenue?.length || 1)
                                ).toLocaleString()}
                              </span>
                            </div>
                          </>
                        )}
                      </div>
                    </div>

                    {/* Data Table */}
                    <div className='bg-black/30 rounded-xl p-4'>
                      <h4 className='text-white font-semibold mb-3'>
                        Recent Activity
                      </h4>
                      <div className='space-y-1 max-h-32 overflow-y-auto'>
                        {(Array.isArray(userStats)
                          ? userStats
                          : userStats?.dailyUsers
                        )
                          ?.slice(-5)
                          ?.reverse()
                          ?.map((d: any) => (
                            <div
                              key={d.date}
                              className='flex justify-between text-sm'
                            >
                              <span className='text-gray-400'>{d.date}</span>
                              <div className='flex gap-4'>
                                <span className='text-blue-400'>
                                  +{d.newUsers} new
                                </span>
                                <span className='text-emerald-400'>
                                  {d.activeUsers} active
                                </span>
                              </div>
                            </div>
                          ))}
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Quick Actions */}
        <div className='grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4'>
          <Link href='/admin/users'>
            <Card className='group bg-white/5 backdrop-blur-sm border-white/10 hover:bg-white/10 transition-all cursor-pointer'>
              <CardContent className='p-6 text-center'>
                <Users className='w-8 h-8 text-blue-400 mx-auto mb-3' />
                <h3 className='font-semibold text-white mb-1'>Manage Users</h3>
                <p className='text-gray-400 text-sm'>User administration</p>
              </CardContent>
            </Card>
          </Link>

          <Link href='/admin/transactions'>
            <Card className='group bg-white/5 backdrop-blur-sm border-white/10 hover:bg-white/10 transition-all cursor-pointer'>
              <CardContent className='p-6 text-center'>
                <DollarSign className='w-8 h-8 text-emerald-400 mx-auto mb-3' />
                <h3 className='font-semibold text-white mb-1'>Transactions</h3>
                <p className='text-gray-400 text-sm'>Financial overview</p>
              </CardContent>
            </Card>
          </Link>

          <Link href='/admin/polls'>
            <Card className='group bg-white/5 backdrop-blur-sm border-white/10 hover:bg-white/10 transition-all cursor-pointer'>
              <CardContent className='p-6 text-center'>
                <BarChart3 className='w-8 h-8 text-violet-400 mx-auto mb-3' />
                <h3 className='font-semibold text-white mb-1'>Poll Manager</h3>
                <p className='text-gray-400 text-sm'>Manage all polls</p>
              </CardContent>
            </Card>
          </Link>

          <Link href='/admin/create'>
            <Card className='group bg-white/5 backdrop-blur-sm border-white/10 hover:bg-white/10 transition-all cursor-pointer'>
              <CardContent className='p-6 text-center'>
                <Sparkles className='w-8 h-8 text-pink-400 mx-auto mb-3' />
                <h3 className='font-semibold text-white mb-1'>Create Poll</h3>
                <p className='text-gray-400 text-sm'>Add new predictions</p>
              </CardContent>
            </Card>
          </Link>
        </div>
      </div>
    </div>
  );
}
