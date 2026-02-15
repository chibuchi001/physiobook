"use client";

import { useEffect, useRef, useState, useCallback } from "react";
import Webcam from "react-webcam";
import {
  Activity,
  Camera,
  CheckCircle,
  Loader2,
  Pause,
  Play,
  RotateCcw,
  Volume2,
  VolumeX,
  XCircle,
  Trophy,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import {
  initializePoseDetection,
  detectPose,
  analyzePoseForExercise,
  drawPose,
  RepCounter,
  EXERCISE_CONFIGS,
  type PoseAnalysis,
  type ExerciseConfig,
} from "@/lib/ai/pose-detection";

interface ExerciseGuidanceProps {
  exerciseId?: string;
  exerciseName?: string;
  targetReps?: number;
  onComplete?: (data: {
    completedReps: number;
    formScore: number;
    duration: number;
  }) => void;
}

export function ExerciseGuidance({
  exerciseId = "squat",
  exerciseName = "Squat",
  targetReps = 10,
  onComplete,
}: ExerciseGuidanceProps) {
  const webcamRef = useRef<Webcam>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animationRef = useRef<number>();
  const repCounterRef = useRef<RepCounter | null>(null);
  const startTimeRef = useRef<number>(0);

  const [isLoading, setIsLoading] = useState(true);
  const [isRunning, setIsRunning] = useState(false);
  const [cameraReady, setCameraReady] = useState(false);
  const [repCount, setRepCount] = useState(0);
  const [currentAnalysis, setCurrentAnalysis] = useState<PoseAnalysis | null>(null);
  const [formScores, setFormScores] = useState<number[]>([]);
  const [isMuted, setIsMuted] = useState(false);
  const [isCompleted, setIsCompleted] = useState(false);
  const [duration, setDuration] = useState(0);

  const exerciseConfig = EXERCISE_CONFIGS[exerciseId] || EXERCISE_CONFIGS.squat;

  // Initialize pose detection
  useEffect(() => {
    const init = async () => {
      try {
        await initializePoseDetection();
        setIsLoading(false);
      } catch (error) {
        console.error("Failed to initialize pose detection:", error);
        setIsLoading(false);
      }
    };
    init();

    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, []);

  // Initialize rep counter
  useEffect(() => {
    repCounterRef.current = new RepCounter(exerciseConfig);
  }, [exerciseConfig]);

  // Speak feedback
  const speak = useCallback((text: string) => {
    if (isMuted) return;
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.rate = 1.1;
    utterance.pitch = 1;
    speechSynthesis.speak(utterance);
  }, [isMuted]);

  // Main detection loop
  const runDetection = useCallback(async () => {
    if (!webcamRef.current?.video || !canvasRef.current || !isRunning) return;

    const video = webcamRef.current.video;
    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");

    if (!ctx || video.readyState !== 4) {
      animationRef.current = requestAnimationFrame(runDetection);
      return;
    }

    // Set canvas dimensions
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;

    // Detect pose
    const pose = await detectPose(video);

    if (pose) {
      // Analyze pose for exercise
      const analysis = analyzePoseForExercise(pose, exerciseConfig);
      setCurrentAnalysis(analysis);

      // Track form scores
      if (analysis.formScore > 0) {
        setFormScores((prev) => [...prev.slice(-50), analysis.formScore]);
      }

      // Count reps
      if (repCounterRef.current) {
        const { repCount: newRepCount, phase } = repCounterRef.current.update(pose);
        
        if (newRepCount > repCount) {
          setRepCount(newRepCount);
          speak(`${newRepCount}`);

          // Check if target reached
          if (newRepCount >= targetReps && !isCompleted) {
            setIsCompleted(true);
            setIsRunning(false);
            speak("Great job! Exercise complete!");
            
            const totalDuration = Math.floor((Date.now() - startTimeRef.current) / 1000);
            setDuration(totalDuration);
            
            if (onComplete) {
              const avgFormScore = formScores.length > 0
                ? Math.round(formScores.reduce((a, b) => a + b, 0) / formScores.length)
                : 0;
              onComplete({
                completedReps: newRepCount,
                formScore: avgFormScore,
                duration: totalDuration,
              });
            }
          }
        }
      }

      // Draw pose on canvas
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      drawPose(ctx, pose, analysis);

      // Draw form feedback
      drawFormFeedback(ctx, analysis, canvas.width, canvas.height);
    }

    // Update duration
    if (startTimeRef.current > 0) {
      setDuration(Math.floor((Date.now() - startTimeRef.current) / 1000));
    }

    animationRef.current = requestAnimationFrame(runDetection);
  }, [isRunning, exerciseConfig, repCount, targetReps, isCompleted, speak, formScores, onComplete]);

  // Start/stop detection
  useEffect(() => {
    if (isRunning && cameraReady) {
      if (startTimeRef.current === 0) {
        startTimeRef.current = Date.now();
      }
      runDetection();
    }
    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, [isRunning, cameraReady, runDetection]);

  const handleStart = () => {
    setIsRunning(true);
    speak("Starting exercise. Get into position.");
  };

  const handlePause = () => {
    setIsRunning(false);
    speak("Paused");
  };

  const handleReset = () => {
    setIsRunning(false);
    setRepCount(0);
    setFormScores([]);
    setIsCompleted(false);
    setDuration(0);
    startTimeRef.current = 0;
    if (repCounterRef.current) {
      repCounterRef.current.reset();
    }
  };

  const averageFormScore = formScores.length > 0
    ? Math.round(formScores.reduce((a, b) => a + b, 0) / formScores.length)
    : 0;

  const formatDuration = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, "0")}`;
  };

  return (
    <div className="grid lg:grid-cols-3 gap-6">
      {/* Main Video Area */}
      <div className="lg:col-span-2">
        <Card className="overflow-hidden">
          <div className="relative aspect-video bg-gray-900">
            {isLoading ? (
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="text-center text-white">
                  <Loader2 className="w-12 h-12 animate-spin mx-auto mb-4" />
                  <p>Loading AI Model...</p>
                </div>
              </div>
            ) : (
              <>
                <Webcam
                  ref={webcamRef}
                  mirrored
                  audio={false}
                  onUserMedia={() => setCameraReady(true)}
                  className="absolute inset-0 w-full h-full object-cover"
                  videoConstraints={{
                    width: 640,
                    height: 480,
                    facingMode: "user",
                  }}
                />
                <canvas
                  ref={canvasRef}
                  className="absolute inset-0 w-full h-full object-cover"
                  style={{ transform: "scaleX(-1)" }}
                />

                {/* Overlay UI */}
                <div className="absolute top-4 left-4 right-4 flex justify-between items-start">
                  {/* Rep Counter */}
                  <div className="bg-black/70 backdrop-blur-sm rounded-xl px-6 py-3 text-white">
                    <div className="text-4xl font-bold">
                      {repCount} <span className="text-2xl text-gray-400">/ {targetReps}</span>
                    </div>
                    <div className="text-sm text-gray-300">Reps</div>
                  </div>

                  {/* Form Score */}
                  <div className="bg-black/70 backdrop-blur-sm rounded-xl px-6 py-3 text-white text-right">
                    <div className={cn(
                      "text-4xl font-bold",
                      currentAnalysis?.isCorrectForm ? "text-green-400" : "text-yellow-400"
                    )}>
                      {currentAnalysis?.formScore || 0}%
                    </div>
                    <div className="text-sm text-gray-300">Form Score</div>
                  </div>
                </div>

                {/* Form Indicator */}
                {currentAnalysis && (
                  <div className={cn(
                    "absolute bottom-20 left-1/2 -translate-x-1/2 px-6 py-3 rounded-full font-semibold flex items-center gap-2",
                    currentAnalysis.isCorrectForm
                      ? "bg-green-500/90 text-white"
                      : "bg-yellow-500/90 text-black"
                  )}>
                    {currentAnalysis.isCorrectForm ? (
                      <>
                        <CheckCircle className="w-5 h-5" />
                        Good Form!
                      </>
                    ) : (
                      <>
                        <XCircle className="w-5 h-5" />
                        Adjust Form
                      </>
                    )}
                  </div>
                )}

                {/* Completed Overlay */}
                {isCompleted && (
                  <div className="absolute inset-0 bg-black/80 flex items-center justify-center">
                    <div className="text-center text-white">
                      <Trophy className="w-20 h-20 text-yellow-400 mx-auto mb-4" />
                      <h2 className="text-3xl font-bold mb-2">Exercise Complete!</h2>
                      <p className="text-xl text-gray-300">
                        {repCount} reps • {averageFormScore}% avg form • {formatDuration(duration)}
                      </p>
                      <Button
                        onClick={handleReset}
                        className="mt-6 bg-physio-600 hover:bg-physio-700"
                        size="lg"
                      >
                        <RotateCcw className="w-5 h-5 mr-2" />
                        Try Again
                      </Button>
                    </div>
                  </div>
                )}
              </>
            )}
          </div>

          {/* Controls */}
          <div className="p-4 bg-gray-50 border-t flex items-center justify-between">
            <div className="flex items-center gap-2">
              {!isRunning ? (
                <Button
                  onClick={handleStart}
                  disabled={isLoading || !cameraReady || isCompleted}
                  className="bg-physio-600 hover:bg-physio-700"
                >
                  <Play className="w-5 h-5 mr-2" />
                  Start
                </Button>
              ) : (
                <Button onClick={handlePause} variant="outline">
                  <Pause className="w-5 h-5 mr-2" />
                  Pause
                </Button>
              )}
              <Button onClick={handleReset} variant="outline">
                <RotateCcw className="w-5 h-5 mr-2" />
                Reset
              </Button>
            </div>

            <div className="flex items-center gap-4">
              <span className="text-gray-500 font-mono">
                {formatDuration(duration)}
              </span>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setIsMuted(!isMuted)}
              >
                {isMuted ? (
                  <VolumeX className="w-5 h-5" />
                ) : (
                  <Volume2 className="w-5 h-5" />
                )}
              </Button>
            </div>
          </div>
        </Card>
      </div>

      {/* Sidebar */}
      <div className="space-y-6">
        {/* Exercise Info */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Activity className="w-5 h-5 text-physio-600" />
              {exerciseName}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div>
                <p className="text-sm text-gray-500 mb-1">Target</p>
                <p className="font-semibold">{targetReps} repetitions</p>
              </div>
              <div>
                <p className="text-sm text-gray-500 mb-1">Tracking</p>
                <ul className="text-sm text-gray-700 space-y-1">
                  {exerciseConfig.keyPointsToTrack.map((point) => (
                    <li key={point} className="flex items-center gap-2">
                      <div className="w-2 h-2 rounded-full bg-physio-500" />
                      {point.replace(/([A-Z])/g, " $1").trim()}
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Real-time Feedback */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Real-time Feedback</CardTitle>
          </CardHeader>
          <CardContent>
            {currentAnalysis?.corrections && currentAnalysis.corrections.length > 0 ? (
              <ul className="space-y-2">
                {currentAnalysis.corrections.map((correction, i) => (
                  <li
                    key={i}
                    className="text-sm p-3 bg-yellow-50 border border-yellow-200 rounded-lg text-yellow-800"
                  >
                    {correction}
                  </li>
                ))}
              </ul>
            ) : currentAnalysis?.isCorrectForm ? (
              <div className="text-sm p-3 bg-green-50 border border-green-200 rounded-lg text-green-800">
                ✓ Excellent form! Keep it up!
              </div>
            ) : (
              <p className="text-sm text-gray-500">
                Start the exercise to receive feedback
              </p>
            )}
          </CardContent>
        </Card>

        {/* Session Stats */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Session Stats</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 gap-4">
              <div className="text-center p-3 bg-gray-50 rounded-lg">
                <div className="text-2xl font-bold text-physio-600">
                  {repCount}
                </div>
                <div className="text-xs text-gray-500">Completed</div>
              </div>
              <div className="text-center p-3 bg-gray-50 rounded-lg">
                <div className="text-2xl font-bold text-physio-600">
                  {averageFormScore}%
                </div>
                <div className="text-xs text-gray-500">Avg Form</div>
              </div>
            </div>

            {/* Progress Bar */}
            <div className="mt-4">
              <div className="flex justify-between text-sm text-gray-500 mb-1">
                <span>Progress</span>
                <span>{Math.round((repCount / targetReps) * 100)}%</span>
              </div>
              <div className="h-3 bg-gray-200 rounded-full overflow-hidden">
                <div
                  className="h-full bg-gradient-to-r from-physio-500 to-health-500 transition-all duration-300"
                  style={{ width: `${Math.min((repCount / targetReps) * 100, 100)}%` }}
                />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

// Helper function to draw form feedback on canvas
function drawFormFeedback(
  ctx: CanvasRenderingContext2D,
  analysis: PoseAnalysis,
  width: number,
  height: number
) {
  // Draw angle indicators
  const angleY = 30;
  let angleX = width - 200;

  ctx.font = "14px sans-serif";
  ctx.fillStyle = "white";
  ctx.strokeStyle = "black";
  ctx.lineWidth = 3;

  for (const [joint, angle] of Object.entries(analysis.angles)) {
    const text = `${joint}: ${Math.round(angle)}°`;
    ctx.strokeText(text, angleX, angleY + Object.keys(analysis.angles).indexOf(joint) * 20);
    ctx.fillText(text, angleX, angleY + Object.keys(analysis.angles).indexOf(joint) * 20);
  }
}
