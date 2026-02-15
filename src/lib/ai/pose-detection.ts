"use client";

import * as poseDetection from "@tensorflow-models/pose-detection";
import * as tf from "@tensorflow/tfjs";

// Keypoint indices for MoveNet
const KEYPOINTS = {
  nose: 0,
  leftEye: 1,
  rightEye: 2,
  leftEar: 3,
  rightEar: 4,
  leftShoulder: 5,
  rightShoulder: 6,
  leftElbow: 7,
  rightElbow: 8,
  leftWrist: 9,
  rightWrist: 10,
  leftHip: 11,
  rightHip: 12,
  leftKnee: 13,
  rightKnee: 14,
  leftAnkle: 15,
  rightAnkle: 16,
};

export interface PoseKeypoint {
  x: number;
  y: number;
  score: number;
  name: string;
}

export interface PoseAnalysis {
  keypoints: PoseKeypoint[];
  angles: Record<string, number>;
  isCorrectForm: boolean;
  formScore: number;
  corrections: string[];
  confidence: number;
}

export interface ExerciseConfig {
  name: string;
  targetAngles: Record<string, { min: number; max: number }>;
  keyPointsToTrack: string[];
  repDetection: {
    startAngle: { joint: string; angle: number };
    endAngle: { joint: string; angle: number };
  };
}

// Common exercise configurations
export const EXERCISE_CONFIGS: Record<string, ExerciseConfig> = {
  squat: {
    name: "Squat",
    targetAngles: {
      leftKnee: { min: 70, max: 100 },
      rightKnee: { min: 70, max: 100 },
      leftHip: { min: 70, max: 110 },
      rightHip: { min: 70, max: 110 },
    },
    keyPointsToTrack: ["leftHip", "rightHip", "leftKnee", "rightKnee", "leftAnkle", "rightAnkle"],
    repDetection: {
      startAngle: { joint: "leftKnee", angle: 160 },
      endAngle: { joint: "leftKnee", angle: 90 },
    },
  },
  shoulderRaise: {
    name: "Shoulder Raise",
    targetAngles: {
      leftShoulder: { min: 80, max: 100 },
      rightShoulder: { min: 80, max: 100 },
    },
    keyPointsToTrack: ["leftShoulder", "rightShoulder", "leftElbow", "rightElbow", "leftWrist", "rightWrist"],
    repDetection: {
      startAngle: { joint: "leftShoulder", angle: 20 },
      endAngle: { joint: "leftShoulder", angle: 90 },
    },
  },
  armCurl: {
    name: "Arm Curl",
    targetAngles: {
      leftElbow: { min: 30, max: 50 },
      rightElbow: { min: 30, max: 50 },
    },
    keyPointsToTrack: ["leftShoulder", "rightShoulder", "leftElbow", "rightElbow", "leftWrist", "rightWrist"],
    repDetection: {
      startAngle: { joint: "leftElbow", angle: 160 },
      endAngle: { joint: "leftElbow", angle: 40 },
    },
  },
  lunge: {
    name: "Lunge",
    targetAngles: {
      leftKnee: { min: 80, max: 100 },
      rightKnee: { min: 80, max: 100 },
    },
    keyPointsToTrack: ["leftHip", "rightHip", "leftKnee", "rightKnee", "leftAnkle", "rightAnkle"],
    repDetection: {
      startAngle: { joint: "leftKnee", angle: 170 },
      endAngle: { joint: "leftKnee", angle: 90 },
    },
  },
  standingKneeRaise: {
    name: "Standing Knee Raise",
    targetAngles: {
      leftHip: { min: 80, max: 110 },
      rightHip: { min: 80, max: 110 },
    },
    keyPointsToTrack: ["leftHip", "rightHip", "leftKnee", "rightKnee"],
    repDetection: {
      startAngle: { joint: "leftHip", angle: 170 },
      endAngle: { joint: "leftHip", angle: 90 },
    },
  },
  neckStretch: {
    name: "Neck Stretch",
    targetAngles: {
      neck: { min: 30, max: 45 },
    },
    keyPointsToTrack: ["nose", "leftShoulder", "rightShoulder"],
    repDetection: {
      startAngle: { joint: "neck", angle: 0 },
      endAngle: { joint: "neck", angle: 40 },
    },
  },
};

let detector: poseDetection.PoseDetector | null = null;

