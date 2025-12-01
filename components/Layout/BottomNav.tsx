"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Home, Trophy, Wallet, User, Bell } from "lucide-react";
import { useAuthStore } from "@/stores/authStore";
import { useUnreadNotificationsCount } from "@/lib/notifications";
import { cn } from "@/lib/utils";

const navItems = [
  {
    href: "/dashboard",
    label: "Home",
    icon: Home,
  },
  {
    href: "/polls",
    label: "Predict",
    icon: Trophy,
  },
  {
    href: "/wallet",
    label: "Wallet",
    icon: Wallet,
  },
  {
    href: "/notifications",
    label: "Alerts",
    icon: Bell,
    showBadge: true,
  },
  {
    href: "/profile",
    label: "Profile",
    icon: User,
  },
];

export default function BottomNav() {
  const pathname = usePathname();
  const { user } = useAuthStore();
  const { data: unreadCountData } = useUnreadNotificationsCount();
  const unreadCount = unreadCountData?.data?.count || 0;

  // Don't show on admin pages
  if (pathname.startsWith("/admin")) return null;

  const isActive = (href: string) => {
    return pathname === href || pathname.startsWith(href + "/");
  };

  return (
    <nav className="fixed bottom-4 left-4 right-4 z-50 md:hidden">
      <div className="flex items-center justify-around px-2 bg-black/90 backdrop-blur-xl border border-white/10 rounded-2xl shadow-lg shadow-black/50">
        {navItems.map(({ href, label, icon: Icon, showBadge }) => {
          const active = isActive(href);
          return (
            <Link
              key={href}
              href={href}
              className={cn(
                "flex flex-col items-center justify-center py-2 px-3 min-w-[64px] min-h-[56px] transition-all",
                "active:scale-95 touch-manipulation",
                active ? "text-white" : "text-gray-500"
              )}
            >
              <div className="relative">
                <Icon
                  className={cn(
                    "w-6 h-6 transition-all",
                    active && "text-violet-400"
                  )}
                  strokeWidth={active ? 2.5 : 2}
                />
                {showBadge && unreadCount > 0 && (
                  <span className="absolute -top-1 -right-1 min-w-[16px] h-4 px-1 bg-pink-500 rounded-full flex items-center justify-center">
                    <span className="text-[10px] font-bold text-white">
                      {unreadCount > 9 ? "9+" : unreadCount}
                    </span>
                  </span>
                )}
              </div>
              <span
                className={cn(
                  "text-[10px] mt-1 font-medium transition-all",
                  active ? "text-violet-400" : "text-gray-500"
                )}
              >
                {label}
              </span>
              {active && (
                <div className="absolute bottom-1 w-1 h-1 rounded-full bg-violet-400" />
              )}
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
