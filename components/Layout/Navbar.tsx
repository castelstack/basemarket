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
  Avatar,
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
import { useAccountEffect } from "wagmi";

export default function Navbar() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const { user, isAdmin, isSubAdmin, updateBalance } = useAuthStore();
  const pathname = usePathname();

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
    },
    {
      href: "/polls",
      label: "Predict",
      icon: Trophy,
      requiresAuth: false,
    },
    {
      href: "/wallet",
      label: "Wallet",
      icon: CircleDollarSign,
      requiresAuth: true,
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
          ? "bg-black/80 backdrop-blur-xl border-b border-white/10"
          : "bg-gradient-to-b from-black via-black/95 to-transparent"
      )}
    >
      <div className="max-w-5xl mx-auto px-4 sm:px-6">
        <div className="flex justify-between items-center h-14 sm:h-16">
          {/* Logo */}
          <Link
            href={user ? "/dashboard" : "/polls"}
            className="flex items-center gap-2 group"
          >
            <div className="w-8 h-8 sm:w-10 sm:h-10 flex-shrink-0">
              <Logo />
            </div>
            <span className="text-lg sm:text-xl font-black tracking-tight">
              <span className="bg-gradient-to-r from-violet-400 to-indigo-400 bg-clip-text text-transparent">
                ShowStakr
              </span>
            </span>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center gap-1">
            {visibleNavLinks.map(({ href, label, icon: Icon }) => (
              <Link
                key={href}
                href={href}
                className={cn(
                  "relative px-3 py-2 rounded-xl text-sm font-medium transition-all",
                  isActiveLink(href)
                    ? "text-white bg-violet-500/20"
                    : "text-gray-400 hover:text-white hover:bg-white/5"
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
                  <button className="flex items-center gap-2 px-3 py-2 rounded-xl bg-violet-500/10 border border-violet-500/20 text-violet-300 hover:bg-violet-500/20 transition-all text-sm font-medium">
                    <Crown className="w-4 h-4" />
                    <span>Admin</span>
                    <ChevronDown className="w-3 h-3" />
                  </button>
                </DropdownMenuTrigger>
                <DropdownMenuContent className="w-48 bg-black/95 backdrop-blur-xl border border-white/10 rounded-xl p-1.5 mt-2">
                  <DropdownMenuLabel className="text-gray-500 text-xs px-2 py-1">
                    Admin
                  </DropdownMenuLabel>
                  <DropdownMenuSeparator className="bg-white/5 my-1" />
                  {adminLinks.map((link) => (
                    <DropdownMenuItem asChild key={link.href}>
                      <Link
                        href={link.href}
                        className="flex items-center gap-2 px-2 py-2 text-gray-300 hover:text-white hover:bg-violet-500/10 rounded-lg transition-all cursor-pointer text-sm"
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
                  <button className="flex items-center gap-2 px-3 py-2 rounded-xl bg-indigo-500/10 border border-indigo-500/20 text-indigo-300 hover:bg-indigo-500/20 transition-all text-sm font-medium">
                    <Sparkles className="w-4 h-4" />
                    <span>Polls</span>
                    <ChevronDown className="w-3 h-3" />
                  </button>
                </DropdownMenuTrigger>
                <DropdownMenuContent className="w-44 bg-black/95 backdrop-blur-xl border border-white/10 rounded-xl p-1.5 mt-2">
                  <DropdownMenuItem asChild>
                    <Link
                      href="/admin/create"
                      className="flex items-center gap-2 px-2 py-2 text-gray-300 hover:text-white hover:bg-indigo-500/10 rounded-lg transition-all cursor-pointer text-sm"
                    >
                      <Sparkles className="w-4 h-4" />
                      <span>Create Poll</span>
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem asChild>
                    <Link
                      href="/admin/polls"
                      className="flex items-center gap-2 px-2 py-2 text-gray-300 hover:text-white hover:bg-indigo-500/10 rounded-lg transition-all cursor-pointer text-sm"
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
                  <button className="relative p-2 rounded-xl hover:bg-white/5 transition-all group">
                    <Bell className="w-5 h-5 text-gray-400 group-hover:text-white transition-colors" />
                    {unreadCount > 0 && (
                      <div className="absolute -top-1 -right-1 min-w-[16px] h-4 px-1 bg-violet-500 rounded-full flex items-center justify-center">
                        <span className="text-[10px] font-bold text-white">
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
                  className="flex items-center gap-2 bg-gradient-to-r from-violet-500 to-indigo-500 hover:from-violet-600 hover:to-indigo-600 text-white font-medium px-4 py-2 rounded-xl text-sm transition-all disabled:opacity-50"
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
                <div className="w-9 h-9 rounded-xl bg-white/10 animate-pulse" />
              )}

              {/* OnchainKit Wallet - Connect button or Avatar dropdown */}
              {isWalletConnected ? (
                <Wallet>
                  <ConnectWallet className="!bg-transparent !p-0 !min-w-0">
                    <Avatar className="!w-9 !h-9 rounded-xl" />
                  </ConnectWallet>
                  <WalletDropdown className="!bg-black/95 !backdrop-blur-xl !border !border-white/10 !rounded-2xl !p-2 !my-0 min-w-[280px]">
                    <Identity className="px-4 pt-3 pb-2" hasCopyAddressOnClick>
                      <Avatar />
                      <Name />
                      <EthBalance />
                    </Identity>

                    {/* Profile Link - only show when authenticated */}
                    {user && (
                      <Link
                        href="/profile"
                        className="flex items-center gap-3 px-3 py-2.5 text-gray-300 hover:text-white hover:bg-violet-500/10 rounded-xl transition-all"
                      >
                        <User className="w-4 h-4" />
                        <span>Profile</span>
                      </Link>
                    )}

                    {/* Basename - Link to profile or create one */}
                    <WalletDropdownBasename className="!px-3 !py-2.5 !text-gray-300 hover:!text-white hover:!bg-violet-500/10 !rounded-xl !transition-all" />

                    {/* Fund Link - Easy way to add funds */}
                    <WalletDropdownFundLink
                      className="!px-3 !py-2.5 !text-gray-300 hover:!text-white hover:!bg-emerald-500/10 !rounded-xl !transition-all"
                      text="Add Funds"
                      popupSize="md"
                    />

                    <div className="h-px bg-white/5 my-2" />
                    <WalletDropdownDisconnect
                      className="!w-full !justify-start !px-3 !py-2.5 !text-red-400 hover:!text-red-300 hover:!bg-red-500/10 !rounded-xl !transition-all"
                      text="Disconnect"
                    />
                  </WalletDropdown>
                </Wallet>
              ) : (
                <Wallet>
                  <ConnectWallet
                    className="!bg-gradient-to-r !from-violet-500 !to-indigo-500 hover:!from-violet-600 hover:!to-indigo-600 !text-white !font-semibold !px-4 !py-2.5 !rounded-xl !text-sm"
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
                className="flex items-center gap-1.5 bg-gradient-to-r from-violet-500 to-indigo-500 text-white font-medium px-3 py-1.5 rounded-lg text-xs transition-all disabled:opacity-50"
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
              <Wallet>
                <ConnectWallet className="!bg-transparent !p-0 !min-w-0">
                  <Avatar className="!h-10 rounded-xl" />
                </ConnectWallet>
                <WalletDropdown className="!bg-black/95 !backdrop-blur-xl !border !w-full !border-white/10 !rounded-2xl !p-2 !my-0 !overflow-y-auto !z-[9999]">
                  <Identity className="px-3 py-3 mb-2" hasCopyAddressOnClick>
                    <Avatar />
                    <Name />
                    <EthBalance />
                  </Identity>

                  {/* Profile Link */}
                  <Link
                    href="/profile"
                    className="flex items-center gap-3 px-3 py-2.5 text-gray-300 hover:text-white hover:bg-violet-500/10 rounded-xl transition-all"
                  >
                    <User className="w-4 h-4" />
                    <span>Profile</span>
                  </Link>

                  <WalletDropdownBasename className="!px-3 !py-2.5 !text-gray-300 hover:!text-white hover:!bg-violet-500/10 !rounded-xl !transition-all" />
                  <WalletDropdownFundLink
                    className="!px-3 !py-2.5 !text-gray-300 hover:!text-white hover:!bg-emerald-500/10 !rounded-xl !transition-all"
                    text="Add Funds"
                    popupSize="md"
                  />

                  <div className="h-px bg-white/5 my-2" />
                  <WalletDropdownDisconnect
                    className="!w-full mb-[5rem] !justify-start !px-3 !py-2.5 !text-red-400 hover:!text-red-300 hover:!bg-red-500/10 !rounded-xl !transition-all"
                    text="Disconnect"
                  />
                </WalletDropdown>
              </Wallet>
            ) : !isWalletConnected ? (
              <Wallet>
                <ConnectWallet
                  className="!bg-gradient-to-r !from-violet-500 !to-indigo-500 !text-white !font-bold !px-2 !py-3 !rounded-lg !text-xs"
                  disconnectedLabel="Connect Wallet"
                />
              </Wallet>
            ) : !isWrongNetwork && !showSignIn ? (
              <div className="w-8 h-8 rounded-lg bg-white/10 animate-pulse" />
            ) : null}

            {/* Admin menu button - only show for admin/subadmin */}
            {(isAdmin || isSubAdmin) && (
              <button
                onClick={() => setIsMenuOpen(!isMenuOpen)}
                className="p-2.5 rounded-xl hover:bg-white/10 transition-all text-white"
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
        <div className="md:hidden bg-black/95 backdrop-blur-xl border-t border-white/10">
          <div className="max-w-5xl mx-auto px-4 sm:px-6 py-3 space-y-1">
            {isAdmin && (
              <>
                <p className="text-xs text-gray-500 px-3 py-2">Admin</p>
                {adminLinks.map((link) => (
                  <Link
                    key={link.href}
                    href={link.href}
                    onClick={() => setIsMenuOpen(false)}
                    className="flex items-center gap-3 px-3 py-2.5 text-violet-300 hover:text-white hover:bg-violet-500/10 rounded-lg transition-all"
                  >
                    <link.icon className="w-4 h-4" />
                    <span className="text-sm">{link.label}</span>
                  </Link>
                ))}
              </>
            )}

            {isSubAdmin && !isAdmin && (
              <>
                <p className="text-xs text-gray-500 px-3 py-2">
                  Poll Management
                </p>
                <Link
                  href="/admin/create"
                  onClick={() => setIsMenuOpen(false)}
                  className="flex items-center gap-3 px-3 py-2.5 text-indigo-300 hover:text-white hover:bg-indigo-500/10 rounded-lg transition-all"
                >
                  <Sparkles className="w-4 h-4" />
                  <span className="text-sm">Create Poll</span>
                </Link>
                <Link
                  href="/admin/polls"
                  onClick={() => setIsMenuOpen(false)}
                  className="flex items-center gap-3 px-3 py-2.5 text-indigo-300 hover:text-white hover:bg-indigo-500/10 rounded-lg transition-all"
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
