"use client"

import { useState } from "react"
import { useAuth } from "@/lib/auth-context"
import { useApp } from "@/lib/app-context"
import { therapists, type Therapist } from "@/lib/therapists"
import { TherapistCard } from "@/components/dashboard/therapist-card"
import { TherapistChat } from "@/components/dashboard/therapist-chat"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Calendar, Clock, Gift, TrendingUp, Search, X } from "lucide-react"
import { Button } from "@/components/ui/button"

export default function DashboardPage() {
  const { user } = useAuth()
  const { sessions, moodEntries } = useApp()
  const [chatTherapist, setChatTherapist] = useState<Therapist | null>(null)
  const [searchQuery, setSearchQuery] = useState("")
  const [languageFilter, setLanguageFilter] = useState("all")
  const [specialtyFilter, setSpecialtyFilter] = useState("all")

  // Get unique languages and specialties for filters
  const allLanguages = Array.from(new Set(therapists.flatMap(t => t.languages))).sort()
  const allSpecialties = Array.from(new Set(therapists.flatMap(t => t.specialties))).sort()
  const allTypes = Array.from(new Set(therapists.map(t => t.title))).sort()

  // Filter therapists
  const filteredTherapists = therapists.filter((t) => {
    const matchesSearch = searchQuery === "" || 
      t.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      t.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      t.specialties.some(s => s.toLowerCase().includes(searchQuery.toLowerCase())) ||
      t.languages.some(l => l.toLowerCase().includes(searchQuery.toLowerCase()))
    
    const matchesLanguage = languageFilter === "all" || t.languages.includes(languageFilter)
    const matchesSpecialty = specialtyFilter === "all" || 
      t.specialties.includes(specialtyFilter) || 
      t.title === specialtyFilter
    
    return matchesSearch && matchesLanguage && matchesSpecialty
  })

  const hasActiveFilters = searchQuery !== "" || languageFilter !== "all" || specialtyFilter !== "all"

  const clearFilters = () => {
    setSearchQuery("")
    setLanguageFilter("all")
    setSpecialtyFilter("all")
  }

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

        {/* Search & Filter Bar */}
        <Card className="bg-card border-border mb-6">
          <CardContent className="p-4">
            <div className="flex flex-col gap-3">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input
                  placeholder="Search by name, specialty, type, or language..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-9 bg-background"
                />
              </div>
              <div className="flex flex-col sm:flex-row gap-3">
                <div className="flex-1">
                  <Select value={languageFilter} onValueChange={setLanguageFilter}>
                    <SelectTrigger className="bg-background">
                      <SelectValue placeholder="Filter by language" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Languages</SelectItem>
                      {allLanguages.map((lang) => (
                        <SelectItem key={lang} value={lang}>{lang}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="flex-1">
                  <Select value={specialtyFilter} onValueChange={setSpecialtyFilter}>
                    <SelectTrigger className="bg-background">
                      <SelectValue placeholder="Filter by type / specialty" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Types & Specialties</SelectItem>
                      <SelectItem disabled value="---types---">
                        -- Therapist Types --
                      </SelectItem>
                      {allTypes.map((type) => (
                        <SelectItem key={type} value={type}>{type}</SelectItem>
                      ))}
                      <SelectItem disabled value="---specialties---">
                        -- Specialties --
                      </SelectItem>
                      {allSpecialties.map((spec) => (
                        <SelectItem key={spec} value={spec}>{spec}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                {hasActiveFilters && (
                  <Button variant="outline" size="default" onClick={clearFilters} className="sm:w-auto">
                    <X className="w-4 h-4 mr-2" />
                    Clear Filters
                  </Button>
                )}
              </div>
            </div>
          </CardContent>
        </Card>

        {filteredTherapists.length === 0 ? (
          <Card className="bg-card border-border">
            <CardContent className="py-12 text-center">
              <Search className="w-12 h-12 text-muted-foreground mx-auto mb-3" />
              <h3 className="font-semibold text-lg mb-1">No therapists found</h3>
              <p className="text-muted-foreground text-sm">
                Try adjusting your search or filters to find available therapists.
              </p>
              <Button variant="outline" className="mt-4" onClick={clearFilters}>
                Clear all filters
              </Button>
            </CardContent>
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
            {filteredTherapists.map((therapist) => (
              <TherapistCard
                key={therapist.id}
                therapist={therapist}
                onChat={setChatTherapist}
              />
            ))}
          </div>
        )}
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
