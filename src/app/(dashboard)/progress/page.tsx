import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import { ProgressDashboard } from "@/components/progress/progress-dashboard";
import { ProgressLoggingForm } from "@/components/progress/progress-logging-form";
import prisma from "@/lib/prisma";

export default async function ProgressPage() {
  const { userId } = await auth();

  if (!userId) {
    redirect("/sign-in");
  }

  // Get user and progress data
  const user = await prisma.user.findUnique({
    where: { clerkId: userId },
    include: {
      patient: {
        include: {
          progressRecords: {
            orderBy: { recordedAt: "asc" },
            take: 20,
          },
          appointments: {
            where: {
              status: "COMPLETED",
            },
          },
          exerciseSessions: {
            orderBy: { completedAt: "desc" },
            take: 30,
          },
        },
      },
    },
  });

  // Transform progress data for the dashboard
  const progressData = user?.patient?.progressRecords.map((record, index) => ({
    date: `Week ${index + 1}`,
    painLevel: record.painLevel,
    mobilityScore: record.mobilityScore,
    functionalScore: record.functionalScore,
    exerciseCompliance: Math.round(Math.random() * 30 + 70), // Placeholder
  })) || [];

  // Calculate exercise streak
  const exerciseStreak = calculateExerciseStreak(user?.patient?.exerciseSessions || []);

  return (
    <div className="space-y-8">
      {/* Progress Dashboard */}
      <ProgressDashboard
        patientName={user?.firstName || "Your"}
        progressData={progressData.length > 0 ? progressData : undefined}
        totalSessions={12}
        completedSessions={user?.patient?.appointments.length || 0}
        exerciseStreak={exerciseStreak}
      />

      {/* Progress Logging Form */}
      <div className="grid lg:grid-cols-2 gap-6">
        <ProgressLoggingForm />
        
        {/* Recent Progress Entries */}
        <div className="bg-white rounded-2xl border p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Recent Entries</h3>
          {user?.patient?.progressRecords && user.patient.progressRecords.length > 0 ? (
            <div className="space-y-3">
              {user.patient.progressRecords.slice(-5).reverse().map((record) => (
                <div
                  key={record.id}
                  className="flex items-center justify-between p-3 bg-gray-50 rounded-xl"
                >
                  <div>
                    <p className="text-sm font-medium text-gray-900">
                      {new Date(record.recordedAt).toLocaleDateString()}
                    </p>
                    <p className="text-xs text-gray-500">
                      Pain: {record.painLevel}/10 • Mobility: {record.mobilityScore}/10
                    </p>
                  </div>
                  <div className="text-right">
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                      record.painLevel <= 3
                        ? "bg-green-100 text-green-700"
                        : record.painLevel <= 6
                        ? "bg-yellow-100 text-yellow-700"
                        : "bg-red-100 text-red-700"
                    }`}>
                      {record.painLevel <= 3 ? "Good" : record.painLevel <= 6 ? "Moderate" : "High Pain"}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-gray-500 text-sm">
              No progress entries yet. Use the form to log your first entry!
            </p>
          )}
        </div>
      </div>
    </div>
  );
}

function calculateExerciseStreak(sessions: { completedAt: Date }[]): number {
  if (sessions.length === 0) return 0;

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  let streak = 0;
  let currentDate = new Date(today);

  // Group sessions by date
  const sessionDates = new Set(
    sessions.map((s) => {
      const date = new Date(s.completedAt);
      date.setHours(0, 0, 0, 0);
      return date.getTime();
    })
  );

  // Count consecutive days
  while (sessionDates.has(currentDate.getTime())) {
    streak++;
    currentDate.setDate(currentDate.getDate() - 1);
  }

  return streak;
}
