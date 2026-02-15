import { auth } from "@clerk/nextjs/server";
import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { generateProgressAnalysis } from "@/lib/ai/triage";

export async function POST(request: NextRequest) {
  try {
    const { userId } = await auth();

    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const {
      painLevel,
      mobilityScore,
      functionalScore,
      dailyActivityLevel,
      sleepQuality,
      overallWellbeing,
      notes,
      appointmentId,
    } = body;

    // Validate required fields
    if (painLevel === undefined || mobilityScore === undefined || functionalScore === undefined) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

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

    // Create progress record
    const progressRecord = await prisma.progressRecord.create({
      data: {
        patientId: user.patient.id,
        painLevel,
        mobilityScore,
        functionalScore,
        dailyActivityLevel,
        sleepQuality,
        overallWellbeing,
        notes,
        appointmentId: appointmentId || null,
      },
    });

    // Get historical progress for AI analysis
    const historicalProgress = await prisma.progressRecord.findMany({
      where: { patientId: user.patient.id },
      orderBy: { recordedAt: "asc" },
      take: 10,
    });

    // Generate AI analysis if we have enough data
    let aiAnalysis = null;
    if (historicalProgress.length >= 3) {
      try {
        aiAnalysis = await generateProgressAnalysis({
          painLevels: historicalProgress.map((p) => p.painLevel),
          mobilityScores: historicalProgress.map((p) => p.mobilityScore),
          dates: historicalProgress.map((p) =>
            p.recordedAt.toISOString().split("T")[0]
          ),
        });

        // Update progress record with AI analysis
        await prisma.progressRecord.update({
          where: { id: progressRecord.id },
          data: {
            aiProgressAnalysis: aiAnalysis.analysis,
            predictedRecoveryDate: aiAnalysis.predictedRecoveryWeeks
              ? new Date(
                  Date.now() +
                    aiAnalysis.predictedRecoveryWeeks * 7 * 24 * 60 * 60 * 1000
                )
              : null,
          },
        });
      } catch (error) {
        console.error("AI analysis error:", error);
      }
    }

    // Create audit log
    await prisma.auditLog.create({
      data: {
        userId: user.id,
        action: "PROGRESS_LOGGED",
        entityType: "ProgressRecord",
        entityId: progressRecord.id,
        details: {
          painLevel,
          mobilityScore,
          functionalScore,
        },
      },
    });

    return NextResponse.json({
      progressRecord,
      aiAnalysis,
    });
  } catch (error) {
    console.error("Progress logging error:", error);
    return NextResponse.json(
      { error: "Failed to log progress" },
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

    const progressRecords = await prisma.progressRecord.findMany({
      where: { patientId: user.patient.id },
      orderBy: { recordedAt: "desc" },
      take: limit,
      include: {
        appointment: {
          include: {
            therapist: {
              include: {
                user: {
                  select: { firstName: true, lastName: true },
                },
              },
            },
          },
        },
      },
    });

    // Calculate trends
    const recentRecords = progressRecords.slice(0, 5);
    const olderRecords = progressRecords.slice(5, 10);

    const calculateAvg = (records: typeof recentRecords, field: keyof typeof recentRecords[0]) => {
      if (records.length === 0) return 0;
      const sum = records.reduce((acc, r) => acc + (r[field] as number || 0), 0);
      return sum / records.length;
    };

    const trends = {
      painLevel: {
        current: calculateAvg(recentRecords, "painLevel"),
        previous: calculateAvg(olderRecords, "painLevel"),
        improving: calculateAvg(recentRecords, "painLevel") < calculateAvg(olderRecords, "painLevel"),
      },
      mobilityScore: {
        current: calculateAvg(recentRecords, "mobilityScore"),
        previous: calculateAvg(olderRecords, "mobilityScore"),
        improving: calculateAvg(recentRecords, "mobilityScore") > calculateAvg(olderRecords, "mobilityScore"),
      },
      functionalScore: {
        current: calculateAvg(recentRecords, "functionalScore"),
        previous: calculateAvg(olderRecords, "functionalScore"),
        improving: calculateAvg(recentRecords, "functionalScore") > calculateAvg(olderRecords, "functionalScore"),
      },
    };

    return NextResponse.json({
      progressRecords,
      trends,
    });
  } catch (error) {
    console.error("Get progress error:", error);
    return NextResponse.json(
      { error: "Failed to fetch progress" },
      { status: 500 }
    );
  }
}
