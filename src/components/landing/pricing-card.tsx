import { Check } from "lucide-react";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import Link from "next/link";

interface PricingCardProps {
  name: string;
  price: string;
  description: string;
  features: string[];
  buttonText: string;
  buttonVariant?: "default" | "outline";
  popular?: boolean;
}

export function PricingCard({
  name,
  price,
  description,
  features,
  buttonText,
  buttonVariant = "default",
  popular = false,
}: PricingCardProps) {
  return (
    <Card
      className={cn(
        "relative overflow-hidden border-2 transition-all duration-300 hover:shadow-xl",
        popular
          ? "border-physio-500 shadow-lg scale-105"
          : "border-gray-200 hover:-translate-y-1"
      )}
    >
      {popular && (
        <div className="absolute top-0 right-0 bg-physio-500 text-white text-xs font-semibold px-3 py-1 rounded-bl-lg">
          Most Popular
        </div>
      )}

      <CardHeader className="text-center pb-2">
        <h3 className="text-xl font-semibold text-gray-900">{name}</h3>
        <div className="mt-4">
          <span className="text-4xl font-bold text-gray-900">{price}</span>
          {price !== "$0" && (
            <span className="text-gray-500 ml-1">/month</span>
          )}
        </div>
        <p className="text-gray-600 mt-2">{description}</p>
      </CardHeader>

      <CardContent className="pt-4">
        <ul className="space-y-3 mb-6">
          {features.map((feature) => (
            <li key={feature} className="flex items-start gap-3">
              <div className="w-5 h-5 rounded-full bg-physio-100 flex items-center justify-center flex-shrink-0 mt-0.5">
                <Check className="w-3 h-3 text-physio-600" />
              </div>
              <span className="text-gray-600 text-sm">{feature}</span>
            </li>
          ))}
        </ul>

        <Link href="/sign-up" className="block">
          <Button
            className={cn(
              "w-full",
              popular
                ? "bg-physio-600 hover:bg-physio-700"
                : buttonVariant === "outline"
                ? ""
                : "bg-physio-600 hover:bg-physio-700"
            )}
            variant={popular ? "default" : buttonVariant}
          >
            {buttonText}
          </Button>
        </Link>
      </CardContent>
    </Card>
  );
}
