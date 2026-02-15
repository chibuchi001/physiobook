import { auth } from "@clerk/nextjs/server";
import { NextRequest, NextResponse } from "next/server";
import { analyzeSymptoms, type TriageInput } from "@/lib/ai/triage";
import prisma from "@/lib/prisma";

export async function POST(request: NextRequest) {
  try {
    const { userId } = await auth();

    if (!userId) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    const body = await request.json();

    // Validate required fields
    const { symptoms, bodyRegion, painLevel, duration } = body;
    if (!symptoms || !bodyRegion || painLevel === undefined || !duration) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    // Get user's patient record for additional context
    const user = await prisma.user.findUnique({
      where: { clerkId: userId },
      include: {
        patient: true,
      },
    });

    // Prepare triage input
    const triageInput: TriageInput = {
      symptoms,
      bodyRegion,
      painLevel: parseInt(painLevel),
      duration,
      painType: body.painType,
      worseningFactors: body.worseningFactors,
      improvingFactors: body.improvingFactors,
      previousTreatment: body.previousTreatment,
      medicalHistory: user?.patient?.medicalHistory || undefined,
    };

    // Call AI triage
    const result = await analyzeSymptoms(triageInput);

    // If user exists and has a patient record, save the triage assessment
    if (user?.patient) {
      await prisma.triageAssessment.create({
        data: {
          patientId: user.patient.id,
          symptoms,
          affectedBodyRegion: bodyRegion,
          painLevel: parseInt(painLevel),
          injuryDuration: duration,
          painType: body.painType,
          worseningFactors: body.worseningFactors,
          improvingFactors: body.improvingFactors,
          previousTreatment: body.previousTreatment,
          triageCategory: result.triageCategory as any,
          urgencyLevel: result.urgencyLevel as any,
          recommendedSpecialty: result.recommendedSpecialty as any,
          aiConfidenceScore: result.confidenceScore,
          aiReasoning: result.reasoning,
          redFlags: result.redFlags,
          requiresImmediate: result.requiresImmediate,
        },
      });

      // Create audit log
      await prisma.auditLog.create({
        data: {
          userId: user.id,
          action: "TRIAGE_ASSESSMENT",
          entityType: "TriageAssessment",
          details: {
            bodyRegion,
            painLevel,
            urgencyLevel: result.urgencyLevel,
          },
        },
      });
    }

    return NextResponse.json(result);
  } catch (error) {
    console.error("Triage analysis error:", error);
    return NextResponse.json(
      { error: "Failed to analyze symptoms" },
      { status: 500 }
    );
  }
}
