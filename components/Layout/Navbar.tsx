"use client";

import { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useAccount } from "wagmi";
import { sdk } from "@farcaster/miniapp-sdk";
import {
  ConnectWallet,
  Wallet,
  WalletDropdown,
  WalletDropdownBasename,
  WalletDropdownFundLink,
  WalletDropdownDisconnect,
} from "@coinbase/onchainkit/wallet";
import { Address, Avatar, Name, Identity } from "@coinbase/onchainkit/identity";
import { useAuthStore } from "@/stores/authStore";
import { useUnreadNotificationsCount } from "@/lib/notifications";
import {
  Menu,
  X,
  User,
  Wallet as WalletIcon,
  Home,
  Trophy,
  Sparkles,
  TrendingUp,
  CircleDollarSign,
  ChevronDown,
  Settings,
  Shield,
  Bell,
  Crown,
} from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Badge } from "@/components/ui/badge";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { cn } from "@/lib/utils";
import { Logo } from "@/assets/logo";
import numeral from "numeral";

export default function Navbar() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [authToken, setAuthToken] = useState<string | null>(null);
  const { user, balance, isAdmin, isSubAdmin } = useAuthStore();
  const pathname = usePathname();

  const { isConnected } = useAccount();

  console.log("Wallet connected:", user);
  // Quick Auth - get token when wallet connects
  // Quick Auth - get token when wallet connects
  const handleQuickAuth = useCallback(async () => {
    try {
      const { token } = await sdk.quickAuth.getToken();
      setAuthToken(token);
      alert(token);
      console.log("Quick Auth Token:", token);
    } catch (error) {
      console.log("Quick Auth failed:", error);
    }
  }, []);

  // Trigger Quick Auth when wallet connects
  useEffect(() => {
    if (isConnected && !authToken) {
      handleQuickAuth();
    }
    // Clear token when disconnected
    if (!isConnected) {
      setAuthToken(null);
    }
  }, [isConnected, authToken, handleQuickAuth]);

  // Call the hook (it now handles user check internally)
  const { data: unreadCountData } = useUnreadNotificationsCount();
  const unreadCount = unreadCountData?.data?.count || 0;

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 10);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const navLinks = [
    {
      href: "/dashboard",
      label: "Vibes",
      icon: Home,
      gradient: "from-pink-500 to-violet-500",
    },
    {
      href: "/polls",
      label: "Predict",
      icon: Trophy,
      gradient: "from-amber-500 to-orange-500",
    },
    {
      href: "/wallet",
      label: "Bag",
      icon: CircleDollarSign,
      gradient: "from-emerald-500 to-teal-500",
    },
  ];

  const adminLinks = [
    { href: "/admin/dashboard", label: "Command Center", icon: Shield },
    { href: "/admin/create", label: "Drop New Poll", icon: Sparkles },
    { href: "/admin/users", label: "Squad Manager", icon: User },
    { href: "/admin/transactions", label: "Money Moves", icon: TrendingUp },
    { href: "/admin/polls", label: "Poll Control", icon: Trophy },
    { href: "/admin/settings", label: "Platform Settings", icon: Settings },
  ];

  const isActiveLink = (href: string) => {
    return pathname === href || pathname.startsWith(href + "/");
  };

  return (
    <nav
      className={cn(
        "sticky top-0 z-50 transition-all duration-300",
        scrolled
          ? "bg-black/80 backdrop-blur-xl border-b border-white/10"
          : "bg-gradient-to-b from-black via-black/95 to-transparent"
      )}
    >
      <div className="max-w-7xl mx-auto px-3 xs:px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-14 xs:h-16 sm:h-20">
          {/* Logo */}
          <Link
            href="/dashboard"
            className="flex items-center gap-1.5 xs:gap-2 sm:gap-3 group"
          >
            <div className="w-8 h-8 xs:w-10 xs:h-10 sm:w-12 sm:h-12 flex-shrink-0">
              <Logo />
            </div>
            <div className="flex flex-col">
              <span className="text-lg xs:text-xl sm:text-2xl font-black tracking-tight">
                <span className="bg-gradient-to-r from-violet-400 via-pink-400 to-orange-400 bg-clip-text text-transparent">
                  ShowStakr
                </span>
              </span>
              <span className="hidden xs:block text-[9px] xs:text-[10px] text-gray-500 font-medium tracking-widest uppercase">
                Shows Predictions
              </span>
            </div>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden lg:flex items-center gap-1 xl:gap-2">
            {navLinks.map(({ href, label, icon: Icon, gradient }) => (
              <Link
                key={href}
                href={href}
                className={cn(
                  "relative px-3 xl:px-4 py-2 xl:py-2.5 rounded-xl xl:rounded-2xl text-sm xl:text-base font-medium transition-all duration-200 group",
                  isActiveLink(href)
                    ? "text-white"
                    : "text-gray-400 hover:text-white"
                )}
              >
                {isActiveLink(href) && (
                  <div
                    className={cn(
                      "absolute inset-0 bg-gradient-to-r rounded-2xl opacity-20",
                      gradient
                    )}
                  />
                )}
                <div className="relative flex items-center gap-2">
                  <Icon className="w-4 h-4" />
                  <span>{label}</span>
                  {href === "/polls" && (
                    <Badge
                      variant="secondary"
                      className="ml-1 bg-emerald-500/20 text-emerald-400 border-emerald-500/30"
                    >
                      Hot
                    </Badge>
                  )}
                </div>
              </Link>
            ))}

            {isAdmin && (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <button className="flex items-center gap-1 xl:gap-2 px-3 xl:px-4 py-2 xl:py-2.5 rounded-xl xl:rounded-2xl bg-gradient-to-r from-purple-500/10 to-pink-500/10 border border-purple-500/20 text-purple-300 hover:from-purple-500/20 hover:to-pink-500/20 transition-all text-sm xl:text-base font-medium">
                    <Crown className="w-4 h-4" />
                    <span className="hidden xl:inline">Admin</span>
                    <span className="xl:hidden">⚡</span>
                    <ChevronDown className="w-3 h-3" />
                  </button>
                </DropdownMenuTrigger>
                <DropdownMenuContent className="w-56 bg-black/95 backdrop-blur-xl border border-white/10 rounded-2xl p-2 mt-2">
                  <DropdownMenuLabel className="text-gray-400 text-xs uppercase tracking-wider px-2">
                    Admin Zone
                  </DropdownMenuLabel>
                  <DropdownMenuSeparator className="bg-white/5 my-2" />
                  {adminLinks.map((link) => (
                    <DropdownMenuItem asChild key={link.href}>
                      <Link
                        href={link.href}
                        className="flex items-center gap-3 px-3 py-2.5 text-gray-300 hover:text-white hover:bg-purple-500/10 rounded-xl transition-all cursor-pointer"
                      >
                        <link.icon className="w-4 h-4" />
                        <span>{link.label}</span>
                      </Link>
                    </DropdownMenuItem>
                  ))}
                </DropdownMenuContent>
              </DropdownMenu>
            )}

            {/* Sub-Admin Menu */}
            {isSubAdmin && !isAdmin && (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <button className="flex items-center gap-1 xl:gap-2 px-3 xl:px-4 py-2 xl:py-2.5 rounded-xl xl:rounded-2xl bg-gradient-to-r from-blue-500/10 to-cyan-500/10 border border-blue-500/20 text-blue-300 hover:from-blue-500/20 hover:to-cyan-500/20 transition-all text-sm xl:text-base font-medium">
                    <Sparkles className="w-4 h-4" />
                    <span className="hidden xl:inline">Poll Manager</span>
                    <span className="xl:hidden">📊</span>
                    <ChevronDown className="w-3 h-3" />
                  </button>
                </DropdownMenuTrigger>
                <DropdownMenuContent className="w-56 bg-black/95 backdrop-blur-xl border border-white/10 rounded-2xl p-2 mt-2">
                  <DropdownMenuLabel className="text-gray-400 text-xs uppercase tracking-wider px-2">
                    Poll Management
                  </DropdownMenuLabel>
                  <DropdownMenuSeparator className="bg-white/5 my-2" />
                  <DropdownMenuItem asChild>
                    <Link
                      href="/admin/create"
                      className="flex items-center gap-3 px-3 py-2.5 text-gray-300 hover:text-white hover:bg-blue-500/10 rounded-xl transition-all cursor-pointer"
                    >
                      <Sparkles className="w-4 h-4" />
                      <span>Create Poll</span>
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem asChild>
                    <Link
                      href="/polls"
                      className="flex items-center gap-3 px-3 py-2.5 text-gray-300 hover:text-white hover:bg-blue-500/10 rounded-xl transition-all cursor-pointer"
                    >
                      <Trophy className="w-4 h-4" />
                      <span>Manage Polls</span>
                    </Link>
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            )}
          </div>

          {/* Desktop User Section */}
          <div className="hidden md:flex items-center gap-2 lg:gap-3 xl:gap-4">
            <div className="flex items-center gap-2 lg:gap-3">
              {/* Balance Badge - only show when connected */}
              {isConnected && (
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Link href="/wallet" className="hidden xl:block">
                        <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-emerald-500/10 border border-emerald-500/20 hover:bg-emerald-500/20 transition-all cursor-pointer">
                          <WalletIcon className="w-3.5 h-3.5 text-emerald-400" />
                          <span className="text-xs font-bold text-emerald-400">
                            {numeral(balance).format("0.00")} USDC
                          </span>
                        </div>
                      </Link>
                    </TooltipTrigger>
                    <TooltipContent className="bg-black/95 border-emerald-500/20 text-emerald-400">
                      <p className="font-semibold">{balance.toFixed(2)} USDC</p>
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
              )}

              {/* Notifications Button - only show when connected */}
              {isConnected && (
                <Link href="/notifications">
                  <button className="relative p-2 lg:p-2.5 rounded-xl hover:bg-white/5 transition-all group">
                    <Bell className="w-4 lg:w-5 h-4 lg:h-5 text-gray-400 group-hover:text-white transition-colors" />
                    {unreadCount > 0 && (
                      <div className="absolute -top-1 -right-1 min-w-[18px] lg:min-w-[20px] h-4 lg:h-5 px-1 bg-gradient-to-r from-pink-500 to-violet-500 rounded-full flex items-center justify-center">
                        <span className="text-[10px] lg:text-xs font-bold text-white">
                          {unreadCount > 99 ? "99+" : unreadCount}
                        </span>
                      </div>
                    )}
                  </button>
                </Link>
              )}

              {/* OnchainKit Wallet with Avatar and Profile Dropdown */}
              <Wallet>
                <ConnectWallet className="!bg-gradient-to-r !from-violet-500 !to-pink-500 hover:!from-violet-600 hover:!to-pink-600 !text-white !font-semibold !rounded-xl xl:!rounded-2xl !px-3 lg:!px-4 !py-2 !transition-all">
                  <Avatar className="!w-6 !h-6" />
                  <Name className="!text-sm !font-semibold" />
                </ConnectWallet>
                <WalletDropdown className="!bg-transparent !backdrop-blur-xl !border-none !border-white/10 !rounded-2xl !p-0 !my-0 min-w-[280px]">
                  {/* Identity Section */}
                  <Identity
                    className="px-3 py-3 mb-2 rounded-xl bg-gradient-to-r from-violet-500/10 to-pink-500/10 border border-purple-500/20"
                    hasCopyAddressOnClick
                  >
                    <div className="flex items-center gap-3">
                      <Avatar className="w-12 h-12 rounded-xl" />
                      <div className="flex-1 min-w-0">
                        <Name className="text-sm font-semibold text-white block truncate" />
                        <Address className="text-xs text-gray-400 block truncate" />
                      </div>
                    </div>
                  </Identity>

                  {/* Balance Section */}
                  <Link href="/wallet" className="block mx-2">
                    <div className="px-3 py-3 mb-2 rounded-xl bg-gradient-to-r from-emerald-500/10 to-teal-500/10 border border-emerald-500/20 hover:bg-emerald-500/20 transition-all cursor-pointer">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <WalletIcon className="w-4 h-4 text-emerald-400" />
                          <span className="text-xs text-gray-400">Balance</span>
                        </div>
                        <span className="text-sm font-bold text-emerald-400">
                          {balance.toFixed(2)} USDC
                        </span>
                      </div>
                    </div>
                  </Link>

                  {/* Basename - Link to profile or create one */}
                  <WalletDropdownBasename className="!px-3 !py-2.5 !text-gray-300 hover:!text-white hover:!bg-violet-500/10 !rounded-xl !transition-all" />

                  {/* Fund Link - Easy way to add funds */}
                  <WalletDropdownFundLink
                    className="!px-3 !py-2.5 !text-gray-300 hover:!text-white hover:!bg-emerald-500/10 !rounded-xl !transition-all"
                    text="Add Funds"
                    popupSize="md"
                  />

                  <div className="h-px bg-white/5 my-2" />

                  <div className="text-gray-400 text-xs uppercase tracking-wider px-3 py-1">
                    My Account
                  </div>

                  <Link
                    href="/notifications"
                    className="flex items-center gap-3 px-3 py-2.5 text-gray-300 hover:text-white hover:bg-white/5 rounded-xl transition-all"
                  >
                    <Bell className="w-4 h-4" />
                    <span>Notifications</span>
                    {unreadCount > 0 && (
                      <Badge className="ml-auto bg-pink-500/20 text-pink-400 border-pink-500/30">
                        {unreadCount}
                      </Badge>
                    )}
                  </Link>
                  <Link
                    href="/wallet"
                    className="flex items-center gap-3 px-3 py-2.5 text-gray-300 hover:text-white hover:bg-white/5 rounded-xl transition-all"
                  >
                    <WalletIcon className="w-4 h-4" />
                    <span>Wallet</span>
                  </Link>
                  <Link
                    href="/profile"
                    className="flex items-center gap-3 px-3 py-2.5 text-gray-300 hover:text-white hover:bg-white/5 rounded-xl transition-all"
                  >
                    <Settings className="w-4 h-4" />
                    <span>Settings</span>
                  </Link>

                  <div className="h-px bg-white/5 my-2" />
                  <WalletDropdownDisconnect
                    className="!w-full !justify-start !px-3 !py-2.5 !text-red-400 hover:!text-red-300 hover:!bg-red-500/10 !rounded-xl !transition-all"
                    text="Disconnect"
                  />
                </WalletDropdown>
              </Wallet>
            </div>
          </div>

          {/* Mobile menu button and wallet */}
          <div className="flex md:hidden items-center gap-2">
            {isConnected && (
              <Link href="/wallet">
                <div className="flex items-center gap-1 px-2 py-1 rounded-lg bg-emerald-500/10 border border-emerald-500/20 hover:bg-emerald-500/20 transition-all cursor-pointer">
                  <WalletIcon className="w-3 h-3 text-emerald-400" />
                  <span className="text-[10px] font-bold text-emerald-400">
                    {balance >= 1000
                      ? `${(balance / 1000).toFixed(1)}K`
                      : balance.toFixed(2)}{" "}
                    USDC
                  </span>
                </div>
              </Link>
            )}
            {!isConnected && (
              <Wallet>
                <ConnectWallet
                  className="!bg-gradient-to-r !from-violet-500 !to-pink-500 !text-white !font-semibold !px-3 !py-1.5 !rounded-lg !text-xs"
                  disconnectedLabel="Connect"
                />
              </Wallet>
            )}
            <button
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="p-1.5 xs:p-2 rounded-xl hover:bg-white/10 transition-all text-white"
            >
              {isMenuOpen ? (
                <X className="w-5 xs:w-6 h-5 xs:h-6" />
              ) : (
                <Menu className="w-5 xs:w-6 h-5 xs:h-6" />
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile menu */}
      {isMenuOpen && (
        <div className="md:hidden bg-black/95 backdrop-blur-xl border-t border-white/10">
          <div className="px-3 xs:px-4 py-4 xs:py-6 space-y-4">
            <div className="space-y-3">
              {/* User Info - only show when connected */}
              {isConnected ? (
                <>
                  <div className="flex items-center gap-3 p-3 xs:p-4 rounded-xl xs:rounded-2xl bg-gradient-to-r from-violet-500/10 to-pink-500/10 border border-purple-500/20">
                    <Avatar className="w-10 xs:w-12 h-10 xs:h-12 rounded-lg xs:rounded-xl" />
                    <div className="flex-1">
                      <Name className="text-sm font-semibold text-white" />
                      <p className="text-xs text-gray-400">
                        {isAdmin
                          ? "Admin"
                          : isSubAdmin
                          ? "Sub-Admin"
                          : "Player"}
                      </p>
                    </div>
                  </div>

                  {/* Balance Card */}
                  <Link href="/wallet" onClick={() => setIsMenuOpen(false)}>
                    <div className="flex items-center justify-between p-3 rounded-xl bg-gradient-to-r from-emerald-500/10 to-teal-500/10 border border-emerald-500/20 hover:bg-emerald-500/20 transition-all cursor-pointer">
                      <div className="flex items-center gap-2">
                        <WalletIcon className="w-4 xs:w-5 h-4 xs:h-5 text-emerald-400" />
                        <span className="text-xs xs:text-sm text-gray-400">
                          Balance
                        </span>
                      </div>
                      <span className="text-base xs:text-lg font-bold text-emerald-400">
                        {balance.toFixed(2)} USDC
                      </span>
                    </div>
                  </Link>
                </>
              ) : (
                <div className="p-4 rounded-xl bg-gradient-to-r from-violet-500/10 to-pink-500/10 border border-purple-500/20">
                  <p className="text-sm text-gray-400 mb-3">
                    Connect your wallet to get started
                  </p>
                  <Wallet>
                    <ConnectWallet
                      className="!w-full !bg-gradient-to-r !from-violet-500 !to-pink-500 hover:!from-violet-600 hover:!to-pink-600 !text-white !font-semibold !px-4 !py-3 !rounded-xl !transition-all"
                      disconnectedLabel="Connect Wallet"
                    />
                  </Wallet>
                </div>
              )}
            </div>

            <div className="space-y-2">
              {navLinks.map(({ href, label, icon: Icon }) => (
                <Link
                  key={href}
                  href={href}
                  onClick={() => setIsMenuOpen(false)}
                  className={cn(
                    "flex items-center gap-3 px-4 py-3 rounded-xl transition-all",
                    isActiveLink(href)
                      ? "bg-white/10 text-white"
                      : "text-gray-400 hover:text-white hover:bg-white/5"
                  )}
                >
                  <Icon className="w-5 h-5" />
                  <span className="font-medium">{label}</span>
                </Link>
              ))}

              {/* Notifications Link */}
              <Link
                href="/notifications"
                onClick={() => setIsMenuOpen(false)}
                className="flex items-center gap-3 px-4 py-3 text-gray-400 hover:text-white hover:bg-white/5 rounded-xl transition-all relative"
              >
                <Bell className="w-5 h-5" />
                <span className="font-medium">Notifications</span>
                {unreadCount > 0 && (
                  <Badge className="ml-auto bg-pink-500/20 text-pink-400 border-pink-500/30">
                    {unreadCount}
                  </Badge>
                )}
              </Link>

              {/* Settings Link */}
              <Link
                href="/profile"
                onClick={() => setIsMenuOpen(false)}
                className="flex items-center gap-3 px-4 py-3 text-gray-400 hover:text-white hover:bg-white/5 rounded-xl transition-all"
              >
                <Settings className="w-5 h-5" />
                <span className="font-medium">Settings</span>
              </Link>

              {isAdmin && (
                <>
                  <div className="pt-2 pb-1">
                    <p className="text-xs text-gray-500 uppercase tracking-wider px-4">
                      Admin
                    </p>
                  </div>
                  {adminLinks.map((link) => (
                    <Link
                      key={link.href}
                      href={link.href}
                      onClick={() => setIsMenuOpen(false)}
                      className="flex items-center gap-3 px-4 py-3 text-purple-300 hover:text-white hover:bg-purple-500/10 rounded-xl transition-all"
                    >
                      <link.icon className="w-5 h-5" />
                      <span className="font-medium">{link.label}</span>
                    </Link>
                  ))}
                </>
              )}

              {/* Sub-Admin Menu for Mobile */}
              {isSubAdmin && !isAdmin && (
                <>
                  <div className="pt-2 pb-1">
                    <p className="text-xs text-gray-500 uppercase tracking-wider px-4">
                      Poll Management
                    </p>
                  </div>
                  <Link
                    href="/admin/create"
                    onClick={() => setIsMenuOpen(false)}
                    className="flex items-center gap-3 px-4 py-3 text-blue-300 hover:text-white hover:bg-blue-500/10 rounded-xl transition-all"
                  >
                    <Sparkles className="w-5 h-5" />
                    <span className="font-medium">Create Poll</span>
                  </Link>
                  <Link
                    href="/polls"
                    onClick={() => setIsMenuOpen(false)}
                    className="flex items-center gap-3 px-4 py-3 text-blue-300 hover:text-white hover:bg-blue-500/10 rounded-xl transition-all"
                  >
                    <Trophy className="w-5 h-5" />
                    <span className="font-medium">Manage Polls</span>
                  </Link>
                </>
              )}

              {/* Disconnect button for mobile - using wagmi directly */}
              {isConnected && (
                <div className="pt-4 border-t border-white/10">
                  <Wallet>
                    <ConnectWallet className="!w-full !bg-red-500/10 hover:!bg-red-500/20 !text-red-400 !font-semibold !px-4 !py-3 !rounded-xl !transition-all !border !border-red-500/20" />
                  </Wallet>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </nav>
  );
}
