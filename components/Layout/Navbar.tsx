"use client";

import { Logo } from "@/assets/logo";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useWalletAuth } from "@/hooks/use-wallet-auth";
import { useUnreadNotificationsCount } from "@/lib/notifications";
import { cn } from "@/lib/utils";
import { useWalletBalance } from "@/lib/wallet";
import { useAuthStore } from "@/stores/authStore";
import {
  EthBalance,
  Identity,
  Name,
} from "@coinbase/onchainkit/identity";
import {
  ConnectWallet,
  Wallet,
  WalletDropdown,
  WalletDropdownBasename,
  WalletDropdownDisconnect,
  WalletDropdownFundLink,
} from "@coinbase/onchainkit/wallet";
import {
  Bell,
  BookOpen,
  ChevronDown,
  CircleDollarSign,
  Crown,
  Home,
  Loader2,
  Menu,
  Settings,
  Shield,
  Sparkles,
  TrendingUp,
  Trophy,
  User,
  X,
} from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { useAccount, useAccountEffect } from "wagmi";
import { GradientOrbAvatar } from "@/components/ui/gradient-orb-avatar";

export default function Navbar() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const { user, isAdmin, isSubAdmin, updateBalance } = useAuthStore();
  const pathname = usePathname();
  const { address } = useAccount();

  // Use the comprehensive wallet auth hook
  const {
    isWalletConnected,
    isAuthenticated,
    isLoading: isSigningIn,
    showSignIn,
    isWrongNetwork,
    isSwitchingNetwork,
    switchToCorrectNetwork,
    signIn,
    signOut,
  } = useWalletAuth();

  // Fetch wallet balance when authenticated
  const { data: balanceData } = useWalletBalance(isAuthenticated);

  // Update balance when fetched
  useEffect(() => {
    if (balanceData?.data?.availableBalance !== undefined) {
      updateBalance(balanceData.data.availableBalance);
    }
  }, [balanceData, updateBalance]);

  // Handle wallet disconnect
  useAccountEffect({
    onDisconnect: () => {
      signOut();
    },
  });

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
      label: "Home",
      icon: Home,
      requiresAuth: true,
      activeColor: "text-amber-400",
      activeBg: "bg-amber-500/10",
    },
    {
      href: "/polls",
      label: "Predict",
      icon: Trophy,
      requiresAuth: false,
      activeColor: "text-emerald-400",
      activeBg: "bg-emerald-500/10",
    },
    {
      href: "/wallet",
      label: "Wallet",
      icon: CircleDollarSign,
      requiresAuth: true,
      activeColor: "text-blue-400",
      activeBg: "bg-blue-500/10",
    },
  ];

  // Filter nav links based on auth status
  const visibleNavLinks = navLinks.filter(
    (link) => !link.requiresAuth || (link.requiresAuth && user)
  );

  const adminLinks = [
    { href: "/admin/dashboard", label: "Dashboard", icon: Shield },
    { href: "/admin/create", label: "Create Poll", icon: Sparkles },
    { href: "/admin/polls", label: "Polls", icon: Trophy },
    { href: "/admin/users", label: "Users", icon: User },
    { href: "/admin/transactions", label: "Transactions", icon: TrendingUp },
    { href: "/admin/settings", label: "Settings", icon: Settings },
  ];

  const isActiveLink = (href: string) => {
    return pathname === href || pathname.startsWith(href + "/");
  };

  return (
    <nav
      className={cn(
        "sticky top-0 z-50 transition-all duration-300",
        scrolled
          ? "bg-[#000000]/90 backdrop-blur-xl border-b border-[#1F1F1F]"
          : "bg-gradient-to-b from-[#000000] via-[#000000]/95 to-transparent"
      )}
    >
      <div className="max-w-5xl mx-auto px-4 sm:px-6">
        <div className="flex justify-between items-center h-14 sm:h-16">
          {/* Logo */}
          <Link
            href={user ? "/dashboard" : "/"}
            className="flex items-center gap-2 group"
          >
            <div className="w-8 h-8 sm:w-10 sm:h-10 flex-shrink-0">
              <Logo />
            </div>
            <span className="text-lg sm:text-xl font-semibold tracking-tight text-[#EDEDED]">
              ShowStakr
            </span>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center gap-1">
            {visibleNavLinks.map(({ href, label, icon: Icon, activeColor, activeBg }) => (
              <Link
                key={href}
                href={href}
                className={cn(
                  "relative px-3 py-2 rounded-xl text-sm font-medium transition-all",
                  isActiveLink(href)
                    ? `${activeColor} ${activeBg}`
                    : "text-[#9A9A9A] hover:text-[#EDEDED] hover:bg-[#0A0A0A]"
                )}
              >
                <div className="flex items-center gap-2">
                  <Icon className="w-4 h-4" />
                  <span>{label}</span>
                </div>
              </Link>
            ))}

            {isAdmin && (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <button className="flex items-center gap-2 px-3 py-2 rounded-xl bg-[#151515] border border-[#1F1F1F] text-[#D8D8D8] hover:bg-[#1F1F1F] transition-all text-sm font-medium">
                    <Crown className="w-4 h-4" />
                    <span>Admin</span>
                    <ChevronDown className="w-3 h-3" />
                  </button>
                </DropdownMenuTrigger>
                <DropdownMenuContent className="w-48 bg-[#0A0A0A] backdrop-blur-xl border border-[#1F1F1F] rounded-xl p-1.5 mt-2">
                  <DropdownMenuLabel className="text-[#9A9A9A] text-xs px-2 py-1 font-light">
                    Admin
                  </DropdownMenuLabel>
                  <DropdownMenuSeparator className="bg-[#1F1F1F] my-1" />
                  {adminLinks.map((link) => (
                    <DropdownMenuItem asChild key={link.href}>
                      <Link
                        href={link.href}
                        className="flex items-center gap-2 px-2 py-2 text-[#9A9A9A] hover:text-[#EDEDED] hover:bg-[#151515] rounded-lg transition-all cursor-pointer text-sm"
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
                  <button className="flex items-center gap-2 px-3 py-2 rounded-xl bg-[#151515] border border-[#1F1F1F] text-[#D8D8D8] hover:bg-[#1F1F1F] transition-all text-sm font-medium">
                    <Sparkles className="w-4 h-4" />
                    <span>Polls</span>
                    <ChevronDown className="w-3 h-3" />
                  </button>
                </DropdownMenuTrigger>
                <DropdownMenuContent className="w-44 bg-[#0A0A0A] backdrop-blur-xl border border-[#1F1F1F] rounded-xl p-1.5 mt-2">
                  <DropdownMenuItem asChild>
                    <Link
                      href="/admin/create"
                      className="flex items-center gap-2 px-2 py-2 text-[#9A9A9A] hover:text-[#EDEDED] hover:bg-[#151515] rounded-lg transition-all cursor-pointer text-sm"
                    >
                      <Sparkles className="w-4 h-4" />
                      <span>Create Poll</span>
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem asChild>
                    <Link
                      href="/admin/polls"
                      className="flex items-center gap-2 px-2 py-2 text-[#9A9A9A] hover:text-[#EDEDED] hover:bg-[#151515] rounded-lg transition-all cursor-pointer text-sm"
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
          <div className="hidden md:flex items-center gap-2">
            <div className="flex items-center gap-2">
              {/* Notifications Button - only show when authenticated */}
              {isWalletConnected && user && (
                <Link href="/notifications" aria-label="Notifications">
                  <button className="relative p-2 rounded-xl hover:bg-[#151515] transition-all group">
                    <Bell className="w-5 h-5 text-[#9A9A9A] group-hover:text-[#EDEDED] transition-colors" />
                    {unreadCount > 0 && (
                      <div className="absolute top-0.5 right-0.5 min-w-[14px] h-3.5 px-1 bg-red-500 rounded-full flex items-center justify-center">
                        <span className="text-[9px] font-semibold text-white">
                          {unreadCount > 99 ? "99+" : unreadCount}
                        </span>
                      </div>
                    )}
                  </button>
                </Link>
              )}

              {/* Switch Network button - show when on wrong network */}
              {isWalletConnected && isWrongNetwork && (
                <button
                  onClick={switchToCorrectNetwork}
                  disabled={isSwitchingNetwork}
                  aria-label="Switch to correct network"
                  className="flex items-center gap-2 bg-amber-500 hover:bg-amber-600 text-white font-medium px-3 py-2 rounded-xl text-sm transition-all disabled:opacity-50"
                >
                  {isSwitchingNetwork ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    <span>Switch Network</span>
                  )}
                </button>
              )}

              {/* Sign In button - show when connected but not authenticated and on correct network */}
              {isWalletConnected && showSignIn && !isWrongNetwork && (
                <button
                  onClick={signIn}
                  disabled={isSigningIn}
                  aria-label="Sign in to your account"
                  className="flex items-center gap-2 bg-[#EDEDED] hover:bg-[#D8D8D8] text-[#0A0A0A] font-medium px-4 py-2 rounded-full text-sm transition-all disabled:opacity-50"
                >
                  {isSigningIn ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      <span>Signing in...</span>
                    </>
                  ) : (
                    <span>Sign In</span>
                  )}
                </button>
              )}

              {/* Loading state - when wallet connected but still checking profile */}
              {isWalletConnected && !user && !isWrongNetwork && !showSignIn && (
                <div className="w-9 h-9 rounded-xl bg-[#151515] animate-pulse" />
              )}

              {/* OnchainKit Wallet - Connect button or Avatar dropdown */}
              {isWalletConnected ? (
                <Wallet>
                  <ConnectWallet className="!bg-transparent !p-0 !min-w-0 !flex !items-center !justify-center">
                    <div className="w-9 h-9">
                      <GradientOrbAvatar address={address || ""} size={36} />
                    </div>
                  </ConnectWallet>
                  <WalletDropdown className="!bg-[#0A0A0A] !border-0 !shadow-none !rounded-2xl !p-0 !my-0 min-w-[280px]">
                    <div className="flex items-center gap-3 px-4 pt-3 pb-2">
                      <div className="w-10 h-10 flex-shrink-0">
                        <GradientOrbAvatar address={address || ""} size={40} />
                      </div>
                      <Identity hasCopyAddressOnClick className="!px-0">
                        <Name />
                        <EthBalance />
                      </Identity>
                    </div>

                    {/* Profile Link - only show when authenticated */}
                    {user && (
                      <Link
                        href="/profile"
                        className="flex items-center gap-3 px-3 py-2.5 text-[#9A9A9A] hover:text-[#EDEDED] hover:bg-[#151515] rounded-xl transition-all"
                      >
                        <User className="w-4 h-4" />
                        <span>Profile</span>
                      </Link>
                    )}

                    {/* Guide Link */}
                    <Link
                      href="/guide"
                      className="flex items-center gap-3 px-3 py-2.5 text-[#9A9A9A] hover:text-[#EDEDED] hover:bg-[#151515] rounded-xl transition-all"
                    >
                      <BookOpen className="w-4 h-4" />
                      <span>Guide</span>
                    </Link>

                    {/* Basename - Link to profile or create one */}
                    <WalletDropdownBasename className="!px-3 !py-2.5 !text-[#9A9A9A] hover:!text-[#EDEDED] hover:!bg-[#151515] !rounded-xl !transition-all" />

                    {/* Fund Link - Easy way to add funds */}
                    <WalletDropdownFundLink
                      className="!px-3 !py-2.5 !text-[#9A9A9A] hover:!text-[#EDEDED] hover:!bg-emerald-500/10 !rounded-xl !transition-all"
                      text="Add Funds"
                      popupSize="md"
                    />

                    <div className="h-px bg-[#1F1F1F] my-2" />
                    <WalletDropdownDisconnect
                      className="!w-full !justify-start !px-3 !py-2.5 !text-red-400 hover:!text-red-300 hover:!bg-red-500/10 !rounded-xl !transition-all"
                      text="Disconnect"
                    />
                  </WalletDropdown>
                </Wallet>
              ) : (
                <Wallet>
                  <ConnectWallet
                    className="!bg-[#EDEDED] hover:!bg-[#D8D8D8] !text-[#0A0A0A] !font-medium !px-4 !py-2.5 !rounded-full !text-sm"
                    // text="Connect"
                  />
                </Wallet>
              )}
            </div>
          </div>

          {/* Mobile: Avatar and Admin menu */}
          <div className="flex md:hidden items-center gap-2">
            {/* Switch Network button */}
            {isWalletConnected && isWrongNetwork && (
              <button
                onClick={switchToCorrectNetwork}
                disabled={isSwitchingNetwork}
                aria-label="Switch network"
                className="flex items-center gap-1.5 bg-amber-500 text-white font-medium px-3 py-1.5 rounded-lg text-xs transition-all disabled:opacity-50"
              >
                {isSwitchingNetwork ? (
                  <Loader2 className="w-3 h-3 animate-spin" />
                ) : (
                  <span>Switch</span>
                )}
              </button>
            )}

            {/* Sign In button */}
            {isWalletConnected && showSignIn && !isWrongNetwork && (
              <button
                onClick={signIn}
                disabled={isSigningIn}
                aria-label="Sign in"
                className="flex items-center gap-1.5 bg-[#EDEDED] text-[#0A0A0A] font-medium px-3 py-1.5 rounded-full text-xs transition-all disabled:opacity-50"
              >
                {isSigningIn ? (
                  <Loader2 className="w-3 h-3 animate-spin" />
                ) : (
                  <span>Sign In</span>
                )}
              </button>
            )}

            {/* Avatar with dropdown for authenticated users */}
            {isWalletConnected && user ? (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <button className="w-10 h-10 rounded-full overflow-hidden">
                    <GradientOrbAvatar address={address || ""} size={40} />
                  </button>
                </DropdownMenuTrigger>
                <DropdownMenuContent
                  align="end"
                  className="w-72 bg-[#0A0A0A] border border-[#1F1F1F] rounded-2xl p-2 mt-2"
                >
                  <div className="flex items-center gap-1 px-3 py-3 mb-2">
                    <div className="w-10 h-10 flex-shrink-0">
                      <GradientOrbAvatar address={address || ""} size={40} />
                    </div>
                    <Identity hasCopyAddressOnClick className="!px-0">
                      <Name />
                      <EthBalance />
                    </Identity>
                  </div>

                  <DropdownMenuItem asChild>
                    <Link
                      href="/profile"
                      className="flex items-center gap-3 px-3 py-2.5 text-[#9A9A9A] hover:text-[#EDEDED] hover:bg-[#151515] rounded-xl transition-all cursor-pointer"
                    >
                      <User className="w-4 h-4" />
                      <span>Profile</span>
                    </Link>
                  </DropdownMenuItem>

                  <DropdownMenuItem asChild>
                    <Link
                      href="/guide"
                      className="flex items-center gap-3 px-3 py-2.5 text-[#9A9A9A] hover:text-[#EDEDED] hover:bg-[#151515] rounded-xl transition-all cursor-pointer"
                    >
                      <BookOpen className="w-4 h-4" />
                      <span>Guide</span>
                    </Link>
                  </DropdownMenuItem>

                  <DropdownMenuSeparator className="bg-[#1F1F1F] my-2" />

                  <DropdownMenuItem
                    onClick={() => signOut()}
                    className="flex items-center gap-3 px-3 py-2.5 text-red-400 hover:text-red-300 hover:bg-red-500/10 rounded-xl transition-all cursor-pointer"
                  >
                    <X className="w-4 h-4" />
                    <span>Disconnect</span>
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            ) : !isWalletConnected ? (
              <Wallet>
                <ConnectWallet
                  className="!bg-[#EDEDED] !text-[#0A0A0A] !font-medium !px-3 !py-2.5 !rounded-full !text-xs"
                  disconnectedLabel="Connect Wallet"
                />
              </Wallet>
            ) : !isWrongNetwork && !showSignIn ? (
              <div className="w-8 h-8 rounded-lg bg-[#151515] animate-pulse" />
            ) : null}

            {/* Admin menu button - only show for admin/subadmin */}
            {(isAdmin || isSubAdmin) && (
              <button
                onClick={() => setIsMenuOpen(!isMenuOpen)}
                className="p-2.5 rounded-xl hover:bg-[#151515] transition-all text-[#EDEDED]"
                aria-label={isMenuOpen ? "Close admin menu" : "Open admin menu"}
              >
                {isMenuOpen ? (
                  <X className="w-5 h-5" />
                ) : (
                  <Menu className="w-5 h-5" />
                )}
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Mobile Admin Menu - only for admin/subadmin */}
      {isMenuOpen && (isAdmin || isSubAdmin) && (
        <div className="md:hidden bg-[#0A0A0A] backdrop-blur-xl border-t border-[#1F1F1F]">
          <div className="max-w-5xl mx-auto px-4 sm:px-6 py-3 space-y-1">
            {isAdmin && (
              <>
                <p className="text-xs text-[#9A9A9A] px-3 py-2 font-light">Admin</p>
                {adminLinks.map((link) => (
                  <Link
                    key={link.href}
                    href={link.href}
                    onClick={() => setIsMenuOpen(false)}
                    className="flex items-center gap-3 px-3 py-2.5 text-[#9A9A9A] hover:text-[#EDEDED] hover:bg-[#151515] rounded-lg transition-all"
                  >
                    <link.icon className="w-4 h-4" />
                    <span className="text-sm">{link.label}</span>
                  </Link>
                ))}
              </>
            )}

            {isSubAdmin && !isAdmin && (
              <>
                <p className="text-xs text-[#9A9A9A] px-3 py-2 font-light">
                  Poll Management
                </p>
                <Link
                  href="/admin/create"
                  onClick={() => setIsMenuOpen(false)}
                  className="flex items-center gap-3 px-3 py-2.5 text-[#9A9A9A] hover:text-[#EDEDED] hover:bg-[#151515] rounded-lg transition-all"
                >
                  <Sparkles className="w-4 h-4" />
                  <span className="text-sm">Create Poll</span>
                </Link>
                <Link
                  href="/admin/polls"
                  onClick={() => setIsMenuOpen(false)}
                  className="flex items-center gap-3 px-3 py-2.5 text-[#9A9A9A] hover:text-[#EDEDED] hover:bg-[#151515] rounded-lg transition-all"
                >
                  <Trophy className="w-4 h-4" />
                  <span className="text-sm">Manage Polls</span>
                </Link>
              </>
            )}
          </div>
        </div>
      )}
    </nav>
  );
}
