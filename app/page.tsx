"use client";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useAllPolls } from "@/lib/polls";
import { cn } from "@/lib/utils";
import { useAuthStore } from "@/stores/authStore";
import type { Poll } from "@/types/api";
import {
  Activity,
  ArrowRight,
  BadgeCheck,
  ChevronRight,
  CircleDollarSign,
  Crown,
  Flame,
  Gift,
  Heart,
  PartyPopper,
  Rocket,
  Shield,
  Sparkles,
  Star,
  Target,
  Timer,
  TrendingUp,
  Trophy,
  Users,
  XCircle,
  Zap,
} from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

export default function Home() {
  const router = useRouter();
  const { user } = useAuthStore();
  const { data: pollsData, isLoading } = useAllPolls();
  const [activeTestimonial, setActiveTestimonial] = useState(0);

  const polls: Poll[] = (pollsData?.data as any)?.docs || [];
  const activePolls = polls.filter((p) => p.status === "active").slice(0, 3);
  const totalPoolAmount = polls.reduce(
    (acc, p: any) => acc + (p.totalStakeAmount || 0),
    0
  );
  const totalParticipants = polls.reduce(
    (acc, p: any) => acc + (p.totalParticipants || 0),
    0
  );

  const features = [
    {
      icon: Users,
      title: "Player vs Player",
      description:
        "Win money directly from other players, not the house. Pure peer-to-peer predictions",
      color: "from-violet-500 to-purple-500",
    },
    {
      icon: Trophy,
      title: "Big Wins Possible",
      description:
        "Winners share the pool based on their stakes. Bigger stakes, bigger wins",
      color: "from-amber-500 to-orange-500",
    },
    {
      icon: Shield,
      title: "Fair & Transparent",
      description:
        "See exactly how much is in the pool and how much you can win",
      color: "from-emerald-500 to-teal-500",
    },
    {
      icon: Activity,
      title: "Live Pool Updates",
      description:
        "Watch the prize pool grow as more players join the prediction",
      color: "from-pink-500 to-rose-500",
    },
  ];

  const testimonials = [
    {
      name: "Chioma A.",
      role: "Lagos",
      content:
        "Won ₦50,000 from other players who predicted wrong. Love the competition! 🔥",
      avatar: "👩",
      winAmount: "₦50,000",
    },
    {
      name: "David O.",
      role: "Abuja",
      content:
        "Beat 200+ players and took home their stakes. Pure skill, no luck!",
      avatar: "👨",
      winAmount: "₦15,000",
    },
    {
      name: "Blessing E.",
      role: "Port Harcourt",
      content:
        "I love that we're competing against each other, not the house. Fair game!",
      avatar: "👩",
      winAmount: "₦30,000",
    },
  ];

  const howItWorks = [
    {
      step: "1",
      title: "Join a Pool",
      description:
        "Pick a prediction and stake your money against other players",
      icon: Users,
    },
    {
      step: "2",
      title: "Pool Grows",
      description: "More players join, the prize pool gets bigger",
      icon: TrendingUp,
    },
    {
      step: "3",
      title: "Event Happens",
      description: "Watch the entertainment show to see the outcome",
      icon: Activity,
    },
    {
      step: "4",
      title: "Winners Get Paid",
      description:
        "Correct predictions win a share of the pool based on stake size",
      icon: Trophy,
    },
  ];

  useEffect(() => {
    const interval = setInterval(() => {
      setActiveTestimonial((prev) => (prev + 1) % testimonials.length);
    }, 5000);
    return () => clearInterval(interval);
  }, [testimonials.length]);

  const getCategoryIcon = (category: string) => {
    switch (category.toLowerCase()) {
      case "eviction":
        return XCircle;
      case "hoh":
        return Crown;
      case "task":
        return Target;
      default:
        return Star;
    }
  };

  const getCategoryColor = (category: string) => {
    switch (category.toLowerCase()) {
      case "eviction":
        return "from-red-500 to-pink-500";
      case "hoh":
        return "from-amber-500 to-orange-500";
      case "task":
        return "from-blue-500 to-cyan-500";
      default:
        return "from-emerald-500 to-teal-500";
    }
  };

  return (
    <div className="min-h-screen bg-black overflow-hidden">
      {/* Hero Section */}
      <section className="relative min-h-screen flex items-center px-4 sm:px-0">
        {/* Animated Background */}
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-br from-violet-950/30 via-black to-pink-950/30" />
          <div className="absolute top-0 right-1/4 sm:right-1/3 w-48 sm:w-64 md:w-96 h-48 sm:h-64 md:h-96 bg-pink-500/20 rounded-full blur-3xl animate-pulse" />
          <div className="absolute bottom-0 left-1/4 sm:left-1/3 w-48 sm:w-64 md:w-96 h-48 sm:h-64 md:h-96 bg-violet-500/20 rounded-full blur-3xl animate-pulse delay-1000" />
          <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-[300px] sm:w-[500px] md:w-[800px] h-[300px] sm:h-[500px] md:h-[800px] bg-gradient-to-r from-orange-500/10 to-amber-500/10 rounded-full blur-3xl animate-pulse delay-500" />
        </div>

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-16 lg:py-20">
          <div className="text-center">
            {/* Welcome Badge */}
            <div className="inline-flex items-center gap-2 px-3 sm:px-4 py-1.5 sm:py-2 rounded-full bg-gradient-to-r from-violet-500/20 to-pink-500/20 border border-violet-500/30 mb-6 sm:mb-8">
              <Sparkles className="w-3 sm:w-4 h-3 sm:h-4 text-violet-400" />
              <span className="text-xs sm:text-sm font-medium text-violet-300">
                Nigeria&apos;s #1 PvP Platform
              </span>
            </div>

            {/* Main Heading */}
            <h1 className="font-black mb-4 sm:mb-6">
              <span className="block text-3xl xs:text-4xl sm:text-5xl md:text-6xl lg:text-7xl xl:text-8xl bg-gradient-to-r from-violet-400 via-pink-400 to-orange-400 bg-clip-text text-transparent animate-gradient">
                Turn Your Vibes
              </span>
              <span className="block text-3xl xs:text-4xl sm:text-5xl md:text-6xl lg:text-7xl xl:text-8xl bg-gradient-to-r from-orange-400 via-pink-400 to-violet-400 bg-clip-text text-transparent animate-gradient delay-150">
                Into Cash 💸
              </span>
            </h1>

            {/* Subheading */}
            <p className="text-base xs:text-lg sm:text-xl md:text-2xl text-gray-300 mb-3 sm:mb-4 max-w-3xl mx-auto px-4 sm:px-0">
              Predict entertainment show outcomes and events. Win money from
              other players!
            </p>
            {totalParticipants > 0 ? (
              <p className="text-base sm:text-lg text-gray-400 mb-2">
                Join {totalParticipants.toLocaleString()}+ players competing for
                real money daily!
              </p>
            ) : (
              <p className="text-base sm:text-lg text-gray-400 mb-2">
                Compete against other players for real money!
              </p>
            )}

            {/* Disclaimer */}
            <p className="text-xs sm:text-sm text-gray-500 mb-6 sm:mb-8 italic">
              Independent platform • Not affiliated with any TV networks
            </p>

            {/* CTA Buttons */}
            <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 justify-center items-center mb-8 sm:mb-12 px-4 sm:px-0 w-full sm:w-auto">
              {user ? (
                <Link href="/polls">
                  <Button
                    size="lg"
                    className="bg-gradient-to-r from-violet-500 to-pink-500 hover:from-violet-600 hover:to-pink-600 text-white px-4 xs:px-6 sm:px-8 py-3 xs:py-4 sm:py-6 text-sm xs:text-base sm:text-lg font-bold rounded-xl sm:rounded-2xl shadow-2xl shadow-purple-500/25 transform hover:scale-105 transition-all w-full sm:w-auto min-w-[200px] sm:min-w-fit"
                  >
                    <Rocket className="mr-2 w-5 h-5" />
                    Start Predicting
                    <ArrowRight className="ml-2 w-5 h-5" />
                  </Button>
                </Link>
              ) : (
                <>
                  <Link href="/register">
                    <Button
                      size="lg"
                      className="bg-gradient-to-r from-violet-500 to-pink-500 hover:from-violet-600 hover:to-pink-600 text-white px-4 xs:px-6 sm:px-8 py-3 xs:py-4 sm:py-6 text-sm xs:text-base sm:text-lg font-bold rounded-xl sm:rounded-2xl shadow-2xl shadow-purple-500/25 transform hover:scale-105 transition-all w-full sm:w-auto min-w-[200px] sm:min-w-fit"
                    >
                      <Gift className="mr-2 w-5 h-5" />
                      Get ₦10,000 to Battle
                      <ArrowRight className="ml-2 w-5 h-5" />
                    </Button>
                  </Link>
                  <Link href="/">
                    <Button
                      variant="outline"
                      size="lg"
                      className="border-2 border-white/20 text-white hover:bg-white/10 px-4 xs:px-6 sm:px-8 py-3 xs:py-4 sm:py-6 text-sm xs:text-base sm:text-lg font-bold rounded-xl sm:rounded-2xl backdrop-blur-sm w-full sm:w-auto min-w-[200px] sm:min-w-fit"
                    >
                      Sign In
                    </Button>
                  </Link>
                </>
              )}
            </div>

            {/* Live Stats */}
            {/* <div className='grid grid-cols-1 sm:grid-cols-3 gap-4 sm:gap-6 max-w-3xl mx-auto'>
              <div className='p-3 sm:p-4 rounded-xl sm:rounded-2xl bg-white/5 backdrop-blur-sm border border-white/10'>
                <div className='text-2xl sm:text-3xl font-black text-emerald-400'>
                  ₦
                  {totalPoolAmount > 0
                    ? (totalPoolAmount / 1000000).toFixed(1)
                    : '2.5'}
                  M+
                </div>
                <div className='text-gray-400 text-xs sm:text-sm'>
                  Players&apos; Money Pool
                </div>
              </div>
              <div className='p-3 sm:p-4 rounded-xl sm:rounded-2xl bg-white/5 backdrop-blur-sm border border-white/10'>
                <div className='text-2xl sm:text-3xl font-black text-violet-400'>
                  {activePolls.length}
                </div>
                <div className='text-gray-400 text-xs sm:text-sm'>Live Battles</div>
              </div>
              <div className='p-3 sm:p-4 rounded-xl sm:rounded-2xl bg-white/5 backdrop-blur-sm border border-white/10'>
                <div className='text-2xl sm:text-3xl font-black text-amber-400'>100%</div>
                <div className='text-gray-400 text-xs sm:text-sm'>Payout to Winners</div>
              </div>
            </div> */}
          </div>
        </div>
      </section>

      {/* Live Polls Section */}
      {activePolls.length > 0 && (
        <section className="py-8 xs:py-12 sm:py-16 lg:py-20 relative">
          <div className="absolute inset-0 bg-gradient-to-b from-black via-violet-950/10 to-black" />
          <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-8 sm:mb-12">
              <Badge className="bg-red-500/20 text-red-400 border border-red-500/30 mb-3 sm:mb-4 text-xs sm:text-sm">
                <Flame className="w-2.5 sm:w-3 h-2.5 sm:h-3 mr-1" />
                LIVE NOW
              </Badge>
              <h2 className="text-2xl xs:text-3xl sm:text-4xl md:text-5xl font-black mb-2 sm:mb-4">
                <span className="bg-gradient-to-r from-red-400 via-orange-400 to-amber-400 bg-clip-text text-transparent">
                  Active Player Battles
                </span>
              </h2>
              <p className="text-base sm:text-lg md:text-xl text-gray-400 px-4 sm:px-0">
                Join these pools and compete against other players!
              </p>
            </div>

            <div className="grid grid-cols-1 xs:grid-cols-2 lg:grid-cols-3 gap-3 xs:gap-4 sm:gap-6 mb-6 sm:mb-8">
              {activePolls.map((poll) => {
                const timeLeft =
                  new Date(poll.endTime ?? 0).getTime() - Date.now();
                const hoursLeft = Math.floor(timeLeft / (1000 * 60 * 60));
                const daysLeft = Math.floor(hoursLeft / 24);
                const CategoryIcon = getCategoryIcon(poll.category);

                return (
                  <Card
                    key={poll.id}
                    className="group bg-white/5 backdrop-blur-sm border-white/10 hover:bg-white/10 transition-all overflow-hidden cursor-pointer"
                    onClick={() => router.push("/polls")}
                  >
                    <div
                      className={cn(
                        "h-2 bg-gradient-to-r",
                        getCategoryColor(poll.category)
                      )}
                    />
                    <CardHeader>
                      <div className="flex items-start justify-between mb-3">
                        <Badge
                          className={cn(
                            "bg-gradient-to-r text-white border-0",
                            getCategoryColor(poll.category)
                          )}
                        >
                          <CategoryIcon className="w-3 h-3 mr-1" />
                          {poll.category}
                        </Badge>
                        {timeLeft > 0 && (
                          <Badge
                            variant="outline"
                            className="border-red-500/30 text-red-400"
                          >
                            <Timer className="w-3 h-3 mr-1" />
                            {daysLeft > 0
                              ? `${daysLeft}d`
                              : `${hoursLeft}h`}{" "}
                            left
                          </Badge>
                        )}
                      </div>
                      <CardTitle className="text-lg text-white group-hover:text-transparent group-hover:bg-gradient-to-r group-hover:from-violet-400 group-hover:to-pink-400 group-hover:bg-clip-text transition-all">
                        {poll.title}
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-3">
                        {/* Pool Amount - Only show if data exists */}
                        {poll.totalStakeAmount !== undefined &&
                          poll.totalStakeAmount > 0 && (
                            <div className="flex items-center justify-between p-3 rounded-xl bg-black/30">
                              <div className="flex items-center gap-2">
                                <CircleDollarSign className="w-4 h-4 text-emerald-400" />
                                <span className="text-gray-400 text-sm">
                                  Players&apos; Pool
                                </span>
                              </div>
                              <span className="text-emerald-400 font-bold">
                                ₦{poll.totalStakeAmount.toLocaleString()}
                              </span>
                            </div>
                          )}

                        {/* Players - Only show if data exists */}
                        {poll.totalParticipants !== undefined &&
                          poll.totalParticipants > 0 && (
                            <div className="flex items-center justify-between">
                              <div className="flex items-center gap-2">
                                <Users className="w-4 h-4 text-violet-400" />
                                <span className="text-gray-400 text-sm">
                                  Players
                                </span>
                              </div>
                              <span className="text-white font-bold">
                                {poll.totalParticipants}
                              </span>
                            </div>
                          )}

                        {/* Options Preview */}
                        {poll.options && poll.options.length > 0 && (
                          <div className="pt-2 border-t border-white/10">
                            <p className="text-xs text-gray-500 mb-2">
                              Top choices:
                            </p>
                            <div className="flex flex-wrap gap-1">
                              {poll.options.slice(0, 3).map((option, idx) => (
                                <Badge
                                  key={idx}
                                  variant="secondary"
                                  className="bg-white/10 text-white border-white/20 text-xs"
                                >
                                  {option.text}
                                </Badge>
                              ))}
                              {poll.options.length > 3 && (
                                <Badge
                                  variant="secondary"
                                  className="bg-white/10 text-gray-400 border-white/20 text-xs"
                                >
                                  +{poll.options.length - 3} more
                                </Badge>
                              )}
                            </div>
                          </div>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>

            <div className="text-center">
              <Link href="/polls">
                <Button
                  size="lg"
                  variant="outline"
                  className="border-white/20 text-white hover:bg-white/10 rounded-xl font-bold"
                >
                  View All Predictions
                  <ArrowRight className="ml-2 w-4 h-4" />
                </Button>
              </Link>
            </div>
          </div>
        </section>
      )}

      {/* How It Works */}
      <section className="py-8 xs:py-12 sm:py-16 lg:py-20 relative">
        <div className="absolute inset-0 bg-gradient-to-b from-black via-purple-950/10 to-black" />
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-8 sm:mb-12">
            <h2 className="text-2xl xs:text-3xl sm:text-4xl md:text-5xl font-black mb-2 sm:mb-4">
              <span className="bg-gradient-to-r from-emerald-400 to-teal-400 bg-clip-text text-transparent">
                How Player Battles Work
              </span>
            </h2>
            <p className="text-base sm:text-lg md:text-xl text-gray-400 px-4 sm:px-0">
              Simple: Predict right, take home the losers&apos; money
            </p>
          </div>

          <div className="grid grid-cols-1 xs:grid-cols-2 lg:grid-cols-4 gap-3 xs:gap-4 sm:gap-6">
            {howItWorks.map((step, index) => (
              <div key={index} className="relative">
                {index < howItWorks.length - 1 && (
                  <div className="hidden lg:block absolute top-12 left-full w-full">
                    <ChevronRight className="w-6 h-6 text-gray-600 -ml-3" />
                  </div>
                )}
                <Card className="bg-white/5 backdrop-blur-sm border-white/10 hover:bg-white/10 transition-all h-full">
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between mb-4">
                      <span className="text-5xl font-black text-white/10">
                        {step.step}
                      </span>
                      <div className="p-3 rounded-xl bg-gradient-to-br from-violet-500/20 to-pink-500/20">
                        <step.icon className="w-6 h-6 text-violet-400" />
                      </div>
                    </div>
                    <h3 className="text-lg font-bold text-white mb-2">
                      {step.title}
                    </h3>
                    <p className="text-gray-400 text-sm">{step.description}</p>
                  </CardContent>
                </Card>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features Grid */}
      <section className="py-8 xs:py-12 sm:py-16 lg:py-20 relative">
        <div className="absolute inset-0 bg-gradient-to-b from-black via-pink-950/10 to-black" />
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-8 sm:mb-12">
            <h2 className="text-2xl xs:text-3xl sm:text-4xl md:text-5xl font-black mb-2 sm:mb-4">
              <span className="bg-gradient-to-r from-violet-400 to-pink-400 bg-clip-text text-transparent">
                Why Players Love Us
              </span>
            </h2>
            <p className="text-base sm:text-lg md:text-xl text-gray-400 px-4 sm:px-0">
              No house edge - it&apos;s players vs players, fair and square
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 xs:gap-4 sm:gap-6">
            {features.map((feature, index) => (
              <Card
                key={index}
                className="group bg-white/5 backdrop-blur-sm border-white/10 hover:bg-white/10 transition-all"
              >
                <CardContent className="p-4 xs:p-6 sm:p-8">
                  <div className="flex items-start gap-4">
                    <div
                      className={cn(
                        "p-3 rounded-2xl bg-gradient-to-br",
                        feature.color,
                        "bg-opacity-20"
                      )}
                    >
                      <feature.icon className="w-6 h-6 text-white" />
                    </div>
                    <div className="flex-1">
                      <h3 className="text-xl font-bold text-white mb-2 group-hover:text-transparent group-hover:bg-gradient-to-r group-hover:from-violet-400 group-hover:to-pink-400 group-hover:bg-clip-text transition-all">
                        {feature.title}
                      </h3>
                      <p className="text-gray-400">{feature.description}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials */}
      {/* <section className='hidden py-8 xs:py-12 sm:py-16 lg:py-20 relative'>
        <div className='absolute inset-0 bg-gradient-to-b from-black via-violet-950/10 to-black' />
        <div className='relative max-w-4xl mx-auto px-4 sm:px-6 lg:px-8'>
          <div className='text-center mb-8 sm:mb-12'>
            <h2 className='text-2xl xs:text-3xl sm:text-4xl md:text-5xl font-black mb-2 sm:mb-4'>
              <span className='bg-gradient-to-r from-amber-400 to-orange-400 bg-clip-text text-transparent'>
                Players Who Beat Others
              </span>
            </h2>
            <p className='text-base sm:text-lg md:text-xl text-gray-400 px-4 sm:px-0'>
              They predicted right and took home the losers&apos; money
            </p>
          </div>

          <div className='relative'>
            <Card className='bg-gradient-to-br from-violet-900/30 via-purple-900/30 to-pink-900/30 border-white/10 backdrop-blur-xl overflow-hidden'>
              <CardContent className='p-4 xs:p-6 sm:p-8 md:p-12'>
                <div className='flex items-center justify-between mb-6'>
                  <div className='flex items-center gap-4'>
                    <div className='text-4xl'>
                      {testimonials[activeTestimonial].avatar}
                    </div>
                    <div>
                      <p className='text-white font-bold text-lg'>
                        {testimonials[activeTestimonial].name}
                      </p>
                      <p className='text-gray-400 text-sm'>
                        {testimonials[activeTestimonial].role}
                      </p>
                    </div>
                  </div>
                  <Badge className='bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'>
                    <Trophy className='w-3 h-3 mr-1' />
                    {testimonials[activeTestimonial].winAmount}
                  </Badge>
                </div>
                <p className='text-base xs:text-lg sm:text-xl text-white italic'>
                  {` "${testimonials[activeTestimonial].content}"`}
                </p>
                <div className='flex gap-1 mt-6'>
                  {testimonials.map((_, index) => (
                    <button
                      key={index}
                      onClick={() => setActiveTestimonial(index)}
                      className={cn(
                        'w-2 h-2 rounded-full transition-all',
                        activeTestimonial === index
                          ? 'w-8 bg-gradient-to-r from-violet-400 to-pink-400'
                          : 'bg-white/20'
                      )}
                    />
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </section> */}

      {/* Trust Badges */}
      <section className="py-8 xs:py-12 sm:py-16 lg:py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 xs:gap-4 sm:gap-6">
            <div className="text-center">
              <div className="inline-flex items-center justify-center w-12 xs:w-14 sm:w-16 h-12 xs:h-14 sm:h-16 rounded-xl sm:rounded-2xl bg-gradient-to-br from-emerald-500/20 to-teal-500/20 mb-2 sm:mb-3">
                <BadgeCheck className="w-6 xs:w-7 sm:w-8 h-6 xs:h-7 sm:h-8 text-emerald-400" />
              </div>
              <p className="text-white font-bold text-sm sm:text-base">
                Fair Play
              </p>
              <p className="text-gray-500 text-xs sm:text-sm">
                Player vs Player
              </p>
            </div>
            <div className="text-center">
              <div className="inline-flex items-center justify-center w-12 xs:w-14 sm:w-16 h-12 xs:h-14 sm:h-16 rounded-xl sm:rounded-2xl bg-gradient-to-br from-violet-500/20 to-purple-500/20 mb-2 sm:mb-3">
                <Shield className="w-6 xs:w-7 sm:w-8 h-6 xs:h-7 sm:h-8 text-violet-400" />
              </div>
              <p className="text-white font-bold text-sm sm:text-base">
                Secure
              </p>
              <p className="text-gray-500 text-xs sm:text-sm">
                Bank-level encryption
              </p>
            </div>
            <div className="text-center">
              <div className="inline-flex items-center justify-center w-12 xs:w-14 sm:w-16 h-12 xs:h-14 sm:h-16 rounded-xl sm:rounded-2xl bg-gradient-to-br from-amber-500/20 to-orange-500/20 mb-2 sm:mb-3">
                <Zap className="w-6 xs:w-7 sm:w-8 h-6 xs:h-7 sm:h-8 text-amber-400" />
              </div>
              <p className="text-white font-bold text-sm sm:text-base">
                Instant Wins
              </p>
              <p className="text-gray-500 text-xs sm:text-sm">
                Get losers&apos; money
              </p>
            </div>
            <div className="text-center">
              <div className="inline-flex items-center justify-center w-12 xs:w-14 sm:w-16 h-12 xs:h-14 sm:h-16 rounded-xl sm:rounded-2xl bg-gradient-to-br from-pink-500/20 to-rose-500/20 mb-2 sm:mb-3">
                <Heart className="w-6 xs:w-7 sm:w-8 h-6 xs:h-7 sm:h-8 text-pink-400" />
              </div>
              <p className="text-white font-bold text-sm sm:text-base">
                24/7 Support
              </p>
              <p className="text-gray-500 text-xs sm:text-sm">
                Always here for you
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Final CTA */}
      <section className="py-8 xs:py-12 sm:py-16 lg:py-20 relative">
        <div className="absolute inset-0 bg-gradient-to-br from-violet-950/30 via-purple-950/30 to-pink-950/30" />
        <div className="relative max-w-4xl mx-auto text-center px-4 sm:px-6 lg:px-8">
          <div className="inline-flex items-center justify-center w-16 xs:w-18 sm:w-20 h-16 xs:h-18 sm:h-20 rounded-2xl sm:rounded-3xl bg-gradient-to-br from-amber-500 to-orange-500 mb-4 sm:mb-6 shadow-2xl shadow-amber-500/25">
            <PartyPopper className="w-8 xs:w-9 sm:w-10 h-8 xs:h-9 sm:h-10 text-white" />
          </div>
          <h2 className="text-2xl xs:text-3xl sm:text-4xl md:text-5xl font-black mb-2 sm:mb-4 text-white">
            Ready to Beat
            <span className="block bg-gradient-to-r from-amber-400 to-orange-400 bg-clip-text text-transparent">
              Other Players?
            </span>
          </h2>
          <p className="text-base sm:text-lg md:text-xl text-gray-300 mb-4 sm:mb-6 md:mb-8 max-w-2xl mx-auto px-4 sm:px-0">
            Beat other players with your entertainment predictions. Start
            winning start competing!
          </p>
          <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 justify-center items-center px-4 sm:px-0">
            <Link href="/register">
              <Button
                size="lg"
                className="bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-white px-6 xs:px-8 sm:px-12 py-3 xs:py-4 sm:py-6 text-base sm:text-lg md:text-xl font-black rounded-xl sm:rounded-2xl shadow-2xl shadow-amber-500/25 transform hover:scale-105 transition-all w-full sm:w-auto min-w-[200px] sm:min-w-fit"
              >
                <Gift className="mr-2 w-6 h-6" />
                Start Competing Now
                <ArrowRight className="ml-2 w-6 h-6" />
              </Button>
            </Link>
          </div>
          <p className="text-gray-500 text-sm mt-6">
            No credit card required • Instant bonus • Withdraw anytime
          </p>
        </div>
      </section>
    </div>
  );
}
