"use client";

import Image from "next/image";
import { Button } from "@/components/ui/button";
import { useAllPolls } from "@/lib/polls";
import type { Poll } from "@/types/api";
import { ArrowRight } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState, useEffect } from "react";

// Mock polls for hero rotation
const mockPolls = [
  {
    question: "Who will win the championship?",
    optionA: "Team Alpha",
    optionB: "Team Beta",
    percentA: 65,
    percentB: 35,
    pool: 245,
    players: 128,
    timeLeft: "2d 14h",
  },
  {
    question: "Will BTC hit $100k this month?",
    optionA: "Yes",
    optionB: "No",
    percentA: 72,
    percentB: 28,
    pool: 480,
    players: 256,
    timeLeft: "5d 8h",
  },
  {
    question: "Next #1 app on App Store?",
    optionA: "Threads",
    optionB: "TikTok",
    percentA: 41,
    percentB: 59,
    pool: 125,
    players: 89,
    timeLeft: "1d 3h",
  },
  {
    question: "Who wins the election?",
    optionA: "Candidate A",
    optionB: "Candidate B",
    percentA: 52,
    percentB: 48,
    pool: 390,
    players: 312,
    timeLeft: "12h 45m",
  },
  {
    question: "Will ETH flip BTC market cap?",
    optionA: "Yes, this year",
    optionB: "No way",
    percentA: 23,
    percentB: 77,
    pool: 67,
    players: 54,
    timeLeft: "3d 20h",
  },
];

// Animated background grid component
function HeroGrid() {
  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none">
      <svg
        className="absolute w-full h-full"
        viewBox="0 0 800 800"
        preserveAspectRatio="xMidYMid slice"
      >
        <defs>
          {/* Gradient for lines */}
          <linearGradient id="lineGradient" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#1F1F1F" stopOpacity="0" />
            <stop offset="50%" stopColor="#1F1F1F" stopOpacity="0.5" />
            <stop offset="100%" stopColor="#1F1F1F" stopOpacity="0" />
          </linearGradient>

          {/* Glow filter */}
          <filter id="glow">
            <feGaussianBlur stdDeviation="2" result="coloredBlur" />
            <feMerge>
              <feMergeNode in="coloredBlur" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
        </defs>

        {/* Horizontal dotted lines */}
        {[200, 350, 500, 650].map((y, i) => (
          <line
            key={`h-${i}`}
            x1="0"
            y1={y}
            x2="800"
            y2={y}
            stroke="#1F1F1F"
            strokeWidth="1"
            strokeDasharray="2 20"
            opacity="0.2"
          />
        ))}

        {/* Vertical dotted lines */}
        {[150, 300, 500, 650].map((x, i) => (
          <line
            key={`v-${i}`}
            x1={x}
            y1="0"
            x2={x}
            y2="800"
            stroke="#1F1F1F"
            strokeWidth="1"
            strokeDasharray="2 20"
            opacity="0.2"
          />
        ))}

        {/* Intersection dots */}
        {[
          { x: 150, y: 200 }, { x: 300, y: 200 }, { x: 500, y: 200 }, { x: 650, y: 200 },
          { x: 150, y: 350 }, { x: 300, y: 350 }, { x: 500, y: 350 }, { x: 650, y: 350 },
          { x: 150, y: 500 }, { x: 300, y: 500 }, { x: 500, y: 500 }, { x: 650, y: 500 },
          { x: 150, y: 650 }, { x: 300, y: 650 }, { x: 500, y: 650 }, { x: 650, y: 650 },
        ].map((dot, i) => (
          <g key={`dot-${i}`}>
            <circle
              cx={dot.x}
              cy={dot.y}
              r="1.5"
              fill="#1F1F1F"
              opacity="0.4"
            />
            {/* Outer ring on some dots */}
            {i % 5 === 0 && (
              <circle
                cx={dot.x}
                cy={dot.y}
                r="6"
                fill="none"
                stroke="#1F1F1F"
                strokeWidth="0.5"
                opacity="0.1"
                className="animate-ping"
                style={{ animationDelay: `${i * 0.3}s`, animationDuration: '5s' }}
              />
            )}
          </g>
        ))}

        {/* Diagonal accent line */}
        <line
          x1="100"
          y1="700"
          x2="700"
          y2="100"
          stroke="url(#lineGradient)"
          strokeWidth="1"
          strokeDasharray="4 20"
          opacity="0.4"
        />

        {/* Floating orbs */}
        <circle cx="600" cy="200" r="60" fill="#1F1F1F" opacity="0.05">
          <animate
            attributeName="cy"
            values="200;220;200"
            dur="6s"
            repeatCount="indefinite"
          />
        </circle>
        <circle cx="200" cy="600" r="40" fill="#1F1F1F" opacity="0.04">
          <animate
            attributeName="cy"
            values="600;580;600"
            dur="5s"
            repeatCount="indefinite"
          />
        </circle>

        {/* Corner brackets */}
        <path
          d="M 50 100 L 50 50 L 100 50"
          fill="none"
          stroke="#1F1F1F"
          strokeWidth="1"
          opacity="0.3"
        />
        <path
          d="M 700 50 L 750 50 L 750 100"
          fill="none"
          stroke="#1F1F1F"
          strokeWidth="1"
          opacity="0.3"
        />
        <path
          d="M 50 700 L 50 750 L 100 750"
          fill="none"
          stroke="#1F1F1F"
          strokeWidth="1"
          opacity="0.3"
        />
        <path
          d="M 700 750 L 750 750 L 750 700"
          fill="none"
          stroke="#1F1F1F"
          strokeWidth="1"
          opacity="0.3"
        />
      </svg>
    </div>
  );
}

