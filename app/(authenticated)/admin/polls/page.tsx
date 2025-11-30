'use client';

import {
  useAllPolls,
  useClosePoll,
  useCancelPoll,
  useDeletePoll,
  useResolvePoll,
} from '@/lib/polls';
import { useAuthStore } from '@/stores/authStore';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { Pagination } from '@/components/ui/pagination';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { Label } from '@/components/ui/label';
import {
  CheckCircle,
  XCircle,
  Trash2,
  Crown,
  Shield,
  Edit,
  Eye,
  Activity,
  BarChart3,
  Users,
  Calendar,
  Sparkles,
  Plus,
  AlertTriangle,
  Clock,
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { toast } from 'sonner';

export default function AdminPollsPage() {
  const { user, isAdmin } = useAuthStore();
  const router = useRouter();
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;
  const { data, isLoading, isError } = useAllPolls({ page: currentPage, limit: itemsPerPage });
  const closePollMutation = useClosePoll();
  const cancelPollMutation = useCancelPoll();
  const deletePollMutation = useDeletePoll();
  const resolvePollMutation = useResolvePoll();

  const [selectedPoll, setSelectedPoll] = useState<any>(null);
  const [adminAction, setAdminAction] = useState<'close' | 'resolve' | 'cancel' | 'delete'>(
    'close'
  );
  const [isAdminDialogOpen, setIsAdminDialogOpen] = useState(false);
  const [selectedWinner, setSelectedWinner] = useState('');

  useEffect(() => {
    if (!isAdmin) {
      router.replace('/');
    }
  }, [isAdmin, router]);

  if (!isAdmin) return null;

  const responseData = data?.data as any;
  const polls = responseData?.docs || [];
  const totalPages = responseData?.totalPages || 1;
  const hasNextPage = responseData?.hasNextPage || false;
  const hasPrevPage = responseData?.hasPrevPage || false;
  const totalDocs = responseData?.totalDocs || 0;

  // Loading and error states with modern design
  if (isLoading) {
    return (
      <div className='min-h-screen bg-black flex items-center justify-center'>
        <div className='text-center'>
          <div className='animate-spin rounded-full h-12 w-12 border-b-2 border-violet-400 mb-4'></div>
          <p className='text-gray-400'>Loading polls...</p>
        </div>
      </div>
    );
  }

  if (isError) {
    return (
      <div className='min-h-screen bg-black flex items-center justify-center'>
        <div className='text-center'>
          <AlertTriangle className='w-12 h-12 text-red-400 mx-auto mb-4' />
          <p className='text-red-400 text-lg mb-4'>Failed to load polls</p>
          <Button onClick={() => window.location.reload()}>Try Again</Button>
        </div>
      </div>
    );
  }

  // Get poll stats
  const activePolls = polls.filter((p: any) => p.status === 'active').length;
  const closedPolls = polls.filter((p: any) => p.status === 'closed').length;
  const totalPolls = polls.length;

  // Admin poll actions
  const handleAdminAction = () => {
    if (!selectedPoll) return;
    switch (adminAction) {
      case 'close':
        // Just close the poll (stop staking) without selecting winner
        closePollMutation.mutate(selectedPoll.id, {
          onSuccess: () => {
            setIsAdminDialogOpen(false);
            setSelectedPoll(null);
            toast.success('Poll closed successfully! Stakes are now locked.');
          },
          onError: (error: any) => {
            toast.error(error?.message || 'Failed to close poll');
          },
        });
        break;
      case 'resolve':
        if (!selectedWinner) {
          toast.error('Please select a winning option');
          return;
        }
        // First close the poll if it's still active, then resolve it
        if (selectedPoll.status === 'active') {
          closePollMutation.mutate(selectedPoll.id, {
            onSuccess: () => {
              // After closing, resolve with winner
              const winningOption = selectedPoll.options.find((opt: any) => opt.text === selectedWinner);
              if (winningOption) {
                resolvePollMutation.mutate(
                  { 
                    id: selectedPoll.id, 
                    data: { correctOptionId: winningOption.id || winningOption._id } 
                  },
                  {
                    onSuccess: () => {
                      setIsAdminDialogOpen(false);
                      setSelectedPoll(null);
                      setSelectedWinner('');
                      toast.success('Poll resolved successfully! Winner declared.');
                    },
                    onError: (error: any) => {
                      toast.error(error?.message || 'Failed to resolve poll');
                    },
                  }
                );
              }
            },
            onError: (error: any) => {
              toast.error(error?.message || 'Failed to close poll before resolving');
            },
          });
        } else {
          // Poll already closed, just resolve it
          const winningOption = selectedPoll.options.find((opt: any) => opt.text === selectedWinner);
          if (winningOption) {
            resolvePollMutation.mutate(
              { 
                id: selectedPoll.id, 
                data: { correctOptionId: winningOption.id || winningOption._id } 
              },
              {
                onSuccess: () => {
                  setIsAdminDialogOpen(false);
                  setSelectedPoll(null);
                  setSelectedWinner('');
                  toast.success('Poll resolved successfully! Winner declared.');
                },
                onError: (error: any) => {
                  toast.error(error?.message || 'Failed to resolve poll');
                },
              }
            );
          }
        }
        break;
      case 'cancel':
        cancelPollMutation.mutate(selectedPoll.id, {
          onSuccess: () => {
            setIsAdminDialogOpen(false);
            setSelectedPoll(null);
            setSelectedWinner('');
            toast.success('Poll cancelled successfully!');
          },
          onError: (error: any) => {
            toast.error(error?.message || 'Failed to cancel poll');
          },
        });
        break;
      case 'delete':
        deletePollMutation.mutate(selectedPoll.id, {
          onSuccess: () => {
            setIsAdminDialogOpen(false);
            setSelectedPoll(null);
            setSelectedWinner('');
            toast.success('Poll deleted successfully!');
          },
          onError: (error: any) => {
            toast.error(error?.message || 'Failed to delete poll');
          },
        });
        break;
    }
  };

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
                <div className='flex items-center gap-2 px-3 py-1.5 rounded-full bg-gradient-to-r from-purple-500/20 to-pink-500/20 border border-purple-500/30'>
                  <Shield className='w-4 h-4 text-purple-400' />
                  <span className='text-sm font-medium text-purple-400'>
                    Poll Management
                  </span>
                </div>
                <Badge className='bg-amber-500/20 text-amber-400 border-amber-500/30'>
                  <Crown className='w-3 h-3 mr-1' />
                  Admin Panel
                </Badge>
              </div>

              <h1 className='text-3xl sm:text-4xl lg:text-5xl font-black mb-2 sm:mb-3'>
                <span className='bg-gradient-to-r from-violet-400 via-pink-400 to-orange-400 bg-clip-text text-transparent'>
                  Manage All Polls
                </span>
              </h1>

              <p className='text-lg sm:text-xl text-gray-400 mb-6 sm:mb-8 max-w-2xl'>
                View, edit, and manage all prediction polls on the platform
              </p>

              <div className='flex flex-wrap gap-4'>
                <Link href='/admin/create'>
                  <Button className='group relative px-8 py-6 rounded-2xl bg-gradient-to-r from-violet-500 to-pink-500 hover:from-violet-600 hover:to-pink-600 text-white font-bold text-lg shadow-2xl shadow-purple-500/25 transform hover:scale-105 transition-all'>
                    <Plus className='w-5 h-5 mr-2' />
                    Create New Poll
                  </Button>
                </Link>
                <Link href='/admin/dashboard'>
                  <Button
                    variant='outline'
                    className='px-8 py-6 rounded-2xl border-white/20 text-white hover:bg-white/10 font-semibold text-lg'
                  >
                    <BarChart3 className='w-5 h-5 mr-2' />
                    View Dashboard
                  </Button>
                </Link>
              </div>
            </div>
          </div>
        </div>

        {/* Quick Stats */}
        <div className='grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mb-8'>
          <Card className='bg-white/5 backdrop-blur-sm border-white/10'>
            <CardContent className='p-6'>
              <div className='flex items-center gap-4'>
                <div className='p-3 rounded-xl bg-gradient-to-r from-blue-500/20 to-cyan-500/20'>
                  <BarChart3 className='w-6 h-6 text-blue-400' />
                </div>
                <div>
                  <p className='text-gray-400 text-sm'>Total Polls</p>
                  <p className='text-2xl font-bold text-white'>{totalPolls}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className='bg-white/5 backdrop-blur-sm border-white/10'>
            <CardContent className='p-6'>
              <div className='flex items-center gap-4'>
                <div className='p-3 rounded-xl bg-gradient-to-r from-emerald-500/20 to-teal-500/20'>
                  <Activity className='w-6 h-6 text-emerald-400' />
                </div>
                <div>
                  <p className='text-gray-400 text-sm'>Active Polls</p>
                  <p className='text-2xl font-bold text-white'>{activePolls}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className='bg-white/5 backdrop-blur-sm border-white/10'>
            <CardContent className='p-6'>
              <div className='flex items-center gap-4'>
                <div className='p-3 rounded-xl bg-gradient-to-r from-amber-500/20 to-orange-500/20'>
                  <CheckCircle className='w-6 h-6 text-amber-400' />
                </div>
                <div>
                  <p className='text-gray-400 text-sm'>Closed Polls</p>
                  <p className='text-2xl font-bold text-white'>{closedPolls}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Polls Table */}
        <Card className='bg-white/5 backdrop-blur-sm border-white/10'>
          <CardHeader>
            <CardTitle className='text-white flex items-center gap-2'>
              <BarChart3 className='w-5 h-5 text-violet-400' />
              All Polls
            </CardTitle>
          </CardHeader>
          <CardContent>
            {polls.length === 0 ? (
              <div className='text-center py-12'>
                <Sparkles className='w-12 h-12 text-gray-500 mx-auto mb-4' />
                <h3 className='text-lg font-semibold text-white mb-2'>No polls found</h3>
                <p className='text-gray-400 mb-6'>Create your first poll to get started</p>
                <Link href='/admin/create'>
                  <Button className='bg-gradient-to-r from-violet-500 to-pink-500 hover:from-violet-600 hover:to-pink-600'>
                    <Plus className='w-4 h-4 mr-2' />
                    Create Poll
                  </Button>
                </Link>
              </div>
            ) : (
              <div className='space-y-4'>
                {polls.map((poll: any) => (
                  <div
                    key={poll.id}
                    className='group p-6 rounded-2xl bg-white/5 backdrop-blur-sm border border-white/10 hover:bg-white/10 transition-all'
                  >
                    <div className='flex items-start justify-between mb-4'>
                      <div className='flex-1'>
                        <div className='flex items-center gap-2 mb-3'>
                          <Badge className='bg-gradient-to-r from-violet-500/20 to-purple-500/20 text-purple-400 border-purple-500/30'>
                            {poll.category}
                          </Badge>
                          <Badge
                            className={`${
                              poll.status === 'active'
                                ? 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30'
                                : poll.status === 'closed'
                                ? 'bg-amber-500/20 text-amber-400 border-amber-500/30'
                                : poll.status === 'resolved'
                                ? 'bg-blue-500/20 text-blue-400 border-blue-500/30'
                                : 'bg-gray-500/20 text-gray-400 border-gray-500/30'
                            }`}
                          >
                            {poll.status}
                          </Badge>
                        </div>
                        <h3 className='text-xl font-bold text-white mb-2 group-hover:text-transparent group-hover:bg-gradient-to-r group-hover:from-violet-400 group-hover:to-pink-400 group-hover:bg-clip-text transition-all'>
                          {poll.title}
                        </h3>
                        <p className='text-gray-400 text-sm mb-4 line-clamp-2'>
                          {poll.description}
                        </p>
                        <div className='flex items-center gap-2 text-xs text-gray-500'>
                          <Calendar className='w-4 h-4' />
                          Created {new Date(poll.createdAt).toLocaleDateString()}
                        </div>
                      </div>
                    </div>

                    <div className='flex flex-wrap gap-3'>
                      <Button
                        size='sm'
                        variant='outline'
                        className='border-white/20 text-white hover:bg-white/10'
                        onClick={() => router.push(`/polls/${poll.id}`)}
                      >
                        <Eye className='w-4 h-4 mr-2' />
                        View
                      </Button>
                      <Button
                        size='sm'
                        className='bg-blue-600 hover:bg-blue-700 text-white'
                        onClick={() => router.push(`/admin/edit/${poll.id}`)}
                      >
                        <Edit className='w-4 h-4 mr-2' />
                        Edit
                      </Button>
                      {poll.status === 'active' && (
                        <>
                          <Button
                            size='sm'
                            className='bg-amber-600 hover:bg-amber-700 text-white'
                            onClick={() => {
                              setSelectedPoll(poll);
                              setAdminAction('close');
                              setIsAdminDialogOpen(true);
                            }}
                          >
                            <Clock className='w-4 h-4 mr-2' />
                            Close Poll
                          </Button>
                          <Button
                            size='sm'
                            className='bg-emerald-600 hover:bg-emerald-700 text-white'
                            onClick={() => {
                              setSelectedPoll(poll);
                              setAdminAction('resolve');
                              setIsAdminDialogOpen(true);
                            }}
                          >
                            <CheckCircle className='w-4 h-4 mr-2' />
                            Pick Winner
                          </Button>
                        </>
                      )}
                      {poll.status === 'closed' && (
                        <Button
                          size='sm'
                          className='bg-emerald-600 hover:bg-emerald-700 text-white'
                          onClick={() => {
                            setSelectedPoll(poll);
                            setAdminAction('resolve');
                            setIsAdminDialogOpen(true);
                          }}
                        >
                          <CheckCircle className='w-4 h-4 mr-2' />
                          Pick Winner
                        </Button>
                      )}
                      {poll.status === 'active' && (
                        <Button
                          size='sm'
                          className='bg-amber-600 hover:bg-amber-700 text-white'
                          onClick={() => {
                            setSelectedPoll(poll);
                            setAdminAction('cancel');
                            setIsAdminDialogOpen(true);
                          }}
                        >
                          <XCircle className='w-4 h-4 mr-2' />
                          Cancel
                        </Button>
                      )}
                      <Button
                        size='sm'
                        variant='destructive'
                        className='bg-red-600 hover:bg-red-700 text-white'
                        onClick={() => {
                          setSelectedPoll(poll);
                          setAdminAction('delete');
                          setIsAdminDialogOpen(true);
                        }}
                      >
                        <Trash2 className='w-4 h-4 mr-2' />
                        Delete
                      </Button>
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
                itemName="polls"
              />
            )}
          </CardContent>
        </Card>
      </div>

      {/* Admin Action Dialog */}
      <Dialog open={isAdminDialogOpen} onOpenChange={setIsAdminDialogOpen}>
        <DialogContent className='bg-black/95 backdrop-blur-sm border-white/20 text-white rounded-3xl shadow-2xl'>
          <DialogHeader>
            <DialogTitle className='text-2xl font-bold'>
              {adminAction === 'close' && (
                <span className='flex items-center gap-2'>
                  <Clock className='w-6 h-6 text-amber-400' />
                  Close Poll
                </span>
              )}
              {adminAction === 'resolve' && (
                <span className='flex items-center gap-2'>
                  <CheckCircle className='w-6 h-6 text-emerald-400' />
                  Select Winner & Resolve Poll
                </span>
              )}
              {adminAction === 'cancel' && (
                <span className='flex items-center gap-2'>
                  <XCircle className='w-6 h-6 text-amber-400' />
                  Cancel Poll
                </span>
              )}
              {adminAction === 'delete' && (
                <span className='flex items-center gap-2'>
                  <Trash2 className='w-6 h-6 text-red-400' />
                  Delete Poll
                </span>
              )}
            </DialogTitle>
            <DialogDescription className='text-gray-400 text-lg'>
              {selectedPoll?.title}
            </DialogDescription>
          </DialogHeader>
          <div className='space-y-6'>
            {adminAction === 'close' && (
              <div className='p-6 bg-gradient-to-r from-amber-500/10 to-orange-500/10 rounded-2xl border border-amber-500/20'>
                <div className='flex items-center gap-3 mb-3'>
                  <Clock className='w-6 h-6 text-amber-400' />
                  <h3 className='text-amber-400 font-semibold'>Close Poll</h3>
                </div>
                <p className='text-amber-200'>
                  This will close the poll and prevent any new stakes from being placed. 
                  You can still select a winner and resolve the poll after closing.
                </p>
              </div>
            )}
            {adminAction === 'resolve' && (
              <div>
                <Label className='text-gray-300 mb-4 block text-lg font-semibold'>
                  Select Winning Option
                </Label>
                <div className='space-y-3'>
                  {selectedPoll?.options.map((option: any) => (
                    <Button
                      key={option.id || option.text}
                      variant={selectedWinner === option.text ? 'default' : 'outline'}
                      onClick={() => setSelectedWinner(option.text)}
                      className={`w-full justify-start p-4 text-left rounded-xl ${
                        selectedWinner === option.text
                          ? 'bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-600 hover:to-teal-600 text-white border-emerald-500/50'
                          : 'bg-white/5 border-white/20 text-gray-300 hover:bg-white/10'
                      }`}
                    >
                      <CheckCircle className='w-5 h-5 mr-3' />
                      {option.text}
                    </Button>
                  ))}
                </div>
              </div>
            )}
            {adminAction === 'cancel' && (
              <div className='p-6 bg-gradient-to-r from-amber-500/10 to-orange-500/10 rounded-2xl border border-amber-500/20'>
                <div className='flex items-center gap-3 mb-3'>
                  <AlertTriangle className='w-6 h-6 text-amber-400' />
                  <h3 className='text-amber-400 font-semibold'>Warning</h3>
                </div>
                <p className='text-amber-200'>
                 {` This will cancel the poll and mark it as "no winner". All stakes will be considered lost.`}
                </p>
              </div>
            )}
            {adminAction === 'delete' && (
              <div className='p-6 bg-gradient-to-r from-red-500/10 to-pink-500/10 rounded-2xl border border-red-500/20'>
                <div className='flex items-center gap-3 mb-3'>
                  <AlertTriangle className='w-6 h-6 text-red-400' />
                  <h3 className='text-red-400 font-semibold'>Danger Zone</h3>
                </div>
                <p className='text-red-200'>
                  This will permanently delete the poll and all associated data. This action cannot be undone.
                </p>
              </div>
            )}
            <div className='flex gap-4 pt-6'>
              <Button
                variant='outline'
                onClick={() => setIsAdminDialogOpen(false)}
                className='flex-1 border-white/20 text-gray-300 hover:bg-white/10 rounded-xl py-4 text-lg font-semibold'
              >
                Cancel
              </Button>
              <Button
                onClick={handleAdminAction}
                disabled={adminAction === 'resolve' && !selectedWinner}
                className={`flex-1 rounded-xl py-4 font-bold text-lg shadow-lg transition-all transform hover:scale-105 ${
                  adminAction === 'close'
                    ? 'bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 shadow-amber-500/25'
                    : adminAction === 'resolve'
                    ? 'bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-600 hover:to-teal-600 shadow-emerald-500/25'
                    : adminAction === 'cancel'
                    ? 'bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 shadow-amber-500/25'
                    : 'bg-gradient-to-r from-red-500 to-pink-500 hover:from-red-600 hover:to-pink-600 shadow-red-500/25'
                }`}
              >
                {adminAction === 'close' && (
                  <span className='flex items-center gap-2'>
                    <Clock className='w-5 h-5' />
                    Close Poll
                  </span>
                )}
                {adminAction === 'resolve' && (
                  <span className='flex items-center gap-2'>
                    <CheckCircle className='w-5 h-5' />
                    Declare Winner & Resolve
                  </span>
                )}
                {adminAction === 'cancel' && (
                  <span className='flex items-center gap-2'>
                    <XCircle className='w-5 h-5' />
                    Cancel Poll
                  </span>
                )}
                {adminAction === 'delete' && (
                  <span className='flex items-center gap-2'>
                    <Trash2 className='w-5 h-5' />
                    Delete Forever
                  </span>
                )}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
