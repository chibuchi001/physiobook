import OpenAI from "openai";
import prisma from "@/lib/prisma";

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export interface MatchingCriteria {
  patientId: string;
  triageCategory: string;
  urgencyLevel: string;
  recommendedSpecialty: string;
  bodyRegion: string;
  preferredDate?: Date;
  preferredTimeSlot?: "morning" | "afternoon" | "evening";
  preferTelePhysio?: boolean;
}

export interface TherapistMatch {
  therapistId: string;
  therapistName: string;
  specialties: string[];
  matchScore: number;
  matchReasons: string[];
  availableSlots: {
    date: Date;
    time: string;
  }[];
  averageRating: number;
  yearsOfExperience: number;
}

export async function findBestTherapists(
  criteria: MatchingCriteria,
  limit: number = 5
): Promise<TherapistMatch[]> {
  // Get all active therapists with their data
  const therapists = await prisma.therapist.findMany({
    where: {
      isActive: true,
      isAcceptingPatients: true,
    },
    include: {
      user: {
        select: {
          firstName: true,
          lastName: true,
          imageUrl: true,
        },
      },
      availabilitySlots: {
        where: {
          isBooked: false,
          isBlocked: false,
          date: {
            gte: new Date(),
          },
        },
        take: 10,
        orderBy: {
          date: "asc",
        },
      },
      reviews: {
        select: {
          rating: true,
          effectivenessRating: true,
        },
      },
    },
  });

  if (therapists.length === 0) {
    return [];
  }

  // Calculate match scores for each therapist
  const matches: TherapistMatch[] = therapists.map((therapist) => {
    const matchReasons: string[] = [];
    let score = 0;

    // Specialty match (highest weight)
    if (therapist.specialties.includes(criteria.recommendedSpecialty as any)) {
      score += 40;
      matchReasons.push(
        `Specializes in ${criteria.recommendedSpecialty.replace(/_/g, " ")}`
      );
    }

    // Secondary specialty relevance
    const relatedSpecialties = getRelatedSpecialties(
      criteria.recommendedSpecialty
    );
    const hasRelatedSpecialty = therapist.specialties.some((s) =>
      relatedSpecialties.includes(s)
    );
    if (hasRelatedSpecialty && !matchReasons.length) {
      score += 20;
      matchReasons.push("Has related specialty expertise");
    }

    // Experience weight (more experience = better for complex cases)
    if (therapist.yearsOfExperience >= 10) {
      score += 15;
      matchReasons.push(`${therapist.yearsOfExperience} years of experience`);
    } else if (therapist.yearsOfExperience >= 5) {
      score += 10;
    } else {
      score += 5;
    }

    // Rating weight
    if (therapist.averageRating >= 4.5) {
      score += 15;
      matchReasons.push(`Highly rated (${therapist.averageRating.toFixed(1)}/5)`);
    } else if (therapist.averageRating >= 4.0) {
      score += 10;
    } else if (therapist.averageRating >= 3.5) {
      score += 5;
    }

    // Success rate
    if (therapist.successRate >= 0.9) {
      score += 15;
      matchReasons.push(
        `${Math.round(therapist.successRate * 100)}% success rate`
      );
    } else if (therapist.successRate >= 0.8) {
      score += 10;
    }

    // Low no-show rate (reliable patients/good scheduling)
    if (therapist.noShowRate <= 0.05) {
      score += 5;
    }

    // Availability (more available slots = easier to book)
    const availableSlotCount = therapist.availabilitySlots.length;
    if (availableSlotCount >= 5) {
      score += 10;
      matchReasons.push("Good availability");
    } else if (availableSlotCount >= 2) {
      score += 5;
    }

    return {
      therapistId: therapist.id,
      therapistName: `${therapist.user.firstName} ${therapist.user.lastName}`,
      specialties: therapist.specialties,
      matchScore: Math.min(score, 100),
      matchReasons,
      availableSlots: therapist.availabilitySlots.map((slot) => ({
        date: slot.date,
        time: slot.startTime,
      })),
      averageRating: therapist.averageRating,
      yearsOfExperience: therapist.yearsOfExperience,
    };
  });

  // Sort by match score and return top matches
  return matches
    .sort((a, b) => b.matchScore - a.matchScore)
    .slice(0, limit);
}

function getRelatedSpecialties(specialty: string): string[] {
  const relationships: Record<string, string[]> = {
    SPORTS_REHABILITATION: ["ORTHOPEDIC", "MANUAL_THERAPY"],
    ORTHOPEDIC: ["SPORTS_REHABILITATION", "MANUAL_THERAPY", "POST_OPERATIVE"],
    NEUROLOGICAL: ["VESTIBULAR", "GERIATRIC"],
    PEDIATRIC: [],
    GERIATRIC: ["NEUROLOGICAL", "CHRONIC_PAIN"],
    POST_OPERATIVE: ["ORTHOPEDIC", "MANUAL_THERAPY"],
    CHRONIC_PAIN: ["MANUAL_THERAPY", "GERIATRIC"],
    MANUAL_THERAPY: ["ORTHOPEDIC", "CHRONIC_PAIN", "SPORTS_REHABILITATION"],
    AQUATIC_THERAPY: ["ORTHOPEDIC", "GERIATRIC"],
    VESTIBULAR: ["NEUROLOGICAL"],
    WOMENS_HEALTH: [],
    CARDIOPULMONARY: [],
  };

  return relationships[specialty] || [];
}

export async function getAITherapistRecommendation(
  criteria: MatchingCriteria,
  therapistMatches: TherapistMatch[]
): Promise<{
  topRecommendation: string;
  reasoning: string;
  alternativeNote?: string;
}> {
  const systemPrompt = `You are an AI assistant helping patients find the best physiotherapist for their needs.
Based on the patient's condition and available therapists, provide a personalized recommendation.
Keep your response concise and helpful.`;

  const userMessage = `
Patient Condition:
- Category: ${criteria.triageCategory}
- Urgency: ${criteria.urgencyLevel}
- Recommended Specialty: ${criteria.recommendedSpecialty}
- Affected Area: ${criteria.bodyRegion}

Available Therapists (ranked by match score):
${therapistMatches
  .slice(0, 3)
  .map(
    (t, i) => `
${i + 1}. ${t.therapistName}
   - Match Score: ${t.matchScore}%
   - Specialties: ${t.specialties.join(", ")}
   - Experience: ${t.yearsOfExperience} years
   - Rating: ${t.averageRating}/5
   - Match Reasons: ${t.matchReasons.join("; ")}
`
  )
  .join("")}

Provide a brief, personalized recommendation explaining why the top match is suitable, and mention when an alternative might be better.
Return as JSON: { "topRecommendation": "...", "reasoning": "...", "alternativeNote": "..." }
`;

  try {
    const completion = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: userMessage },
      ],
      response_format: { type: "json_object" },
      temperature: 0.5,
      max_tokens: 400,
    });

    const responseText = completion.choices[0]?.message?.content;
    if (!responseText) {
      throw new Error("No response from AI");
    }

    return JSON.parse(responseText);
  } catch (error) {
    console.error("Error getting AI recommendation:", error);
    return {
      topRecommendation: therapistMatches[0]?.therapistName || "No match found",
      reasoning:
        "Based on specialty match and availability, this therapist is well-suited for your condition.",
    };
  }
}
