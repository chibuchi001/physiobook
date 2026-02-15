import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import Link from "next/link";
import {
  Activity,
  ArrowRight,
  Calendar,
  Camera,
  CheckCircle2,
  Clock,
  Flame,
  LineChart,
  Sparkles,
  Stethoscope,
  TrendingUp,
  Users,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import prisma from "@/lib/prisma";

export default async function DashboardPage() {
  const { userId } = await auth();

  if (!userId) {
    redirect("/sign-in");
  }

  // Get user data
  const user = await prisma.user.findUnique({
    where: { clerkId: userId },
    include: {
      patient: {
        include: {
          appointments: {
            where: {
              scheduledDate: { gte: new Date() },
              status: { in: ["PENDING", "CONFIRMED"] },
            },
            include: {
              therapist: {
                include: {
                  user: {
                    select: { firstName: true, lastName: true },
                  },
                },
              },
            },
            orderBy: [{ scheduledDate: "asc" }, { scheduledTime: "asc" }],
            take: 3,
          },
          progressRecords: {
            orderBy: { recordedAt: "desc" },
            take: 1,
          },
          exerciseSessions: {
            where: {
              completedAt: {
                gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000),
              },
            },
          },
        },
      },
      subscription: true,
    },
  });

  const upcomingAppointments = user?.patient?.appointments || [];
  const latestProgress = user?.patient?.progressRecords[0];
  const weeklyExercises = user?.patient?.exerciseSessions.length || 0;

  return (
    <div className="space-y-8">
      {/* Welcome Section */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">
            Welcome back, {user?.firstName || "there"}! 👋
          </h1>
          <p className="text-gray-500 mt-1">
            Here&apos;s your recovery overview for today
          </p>
        </div>
        <Link href="/book">
          <Button className="bg-physio-600 hover:bg-physio-700">
            <Calendar className="w-4 h-4 mr-2" />
            Book Appointment
          </Button>
        </Link>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-xl bg-physio-100 flex items-center justify-center">
                <Calendar className="w-6 h-6 text-physio-600" />
              </div>
              <div>
                <p className="text-2xl font-bold text-gray-900">
                  {upcomingAppointments.length}
                </p>
                <p className="text-sm text-gray-500">Upcoming</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-xl bg-orange-100 flex items-center justify-center">
                <Flame className="w-6 h-6 text-orange-600" />
              </div>
              <div>
                <p className="text-2xl font-bold text-gray-900">
                  {weeklyExercises}
                </p>
                <p className="text-sm text-gray-500">This Week</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-xl bg-blue-100 flex items-center justify-center">
                <Activity className="w-6 h-6 text-blue-600" />
              </div>
              <div>
                <p className="text-2xl font-bold text-gray-900">
                  {latestProgress ? 10 - latestProgress.painLevel : "-"}/10
                </p>
                <p className="text-sm text-gray-500">Pain Free</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-xl bg-green-100 flex items-center justify-center">
                <TrendingUp className="w-6 h-6 text-green-600" />
              </div>
              <div>
                <p className="text-2xl font-bold text-gray-900">
                  {latestProgress?.mobilityScore || "-"}/10
                </p>
                <p className="text-sm text-gray-500">Mobility</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid lg:grid-cols-2 gap-6">
        {/* Upcoming Appointments */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle className="text-lg">Upcoming Appointments</CardTitle>
            <Link
              href="/appointments"
              className="text-sm text-physio-600 hover:text-physio-700 font-medium"
            >
              View all
            </Link>
          </CardHeader>
          <CardContent>
            {upcomingAppointments.length > 0 ? (
              <div className="space-y-4">
                {upcomingAppointments.map((apt) => (
                  <div
                    key={apt.id}
                    className="flex items-center gap-4 p-4 rounded-xl bg-gray-50"
                  >
                    <div className="w-12 h-12 rounded-xl bg-physio-100 flex items-center justify-center">
                      <Stethoscope className="w-6 h-6 text-physio-600" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-gray-900">
                        {apt.therapist.user.firstName} {apt.therapist.user.lastName}
                      </p>
                      <div className="flex items-center gap-2 text-sm text-gray-500">
                        <Clock className="w-4 h-4" />
                        <span>
                          {new Date(apt.scheduledDate).toLocaleDateString()} at{" "}
                          {apt.scheduledTime}
                        </span>
                      </div>
                    </div>
                    <span
                      className={`px-3 py-1 rounded-full text-xs font-medium ${
                        apt.status === "CONFIRMED"
                          ? "bg-green-100 text-green-700"
                          : "bg-yellow-100 text-yellow-700"
                      }`}
                    >
                      {apt.status}
                    </span>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8">
                <Calendar className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                <p className="text-gray-500">No upcoming appointments</p>
                <Link href="/book">
                  <Button variant="outline" className="mt-4">
                    Book Now
                  </Button>
                </Link>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Quick Actions */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Quick Actions</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <Link href="/book" className="block">
              <div className="flex items-center gap-4 p-4 rounded-xl bg-gradient-to-r from-physio-50 to-health-50 hover:from-physio-100 hover:to-health-100 transition-colors cursor-pointer">
                <div className="w-12 h-12 rounded-xl bg-white shadow-sm flex items-center justify-center">
                  <Sparkles className="w-6 h-6 text-physio-600" />
                </div>
                <div className="flex-1">
                  <p className="font-medium text-gray-900">AI Triage Assessment</p>
                  <p className="text-sm text-gray-500">
                    Get matched with the right specialist
                  </p>
                </div>
                <ArrowRight className="w-5 h-5 text-gray-400" />
              </div>
            </Link>

            <Link href="/exercises" className="block">
              <div className="flex items-center gap-4 p-4 rounded-xl bg-gray-50 hover:bg-gray-100 transition-colors cursor-pointer">
                <div className="w-12 h-12 rounded-xl bg-white shadow-sm flex items-center justify-center">
                  <Camera className="w-6 h-6 text-orange-600" />
                </div>
                <div className="flex-1">
                  <p className="font-medium text-gray-900">Exercise Guidance</p>
                  <p className="text-sm text-gray-500">
                    AI-powered form feedback
                  </p>
                </div>
                <ArrowRight className="w-5 h-5 text-gray-400" />
              </div>
            </Link>

            <Link href="/progress" className="block">
              <div className="flex items-center gap-4 p-4 rounded-xl bg-gray-50 hover:bg-gray-100 transition-colors cursor-pointer">
                <div className="w-12 h-12 rounded-xl bg-white shadow-sm flex items-center justify-center">
                  <LineChart className="w-6 h-6 text-blue-600" />
                </div>
                <div className="flex-1">
                  <p className="font-medium text-gray-900">Track Progress</p>
                  <p className="text-sm text-gray-500">
                    Log pain levels & mobility
                  </p>
                </div>
                <ArrowRight className="w-5 h-5 text-gray-400" />
              </div>
            </Link>

            <Link href="/therapists" className="block">
              <div className="flex items-center gap-4 p-4 rounded-xl bg-gray-50 hover:bg-gray-100 transition-colors cursor-pointer">
                <div className="w-12 h-12 rounded-xl bg-white shadow-sm flex items-center justify-center">
                  <Users className="w-6 h-6 text-purple-600" />
                </div>
                <div className="flex-1">
                  <p className="font-medium text-gray-900">Browse Therapists</p>
                  <p className="text-sm text-gray-500">
                    Find specialists near you
                  </p>
                </div>
                <ArrowRight className="w-5 h-5 text-gray-400" />
              </div>
            </Link>
          </CardContent>
        </Card>
      </div>

      {/* Subscription Banner */}
      {user?.subscription?.plan === "FREE" && (
        <Card className="bg-gradient-to-r from-physio-600 to-health-600 text-white border-0">
          <CardContent className="p-6">
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
              <div>
                <h3 className="text-xl font-bold">Upgrade to Pro</h3>
                <p className="text-white/80 mt-1">
                  Get AI exercise guidance, unlimited appointments, and more.
                </p>
              </div>
              <Link href="/settings#subscription">
                <Button variant="secondary" size="lg">
                  View Plans
                  <ArrowRight className="w-4 h-4 ml-2" />
                </Button>
              </Link>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
