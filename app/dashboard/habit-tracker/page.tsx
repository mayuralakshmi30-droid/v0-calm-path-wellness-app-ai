"use client"

import { useState, useMemo, useEffect, useRef } from "react"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { Textarea } from "@/components/ui/textarea"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from "@/components/ui/dialog"
import { Progress } from "@/components/ui/progress"
import { useApp } from "@/lib/app-context"
import {
  Plus, Trash2, Check, Target, Flame, CalendarDays, Timer, Trophy,
  Dumbbell, Moon, Brain, Apple, Heart, Star, Upload, Gift, Zap,
  TrendingUp, Award, Clock
} from "lucide-react"
import { cn } from "@/lib/utils"

// ─── Preset exercises by category ───
const PRESET_HABITS = {
  exercise: [
    { name: "Morning Walk (30 min)", points: 20, timerSeconds: 1800 },
    { name: "Stretching Routine", points: 15, timerSeconds: 600 },
    { name: "Yoga Session", points: 25, timerSeconds: 1800 },
    { name: "Push-ups (3 sets of 15)", points: 20, timerSeconds: 0 },
    { name: "Jogging / Running", points: 30, timerSeconds: 1200 },
    { name: "Breathing Exercises", points: 10, timerSeconds: 300 },
    { name: "Plank Hold (3 sets)", points: 15, timerSeconds: 180 },
    { name: "Dance Workout", points: 25, timerSeconds: 1200 },
    { name: "Swimming", points: 30, timerSeconds: 1800 },
    { name: "Cycling", points: 25, timerSeconds: 1800 },
  ],
  sleep: [
    { name: "Sleep by 10:30 PM", points: 15, timerSeconds: 0 },
    { name: "No Screen 1hr Before Bed", points: 10, timerSeconds: 0 },
    { name: "8 Hours of Sleep", points: 20, timerSeconds: 0 },
    { name: "Morning Wake-Up by 6 AM", points: 15, timerSeconds: 0 },
    { name: "Sleep Journal Entry", points: 10, timerSeconds: 0 },
    { name: "Evening Relaxation Routine", points: 15, timerSeconds: 900 },
  ],
  mindfulness: [
    { name: "Guided Meditation", points: 20, timerSeconds: 600 },
    { name: "Gratitude Journaling", points: 15, timerSeconds: 300 },
    { name: "Deep Breathing (5-4-7)", points: 10, timerSeconds: 300 },
    { name: "Body Scan Meditation", points: 20, timerSeconds: 900 },
    { name: "Mindful Walking", points: 15, timerSeconds: 600 },
    { name: "Progressive Muscle Relaxation", points: 15, timerSeconds: 600 },
  ],
  nutrition: [
    { name: "Drink 8 Glasses of Water", points: 10, timerSeconds: 0 },
    { name: "Eat a Balanced Breakfast", points: 15, timerSeconds: 0 },
    { name: "No Junk Food Today", points: 20, timerSeconds: 0 },
    { name: "Eat 5 Servings of Fruits/Veggies", points: 15, timerSeconds: 0 },
    { name: "Take Vitamins / Supplements", points: 5, timerSeconds: 0 },
  ],
  therapy: [
    { name: "Practice CBT Exercises", points: 25, timerSeconds: 900 },
    { name: "Write in Therapy Journal", points: 20, timerSeconds: 600 },
    { name: "Practice Grounding Techniques", points: 15, timerSeconds: 300 },
    { name: "Review Therapist Homework", points: 20, timerSeconds: 0 },
    { name: "Self-Care Activity", points: 15, timerSeconds: 0 },
  ],
}

const CATEGORY_META: Record<string, { icon: typeof Dumbbell; label: string; color: string }> = {
  exercise: { icon: Dumbbell, label: "Exercise", color: "bg-emerald-500" },
  sleep: { icon: Moon, label: "Sleep", color: "bg-indigo-500" },
  mindfulness: { icon: Brain, label: "Mindfulness", color: "bg-violet-500" },
  nutrition: { icon: Apple, label: "Nutrition", color: "bg-amber-500" },
  therapy: { icon: Heart, label: "Therapy", color: "bg-rose-500" },
  custom: { icon: Star, label: "Custom", color: "bg-sky-500" },
}

