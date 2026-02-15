import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatDate(date: Date | string): string {
  return new Intl.DateTimeFormat("en-US", {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
  }).format(new Date(date));
}

export function formatTime(time: string): string {
  const [hours, minutes] = time.split(":");
  const hour = parseInt(hours, 10);
  const ampm = hour >= 12 ? "PM" : "AM";
  const formattedHour = hour % 12 || 12;
  return `${formattedHour}:${minutes} ${ampm}`;
}

export function formatDateTime(date: Date | string, time: string): string {
  return `${formatDate(date)} at ${formatTime(time)}`;
}

export function getPainLevelClass(level: number): string {
  if (level <= 3) return "pain-scale-low";
  if (level <= 5) return "pain-scale-medium";
  if (level <= 7) return "pain-scale-high";
  return "pain-scale-severe";
}

export function getPainLevelLabel(level: number): string {
  if (level <= 2) return "Minimal";
  if (level <= 4) return "Mild";
  if (level <= 6) return "Moderate";
  if (level <= 8) return "Severe";
  return "Very Severe";
}

export function getUrgencyClass(urgency: string): string {
  const classes: Record<string, string> = {
    EMERGENCY: "urgency-emergency",
    URGENT: "urgency-urgent",
    SEMI_URGENT: "urgency-semi-urgent",
    ROUTINE: "urgency-routine",
    PREVENTIVE: "urgency-preventive",
  };
  return classes[urgency] || "bg-gray-500 text-white";
}

export function getUrgencyLabel(urgency: string): string {
  const labels: Record<string, string> = {
    EMERGENCY: "Emergency",
    URGENT: "Urgent (24-48h)",
    SEMI_URGENT: "Within a Week",
    ROUTINE: "Routine (1-2 weeks)",
    PREVENTIVE: "Preventive Care",
  };
  return labels[urgency] || urgency;
}

export function getBodyRegionLabel(region: string): string {
  const labels: Record<string, string> = {
    HEAD_NECK: "Head & Neck",
    SHOULDER: "Shoulder",
    UPPER_BACK: "Upper Back",
    LOWER_BACK: "Lower Back",
    ARM_ELBOW: "Arm & Elbow",
    WRIST_HAND: "Wrist & Hand",
    HIP: "Hip",
    KNEE: "Knee",
    ANKLE_FOOT: "Ankle & Foot",
    CHEST: "Chest",
    ABDOMEN: "Abdomen",
    FULL_BODY: "Full Body",
    OTHER: "Other",
  };
  return labels[region] || region;
}

export function getSpecialtyLabel(specialty: string): string {
  const labels: Record<string, string> = {
    SPORTS_REHABILITATION: "Sports Rehabilitation",
    ORTHOPEDIC: "Orthopedic",
    NEUROLOGICAL: "Neurological",
    PEDIATRIC: "Pediatric",
    GERIATRIC: "Geriatric",
    POST_OPERATIVE: "Post-Operative",
    CHRONIC_PAIN: "Chronic Pain",
    MANUAL_THERAPY: "Manual Therapy",
    AQUATIC_THERAPY: "Aquatic Therapy",
    VESTIBULAR: "Vestibular",
    WOMENS_HEALTH: "Women's Health",
    CARDIOPULMONARY: "Cardiopulmonary",
  };
  return labels[specialty] || specialty;
}

export function getTriageCategoryLabel(category: string): string {
  const labels: Record<string, string> = {
    ACUTE_INJURY: "Acute Injury",
    CHRONIC_CONDITION: "Chronic Condition",
    POST_OPERATIVE: "Post-Operative",
    SPORTS_INJURY: "Sports Injury",
    NEUROLOGICAL: "Neurological",
    PEDIATRIC: "Pediatric",
    GERIATRIC: "Geriatric",
    PREVENTIVE: "Preventive Care",
  };
  return labels[category] || category;
}

export function calculateAge(birthDate: Date | string): number {
  const today = new Date();
  const birth = new Date(birthDate);
  let age = today.getFullYear() - birth.getFullYear();
  const monthDiff = today.getMonth() - birth.getMonth();
  if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birth.getDate())) {
    age--;
  }
  return age;
}

export function generateTimeSlots(
  startTime: string,
  endTime: string,
  duration: number
): string[] {
  const slots: string[] = [];
  const [startHour, startMin] = startTime.split(":").map(Number);
  const [endHour, endMin] = endTime.split(":").map(Number);

  let currentHour = startHour;
  let currentMin = startMin;

  while (
    currentHour < endHour ||
    (currentHour === endHour && currentMin < endMin)
  ) {
    const timeStr = `${String(currentHour).padStart(2, "0")}:${String(
      currentMin
    ).padStart(2, "0")}`;
    slots.push(timeStr);

    currentMin += duration;
    if (currentMin >= 60) {
      currentHour += Math.floor(currentMin / 60);
      currentMin = currentMin % 60;
    }
  }

  return slots;
}

export function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}
