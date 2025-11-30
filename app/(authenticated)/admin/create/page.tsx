'use client';
import { CONTESTANTS } from '@/constants/contestants';
import { POLL_CATEGORIES } from '@/constants/categories';
import { useState } from 'react';
import { Checkbox } from '@/components/ui/checkbox';

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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { useCreatePoll } from '@/lib/polls';
import { useAuthStore } from '@/stores/authStore';
import { zodResolver } from '@hookform/resolvers/zod';
import {
  Activity,
  ArrowLeft,
  Calendar,
  Clock,
  Minus,
  Plus,
  Shield,
  Sparkles,
} from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';
import { useFieldArray, useForm } from 'react-hook-form';
import { toast } from 'sonner';
import { z } from 'zod';

const createPollSchema = z
  .object({
    title: z.string().min(10, 'Title must be at least 10 characters'),
    description: z
      .string()
      .min(20, 'Description must be at least 20 characters'),
    mainCategory: z.string().min(1, 'Category is required'),
    options: z
      .array(z.string().min(1, 'Option cannot be empty'))
      .min(2, 'At least 2 options required')
      .max(29, 'Maximum 29 options allowed'),
    endTime: z.string().optional(),
    endType: z.enum(['scheduled', 'manual']),
    scheduledEndTime: z.string().optional(),
  })
  .refine(
    (data) => {
      if (data.endType === 'scheduled' && !data.scheduledEndTime) {
        return false;
      }
      return true;
    },
    {
      message: 'Scheduled end time is required when using scheduled closing',
      path: ['scheduledEndTime'],
    }
  );

type CreatePollForm = z.infer<typeof createPollSchema>;

