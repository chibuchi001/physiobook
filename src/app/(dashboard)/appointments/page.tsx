import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import Link from "next/link";
import {
  Calendar,
  CheckCircle,
  Clock,
  MapPin,
  MoreHorizontal,
  Phone,
  Plus,
  Video,
  XCircle,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import prisma from "@/lib/prisma";
import { cn, formatDate, formatTime, getUrgencyClass } from "@/lib/utils";

export default async function AppointmentsPage() {
  const { userId } = await auth();

  if (!userId) {
    redirect("/sign-in");
  }

  const user = await prisma.user.findUnique({
    where: { clerkId: userId },
    include: { patient: true },
  });

  if (!user?.patient) {
    redirect("/dashboard");
  }

  // Get all appointments
  const appointments = await prisma.appointment.findMany({
    where: { patientId: user.patient.id },
    include: {
      therapist: {
        include: {
          user: {
            select: { firstName: true, lastName: true, imageUrl: true },
          },
        },
      },
      triageAssessment: true,
    },
    orderBy: [{ scheduledDate: "desc" }, { scheduledTime: "desc" }],
  });

  // Separate upcoming and past appointments
  const now = new Date();
  const upcomingAppointments = appointments.filter(
    (apt) =>
      new Date(apt.scheduledDate) >= now &&
      ["PENDING", "CONFIRMED"].includes(apt.status)
  );
  const pastAppointments = appointments.filter(
    (apt) =>
      new Date(apt.scheduledDate) < now || !["PENDING", "CONFIRMED"].includes(apt.status)
  );

  const getStatusColor = (status: string) => {
    switch (status) {
      case "CONFIRMED":
        return "bg-green-100 text-green-700";
      case "PENDING":
        return "bg-yellow-100 text-yellow-700";
      case "COMPLETED":
        return "bg-blue-100 text-blue-700";
      case "CANCELLED":
        return "bg-gray-100 text-gray-700";
      case "NO_SHOW":
        return "bg-red-100 text-red-700";
      default:
        return "bg-gray-100 text-gray-700";
    }
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case "TELE_PHYSIO":
        return <Video className="w-4 h-4" />;
      case "HOME_VISIT":
        return <MapPin className="w-4 h-4" />;
      default:
        return <MapPin className="w-4 h-4" />;
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">My Appointments</h1>
          <p className="text-gray-500 mt-1">
            Manage your physiotherapy appointments
          </p>
        </div>
        <Link href="/book">
          <Button className="bg-physio-600 hover:bg-physio-700">
            <Plus className="w-4 h-4 mr-2" />
            Book New Appointment
          </Button>
        </Link>
      </div>

      {/* Upcoming Appointments */}
      <div>
        <h2 className="text-lg font-semibold text-gray-900 mb-4">
          Upcoming Appointments ({upcomingAppointments.length})
        </h2>

        {upcomingAppointments.length > 0 ? (
          <div className="grid gap-4">
            {upcomingAppointments.map((apt) => (
              <Card key={apt.id} className="overflow-hidden">
                <CardContent className="p-0">
                  <div className="flex flex-col md:flex-row">
                    {/* Date Section */}
                    <div className="bg-physio-50 p-4 md:p-6 md:w-40 flex flex-row md:flex-col items-center justify-center gap-2 md:gap-1 text-center border-b md:border-b-0 md:border-r border-physio-100">
                      <span className="text-sm text-physio-600 font-medium">
                        {new Date(apt.scheduledDate).toLocaleDateString("en-US", {
                          weekday: "short",
                        })}
                      </span>
                      <span className="text-3xl font-bold text-physio-700">
                        {new Date(apt.scheduledDate).getDate()}
                      </span>
                      <span className="text-sm text-physio-600">
                        {new Date(apt.scheduledDate).toLocaleDateString("en-US", {
                          month: "short",
                        })}
                      </span>
                    </div>

                    {/* Details Section */}
                    <div className="flex-1 p-4 md:p-6">
                      <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4">
                        <div className="space-y-2">
                          <div className="flex items-center gap-3">
                            <h3 className="font-semibold text-gray-900">
                              Dr. {apt.therapist.user.firstName}{" "}
                              {apt.therapist.user.lastName}
                            </h3>
                            <span
                              className={cn(
                                "px-2 py-0.5 rounded-full text-xs font-medium",
                                getStatusColor(apt.status)
                              )}
                            >
                              {apt.status}
                            </span>
                          </div>

                          <div className="flex flex-wrap items-center gap-4 text-sm text-gray-500">
                            <span className="flex items-center gap-1">
                              <Clock className="w-4 h-4" />
                              {formatTime(apt.scheduledTime)}
                            </span>
                            <span className="flex items-center gap-1">
                              {getTypeIcon(apt.type)}
                              {apt.type === "TELE_PHYSIO"
                                ? "Video Call"
                                : apt.type === "HOME_VISIT"
                                ? "Home Visit"
                                : "In-Person"}
                            </span>
                            <span className="flex items-center gap-1">
                              <Calendar className="w-4 h-4" />
                              {apt.duration} min
                            </span>
                          </div>

                          {apt.chiefComplaint && (
                            <p className="text-sm text-gray-600 mt-2">
                              {apt.chiefComplaint}
                            </p>
                          )}
                        </div>

                        <div className="flex gap-2">
                          {apt.type === "TELE_PHYSIO" && apt.status === "CONFIRMED" && (
                            <Link href="/tele-physio">
                              <Button size="sm" className="bg-physio-600 hover:bg-physio-700">
                                <Video className="w-4 h-4 mr-1" />
                                Join Call
                              </Button>
                            </Link>
                          )}
                          <Button size="sm" variant="outline">
                            Reschedule
                          </Button>
                          <Button size="sm" variant="ghost" className="text-red-600 hover:text-red-700 hover:bg-red-50">
                            Cancel
                          </Button>
                        </div>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : (
          <Card>
            <CardContent className="p-8 text-center">
              <Calendar className="w-12 h-12 text-gray-300 mx-auto mb-3" />
              <h3 className="font-medium text-gray-900 mb-1">
                No Upcoming Appointments
              </h3>
              <p className="text-gray-500 text-sm mb-4">
                Book an appointment to start your recovery journey
              </p>
              <Link href="/book">
                <Button className="bg-physio-600 hover:bg-physio-700">
                  Book Appointment
                </Button>
              </Link>
            </CardContent>
          </Card>
        )}
      </div>

      {/* Past Appointments */}
      {pastAppointments.length > 0 && (
        <div>
          <h2 className="text-lg font-semibold text-gray-900 mb-4">
            Past Appointments
          </h2>

          <div className="space-y-3">
            {pastAppointments.slice(0, 10).map((apt) => (
              <Card key={apt.id}>
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 rounded-xl bg-gray-100 flex items-center justify-center">
                        {apt.status === "COMPLETED" ? (
                          <CheckCircle className="w-6 h-6 text-green-500" />
                        ) : apt.status === "CANCELLED" ? (
                          <XCircle className="w-6 h-6 text-gray-400" />
                        ) : (
                          <Calendar className="w-6 h-6 text-gray-400" />
                        )}
                      </div>
                      <div>
                        <p className="font-medium text-gray-900">
                          Dr. {apt.therapist.user.firstName}{" "}
                          {apt.therapist.user.lastName}
                        </p>
                        <p className="text-sm text-gray-500">
                          {formatDate(apt.scheduledDate)} at{" "}
                          {formatTime(apt.scheduledTime)}
                        </p>
                      </div>
                    </div>
                    <span
                      className={cn(
                        "px-3 py-1 rounded-full text-xs font-medium",
                        getStatusColor(apt.status)
                      )}
                    >
                      {apt.status}
                    </span>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
