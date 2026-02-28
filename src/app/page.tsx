import Link from "next/link";
import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import {
  Activity,
  Brain,
  Calendar,
  Camera,
  CheckCircle2,
  Clock,
  Heart,
  LineChart,
  Shield,
  Sparkles,
  Stethoscope,
  Users,
  Video,
  Zap,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Navbar } from "@/components/landing/navbar";
import { FeatureCard } from "@/components/landing/feature-card";
import { TestimonialCard } from "@/components/landing/testimonial-card";
import { PricingCard } from "@/components/landing/pricing-card";
import { Footer } from "@/components/landing/footer";

export default async function HomePage() {
  const { userId } = await auth();

  if (userId) {
    redirect("/dashboard");
  }

  return (
    <div className="min-h-screen">
      <Navbar />

      {/* Hero Section */}
      <section className="relative hero-gradient pt-32 pb-20 overflow-hidden">
        <div className="absolute inset-0 bg-[url('/grid.svg')] bg-center [mask-image:linear-gradient(180deg,white,rgba(255,255,255,0))]" />

        <div className="container mx-auto px-4 relative z-10">
          <div className="max-w-4xl mx-auto text-center">
            <div className="inline-flex items-center gap-2 bg-physio-100 text-physio-700 px-4 py-2 rounded-full text-sm font-medium mb-6">
              <Sparkles className="w-4 h-4" />
              AI-Powered Healthcare Platform
            </div>
            <h1 className="text-5xl md:text-7xl font-bold text-gray-900 mb-6 leading-tight">
              Your Recovery,{" "}
              <span className="gradient-text">Reimagined</span>
            </h1>
            <p className="text-xl text-gray-600 mb-8 max-w-2xl mx-auto">
              Experience intelligent physiotherapy care with AI-powered triage,
              personalized therapist matching, progress tracking, and real-time
              exercise guidance.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link href="/sign-up">
                <Button
                  size="lg"
                  className="bg-physio-600 hover:bg-physio-700 text-lg px-8 py-6"
                >
                  Start Your Recovery
                  <Zap className="w-5 h-5 ml-2" />
                </Button>
              </Link>
              <Link href="#features">
                <Button size="lg" variant="outline" className="text-lg px-8 py-6">
                  See How It Works
                </Button>
              </Link>
            </div>
            <div className="mt-12 flex items-center justify-center gap-8 text-sm text-gray-500">
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-5 h-5 text-physio-500" />
                <span>HIPAA Compliant</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-5 h-5 text-physio-500" />
                <span>Licensed Therapists</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-5 h-5 text-physio-500" />
                <span>AI-Powered</span>
              </div>
            </div>
          </div>

          {/* Dashboard Preview */}
          <div className="mt-16 relative">
            <div className="relative mx-auto max-w-5xl">
              <div className="absolute -inset-4 bg-gradient-to-r from-physio-500/20 to-health-500/20 rounded-3xl blur-2xl" />
              <div className="relative bg-card border border-border rounded-2xl shadow-2xl overflow-hidden">
                <div className="bg-muted/50 dark:bg-muted/30 px-4 py-3 border-b border-border flex items-center gap-3">
                  <div className="flex gap-2">
                    <div className="w-3 h-3 rounded-full bg-red-500" />
                    <div className="w-3 h-3 rounded-full bg-yellow-500" />
                    <div className="w-3 h-3 rounded-full bg-green-500" />
                  </div>
                  <div className="flex-1 mx-4">
                    <div className="bg-background/50 rounded-md px-4 py-1.5 text-sm text-muted-foreground max-w-xs mx-auto text-center">
                      physiobook.app/dashboard
                    </div>
                  </div>
                </div>
                <div className="p-6 bg-background/50 dark:bg-background">
                  <div className="grid grid-cols-4 gap-4 mb-6">
                    {[
                      { label: "Appointments", value: "3" },
                      { label: "Exercises", value: "12" },
                      { label: "Pain Score", value: "2/10" },
                      { label: "Progress", value: "78%" },
                    ].map((stat) => (
                      <div
                        key={stat.label}
                        className="bg-card border border-border rounded-xl p-4 text-center"
                      >
                        <div className="text-2xl font-bold">{stat.value}</div>
                        <div className="text-sm text-muted-foreground">{stat.label}</div>
                      </div>
                    ))}
                  </div>
                  <div className="h-32 bg-gradient-to-t from-physio-500/20 to-transparent rounded-xl flex items-end justify-center pb-4">
                    <span className="text-sm text-muted-foreground">
                      Recovery Progress Chart
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-16 bg-white border-y border-gray-100">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {[
              { value: "50K+", label: "Patients Helped" },
              { value: "500+", label: "Expert Therapists" },
              { value: "95%", label: "Recovery Success" },
              { value: "4.9/5", label: "Patient Rating" },
            ].map((stat) => (
              <div key={stat.label} className="text-center">
                <div className="text-4xl font-bold gradient-text mb-2">
                  {stat.value}
                </div>
                <div className="text-gray-600">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-24 bg-gray-50">
        <div className="container mx-auto px-4">
          <div className="text-center max-w-3xl mx-auto mb-16">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">
              Intelligent Features for{" "}
              <span className="gradient-text">Better Outcomes</span>
            </h2>
            <p className="text-xl text-gray-600">
              Our AI-powered platform transforms every step of your physiotherapy journey.
            </p>
          </div>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            <FeatureCard
              icon={Brain}
              title="AI Triage & Assessment"
              description="Describe your symptoms and our AI instantly classifies your condition, determines urgency, and recommends the right specialist."
              gradient="from-purple-500 to-pink-500"
            />
            <FeatureCard
              icon={Users}
              title="Smart Therapist Matching"
              description="Get matched with the perfect therapist based on your condition, their specialties, availability, and historical success rates."
              gradient="from-blue-500 to-cyan-500"
            />
            <FeatureCard
              icon={LineChart}
              title="Progress Dashboard"
              description="Track your recovery with visual charts showing pain levels, mobility scores, and predicted recovery timeline."
              gradient="from-green-500 to-emerald-500"
            />
            <FeatureCard
              icon={Camera}
              title="AI Exercise Guidance"
              description="Use computer vision to get real-time feedback on your exercise form with pose detection and instant corrections."
              gradient="from-orange-500 to-red-500"
            />
            <FeatureCard
              icon={Calendar}
              title="Smart Scheduling"
              description="AI predicts no-show risk and optimizes appointment slots. Get intelligent reminders based on your behavior patterns."
              gradient="from-indigo-500 to-purple-500"
            />
            <FeatureCard
              icon={Video}
              title="Tele-Physio Sessions"
              description="Connect with your therapist through secure video calls. Continue your treatment from the comfort of home."
              gradient="from-teal-500 to-green-500"
            />
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section className="py-24 bg-white">
        <div className="container mx-auto px-4">
          <div className="text-center max-w-3xl mx-auto mb-16">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">
              Your Recovery Journey in{" "}
              <span className="gradient-text">4 Simple Steps</span>
            </h2>
          </div>
          <div className="max-w-5xl mx-auto">
            <div className="grid md:grid-cols-4 gap-8">
              {[
                {
                  step: "1",
                  icon: Stethoscope,
                  title: "Describe Symptoms",
                  description: "Tell us about your pain, affected area, and duration. Our AI analyzes your input.",
                },
                {
                  step: "2",
                  icon: Users,
                  title: "Get Matched",
                  description: "We recommend the best therapist for your specific condition and preferences.",
                },
                {
                  step: "3",
                  icon: Calendar,
                  title: "Book & Attend",
                  description: "Choose your slot, get reminders, and attend your session in-person or online.",
                },
                {
                  step: "4",
                  icon: Activity,
                  title: "Track Progress",
                  description: "Log your pain levels, complete exercises with AI guidance, and watch your recovery.",
                },
              ].map((item, index) => (
                <div key={item.step} className="relative">
                  {index < 3 && (
                    <div className="hidden md:block absolute top-10 left-full w-full h-0.5 bg-gradient-to-r from-physio-300 to-physio-100 -translate-x-1/2" />
                  )}
                  <div className="flex flex-col items-center text-center">
                    <div className="w-20 h-20 rounded-full bg-physio-100 flex items-center justify-center mb-4 relative">
                      <item.icon className="w-8 h-8 text-physio-600" />
                      <div className="absolute -top-2 -right-2 w-8 h-8 rounded-full bg-physio-600 text-white font-bold flex items-center justify-center text-sm">
                        {item.step}
                      </div>
                    </div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">
                      {item.title}
                    </h3>
                    <p className="text-gray-600 text-sm">{item.description}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Testimonials Section */}
      <section className="py-24 bg-gray-50">
        <div className="container mx-auto px-4">
          <div className="text-center max-w-3xl mx-auto mb-16">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">
              Trusted by <span className="gradient-text">Thousands</span>
            </h2>
            <p className="text-xl text-gray-600">
              See what our patients say about their recovery journey.
            </p>
          </div>
          <div className="grid md:grid-cols-3 gap-8 max-w-6xl mx-auto">
            <TestimonialCard
              name="Sarah Mitchell"
              role="Marathon Runner"
              image="/testimonials/sarah.jpg"
              quote="The AI exercise guidance helped me recover from my knee injury 40% faster than expected. The pose detection caught form issues I didn't even know I had!"
              rating={5}
            />
            <TestimonialCard
              name="James Chen"
              role="Software Developer"
              image="/testimonials/james.jpg"
              quote="After years of back pain from desk work, the smart triage connected me with a specialist who finally understood my condition. The progress dashboard kept me motivated."
              rating={5}
            />
            <TestimonialCard
              name="Maria Rodriguez"
              role="Yoga Instructor"
              image="/testimonials/maria.jpg"
              quote="The tele-physio feature was a game-changer during my recovery. I could continue my sessions while traveling. The AI matching found me the perfect therapist."
              rating={5}
            />
          </div>
        </div>
      </section>

      {/* Pricing Section */}
      <section id="pricing" className="py-24 bg-white">
        <div className="container mx-auto px-4">
          <div className="text-center max-w-3xl mx-auto mb-16">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">
              Simple, Transparent{" "}
              <span className="gradient-text">Pricing</span>
            </h2>
            <p className="text-xl text-gray-600">
              Choose the plan that fits your recovery needs.
            </p>
          </div>
          <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto">
            <PricingCard
              name="Free"
              price="$0"
              description="Get started with basic features"
              features={[
                "2 appointments per month",
                "Basic triage assessment",
                "Therapist directory access",
                "Email reminders",
                "Basic progress tracking",
              ]}
              buttonText="Get Started"
              buttonVariant="outline"
            />
            <PricingCard
              name="Basic"
              price="$29"
              description="Perfect for active recovery"
              features={[
                "10 appointments per month",
                "AI-powered triage",
                "Smart therapist matching",
                "Progress dashboard",
                "SMS reminders",
                "Tele-physio sessions",
              ]}
              buttonText="Start Basic"
              popular
            />
            <PricingCard
              name="Pro"
              price="$79"
              description="Complete recovery experience"
              features={[
                "Unlimited appointments",
                "Priority AI triage",
                "VIP therapist matching",
                "Advanced analytics",
                "AI exercise guidance",
                "Voice agent support",
                "Family account (up to 4)",
              ]}
              buttonText="Go Pro"
              buttonVariant="outline"
            />
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-24 bg-gradient-to-br from-physio-600 to-health-600">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-4xl font-bold text-white mb-4">
            Ready to Start Your Recovery?
          </h2>
          <p className="text-xl text-white/80 mb-8 max-w-2xl mx-auto">
            Join thousands of patients who have transformed their recovery
            journey with PhysioBook.
          </p>
          <Link href="/sign-up">
            <Button size="lg" variant="secondary" className="text-lg px-8 py-6">
              Create Free Account
              <Heart className="w-5 h-5 ml-2" />
            </Button>
          </Link>
        </div>
      </section>

      {/* Trust Section */}
      <section className="py-16 bg-white border-t border-gray-100">
        <div className="container mx-auto px-4">
          <div className="flex flex-wrap items-center justify-center gap-12">
            <div className="flex items-center gap-3 text-gray-400">
              <Shield className="w-8 h-8" />
              <span className="font-semibold">HIPAA Compliant</span>
            </div>
            <div className="flex items-center gap-3 text-gray-400">
              <CheckCircle2 className="w-8 h-8" />
              <span className="font-semibold">Licensed Professionals</span>
            </div>
            <div className="flex items-center gap-3 text-gray-400">
              <Clock className="w-8 h-8" />
              <span className="font-semibold">24/7 Support</span>
            </div>
            <div className="flex items-center gap-3 text-gray-400">
              <Zap className="w-8 h-8" />
              <span className="font-semibold">AI-Powered</span>
            </div>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}
