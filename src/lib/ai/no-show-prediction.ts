import prisma from "@/lib/prisma";

export interface NoShowFeatures {
  // Patient history
  previousNoShows: number;
  previousCancellations: number;
  totalAppointments: number;
  daysSinceLastAppointment: number;

  // Appointment characteristics
  isFirstAppointment: boolean;
  dayOfWeek: number; // 0-6
  hourOfDay: number;
  isMorning: boolean;
  isEvening: boolean;
  daysUntilAppointment: number;

  // Patient engagement
  hasConfirmed: boolean;
  remindersSent: number;

  // External factors
  isTelePhysio: boolean;
}

export interface NoShowPrediction {
  probability: number;
  riskLevel: "LOW" | "MEDIUM" | "HIGH" | "VERY_HIGH";
  featureImportance: {
    feature: string;
    contribution: number;
  }[];
  suggestedActions: string[];
}

// Feature weights learned from historical data (in production, this would be ML-trained)
const FEATURE_WEIGHTS = {
  noShowHistory: 0.25, // Strong predictor
  appointmentTiming: 0.15,
  confirmationStatus: 0.20,
  firstAppointment: 0.10,
  appointmentType: 0.10,
  dayOfWeek: 0.10,
  leadTime: 0.10,
};

export async function extractFeatures(
  patientId: string,
  appointmentDate: Date,
  appointmentTime: string,
  appointmentType: "IN_PERSON" | "TELE_PHYSIO" | "HOME_VISIT"
): Promise<NoShowFeatures> {
  // Get patient's appointment history
  const appointmentHistory = await prisma.appointment.findMany({
    where: {
      patientId,
      scheduledDate: {
        lt: appointmentDate,
      },
    },
    orderBy: {
      scheduledDate: "desc",
    },
  });

  const previousNoShows = appointmentHistory.filter(
    (a) => a.status === "NO_SHOW"
  ).length;
  const previousCancellations = appointmentHistory.filter(
    (a) => a.status === "CANCELLED"
  ).length;
  const totalAppointments = appointmentHistory.length;

  // Days since last appointment
  const lastAppointment = appointmentHistory[0];
  const daysSinceLastAppointment = lastAppointment
    ? Math.floor(
        (appointmentDate.getTime() - new Date(lastAppointment.scheduledDate).getTime()) /
          (1000 * 60 * 60 * 24)
      )
    : 0;

  // Parse appointment time
  const [hours] = appointmentTime.split(":").map(Number);
  const dayOfWeek = appointmentDate.getDay();
  const daysUntilAppointment = Math.floor(
    (appointmentDate.getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24)
  );

  return {
    previousNoShows,
    previousCancellations,
    totalAppointments,
    daysSinceLastAppointment,
    isFirstAppointment: totalAppointments === 0,
    dayOfWeek,
    hourOfDay: hours,
    isMorning: hours < 12,
    isEvening: hours >= 17,
    daysUntilAppointment: Math.max(0, daysUntilAppointment),
    hasConfirmed: false, // Will be updated
    remindersSent: 0, // Will be updated
    isTelePhysio: appointmentType === "TELE_PHYSIO",
  };
}

export function predictNoShow(features: NoShowFeatures): NoShowPrediction {
  let probability = 0;
  const featureContributions: { feature: string; contribution: number }[] = [];

  // No-show history (strongest predictor)
  if (features.totalAppointments > 0) {
    const noShowRate = features.previousNoShows / features.totalAppointments;
    const historyContribution = noShowRate * FEATURE_WEIGHTS.noShowHistory * 100;
    probability += historyContribution;
    if (historyContribution > 0) {
      featureContributions.push({
        feature: "Previous no-show history",
        contribution: historyContribution,
      });
    }
  }

  // First appointment risk
  if (features.isFirstAppointment) {
    const firstApptContribution = 0.15 * FEATURE_WEIGHTS.firstAppointment * 100;
    probability += firstApptContribution;
    featureContributions.push({
      feature: "First-time patient",
      contribution: firstApptContribution,
    });
  }

  // Day of week risk (Mondays and Fridays higher risk)
  if (features.dayOfWeek === 1 || features.dayOfWeek === 5) {
    const dayContribution = 0.1 * FEATURE_WEIGHTS.dayOfWeek * 100;
    probability += dayContribution;
    featureContributions.push({
      feature: features.dayOfWeek === 1 ? "Monday appointment" : "Friday appointment",
      contribution: dayContribution,
    });
  }

  // Time of day risk (early morning and late evening higher)
  if (features.hourOfDay < 9 || features.hourOfDay >= 18) {
    const timeContribution = 0.1 * FEATURE_WEIGHTS.appointmentTiming * 100;
    probability += timeContribution;
    featureContributions.push({
      feature: features.hourOfDay < 9 ? "Early morning slot" : "Late evening slot",
      contribution: timeContribution,
    });
  }

  // Lead time risk (very far out = higher risk)
  if (features.daysUntilAppointment > 14) {
    const leadTimeContribution = 0.15 * FEATURE_WEIGHTS.leadTime * 100;
    probability += leadTimeContribution;
    featureContributions.push({
      feature: "Appointment booked far in advance",
      contribution: leadTimeContribution,
    });
  }

  // Confirmation reduces risk significantly
  if (features.hasConfirmed) {
    probability *= 0.5; // 50% reduction
    featureContributions.push({
      feature: "Patient confirmed attendance",
      contribution: -probability * 0.5,
    });
  }

  // Tele-physio has lower no-show rate
  if (features.isTelePhysio) {
    probability *= 0.7; // 30% reduction
    featureContributions.push({
      feature: "Tele-physio appointment (lower barrier)",
      contribution: -probability * 0.3,
    });
  }

  // Reminders reduce risk
  if (features.remindersSent > 0) {
    const reminderReduction = Math.min(features.remindersSent * 0.1, 0.3);
    probability *= 1 - reminderReduction;
  }

  // Cap probability
  probability = Math.min(Math.max(probability, 0), 100);

  // Determine risk level
  let riskLevel: "LOW" | "MEDIUM" | "HIGH" | "VERY_HIGH";
  if (probability < 15) {
    riskLevel = "LOW";
  } else if (probability < 30) {
    riskLevel = "MEDIUM";
  } else if (probability < 50) {
    riskLevel = "HIGH";
  } else {
    riskLevel = "VERY_HIGH";
  }

  // Generate suggested actions based on risk
  const suggestedActions = generateSuggestedActions(riskLevel, features);

  return {
    probability: Math.round(probability * 100) / 100,
    riskLevel,
    featureImportance: featureContributions.sort(
      (a, b) => Math.abs(b.contribution) - Math.abs(a.contribution)
    ),
    suggestedActions,
  };
}

