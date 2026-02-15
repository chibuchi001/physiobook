"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import {
  Activity,
  ArrowRight,
  CheckCircle,
  Loader2,
  Moon,
  Smile,
  TrendingUp,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { useToast } from "@/components/ui/use-toast";

interface ProgressFormData {
  painLevel: number;
  mobilityScore: number;
  functionalScore: number;
  dailyActivityLevel: number;
  sleepQuality: number;
  overallWellbeing: number;
  notes: string;
}

export function ProgressLoggingForm() {
  const router = useRouter();
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState<ProgressFormData>({
    painLevel: 5,
    mobilityScore: 5,
    functionalScore: 5,
    dailyActivityLevel: 5,
    sleepQuality: 5,
    overallWellbeing: 5,
    notes: "",
  });

  const handleSubmit = async () => {
    setIsSubmitting(true);

    try {
      const response = await fetch("/api/progress", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      if (!response.ok) {
        throw new Error("Failed to save progress");
      }

      toast({
        title: "Progress Saved!",
        description: "Your progress has been recorded successfully.",
        variant: "success",
      });

      router.refresh();
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to save progress. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const ScaleInput = ({
    label,
    value,
    onChange,
    icon: Icon,
    lowLabel,
    highLabel,
    color,
  }: {
    label: string;
    value: number;
    onChange: (value: number) => void;
    icon: React.ElementType;
    lowLabel: string;
    highLabel: string;
    color: string;
  }) => (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Icon className={cn("w-5 h-5", color)} />
          <span className="font-medium text-gray-900">{label}</span>
        </div>
        <span className={cn("text-lg font-bold", color)}>{value}/10</span>
      </div>
      <input
        type="range"
        min="1"
        max="10"
        value={value}
        onChange={(e) => onChange(parseInt(e.target.value))}
        className="w-full h-2 rounded-full appearance-none cursor-pointer"
        style={{
          background: `linear-gradient(to right, ${color.includes("red") ? "#ef4444" : color.includes("blue") ? "#3b82f6" : "#22c55e"} 0%, ${color.includes("red") ? "#ef4444" : color.includes("blue") ? "#3b82f6" : "#22c55e"} ${(value - 1) * 11.1}%, #e5e7eb ${(value - 1) * 11.1}%, #e5e7eb 100%)`,
        }}
      />
      <div className="flex justify-between text-xs text-gray-500">
        <span>{lowLabel}</span>
        <span>{highLabel}</span>
      </div>
    </div>
  );

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <TrendingUp className="w-5 h-5 text-physio-600" />
          Log Today&apos;s Progress
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Pain Level */}
        <ScaleInput
          label="Pain Level"
          value={formData.painLevel}
          onChange={(v) => setFormData((prev) => ({ ...prev, painLevel: v }))}
          icon={Activity}
          lowLabel="No Pain"
          highLabel="Severe Pain"
          color="text-red-500"
        />

        {/* Mobility Score */}
        <ScaleInput
          label="Mobility"
          value={formData.mobilityScore}
          onChange={(v) => setFormData((prev) => ({ ...prev, mobilityScore: v }))}
          icon={TrendingUp}
          lowLabel="Very Limited"
          highLabel="Full Mobility"
          color="text-blue-500"
        />

        {/* Functional Score */}
        <ScaleInput
          label="Daily Function"
          value={formData.functionalScore}
          onChange={(v) => setFormData((prev) => ({ ...prev, functionalScore: v }))}
          icon={CheckCircle}
          lowLabel="Very Difficult"
          highLabel="No Difficulty"
          color="text-green-500"
        />

        {/* Daily Activity Level */}
        <ScaleInput
          label="Activity Level"
          value={formData.dailyActivityLevel}
          onChange={(v) =>
            setFormData((prev) => ({ ...prev, dailyActivityLevel: v }))
          }
          icon={Activity}
          lowLabel="Sedentary"
          highLabel="Very Active"
          color="text-orange-500"
        />

        {/* Sleep Quality */}
        <ScaleInput
          label="Sleep Quality"
          value={formData.sleepQuality}
          onChange={(v) => setFormData((prev) => ({ ...prev, sleepQuality: v }))}
          icon={Moon}
          lowLabel="Poor"
          highLabel="Excellent"
          color="text-indigo-500"
        />

        {/* Overall Wellbeing */}
        <ScaleInput
          label="Overall Wellbeing"
          value={formData.overallWellbeing}
          onChange={(v) =>
            setFormData((prev) => ({ ...prev, overallWellbeing: v }))
          }
          icon={Smile}
          lowLabel="Poor"
          highLabel="Excellent"
          color="text-physio-500"
        />

        {/* Notes */}
        <div className="space-y-2">
          <label className="font-medium text-gray-900">
            Additional Notes (Optional)
          </label>
          <textarea
            value={formData.notes}
            onChange={(e) =>
              setFormData((prev) => ({ ...prev, notes: e.target.value }))
            }
            placeholder="Any other observations about your condition today..."
            className="w-full h-24 px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-physio-500 focus:border-transparent resize-none"
          />
        </div>

        <Button
          onClick={handleSubmit}
          disabled={isSubmitting}
          className="w-full bg-physio-600 hover:bg-physio-700"
        >
          {isSubmitting ? (
            <>
              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              Saving...
            </>
          ) : (
            <>
              Save Progress
              <ArrowRight className="w-4 h-4 ml-2" />
            </>
          )}
        </Button>
      </CardContent>
    </Card>
  );
}
