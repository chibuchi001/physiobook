"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import {
  Calendar,
  Camera,
  CheckCircle,
  Clock,
  Info,
  Monitor,
  Phone,
  Shield,
  Video,
  Wifi,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { VideoCall } from "@/components/video/video-call";

// Mock upcoming tele-physio appointments
const upcomingAppointments = [
  {
    id: "1",
    therapistName: "Dr. Sarah Johnson",
    date: "Today",
    time: "2:00 PM",
    status: "ready",
  },
  {
    id: "2",
    therapistName: "Dr. Michael Chen",
    date: "Tomorrow",
    time: "10:30 AM",
    status: "scheduled",
  },
];

export default function TelePhysioPage() {
  const router = useRouter();
  const [activeCall, setActiveCall] = useState<{
    appointmentId: string;
    participantName: string;
  } | null>(null);
  const [showPreCallCheck, setShowPreCallCheck] = useState(false);
  const [preCallChecks, setPreCallChecks] = useState({
    camera: false,
    microphone: false,
    internet: false,
  });

  const runPreCallChecks = async () => {
    setShowPreCallCheck(true);

    // Check camera
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: true });
      stream.getTracks().forEach((track) => track.stop());
      setPreCallChecks((prev) => ({ ...prev, camera: true }));
    } catch {
      setPreCallChecks((prev) => ({ ...prev, camera: false }));
    }

    // Check microphone
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      stream.getTracks().forEach((track) => track.stop());
      setPreCallChecks((prev) => ({ ...prev, microphone: true }));
    } catch {
      setPreCallChecks((prev) => ({ ...prev, microphone: false }));
    }

    // Check internet (simple check)
    setPreCallChecks((prev) => ({ ...prev, internet: navigator.onLine }));
  };

  const joinCall = (appointmentId: string, therapistName: string) => {
    setActiveCall({ appointmentId, participantName: therapistName });
  };

  const endCall = () => {
    setActiveCall(null);
  };

  // If in a call, show the video call component
  if (activeCall) {
    return (
      <div className="space-y-4">
        <Button variant="ghost" onClick={endCall} className="mb-4">
          ← Back to Tele-Physio
        </Button>
        <VideoCall
          appointmentId={activeCall.appointmentId}
          participantName={activeCall.participantName}
          onEndCall={endCall}
        />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Tele-Physio Sessions</h1>
        <p className="text-gray-500 mt-1">
          Connect with your physiotherapist through secure video calls
        </p>
      </div>

      {/* Info Banner */}
      <Card className="bg-gradient-to-r from-blue-50 to-indigo-50 border-blue-100">
        <CardContent className="p-6">
          <div className="flex items-start gap-4">
            <div className="w-12 h-12 rounded-xl bg-white shadow-sm flex items-center justify-center flex-shrink-0">
              <Video className="w-6 h-6 text-blue-600" />
            </div>
            <div>
              <h3 className="font-semibold text-gray-900 mb-1">
                Secure Video Consultations
              </h3>
              <p className="text-sm text-gray-600">
                Our tele-physio platform uses end-to-end encryption to ensure your
                sessions are private and secure. You can share your screen for
                exercise demonstrations and use the chat feature during calls.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="grid lg:grid-cols-3 gap-6">
        {/* Upcoming Sessions */}
        <div className="lg:col-span-2 space-y-4">
          <h2 className="text-lg font-semibold text-gray-900">
            Upcoming Sessions
          </h2>

          {upcomingAppointments.length > 0 ? (
            <div className="space-y-4">
              {upcomingAppointments.map((apt) => (
                <Card key={apt.id}>
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-4">
                        <div className="w-14 h-14 rounded-xl bg-blue-100 flex items-center justify-center">
                          <Video className="w-7 h-7 text-blue-600" />
                        </div>
                        <div>
                          <h3 className="font-semibold text-gray-900">
                            {apt.therapistName}
                          </h3>
                          <div className="flex items-center gap-3 text-sm text-gray-500 mt-1">
                            <span className="flex items-center gap-1">
                              <Calendar className="w-4 h-4" />
                              {apt.date}
                            </span>
                            <span className="flex items-center gap-1">
                              <Clock className="w-4 h-4" />
                              {apt.time}
                            </span>
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center gap-3">
                        {apt.status === "ready" ? (
                          <>
                            <span className="px-3 py-1 bg-green-100 text-green-700 text-sm font-medium rounded-full flex items-center gap-1">
                              <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
                              Ready to Join
                            </span>
                            <Button
                              className="bg-physio-600 hover:bg-physio-700"
                              onClick={() => joinCall(apt.id, apt.therapistName)}
                            >
                              <Phone className="w-4 h-4 mr-2" />
                              Join Call
                            </Button>
                          </>
                        ) : (
                          <span className="px-3 py-1 bg-gray-100 text-gray-700 text-sm font-medium rounded-full">
                            Scheduled
                          </span>
                        )}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : (
            <Card>
              <CardContent className="p-8 text-center">
                <Video className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                <h3 className="font-medium text-gray-900 mb-1">
                  No Upcoming Sessions
                </h3>
                <p className="text-gray-500 text-sm mb-4">
                  Book a tele-physio appointment to get started
                </p>
                <Button
                  className="bg-physio-600 hover:bg-physio-700"
                  onClick={() => router.push("/book")}
                >
                  Book Session
                </Button>
              </CardContent>
            </Card>
          )}
        </div>

        {/* Pre-Call Checklist */}
        <div className="space-y-4">
          <h2 className="text-lg font-semibold text-gray-900">Before Your Call</h2>

          <Card>
            <CardHeader>
              <CardTitle className="text-base">System Check</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {!showPreCallCheck ? (
                <Button
                  className="w-full"
                  variant="outline"
                  onClick={runPreCallChecks}
                >
                  <Monitor className="w-4 h-4 mr-2" />
                  Run System Check
                </Button>
              ) : (
                <div className="space-y-3">
                  <div className="flex items-center justify-between p-3 rounded-lg bg-gray-50">
                    <div className="flex items-center gap-2">
                      <Camera className="w-4 h-4 text-gray-600" />
                      <span className="text-sm">Camera</span>
                    </div>
                    {preCallChecks.camera ? (
                      <CheckCircle className="w-5 h-5 text-green-500" />
                    ) : (
                      <span className="text-xs text-red-500">Not found</span>
                    )}
                  </div>

                  <div className="flex items-center justify-between p-3 rounded-lg bg-gray-50">
                    <div className="flex items-center gap-2">
                      <Video className="w-4 h-4 text-gray-600" />
                      <span className="text-sm">Microphone</span>
                    </div>
                    {preCallChecks.microphone ? (
                      <CheckCircle className="w-5 h-5 text-green-500" />
                    ) : (
                      <span className="text-xs text-red-500">Not found</span>
                    )}
                  </div>

                  <div className="flex items-center justify-between p-3 rounded-lg bg-gray-50">
                    <div className="flex items-center gap-2">
                      <Wifi className="w-4 h-4 text-gray-600" />
                      <span className="text-sm">Internet</span>
                    </div>
                    {preCallChecks.internet ? (
                      <CheckCircle className="w-5 h-5 text-green-500" />
                    ) : (
                      <span className="text-xs text-red-500">Offline</span>
                    )}
                  </div>

                  <Button
                    variant="ghost"
                    size="sm"
                    className="w-full"
                    onClick={runPreCallChecks}
                  >
                    Run Again
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-base flex items-center gap-2">
                <Info className="w-4 h-4" />
                Tips for Your Session
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ul className="space-y-2 text-sm text-gray-600">
                <li className="flex items-start gap-2">
                  <CheckCircle className="w-4 h-4 text-physio-500 flex-shrink-0 mt-0.5" />
                  Find a quiet, well-lit space
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle className="w-4 h-4 text-physio-500 flex-shrink-0 mt-0.5" />
                  Wear comfortable clothing for exercises
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle className="w-4 h-4 text-physio-500 flex-shrink-0 mt-0.5" />
                  Have enough space to move around
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle className="w-4 h-4 text-physio-500 flex-shrink-0 mt-0.5" />
                  Keep any exercise equipment nearby
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle className="w-4 h-4 text-physio-500 flex-shrink-0 mt-0.5" />
                  Test your camera and microphone
                </li>
              </ul>
            </CardContent>
          </Card>

          <Card className="bg-physio-50 border-physio-100">
            <CardContent className="p-4">
              <div className="flex items-center gap-2 text-physio-700">
                <Shield className="w-5 h-5" />
                <span className="text-sm font-medium">
                  End-to-end encrypted sessions
                </span>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