// ─── Rewards tiers ───
const REWARDS = [
  { points: 100, label: "5% Discount on Next Session", icon: Gift },
  { points: 250, label: "10% Discount on Any Session", icon: Gift },
  { points: 500, label: "Free 15-min Consultation", icon: Trophy },
  { points: 1000, label: "20% Discount on Any Session", icon: Award },
  { points: 2000, label: "One Free Session", icon: Zap },
]

function getWeekDates() {
  const today = new Date()
  const dates: string[] = []
  for (let i = 6; i >= 0; i--) {
    const date = new Date(today)
    date.setDate(today.getDate() - i)
    dates.push(date.toISOString().split("T")[0])
  }
  return dates
}

function formatTime(totalSeconds: number) {
  const m = Math.floor(totalSeconds / 60)
  const s = totalSeconds % 60
  return `${m.toString().padStart(2, "0")}:${s.toString().padStart(2, "0")}`
}

// ─── Timer Component ───
function HabitTimer({
  targetSeconds,
  habitId,
  habitName,
  onComplete,
}: {
  targetSeconds: number
  habitId: string
  habitName: string
  onComplete: (seconds: number) => void
}) {
  const [elapsed, setElapsed] = useState(0)
  const [running, setRunning] = useState(false)
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null)

  useEffect(() => {
    if (running) {
      intervalRef.current = setInterval(() => {
        setElapsed((prev) => prev + 1)
      }, 1000)
    } else if (intervalRef.current) {
      clearInterval(intervalRef.current)
    }
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current)
    }
  }, [running])

  const progress = targetSeconds > 0 ? Math.min((elapsed / targetSeconds) * 100, 100) : 0
  const isComplete = targetSeconds > 0 && elapsed >= targetSeconds

  return (
    <div className="space-y-3">
      <div className="text-center">
        <p className="text-sm font-medium text-muted-foreground mb-1">{habitName}</p>
        <p className="text-4xl font-mono font-bold tabular-nums">
          {formatTime(elapsed)}
        </p>
        {targetSeconds > 0 && (
          <p className="text-sm text-muted-foreground mt-1">Target: {formatTime(targetSeconds)}</p>
        )}
      </div>
      {targetSeconds > 0 && (
        <Progress value={progress} className="h-2" />
      )}
      <div className="flex gap-2 justify-center">
        {!isComplete ? (
          <>
            <Button
              size="sm"
              variant={running ? "destructive" : "default"}
              onClick={() => setRunning(!running)}
            >
              {running ? "Pause" : elapsed > 0 ? "Resume" : "Start"}
            </Button>
            {elapsed > 0 && !running && (
              <Button size="sm" variant="outline" onClick={() => { setElapsed(0) }}>
                Reset
              </Button>
            )}
          </>
        ) : (
          <Button size="sm" onClick={() => { setRunning(false); onComplete(elapsed) }}>
            <Check className="w-4 h-4 mr-1" /> Complete
          </Button>
        )}
        {!isComplete && elapsed > 30 && !running && (
          <Button size="sm" variant="secondary" onClick={() => { onComplete(elapsed) }}>
            Finish Early
          </Button>
        )}
      </div>
    </div>
  )
}

