'use client';

import BonusEligibilityModal from '@/components/modals/BonusEligibilityModal';
import { Badge } from '@/components/ui/badge';
import { getCategoryBadge } from '@/lib/poll-badges';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { POLL_CATEGORIES } from '@/constants/categories';
import { capitalize } from '@/lib/capitalize';
import { useAllPolls } from '@/lib/polls';
import { useMyStakes } from '@/lib/stakes';
import { useUserStatistics } from '@/lib/user';
import { cn } from '@/lib/utils';
import { useAuthStore } from '@/stores/authStore';
import type { Poll } from '@/types/api';
import {
  Activity,
  ArrowDownRight,
  ArrowRight,
  ArrowUpRight,
  ChevronRight,
  Clock,
  Coins,
  Crown,
  DollarSign,
  Flame,
  Gift,
  RefreshCw,
  Sparkles,
  Target,
  TrendingUp,
  Trophy,
  Users,
  Wallet,
  Zap,
} from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import numeral from 'numeral';
import { useEffect, useState } from 'react';

export default function DashboardPage() {
  const { user, isAdmin, balance } = useAuthStore();
  const { data: pollsData, isLoading } = useAllPolls();
  const { data: userStatsResponse } = useUserStatistics();
  const { data: stakesData } = useMyStakes();
  const [greeting, setGreeting] = useState('');
  const [showBonusModal, setShowBonusModal] = useState(false);
  const route = useRouter();

  const userStats = userStatsResponse?.data;
  const stakes = stakesData?.data?.docs || [];
  useEffect(() => {
    const hour = new Date().getHours();
    if (hour < 12) setGreeting('Good morning');
    else if (hour < 18) setGreeting('Good afternoon');
    else setGreeting('Good evening');
  }, []);

  const polls: Poll[] = (pollsData?.data as any)?.docs || [];
  const activePolls = polls.filter((p) => p.status === 'active').slice(0, 3);
  const quickStats = [
    {
      title: 'Total Balance',
      value: `₦${balance.toLocaleString()}`,
      change:
        userStats?.netProfit && userStats.netProfit > 0
          ? `+${(
              (userStats.netProfit / (userStats.totalStaked || 1)) *
              100
            ).toFixed(1)}%`
          : 'No change',
      isPositive: (userStats?.netProfit ?? 0) > 0,
      icon: Coins,
      gradient: 'from-emerald-500 to-teal-500',
    },
    {
      title: 'Completed Stakes',
      value: userStats?.completedStakes ? `${userStats.completedStakes}` : '0',
      change: `${userStats?.activeStakes || 0} active`,
      isPositive: true,
      icon: Activity,
      gradient: 'from-violet-500 to-purple-500',
    },
    {
      title: 'Win Rate',
      value: userStats?.winRate ? `${userStats.winRate.toFixed(1)}%` : '0%',
      change: userStats?.winStreak
        ? `${userStats.winStreak} streak`
        : 'No streak',
      isPositive: (userStats?.winRate ?? 0) > 50,
      icon: Trophy,
      gradient: 'from-amber-500 to-orange-500',
    },
    {
      title: 'Total Earnings',
      value: `₦${
        userStats?.totalWon ? numeral(userStats.totalWon).format('0.0a') : '0'
      }`,
      change: userStats?.netProfit
        ? `₦${numeral(userStats.netProfit).format('0.0a')} profit`
        : 'No earnings',
      isPositive: (userStats?.netProfit ?? 0) > 0,
      icon: TrendingUp,
      gradient: 'from-pink-500 to-rose-500',
    },
  ];

  // Process recent stakes for activity
  const recentActivity = stakes.slice(0, 5).map((stake: any) => {
    const getActivityData = () => {
      if (stake.status === 'won') {
        return {
          type: 'winnings',
          title: `Won ${stake.poll?.title || 'Poll'}`,
          description: `${
            stake.selectedOption?.text || 'Your prediction'
          } came through!`,
          amount: `+₦${(stake.winningsAmount || 0).toLocaleString()}`,
          icon: Trophy,
        };
      } else if (stake.status === 'lost') {
        return {
          type: 'loss',
          title: `Lost ${stake.poll?.title || 'Poll'}`,
          description: stake.selectedOption?.text || 'Better luck next time',
          amount: `-₦${stake.amount.toLocaleString()}`,
          icon: ArrowDownRight,
        };
      } else if (stake.status === 'refunded') {
        return {
          type: 'refund',
          title: `Refunded ${stake.poll?.title || 'Poll'}`,
          description: 'Poll was cancelled - stake returned',
          amount: `+₦${stake.amount.toLocaleString()}`,
          icon: RefreshCw,
        };
      } else {
        return {
          type: 'stake',
          title: `Staked on ${stake.poll?.title || 'Poll'}`,
          description: stake.selectedOption?.text || 'Prediction placed',
          amount: `-₦${stake.amount.toLocaleString()}`,
          icon: Target,
        };
      }
    };

    const activityData = getActivityData();
    const createdDate = new Date(stake.createdAt);
    const now = new Date();
    const hoursDiff = Math.floor(
      (now.getTime() - createdDate.getTime()) / (1000 * 60 * 60)
    );
    const daysDiff = Math.floor(hoursDiff / 24);

    return {
      ...activityData,
      time:
        daysDiff > 0
          ? `${daysDiff} day${daysDiff > 1 ? 's' : ''} ago`
          : hoursDiff > 0
          ? `${hoursDiff} hour${hoursDiff > 1 ? 's' : ''} ago`
          : 'Just now',
    };
  });

  // Check if there's no activity
  const hasActivity = recentActivity.length > 0;

  return (
    <div className='min-h-screen bg-black'>
      {/* Animated Background */}
      <div className='fixed inset-0 bg-gradient-to-br from-violet-950/20 via-black to-pink-950/20' />
      <div className='fixed inset-0 bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-purple-900/10 via-transparent to-transparent' />

      <div className='relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-6 lg:py-8'>
        {/* Hero Section */}
        <div className='mb-6 sm:mb-8 lg:mb-10'>
          <div className='relative overflow-hidden rounded-2xl sm:rounded-3xl bg-gradient-to-br from-violet-600/10 via-purple-600/5 to-pink-600/10 border border-white/10 p-4 xs:p-6 sm:p-8 lg:p-12'>
            {/* Animated elements */}
            <div className='absolute top-0 right-0 w-32 sm:w-48 lg:w-64 h-32 sm:h-48 lg:h-64 bg-gradient-to-br from-violet-500/20 to-pink-500/20 rounded-full blur-3xl' />
            <div className='absolute bottom-0 left-0 w-24 sm:w-36 lg:w-48 h-24 sm:h-36 lg:h-48 bg-gradient-to-tr from-orange-500/20 to-amber-500/20 rounded-full blur-3xl' />

            <div className='relative z-10'>
              <div className='flex flex-wrap items-center gap-2 mb-3 sm:mb-4'>
                <div className='flex items-center gap-2 px-2 xs:px-3 py-1 xs:py-1.5 rounded-full bg-gradient-to-r from-amber-500/20 to-orange-500/20 border border-amber-500/30'>
                  <Sparkles className='w-3 xs:w-4 h-3 xs:h-4 text-amber-400' />
                  <span className='text-xs xs:text-sm font-medium text-amber-400'>
                    Odogwu Predictor
                  </span>
                </div>
                {isAdmin && (
                  <Badge className='bg-purple-500/20 text-purple-400 border-purple-500/30'>
                    <Crown className='w-3 h-3 mr-1' />
                    Admin
                  </Badge>
                )}
              </div>

              <h1 className='text-2xl xs:text-3xl sm:text-4xl lg:text-5xl font-black mb-2 sm:mb-3'>
                <span className='bg-gradient-to-r from-violet-400 via-pink-400 to-orange-400 bg-clip-text text-transparent'>
                  {greeting}, {capitalize(user?.firstName)}!
                </span>
              </h1>

              <p className='text-base sm:text-lg lg:text-xl text-gray-400 mb-4 sm:mb-6 lg:mb-8 max-w-2xl'>
                Your prediction game is on fire! Keep the streak going.
              </p>

              <div className='flex flex-col xs:flex-row gap-3 sm:gap-4'>
                <Link href='/polls'>
                  <Button className='group relative px-4 xs:px-6 sm:px-8 py-3 xs:py-4 sm:py-6 rounded-xl sm:rounded-2xl bg-gradient-to-r from-violet-500 to-pink-500 hover:from-violet-600 hover:to-pink-600 text-white font-bold text-sm xs:text-base sm:text-lg shadow-2xl shadow-purple-500/25 transform hover:scale-105 transition-all w-full xs:w-auto'>
                    <Zap className='w-4 sm:w-5 h-4 sm:h-5 mr-1.5 sm:mr-2' />
                    Start Predicting
                    <ArrowRight className='w-3 sm:w-4 h-3 sm:h-4 ml-1.5 sm:ml-2 group-hover:translate-x-1 transition-transform' />
                  </Button>
                </Link>
                <Button
                  variant='outline'
                  onClick={() => setShowBonusModal(true)}
                  className='px-4 xs:px-6 sm:px-8 py-3 xs:py-4 sm:py-6 rounded-xl sm:rounded-2xl border-white/20 text-white hover:bg-white/10 font-semibold text-sm xs:text-base sm:text-lg w-full xs:w-auto'
                >
                  <Gift className='w-5 h-5 mr-2' />
                  Claim Bonus
                </Button>
              </div>
            </div>
          </div>
        </div>

        {/* Quick Stats */}
        <div className='grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 mb-6 sm:mb-8 lg:mb-10'>
          {quickStats.map((stat, index) => (
            <div
              key={index}
              className='group relative overflow-hidden rounded-xl sm:rounded-2xl bg-white/5 backdrop-blur-sm border border-white/10 p-4 sm:p-5 lg:p-6 hover:bg-white/10 transition-all'
            >
              <div
                className='absolute top-0 right-0 w-24 h-24 bg-gradient-to-br opacity-10 rounded-full blur-2xl group-hover:opacity-20 transition-opacity'
                style={
                  {
                    backgroundImage: `linear-gradient(to bottom right, var(--tw-gradient-stops))`,
                    '--tw-gradient-from': `rgb(${
                      index === 0
                        ? '16 185 129'
                        : index === 1
                        ? '139 92 246'
                        : index === 2
                        ? '245 158 11'
                        : '236 72 153'
                    })`,
                    '--tw-gradient-to': `rgb(${
                      index === 0
                        ? '20 184 166'
                        : index === 1
                        ? '168 85 247'
                        : index === 2
                        ? '251 146 60'
                        : '244 114 182'
                    })`,
                  } as React.CSSProperties
                }
              />

              <div className='relative'>
                <div className='flex items-center justify-between mb-4'>
                  <div
                    className={cn(
                      'p-2 rounded-xl bg-gradient-to-r',
                      stat.gradient,
                      'bg-opacity-20'
                    )}
                  >
                    <stat.icon className='w-5 h-5 text-white' />
                  </div>
                  <span
                    className={cn(
                      'text-xs font-medium flex items-center gap-1',
                      stat.isPositive ? 'text-emerald-400' : 'text-red-400'
                    )}
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

        {/* Main Content Grid */}
        <div className='grid grid-cols-1 lg:grid-cols-3 gap-6'>
          {/* Hot Polls - Takes 2 columns */}
          <div className='lg:col-span-2'>
            <div className='flex items-center justify-between mb-6'>
              <div className='flex items-center gap-3'>
                <div className='p-2 rounded-xl bg-gradient-to-r from-orange-500/20 to-red-500/20'>
                  <Flame className='w-5 h-5 text-orange-400' />
                </div>
                <div>
                  <h2 className='text-xl sm:text-2xl font-bold text-white'>
                    Trending Now
                  </h2>
                  <p className='text-xs sm:text-sm text-gray-500'>
                    Jump on these hot predictions
                  </p>
                </div>
              </div>
              <Link href='/polls'>
                <Button
                  variant='ghost'
                  className='text-gray-400 hover:text-white'
                >
                  See all
                  <ChevronRight className='w-4 h-4 ml-1' />
                </Button>
              </Link>
            </div>

            <div className='space-y-3 sm:space-y-4'>
              {isLoading ? (
                <div className='flex items-center justify-center py-8'>
                  <div className='animate-spin rounded-full h-8 w-8 border-b-2 border-violet-400'></div>
                </div>
              ) : activePolls.length === 0 ? (
                <Card className='bg-white/5 backdrop-blur-sm border-white/10'>
                  <CardContent className='p-6 text-center'>
                    <p className='text-gray-400'>
                      No active polls at the moment
                    </p>
                  </CardContent>
                </Card>
              ) : (
                activePolls.map((poll) => (
                  <Card
                    key={poll.id}
                    onClick={() => route.push(`/polls/${poll.id}`)}
                    className='group cursor-pointer bg-white/5 backdrop-blur-sm border-white/10 hover:bg-white/10 transition-all overflow-hidden rounded-xl sm:rounded-2xl'
                  >
                    <CardContent className='p-4 sm:p-6'>
                      <div className='flex items-start justify-between mb-4'>
                        <div className='flex-1'>
                          <div className='flex items-center gap-2 mb-2'>
                            {getCategoryBadge(poll.category)}
                            <Badge
                              variant='outline'
                              className='border-orange-500/30 text-orange-400'
                            >
                              <Flame className='w-3 h-3 mr-1' />
                              Hot
                            </Badge>
                          </div>
                          <h3 className='text-lg sm:text-xl font-bold text-white mb-2 group-hover:text-transparent group-hover:bg-gradient-to-r group-hover:from-violet-400 group-hover:to-pink-400 group-hover:bg-clip-text transition-all'>
                            {poll.title}
                          </h3>
                          <p className='text-gray-400 text-sm line-clamp-2'>
                            {poll.description}
                          </p>
                        </div>
                      </div>

                      <div className='flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4'>
                        <div className='flex flex-wrap items-center gap-3 sm:gap-4 lg:gap-6'>
                          <div className='flex items-center gap-2'>
                            <div className='p-1.5 rounded-lg bg-emerald-500/20'>
                              <DollarSign className='w-4 h-4 text-emerald-400' />
                            </div>
                            <div>
                              <p className='text-xs text-gray-500'>
                                Prize Pool
                              </p>
                              <p className='text-base sm:text-lg font-bold text-emerald-400'>
                                ₦{(poll.totalStakeAmount || 0).toLocaleString()}
                              </p>
                            </div>
                          </div>
                          <div className='flex items-center gap-2'>
                            <div className='p-1.5 rounded-lg bg-blue-500/20'>
                              <Users className='w-4 h-4 text-blue-400' />
                            </div>
                            <div>
                              <p className='text-xs text-gray-500'>Players</p>
                              <p className='text-base sm:text-lg font-bold text-white'>
                                {poll.totalParticipants || 0}
                              </p>
                            </div>
                          </div>
                          <div className='flex items-center gap-2'>
                            <div className='p-1.5 rounded-lg bg-red-500/20'>
                              <Clock className='w-4 h-4 text-red-400' />
                            </div>
                            <div>
                              <p className='text-xs text-gray-500'>Ends in</p>
                              <p className='text-base sm:text-lg font-bold text-white'>
                                {Math.ceil(
                                  (new Date(poll.endTime ?? 0).getTime() -
                                    Date.now()) /
                                    (1000 * 60 * 60 * 24)
                                )}
                                d
                              </p>
                            </div>
                          </div>
                        </div>
                        <Link href='/polls'>
                          <Button className='w-full sm:w-auto rounded-xl bg-gradient-to-r from-violet-500 to-pink-500 hover:from-violet-600 hover:to-pink-600 font-semibold text-sm sm:text-base'>
                            Place Stake
                            <ArrowRight className='w-4 h-4 ml-2' />
                          </Button>
                        </Link>
                      </div>
                    </CardContent>
                  </Card>
                ))
              )}
            </div>
          </div>

          {/* Recent Activity */}
          <div className='lg:col-span-1'>
            <div className='flex items-center gap-3 mb-6'>
              <div className='p-2 rounded-xl bg-gradient-to-r from-blue-500/20 to-cyan-500/20'>
                <Activity className='w-5 h-5 text-blue-400' />
              </div>
              <div>
                <h2 className='text-xl sm:text-2xl font-bold text-white'>
                  Activity
                </h2>
                <p className='text-xs sm:text-sm text-gray-500'>
                  Your recent moves
                </p>
              </div>
            </div>

            {hasActivity ? (
              <div className='space-y-3'>
                {recentActivity.map((activity, index) => (
                  <div
                    key={index}
                    className='group p-4 rounded-2xl bg-white/5 backdrop-blur-sm border border-white/10 hover:bg-white/10 transition-all'
                  >
                    <div className='flex items-start gap-3'>
                      <div
                        className={cn(
                          'p-2 rounded-xl',
                          activity.type === 'win'
                            ? 'bg-emerald-500/20'
                            : activity.type === 'stake'
                            ? 'bg-purple-500/20'
                            : activity.type === 'loss'
                            ? 'bg-red-500/20'
                            : 'bg-blue-500/20'
                        )}
                      >
                        <activity.icon
                          className={cn(
                            'w-4 h-4',
                            activity.type === 'win'
                              ? 'text-emerald-400'
                              : activity.type === 'stake'
                              ? 'text-purple-400'
                              : activity.type === 'loss'
                              ? 'text-red-400'
                              : 'text-blue-400'
                          )}
                        />
                      </div>
                      <div className='flex-1'>
                        <p className='text-white font-semibold text-sm'>
                          {activity.title}
                        </p>
                        <p className='text-gray-500 text-xs mt-0.5'>
                          {activity.description}
                        </p>
                        <p className='text-gray-600 text-xs mt-2'>
                          {activity.time}
                        </p>
                      </div>
                      <span
                        className={cn(
                          'font-bold text-sm',
                          activity.amount.startsWith('+')
                            ? 'text-emerald-400'
                            : 'text-red-400'
                        )}
                      >
                        {activity.amount}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              /* Empty State - No fake data */
              <div className='text-center py-8'>
                <div className='w-16 h-16 mx-auto mb-4 rounded-full bg-gradient-to-r from-violet-500/10 to-pink-500/10 flex items-center justify-center'>
                  <Activity className='w-8 h-8 text-gray-600' />
                </div>
                <h3 className='text-white font-semibold mb-2'>
                  No Activity Yet
                </h3>
                <p className='text-gray-500 text-sm mb-6 max-w-xs mx-auto'>
                  Your prediction journey starts here! Place your first stake to
                  see activity.
                </p>
                <div className='space-y-2 flex flex-col'>
                  <Link href='/polls'>
                    <Button className='w-full bg-gradient-to-r from-violet-500/80 to-pink-500/80 hover:from-violet-500/30 hover:to-pink-500/30 border border-violet-500/30 text-white'>
                      <Target className='w-4 h-4 mr-2' />
                      Browse Predictions
                    </Button>
                  </Link>
                  <Link href='/wallet'>
                    <Button
                      variant='outline'
                      className='w-full border-white/20 text-gray-400 hover:text-white hover:bg-white/10'
                    >
                      <Wallet className='w-4 h-4 mr-2' />
                      Add Funds First
                    </Button>
                  </Link>
                </div>
              </div>
            )}

            {hasActivity && (
              <Link href='/profile'>
                <Button
                  variant='outline'
                  className='w-full mt-4 rounded-xl border-white/20 text-gray-400 hover:text-white hover:bg-white/10'
                >
                  View All Activity
                </Button>
              </Link>
            )}
          </div>
        </div>

        {/* Achievement Banner */}
        {/* {userStats?.winStreak > 0 && (
        <div className='mt-10'>
          <Card className='bg-gradient-to-r from-amber-500/10 via-orange-500/10 to-red-500/10 border-orange-500/20'>
            <CardContent className='p-6'>
              <div className='flex items-center justify-between'>
                <div className='flex items-center gap-4'>
                  <div className='p-3 rounded-2xl bg-gradient-to-br from-amber-500/20 to-orange-500/20'>
                    <Star className='w-8 h-8 text-amber-400' />
                  </div>
                  <div>
                    <h3 className='text-xl font-bold text-white mb-1'>{`You're on fire!`}</h3>
                    <p className='text-gray-400'>
                      {userStats.winStreak} win{userStats.winStreak > 1 ? 's' : ''} in a row - Keep the streak alive
                    </p>
                  </div>
                </div>
                <div className='hidden sm:flex items-center gap-2'>
                  {[...Array(Math.min(userStats.winStreak, 5))].map((_, i) => (
                    <div key={i} className='w-12 h-12 rounded-xl bg-amber-500/20 flex items-center justify-center'>
                      <Trophy className='w-5 h-5 text-amber-400' />
                    </div>
                  ))}
                  {userStats.winStreak > 5 && (
                    <div className='w-12 h-12 rounded-xl bg-amber-500/20 flex items-center justify-center'>
                      <span className='text-amber-400 font-bold'>+{userStats.winStreak - 5}</span>
                    </div>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
        )} */}
      </div>

      {/* Bonus Eligibility Modal */}
      <BonusEligibilityModal
        isOpen={showBonusModal}
        onClose={() => setShowBonusModal(false)}
      />
    </div>
  );
}
