'use client';

import { Badge } from '@/components/ui/badge';
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
import { apiClient } from '@/lib/api';
import { capitalize } from '@/lib/capitalize';
import {
  useNotificationPreferences,
  useUpdateNotificationPreferences,
} from '@/lib/notifications';
import { useMyStakes } from '@/lib/stakes';
import {
  useUpdateEmail,
  useUpdatePassword,
  useUpdateProfile,
  useUserProfile,
  useUserStatistics
} from '@/lib/user';
import { cn } from '@/lib/utils';
import { useAuthStore } from '@/stores/authStore';
import dayjs from 'dayjs';
import relativeTime from 'dayjs/plugin/relativeTime';
import {
  Activity,
  AlertCircle,
  Bell,
  CheckCircle,
  Crown,
  Edit3,
  Globe,
  KeyRound,
  Loader2,
  Lock,
  Mail,
  Save,
  Settings,
  Shield,
  Star,
  Trophy,
  User,
  UserCheck,
  Wallet,
  X
} from 'lucide-react';
import { useRouter } from 'next/navigation';
import numeral from 'numeral';
import { useEffect, useMemo, useState } from 'react';
import { toast } from 'sonner';

// Initialize dayjs plugins
dayjs.extend(relativeTime);

export default function ProfilePage() {
  const router = useRouter();
  const { logout } = useAuthStore();
  const { data: userResponse, isLoading } = useUserProfile();
  const user = userResponse?.data;
  const { data: userStatsResponse } = useUserStatistics();
  const userStats = userStatsResponse?.data;
  const { data: stakesData } = useMyStakes();
  const { data: notificationPrefsData } = useNotificationPreferences();
  const updateNotificationPrefs = useUpdateNotificationPreferences();

  const updateProfile = useUpdateProfile();
  const updateEmail = useUpdateEmail();
  const updatePassword = useUpdatePassword();

  const [isEditingProfile, setIsEditingProfile] = useState(false);
  const [profileForm, setProfileForm] = useState({
    firstName: '',
    lastName: '',
    username: '',
  });

  const [emailForm, setEmailForm] = useState({
    email: '',
    password: '',
  });

  const [passwordForm, setPasswordForm] = useState({
    password: '',
    newPassword: '',
    confirmPassword: '',
  });

  const [showNewPassword, setShowNewPassword] = useState(false);

  // Notification preferences state - simplified to match backend format
  const [notificationChannels, setNotificationChannels] = useState({
    email: true,
    push: true,
    sms: false,
    inApp: true,
  });

  // Initialize notification preferences from API data
  useEffect(() => {
    if (notificationPrefsData?.data?.channels) {
      setNotificationChannels(notificationPrefsData.data.channels);
    }
  }, [notificationPrefsData]);

  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);

  // Password strength calculator
  const passwordStrength = useMemo(() => {
    const pass = passwordForm.newPassword;
    if (!pass) return { score: 0, label: 'Enter password', color: 'gray' };

    let score = 0;
    const checks = {
      length: pass.length >= 8,
      uppercase: /[A-Z]/.test(pass),
      lowercase: /[a-z]/.test(pass),
      number: /[0-9]/.test(pass),
      special: /[@?#&%$!*(),.":{}|<>^~`\-_+=\[\]\\\/;']/.test(pass),
    };

    if (checks.length) score++;
    if (pass.length >= 10) score++;
    if (checks.uppercase) score++;
    if (checks.lowercase) score++;
    if (checks.number) score++;
    if (checks.special) score++;

    if (score <= 2)
      return { score: 1, label: 'Weak', color: 'red', percentage: 25 };
    if (score <= 3)
      return { score: 2, label: 'Fair', color: 'orange', percentage: 50 };
    if (score <= 5)
      return { score: 3, label: 'Good', color: 'amber', percentage: 75 };
    return { score: 4, label: 'Strong', color: 'emerald', percentage: 100 };
  }, [passwordForm.newPassword]);

  // Initialize forms when user data loads
  useEffect(() => {
    if (user) {
      setProfileForm({
        firstName: user.firstName || '',
        lastName: user.lastName || '',
        username: user.username || '',
      });
      setEmailForm({
        email: user.email || '',
        password: '',
      });
    }
  }, [user]);

  useEffect(() => {
    if (!isLoading && !user) {
      router.push('/login');
    }
  }, [user, isLoading, router]);

  // Load preferences from API is handled by useNotificationPreferences hook

  if (isLoading) {
    return (
      <div className='min-h-screen bg-black flex items-center justify-center'>
        <Loader2 className='animate-spin w-8 h-8 text-violet-400' />
      </div>
    );
  }

  if (!user) {
    return null;
  }

  // Avatar with gradient border
  const avatarUrl =
    user.picture ||
    `https://ui-avatars.com/api/?name=${encodeURIComponent(
      user.firstName + ' ' + user.lastName
    )}&background=7c3aed&color=fff&bold=true`;

  const handleProfileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setProfileForm({ ...profileForm, [e.target.name]: e.target.value });
  };

  const handleProfileSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    updateProfile.mutate(profileForm, {
      onSuccess: () => {
        toast.success('Profile updated successfully! 🎉');
        setIsEditingProfile(false);
      },
      onError: (error: any) => toast.error(error?.message || 'Update failed'),
    });
  };

  const handleEmailSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!emailForm.password) {
      toast.error('Enter your current password to update email');
      return;
    }
    const lowercaseEmailForm = {
      ...emailForm,
      email: emailForm.email.toLowerCase(),
    };
    updateEmail.mutate(lowercaseEmailForm, {
      onSuccess: () => {
        toast.success('Email updated! Check your inbox to verify 📧');
        setEmailForm({ ...emailForm, password: '' });
      },
      onError: (error: any) => toast.error(error?.message || 'Update failed'),
    });
  };

  const handlePasswordSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      toast.error("New passwords don't match!");
      return;
    }
    if (passwordForm.newPassword.length < 8) {
      toast.error('New password must be at least 8 characters');
      return;
    }
    updatePassword.mutate(passwordForm, {
      onSuccess: () => {
        toast.success(
          'Password updated successfully! Please login with your new password.'
        );
        setPasswordForm({
          password: '',
          newPassword: '',
          confirmPassword: '',
        });
        // Clear access token and log out user
        setTimeout(() => {
          apiClient.setToken(null); // Clear the access token
          logout(); // Clear auth store
          router.push('/login');
        }, 1500);
      },
      onError: (error: any) => toast.error(error?.message || 'Update failed'),
    });
  };

  const handleChannelChange = (channel: string, value: boolean) => {
    setNotificationChannels((prev) => ({
      ...prev,
      [channel]: value,
    }));
    setHasUnsavedChanges(true);
  };

  const savePreferences = () => {
    const preferencesData = {
      channels: notificationChannels,
      types: {},
      quiet_hours: {
        enabled: false,
        start: "22:00",
        end: "08:00", 
        timezone: "WAT"
      }
    };

    updateNotificationPrefs.mutate(preferencesData, {
      onSuccess: () => {
        setHasUnsavedChanges(false);
        toast.success('Notification preferences saved successfully!');
      },
      onError: () => {
        toast.error('Failed to save preferences');
      },
    });
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    toast.success('Copied to clipboard!');
  };

  const getVerificationBadges = () => {
    const badges = [];

    if (user.isEmailVerified) {
      badges.push(
        <Badge
          key='email'
          className='bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
        >
          <Mail className='w-3 h-3 mr-1' />
          Email Verified
        </Badge>
      );
    }

    // Phone verification disabled for now
    // if (user.isPhoneVerified) {
    //   badges.push(
    //     <Badge
    //       key='phone'
    //       className='bg-blue-500/20 text-blue-400 border border-blue-500/30'
    //     >
    //       <Phone className='w-3 h-3 mr-1' />
    //       Phone Verified
    //     </Badge>
    //   );
    // }

    if (user.kycCompleted) {
      badges.push(
        <Badge
          key='kyc'
          className='bg-violet-500/20 text-violet-400 border border-violet-500/30'
        >
          <UserCheck className='w-3 h-3 mr-1' />
          KYC Complete
        </Badge>
      );
    }


    // if (user.isTwoFactorAuthEnabled) {
    //   badges.push(
    //     <Badge
    //       key='2fa'
    //       className='bg-amber-500/20 text-amber-400 border border-amber-500/30'
    //     >
    //       <ShieldCheck className='w-3 h-3 mr-1' />
    //       2FA Enabled
    //     </Badge>
    //   );
    // }

    if (user.roles?.includes('admin')) {
      badges.push(
        <Badge
          key='admin'
          className='bg-gradient-to-r from-pink-500/20 to-violet-500/20 text-pink-400 border border-pink-500/30'
        >
          <Crown className='w-3 h-3 mr-1' />
          Admin
        </Badge>
      );
    }

    return badges;
  };

  // Helper function to format numbers with k/m
  const formatNumber = (num: number) => {
    if (num >= 1000000) {
      return numeral(num).format('0.0a').toUpperCase();
    } else if (num >= 1000) {
      return numeral(num).format('0.0a');
    }
    return numeral(num).format('0,0');
  };

  // Calculate member since using dayjs
  const memberSince = dayjs(user.createdAt).fromNow();
  const accountAge = dayjs().diff(dayjs(user.createdAt), 'day');
  return (
    <div className='min-h-screen bg-black'>
      {/* Background Effects */}
      <div className='fixed inset-0 bg-gradient-to-br from-violet-950/20 via-black to-pink-950/20' />
      <div className='fixed inset-0 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-purple-900/20 via-transparent to-transparent' />

      <div className='relative max-w-6xl mx-auto px-3 sm:px-4 md:px-6 lg:px-8 py-4 sm:py-6 md:py-8'>
        {/* Header */}
        <div className='mb-4 sm:mb-6 md:mb-8'>
          <h1 className='text-3xl sm:text-4xl font-black mb-1 sm:mb-2'>
            <span className='bg-gradient-to-r from-violet-400 via-pink-400 to-orange-400 bg-clip-text text-transparent'>
              Your Profile
            </span>
          </h1>
          <p className='text-gray-400'>
            Manage your account and security settings
          </p>
        </div>

        {/* Profile Header Card */}
        <Card className='bg-gradient-to-br from-violet-900/30 via-purple-900/30 to-pink-900/30 border-white/10 backdrop-blur-xl mb-8 overflow-hidden'>
          <div className='absolute inset-0 bg-gradient-to-br from-violet-500/5 to-pink-500/5' />
          <CardContent className='relative p-8'>
            <div className='flex flex-col md:flex-row gap-8 items-center md:items-start'>
              {/* Avatar Section */}
              <div className='relative group'>
                <div className='relative'>
                  <div className='absolute inset-0 bg-gradient-to-br from-violet-500 to-pink-500 rounded-full blur-xl opacity-50 group-hover:opacity-75 transition-opacity' />
                  <img
                    src={avatarUrl}
                    alt={`${capitalize(user?.firstName)} ${capitalize(
                      user?.lastName
                    )} profile picture`}
                    className='relative w-32 h-32 rounded-full border-4 border-white/20 shadow-2xl'
                    loading='lazy'
                  />
                </div>
              </div>

              {/* Profile Info */}
              <div className='flex-1 text-center md:text-left'>
                <div className='mb-4'>
                  <h2 className='text-3xl font-bold text-white mb-2'>
                    {capitalize(user.firstName)} {capitalize(user.lastName)}
                  </h2>
                  <div className='flex flex-wrap items-center gap-3 justify-center md:justify-start'>
                    <span className='text-gray-400'>@{user.username}</span>
                    <span className='text-gray-600'>•</span>
                    <span className='text-gray-400'>{user.email}</span>
                  </div>
                </div>

                {/* Verification Badges */}
                <div className='flex flex-wrap gap-2 mb-6 justify-center md:justify-start'>
                  {getVerificationBadges()}
                </div>

                {/* Stats */}
                <div className='grid grid-cols-3 gap-4 max-w-md mx-auto md:mx-0'>
                  <div className='text-center md:text-left'>
                    <p className='text-gray-400 text-sm'>Member Since</p>
                    <p className='text-white font-bold'>{memberSince}</p>
                  </div>
                  <div className='text-center md:text-left'>
                    <p className='text-gray-400 text-sm'>Win Rate</p>
                    <p className='text-emerald-400 font-bold'>
                      {userStats?.winRate
                        ? `${userStats.winRate.toFixed(1)}%`
                        : '0%'}
                    </p>
                  </div>
                  <div className='text-center md:text-left'>
                    <p className='text-gray-400 text-sm'>Total Staked</p>
                    <p className='text-violet-400 font-bold'>
                      ₦{formatNumber(userStats?.totalStaked || 0)}
                    </p>
                  </div>
                </div>
              </div>

              {/* Quick Actions */}
              <div className='flex flex-col gap-2'>
                <Button
                  variant='outline'
                  className='border-white/20 text-white hover:bg-white/10 rounded-xl'
                  onClick={() => router.push('/wallet')}
                >
                  <Wallet className='w-4 h-4 mr-2' />
                  View Wallet
                </Button>
                <Button
                  variant='outline'
                  className='border-white/20 text-white hover:bg-white/10 rounded-xl'
                  onClick={() => router.push('/dashboard')}
                >
                  <Activity className='w-4 h-4 mr-2' />
                  Dashboard
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Settings Tabs */}
        <Tabs defaultValue='profile' className='space-y-6'>
          <TabsList className='bg-white/5 border border-white/10 p-1 flex-wrap h-auto'>
            <TabsTrigger
              value='profile'
              className='data-[state=active]:bg-white/10'
            >
              <User className='w-4 h-4 mr-2' />
              Profile
            </TabsTrigger>
            <TabsTrigger
              value='security'
              className='data-[state=active]:bg-white/10'
            >
              <Shield className='w-4 h-4 mr-2' />
              Security
            </TabsTrigger>
            <TabsTrigger
              value='preferences'
              className='data-[state=active]:bg-white/10'
            >
              <Settings className='w-4 h-4 mr-2' />
              Preferences
            </TabsTrigger>
            <TabsTrigger
              value='activity'
              className='data-[state=active]:bg-white/10'
            >
              <Activity className='w-4 h-4 mr-2' />
              Activity
            </TabsTrigger>
          </TabsList>

          {/* Profile Tab */}
          <TabsContent value='profile'>
            <Card className='bg-white/5 backdrop-blur-sm border-white/10'>
              <CardHeader>
                <div className='flex items-center justify-between'>
                  <div>
                    <CardTitle className='text-white'>
                      Personal Information
                    </CardTitle>
                    <CardDescription className='text-gray-400'>
                      Update your personal details
                    </CardDescription>
                  </div>
                  {!isEditingProfile ? (
                    <Button
                      variant='outline'
                      onClick={() => setIsEditingProfile(true)}
                      className='border-white/20 text-white hover:bg-white/10 rounded-xl'
                    >
                      <Edit3 className='w-4 h-4 mr-2' />
                      Edit
                    </Button>
                  ) : (
                    <div className='flex gap-2'>
                      <Button
                        variant='ghost'
                        onClick={() => {
                          setIsEditingProfile(false);
                          setProfileForm({
                            firstName: user.firstName || '',
                            lastName: user.lastName || '',
                            username: user.username || '',
                          });
                        }}
                        className='text-gray-400 hover:text-white'
                      >
                        <X className='w-4 h-4' />
                      </Button>
                    </div>
                  )}
                </div>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleProfileSubmit} className='space-y-6'>
                  <div className='grid grid-cols-1 md:grid-cols-2 gap-6'>
                    <div className='space-y-2'>
                      <Label className='text-gray-300'>First Name</Label>
                      <Input
                        name='firstName'
                        value={profileForm.firstName}
                        onChange={handleProfileChange}
                        disabled={!isEditingProfile}
                        className='bg-white/5 border-white/10 text-white disabled:opacity-50 rounded-xl'
                      />
                    </div>
                    <div className='space-y-2'>
                      <Label className='text-gray-300'>Last Name</Label>
                      <Input
                        name='lastName'
                        value={profileForm.lastName}
                        onChange={handleProfileChange}
                        disabled={!isEditingProfile}
                        className='bg-white/5 border-white/10 text-white disabled:opacity-50 rounded-xl'
                      />
                    </div>
                  </div>

                  <div className='space-y-2'>
                    <Label className='text-gray-300'>Username</Label>
                    <div className='relative'>
                      <span className='absolute left-3 top-1/2 -translate-y-1/2 text-gray-500'>
                        @
                      </span>
                      <Input
                        name='username'
                        disabled
                        value={profileForm.username}
                        onChange={handleProfileChange}
                        className='bg-white/5 border-white/10 text-white disabled:opacity-50 rounded-xl pl-8'
                      />
                    </div>
                    <p className='text-xs text-gray-500'>
                      Your unique username for the platform
                    </p>
                  </div>

                  {isEditingProfile && (
                    <Button
                      type='submit'
                      disabled={updateProfile.isPending}
                      className='w-full bg-gradient-to-r from-violet-500 to-pink-500 hover:from-violet-600 hover:to-pink-600 font-bold rounded-xl'
                    >
                      {updateProfile.isPending ? (
                        <>
                          <Loader2 className='mr-2 h-4 w-4 animate-spin' />
                          Saving...
                        </>
                      ) : (
                        <>
                          <Save className='mr-2 w-4 h-4' />
                          Save Changes
                        </>
                      )}
                    </Button>
                  )}
                </form>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Security Tab */}
          <TabsContent value='security'>
            <div className='space-y-6'>
              {/* Password Change */}
              <Card className='bg-white/5 backdrop-blur-sm border-white/10'>
                <CardHeader>
                  <CardTitle className='text-white'>Change Password</CardTitle>
                  <CardDescription className='text-gray-400'>
                    Keep your account secure with a strong password
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <form onSubmit={handlePasswordSubmit} className='space-y-4'>
                    <div className='space-y-2'>
                      <Label className='text-gray-300'>Current Password</Label>
                      <Input
                        type='password'
                        value={passwordForm.password}
                        onChange={(e) =>
                          setPasswordForm({
                            ...passwordForm,
                            password: e.target.value,
                          })
                        }
                        className='bg-white/5 border-white/10 text-white rounded-xl'
                      />
                    </div>
                    <div className='space-y-2'>
                      <Label className='text-gray-300'>New Password</Label>
                      <div className='relative'>
                        <Input
                          type={showNewPassword ? 'text' : 'password'}
                          value={passwordForm.newPassword}
                          onChange={(e) =>
                            setPasswordForm({
                              ...passwordForm,
                              newPassword: e.target.value,
                            })
                          }
                          className='bg-white/5 border-white/10 text-white rounded-xl pr-12'
                        />
                        <button
                          type='button'
                          onClick={() => setShowNewPassword(!showNewPassword)}
                          className='absolute right-4 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-white transition-colors'
                        >
                          {showNewPassword ? '👁️' : '👁️‍🗨️'}
                        </button>
                      </div>

                      {/* Password Requirements */}
                      {passwordForm.newPassword && (
                        <div className='space-y-2 p-3 rounded-lg bg-white/5 border border-white/10'>
                          <div className='flex items-center justify-between mb-2'>
                            <span className='text-xs text-gray-400'>
                              Strength
                            </span>
                            <span
                              className={`text-xs font-medium ${
                                passwordStrength.color === 'red'
                                  ? 'text-red-400'
                                  : passwordStrength.color === 'orange'
                                  ? 'text-orange-400'
                                  : passwordStrength.color === 'amber'
                                  ? 'text-amber-400'
                                  : 'text-emerald-400'
                              }`}
                            >
                              {passwordStrength.label}
                            </span>
                          </div>
                          <div className='w-full h-1.5 bg-white/10 rounded-full overflow-hidden'>
                            <div
                              className={`h-full transition-all duration-300 ${
                                passwordStrength.color === 'red'
                                  ? 'bg-red-500'
                                  : passwordStrength.color === 'orange'
                                  ? 'bg-orange-500'
                                  : passwordStrength.color === 'amber'
                                  ? 'bg-amber-500'
                                  : 'bg-emerald-500'
                              }`}
                              style={{
                                width: `${passwordStrength.percentage}%`,
                              }}
                            />
                          </div>
                          <div className='grid grid-cols-2 gap-x-2 gap-y-1 mt-2 text-xs'>
                            <div
                              className={`flex items-center gap-1 ${
                                passwordForm.newPassword.length >= 8
                                  ? 'text-emerald-400'
                                  : 'text-gray-500'
                              }`}
                            >
                              {passwordForm.newPassword.length >= 8 ? '✓' : '○'}{' '}
                              8+ chars
                            </div>
                            <div
                              className={`flex items-center gap-1 ${
                                /[A-Z]/.test(passwordForm.newPassword) &&
                                /[a-z]/.test(passwordForm.newPassword)
                                  ? 'text-emerald-400'
                                  : 'text-gray-500'
                              }`}
                            >
                              {/[A-Z]/.test(passwordForm.newPassword) &&
                              /[a-z]/.test(passwordForm.newPassword)
                                ? '✓'
                                : '○'}{' '}
                              Aa
                            </div>
                            <div
                              className={`flex items-center gap-1 ${
                                /[0-9]/.test(passwordForm.newPassword)
                                  ? 'text-emerald-400'
                                  : 'text-gray-500'
                              }`}
                            >
                              {/[0-9]/.test(passwordForm.newPassword)
                                ? '✓'
                                : '○'}{' '}
                              123
                            </div>
                            <div
                              className={`flex items-center gap-1 ${
                                /[@?#&%$!*(),.":{}|<>^~`\-_+=\[\]\\\/;']/.test(
                                  passwordForm.newPassword
                                )
                                  ? 'text-emerald-400'
                                  : 'text-gray-500'
                              }`}
                            >
                              {/[@?#&%$!*(),.":{}|<>^~`\-_+=\[\]\\\/;']/.test(
                                passwordForm.newPassword
                              )
                                ? '✓'
                                : '○'}{' '}
                              !@#
                            </div>
                          </div>
                        </div>
                      )}
                    </div>
                    <div className='space-y-2'>
                      <Label className='text-gray-300'>
                        Confirm New Password
                      </Label>
                      <div className='relative'>
                        <Input
                          type={showNewPassword ? 'text' : 'password'}
                          value={passwordForm.confirmPassword}
                          onChange={(e) =>
                            setPasswordForm({
                              ...passwordForm,
                              confirmPassword: e.target.value,
                            })
                          }
                          className='bg-white/5 border-white/10 text-white rounded-xl pr-12'
                        />
                        <button
                          type='button'
                          onClick={() => setShowNewPassword(!showNewPassword)}
                          className='absolute right-4 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-white transition-colors'
                        >
                          {showNewPassword ? '👁️' : '👁️‍🗨️'}
                        </button>
                      </div>
                      {passwordForm.confirmPassword &&
                        passwordForm.newPassword !==
                          passwordForm.confirmPassword && (
                          <p className='text-pink-400 text-xs flex items-center gap-1'>
                            <AlertCircle className='w-3 h-3' />
                            Passwords don&apos;t match
                          </p>
                        )}
                    </div>
                    <Button
                      type='submit'
                      disabled={updatePassword.isPending}
                      className='bg-gradient-to-r from-violet-500 to-pink-500 hover:from-violet-600 hover:to-pink-600 font-bold rounded-xl'
                    >
                      {updatePassword.isPending ? (
                        <>
                          <Loader2 className='mr-2 h-4 w-4 animate-spin' />
                          Updating...
                        </>
                      ) : (
                        <>
                          <Lock className='mr-2 w-4 h-4' />
                          Update Password
                        </>
                      )}
                    </Button>
                  </form>
                </CardContent>
              </Card>

              {/* Account Security Info */}
              <Card className='bg-white/5 backdrop-blur-sm border-white/10'>
                <CardHeader>
                  <CardTitle className='text-white'>Account Security</CardTitle>
                  <CardDescription className='text-gray-400'>
                    Your account security status
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className='space-y-4'>
                    {/* Email Verification Status */}
                    <div className='flex items-center justify-between p-4 rounded-xl bg-white/5 border border-white/10'>
                      <div className='flex items-center gap-3'>
                        <div
                          className={cn(
                            'p-3 rounded-xl',
                            user.isEmailVerified
                              ? 'bg-emerald-500/20'
                              : 'bg-amber-500/20'
                          )}
                        >
                          <Mail
                            className={cn(
                              'w-6 h-6',
                              user.isEmailVerified
                                ? 'text-emerald-400'
                                : 'text-amber-400'
                            )}
                          />
                        </div>
                        <div>
                          <p className='text-white font-medium'>
                            Email Verification
                          </p>
                          <p className='text-gray-400 text-sm'>
                            {user.isEmailVerified
                              ? 'Your email is verified'
                              : 'Please verify your email address'}
                          </p>
                        </div>
                      </div>
                      {user.isEmailVerified ? (
                        <CheckCircle className='w-5 h-5 text-emerald-400' />
                      ) : (
                        <AlertCircle className='w-5 h-5 text-amber-400' />
                      )}
                    </div>

                    {/* Account Age */}
                    <div className='flex items-center justify-between p-4 rounded-xl bg-white/5 border border-white/10'>
                      <div className='flex items-center gap-3'>
                        <div className='p-3 rounded-xl bg-violet-500/20'>
                          <Shield className='w-6 h-6 text-violet-400' />
                        </div>
                        <div>
                          <p className='text-white font-medium'>Account Age</p>
                          <p className='text-gray-400 text-sm'>
                            Member for {accountAge} days
                          </p>
                        </div>
                      </div>
                      <Badge className='bg-violet-500/20 text-violet-400 border border-violet-500/30'>
                        {accountAge > 365
                          ? 'Veteran'
                          : accountAge > 90
                          ? 'Regular'
                          : accountAge > 30
                          ? 'Active'
                          : 'New'}
                      </Badge>
                    </div>

                    {/* Last Password Change */}
                    <div className='flex items-center justify-between p-4 rounded-xl bg-white/5 border border-white/10'>
                      <div className='flex items-center gap-3'>
                        <div className='p-3 rounded-xl bg-blue-500/20'>
                          <KeyRound className='w-6 h-6 text-blue-400' />
                        </div>
                        <div>
                          <p className='text-white font-medium'>
                            Password Strength
                          </p>
                          <p className='text-gray-400 text-sm'>
                            Keep your account secure with a strong password
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Preferences Tab */}
          <TabsContent value='preferences' className='space-y-6'>
            {/* Notification Preferences */}
            <Card className='bg-white/5 backdrop-blur-sm border-white/10'>
              <CardHeader>
                <CardTitle className='text-white flex items-center gap-2'>
                  <Bell className='w-5 h-5 text-violet-400' />
                  Notification Preferences
                </CardTitle>
                <CardDescription className='text-gray-400'>
                  Choose how you want to be notified
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className='space-y-6'>
                  {/* Notification Channels */}
                  <div className='space-y-4'>
                    <h4 className='text-white font-medium'>
                      Notification Channels
                    </h4>

                    {/* Email Channel */}
                    <div className='flex items-center justify-between p-4 rounded-xl bg-white/5 border border-white/10'>
                      <div className='flex items-center gap-3'>
                        <Mail className='w-5 h-5 text-blue-400' />
                        <div>
                          <p className='text-white font-medium'>
                            Email Notifications
                          </p>
                          <p className='text-gray-400 text-sm'>
                            Receive notifications via email
                          </p>
                        </div>
                      </div>
                      <Switch
                        checked={notificationChannels.email}
                        onCheckedChange={(checked) =>
                          handleChannelChange('email', checked)
                        }
                        className='data-[state=checked]:bg-violet-500'
                      />
                    </div>

                    {/* Push Channel */}
                    <div className='flex items-center justify-between p-4 rounded-xl bg-white/5 border border-white/10'>
                      <div className='flex items-center gap-3'>
                        <Bell className='w-5 h-5 text-violet-400' />
                        <div>
                          <p className='text-white font-medium'>
                            Push Notifications
                          </p>
                          <p className='text-gray-400 text-sm'>
                            Browser and mobile push notifications
                          </p>
                        </div>
                      </div>
                      <Switch
                        checked={notificationChannels.push}
                        onCheckedChange={(checked) =>
                          handleChannelChange('push', checked)
                        }
                        className='data-[state=checked]:bg-violet-500'
                      />
                    </div>

                    {/* In-App Channel */}
                    <div className='flex items-center justify-between p-4 rounded-xl bg-white/5 border border-white/10'>
                      <div className='flex items-center gap-3'>
                        <Activity className='w-5 h-5 text-emerald-400' />
                        <div>
                          <p className='text-white font-medium'>
                            In-App Notifications
                          </p>
                          <p className='text-gray-400 text-sm'>
                            Notifications within the app
                          </p>
                        </div>
                      </div>
                      <Switch
                        checked={notificationChannels.inApp}
                        onCheckedChange={(checked) =>
                          handleChannelChange('inApp', checked)
                        }
                        className='data-[state=checked]:bg-violet-500'
                      />
                    </div>

                    {/* SMS Channel - Disabled */}
                    <div className='flex items-center justify-between p-4 rounded-xl bg-white/5 border border-white/10 opacity-50'>
                      <div className='flex items-center gap-3'>
                        <Globe className='w-5 h-5 text-gray-400' />
                        <div>
                          <p className='text-white font-medium'>
                            SMS Notifications
                          </p>
                          <p className='text-gray-400 text-sm'>
                            Text message notifications (Coming soon)
                          </p>
                        </div>
                      </div>
                      <Switch
                        checked={false}
                        disabled
                        className='cursor-not-allowed'
                      />
                    </div>
                  </div>

                  {/* Save Button */}
                  {hasUnsavedChanges && (
                    <div className='flex justify-end pt-4 border-t border-white/10'>
                      <Button
                        onClick={savePreferences}
                        disabled={updateNotificationPrefs.isPending}
                        className='bg-gradient-to-r from-violet-500 to-pink-500 hover:from-violet-600 hover:to-pink-600 font-bold rounded-xl'
                      >
                        {updateNotificationPrefs.isPending ? (
                          <>
                            <Loader2 className='mr-2 h-4 w-4 animate-spin' />
                            Saving...
                          </>
                        ) : (
                          <>
                            <Save className='mr-2 w-4 h-4' />
                            Save Preferences
                          </>
                        )}
                      </Button>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Activity Tab */}
          <TabsContent value='activity'>
            <Card className='bg-white/5 backdrop-blur-sm border-white/10'>
              <CardHeader>
                <CardTitle className='text-white flex items-center gap-2'>
                  <Activity className='w-5 h-5 text-violet-400' />
                  Account Activity
                </CardTitle>
                <CardDescription className='text-gray-400'>
                  Recent activity and login history
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className='space-y-6'>
                  {/* Activity Stats */}
                  <div className='grid grid-cols-1 md:grid-cols-3 gap-4'>
                    <div className='p-4 rounded-xl bg-gradient-to-br from-violet-500/10 to-purple-500/10 border border-violet-500/20'>
                      <div className='flex items-center gap-3 mb-2'>
                        <Trophy className='w-5 h-5 text-violet-400' />
                        <p className='text-gray-400 text-sm'>Total Stakes</p>
                      </div>
                      <p className='text-2xl font-bold text-white'>
                        {userStats?.totalStaked || 0}
                      </p>
                    </div>
                    <div className='p-4 rounded-xl bg-gradient-to-br from-emerald-500/10 to-teal-500/10 border border-emerald-500/20'>
                      <div className='flex items-center gap-3 mb-2'>
                        <CheckCircle className='w-5 h-5 text-emerald-400' />
                        <p className='text-gray-400 text-sm'>Lost Stakes</p>
                      </div>
                      <p className='text-2xl font-bold text-white'>
                        {userStats?.lostStakes || 0}
                      </p>
                    </div>
                    <div className='p-4 rounded-xl bg-gradient-to-br from-amber-500/10 to-orange-500/10 border border-amber-500/20'>
                      <div className='flex items-center gap-3 mb-2'>
                        <Star className='w-5 h-5 text-amber-400' />
                        <p className='text-gray-400 text-sm'>Active Stakes</p>
                      </div>
                      <p className='text-2xl font-bold text-white'>
                        {userStats?.activeStakes || 0}
                      </p>
                    </div>
                  </div>

                  {/* Recent Activity */}
                  <div>
                    <h3 className='text-white font-semibold mb-4'>
                      Recent Activity
                    </h3>
                    <div className='space-y-3'>
                      {stakesData?.data?.docs?.slice(0, 5).map((stake: any) => (
                        <div
                          key={stake.id}
                          className='flex items-center justify-between p-4 rounded-xl bg-white/5 border border-white/10 hover:bg-white/10 transition-all'
                        >
                          <div className='flex items-center gap-4'>
                            <div
                              className={cn(
                                'p-2 rounded-lg',
                                stake.status === 'won'
                                  ? 'bg-emerald-500/20'
                                  : stake.status === 'lost'
                                  ? 'bg-red-500/20'
                                  : 'bg-gray-500/20'
                              )}
                            >
                              <Trophy
                                className={cn(
                                  'w-4 h-4',
                                  stake.status === 'won'
                                    ? 'text-emerald-400'
                                    : stake.status === 'lost'
                                    ? 'text-red-400'
                                    : 'text-gray-400'
                                )}
                              />
                            </div>
                            <div>
                              <p className='text-white font-medium'>
                                {stake.poll?.question || 'Poll'}
                              </p>
                              <p className='text-gray-400 text-sm'>
                                Staked ₦{stake.amount.toLocaleString()} •{' '}
                                {dayjs(stake.createdAt).fromNow()}
                              </p>
                            </div>
                          </div>
                          <Badge
                            className={cn(
                              'capitalize',
                              stake.status === 'won'
                                ? 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30'
                                : stake.status === 'lost'
                                ? 'bg-red-500/20 text-red-400 border-red-500/30'
                                : 'bg-gray-500/20 text-gray-400 border-gray-500/30'
                            )}
                          >
                            {stake.status}
                          </Badge>
                        </div>
                      )) || (
                        <div className='text-center py-8 text-gray-500'>
                          <Activity className='w-12 h-12 mx-auto mb-3 opacity-50' />
                          <p>No recent activity</p>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Login History */}
                  <div>
                    <h3 className='text-white font-semibold mb-4'>
                      Login Information
                    </h3>
                    <div className='space-y-3'>
                      <div className='p-4 rounded-xl bg-white/5 border border-white/10'>
                        <div className='flex items-center justify-between mb-3'>
                          <p className='text-gray-400 text-sm'>
                            Account Created
                          </p>
                          <p className='text-white font-medium'>
                            {dayjs(user.createdAt).format('MMM DD, YYYY')}
                          </p>
                        </div>
                        <div className='flex items-center justify-between mb-3'>
                          <p className='text-gray-400 text-sm'>Last Updated</p>
                          <p className='text-white font-medium'>
                            {dayjs(user.updatedAt).format('MMM DD, YYYY')}
                          </p>
                        </div>
                        <div className='flex items-center justify-between'>
                          <p className='text-gray-400 text-sm'>
                            Account Status
                          </p>
                          <Badge className='bg-emerald-500/20 text-emerald-400 border-emerald-500/30'>
                            {user.status || 'Active'}
                          </Badge>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
