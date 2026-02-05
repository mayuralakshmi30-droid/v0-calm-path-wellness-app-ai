"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { ArrowLeft, Play, Pause, RotateCcw } from "lucide-react"
import { cn } from "@/lib/utils"

type Phase = "inhale" | "hold" | "exhale" | "rest"

const breathingPatterns = {
  relaxing: { name: "4-7-8 Relaxing", inhale: 4, hold: 7, exhale: 8, rest: 0 },
  box: { name: "Box Breathing", inhale: 4, hold: 4, exhale: 4, rest: 4 },
  energizing: { name: "Energizing", inhale: 6, hold: 0, exhale: 2, rest: 0 },
}

export default function BreathingPage() {
  const [isActive, setIsActive] = useState(false)
  const [pattern, setPattern] = useState<keyof typeof breathingPatterns>("relaxing")
  const [phase, setPhase] = useState<Phase>("inhale")
  const [timer, setTimer] = useState(0)
  const [cycles, setCycles] = useState(0)

  const currentPattern = breathingPatterns[pattern]

  const getPhaseTime = (p: Phase) => {
    switch (p) {
      case "inhale": return currentPattern.inhale
      case "hold": return currentPattern.hold
      case "exhale": return currentPattern.exhale
      case "rest": return currentPattern.rest
    }
  }

  const getNextPhase = (p: Phase): Phase => {
    if (p === "inhale") return currentPattern.hold > 0 ? "hold" : "exhale"
    if (p === "hold") return "exhale"
    if (p === "exhale") return currentPattern.rest > 0 ? "rest" : "inhale"
    return "inhale"
  }

  useEffect(() => {
    if (!isActive) return

    const phaseTime = getPhaseTime(phase)
    if (phaseTime === 0) {
      setPhase(getNextPhase(phase))
      return
    }

    setTimer(phaseTime)

    const interval = setInterval(() => {
      setTimer((prev) => {
        if (prev <= 1) {
          const nextPhase = getNextPhase(phase)
          setPhase(nextPhase)
          if (nextPhase === "inhale") {
            setCycles((c) => c + 1)
          }
          return getPhaseTime(nextPhase)
        }
        return prev - 1
      })
    }, 1000)

    return () => clearInterval(interval)
  }, [isActive, phase, pattern])

  const handleReset = () => {
    setIsActive(false)
    setPhase("inhale")
    setTimer(currentPattern.inhale)
    setCycles(0)
  }

  const getPhaseText = () => {
    switch (phase) {
      case "inhale": return "Breathe In"
      case "hold": return "Hold"
      case "exhale": return "Breathe Out"
      case "rest": return "Rest"
    }
  }

  const getCircleScale = () => {
    if (phase === "inhale") return "scale-100"
    if (phase === "exhale") return "scale-75"
    return "scale-90"
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" asChild>
          <Link href="/dashboard/games">
            <ArrowLeft className="w-5 h-5" />
          </Link>
        </Button>
        <div>
          <h1 className="text-2xl font-bold text-foreground">Breathing Exercise</h1>
          <p className="text-muted-foreground">Follow the circle and breathe</p>
        </div>
      </div>

      {/* Pattern Selection */}
      <div className="flex flex-wrap gap-2">
        {Object.entries(breathingPatterns).map(([key, p]) => (
          <Button
            key={key}
            variant={pattern === key ? "default" : "outline"}
            size="sm"
            onClick={() => {
              setPattern(key as keyof typeof breathingPatterns)
              handleReset()
            }}
            disabled={isActive}
            className={pattern !== key ? "bg-transparent" : ""}
          >
            {p.name}
          </Button>
        ))}
      </div>

      {/* Main Breathing Circle */}
      <Card className="bg-card border-border">
        <CardContent className="p-8">
          <div className="flex flex-col items-center justify-center min-h-[400px]">
            <div className="relative">
              <div
                className={cn(
                  "w-48 h-48 sm:w-64 sm:h-64 rounded-full bg-primary/20 flex items-center justify-center transition-transform duration-1000 ease-in-out",
                  isActive && getCircleScale()
                )}
              >
                <div
                  className={cn(
                    "w-36 h-36 sm:w-48 sm:h-48 rounded-full bg-primary/40 flex items-center justify-center transition-transform duration-1000 ease-in-out",
                    isActive && getCircleScale()
                  )}
                >
                  <div
                    className={cn(
                      "w-24 h-24 sm:w-32 sm:h-32 rounded-full bg-primary flex items-center justify-center text-primary-foreground transition-transform duration-1000 ease-in-out",
                      isActive && getCircleScale()
                    )}
                  >
                    <div className="text-center">
                      <p className="text-2xl sm:text-4xl font-bold">{isActive ? timer : "—"}</p>
                      <p className="text-xs sm:text-sm opacity-80">
                        {isActive ? getPhaseText() : "Ready"}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div className="mt-8 flex items-center gap-4">
              <Button
                size="lg"
                onClick={() => setIsActive(!isActive)}
                className="min-w-[120px]"
              >
                {isActive ? (
                  <>
                    <Pause className="w-5 h-5 mr-2" />
                    Pause
                  </>
                ) : (
                  <>
                    <Play className="w-5 h-5 mr-2" />
                    Start
                  </>
                )}
              </Button>
              <Button variant="outline" size="lg" onClick={handleReset} className="bg-transparent">
                <RotateCcw className="w-5 h-5 mr-2" />
                Reset
              </Button>
            </div>

            <p className="mt-4 text-muted-foreground">
              Completed Cycles: <span className="font-bold text-foreground">{cycles}</span>
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Instructions */}
      <Card className="bg-muted/50 border-border">
        <CardHeader>
          <CardTitle className="text-base">How It Works</CardTitle>
        </CardHeader>
        <CardContent className="text-sm text-muted-foreground space-y-2">
          <p>1. Select a breathing pattern that suits your needs</p>
          <p>2. Press Start and follow the expanding/contracting circle</p>
          <p>3. Breathe in as it expands, out as it contracts</p>
          <p>4. Practice for 5-10 cycles for best results</p>
        </CardContent>
      </Card>
    </div>
  )
}
