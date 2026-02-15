"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import {
  AlertTriangle,
  ArrowLeft,
  ArrowRight,
  Brain,
  CheckCircle,
  Loader2,
  Sparkles,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { cn, getBodyRegionLabel, getUrgencyClass, getUrgencyLabel, getSpecialtyLabel, getTriageCategoryLabel } from "@/lib/utils";
import { useToast } from "@/components/ui/use-toast";

const BODY_REGIONS = [
  { value: "HEAD_NECK", label: "Head & Neck", icon: "🦴" },
  { value: "SHOULDER", label: "Shoulder", icon: "💪" },
  { value: "UPPER_BACK", label: "Upper Back", icon: "🔙" },
  { value: "LOWER_BACK", label: "Lower Back", icon: "⬇️" },
  { value: "ARM_ELBOW", label: "Arm & Elbow", icon: "💪" },
  { value: "WRIST_HAND", label: "Wrist & Hand", icon: "✋" },
  { value: "HIP", label: "Hip", icon: "🦵" },
  { value: "KNEE", label: "Knee", icon: "🦵" },
  { value: "ANKLE_FOOT", label: "Ankle & Foot", icon: "🦶" },
  { value: "FULL_BODY", label: "Full Body", icon: "🧍" },
  { value: "OTHER", label: "Other", icon: "❓" },
];

const INJURY_DURATIONS = [
  { value: "LESS_THAN_WEEK", label: "Less than a week" },
  { value: "ONE_TO_FOUR_WEEKS", label: "1-4 weeks" },
  { value: "ONE_TO_THREE_MONTHS", label: "1-3 months" },
  { value: "THREE_TO_SIX_MONTHS", label: "3-6 months" },
  { value: "SIX_MONTHS_TO_YEAR", label: "6 months - 1 year" },
  { value: "MORE_THAN_YEAR", label: "More than a year" },
];

const PAIN_TYPES = [
  "Sharp",
  "Dull/Aching",
  "Burning",
  "Throbbing",
  "Stabbing",
  "Tingling/Numbness",
  "Stiffness",
  "Weakness",
];

interface TriageFormData {
  symptoms: string;
  bodyRegion: string;
  painLevel: number;
  duration: string;
  painType: string[];
  worseningFactors: string;
  improvingFactors: string;
  previousTreatment: string;
}

interface TriageResult {
  triageCategory: string;
  urgencyLevel: string;
  recommendedSpecialty: string;
  confidenceScore: number;
  reasoning: string;
  redFlags: string[];
  requiresImmediate: boolean;
}

