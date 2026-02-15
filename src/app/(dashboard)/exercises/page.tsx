"use client";

import { useState } from "react";
import { 
  Activity, 
  ArrowLeft,
  ArrowRight, 
  Camera,
  CheckCircle,
  Clock,
  Dumbbell,
  Filter,
  Play,
  Search,
  Sparkles,
  Star,
  Zap
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ExerciseGuidance } from "@/components/exercise/exercise-guidance";
import { cn } from "@/lib/utils";

const EXERCISE_LIBRARY = [
  {
    id: "squat",
    name: "Bodyweight Squat",
    category: "Strengthening",
    targetArea: "Lower Body",
    difficulty: "Beginner",
    duration: "5 min",
    reps: 10,
    description: "A fundamental lower body exercise that strengthens quadriceps, hamstrings, and glutes.",
    benefits: ["Builds leg strength", "Improves balance", "Enhances mobility"],
    hasAIGuidance: true,
  },
  {
    id: "shoulderRaise",
    name: "Shoulder Lateral Raise",
    category: "Strengthening",
    targetArea: "Upper Body",
    difficulty: "Beginner",
    duration: "4 min",
    reps: 12,
    description: "Targets the deltoid muscles to improve shoulder strength and stability.",
    benefits: ["Shoulder stability", "Upper body strength", "Posture improvement"],
    hasAIGuidance: true,
  },
  {
    id: "armCurl",
    name: "Bicep Curl",
    category: "Strengthening",
    targetArea: "Arms",
    difficulty: "Beginner",
    duration: "4 min",
    reps: 12,
    description: "Isolates and strengthens the bicep muscles for improved arm function.",
    benefits: ["Arm strength", "Grip strength", "Functional movement"],
    hasAIGuidance: true,
  },
  {
    id: "lunge",
    name: "Forward Lunge",
    category: "Strengthening",
    targetArea: "Lower Body",
    difficulty: "Intermediate",
    duration: "6 min",
    reps: 10,
    description: "A unilateral exercise that improves balance, coordination, and leg strength.",
    benefits: ["Single leg strength", "Balance", "Hip flexibility"],
    hasAIGuidance: true,
  },
  {
    id: "standingKneeRaise",
    name: "Standing Knee Raise",
    category: "Mobility",
    targetArea: "Hip/Core",
    difficulty: "Beginner",
    duration: "3 min",
    reps: 15,
    description: "Improves hip flexor strength and core stability.",
    benefits: ["Hip mobility", "Core activation", "Balance"],
    hasAIGuidance: true,
  },
];

const CATEGORIES = ["All", "Strengthening", "Stretching", "Mobility", "Balance"];
const DIFFICULTIES = ["All", "Beginner", "Intermediate", "Advanced"];

