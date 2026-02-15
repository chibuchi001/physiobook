import { auth } from "@clerk/nextjs/server";
import { NextRequest, NextResponse } from "next/server";
import { Resend } from "resend";
import prisma from "@/lib/prisma";
import { extractFeatures, predictNoShow } from "@/lib/ai/no-show-prediction";

const resend = new Resend(process.env.RESEND_API_KEY);

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
      therapistId,
      scheduledDate,
      scheduledTime,
      duration = 30,
      type = "IN_PERSON",
      triageAssessmentId,
      chiefComplaint,
    } = body;

    // Validate required fields
    if (!therapistId || !scheduledDate || !scheduledTime) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    // Get user and patient
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

    // Check if slot is available
    const existingAppointment = await prisma.appointment.findFirst({
      where: {
        therapistId,
        scheduledDate: new Date(scheduledDate),
        scheduledTime,
        status: {
          in: ["PENDING", "CONFIRMED"],
        },
      },
    });

    if (existingAppointment) {
      return NextResponse.json(
        { error: "This time slot is no longer available" },
        { status: 409 }
      );
    }

    // Extract features for no-show prediction
    const features = await extractFeatures(
      user.patient.id,
      new Date(scheduledDate),
      scheduledTime,
      type
    );

    // Predict no-show probability
    const noShowPrediction = predictNoShow(features);

    // Create the appointment
    const appointment = await prisma.appointment.create({
      data: {
        patientId: user.patient.id,
        therapistId,
        scheduledDate: new Date(scheduledDate),
        scheduledTime,
        duration,
        type,
        status: "PENDING",
        triageAssessmentId,
        chiefComplaint,
        noShowProbability: noShowPrediction.probability,
      },
      include: {
        therapist: {
          include: {
            user: {
              select: {
                firstName: true,
                lastName: true,
                email: true,
              },
            },
          },
        },
      },
    });

    // Create no-show prediction record
    await prisma.noShowPrediction.create({
      data: {
        patientId: user.patient.id,
        appointmentId: appointment.id,
        probability: noShowPrediction.probability,
        riskLevel: noShowPrediction.riskLevel,
        featureVector: features as any,
      },
    });

    // Mark availability slot as booked
    await prisma.availabilitySlot.updateMany({
      where: {
        therapistId,
        date: new Date(scheduledDate),
        startTime: scheduledTime,
      },
      data: {
        isBooked: true,
      },
    });

    // Create audit log
    await prisma.auditLog.create({
      data: {
        userId: user.id,
        action: "APPOINTMENT_BOOKED",
        entityType: "Appointment",
        entityId: appointment.id,
        details: {
          therapistId,
          scheduledDate,
          scheduledTime,
          type,
        },
      },
    });

    // Send confirmation email
    if (user.email) {
      try {
        await resend.emails.send({
          from: "PhysioBook <noreply@physiobook.com>",
          to: user.email,
          subject: "Appointment Confirmed - PhysioBook",
          html: `
            <h1>Your Appointment is Confirmed!</h1>
            <p>Hi ${user.firstName || "there"},</p>
            <p>Your physiotherapy appointment has been scheduled:</p>
            <ul>
              <li><strong>Therapist:</strong> ${appointment.therapist.user.firstName} ${appointment.therapist.user.lastName}</li>
              <li><strong>Date:</strong> ${new Date(scheduledDate).toLocaleDateString()}</li>
              <li><strong>Time:</strong> ${scheduledTime}</li>
              <li><strong>Type:</strong> ${type === "TELE_PHYSIO" ? "Tele-Physio (Online)" : "In-Person"}</li>
            </ul>
            <p>We'll send you a reminder before your appointment.</p>
            <p>Best regards,<br>The PhysioBook Team</p>
          `,
        });
      } catch (emailError) {
        console.error("Failed to send confirmation email:", emailError);
      }
    }

    return NextResponse.json({
      appointment: {
        id: appointment.id,
        scheduledDate: appointment.scheduledDate,
        scheduledTime: appointment.scheduledTime,
        type: appointment.type,
        status: appointment.status,
        therapist: {
          name: `${appointment.therapist.user.firstName} ${appointment.therapist.user.lastName}`,
        },
      },
      noShowPrediction: {
        probability: noShowPrediction.probability,
        riskLevel: noShowPrediction.riskLevel,
        suggestedActions: noShowPrediction.suggestedActions,
      },
    });
  } catch (error) {
    console.error("Booking error:", error);
    return NextResponse.json(
      { error: "Failed to book appointment" },
      { status: 500 }
    );
  }
}

export async function GET(request: NextRequest) {
  try {
    const { userId } = await auth();

    if (!userId) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    const { searchParams } = new URL(request.url);
    const status = searchParams.get("status");
    const upcoming = searchParams.get("upcoming") === "true";

    const user = await prisma.user.findUnique({
      where: { clerkId: userId },
      include: { patient: true, therapist: true },
    });

    if (!user) {
      return NextResponse.json(
        { error: "User not found" },
        { status: 404 }
      );
    }

    const where: any = {};

    // Filter by role
    if (user.patient) {
      where.patientId = user.patient.id;
    } else if (user.therapist) {
      where.therapistId = user.therapist.id;
    }

    // Filter by status
    if (status) {
      where.status = status;
    }

    // Filter upcoming
    if (upcoming) {
      where.scheduledDate = {
        gte: new Date(),
      };
      where.status = {
        in: ["PENDING", "CONFIRMED"],
      };
    }

    const appointments = await prisma.appointment.findMany({
      where,
      include: {
        patient: {
          include: {
            user: {
              select: {
                firstName: true,
                lastName: true,
                imageUrl: true,
              },
            },
          },
        },
        therapist: {
          include: {
            user: {
              select: {
                firstName: true,
                lastName: true,
                imageUrl: true,
              },
            },
          },
        },
        triageAssessment: true,
      },
      orderBy: [
        { scheduledDate: "asc" },
        { scheduledTime: "asc" },
      ],
    });

    return NextResponse.json({ appointments });
  } catch (error) {
    console.error("Get appointments error:", error);
    return NextResponse.json(
      { error: "Failed to fetch appointments" },
      { status: 500 }
    );
  }
}
