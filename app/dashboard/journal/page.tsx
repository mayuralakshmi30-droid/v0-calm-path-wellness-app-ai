"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Switch } from "@/components/ui/switch"
import { useApp } from "@/lib/app-context"
import { BookOpen, Plus, Calendar, ChevronRight, Pencil, Clock, Sparkles, Shield, Info, X } from "lucide-react"
import { cn } from "@/lib/utils"

export default function JournalPage() {
  const { journalEntries, addJournalEntry } = useApp()
  const [isWriting, setIsWriting] = useState(false)
  const [content, setContent] = useState("")
  const [selectedEntry, setSelectedEntry] = useState<typeof journalEntries[0] | null>(null)
  const [aiPermission, setAiPermission] = useState<boolean | null>(null)
  const [showPermissionBanner, setShowPermissionBanner] = useState(true)

  useEffect(() => {
    const stored = localStorage.getItem("journalAiPermission")
    if (stored !== null) {
      setAiPermission(stored === "true")
      setShowPermissionBanner(false)
    }
  }, [])

  const handlePermissionChange = (granted: boolean) => {
    setAiPermission(granted)
    localStorage.setItem("journalAiPermission", String(granted))
    setShowPermissionBanner(false)
  }

  const handleSave = () => {
    if (!content.trim()) return
    addJournalEntry(content)
    setContent("")
    setIsWriting(false)
  }

  const groupedEntries = journalEntries.reduce((acc, entry) => {
    const date = new Date(entry.date)
    const monthYear = date.toLocaleDateString("en-US", { month: "long", year: "numeric" })
    if (!acc[monthYear]) acc[monthYear] = []
    acc[monthYear].push(entry)
    return acc
  }, {} as Record<string, typeof journalEntries>)

  const todayStr = new Date().toISOString().split("T")[0]
  const hasEntryToday = journalEntries.some(e => e.date === todayStr)

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl lg:text-3xl font-bold text-foreground">Journal</h1>
          <p className="text-muted-foreground mt-1">Write about your thoughts and experiences</p>
        </div>
        <Button onClick={() => setIsWriting(true)}>
          <Plus className="w-4 h-4 mr-2" />
          New Entry
        </Button>
      </div>

      {/* AI Permission Banner */}
      {showPermissionBanner && aiPermission === null && (
        <Card className="bg-gradient-to-r from-primary/5 to-accent/5 border-primary/20 relative overflow-hidden">
          <button
            onClick={() => setShowPermissionBanner(false)}
            className="absolute top-3 right-3 text-muted-foreground hover:text-foreground transition-colors"
            aria-label="Dismiss"
          >
            <X className="w-4 h-4" />
          </button>
          <CardContent className="p-5">
            <div className="flex items-start gap-4">
              <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                <Sparkles className="w-6 h-6 text-primary" />
              </div>
              <div className="flex-1">
                <h3 className="font-semibold text-foreground mb-1">Enable AI-Powered Insights</h3>
                <p className="text-sm text-muted-foreground mb-4">
                  Allow our AI to analyze your journal entries for personalized therapy recommendations. 
                  This helps us understand your emotional patterns and provide better support tailored to your needs.
                </p>
                <div className="flex items-start gap-3 p-3 bg-background/50 rounded-lg mb-4">
                  <Shield className="w-4 h-4 text-primary mt-0.5 flex-shrink-0" />
                  <p className="text-xs text-muted-foreground">
                    Your privacy matters. Your journal data is encrypted and never shared with third parties. 
                    You can change this setting anytime from your profile.
                  </p>
                </div>
                <div className="flex flex-wrap gap-3">
                  <Button onClick={() => handlePermissionChange(true)} size="sm">
                    <Sparkles className="w-4 h-4 mr-2" />
                    Allow AI Insights
                  </Button>
                  <Button onClick={() => handlePermissionChange(false)} variant="outline" size="sm">
                    Keep Private
                  </Button>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* AI Permission Status (if already set) */}
      {aiPermission !== null && (
        <Card className="bg-card border-border">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className={cn(
                  "w-10 h-10 rounded-full flex items-center justify-center",
                  aiPermission ? "bg-primary/10" : "bg-muted"
                )}>
                  {aiPermission ? (
                    <Sparkles className="w-5 h-5 text-primary" />
                  ) : (
                    <Shield className="w-5 h-5 text-muted-foreground" />
                  )}
                </div>
                <div>
                  <p className="font-medium text-sm text-foreground">
                    {aiPermission ? "AI Insights Enabled" : "Journal Kept Private"}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {aiPermission 
                      ? "AI can analyze your entries for personalized recommendations" 
                      : "Your entries are not analyzed by AI"}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-xs text-muted-foreground hidden sm:inline">
                  {aiPermission ? "On" : "Off"}
                </span>
                <Switch
                  checked={aiPermission}
                  onCheckedChange={handlePermissionChange}
                  aria-label="Toggle AI insights"
                />
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <Card className="bg-card border-border">
          <CardContent className="p-4 flex items-center gap-4">
            <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center">
              <BookOpen className="w-6 h-6 text-primary" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Total Entries</p>
              <p className="text-2xl font-bold">{journalEntries.length}</p>
            </div>
          </CardContent>
        </Card>
        <Card className="bg-card border-border">
          <CardContent className="p-4 flex items-center gap-4">
            <div className="w-12 h-12 rounded-full bg-green-100 flex items-center justify-center">
              <Calendar className="w-6 h-6 text-green-600" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">This Month</p>
              <p className="text-2xl font-bold">
                {journalEntries.filter(e => {
                  const entryDate = new Date(e.date)
                  const now = new Date()
                  return entryDate.getMonth() === now.getMonth() && entryDate.getFullYear() === now.getFullYear()
                }).length}
              </p>
            </div>
          </CardContent>
        </Card>
        <Card className="bg-card border-border">
          <CardContent className="p-4 flex items-center gap-4">
            <div className={cn(
              "w-12 h-12 rounded-full flex items-center justify-center",
              hasEntryToday ? "bg-primary/10" : "bg-amber-100"
            )}>
              <Pencil className={cn("w-6 h-6", hasEntryToday ? "text-primary" : "text-amber-600")} />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">{"Today's"} Entry</p>
              <p className="text-lg font-semibold">{hasEntryToday ? "Completed" : "Not yet"}</p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Write Section */}
      {isWriting && (
        <Card className="bg-card border-border">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Pencil className="w-5 h-5" />
              {"Today's"} Entry
            </CardTitle>
            <CardDescription>
              {new Date().toLocaleDateString("en-US", { weekday: "long", month: "long", day: "numeric", year: "numeric" })}
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <Textarea
              placeholder="Write about your day, your thoughts, feelings, or anything on your mind..."
              value={content}
              onChange={(e) => setContent(e.target.value)}
              className="min-h-[200px] resize-none"
            />
            <div className="flex justify-between items-center">
              <p className="text-sm text-muted-foreground">
                {content.split(/\s+/).filter(Boolean).length} words
              </p>
              <div className="flex gap-2">
                <Button variant="outline" onClick={() => { setIsWriting(false); setContent(""); }}>
                  Cancel
                </Button>
                <Button onClick={handleSave} disabled={!content.trim()}>
                  Save Entry
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Entries List */}
      {journalEntries.length === 0 && !isWriting ? (
        <Card className="bg-card border-border">
          <CardContent className="py-16 text-center">
            <div className="w-16 h-16 bg-muted rounded-full flex items-center justify-center mx-auto mb-4">
              <BookOpen className="w-8 h-8 text-muted-foreground" />
            </div>
            <h3 className="font-semibold text-lg mb-2">No journal entries yet</h3>
            <p className="text-muted-foreground mb-4">
              Start writing to capture your thoughts and track your journey
            </p>
            <Button onClick={() => setIsWriting(true)}>
              <Plus className="w-4 h-4 mr-2" />
              Write Your First Entry
            </Button>
          </CardContent>
        </Card>
      ) : journalEntries.length > 0 && (
        <div className="space-y-6">
          {Object.entries(groupedEntries).map(([monthYear, entries]) => (
            <div key={monthYear}>
              <h3 className="text-sm font-medium text-muted-foreground mb-3 flex items-center gap-2">
                <Calendar className="w-4 h-4" />
                {monthYear}
              </h3>
              <div className="space-y-2">
                {entries.map((entry) => (
                  <Card
                    key={entry.id}
                    className="bg-card border-border cursor-pointer hover:shadow-md transition-shadow"
                    onClick={() => setSelectedEntry(entry)}
                  >
                    <CardContent className="p-4">
                      <div className="flex items-start justify-between gap-4">
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-1">
                            <span className="font-medium text-sm">
                              {new Date(entry.date).toLocaleDateString("en-US", { weekday: "short", month: "short", day: "numeric" })}
                            </span>
                            <span className="text-xs text-muted-foreground flex items-center gap-1">
                              <Clock className="w-3 h-3" />
                              {new Date(entry.createdAt).toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit" })}
                            </span>
                          </div>
                          <p className="text-sm text-muted-foreground line-clamp-2">
                            {entry.content}
                          </p>
                        </div>
                        <ChevronRight className="w-5 h-5 text-muted-foreground flex-shrink-0" />
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* View Entry Dialog */}
      <Dialog open={!!selectedEntry} onOpenChange={() => setSelectedEntry(null)}>
        <DialogContent className="max-w-2xl max-h-[80vh]">
          <DialogHeader>
            <DialogTitle>
              {selectedEntry && new Date(selectedEntry.date).toLocaleDateString("en-US", {
                weekday: "long",
                month: "long",
                day: "numeric",
                year: "numeric",
              })}
            </DialogTitle>
            <DialogDescription>
              {selectedEntry && new Date(selectedEntry.createdAt).toLocaleTimeString("en-US", {
                hour: "numeric",
                minute: "2-digit",
              })}
            </DialogDescription>
          </DialogHeader>
          <ScrollArea className="max-h-[400px] pr-4">
            <p className="text-foreground whitespace-pre-wrap leading-relaxed">
              {selectedEntry?.content}
            </p>
          </ScrollArea>
        </DialogContent>
      </Dialog>
    </div>
  )
}