export async function initializePoseDetection(): Promise<void> {
  if (detector) return;

  await tf.ready();
  
  // Use MoveNet for better performance
  detector = await poseDetection.createDetector(
    poseDetection.SupportedModels.MoveNet,
    {
      modelType: poseDetection.movenet.modelType.SINGLEPOSE_LIGHTNING,
      enableSmoothing: true,
      minPoseScore: 0.25,
    }
  );
}

export async function detectPose(
  video: HTMLVideoElement
): Promise<poseDetection.Pose | null> {
  if (!detector) {
    await initializePoseDetection();
  }

  if (!detector) return null;

  const poses = await detector.estimatePoses(video);
  return poses[0] || null;
}

export function calculateAngle(
  point1: { x: number; y: number },
  point2: { x: number; y: number },
  point3: { x: number; y: number }
): number {
  const radians =
    Math.atan2(point3.y - point2.y, point3.x - point2.x) -
    Math.atan2(point1.y - point2.y, point1.x - point2.x);
  let angle = Math.abs((radians * 180) / Math.PI);
  if (angle > 180) {
    angle = 360 - angle;
  }
  return angle;
}

export function getJointAngle(
  keypoints: poseDetection.Keypoint[],
  jointName: string
): number | null {
  const jointConfigs: Record<string, [number, number, number]> = {
    leftElbow: [KEYPOINTS.leftShoulder, KEYPOINTS.leftElbow, KEYPOINTS.leftWrist],
    rightElbow: [KEYPOINTS.rightShoulder, KEYPOINTS.rightElbow, KEYPOINTS.rightWrist],
    leftShoulder: [KEYPOINTS.leftElbow, KEYPOINTS.leftShoulder, KEYPOINTS.leftHip],
    rightShoulder: [KEYPOINTS.rightElbow, KEYPOINTS.rightShoulder, KEYPOINTS.rightHip],
    leftHip: [KEYPOINTS.leftShoulder, KEYPOINTS.leftHip, KEYPOINTS.leftKnee],
    rightHip: [KEYPOINTS.rightShoulder, KEYPOINTS.rightHip, KEYPOINTS.rightKnee],
    leftKnee: [KEYPOINTS.leftHip, KEYPOINTS.leftKnee, KEYPOINTS.leftAnkle],
    rightKnee: [KEYPOINTS.rightHip, KEYPOINTS.rightKnee, KEYPOINTS.rightAnkle],
  };

  const config = jointConfigs[jointName];
  if (!config) return null;

  const [p1Idx, p2Idx, p3Idx] = config;
  const p1 = keypoints[p1Idx];
  const p2 = keypoints[p2Idx];
  const p3 = keypoints[p3Idx];

  if (!p1 || !p2 || !p3) return null;
  if ((p1.score || 0) < 0.3 || (p2.score || 0) < 0.3 || (p3.score || 0) < 0.3) {
    return null;
  }

  return calculateAngle(p1, p2, p3);
}

export function analyzePoseForExercise(
  pose: poseDetection.Pose,
  exerciseConfig: ExerciseConfig,
  tolerance: number = 15
): PoseAnalysis {
  const keypoints: PoseKeypoint[] = pose.keypoints.map((kp, idx) => ({
    x: kp.x,
    y: kp.y,
    score: kp.score || 0,
    name: Object.keys(KEYPOINTS).find((k) => KEYPOINTS[k as keyof typeof KEYPOINTS] === idx) || `point_${idx}`,
  }));

  // Calculate all relevant angles
  const angles: Record<string, number> = {};
  const corrections: string[] = [];
  let correctAngles = 0;
  let totalAngles = 0;

  for (const [jointName, targetRange] of Object.entries(exerciseConfig.targetAngles)) {
    const angle = getJointAngle(pose.keypoints, jointName);
    if (angle !== null) {
      angles[jointName] = angle;
      totalAngles++;

      if (angle >= targetRange.min - tolerance && angle <= targetRange.max + tolerance) {
        correctAngles++;
      } else {
        // Generate correction feedback
        if (angle < targetRange.min) {
          corrections.push(
            `${formatJointName(jointName)}: Increase angle (currently ${Math.round(angle)}°, target: ${targetRange.min}°-${targetRange.max}°)`
          );
        } else {
          corrections.push(
            `${formatJointName(jointName)}: Decrease angle (currently ${Math.round(angle)}°, target: ${targetRange.min}°-${targetRange.max}°)`
          );
        }
      }
    }
  }

  const formScore = totalAngles > 0 ? (correctAngles / totalAngles) * 100 : 0;
  const isCorrectForm = formScore >= 80;

  // Calculate overall confidence
  const avgConfidence =
    pose.keypoints.reduce((sum, kp) => sum + (kp.score || 0), 0) /
    pose.keypoints.length;

  return {
    keypoints,
    angles,
    isCorrectForm,
    formScore: Math.round(formScore),
    corrections,
    confidence: avgConfidence,
  };
}

