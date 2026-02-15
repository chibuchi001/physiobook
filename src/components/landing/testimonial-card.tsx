import { Star } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";

interface TestimonialCardProps {
  name: string;
  role: string;
  image: string;
  quote: string;
  rating: number;
}

export function TestimonialCard({
  name,
  role,
  image,
  quote,
  rating,
}: TestimonialCardProps) {
  return (
    <Card className="relative overflow-hidden border-0 shadow-lg">
      <CardContent className="p-6">
        {/* Rating */}
        <div className="flex gap-1 mb-4">
          {Array.from({ length: rating }).map((_, i) => (
            <Star
              key={i}
              className="w-5 h-5 fill-yellow-400 text-yellow-400"
            />
          ))}
        </div>

        {/* Quote */}
        <p className="text-gray-600 mb-6 leading-relaxed">&ldquo;{quote}&rdquo;</p>

        {/* Author */}
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-full bg-gradient-to-br from-physio-100 to-health-100 flex items-center justify-center text-physio-600 font-semibold">
            {name
              .split(" ")
              .map((n) => n[0])
              .join("")}
          </div>
          <div>
            <div className="font-semibold text-gray-900">{name}</div>
            <div className="text-sm text-gray-500">{role}</div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
