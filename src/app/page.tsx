"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useAuth } from "@clerk/nextjs";
import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Activity, ArrowRight, Brain, Calendar, Camera, CheckCircle, ChevronRight,
  Heart, MessageSquare, Moon, Play, Shield, Sparkles, Star, Sun, TrendingUp,
  Users, Video, Zap, X,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { useTheme } from "@/hooks/use-theme";

const FEATURES = [
  {
    id: "triage",
    icon: Brain,
    title: "AI-Powered Triage",
    description: "Describe your symptoms and get instant AI analysis with urgency classification.",
    color: "from-purple-500 to-indigo-500",
    darkColor: "from-purple-600 to-indigo-600",
    benefits: ["Red flag detection", "Urgency scoring", "Specialist matching"],
    route: "/book",
    preview: {
      title: "Smart Symptom Analysis",
      stats: [
        { label: "Accuracy", value: "94%" },
        { label: "Red Flags", value: "0" },
        { label: "Urgency", value: "Moderate" },
      ],
    },
  },
  {
    id: "matching",
    icon: Users,
    title: "Smart Therapist Matching",
    description: "Find the perfect therapist based on your condition and preferences.",
    color: "from-blue-500 to-cyan-500",
    darkColor: "from-blue-600 to-cyan-600",
    benefits: ["Success rate analysis", "Location preferences", "Rating-based"],
    route: "/therapists",
    preview: {
      title: "Top Matches",
      stats: [
        { label: "Match Score", value: "95%" },
        { label: "Available", value: "Today" },
        { label: "Rating", value: "4.9★" },
      ],
    },
  },
  {
    id: "progress",
    icon: TrendingUp,
    title: "Progress Dashboard",
    description: "Track your recovery with visual charts and AI-powered insights.",
    color: "from-green-500 to-emerald-500",
    darkColor: "from-green-600 to-emerald-600",
    benefits: ["Pain tracking", "Mobility scores", "AI predictions"],
    route: "/progress",
    preview: {
      title: "Your Progress",
      stats: [
        { label: "Pain Level", value: "↓ 40%" },
        { label: "Mobility", value: "↑ 25%" },
        { label: "Goal", value: "78%" },
      ],
    },
  },
  {
    id: "exercise",
    icon: Camera,
    title: "AI Exercise Guidance",
    description: "Real-time pose detection guides your exercises with instant feedback.",
    color: "from-orange-500 to-amber-500",
    darkColor: "from-orange-600 to-amber-600",
    benefits: ["Form scoring", "Voice feedback", "Rep counting"],
    route: "/exercises",
    preview: {
      title: "Exercise Session",
      stats: [
        { label: "Form Score", value: "92%" },
        { label: "Reps Done", value: "8/10" },
        { label: "Calories", value: "45" },
      ],
    },
  },
  {
    id: "scheduling",
    icon: Calendar,
    title: "Smart Scheduling",
    description: "No-show prediction helps optimize appointments with smart reminders.",
    color: "from-pink-500 to-rose-500",
    darkColor: "from-pink-600 to-rose-600",
    benefits: ["Risk prediction", "Auto reminders", "Overbooking"],
    route: "/appointments",
    preview: {
      title: "Upcoming",
      stats: [
        { label: "Next", value: "2 days" },
        { label: "This Month", value: "3" },
        { label: "Completed", value: "12" },
      ],
    },
  },
  {
    id: "telephysio",
    icon: Video,
    title: "Tele-Physio Sessions",
    description: "Secure video consultations with screen sharing for demos.",
    color: "from-teal-500 to-cyan-500",
    darkColor: "from-teal-600 to-cyan-600",
    benefits: ["HD video", "Screen share", "In-call chat"],
    route: "/tele-physio",
    preview: {
      title: "Video Call",
      stats: [
        { label: "Quality", value: "HD" },
        { label: "Encrypted", value: "Yes" },
        { label: "Duration", value: "45min" },
      ],
    },
  },
];

