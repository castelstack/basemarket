"use client";

import Image from "next/image";
import { Button } from "@/components/ui/button";
import { useAllPolls } from "@/lib/polls";
import type { Poll } from "@/types/api";
import { ArrowRight } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";

export default function Home() {
  const router = useRouter();
  const { data: pollsData } = useAllPolls();

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
        {/* Subtle ambient glow */}
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-[600px] h-[600px] bg-[#1F1F1F]/30 rounded-full blur-[150px] pointer-events-none" />

        <div className="relative z-10 max-w-3xl mx-auto w-full">
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
          <Link href="/polls" className="block">
            <Button
              size="lg"
              className="w-full sm:w-auto bg-[#EDEDED] hover:bg-[#D8D8D8] text-[#0A0A0A] text-base font-medium rounded-full h-14 px-8 transition-colors"
            >
              Start Predicting
              <ArrowRight className="ml-2 w-5 h-5" />
            </Button>
          </Link>

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
