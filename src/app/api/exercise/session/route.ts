import { auth } from "@clerk/nextjs/server";
import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export async function POST(request: NextRequest) {
  try {
    const { userId } = await auth();

    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const {
      exerciseId,
      exercisePlanItemId,
      completedReps,
      targetReps,
      formScore,
      duration,
      poseAnalysisData,
      formCorrections,
    } = body;

    // Get user's patient record
    const user = await prisma.user.findUnique({
      where: { clerkId: userId },
      include: { patient: true },
    });

    if (!user?.patient) {
      return NextResponse.json(
        { error: "Patient profile not found" },
        { status: 404 }
      );
    }

    // Create exercise session
    const session = await prisma.exerciseSession.create({
      data: {
        patientId: user.patient.id,
        exerciseId,
        exercisePlanItemId: exercisePlanItemId || null,
        completedReps,
        targetReps,
        formScore,
        duration,
        poseAnalysisData: poseAnalysisData || null,
        formCorrections: formCorrections || [],
        completedAt: new Date(),
      },
      include: {
        exercise: true,
      },
    });

    // Create audit log
    await prisma.auditLog.create({
      data: {
        userId: user.id,
        action: "EXERCISE_COMPLETED",
        entityType: "ExerciseSession",
        entityId: session.id,
        details: {
          exerciseId,
          completedReps,
          formScore,
        },
      },
    });

    return NextResponse.json({
      session,
      message: "Exercise session saved successfully",
    });
  } catch (error) {
    console.error("Exercise session error:", error);
    return NextResponse.json(
      { error: "Failed to save exercise session" },
      { status: 500 }
    );
  }
}

export async function GET(request: NextRequest) {
  try {
    const { userId } = await auth();

    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const limit = parseInt(searchParams.get("limit") || "20");
    const exerciseId = searchParams.get("exerciseId");

    const user = await prisma.user.findUnique({
      where: { clerkId: userId },
      include: { patient: true },
    });

    if (!user?.patient) {
      return NextResponse.json(
        { error: "Patient profile not found" },
        { status: 404 }
      );
    }

    const where: any = { patientId: user.patient.id };
    if (exerciseId) {
      where.exerciseId = exerciseId;
    }

    const sessions = await prisma.exerciseSession.findMany({
      where,
      orderBy: { completedAt: "desc" },
      take: limit,
      include: {
        exercise: {
          select: {
            id: true,
            name: true,
            targetBodyRegion: true,
          },
        },
      },
    });

    // Calculate statistics
    const stats = {
      totalSessions: sessions.length,
      totalReps: sessions.reduce((acc, s) => acc + s.completedReps, 0),
      averageFormScore:
        sessions.length > 0
          ? Math.round(
              sessions.reduce((acc, s) => acc + (s.formScore || 0), 0) /
                sessions.length
            )
          : 0,
      totalDuration: sessions.reduce((acc, s) => acc + (s.duration || 0), 0),
    };

    return NextResponse.json({
      sessions,
      stats,
    });
  } catch (error) {
    console.error("Get exercise sessions error:", error);
    return NextResponse.json(
      { error: "Failed to fetch exercise sessions" },
      { status: 500 }
    );
  }
}