export default function Home() {
  const router = useRouter();
  const { data: pollsData } = useAllPolls();
  const [currentPollIndex, setCurrentPollIndex] = useState(0);
  const [isTransitioning, setIsTransitioning] = useState(false);

  // Rotate through mock polls
  useEffect(() => {
    const interval = setInterval(() => {
      setIsTransitioning(true);
      setTimeout(() => {
        setCurrentPollIndex((prev) => (prev + 1) % mockPolls.length);
        setIsTransitioning(false);
      }, 300);
    }, 6000);

    return () => clearInterval(interval);
  }, []);

  const currentMockPoll = mockPolls[currentPollIndex];

  const polls: Poll[] = (pollsData?.data as any)?.docs || [];
  const activePolls = polls.filter((p) => p.status === "active").slice(0, 3);
  const totalPool = polls.reduce(
    (acc, p: any) => acc + (p.totalStakeAmount || 0),
    0
  );
  const totalPlayers = polls.reduce(
    (acc, p: any) => acc + (p.totalParticipants || 0),
    0
  );

  return (
    <div className="min-h-screen bg-[#000000]">
      {/* Hero */}
      <section className="min-h-[100dvh] flex flex-col justify-center px-6 py-12 relative overflow-hidden">
        {/* Interactive grid background */}
        <HeroGrid />

        {/* Subtle ambient glow */}
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-[600px] h-[600px] bg-[#1F1F1F]/30 rounded-full blur-[150px] pointer-events-none" />

        <div className="relative z-10 max-w-3xl mx-auto w-full">
          <div className="grid grid-cols-1 min-[745px]:grid-cols-2 gap-8 min-[745px]:gap-10 items-center">
            {/* Left - Content */}
            <div>
              {/* Badge */}
              <div className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-[#0000ff]/10 border border-[#0000ff]/20 mb-6">
                <div className="w-1.5 h-1.5 rounded-full bg-[#0000ff] animate-pulse" />
                <span className="text-xs font-normal text-[#0000ff] tracking-wide">
                  Live on
                </span>
                <Image src="/base-text.svg" alt="Base" width={36} height={12} />
              </div>

              {/* Headline */}
              <h1 className="text-[2.75rem] leading-[1.1] sm:text-6xl font-semibold tracking-tight mb-4">
                <span className="text-[#EDEDED]">Predict.</span>
                <br />
                <span className="text-[#D8D8D8]">Stack wins.</span>
              </h1>

              {/* Subhead */}
              <p className="text-[#9A9A9A] text-lg font-light mb-8 max-w-sm">
                Back your predictions with USDC. Win from those who got it wrong.
              </p>

              {/* CTA */}
              <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
                <Link href="/polls">
                  <Button
                    size="lg"
                    className="w-full sm:w-auto bg-[#EDEDED] hover:bg-[#D8D8D8] text-[#0A0A0A] text-base font-medium rounded-full h-14 px-8 transition-colors"
                  >
                    Start Predicting
                    <ArrowRight className="ml-2 w-5 h-5" />
                  </Button>
                </Link>
                <Link
                  href="/guide"
                  className="text-sm text-[#9A9A9A] hover:text-[#EDEDED] transition-colors font-light"
                >
                  Learn how it works
                </Link>
              </div>

              {/* Stats Row */}
              {(totalPool > 0 || totalPlayers > 0) && (
                <div className="flex gap-8 mt-10 pt-8 border-t border-[#1F1F1F]">
                  {totalPool > 0 && (
                    <div>
                      <div className="text-2xl font-semibold text-[#EDEDED] inline-flex items-center gap-1">
                        <Image src="/usdc.svg" alt="USDC" width={20} height={20} />
                        {totalPool.toLocaleString()}
                      </div>
                      <div className="text-xs text-[#9A9A9A] uppercase tracking-wide font-light">
                        Total Pool
                      </div>
                    </div>
                  )}
                  {totalPlayers > 0 && (
                    <div>
                      <div className="text-2xl font-semibold text-[#EDEDED]">
                        {totalPlayers.toLocaleString()}
                      </div>
                      <div className="text-xs text-[#9A9A9A] uppercase tracking-wide font-light">
                        Players
                      </div>
                    </div>
                  )}
                  {activePolls.length > 0 && (
                    <div>
                      <div className="text-2xl font-semibold text-[#EDEDED]">
                        {activePolls.length}
                      </div>
                      <div className="text-xs text-[#9A9A9A] uppercase tracking-wide font-light">
                        Live
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Right - Visual */}
            <div className="hidden min-[745px]:block">
              <div className="relative">
                {/* Decorative glow */}
                <div className="absolute -inset-4 bg-gradient-to-br from-[#1F1F1F]/20 to-transparent rounded-3xl blur-2xl" />

                {/* Mock App Card */}
                <div className="relative bg-[#0A0A0A] border border-[#1F1F1F] rounded-2xl p-6 space-y-4 overflow-hidden">
                  {/* Card Header - Static */}
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                      <span className="text-xs text-emerald-400 font-medium">Live</span>
                    </div>
                    <span className={`text-xs text-[#9A9A9A] transition-opacity duration-500 ${isTransitioning ? 'opacity-0' : 'opacity-100'}`}>
                      Ends in {currentMockPoll.timeLeft}
                    </span>
                  </div>

                  {/* Question - Fades */}
                  <h3 className={`text-lg font-medium text-[#EDEDED] transition-all duration-500 ${isTransitioning ? 'opacity-0 translate-y-2' : 'opacity-100 translate-y-0'}`}>
                    {currentMockPoll.question}
                  </h3>

                  {/* Options - Fade with stagger */}
                  <div className="space-y-2">
                    <div className={`relative p-3 rounded-xl bg-[#151515] border border-[#1F1F1F] overflow-hidden transition-all duration-500 ${isTransitioning ? 'opacity-0 translate-x-2' : 'opacity-100 translate-x-0'}`}>
                      <div
                        className={`absolute inset-y-0 left-0 rounded-xl transition-all duration-700 ${currentMockPoll.percentA >= currentMockPoll.percentB ? 'bg-cyan-500/10' : 'bg-[#1F1F1F]/50'}`}
                        style={{ width: `${currentMockPoll.percentA}%` }}
                      />
                      <div className="relative flex items-center justify-between">
                        <span className="text-sm text-[#EDEDED]">{currentMockPoll.optionA}</span>
                        <span className={`text-sm font-medium ${currentMockPoll.percentA >= currentMockPoll.percentB ? 'text-cyan-400' : 'text-[#9A9A9A]'}`}>
                          {currentMockPoll.percentA}%
                        </span>
                      </div>
                    </div>
                    <div className={`relative p-3 rounded-xl bg-[#151515] border border-[#1F1F1F] overflow-hidden transition-all duration-500 delay-75 ${isTransitioning ? 'opacity-0 translate-x-2' : 'opacity-100 translate-x-0'}`}>
                      <div
                        className={`absolute inset-y-0 left-0 rounded-xl transition-all duration-700 ${currentMockPoll.percentB > currentMockPoll.percentA ? 'bg-cyan-500/10' : 'bg-[#1F1F1F]/50'}`}
                        style={{ width: `${currentMockPoll.percentB}%` }}
                      />
                      <div className="relative flex items-center justify-between">
                        <span className="text-sm text-[#EDEDED]">{currentMockPoll.optionB}</span>
                        <span className={`text-sm font-medium ${currentMockPoll.percentB > currentMockPoll.percentA ? 'text-cyan-400' : 'text-[#9A9A9A]'}`}>
                          {currentMockPoll.percentB}%
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Pool Info - Fades */}
                  <div className={`flex items-center justify-between pt-2 border-t border-[#1F1F1F] transition-opacity duration-500 ${isTransitioning ? 'opacity-0' : 'opacity-100'}`}>
                    <div className="flex items-center gap-1 text-sm text-[#9A9A9A]">
                      <Image src="/usdc.svg" alt="USDC" width={14} height={14} />
                      <span className="text-[#EDEDED] font-medium">{currentMockPoll.pool}</span>
                      <span>pool</span>
                    </div>
                    <span className="text-sm text-[#9A9A9A]">{currentMockPoll.players} players</span>
                  </div>

                  {/* Action Button - Static */}
                  <button className="w-full py-3 bg-[#EDEDED] text-[#0A0A0A] font-medium rounded-full text-sm">
                    Stake Now
                  </button>

                  {/* Progress dots */}
                  <div className="flex justify-center gap-1.5 pt-2">
                    {mockPolls.map((_, i) => (
                      <div
                        key={i}
                        className={`w-1.5 h-1.5 rounded-full transition-colors duration-300 ${i === currentPollIndex ? 'bg-[#EDEDED]' : 'bg-[#1F1F1F]'}`}
                      />
                    ))}
                  </div>
                </div>

                {/* Floating elements */}
                <div className="absolute -top-4 -right-4 px-3 py-2 bg-[#151515] border border-[#1F1F1F] rounded-xl">
                  <div className="text-center">
                    <div className="text-sm font-semibold text-emerald-400">Winners</div>
                    <div className="text-[10px] text-[#9A9A9A]">split losers&apos; pool</div>
                  </div>
                </div>

                <div className="absolute -bottom-3 -left-3 px-3 py-2 bg-[#151515] border border-[#1F1F1F] rounded-lg">
                  <div className="flex items-center gap-2">
                    <div className="w-6 h-6 rounded-full bg-gradient-to-br from-emerald-500 to-cyan-500 flex items-center justify-center">
                      <span className="text-[10px] text-white">✓</span>
                    </div>
                    <div className="text-xs">
                      <div className="text-[#EDEDED]">Prediction correct!</div>
                      <div className="text-emerald-400">+125 USDC claimed</div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Scroll indicator */}
        <div className="absolute bottom-8 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2 text-[#9A9A9A]">
          <span className="text-xs uppercase tracking-widest font-light">Scroll</span>
          <div className="w-px h-8 bg-gradient-to-b from-[#9A9A9A]/50 to-transparent" />
        </div>
      </section>

      {/* How it works */}
      <section className="px-6 py-20">
        <div className="max-w-3xl mx-auto">
          <h2 className="text-xs font-medium text-[#9A9A9A] uppercase tracking-widest mb-3">
            How it works
          </h2>
          <p className="text-2xl sm:text-3xl font-semibold text-[#EDEDED] mb-10">
            Three steps. <span className="text-[#9A9A9A]">That&apos;s it.</span>
          </p>

          <div className="space-y-3">
            {[
              {
                num: "01",
                title: "Connect",
                desc: "Link your wallet. Takes 2 seconds. Gas-free.",
              },
              {
                num: "02",
                title: "Predict",
                desc: "Pick an outcome. Stake USDC on your call.",
              },
              {
                num: "03",
                title: "Collect",
                desc: "Called it right? Losers' stakes are yours.",
              },
            ].map((step) => (
              <div
                key={step.num}
                className="group relative p-5 rounded-xl bg-[#0A0A0A] border border-[#1F1F1F] hover:border-[#9A9A9A]/30 transition-colors"
              >
                <div className="flex items-start gap-4">
                  <span className="text-xs font-mono text-[#9A9A9A]/50 pt-1">
                    {step.num}
                  </span>
                  <div>
                    <h3 className="text-base font-medium text-[#EDEDED] mb-1">
                      {step.title}
                    </h3>
                    <p className="text-sm text-[#9A9A9A] font-light">{step.desc}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Live Predictions */}
      {activePolls.length > 0 && (
        <section className="px-6 py-20">
          <div className="max-w-3xl mx-auto">
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-emerald-500/10 border border-emerald-500/20 mb-3">
              <div className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
              <h2 className="text-xs font-medium text-emerald-400 uppercase tracking-widest">
                Live Now
              </h2>
            </div>
            <p className="text-2xl sm:text-3xl font-semibold text-[#EDEDED] mb-8">
              Active predictions
            </p>

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
                    className="group p-4 rounded-xl bg-[#0A0A0A] border border-[#1F1F1F] hover:border-[#9A9A9A]/30 transition-colors cursor-pointer"
                  >
                    <div className="flex items-center justify-between gap-4">
                      <div className="flex-1 min-w-0">
                        <h3 className="font-medium text-[#EDEDED] truncate group-hover:text-[#D8D8D8] transition-colors">
                          {poll.title}
                        </h3>
                        <div className="flex items-center gap-3 mt-1 text-xs text-[#9A9A9A]">
                          {poll.totalStakeAmount > 0 && (
                            <span className="text-[#D8D8D8] inline-flex items-center gap-1">
                              <Image src="/usdc.svg" alt="USDC" width={12} height={12} />
                              {poll.totalStakeAmount}
                            </span>
                          )}
                          {poll.totalParticipants > 0 && (
                            <span>{poll.totalParticipants} players</span>
                          )}
                          {timeLeft > 0 && (
                            <span>
                              {daysLeft > 0 ? `${daysLeft}d` : `${hoursLeft}h`}{" "}
                              left
                            </span>
                          )}
                        </div>
                      </div>
                      <ArrowRight className="w-4 h-4 text-[#9A9A9A]/50 group-hover:text-[#D8D8D8] transition-colors" />
                    </div>
                  </div>
                );
              })}
            </div>

            <Link href="/polls" className="block mt-6">
              <Button
                variant="outline"
                className="w-full border-[#1F1F1F] text-[#D8D8D8] hover:bg-[#151515] hover:border-[#9A9A9A]/30 rounded-xl h-12 font-normal"
              >
                View all predictions
              </Button>
            </Link>
          </div>
        </section>
      )}

      {/* Bottom CTA */}
      <section className="px-6 py-24">
        <div className="max-w-3xl mx-auto text-center">
          <div className="inline-flex items-center justify-center w-14 h-14 rounded-xl bg-[#151515] border border-[#1F1F1F] mb-6">
            <ArrowRight className="w-6 h-6 text-[#D8D8D8]" />
          </div>
          <h2 className="text-3xl sm:text-4xl font-semibold text-[#EDEDED] mb-4">
            Ready to play?
          </h2>
          <p className="text-[#9A9A9A] mb-8 font-light">
            Connect wallet. Pick winners. Stack USDC.
          </p>
          <Link href="/polls">
            <Button
              size="lg"
              className="bg-[#EDEDED] text-[#0A0A0A] hover:bg-[#D8D8D8] text-base font-medium rounded-full h-14 px-10 transition-colors"
            >
              Let&apos;s go
              <ArrowRight className="ml-2 w-5 h-5" />
            </Button>
          </Link>
        </div>
      </section>
    </div>
  );
}
