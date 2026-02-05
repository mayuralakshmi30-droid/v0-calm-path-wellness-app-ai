"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { ArrowLeft, Play, Pause, RotateCcw, Timer, Coffee, Volume2, VolumeX } from "lucide-react"
import { cn } from "@/lib/utils"

const presets = [
  { name: "Quick Focus", work: 15, break: 3 },
  { name: "Pomodoro", work: 25, break: 5 },
  { name: "Deep Work", work: 45, break: 10 },
]

export default function FocusTimerPage() {
  const [preset, setPreset] = useState(presets[1])
  const [mode, setMode] = useState<"work" | "break">("work")
  const [timeLeft, setTimeLeft] = useState(preset.work * 60)
  const [isRunning, setIsRunning] = useState(false)
  const [completedSessions, setCompletedSessions] = useState(0)
  const [soundEnabled, setSoundEnabled] = useState(true)

  useEffect(() => {
    if (!isRunning) return

    const timer = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          // Session complete
          if (mode === "work") {
            setCompletedSessions((s) => s + 1)
            setMode("break")
            return preset.break * 60
          } else {
            setMode("work")
            return preset.work * 60
          }
        }
        return prev - 1
      })
    }, 1000)

    return () => clearInterval(timer)
  }, [isRunning, mode, preset])

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`
  }

  const handlePresetChange = (newPreset: typeof presets[0]) => {
    setPreset(newPreset)
    setIsRunning(false)
    setMode("work")
    setTimeLeft(newPreset.work * 60)
  }

  const handleReset = () => {
    setIsRunning(false)
    setMode("work")
    setTimeLeft(preset.work * 60)
  }

  const progress = mode === "work" 
    ? ((preset.work * 60 - timeLeft) / (preset.work * 60)) * 100
    : ((preset.break * 60 - timeLeft) / (preset.break * 60)) * 100

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" asChild>
          <Link href="/dashboard/games">
            <ArrowLeft className="w-5 h-5" />
          </Link>
        </Button>
        <div>
          <h1 className="text-2xl font-bold text-foreground">Focus Timer</h1>
          <p className="text-muted-foreground">Stay focused with timed sessions</p>
        </div>
      </div>

      {/* Preset Selection */}
      <div className="flex flex-wrap gap-2">
        {presets.map((p) => (
          <Button
            key={p.name}
            variant={preset.name === p.name ? "default" : "outline"}
            size="sm"
            onClick={() => handlePresetChange(p)}
            disabled={isRunning}
            className={preset.name !== p.name ? "bg-transparent" : ""}
          >
            {p.name} ({p.work}m)
          </Button>
        ))}
      </div>

      {/* Timer Display */}
      <Card className={cn(
        "bg-card border-border transition-colors",
        mode === "break" && "border-green-500/50"
      )}>
        <CardContent className="p-8">
          <div className="flex flex-col items-center justify-center">
            {/* Mode Indicator */}
            <div className={cn(
              "inline-flex items-center gap-2 px-4 py-2 rounded-full mb-6",
              mode === "work" ? "bg-primary/10 text-primary" : "bg-green-500/10 text-green-600"
            )}>
              {mode === "work" ? (
                <>
                  <Timer className="w-4 h-4" />
                  <span className="font-medium">Focus Time</span>
                </>
              ) : (
                <>
                  <Coffee className="w-4 h-4" />
                  <span className="font-medium">Break Time</span>
                </>
              )}
            </div>

            {/* Circular Progress */}
            <div className="relative w-64 h-64 sm:w-80 sm:h-80">
              <svg className="w-full h-full transform -rotate-90">
                <circle
                  cx="50%"
                  cy="50%"
                  r="45%"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="4"
                  className="text-muted"
                />
                <circle
                  cx="50%"
                  cy="50%"
                  r="45%"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="4"
                  strokeLinecap="round"
                  strokeDasharray={`${progress * 2.83} 283`}
                  className={cn(
                    "transition-all duration-1000",
                    mode === "work" ? "text-primary" : "text-green-500"
                  )}
                />
              </svg>
              <div className="absolute inset-0 flex flex-col items-center justify-center">
                <span className="text-5xl sm:text-6xl font-bold text-foreground">
                  {formatTime(timeLeft)}
                </span>
                <span className="text-sm text-muted-foreground mt-2">
                  {mode === "work" ? `${preset.break}m break next` : `${preset.work}m focus next`}
                </span>
              </div>
            </div>

            {/* Controls */}
            <div className="flex items-center gap-4 mt-8">
              <Button
                variant="outline"
                size="icon"
                onClick={() => setSoundEnabled(!soundEnabled)}
                className="bg-transparent"
              >
                {soundEnabled ? (
                  <Volume2 className="w-5 h-5" />
                ) : (
                  <VolumeX className="w-5 h-5" />
                )}
              </Button>
              <Button
                size="lg"
                onClick={() => setIsRunning(!isRunning)}
                className={cn(
                  "min-w-[140px]",
                  mode === "break" && "bg-green-500 hover:bg-green-600"
                )}
              >
                {isRunning ? (
                  <>
                    <Pause className="w-5 h-5 mr-2" />
                    Pause
                  </>
                ) : (
                  <>
                    <Play className="w-5 h-5 mr-2" />
                    {timeLeft === (mode === "work" ? preset.work : preset.break) * 60 ? "Start" : "Resume"}
                  </>
                )}
              </Button>
              <Button variant="outline" size="icon" onClick={handleReset} className="bg-transparent">
                <RotateCcw className="w-5 h-5" />
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Stats */}
      <Card className="bg-card border-border">
        <CardContent className="p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground">Completed Sessions</p>
              <p className="text-2xl font-bold">{completedSessions}</p>
            </div>
            <div className="text-right">
              <p className="text-sm text-muted-foreground">Total Focus Time</p>
              <p className="text-2xl font-bold">{completedSessions * preset.work}m</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Tips */}
      <Card className="bg-muted/50 border-border">
        <CardHeader>
          <CardTitle className="text-base">Focus Tips</CardTitle>
        </CardHeader>
        <CardContent className="text-sm text-muted-foreground space-y-2">
          <p>1. Remove distractions before starting</p>
          <p>2. During breaks, step away from your screen</p>
          <p>3. Stay hydrated and take deep breaths</p>
          <p>4. After 4 sessions, take a longer 15-20 min break</p>
        </CardContent>
      </Card>
    </div>
  )
}
