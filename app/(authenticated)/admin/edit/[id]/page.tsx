"use client";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { usePollById, useUpdatePoll } from "@/lib/polls";
import { useAuthStore } from "@/stores/authStore";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  AlertTriangle,
  ArrowLeft,
  Calendar,
  Clock,
  Crown,
  Edit,
  Loader2,
  Minus,
  Plus,
  Save,
  Sparkles,
} from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { useFieldArray, useForm } from "react-hook-form";
import { toast } from "sonner";
import { z } from "zod";

const editPollSchema = z.object({
  title: z.string().min(10, "Title must be at least 10 characters"),
  description: z.string().min(20, "Description must be at least 20 characters"),
  category: z.enum(["eviction", "hoh", "task", "general"]).optional(),
  options: z.array(z.string()).optional(),
  endType: z.enum(["scheduled", "manual"]).optional(),
  scheduledEndTime: z.string().optional(),
});

type EditPollForm = z.infer<typeof editPollSchema>;

const EditPollPage = ({ params }: { params: { id: string } }) => {
  const router = useRouter();
  const { user, isAdmin, isSubAdmin } = useAuthStore();
  const { data, isLoading } = usePollById(params.id);
  const updatePollMutation = useUpdatePoll();

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
      title: "",
      description: "",
      category: "general",
      options: ["", ""],
      endType: "scheduled",
    },
  });

  const { fields, append, remove } = useFieldArray({
    control: control as any,
    name: "options",
  });

  const watchedFields = watch();

  useEffect(() => {
    if (!user || (!isAdmin && !isSubAdmin)) router.push("/dashboard");
  }, [user, isAdmin, isSubAdmin, router]);

  useEffect(() => {
    if (poll) {
      const validCategories = ["eviction", "hoh", "task", "general"] as const;
      const category = validCategories.includes(poll.category as any)
        ? (poll.category as "eviction" | "hoh" | "task" | "general")
        : "general";

      reset({
        title: poll.title,
        description: poll.description,
        category,
        options: poll.options?.map((opt: any) => opt.text || opt) || ["", ""],
        endType: "scheduled",
        scheduledEndTime: poll.endTime
          ? new Date(poll.endTime).toISOString().slice(0, 16)
          : undefined,
      });
    }
  }, [poll, reset]);

  if (!user || (!isAdmin && !isSubAdmin)) return null;

  if (isLoading) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <Loader2 className="w-8 h-8 text-violet-400 animate-spin" />
      </div>
    );
  }

  if (!poll) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center px-4">
        <div className="text-center">
          <AlertTriangle className="w-12 h-12 text-red-400 mx-auto mb-4" />
          <h1 className="text-xl font-bold text-white mb-2">Poll Not Found</h1>
          <p className="text-gray-400 mb-4">The poll doesn&apos;t exist.</p>
          <Link href="/admin/polls">
            <Button className="bg-violet-500 hover:bg-violet-600">
              <ArrowLeft className="w-4 h-4 mr-2" />
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
          toast.success("Poll updated");
          if (isSubAdmin && !isAdmin) {
            router.push("/polls");
          } else {
            router.push("/admin/polls");
          }
        },
        onError: () => {
          toast.error("Failed to update poll");
        },
      }
    );
  };

  const addOption = () => {
    if (fields.length < 29) append("");
  };

  const removeOption = (index: number) => {
    if (fields.length > 2) remove(index);
  };

  const categoryOptions = [
    { value: "eviction", label: "Eviction" },
    { value: "hoh", label: "Head of House" },
    { value: "task", label: "Task" },
    { value: "general", label: "General" },
  ];

  const getMinDateTime = () => {
    const now = new Date();
    now.setHours(now.getHours() + 1);
    return now.toISOString().slice(0, 16);
  };

  return (
    <div className="min-h-screen bg-black">
      {/* Background */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[600px] h-[600px] bg-violet-600/10 rounded-full blur-[120px]" />
      </div>

      <div className="relative px-4 sm:px-6 py-6 max-w-3xl mx-auto">
        {/* Back Link */}
        <Link
          href={isSubAdmin && !isAdmin ? "/polls" : "/admin/polls"}
          className="inline-flex items-center gap-2 text-gray-400 hover:text-white transition-colors mb-4"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back</span>
        </Link>

        {/* Header */}
        <div className="mb-6">
          <div className="flex items-center gap-2 mb-2">
            <Badge className="bg-violet-500/20 text-violet-400 border-violet-500/30 text-xs">
              <Crown className="w-3 h-3 mr-1" />
              Admin
            </Badge>
          </div>
          <h1 className="text-2xl font-black text-white">Edit Poll</h1>
          <p className="text-gray-500 text-sm">Update poll details</p>
        </div>

        {/* Form */}
        <Card className="bg-white/[0.03] border-white/[0.06] mb-6">
          <CardHeader className="pb-3">
            <CardTitle className="text-white flex items-center gap-2 text-base">
              <Edit className="w-4 h-4 text-violet-400" />
              Poll Details
            </CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
              <div className="space-y-1.5">
                <Label className="text-sm text-gray-300">Title</Label>
                <Input
                  placeholder="Poll title"
                  className="h-11 bg-white/[0.03] border-white/[0.06] text-white rounded-xl"
                  {...register("title")}
                />
                {errors.title && <p className="text-red-400 text-xs">{errors.title.message}</p>}
              </div>

              <div className="space-y-1.5">
                <Label className="text-sm text-gray-300">Description</Label>
                <Textarea
                  placeholder="Description"
                  rows={3}
                  className="bg-white/[0.03] border-white/[0.06] text-white rounded-xl"
                  {...register("description")}
                />
                {errors.description && <p className="text-red-400 text-xs">{errors.description.message}</p>}
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <Label className="text-sm text-gray-300">Category</Label>
                  <Select
                    disabled
                    onValueChange={(value) => setValue("category", value as any)}
                    value={watchedFields.category}
                  >
                    <SelectTrigger className="h-11 bg-white/[0.03] border-white/[0.06] text-white rounded-xl disabled:opacity-50">
                      <SelectValue placeholder="Select" />
                    </SelectTrigger>
                    <SelectContent className="bg-gray-900 border-white/10">
                      {categoryOptions.map((option) => (
                        <SelectItem key={option.value} value={option.value} className="text-white">
                          {option.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-1.5">
                  <Label className="text-sm text-gray-300">Closing</Label>
                  <Select
                    disabled
                    onValueChange={(value) => setValue("endType", value as any)}
                    value={watchedFields.endType}
                  >
                    <SelectTrigger className="h-11 bg-white/[0.03] border-white/[0.06] text-white rounded-xl disabled:opacity-50">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent className="bg-gray-900 border-white/10">
                      <SelectItem value="scheduled" className="text-white">Scheduled</SelectItem>
                      <SelectItem value="manual" className="text-white">Manual</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              {watchedFields.endType === "scheduled" && (
                <div className="space-y-1.5">
                  <Label className="text-sm text-gray-300">End Time</Label>
                  <Input
                    type="datetime-local"
                    min={getMinDateTime()}
                    disabled
                    className="h-11 bg-white/[0.03] border-white/[0.06] text-white rounded-xl disabled:opacity-50 [&::-webkit-calendar-picker-indicator]:invert"
                    {...register("scheduledEndTime")}
                  />
                </div>
              )}

              {watchedFields.endType === "manual" && (
                <div className="p-3 rounded-xl bg-indigo-500/10 border border-indigo-500/20">
                  <div className="flex items-center gap-2">
                    <Clock className="w-4 h-4 text-indigo-400" />
                    <span className="text-sm text-indigo-400 font-medium">Manual Closing</span>
                  </div>
                  <p className="text-xs text-gray-400 mt-1">Poll stays open until manually closed</p>
                </div>
              )}

              {/* Options (read-only) */}
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <Label className="text-sm text-gray-300">Options</Label>
                  <Button
                    type="button"
                    size="sm"
                    onClick={addOption}
                    disabled
                    className="h-8 bg-violet-500/20 text-violet-400 rounded-lg text-xs opacity-50"
                  >
                    <Plus className="w-3 h-3 mr-1" />
                    Add
                  </Button>
                </div>
                <div className="space-y-2">
                  {fields.map((field, index) => (
                    <div key={field.id} className="flex gap-2">
                      <Input
                        disabled
                        value={watchedFields.options?.[index] || ""}
                        className="h-10 bg-white/[0.03] border-white/[0.06] text-white rounded-xl opacity-50"
                      />
                      <Button
                        type="button"
                        size="sm"
                        variant="outline"
                        onClick={() => removeOption(index)}
                        disabled
                        className="h-10 px-3 border-white/[0.06] text-gray-400 rounded-xl opacity-50"
                      >
                        <Minus className="w-4 h-4" />
                      </Button>
                    </div>
                  ))}
                </div>
              </div>

              <div className="flex gap-3 pt-4">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => {
                    if (isSubAdmin && !isAdmin) {
                      router.push("/polls");
                    } else {
                      router.push("/admin/polls");
                    }
                  }}
                  className="flex-1 h-11 border-white/[0.06] text-gray-400 hover:text-white hover:bg-white/10 rounded-xl"
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  disabled={updatePollMutation.isPending}
                  className="flex-1 h-11 bg-gradient-to-r from-violet-500 to-indigo-500 hover:from-violet-600 hover:to-indigo-600 font-bold rounded-xl"
                >
                  {updatePollMutation.isPending ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Updating...
                    </>
                  ) : (
                    <>
                      <Save className="w-4 h-4 mr-2" />
                      Update Poll
                    </>
                  )}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>

        {/* Preview */}
        <Card className="bg-white/[0.03] border-white/[0.06]">
          <CardHeader className="pb-3">
            <CardTitle className="text-white flex items-center gap-2 text-base">
              <Sparkles className="w-4 h-4 text-indigo-400" />
              Preview
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Badge className="bg-violet-500/20 text-violet-400 border-violet-500/30 text-xs mb-2 capitalize">
                {watchedFields.category || "Category"}
              </Badge>
              <h3 className="text-white font-bold mb-1">
                {watchedFields.title || "Poll title..."}
              </h3>
              <p className="text-gray-400 text-sm">
                {watchedFields.description || "Description..."}
              </p>
            </div>

            {watchedFields.scheduledEndTime && (
              <div className="flex items-center gap-2 text-xs text-orange-400 bg-orange-500/10 px-3 py-2 rounded-lg">
                <Calendar className="w-3 h-3" />
                <span>
                  Ends: {new Date(watchedFields.scheduledEndTime).toLocaleDateString()}{" "}
                  {new Date(watchedFields.scheduledEndTime).toLocaleTimeString()}
                </span>
              </div>
            )}

            <div className="space-y-2">
              <p className="text-xs text-gray-400">Options:</p>
              {watchedFields.options?.filter((o) => o?.trim() !== "").length ? (
                watchedFields.options
                  .filter((o) => o?.trim() !== "")
                  .slice(0, 5)
                  .map((option, index) => (
                    <div
                      key={index}
                      className="p-2 bg-white/[0.02] rounded-lg border border-white/[0.05] text-white text-sm"
                    >
                      {option}
                    </div>
                  ))
              ) : (
                <p className="text-gray-500 text-xs">No options</p>
              )}
            </div>

            <div className="flex justify-between pt-3 border-t border-white/[0.05]">
              <span className="text-xs text-gray-400 bg-emerald-500/10 px-2 py-1 rounded">
                Pool: <span className="text-emerald-400 font-bold">$0</span>
              </span>
              <span className="text-xs text-gray-400 bg-violet-500/10 px-2 py-1 rounded">
                0 participants
              </span>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default EditPollPage;
