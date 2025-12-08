"use client";

import { useState, useEffect } from "react";
import { cn } from "@/lib/utils";
import {
  BookOpen,
  Coins,
  HelpCircle,
  Menu,
  Trophy,
  Wallet,
  X,
  Zap,
  ArrowLeft,
  ChevronRight,
  UserPlus,
  TrendingUp,
  Shield,
  Target,
  ArrowDownUp,
  Scale,
  CircleDollarSign,
} from "lucide-react";
import Link from "next/link";
import Image from "next/image";
import { Button } from "@/components/ui/button";

const sections = [
  {
    id: "what-is-showstakr",
    title: "What is ShowStakr?",
    icon: Zap,
  },
  {
    id: "how-to-sign-up",
    title: "How to Sign Up",
    icon: UserPlus,
  },
  {
    id: "how-to-deposit",
    title: "How to Deposit",
    icon: Wallet,
  },
  {
    id: "making-first-stake",
    title: "Making Your First Stake",
    icon: Target,
  },
  {
    id: "how-to-withdraw",
    title: "How to Withdraw",
    icon: ArrowDownUp,
  },
  {
    id: "understanding-odds",
    title: "How Are Odds Calculated?",
    icon: TrendingUp,
  },
  {
    id: "how-markets-resolved",
    title: "How Are Polls Resolved?",
    icon: Scale,
  },
  {
    id: "winnings",
    title: "Winnings & Payouts",
    icon: Trophy,
  },
  {
    id: "fees",
    title: "Fees",
    icon: CircleDollarSign,
  },
  {
    id: "faq",
    title: "FAQ",
    icon: HelpCircle,
  },
];