export default function ExercisesPage() {
  const [selectedExercise, setSelectedExercise] = useState<typeof EXERCISE_LIBRARY[0] | null>(null);
  const [activeCategory, setActiveCategory] = useState("All");
  const [activeDifficulty, setActiveDifficulty] = useState("All");
  const [searchQuery, setSearchQuery] = useState("");

  const filteredExercises = EXERCISE_LIBRARY.filter((exercise) => {
    const matchesCategory = activeCategory === "All" || exercise.category === activeCategory;
    const matchesDifficulty = activeDifficulty === "All" || exercise.difficulty === activeDifficulty;
    const matchesSearch = exercise.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      exercise.targetArea.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesDifficulty && matchesSearch;
  });

  if (selectedExercise) {
    return (
      <div className="space-y-6">
        <Button
          variant="ghost"
          onClick={() => setSelectedExercise(null)}
          className="mb-4"
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back to Exercises
        </Button>

        <div className="mb-6">
          <h1 className="text-2xl font-bold text-gray-900">{selectedExercise.name}</h1>
          <p className="text-gray-500 mt-1">{selectedExercise.description}</p>
        </div>

        <ExerciseGuidance
          exerciseId={selectedExercise.id}
          exerciseName={selectedExercise.name}
          targetReps={selectedExercise.reps}
          onComplete={(data) => {
            console.log("Exercise completed:", data);
            // Save to database
          }}
        />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Exercise Library</h1>
          <p className="text-gray-500 mt-1">
            AI-powered exercise guidance with real-time form feedback
          </p>
        </div>
      </div>

      {/* AI Feature Banner */}
      <Card className="bg-gradient-to-r from-orange-50 to-red-50 border-orange-100">
        <CardContent className="p-6">
          <div className="flex items-start gap-4">
            <div className="w-12 h-12 rounded-xl bg-white shadow-sm flex items-center justify-center flex-shrink-0">
              <Camera className="w-6 h-6 text-orange-600" />
            </div>
            <div className="flex-1">
              <h3 className="font-semibold text-gray-900 mb-1 flex items-center gap-2">
                AI Exercise Guidance
                <span className="px-2 py-0.5 bg-orange-100 text-orange-700 text-xs rounded-full">
                  Pro Feature
                </span>
              </h3>
              <p className="text-sm text-gray-600">
                Our computer vision AI watches your form through your camera and provides
                real-time feedback to ensure you&apos;re performing exercises correctly and safely.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
          <input
            type="text"
            placeholder="Search exercises..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-xl focus:ring-2 focus:ring-physio-500 focus:border-transparent"
          />
        </div>

        <div className="flex gap-2 overflow-x-auto pb-2">
          {CATEGORIES.map((category) => (
            <Button
              key={category}
              variant={activeCategory === category ? "default" : "outline"}
              size="sm"
              onClick={() => setActiveCategory(category)}
              className={cn(
                "whitespace-nowrap",
                activeCategory === category && "bg-physio-600 hover:bg-physio-700"
              )}
            >
              {category}
            </Button>
          ))}
        </div>
      </div>

      {/* Exercise Grid */}
      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredExercises.map((exercise) => (
          <Card
            key={exercise.id}
            className="group hover:shadow-lg transition-all cursor-pointer"
            onClick={() => setSelectedExercise(exercise)}
          >
            <CardContent className="p-0">
              {/* Exercise Image Placeholder */}
              <div className="relative h-40 bg-gradient-to-br from-gray-100 to-gray-200 rounded-t-lg overflow-hidden">
                <div className="absolute inset-0 flex items-center justify-center">
                  <Dumbbell className="w-16 h-16 text-gray-300" />
                </div>
                {exercise.hasAIGuidance && (
                  <div className="absolute top-3 right-3 px-2 py-1 bg-orange-500 text-white text-xs font-medium rounded-full flex items-center gap-1">
                    <Sparkles className="w-3 h-3" />
                    AI Guided
                  </div>
                )}
                <div className="absolute bottom-0 left-0 right-0 p-3 bg-gradient-to-t from-black/60 to-transparent">
                  <span className={cn(
                    "px-2 py-1 rounded-full text-xs font-medium",
                    exercise.difficulty === "Beginner" && "bg-green-100 text-green-700",
                    exercise.difficulty === "Intermediate" && "bg-yellow-100 text-yellow-700",
                    exercise.difficulty === "Advanced" && "bg-red-100 text-red-700"
                  )}>
                    {exercise.difficulty}
                  </span>
                </div>
              </div>

              {/* Exercise Info */}
              <div className="p-4">
                <h3 className="font-semibold text-gray-900 mb-1 group-hover:text-physio-600 transition-colors">
                  {exercise.name}
                </h3>
                <p className="text-sm text-gray-500 mb-3">
                  {exercise.targetArea} • {exercise.category}
                </p>

                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3 text-sm text-gray-500">
                    <span className="flex items-center gap-1">
                      <Clock className="w-4 h-4" />
                      {exercise.duration}
                    </span>
                    <span className="flex items-center gap-1">
                      <Activity className="w-4 h-4" />
                      {exercise.reps} reps
                    </span>
                  </div>

                  <Button size="sm" className="bg-physio-600 hover:bg-physio-700">
                    <Play className="w-4 h-4 mr-1" />
                    Start
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {filteredExercises.length === 0 && (
        <div className="text-center py-12">
          <Dumbbell className="w-16 h-16 text-gray-300 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-1">No exercises found</h3>
          <p className="text-gray-500">Try adjusting your filters or search query</p>
        </div>
      )}
    </div>
  );
}
