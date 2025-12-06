"use client";

import Image from "next/image";
import { CONTESTANTS } from "@/constants/contestants";
import { POLL_CATEGORIES } from "@/constants/categories";
import { useState, useEffect } from "react";
import { Checkbox } from "@/components/ui/checkbox";
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
import { useCreatePoll } from "@/lib/polls";
import { useAuthStore } from "@/stores/authStore";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  ArrowLeft,
  Calendar,
  Clock,
  Crown,
  Loader2,
  Minus,
  Plus,
  Sparkles,
} from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useFieldArray, useForm } from "react-hook-form";
import { toast } from "sonner";
import { z } from "zod";

const createPollSchema = z
  .object({
    title: z.string().min(10, "Title must be at least 10 characters"),
    description: z.string().min(20, "Description must be at least 20 characters"),
    mainCategory: z.string().min(1, "Category is required"),
    options: z
      .array(z.string().min(1, "Option cannot be empty"))
      .min(2, "At least 2 options required")
      .max(29, "Maximum 29 options allowed"),
    endTime: z.string().optional(),
    endType: z.enum(["scheduled", "manual"]),
    scheduledEndTime: z.string().optional(),
  })
  .refine(
    (data) => {
      if (data.endType === "scheduled" && !data.scheduledEndTime) return false;
      return true;
    },
    { message: "End time required for scheduled closing", path: ["scheduledEndTime"] }
  );

type CreatePollForm = z.infer<typeof createPollSchema>;

