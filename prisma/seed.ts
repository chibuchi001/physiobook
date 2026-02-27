import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  console.log("🌱 Seeding database...");

  // Create sample exercises
  const exercises = [
    {
      name: "Bodyweight Squat",
      description: "A fundamental lower body exercise that strengthens quadriceps, hamstrings, and glutes while improving overall mobility.",
      instructions: "1. Stand with feet shoulder-width apart\n2. Keep your chest up and core engaged\n3. Lower your body by bending your knees\n4. Go down until thighs are parallel to the floor\n5. Push through your heels to return to standing",
      targetBodyRegion: "KNEE",
      difficulty: "BEGINNER",
      category: "STRENGTHENING",
      repCount: 10,
      equipment: [],
      contraindications: ["Acute knee injury", "Severe arthritis"],
    },
    {
      name: "Shoulder Lateral Raise",
      description: "Targets the deltoid muscles to improve shoulder strength, stability, and range of motion.",
      instructions: "1. Stand with arms at your sides\n2. Keep a slight bend in your elbows\n3. Raise arms out to the sides until shoulder height\n4. Hold briefly at the top\n5. Lower slowly with control",
      targetBodyRegion: "SHOULDER",
      difficulty: "BEGINNER",
      category: "STRENGTHENING",
      repCount: 12,
      equipment: ["light dumbbells (optional)"],
      contraindications: ["Rotator cuff injury", "Shoulder impingement"],
    },
    {
      name: "Bicep Curl",
      description: "Isolates and strengthens the bicep muscles for improved arm function and grip strength.",
      instructions: "1. Stand with arms at sides, palms forward\n2. Keep elbows close to your body\n3. Curl weights toward shoulders\n4. Squeeze biceps at the top\n5. Lower slowly with control",
      targetBodyRegion: "ARM_ELBOW",
      difficulty: "BEGINNER",
      category: "STRENGTHENING",
      repCount: 12,
      equipment: ["dumbbells", "resistance band"],
      contraindications: ["Elbow tendinitis", "Recent arm surgery"],
    },
    {
      name: "Forward Lunge",
      description: "A unilateral exercise that improves balance, coordination, and single-leg strength.",
      instructions: "1. Stand tall with feet hip-width apart\n2. Step forward with one leg\n3. Lower until both knees are at 90 degrees\n4. Keep front knee over ankle\n5. Push back to starting position",
      targetBodyRegion: "HIP",
      difficulty: "INTERMEDIATE",
      category: "STRENGTHENING",
      repCount: 10,
      equipment: [],
      contraindications: ["Knee pain", "Balance disorders"],
    },
    {
      name: "Standing Knee Raise",
      description: "Improves hip flexor strength and core stability while enhancing balance.",
      instructions: "1. Stand on one leg near a wall for support\n2. Lift opposite knee toward chest\n3. Hold for 2-3 seconds\n4. Lower with control\n5. Repeat on other side",
      targetBodyRegion: "HIP",
      difficulty: "BEGINNER",
      category: "MOBILITY",
      repCount: 15,
      equipment: [],
      contraindications: ["Hip replacement", "Severe balance issues"],
    },
    {
      name: "Cat-Cow Stretch",
      description: "A gentle spinal mobility exercise that relieves back tension and improves flexibility.",
      instructions: "1. Start on hands and knees\n2. Inhale, arch back, look up (cow)\n3. Exhale, round spine, tuck chin (cat)\n4. Move slowly and smoothly\n5. Repeat 10-15 times",
      targetBodyRegion: "LOWER_BACK",
      difficulty: "BEGINNER",
      category: "STRETCHING",
      repCount: 10,
      holdDuration: 3,
      equipment: ["yoga mat"],
      contraindications: [],
    },
    {
      name: "Neck Lateral Stretch",
      description: "Relieves neck tension and improves cervical spine mobility.",
      instructions: "1. Sit or stand with good posture\n2. Slowly tilt head to one side\n3. Bring ear toward shoulder\n4. Hold for 15-30 seconds\n5. Repeat on other side",
      targetBodyRegion: "HEAD_NECK",
      difficulty: "BEGINNER",
      category: "STRETCHING",
      repCount: 5,
      holdDuration: 20,
      equipment: [],
      contraindications: ["Cervical disc herniation", "Neck injury"],
    },
    {
      name: "Single Leg Balance",
      description: "Improves proprioception, ankle stability, and overall balance control.",
      instructions: "1. Stand near a wall for safety\n2. Lift one foot off the ground\n3. Hold position for 30 seconds\n4. Keep core engaged\n5. Switch legs",
      targetBodyRegion: "ANKLE_FOOT",
      difficulty: "BEGINNER",
      category: "BALANCE",
      repCount: 3,
      holdDuration: 30,
      equipment: [],
      contraindications: ["Severe vertigo", "Ankle fracture"],
    },
  ];

  for (const exercise of exercises) {
    await prisma.exercise.upsert({
      where: { name: exercise.name },
      update: exercise as any,
      create: exercise as any,
    });
  }

  console.log(`✅ Created ${exercises.length} exercises`);

  // Create sample exercise plan
  const exercisePlan = await prisma.exercisePlan.upsert({
    where: { id: "default-lower-back-plan" },
    update: {},
    create: {
      id: "default-lower-back-plan",
      name: "Lower Back Rehabilitation Program",
      description: "A 4-week program designed to strengthen the core and reduce lower back pain.",
      targetCondition: "Chronic Lower Back Pain",
      durationWeeks: 4,
    },
  });

  console.log(`✅ Created exercise plan: ${exercisePlan.name}`);

  console.log("🎉 Seeding complete!");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