export default function CreatePollPage() {
  const router = useRouter();
  const { user, isAdmin, isSubAdmin } = useAuthStore();
  const createPollMutation = useCreatePoll();
  const [selectedContestants, setSelectedContestants] = useState<string[]>([]);
  const [manualOptions, setManualOptions] = useState<string[]>(['', '']);
  const [isRealityShow, setIsRealityShow] = useState(false);

  const {
    register,
    handleSubmit,
    control,
    formState: { errors },
    watch,
    setValue,
  } = useForm<CreatePollForm>({
    resolver: zodResolver(createPollSchema),
    defaultValues: {
      title: '',
      description: '',
      mainCategory: undefined,
      options: ['', ''],
      endType: 'scheduled',
    },
  });

  const { fields, append, remove } = useFieldArray({
    control: control as any,
    name: 'options',
  });

  const watchedFields = watch();
  const watchedMainCategory = watch('mainCategory');

  useEffect(() => {
    if (!user || (!isAdmin && !isSubAdmin)) {
      router.push('/dashboard');
    }
  }, [user, isAdmin, isSubAdmin, router]);

  // Update options based on category
  useEffect(() => {
    if (watchedMainCategory === 'reality-shows') {
      setIsRealityShow(true);
      // Set options to selected contestants
      setValue('options', selectedContestants);
    } else {
      setIsRealityShow(false);
      // Set options to manual inputs
      setValue('options', manualOptions);
    }
  }, [watchedMainCategory, selectedContestants, manualOptions, setValue]);

  if (!user || (!isAdmin && !isSubAdmin)) {
    return null;
  }

  const onSubmit = async (data: CreatePollForm) => {
    const filteredOptions = data.options.filter(
      (option) => option.trim() !== ''
    );
    if (filteredOptions.length < 2) {
      toast.warning('At least 2 options are required.');
      return;
    }

    let endTime: Date;
    if (data.endType === 'scheduled') {
      if (!data.scheduledEndTime) {
        toast.warning('Please select an end time for scheduled closing.');
        return;
      }
      endTime = new Date(data.scheduledEndTime);
      if (endTime <= new Date()) {
        toast.warning('End time must be in the future.');
        return;
      }
    } else {
      endTime = new Date();
      endTime.setFullYear(endTime.getFullYear() + 10);
    }

    if (data.endType === 'scheduled' && endTime <= new Date()) {
      toast.warning('End time must be in the future.');
      return;
    }

    // Add required showName and season fields for CreatePollRequest
    const pollData = {
      title: data.title,
      description: data.description,
      category: data.mainCategory,
      options: filteredOptions.map((option) => ({ text: option })),
      endTime: endTime.toISOString(),
      showName: data.mainCategory,
      season: '10', // You can make this dynamic if needed
    };

    createPollMutation.mutate(pollData, {
      onSuccess: () => {
        toast.success('The new poll is now live and accepting stakes.');
        // Sub-admins go back to polls page, admins can stay in admin area
        if (isSubAdmin && !isAdmin) {
          router.push('/polls');
        } else {
          router.push('/polls'); // For now, both go to polls page
        }
      },
      onError: (error: any) => {
        toast.error(error?.message || 'Failed to create poll', {
          dismissible: true,
          duration: 5000,
        });
      },
    });
  };

  const addOption = () => {
    if (!isRealityShow && manualOptions.length < 29) {
      setManualOptions([...manualOptions, '']);
    }
  };

  const removeOption = (index: number) => {
    if (!isRealityShow && manualOptions.length > 2) {
      const newOptions = manualOptions.filter((_, i) => i !== index);
      setManualOptions(newOptions);
    }
  };

  const handleContestantToggle = (contestant: string) => {
    if (selectedContestants.includes(contestant)) {
      setSelectedContestants(
        selectedContestants.filter((c) => c !== contestant)
      );
    } else {
      setSelectedContestants([...selectedContestants, contestant]);
    }
  };

  const handleManualOptionChange = (index: number, value: string) => {
    const newOptions = [...manualOptions];
    newOptions[index] = value;
    setManualOptions(newOptions);
  };

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
          <Link
            href='/polls'
            className='inline-flex items-center gap-2 text-gray-400 hover:text-white transition-colors mb-6'
          >
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
                <div className='flex items-center gap-2 px-3 py-1.5 rounded-full bg-gradient-to-r from-purple-500/20 to-pink-500/20 border border-purple-500/30'>
                  <Sparkles className='w-4 h-4 text-purple-400' />
                  <span className='text-sm font-medium text-purple-400'>
                    Poll Creation
                  </span>
                </div>
                <div className='flex items-center gap-2 px-3 py-1.5 rounded-full bg-gradient-to-r from-amber-500/20 to-orange-500/20 border border-amber-500/30'>
                  <Shield className='w-4 h-4 text-amber-400' />
                  <span className='text-sm font-medium text-amber-400'>
                    Admin Panel
                  </span>
                </div>
              </div>

              <h1 className='text-3xl sm:text-4xl lg:text-5xl font-black mb-2 sm:mb-3'>
                <span className='bg-gradient-to-r from-violet-400 via-pink-400 to-orange-400 bg-clip-text text-transparent'>
                  Create New Poll
                </span>
              </h1>

              <p className='text-lg sm:text-xl text-gray-400 max-w-2xl'>
                Design exciting predictions for the entertainment community and
                get users engaged!
              </p>
            </div>
          </div>
        </div>

        <div className='grid grid-cols-1 lg:grid-cols-2 gap-10'>
          {/* Form */}
          <div className='lg:col-span-1'>
            <Card className='bg-white/5 backdrop-blur-sm border-white/10 shadow-xl'>
              <CardHeader>
                <CardTitle className='text-white text-2xl flex items-center gap-2'>
                  <Sparkles className='w-6 h-6 text-violet-400' />
                  Poll Details
                </CardTitle>
                <CardDescription className='text-gray-400'>
                  Fill in the details for your new prediction poll
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
                      <Label className='text-gray-300'>Main Category</Label>
                      <Select
                        onValueChange={(value) => {
                          setValue('mainCategory', value);
                        }}
                      >
                        <SelectTrigger className='bg-black/50 border-white/20 text-white rounded-xl h-12'>
                          <SelectValue placeholder='Select category' />
                        </SelectTrigger>
                        <SelectContent className='bg-black border-white/20 rounded-xl max-h-60 overflow-y-auto'>
                          {POLL_CATEGORIES.map((option) => (
                            <SelectItem key={option.value} value={option.value}>
                              {option.label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      {errors.mainCategory && (
                        <p className='text-red-400 text-sm'>
                          {errors.mainCategory.message}
                        </p>
                      )}
                    </div>

                    <div className='space-y-2'>
                      <Label className='text-gray-300'>Closing Type</Label>
                      <Select
                        onValueChange={(value) =>
                          setValue('endType', value as any)
                        }
                        defaultValue='scheduled'
                      >
                        <SelectTrigger className='bg-black/50 border-white/20 text-white rounded-xl h-12'>
                          <SelectValue placeholder='Select closing type' />
                        </SelectTrigger>
                        <SelectContent className='bg-black border-white/20 rounded-xl'>
                          <SelectItem value='scheduled'>
                            Scheduled Time
                          </SelectItem>
                          <SelectItem value='manual' disabled>
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
                        className='bg-black/50 border-white/20 text-white focus:border-violet-500 rounded-xl h-12'
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
                  {/* Options Section */}
                  <div className='space-y-6'>
                    <Label className='text-gray-300'>
                      {isRealityShow ? 'Select Contestants' : 'Answer Options'}
                      {!isRealityShow && ' (Minimum 2 options required)'}
                    </Label>

                    {isRealityShow ? (
                      // Reality Show: Checkbox selection for contestants
                      <div className='space-y-4'>
                        <div className='flex items-center justify-between mb-4'>
                          <p className='text-sm text-gray-400'>
                            Selected: {selectedContestants.length} contestants
                          </p>
                          <div className='flex gap-2'>
                            <Button
                              type='button'
                              size='sm'
                              onClick={() =>
                                setSelectedContestants([...CONTESTANTS])
                              }
                              className='bg-blue-600 hover:bg-blue-700 text-white rounded-xl px-4 py-2 font-semibold'
                            >
                              Select All
                            </Button>
                            <Button
                              type='button'
                              size='sm'
                              onClick={() => setSelectedContestants([])}
                              className='bg-red-600 hover:bg-red-700 text-white rounded-xl px-4 py-2 font-semibold'
                            >
                              Clear All
                            </Button>
                          </div>
                        </div>

                        <div className='grid grid-cols-2 gap-3 max-h-96 overflow-y-auto p-4 bg-black/30 rounded-xl border border-white/10'>
                          {CONTESTANTS.map((contestant) => (
                            <div
                              key={contestant}
                              className='flex items-center space-x-2'
                            >
                              <Checkbox
                                id={contestant}
                                checked={selectedContestants.includes(
                                  contestant
                                )}
                                onCheckedChange={() =>
                                  handleContestantToggle(contestant)
                                }
                                className='border-white/30 data-[state=checked]:bg-violet-500 data-[state=checked]:border-violet-500'
                              />
                              <label
                                htmlFor={contestant}
                                className='text-sm text-white cursor-pointer'
                              >
                                {contestant}
                              </label>
                            </div>
                          ))}
                        </div>

                        {selectedContestants.length < 2 && (
                          <p className='text-amber-400 text-sm'>
                            ⚠️ Please select at least 2 contestants
                          </p>
                        )}
                      </div>
                    ) : (
                      // Other Categories: Manual input fields
                      <div className='space-y-4'>
                        <div className='flex justify-end'>
                          <Button
                            type='button'
                            size='sm'
                            onClick={addOption}
                            disabled={manualOptions.length >= 29}
                            className='bg-green-600 hover:bg-green-700 text-white rounded-xl px-4 py-2 font-semibold'
                          >
                            <Plus className='w-4 h-4 mr-2' />
                            Add Option
                          </Button>
                        </div>

                        {manualOptions.map((option, index) => (
                          <div key={index} className='flex gap-2 items-center'>
                            <Input
                              placeholder={`Option ${index + 1}`}
                              value={option}
                              onChange={(e) =>
                                handleManualOptionChange(index, e.target.value)
                              }
                              className='bg-black/50 border-white/20 text-white placeholder-gray-400 focus:border-violet-500 rounded-xl h-12'
                            />
                            <Button
                              type='button'
                              size='sm'
                              variant='outline'
                              onClick={() => removeOption(index)}
                              disabled={manualOptions.length <= 2}
                              className='border-white/20 text-gray-300 hover:bg-white/10 rounded-xl px-4'
                            >
                              <Minus className='w-4 h-4' />
                            </Button>
                          </div>
                        ))}

                        {manualOptions.filter((o) => o.trim() !== '').length <
                          2 && (
                          <p className='text-amber-400 text-sm'>
                            ⚠️ Please provide at least 2 valid options
                          </p>
                        )}
                      </div>
                    )}

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
                      onClick={() => router.push('/polls')}
                      className='flex-1 border-white/20 text-gray-300 hover:bg-white/10 rounded-xl py-3'
                    >
                      Cancel
                    </Button>
                    <Button
                      type='submit'
                      disabled={createPollMutation.isPending}
                      className='flex-1 bg-gradient-to-r from-violet-500 to-pink-500 hover:from-violet-600 hover:to-pink-600 rounded-xl py-3 font-bold shadow-lg hover:shadow-purple-500/25 transform hover:scale-105 transition-all flex items-center justify-center'
                    >
                      {createPollMutation.isPending ? (
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
                          Creating...
                        </span>
                      ) : (
                        <>🚀 Create Poll</>
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
                  How your poll will appear to users
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className='space-y-6'>
                  <div>
                    <div className='text-sm text-purple-400 mb-3 capitalize px-3 py-1 bg-purple-500/20 rounded-full inline-block font-semibold'>
                      {POLL_CATEGORIES.find(
                        (c) => c.value === watchedFields.mainCategory
                      )?.label || 'Category'}
                    </div>
                    <h3 className='text-white font-bold text-xl mb-3'>
                      {watchedFields.title || 'Poll title will appear here...'}
                    </h3>
                    <p className='text-gray-400 text-sm'>
                      {watchedFields.description ||
                        'Poll description will appear here...'}
                    </p>
                  </div>

                  {watchedFields.endTime && (
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
                    {isRealityShow ? (
                      selectedContestants.length > 0 ? (
                        selectedContestants.map((contestant, index) => (
                          <div
                            key={index}
                            className='p-3 bg-black/30 rounded-xl border border-white/10 text-white font-semibold'
                          >
                            {contestant}
                          </div>
                        ))
                      ) : (
                        <div className='text-gray-500 text-sm p-3 bg-black/20 rounded-xl border border-white/5'>
                          No contestants selected yet...
                        </div>
                      )
                    ) : manualOptions.filter((o) => o.trim() !== '').length >
                      0 ? (
                      manualOptions
                        .filter((o) => o.trim() !== '')
                        .map((option, index) => (
                          <div
                            key={index}
                            className='p-3 bg-black/30 rounded-xl border border-white/10 text-white font-semibold'
                          >
                            {option}
                          </div>
                        ))
                    ) : (
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
}
