"use client";

import {
  useAdminUsers,
  useUpdateUserStatus,
  useUpdateUserRole,
  useLockUserWallet,
  useUnlockUserWallet,
} from "@/lib/admin";
import { capitalize } from "@/lib/capitalize";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useState } from "react";
import { Pagination } from "@/components/ui/pagination";
import { useAuthStore } from "@/stores/authStore";
import { toast } from "sonner";
import {
  Users,
  Crown,
  UserCheck,
  UserX,
  Lock,
  Unlock,
  Mail,
  Search,
  AlertTriangle,
  Calendar,
  Wallet,
  CheckCircle,
  Sparkles,
  ChevronDown,
  User,
  MoreVertical,
  Loader2,
} from "lucide-react";

export default function AdminUsersPage() {
  const { isAdmin } = useAuthStore();
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;
  const [searchTerm, setSearchTerm] = useState("");
  const [filterStatus, setFilterStatus] = useState<"all" | "active" | "suspended">("all");
  const [roleDialogOpen, setRoleDialogOpen] = useState(false);
  const [selectedUserForRole, setSelectedUserForRole] = useState<any>(null);
  const [selectedRole, setSelectedRole] = useState<string>("");

  const apiParams = {
    page: currentPage,
    limit: itemsPerPage,
    search: searchTerm || undefined,
    status: filterStatus === "all" ? undefined : filterStatus,
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
          const roleLabel = selectedRole === "admin" ? "Admin" : selectedRole === "sub_admin" ? "Sub-Admin" : "User";
          toast.success(`Role updated to ${roleLabel}`);
          setRoleDialogOpen(false);
          setSelectedUserForRole(null);
          setSelectedRole("");
        },
        onError: (error: any) => toast.error(error?.message || "Failed to update role"),
      }
    );
  };

  const getUserCurrentRole = (user: any) => {
    if (user.roles?.includes("admin")) return "admin";
    if (user.roles?.includes("sub_admin")) return "sub_admin";
    return "user";
  };

  const responseData = data?.data;
  const users = responseData?.docs || [];
  const totalPages = responseData?.totalPages || 1;
  const hasNextPage = responseData?.hasNextPage || false;
  const hasPrevPage = responseData?.hasPrevPage || false;
  const totalDocs = responseData?.totalDocs || 0;

  if (isLoading) {
    return (
      <div className="min-h-screen bg-[#000000] flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-8 h-8 text-[#EDEDED] animate-spin mx-auto mb-3" />
          <p className="text-[#9A9A9A] text-sm font-light">Loading...</p>
        </div>
      </div>
    );
  }

  if (isError) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center px-4">
        <div className="text-center">
          <AlertTriangle className="w-12 h-12 text-red-400 mx-auto mb-4" />
          <p className="text-red-400 mb-4">{error?.message || "Failed to load users"}</p>
          <Button onClick={() => window.location.reload()}>Try Again</Button>
        </div>
      </div>
    );
  }

  const activeUsers = users.filter((u: any) => u.status === "active").length;
  const suspendedUsers = users.filter((u: any) => u.status === "suspended").length;
  const lockedWallets = users.filter((u: any) => u.wallet?.isLocked).length;

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
          <h1 className="text-2xl font-black text-white">Users</h1>
          <p className="text-gray-500 text-sm">Manage platform users</p>
        </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-4 gap-2 mb-6">
          <div className="p-3 rounded-xl bg-white/[0.03] border border-white/[0.06] text-center">
            <Users className="w-4 h-4 text-violet-400 mx-auto mb-1" />
            <p className="text-lg font-bold text-white">{users.length}</p>
            <p className="text-xs text-gray-500">Total</p>
          </div>
          <div className="p-3 rounded-xl bg-white/[0.03] border border-white/[0.06] text-center">
            <UserCheck className="w-4 h-4 text-emerald-400 mx-auto mb-1" />
            <p className="text-lg font-bold text-white">{activeUsers}</p>
            <p className="text-xs text-gray-500">Active</p>
          </div>
          <div className="p-3 rounded-xl bg-white/[0.03] border border-white/[0.06] text-center">
            <UserX className="w-4 h-4 text-red-400 mx-auto mb-1" />
            <p className="text-lg font-bold text-white">{suspendedUsers}</p>
            <p className="text-xs text-gray-500">Suspended</p>
          </div>
          <div className="p-3 rounded-xl bg-white/[0.03] border border-white/[0.06] text-center">
            <Lock className="w-4 h-4 text-amber-400 mx-auto mb-1" />
            <p className="text-lg font-bold text-white">{lockedWallets}</p>
            <p className="text-xs text-gray-500">Locked</p>
          </div>
        </div>

        {/* Search & Filters */}
        <div className="mb-4 space-y-3">
          <div className="relative">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" />
            <Input
              placeholder="Search users..."
              value={searchTerm}
              onChange={(e) => {
                setSearchTerm(e.target.value);
                setCurrentPage(1);
              }}
              className="pl-10 h-11 bg-white/[0.03] border-white/[0.06] text-white placeholder-gray-500 rounded-xl"
            />
          </div>
          <div className="flex gap-2">
            {["all", "active", "suspended"].map((status) => (
              <Button
                key={status}
                size="sm"
                onClick={() => {
                  setFilterStatus(status as any);
                  setCurrentPage(1);
                }}
                className={`h-8 rounded-lg text-xs ${
                  filterStatus === status
                    ? "bg-violet-500 hover:bg-violet-600 text-white"
                    : "bg-white/[0.03] border-white/[0.06] text-gray-400 hover:text-white hover:bg-white/10"
                }`}
              >
                {status.charAt(0).toUpperCase() + status.slice(1)}
              </Button>
            ))}
          </div>
        </div>

        {/* Users List */}
        <Card className="bg-white/[0.03] border-white/[0.06]">
          <CardHeader className="pb-3">
            <CardTitle className="text-white flex items-center gap-2 text-base">
              <Users className="w-4 h-4 text-violet-400" />
              All Users ({users.length})
            </CardTitle>
          </CardHeader>
          <CardContent>
            {users.length === 0 ? (
              <div className="text-center py-12">
                <Users className="w-10 h-10 text-gray-600 mx-auto mb-3" />
                <p className="text-gray-400 text-sm">No users found</p>
              </div>
            ) : (
              <div className="space-y-3">
                {users.map((user: any) => (
                  <div
                    key={user.id}
                    className="p-4 rounded-xl bg-white/[0.02] border border-white/[0.05] hover:bg-white/[0.04] transition-colors"
                  >
                    <div className="flex items-start justify-between mb-2">
                      <div className="flex-1 min-w-0">
                        <h3 className="text-white font-semibold truncate">
                          {capitalize(user.firstName)} {capitalize(user.lastName)}
                        </h3>
                        <p className="text-gray-500 text-xs truncate">{user.email}</p>
                      </div>
                      <div className="flex items-center gap-2">
                        {/* Role Dropdown */}
                        {isAdmin && (
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button
                                size="sm"
                                variant="outline"
                                className="h-7 px-2 text-xs border-white/10 text-gray-400"
                              >
                                {getUserCurrentRole(user) === "admin" && <Crown className="w-3 h-3 mr-1 text-violet-400" />}
                                {getUserCurrentRole(user) === "sub_admin" && <Sparkles className="w-3 h-3 mr-1 text-indigo-400" />}
                                {getUserCurrentRole(user) === "user" && <User className="w-3 h-3 mr-1" />}
                                <ChevronDown className="w-3 h-3 ml-1" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent className="bg-gray-900 border-white/10 text-white">
                              <DropdownMenuLabel className="text-xs">Change Role</DropdownMenuLabel>
                              <DropdownMenuSeparator className="bg-white/10" />
                              {["user", "sub_admin", "admin"].map((role) => (
                                <DropdownMenuItem
                                  key={role}
                                  onClick={() => {
                                    setSelectedUserForRole(user);
                                    setSelectedRole(role);
                                    setRoleDialogOpen(true);
                                  }}
                                  disabled={getUserCurrentRole(user) === role}
                                  className="hover:bg-white/10 cursor-pointer text-xs"
                                >
                                  {role === "admin" && <Crown className="w-3 h-3 mr-2 text-violet-400" />}
                                  {role === "sub_admin" && <Sparkles className="w-3 h-3 mr-2 text-indigo-400" />}
                                  {role === "user" && <User className="w-3 h-3 mr-2" />}
                                  {role === "sub_admin" ? "Sub-Admin" : capitalize(role)}
                                </DropdownMenuItem>
                              ))}
                            </DropdownMenuContent>
                          </DropdownMenu>
                        )}

                        {/* Actions Dropdown */}
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button size="sm" variant="outline" className="h-7 px-2 border-white/10 text-gray-400">
                              <MoreVertical className="w-3 h-3" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent className="bg-gray-900 border-white/10 text-white">
                            <DropdownMenuLabel className="text-xs">Actions</DropdownMenuLabel>
                            <DropdownMenuSeparator className="bg-white/10" />
                            <DropdownMenuItem
                              onClick={() => {
                                setSelectedUserId(user.id);
                                updateUserStatus.mutate({
                                  id: user.id,
                                  status: user.status === "active" ? "suspended" : "active",
                                });
                              }}
                              disabled={updateUserStatus.isPending && selectedUserId === user.id}
                              className="hover:bg-white/10 cursor-pointer text-xs"
                            >
                              {user.status === "active" ? (
                                <><UserX className="w-3 h-3 mr-2 text-red-400" />Suspend</>
                              ) : (
                                <><UserCheck className="w-3 h-3 mr-2 text-emerald-400" />Activate</>
                              )}
                            </DropdownMenuItem>
                            <DropdownMenuItem
                              onClick={() => {
                                setSelectedUserId(user.id);
                                if (user.wallet?.isLocked) {
                                  unlockWallet.mutate(user.id);
                                } else {
                                  lockWallet.mutate(user.id);
                                }
                              }}
                              disabled={(lockWallet.isPending || unlockWallet.isPending) && selectedUserId === user.id}
                              className="hover:bg-white/10 cursor-pointer text-xs"
                            >
                              {user.wallet?.isLocked ? (
                                <><Unlock className="w-3 h-3 mr-2 text-emerald-400" />Unlock Wallet</>
                              ) : (
                                <><Lock className="w-3 h-3 mr-2 text-amber-400" />Lock Wallet</>
                              )}
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </div>
                    </div>

                    {/* Badges */}
                    <div className="flex flex-wrap gap-1.5 mb-2">
                      {(user.roles || []).map((role: string) => (
                        <Badge
                          key={role}
                          className={`text-xs ${
                            role === "admin"
                              ? "bg-violet-500/20 text-violet-400 border-violet-500/30"
                              : role === "sub_admin"
                              ? "bg-indigo-500/20 text-indigo-400 border-indigo-500/30"
                              : "bg-gray-500/20 text-gray-400 border-gray-500/30"
                          }`}
                        >
                          {role === "admin" && <Crown className="w-2.5 h-2.5 mr-1" />}
                          {role === "sub_admin" && <Sparkles className="w-2.5 h-2.5 mr-1" />}
                          {role === "sub_admin" ? "Sub-Admin" : role}
                        </Badge>
                      ))}
                      <Badge
                        className={`text-xs ${
                          user.status === "active"
                            ? "bg-emerald-500/20 text-emerald-400 border-emerald-500/30"
                            : "bg-red-500/20 text-red-400 border-red-500/30"
                        }`}
                      >
                        {user.status}
                      </Badge>
                      {user.isEmailVerified && (
                        <Badge className="text-xs bg-emerald-500/20 text-emerald-400 border-emerald-500/30">
                          <Mail className="w-2.5 h-2.5 mr-1" />
                          Verified
                        </Badge>
                      )}
                      {user.kycCompleted && (
                        <Badge className="text-xs bg-emerald-500/20 text-emerald-400 border-emerald-500/30">
                          <CheckCircle className="w-2.5 h-2.5 mr-1" />
                          KYC
                        </Badge>
                      )}
                      <Badge
                        className={`text-xs ${
                          user.wallet?.isLocked
                            ? "bg-amber-500/20 text-amber-400 border-amber-500/30"
                            : "bg-emerald-500/20 text-emerald-400 border-emerald-500/30"
                        }`}
                      >
                        {user.wallet?.isLocked ? <Lock className="w-2.5 h-2.5 mr-1" /> : <Wallet className="w-2.5 h-2.5 mr-1" />}
                        Wallet
                      </Badge>
                    </div>

                    {user.createdAt && (
                      <div className="flex items-center gap-1 text-xs text-gray-500">
                        <Calendar className="w-3 h-3" />
                        Joined {new Date(user.createdAt).toLocaleDateString()}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}

            {!isLoading && totalPages > 1 && (
              <Pagination
                currentPage={currentPage}
                totalPages={totalPages}
                totalDocs={totalDocs}
                hasNextPage={hasNextPage}
                hasPrevPage={hasPrevPage}
                onPageChange={setCurrentPage}
                itemName="users"
                className="mt-4"
              />
            )}
          </CardContent>
        </Card>
      </div>

      {/* Role Change Dialog */}
      <Dialog open={roleDialogOpen} onOpenChange={setRoleDialogOpen}>
        <DialogContent className="bg-gray-900 border-white/10 text-white max-w-sm mx-4">
          <DialogHeader>
            <DialogTitle className="text-xl font-bold">Change Role</DialogTitle>
            <DialogDescription className="text-gray-400">
              Update role for {selectedUserForRole?.firstName} {selectedUserForRole?.lastName}
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-3 mt-2">
            <div className="p-3 rounded-xl bg-white/[0.03] border border-white/[0.05]">
              <p className="text-xs text-gray-400 mb-1">New Role</p>
              <div className="flex items-center gap-2">
                {selectedRole === "admin" && <Crown className="w-4 h-4 text-violet-400" />}
                {selectedRole === "sub_admin" && <Sparkles className="w-4 h-4 text-indigo-400" />}
                {selectedRole === "user" && <User className="w-4 h-4 text-gray-400" />}
                <span className="text-white font-medium">
                  {selectedRole === "sub_admin" ? "Sub-Admin" : capitalize(selectedRole || "")}
                </span>
              </div>
            </div>

            {selectedRole === "admin" && (
              <div className="p-3 rounded-xl bg-violet-500/10 border border-violet-500/30">
                <p className="text-xs text-violet-300">Full system access including user management and settings.</p>
              </div>
            )}
            {selectedRole === "sub_admin" && (
              <div className="p-3 rounded-xl bg-indigo-500/10 border border-indigo-500/30">
                <p className="text-xs text-indigo-300">Can create and manage polls, but cannot select winners or manage users.</p>
              </div>
            )}
            {selectedRole === "user" && (
              <div className="p-3 rounded-xl bg-gray-500/10 border border-gray-500/30">
                <p className="text-xs text-gray-400">Standard user with no admin privileges.</p>
              </div>
            )}
          </div>

          <DialogFooter className="mt-4">
            <Button
              variant="outline"
              onClick={() => {
                setRoleDialogOpen(false);
                setSelectedUserForRole(null);
                setSelectedRole("");
              }}
            >
              Cancel
            </Button>
            <Button
              variant="gradient"
              onClick={handleUpdateUserRole}
              disabled={updateUserRole.isPending}
            >
              {updateUserRole.isPending ? (
                <><Loader2 className="w-4 h-4 mr-2 animate-spin" />Updating...</>
              ) : (
                "Confirm"
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
