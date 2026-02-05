"use client"

import { createContext, useContext, useState, useEffect, type ReactNode } from "react"
import { useAuth } from "./auth-context"

export interface MoodEntry {
  id: string
  date: string
  stressLevel: number
  energyLevel: number
  sleepQuality: number
  focusLevel: number
  overallMood: "very-sad" | "sad" | "neutral" | "happy" | "very-happy"
}

export interface HabitEntry {
  id: string
  name: string
  frequency: "daily" | "weekly"
  completedDates: string[]
  createdAt: string
  color: string
}

export interface JournalEntry {
  id: string
  date: string
  content: string
  createdAt: string
}

export interface Session {
  id: string
  therapistId: string
  therapistName: string
  date: string
  time: string
  status: "scheduled" | "completed" | "cancelled"
  price: number
  isFree: boolean
  feedback?: string
  report?: string
  meetLink?: string
  meetLinkUsed?: boolean
}

export interface ChatMessage {
  id: string
  therapistId: string
  content: string
  sender: "user" | "therapist"
  timestamp: string
}

interface AppContextType {
  moodEntries: MoodEntry[]
  addMoodEntry: (entry: Omit<MoodEntry, "id">) => void
  habits: HabitEntry[]
  addHabit: (habit: Omit<HabitEntry, "id" | "completedDates" | "createdAt">) => void
  toggleHabitCompletion: (habitId: string, date: string) => void
  deleteHabit: (habitId: string) => void
  journalEntries: JournalEntry[]
  addJournalEntry: (content: string) => void
  sessions: Session[]
  bookSession: (session: Omit<Session, "id" | "status">) => void
  cancelSession: (sessionId: string) => void
  completeSession: (sessionId: string) => void
  addSessionFeedback: (sessionId: string, feedback: string) => void
  addSessionReport: (sessionId: string, report: string) => void
  markMeetLinkUsed: (sessionId: string) => void
  getSessionByMeetCode: (meetCode: string) => Session | undefined
  finishSession: (sessionId: string, report: string) => void
  chatMessages: ChatMessage[]
  addChatMessage: (message: Omit<ChatMessage, "id" | "timestamp">) => void
  getChatMessages: (therapistId: string) => ChatMessage[]
}

const AppContext = createContext<AppContextType | undefined>(undefined)