export default function HabitTrackerPage() {
  const {
    habits, addHabit, toggleHabitCompletion, addHabitProof,
    logHabitTimer, deleteHabit, getTotalPoints, getStreak, sessions,
  } = useApp()

  const [showAddDialog, setShowAddDialog] = useState(false)
  const [addMode, setAddMode] = useState<"preset" | "custom">("preset")
  const [selectedCategory, setSelectedCategory] = useState<string>("exercise")
  const [selectedPreset, setSelectedPreset] = useState<string>("")
  const [newHabitName, setNewHabitName] = useState("")
  const [newHabitCategory, setNewHabitCategory] = useState<string>("custom")
  const [newHabitFrequency, setNewHabitFrequency] = useState<"daily" | "weekly">("daily")
  const [newHabitPoints, setNewHabitPoints] = useState(10)
  const [newHabitTimerMin, setNewHabitTimerMin] = useState(0)
  const [habitToDelete, setHabitToDelete] = useState<string | null>(null)

  // Timer dialog
  const [timerHabit, setTimerHabit] = useState<string | null>(null)
  // Proof dialog
  const [proofHabit, setProofHabit] = useState<{ id: string; date: string } | null>(null)
  const [proofText, setProofText] = useState("")

  const weekDates = useMemo(() => getWeekDates(), [])
  const today = new Date().toISOString().split("T")[0]
  const totalPoints = getTotalPoints()

  // Calculate current reward tier and next milestone
  const currentReward = REWARDS.filter((r) => totalPoints >= r.points).pop()
  const nextReward = REWARDS.find((r) => totalPoints < r.points)

  const handleAddPreset = () => {
    const presets = PRESET_HABITS[selectedCategory as keyof typeof PRESET_HABITS]
    const preset = presets?.find((p) => p.name === selectedPreset)
    if (!preset) return
    const meta = CATEGORY_META[selectedCategory]
    addHabit({
      name: preset.name,
      category: selectedCategory as "exercise" | "sleep" | "mindfulness" | "nutrition" | "therapy",
      frequency: "daily",
      color: meta.color,
      points: preset.points,
      timerSeconds: preset.timerSeconds,
    })
    setSelectedPreset("")
    setShowAddDialog(false)
  }

  const handleAddCustom = () => {
    if (!newHabitName.trim()) return
    const meta = CATEGORY_META[newHabitCategory] || CATEGORY_META.custom
    addHabit({
      name: newHabitName,
      category: newHabitCategory as "exercise" | "sleep" | "mindfulness" | "nutrition" | "therapy" | "custom",
      frequency: newHabitFrequency,
      color: meta.color,
      points: newHabitPoints,
      timerSeconds: newHabitTimerMin * 60,
    })
    setNewHabitName("")
    setNewHabitPoints(10)
    setNewHabitTimerMin(0)
    setShowAddDialog(false)
  }

  const handleTimerComplete = (habitId: string, seconds: number) => {
    logHabitTimer(habitId, today, seconds)
    toggleHabitCompletion(habitId, today)
    setTimerHabit(null)
  }

  const handleSubmitProof = () => {
    if (proofHabit && proofText.trim()) {
      addHabitProof(proofHabit.id, proofHabit.date, proofText)
      setProofHabit(null)
      setProofText("")
    }
  }

  // Completed session reports for AI insights
  const completedSessionReports = sessions
    .filter((s) => s.status === "completed" && s.report)
    .map((s) => s.report)

  const totalCompletedToday = habits.filter((h) => h.completedDates.includes(today)).length
  const totalHabits = habits.length
  const bestStreak = habits.length > 0 ? Math.max(...habits.map((h) => getStreak(h.id))) : 0

  // Generate AI insights from habit data
  const generateInsights = () => {
    const insights: string[] = []

    // Analyze category distribution
    const categoryCount: Record<string, number> = {}
    habits.forEach((h) => {
      categoryCount[h.category] = (categoryCount[h.category] || 0) + 1
    })

    if (!categoryCount.exercise) {
      insights.push("You have no exercise habits tracked yet. Physical activity can significantly reduce anxiety and improve mood -- consider adding a simple walk or stretching routine.")
    }
    if (!categoryCount.sleep) {
      insights.push("Sleep habits are not being tracked. Quality sleep is the foundation of mental health -- try tracking your bedtime consistency or screen-free evenings.")
    }
    if (!categoryCount.mindfulness) {
      insights.push("Adding mindfulness habits like meditation or gratitude journaling can help reduce stress levels and improve emotional regulation.")
    }

    // Analyze consistency
    const last7Days = weekDates
    habits.forEach((h) => {
      const completedThisWeek = last7Days.filter((d) => h.completedDates.includes(d)).length
      if (completedThisWeek <= 2 && h.completedDates.length > 0) {
        insights.push(`Your habit "${h.name}" has low consistency this week (${completedThisWeek}/7 days). Try setting a specific time each day to build the routine.`)
      } else if (completedThisWeek >= 6) {
        insights.push(`Excellent consistency on "${h.name}" -- ${completedThisWeek}/7 days this week! This routine is becoming a strong habit. Keep it going.`)
      }
    })

    // Analyze streak
    if (bestStreak >= 7) {
      insights.push(`Impressive! You have a ${bestStreak}-day streak going. Research shows habits typically solidify after 21 days of consistent practice.`)
    } else if (bestStreak === 0 && habits.length > 0) {
      insights.push("No active streaks right now. Start small -- even completing one habit today can kickstart momentum. Consistency matters more than intensity.")
    }

    // Points-based insights
    if (totalPoints >= 500) {
      insights.push(`You have earned ${totalPoints} points -- that shows real dedication to your wellness journey. Redeem your rewards to stay motivated.`)
    }

    // Insights from therapist reports
    if (completedSessionReports.length > 0) {
      insights.push("Based on your completed therapy sessions, continue practicing the exercises your therapist recommended. Tracking them here helps build accountability between sessions.")
    }

    // Category-specific insights
    if (categoryCount.exercise && categoryCount.exercise >= 2) {
      insights.push("Having multiple exercise habits is great for variety. Alternating between cardio and flexibility exercises provides well-rounded physical wellness benefits.")
    }

    if (habits.length === 0) {
      insights.push("Welcome to the Habit Tracker! Start by adding habits from our preset categories -- exercise, sleep, mindfulness, nutrition, or therapy exercises.")
      insights.push("Earning points for each completed habit unlocks discounts on therapy sessions. The more consistent you are, the bigger the rewards.")
    }

    return insights.length > 0 ? insights : ["Keep tracking your habits consistently. More data helps generate better personalized insights for your wellness journey."]
  }

  const insights = useMemo(generateInsights, [habits, weekDates, totalPoints, bestStreak, completedSessionReports, today])

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl lg:text-3xl font-bold text-foreground">Habit Tracker</h1>
          <p className="text-muted-foreground mt-1">Build healthy habits, earn points, unlock rewards</p>
        </div>
        <Button onClick={() => setShowAddDialog(true)}>
          <Plus className="w-4 h-4 mr-2" />
          Add Habit
        </Button>
      </div>

      {/* Stats Row */}
      <div className="grid grid-cols-2 lg:grid-cols-5 gap-4">
        <Card className="bg-card border-border">
          <CardContent className="p-4 flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
              <Target className="w-5 h-5 text-primary" />
            </div>
            <div>
              <p className="text-xs text-muted-foreground">Total Habits</p>
              <p className="text-xl font-bold">{totalHabits}</p>
            </div>
          </CardContent>
        </Card>
        <Card className="bg-card border-border">
          <CardContent className="p-4 flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-green-100 flex items-center justify-center shrink-0">
              <Check className="w-5 h-5 text-green-600" />
            </div>
            <div>
              <p className="text-xs text-muted-foreground">Done Today</p>
              <p className="text-xl font-bold">{totalCompletedToday}/{totalHabits}</p>
            </div>
          </CardContent>
        </Card>
        <Card className="bg-card border-border">
          <CardContent className="p-4 flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-orange-100 flex items-center justify-center shrink-0">
              <Flame className="w-5 h-5 text-orange-600" />
            </div>
            <div>
              <p className="text-xs text-muted-foreground">Best Streak</p>
              <p className="text-xl font-bold">{bestStreak}d</p>
            </div>
          </CardContent>
        </Card>
        <Card className="bg-card border-border">
          <CardContent className="p-4 flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-amber-100 flex items-center justify-center shrink-0">
              <Trophy className="w-5 h-5 text-amber-600" />
            </div>
            <div>
              <p className="text-xs text-muted-foreground">Total Points</p>
              <p className="text-xl font-bold">{totalPoints}</p>
            </div>
          </CardContent>
        </Card>
        <Card className="bg-card border-border col-span-2 lg:col-span-1">
          <CardContent className="p-4 flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-violet-100 flex items-center justify-center shrink-0">
              <Gift className="w-5 h-5 text-violet-600" />
            </div>
            <div className="min-w-0">
              <p className="text-xs text-muted-foreground">Current Reward</p>
              <p className="text-sm font-bold truncate">
                {currentReward ? currentReward.label : "Earn 100 pts"}
              </p>
            </div>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="tracker" className="space-y-4">
        <TabsList>
          <TabsTrigger value="tracker">Tracker</TabsTrigger>
          <TabsTrigger value="rewards">Rewards & Streaks</TabsTrigger>
          <TabsTrigger value="insights">AI Insights</TabsTrigger>
        </TabsList>

        {/* ─── TRACKER TAB ─── */}
        <TabsContent value="tracker" className="space-y-4">
          {habits.length === 0 ? (
            <Card className="bg-card border-border">
              <CardContent className="py-16 text-center">
                <div className="w-16 h-16 bg-muted rounded-full flex items-center justify-center mx-auto mb-4">
                  <CalendarDays className="w-8 h-8 text-muted-foreground" />
                </div>
                <h3 className="font-semibold text-lg mb-2">No habits yet</h3>
                <p className="text-muted-foreground mb-4">
                  Add exercises, sleep schedules, mindfulness routines and more to start earning points
                </p>
                <Button onClick={() => setShowAddDialog(true)}>
                  <Plus className="w-4 h-4 mr-2" />
                  Add Your First Habit
                </Button>
              </CardContent>
            </Card>
          ) : (
            <Card className="bg-card border-border">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <CalendarDays className="w-5 h-5" />
                  This Week
                </CardTitle>
                <CardDescription>
                  Complete habits to earn points. Use the timer for timed exercises. Add proof to verify completion.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="overflow-x-auto">
                  <table className="w-full min-w-[700px]">
                    <thead>
                      <tr>
                        <th className="text-left py-3 px-3 text-sm font-medium text-muted-foreground w-52">Habit</th>
                        {weekDates.map((date) => {
                          const d = new Date(date + "T12:00:00")
                          const isToday = date === today
                          return (
                            <th key={date} className={cn(
                              "text-center py-3 px-1 text-sm font-medium w-14",
                              isToday ? "text-primary" : "text-muted-foreground"
                            )}>
                              <div className="flex flex-col items-center">
                                <span className="text-xs">{d.toLocaleDateString("en-US", { weekday: "short" })}</span>
                                <span className={cn(
                                  "w-7 h-7 rounded-full flex items-center justify-center mt-1 text-xs",
                                  isToday && "bg-primary text-primary-foreground"
                                )}>
                                  {d.getDate()}
                                </span>
                              </div>
                            </th>
                          )
                        })}
                        <th className="text-center py-3 px-2 text-sm font-medium text-muted-foreground w-14">Pts</th>
                        <th className="text-center py-3 px-2 text-sm font-medium text-muted-foreground w-14">Streak</th>
                        <th className="w-24"></th>
                      </tr>
                    </thead>
                    <tbody>
                      {habits.map((habit) => {
                        const streak = getStreak(habit.id)
                        const meta = CATEGORY_META[habit.category] || CATEGORY_META.custom
                        const CatIcon = meta.icon
                        return (
                          <tr key={habit.id} className="border-t border-border">
                            <td className="py-3 px-3">
                              <div className="flex items-center gap-2">
                                <div className={cn("w-7 h-7 rounded-md flex items-center justify-center text-white shrink-0", meta.color)}>
                                  <CatIcon className="w-3.5 h-3.5" />
                                </div>
                                <div className="min-w-0">
                                  <p className="font-medium text-sm truncate">{habit.name}</p>
                                  <p className="text-xs text-muted-foreground capitalize">{meta.label} {habit.timerSeconds > 0 && `/ ${formatTime(habit.timerSeconds)}`}</p>
                                </div>
                              </div>
                            </td>
                            {weekDates.map((date) => {
                              const isCompleted = habit.completedDates.includes(date)
                              const hasProof = habit.proofDates && habit.proofDates[date]
                              return (
                                <td key={date} className="text-center py-3 px-1">
                                  <button
                                    onClick={() => {
                                      if (habit.timerSeconds > 0 && !isCompleted && date === today) {
                                        setTimerHabit(habit.id)
                                      } else {
                                        toggleHabitCompletion(habit.id, date)
                                      }
                                    }}
                                    className={cn(
                                      "w-8 h-8 rounded-lg flex items-center justify-center transition-all border-2 relative",
                                      isCompleted
                                        ? `${meta.color} border-transparent text-white`
                                        : "border-border hover:border-primary/50 hover:bg-muted"
                                    )}
                                    aria-label={isCompleted ? "Mark as incomplete" : "Mark as complete"}
                                  >
                                    {isCompleted && <Check className="w-4 h-4" />}
                                    {hasProof && (
                                      <span className="absolute -top-1 -right-1 w-3 h-3 bg-amber-400 rounded-full border border-background" />
                                    )}
                                  </button>
                                </td>
                              )
                            })}
                            <td className="text-center py-3 px-2">
                              <Badge variant="secondary" className="text-xs font-semibold">
                                {habit.points}
                              </Badge>
                            </td>
                            <td className="text-center py-3 px-2">
                              <div className="flex items-center justify-center gap-1">
                                <Flame className={cn("w-3.5 h-3.5", streak > 0 ? "text-orange-500" : "text-muted-foreground/30")} />
                                <span className={cn("font-medium text-sm", streak > 0 ? "text-foreground" : "text-muted-foreground")}>
                                  {streak}
                                </span>
                              </div>
                            </td>
                            <td className="py-3 px-2">
                              <div className="flex items-center gap-1">
                                {habit.completedDates.includes(today) && (
                                  <Button
                                    variant="ghost"
                                    size="icon"
                                    className="w-7 h-7 text-amber-600 hover:text-amber-700"
                                    onClick={() => {
                                      setProofHabit({ id: habit.id, date: today })
                                      setProofText(habit.proofDates?.[today] || "")
                                    }}
                                    title="Add proof"
                                  >
                                    <Upload className="w-3.5 h-3.5" />
                                  </Button>
                                )}
                                {habit.timerSeconds > 0 && !habit.completedDates.includes(today) && (
                                  <Button
                                    variant="ghost"
                                    size="icon"
                                    className="w-7 h-7 text-primary hover:text-primary"
                                    onClick={() => setTimerHabit(habit.id)}
                                    title="Start timer"
                                  >
                                    <Timer className="w-3.5 h-3.5" />
                                  </Button>
                                )}
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  className="w-7 h-7 text-muted-foreground hover:text-destructive"
                                  onClick={() => setHabitToDelete(habit.id)}
                                >
                                  <Trash2 className="w-3.5 h-3.5" />
                                </Button>
                              </div>
                            </td>
                          </tr>
                        )
                      })}
                    </tbody>
                  </table>
                </div>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        {/* ─── REWARDS TAB ─── */}
        <TabsContent value="rewards" className="space-y-4">
          <Card className="bg-card border-border">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Trophy className="w-5 h-5" />
                Points & Rewards
              </CardTitle>
              <CardDescription>
                Earn points by completing habits. Reach milestones to unlock discounts on therapy sessions.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Points progress */}
              <div className="rounded-lg border border-border p-4 space-y-3 bg-muted/30">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-semibold text-lg">{totalPoints} Points</p>
                    <p className="text-sm text-muted-foreground">
                      {nextReward
                        ? `${nextReward.points - totalPoints} more points to unlock: ${nextReward.label}`
                        : "All rewards unlocked!"}
                    </p>
                  </div>
                  <div className="w-14 h-14 rounded-full bg-amber-100 flex items-center justify-center">
                    <Trophy className="w-7 h-7 text-amber-600" />
                  </div>
                </div>
                {nextReward && (
                  <Progress value={(totalPoints / nextReward.points) * 100} className="h-3" />
                )}
              </div>

              {/* Rewards tiers */}
              <div className="space-y-3">
                {REWARDS.map((reward) => {
                  const unlocked = totalPoints >= reward.points
                  const RewardIcon = reward.icon
                  return (
                    <div
                      key={reward.points}
                      className={cn(
                        "flex items-center gap-4 p-4 rounded-lg border",
                        unlocked ? "bg-primary/5 border-primary/20" : "bg-muted/20 border-border"
                      )}
                    >
                      <div className={cn(
                        "w-10 h-10 rounded-full flex items-center justify-center shrink-0",
                        unlocked ? "bg-primary/10" : "bg-muted"
                      )}>
                        <RewardIcon className={cn("w-5 h-5", unlocked ? "text-primary" : "text-muted-foreground")} />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className={cn("font-medium", unlocked ? "text-foreground" : "text-muted-foreground")}>
                          {reward.label}
                        </p>
                        <p className="text-sm text-muted-foreground">{reward.points} points required</p>
                      </div>
                      {unlocked ? (
                        <Badge className="bg-primary text-primary-foreground shrink-0">Unlocked</Badge>
                      ) : (
                        <Badge variant="secondary" className="shrink-0">{reward.points - totalPoints} more</Badge>
                      )}
                    </div>
                  )
                })}
              </div>

              {/* Streaks */}
              <div>
                <h3 className="font-semibold mb-3 flex items-center gap-2">
                  <Flame className="w-5 h-5 text-orange-500" />
                  Active Streaks
                </h3>
                {habits.length === 0 ? (
                  <p className="text-sm text-muted-foreground">Add habits to start building streaks.</p>
                ) : (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {habits.map((h) => {
                      const s = getStreak(h.id)
                      const meta = CATEGORY_META[h.category] || CATEGORY_META.custom
                      return (
                        <div key={h.id} className="flex items-center gap-3 p-3 rounded-lg border border-border">
                          <div className={cn("w-8 h-8 rounded-md flex items-center justify-center text-white shrink-0", meta.color)}>
                            <Flame className="w-4 h-4" />
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium truncate">{h.name}</p>
                            <p className="text-xs text-muted-foreground">
                              {s > 0 ? `${s} day streak` : "No active streak"}
                            </p>
                          </div>
                          <span className="text-lg font-bold">{s}d</span>
                        </div>
                      )
                    })}
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* ─── AI INSIGHTS TAB ─── */}
        <TabsContent value="insights" className="space-y-4">
          <Card className="bg-card border-border">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <TrendingUp className="w-5 h-5" />
                AI-Based Wellness Insights
              </CardTitle>
              <CardDescription>
                Personalized recommendations based on your habit tracking data and therapist session reports
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {insights.map((insight, i) => (
                <div key={i} className="flex gap-3 p-4 rounded-lg border border-border bg-muted/20">
                  <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center shrink-0 mt-0.5">
                    <Brain className="w-4 h-4 text-primary" />
                  </div>
                  <p className="text-sm leading-relaxed">{insight}</p>
                </div>
              ))}

              {completedSessionReports.length > 0 && (
                <div className="mt-6">
                  <h3 className="font-semibold mb-3 flex items-center gap-2">
                    <Heart className="w-4 h-4 text-rose-500" />
                    Insights From Your Therapy Sessions
                  </h3>
                  <div className="p-4 rounded-lg border border-border bg-muted/20">
                    <p className="text-sm leading-relaxed">
                      Based on {completedSessionReports.length} completed session{completedSessionReports.length > 1 ? "s" : ""},
                      your therapist has provided exercises and recommendations. Make sure to add them
                      as habits here to track your progress between sessions. Consistency with therapist-assigned
                      exercises has been shown to improve therapy outcomes by up to 50%.
                    </p>
                  </div>
                </div>
              )}

              <div className="p-4 rounded-lg bg-primary/5 border border-primary/10">
                <div className="flex items-start gap-3">
                  <Clock className="w-5 h-5 text-primary mt-0.5 shrink-0" />
                  <div>
                    <p className="font-medium text-sm">Track more for better insights</p>
                    <p className="text-sm text-muted-foreground mt-1">
                      The more consistently you track your habits, the more accurate and helpful these AI insights become.
                      Try to log your habits every day for the best personalized recommendations.
                    </p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* ─── ADD HABIT DIALOG ─── */}
      <Dialog open={showAddDialog} onOpenChange={setShowAddDialog}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>Add New Habit</DialogTitle>
            <DialogDescription>
              Choose from preset exercises or create your own custom habit
            </DialogDescription>
          </DialogHeader>

          <Tabs value={addMode} onValueChange={(v) => setAddMode(v as "preset" | "custom")}>
            <TabsList className="w-full">
              <TabsTrigger value="preset" className="flex-1">Preset Habits</TabsTrigger>
              <TabsTrigger value="custom" className="flex-1">Custom Habit</TabsTrigger>
            </TabsList>

            <TabsContent value="preset" className="space-y-4 pt-4">
              <div className="space-y-2">
                <Label>Category</Label>
                <div className="grid grid-cols-3 sm:grid-cols-5 gap-2">
                  {Object.entries(CATEGORY_META).filter(([k]) => k !== "custom").map(([key, meta]) => {
                    const CatIcon = meta.icon
                    return (
                      <button
                        key={key}
                        onClick={() => { setSelectedCategory(key); setSelectedPreset("") }}
                        className={cn(
                          "p-3 rounded-lg border text-center transition-all flex flex-col items-center gap-1.5",
                          selectedCategory === key
                            ? "border-primary bg-primary/5"
                            : "border-border hover:border-primary/50"
                        )}
                      >
                        <CatIcon className={cn("w-5 h-5", selectedCategory === key ? "text-primary" : "text-muted-foreground")} />
                        <span className="text-xs font-medium">{meta.label}</span>
                      </button>
                    )
                  })}
                </div>
              </div>

              <div className="space-y-2">
                <Label>Select Habit</Label>
                <Select value={selectedPreset} onValueChange={setSelectedPreset}>
                  <SelectTrigger>
                    <SelectValue placeholder="Choose a habit..." />
                  </SelectTrigger>
                  <SelectContent>
                    {(PRESET_HABITS[selectedCategory as keyof typeof PRESET_HABITS] || []).map((p) => (
                      <SelectItem key={p.name} value={p.name}>
                        {p.name} ({p.points} pts{p.timerSeconds > 0 ? ` / ${formatTime(p.timerSeconds)}` : ""})
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {selectedPreset && (
                <div className="p-3 rounded-lg bg-muted/50 border border-border text-sm">
                  <div className="flex items-center justify-between">
                    <span className="font-medium">{selectedPreset}</span>
                    <Badge variant="secondary">
                      {PRESET_HABITS[selectedCategory as keyof typeof PRESET_HABITS]?.find(p => p.name === selectedPreset)?.points} pts
                    </Badge>
                  </div>
                </div>
              )}

              <DialogFooter>
                <Button variant="outline" onClick={() => setShowAddDialog(false)}>Cancel</Button>
                <Button onClick={handleAddPreset} disabled={!selectedPreset}>Add Habit</Button>
              </DialogFooter>
            </TabsContent>

            <TabsContent value="custom" className="space-y-4 pt-4">
              <div className="space-y-2">
                <Label htmlFor="habit-name">Habit Name</Label>
                <Input
                  id="habit-name"
                  placeholder="e.g., Read for 20 minutes"
                  value={newHabitName}
                  onChange={(e) => setNewHabitName(e.target.value)}
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Category</Label>
                  <Select value={newHabitCategory} onValueChange={setNewHabitCategory}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {Object.entries(CATEGORY_META).map(([key, meta]) => (
                        <SelectItem key={key} value={key}>{meta.label}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>Frequency</Label>
                  <Select value={newHabitFrequency} onValueChange={(v) => setNewHabitFrequency(v as "daily" | "weekly")}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="daily">Daily</SelectItem>
                      <SelectItem value="weekly">Weekly</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Points Per Completion</Label>
                  <Input
                    type="number"
                    min={1}
                    max={100}
                    value={newHabitPoints}
                    onChange={(e) => setNewHabitPoints(Number(e.target.value))}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Timer (minutes, 0 = none)</Label>
                  <Input
                    type="number"
                    min={0}
                    max={120}
                    value={newHabitTimerMin}
                    onChange={(e) => setNewHabitTimerMin(Number(e.target.value))}
                  />
                </div>
              </div>
              <DialogFooter>
                <Button variant="outline" onClick={() => setShowAddDialog(false)}>Cancel</Button>
                <Button onClick={handleAddCustom} disabled={!newHabitName.trim()}>Add Habit</Button>
              </DialogFooter>
            </TabsContent>
          </Tabs>
        </DialogContent>
      </Dialog>

      {/* ─── TIMER DIALOG ─── */}
      <Dialog open={!!timerHabit} onOpenChange={() => setTimerHabit(null)}>
        <DialogContent className="max-w-sm">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Timer className="w-5 h-5" />
              Exercise Timer
            </DialogTitle>
            <DialogDescription>
              Complete the timer to mark this habit as done and earn points
            </DialogDescription>
          </DialogHeader>
          {timerHabit && (() => {
            const h = habits.find((x) => x.id === timerHabit)
            if (!h) return null
            return (
              <HabitTimer
                targetSeconds={h.timerSeconds}
                habitId={h.id}
                habitName={h.name}
                onComplete={(seconds) => handleTimerComplete(h.id, seconds)}
              />
            )
          })()}
        </DialogContent>
      </Dialog>

      {/* ─── PROOF DIALOG ─── */}
      <Dialog open={!!proofHabit} onOpenChange={() => { setProofHabit(null); setProofText("") }}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Upload className="w-5 h-5" />
              Add Proof of Completion
            </DialogTitle>
            <DialogDescription>
              Describe what you did or how you completed this exercise today
            </DialogDescription>
          </DialogHeader>
          <Textarea
            placeholder="e.g., Completed 30 min walk in the park, did 3 sets of push-ups, meditated for 10 minutes..."
            value={proofText}
            onChange={(e) => setProofText(e.target.value)}
            className="min-h-[100px]"
          />
          <DialogFooter>
            <Button variant="outline" onClick={() => { setProofHabit(null); setProofText("") }}>Cancel</Button>
            <Button onClick={handleSubmitProof} disabled={!proofText.trim()}>
              Save Proof
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* ─── DELETE DIALOG ─── */}
      <Dialog open={!!habitToDelete} onOpenChange={() => setHabitToDelete(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete Habit</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete this habit? All progress, points, and streaks will be lost.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setHabitToDelete(null)}>Cancel</Button>
            <Button variant="destructive" onClick={() => { if (habitToDelete) { deleteHabit(habitToDelete); setHabitToDelete(null) } }}>
              Delete
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
