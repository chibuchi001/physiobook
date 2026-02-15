import { auth } from "@clerk/nextjs/server";
import { NextRequest, NextResponse } from "next/server";
import { findBestTherapists, getAITherapistRecommendation } from "@/lib/ai/matching";
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
    const {
      triageCategory,
      urgencyLevel,
      recommendedSpecialty,
      bodyRegion,
      preferredDate,
      preferredTimeSlot,
      preferTelePhysio,
    } = body;

    // Get user's patient ID
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

    // Find best matching therapists
    const matches = await findBestTherapists({
      patientId: user.patient.id,
      triageCategory,
      urgencyLevel,
      recommendedSpecialty,
      bodyRegion,
      preferredDate: preferredDate ? new Date(preferredDate) : undefined,
      preferredTimeSlot,
      preferTelePhysio,
    });

    if (matches.length === 0) {
      return NextResponse.json({
        matches: [],
        recommendation: {
          topRecommendation: "No therapists available",
          reasoning: "We couldn't find any available therapists matching your criteria. Please try different preferences or contact support.",
        },
      });
    }

    // Get AI recommendation
    const recommendation = await getAITherapistRecommendation(
      {
        patientId: user.patient.id,
        triageCategory,
        urgencyLevel,
        recommendedSpecialty,
        bodyRegion,
      },
      matches
    );

    return NextResponse.json({
      matches,
      recommendation,
    });
  } catch (error) {
    console.error("Therapist matching error:", error);
    return NextResponse.json(
      { error: "Failed to find therapists" },
      { status: 500 }
    );
  }
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const specialty = searchParams.get("specialty");
    const page = parseInt(searchParams.get("page") || "1");
    const limit = parseInt(searchParams.get("limit") || "10");

    const where: any = {
      isActive: true,
      isAcceptingPatients: true,
    };

    if (specialty) {
      where.specialties = {
        has: specialty,
      };
    }

    const [therapists, total] = await Promise.all([
      prisma.therapist.findMany({
        where,
        include: {
          user: {
            select: {
              firstName: true,
              lastName: true,
              imageUrl: true,
            },
          },
        },
        skip: (page - 1) * limit,
        take: limit,
        orderBy: {
          averageRating: "desc",
        },
      }),
      prisma.therapist.count({ where }),
    ]);

    return NextResponse.json({
      therapists: therapists.map((t) => ({
        id: t.id,
        name: `${t.user.firstName} ${t.user.lastName}`,
        imageUrl: t.user.imageUrl,
        specialties: t.specialties,
        yearsOfExperience: t.yearsOfExperience,
        averageRating: t.averageRating,
        totalReviews: t.totalReviews,
        bio: t.bio,
      })),
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    console.error("Get therapists error:", error);
    return NextResponse.json(
      { error: "Failed to fetch therapists" },
      { status: 500 }
    );
  }
}
