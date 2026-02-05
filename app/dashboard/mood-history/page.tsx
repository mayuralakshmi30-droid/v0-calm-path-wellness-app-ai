"use client"

import { useState, useMemo } from "react"
import Link from "next/link"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { useApp } from "@/lib/app-context"
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from "recharts"
import { Frown, Meh, Smile, SmilePlus, Angry, Plus, Calendar } from "lucide-react"
import { cn } from "@/lib/utils"

const moodIcons = {
  "very-sad": { icon: Angry, color: "text-red-500", bg: "bg-red-100" },
  "sad": { icon: Frown, color: "text-orange-500", bg: "bg-orange-100" },
  "neutral": { icon: Meh, color: "text-yellow-500", bg: "bg-yellow-100" },
  "happy": { icon: Smile, color: "text-lime-500", bg: "bg-lime-100" },
  "very-happy": { icon: SmilePlus, color: "text-green-500", bg: "bg-green-100" },
}

export default function MoodHistoryPage() {
  const { moodEntries } = useApp()
  const [filter, setFilter] = useState<"week" | "month" | "all">("week")

  const filteredEntries = useMemo(() => {
    const now = new Date()
    return moodEntries.filter((entry) => {
      const entryDate = new Date(entry.date)
      if (filter === "week") {
        const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000)
        return entryDate >= weekAgo
      }
      if (filter === "month") {
        const monthAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000)
        return entryDate >= monthAgo
      }
      return true
    }).sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
  }, [moodEntries, filter])

  const chartData = useMemo(() => {
    return filteredEntries.map((entry) => ({
      date: new Date(entry.date).toLocaleDateString("en-US", { month: "short", day: "numeric" }),
      stress: entry.stressLevel,
      energy: entry.energyLevel,
      sleep: entry.sleepQuality,
      focus: entry.focusLevel,
    }))
  }, [filteredEntries])

  const averages = useMemo(() => {
    if (filteredEntries.length === 0) return null
    return {
      stress: (filteredEntries.reduce((acc, e) => acc + e.stressLevel, 0) / filteredEntries.length).toFixed(1),
      energy: (filteredEntries.reduce((acc, e) => acc + e.energyLevel, 0) / filteredEntries.length).toFixed(1),
      sleep: (filteredEntries.reduce((acc, e) => acc + e.sleepQuality, 0) / filteredEntries.length).toFixed(1),
      focus: (filteredEntries.reduce((acc, e) => acc + e.focusLevel, 0) / filteredEntries.length).toFixed(1),
    }
  }, [filteredEntries])

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl lg:text-3xl font-bold text-foreground">Mood History</h1>
          <p className="text-muted-foreground mt-1">Track your emotional patterns over time</p>
        </div>
        <div className="flex items-center gap-3">
          <Select value={filter} onValueChange={(v) => setFilter(v as typeof filter)}>
            <SelectTrigger className="w-32">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="week">This Week</SelectItem>
              <SelectItem value="month">This Month</SelectItem>
              <SelectItem value="all">All Time</SelectItem>
            </SelectContent>
          </Select>
          <Button asChild>
            <Link href="/dashboard/mood-tracker">
              <Plus className="w-4 h-4 mr-2" />
              Log Mood
            </Link>
          </Button>
        </div>
      </div>

      {moodEntries.length === 0 ? (
        <Card className="bg-card border-border">
          <CardContent className="py-16 text-center">
            <div className="w-16 h-16 bg-muted rounded-full flex items-center justify-center mx-auto mb-4">
              <Calendar className="w-8 h-8 text-muted-foreground" />
            </div>
            <h3 className="font-semibold text-lg mb-2">No mood entries yet</h3>
            <p className="text-muted-foreground mb-4">
              Start tracking your mood to see patterns and insights
            </p>
            <Button asChild>
              <Link href="/dashboard/mood-tracker">Log Your First Mood</Link>
            </Button>
          </CardContent>
        </Card>
      ) : (
        <>
          {/* Average Stats */}
          {averages && (
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
              <Card className="bg-card border-border">
                <CardContent className="p-4">
                  <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">Avg Stress</p>
                  <p className="text-2xl font-bold mt-1">{averages.stress}</p>
                  <div className="h-1.5 bg-muted rounded-full mt-2 overflow-hidden">
                    <div className="h-full bg-red-400" style={{ width: `${(Number(averages.stress) / 5) * 100}%` }} />
                  </div>
                </CardContent>
              </Card>
              <Card className="bg-card border-border">
                <CardContent className="p-4">
                  <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">Avg Energy</p>
                  <p className="text-2xl font-bold mt-1">{averages.energy}</p>
                  <div className="h-1.5 bg-muted rounded-full mt-2 overflow-hidden">
                    <div className="h-full bg-amber-400" style={{ width: `${(Number(averages.energy) / 5) * 100}%` }} />
                  </div>
                </CardContent>
              </Card>
              <Card className="bg-card border-border">
                <CardContent className="p-4">
                  <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">Avg Sleep</p>
                  <p className="text-2xl font-bold mt-1">{averages.sleep}</p>
                  <div className="h-1.5 bg-muted rounded-full mt-2 overflow-hidden">
                    <div className="h-full bg-blue-400" style={{ width: `${(Number(averages.sleep) / 5) * 100}%` }} />
                  </div>
                </CardContent>
              </Card>
              <Card className="bg-card border-border">
                <CardContent className="p-4">
                  <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">Avg Focus</p>
                  <p className="text-2xl font-bold mt-1">{averages.focus}</p>
                  <div className="h-1.5 bg-muted rounded-full mt-2 overflow-hidden">
                    <div className="h-full bg-primary" style={{ width: `${(Number(averages.focus) / 5) * 100}%` }} />
                  </div>
                </CardContent>
              </Card>
            </div>
          )}

          {/* Chart */}
          {chartData.length > 0 && (
            <Card className="bg-card border-border">
              <CardHeader>
                <CardTitle>Mood Trends</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="h-[300px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={chartData}>
                      <CartesianGrid strokeDasharray="3 3" className="stroke-border" />
                      <XAxis dataKey="date" className="text-xs" tick={{ fill: 'hsl(var(--muted-foreground))' }} />
                      <YAxis domain={[0, 5]} ticks={[1, 2, 3, 4, 5]} tick={{ fill: 'hsl(var(--muted-foreground))' }} />
                      <Tooltip 
                        contentStyle={{ 
                          backgroundColor: 'hsl(var(--card))',
                          border: '1px solid hsl(var(--border))',
                          borderRadius: '8px'
                        }}
                      />
                      <Legend />
                      <Line type="monotone" dataKey="stress" stroke="#ef4444" strokeWidth={2} dot={{ r: 4 }} name="Stress" />
                      <Line type="monotone" dataKey="energy" stroke="#f59e0b" strokeWidth={2} dot={{ r: 4 }} name="Energy" />
                      <Line type="monotone" dataKey="sleep" stroke="#3b82f6" strokeWidth={2} dot={{ r: 4 }} name="Sleep" />
                      <Line type="monotone" dataKey="focus" stroke="#2f9e8f" strokeWidth={2} dot={{ r: 4 }} name="Focus" />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Entries Table */}
          <Card className="bg-card border-border">
            <CardHeader>
              <CardTitle>Recent Entries</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-border">
                      <th className="text-left py-3 px-4 text-sm font-medium text-muted-foreground">Date</th>
                      <th className="text-center py-3 px-4 text-sm font-medium text-muted-foreground">Stress</th>
                      <th className="text-center py-3 px-4 text-sm font-medium text-muted-foreground">Energy</th>
                      <th className="text-center py-3 px-4 text-sm font-medium text-muted-foreground">Sleep</th>
                      <th className="text-center py-3 px-4 text-sm font-medium text-muted-foreground">Focus</th>
                      <th className="text-center py-3 px-4 text-sm font-medium text-muted-foreground">Mood</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredEntries.slice().reverse().map((entry) => {
                      const MoodIcon = moodIcons[entry.overallMood].icon
                      return (
                        <tr key={entry.id} className="border-b border-border last:border-0">
                          <td className="py-3 px-4 text-sm">
                            {new Date(entry.date).toLocaleDateString("en-US", {
                              weekday: "short",
                              month: "short",
                              day: "numeric",
                            })}
                          </td>
                          <td className="py-3 px-4 text-center">
                            <span className="inline-flex items-center justify-center w-8 h-8 rounded-full bg-red-100 text-red-600 text-sm font-medium">
                              {entry.stressLevel}
                            </span>
                          </td>
                          <td className="py-3 px-4 text-center">
                            <span className="inline-flex items-center justify-center w-8 h-8 rounded-full bg-amber-100 text-amber-600 text-sm font-medium">
                              {entry.energyLevel}
                            </span>
                          </td>
                          <td className="py-3 px-4 text-center">
                            <span className="inline-flex items-center justify-center w-8 h-8 rounded-full bg-blue-100 text-blue-600 text-sm font-medium">
                              {entry.sleepQuality}
                            </span>
                          </td>
                          <td className="py-3 px-4 text-center">
                            <span className="inline-flex items-center justify-center w-8 h-8 rounded-full bg-primary/10 text-primary text-sm font-medium">
                              {entry.focusLevel}
                            </span>
                          </td>
                          <td className="py-3 px-4">
                            <div className="flex justify-center">
                              <div className={cn("w-8 h-8 rounded-full flex items-center justify-center", moodIcons[entry.overallMood].bg)}>
                                <MoodIcon className={cn("w-5 h-5", moodIcons[entry.overallMood].color)} />
                              </div>
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
        </>
      )}
    </div>
  )
}