export default function GuidePage() {
  const [activeSection, setActiveSection] = useState("what-is-showstakr");
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  const scrollToSection = (sectionId: string) => {
    setActiveSection(sectionId);
    setIsSidebarOpen(false);
    const element = document.getElementById(sectionId);
    if (element) {
      element.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  };

  // Update active section based on scroll position
  useEffect(() => {
    const handleScroll = () => {
      const sectionElements = sections.map((s) => ({
        id: s.id,
        element: document.getElementById(s.id),
      }));

      for (const section of sectionElements.reverse()) {
        if (section.element) {
          const rect = section.element.getBoundingClientRect();
          if (rect.top <= 100) {
            setActiveSection(section.id);
            break;
          }
        }
      }
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <div className="min-h-screen bg-[#000000]">
      {/* Mobile Header */}
      <div className="sticky top-0 z-50 bg-[#000000]/90 backdrop-blur-sm border-b border-[#1F1F1F] px-4 py-3 flex items-center justify-between md:hidden">
        <Link
          href="/polls"
          className="flex items-center gap-2 text-[#9A9A9A] hover:text-[#EDEDED] transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          <span className="text-sm">Back</span>
        </Link>
        <h1 className="text-[#EDEDED] font-medium">Guide</h1>
        <button
          onClick={() => setIsSidebarOpen(!isSidebarOpen)}
          className="p-2 text-[#9A9A9A] hover:text-[#EDEDED] transition-colors"
        >
          {isSidebarOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
        </button>
      </div>

      <div className="flex">
        {/* Sidebar */}
        <aside
          className={cn(
            "fixed md:sticky top-0 left-0 z-40 h-screen w-64 bg-[#0A0A0A] border-r border-[#1F1F1F] overflow-y-auto transition-transform md:translate-x-0",
            isSidebarOpen ? "translate-x-0" : "-translate-x-full"
          )}
        >
          <div className="p-6">
            {/* Logo/Title */}
            <Link href="/polls" className="flex items-center gap-2 mb-8">
              <ArrowLeft className="w-4 h-4 text-[#9A9A9A]" />
              <span className="text-sm text-[#9A9A9A] hover:text-[#EDEDED] transition-colors">
                Back to Polls
              </span>
            </Link>

            <div className="flex items-center gap-3 mb-8">
              <div className="p-2 rounded-xl bg-[#151515]">
                <BookOpen className="w-5 h-5 text-cyan-400" />
              </div>
              <div>
                <h2 className="text-[#EDEDED] font-semibold">Get Started</h2>
                <p className="text-xs text-[#9A9A9A]">Learn ShowStakr</p>
              </div>
            </div>

            {/* Navigation */}
            <nav className="space-y-1">
              {sections.map((section) => {
                const Icon = section.icon;
                return (
                  <button
                    key={section.id}
                    onClick={() => scrollToSection(section.id)}
                    className={cn(
                      "w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm transition-colors text-left",
                      activeSection === section.id
                        ? "bg-[#151515] text-[#EDEDED]"
                        : "text-[#9A9A9A] hover:text-[#EDEDED] hover:bg-[#151515]/50"
                    )}
                  >
                    <Icon className="w-4 h-4 flex-shrink-0" />
                    <span className="truncate">{section.title}</span>
                  </button>
                );
              })}
            </nav>
          </div>
        </aside>

        {/* Overlay for mobile */}
        {isSidebarOpen && (
          <div
            className="fixed inset-0 bg-black/50 z-30 md:hidden"
            onClick={() => setIsSidebarOpen(false)}
          />
        )}

        {/* Main Content */}
        <main className="flex-1 min-h-screen">
          <div className="max-w-3xl mx-auto px-4 sm:px-6 py-8 md:py-12">
            {/* Desktop Back Link */}
            <Link
              href="/polls"
              className="hidden md:inline-flex items-center gap-2 text-[#9A9A9A] hover:text-[#EDEDED] text-sm mb-8 transition-colors"
            >
              <ArrowLeft className="w-4 h-4" />
              Back to Polls
            </Link>

            {/* What is ShowStakr */}
            <section id="what-is-showstakr" className="mb-16 scroll-mt-20">
              <h1 className="text-2xl sm:text-3xl font-semibold text-[#EDEDED] mb-4">
                What is ShowStakr?
              </h1>
              <p className="text-[#9A9A9A] font-light mb-6 leading-relaxed">
                ShowStakr is a prediction market platform on Base, allowing you to stake USDC on future event outcomes and profit from your knowledge.
              </p>
              <p className="text-[#9A9A9A] font-light mb-6 leading-relaxed">
                Studies show prediction markets are often more accurate than experts because they aggregate diverse opinions into a single probability. Our markets combine news, analysis, and collective wisdom into real-time odds for events that matter to you.
              </p>

              <div className="p-4 rounded-xl bg-cyan-500/5 border border-cyan-500/20 mb-6">
                <p className="text-cyan-400 font-medium text-sm">
                  Back your predictions with USDC. Winners share the losers' pool.
                </p>
              </div>

              <h3 className="text-[#EDEDED] font-medium mb-4">Quick Overview</h3>
              <div className="space-y-3 text-[#9A9A9A] text-sm font-light">
                <div className="flex gap-3">
                  <ChevronRight className="w-4 h-4 text-cyan-400 flex-shrink-0 mt-0.5" />
                  <span>Stake USDC on prediction outcomes (e.g., "Who will win the championship?")</span>
                </div>
                <div className="flex gap-3">
                  <ChevronRight className="w-4 h-4 text-cyan-400 flex-shrink-0 mt-0.5" />
                  <span>Winners share the entire pool proportionally based on their stake amount</span>
                </div>
                <div className="flex gap-3">
                  <ChevronRight className="w-4 h-4 text-cyan-400 flex-shrink-0 mt-0.5" />
                  <span>You're not betting against "the house" – the counterparty is other ShowStakr users</span>
                </div>
                <div className="flex gap-3">
                  <ChevronRight className="w-4 h-4 text-cyan-400 flex-shrink-0 mt-0.5" />
                  <span>No one gets banned for winning too much</span>
                </div>
              </div>
            </section>

            {/* How to Sign Up */}
            <section id="how-to-sign-up" className="mb-16 scroll-mt-20">
              <h2 className="text-2xl font-semibold text-[#EDEDED] mb-4">
                How to Sign Up
              </h2>
              <p className="text-[#9A9A9A] font-light mb-6 leading-relaxed">
                Getting started on ShowStakr is quick and secure. Simply connect your crypto wallet to begin.
              </p>

              <h3 className="text-[#EDEDED] font-medium mb-4">Wallet Sign-Up</h3>
              <p className="text-[#9A9A9A] text-sm font-light mb-4">
                ShowStakr supports most popular crypto wallets:
              </p>
              <div className="space-y-3 mb-6">
                <div className="p-4 rounded-xl bg-[#0A0A0A] border border-[#1F1F1F]">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-lg bg-[#0052FF] flex items-center justify-center">
                      <span className="text-white text-xs font-bold">CB</span>
                    </div>
                    <div>
                      <p className="text-[#EDEDED] font-medium text-sm">Coinbase Wallet</p>
                      <p className="text-[#9A9A9A] text-xs">Recommended for beginners</p>
                    </div>
                  </div>
                </div>
                <div className="p-4 rounded-xl bg-[#0A0A0A] border border-[#1F1F1F]">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-lg bg-[#F6851B] flex items-center justify-center">
                      <span className="text-white text-xs font-bold">MM</span>
                    </div>
                    <div>
                      <p className="text-[#EDEDED] font-medium text-sm">MetaMask</p>
                      <p className="text-[#9A9A9A] text-xs">Popular browser extension wallet</p>
                    </div>
                  </div>
                </div>
                <div className="p-4 rounded-xl bg-[#0A0A0A] border border-[#1F1F1F]">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-lg bg-[#3B99FC] flex items-center justify-center">
                      <span className="text-white text-xs font-bold">WC</span>
                    </div>
                    <div>
                      <p className="text-[#EDEDED] font-medium text-sm">WalletConnect</p>
                      <p className="text-[#9A9A9A] text-xs">Connect any compatible mobile wallet</p>
                    </div>
                  </div>
                </div>
              </div>

              <div className="p-4 rounded-xl bg-amber-500/5 border border-amber-500/20">
                <h4 className="text-amber-400 font-medium mb-2">Base Network</h4>
                <p className="text-[#9A9A9A] text-sm font-light">
                  Make sure your wallet is connected to the Base network. If prompted, approve the network switch in your wallet.
                </p>
              </div>
            </section>

            {/* How to Deposit */}
            <section id="how-to-deposit" className="mb-16 scroll-mt-20">
              <h2 className="text-2xl font-semibold text-[#EDEDED] mb-4">
                How to Deposit
              </h2>
              <p className="text-[#9A9A9A] font-light mb-6 leading-relaxed">
                ShowStakr uses USDC (USD Coin), a regulated stablecoin backed 1:1 by US dollars. All transactions happen on the Base network.
              </p>

              <div className="p-4 rounded-xl bg-[#0000ff]/5 border border-[#0000ff]/20 mb-6">
                <div className="flex items-center gap-3 mb-2">
                  <Image src="/usdc.svg" alt="USDC" width={24} height={24} />
                  <h4 className="text-[#EDEDED] font-medium">About USDC on Base</h4>
                </div>
                <p className="text-[#9A9A9A] text-sm font-light">
                  Using USDC on Base ensures fast, low-cost transactions. Gas fees are minimal compared to Ethereum mainnet.
                </p>
              </div>

              <h3 className="text-[#EDEDED] font-medium mb-4">Deposit Steps</h3>
              <div className="space-y-4 mb-6">
                <div className="flex gap-4">
                  <div className="w-8 h-8 rounded-full bg-[#151515] flex items-center justify-center flex-shrink-0">
                    <span className="text-cyan-400 text-sm font-medium">1</span>
                  </div>
                  <div>
                    <p className="text-[#EDEDED] font-medium mb-1">Navigate to Wallet</p>
                    <p className="text-[#9A9A9A] text-sm font-light">Go to the Wallet page from the navigation menu.</p>
                  </div>
                </div>
                <div className="flex gap-4">
                  <div className="w-8 h-8 rounded-full bg-[#151515] flex items-center justify-center flex-shrink-0">
                    <span className="text-cyan-400 text-sm font-medium">2</span>
                  </div>
                  <div>
                    <p className="text-[#EDEDED] font-medium mb-1">Click Deposit</p>
                    <p className="text-[#9A9A9A] text-sm font-light">Enter the amount of USDC you want to deposit.</p>
                  </div>
                </div>
                <div className="flex gap-4">
                  <div className="w-8 h-8 rounded-full bg-[#151515] flex items-center justify-center flex-shrink-0">
                    <span className="text-cyan-400 text-sm font-medium">3</span>
                  </div>
                  <div>
                    <p className="text-[#EDEDED] font-medium mb-1">Approve Transaction</p>
                    <p className="text-[#9A9A9A] text-sm font-light">Confirm the transaction in your wallet. Your balance updates once confirmed.</p>
                  </div>
                </div>
              </div>

              <div className="p-4 rounded-xl bg-amber-500/5 border border-amber-500/20">
                <h4 className="text-amber-400 font-medium mb-2">Need USDC on Base?</h4>
                <p className="text-[#9A9A9A] text-sm font-light">
                  Purchase USDC on exchanges like Coinbase and send it to your wallet on Base. If your USDC is on another network (Ethereum, Polygon, etc.), you'll need to bridge it to Base first.
                </p>
              </div>
            </section>

            {/* Making Your First Stake */}
            <section id="making-first-stake" className="mb-16 scroll-mt-20">
              <h2 className="text-2xl font-semibold text-[#EDEDED] mb-4">
                Making Your First Stake
              </h2>
              <p className="text-[#9A9A9A] font-light mb-6 leading-relaxed">
                Once you've connected your wallet and deposited funds, you're ready to make predictions.
              </p>

              <div className="space-y-4 mb-8">
                <div className="p-4 rounded-xl bg-[#0A0A0A] border border-[#1F1F1F]">
                  <h4 className="text-[#EDEDED] font-medium mb-2">1. Browse Polls</h4>
                  <p className="text-[#9A9A9A] text-sm font-light">
                    Visit the Polls page to see all active predictions. Use filters to find topics you're knowledgeable about – sports, politics, crypto, entertainment, and more.
                  </p>
                </div>

                <div className="p-4 rounded-xl bg-[#0A0A0A] border border-[#1F1F1F]">
                  <h4 className="text-[#EDEDED] font-medium mb-2">2. Select a Poll</h4>
                  <p className="text-[#9A9A9A] text-sm font-light">
                    Click on a poll to see details including current odds, total pool size, number of players, and time remaining.
                  </p>
                </div>

                <div className="p-4 rounded-xl bg-[#0A0A0A] border border-[#1F1F1F]">
                  <h4 className="text-[#EDEDED] font-medium mb-2">3. Place Your Stake</h4>
                  <p className="text-[#9A9A9A] text-sm font-light">
                    Click "Stake," choose the option you believe will win, enter your stake amount (minimum 0.1 USDC), and confirm.
                  </p>
                </div>

                <div className="p-4 rounded-xl bg-[#0A0A0A] border border-[#1F1F1F]">
                  <h4 className="text-[#EDEDED] font-medium mb-2">4. Wait for Resolution</h4>
                  <p className="text-[#9A9A9A] text-sm font-light">
                    Once the event occurs, the poll will be resolved. If you predicted correctly, winnings are automatically added to your balance.
                  </p>
                </div>
              </div>

              <div className="p-4 rounded-xl bg-cyan-500/5 border border-cyan-500/20">
                <h4 className="text-cyan-400 font-medium mb-2">Pro Tip</h4>
                <p className="text-[#9A9A9A] text-sm font-light">
                  Look for polls where you have unique knowledge. If you're an expert on a topic, this is your opportunity to profit while improving market accuracy.
                </p>
              </div>
            </section>

            {/* How to Withdraw */}
            <section id="how-to-withdraw" className="mb-16 scroll-mt-20">
              <h2 className="text-2xl font-semibold text-[#EDEDED] mb-4">
                How to Withdraw
              </h2>
              <p className="text-[#9A9A9A] font-light mb-6 leading-relaxed">
                Withdraw your USDC balance to your connected wallet at any time.
              </p>

              <h3 className="text-[#EDEDED] font-medium mb-4">Withdrawal Steps</h3>
              <div className="space-y-4 mb-6">
                <div className="flex gap-4">
                  <div className="w-8 h-8 rounded-full bg-[#151515] flex items-center justify-center flex-shrink-0">
                    <span className="text-cyan-400 text-sm font-medium">1</span>
                  </div>
                  <div>
                    <p className="text-[#EDEDED] font-medium mb-1">Go to Wallet</p>
                    <p className="text-[#9A9A9A] text-sm font-light">Navigate to the Wallet page from the menu.</p>
                  </div>
                </div>
                <div className="flex gap-4">
                  <div className="w-8 h-8 rounded-full bg-[#151515] flex items-center justify-center flex-shrink-0">
                    <span className="text-cyan-400 text-sm font-medium">2</span>
                  </div>
                  <div>
                    <p className="text-[#EDEDED] font-medium mb-1">Click Withdraw</p>
                    <p className="text-[#9A9A9A] text-sm font-light">Enter the amount you want to withdraw. You'll see the fees and net amount before confirming.</p>
                  </div>
                </div>
                <div className="flex gap-4">
                  <div className="w-8 h-8 rounded-full bg-[#151515] flex items-center justify-center flex-shrink-0">
                    <span className="text-cyan-400 text-sm font-medium">3</span>
                  </div>
                  <div>
                    <p className="text-[#EDEDED] font-medium mb-1">Receive USDC</p>
                    <p className="text-[#9A9A9A] text-sm font-light">USDC will be sent to your connected wallet on Base. Processing is typically fast.</p>
                  </div>
                </div>
              </div>

              <div className="p-4 rounded-xl bg-[#0A0A0A] border border-[#1F1F1F]">
                <h4 className="text-[#EDEDED] font-medium mb-2">Important</h4>
                <p className="text-[#9A9A9A] text-sm font-light">
                  Withdrawals are sent to your connected wallet on Base network. Make sure your wallet supports Base before withdrawing.
                </p>
              </div>
            </section>

            {/* How Are Odds Calculated */}
            <section id="understanding-odds" className="mb-16 scroll-mt-20">
              <h2 className="text-2xl font-semibold text-[#EDEDED] mb-4">
                How Are Odds Calculated?
              </h2>
              <p className="text-[#9A9A9A] font-light mb-6 leading-relaxed">
                Percentages on ShowStakr represent the current distribution of stakes for each option.
              </p>

              <div className="p-5 rounded-xl bg-[#0A0A0A] border border-[#1F1F1F] mb-6">
                <h4 className="text-[#EDEDED] font-medium mb-4">Example</h4>
                <p className="text-[#9A9A9A] text-sm font-light mb-4">
                  In a market predicting "Will Team A win the championship?":
                </p>
                <div className="space-y-3">
                  <div className="flex items-center justify-between p-3 rounded-lg bg-[#151515]">
                    <span className="text-[#EDEDED] text-sm">Team A (Yes)</span>
                    <span className="text-cyan-400 font-medium">65%</span>
                  </div>
                  <div className="flex items-center justify-between p-3 rounded-lg bg-[#151515]">
                    <span className="text-[#EDEDED] text-sm">Team B (No)</span>
                    <span className="text-[#9A9A9A] font-medium">35%</span>
                  </div>
                </div>
                <p className="text-[#9A9A9A] text-sm font-light mt-4">
                  This means 65% of total staked USDC is on Team A. If Team A wins, those stakers share the entire pool proportionally.
                </p>
              </div>

              <div className="p-4 rounded-xl bg-emerald-500/5 border border-emerald-500/20">
                <h4 className="text-emerald-400 font-medium mb-2">The Underdog Advantage</h4>
                <p className="text-[#9A9A9A] text-sm font-light">
                  Staking on the less popular option yields higher returns if you're right. Fewer stakers means a larger share of the losing pool for each winner.
                </p>
              </div>
            </section>

            {/* How Are Polls Resolved */}
            <section id="how-markets-resolved" className="mb-16 scroll-mt-20">
              <h2 className="text-2xl font-semibold text-[#EDEDED] mb-4">
                How Are Polls Resolved?
              </h2>
              <p className="text-[#9A9A9A] font-light mb-6 leading-relaxed">
                Poll resolution determines which option won and triggers payouts to winners.
              </p>

              <div className="space-y-4 mb-6">
                <div className="p-4 rounded-xl bg-[#0A0A0A] border border-[#1F1F1F]">
                  <h4 className="text-[#EDEDED] font-medium mb-2">Resolution Process</h4>
                  <p className="text-[#9A9A9A] text-sm font-light">
                    Poll outcomes are determined by platform administrators based on verifiable real-world events. We use official sources and wait for confirmed results before resolving.
                  </p>
                </div>

                <div className="p-4 rounded-xl bg-[#0A0A0A] border border-[#1F1F1F]">
                  <h4 className="text-[#EDEDED] font-medium mb-2">Automatic Payouts</h4>
                  <p className="text-[#9A9A9A] text-sm font-light">
                    Once resolved, winnings are automatically calculated and added to winners' balances. You'll receive a notification when this happens.
                  </p>
                </div>

                <div className="p-4 rounded-xl bg-[#0A0A0A] border border-[#1F1F1F]">
                  <h4 className="text-[#EDEDED] font-medium mb-2">Cancelled Polls</h4>
                  <p className="text-[#9A9A9A] text-sm font-light">
                    If a poll is cancelled (e.g., event didn't happen), all stakes are fully refunded to participants automatically.
                  </p>
                </div>
              </div>
            </section>

            {/* Winnings & Payouts */}
            <section id="winnings" className="mb-16 scroll-mt-20">
              <h2 className="text-2xl font-semibold text-[#EDEDED] mb-4">
                Winnings & Payouts
              </h2>
              <p className="text-[#9A9A9A] font-light mb-6 leading-relaxed">
                When your prediction is correct, here's how payouts work.
              </p>

              <div className="p-5 rounded-xl bg-[#0A0A0A] border border-[#1F1F1F] mb-6">
                <h4 className="text-[#EDEDED] font-medium mb-4">How Winnings are Calculated</h4>
                <p className="text-[#9A9A9A] text-sm font-light mb-4">
                  Winners share the entire pool proportionally based on their stake amount relative to the winning side's total.
                </p>
                <div className="p-4 rounded-lg bg-[#151515]">
                  <p className="text-[#9A9A9A] text-xs font-light mb-2">Example:</p>
                  <div className="space-y-1 text-[#EDEDED] text-sm">
                    <p>Total Pool: <span className="text-cyan-400">100 USDC</span></p>
                    <p>Your Stake: <span className="text-cyan-400">10 USDC</span> (on winning side)</p>
                    <p>Winning Side Total: <span className="text-cyan-400">60 USDC</span></p>
                    <div className="border-t border-[#1F1F1F] my-2 pt-2">
                      <p>Your Share: <span className="text-emerald-400 font-medium">16.67 USDC</span></p>
                      <p className="text-xs text-[#9A9A9A]">(10/60 × 100 = 16.67)</p>
                    </div>
                  </div>
                </div>
              </div>

              <div className="p-4 rounded-xl bg-emerald-500/5 border border-emerald-500/20">
                <h4 className="text-emerald-400 font-medium mb-2">Profit Potential</h4>
                <p className="text-[#9A9A9A] text-sm font-light">
                  Your profit = Your share of pool - Your original stake. In the example above: 16.67 - 10 = 6.67 USDC profit (66.7% return).
                </p>
              </div>
            </section>

            {/* Fees */}
            <section id="fees" className="mb-16 scroll-mt-20">
              <h2 className="text-2xl font-semibold text-[#EDEDED] mb-4">
                Fees
              </h2>
              <p className="text-[#9A9A9A] font-light mb-6 leading-relaxed">
                ShowStakr charges minimal fees to maintain the platform.
              </p>

              <div className="space-y-4">
                <div className="p-4 rounded-xl bg-[#0A0A0A] border border-[#1F1F1F]">
                  <div className="flex justify-between items-center mb-2">
                    <h4 className="text-[#EDEDED] font-medium">Staking</h4>
                    <span className="text-cyan-400 font-medium">No fee</span>
                  </div>
                  <p className="text-[#9A9A9A] text-sm font-light">
                    Placing stakes is free. Your full stake amount goes into the pool.
                  </p>
                </div>

                <div className="p-4 rounded-xl bg-[#0A0A0A] border border-[#1F1F1F]">
                  <div className="flex justify-between items-center mb-2">
                    <h4 className="text-[#EDEDED] font-medium">Winnings</h4>
                    <span className="text-cyan-400 font-medium">Platform fee</span>
                  </div>
                  <p className="text-[#9A9A9A] text-sm font-light">
                    A small platform fee is deducted from winnings. The exact percentage is shown when you view your winnings.
                  </p>
                </div>

                <div className="p-4 rounded-xl bg-[#0A0A0A] border border-[#1F1F1F]">
                  <div className="flex justify-between items-center mb-2">
                    <h4 className="text-[#EDEDED] font-medium">Withdrawals</h4>
                    <span className="text-cyan-400 font-medium">Platform + Network fee</span>
                  </div>
                  <p className="text-[#9A9A9A] text-sm font-light">
                    Withdrawals include a platform fee and network gas fees. The exact amounts are shown before you confirm.
                  </p>
                </div>

                <div className="p-4 rounded-xl bg-[#0A0A0A] border border-[#1F1F1F]">
                  <div className="flex justify-between items-center mb-2">
                    <h4 className="text-[#EDEDED] font-medium">Deposits</h4>
                    <span className="text-cyan-400 font-medium">Network gas only</span>
                  </div>
                  <p className="text-[#9A9A9A] text-sm font-light">
                    ShowStakr doesn't charge deposit fees. You only pay the network gas fee for the transaction.
                  </p>
                </div>
              </div>
            </section>

            {/* FAQ */}
            <section id="faq" className="mb-16 scroll-mt-20">
              <h2 className="text-2xl font-semibold text-[#EDEDED] mb-4">
                Frequently Asked Questions
              </h2>

              <div className="space-y-4">
                <div className="p-4 rounded-xl bg-[#0A0A0A] border border-[#1F1F1F]">
                  <h3 className="text-[#EDEDED] font-medium mb-2">
                    Can I change my prediction after staking?
                  </h3>
                  <p className="text-[#9A9A9A] text-sm font-light">
                    No, stakes are final and cannot be changed, sold, or cancelled. Unlike some platforms, you can't exit early. Make sure you're confident before confirming.
                  </p>
                </div>

                <div className="p-4 rounded-xl bg-[#0A0A0A] border border-[#1F1F1F]">
                  <h3 className="text-[#EDEDED] font-medium mb-2">
                    Is ShowStakr the house?
                  </h3>
                  <p className="text-[#9A9A9A] text-sm font-light">
                    No. You're not betting against ShowStakr – you're staking against other users. We don't set odds or take the other side of your trade. We only facilitate the market and take a small platform fee.
                  </p>
                </div>

                <div className="p-4 rounded-xl bg-[#0A0A0A] border border-[#1F1F1F]">
                  <h3 className="text-[#EDEDED] font-medium mb-2">
                    Is my money safe?
                  </h3>
                  <p className="text-[#9A9A9A] text-sm font-light">
                    We never have access to your private keys. All transactions are signed by you through your own wallet. Deposited funds are held securely on-chain on the Base network.
                  </p>
                </div>

                <div className="p-4 rounded-xl bg-[#0A0A0A] border border-[#1F1F1F]">
                  <h3 className="text-[#EDEDED] font-medium mb-2">
                    What's the minimum and maximum stake?
                  </h3>
                  <p className="text-[#9A9A9A] text-sm font-light">
                    Minimum stake is 0.1 USDC. Maximum limits may vary by poll and are shown when placing your stake.
                  </p>
                </div>

                <div className="p-4 rounded-xl bg-[#0A0A0A] border border-[#1F1F1F]">
                  <h3 className="text-[#EDEDED] font-medium mb-2">
                    Why crypto / Why Base?
                  </h3>
                  <p className="text-[#9A9A9A] text-sm font-light">
                    Crypto enables instant, global, and transparent transactions. Base provides fast confirmations and low fees while inheriting Ethereum's security. USDC ensures your funds maintain stable USD value.
                  </p>
                </div>

                <div className="p-4 rounded-xl bg-[#0A0A0A] border border-[#1F1F1F]">
                  <h3 className="text-[#EDEDED] font-medium mb-2">
                    What is a prediction market?
                  </h3>
                  <p className="text-[#9A9A9A] text-sm font-light">
                    A prediction market is a platform where people stake money on the outcomes of future events. Prices/odds emerge from what participants are willing to stake, aggregating collective knowledge into probabilities.
                  </p>
                </div>

                <div className="p-4 rounded-xl bg-[#0A0A0A] border border-[#1F1F1F]">
                  <h3 className="text-[#EDEDED] font-medium mb-2">
                    What happens if a poll is cancelled?
                  </h3>
                  <p className="text-[#9A9A9A] text-sm font-light">
                    All stakes are fully refunded to participants. You'll see the refund in your wallet balance automatically.
                  </p>
                </div>

                <div className="p-4 rounded-xl bg-[#0A0A0A] border border-[#1F1F1F]">
                  <h3 className="text-[#EDEDED] font-medium mb-2">
                    Can I stake on multiple options?
                  </h3>
                  <p className="text-[#9A9A9A] text-sm font-light">
                    No, you can only stake once per poll on a single option. This ensures you have skin in the game for your actual prediction.
                  </p>
                </div>
              </div>
            </section>

            {/* Need Help */}
            <div className="p-6 rounded-2xl bg-[#0A0A0A] border border-[#1F1F1F] text-center">
              <h3 className="text-[#EDEDED] font-medium mb-2">Still have questions?</h3>
              <p className="text-[#9A9A9A] text-sm font-light mb-4">
                We're here to help. Reach out to our support team.
              </p>
              <Button
                variant="outline"
                className="border-[#1F1F1F] text-[#D8D8D8] hover:bg-[#151515] rounded-full"
              >
                Contact Support
              </Button>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}
