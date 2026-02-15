"use client";

import { useState } from "react";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  AreaChart,
  Area,
  BarChart,
  Bar,
} from "recharts";
import {
  Activity,
  ArrowDown,
  ArrowUp,
  Calendar,
  CheckCircle2,
  Clock,
  Dumbbell,
  Flame,
  Target,
  TrendingDown,
  TrendingUp,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface ProgressRecord {
  date: string;
  painLevel: number;
  mobilityScore: number;
  functionalScore: number;
  exerciseCompliance: number;
}

interface ProgressDashboardProps {
  patientName?: string;
  progressData?: ProgressRecord[];
  treatmentPlan?: string;
  predictedRecoveryDate?: string;
  totalSessions?: number;
  completedSessions?: number;
  exerciseStreak?: number;
}

// Sample data for demonstration
const sampleProgressData: ProgressRecord[] = [
  { date: "Week 1", painLevel: 8, mobilityScore: 3, functionalScore: 4, exerciseCompliance: 70 },
  { date: "Week 2", painLevel: 7, mobilityScore: 4, functionalScore: 5, exerciseCompliance: 85 },
  { date: "Week 3", painLevel: 6, mobilityScore: 5, functionalScore: 5, exerciseCompliance: 90 },
  { date: "Week 4", painLevel: 5, mobilityScore: 6, functionalScore: 6, exerciseCompliance: 95 },
  { date: "Week 5", painLevel: 4, mobilityScore: 7, functionalScore: 7, exerciseCompliance: 88 },
  { date: "Week 6", painLevel: 3, mobilityScore: 7, functionalScore: 8, exerciseCompliance: 92 },
  { date: "Week 7", painLevel: 3, mobilityScore: 8, functionalScore: 8, exerciseCompliance: 100 },
  { date: "Week 8", painLevel: 2, mobilityScore: 9, functionalScore: 9, exerciseCompliance: 95 },
];

export function ProgressDashboard({
  patientName = "Your",
  progressData = sampleProgressData,
  treatmentPlan = "Lower back rehabilitation - Chronic pain management",
  predictedRecoveryDate = "March 15, 2026",
  totalSessions = 12,
  completedSessions = 8,
  exerciseStreak = 14,
}: ProgressDashboardProps) {
  const [selectedMetric, setSelectedMetric] = useState<"pain" | "mobility" | "function">("pain");

  // Calculate trends
  const latestData = progressData[progressData.length - 1];
  const previousData = progressData[progressData.length - 2];

  const painTrend = previousData ? latestData.painLevel - previousData.painLevel : 0;
  const mobilityTrend = previousData ? latestData.mobilityScore - previousData.mobilityScore : 0;

  const overallProgress = Math.round(
    ((10 - latestData.painLevel) / 10 + latestData.mobilityScore / 10 + latestData.functionalScore / 10) / 3 * 100
  );

  const metrics = [
    {
      id: "pain",
      label: "Pain Level",
      value: latestData.painLevel,
      max: 10,
      trend: painTrend,
      trendLabel: painTrend < 0 ? "Improving" : painTrend > 0 ? "Increasing" : "Stable",
      color: "text-red-500",
      bgColor: "bg-red-50",
      chartColor: "#ef4444",
      inverse: true, // Lower is better
    },
    {
      id: "mobility",
      label: "Mobility Score",
      value: latestData.mobilityScore,
      max: 10,
      trend: mobilityTrend,
      trendLabel: mobilityTrend > 0 ? "Improving" : mobilityTrend < 0 ? "Declining" : "Stable",
      color: "text-blue-500",
      bgColor: "bg-blue-50",
      chartColor: "#3b82f6",
      inverse: false,
    },
    {
      id: "function",
      label: "Functional Score",
      value: latestData.functionalScore,
      max: 10,
      trend: 0,
      trendLabel: "Stable",
      color: "text-green-500",
      bgColor: "bg-green-50",
      chartColor: "#22c55e",
      inverse: false,
    },
  ];

  const selectedMetricData = metrics.find((m) => m.id === selectedMetric)!;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">
            {patientName} Recovery Dashboard
          </h1>
          <p className="text-gray-500">{treatmentPlan}</p>
        </div>
        <div className="flex items-center gap-3">
          <div className="px-4 py-2 bg-physio-50 text-physio-700 rounded-lg text-sm font-medium">
            <Calendar className="w-4 h-4 inline mr-2" />
            Est. Recovery: {predictedRecoveryDate}
          </div>
        </div>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-xl bg-physio-100 flex items-center justify-center">
                <Target className="w-6 h-6 text-physio-600" />
              </div>
              <div>
                <p className="text-2xl font-bold text-gray-900">{overallProgress}%</p>
                <p className="text-sm text-gray-500">Overall Progress</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-xl bg-blue-100 flex items-center justify-center">
                <Calendar className="w-6 h-6 text-blue-600" />
              </div>
              <div>
                <p className="text-2xl font-bold text-gray-900">
                  {completedSessions}/{totalSessions}
                </p>
                <p className="text-sm text-gray-500">Sessions</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-xl bg-orange-100 flex items-center justify-center">
                <Flame className="w-6 h-6 text-orange-600" />
              </div>
              <div>
                <p className="text-2xl font-bold text-gray-900">{exerciseStreak}</p>
                <p className="text-sm text-gray-500">Day Streak</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-xl bg-green-100 flex items-center justify-center">
                <Dumbbell className="w-6 h-6 text-green-600" />
              </div>
              <div>
                <p className="text-2xl font-bold text-gray-900">
                  {latestData.exerciseCompliance}%
                </p>
                <p className="text-sm text-gray-500">Compliance</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Metric Cards */}
      <div className="grid md:grid-cols-3 gap-4">
        {metrics.map((metric) => (
          <Card
            key={metric.id}
            className={cn(
              "cursor-pointer transition-all",
              selectedMetric === metric.id
                ? "ring-2 ring-physio-500 shadow-lg"
                : "hover:shadow-md"
            )}
            onClick={() => setSelectedMetric(metric.id as any)}
          >
            <CardContent className="p-4">
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-sm text-gray-500 mb-1">{metric.label}</p>
                  <p className={cn("text-3xl font-bold", metric.color)}>
                    {metric.value}
                    <span className="text-lg text-gray-400">/{metric.max}</span>
                  </p>
                </div>
                <div
                  className={cn(
                    "flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium",
                    metric.inverse
                      ? metric.trend < 0
                        ? "bg-green-100 text-green-700"
                        : metric.trend > 0
                        ? "bg-red-100 text-red-700"
                        : "bg-gray-100 text-gray-700"
                      : metric.trend > 0
                      ? "bg-green-100 text-green-700"
                      : metric.trend < 0
                      ? "bg-red-100 text-red-700"
                      : "bg-gray-100 text-gray-700"
                  )}
                >
                  {metric.trend !== 0 && (
                    metric.inverse ? (
                      metric.trend < 0 ? <TrendingDown className="w-3 h-3" /> : <TrendingUp className="w-3 h-3" />
                    ) : (
                      metric.trend > 0 ? <TrendingUp className="w-3 h-3" /> : <TrendingDown className="w-3 h-3" />
                    )
                  )}
                  {metric.trendLabel}
                </div>
              </div>

              {/* Mini sparkline */}
              <div className="mt-4 h-12">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={progressData}>
                    <Area
                      type="monotone"
                      dataKey={
                        metric.id === "pain"
                          ? "painLevel"
                          : metric.id === "mobility"
                          ? "mobilityScore"
                          : "functionalScore"
                      }
                      stroke={metric.chartColor}
                      fill={metric.chartColor}
                      fillOpacity={0.2}
                      strokeWidth={2}
                    />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Main Chart */}
      <Card>
        <CardHeader>
          <CardTitle>Progress Over Time</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={progressData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                <XAxis dataKey="date" stroke="#6b7280" fontSize={12} />
                <YAxis domain={[0, 10]} stroke="#6b7280" fontSize={12} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: "white",
                    border: "1px solid #e5e7eb",
                    borderRadius: "8px",
                    boxShadow: "0 4px 6px -1px rgb(0 0 0 / 0.1)",
                  }}
                />
                <Line
                  type="monotone"
                  dataKey="painLevel"
                  stroke="#ef4444"
                  strokeWidth={selectedMetric === "pain" ? 3 : 2}
                  dot={{ fill: "#ef4444", strokeWidth: 2 }}
                  name="Pain Level"
                  opacity={selectedMetric === "pain" ? 1 : 0.3}
                />
                <Line
                  type="monotone"
                  dataKey="mobilityScore"
                  stroke="#3b82f6"
                  strokeWidth={selectedMetric === "mobility" ? 3 : 2}
                  dot={{ fill: "#3b82f6", strokeWidth: 2 }}
                  name="Mobility"
                  opacity={selectedMetric === "mobility" ? 1 : 0.3}
                />
                <Line
                  type="monotone"
                  dataKey="functionalScore"
                  stroke="#22c55e"
                  strokeWidth={selectedMetric === "function" ? 3 : 2}
                  dot={{ fill: "#22c55e", strokeWidth: 2 }}
                  name="Function"
                  opacity={selectedMetric === "function" ? 1 : 0.3}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>

      {/* Exercise Compliance Chart */}
      <div className="grid md:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Weekly Exercise Compliance</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={progressData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                  <XAxis dataKey="date" stroke="#6b7280" fontSize={12} />
                  <YAxis domain={[0, 100]} stroke="#6b7280" fontSize={12} />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: "white",
                      border: "1px solid #e5e7eb",
                      borderRadius: "8px",
                    }}
                  />
                  <Bar
                    dataKey="exerciseCompliance"
                    fill="#22c55e"
                    radius={[4, 4, 0, 0]}
                    name="Compliance %"
                  />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        {/* AI Insights */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Activity className="w-5 h-5 text-physio-600" />
              AI Progress Analysis
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="p-4 bg-green-50 border border-green-200 rounded-xl">
              <div className="flex items-start gap-3">
                <CheckCircle2 className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
                <div>
                  <p className="font-medium text-green-800">Excellent Progress</p>
                  <p className="text-sm text-green-700 mt-1">
                    Your pain levels have decreased by 75% since starting treatment.
                    Mobility has improved significantly.
                  </p>
                </div>
              </div>
            </div>

            <div className="p-4 bg-blue-50 border border-blue-200 rounded-xl">
              <div className="flex items-start gap-3">
                <TrendingUp className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
                <div>
                  <p className="font-medium text-blue-800">Key Observations</p>
                  <ul className="text-sm text-blue-700 mt-1 space-y-1">
                    <li>• Consistent exercise compliance correlates with faster improvement</li>
                    <li>• Morning exercises show better results for your condition</li>
                    <li>• Recommend increasing stretching frequency</li>
                  </ul>
                </div>
              </div>
            </div>

            <div className="p-4 bg-physio-50 border border-physio-200 rounded-xl">
              <div className="flex items-start gap-3">
                <Target className="w-5 h-5 text-physio-600 flex-shrink-0 mt-0.5" />
                <div>
                  <p className="font-medium text-physio-800">Next Goals</p>
                  <p className="text-sm text-physio-700 mt-1">
                    Focus on core strengthening exercises this week. Target: Complete
                    all prescribed exercises for 7 consecutive days.
                  </p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
