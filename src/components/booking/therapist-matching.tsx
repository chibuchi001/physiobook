"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import {
  ArrowRight,
  Calendar,
  CheckCircle,
  Clock,
  Loader2,
  MapPin,
  Sparkles,
  Star,
  User,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { cn, formatTime, getSpecialtyLabel } from "@/lib/utils";
import { useToast } from "@/components/ui/use-toast";

interface TherapistMatch {
  therapistId: string;
  therapistName: string;
  specialties: string[];
  matchScore: number;
  matchReasons: string[];
  availableSlots: { date: Date; time: string }[];
  averageRating: number;
  yearsOfExperience: number;
}

interface TherapistMatchingProps {
  triageData: {
    triageCategory: string;
    urgencyLevel: string;
    recommendedSpecialty: string;
    bodyRegion: string;
  };
  onBookingComplete?: () => void;
}

export function TherapistMatching({
  triageData,
  onBookingComplete,
}: TherapistMatchingProps) {
  const router = useRouter();
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const [matches, setMatches] = useState<TherapistMatch[]>([]);
  const [aiRecommendation, setAiRecommendation] = useState<{
    topRecommendation: string;
    reasoning: string;
    alternativeNote?: string;
  } | null>(null);
  const [selectedTherapist, setSelectedTherapist] = useState<TherapistMatch | null>(null);
  const [selectedSlot, setSelectedSlot] = useState<{ date: Date; time: string } | null>(null);
  const [appointmentType, setAppointmentType] = useState<"IN_PERSON" | "TELE_PHYSIO">("IN_PERSON");
  const [isBooking, setIsBooking] = useState(false);

  const fetchMatches = async () => {
    setIsLoading(true);

    try {
      const response = await fetch("/api/therapists/match", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(triageData),
      });

      if (!response.ok) {
        throw new Error("Failed to find matches");
      }

      const data = await response.json();
      setMatches(data.matches);
      setAiRecommendation(data.recommendation);
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to find matching therapists. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleBookAppointment = async () => {
    if (!selectedTherapist || !selectedSlot) return;

    setIsBooking(true);

    try {
      const response = await fetch("/api/booking", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          therapistId: selectedTherapist.therapistId,
          scheduledDate: selectedSlot.date,
          scheduledTime: selectedSlot.time,
          type: appointmentType,
          chiefComplaint: `${triageData.triageCategory} - ${triageData.bodyRegion}`,
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to book appointment");
      }

      toast({
        title: "Appointment Booked!",
        description: `Your appointment with ${selectedTherapist.therapistName} has been confirmed.`,
        variant: "success",
      });

      onBookingComplete?.();
      router.push("/appointments");
    } catch (error) {
      toast({
        title: "Booking Failed",
        description: "Unable to book the appointment. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsBooking(false);
    }
  };

  // Initial state - show find matches button
  if (matches.length === 0 && !isLoading) {
    return (
      <Card>
        <CardContent className="p-8 text-center">
          <div className="w-16 h-16 rounded-full bg-physio-100 flex items-center justify-center mx-auto mb-4">
            <Sparkles className="w-8 h-8 text-physio-600" />
          </div>
          <h3 className="text-xl font-semibold text-gray-900 mb-2">
            Find Your Perfect Therapist
          </h3>
          <p className="text-gray-500 mb-6 max-w-md mx-auto">
            Based on your triage assessment, we&apos;ll match you with therapists
            who specialize in treating your condition.
          </p>
          <Button
            onClick={fetchMatches}
            className="bg-physio-600 hover:bg-physio-700"
            size="lg"
          >
            <Sparkles className="w-5 h-5 mr-2" />
            Find Matching Therapists
          </Button>
        </CardContent>
      </Card>
    );
  }

  // Loading state
  if (isLoading) {
    return (
      <Card>
        <CardContent className="p-8 text-center">
          <Loader2 className="w-12 h-12 text-physio-600 animate-spin mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-gray-900 mb-2">
            Finding the Best Matches...
          </h3>
          <p className="text-gray-500">
            Analyzing therapist specialties, availability, and success rates
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* AI Recommendation */}
      {aiRecommendation && (
        <Card className="bg-gradient-to-r from-purple-50 to-blue-50 border-purple-100">
          <CardContent className="p-6">
            <div className="flex items-start gap-4">
              <div className="w-12 h-12 rounded-xl bg-white shadow-sm flex items-center justify-center flex-shrink-0">
                <Sparkles className="w-6 h-6 text-purple-600" />
              </div>
              <div>
                <h3 className="font-semibold text-gray-900 mb-1">
                  AI Recommendation
                </h3>
                <p className="text-gray-700">{aiRecommendation.reasoning}</p>
                {aiRecommendation.alternativeNote && (
                  <p className="text-sm text-gray-500 mt-2">
                    {aiRecommendation.alternativeNote}
                  </p>
                )}
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Therapist List */}
      <div className="grid gap-4">
        {matches.map((therapist, index) => (
          <Card
            key={therapist.therapistId}
            className={cn(
              "cursor-pointer transition-all",
              selectedTherapist?.therapistId === therapist.therapistId
                ? "ring-2 ring-physio-500 shadow-lg"
                : "hover:shadow-md"
            )}
            onClick={() => {
              setSelectedTherapist(therapist);
              setSelectedSlot(null);
            }}
          >
            <CardContent className="p-6">
              <div className="flex flex-col md:flex-row md:items-start gap-4">
                {/* Avatar & Basic Info */}
                <div className="flex items-start gap-4 flex-1">
                  <div className="relative">
                    <div className="w-16 h-16 rounded-xl bg-physio-100 flex items-center justify-center">
                      <User className="w-8 h-8 text-physio-600" />
                    </div>
                    {index === 0 && (
                      <div className="absolute -top-2 -right-2 w-6 h-6 bg-yellow-400 rounded-full flex items-center justify-center">
                        <Star className="w-4 h-4 text-white fill-white" />
                      </div>
                    )}
                  </div>

                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <h3 className="font-semibold text-gray-900">
                        {therapist.therapistName}
                      </h3>
                      <span className="px-2 py-0.5 bg-physio-100 text-physio-700 text-xs font-medium rounded-full">
                        {therapist.matchScore}% Match
                      </span>
                    </div>

                    <div className="flex flex-wrap items-center gap-3 text-sm text-gray-500 mb-2">
                      <span className="flex items-center gap-1">
                        <Star className="w-4 h-4 text-yellow-400 fill-yellow-400" />
                        {therapist.averageRating.toFixed(1)}
                      </span>
                      <span>{therapist.yearsOfExperience} years exp.</span>
                    </div>

                    <div className="flex flex-wrap gap-2">
                      {therapist.specialties.slice(0, 3).map((specialty) => (
                        <span
                          key={specialty}
                          className="px-2 py-1 bg-gray-100 text-gray-600 text-xs rounded-full"
                        >
                          {getSpecialtyLabel(specialty)}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Match Reasons */}
                <div className="md:w-64">
                  <p className="text-xs text-gray-500 mb-2">Why this match:</p>
                  <ul className="space-y-1">
                    {therapist.matchReasons.slice(0, 3).map((reason, i) => (
                      <li
                        key={i}
                        className="text-sm text-gray-600 flex items-start gap-1"
                      >
                        <CheckCircle className="w-4 h-4 text-green-500 flex-shrink-0 mt-0.5" />
                        {reason}
                      </li>
                    ))}
                  </ul>
                </div>
              </div>

              {/* Expanded View - Available Slots */}
              {selectedTherapist?.therapistId === therapist.therapistId && (
                <div className="mt-6 pt-6 border-t">
                  <h4 className="font-medium text-gray-900 mb-3">
                    Select a Time Slot
                  </h4>

                  {/* Appointment Type */}
                  <div className="flex gap-3 mb-4">
                    <Button
                      variant={appointmentType === "IN_PERSON" ? "default" : "outline"}
                      size="sm"
                      onClick={(e) => {
                        e.stopPropagation();
                        setAppointmentType("IN_PERSON");
                      }}
                      className={appointmentType === "IN_PERSON" ? "bg-physio-600" : ""}
                    >
                      <MapPin className="w-4 h-4 mr-1" />
                      In-Person
                    </Button>
                    <Button
                      variant={appointmentType === "TELE_PHYSIO" ? "default" : "outline"}
                      size="sm"
                      onClick={(e) => {
                        e.stopPropagation();
                        setAppointmentType("TELE_PHYSIO");
                      }}
                      className={appointmentType === "TELE_PHYSIO" ? "bg-physio-600" : ""}
                    >
                      <Calendar className="w-4 h-4 mr-1" />
                      Tele-Physio
                    </Button>
                  </div>

                  {/* Time Slots */}
                  <div className="flex flex-wrap gap-2 mb-4">
                    {therapist.availableSlots.length > 0 ? (
                      therapist.availableSlots.slice(0, 8).map((slot, i) => (
                        <button
                          key={i}
                          onClick={(e) => {
                            e.stopPropagation();
                            setSelectedSlot(slot);
                          }}
                          className={cn(
                            "px-3 py-2 rounded-lg text-sm font-medium transition-all",
                            selectedSlot?.time === slot.time &&
                              selectedSlot?.date === slot.date
                              ? "bg-physio-500 text-white"
                              : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                          )}
                        >
                          <div className="text-xs opacity-70">
                            {new Date(slot.date).toLocaleDateString("en-US", {
                              weekday: "short",
                              month: "short",
                              day: "numeric",
                            })}
                          </div>
                          <div>{formatTime(slot.time)}</div>
                        </button>
                      ))
                    ) : (
                      <p className="text-sm text-gray-500">
                        No available slots. Please check back later.
                      </p>
                    )}
                  </div>

                  {/* Book Button */}
                  <Button
                    onClick={(e) => {
                      e.stopPropagation();
                      handleBookAppointment();
                    }}
                    disabled={!selectedSlot || isBooking}
                    className="w-full bg-physio-600 hover:bg-physio-700"
                  >
                    {isBooking ? (
                      <>
                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                        Booking...
                      </>
                    ) : (
                      <>
                        Book Appointment
                        <ArrowRight className="w-4 h-4 ml-2" />
                      </>
                    )}
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
