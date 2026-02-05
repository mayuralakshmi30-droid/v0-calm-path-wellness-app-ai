"use client"

import { useState, useEffect } from "react"
import { useRouter, usePathname } from "next/navigation"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"
import {
  Home,
  SmilePlus,
  History,
  CheckSquare,
  MessageCircle,
  BookOpen,
  Gamepad2,
  BrainCircuit,
  User,
  Heart,
  ChevronRight,
  X,
} from "lucide-react"

const TOUR_STEPS = [
  {
    title: "Welcome to CalmPath!",
    description: "Let us take you on a quick tour of your mental wellness dashboard. Each feature is designed to support your journey.",
    icon: Home,
    color: "bg-primary/20 text-primary",
    route: "/dashboard",
  },
  {
    title: "Mood Tracker",
    description: "Log your daily emotions, stress, energy, sleep quality, and focus levels. Tracking patterns is the first step to understanding yourself better.",
    icon: SmilePlus,
    color: "bg-emerald-500/20 text-emerald-600",
    route: "/dashboard/mood-tracker",
  },
  {
    title: "Mood History",
    description: "View your mood trends over time with visual charts. Spot patterns, identify triggers, and share insights with your therapist.",
    icon: History,
    color: "bg-blue-500/20 text-blue-600",
    route: "/dashboard/mood-history",
  },
  {
    title: "Habit Tracker",
    description: "Build healthy habits like exercise, meditation, and sleep routines. Earn points for each completion and unlock therapy discounts with streaks!",
    icon: CheckSquare,
    color: "bg-violet-500/20 text-violet-600",
    route: "/dashboard/habit-tracker",
  },
  {
    title: "AI Chatbot",
    description: "Talk to our supportive AI companion anytime. It listens, offers coping strategies, and helps you navigate tough moments -- 24/7.",
    icon: MessageCircle,
    color: "bg-pink-500/20 text-pink-600",
    route: "/dashboard/chatbot",
  },
  {
    title: "Journal",
    description: "Write freely about your thoughts and feelings. Journaling is proven to improve emotional processing and reduce stress.",
    icon: BookOpen,
    color: "bg-amber-500/20 text-amber-600",
    route: "/dashboard/journal",
  },
  {
    title: "Relaxation Games",
    description: "Unwind with calming games designed to reduce anxiety. A healthy break that actually helps your mental health.",
    icon: Gamepad2,
    color: "bg-cyan-500/20 text-cyan-600",
    route: "/dashboard/games",
  },
  {
    title: "AI Behavioral Insights",
    description: "Your mood, habits, and therapy reports are analyzed weekly by AI to give you personalized recommendations and progress tracking.",
    icon: BrainCircuit,
    color: "bg-indigo-500/20 text-indigo-600",
    route: "/dashboard/ai-insights",
  },
  {
    title: "Your Profile",
    description: "View upcoming and completed sessions, payment history, and manage your account. Book your first free therapy session from the Home page!",
    icon: User,
    color: "bg-slate-500/20 text-slate-600",
    route: "/dashboard/profile",
  },
  {
    title: "Panic Intervention (PIM)",
    description: "See the button at the bottom-right? Tap it anytime you feel panicked. It provides guided breathing, grounding exercises, and crisis contacts instantly.",
    icon: Heart,
    color: "bg-rose-500/20 text-rose-600",
    route: "/dashboard",
  },
]

export function GuidedTour() {
  const [currentStep, setCurrentStep] = useState(-1) // -1 = not started / not showing
  const [isVisible, setIsVisible] = useState(false)
  const router = useRouter()
  const pathname = usePathname()

  useEffect(() => {
    // Check if this is a brand new signup (never seen tour)
    const tourDone = localStorage.getItem("calmpath_tour_done")
    const justSignedUp = localStorage.getItem("calmpath_just_signed_up")

    if (justSignedUp && !tourDone) {
      // Small delay so the dashboard loads first
      const timer = setTimeout(() => {
        setCurrentStep(0)
        setIsVisible(true)
      }, 800)
      return () => clearTimeout(timer)
    }
  }, [])

  // Navigate to the correct route when step changes
  useEffect(() => {
    if (currentStep >= 0 && currentStep < TOUR_STEPS.length) {
      const targetRoute = TOUR_STEPS[currentStep].route
      if (pathname !== targetRoute) {
        router.push(targetRoute)
      }
    }
  }, [currentStep, pathname, router])

  const nextStep = () => {
    if (currentStep < TOUR_STEPS.length - 1) {
      setCurrentStep((prev) => prev + 1)
    } else {
      finishTour()
    }
  }

  const finishTour = () => {
    setIsVisible(false)
    localStorage.setItem("calmpath_tour_done", "true")
    localStorage.removeItem("calmpath_just_signed_up")
    setCurrentStep(-1)
    router.push("/dashboard")
  }

  if (!isVisible || currentStep < 0) return null

  const step = TOUR_STEPS[currentStep]
  const Icon = step.icon
  const progress = ((currentStep + 1) / TOUR_STEPS.length) * 100

  return (
    <>
      {/* Overlay */}
      <div className="fixed inset-0 z-[90] bg-background/60 backdrop-blur-sm" />

      {/* Tour Bubble */}
      <div className="fixed z-[95] bottom-8 left-1/2 -translate-x-1/2 w-[calc(100%-2rem)] max-w-md animate-in fade-in slide-in-from-bottom-4 duration-300">
        <div className="bg-card border border-border rounded-2xl shadow-2xl overflow-hidden">
          {/* Progress bar */}
          <div className="h-1 bg-muted">
            <div
              className="h-full bg-primary transition-all duration-500 ease-out"
              style={{ width: `${progress}%` }}
            />
          </div>

          <div className="p-5">
            {/* Step counter */}
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs text-muted-foreground font-medium">
                {currentStep + 1} of {TOUR_STEPS.length}
              </span>
              <button
                onClick={finishTour}
                className="flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground transition-colors"
                aria-label="Skip tour"
              >
                Skip Tour
                <X className="w-3 h-3" />
              </button>
            </div>

            {/* Content */}
            <div className="flex items-start gap-4">
              <div className={cn("w-11 h-11 rounded-xl flex items-center justify-center shrink-0", step.color)}>
                <Icon className="w-5 h-5" />
              </div>
              <div className="flex-1 min-w-0">
                <h3 className="font-semibold text-foreground text-base mb-1">{step.title}</h3>
                <p className="text-sm text-muted-foreground leading-relaxed">{step.description}</p>
              </div>
            </div>

            {/* Actions */}
            <div className="flex items-center justify-between mt-4 pt-3 border-t border-border">
              <div className="flex gap-1">
                {TOUR_STEPS.map((_, i) => (
                  <div
                    key={i}
                    className={cn(
                      "w-1.5 h-1.5 rounded-full transition-colors",
                      i === currentStep ? "bg-primary" : i < currentStep ? "bg-primary/40" : "bg-muted-foreground/20"
                    )}
                  />
                ))}
              </div>
              <Button
                size="sm"
                onClick={nextStep}
                className="gap-1"
              >
                {currentStep < TOUR_STEPS.length - 1 ? (
                  <>
                    Next
                    <ChevronRight className="w-3.5 h-3.5" />
                  </>
                ) : (
                  "Get Started!"
                )}
              </Button>
            </div>
          </div>
        </div>
      </div>
    </>
  )
}