const TESTIMONIALS = [
  { name: "Sarah Mitchell", role: "Marathon Runner", content: "The AI exercise guidance helped me recover from my knee injury 40% faster!", rating: 5 },
  { name: "James Chen", role: "Office Professional", content: "Finally found a therapist who specializes in chronic back pain. Amazing!", rating: 5 },
  { name: "Maria Garcia", role: "Fitness Instructor", content: "The tele-physio feature saved me so much time. Sessions from anywhere!", rating: 5 },
];

export default function LandingPage() {
  const router = useRouter();
  const { isSignedIn } = useAuth();
  const { toggleTheme, isDark } = useTheme();
  const [hoveredFeature, setHoveredFeature] = useState<string | null>(null);
  const [showPreview, setShowPreview] = useState<string | null>(null);

  const handleFeatureClick = (route: string) => {
    if (!isSignedIn) {
      router.push("/sign-up");
    } else {
      router.push(route);
    }
  };

  return (
    <div className="min-h-screen bg-background text-foreground transition-colors duration-300">
      {/* Navigation */}
      <nav className="fixed top-0 left-0 right-0 z-50 bg-background/80 backdrop-blur-xl border-b border-border">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <Link href="/" className="flex items-center gap-2 cursor-pointer">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-physio-500 to-health-500 flex items-center justify-center">
                <Activity className="w-6 h-6 text-white" />
              </div>
              <span className="text-xl font-bold">PhysioBook</span>
            </Link>

            <div className="hidden md:flex items-center gap-8">
              <a href="#features" className="text-muted-foreground hover:text-foreground transition-colors">Features</a>
              <a href="#how-it-works" className="text-muted-foreground hover:text-foreground transition-colors">How It Works</a>
              <a href="#testimonials" className="text-muted-foreground hover:text-foreground transition-colors">Testimonials</a>
              <a href="#pricing" className="text-muted-foreground hover:text-foreground transition-colors">Pricing</a>
            </div>

            <div className="flex items-center gap-3">
              <Button variant="ghost" size="icon" onClick={toggleTheme} className="rounded-full">
                {isDark ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
              </Button>

              {isSignedIn ? (
                <Link href="/dashboard">
                  <Button className="bg-gradient-to-r from-physio-500 to-health-500 hover:from-physio-600 hover:to-health-600 text-white">
                    Dashboard <ChevronRight className="w-4 h-4 ml-1" />
                  </Button>
                </Link>
              ) : (
                <>
                  <Link href="/sign-in"><Button variant="ghost">Sign In</Button></Link>
                  <Link href="/sign-up">
                    <Button className="bg-gradient-to-r from-physio-500 to-health-500 hover:from-physio-600 hover:to-health-600 text-white">Get Started</Button>
                  </Link>
                </>
              )}
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="pt-32 pb-20 px-4 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-physio-500/10 via-transparent to-health-500/10" />
        <div className="absolute inset-0 bg-[url('/grid.svg')] opacity-20 dark:opacity-10" />

        <div className="max-w-7xl mx-auto relative">
          <div className="text-center max-w-4xl mx-auto">
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
              <span className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-physio-500/10 text-physio-600 dark:text-physio-400 text-sm font-medium mb-6">
                <Sparkles className="w-4 h-4" /> AI-Powered Healthcare Platform
              </span>
            </motion.div>

            <motion.h1 initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, delay: 0.1 }} className="text-5xl md:text-7xl font-bold mb-6">
              Your Recovery, <span className="bg-gradient-to-r from-physio-500 to-health-500 bg-clip-text text-transparent">Reimagined</span>
            </motion.h1>

            <motion.p initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, delay: 0.2 }} className="text-xl text-muted-foreground mb-8 max-w-2xl mx-auto">
              Experience intelligent physiotherapy with AI triage, smart therapist matching, real-time exercise guidance, and comprehensive progress tracking.
            </motion.p>

            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, delay: 0.3 }} className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <Link href={isSignedIn ? "/dashboard" : "/sign-up"}>
                <Button size="lg" className="bg-gradient-to-r from-physio-500 to-health-500 hover:from-physio-600 hover:to-health-600 text-white px-8">
                  {isSignedIn ? "Go to Dashboard" : "Start Free Trial"} <ArrowRight className="w-5 h-5 ml-2" />
                </Button>
              </Link>
              <Button size="lg" variant="outline" className="px-8"><Play className="w-5 h-5 mr-2" /> Watch Demo</Button>
            </motion.div>

            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.5, delay: 0.5 }} className="mt-12 flex flex-wrap items-center justify-center gap-8 text-sm text-muted-foreground">
              <div className="flex items-center gap-2"><Shield className="w-5 h-5 text-physio-500" /><span>HIPAA Compliant</span></div>
              <div className="flex items-center gap-2"><Users className="w-5 h-5 text-physio-500" /><span>10,000+ Patients</span></div>
              <div className="flex items-center gap-2"><Star className="w-5 h-5 text-yellow-500" /><span>4.9/5 Rating</span></div>
            </motion.div>
          </div>

          {/* Dashboard Preview */}
          <motion.div initial={{ opacity: 0, y: 40 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.7, delay: 0.4 }} className="mt-16 relative">
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
                    <div className="bg-background/50 rounded-md px-4 py-1.5 text-sm text-muted-foreground max-w-xs">physiobook.app/dashboard</div>
                  </div>
                </div>

                <div className="p-6 bg-background/50 dark:bg-background">
                  <div className="grid grid-cols-4 gap-4 mb-6">
                    {[
                      { label: "Appointments", value: "3", icon: Calendar, color: "bg-blue-500/10 text-blue-500 dark:bg-blue-500/20" },
                      { label: "Exercises", value: "12", icon: Activity, color: "bg-green-500/10 text-green-500 dark:bg-green-500/20" },
                      { label: "Pain Score", value: "2/10", icon: Heart, color: "bg-red-500/10 text-red-500 dark:bg-red-500/20" },
                      { label: "Progress", value: "78%", icon: TrendingUp, color: "bg-purple-500/10 text-purple-500 dark:bg-purple-500/20" },
                    ].map((stat) => (
                      <div key={stat.label} className="bg-card border border-border rounded-xl p-4">
                        <div className={`w-10 h-10 rounded-lg ${stat.color} flex items-center justify-center mb-3`}>
                          <stat.icon className="w-5 h-5" />
                        </div>
                        <div className="text-2xl font-bold">{stat.value}</div>
                        <div className="text-sm text-muted-foreground">{stat.label}</div>
                      </div>
                    ))}
                  </div>

                  <div className="grid grid-cols-3 gap-4">
                    <div className="col-span-2 bg-card border border-border rounded-xl p-4">
                      <div className="flex items-center justify-between mb-4">
                        <h3 className="font-semibold">Recovery Progress</h3>
                        <span className="text-sm text-muted-foreground">Last 30 days</span>
                      </div>
                      <div className="h-32 flex items-end gap-2">
                        {[40, 55, 45, 60, 70, 65, 75, 80, 78, 82, 85, 88].map((height, i) => (
                          <div key={i} className="flex-1 bg-gradient-to-t from-physio-500 to-health-500 rounded-t-md transition-all hover:opacity-80" style={{ height: `${height}%` }} />
                        ))}
                      </div>
                    </div>
                    <div className="bg-card border border-border rounded-xl p-4">
                      <h3 className="font-semibold mb-4">Next Appointment</h3>
                      <div className="flex items-center gap-3 p-3 bg-muted/50 rounded-lg">
                        <div className="w-12 h-12 rounded-full bg-physio-500/10 flex items-center justify-center">
                          <Users className="w-6 h-6 text-physio-500" />
                        </div>
                        <div>
                          <div className="font-medium">Dr. Sarah Johnson</div>
                          <div className="text-sm text-muted-foreground">Tomorrow, 10:00 AM</div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-20 px-4 bg-muted/30 dark:bg-muted/10">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <span className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-physio-500/10 text-physio-600 dark:text-physio-400 text-sm font-medium mb-4">
              <Zap className="w-4 h-4" /> Powerful Features
            </span>
            <h2 className="text-4xl md:text-5xl font-bold mb-4">
              Everything You Need to <span className="bg-gradient-to-r from-physio-500 to-health-500 bg-clip-text text-transparent">Recover Faster</span>
            </h2>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              Our AI-powered platform combines cutting-edge technology with healthcare expertise.
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {FEATURES.map((feature, index) => (
              <motion.div
                key={feature.id}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                viewport={{ once: true }}
                onMouseEnter={() => setHoveredFeature(feature.id)}
                onMouseLeave={() => setHoveredFeature(null)}
                onClick={() => handleFeatureClick(feature.route)}
                className="group relative cursor-pointer"
              >
                <div className="relative bg-card border border-border rounded-2xl p-6 h-full hover:border-physio-500/50 transition-all duration-300 hover:shadow-xl hover:shadow-physio-500/10 dark:hover:shadow-physio-500/5 overflow-hidden">
                  <div className={`absolute inset-0 bg-gradient-to-br ${isDark ? feature.darkColor : feature.color} opacity-0 group-hover:opacity-5 transition-opacity duration-300`} />

                  <div className="relative">
                    <div className={`w-14 h-14 rounded-xl bg-gradient-to-br ${feature.color} flex items-center justify-center mb-4 group-hover:scale-110 transition-transform`}>
                      <feature.icon className="w-7 h-7 text-white" />
                    </div>

                    <h3 className="text-xl font-semibold mb-2">{feature.title}</h3>
                    <p className="text-muted-foreground mb-4">{feature.description}</p>

                    <ul className="space-y-2 mb-4">
                      {feature.benefits.map((benefit) => (
                        <li key={benefit} className="flex items-center gap-2 text-sm">
                          <CheckCircle className="w-4 h-4 text-physio-500" />
                          <span>{benefit}</span>
                        </li>
                      ))}
                    </ul>

                    <div className="flex items-center gap-1 text-physio-500 group-hover:gap-2 transition-all">
                      <span className="text-sm font-medium">{isSignedIn ? "Try Now" : "Get Started"}</span>
                      <ArrowRight className="w-4 h-4" />
                    </div>
                  </div>

                  {/* Feature Preview Popup */}
                  <AnimatePresence>
                    {hoveredFeature === feature.id && (
                      <motion.div
                        initial={{ opacity: 0, scale: 0.9, y: 10 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.9, y: 10 }}
                        className="absolute bottom-4 left-4 right-4 bg-background/95 dark:bg-card/95 backdrop-blur-sm border border-border rounded-xl p-4 shadow-xl z-10"
                      >
                        <div className="flex items-center justify-between mb-3">
                          <span className="text-sm font-semibold">{feature.preview.title}</span>
                          <Sparkles className="w-4 h-4 text-physio-500" />
                        </div>
                        <div className="grid grid-cols-3 gap-2">
                          {feature.preview.stats.map((stat) => (
                            <div key={stat.label} className="text-center p-2 bg-muted/50 rounded-lg">
                              <div className="text-lg font-bold text-physio-500">{stat.value}</div>
                              <div className="text-xs text-muted-foreground">{stat.label}</div>
                            </div>
                          ))}
                        </div>
                        <p className="text-xs text-center text-muted-foreground mt-3">
                          {isSignedIn ? "Click to open" : "Sign up to access"}
                        </p>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section id="how-it-works" className="py-20 px-4">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold mb-4">How It Works</h2>
            <p className="text-xl text-muted-foreground">Get started with PhysioBook in 3 simple steps</p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {[
              { step: "1", title: "Describe Your Symptoms", description: "Tell us about your condition and our AI will analyze your symptoms and determine urgency.", icon: MessageSquare },
              { step: "2", title: "Get Matched", description: "Our smart algorithm finds the perfect therapist based on your condition and preferences.", icon: Users },
              { step: "3", title: "Start Recovery", description: "Book appointments, track progress, and get AI-guided exercises to accelerate recovery.", icon: TrendingUp },
            ].map((item, index) => (
              <motion.div key={item.step} initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, delay: index * 0.2 }} viewport={{ once: true }} className="relative">
                <div className="bg-card border border-border rounded-2xl p-8 text-center h-full hover:border-physio-500/50 transition-colors">
                  <div className="w-16 h-16 rounded-full bg-gradient-to-br from-physio-500 to-health-500 flex items-center justify-center text-white text-2xl font-bold mx-auto mb-6">{item.step}</div>
                  <h3 className="text-xl font-semibold mb-3">{item.title}</h3>
                  <p className="text-muted-foreground">{item.description}</p>
                </div>
                {index < 2 && <div className="hidden md:block absolute top-1/2 -right-4 w-8 h-0.5 bg-border" />}
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section id="testimonials" className="py-20 px-4 bg-muted/30 dark:bg-muted/10">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold mb-4">Loved by Thousands</h2>
            <p className="text-xl text-muted-foreground">See what our patients say about PhysioBook</p>
          </div>

          <div className="grid md:grid-cols-3 gap-6">
            {TESTIMONIALS.map((testimonial, index) => (
              <motion.div key={testimonial.name} initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, delay: index * 0.1 }} viewport={{ once: true }} className="bg-card border border-border rounded-2xl p-6">
                <div className="flex items-center gap-1 mb-4">
                  {Array.from({ length: testimonial.rating }).map((_, i) => (<Star key={i} className="w-5 h-5 text-yellow-500 fill-yellow-500" />))}
                </div>
                <p className="text-lg mb-6">&ldquo;{testimonial.content}&rdquo;</p>
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-full bg-gradient-to-br from-physio-500 to-health-500 flex items-center justify-center text-white font-bold">{testimonial.name.charAt(0)}</div>
                  <div>
                    <div className="font-semibold">{testimonial.name}</div>
                    <div className="text-sm text-muted-foreground">{testimonial.role}</div>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Pricing */}
      <section id="pricing" className="py-20 px-4">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold mb-4">Simple, Transparent Pricing</h2>
            <p className="text-xl text-muted-foreground">Choose the plan that fits your needs</p>
          </div>

          <div className="grid md:grid-cols-3 gap-6 max-w-5xl mx-auto">
            {[
              { name: "Free", price: "$0", description: "Perfect for trying out", features: ["2 appointments/month", "Basic triage", "Email reminders"], cta: "Get Started", popular: false },
              { name: "Pro", price: "$29", description: "Most popular choice", features: ["10 appointments/month", "AI-powered triage", "Smart matching", "Tele-physio sessions", "AI exercise guidance"], cta: "Start Free Trial", popular: true },
              { name: "Enterprise", price: "$79", description: "For power users", features: ["Unlimited appointments", "Priority AI triage", "VIP therapist matching", "Voice agent support", "Family accounts (4)"], cta: "Contact Sales", popular: false },
            ].map((plan, index) => (
              <motion.div key={plan.name} initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, delay: index * 0.1 }} viewport={{ once: true }} className={`relative bg-card border rounded-2xl p-8 ${plan.popular ? "border-physio-500 scale-105 shadow-xl shadow-physio-500/10" : "border-border"}`}>
                {plan.popular && <div className="absolute -top-4 left-1/2 -translate-x-1/2 px-4 py-1 bg-gradient-to-r from-physio-500 to-health-500 text-white text-sm font-medium rounded-full">Most Popular</div>}
                <h3 className="text-xl font-semibold mb-2">{plan.name}</h3>
                <p className="text-muted-foreground mb-4">{plan.description}</p>
                <div className="mb-6"><span className="text-4xl font-bold">{plan.price}</span>{plan.price !== "$0" && <span className="text-muted-foreground">/month</span>}</div>
                <ul className="space-y-3 mb-8">
                  {plan.features.map((feature) => (<li key={feature} className="flex items-center gap-2"><CheckCircle className="w-5 h-5 text-physio-500" /><span>{feature}</span></li>))}
                </ul>
                <Link href={isSignedIn ? "/dashboard" : "/sign-up"}>
                  <Button className={`w-full ${plan.popular ? "bg-gradient-to-r from-physio-500 to-health-500 hover:from-physio-600 hover:to-health-600 text-white" : ""}`} variant={plan.popular ? "default" : "outline"}>{plan.cta}</Button>
                </Link>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 px-4">
        <div className="max-w-4xl mx-auto text-center">
          <motion.div initial={{ opacity: 0, scale: 0.95 }} whileInView={{ opacity: 1, scale: 1 }} transition={{ duration: 0.5 }} viewport={{ once: true }} className="bg-gradient-to-br from-physio-500 to-health-500 rounded-3xl p-12 text-white">
            <h2 className="text-4xl font-bold mb-4">Ready to Start Your Recovery?</h2>
            <p className="text-xl opacity-90 mb-8">Join thousands of patients recovering faster with PhysioBook&apos;s AI-powered platform.</p>
            <Link href={isSignedIn ? "/dashboard" : "/sign-up"}>
              <Button size="lg" className="bg-white text-physio-600 hover:bg-gray-100 px-8">{isSignedIn ? "Go to Dashboard" : "Get Started for Free"} <ArrowRight className="w-5 h-5 ml-2" /></Button>
            </Link>
          </motion.div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-12 px-4 border-t border-border bg-muted/30 dark:bg-muted/10">
        <div className="max-w-7xl mx-auto">
          <div className="grid md:grid-cols-4 gap-8 mb-8">
            <div>
              <Link href="/" className="flex items-center gap-2 mb-4">
                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-physio-500 to-health-500 flex items-center justify-center"><Activity className="w-6 h-6 text-white" /></div>
                <span className="text-xl font-bold">PhysioBook</span>
              </Link>
              <p className="text-muted-foreground text-sm">AI-powered physiotherapy platform for faster, smarter recovery.</p>
            </div>
            <div>
              <h4 className="font-semibold mb-4">Product</h4>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li><a href="#features" className="hover:text-foreground">Features</a></li>
                <li><a href="#pricing" className="hover:text-foreground">Pricing</a></li>
                <li><a href="#" className="hover:text-foreground">For Therapists</a></li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold mb-4">Company</h4>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li><a href="#" className="hover:text-foreground">About Us</a></li>
                <li><a href="#" className="hover:text-foreground">Blog</a></li>
                <li><a href="#" className="hover:text-foreground">Careers</a></li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold mb-4">Legal</h4>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li><a href="#" className="hover:text-foreground">Privacy Policy</a></li>
                <li><a href="#" className="hover:text-foreground">Terms of Service</a></li>
                <li><a href="#" className="hover:text-foreground">HIPAA Compliance</a></li>
              </ul>
            </div>
          </div>
          <div className="pt-8 border-t border-border flex flex-col md:flex-row items-center justify-between gap-4">
            <p className="text-sm text-muted-foreground">© 2024 PhysioBook. All rights reserved.</p>
            <div className="flex items-center gap-4">
              <Shield className="w-5 h-5 text-physio-500" />
              <span className="text-sm text-muted-foreground">HIPAA Compliant • SOC 2 Certified</span>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