export default function CreatePollPage() {
  const router = useRouter();
  const { user, isAdmin, isSubAdmin } = useAuthStore();
  const createPollMutation = useCreatePoll();
  const [selectedContestants, setSelectedContestants] = useState<string[]>([]);
  const [manualOptions, setManualOptions] = useState<string[]>(["", ""]);
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
      title: "",
      description: "",
      mainCategory: undefined,
      options: ["", ""],
      endType: "scheduled",
    },
  });

  const { fields, append, remove } = useFieldArray({
    control: control as any,
    name: "options",
  });

  const watchedFields = watch();
  const watchedMainCategory = watch("mainCategory");

  useEffect(() => {
    if (!user || (!isAdmin && !isSubAdmin)) router.push("/dashboard");
  }, [user, isAdmin, isSubAdmin, router]);

  useEffect(() => {
    if (watchedMainCategory === "reality-shows") {
      setIsRealityShow(true);
      setValue("options", selectedContestants);
    } else {
      setIsRealityShow(false);
      setValue("options", manualOptions);
    }
  }, [watchedMainCategory, selectedContestants, manualOptions, setValue]);

  if (!user || (!isAdmin && !isSubAdmin)) return null;

  const onSubmit = async (data: CreatePollForm) => {
    const filteredOptions = data.options.filter((opt) => opt.trim() !== "");
    if (filteredOptions.length < 2) {
      toast.warning("At least 2 options required");
      return;
    }

    let endTime: Date;
    if (data.endType === "scheduled") {
      if (!data.scheduledEndTime) {
        toast.warning("Please select an end time");
        return;
      }
      endTime = new Date(data.scheduledEndTime);
      if (endTime <= new Date()) {
        toast.warning("End time must be in the future");
        return;
      }
    } else {
      endTime = new Date();
      endTime.setFullYear(endTime.getFullYear() + 10);
    }

    const pollData = {
      title: data.title,
      description: data.description,
      category: data.mainCategory,
      options: filteredOptions.map((option) => ({ text: option })),
      endTime: endTime.toISOString(),
      showName: data.mainCategory,
      season: "10",
    };

    createPollMutation.mutate(pollData, {
      onSuccess: () => {
        toast.success("Poll created successfully");
        router.push("/polls");
      },
      onError: (error: any) => {
        toast.error(error?.message || "Failed to create poll");
      },
    });
  };

  const addOption = () => {
    if (!isRealityShow && manualOptions.length < 29) {
      setManualOptions([...manualOptions, ""]);
    }
  };

  const removeOption = (index: number) => {
    if (!isRealityShow && manualOptions.length > 2) {
      setManualOptions(manualOptions.filter((_, i) => i !== index));
    }
  };

  const handleContestantToggle = (contestant: string) => {
    if (selectedContestants.includes(contestant)) {
      setSelectedContestants(selectedContestants.filter((c) => c !== contestant));
    } else {
      setSelectedContestants([...selectedContestants, contestant]);
    }
  };

  const handleManualOptionChange = (index: number, value: string) => {
    const newOptions = [...manualOptions];
    newOptions[index] = value;
    setManualOptions(newOptions);
  };

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
          <h1 className="text-2xl font-black text-white">Create Poll</h1>
          <p className="text-gray-500 text-sm">Set up a new prediction</p>
        </div>

        {/* Form */}
        <Card className="bg-white/[0.03] border-white/[0.06] mb-6">
          <CardHeader className="pb-3">
            <CardTitle className="text-white flex items-center gap-2 text-base">
              <Sparkles className="w-4 h-4 text-violet-400" />
              Poll Details
            </CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
              <div className="space-y-1.5">
                <Label className="text-sm text-gray-300">Title</Label>
                <Input
                  placeholder="e.g., Who will win?"
                  className="h-11 bg-white/[0.03] border-white/[0.06] text-white placeholder-gray-500 rounded-xl"
                  {...register("title")}
                />
                {errors.title && <p className="text-red-400 text-xs">{errors.title.message}</p>}
              </div>

              <div className="space-y-1.5">
                <Label className="text-sm text-gray-300">Description</Label>
                <Textarea
                  placeholder="Provide more details..."
                  rows={3}
                  className="bg-white/[0.03] border-white/[0.06] text-white placeholder-gray-500 rounded-xl"
                  {...register("description")}
                />
                {errors.description && <p className="text-red-400 text-xs">{errors.description.message}</p>}
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <Label className="text-sm text-gray-300">Category</Label>
                  <Select onValueChange={(value) => setValue("mainCategory", value)}>
                    <SelectTrigger className="h-11 bg-white/[0.03] border-white/[0.06] text-white rounded-xl">
                      <SelectValue placeholder="Select" />
                    </SelectTrigger>
                    <SelectContent className="bg-gray-900 border-white/10 max-h-60">
                      {POLL_CATEGORIES.map((option) => (
                        <SelectItem key={option.value} value={option.value} className="text-white hover:bg-white/10">
                          {option.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  {errors.mainCategory && <p className="text-red-400 text-xs">{errors.mainCategory.message}</p>}
                </div>

                <div className="space-y-1.5">
                  <Label className="text-sm text-gray-300">Closing</Label>
                  <Select onValueChange={(value) => setValue("endType", value as any)} defaultValue="scheduled">
                    <SelectTrigger className="h-11 bg-white/[0.03] border-white/[0.06] text-white rounded-xl">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent className="bg-gray-900 border-white/10">
                      <SelectItem value="scheduled" className="text-white hover:bg-white/10">Scheduled</SelectItem>
                      <SelectItem value="manual" disabled className="text-white hover:bg-white/10">Manual</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              {watchedFields.endType === "scheduled" && (
                <div className="space-y-1.5">
                  <Label className="text-sm text-gray-300">End Date & Time</Label>
                  <Input
                    type="datetime-local"
                    min={getMinDateTime()}
                    className="h-11 bg-white/[0.03] border-white/[0.06] text-white rounded-xl [&::-webkit-calendar-picker-indicator]:invert"
                    {...register("scheduledEndTime")}
                  />
                  {errors.scheduledEndTime && <p className="text-red-400 text-xs">{errors.scheduledEndTime.message}</p>}
                </div>
              )}

              {watchedFields.endType === "manual" && (
                <div className="p-3 rounded-xl bg-indigo-500/10 border border-indigo-500/20">
                  <div className="flex items-center gap-2 mb-1">
                    <Clock className="w-4 h-4 text-indigo-400" />
                    <span className="text-sm text-indigo-400 font-medium">Manual Closing</span>
                  </div>
                  <p className="text-xs text-gray-400">Poll stays open until manually closed</p>
                </div>
              )}

              {/* Options */}
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <Label className="text-sm text-gray-300">
                    {isRealityShow ? "Select Contestants" : "Options"}
                  </Label>
                  {!isRealityShow && (
                    <Button
                      type="button"
                      size="sm"
                      onClick={addOption}
                      disabled={manualOptions.length >= 29}
                      className="h-8 bg-violet-500/20 hover:bg-violet-500/30 text-violet-400 rounded-lg text-xs"
                    >
                      <Plus className="w-3 h-3 mr-1" />
                      Add
                    </Button>
                  )}
                </div>

                {isRealityShow ? (
                  <div className="space-y-3">
                    <div className="flex items-center justify-between text-xs">
                      <span className="text-gray-400">Selected: {selectedContestants.length}</span>
                      <div className="flex gap-2">
                        <button
                          type="button"
                          onClick={() => setSelectedContestants([...CONTESTANTS])}
                          className="text-violet-400 hover:text-violet-300"
                        >
                          Select All
                        </button>
                        <button
                          type="button"
                          onClick={() => setSelectedContestants([])}
                          className="text-gray-400 hover:text-white"
                        >
                          Clear
                        </button>
                      </div>
                    </div>
                    <div className="grid grid-cols-2 gap-2 max-h-48 overflow-y-auto p-3 bg-white/[0.02] rounded-xl border border-white/[0.05]">
                      {CONTESTANTS.map((contestant) => (
                        <div key={contestant} className="flex items-center gap-2">
                          <Checkbox
                            id={contestant}
                            checked={selectedContestants.includes(contestant)}
                            onCheckedChange={() => handleContestantToggle(contestant)}
                            className="border-white/30 data-[state=checked]:bg-violet-500"
                          />
                          <label htmlFor={contestant} className="text-xs text-white cursor-pointer truncate">
                            {contestant}
                          </label>
                        </div>
                      ))}
                    </div>
                    {selectedContestants.length < 2 && (
                      <p className="text-amber-400 text-xs">Select at least 2 contestants</p>
                    )}
                  </div>
                ) : (
                  <div className="space-y-2">
                    {manualOptions.map((option, index) => (
                      <div key={index} className="flex gap-2">
                        <Input
                          placeholder={`Option ${index + 1}`}
                          value={option}
                          onChange={(e) => handleManualOptionChange(index, e.target.value)}
                          className="h-10 bg-white/[0.03] border-white/[0.06] text-white placeholder-gray-500 rounded-xl"
                        />
                        <Button
                          type="button"
                          size="sm"
                          variant="outline"
                          onClick={() => removeOption(index)}
                          disabled={manualOptions.length <= 2}
                          className="h-10 px-3 border-white/[0.06] text-gray-400 hover:text-white rounded-xl"
                        >
                          <Minus className="w-4 h-4" />
                        </Button>
                      </div>
                    ))}
                    {manualOptions.filter((o) => o.trim() !== "").length < 2 && (
                      <p className="text-amber-400 text-xs">Provide at least 2 options</p>
                    )}
                  </div>
                )}
                {errors.options && <p className="text-red-400 text-xs">{errors.options.message}</p>}
              </div>

              <div className="flex gap-3 pt-4">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => router.push("/polls")}
                  className="flex-1 h-11 border-white/[0.06] text-gray-400 hover:text-white hover:bg-white/10 rounded-xl"
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  disabled={createPollMutation.isPending}
                  className="flex-1 h-11 bg-gradient-to-r from-violet-500 to-indigo-500 hover:from-violet-600 hover:to-indigo-600 font-bold rounded-xl"
                >
                  {createPollMutation.isPending ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Creating...
                    </>
                  ) : (
                    "Create Poll"
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
              <Badge className="bg-violet-500/20 text-violet-400 border-violet-500/30 text-xs mb-2">
                {POLL_CATEGORIES.find((c) => c.value === watchedFields.mainCategory)?.label || "Category"}
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
              {isRealityShow ? (
                selectedContestants.length > 0 ? (
                  selectedContestants.slice(0, 5).map((c, i) => (
                    <div key={i} className="p-2 bg-white/[0.02] rounded-lg border border-white/[0.05] text-white text-sm">
                      {c}
                    </div>
                  ))
                ) : (
                  <p className="text-gray-500 text-xs">No contestants selected</p>
                )
              ) : manualOptions.filter((o) => o.trim() !== "").length > 0 ? (
                manualOptions.filter((o) => o.trim() !== "").slice(0, 5).map((o, i) => (
                  <div key={i} className="p-2 bg-white/[0.02] rounded-lg border border-white/[0.05] text-white text-sm">
                    {o}
                  </div>
                ))
              ) : (
                <p className="text-gray-500 text-xs">No options yet</p>
              )}
              {((isRealityShow && selectedContestants.length > 5) || (!isRealityShow && manualOptions.filter((o) => o.trim()).length > 5)) && (
                <p className="text-gray-500 text-xs">+{(isRealityShow ? selectedContestants.length : manualOptions.filter((o) => o.trim()).length) - 5} more...</p>
              )}
            </div>

            <div className="flex justify-between pt-3 border-t border-white/[0.05]">
              <span className="text-xs text-gray-400 bg-emerald-500/10 px-2 py-1 rounded">
                Pool: <span className="text-emerald-400 font-bold inline-flex items-center gap-1"><Image src="/usdc.svg" alt="USDC" width={12} height={12} />0</span>
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
}