function formatJointName(jointName: string): string {
  return jointName
    .replace(/([A-Z])/g, " $1")
    .replace(/^./, (str) => str.toUpperCase())
    .trim();
}

export class RepCounter {
  private exercise: ExerciseConfig;
  private repCount: number = 0;
  private isInStartPosition: boolean = true;
  private lastAngle: number | null = null;
  private repThreshold: number = 20; // Degree change needed to count

  constructor(exercise: ExerciseConfig) {
    this.exercise = exercise;
  }

  update(pose: poseDetection.Pose): { repCount: number; phase: "up" | "down" | "neutral" } {
    const { joint, angle: startAngle } = this.exercise.repDetection.startAngle;
    const { angle: endAngle } = this.exercise.repDetection.endAngle;

    const currentAngle = getJointAngle(pose.keypoints, joint);
    if (currentAngle === null) {
      return { repCount: this.repCount, phase: "neutral" };
    }

    let phase: "up" | "down" | "neutral" = "neutral";

    // Detect rep completion
    if (this.isInStartPosition) {
      // Check if moved to end position
      if (Math.abs(currentAngle - endAngle) < this.repThreshold) {
        this.isInStartPosition = false;
        phase = "down";
      }
    } else {
      // Check if returned to start position
      if (Math.abs(currentAngle - startAngle) < this.repThreshold) {
        this.isInStartPosition = true;
        this.repCount++;
        phase = "up";
      } else {
        phase = "down";
      }
    }

    this.lastAngle = currentAngle;
    return { repCount: this.repCount, phase };
  }

  reset(): void {
    this.repCount = 0;
    this.isInStartPosition = true;
    this.lastAngle = null;
  }

  getRepCount(): number {
    return this.repCount;
  }
}

export function drawPose(
  ctx: CanvasRenderingContext2D,
  pose: poseDetection.Pose,
  analysis?: PoseAnalysis
): void {
  const connections = [
    [KEYPOINTS.leftShoulder, KEYPOINTS.rightShoulder],
    [KEYPOINTS.leftShoulder, KEYPOINTS.leftElbow],
    [KEYPOINTS.leftElbow, KEYPOINTS.leftWrist],
    [KEYPOINTS.rightShoulder, KEYPOINTS.rightElbow],
    [KEYPOINTS.rightElbow, KEYPOINTS.rightWrist],
    [KEYPOINTS.leftShoulder, KEYPOINTS.leftHip],
    [KEYPOINTS.rightShoulder, KEYPOINTS.rightHip],
    [KEYPOINTS.leftHip, KEYPOINTS.rightHip],
    [KEYPOINTS.leftHip, KEYPOINTS.leftKnee],
    [KEYPOINTS.leftKnee, KEYPOINTS.leftAnkle],
    [KEYPOINTS.rightHip, KEYPOINTS.rightKnee],
    [KEYPOINTS.rightKnee, KEYPOINTS.rightAnkle],
  ];

  // Draw connections
  ctx.lineWidth = 3;
  for (const [startIdx, endIdx] of connections) {
    const start = pose.keypoints[startIdx];
    const end = pose.keypoints[endIdx];

    if ((start.score || 0) > 0.3 && (end.score || 0) > 0.3) {
      ctx.strokeStyle = analysis?.isCorrectForm ? "#22c55e" : "#ef4444";
      ctx.beginPath();
      ctx.moveTo(start.x, start.y);
      ctx.lineTo(end.x, end.y);
      ctx.stroke();
    }
  }

  // Draw keypoints
  for (const keypoint of pose.keypoints) {
    if ((keypoint.score || 0) > 0.3) {
      ctx.fillStyle = analysis?.isCorrectForm ? "#22c55e" : "#ef4444";
      ctx.beginPath();
      ctx.arc(keypoint.x, keypoint.y, 6, 0, 2 * Math.PI);
      ctx.fill();

      ctx.fillStyle = "white";
      ctx.beginPath();
      ctx.arc(keypoint.x, keypoint.y, 3, 0, 2 * Math.PI);
      ctx.fill();
    }
  }
}
