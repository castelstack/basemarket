"use client";

import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
import {
  usePlatformFeatures,
  usePlatformFees,
  usePlatformLimits,
  usePlatformSettings,
  useResetPlatformDefaults,
  useUpdateMaintenance,
  useUpdatePlatformSettings,
  type PlatformSettings,
} from "@/lib/platform-settings";
import { useAuthStore } from "@/stores/authStore";
import { cn } from "@/lib/utils";
import {
  AlertTriangle,
  Banknote,
  Bell,
  Crown,
  DollarSign,
  Loader2,
  Mail,
  MessageSquare,
  RotateCcw,
  Save,
  Settings,
  TrendingUp,
  Trophy,
  Zap,
} from "lucide-react";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { toast } from "sonner";

export default function PlatformSettingsPage() {
  const { isAdmin } = useAuthStore();
  const router = useRouter();
  const [activeTab, setActiveTab] = useState("general");
  const [formData, setFormData] = useState<Partial<PlatformSettings>>({});
  const [maintenanceMessage, setMaintenanceMessage] = useState("");

  const { data: settingsData, isLoading } = usePlatformSettings();
  const { data: feesData } = usePlatformFees();
  const { data: limitsData } = usePlatformLimits();

  const updateSettingsMutation = useUpdatePlatformSettings();
  const resetDefaultsMutation = useResetPlatformDefaults();
  const updateMaintenanceMutation = useUpdateMaintenance();

  useEffect(() => {
    if (!isAdmin) router.push("/dashboard");
  }, [isAdmin, router]);

  useEffect(() => {
    if (settingsData?.data) {
      setFormData(settingsData.data);
      setMaintenanceMessage(settingsData.data.maintenanceMessage || "");
    }
  }, [settingsData]);

  const handleInputChange = (field: keyof PlatformSettings, value: any) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleCustomSettingChange = (field: string, value: any) => {
    setFormData((prev) => ({
      ...prev,
      customSettings: { ...prev.customSettings, [field]: value },
    }));
  };

  const handleSaveSettings = () => {
    const { id, createdAt, updatedAt, lastUpdatedBy, ...cleanFormData } = formData as any;
    updateSettingsMutation.mutate(cleanFormData, {
      onSuccess: () => toast.success("Settings updated"),
      onError: () => toast.error("Failed to update settings"),
    });
  };

  const handleResetDefaults = () => {
    resetDefaultsMutation.mutate(undefined, {
      onSuccess: () => toast.success("Settings reset to defaults"),
      onError: () => toast.error("Failed to reset settings"),
    });
  };

  const handleToggleMaintenance = () => {
    const newMode = !formData.maintenanceMode;
    updateMaintenanceMutation.mutate(
      {
        maintenanceMode: newMode,
        maintenanceMessage: maintenanceMessage || "System is under maintenance.",
      },
      {
        onSuccess: () => {
          setFormData((prev) => ({ ...prev, maintenanceMode: newMode }));
          toast.success(newMode ? "Maintenance enabled" : "Maintenance disabled");
        },
        onError: () => toast.error("Failed to update maintenance mode"),
      }
    );
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <Loader2 className="w-8 h-8 text-violet-400 animate-spin" />
      </div>
    );
  }

  if (!isAdmin) return null;

  const tabs = [
    { value: "general", label: "General", icon: Settings },
    { value: "fees", label: "Fees", icon: DollarSign },
    { value: "limits", label: "Limits", icon: TrendingUp },
    { value: "features", label: "Features", icon: Zap },
    { value: "notifications", label: "Alerts", icon: Bell },
  ];

  return (
    <div className="min-h-screen bg-black">
      {/* Background */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[600px] h-[600px] bg-violet-600/10 rounded-full blur-[120px]" />
      </div>

      <div className="relative px-4 sm:px-6 py-6 max-w-3xl mx-auto">
        {/* Header */}
        <div className="mb-6">
          <div className="flex items-center gap-2 mb-2">
            <Badge className="bg-violet-500/20 text-violet-400 border-violet-500/30 text-xs">
              <Crown className="w-3 h-3 mr-1" />
              Admin
            </Badge>
          </div>
          <h1 className="text-2xl font-black text-white">Settings</h1>
          <p className="text-gray-500 text-sm">Platform configuration</p>
        </div>

        {/* Maintenance Alert */}
        {formData.maintenanceMode && (
          <div className="p-3 rounded-xl bg-amber-500/10 border border-amber-500/30 mb-6">
            <div className="flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 text-amber-400" />
              <span className="text-sm text-amber-400 font-medium">Maintenance Mode Active</span>
            </div>
          </div>
        )}

        {/* Quick Stats */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-6">
          {[
            { label: "Platform Fee", value: `${feesData?.data?.platformFeePercentage || 0}%`, icon: DollarSign, color: "text-emerald-400" },
            { label: "Withdrawal Fee", value: `${feesData?.data?.withdrawalFeePercentage || 0}%`, icon: Banknote, color: "text-violet-400" },
            { label: "Min Stake", value: `${limitsData?.data?.minStakeAmount || 0} USDC`, icon: TrendingUp, color: "text-indigo-400" },
            { label: "Max Stake", value: `${limitsData?.data?.maxStakeAmount || 0} USDC`, icon: Trophy, color: "text-amber-400" },
          ].map((stat) => (
            <div key={stat.label} className="p-3 rounded-xl bg-white/[0.03] border border-white/[0.06]">
              <div className="flex items-center justify-between mb-1">
                <stat.icon className={`w-4 h-4 ${stat.color}`} />
              </div>
              <p className="text-xs text-gray-500">{stat.label}</p>
              <p className="text-lg font-bold text-white">{stat.value}</p>
            </div>
          ))}
        </div>

        {/* Tabs */}
        <div className="flex gap-1 p-1 rounded-xl bg-white/[0.03] border border-white/[0.06] mb-6 overflow-x-auto">
          {tabs.map((tab) => (
            <button
              key={tab.value}
              onClick={() => setActiveTab(tab.value)}
              className={cn(
                "flex-1 flex items-center justify-center gap-1.5 py-2 px-2 rounded-lg text-xs font-medium transition-colors whitespace-nowrap min-w-fit",
                activeTab === tab.value
                  ? "bg-violet-500/20 text-violet-400"
                  : "text-gray-500 hover:text-white"
              )}
            >
              <tab.icon className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">{tab.label}</span>
            </button>
          ))}
        </div>

        {/* Tab Content */}
        {activeTab === "general" && (
          <div className="space-y-4">
            <Card className="bg-white/[0.03] border-white/[0.06]">
              <CardHeader className="pb-3">
                <CardTitle className="text-white text-base">General Settings</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-1.5">
                  <Label className="text-sm text-gray-300">Default Currency</Label>
                  <Input
                    value={formData.defaultCurrency || ""}
                    onChange={(e) => handleInputChange("defaultCurrency", e.target.value)}
                    className="h-10 bg-white/[0.03] border-white/[0.06] text-white rounded-xl"
                    placeholder="USDC"
                  />
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1.5">
                    <Label className="text-sm text-gray-300">Poll Duration (hrs)</Label>
                    <Input
                      type="number"
                      value={formData.pollDurationHours || ""}
                      onChange={(e) => handleInputChange("pollDurationHours", parseInt(e.target.value))}
                      className="h-10 bg-white/[0.03] border-white/[0.06] text-white rounded-xl"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <Label className="text-sm text-gray-300">Max Polls/User</Label>
                    <Input
                      type="number"
                      value={formData.maxPollsPerUser || ""}
                      onChange={(e) => handleInputChange("maxPollsPerUser", parseInt(e.target.value))}
                      className="h-10 bg-white/[0.03] border-white/[0.06] text-white rounded-xl"
                    />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-white/[0.03] border-white/[0.06]">
              <CardHeader className="pb-3">
                <CardTitle className="text-white text-base">Maintenance Mode</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-white">Enable Maintenance</p>
                    <p className="text-xs text-gray-500">Disable user access during updates</p>
                  </div>
                  <Switch
                    checked={formData.maintenanceMode || false}
                    onCheckedChange={handleToggleMaintenance}
                    className="data-[state=checked]:bg-violet-500"
                  />
                </div>
                <div className="space-y-1.5">
                  <Label className="text-sm text-gray-300">Message</Label>
                  <Textarea
                    value={maintenanceMessage}
                    onChange={(e) => setMaintenanceMessage(e.target.value)}
                    className="bg-white/[0.03] border-white/[0.06] text-white rounded-xl min-h-[80px]"
                    placeholder="System under maintenance..."
                  />
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {activeTab === "fees" && (
          <Card className="bg-white/[0.03] border-white/[0.06]">
            <CardHeader className="pb-3">
              <CardTitle className="text-white text-base">Fee Configuration</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-1.5">
                <Label className="text-sm text-gray-300">Platform Fee (%)</Label>
                <Input
                  type="number"
                  step="0.1"
                  value={formData.platformFeePercentage || ""}
                  onChange={(e) => handleInputChange("platformFeePercentage", parseFloat(e.target.value))}
                  className="h-10 bg-white/[0.03] border-white/[0.06] text-white rounded-xl"
                />
                <p className="text-xs text-gray-500">Fee on winning stakes</p>
              </div>
              <div className="space-y-1.5">
                <Label className="text-sm text-gray-300">Withdrawal Fee (%)</Label>
                <Input
                  type="number"
                  step="0.1"
                  value={formData.withdrawalFeePercentage || ""}
                  onChange={(e) => handleInputChange("withdrawalFeePercentage", parseFloat(e.target.value))}
                  className="h-10 bg-white/[0.03] border-white/[0.06] text-white rounded-xl"
                />
                <p className="text-xs text-gray-500">Fee on withdrawals</p>
              </div>
            </CardContent>
          </Card>
        )}

        {activeTab === "limits" && (
          <Card className="bg-white/[0.03] border-white/[0.06]">
            <CardHeader className="pb-3">
              <CardTitle className="text-white text-base">Transaction Limits</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <Label className="text-sm text-gray-300">Min Stake (USDC)</Label>
                  <Input
                    type="number"
                    step="0.0001"
                    value={formData.minStakeAmount || ""}
                    onChange={(e) => handleInputChange("minStakeAmount", parseFloat(e.target.value))}
                    className="h-10 bg-white/[0.03] border-white/[0.06] text-white rounded-xl"
                  />
                </div>
                <div className="space-y-1.5">
                  <Label className="text-sm text-gray-300">Max Stake (USDC)</Label>
                  <Input
                    type="number"
                    step="0.0001"
                    value={formData.maxStakeAmount || ""}
                    onChange={(e) => handleInputChange("maxStakeAmount", parseFloat(e.target.value))}
                    className="h-10 bg-white/[0.03] border-white/[0.06] text-white rounded-xl"
                  />
                </div>
              </div>
              <div className="space-y-1.5">
                <Label className="text-sm text-gray-300">Min Withdrawal (USDC)</Label>
                <Input
                  type="number"
                  step="0.0001"
                  value={formData.minWithdrawalAmount || ""}
                  onChange={(e) => handleInputChange("minWithdrawalAmount", parseFloat(e.target.value))}
                  className="h-10 bg-white/[0.03] border-white/[0.06] text-white rounded-xl"
                />
              </div>
            </CardContent>
          </Card>
        )}

        {activeTab === "features" && (
          <Card className="bg-white/[0.03] border-white/[0.06]">
            <CardHeader className="pb-3">
              <CardTitle className="text-white text-base">Feature Toggles</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {[
                { key: "stakingEnabled", label: "Staking", desc: "Allow users to stake" },
                { key: "withdrawalsEnabled", label: "Withdrawals", desc: "Allow fund withdrawals" },
                { key: "pollCreationEnabled", label: "Poll Creation", desc: "Allow new polls" },
                { key: "registrationEnabled", label: "Registration", desc: "Allow new signups" },
              ].map((feature) => (
                <div
                  key={feature.key}
                  className="flex items-center justify-between p-3 rounded-xl bg-white/[0.02] border border-white/[0.05]"
                >
                  <div>
                    <p className="text-sm text-white font-medium">{feature.label}</p>
                    <p className="text-xs text-gray-500">{feature.desc}</p>
                  </div>
                  <Switch
                    checked={(formData as any)[feature.key] || false}
                    onCheckedChange={(checked) => handleInputChange(feature.key as any, checked)}
                    className="data-[state=checked]:bg-violet-500"
                  />
                </div>
              ))}
            </CardContent>
          </Card>
        )}

        {activeTab === "notifications" && (
          <Card className="bg-white/[0.03] border-white/[0.06]">
            <CardHeader className="pb-3">
              <CardTitle className="text-white text-base">Notification Settings</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {[
                { key: "emailNotifications", label: "Email Notifications", icon: Mail, color: "text-violet-400" },
                { key: "smsNotifications", label: "SMS Notifications", icon: MessageSquare, color: "text-indigo-400" },
              ].map((notif) => (
                <div
                  key={notif.key}
                  className="flex items-center justify-between p-3 rounded-xl bg-white/[0.02] border border-white/[0.05]"
                >
                  <div className="flex items-center gap-3">
                    <notif.icon className={`w-4 h-4 ${notif.color}`} />
                    <span className="text-sm text-white">{notif.label}</span>
                  </div>
                  <Switch
                    checked={formData.customSettings?.[notif.key as keyof typeof formData.customSettings] || false}
                    onCheckedChange={(checked) => handleCustomSettingChange(notif.key, checked)}
                    className="data-[state=checked]:bg-violet-500"
                  />
                </div>
              ))}
              <div className="grid grid-cols-2 gap-3 pt-3 border-t border-white/[0.05]">
                <div className="space-y-1.5">
                  <Label className="text-sm text-gray-300">Max Login Attempts</Label>
                  <Input
                    type="number"
                    value={formData.customSettings?.maxLoginAttempts || ""}
                    onChange={(e) => handleCustomSettingChange("maxLoginAttempts", parseInt(e.target.value))}
                    className="h-10 bg-white/[0.03] border-white/[0.06] text-white rounded-xl"
                  />
                </div>
                <div className="space-y-1.5">
                  <Label className="text-sm text-gray-300">Session Timeout (s)</Label>
                  <Input
                    type="number"
                    value={formData.customSettings?.sessionTimeout || ""}
                    onChange={(e) => handleCustomSettingChange("sessionTimeout", parseInt(e.target.value))}
                    className="h-10 bg-white/[0.03] border-white/[0.06] text-white rounded-xl"
                  />
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Action Buttons */}
        <div className="flex gap-3 mt-6">
          <Button
            onClick={handleSaveSettings}
            disabled={updateSettingsMutation.isPending}
            className="flex-1 h-11 bg-gradient-to-r from-violet-500 to-indigo-500 hover:from-violet-600 hover:to-indigo-600 font-bold rounded-xl"
          >
            {updateSettingsMutation.isPending ? (
              <><Loader2 className="w-4 h-4 mr-2 animate-spin" />Saving...</>
            ) : (
              <><Save className="w-4 h-4 mr-2" />Save</>
            )}
          </Button>

          <AlertDialog>
            <AlertDialogTrigger asChild>
              <Button
                variant="outline"
                className="h-11 px-4 border-amber-500/30 text-amber-400 hover:bg-amber-500/10 rounded-xl"
              >
                <RotateCcw className="w-4 h-4" />
              </Button>
            </AlertDialogTrigger>
            <AlertDialogContent className="bg-gray-900 border-white/10 max-w-sm mx-4">
              <AlertDialogHeader>
                <AlertDialogTitle className="text-white">Reset Settings?</AlertDialogTitle>
                <AlertDialogDescription className="text-gray-400">
                  This will reset all settings to defaults. Cannot be undone.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>Cancel</AlertDialogCancel>
                <AlertDialogAction
                  onClick={handleResetDefaults}
                  className="bg-amber-500 hover:bg-amber-600 text-white"
                >
                  {resetDefaultsMutation.isPending ? "Resetting..." : "Reset"}
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        </div>
      </div>
    </div>
  );
}
