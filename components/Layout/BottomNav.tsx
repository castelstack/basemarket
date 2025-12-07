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
    requiresAuth: true,
    activeColor: "text-amber-400",
  },
  {
    href: "/polls",
    label: "Predict",
    icon: Trophy,
    requiresAuth: false,
    activeColor: "text-emerald-400",
  },
  {
    href: "/wallet",
    label: "Wallet",
    icon: Wallet,
    requiresAuth: true,
    activeColor: "text-blue-400",
  },
  {
    href: "/notifications",
    label: "Alerts",
    icon: Bell,
    showBadge: true,
    requiresAuth: true,
    activeColor: "text-red-400",
  },
  {
    href: "/profile",
    label: "Profile",
    icon: User,
    requiresAuth: true,
    activeColor: "text-[#EDEDED]",
  },
];

export default function BottomNav() {
  const pathname = usePathname();
  const { user } = useAuthStore();
  const { data: unreadCountData } = useUnreadNotificationsCount();
  const unreadCount = unreadCountData?.data?.count || 0;

  // Don't show on admin pages or landing page
  if (pathname.startsWith("/admin") || pathname === "/") return null;

  // Filter items based on auth status
  const visibleItems = navItems.filter(
    (item) => !item.requiresAuth || (item.requiresAuth && user)
  );

  const isActive = (href: string) => {
    return pathname === href || pathname.startsWith(href + "/");
  };

  return (
    <nav className="fixed bottom-4 left-4 right-4 z-50 md:hidden">
      <div className="flex items-center justify-around px-2 bg-[#0A0A0A]/95 backdrop-blur-xl border border-[#1F1F1F] rounded-2xl shadow-lg shadow-black/50">
        {visibleItems.map(({ href, label, icon: Icon, showBadge, activeColor }) => {
          const active = isActive(href);
          return (
            <Link
              key={href}
              href={href}
              className={cn(
                "flex flex-col items-center justify-center py-2 px-3 min-w-[56px] min-h-[56px] transition-all",
                "active:scale-95 touch-manipulation",
                active ? "text-white" : "text-[#9A9A9A]"
              )}
            >
              <div className="relative">
                <Icon
                  className={cn(
                    "w-5 h-5 transition-all",
                    active && activeColor
                  )}
                  strokeWidth={active ? 2.5 : 2}
                />
                {showBadge && unreadCount > 0 && (
                  <span className="absolute -top-1.5 -right-1.5 min-w-[16px] h-4 px-1 bg-red-500 rounded-full flex items-center justify-center">
                    <span className="text-[10px] font-bold text-white">
                      {unreadCount > 9 ? "9+" : unreadCount}
                    </span>
                  </span>
                )}
              </div>
              <span
                className={cn(
                  "text-[10px] mt-1 font-medium transition-all",
                  active ? activeColor : "text-[#9A9A9A]"
                )}
              >
                {label}
              </span>
              {active && (
                <div className={cn(
                  "absolute bottom-1 w-1 h-1 rounded-full",
                  activeColor.replace("text-", "bg-")
                )} />
              )}
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
