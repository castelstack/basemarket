"use client";

import {
  useAllPolls,
  useClosePoll,
  useCancelPoll,
  useDeletePoll,
  useResolvePoll,
} from "@/lib/polls";
import { useAuthStore } from "@/stores/authStore";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { Pagination } from "@/components/ui/pagination";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Label } from "@/components/ui/label";
import {
  CheckCircle,
  XCircle,
  Trash2,
  Crown,
  Edit,
  Eye,
  Activity,
  BarChart3,
  Calendar,
  Plus,
  AlertTriangle,
  Clock,
  Loader2,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { toast } from "sonner";

export default function AdminPollsPage() {
  const { isAdmin } = useAuthStore();
  const router = useRouter();
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;
  const { data, isLoading, isError } = useAllPolls({ page: currentPage, limit: itemsPerPage });
  const closePollMutation = useClosePoll();
  const cancelPollMutation = useCancelPoll();
  const deletePollMutation = useDeletePoll();
  const resolvePollMutation = useResolvePoll();

  const [selectedPoll, setSelectedPoll] = useState<any>(null);
  const [adminAction, setAdminAction] = useState<"close" | "resolve" | "cancel" | "delete">("close");
  const [isAdminDialogOpen, setIsAdminDialogOpen] = useState(false);
  const [selectedWinner, setSelectedWinner] = useState("");

  useEffect(() => {
    if (!isAdmin) router.replace("/");
  }, [isAdmin, router]);

  if (!isAdmin) return null;

  const responseData = data?.data as any;
  const polls = responseData?.docs || [];
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
          <p className="text-red-400 mb-4">Failed to load polls</p>
          <Button onClick={() => window.location.reload()}>Try Again</Button>
        </div>
      </div>
    );
  }

  const activePolls = polls.filter((p: any) => p.status === "active").length;
  const closedPolls = polls.filter((p: any) => p.status === "closed").length;

  const handleAdminAction = () => {
    if (!selectedPoll) return;
    const isPending = closePollMutation.isPending || resolvePollMutation.isPending || cancelPollMutation.isPending || deletePollMutation.isPending;
    if (isPending) return;

    switch (adminAction) {
      case "close":
        closePollMutation.mutate(selectedPoll.id, {
          onSuccess: () => {
            setIsAdminDialogOpen(false);
            setSelectedPoll(null);
            toast.success("Poll closed");
          },
          onError: (error: any) => toast.error(error?.message || "Failed to close poll"),
        });
        break;
      case "resolve":
        if (!selectedWinner) {
          toast.error("Please select a winning option");
          return;
        }
        const winningOption = selectedPoll.options.find((opt: any) => opt.text === selectedWinner);
        if (!winningOption) return;

        if (selectedPoll.status === "active") {
          closePollMutation.mutate(selectedPoll.id, {
            onSuccess: () => {
              resolvePollMutation.mutate(
                { id: selectedPoll.id, data: { correctOptionId: winningOption.id || winningOption._id } },
                {
                  onSuccess: () => {
                    setIsAdminDialogOpen(false);
                    setSelectedPoll(null);
                    setSelectedWinner("");
                    toast.success("Poll resolved");
                  },
                  onError: (error: any) => toast.error(error?.message || "Failed to resolve"),
                }
              );
            },
            onError: (error: any) => toast.error(error?.message || "Failed to close poll"),
          });
        } else {
          resolvePollMutation.mutate(
            { id: selectedPoll.id, data: { correctOptionId: winningOption.id || winningOption._id } },
            {
              onSuccess: () => {
                setIsAdminDialogOpen(false);
                setSelectedPoll(null);
                setSelectedWinner("");
                toast.success("Poll resolved");
              },
              onError: (error: any) => toast.error(error?.message || "Failed to resolve"),
            }
          );
        }
        break;
      case "cancel":
        cancelPollMutation.mutate(selectedPoll.id, {
          onSuccess: () => {
            setIsAdminDialogOpen(false);
            setSelectedPoll(null);
            toast.success("Poll cancelled");
          },
          onError: (error: any) => toast.error(error?.message || "Failed to cancel"),
        });
        break;
      case "delete":
        deletePollMutation.mutate(selectedPoll.id, {
          onSuccess: () => {
            setIsAdminDialogOpen(false);
            setSelectedPoll(null);
            toast.success("Poll deleted");
          },
          onError: (error: any) => toast.error(error?.message || "Failed to delete"),
        });
        break;
    }
  };

  const isPending = closePollMutation.isPending || resolvePollMutation.isPending || cancelPollMutation.isPending || deletePollMutation.isPending;

  return (
    <div className="min-h-screen bg-black">
      {/* Background */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[600px] h-[600px] bg-violet-600/10 rounded-full blur-[120px]" />
      </div>

      <div className="relative px-4 sm:px-6 py-6 max-w-3xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <Badge className="bg-violet-500/20 text-violet-400 border-violet-500/30 text-xs">
                <Crown className="w-3 h-3 mr-1" />
                Admin
              </Badge>
            </div>
            <h1 className="text-2xl font-black text-white">Polls</h1>
            <p className="text-gray-500 text-sm">Manage all predictions</p>
          </div>
          <Link href="/admin/create">
            <Button
              size="sm"
              className="bg-gradient-to-r from-violet-500 to-indigo-500 hover:from-violet-600 hover:to-indigo-600 font-bold rounded-xl h-10 px-4"
            >
              <Plus className="w-4 h-4 mr-1" />
              Create
            </Button>
          </Link>
        </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-3 gap-3 mb-6">
          <div className="p-3 rounded-xl bg-white/[0.03] border border-white/[0.06] text-center">
            <BarChart3 className="w-4 h-4 text-violet-400 mx-auto mb-1" />
            <p className="text-lg font-bold text-white">{polls.length}</p>
            <p className="text-xs text-gray-500">Total</p>
          </div>
          <div className="p-3 rounded-xl bg-white/[0.03] border border-white/[0.06] text-center">
            <Activity className="w-4 h-4 text-emerald-400 mx-auto mb-1" />
            <p className="text-lg font-bold text-white">{activePolls}</p>
            <p className="text-xs text-gray-500">Active</p>
          </div>
          <div className="p-3 rounded-xl bg-white/[0.03] border border-white/[0.06] text-center">
            <CheckCircle className="w-4 h-4 text-amber-400 mx-auto mb-1" />
            <p className="text-lg font-bold text-white">{closedPolls}</p>
            <p className="text-xs text-gray-500">Closed</p>
          </div>
        </div>

        {/* Polls List */}
        <Card className="bg-white/[0.03] border-white/[0.06]">
          <CardHeader className="pb-3">
            <CardTitle className="text-white flex items-center gap-2 text-base">
              <BarChart3 className="w-4 h-4 text-violet-400" />
              All Polls
            </CardTitle>
          </CardHeader>
          <CardContent>
            {polls.length === 0 ? (
              <div className="text-center py-12">
                <BarChart3 className="w-10 h-10 text-gray-600 mx-auto mb-3" />
                <p className="text-gray-400 text-sm mb-4">No polls found</p>
                <Link href="/admin/create">
                  <Button size="sm" className="bg-violet-500 hover:bg-violet-600">
                    <Plus className="w-4 h-4 mr-1" />
                    Create Poll
                  </Button>
                </Link>
              </div>
            ) : (
              <div className="space-y-3">
                {polls.map((poll: any) => (
                  <div
                    key={poll.id}
                    className="p-4 rounded-xl bg-white/[0.02] border border-white/[0.05] hover:bg-white/[0.04] transition-colors"
                  >
                    <div className="flex items-start gap-2 mb-2 flex-wrap">
                      <Badge className="bg-violet-500/20 text-violet-400 border-violet-500/30 text-xs">
                        {poll.category}
                      </Badge>
                      <Badge
                        className={`text-xs ${
                          poll.status === "active"
                            ? "bg-emerald-500/20 text-emerald-400 border-emerald-500/30"
                            : poll.status === "closed"
                            ? "bg-amber-500/20 text-amber-400 border-amber-500/30"
                            : poll.status === "resolved"
                            ? "bg-blue-500/20 text-blue-400 border-blue-500/30"
                            : "bg-gray-500/20 text-gray-400 border-gray-500/30"
                        }`}
                      >
                        {poll.status}
                      </Badge>
                    </div>

                    <h3 className="text-white font-semibold mb-1 line-clamp-1">{poll.title}</h3>
                    <p className="text-gray-500 text-xs mb-3 line-clamp-1">{poll.description}</p>

                    <div className="flex items-center gap-1 text-xs text-gray-500 mb-3">
                      <Calendar className="w-3 h-3" />
                      {new Date(poll.createdAt).toLocaleDateString()}
                    </div>

                    <div className="flex flex-wrap gap-2">
                      <Button
                        size="sm"
                        variant="outline"
                        className="h-8 px-2 text-xs border-white/10 text-gray-400 hover:text-white rounded-lg"
                        onClick={() => router.push(`/polls/${poll.id}`)}
                      >
                        <Eye className="w-3 h-3 mr-1" />
                        View
                      </Button>
                      <Button
                        size="sm"
                        className="h-8 px-2 text-xs bg-indigo-500 hover:bg-indigo-600 rounded-lg"
                        onClick={() => router.push(`/admin/edit/${poll.id}`)}
                      >
                        <Edit className="w-3 h-3 mr-1" />
                        Edit
                      </Button>
                      {poll.status === "active" && (
                        <>
                          <Button
                            size="sm"
                            className="h-8 px-2 text-xs bg-amber-500 hover:bg-amber-600 rounded-lg"
                            onClick={() => {
                              setSelectedPoll(poll);
                              setAdminAction("close");
                              setIsAdminDialogOpen(true);
                            }}
                          >
                            <Clock className="w-3 h-3 mr-1" />
                            Close
                          </Button>
                          <Button
                            size="sm"
                            className="h-8 px-2 text-xs bg-emerald-500 hover:bg-emerald-600 rounded-lg"
                            onClick={() => {
                              setSelectedPoll(poll);
                              setAdminAction("resolve");
                              setIsAdminDialogOpen(true);
                            }}
                          >
                            <CheckCircle className="w-3 h-3 mr-1" />
                            Winner
                          </Button>
                          <Button
                            size="sm"
                            className="h-8 px-2 text-xs bg-orange-500 hover:bg-orange-600 rounded-lg"
                            onClick={() => {
                              setSelectedPoll(poll);
                              setAdminAction("cancel");
                              setIsAdminDialogOpen(true);
                            }}
                          >
                            <XCircle className="w-3 h-3 mr-1" />
                            Cancel
                          </Button>
                        </>
                      )}
                      {poll.status === "closed" && (
                        <Button
                          size="sm"
                          className="h-8 px-2 text-xs bg-emerald-500 hover:bg-emerald-600 rounded-lg"
                          onClick={() => {
                            setSelectedPoll(poll);
                            setAdminAction("resolve");
                            setIsAdminDialogOpen(true);
                          }}
                        >
                          <CheckCircle className="w-3 h-3 mr-1" />
                          Winner
                        </Button>
                      )}
                      <Button
                        size="sm"
                        className="h-8 px-2 text-xs bg-red-500 hover:bg-red-600 rounded-lg"
                        onClick={() => {
                          setSelectedPoll(poll);
                          setAdminAction("delete");
                          setIsAdminDialogOpen(true);
                        }}
                      >
                        <Trash2 className="w-3 h-3 mr-1" />
                        Delete
                      </Button>
                    </div>
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
                itemName="polls"
                className="mt-4"
              />
            )}
          </CardContent>
        </Card>
      </div>

      {/* Admin Action Dialog */}
      <Dialog open={isAdminDialogOpen} onOpenChange={setIsAdminDialogOpen}>
        <DialogContent className="bg-gray-900 border-white/10 text-white max-w-md mx-4">
          <DialogHeader>
            <DialogTitle className="text-xl font-bold flex items-center gap-2">
              {adminAction === "close" && <><Clock className="w-5 h-5 text-amber-400" />Close Poll</>}
              {adminAction === "resolve" && <><CheckCircle className="w-5 h-5 text-emerald-400" />Select Winner</>}
              {adminAction === "cancel" && <><XCircle className="w-5 h-5 text-orange-400" />Cancel Poll</>}
              {adminAction === "delete" && <><Trash2 className="w-5 h-5 text-red-400" />Delete Poll</>}
            </DialogTitle>
            <DialogDescription className="text-gray-400 line-clamp-2">
              {selectedPoll?.title}
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 mt-2">
            {adminAction === "close" && (
              <div className="p-3 rounded-xl bg-amber-500/10 border border-amber-500/30">
                <p className="text-sm text-amber-300">
                  This will close the poll and prevent new stakes. You can still select a winner after.
                </p>
              </div>
            )}

            {adminAction === "resolve" && (
              <div className="space-y-2">
                <Label className="text-sm text-gray-300">Select Winner</Label>
                <div className="space-y-2 max-h-48 overflow-y-auto">
                  {selectedPoll?.options.map((option: any) => (
                    <Button
                      key={option.id || option.text}
                      variant={selectedWinner === option.text ? "default" : "outline"}
                      onClick={() => setSelectedWinner(option.text)}
                      className={`w-full justify-start p-3 text-left rounded-xl text-sm ${
                        selectedWinner === option.text
                          ? "bg-emerald-500 hover:bg-emerald-600 text-white"
                          : "bg-white/[0.03] border-white/[0.06] text-gray-300 hover:bg-white/10"
                      }`}
                    >
                      <CheckCircle className="w-4 h-4 mr-2" />
                      {option.text}
                    </Button>
                  ))}
                </div>
              </div>
            )}

            {adminAction === "cancel" && (
              <div className="p-3 rounded-xl bg-orange-500/10 border border-orange-500/30">
                <p className="text-sm text-orange-300">
                  This will cancel the poll. Stakes will be refunded.
                </p>
              </div>
            )}

            {adminAction === "delete" && (
              <div className="p-3 rounded-xl bg-red-500/10 border border-red-500/30">
                <p className="text-sm text-red-300">
                  This will permanently delete the poll. This cannot be undone.
                </p>
              </div>
            )}

            <div className="flex gap-3 pt-2">
              <Button
                variant="outline"
                onClick={() => setIsAdminDialogOpen(false)}
                className="flex-1 h-11 border-white/10 text-gray-400 hover:text-white hover:bg-white/10 rounded-xl"
              >
                Cancel
              </Button>
              <Button
                onClick={handleAdminAction}
                disabled={isPending || (adminAction === "resolve" && !selectedWinner)}
                className={`flex-1 h-11 font-bold rounded-xl ${
                  adminAction === "close"
                    ? "bg-amber-500 hover:bg-amber-600"
                    : adminAction === "resolve"
                    ? "bg-emerald-500 hover:bg-emerald-600"
                    : adminAction === "cancel"
                    ? "bg-orange-500 hover:bg-orange-600"
                    : "bg-red-500 hover:bg-red-600"
                }`}
              >
                {isPending ? (
                  <><Loader2 className="w-4 h-4 mr-2 animate-spin" />Processing...</>
                ) : adminAction === "close" ? (
                  "Close Poll"
                ) : adminAction === "resolve" ? (
                  "Declare Winner"
                ) : adminAction === "cancel" ? (
                  "Cancel Poll"
                ) : (
                  "Delete Poll"
                )}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
