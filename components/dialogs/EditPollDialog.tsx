'use client';

import { useState, useEffect } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Loader2, Edit } from 'lucide-react';
import { toast } from 'sonner';
import { useUpdatePoll } from '@/lib/polls';

interface EditPollDialogProps {
  isOpen: boolean;
  onClose: () => void;
  poll: {
    id: string;
    title: string;
    description: string;
  };
  onSuccess: () => void;
}

export default function EditPollDialog({
  isOpen,
  onClose,
  poll,
  onSuccess,
}: EditPollDialogProps) {
  const [title, setTitle] = useState(poll.title);
  const [description, setDescription] = useState(poll.description);
  const updatePollMutation = useUpdatePoll();

  // Reset form when poll changes
  useEffect(() => {
    setTitle(poll.title);
    setDescription(poll.description);
  }, [poll.title, poll.description]);

  const handleSubmit = () => {
    if (!title.trim() || !description.trim()) {
      toast.error('Title and description are required');
      return;
    }

    updatePollMutation.mutate(
      {
        id: poll.id,
        data: {
          title: title.trim(),
          description: description.trim(),
        },
      },
      {
        onSuccess: () => {
          toast.success('Poll updated successfully');
          onSuccess();
          onClose();
        },
        onError: (error: any) => {
          console.error('Error updating poll:', error);
          toast.error(
            error?.response?.data?.message || 'Failed to update poll'
          );
        },
      }
    );
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className='bg-black/95 backdrop-blur-xl border-white/10 text-white max-w-lg'>
        <DialogHeader>
          <DialogTitle className='text-xl sm:text-2xl font-bold bg-gradient-to-r from-violet-400 to-pink-400 bg-clip-text text-transparent flex items-center gap-2'>
            Edit Poll
          </DialogTitle>
          <DialogDescription className='text-gray-400'>
            Update the poll title and description
          </DialogDescription>
        </DialogHeader>

        <div className='space-y-4 mt-4'>
          <div className='space-y-2'>
            <Label htmlFor='title' className='text-gray-300'>
              Poll Title
            </Label>
            <Input
              id='title'
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder='Enter poll title'
              className='bg-white/5 border-white/10 text-white placeholder-gray-500 rounded-xl'
              disabled={updatePollMutation.isPending}
            />
          </div>

          <div className='space-y-2'>
            <Label htmlFor='description' className='text-gray-300'>
              Poll Description
            </Label>
            <Textarea
              id='description'
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder='Enter poll description'
              className='bg-white/5 border-white/10 text-white placeholder-gray-500 rounded-xl min-h-[100px]'
              disabled={updatePollMutation.isPending}
            />
          </div>

          <div className='flex gap-3 pt-4'>
            <Button
              variant='outline'
              onClick={onClose}
              className='flex-1 border-white/20 text-white hover:bg-white/10'
              disabled={updatePollMutation.isPending}
            >
              Cancel
            </Button>
            <Button
              onClick={handleSubmit}
              disabled={updatePollMutation.isPending || !title.trim() || !description.trim()}
              className='flex-1 bg-gradient-to-r from-violet-500 to-pink-500 hover:from-violet-600 hover:to-pink-600'
            >
              {updatePollMutation.isPending ? (
                <>
                  <Loader2 className='w-4 h-4 mr-2 animate-spin' />
                  Updating...
                </>
              ) : (
                'Update Poll'
              )}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