function generateSuggestedActions(
  riskLevel: "LOW" | "MEDIUM" | "HIGH" | "VERY_HIGH",
  features: NoShowFeatures
): string[] {
  const actions: string[] = [];

  if (riskLevel === "LOW") {
    actions.push("Standard reminder 24 hours before");
    return actions;
  }

  if (riskLevel === "MEDIUM") {
    actions.push("Send reminder 48 hours before");
    actions.push("Send reminder 24 hours before");
    if (!features.hasConfirmed) {
      actions.push("Request confirmation via SMS");
    }
    return actions;
  }

  if (riskLevel === "HIGH") {
    actions.push("Send reminder 72 hours before");
    actions.push("Send reminder 24 hours before");
    actions.push("Send reminder 2 hours before");
    if (!features.hasConfirmed) {
      actions.push("Call patient to confirm attendance");
    }
    actions.push("Consider overbooking strategy");
    return actions;
  }

  // VERY_HIGH risk
  actions.push("Call patient to confirm attendance");
  actions.push("Send multiple reminders (72h, 24h, 2h)");
  actions.push("Apply overbooking for this slot");
  actions.push("Require deposit or prepayment");
  if (features.isFirstAppointment) {
    actions.push("Send detailed appointment information");
    actions.push("Offer alternative scheduling options");
  }

  return actions;
}

export async function updatePredictionOutcome(
  appointmentId: string,
  actualOutcome: "ATTENDED" | "NO_SHOW" | "CANCELLED" | "RESCHEDULED"
): Promise<void> {
  await prisma.noShowPrediction.update({
    where: { appointmentId },
    data: {
      actualOutcome: actualOutcome as any,
      updatedAt: new Date(),
    },
  });
}

export async function getNoShowStatistics(therapistId?: string): Promise<{
  totalPredictions: number;
  accuracy: number;
  truePositiveRate: number;
  falsePositiveRate: number;
  averageNoShowRate: number;
}> {
  const predictions = await prisma.noShowPrediction.findMany({
    where: {
      actualOutcome: { not: null },
      ...(therapistId && {
        appointment: {
          therapistId,
        },
      }),
    },
    include: {
      appointment: true,
    },
  });

  if (predictions.length === 0) {
    return {
      totalPredictions: 0,
      accuracy: 0,
      truePositiveRate: 0,
      falsePositiveRate: 0,
      averageNoShowRate: 0,
    };
  }

  let truePositives = 0;
  let trueNegatives = 0;
  let falsePositives = 0;
  let falseNegatives = 0;
  let totalNoShows = 0;

  for (const prediction of predictions) {
    const predictedNoShow = prediction.riskLevel === "HIGH" || prediction.riskLevel === "VERY_HIGH";
    const actualNoShow = prediction.actualOutcome === "NO_SHOW";

    if (actualNoShow) totalNoShows++;

    if (predictedNoShow && actualNoShow) truePositives++;
    else if (!predictedNoShow && !actualNoShow) trueNegatives++;
    else if (predictedNoShow && !actualNoShow) falsePositives++;
    else falseNegatives++;
  }

  const accuracy = (truePositives + trueNegatives) / predictions.length;
  const truePositiveRate = truePositives / (truePositives + falseNegatives) || 0;
  const falsePositiveRate = falsePositives / (falsePositives + trueNegatives) || 0;
  const averageNoShowRate = totalNoShows / predictions.length;

  return {
    totalPredictions: predictions.length,
    accuracy: Math.round(accuracy * 100) / 100,
    truePositiveRate: Math.round(truePositiveRate * 100) / 100,
    falsePositiveRate: Math.round(falsePositiveRate * 100) / 100,
    averageNoShowRate: Math.round(averageNoShowRate * 100) / 100,
  };
}
