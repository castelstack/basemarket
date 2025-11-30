'use client';

import { CONTESTANTS } from '@/constants/contestants';
import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useForm, useFieldArray } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useAuthStore } from '@/stores/authStore';
import { usePollById, useUpdatePoll } from '@/lib/polls';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Plus,
  Minus,
  Calendar,
  Sparkles,
  Clock,
  Edit,
  Crown,
  ArrowLeft,
  Save,
  AlertTriangle,
} from 'lucide-react';
import { toast } from 'sonner';
import Link from 'next/link';

const editPollSchema = z.object({
  title: z.string().min(10, 'Title must be at least 10 characters'),
  description: z
    .string()
    .min(20, 'Description must be at least 20 characters'),
  category: z.enum(['eviction', 'hoh', 'task', 'general']).optional(),
  options: z.array(z.string()).optional(),
  endType: z.enum(['scheduled', 'manual']).optional(),
  scheduledEndTime: z.string().optional(),
});

type EditPollForm = z.infer<typeof editPollSchema>;

const EditPollPage = ({ params }: { params: { id: string } }) => {
  const router = useRouter();
  const { user, isAdmin, isSubAdmin } = useAuthStore();
  const { data, isLoading } = usePollById(params.id);
  const updatePollMutation = useUpdatePoll();

  // Poll data from API
  const poll = data?.data;

  const {
    register,
    handleSubmit,
    control,
    formState: { errors },
    watch,
    setValue,
    reset,
  } = useForm<EditPollForm>({
    resolver: zodResolver(editPollSchema),
    defaultValues: {
      title: '',
      description: '',
      category: 'general',
      options: ['', ''],
      endType: 'scheduled',
    },
  });

  const { fields, append, remove } = useFieldArray({
    control: control as any,
    name: 'options',
  });

  const watchedFields = watch();

  useEffect(() => {
    if (!user || (!isAdmin && !isSubAdmin)) {
      router.push('/dashboard');
    }
  }, [user, isAdmin, isSubAdmin, router]);

  useEffect(() => {
    if (poll) {
      // Validate category is one of the allowed values
      const validCategories = ['eviction', 'hoh', 'task', 'general'] as const;
      const category = validCategories.includes(poll.category as any) 
        ? poll.category as 'eviction' | 'hoh' | 'task' | 'general'
        : 'general'; // Default to 'general' if invalid
        
      reset({
        title: poll.title,
        description: poll.description,
        category,
        options: poll.options?.map((opt: any) => opt.text || opt) || ['', ''],
        endType: 'scheduled', // Default to scheduled for existing polls
        scheduledEndTime: poll.endTime
          ? new Date(poll.endTime).toISOString().slice(0, 16)
          : undefined,
      });
    }
  }, [poll, reset]);

  if (!user || (!isAdmin && !isSubAdmin)) return null;

  if (isLoading) {
    return (
      <div className='min-h-screen bg-black flex items-center justify-center'>
        <div className='text-center'>
          <div className='animate-spin rounded-full h-12 w-12 border-b-2 border-violet-400 mb-4'></div>
          <p className='text-gray-400'>Loading poll...</p>
        </div>
      </div>
    );
  }

  if (!poll) {
    return (
      <div className='min-h-screen bg-black flex items-center justify-center'>
        <div className='text-center'>
          <AlertTriangle className='w-12 h-12 text-red-400 mx-auto mb-4' />
          <h1 className='text-2xl font-bold text-white mb-4'>Poll Not Found</h1>
          <p className='text-gray-400 mb-6'>T{`he poll you're looking for doesn't exist.`}</p>
          <Link href='/admin/polls'>
            <Button>
              <ArrowLeft className='w-4 h-4 mr-2' />
              Back to Polls
            </Button>
          </Link>
        </div>
      </div>
    );
  }

  const onSubmit = async (data: EditPollForm) => {
    const pollData = {
      title: data.title,
      description: data.description,
    };

    updatePollMutation.mutate(
      { id: poll.id, data: pollData },
      {
        onSuccess: () => {
          toast.success('Poll updated successfully!');
          // Sub-admins go back to polls page, admins go to admin polls
          if (isSubAdmin && !isAdmin) {
            router.push('/polls');
          } else {
            router.push('/admin/polls');
          }
        },
        onError: () => {
          toast.error('Failed to update poll. Please try again.');
        },
      }
    );
  };

  const addOption = () => {
    if (fields.length < 29) {
      append('');
    }
  };

  const removeOption = (index: number) => {
    if (fields.length > 2) {
      remove(index);
    }
  };

  const categoryOptions = [
    { value: 'eviction', label: 'Eviction' },
    { value: 'hoh', label: 'Head of House' },
    { value: 'task', label: 'Task' },
    { value: 'general', label: 'General' },
  ];

  // Get minimum datetime for input (current time + 1 hour)
  const getMinDateTime = () => {
    const now = new Date();
    now.setHours(now.getHours() + 1);
    return now.toISOString().slice(0, 16);
  };

  return (
    <div className='min-h-screen bg-black'>
      {/* Animated Background */}
      <div className='fixed inset-0 bg-gradient-to-br from-violet-950/20 via-black to-pink-950/20' />
      <div className='fixed inset-0 bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-purple-900/10 via-transparent to-transparent' />

      <div className='relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8'>
        {/* Back button for Sub-Admins */}
        {isSubAdmin && !isAdmin && (
          <Link href='/polls' className='inline-flex items-center gap-2 text-gray-400 hover:text-white transition-colors mb-6'>
            <ArrowLeft className='w-4 h-4' />
            <span>Back to Polls</span>
          </Link>
        )}
        
        {/* Header */}
        <div className='mb-10'>
          <div className='relative overflow-hidden rounded-3xl bg-gradient-to-br from-violet-600/10 via-purple-600/5 to-pink-600/10 border border-white/10 p-8 lg:p-12'>
            {/* Animated elements */}
            <div className='absolute top-0 right-0 w-64 h-64 bg-gradient-to-br from-violet-500/20 to-pink-500/20 rounded-full blur-3xl' />
            <div className='absolute bottom-0 left-0 w-48 h-48 bg-gradient-to-tr from-orange-500/20 to-amber-500/20 rounded-full blur-3xl' />

            <div className='relative z-10'>
              <div className='flex items-center gap-2 mb-4'>
                <div className='flex items-center gap-2 px-3 py-1.5 rounded-full bg-gradient-to-r from-blue-500/20 to-cyan-500/20 border border-blue-500/30'>
                  <Edit className='w-4 h-4 text-blue-400' />
                  <span className='text-sm font-medium text-blue-400'>
                    Edit Poll
                  </span>
                </div>
                <Badge className='bg-amber-500/20 text-amber-400 border-amber-500/30'>
                  <Crown className='w-3 h-3 mr-1' />
                  Admin Panel
                </Badge>
              </div>

              <h1 className='text-3xl sm:text-4xl lg:text-5xl font-black mb-2 sm:mb-3'>
                <span className='bg-gradient-to-r from-violet-400 via-pink-400 to-orange-400 bg-clip-text text-transparent'>
                  Edit Poll
                </span>
              </h1>

              <p className='text-lg sm:text-xl text-gray-400 mb-6 sm:mb-8 max-w-2xl'>
                Update poll details and settings for the entertainment community
              </p>

              <div className='flex flex-wrap gap-4'>
                <Link href='/admin/polls'>
                  <Button
                    variant='outline'
                    className='px-8 py-6 rounded-2xl border-white/20 text-white hover:bg-white/10 font-semibold text-lg'
                  >
                    <ArrowLeft className='w-5 h-5 mr-2' />
                    Back to Polls
                  </Button>
                </Link>
              </div>
            </div>
          </div>
        </div>

        <div className='grid grid-cols-1 lg:grid-cols-2 gap-10'>
          {/* Form */}
          <div className='lg:col-span-1'>
            <Card className='bg-white/5 backdrop-blur-sm border-white/10 shadow-xl'>
              <CardHeader>
                <CardTitle className='text-white text-2xl flex items-center gap-2'>
                  <Edit className='w-6 h-6 text-violet-400' />
                  Poll Details
                </CardTitle>
                <CardDescription className='text-gray-400'>
                  Update the details for your prediction poll
                </CardDescription>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleSubmit(onSubmit)} className='space-y-8'>
                  <div className='space-y-2'>
                    <Label htmlFor='title' className='text-gray-300'>
                      Poll Title
                    </Label>
                    <Input
                      id='title'
                      placeholder='e.g., Who will be evicted this Sunday?'
                      className='bg-black/50 border-white/20 text-white placeholder-gray-400 focus:border-violet-500 rounded-xl h-12'
                      {...register('title')}
                    />
                    {errors.title && (
                      <p className='text-red-400 text-sm'>
                        {errors.title.message}
                      </p>
                    )}
                  </div>

                  <div className='space-y-2'>
                    <Label htmlFor='description' className='text-gray-300'>
                      Description
                    </Label>
                    <Textarea
                      id='description'
                      placeholder='Provide more details about this prediction...'
                      rows={3}
                      className='bg-black/50 border-white/20 text-white placeholder-gray-400 focus:border-violet-500 rounded-xl'
                      {...register('description')}
                    />
                    {errors.description && (
                      <p className='text-red-400 text-sm'>
                        {errors.description.message}
                      </p>
                    )}
                  </div>

                  <div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
                    <div className='space-y-2'>
                      <Label className='text-gray-300'>Category</Label>
                      <Select
                        disabled
                        onValueChange={(value) =>
                          setValue('category', value as any)
                        }
                        value={watchedFields.category}
                      >
                        <SelectTrigger className='bg-black/50 border-white/20 text-white rounded-xl h-12 disabled:opacity-50 disabled:cursor-not-allowed'>
                          <SelectValue placeholder='Select category' />
                        </SelectTrigger>
                        <SelectContent className='bg-black border-white/20 rounded-xl'>
                          {categoryOptions.map((option) => (
                            <SelectItem key={option.value} value={option.value}>
                              {option.label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      {errors.category && (
                        <p className='text-red-400 text-sm'>
                          {errors.category.message}
                        </p>
                      )}
                    </div>

                    <div className='space-y-2'>
                      <Label className='text-gray-300'>Closing Type</Label>
                      <Select
                        disabled
                        onValueChange={(value) =>
                          setValue('endType', value as any)
                        }
                        value={watchedFields.endType}
                      >
                        <SelectTrigger className='bg-black/50 border-white/20 text-white rounded-xl h-12 disabled:opacity-50 disabled:cursor-not-allowed'>
                          <SelectValue placeholder='Select closing type' />
                        </SelectTrigger>
                        <SelectContent className='bg-black border-white/20 rounded-xl'>
                          <SelectItem value='scheduled'>
                            Scheduled Time
                          </SelectItem>
                          <SelectItem value='manual'>
                            Until Admin Closes
                          </SelectItem>
                        </SelectContent>
                      </Select>
                      {errors.endType && (
                        <p className='text-red-400 text-sm'>
                          {errors.endType.message}
                        </p>
                      )}
                    </div>
                  </div>

                  {watchedFields.endType === 'scheduled' && (
                    <div className='space-y-2'>
                      <Label
                        htmlFor='scheduledEndTime'
                        className='text-gray-300'
                      >
                        End Date & Time
                      </Label>
                      <Input
                        id='scheduledEndTime'
                        type='datetime-local'
                        min={getMinDateTime()}
                        disabled
                        className='bg-black/50 border-white/20 text-white focus:border-violet-500 rounded-xl h-12 disabled:opacity-50 disabled:cursor-not-allowed'
                        {...register('scheduledEndTime')}
                      />
                      {errors.scheduledEndTime && (
                        <p className='text-red-400 text-sm'>
                          {errors.scheduledEndTime.message}
                        </p>
                      )}
                    </div>
                  )}

                  {watchedFields.endType === 'manual' && (
                    <div className='p-4 bg-blue-500/10 rounded-xl border border-blue-500/20'>
                      <div className='flex items-center'>
                        <Clock className='w-5 h-5 text-blue-400 mr-2' />
                        <span className='text-blue-400 font-semibold'>
                          Manual Closing
                        </span>
                      </div>
                      <p className='text-gray-400 text-sm mt-1'>
                        This poll will remain open until you manually close it
                        from the polls page.
                      </p>
                    </div>
                  )}

                  <div className='space-y-6'>
                    <div className='flex items-center justify-between gap-2'>
                      <Label className='text-gray-300'>Answer Options</Label>
                      <div className='flex gap-2'>
                        <Button
                          type='button'
                          size='sm'
                          onClick={() => {
                            // Add all contestants to options, skipping already added
                            const currentOptions = watchedFields.options || [];
                            const toAdd = CONTESTANTS.filter(
                              (name) => !currentOptions.includes(name)
                            );
                            const max = 29;
                            const newOptions = [
                              ...currentOptions.filter((o) => o.trim() !== ''),
                              ...toAdd,
                            ].slice(0, max);
                            setValue('options', newOptions);
                          }}
                          disabled={true}
                          className='bg-blue-600 hover:bg-blue-700 text-white rounded-xl px-4 py-2 font-semibold disabled:opacity-50 disabled:cursor-not-allowed'
                        >
                          All
                        </Button>
                        <Button
                          type='button'
                          size='sm'
                          onClick={addOption}
                          disabled={true}
                          className='bg-green-600 hover:bg-green-700 text-white rounded-xl px-4 py-2 font-semibold disabled:opacity-50 disabled:cursor-not-allowed'
                        >
                          <Plus className='w-4 h-4 mr-2' />
                          Add Option
                        </Button>
                      </div>
                    </div>

                    <div className='space-y-4'>
                      {fields.map((field, index) => {
                        const selectedOptions =
                          watchedFields.options?.filter(
                            (_, i) => i !== index
                          ) || [];
                        const availableContestants = CONTESTANTS.filter(
                          (name) => !selectedOptions.includes(name)
                        );
                        return (
                          <div
                            key={field.id}
                            className='flex gap-2 items-center'
                          >
                            <Select
                              disabled
                              value={watchedFields.options?.[index] || ''}
                              onValueChange={(value) =>
                                setValue(`options.${index}`, value)
                              }
                            >
                              <SelectTrigger className='bg-black/50 border-white/20 text-white rounded-xl h-12 w-full disabled:opacity-50 disabled:cursor-not-allowed'>
                                <SelectValue
                                  placeholder={`Select contestant for Option ${
                                    index + 1
                                  }`}
                                />
                              </SelectTrigger>
                              <SelectContent className='bg-black border-white/20 rounded-xl max-h-60 overflow-y-auto'>
                                {availableContestants.map((name) => (
                                  <SelectItem key={name} value={name}>
                                    {name}
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                            <Button
                              type='button'
                              size='sm'
                              variant='outline'
                              onClick={() => removeOption(index)}
                              disabled={true}
                              className='border-white/20 text-gray-300 hover:bg-white/10 rounded-xl px-4 disabled:opacity-50 disabled:cursor-not-allowed'
                            >
                              <Minus className='w-4 h-4' />
                            </Button>
                          </div>
                        );
                      })}
                    </div>
                    {errors.options && (
                      <p className='text-red-400 text-sm'>
                        {errors.options.message}
                      </p>
                    )}
                  </div>

                  <div className='flex gap-4 pt-6'>
                    <Button
                      type='button'
                      variant='outline'
                      onClick={() => {
                        // Sub-admins go back to polls page, admins go to admin polls
                        if (isSubAdmin && !isAdmin) {
                          router.push('/polls');
                        } else {
                          router.push('/admin/polls');
                        }
                      }}
                      className='flex-1 border-white/20 text-gray-300 hover:bg-white/10 rounded-xl py-3'
                    >
                      Cancel
                    </Button>
                    <Button
                      type='submit'
                      disabled={updatePollMutation.isPending}
                      className='flex-1 bg-gradient-to-r from-violet-500 to-pink-500 hover:from-violet-600 hover:to-pink-600 rounded-xl py-3 font-bold shadow-lg hover:shadow-purple-500/25 transform hover:scale-105 transition-all flex items-center justify-center'
                    >
                      {updatePollMutation.isPending ? (
                        <span className='flex items-center gap-2'>
                          <svg
                            className='animate-spin h-5 w-5 text-white'
                            xmlns='http://www.w3.org/2000/svg'
                            fill='none'
                            viewBox='0 0 24 24'
                          >
                            <circle
                              className='opacity-25'
                              cx='12'
                              cy='12'
                              r='10'
                              stroke='currentColor'
                              strokeWidth='4'
                            ></circle>
                            <path
                              className='opacity-75'
                              fill='currentColor'
                              d='M4 12a8 8 0 018-8v8z'
                            ></path>
                          </svg>
                          Updating...
                        </span>
                      ) : (
                        <span className='flex items-center gap-2'>
                          <Save className='w-5 h-5' />
                          Update Poll
                        </span>
                      )}
                    </Button>
                  </div>
                </form>
              </CardContent>
            </Card>
          </div>

          {/* Preview */}
          <div className='lg:col-span-1'>
            <Card className='bg-white/5 backdrop-blur-sm border-white/10 sticky top-24 shadow-xl'>
              <CardHeader>
                <CardTitle className='text-white text-2xl flex items-center gap-2'>
                  <Sparkles className='w-6 h-6 text-pink-400' />
                  Live Preview
                </CardTitle>
                <CardDescription className='text-gray-400'>
                  How your updated poll will appear to users
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className='space-y-6'>
                  <div>
                    <div className='text-sm text-purple-400 mb-3 capitalize px-3 py-1 bg-purple-500/20 rounded-full inline-block font-semibold'>
                      {watchedFields.category || 'Category'}
                    </div>
                    <h3 className='text-white font-bold text-xl mb-3'>
                      {watchedFields.title || 'Poll title will appear here...'}
                    </h3>
                    <p className='text-gray-400 text-sm'>
                      {watchedFields.description ||
                        'Poll description will appear here...'}
                    </p>
                  </div>

                  {watchedFields.scheduledEndTime && (
                    <div className='flex items-center text-red-400 text-sm bg-red-500/10 px-3 py-2 rounded-lg'>
                      <Calendar className='w-4 h-4 mr-1' />
                      {watchedFields.endType === 'manual'
                        ? 'Closes: When admin decides'
                        : watchedFields.scheduledEndTime
                        ? `Ends: ${new Date(
                            watchedFields.scheduledEndTime
                          ).toLocaleDateString()} ${new Date(
                            watchedFields.scheduledEndTime
                          ).toLocaleTimeString()}`
                        : 'End time not set'}
                    </div>
                  )}

                  <div className='space-y-3'>
                    <Label className='text-gray-300 text-sm'>Options:</Label>
                    {watchedFields.options
                      ?.filter((option) => option.trim() !== '')
                      .map((option, index) => (
                        <div
                          key={index}
                          className='p-3 bg-black/30 rounded-xl border border-white/10 text-white font-semibold'
                        >
                          {option || `Option ${index + 1}`}
                        </div>
                      ))}
                    {(!watchedFields.options ||
                      watchedFields.options.filter(
                        (option) => option.trim() !== ''
                      ).length === 0) && (
                      <div className='text-gray-500 text-sm p-3 bg-black/20 rounded-xl border border-white/5'>
                        No valid options yet...
                      </div>
                    )}
                  </div>

                  <div className='pt-6 border-t border-white/10'>
                    <div className='flex justify-between items-center'>
                      <div className='text-sm text-gray-400 bg-green-500/10 px-3 py-2 rounded-lg'>
                        Pool:{' '}
                        <span className='text-green-400 font-bold'>₦0</span>
                      </div>
                      <div className='text-sm text-gray-400 bg-blue-500/10 px-3 py-2 rounded-lg'>
                        <span className='font-semibold'>0 participants</span>
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
};

export default EditPollPage;
