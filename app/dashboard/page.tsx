"use client"

import { useState } from "react"
import { useAuth } from "@/lib/auth-context"
import { useApp } from "@/lib/app-context"
import { therapists, type Therapist } from "@/lib/therapists"
import { TherapistCard } from "@/components/dashboard/therapist-card"
import { TherapistChat } from "@/components/dashboard/therapist-chat"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Calendar, Clock, Gift, TrendingUp } from "lucide-react"

export default function DashboardPage() {
  const { user } = useAuth()
  const { sessions, moodEntries } = useApp()
  const [chatTherapist, setChatTherapist] = useState<Therapist | null>(null)

  const upcomingSessions = sessions.filter(s => s.status === "scheduled")
  const completedSessions = sessions.filter(s => s.status === "completed")
  const latestMood = moodEntries[0]

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-2xl lg:text-3xl font-bold text-foreground">
          Welcome back, {user?.name?.split(" ")[0]}
        </h1>
        <p className="text-muted-foreground mt-1">
          {"Here's"} an overview of your wellness journey
        </p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="bg-card border-border">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Upcoming Sessions</CardTitle>
            <Calendar className="w-4 h-4 text-primary" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{upcomingSessions.length}</div>
            {upcomingSessions.length > 0 && (
              <p className="text-xs text-muted-foreground mt-1">
                Next: {new Date(upcomingSessions[0].date).toLocaleDateString()}
              </p>
            )}
          </CardContent>
        </Card>

        <Card className="bg-card border-border">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Completed Sessions</CardTitle>
            <Clock className="w-4 h-4 text-primary" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{completedSessions.length}</div>
            <p className="text-xs text-muted-foreground mt-1">Total sessions attended</p>
          </CardContent>
        </Card>

        <Card className="bg-card border-border">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Mood Entries</CardTitle>
            <TrendingUp className="w-4 h-4 text-primary" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{moodEntries.length}</div>
            {latestMood && (
              <p className="text-xs text-muted-foreground mt-1">
                Last entry: {new Date(latestMood.date).toLocaleDateString()}
              </p>
            )}
          </CardContent>
        </Card>

        <Card className="bg-card border-border">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">First Session</CardTitle>
            <Gift className="w-4 h-4 text-primary" />
          </CardHeader>
          <CardContent>
            {user?.firstSessionUsed ? (
              <>
                <div className="text-lg font-bold text-muted-foreground">Used</div>
                <p className="text-xs text-muted-foreground mt-1">Free trial completed</p>
              </>
            ) : (
              <>
                <Badge className="bg-primary text-primary-foreground">FREE</Badge>
                <p className="text-xs text-muted-foreground mt-1">Your first session is on us!</p>
              </>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Therapists Section */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="text-xl font-semibold text-foreground">Available Therapists</h2>
            <p className="text-sm text-muted-foreground">Connect with licensed professionals</p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          {therapists.map((therapist) => (
            <TherapistCard
              key={therapist.id}
              therapist={therapist}
              onChat={setChatTherapist}
            />
          ))}
        </div>
      </div>

      {/* Chat Dialog */}
      <TherapistChat
        therapist={chatTherapist}
        open={!!chatTherapist}
        onClose={() => setChatTherapist(null)}
      />
    </div>
  )
}
