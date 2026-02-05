"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { useApp, type MoodEntry } from "@/lib/app-context"
import { Star, Check, Frown, Meh, Smile, SmilePlus, Angry } from "lucide-react"
import { cn } from "@/lib/utils"

const questions = [
  { id: "stressLevel", label: "How stressed have you felt today?", lowLabel: "Very Calm", highLabel: "Very Stressed" },
  { id: "energyLevel", label: "How is your energy level?", lowLabel: "Very Low", highLabel: "Very High" },
  { id: "sleepQuality", label: "How well did you sleep last night?", lowLabel: "Very Poorly", highLabel: "Very Well" },
  { id: "focusLevel", label: "How focused have you been today?", lowLabel: "Very Unfocused", highLabel: "Very Focused" },
]

const moodEmojis = [
  { value: "very-sad" as const, icon: Angry, label: "Very Sad", color: "text-red-500 hover:text-red-600" },
  { value: "sad" as const, icon: Frown, label: "Sad", color: "text-orange-500 hover:text-orange-600" },
  { value: "neutral" as const, icon: Meh, label: "Neutral", color: "text-yellow-500 hover:text-yellow-600" },
  { value: "happy" as const, icon: Smile, label: "Happy", color: "text-lime-500 hover:text-lime-600" },
  { value: "very-happy" as const, icon: SmilePlus, label: "Very Happy", color: "text-green-500 hover:text-green-600" },
]

export default function MoodTrackerPage() {
  const router = useRouter()
  const { addMoodEntry } = useApp()
  const [currentStep, setCurrentStep] = useState(0)
  const [ratings, setRatings] = useState<Record<string, number>>({
    stressLevel: 0,
    energyLevel: 0,
    sleepQuality: 0,
    focusLevel: 0,
  })
  const [overallMood, setOverallMood] = useState<MoodEntry["overallMood"] | null>(null)
  const [isSubmitted, setIsSubmitted] = useState(false)

  const totalSteps = questions.length + 1 // 4 star ratings + 1 emoji selection

  const handleRating = (questionId: string, rating: number) => {
    setRatings((prev) => ({ ...prev, [questionId]: rating }))
  }

  const handleNext = () => {
    if (currentStep < totalSteps - 1) {
      setCurrentStep((prev) => prev + 1)
    }
  }

  const handleBack = () => {
    if (currentStep > 0) {
      setCurrentStep((prev) => prev - 1)
    }
  }

  const handleSubmit = () => {
    if (!overallMood) return

    addMoodEntry({
      date: new Date().toISOString().split("T")[0],
      stressLevel: ratings.stressLevel,
      energyLevel: ratings.energyLevel,
      sleepQuality: ratings.sleepQuality,
      focusLevel: ratings.focusLevel,
      overallMood,
    })

    setIsSubmitted(true)
  }

  const canProceed = currentStep < questions.length 
    ? ratings[questions[currentStep].id] > 0 
    : overallMood !== null

  if (isSubmitted) {
    return (
      <div className="max-w-xl mx-auto">
        <Card className="bg-card border-border">
          <CardContent className="py-12 text-center">
            <div className="w-20 h-20 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-6">
              <Check className="w-10 h-10 text-primary" />
            </div>
            <h2 className="text-2xl font-bold mb-2">Mood Logged!</h2>
            <p className="text-muted-foreground mb-6">
              Great job tracking your mood today. Keep it up!
            </p>
            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              <Button variant="outline" onClick={() => router.push("/dashboard/mood-history")}>
                View History
              </Button>
              <Button onClick={() => {
                setIsSubmitted(false)
                setCurrentStep(0)
                setRatings({ stressLevel: 0, energyLevel: 0, sleepQuality: 0, focusLevel: 0 })
                setOverallMood(null)
              }}>
                Log Another
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="max-w-xl mx-auto">
      <div className="mb-6">
        <h1 className="text-2xl lg:text-3xl font-bold text-foreground">Mood Tracker</h1>
        <p className="text-muted-foreground mt-1">Take a moment to check in with yourself</p>
      </div>

      {/* Progress */}
      <div className="mb-6">
        <div className="flex justify-between text-sm text-muted-foreground mb-2">
          <span>Question {currentStep + 1} of {totalSteps}</span>
          <span>{Math.round(((currentStep + 1) / totalSteps) * 100)}%</span>
        </div>
        <div className="h-2 bg-muted rounded-full overflow-hidden">
          <div 
            className="h-full bg-primary transition-all duration-300"
            style={{ width: `${((currentStep + 1) / totalSteps) * 100}%` }}
          />
        </div>
      </div>

      <Card className="bg-card border-border">
        {currentStep < questions.length ? (
          <>
            <CardHeader>
              <CardTitle className="text-xl">{questions[currentStep].label}</CardTitle>
              <CardDescription>
                Rate from 1 to 5 stars
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Star Rating */}
              <div className="flex justify-center gap-2">
                {[1, 2, 3, 4, 5].map((star) => (
                  <button
                    key={star}
                    onClick={() => handleRating(questions[currentStep].id, star)}
                    className="p-2 transition-transform hover:scale-110 focus:outline-none focus:ring-2 focus:ring-primary rounded-lg"
                    aria-label={`Rate ${star} stars`}
                  >
                    <Star
                      className={cn(
                        "w-10 h-10 transition-colors",
                        ratings[questions[currentStep].id] >= star
                          ? "fill-amber-400 text-amber-400"
                          : "text-muted-foreground/30"
                      )}
                    />
                  </button>
                ))}
              </div>

              {/* Labels */}
              <div className="flex justify-between text-sm text-muted-foreground">
                <span>{questions[currentStep].lowLabel}</span>
                <span>{questions[currentStep].highLabel}</span>
              </div>
            </CardContent>
          </>
        ) : (
          <>
            <CardHeader>
              <CardTitle className="text-xl">How are you feeling overall?</CardTitle>
              <CardDescription>
                Select the emoji that best represents your mood
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex justify-center gap-4">
                {moodEmojis.map(({ value, icon: Icon, label, color }) => (
                  <button
                    key={value}
                    onClick={() => setOverallMood(value)}
                    className={cn(
                      "p-3 rounded-xl transition-all focus:outline-none focus:ring-2 focus:ring-primary",
                      overallMood === value 
                        ? "bg-primary/10 ring-2 ring-primary scale-110" 
                        : "hover:bg-muted"
                    )}
                    aria-label={label}
                  >
                    <Icon className={cn("w-10 h-10", color)} />
                    <span className="sr-only">{label}</span>
                  </button>
                ))}
              </div>
              <div className="flex justify-between text-xs text-muted-foreground mt-4 px-2">
                <span>Very Sad</span>
                <span>Very Happy</span>
              </div>
            </CardContent>
          </>
        )}

        {/* Navigation */}
        <div className="p-6 pt-0 flex justify-between">
          <Button
            variant="outline"
            onClick={handleBack}
            disabled={currentStep === 0}
          >
            Back
          </Button>
          
          {currentStep === totalSteps - 1 ? (
            <Button onClick={handleSubmit} disabled={!canProceed}>
              Submit
            </Button>
          ) : (
            <Button onClick={handleNext} disabled={!canProceed}>
              Next
            </Button>
          )}
        </div>
      </Card>
    </div>
  )
}
