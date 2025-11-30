'use client';

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
} from '@/components/ui/alert-dialog';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Textarea } from '@/components/ui/textarea';
import {
  usePlatformFeatures,
  usePlatformFees,
  usePlatformLimits,
  usePlatformSettings,
  useResetPlatformDefaults,
  useUpdateMaintenance,
  useUpdatePlatformSettings,
  type PlatformSettings
} from '@/lib/platform-settings';
import { useAuthStore } from '@/stores/authStore';
import {
  AlertTriangle,
  Banknote,
  Bell,
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
} from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { toast } from 'sonner';

export default function PlatformSettingsPage() {
  const { isAdmin, user } = useAuthStore();
  const router = useRouter();
  const [activeTab, setActiveTab] = useState('general');
  const [formData, setFormData] = useState<Partial<PlatformSettings>>({});
  const [maintenanceMessage, setMaintenanceMessage] = useState('');

  // API hooks
  const { data: settingsData, isLoading: isLoadingSettings } =
    usePlatformSettings();
  const { data: feesData } = usePlatformFees();
  const { data: limitsData } = usePlatformLimits();
  const { data: featuresData } = usePlatformFeatures();

  const updateSettingsMutation = useUpdatePlatformSettings();
  const resetDefaultsMutation = useResetPlatformDefaults();
  const updateMaintenanceMutation = useUpdateMaintenance();

  // Redirect if not admin
  useEffect(() => {
    if (!isAdmin) {
      router.push('/dashboard');
    }
  }, [isAdmin, router]);

  // Initialize form data when settings are loaded
  useEffect(() => {
    if (settingsData?.data) {
      setFormData(settingsData.data);
      setMaintenanceMessage(settingsData.data.maintenanceMessage || '');
    }
  }, [settingsData]);

  const handleInputChange = (field: keyof PlatformSettings, value: any) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const handleCustomSettingChange = (field: string, value: any) => {
    setFormData((prev) => ({
      ...prev,
      customSettings: {
        ...prev.customSettings,
        [field]: value,
      },
    }));
  };

  const handleSaveSettings = () => {
    // Remove server-generated fields before submitting
    const { id, createdAt, updatedAt, lastUpdatedBy, ...cleanFormData } =
      formData as any;

    updateSettingsMutation.mutate(cleanFormData, {
      onSuccess: () => {
        toast.success('Platform settings updated successfully! 🎉');
      },
      onError: () => {
        toast.error('Failed to update settings. Please try again.');
      },
    });
  };

  const handleResetDefaults = () => {
    resetDefaultsMutation.mutate(undefined, {
      onSuccess: () => {
        toast.success('Settings reset to defaults! 🔄');
      },
      onError: () => {
        toast.error('Failed to reset settings. Please try again.');
      },
    });
  };

  const handleToggleMaintenance = () => {
    const newMaintenanceMode = !formData.maintenanceMode;
    updateMaintenanceMutation.mutate(
      {
        maintenanceMode: newMaintenanceMode,
        maintenanceMessage:
          maintenanceMessage ||
          'System is under maintenance. Please check back later.',
      },
      {
        onSuccess: () => {
          setFormData((prev) => ({
            ...prev,
            maintenanceMode: newMaintenanceMode,
          }));
          toast.success(
            newMaintenanceMode
              ? 'Maintenance mode enabled! 🔧'
              : 'Maintenance mode disabled! ✅'
          );
        },
        onError: () => {
          toast.error('Failed to update maintenance mode.');
        },
      }
    );
  };

  if (isLoadingSettings) {
    return (
      <div className='min-h-screen bg-black flex items-center justify-center'>
        <Loader2 className='w-8 h-8 text-violet-500 animate-spin' />
      </div>
    );
  }

  if (!isAdmin) {
    return null;
  }

  return (
    <div className='min-h-screen bg-black py-8 px-4'>
      <div className='max-w-7xl mx-auto'>
        {/* Header */}
        <div className='mb-8'>
          <h1 className='text-3xl sm:text-4xl font-black mb-2'>
            <span className='bg-gradient-to-r from-violet-400 to-pink-400 bg-clip-text text-transparent'>
              Platform Settings
            </span>
          </h1>
          <p className='text-gray-400'>
            Configure global platform settings and features
          </p>
        </div>

        {/* Maintenance Mode Alert */}
        {formData.maintenanceMode && (
          <div className='mb-6 p-4 rounded-xl bg-amber-500/10 border border-amber-500/30'>
            <div className='flex items-start gap-3'>
              <AlertTriangle className='w-5 h-5 text-amber-400 flex-shrink-0 mt-0.5' />
              <div>
                <p className='text-amber-400 font-medium'>
                  Maintenance Mode Active
                </p>
                <p className='text-gray-400 text-sm mt-1'>
                  The platform is currently in maintenance mode. Users cannot
                  access most features.
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Quick Stats */}
        <div className='grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8'>
          <Card className='bg-white/5 border-white/10'>
            <CardContent className='p-4'>
              <div className='flex items-center justify-between'>
                <div>
                  <p className='text-gray-400 text-sm'>Platform Fee</p>
                  <p className='text-2xl font-bold text-white'>
                    {feesData?.data?.platformFeePercentage || 0}%
                  </p>
                </div>
                <DollarSign className='w-8 h-8 text-emerald-400' />
              </div>
            </CardContent>
          </Card>

          <Card className='bg-white/5 border-white/10'>
            <CardContent className='p-4'>
              <div className='flex items-center justify-between'>
                <div>
                  <p className='text-gray-400 text-sm'>Withdrawal Fee</p>
                  <p className='text-2xl font-bold text-white'>
                    {feesData?.data?.withdrawalFeePercentage || 0}%
                  </p>
                </div>
                <Banknote className='w-8 h-8 text-pink-400' />
              </div>
            </CardContent>
          </Card>

          <Card className='bg-white/5 border-white/10'>
            <CardContent className='p-4'>
              <div className='flex items-center justify-between'>
                <div>
                  <p className='text-gray-400 text-sm'>Min Stake</p>
                  <p className='text-2xl font-bold text-white'>
                    ₦{limitsData?.data?.minStakeAmount || 0}
                  </p>
                </div>
                <TrendingUp className='w-8 h-8 text-violet-400' />
              </div>
            </CardContent>
          </Card>

          <Card className='bg-white/5 border-white/10'>
            <CardContent className='p-4'>
              <div className='flex items-center justify-between'>
                <div>
                  <p className='text-gray-400 text-sm'>Max Stake</p>
                  <p className='text-2xl font-bold text-white'>
                    {limitsData?.data?.maxStakeAmount || 0}
                  </p>
                </div>
                <Trophy className='w-8 h-8 text-amber-400' />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Settings Tabs */}
        <Tabs
          value={activeTab}
          onValueChange={setActiveTab}
          className='space-y-6'
        >
          {/* Mobile Select */}
          <div className='sm:hidden'>
            <select
              value={activeTab}
              onChange={(e) => setActiveTab(e.target.value)}
              className='w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white appearance-none cursor-pointer focus:outline-none focus:border-violet-500/50'
              style={{
                backgroundImage: `url("data:image/svg+xml;charset=UTF-8,%3csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='none' stroke='white' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'%3e%3cpolyline points='6 9 12 15 18 9'%3e%3c/polyline%3e%3c/svg%3e")`,
                backgroundRepeat: 'no-repeat',
                backgroundPosition: 'right 1rem center',
                backgroundSize: '1.5em 1.5em',
                paddingRight: '3rem',
              }}
            >
              <option value='general' className='bg-black'>
                ⚙️ General Settings
              </option>
              <option value='fees' className='bg-black'>
                💰 Fees Configuration
              </option>
              <option value='limits' className='bg-black'>
                📊 Transaction Limits
              </option>
              <option value='features' className='bg-black'>
                ⚡ Features
              </option>
              <option value='notifications' className='bg-black'>
                🔔 Notifications
              </option>
            </select>
          </div>

          {/* Desktop Tabs */}
          <TabsList className='hidden sm:flex bg-white/5 border border-white/10 h-auto p-1 gap-1'>
            <TabsTrigger
              value='general'
              className='data-[state=active]:bg-violet-500/20 flex-1 text-sm'
            >
              <Settings className='w-4 h-4 mr-2' />
              General
            </TabsTrigger>
            <TabsTrigger
              value='fees'
              className='data-[state=active]:bg-violet-500/20 flex-1 text-sm'
            >
              <DollarSign className='w-4 h-4 mr-2' />
              Fees
            </TabsTrigger>
            <TabsTrigger
              value='limits'
              className='data-[state=active]:bg-violet-500/20 flex-1 text-sm'
            >
              <TrendingUp className='w-4 h-4 mr-2' />
              Limits
            </TabsTrigger>
            <TabsTrigger
              value='features'
              className='data-[state=active]:bg-violet-500/20 flex-1 text-sm'
            >
              <Zap className='w-4 h-4 mr-2' />
              Features
            </TabsTrigger>
            <TabsTrigger
              value='notifications'
              className='data-[state=active]:bg-violet-500/20 flex-1 text-sm'
            >
              <Bell className='w-4 h-4 mr-2' />
              Notifications
            </TabsTrigger>
          </TabsList>

          {/* General Settings */}
          <TabsContent value='general' className='space-y-6'>
            <Card className='bg-white/5 border-white/10'>
              <CardHeader>
                <CardTitle>General Settings</CardTitle>
                <CardDescription>
                  Configure basic platform settings
                </CardDescription>
              </CardHeader>
              <CardContent className='space-y-6'>
                <div className='space-y-2'>
                  <Label>Default Currency</Label>
                  <Input
                    value={formData.defaultCurrency || ''}
                    onChange={(e) =>
                      handleInputChange('defaultCurrency', e.target.value)
                    }
                    className='bg-white/5 border-white/10'
                    placeholder='NGN'
                  />
                </div>

                <div className='space-y-2'>
                  <Label>Poll Duration (Hours)</Label>
                  <Input
                    type='number'
                    value={formData.pollDurationHours || ''}
                    onChange={(e) =>
                      handleInputChange(
                        'pollDurationHours',
                        parseInt(e.target.value)
                      )
                    }
                    className='bg-white/5 border-white/10'
                    placeholder='24'
                  />
                </div>

                <div className='space-y-2'>
                  <Label>Max Polls Per User</Label>
                  <Input
                    type='number'
                    value={formData.maxPollsPerUser || ''}
                    onChange={(e) =>
                      handleInputChange(
                        'maxPollsPerUser',
                        parseInt(e.target.value)
                      )
                    }
                    className='bg-white/5 border-white/10'
                    placeholder='10'
                  />
                </div>

                <div className='space-y-2'>
                  <Label>Max Winners Per Poll</Label>
                  <Input
                    type='number'
                    value={formData.maxWinnersPerPoll || ''}
                    onChange={(e) =>
                      handleInputChange(
                        'maxWinnersPerPoll',
                        parseInt(e.target.value)
                      )
                    }
                    className='bg-white/5 border-white/10'
                    placeholder='3'
                  />
                </div>
              </CardContent>
            </Card>

            {/* Maintenance Mode */}
            <Card className='bg-white/5 border-white/10'>
              <CardHeader>
                <CardTitle>Maintenance Mode</CardTitle>
                <CardDescription>Control platform availability</CardDescription>
              </CardHeader>
              <CardContent className='space-y-6'>
                <div className='flex items-center justify-between'>
                  <div className='space-y-1'>
                    <Label>Maintenance Mode</Label>
                    <p className='text-sm text-gray-400'>
                      Enable to prevent user access during updates
                    </p>
                  </div>
                  <Switch
                    checked={formData.maintenanceMode || false}
                    onCheckedChange={handleToggleMaintenance}
                    className='data-[state=checked]:bg-violet-500'
                  />
                </div>

                <div className='space-y-2'>
                  <Label>Maintenance Message</Label>
                  <Textarea
                    value={maintenanceMessage}
                    onChange={(e) => setMaintenanceMessage(e.target.value)}
                    className='bg-white/5 border-white/10 min-h-[100px]'
                    placeholder='System is under maintenance. Please check back later.'
                  />
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Fees Settings */}
          <TabsContent value='fees' className='space-y-6'>
            <Card className='bg-white/5 border-white/10'>
              <CardHeader>
                <CardTitle>Fee Configuration</CardTitle>
                <CardDescription>
                  Set platform and transaction fees
                </CardDescription>
              </CardHeader>
              <CardContent className='space-y-6'>
                <div className='space-y-2'>
                  <Label>Platform Fee Percentage</Label>
                  <div className='relative'>
                    <Input
                      type='number'
                      step='0.1'
                      value={formData.platformFeePercentage || ''}
                      onChange={(e) =>
                        handleInputChange(
                          'platformFeePercentage',
                          parseFloat(e.target.value)
                        )
                      }
                      className='bg-white/5 border-white/10 pr-12'
                      placeholder='10'
                    />
                    <span className='absolute right-4 top-1/2 -translate-y-1/2 text-gray-400'>
                      %
                    </span>
                  </div>
                  <p className='text-xs text-gray-500'>
                    Fee charged on winning stakes
                  </p>
                </div>

                <div className='space-y-2'>
                  <Label>Withdrawal Fee Percentage</Label>
                  <div className='relative'>
                    <Input
                      type='number'
                      step='0.1'
                      value={formData.withdrawalFeePercentage || ''}
                      onChange={(e) =>
                        handleInputChange(
                          'withdrawalFeePercentage',
                          parseFloat(e.target.value)
                        )
                      }
                      className='bg-white/5 border-white/10 pr-12'
                      placeholder='2.5'
                    />
                    <span className='absolute right-4 top-1/2 -translate-y-1/2 text-gray-400'>
                      %
                    </span>
                  </div>
                  <p className='text-xs text-gray-500'>
                    Fee charged on withdrawals
                  </p>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Limits Settings */}
          <TabsContent value='limits' className='space-y-6'>
            <Card className='bg-white/5 border-white/10'>
              <CardHeader>
                <CardTitle>Transaction Limits</CardTitle>
                <CardDescription>
                  Set minimum and maximum transaction amounts
                </CardDescription>
              </CardHeader>
              <CardContent className='space-y-6'>
                <div className='grid grid-cols-1 md:grid-cols-2 gap-6'>
                  <div className='space-y-2'>
                    <Label>Minimum Stake Amount</Label>
                    <div className='relative'>
                      <span className='absolute left-4 top-1/2 -translate-y-1/2 text-gray-400'>
                        ₦
                      </span>
                      <Input
                        type='number'
                        value={formData.minStakeAmount || ''}
                        onChange={(e) =>
                          handleInputChange(
                            'minStakeAmount',
                            parseInt(e.target.value)
                          )
                        }
                        className='bg-white/5 border-white/10 pl-10'
                        placeholder='100'
                      />
                    </div>
                  </div>

                  <div className='space-y-2'>
                    <Label>Maximum Stake Amount</Label>
                    <div className='relative'>
                      <span className='absolute left-4 top-1/2 -translate-y-1/2 text-gray-400'>
                        ₦
                      </span>
                      <Input
                        type='number'
                        value={formData.maxStakeAmount || ''}
                        onChange={(e) =>
                          handleInputChange(
                            'maxStakeAmount',
                            parseInt(e.target.value)
                          )
                        }
                        className='bg-white/5 border-white/10 pl-10'
                        placeholder='1000000'
                      />
                    </div>
                  </div>

                  <div className='space-y-2'>
                    <Label>Minimum Withdrawal Amount</Label>
                    <div className='relative'>
                      <span className='absolute left-4 top-1/2 -translate-y-1/2 text-gray-400'>
                        ₦
                      </span>
                      <Input
                        type='number'
                        value={formData.minWithdrawalAmount || ''}
                        onChange={(e) =>
                          handleInputChange(
                            'minWithdrawalAmount',
                            parseInt(e.target.value)
                          )
                        }
                        className='bg-white/5 border-white/10 pl-10'
                        placeholder='1000'
                      />
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Features Settings */}
          <TabsContent value='features' className='space-y-6'>
            <Card className='bg-white/5 border-white/10'>
              <CardHeader>
                <CardTitle>Feature Toggles</CardTitle>
                <CardDescription>
                  Enable or disable platform features
                </CardDescription>
              </CardHeader>
              <CardContent className='space-y-6'>
                <div className='space-y-4'>
                  <div className='flex items-center justify-between p-4 rounded-lg bg-white/5'>
                    <div className='space-y-1'>
                      <Label className='text-base'>Staking</Label>
                      <p className='text-sm text-gray-400'>
                        Allow users to stake on predictions
                      </p>
                    </div>
                    <Switch
                      checked={formData.stakingEnabled || false}
                      onCheckedChange={(checked) =>
                        handleInputChange('stakingEnabled', checked)
                      }
                      className='data-[state=checked]:bg-emerald-500'
                    />
                  </div>

                  <div className='flex items-center justify-between p-4 rounded-lg bg-white/5'>
                    <div className='space-y-1'>
                      <Label className='text-base'>Withdrawals</Label>
                      <p className='text-sm text-gray-400'>
                        Allow users to withdraw funds
                      </p>
                    </div>
                    <Switch
                      checked={formData.withdrawalsEnabled || false}
                      onCheckedChange={(checked) =>
                        handleInputChange('withdrawalsEnabled', checked)
                      }
                      className='data-[state=checked]:bg-emerald-500'
                    />
                  </div>

                  <div className='flex items-center justify-between p-4 rounded-lg bg-white/5'>
                    <div className='space-y-1'>
                      <Label className='text-base'>Poll Creation</Label>
                      <p className='text-sm text-gray-400'>
                        Allow admins to create new polls
                      </p>
                    </div>
                    <Switch
                      checked={formData.pollCreationEnabled || false}
                      onCheckedChange={(checked) =>
                        handleInputChange('pollCreationEnabled', checked)
                      }
                      className='data-[state=checked]:bg-emerald-500'
                    />
                  </div>

                  <div className='flex items-center justify-between p-4 rounded-lg bg-white/5'>
                    <div className='space-y-1'>
                      <Label className='text-base'>Registration</Label>
                      <p className='text-sm text-gray-400'>
                        Allow new user registrations
                      </p>
                    </div>
                    <Switch
                      checked={formData.registrationEnabled || false}
                      onCheckedChange={(checked) =>
                        handleInputChange('registrationEnabled', checked)
                      }
                      className='data-[state=checked]:bg-emerald-500'
                    />
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Notification Settings */}
          <TabsContent value='notifications' className='space-y-6'>
            <Card className='bg-white/5 border-white/10'>
              <CardHeader>
                <CardTitle>Notification Settings</CardTitle>
                <CardDescription>
                  Configure notification preferences
                </CardDescription>
              </CardHeader>
              <CardContent className='space-y-6'>
                <div className='space-y-4'>
                  <div className='flex items-center justify-between p-4 rounded-lg bg-white/5'>
                    <div className='flex items-center gap-3'>
                      <Mail className='w-5 h-5 text-violet-400' />
                      <div className='space-y-1'>
                        <Label className='text-base'>Email Notifications</Label>
                        <p className='text-sm text-gray-400'>
                          Send email notifications to users
                        </p>
                      </div>
                    </div>
                    <Switch
                      checked={
                        formData.customSettings?.emailNotifications || false
                      }
                      onCheckedChange={(checked) =>
                        handleCustomSettingChange('emailNotifications', checked)
                      }
                      className='data-[state=checked]:bg-violet-500'
                    />
                  </div>

                  <div className='flex items-center justify-between p-4 rounded-lg bg-white/5'>
                    <div className='flex items-center gap-3'>
                      <MessageSquare className='w-5 h-5 text-pink-400' />
                      <div className='space-y-1'>
                        <Label className='text-base'>SMS Notifications</Label>
                        <p className='text-sm text-gray-400'>
                          Send SMS notifications to users
                        </p>
                      </div>
                    </div>
                    <Switch
                      checked={
                        formData.customSettings?.smsNotifications || false
                      }
                      onCheckedChange={(checked) =>
                        handleCustomSettingChange('smsNotifications', checked)
                      }
                      className='data-[state=checked]:bg-pink-500'
                    />
                  </div>
                </div>

                <div className='space-y-4 pt-4 border-t border-white/10'>
                  <div className='space-y-2'>
                    <Label>Max Login Attempts</Label>
                    <Input
                      type='number'
                      value={formData.customSettings?.maxLoginAttempts || ''}
                      onChange={(e) =>
                        handleCustomSettingChange(
                          'maxLoginAttempts',
                          parseInt(e.target.value)
                        )
                      }
                      className='bg-white/5 border-white/10'
                      placeholder='5'
                    />
                    <p className='text-xs text-gray-500'>
                      Number of failed login attempts before account lock
                    </p>
                  </div>

                  <div className='space-y-2'>
                    <Label>Session Timeout (seconds)</Label>
                    <Input
                      type='number'
                      value={formData.customSettings?.sessionTimeout || ''}
                      onChange={(e) =>
                        handleCustomSettingChange(
                          'sessionTimeout',
                          parseInt(e.target.value)
                        )
                      }
                      className='bg-white/5 border-white/10'
                      placeholder='3600'
                    />
                    <p className='text-xs text-gray-500'>
                      Time before user session expires
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        {/* Action Buttons */}
        <div className='flex flex-col sm:flex-row gap-4 mt-8'>
          <Button
            onClick={handleSaveSettings}
            disabled={updateSettingsMutation.isPending}
            className='flex-1 bg-gradient-to-r from-violet-500 to-pink-500 hover:from-violet-600 hover:to-pink-600'
          >
            {updateSettingsMutation.isPending ? (
              <>
                <Loader2 className='mr-2 h-4 w-4 animate-spin' />
                Saving...
              </>
            ) : (
              <>
                <Save className='mr-2 h-4 w-4' />
                Save Settings
              </>
            )}
          </Button>

          <AlertDialog>
            <AlertDialogTrigger asChild>
              <Button
                variant='outline'
                className='flex-1 border-amber-500/20 text-amber-400 hover:bg-amber-500/10'
              >
                <RotateCcw className='mr-2 h-4 w-4' />
                Reset to Defaults
              </Button>
            </AlertDialogTrigger>
            <AlertDialogContent className='bg-black/95 border-white/10'>
              <AlertDialogHeader>
                <AlertDialogTitle>Reset to Default Settings?</AlertDialogTitle>
                <AlertDialogDescription>
                  This will reset all platform settings to their default values.
                  This action cannot be undone.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel className='border-white/20 text-gray-400 hover:bg-white/10'>
                  Cancel
                </AlertDialogCancel>
                <AlertDialogAction
                  onClick={handleResetDefaults}
                  className='bg-gradient-to-r from-amber-500 to-orange-500'
                >
                  {resetDefaultsMutation.isPending ? (
                    <>
                      <Loader2 className='mr-2 h-4 w-4 animate-spin' />
                      Resetting...
                    </>
                  ) : (
                    'Reset Settings'
                  )}
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        </div>
      </div>
    </div>
  );
}
