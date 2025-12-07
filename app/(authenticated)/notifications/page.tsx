"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import {
  useNotifications,
  useMarkNotificationAsRead,
  useMarkAllNotificationsAsRead,
  useDeleteNotification,
} from "@/lib/notifications";
import { useAuthStore } from "@/stores/authStore";
import { Button } from "@/components/ui/button";
import { CelebrationModal } from "@/components/CelebrationModal";
import {
  Bell,
  BellOff,
  CheckCircle,
  Trash2,
  Trophy,
  Wallet,
  TrendingUp,
  Info,
  Loader2,
  Check,
  Gift,
  DollarSign,
  CheckCheck,
} from "lucide-react";
import { toast } from "sonner";
import dayjs from "dayjs";
import relativeTime from "dayjs/plugin/relativeTime";

dayjs.extend(relativeTime);

type FilterTab = "all" | "unread";

export default function NotificationsPage() {
  const router = useRouter();
  const { user } = useAuthStore();
  const [activeTab, setActiveTab] = useState<FilterTab>("all");

  // Celebration modal state
  const [celebrationOpen, setCelebrationOpen] = useState(false);
  const [celebrationData, setCelebrationData] = useState<{
    pollTitle?: string;
    winnings?: number;
    pollId?: string;
  }>({});

  // API hooks
  const { data: notificationsData, isLoading } = useNotifications();
  const markAsReadMutation = useMarkNotificationAsRead();
  const markAllAsReadMutation = useMarkAllNotificationsAsRead();
  const deleteNotificationMutation = useDeleteNotification();

  const notifications = (notificationsData?.data as any)?.docs || [];

  useEffect(() => {
    if (!user) {
      router.push("/");
    }
  }, [user, router]);

  if (!user) return null;

  // Filter notifications
  const filteredNotifications =
    activeTab === "all"
      ? notifications
      : notifications.filter((n: any) => n.status !== "read");

  const unreadCount = notifications.filter((n: any) => n.status !== "read").length;

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case "win":
        return <Trophy className="w-4 h-4 text-amber-400" />;
      case "stake":
        return <TrendingUp className="w-4 h-4 text-violet-400" />;
      case "deposit":
        return <Wallet className="w-4 h-4 text-emerald-400" />;
      case "withdrawal":
        return <DollarSign className="w-4 h-4 text-pink-400" />;
      case "promotion":
        return <Gift className="w-4 h-4 text-purple-400" />;
      case "system":
        return <Info className="w-4 h-4 text-blue-400" />;
      default:
        return <Bell className="w-4 h-4 text-gray-400" />;
    }
  };

  const getIconBgColor = (type: string) => {
    switch (type) {
      case "win":
        return "bg-amber-500/15";
      case "stake":
        return "bg-violet-500/15";
      case "deposit":
        return "bg-emerald-500/15";
      case "withdrawal":
        return "bg-pink-500/15";
      case "promotion":
        return "bg-purple-500/15";
      case "system":
        return "bg-blue-500/15";
      default:
        return "bg-gray-500/15";
    }
  };

  const handleMarkAsRead = (id: string) => {
    markAsReadMutation.mutate(id, {
      onSuccess: () => {
        toast.success("Marked as read");
      },
    });
  };

  const handleDelete = (id: string) => {
    deleteNotificationMutation.mutate(id, {
      onSuccess: () => {
        toast.success("Notification deleted");
      },
    });
  };

  const handleMarkAllAsRead = () => {
    markAllAsReadMutation.mutate(undefined, {
      onSuccess: () => {
        toast.success("All notifications marked as read");
      },
    });
  };

  const handleNotificationClick = (notification: any) => {
    // If it's a win notification that hasn't been read, show celebration
    if (notification.type === "win" && notification.status !== "read") {
      // Extract win data from notification metadata
      const winnings = notification.metadata?.winnings || notification.metadata?.amount;
      const pollTitle = notification.metadata?.pollTitle || notification.title;
      const pollId = notification.metadata?.pollId;

      setCelebrationData({
        pollTitle,
        winnings,
        pollId,
      });
      setCelebrationOpen(true);

      // Mark as read
      markAsReadMutation.mutate(notification.id);
    } else if (notification.actionUrl) {
      router.push(notification.actionUrl);
    }
  };

  return (
    <div className="min-h-screen bg-[#000000] pb-24">
      {/* Background */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[600px] h-[600px] bg-[#1F1F1F]/20 rounded-full blur-[150px]" />
      </div>

      <div className="relative max-w-2xl mx-auto px-4 py-6">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-xl font-semibold text-[#EDEDED]">Notifications</h1>
            <p className="text-[#9A9A9A] text-sm mt-0.5 font-light">
              {unreadCount > 0 ? `${unreadCount} unread` : "All caught up"}
            </p>
          </div>

          {unreadCount > 0 && (
            <Button
              onClick={handleMarkAllAsRead}
              disabled={markAllAsReadMutation.isPending}
              size="sm"
              variant="ghost"
              className="text-[#9A9A9A] hover:text-[#EDEDED] hover:bg-[#151515]"
            >
              {markAllAsReadMutation.isPending ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <>
                  <CheckCheck className="w-4 h-4 mr-1.5" />
                  Read all
                </>
              )}
            </Button>
          )}
        </div>

        {/* Filter Tabs */}
        <div className="flex gap-2 mb-5">
          <button
            onClick={() => setActiveTab("all")}
            className={`px-4 py-2 rounded-full text-sm font-medium transition-all ${
              activeTab === "all"
                ? "bg-[#EDEDED] text-[#0A0A0A]"
                : "bg-[#151515] text-[#9A9A9A] hover:bg-[#1F1F1F] hover:text-[#EDEDED]"
            }`}
          >
            All
          </button>
          <button
            onClick={() => setActiveTab("unread")}
            className={`px-4 py-2 rounded-full text-sm font-medium transition-all flex items-center gap-2 ${
              activeTab === "unread"
                ? "bg-[#EDEDED] text-[#0A0A0A]"
                : "bg-[#151515] text-[#9A9A9A] hover:bg-[#1F1F1F] hover:text-[#EDEDED]"
            }`}
          >
            Unread
            {unreadCount > 0 && (
              <span className={`text-xs px-1.5 py-0.5 rounded-full ${
                activeTab === "unread"
                  ? "bg-[#0A0A0A]/20 text-[#0A0A0A]"
                  : "bg-red-500/20 text-red-400"
              }`}>
                {unreadCount}
              </span>
            )}
          </button>
        </div>

        {/* Content */}
        {isLoading ? (
          <div className="flex items-center justify-center py-20">
            <Loader2 className="w-6 h-6 text-[#EDEDED] animate-spin" />
          </div>
        ) : filteredNotifications.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 text-center">
            {activeTab === "unread" ? (
              <>
                <div className="w-14 h-14 rounded-full bg-emerald-500/10 flex items-center justify-center mb-4">
                  <CheckCircle className="w-7 h-7 text-emerald-400" />
                </div>
                <p className="text-[#EDEDED] font-medium">All caught up!</p>
                <p className="text-[#9A9A9A] text-sm mt-1 font-light">
                  No unread notifications
                </p>
              </>
            ) : (
              <>
                <div className="w-14 h-14 rounded-full bg-[#151515] flex items-center justify-center mb-4">
                  <BellOff className="w-7 h-7 text-[#9A9A9A]" />
                </div>
                <p className="text-[#EDEDED] font-medium">No notifications yet</p>
                <p className="text-[#9A9A9A] text-sm mt-1 font-light">
                  We'll notify you when something happens
                </p>
              </>
            )}
          </div>
        ) : (
          <div className="space-y-2">
            {filteredNotifications.map((notification: any) => (
              <div
                key={notification.id}
                className={`group relative p-4 rounded-2xl border transition-all ${
                  notification.status === "read"
                    ? "bg-[#0A0A0A] border-[#1F1F1F]/50"
                    : "bg-[#0A0A0A] border-[#1F1F1F]"
                }`}
              >
                <div className="flex gap-3">
                  {/* Icon */}
                  <div
                    className={`w-10 h-10 rounded-xl ${getIconBgColor(
                      notification.type
                    )} flex items-center justify-center flex-shrink-0`}
                  >
                    {getNotificationIcon(notification.type)}
                  </div>

                  {/* Content */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <h3 className="text-[#EDEDED] text-sm font-medium truncate">
                            {notification.title}
                          </h3>
                          {notification.status !== "read" && (
                            <span className="w-2 h-2 rounded-full bg-red-500 flex-shrink-0" />
                          )}
                        </div>
                        <p className="text-[#9A9A9A] text-sm mt-0.5 line-clamp-2 font-light">
                          {notification.message}
                        </p>
                        <p className="text-[#9A9A9A]/60 text-xs mt-2 font-light">
                          {dayjs(notification.createdAt).fromNow()}
                        </p>
                      </div>

                      {/* Actions - Desktop only */}
                      <div className="hidden sm:flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                        {notification.status !== "read" && (
                          <button
                            onClick={() => handleMarkAsRead(notification.id)}
                            className="p-2 rounded-lg text-[#9A9A9A] hover:text-[#EDEDED] hover:bg-[#151515] transition-colors"
                          >
                            <Check className="w-4 h-4" />
                          </button>
                        )}
                        <button
                          onClick={() => handleDelete(notification.id)}
                          className="p-2 rounded-lg text-[#9A9A9A] hover:text-red-400 hover:bg-red-500/10 transition-colors"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>

                    {/* Action Button */}
                    {(notification.actionUrl || notification.type === "win") && (
                      <button
                        onClick={() => handleNotificationClick(notification)}
                        className="mt-3 px-3 py-1.5 bg-[#151515] hover:bg-[#1F1F1F] border border-[#1F1F1F] rounded-lg text-[#EDEDED] text-xs font-medium transition-colors"
                      >
                        {notification.type === "win" && notification.status !== "read"
                          ? "Celebrate Win"
                          : notification.actionText || "View Details"}
                      </button>
                    )}
                  </div>
                </div>

                {/* Mobile Actions - Always visible on touch */}
                <div className="flex items-center gap-1 absolute top-3 right-3 sm:hidden">
                  {notification.status !== "read" && (
                    <button
                      onClick={() => handleMarkAsRead(notification.id)}
                      className="p-2 rounded-lg text-[#9A9A9A] hover:text-[#EDEDED] hover:bg-[#151515] transition-colors"
                    >
                      <Check className="w-4 h-4" />
                    </button>
                  )}
                  <button
                    onClick={() => handleDelete(notification.id)}
                    className="p-2 rounded-lg text-[#9A9A9A] hover:text-red-400 hover:bg-red-500/10 transition-colors"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Celebration Modal for Win Notifications */}
      <CelebrationModal
        open={celebrationOpen}
        onClose={() => {
          setCelebrationOpen(false);
          // Navigate to poll if available
          if (celebrationData.pollId) {
            router.push(`/polls/${celebrationData.pollId}`);
          }
        }}
        type="win"
        pollTitle={celebrationData.pollTitle}
        winnings={celebrationData.winnings}
        pollId={celebrationData.pollId}
      />
    </div>
  );
}
