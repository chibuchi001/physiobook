import OpenAI from "openai";

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export interface TriageInput {
  symptoms: string;
  bodyRegion: string;
  painLevel: number;
  duration: string;
  painType?: string;
  worseningFactors?: string;
  improvingFactors?: string;
  previousTreatment?: string;
  age?: number;
  medicalHistory?: string;
}

export interface TriageOutput {
  triageCategory: string;
  urgencyLevel: string;
  recommendedSpecialty: string;
  confidenceScore: number;
  reasoning: string;
  redFlags: string[];
  requiresImmediate: boolean;
  suggestedQuestions?: string[];
}

const TRIAGE_SYSTEM_PROMPT = `You are an AI physiotherapy triage assistant. Your role is to analyze patient symptoms and provide a preliminary assessment to help match them with the right specialist.

IMPORTANT: You are NOT providing medical diagnoses. You are helping categorize the type of physiotherapy care needed.

Based on the patient information provided, you must return a JSON object with the following fields:

1. triageCategory: One of:
   - ACUTE_INJURY: Recent injury (< 4 weeks), sudden onset
   - CHRONIC_CONDITION: Ongoing issues (> 3 months)
   - POST_OPERATIVE: Recovery after surgery
   - SPORTS_INJURY: Activity/sports-related
   - NEUROLOGICAL: Nerve-related symptoms (numbness, tingling, weakness)
   - PEDIATRIC: For patients under 18
   - GERIATRIC: For patients over 65 with age-related concerns
   - PREVENTIVE: Wellness, posture correction, injury prevention

2. urgencyLevel: One of:
   - EMERGENCY: Severe symptoms requiring immediate medical attention (not physio)
   - URGENT: Should be seen within 24-48 hours
   - SEMI_URGENT: Should be seen within a week
   - ROUTINE: Can wait 1-2 weeks
   - PREVENTIVE: Wellness/maintenance care

3. recommendedSpecialty: One of:
   - SPORTS_REHABILITATION
   - ORTHOPEDIC
   - NEUROLOGICAL
   - PEDIATRIC
   - GERIATRIC
   - POST_OPERATIVE
   - CHRONIC_PAIN
   - MANUAL_THERAPY
   - AQUATIC_THERAPY
   - VESTIBULAR
   - WOMENS_HEALTH
   - CARDIOPULMONARY

4. confidenceScore: A number between 0 and 1 indicating your confidence in this assessment

5. reasoning: A brief explanation of your assessment (2-3 sentences)

6. redFlags: An array of any concerning symptoms that might need immediate medical attention (e.g., ["sudden severe headache", "loss of bladder control"])

7. requiresImmediate: Boolean - true if patient should seek emergency medical care instead of physio

8. suggestedQuestions: Array of follow-up questions that could help refine the assessment

RED FLAGS that indicate EMERGENCY:
- Sudden severe headache with neck stiffness
- Loss of bladder/bowel control
- Progressive weakness in limbs
- Chest pain with shortness of breath
- Signs of stroke (facial drooping, arm weakness, speech difficulty)
- Suspected fracture with visible deformity
- Severe trauma

Always err on the side of caution with red flags.`;

export async function analyzeSymptoms(
  input: TriageInput
): Promise<TriageOutput> {
  const userMessage = `
Patient Information:
- Age: ${input.age || "Not provided"}
- Symptoms: ${input.symptoms}
- Affected Body Region: ${input.bodyRegion}
- Pain Level (1-10): ${input.painLevel}
- Duration: ${input.duration}
- Pain Type: ${input.painType || "Not specified"}
- What makes it worse: ${input.worseningFactors || "Not specified"}
- What makes it better: ${input.improvingFactors || "Not specified"}
- Previous treatment: ${input.previousTreatment || "None"}
- Medical History: ${input.medicalHistory || "Not provided"}

Please analyze and provide your triage assessment as a JSON object.
`;

  try {
    const completion = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        { role: "system", content: TRIAGE_SYSTEM_PROMPT },
        { role: "user", content: userMessage },
      ],
      response_format: { type: "json_object" },
      temperature: 0.3,
      max_tokens: 1000,
    });

    const responseText = completion.choices[0]?.message?.content;
    if (!responseText) {
      throw new Error("No response from AI");
    }

    const result = JSON.parse(responseText) as TriageOutput;

    // Validate required fields
    const requiredFields = [
      "triageCategory",
      "urgencyLevel",
      "recommendedSpecialty",
      "confidenceScore",
      "reasoning",
      "redFlags",
      "requiresImmediate",
    ];

    for (const field of requiredFields) {
      if (!(field in result)) {
        throw new Error(`Missing required field: ${field}`);
      }
    }

    return result;
  } catch (error) {
    console.error("Error in AI triage:", error);

    // Return a safe default that recommends professional assessment
    return {
      triageCategory: "ACUTE_INJURY",
      urgencyLevel: "SEMI_URGENT",
      recommendedSpecialty: "ORTHOPEDIC",
      confidenceScore: 0.3,
      reasoning:
        "Unable to complete automated assessment. Recommending general evaluation with an orthopedic physiotherapist.",
      redFlags: [],
      requiresImmediate: false,
      suggestedQuestions: [
        "Please describe your symptoms in more detail",
        "When did the symptoms first start?",
        "Have you experienced similar issues before?",
      ],
    };
  }
}

export async function generateProgressAnalysis(
  progressData: {
    painLevels: number[];
    mobilityScores: number[];
    dates: string[];
    sessionNotes?: string[];
  },
  treatmentPlan?: string
): Promise<{
  analysis: string;
  trend: "improving" | "stable" | "declining";
  predictedRecoveryWeeks?: number;
  recommendations: string[];
}> {
  const systemPrompt = `You are an AI assistant helping physiotherapists analyze patient progress. 
Based on the data provided, generate:
1. A brief analysis of the patient's progress
2. The overall trend (improving, stable, or declining)
3. An estimated number of weeks to full recovery (if applicable)
4. Specific recommendations for the treatment plan

Return your response as a JSON object.`;

  const userMessage = `
Patient Progress Data:
- Pain Levels over time: ${JSON.stringify(progressData.painLevels)}
- Mobility Scores over time: ${JSON.stringify(progressData.mobilityScores)}
- Dates: ${JSON.stringify(progressData.dates)}
- Session Notes: ${progressData.sessionNotes?.join("; ") || "Not provided"}
- Current Treatment Plan: ${treatmentPlan || "Not provided"}

Analyze this progress and provide your assessment.
`;

  try {
    const completion = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: userMessage },
      ],
      response_format: { type: "json_object" },
      temperature: 0.4,
      max_tokens: 800,
    });

    const responseText = completion.choices[0]?.message?.content;
    if (!responseText) {
      throw new Error("No response from AI");
    }

    return JSON.parse(responseText);
  } catch (error) {
    console.error("Error in progress analysis:", error);
    return {
      analysis: "Unable to generate automated analysis.",
      trend: "stable",
      recommendations: ["Continue current treatment plan", "Schedule follow-up"],
    };
  }
}
