"use client"

import { useState, useMemo } from "react"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from "@/components/ui/dialog"
import { useApp } from "@/lib/app-context"
import { Plus, Trash2, Check, Target, Flame, CalendarDays } from "lucide-react"
import { cn } from "@/lib/utils"

const habitColors = [
  { name: "Teal", value: "bg-teal-500" },
  { name: "Blue", value: "bg-blue-500" },
  { name: "Green", value: "bg-green-500" },
  { name: "Orange", value: "bg-orange-500" },
  { name: "Pink", value: "bg-pink-500" },
  { name: "Purple", value: "bg-violet-500" },
]

function getWeekDates() {
  const today = new Date()
  const dates = []
  for (let i = 6; i >= 0; i--) {
    const date = new Date(today)
    date.setDate(today.getDate() - i)
    dates.push(date.toISOString().split("T")[0])
  }
  return dates
}

export default function HabitTrackerPage() {
  const { habits, addHabit, toggleHabitCompletion, deleteHabit } = useApp()
  const [showAddDialog, setShowAddDialog] = useState(false)
  const [newHabitName, setNewHabitName] = useState("")
  const [newHabitFrequency, setNewHabitFrequency] = useState<"daily" | "weekly">("daily")
  const [newHabitColor, setNewHabitColor] = useState(habitColors[0].value)
  const [habitToDelete, setHabitToDelete] = useState<string | null>(null)

  const weekDates = useMemo(() => getWeekDates(), [])
  const today = new Date().toISOString().split("T")[0]

  const handleAddHabit = () => {
    if (!newHabitName.trim()) return
    addHabit({
      name: newHabitName,
      frequency: newHabitFrequency,
      color: newHabitColor,
    })
    setNewHabitName("")
    setNewHabitFrequency("daily")
    setNewHabitColor(habitColors[0].value)
    setShowAddDialog(false)
  }

  const handleDeleteHabit = () => {
    if (habitToDelete) {
      deleteHabit(habitToDelete)
      setHabitToDelete(null)
    }
  }

  const getStreak = (completedDates: string[]) => {
    if (completedDates.length === 0) return 0
    const sorted = [...completedDates].sort().reverse()
    let streak = 0
    const checkDate = new Date()
    
    for (let i = 0; i < 365; i++) {
      const dateStr = checkDate.toISOString().split("T")[0]
      if (sorted.includes(dateStr)) {
        streak++
        checkDate.setDate(checkDate.getDate() - 1)
      } else if (i > 0) {
        break
      } else {
        checkDate.setDate(checkDate.getDate() - 1)
      }
    }
    return streak
  }

  const totalCompletedToday = habits.filter(h => h.completedDates.includes(today)).length
  const totalHabits = habits.length

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl lg:text-3xl font-bold text-foreground">Habit Tracker</h1>
          <p className="text-muted-foreground mt-1">Build healthy habits one day at a time</p>
        </div>
        <Button onClick={() => setShowAddDialog(true)}>
          <Plus className="w-4 h-4 mr-2" />
          Add Habit
        </Button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <Card className="bg-card border-border">
          <CardContent className="p-4 flex items-center gap-4">
            <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center">
              <Target className="w-6 h-6 text-primary" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Total Habits</p>
              <p className="text-2xl font-bold">{totalHabits}</p>
            </div>
          </CardContent>
        </Card>
        <Card className="bg-card border-border">
          <CardContent className="p-4 flex items-center gap-4">
            <div className="w-12 h-12 rounded-full bg-green-100 flex items-center justify-center">
              <Check className="w-6 h-6 text-green-600" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Completed Today</p>
              <p className="text-2xl font-bold">{totalCompletedToday}/{totalHabits}</p>
            </div>
          </CardContent>
        </Card>
        <Card className="bg-card border-border">
          <CardContent className="p-4 flex items-center gap-4">
            <div className="w-12 h-12 rounded-full bg-orange-100 flex items-center justify-center">
              <Flame className="w-6 h-6 text-orange-600" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Best Streak</p>
              <p className="text-2xl font-bold">
                {habits.length > 0 ? Math.max(...habits.map(h => getStreak(h.completedDates))) : 0} days
              </p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Habits List */}
      {habits.length === 0 ? (
        <Card className="bg-card border-border">
          <CardContent className="py-16 text-center">
            <div className="w-16 h-16 bg-muted rounded-full flex items-center justify-center mx-auto mb-4">
              <CalendarDays className="w-8 h-8 text-muted-foreground" />
            </div>
            <h3 className="font-semibold text-lg mb-2">No habits yet</h3>
            <p className="text-muted-foreground mb-4">
              Create your first habit to start tracking your progress
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
              Click on a day to mark a habit as complete
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <table className="w-full min-w-[600px]">
                <thead>
                  <tr>
                    <th className="text-left py-3 px-4 text-sm font-medium text-muted-foreground w-48">Habit</th>
                    {weekDates.map((date) => {
                      const d = new Date(date)
                      const isToday = date === today
                      return (
                        <th key={date} className={cn(
                          "text-center py-3 px-2 text-sm font-medium w-16",
                          isToday ? "text-primary" : "text-muted-foreground"
                        )}>
                          <div className="flex flex-col items-center">
                            <span className="text-xs">{d.toLocaleDateString("en-US", { weekday: "short" })}</span>
                            <span className={cn(
                              "w-7 h-7 rounded-full flex items-center justify-center mt-1",
                              isToday && "bg-primary text-primary-foreground"
                            )}>
                              {d.getDate()}
                            </span>
                          </div>
                        </th>
                      )
                    })}
                    <th className="text-center py-3 px-2 text-sm font-medium text-muted-foreground w-20">Streak</th>
                    <th className="w-12"></th>
                  </tr>
                </thead>
                <tbody>
                  {habits.map((habit) => {
                    const streak = getStreak(habit.completedDates)
                    return (
                      <tr key={habit.id} className="border-t border-border">
                        <td className="py-3 px-4">
                          <div className="flex items-center gap-3">
                            <div className={cn("w-3 h-3 rounded-full", habit.color)} />
                            <div>
                              <p className="font-medium text-sm">{habit.name}</p>
                              <p className="text-xs text-muted-foreground capitalize">{habit.frequency}</p>
                            </div>
                          </div>
                        </td>
                        {weekDates.map((date) => {
                          const isCompleted = habit.completedDates.includes(date)
                          return (
                            <td key={date} className="text-center py-3 px-2">
                              <button
                                onClick={() => toggleHabitCompletion(habit.id, date)}
                                className={cn(
                                  "w-9 h-9 rounded-lg flex items-center justify-center transition-all border-2",
                                  isCompleted
                                    ? `${habit.color} border-transparent text-white`
                                    : "border-border hover:border-primary/50 hover:bg-muted"
                                )}
                                aria-label={isCompleted ? "Mark as incomplete" : "Mark as complete"}
                              >
                                {isCompleted && <Check className="w-5 h-5" />}
                              </button>
                            </td>
                          )
                        })}
                        <td className="text-center py-3 px-2">
                          <div className="flex items-center justify-center gap-1">
                            <Flame className={cn("w-4 h-4", streak > 0 ? "text-orange-500" : "text-muted-foreground/30")} />
                            <span className={cn("font-medium text-sm", streak > 0 ? "text-foreground" : "text-muted-foreground")}>
                              {streak}
                            </span>
                          </div>
                        </td>
                        <td className="py-3 px-2">
                          <Button
                            variant="ghost"
                            size="icon"
                            className="w-8 h-8 text-muted-foreground hover:text-destructive"
                            onClick={() => setHabitToDelete(habit.id)}
                          >
                            <Trash2 className="w-4 h-4" />
                            <span className="sr-only">Delete habit</span>
                          </Button>
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

      {/* Add Habit Dialog */}
      <Dialog open={showAddDialog} onOpenChange={setShowAddDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Add New Habit</DialogTitle>
            <DialogDescription>
              Create a new habit to track daily or weekly
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="habit-name">Habit Name</Label>
              <Input
                id="habit-name"
                placeholder="e.g., Meditate for 10 minutes"
                value={newHabitName}
                onChange={(e) => setNewHabitName(e.target.value)}
              />
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
            <div className="space-y-2">
              <Label>Color</Label>
              <div className="flex gap-2">
                {habitColors.map((color) => (
                  <button
                    key={color.value}
                    onClick={() => setNewHabitColor(color.value)}
                    className={cn(
                      "w-8 h-8 rounded-full transition-all",
                      color.value,
                      newHabitColor === color.value && "ring-2 ring-offset-2 ring-primary"
                    )}
                    aria-label={color.name}
                  />
                ))}
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowAddDialog(false)}>
              Cancel
            </Button>
            <Button onClick={handleAddHabit} disabled={!newHabitName.trim()}>
              Add Habit
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <Dialog open={!!habitToDelete} onOpenChange={() => setHabitToDelete(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete Habit</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete this habit? This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setHabitToDelete(null)}>
              Cancel
            </Button>
            <Button variant="destructive" onClick={handleDeleteHabit}>
              Delete
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
