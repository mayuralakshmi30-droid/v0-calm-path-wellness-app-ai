"use client"

import { useMemo } from "react"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { useApp } from "@/lib/app-context"
import { useAuth } from "@/lib/auth-context"
import {
  BrainCircuit, TrendingUp, TrendingDown, Minus, Heart, Moon, Dumbbell,
  Apple, Brain, Target, AlertTriangle, CheckCircle2, Flame, Gift,
  FileText, CalendarDays, Sparkles, Shield, Clock, Award
} from "lucide-react"
import { cn } from "@/lib/utils"

// ─── Streak-based discount tiers ───
const STREAK_REWARDS = [
  { days: 7, discount: "5%", label: "7-Day Streak", description: "Complete any habit for 7 consecutive days" },
  { days: 14, discount: "10%", label: "14-Day Streak", description: "Two weeks of consistency earns you 10% off" },
  { days: 30, discount: "15%", label: "30-Day Streak", description: "A full month of dedication. Impressive!" },
  { days: 60, discount: "20%", label: "60-Day Streak", description: "Two months strong. Major commitment!" },
  { days: 100, discount: "30%", label: "100-Day Streak", description: "100 days! You get 30% off any therapy session" },
]

// ─── Helper: get last N days as date strings ───
function getLastNDays(n: number): string[] {
  const dates: string[] = []
  const now = new Date()
  for (let i = n - 1; i >= 0; i--) {
    const d = new Date(now)
    d.setDate(now.getDate() - i)
    dates.push(d.toISOString().split("T")[0])
  }
  return dates
}

// ─── Mood trend direction ───
function analyzeTrend(values: number[]): "up" | "down" | "stable" {
  if (values.length < 2) return "stable"
  const firstHalf = values.slice(0, Math.floor(values.length / 2))
  const secondHalf = values.slice(Math.floor(values.length / 2))
  const avg1 = firstHalf.reduce((a, b) => a + b, 0) / firstHalf.length
  const avg2 = secondHalf.reduce((a, b) => a + b, 0) / secondHalf.length
  const diff = avg2 - avg1
  if (diff > 0.3) return "up"
  if (diff < -0.3) return "down"
  return "stable"
}

const CATEGORY_ICONS: Record<string, typeof Dumbbell> = {
  exercise: Dumbbell,
  sleep: Moon,
  mindfulness: Brain,
  nutrition: Apple,
  therapy: Heart,
  custom: Target,
}

