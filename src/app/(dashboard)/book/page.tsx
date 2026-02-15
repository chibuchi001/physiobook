import { TriageAssessment } from "@/components/triage/triage-assessment";
import { Brain, Sparkles } from "lucide-react";

export default function BookPage() {
  return (
    <div className="max-w-4xl mx-auto">
      {/* Header */}
      <div className="text-center mb-8">
        <div className="inline-flex items-center gap-2 bg-physio-100 text-physio-700 px-4 py-2 rounded-full text-sm font-medium mb-4">
          <Sparkles className="w-4 h-4" />
          AI-Powered Triage
        </div>
        <h1 className="text-3xl font-bold text-gray-900 mb-2">
          Book an Appointment
        </h1>
        <p className="text-gray-500 max-w-lg mx-auto">
          Tell us about your symptoms and we&apos;ll match you with the right
          physiotherapist for your needs.
        </p>
      </div>

      {/* AI Info Banner */}
      <div className="bg-gradient-to-r from-purple-50 to-blue-50 border border-purple-100 rounded-2xl p-6 mb-8">
        <div className="flex items-start gap-4">
          <div className="w-12 h-12 rounded-xl bg-white shadow-sm flex items-center justify-center flex-shrink-0">
            <Brain className="w-6 h-6 text-purple-600" />
          </div>
          <div>
            <h3 className="font-semibold text-gray-900 mb-1">
              How AI Triage Works
            </h3>
            <p className="text-sm text-gray-600 leading-relaxed">
              Our AI analyzes your symptoms to determine the type of condition,
              urgency level, and which physiotherapy specialty would be most
              effective for your recovery. This helps ensure you&apos;re matched with
              a therapist who specializes in treating your specific issue.
            </p>
          </div>
        </div>
      </div>

      {/* Triage Assessment Form */}
      <TriageAssessment />
    </div>
  );
}
