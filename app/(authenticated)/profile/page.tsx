"use client";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { capitalize } from "@/lib/capitalize";
import {
  useNotificationPreferences,
  useUpdateNotificationPreferences,
} from "@/lib/notifications";
import { useMyStakes } from "@/lib/stakes";
import {
  useUpdateProfile,
  useUserProfile,
  useUserStatistics,
} from "@/lib/user";
import { cn } from "@/lib/utils";
import dayjs from "dayjs";
import relativeTime from "dayjs/plugin/relativeTime";
import {
  Activity,
  Bell,
  CheckCircle,
  Crown,
  Edit3,
  Loader2,
  Mail,
  Save,
  Star,
  Trophy,
  User,
  UserCheck,
  X,
} from "lucide-react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { GradientOrbAvatar } from "@/components/ui/gradient-orb-avatar";
import numeral from "numeral";
import { useEffect, useState } from "react";
import { toast } from "sonner";

dayjs.extend(relativeTime);

export default function ProfilePage() {
  const router = useRouter();
  const { data: userResponse, isLoading } = useUserProfile();
  const user = userResponse?.data;
  const { data: userStatsResponse } = useUserStatistics();
  const userStats = userStatsResponse?.data;
  const { data: stakesData } = useMyStakes();
  const { data: notificationPrefsData } = useNotificationPreferences();
  const updateNotificationPrefs = useUpdateNotificationPreferences();
  const updateProfile = useUpdateProfile();

  const [activeTab, setActiveTab] = useState<"profile" | "preferences" | "activity">("profile");
  const [isEditingProfile, setIsEditingProfile] = useState(false);
  const [profileForm, setProfileForm] = useState({
    firstName: "",
    lastName: "",
    username: "",
  });

  const [notificationChannels, setNotificationChannels] = useState({
    email: true,
    push: true,
    sms: false,
    inApp: true,
  });
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);

  useEffect(() => {
    if (notificationPrefsData?.data?.channels) {
      setNotificationChannels(notificationPrefsData.data.channels);
    }
  }, [notificationPrefsData]);

  useEffect(() => {
    if (user) {
      setProfileForm({
        firstName: user.firstName || "",
        lastName: user.lastName || "",
        username: user.username || "",
      });
    }
  }, [user]);

  useEffect(() => {
    if (!isLoading && !user) {
      router.push("/");
    }
  }, [user, isLoading, router]);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-[#000000] flex items-center justify-center">
        <Loader2 className="animate-spin w-8 h-8 text-[#EDEDED]" />
      </div>
    );
  }

  if (!user) return null;

  const memberSince = dayjs(user.createdAt).fromNow();

  const handleProfileSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    updateProfile.mutate(profileForm, {
      onSuccess: () => {
        toast.success("Profile updated");
        setIsEditingProfile(false);
      },
      onError: (error: any) => toast.error(error?.message || "Update failed"),
    });
  };

  const handleChannelChange = (channel: string, value: boolean) => {
    setNotificationChannels((prev) => ({ ...prev, [channel]: value }));
    setHasUnsavedChanges(true);
  };

  const savePreferences = () => {
    updateNotificationPrefs.mutate(
      {
        channels: notificationChannels,
        types: {},
        quiet_hours: { enabled: false, start: "22:00", end: "08:00", timezone: "UTC" },
      },
      {
        onSuccess: () => {
          setHasUnsavedChanges(false);
          toast.success("Preferences saved");
        },
        onError: () => toast.error("Failed to save preferences"),
      }
    );
  };

  const getVerificationBadges = () => {
    const badges = [];
    if (user.isEmailVerified) {
      badges.push(
        <Badge key="email" className="bg-emerald-500/20 text-emerald-400 border-emerald-500/30 text-xs">
          <Mail className="w-3 h-3 mr-1" />
          Verified
        </Badge>
      );
    }
    if (user.kycCompleted) {
      badges.push(
        <Badge key="kyc" className="bg-violet-500/20 text-violet-400 border-violet-500/30 text-xs">
          <UserCheck className="w-3 h-3 mr-1" />
          KYC
        </Badge>
      );
    }
    if (user.roles?.includes("admin")) {
      badges.push(
        <Badge key="admin" className="bg-indigo-500/20 text-indigo-400 border-indigo-500/30 text-xs">
          <Crown className="w-3 h-3 mr-1" />
          Admin
        </Badge>
      );
    }
    return badges;
  };

  return (
    <div className="min-h-screen bg-[#000000]">
      {/* Background */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[600px] h-[600px] bg-[#1F1F1F]/20 rounded-full blur-[150px]" />
      </div>

      <div className="relative px-4 sm:px-6 py-6 max-w-3xl mx-auto">
        {/* Header */}
        <div className="mb-6">
          <h1 className="text-2xl font-semibold text-[#EDEDED]">Profile</h1>
          <p className="text-[#9A9A9A] text-sm font-light">Manage your account</p>
        </div>

        {/* Profile Card */}
        <div className="p-5 rounded-2xl bg-[#0A0A0A] border border-[#1F1F1F] mb-6">
          <div className="flex items-center gap-4 mb-4">
            <GradientOrbAvatar
              address={user.walletAddress || ""}
              size={64}
              className="border-2 border-[#1F1F1F]"
            />
            <div className="flex-1 min-w-0">
              <h2 className="text-xl font-semibold text-[#EDEDED] truncate">
                {capitalize(user.firstName)} {capitalize(user.lastName)}
              </h2>
              <p className="text-[#9A9A9A] text-sm truncate font-light">@{user.username}</p>
            </div>
          </div>

          {/* Badges */}
          <div className="flex flex-wrap gap-2 mb-4">
            {getVerificationBadges()}
          </div>

          {/* Quick Stats */}
          <div className="grid grid-cols-3 gap-3">
            <div className="text-center p-3 rounded-xl bg-[#151515]">
              <p className="text-xs text-[#9A9A9A] font-light">Member</p>
              <p className="text-sm font-medium text-[#EDEDED]">{memberSince}</p>
            </div>
            <div className="text-center p-3 rounded-xl bg-[#151515]">
              <p className="text-xs text-[#9A9A9A] font-light">Win Rate</p>
              <p className="text-sm font-semibold text-emerald-400">
                {userStats?.winRate ? `${userStats.winRate.toFixed(0)}%` : "0%"}
              </p>
            </div>
            <div className="text-center p-3 rounded-xl bg-[#151515]">
              <p className="text-xs text-[#9A9A9A] font-light">Staked</p>
              <p className="text-sm font-semibold text-cyan-400 flex items-center justify-center gap-1">
                <Image src="/usdc.svg" alt="USDC" width={14} height={14} />
                {numeral(userStats?.totalStaked || 0).format("0,0.000000")}
              </p>
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex gap-2 mb-4">
          {[
            { value: "profile", label: "Profile", icon: User, activeColor: "text-[#EDEDED]", activeBg: "bg-[#151515]" },
            { value: "preferences", label: "Notifications", icon: Bell, activeColor: "text-red-400", activeBg: "bg-red-500/10" },
            { value: "activity", label: "Activity", icon: Activity, activeColor: "text-emerald-400", activeBg: "bg-emerald-500/10" },
          ].map((tab) => (
            <button
              key={tab.value}
              onClick={() => setActiveTab(tab.value as any)}
              className={cn(
                "flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl text-sm font-medium transition-colors",
                activeTab === tab.value
                  ? `${tab.activeBg} ${tab.activeColor}`
                  : "text-[#9A9A9A] hover:text-[#EDEDED] bg-[#0A0A0A]"
              )}
            >
              <tab.icon className="w-4 h-4" />
              <span className="hidden xs:inline">{tab.label}</span>
            </button>
          ))}
        </div>

        {/* Profile Tab */}
        {activeTab === "profile" && (
          <div className="rounded-2xl bg-[#0A0A0A] border border-[#1F1F1F] overflow-hidden">
            <div className="p-4 border-b border-[#1F1F1F] flex items-center justify-between">
              <h3 className="font-medium text-[#EDEDED]">Personal Info</h3>
              {!isEditingProfile ? (
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => setIsEditingProfile(true)}
                  className="h-8 border-[#1F1F1F] text-[#9A9A9A] hover:text-[#EDEDED] hover:bg-[#151515] rounded-lg"
                >
                  <Edit3 className="w-3.5 h-3.5 mr-1" />
                  Edit
                </Button>
              ) : (
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={() => {
                    setIsEditingProfile(false);
                    setProfileForm({
                      firstName: user.firstName || "",
                      lastName: user.lastName || "",
                      username: user.username || "",
                    });
                  }}
                  className="h-8 text-[#9A9A9A] hover:text-[#EDEDED] hover:bg-[#151515]"
                >
                  <X className="w-4 h-4" />
                </Button>
              )}
            </div>

            <form onSubmit={handleProfileSubmit} className="p-4 space-y-4">
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <Label className="text-xs text-[#9A9A9A] font-light">First Name</Label>
                  <Input
                    value={profileForm.firstName}
                    onChange={(e) => setProfileForm({ ...profileForm, firstName: e.target.value })}
                    disabled={!isEditingProfile}
                    className="h-10 bg-[#151515] border-[#1F1F1F] text-[#EDEDED] rounded-xl disabled:opacity-50"
                  />
                </div>
                <div className="space-y-1.5">
                  <Label className="text-xs text-[#9A9A9A] font-light">Last Name</Label>
                  <Input
                    value={profileForm.lastName}
                    onChange={(e) => setProfileForm({ ...profileForm, lastName: e.target.value })}
                    disabled={!isEditingProfile}
                    className="h-10 bg-[#151515] border-[#1F1F1F] text-[#EDEDED] rounded-xl disabled:opacity-50"
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <Label className="text-xs text-[#9A9A9A] font-light">Username</Label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-[#9A9A9A]">@</span>
                  <Input
                    value={profileForm.username}
                    disabled
                    className="h-10 pl-7 bg-[#151515] border-[#1F1F1F] text-[#EDEDED] rounded-xl opacity-50"
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <Label className="text-xs text-[#9A9A9A] font-light">Email</Label>
                <Input
                  value={user.email}
                  disabled
                  className="h-10 bg-[#151515] border-[#1F1F1F] text-[#EDEDED] rounded-xl opacity-50"
                />
              </div>

              {isEditingProfile && (
                <Button
                  type="submit"
                  disabled={updateProfile.isPending}
                  className="w-full h-11 bg-[#EDEDED] hover:bg-[#D8D8D8] text-[#0A0A0A] font-medium rounded-full disabled:opacity-50"
                >
                  {updateProfile.isPending ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Saving...
                    </>
                  ) : (
                    <>
                      <Save className="w-4 h-4 mr-2" />
                      Save Changes
                    </>
                  )}
                </Button>
              )}
            </form>
          </div>
        )}

        {/* Preferences Tab */}
        {activeTab === "preferences" && (
          <div className="rounded-2xl bg-[#0A0A0A] border border-[#1F1F1F] overflow-hidden">
            <div className="p-4 border-b border-[#1F1F1F]">
              <h3 className="font-medium text-[#EDEDED]">Notification Channels</h3>
              <p className="text-xs text-[#9A9A9A] mt-1 font-light">Choose how to receive updates</p>
            </div>

            <div className="p-4 space-y-3">
              {[
                { key: "email", label: "Email", desc: "Get notified via email", icon: Mail, enabled: true, iconColor: "text-blue-400", iconBg: "bg-blue-500/10" },
                { key: "push", label: "Push", desc: "Browser notifications", icon: Bell, enabled: true, iconColor: "text-amber-400", iconBg: "bg-amber-500/10" },
                { key: "inApp", label: "In-App", desc: "Notifications in app", icon: Activity, enabled: true, iconColor: "text-emerald-400", iconBg: "bg-emerald-500/10" },
                { key: "sms", label: "SMS", desc: "Coming soon", icon: Mail, enabled: false, iconColor: "text-[#9A9A9A]", iconBg: "bg-[#151515]" },
              ].map((channel) => (
                <div
                  key={channel.key}
                  className={cn(
                    "flex items-center justify-between p-3 rounded-xl bg-[#151515] border border-[#1F1F1F]",
                    !channel.enabled && "opacity-50"
                  )}
                >
                  <div className="flex items-center gap-3">
                    <div className={`p-2 rounded-lg ${channel.iconBg}`}>
                      <channel.icon className={`w-4 h-4 ${channel.iconColor}`} />
                    </div>
                    <div>
                      <p className="text-sm font-medium text-[#EDEDED]">{channel.label}</p>
                      <p className="text-xs text-[#9A9A9A] font-light">{channel.desc}</p>
                    </div>
                  </div>
                  <Switch
                    checked={notificationChannels[channel.key as keyof typeof notificationChannels]}
                    onCheckedChange={(checked) => handleChannelChange(channel.key, checked)}
                    disabled={!channel.enabled}
                    className="data-[state=checked]:bg-[#EDEDED]"
                  />
                </div>
              ))}

              {hasUnsavedChanges && (
                <Button
                  onClick={savePreferences}
                  disabled={updateNotificationPrefs.isPending}
                  className="w-full h-11 mt-4 bg-[#EDEDED] hover:bg-[#D8D8D8] text-[#0A0A0A] font-medium rounded-full disabled:opacity-50"
                >
                  {updateNotificationPrefs.isPending ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Saving...
                    </>
                  ) : (
                    <>
                      <Save className="w-4 h-4 mr-2" />
                      Save Preferences
                    </>
                  )}
                </Button>
              )}
            </div>
          </div>
        )}

        {/* Activity Tab */}
        {activeTab === "activity" && (
          <div className="space-y-4">
            {/* Stats */}
            <div className="grid grid-cols-3 gap-3">
              <div className="p-3 rounded-xl bg-cyan-500/10 border border-cyan-500/20 text-center">
                <Trophy className="w-4 h-4 text-cyan-400 mx-auto mb-1" />
                <p className="text-lg font-semibold text-[#EDEDED] flex items-center justify-center gap-1">
                  <Image src="/usdc.svg" alt="USDC" width={16} height={16} />
                  {numeral(userStats?.totalStaked || 0).format("0,0.000000")}
                </p>
                <p className="text-xs text-[#9A9A9A] font-light">Total</p>
              </div>
              <div className="p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-center">
                <CheckCircle className="w-4 h-4 text-emerald-400 mx-auto mb-1" />
                <p className="text-lg font-semibold text-[#EDEDED]">{userStats?.wonStakes || 0}</p>
                <p className="text-xs text-[#9A9A9A] font-light">Won</p>
              </div>
              <div className="p-3 rounded-xl bg-amber-500/10 border border-amber-500/20 text-center">
                <Star className="w-4 h-4 text-amber-400 mx-auto mb-1" />
                <p className="text-lg font-semibold text-[#EDEDED]">{userStats?.activeStakes || 0}</p>
                <p className="text-xs text-[#9A9A9A] font-light">Active</p>
              </div>
            </div>

            {/* Recent Stakes */}
            <div className="rounded-2xl bg-[#0A0A0A] border border-[#1F1F1F] overflow-hidden">
              <div className="p-4 border-b border-[#1F1F1F]">
                <h3 className="font-medium text-[#EDEDED]">Recent Activity</h3>
              </div>

              <div className="p-4">
                {stakesData?.data?.docs?.length > 0 ? (
                  <div className="space-y-2">
                    {stakesData.data.docs.slice(0, 5).map((stake: any) => (
                      <div
                        key={stake.id}
                        className="flex items-center justify-between p-3 rounded-xl bg-[#151515] border border-[#1F1F1F]"
                      >
                        <div className="flex items-center gap-3">
                          <div
                            className={cn(
                              "p-2 rounded-lg",
                              stake.status === "won"
                                ? "bg-emerald-500/20"
                                : stake.status === "lost"
                                ? "bg-red-500/20"
                                : "bg-[#1F1F1F]"
                            )}
                          >
                            <Trophy
                              className={cn(
                                "w-4 h-4",
                                stake.status === "won"
                                  ? "text-emerald-400"
                                  : stake.status === "lost"
                                  ? "text-red-400"
                                  : "text-[#9A9A9A]"
                              )}
                            />
                          </div>
                          <div className="min-w-0">
                            <p className="text-sm font-medium text-[#EDEDED] truncate max-w-[180px]">
                              {stake.poll?.title || "Prediction"}
                            </p>
                            <p className="text-xs text-[#9A9A9A] font-light flex items-center gap-1">
                              <Image src="/usdc.svg" alt="USDC" width={10} height={10} />
                              {numeral(stake.amount).format("0,0.000000")} • {dayjs(stake.createdAt).fromNow()}
                            </p>
                          </div>
                        </div>
                        <Badge
                          className={cn(
                            "capitalize text-xs",
                            stake.status === "won"
                              ? "bg-emerald-500/20 text-emerald-400 border-emerald-500/30"
                              : stake.status === "lost"
                              ? "bg-red-500/20 text-red-400 border-red-500/30"
                              : "bg-[#1F1F1F] text-[#9A9A9A] border-[#1F1F1F]"
                          )}
                        >
                          {stake.status}
                        </Badge>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <Activity className="w-10 h-10 text-[#9A9A9A]/50 mx-auto mb-3" />
                    <p className="text-[#9A9A9A] text-sm">No activity yet</p>
                    <p className="text-[#9A9A9A]/60 text-xs mt-1 font-light">Make a prediction to get started</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