export function TriageAssessment() {
  const router = useRouter();
  const { toast } = useToast();
  const [step, setStep] = useState(1);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [result, setResult] = useState<TriageResult | null>(null);
  const [formData, setFormData] = useState<TriageFormData>({
    symptoms: "",
    bodyRegion: "",
    painLevel: 5,
    duration: "",
    painType: [],
    worseningFactors: "",
    improvingFactors: "",
    previousTreatment: "",
  });

  const totalSteps = 4;

  const handleNext = () => {
    if (step < totalSteps) {
      setStep(step + 1);
    }
  };

  const handleBack = () => {
    if (step > 1) {
      setStep(step - 1);
    }
  };

  const handlePainTypeToggle = (type: string) => {
    setFormData((prev) => ({
      ...prev,
      painType: prev.painType.includes(type)
        ? prev.painType.filter((t) => t !== type)
        : [...prev.painType, type],
    }));
  };

  const handleSubmit = async () => {
    setIsAnalyzing(true);

    try {
      const response = await fetch("/api/triage/analyze", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...formData,
          painType: formData.painType.join(", "),
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to analyze symptoms");
      }

      const data = await response.json();
      setResult(data);
      setStep(5); // Move to results step
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to analyze your symptoms. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsAnalyzing(false);
    }
  };

  const handleBookAppointment = () => {
    // Store triage result and navigate to booking
    localStorage.setItem("triageResult", JSON.stringify(result));
    localStorage.setItem("triageFormData", JSON.stringify(formData));
    router.push("/book?fromTriage=true");
  };

  const canProceed = () => {
    switch (step) {
      case 1:
        return formData.bodyRegion !== "";
      case 2:
        return formData.symptoms.trim().length >= 10;
      case 3:
        return formData.duration !== "";
      case 4:
        return true;
      default:
        return false;
    }
  };

  return (
    <div className="max-w-2xl mx-auto">
      {/* Progress Bar */}
      {step <= totalSteps && (
        <div className="mb-8">
          <div className="flex justify-between text-sm text-gray-500 mb-2">
            <span>Step {step} of {totalSteps}</span>
            <span>{Math.round((step / totalSteps) * 100)}% Complete</span>
          </div>
          <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
            <motion.div
              className="h-full bg-gradient-to-r from-physio-500 to-health-500"
              initial={{ width: 0 }}
              animate={{ width: `${(step / totalSteps) * 100}%` }}
              transition={{ duration: 0.3 }}
            />
          </div>
        </div>
      )}

      <AnimatePresence mode="wait">
        {/* Step 1: Body Region */}
        {step === 1 && (
          <motion.div
            key="step1"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
          >
            <Card>
              <CardHeader>
                <CardTitle className="text-2xl">
                  Where is your pain or discomfort?
                </CardTitle>
                <p className="text-gray-500">
                  Select the primary area that&apos;s affected
                </p>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                  {BODY_REGIONS.map((region) => (
                    <button
                      key={region.value}
                      onClick={() =>
                        setFormData((prev) => ({
                          ...prev,
                          bodyRegion: region.value,
                        }))
                      }
                      className={cn(
                        "p-4 rounded-xl border-2 transition-all text-left",
                        formData.bodyRegion === region.value
                          ? "border-physio-500 bg-physio-50"
                          : "border-gray-200 hover:border-gray-300"
                      )}
                    >
                      <span className="text-2xl mb-2 block">{region.icon}</span>
                      <span className="font-medium text-gray-900">
                        {region.label}
                      </span>
                    </button>
                  ))}
                </div>
              </CardContent>
            </Card>
          </motion.div>
        )}

        {/* Step 2: Symptoms Description */}
        {step === 2 && (
          <motion.div
            key="step2"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
          >
            <Card>
              <CardHeader>
                <CardTitle className="text-2xl">
                  Describe your symptoms
                </CardTitle>
                <p className="text-gray-500">
                  Tell us what you&apos;re experiencing in your own words
                </p>
              </CardHeader>
              <CardContent className="space-y-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    What symptoms are you experiencing?
                  </label>
                  <textarea
                    value={formData.symptoms}
                    onChange={(e) =>
                      setFormData((prev) => ({
                        ...prev,
                        symptoms: e.target.value,
                      }))
                    }
                    placeholder="Describe your pain, discomfort, or any limitations you're experiencing..."
                    className="w-full h-32 px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-physio-500 focus:border-transparent resize-none"
                  />
                  <p className="text-xs text-gray-500 mt-1">
                    Minimum 10 characters ({formData.symptoms.length}/10)
                  </p>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Type of pain/sensation (select all that apply)
                  </label>
                  <div className="flex flex-wrap gap-2">
                    {PAIN_TYPES.map((type) => (
                      <button
                        key={type}
                        onClick={() => handlePainTypeToggle(type)}
                        className={cn(
                          "px-4 py-2 rounded-full text-sm font-medium transition-all",
                          formData.painType.includes(type)
                            ? "bg-physio-500 text-white"
                            : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                        )}
                      >
                        {type}
                      </button>
                    ))}
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        )}

        {/* Step 3: Pain Level & Duration */}
        {step === 3 && (
          <motion.div
            key="step3"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
          >
            <Card>
              <CardHeader>
                <CardTitle className="text-2xl">Pain Level & Duration</CardTitle>
                <p className="text-gray-500">
                  Help us understand the severity and timeline
                </p>
              </CardHeader>
              <CardContent className="space-y-8">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-4">
                    Pain Level: <span className="text-physio-600 font-bold">{formData.painLevel}/10</span>
                  </label>
                  <input
                    type="range"
                    min="1"
                    max="10"
                    value={formData.painLevel}
                    onChange={(e) =>
                      setFormData((prev) => ({
                        ...prev,
                        painLevel: parseInt(e.target.value),
                      }))
                    }
                    className="w-full h-3 rounded-full appearance-none bg-gradient-to-r from-green-400 via-yellow-400 to-red-500 cursor-pointer"
                  />
                  <div className="flex justify-between text-xs text-gray-500 mt-2">
                    <span>No Pain</span>
                    <span>Mild</span>
                    <span>Moderate</span>
                    <span>Severe</span>
                    <span>Worst</span>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-3">
                    How long have you had this issue?
                  </label>
                  <div className="grid grid-cols-2 gap-3">
                    {INJURY_DURATIONS.map((duration) => (
                      <button
                        key={duration.value}
                        onClick={() =>
                          setFormData((prev) => ({
                            ...prev,
                            duration: duration.value,
                          }))
                        }
                        className={cn(
                          "p-3 rounded-xl border-2 transition-all text-sm font-medium",
                          formData.duration === duration.value
                            ? "border-physio-500 bg-physio-50 text-physio-700"
                            : "border-gray-200 text-gray-700 hover:border-gray-300"
                        )}
                      >
                        {duration.label}
                      </button>
                    ))}
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        )}

        {/* Step 4: Additional Info */}
        {step === 4 && (
          <motion.div
            key="step4"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
          >
            <Card>
              <CardHeader>
                <CardTitle className="text-2xl">Additional Information</CardTitle>
                <p className="text-gray-500">
                  Optional details to help us understand better
                </p>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    What makes it worse?
                  </label>
                  <input
                    type="text"
                    value={formData.worseningFactors}
                    onChange={(e) =>
                      setFormData((prev) => ({
                        ...prev,
                        worseningFactors: e.target.value,
                      }))
                    }
                    placeholder="e.g., sitting for long periods, lifting, exercise..."
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-physio-500 focus:border-transparent"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    What makes it better?
                  </label>
                  <input
                    type="text"
                    value={formData.improvingFactors}
                    onChange={(e) =>
                      setFormData((prev) => ({
                        ...prev,
                        improvingFactors: e.target.value,
                      }))
                    }
                    placeholder="e.g., rest, heat, stretching, medication..."
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-physio-500 focus:border-transparent"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Any previous treatment?
                  </label>
                  <input
                    type="text"
                    value={formData.previousTreatment}
                    onChange={(e) =>
                      setFormData((prev) => ({
                        ...prev,
                        previousTreatment: e.target.value,
                      }))
                    }
                    placeholder="e.g., physiotherapy, surgery, medications..."
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-physio-500 focus:border-transparent"
                  />
                </div>
              </CardContent>
            </Card>
          </motion.div>
        )}

        {/* Results Step */}
        {step === 5 && result && (
          <motion.div
            key="results"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
          >
            <Card className="overflow-hidden">
              <div className="bg-gradient-to-r from-physio-500 to-health-500 p-6 text-white">
                <div className="flex items-center gap-3 mb-2">
                  <Brain className="w-8 h-8" />
                  <h2 className="text-2xl font-bold">AI Assessment Complete</h2>
                </div>
                <p className="opacity-90">
                  Based on your symptoms, here&apos;s our recommendation
                </p>
              </div>

              <CardContent className="p-6 space-y-6">
                {/* Red Flags Warning */}
                {result.redFlags.length > 0 && (
                  <div className="bg-red-50 border border-red-200 rounded-xl p-4">
                    <div className="flex items-start gap-3">
                      <AlertTriangle className="w-6 h-6 text-red-500 flex-shrink-0" />
                      <div>
                        <h3 className="font-semibold text-red-800">
                          Important Notice
                        </h3>
                        <p className="text-sm text-red-700 mt-1">
                          We&apos;ve identified some symptoms that may require medical attention:
                        </p>
                        <ul className="mt-2 space-y-1">
                          {result.redFlags.map((flag, i) => (
                            <li key={i} className="text-sm text-red-700">
                              • {flag}
                            </li>
                          ))}
                        </ul>
                        {result.requiresImmediate && (
                          <p className="text-sm font-semibold text-red-800 mt-2">
                            Please consult a doctor or visit emergency care.
                          </p>
                        )}
                      </div>
                    </div>
                  </div>
                )}

                {/* Main Results */}
                <div className="grid md:grid-cols-2 gap-4">
                  <div className="p-4 bg-gray-50 rounded-xl">
                    <p className="text-sm text-gray-500 mb-1">Condition Type</p>
                    <p className="text-lg font-semibold text-gray-900">
                      {getTriageCategoryLabel(result.triageCategory)}
                    </p>
                  </div>
                  <div className="p-4 bg-gray-50 rounded-xl">
                    <p className="text-sm text-gray-500 mb-1">Urgency</p>
                    <span
                      className={cn(
                        "inline-block px-3 py-1 rounded-full text-sm font-medium",
                        getUrgencyClass(result.urgencyLevel)
                      )}
                    >
                      {getUrgencyLabel(result.urgencyLevel)}
                    </span>
                  </div>
                </div>

                <div className="p-4 bg-physio-50 rounded-xl border border-physio-100">
                  <div className="flex items-center gap-2 mb-2">
                    <Sparkles className="w-5 h-5 text-physio-600" />
                    <p className="text-sm font-medium text-physio-800">
                      Recommended Specialist
                    </p>
                  </div>
                  <p className="text-xl font-bold text-physio-900">
                    {getSpecialtyLabel(result.recommendedSpecialty)}
                  </p>
                </div>

                <div>
                  <p className="text-sm text-gray-500 mb-2">AI Reasoning</p>
                  <p className="text-gray-700 leading-relaxed">
                    {result.reasoning}
                  </p>
                </div>

                <div className="flex items-center gap-2 text-sm text-gray-500">
                  <CheckCircle className="w-4 h-4 text-green-500" />
                  <span>
                    AI Confidence: {Math.round(result.confidenceScore * 100)}%
                  </span>
                </div>

                {!result.requiresImmediate && (
                  <div className="pt-4 border-t">
                    <Button
                      onClick={handleBookAppointment}
                      className="w-full bg-physio-600 hover:bg-physio-700"
                      size="lg"
                    >
                      Book Appointment with Matched Therapist
                      <ArrowRight className="w-5 h-5 ml-2" />
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Navigation Buttons */}
      {step <= totalSteps && (
        <div className="flex justify-between mt-6">
          <Button
            variant="outline"
            onClick={handleBack}
            disabled={step === 1}
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back
          </Button>

          {step < totalSteps ? (
            <Button
              onClick={handleNext}
              disabled={!canProceed()}
              className="bg-physio-600 hover:bg-physio-700"
            >
              Continue
              <ArrowRight className="w-4 h-4 ml-2" />
            </Button>
          ) : (
            <Button
              onClick={handleSubmit}
              disabled={isAnalyzing}
              className="bg-physio-600 hover:bg-physio-700"
            >
              {isAnalyzing ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Analyzing...
                </>
              ) : (
                <>
                  <Brain className="w-4 h-4 mr-2" />
                  Get AI Assessment
                </>
              )}
            </Button>
          )}
        </div>
      )}
    </div>
  );
}
