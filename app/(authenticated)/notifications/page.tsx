"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import {
  useNotifications,
  useMarkNotificationAsRead,
  useMarkAllNotificationsAsRead,
  useDeleteNotification,
  useNotificationPreferences,
  useUpdateNotificationPreferences,
} from "@/lib/notifications";
import { useAuthStore } from "@/stores/authStore";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Bell,
  BellOff,
  CheckCircle,
  Trash2,
  Clock,
  Trophy,
  Wallet,
  TrendingUp,
  AlertCircle,
  Info,
  Sparkles,
  Loader2,
  Check,
  X,
  Mail,
  Phone,
  Gift,
  DollarSign,
  Users,
  Zap,
  Star,
  ArrowRight,
  CheckCheck,
} from "lucide-react";
import { toast } from "sonner";
import dayjs from "dayjs";
import relativeTime from "dayjs/plugin/relativeTime";

dayjs.extend(relativeTime);

export default function NotificationsPage() {
  const router = useRouter();
  const { user } = useAuthStore();
  const [activeTab, setActiveTab] = useState("all");

  // API hooks
  const { data: notificationsData, isLoading } = useNotifications();
  const { data: preferencesData } = useNotificationPreferences();
  const markAsReadMutation = useMarkNotificationAsRead();
  const markAllAsReadMutation = useMarkAllNotificationsAsRead();
  const deleteNotificationMutation = useDeleteNotification();
  const updatePreferencesMutation = useUpdateNotificationPreferences();

  const notifications = (notificationsData?.data as any)?.docs || [];
  const preferences = preferencesData?.data;

  useEffect(() => {
    if (!user) {
      router.push("/");
    }
  }, [user, router]);

  if (!user) return null;

  // Filter notifications by type
  const filteredNotifications =
    activeTab === "all"
      ? notifications
      : activeTab === "unread"
      ? notifications.filter((n: any) => n.status !== "read")
      : notifications.filter((n: any) => n.type === activeTab);

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case "win":
        return <Trophy className="w-5 h-5 text-amber-400" />;
      case "stake":
        return <TrendingUp className="w-5 h-5 text-violet-400" />;
      case "deposit":
        return <Wallet className="w-5 h-5 text-emerald-400" />;
      case "withdrawal":
        return <DollarSign className="w-5 h-5 text-pink-400" />;
      case "promotion":
        return <Gift className="w-5 h-5 text-purple-400" />;
      case "system":
        return <Info className="w-5 h-5 text-blue-400" />;
      default:
        return <Bell className="w-5 h-5 text-gray-400" />;
    }
  };

  const getNotificationBg = (type: string) => {
    switch (type) {
      case "win":
        return "bg-amber-500/10 border-amber-500/30";
      case "stake":
        return "bg-violet-500/10 border-violet-500/30";
      case "deposit":
        return "bg-emerald-500/10 border-emerald-500/30";
      case "withdrawal":
        return "bg-pink-500/10 border-pink-500/30";
      case "promotion":
        return "bg-purple-500/10 border-purple-500/30";
      case "system":
        return "bg-blue-500/10 border-blue-500/30";
      default:
        return "bg-gray-500/10 border-gray-500/30";
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

  const handlePreferenceToggle = (key: string, value: boolean) => {
    if (!preferences) return;

    updatePreferencesMutation.mutate(
      { ...preferences, [key]: value },
      {
        onSuccess: () => {
          toast.success("Preferences updated");
        },
      }
    );
  };

  return (
    <div className="min-h-screen bg-black">
      {/* Background Effects */}
      <div className="fixed inset-0 bg-gradient-to-br from-violet-950/20 via-black to-pink-950/20" />
      <div className="fixed inset-0 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-purple-900/20 via-transparent to-transparent" />

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
        {/* Header */}
        <div className="mb-6 sm:mb-8">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <h1 className="text-2xl sm:text-3xl md:text-4xl font-black mb-2">
                <span className="bg-gradient-to-r from-violet-400 via-pink-400 to-orange-400 bg-clip-text text-transparent">
                  Notifications
                </span>
              </h1>
              <p className="text-gray-400 text-sm">
                Stay updated with your activities
              </p>
            </div>

            {notifications.some((n: any) => n.status !== "read") && (
              <Button
                onClick={handleMarkAllAsRead}
                disabled={markAllAsReadMutation.isPending}
                variant="outline"
                className="border-white/20 text-gray-400 hover:text-white hover:bg-white/10 rounded-xl w-full sm:w-auto"
              >
                {markAllAsReadMutation.isPending ? (
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                ) : (
                  <CheckCheck className="w-4 h-4 mr-2" />
                )}
                Mark all as read
              </Button>
            )}
          </div>
        </div>

        <Tabs
          value={activeTab}
          onValueChange={setActiveTab}
          className="space-y-6"
        >
          {/* Tabs Navigation */}
          <TabsList className="bg-white/5 border border-white/10 p-1 w-max  flex">
            <TabsTrigger
              value="all"
              className="data-[state=active]:bg-white/10 w-full flex-1 sm:flex-initial text-xs sm:text-sm"
            >
              All
            </TabsTrigger>
            <TabsTrigger
              value="unread"
              className="data-[state=active]:bg-white/10 flex-1 w-full sm:flex-initial text-xs sm:text-sm"
            >
              <span className="hidden sm:inline">Unread</span>
              <span className="sm:hidden">New</span>
              {notifications.filter((n: any) => n.status !== "read").length >
                0 && (
                <Badge className="ml-1 sm:ml-2 bg-pink-500/20 text-pink-400 border-pink-500/30 text-xs">
                  {notifications.filter((n: any) => n.status !== "read").length}
                </Badge>
              )}
            </TabsTrigger>
          </TabsList>

          {/* All Notifications Tab */}
          <TabsContent value="all" className="space-y-4">
            {isLoading ? (
              <div className="flex items-center justify-center py-12">
                <Loader2 className="w-8 h-8 text-violet-400 animate-spin" />
              </div>
            ) : filteredNotifications.length === 0 ? (
              <Card className="bg-white/5 backdrop-blur-sm border-white/10">
                <CardContent className="flex flex-col items-center justify-center py-12">
                  <BellOff className="w-12 h-12 text-gray-600 mb-4" />
                  <p className="text-gray-400 text-lg font-medium">
                    No notifications yet
                  </p>
                  <p className="text-gray-500 text-sm mt-2">
                    We&apos;ll notify you when something important happens
                  </p>
                </CardContent>
              </Card>
            ) : (
              <div className="space-y-3">
                {filteredNotifications.map((notification: any) => (
                  <Card
                    key={notification.id}
                    className={`${
                      notification.status === "read"
                        ? "bg-white/5"
                        : "bg-white/10"
                    } backdrop-blur-sm border-white/10 hover:bg-white/10 transition-all`}
                  >
                    <CardContent className="p-4">
                      <div className="flex flex-col sm:flex-row sm:items-start gap-3 sm:gap-4">
                        {/* Icon */}
                        <div
                          className={`p-2 sm:p-3 rounded-xl ${getNotificationBg(
                            notification.type
                          )} self-start`}
                        >
                          {getNotificationIcon(notification.type)}
                        </div>

                        {/* Content */}
                        <div className="flex-1 min-w-0">
                          <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-2 sm:gap-4">
                            <div className="flex-1">
                              <h3 className="text-white font-semibold text-sm sm:text-base flex flex-wrap items-center gap-2">
                                {notification.title}
                                {notification.status !== "read" && (
                                  <Badge className="bg-violet-500/20 text-violet-400 border-violet-500/30 text-xs">
                                    New
                                  </Badge>
                                )}
                              </h3>
                              <p className="text-gray-400 text-xs sm:text-sm mt-1 break-words">
                                {notification.message}
                              </p>
                              <p className="text-gray-500 text-xs mt-2">
                                {dayjs(notification.createdAt).fromNow()}
                              </p>
                            </div>

                            {/* Actions */}
                            <div className="flex items-center gap-1 sm:gap-2 self-start">
                              {notification.status !== "read" && (
                                <Button
                                  size="sm"
                                  variant="ghost"
                                  onClick={() =>
                                    handleMarkAsRead(notification.id)
                                  }
                                  className="text-gray-400 hover:text-white hover:bg-white/10 rounded-lg p-2 sm:p-2"
                                >
                                  <Check className="w-3 h-3 sm:w-4 sm:h-4" />
                                </Button>
                              )}
                              <Button
                                size="sm"
                                variant="ghost"
                                onClick={() => handleDelete(notification.id)}
                                className="text-gray-400 hover:text-red-400 hover:bg-red-500/10 rounded-lg p-2 sm:p-2"
                              >
                                <Trash2 className="w-3 h-3 sm:w-4 sm:h-4" />
                              </Button>
                            </div>
                          </div>

                          {/* Action Button if applicable */}
                          {notification.actionUrl && (
                            <Button
                              onClick={() =>
                                router.push(notification.actionUrl)
                              }
                              className="mt-3 bg-gradient-to-r from-violet-500 to-pink-500 hover:from-violet-600 hover:to-pink-600 text-white font-medium rounded-lg text-xs sm:text-sm w-full sm:w-auto"
                              size="sm"
                            >
                              {notification.actionText || "View Details"}
                              <ArrowRight className="w-3 h-3 ml-1" />
                            </Button>
                          )}
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </TabsContent>

          {/* Unread Tab */}
          <TabsContent value="unread" className="space-y-4">
            {filteredNotifications.length === 0 ? (
              <Card className="bg-white/5 backdrop-blur-sm border-white/10">
                <CardContent className="flex flex-col items-center justify-center py-12">
                  <CheckCircle className="w-12 h-12 text-emerald-400 mb-4" />
                  <p className="text-gray-400 text-lg font-medium">
                    All caught up!
                  </p>
                  <p className="text-gray-500 text-sm mt-2">
                    {`You've read all your notifications`}
                  </p>
                </CardContent>
              </Card>
            ) : (
              <div className="space-y-3">
                {filteredNotifications.map((notification: any) => (
                  <Card
                    key={notification.id}
                    className="bg-white/10 backdrop-blur-sm border-white/10 hover:bg-white/15 transition-all"
                  >
                    <CardContent className="p-4">
                      <div className="flex flex-col sm:flex-row sm:items-start gap-3 sm:gap-4">
                        <div
                          className={`p-2 sm:p-3 rounded-xl ${getNotificationBg(
                            notification.type
                          )} self-start`}
                        >
                          {getNotificationIcon(notification.type)}
                        </div>
                        <div className="flex-1">
                          <h3 className="text-white font-semibold text-sm sm:text-base">
                            {notification.title}
                          </h3>
                          <p className="text-gray-400 text-xs sm:text-sm mt-1 break-words">
                            {notification.message}
                          </p>
                          <p className="text-gray-500 text-xs mt-2">
                            {dayjs(notification.createdAt).fromNow()}
                          </p>
                        </div>
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => handleMarkAsRead(notification.id)}
                          className="text-gray-400 hover:text-white hover:bg-white/10 rounded-lg self-start p-2 sm:p-2"
                        >
                          <Check className="w-3 h-3 sm:w-4 sm:h-4" />
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </TabsContent>

          {/* Win Notifications Tab */}
          <TabsContent value="win" className="space-y-4">
            {filteredNotifications.length === 0 ? (
              <Card className="bg-white/5 backdrop-blur-sm border-white/10">
                <CardContent className="flex flex-col items-center justify-center py-12">
                  <Trophy className="w-12 h-12 text-gray-600 mb-4" />
                  <p className="text-gray-400 text-lg font-medium">
                    No wins yet
                  </p>
                  <p className="text-gray-500 text-sm mt-2">
                    Keep staking to win big!
                  </p>
                </CardContent>
              </Card>
            ) : (
              <div className="space-y-3">
                {filteredNotifications.map((notification: any) => (
                  <Card
                    key={notification.id}
                    className="bg-amber-500/10 backdrop-blur-sm border-amber-500/30 hover:bg-amber-500/15 transition-all"
                  >
                    <CardContent className="p-4">
                      <div className="flex flex-col sm:flex-row sm:items-start gap-3 sm:gap-4">
                        <div className="p-2 sm:p-3 rounded-xl bg-amber-500/20 border border-amber-500/30 self-start">
                          <Trophy className="w-4 h-4 sm:w-5 sm:h-5 text-amber-400" />
                        </div>
                        <div className="flex-1">
                          <h3 className="text-white font-semibold text-sm sm:text-base">
                            {notification.title}
                          </h3>
                          <p className="text-gray-400 text-xs sm:text-sm mt-1 break-words">
                            {notification.message}
                          </p>
                          <p className="text-gray-500 text-xs mt-2">
                            {dayjs(notification.createdAt).fromNow()}
                          </p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </TabsContent>

          {/* Stake Notifications Tab */}
          <TabsContent value="stake" className="space-y-4">
            {filteredNotifications.length === 0 ? (
              <Card className="bg-white/5 backdrop-blur-sm border-white/10">
                <CardContent className="flex flex-col items-center justify-center py-12">
                  <TrendingUp className="w-12 h-12 text-gray-600 mb-4" />
                  <p className="text-gray-400 text-lg font-medium">
                    No stake notifications
                  </p>
                  <p className="text-gray-500 text-sm mt-2">
                    Start staking to see updates here
                  </p>
                </CardContent>
              </Card>
            ) : (
              <div className="space-y-3">
                {filteredNotifications.map((notification: any) => (
                  <Card
                    key={notification.id}
                    className="bg-violet-500/10 backdrop-blur-sm border-violet-500/30 hover:bg-violet-500/15 transition-all"
                  >
                    <CardContent className="p-4">
                      <div className="flex flex-col sm:flex-row sm:items-start gap-3 sm:gap-4">
                        <div className="p-2 sm:p-3 rounded-xl bg-violet-500/20 border border-violet-500/30 self-start">
                          <TrendingUp className="w-4 h-4 sm:w-5 sm:h-5 text-violet-400" />
                        </div>
                        <div className="flex-1">
                          <h3 className="text-white font-semibold text-sm sm:text-base">
                            {notification.title}
                          </h3>
                          <p className="text-gray-400 text-xs sm:text-sm mt-1 break-words">
                            {notification.message}
                          </p>
                          <p className="text-gray-500 text-xs mt-2">
                            {dayjs(notification.createdAt).fromNow()}
                          </p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
