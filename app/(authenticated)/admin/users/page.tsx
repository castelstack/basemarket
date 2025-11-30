'use client';

import {
  useAdminUsers,
  useUpdateUserStatus,
  useUpdateUserRole,
  useLockUserWallet,
  useUnlockUserWallet,
} from '@/lib/admin';
import { capitalize } from '@/lib/capitalize';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { useState, useMemo } from 'react';
import { Pagination } from '@/components/ui/pagination';
import { useAuthStore } from '@/stores/authStore';
import { toast } from 'sonner';
import {
  Users,
  Shield,
  Crown,
  UserCheck,
  UserX,
  Lock,
  Unlock,
  Mail,
  Search,
  Filter,
  AlertTriangle,
  Calendar,
  Wallet,
  CheckCircle,
  Sparkles,
  ChevronDown,
  User,
  MoreVertical,
} from 'lucide-react';
import Link from 'next/link';

export default function AdminUsersPage() {
  const { isAdmin } = useAuthStore();
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState<'all' | 'active' | 'suspended'>('all');
  const [isEmailVerifiedFilter, setIsEmailVerifiedFilter] = useState<boolean | undefined>(undefined);
  const [isPhoneVerifiedFilter, setIsPhoneVerifiedFilter] = useState<boolean | undefined>(undefined);
  const [kycCompletedFilter, setKycCompletedFilter] = useState<boolean | undefined>(undefined);
  const [roleDialogOpen, setRoleDialogOpen] = useState(false);
  const [selectedUserForRole, setSelectedUserForRole] = useState<any>(null);
  const [selectedRole, setSelectedRole] = useState<string>('');
  
  // Build API parameters
  const apiParams = {
    page: currentPage,
    limit: itemsPerPage,
    search: searchTerm || undefined,
    status: filterStatus === 'all' ? undefined : filterStatus,
    isEmailVerified: isEmailVerifiedFilter,
    isPhoneVerified: isPhoneVerifiedFilter,
    kycCompleted: kycCompletedFilter,
  };
  
  const { data, isLoading, isError, error } = useAdminUsers(apiParams);
  const updateUserStatus = useUpdateUserStatus();
  const updateUserRole = useUpdateUserRole();
  const lockWallet = useLockUserWallet();
  const unlockWallet = useUnlockUserWallet();
  const [selectedUserId, setSelectedUserId] = useState<string | null>(null);

  const handleUpdateUserRole = () => {
    if (!selectedUserForRole || !selectedRole) return;
    
    updateUserRole.mutate(
      { id: selectedUserForRole.id, role: selectedRole },
      {
        onSuccess: () => {
          const roleLabel = selectedRole === 'admin' ? 'Admin' : 
                           selectedRole === 'sub_admin' ? 'Sub-Admin' : 'User';
          toast.success(`${selectedUserForRole.firstName} is now ${roleLabel === 'User' ? 'a' : 'an'} ${roleLabel}!`);
          setRoleDialogOpen(false);
          setSelectedUserForRole(null);
          setSelectedRole('');
        },
        onError: (error: any) => {
          toast.error(error?.message || 'Failed to update user role');
        },
      }
    );
  };
  
  const getUserCurrentRole = (user: any) => {
    if (user.roles?.includes('admin')) return 'admin';
    if (user.roles?.includes('sub_admin')) return 'sub_admin';
    return 'user';
  };

  const responseData = data?.data;
  const users = responseData?.docs || [];
  const totalPages = responseData?.totalPages || 1;
  const hasNextPage = responseData?.hasNextPage || false;
  const hasPrevPage = responseData?.hasPrevPage || false;
  const totalDocs = responseData?.totalDocs || 0;

  // Users are now filtered on the server, so we use them directly
  const filteredUsers = users;
  if (isLoading) {
    return (
      <div className='min-h-screen bg-black flex items-center justify-center'>
        <div className='text-center'>
          <div className='animate-spin rounded-full h-12 w-12 border-b-2 border-violet-400 mb-4'></div>
          <p className='text-gray-400'>Loading users...</p>
        </div>
      </div>
    );
  }

  if (isError) {
    return (
      <div className='min-h-screen bg-black flex items-center justify-center'>
        <div className='text-center'>
          <AlertTriangle className='w-12 h-12 text-red-400 mx-auto mb-4' />
          <p className='text-red-400 text-lg mb-4'>
            Error: {error?.message || 'Failed to load users'}
          </p>
          <Button onClick={() => window.location.reload()}>Try Again</Button>
        </div>
      </div>
    );
  }

  // Get user stats
  const totalUsers = users.length;
  const activeUsers = users.filter((u: any) => u.status === 'active').length;
  const suspendedUsers = users.filter((u: any) => u.status === 'suspended').length;
  const lockedWallets = users.filter((u: any) => u.wallet.isLocked).length;

  return (
    <div className='min-h-screen bg-black'>
      {/* Animated Background */}
      <div className='fixed inset-0 bg-gradient-to-br from-violet-950/20 via-black to-pink-950/20' />
      <div className='fixed inset-0 bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-purple-900/10 via-transparent to-transparent' />

      <div className='relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8'>
        {/* Hero Section */}
        <div className='mb-10'>
          <div className='relative overflow-hidden rounded-3xl bg-gradient-to-br from-violet-600/10 via-purple-600/5 to-pink-600/10 border border-white/10 p-8 lg:p-12'>
            {/* Animated elements */}
            <div className='absolute top-0 right-0 w-64 h-64 bg-gradient-to-br from-violet-500/20 to-pink-500/20 rounded-full blur-3xl' />
            <div className='absolute bottom-0 left-0 w-48 h-48 bg-gradient-to-tr from-orange-500/20 to-amber-500/20 rounded-full blur-3xl' />

            <div className='relative z-10'>
              <div className='flex items-center gap-2 mb-4'>
                <div className='flex items-center gap-2 px-3 py-1.5 rounded-full bg-gradient-to-r from-blue-500/20 to-cyan-500/20 border border-blue-500/30'>
                  <Users className='w-4 h-4 text-blue-400' />
                  <span className='text-sm font-medium text-blue-400'>
                    User Management
                  </span>
                </div>
                <Badge className='bg-amber-500/20 text-amber-400 border-amber-500/30'>
                  <Crown className='w-3 h-3 mr-1' />
                  Admin Panel
                </Badge>
              </div>

              <h1 className='text-3xl sm:text-4xl lg:text-5xl font-black mb-2 sm:mb-3'>
                <span className='bg-gradient-to-r from-violet-400 via-pink-400 to-orange-400 bg-clip-text text-transparent'>
                  Manage Users
                </span>
              </h1>

              <p className='text-lg sm:text-xl text-gray-400 mb-6 sm:mb-8 max-w-2xl'>
                Monitor and manage all platform users, their status, and wallet permissions
              </p>

              <div className='flex flex-wrap gap-4'>
                <Link href='/admin/dashboard'>
                  <Button
                    variant='outline'
                    className='px-8 py-6 rounded-2xl border-white/20 text-white hover:bg-white/10 font-semibold text-lg'
                  >
                    <Shield className='w-5 h-5 mr-2' />
                    Dashboard
                  </Button>
                </Link>
              </div>
            </div>
          </div>
        </div>

        {/* Quick Stats */}
        <div className='grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8'>
          <Card className='bg-white/5 backdrop-blur-sm border-white/10'>
            <CardContent className='p-6'>
              <div className='flex items-center gap-4'>
                <div className='p-3 rounded-xl bg-gradient-to-r from-blue-500/20 to-cyan-500/20'>
                  <Users className='w-6 h-6 text-blue-400' />
                </div>
                <div>
                  <p className='text-gray-400 text-sm'>Total Users</p>
                  <p className='text-2xl font-bold text-white'>{totalUsers}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className='bg-white/5 backdrop-blur-sm border-white/10'>
            <CardContent className='p-6'>
              <div className='flex items-center gap-4'>
                <div className='p-3 rounded-xl bg-gradient-to-r from-emerald-500/20 to-teal-500/20'>
                  <UserCheck className='w-6 h-6 text-emerald-400' />
                </div>
                <div>
                  <p className='text-gray-400 text-sm'>Active Users</p>
                  <p className='text-2xl font-bold text-white'>{activeUsers}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className='bg-white/5 backdrop-blur-sm border-white/10'>
            <CardContent className='p-6'>
              <div className='flex items-center gap-4'>
                <div className='p-3 rounded-xl bg-gradient-to-r from-red-500/20 to-pink-500/20'>
                  <UserX className='w-6 h-6 text-red-400' />
                </div>
                <div>
                  <p className='text-gray-400 text-sm'>Suspended</p>
                  <p className='text-2xl font-bold text-white'>{suspendedUsers}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className='bg-white/5 backdrop-blur-sm border-white/10'>
            <CardContent className='p-6'>
              <div className='flex items-center gap-4'>
                <div className='p-3 rounded-xl bg-gradient-to-r from-amber-500/20 to-orange-500/20'>
                  <Lock className='w-6 h-6 text-amber-400' />
                </div>
                <div>
                  <p className='text-gray-400 text-sm'>Locked Wallets</p>
                  <p className='text-2xl font-bold text-white'>{lockedWallets}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Filters */}
        <Card className='bg-white/5 backdrop-blur-sm border-white/10 mb-8'>
          <CardContent className='p-6'>
            <div className='flex flex-col sm:flex-row gap-4'>
              <div className='flex-1'>
                <div className='relative'>
                  <Search className='w-5 h-5 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400' />
                  <Input
                    placeholder='Search users by username, email, first or last name...'
                    value={searchTerm}
                    onChange={(e) => {
                      setSearchTerm(e.target.value);
                      setCurrentPage(1); // Reset to first page when searching
                    }}
                    className='pl-10 bg-black/50 border-white/20 text-white placeholder-gray-400 focus:border-violet-500 rounded-xl'
                  />
                </div>
              </div>
              <div className='flex flex-wrap gap-2'>
                {['all', 'active', 'suspended'].map((status) => (
                  <Button
                    key={status}
                    size='sm'
                    variant={filterStatus === status ? 'default' : 'outline'}
                    onClick={() => {
                      setFilterStatus(status as any);
                      setCurrentPage(1); // Reset to first page when filtering
                    }}
                    className={
                      filterStatus === status
                        ? 'bg-violet-600 hover:bg-violet-700 text-white'
                        : 'border-white/20 text-gray-300 hover:bg-white/10'
                    }
                  >
                    <Filter className='w-4 h-4 mr-2' />
                    {status.charAt(0).toUpperCase() + status.slice(1)}
                  </Button>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Advanced Filters */}
        <Card className='bg-white/5 backdrop-blur-sm border-white/10 mb-8'>
          <CardContent className='p-6'>
            <div className='mb-4'>
              <h3 className='text-lg font-semibold text-white mb-4 flex items-center gap-2'>
                <Filter className='w-5 h-5 text-violet-400' />
                Advanced Filters
              </h3>
              <div className='grid grid-cols-1 sm:grid-cols-3 gap-4'>
                {/* Email Verification Filter */}
                <div className='space-y-2'>
                  <label className='text-sm font-medium text-gray-300'>Email Verified</label>
                  <div className='flex gap-1'>
                    <Button
                      size='sm'
                      variant={isEmailVerifiedFilter === undefined ? 'default' : 'outline'}
                      onClick={() => {
                        setIsEmailVerifiedFilter(undefined);
                        setCurrentPage(1);
                      }}
                      className={
                        isEmailVerifiedFilter === undefined
                          ? 'bg-violet-600 hover:bg-violet-700 text-white text-xs'
                          : 'border-white/20 text-gray-300 hover:bg-white/10 text-xs'
                      }
                    >
                      All
                    </Button>
                    <Button
                      size='sm'
                      variant={isEmailVerifiedFilter === true ? 'default' : 'outline'}
                      onClick={() => {
                        setIsEmailVerifiedFilter(true);
                        setCurrentPage(1);
                      }}
                      className={
                        isEmailVerifiedFilter === true
                          ? 'bg-emerald-600 hover:bg-emerald-700 text-white text-xs'
                          : 'border-white/20 text-gray-300 hover:bg-white/10 text-xs'
                      }
                    >
                      Verified
                    </Button>
                    <Button
                      size='sm'
                      variant={isEmailVerifiedFilter === false ? 'default' : 'outline'}
                      onClick={() => {
                        setIsEmailVerifiedFilter(false);
                        setCurrentPage(1);
                      }}
                      className={
                        isEmailVerifiedFilter === false
                          ? 'bg-red-600 hover:bg-red-700 text-white text-xs'
                          : 'border-white/20 text-gray-300 hover:bg-white/10 text-xs'
                      }
                    >
                      Unverified
                    </Button>
                  </div>
                </div>

                {/* Phone Verification Filter */}
                <div className='space-y-2'>
                  <label className='text-sm font-medium text-gray-300'>Phone Verified</label>
                  <div className='flex gap-1'>
                    <Button
                      size='sm'
                      variant={isPhoneVerifiedFilter === undefined ? 'default' : 'outline'}
                      onClick={() => {
                        setIsPhoneVerifiedFilter(undefined);
                        setCurrentPage(1);
                      }}
                      className={
                        isPhoneVerifiedFilter === undefined
                          ? 'bg-violet-600 hover:bg-violet-700 text-white text-xs'
                          : 'border-white/20 text-gray-300 hover:bg-white/10 text-xs'
                      }
                    >
                      All
                    </Button>
                    <Button
                      size='sm'
                      variant={isPhoneVerifiedFilter === true ? 'default' : 'outline'}
                      onClick={() => {
                        setIsPhoneVerifiedFilter(true);
                        setCurrentPage(1);
                      }}
                      className={
                        isPhoneVerifiedFilter === true
                          ? 'bg-emerald-600 hover:bg-emerald-700 text-white text-xs'
                          : 'border-white/20 text-gray-300 hover:bg-white/10 text-xs'
                      }
                    >
                      Verified
                    </Button>
                    <Button
                      size='sm'
                      variant={isPhoneVerifiedFilter === false ? 'default' : 'outline'}
                      onClick={() => {
                        setIsPhoneVerifiedFilter(false);
                        setCurrentPage(1);
                      }}
                      className={
                        isPhoneVerifiedFilter === false
                          ? 'bg-red-600 hover:bg-red-700 text-white text-xs'
                          : 'border-white/20 text-gray-300 hover:bg-white/10 text-xs'
                      }
                    >
                      Unverified
                    </Button>
                  </div>
                </div>

                {/* KYC Completion Filter */}
                <div className='space-y-2'>
                  <label className='text-sm font-medium text-gray-300'>KYC Completed</label>
                  <div className='flex gap-1'>
                    <Button
                      size='sm'
                      variant={kycCompletedFilter === undefined ? 'default' : 'outline'}
                      onClick={() => {
                        setKycCompletedFilter(undefined);
                        setCurrentPage(1);
                      }}
                      className={
                        kycCompletedFilter === undefined
                          ? 'bg-violet-600 hover:bg-violet-700 text-white text-xs'
                          : 'border-white/20 text-gray-300 hover:bg-white/10 text-xs'
                      }
                    >
                      All
                    </Button>
                    <Button
                      size='sm'
                      variant={kycCompletedFilter === true ? 'default' : 'outline'}
                      onClick={() => {
                        setKycCompletedFilter(true);
                        setCurrentPage(1);
                      }}
                      className={
                        kycCompletedFilter === true
                          ? 'bg-emerald-600 hover:bg-emerald-700 text-white text-xs'
                          : 'border-white/20 text-gray-300 hover:bg-white/10 text-xs'
                      }
                    >
                      Completed
                    </Button>
                    <Button
                      size='sm'
                      variant={kycCompletedFilter === false ? 'default' : 'outline'}
                      onClick={() => {
                        setKycCompletedFilter(false);
                        setCurrentPage(1);
                      }}
                      className={
                        kycCompletedFilter === false
                          ? 'bg-red-600 hover:bg-red-700 text-white text-xs'
                          : 'border-white/20 text-gray-300 hover:bg-white/10 text-xs'
                      }
                    >
                      Pending
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Users List */}
        <Card className='bg-white/5 backdrop-blur-sm border-white/10'>
          <CardHeader>
            <CardTitle className='text-white flex items-center gap-2'>
              <Users className='w-5 h-5 text-violet-400' />
              All Users ({filteredUsers.length})
            </CardTitle>
          </CardHeader>
          <CardContent>
            {filteredUsers.length === 0 ? (
              <div className='text-center py-12'>
                <Users className='w-12 h-12 text-gray-500 mx-auto mb-4' />
                <h3 className='text-lg font-semibold text-white mb-2'>
                  {searchTerm || filterStatus !== 'all' ? 'No matching users found' : 'No users found'}
                </h3>
                <p className='text-gray-400 mb-6'>
                  {searchTerm || filterStatus !== 'all' 
                    ? 'Try adjusting your search or filter criteria'
                    : 'Users will appear here once they register on the platform'
                  }
                </p>
              </div>
            ) : (
              <div className='space-y-4'>
                {filteredUsers.map((user: any) => (
                  <div
                    key={user.id}
                    className='group p-6 rounded-2xl bg-white/5 backdrop-blur-sm border border-white/10 hover:bg-white/10 transition-all'
                  >
                    <div className='flex items-start justify-between mb-4'>
                      <div className='flex-1'>
                        <div className='flex items-center gap-3 mb-3'>
                          <div className='flex items-center gap-2'>
                            <h3 className='text-xl font-bold text-white'>
                              {capitalize(user.firstName)} {capitalize(user.lastName)}
                            </h3>
                            <div className='flex items-center gap-1 text-gray-400'>
                              <Mail className='w-4 h-4' />
                              <span className='text-sm'>{user.email}</span>
                            </div>
                          </div>
                        </div>
                        
                        <div className='flex flex-wrap items-center gap-2 mb-4'>
                          {/* Roles */}
                          {(user.roles || []).map((role: string) => (
                            <Badge
                              key={role}
                              className={
                                role === 'admin'
                                  ? 'bg-purple-500/20 text-purple-400 border-purple-500/30'
                                  : role === 'sub-admin' || role === 'sub_admin'
                                  ? 'bg-blue-500/20 text-blue-400 border-blue-500/30'
                                  : 'bg-gray-500/20 text-gray-400 border-gray-500/30'
                              }
                            >
                              {role === 'admin' && <Crown className='w-3 h-3 mr-1' />}
                              {(role === 'sub-admin' || role === 'sub_admin') && <Sparkles className='w-3 h-3 mr-1' />}
                              {(role === 'sub-admin' || role === 'sub_admin') ? 'Sub-Admin' : role}
                            </Badge>
                          ))}

                          {/* Status */}
                          <Badge
                            className={
                              user.status === 'active'
                                ? 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30'
                                : 'bg-red-500/20 text-red-400 border-red-500/30'
                            }
                          >
                            {user.status === 'active' ? (
                              <UserCheck className='w-3 h-3 mr-1' />
                            ) : (
                              <UserX className='w-3 h-3 mr-1' />
                            )}
                            {user.status}
                          </Badge>

                          {/* Email Verification */}
                          <Badge
                            className={
                              user.isEmailVerified
                                ? 'bg-green-500/20 text-green-400 border-green-500/30'
                                : 'bg-orange-500/20 text-orange-400 border-orange-500/30'
                            }
                          >
                            <Mail className='w-3 h-3 mr-1' />
                            {user.isEmailVerified ? 'Email Verified' : 'Email Unverified'}
                          </Badge>

                          {/* Phone Verification */}
                          {user.phoneNumber && (
                            <Badge
                              className={
                                user.isPhoneVerified
                                  ? 'bg-green-500/20 text-green-400 border-green-500/30'
                                  : 'bg-orange-500/20 text-orange-400 border-orange-500/30'
                              }
                            >
                              <span className='w-3 h-3 mr-1'>📞</span>
                              {user.isPhoneVerified ? 'Phone Verified' : 'Phone Unverified'}
                            </Badge>
                          )}

                          {/* KYC Status */}
                          <Badge
                            className={
                              user.kycCompleted
                                ? 'bg-green-500/20 text-green-400 border-green-500/30'
                                : 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30'
                            }
                          >
                            <CheckCircle className='w-3 h-3 mr-1' />
                            KYC {user.kycCompleted ? 'Completed' : 'Pending'}
                          </Badge>

                          {/* Wallet Status */}
                          <Badge
                            className={
                              user.wallet.isLocked
                                ? 'bg-amber-500/20 text-amber-400 border-amber-500/30'
                                : 'bg-green-500/20 text-green-400 border-green-500/30'
                            }
                          >
                            {user.wallet.isLocked ? (
                              <Lock className='w-3 h-3 mr-1' />
                            ) : (
                              <Wallet className='w-3 h-3 mr-1' />
                            )}
                            Wallet {user.wallet.isLocked ? 'Locked' : 'Active'}
                          </Badge>
                        </div>

                        {user.createdAt && (
                          <div className='flex items-center gap-2 text-xs text-gray-500'>
                            <Calendar className='w-4 h-4' />
                            Joined {new Date(user.createdAt).toLocaleDateString()}
                          </div>
                        )}
                      </div>
                    </div>

                    <div className='flex items-center gap-3'>
                      {/* Role Badge with Dropdown */}
                      {isAdmin && (
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button
                              size='sm'
                              variant='outline'
                              className='border-white/20 text-white hover:bg-white/10'
                            >
                              {getUserCurrentRole(user) === 'admin' && <Crown className='w-4 h-4 mr-2 text-purple-400' />}
                              {getUserCurrentRole(user) === 'sub_admin' && <Sparkles className='w-4 h-4 mr-2 text-blue-400' />}
                              {getUserCurrentRole(user) === 'user' && <User className='w-4 h-4 mr-2 text-gray-400' />}
                              <span className='capitalize'>
                                {getUserCurrentRole(user) === 'sub_admin' ? 'Sub-Admin' : getUserCurrentRole(user)}
                              </span>
                              <ChevronDown className='w-4 h-4 ml-2' />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent className='bg-black/95 border-white/10 text-white'>
                            <DropdownMenuLabel>Change Role</DropdownMenuLabel>
                            <DropdownMenuSeparator className='bg-white/10' />
                            <DropdownMenuItem
                              onClick={() => {
                                setSelectedUserForRole(user);
                                setSelectedRole('user');
                                setRoleDialogOpen(true);
                              }}
                              className='hover:bg-white/10 cursor-pointer'
                              disabled={getUserCurrentRole(user) === 'user'}
                            >
                              <User className='w-4 h-4 mr-2 text-gray-400' />
                              User
                              {getUserCurrentRole(user) === 'user' && <span className='ml-auto text-xs text-gray-500'>Current</span>}
                            </DropdownMenuItem>
                            <DropdownMenuItem
                              onClick={() => {
                                setSelectedUserForRole(user);
                                setSelectedRole('sub_admin');
                                setRoleDialogOpen(true);
                              }}
                              className='hover:bg-white/10 cursor-pointer'
                              disabled={getUserCurrentRole(user) === 'sub_admin'}
                            >
                              <Sparkles className='w-4 h-4 mr-2 text-blue-400' />
                              Sub-Admin
                              {getUserCurrentRole(user) === 'sub_admin' && <span className='ml-auto text-xs text-gray-500'>Current</span>}
                            </DropdownMenuItem>
                            <DropdownMenuItem
                              onClick={() => {
                                setSelectedUserForRole(user);
                                setSelectedRole('admin');
                                setRoleDialogOpen(true);
                              }}
                              className='hover:bg-white/10 cursor-pointer'
                              disabled={getUserCurrentRole(user) === 'admin'}
                            >
                              <Crown className='w-4 h-4 mr-2 text-purple-400' />
                              Admin
                              {getUserCurrentRole(user) === 'admin' && <span className='ml-auto text-xs text-gray-500'>Current</span>}
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      )}

                      {/* Actions Dropdown */}
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button
                            size='sm'
                            variant='outline'
                            className='border-white/20 text-white hover:bg-white/10'
                          >
                            <MoreVertical className='w-4 h-4' />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent className='bg-black/95 border-white/10 text-white'>
                          <DropdownMenuLabel>Actions</DropdownMenuLabel>
                          <DropdownMenuSeparator className='bg-white/10' />
                          
                          {/* Account Status */}
                          <DropdownMenuItem
                            onClick={() => {
                              setSelectedUserId(user.id);
                              updateUserStatus.mutate({
                                id: user.id,
                                status: user.status === 'active' ? 'suspended' : 'active',
                              });
                            }}
                            className='hover:bg-white/10 cursor-pointer'
                            disabled={updateUserStatus.isPending && selectedUserId === user.id}
                          >
                            {user.status === 'active' ? (
                              <>
                                <UserX className='w-4 h-4 mr-2 text-red-400' />
                                Suspend Account
                              </>
                            ) : (
                              <>
                                <UserCheck className='w-4 h-4 mr-2 text-emerald-400' />
                                Activate Account
                              </>
                            )}
                          </DropdownMenuItem>
                          
                          {/* Wallet Status */}
                          <DropdownMenuItem
                            onClick={() => {
                              setSelectedUserId(user.id);
                              if (user.wallet.isLocked) {
                                unlockWallet.mutate(user.id);
                              } else {
                                lockWallet.mutate(user.id);
                              }
                            }}
                            className='hover:bg-white/10 cursor-pointer'
                            disabled={(user.wallet.isLocked ? unlockWallet.isPending : lockWallet.isPending) && selectedUserId === user.id}
                          >
                            {user.wallet.isLocked ? (
                              <>
                                <Unlock className='w-4 h-4 mr-2 text-green-400' />
                                Unlock Wallet
                              </>
                            ) : (
                              <>
                                <Lock className='w-4 h-4 mr-2 text-amber-400' />
                                Lock Wallet
                              </>
                            )}
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </div>
                  </div>
                ))}
              </div>
            )}
            
            {/* Pagination Controls */}
            {!isLoading && (
              <Pagination
                currentPage={currentPage}
                totalPages={totalPages}
                totalDocs={totalDocs}
                hasNextPage={hasNextPage}
                hasPrevPage={hasPrevPage}
                onPageChange={setCurrentPage}
                itemName="users"
              />
            )}
          </CardContent>
        </Card>
      </div>

      {/* Role Change Confirmation Dialog */}
      <Dialog open={roleDialogOpen} onOpenChange={setRoleDialogOpen}>
        <DialogContent className='bg-black/95 backdrop-blur-xl border-white/10 text-white'>
          <DialogHeader>
            <DialogTitle className={`text-2xl font-bold bg-gradient-to-r ${
              selectedRole === 'admin' ? 'from-purple-400 to-pink-400' :
              selectedRole === 'sub_admin' ? 'from-blue-400 to-cyan-400' :
              'from-gray-400 to-gray-300'
            } bg-clip-text text-transparent`}>
              Change User Role
            </DialogTitle>
            <DialogDescription className='text-gray-400'>
              Are you sure you want to change this user&apos;s role to {
                selectedRole === 'admin' ? 'Admin' :
                selectedRole === 'sub_admin' ? 'Sub-Admin' : 'User'
              }?
            </DialogDescription>
          </DialogHeader>
          
          {selectedUserForRole && (
            <div className='space-y-4'>
              <div className='p-4 rounded-xl bg-white/5 border border-white/10'>
                <div className='space-y-2'>
                  <div className='flex items-center gap-2'>
                    <Mail className='w-4 h-4 text-gray-400' />
                    <span className='text-sm text-gray-300'>User Details</span>
                  </div>
                  <div className='pl-6'>
                    <p className='text-white font-medium'>
                      {capitalize(selectedUserForRole.firstName)} {capitalize(selectedUserForRole.lastName)}
                    </p>
                    <p className='text-gray-400 text-sm'>{selectedUserForRole.email}</p>
                    <div className='flex items-center gap-2 mt-2'>
                      <span className='text-xs text-gray-500'>Current Role:</span>
                      <Badge className={
                        getUserCurrentRole(selectedUserForRole) === 'admin' 
                          ? 'bg-purple-500/20 text-purple-400 border-purple-500/30'
                          : getUserCurrentRole(selectedUserForRole) === 'sub_admin'
                          ? 'bg-blue-500/20 text-blue-400 border-blue-500/30'
                          : 'bg-gray-500/20 text-gray-400 border-gray-500/30'
                      }>
                        {getUserCurrentRole(selectedUserForRole) === 'admin' && <Crown className='w-3 h-3 mr-1' />}
                        {getUserCurrentRole(selectedUserForRole) === 'sub_admin' && <Sparkles className='w-3 h-3 mr-1' />}
                        {getUserCurrentRole(selectedUserForRole) === 'user' && <User className='w-3 h-3 mr-1' />}
                        {getUserCurrentRole(selectedUserForRole) === 'sub_admin' ? 'Sub-Admin' : capitalize(getUserCurrentRole(selectedUserForRole))}
                      </Badge>
                    </div>
                  </div>
                </div>
              </div>

              {/* Role Permissions */}
              {selectedRole === 'admin' ? (
                <div className='p-4 rounded-xl bg-purple-500/10 border border-purple-500/30'>
                  <div className='flex items-start gap-3'>
                    <Crown className='w-5 h-5 text-purple-400 flex-shrink-0 mt-0.5' />
                    <div>
                      <p className='text-purple-400 font-medium mb-2'>Admin Permissions:</p>
                      <ul className='text-gray-300 text-sm space-y-1'>
                        <li className='text-emerald-400'>✓ Full system access</li>
                        <li className='text-emerald-400'>✓ Manage all users and roles</li>
                        <li className='text-emerald-400'>✓ Create, edit, and delete polls</li>
                        <li className='text-emerald-400'>✓ Select poll winners</li>
                        <li className='text-emerald-400'>✓ Access admin dashboard</li>
                        <li className='text-emerald-400'>✓ View all transactions</li>
                        <li className='text-emerald-400'>✓ Manage system settings</li>
                      </ul>
                    </div>
                  </div>
                </div>
              ) : selectedRole === 'sub_admin' ? (
                <div className='p-4 rounded-xl bg-blue-500/10 border border-blue-500/30'>
                  <div className='flex items-start gap-3'>
                    <Sparkles className='w-5 h-5 text-blue-400 flex-shrink-0 mt-0.5' />
                    <div>
                      <p className='text-blue-400 font-medium mb-2'>Sub-Admin Permissions:</p>
                      <ul className='text-gray-300 text-sm space-y-1'>
                        <li className='text-emerald-400'>✓ Create and edit polls</li>
                        <li className='text-emerald-400'>✓ Close and cancel polls</li>
                        <li className='text-emerald-400'>✓ Manage poll operations</li>
                        <li className='text-red-400'>✗ Cannot select winners</li>
                        <li className='text-red-400'>✗ Cannot delete polls</li>
                        <li className='text-red-400'>✗ No user management</li>
                        <li className='text-red-400'>✗ No admin dashboard access</li>
                      </ul>
                    </div>
                  </div>
                </div>
              ) : (
                <div className='p-4 rounded-xl bg-gray-500/10 border border-gray-500/30'>
                  <div className='flex items-start gap-3'>
                    <User className='w-5 h-5 text-gray-400 flex-shrink-0 mt-0.5' />
                    <div>
                      <p className='text-gray-400 font-medium mb-2'>User Permissions:</p>
                      <ul className='text-gray-300 text-sm space-y-1'>
                        <li className='text-emerald-400'>✓ Participate in polls</li>
                        <li className='text-emerald-400'>✓ View poll results</li>
                        <li className='text-emerald-400'>✓ Manage own wallet</li>
                        <li className='text-red-400'>✗ No poll creation</li>
                        <li className='text-red-400'>✗ No poll management</li>
                        <li className='text-red-400'>✗ No admin privileges</li>
                      </ul>
                    </div>
                  </div>
                </div>
              )}

              <div className='p-4 rounded-xl bg-amber-500/10 border border-amber-500/30'>
                <div className='flex items-center gap-2'>
                  <AlertTriangle className='w-4 h-4 text-amber-400' />
                  <p className='text-amber-400 text-sm'>
                    {selectedRole === 'admin' 
                      ? 'This will grant full administrative access. Make sure you trust this user completely.'
                      : selectedRole === 'sub_admin'
                      ? 'This will grant poll management privileges. Make sure you trust this user.'
                      : 'This will remove all administrative privileges from this user.'}
                  </p>
                </div>
              </div>
            </div>
          )}

          <DialogFooter className='mt-6'>
            <Button
              variant='outline'
              onClick={() => {
                setRoleDialogOpen(false);
                setSelectedUserForRole(null);
                setSelectedRole('');
              }}
              className='border-white/20 text-gray-400 hover:text-white hover:bg-white/10'
            >
              Cancel
            </Button>
            <Button
              onClick={handleUpdateUserRole}
              disabled={updateUserRole.isPending}
              className={`font-bold ${
                selectedRole === 'admin' 
                  ? 'bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700'
                  : selectedRole === 'sub_admin'
                  ? 'bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-700 hover:to-cyan-700'
                  : 'bg-gradient-to-r from-gray-600 to-gray-500 hover:from-gray-700 hover:to-gray-600'
              } text-white`}
            >
              {updateUserRole.isPending ? (
                <>
                  <span className='animate-spin mr-2'>⚡</span>
                  Updating Role...
                </>
              ) : (
                <>
                  {selectedRole === 'admin' && <Crown className='w-4 h-4 mr-2' />}
                  {selectedRole === 'sub_admin' && <Sparkles className='w-4 h-4 mr-2' />}
                  {selectedRole === 'user' && <User className='w-4 h-4 mr-2' />}
                  Confirm Change
                </>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