export default function AIInsightsPage() {
  const { user } = useAuth()
  const { moodEntries, habits, sessions, getStreak, getTotalPoints } = useApp()

  const last7 = useMemo(() => getLastNDays(7), [])
  const last30 = useMemo(() => getLastNDays(30), [])

  // ─── Mood Analysis ───
  const weekMoods = useMemo(() =>
    moodEntries.filter((m) => last7.includes(m.date)).sort((a, b) => a.date.localeCompare(b.date)),
    [moodEntries, last7]
  )
  const monthMoods = useMemo(() =>
    moodEntries.filter((m) => last30.includes(m.date)).sort((a, b) => a.date.localeCompare(b.date)),
    [moodEntries, last30]
  )

  const moodAverages = useMemo(() => {
    const src = weekMoods.length > 0 ? weekMoods : monthMoods
    if (src.length === 0) return null
    return {
      stress: src.reduce((a, m) => a + m.stressLevel, 0) / src.length,
      energy: src.reduce((a, m) => a + m.energyLevel, 0) / src.length,
      sleep: src.reduce((a, m) => a + m.sleepQuality, 0) / src.length,
      focus: src.reduce((a, m) => a + m.focusLevel, 0) / src.length,
    }
  }, [weekMoods, monthMoods])

  const stressTrend = useMemo(() => analyzeTrend(weekMoods.map(m => m.stressLevel)), [weekMoods])
  const energyTrend = useMemo(() => analyzeTrend(weekMoods.map(m => m.energyLevel)), [weekMoods])
  const sleepTrend = useMemo(() => analyzeTrend(weekMoods.map(m => m.sleepQuality)), [weekMoods])

  // ─── Habit Analysis ───
  const habitsByCategory = useMemo(() => {
    const map: Record<string, typeof habits> = {}
    habits.forEach((h) => {
      if (!map[h.category]) map[h.category] = []
      map[h.category].push(h)
    })
    return map
  }, [habits])

  const weeklyCompletionRate = useMemo(() => {
    if (habits.length === 0) return 0
    const totalPossible = habits.length * 7
    const totalDone = habits.reduce(
      (sum, h) => sum + last7.filter((d) => h.completedDates.includes(d)).length,
      0
    )
    return Math.round((totalDone / totalPossible) * 100)
  }, [habits, last7])

  const bestStreak = useMemo(
    () => (habits.length > 0 ? Math.max(...habits.map((h) => getStreak(h.id))) : 0),
    [habits, getStreak]
  )

  const totalPoints = getTotalPoints()

  // Current streak discount
  const currentStreakReward = STREAK_REWARDS.filter((r) => bestStreak >= r.days).pop()
  const nextStreakReward = STREAK_REWARDS.find((r) => bestStreak < r.days)

  // ─── Therapist Reports Analysis ───
  const completedSessions = useMemo(
    () => sessions.filter((s) => s.status === "completed"),
    [sessions]
  )
  const sessionsWithReports = useMemo(
    () => completedSessions.filter((s) => s.report),
    [completedSessions]
  )
  const sessionsWithFeedback = useMemo(
    () => completedSessions.filter((s) => s.feedback),
    [completedSessions]
  )

  // ─── Generate Weekly Insights ───
  const insights = useMemo(() => {
    const result: { type: "positive" | "warning" | "suggestion" | "info"; title: string; detail: string }[] = []
    const weekStart = last7[0]
    const weekEnd = last7[6]

    // --- MOOD INSIGHTS ---
    if (moodAverages) {
      if (moodAverages.stress >= 3.5) {
        result.push({
          type: "warning",
          title: "Elevated Stress Levels",
          detail: `Your average stress this week is ${moodAverages.stress.toFixed(1)}/5 -- this is higher than ideal. Consider adding breathing exercises or guided meditation to your daily routine. If stress persists, scheduling a therapy session may help develop coping strategies.`,
        })
      } else if (moodAverages.stress <= 2) {
        result.push({
          type: "positive",
          title: "Stress Under Control",
          detail: `Your average stress is only ${moodAverages.stress.toFixed(1)}/5 this week. Whatever you are doing is working -- keep up these healthy patterns and routines.`,
        })
      }

      if (moodAverages.sleep < 3) {
        result.push({
          type: "warning",
          title: "Sleep Quality Needs Attention",
          detail: `Your average sleep quality is ${moodAverages.sleep.toFixed(1)}/5. Poor sleep directly affects mood, focus, and stress resilience. Try setting a consistent bedtime, avoiding screens 1 hour before bed, and tracking sleep habits in the Habit Tracker.`,
        })
      } else if (moodAverages.sleep >= 4) {
        result.push({
          type: "positive",
          title: "Excellent Sleep Quality",
          detail: `Sleep quality average of ${moodAverages.sleep.toFixed(1)}/5 -- this is fantastic and contributes to better emotional regulation, focus, and energy levels throughout the day.`,
        })
      }

      if (moodAverages.energy < 2.5) {
        result.push({
          type: "suggestion",
          title: "Low Energy Levels Detected",
          detail: `Your average energy is ${moodAverages.energy.toFixed(1)}/5. Low energy can stem from poor sleep, dehydration, or lack of physical activity. Consider adding light exercise like a morning walk and ensuring you drink enough water throughout the day.`,
        })
      }

      if (moodAverages.focus < 2.5) {
        result.push({
          type: "suggestion",
          title: "Focus Could Improve",
          detail: `Focus level averages ${moodAverages.focus.toFixed(1)}/5. Mindfulness meditation, even for 5 minutes daily, has been shown to significantly improve concentration. Consider adding a mindfulness habit to your tracker.`,
        })
      }
    }

    // Mood trend insights
    if (stressTrend === "up") {
      result.push({
        type: "warning",
        title: "Stress is Trending Upward",
        detail: "Your stress levels have been increasing over the past week. This pattern often indicates building pressure. Consider talking to your therapist about stress management techniques or taking short breaks during the day.",
      })
    } else if (stressTrend === "down") {
      result.push({
        type: "positive",
        title: "Stress is Decreasing",
        detail: "Great news -- your stress levels are trending downward this week. Your current habits and routines seem to be helping. Maintain these patterns for continued improvement.",
      })
    }

    if (energyTrend === "up") {
      result.push({
        type: "positive",
        title: "Energy Levels Improving",
        detail: "Your energy has been trending upward recently. This often correlates with better sleep quality, regular exercise, and consistent daily routines.",
      })
    }

    // No mood data
    if (moodEntries.length === 0) {
      result.push({
        type: "suggestion",
        title: "Start Tracking Your Mood",
        detail: "You haven't logged any mood entries yet. Tracking your mood daily helps identify emotional patterns, triggers, and the impact of your habits on your mental health. Even a quick check-in takes less than a minute.",
      })
    } else if (weekMoods.length < 3) {
      result.push({
        type: "suggestion",
        title: "Log Mood More Frequently",
        detail: `You only logged ${weekMoods.length} mood entries this week. For accurate insights, try to log your mood at least 5 times per week -- ideally at the same time each day for consistency.`,
      })
    }

    // --- HABIT INSIGHTS ---
    if (habits.length === 0) {
      result.push({
        type: "suggestion",
        title: "Set Up Your Habit Tracker",
        detail: "You haven't created any habits yet. Start with 2-3 simple habits across different categories (exercise, sleep, mindfulness) to build a balanced wellness routine. Each completed habit earns points toward therapy session discounts!",
      })
    } else {
      // Category gap analysis
      const categories = Object.keys(habitsByCategory)
      const missingCategories: string[] = []
      if (!categories.includes("exercise")) missingCategories.push("Exercise")
      if (!categories.includes("sleep")) missingCategories.push("Sleep")
      if (!categories.includes("mindfulness")) missingCategories.push("Mindfulness")

      if (missingCategories.length > 0) {
        result.push({
          type: "suggestion",
          title: "Balance Your Wellness Categories",
          detail: `You are missing habits in: ${missingCategories.join(", ")}. A well-rounded wellness routine should include physical activity, sleep hygiene, and mindfulness practices. Consider adding at least one habit from each missing category.`,
        })
      }

      // Weekly completion rate
      if (weeklyCompletionRate >= 80) {
        result.push({
          type: "positive",
          title: `${weeklyCompletionRate}% Weekly Completion Rate`,
          detail: "Outstanding consistency this week! Completing over 80% of your habits shows real dedication to your wellness goals. This level of consistency is where lasting behavioral change happens.",
        })
      } else if (weeklyCompletionRate >= 50) {
        result.push({
          type: "info",
          title: `${weeklyCompletionRate}% Weekly Completion`,
          detail: "You are completing about half your habits this week. To improve, try focusing on your 2-3 most important habits first, then gradually add more as those become automatic.",
        })
      } else if (weeklyCompletionRate > 0) {
        result.push({
          type: "warning",
          title: `Only ${weeklyCompletionRate}% Completion This Week`,
          detail: "Habit completion is low this week. Consider reducing the number of habits you track so you can focus on building consistency with fewer, more impactful ones. Quality over quantity.",
        })
      }

      // Individual habit performance
      habits.forEach((h) => {
        const streak = getStreak(h.id)
        const weekDone = last7.filter((d) => h.completedDates.includes(d)).length
        if (streak >= 21) {
          result.push({
            type: "positive",
            title: `"${h.name}" is Now a Habit!`,
            detail: `${streak}-day streak! Research shows it takes about 21 days to form a habit. "${h.name}" has become part of your routine. This is a significant behavioral achievement.`,
          })
        } else if (weekDone === 0 && h.completedDates.length > 0) {
          result.push({
            type: "warning",
            title: `"${h.name}" Inactive This Week`,
            detail: `You haven't completed "${h.name}" at all this week despite previous engagement. Consider whether this habit is still relevant to your goals, or if you need to adjust the timing/approach.`,
          })
        }
      })
    }

    // --- STREAK & REWARD INSIGHTS ---
    if (bestStreak >= 7) {
      result.push({
        type: "positive",
        title: `${bestStreak}-Day Streak Active`,
        detail: currentStreakReward
          ? `Your streak earns you a ${currentStreakReward.discount} discount on therapy sessions! ${nextStreakReward ? `Keep going -- at ${nextStreakReward.days} days you unlock ${nextStreakReward.discount} off.` : "You have reached the maximum streak reward!"}`
          : `Great start! Keep your streak going to unlock therapy session discounts.`,
      })
    }

    if (totalPoints >= 100) {
      result.push({
        type: "info",
        title: `${totalPoints} Points Earned`,
        detail: "Your habit completion points can be redeemed for therapy session discounts in the Habit Tracker rewards section. The more consistent you are, the bigger the savings on your wellness journey.",
      })
    }

    // --- THERAPIST REPORT INSIGHTS (deep analysis) ---
    if (sessionsWithReports.length > 0) {
      const latestReport = sessionsWithReports[sessionsWithReports.length - 1]
      const reportText = (latestReport.report || "").toLowerCase()

      result.push({
        type: "info",
        title: `Latest Report: ${latestReport.therapistName}`,
        detail: `Session on ${new Date(latestReport.date).toLocaleDateString("en-US", { month: "long", day: "numeric" })} -- Review the key recommendations below and add prescribed exercises to your Habit Tracker for accountability.`,
      })

      // Analyze report content for specific topics
      if (reportText.includes("anxiety") || reportText.includes("anxious") || reportText.includes("worry")) {
        result.push({
          type: "suggestion",
          title: "Report Mentions Anxiety",
          detail: "Your therapist's report references anxiety. Consider tracking breathing exercises, grounding techniques, or progressive muscle relaxation in your Habit Tracker. These are evidence-based interventions that reduce anxiety symptoms when practiced consistently.",
        })
      }
      if (reportText.includes("sleep") || reportText.includes("insomnia") || reportText.includes("rest")) {
        result.push({
          type: "suggestion",
          title: "Sleep Discussed in Therapy",
          detail: "Sleep was mentioned in your therapist's report. Track sleep-related habits like consistent bedtime, screen-free evenings, and sleep journal entries. Share your habit tracker progress with your therapist in the next session.",
        })
      }
      if (reportText.includes("exercise") || reportText.includes("physical") || reportText.includes("movement") || reportText.includes("walk")) {
        result.push({
          type: "suggestion",
          title: "Physical Activity Recommended",
          detail: "Your therapist recommended physical activity. Even 20-30 minutes of daily movement significantly impacts mood and stress. Add exercise habits to your tracker and use the timer feature to stay consistent.",
        })
      }
      if (reportText.includes("meditation") || reportText.includes("mindful") || reportText.includes("breathing") || reportText.includes("relaxation")) {
        result.push({
          type: "suggestion",
          title: "Mindfulness Exercises Prescribed",
          detail: "Mindfulness or relaxation techniques were recommended by your therapist. Use the preset mindfulness habits (guided meditation, deep breathing, body scan) to build a daily practice. Consistency is key -- even 5 minutes daily makes a difference.",
        })
      }
      if (reportText.includes("journal") || reportText.includes("writing") || reportText.includes("diary")) {
        result.push({
          type: "suggestion",
          title: "Journaling Recommended",
          detail: "Your therapist suggested journaling as part of your treatment plan. Add gratitude journaling or therapy journal entries to your habit tracker. Writing about thoughts and emotions has been shown to improve emotional processing and reduce rumination.",
        })
      }
      if (reportText.includes("cbt") || reportText.includes("cognitive") || reportText.includes("thought")) {
        result.push({
          type: "info",
          title: "CBT Techniques in Your Plan",
          detail: "Cognitive-behavioral techniques were part of your session. Track CBT exercises in the Therapy category of your habit tracker. Consistent practice between sessions accelerates therapeutic progress by up to 50%.",
        })
      }
      if (reportText.includes("stress") || reportText.includes("overwhelm") || reportText.includes("burnout")) {
        result.push({
          type: "warning",
          title: "Stress Management Focus",
          detail: "Your therapist noted stress or overwhelm concerns. Cross-referencing with your mood data, prioritize stress-reduction habits like breathing exercises, short walks, and regular breaks. Track these consistently and review progress at your next session.",
        })
      }
      if (reportText.includes("relationship") || reportText.includes("family") || reportText.includes("partner") || reportText.includes("communication")) {
        result.push({
          type: "info",
          title: "Relationship Themes Discussed",
          detail: "Relationship or communication topics appeared in your report. Consider tracking self-care habits and communication exercises your therapist suggested. Maintaining emotional balance through personal habits improves relationship dynamics.",
        })
      }

      // Multi-session analysis
      if (sessionsWithReports.length >= 2) {
        const prevReport = sessionsWithReports[sessionsWithReports.length - 2]
        result.push({
          type: "info",
          title: `${sessionsWithReports.length} Session Reports Analyzed`,
          detail: `Tracking progress across ${sessionsWithReports.length} sessions with ${[...new Set(sessionsWithReports.map(s => s.therapistName))].join(", ")}. Your most recent session was on ${new Date(latestReport.date).toLocaleDateString()} and the previous on ${new Date(prevReport.date).toLocaleDateString()}. Consistent attendance combined with daily habit tracking produces the best outcomes.`,
        })
      }

      // Cross-reference: therapy habits
      const hasTherapyHabits = habits.some((h) => h.category === "therapy")
      if (!hasTherapyHabits) {
        result.push({
          type: "warning",
          title: "No Therapy Habits Tracked",
          detail: "You have therapist reports but no therapy-category habits in your tracker. Adding exercises your therapist recommended (CBT worksheets, grounding techniques, journaling) helps maintain progress between sessions and earns points toward discounts.",
        })
      }
    }

    // Feedback quality analysis
    if (sessionsWithFeedback.length > 0) {
      const positiveCount = sessionsWithFeedback.filter((s) =>
        s.feedback?.includes("5/5") || s.feedback?.includes("4/5")
      ).length
      const negativeCount = sessionsWithFeedback.filter((s) =>
        s.feedback?.includes("1/5") || s.feedback?.includes("2/5")
      ).length
      if (positiveCount > 0) {
        result.push({
          type: "positive",
          title: "Positive Therapy Experience",
          detail: `${positiveCount} of your ${sessionsWithFeedback.length} sessions received high ratings (4-5 stars). Continuing with a therapist you connect well with leads to better outcomes. Consider booking regular follow-up sessions.`,
        })
      }
      if (negativeCount > 0) {
        result.push({
          type: "suggestion",
          title: "Consider a Different Therapist",
          detail: `${negativeCount} session(s) received low ratings. It is perfectly normal to not click with every therapist. Browse other available therapists -- finding the right fit is one of the most important factors in therapy success.`,
        })
      }

      // Analyze feedback for "would not book again" patterns
      const wouldNotBook = sessionsWithFeedback.filter((s) =>
        s.feedback?.includes("No, I would prefer a different therapist")
      ).length
      if (wouldNotBook > 0) {
        result.push({
          type: "suggestion",
          title: "Explore New Therapists",
          detail: `You indicated you would prefer a different therapist in ${wouldNotBook} session feedback(s). This is completely okay -- therapeutic fit matters. Try filtering therapists by specialty or language to find someone who better matches your needs.`,
        })
      }
    }

    if (completedSessions.length === 0) {
      result.push({
        type: "suggestion",
        title: "Book Your First Therapy Session",
        detail: "You haven't completed any therapy sessions yet. Combining self-guided habits with professional guidance creates the most effective mental health strategy. Your first session is free!",
      })
    }

    // Fallback
    if (result.length === 0) {
      result.push({
        type: "info",
        title: "Building Your Profile",
        detail: "Keep logging mood entries, completing habits, and attending sessions. The more data available, the more personalized and actionable your weekly insights become.",
      })
    }

    return result
  }, [
    moodAverages, stressTrend, energyTrend, sleepTrend,
    moodEntries, weekMoods, habits, habitsByCategory,
    weeklyCompletionRate, bestStreak, totalPoints,
    currentStreakReward, nextStreakReward,
    completedSessions, sessionsWithReports, sessionsWithFeedback,
    last7, getStreak,
  ])

  const trendIcon = (trend: "up" | "down" | "stable") => {
    if (trend === "up") return <TrendingUp className="w-4 h-4" />
    if (trend === "down") return <TrendingDown className="w-4 h-4" />
    return <Minus className="w-4 h-4" />
  }

  const insightIcon = (type: "positive" | "warning" | "suggestion" | "info") => {
    if (type === "positive") return <CheckCircle2 className="w-5 h-5 text-green-600 shrink-0" />
    if (type === "warning") return <AlertTriangle className="w-5 h-5 text-amber-600 shrink-0" />
    if (type === "suggestion") return <Sparkles className="w-5 h-5 text-blue-600 shrink-0" />
    return <BrainCircuit className="w-5 h-5 text-primary shrink-0" />
  }

  const insightBg = (type: "positive" | "warning" | "suggestion" | "info") => {
    if (type === "positive") return "border-l-green-500 bg-green-50/50 dark:bg-green-950/20"
    if (type === "warning") return "border-l-amber-500 bg-amber-50/50 dark:bg-amber-950/20"
    if (type === "suggestion") return "border-l-blue-500 bg-blue-50/50 dark:bg-blue-950/20"
    return "border-l-primary bg-primary/5"
  }

  // Generate this week's date range label
  const weekLabel = `${new Date(last7[0]).toLocaleDateString("en-US", { month: "short", day: "numeric" })} - ${new Date(last7[6]).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}`

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl lg:text-3xl font-bold text-foreground flex items-center gap-3">
          <BrainCircuit className="w-8 h-8 text-primary" />
          AI-Driven Behavioral Insights
        </h1>
        <p className="text-muted-foreground mt-1">
          Weekly analysis of your mood, habits, and therapy progress -- updated every week
        </p>
        <Badge variant="outline" className="mt-2">
          <CalendarDays className="w-3 h-3 mr-1" />
          Week of {weekLabel}
        </Badge>
      </div>

      {/* Streak Discount Banner */}
      <Card className="bg-gradient-to-r from-primary/10 via-primary/5 to-transparent border-primary/20">
        <CardContent className="p-5">
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
            <div className="flex items-start gap-4">
              <div className="w-12 h-12 rounded-full bg-primary/20 flex items-center justify-center shrink-0">
                <Flame className="w-6 h-6 text-primary" />
              </div>
              <div>
                <h3 className="font-bold text-lg text-foreground">Streak Rewards -- Earn Discounts on Therapy!</h3>
                <p className="text-sm text-muted-foreground mt-1">
                  Maintain daily habit streaks to unlock therapy session discounts. Your best streak: <span className="font-bold text-primary">{bestStreak} days</span>
                </p>
              </div>
            </div>
            {currentStreakReward && (
              <Badge className="bg-primary text-primary-foreground text-sm px-4 py-1.5 shrink-0">
                {currentStreakReward.discount} OFF Active
              </Badge>
            )}
          </div>

          {/* Streak tiers */}
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3 mt-5">
            {STREAK_REWARDS.map((tier) => {
              const earned = bestStreak >= tier.days
              const isNext = !earned && (nextStreakReward?.days === tier.days)
              return (
                <div
                  key={tier.days}
                  className={cn(
                    "rounded-lg p-3 text-center border transition-colors",
                    earned
                      ? "bg-primary/10 border-primary/30"
                      : isNext
                        ? "bg-card border-primary/40 ring-1 ring-primary/20"
                        : "bg-card border-border opacity-60"
                  )}
                >
                  <div className={cn(
                    "w-8 h-8 rounded-full flex items-center justify-center mx-auto mb-1.5",
                    earned ? "bg-primary/20" : "bg-muted"
                  )}>
                    {earned ? (
                      <CheckCircle2 className="w-4 h-4 text-primary" />
                    ) : (
                      <Flame className="w-4 h-4 text-muted-foreground" />
                    )}
                  </div>
                  <p className="text-lg font-bold text-foreground">{tier.discount}</p>
                  <p className="text-xs text-muted-foreground">{tier.days}-day streak</p>
                  {isNext && bestStreak > 0 && (
                    <div className="mt-2">
                      <Progress value={(bestStreak / tier.days) * 100} className="h-1.5" />
                      <p className="text-[10px] text-muted-foreground mt-1">
                        {tier.days - bestStreak} days to go
                      </p>
                    </div>
                  )}
                </div>
              )
            })}
          </div>
        </CardContent>
      </Card>

      <Tabs defaultValue="insights" className="space-y-4">
        <TabsList>
          <TabsTrigger value="insights">Weekly Insights</TabsTrigger>
          <TabsTrigger value="mood">Mood Analysis</TabsTrigger>
          <TabsTrigger value="habits">Habit Performance</TabsTrigger>
          <TabsTrigger value="therapy">Therapy Summary</TabsTrigger>
        </TabsList>

        {/* ─── WEEKLY INSIGHTS TAB ─── */}
        <TabsContent value="insights" className="space-y-3">
          <Card className="bg-card border-border">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Sparkles className="w-5 h-5 text-primary" />
                This Week{"'"}s Personalized Insights
              </CardTitle>
              <CardDescription>
                AI-generated analysis based on your mood history, habit completion, and therapist reports
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              {insights.map((insight, i) => (
                <div
                  key={i}
                  className={cn(
                    "border-l-4 rounded-r-lg p-4",
                    insightBg(insight.type)
                  )}
                >
                  <div className="flex items-start gap-3">
                    {insightIcon(insight.type)}
                    <div>
                      <h4 className="font-semibold text-foreground">{insight.title}</h4>
                      <p className="text-sm text-muted-foreground mt-1 leading-relaxed">{insight.detail}</p>
                    </div>
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>
        </TabsContent>

        {/* ─── MOOD ANALYSIS TAB ─── */}
        <TabsContent value="mood" className="space-y-4">
          {moodAverages ? (
            <>
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                {[
                  { label: "Stress", value: moodAverages.stress, trend: stressTrend, color: "text-red-600", bg: "bg-red-100", barColor: "bg-red-400", invertGood: true },
                  { label: "Energy", value: moodAverages.energy, trend: energyTrend, color: "text-amber-600", bg: "bg-amber-100", barColor: "bg-amber-400", invertGood: false },
                  { label: "Sleep", value: moodAverages.sleep, trend: sleepTrend, color: "text-blue-600", bg: "bg-blue-100", barColor: "bg-blue-400", invertGood: false },
                  { label: "Focus", value: moodAverages.focus, trend: "stable" as const, color: "text-primary", bg: "bg-primary/10", barColor: "bg-primary", invertGood: false },
                ].map((metric) => {
                  const trendGood = metric.invertGood
                    ? metric.trend === "down"
                    : metric.trend === "up"
                  return (
                    <Card key={metric.label} className="bg-card border-border">
                      <CardContent className="p-4">
                        <div className="flex items-center justify-between mb-2">
                          <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">{metric.label}</p>
                          <div className={cn(
                            "flex items-center gap-1 text-xs font-medium",
                            trendGood ? "text-green-600" : metric.trend === "stable" ? "text-muted-foreground" : "text-red-500"
                          )}>
                            {trendIcon(metric.trend)}
                            {metric.trend}
                          </div>
                        </div>
                        <p className="text-2xl font-bold">{metric.value.toFixed(1)}<span className="text-sm text-muted-foreground">/5</span></p>
                        <div className="h-1.5 bg-muted rounded-full mt-3 overflow-hidden">
                          <div className={cn("h-full rounded-full", metric.barColor)} style={{ width: `${(metric.value / 5) * 100}%` }} />
                        </div>
                      </CardContent>
                    </Card>
                  )
                })}
              </div>

              <Card className="bg-card border-border">
                <CardHeader>
                  <CardTitle>Mood Pattern Analysis</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  {moodAverages.stress > 3 && moodAverages.sleep < 3 && (
                    <div className="border-l-4 border-l-red-500 bg-red-50/50 dark:bg-red-950/20 rounded-r-lg p-4">
                      <div className="flex items-start gap-3">
                        <AlertTriangle className="w-5 h-5 text-red-600 shrink-0 mt-0.5" />
                        <div>
                          <h4 className="font-semibold">High Stress + Poor Sleep Pattern</h4>
                          <p className="text-sm text-muted-foreground mt-1">Your data shows a correlation between high stress and poor sleep quality. This is a common cycle -- stress disrupts sleep, and poor sleep increases stress. Prioritize sleep hygiene habits and consider discussing this pattern with your therapist.</p>
                        </div>
                      </div>
                    </div>
                  )}
                  {moodAverages.energy < 2.5 && moodAverages.sleep < 3 && (
                    <div className="border-l-4 border-l-amber-500 bg-amber-50/50 dark:bg-amber-950/20 rounded-r-lg p-4">
                      <div className="flex items-start gap-3">
                        <AlertTriangle className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
                        <div>
                          <h4 className="font-semibold">Low Energy Linked to Sleep</h4>
                          <p className="text-sm text-muted-foreground mt-1">Your low energy levels appear connected to sleep quality. Improving sleep consistency -- going to bed and waking up at the same time daily -- is the most effective way to boost daytime energy.</p>
                        </div>
                      </div>
                    </div>
                  )}
                  {moodAverages.stress <= 2 && moodAverages.energy >= 3.5 && (
                    <div className="border-l-4 border-l-green-500 bg-green-50/50 dark:bg-green-950/20 rounded-r-lg p-4">
                      <div className="flex items-start gap-3">
                        <CheckCircle2 className="w-5 h-5 text-green-600 shrink-0 mt-0.5" />
                        <div>
                          <h4 className="font-semibold">Excellent Balance</h4>
                          <p className="text-sm text-muted-foreground mt-1">Low stress combined with good energy levels indicates a healthy mental state. Your current habits and routines are clearly contributing to positive wellbeing. Document what is working so you can return to this pattern during difficult times.</p>
                        </div>
                      </div>
                    </div>
                  )}
                  <div className="text-sm text-muted-foreground italic">
                    Analysis based on {weekMoods.length > 0 ? weekMoods.length : monthMoods.length} mood entries from the {weekMoods.length > 0 ? "past week" : "past month"}.
                    {weekMoods.length < 5 && " Log mood daily for more accurate pattern detection."}
                  </div>
                </CardContent>
              </Card>
            </>
          ) : (
            <Card className="bg-card border-border">
              <CardContent className="py-12 text-center">
                <div className="w-14 h-14 bg-muted rounded-full flex items-center justify-center mx-auto mb-4">
                  <TrendingUp className="w-7 h-7 text-muted-foreground" />
                </div>
                <h3 className="font-semibold text-lg mb-2">No mood data yet</h3>
                <p className="text-muted-foreground text-sm">Start logging your mood daily to unlock mood trend analysis and personalized insights.</p>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        {/* ─── HABITS PERFORMANCE TAB ─── */}
        <TabsContent value="habits" className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <Card className="bg-card border-border">
              <CardContent className="p-4 flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
                  <Target className="w-5 h-5 text-primary" />
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">Weekly Rate</p>
                  <p className="text-xl font-bold">{weeklyCompletionRate}%</p>
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
                  <p className="text-xl font-bold">{bestStreak} days</p>
                </div>
              </CardContent>
            </Card>
            <Card className="bg-card border-border">
              <CardContent className="p-4 flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-amber-100 flex items-center justify-center shrink-0">
                  <Award className="w-5 h-5 text-amber-600" />
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">Total Points</p>
                  <p className="text-xl font-bold">{totalPoints}</p>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Category breakdown */}
          {habits.length > 0 ? (
            <Card className="bg-card border-border">
              <CardHeader>
                <CardTitle>Category Performance</CardTitle>
                <CardDescription>Habit completion by category this week</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {Object.entries(habitsByCategory).map(([cat, catHabits]) => {
                  const Icon = CATEGORY_ICONS[cat] || Target
                  const weekTotal = catHabits.length * 7
                  const weekDone = catHabits.reduce(
                    (sum, h) => sum + last7.filter((d) => h.completedDates.includes(d)).length,
                    0
                  )
                  const rate = weekTotal > 0 ? Math.round((weekDone / weekTotal) * 100) : 0
                  return (
                    <div key={cat}>
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center gap-2">
                          <Icon className="w-4 h-4 text-muted-foreground" />
                          <span className="text-sm font-medium capitalize">{cat}</span>
                          <Badge variant="outline" className="text-xs">{catHabits.length} habits</Badge>
                        </div>
                        <span className="text-sm font-bold">{rate}%</span>
                      </div>
                      <Progress value={rate} className="h-2" />
                      <div className="flex flex-wrap gap-2 mt-2">
                        {catHabits.map((h) => {
                          const streak = getStreak(h.id)
                          const todayDone = h.completedDates.includes(last7[6])
                          return (
                            <Badge
                              key={h.id}
                              variant={todayDone ? "default" : "outline"}
                              className="text-xs"
                            >
                              {h.name}
                              {streak > 0 && (
                                <span className="ml-1 text-[10px]">{streak}d</span>
                              )}
                            </Badge>
                          )
                        })}
                      </div>
                    </div>
                  )
                })}
              </CardContent>
            </Card>
          ) : (
            <Card className="bg-card border-border">
              <CardContent className="py-12 text-center">
                <div className="w-14 h-14 bg-muted rounded-full flex items-center justify-center mx-auto mb-4">
                  <Target className="w-7 h-7 text-muted-foreground" />
                </div>
                <h3 className="font-semibold text-lg mb-2">No habits tracked yet</h3>
                <p className="text-muted-foreground text-sm">Add habits in the Habit Tracker to see category-level performance analysis here.</p>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        {/* ─── THERAPY SUMMARY TAB ─── */}
        <TabsContent value="therapy" className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <Card className="bg-card border-border">
              <CardContent className="p-4 flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
                  <Clock className="w-5 h-5 text-primary" />
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">Total Sessions</p>
                  <p className="text-xl font-bold">{completedSessions.length}</p>
                </div>
              </CardContent>
            </Card>
            <Card className="bg-card border-border">
              <CardContent className="p-4 flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center shrink-0">
                  <FileText className="w-5 h-5 text-blue-600" />
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">Reports</p>
                  <p className="text-xl font-bold">{sessionsWithReports.length}</p>
                </div>
              </CardContent>
            </Card>
            <Card className="bg-card border-border">
              <CardContent className="p-4 flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-green-100 flex items-center justify-center shrink-0">
                  <Shield className="w-5 h-5 text-green-600" />
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">Feedback Given</p>
                  <p className="text-xl font-bold">{sessionsWithFeedback.length}</p>
                </div>
              </CardContent>
            </Card>
          </div>

          {sessionsWithReports.length > 0 ? (
            <>
            <Card className="bg-card border-border">
              <CardHeader>
                <CardTitle>Therapist Reports & Recommendations</CardTitle>
                <CardDescription>Key takeaways from your therapy sessions that inform your daily habits</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {sessionsWithReports.slice(-3).reverse().map((session) => {
                  const report = (session.report || "").toLowerCase()
                  const topics: string[] = []
                  if (report.includes("anxiety") || report.includes("anxious")) topics.push("Anxiety")
                  if (report.includes("sleep") || report.includes("insomnia")) topics.push("Sleep")
                  if (report.includes("stress") || report.includes("overwhelm")) topics.push("Stress")
                  if (report.includes("exercise") || report.includes("physical")) topics.push("Exercise")
                  if (report.includes("meditation") || report.includes("mindful")) topics.push("Mindfulness")
                  if (report.includes("cbt") || report.includes("cognitive")) topics.push("CBT")
                  if (report.includes("journal")) topics.push("Journaling")
                  if (report.includes("relationship") || report.includes("family")) topics.push("Relationships")
                  if (report.includes("depression") || report.includes("mood")) topics.push("Mood")
                  return (
                    <div key={session.id} className="border border-border rounded-lg p-4 space-y-3">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <FileText className="w-4 h-4 text-primary" />
                          <span className="font-medium text-sm">{session.therapistName}</span>
                        </div>
                        <Badge variant="outline" className="text-xs">
                          {new Date(session.date).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}
                        </Badge>
                      </div>
                      {topics.length > 0 && (
                        <div className="flex flex-wrap gap-1.5">
                          {topics.map((t) => (
                            <Badge key={t} variant="secondary" className="text-xs">{t}</Badge>
                          ))}
                        </div>
                      )}
                      <p className="text-sm text-muted-foreground whitespace-pre-line line-clamp-6">
                        {session.report}
                      </p>
                    </div>
                  )
                })}
              </CardContent>
            </Card>

            {/* Feedback Analysis */}
            {sessionsWithFeedback.length > 0 && (
              <Card className="bg-card border-border">
                <CardHeader>
                  <CardTitle>Your Feedback Analysis</CardTitle>
                  <CardDescription>Patterns from your session feedback help optimize future sessions</CardDescription>
                </CardHeader>
                <CardContent className="space-y-3">
                  {sessionsWithFeedback.slice(-3).reverse().map((session) => {
                    const lines = (session.feedback || "").split("\n").filter(l => l.trim())
                    const ratingLine = lines.find(l => l.includes("Overall Rating"))
                    const rating = ratingLine ? parseInt(ratingLine.split(":")[1]) : 0
                    return (
                      <div key={session.id} className={cn(
                        "border-l-4 rounded-r-lg p-4",
                        rating >= 4 ? "border-l-green-500 bg-green-50/50 dark:bg-green-950/20" :
                        rating >= 3 ? "border-l-amber-500 bg-amber-50/50 dark:bg-amber-950/20" :
                        "border-l-red-500 bg-red-50/50 dark:bg-red-950/20"
                      )}>
                        <div className="flex items-center justify-between mb-2">
                          <span className="font-medium text-sm">{session.therapistName}</span>
                          <div className="flex items-center gap-1">
                            {Array.from({ length: 5 }).map((_, i) => (
                              <Award key={i} className={cn("w-3.5 h-3.5", i < rating ? "text-amber-400 fill-amber-400" : "text-muted-foreground/20")} />
                            ))}
                          </div>
                        </div>
                        <div className="text-xs text-muted-foreground space-y-0.5">
                          {lines.filter(l => !l.includes("Overall Rating") && !l.includes("Therapist:") && l.includes(":")).slice(0, 4).map((line, i) => (
                            <p key={i}>{line}</p>
                          ))}
                        </div>
                      </div>
                    )
                  })}
                </CardContent>
              </Card>
            )}
            </>
          ) : (
            <Card className="bg-card border-border">
              <CardContent className="py-12 text-center">
                <div className="w-14 h-14 bg-muted rounded-full flex items-center justify-center mx-auto mb-4">
                  <FileText className="w-7 h-7 text-muted-foreground" />
                </div>
                <h3 className="font-semibold text-lg mb-2">No therapy reports yet</h3>
                <p className="text-muted-foreground text-sm">Complete a therapy session to receive a report. Reports are analyzed here to generate personalized recommendations.</p>
              </CardContent>
            </Card>
          )}
        </TabsContent>
      </Tabs>
    </div>
  )
}