export function AppProvider({ children }: { children: ReactNode }) {
  const { user } = useAuth()
  const [moodEntries, setMoodEntries] = useState<MoodEntry[]>([])
  const [habits, setHabits] = useState<HabitEntry[]>([])
  const [journalEntries, setJournalEntries] = useState<JournalEntry[]>([])
  const [sessions, setSessions] = useState<Session[]>([])
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([])

  // Load data from localStorage when user changes
  useEffect(() => {
    if (user) {
      const storedMoods = localStorage.getItem(`calmpath_moods_${user.id}`)
      const storedHabits = localStorage.getItem(`calmpath_habits_${user.id}`)
      const storedJournals = localStorage.getItem(`calmpath_journals_${user.id}`)
      const storedSessions = localStorage.getItem(`calmpath_sessions_${user.id}`)
      const storedChats = localStorage.getItem(`calmpath_chats_${user.id}`)

      if (storedMoods) setMoodEntries(JSON.parse(storedMoods))
      if (storedHabits) setHabits(JSON.parse(storedHabits))
      if (storedJournals) setJournalEntries(JSON.parse(storedJournals))
      if (storedSessions) setSessions(JSON.parse(storedSessions))
      if (storedChats) setChatMessages(JSON.parse(storedChats))
    } else {
      setMoodEntries([])
      setHabits([])
      setJournalEntries([])
      setSessions([])
      setChatMessages([])
    }
  }, [user])

  // Save data to localStorage when it changes
  useEffect(() => {
    if (user) {
      localStorage.setItem(`calmpath_moods_${user.id}`, JSON.stringify(moodEntries))
    }
  }, [moodEntries, user])

  useEffect(() => {
    if (user) {
      localStorage.setItem(`calmpath_habits_${user.id}`, JSON.stringify(habits))
    }
  }, [habits, user])

  useEffect(() => {
    if (user) {
      localStorage.setItem(`calmpath_journals_${user.id}`, JSON.stringify(journalEntries))
    }
  }, [journalEntries, user])

  useEffect(() => {
    if (user) {
      localStorage.setItem(`calmpath_sessions_${user.id}`, JSON.stringify(sessions))
    }
  }, [sessions, user])

  useEffect(() => {
    if (user) {
      localStorage.setItem(`calmpath_chats_${user.id}`, JSON.stringify(chatMessages))
    }
  }, [chatMessages, user])

  const addMoodEntry = (entry: Omit<MoodEntry, "id">) => {
    const newEntry: MoodEntry = {
      ...entry,
      id: crypto.randomUUID(),
    }
    setMoodEntries((prev) => [newEntry, ...prev])
  }

  const addHabit = (habit: Omit<HabitEntry, "id" | "completedDates" | "createdAt">) => {
    const newHabit: HabitEntry = {
      ...habit,
      id: crypto.randomUUID(),
      completedDates: [],
      createdAt: new Date().toISOString(),
    }
    setHabits((prev) => [...prev, newHabit])
  }

  const toggleHabitCompletion = (habitId: string, date: string) => {
    setHabits((prev) =>
      prev.map((habit) => {
        if (habit.id === habitId) {
          const isCompleted = habit.completedDates.includes(date)
          return {
            ...habit,
            completedDates: isCompleted
              ? habit.completedDates.filter((d) => d !== date)
              : [...habit.completedDates, date],
          }
        }
        return habit
      })
    )
  }

  const deleteHabit = (habitId: string) => {
    setHabits((prev) => prev.filter((h) => h.id !== habitId))
  }

  const addJournalEntry = (content: string) => {
    const newEntry: JournalEntry = {
      id: crypto.randomUUID(),
      date: new Date().toISOString().split("T")[0],
      content,
      createdAt: new Date().toISOString(),
    }
    setJournalEntries((prev) => [newEntry, ...prev])
  }

  const bookSession = (session: Omit<Session, "id" | "status">) => {
    const sessionId = crypto.randomUUID()
    const meetCode = sessionId.split("-").slice(0, 2).join("")
    const newSession: Session = {
      ...session,
      id: sessionId,
      status: "scheduled",
      meetLink: `/dashboard/meet/${meetCode}`,
      meetLinkUsed: false,
    }
    setSessions((prev) => [...prev, newSession])
  }

  const cancelSession = (sessionId: string) => {
    setSessions((prev) =>
      prev.map((s) => (s.id === sessionId ? { ...s, status: "cancelled" as const } : s))
    )
  }

  const completeSession = (sessionId: string) => {
    setSessions((prev) =>
      prev.map((s) => (s.id === sessionId ? { ...s, status: "completed" as const } : s))
    )
  }

  const addSessionFeedback = (sessionId: string, feedback: string) => {
    setSessions((prev) =>
      prev.map((s) => (s.id === sessionId ? { ...s, feedback } : s))
    )
  }

  const addSessionReport = (sessionId: string, report: string) => {
    setSessions((prev) =>
      prev.map((s) => (s.id === sessionId ? { ...s, report } : s))
    )
  }

  const markMeetLinkUsed = (sessionId: string) => {
    setSessions((prev) =>
      prev.map((s) => (s.id === sessionId ? { ...s, meetLinkUsed: true } : s))
    )
  }

  const getSessionByMeetCode = (meetCode: string): Session | undefined => {
    return sessions.find((s) => s.meetLink === `/dashboard/meet/${meetCode}`)
  }

  // Single atomic update: mark completed + save report + mark link used
  const finishSession = (sessionId: string, report: string) => {
    setSessions((prev) =>
      prev.map((s) =>
        s.id === sessionId
          ? { ...s, status: "completed" as const, report, meetLinkUsed: true }
          : s
      )
    )
  }

  const addChatMessage = (message: Omit<ChatMessage, "id" | "timestamp">) => {
    const newMessage: ChatMessage = {
      ...message,
      id: crypto.randomUUID(),
      timestamp: new Date().toISOString(),
    }
    setChatMessages((prev) => [...prev, newMessage])
  }

  const getChatMessages = (therapistId: string) => {
    return chatMessages.filter((m) => m.therapistId === therapistId)
  }

  return (
    <AppContext.Provider
      value={{
        moodEntries,
        addMoodEntry,
        habits,
        addHabit,
        toggleHabitCompletion,
        deleteHabit,
        journalEntries,
        addJournalEntry,
        sessions,
        bookSession,
        cancelSession,
        completeSession,
        addSessionFeedback,
        addSessionReport,
        markMeetLinkUsed,
        getSessionByMeetCode,
        finishSession,
        chatMessages,
        addChatMessage,
        getChatMessages,
      }}
    >
      {children}
    </AppContext.Provider>
  )
}

export function useApp() {
  const context = useContext(AppContext)
  if (context === undefined) {
    throw new Error("useApp must be used within an AppProvider")
  }
  return context
}
