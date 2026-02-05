"use client"

import { createContext, useContext, useState, useEffect, type ReactNode } from "react"

export interface User {
  id: string
  name: string
  email: string
  aboutYourself: string
  completedSessions: number
  firstSessionUsed: boolean
}

interface AuthContextType {
  user: User | null
  isLoading: boolean
  login: (email: string, password: string) => Promise<boolean>
  signup: (name: string, email: string, password: string, aboutYourself: string) => Promise<boolean>
  logout: () => void
  updateUser: (updates: Partial<User>) => void
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    // Check for stored user session
    const storedUser = localStorage.getItem("calmpath_user")
    if (storedUser) {
      setUser(JSON.parse(storedUser))
    }
    setIsLoading(false)
  }, [])

  const login = async (email: string, password: string): Promise<boolean> => {
    // Simulated login - in production, this would call an API
    const storedUsers = JSON.parse(localStorage.getItem("calmpath_users") || "[]")
    const foundUser = storedUsers.find((u: { email: string; password: string }) => u.email === email && u.password === password)
    
    if (foundUser) {
      const { password: _, ...userWithoutPassword } = foundUser
      setUser(userWithoutPassword)
      localStorage.setItem("calmpath_user", JSON.stringify(userWithoutPassword))
      return true
    }
    return false
  }

  const signup = async (name: string, email: string, password: string, aboutYourself: string): Promise<boolean> => {
    const storedUsers = JSON.parse(localStorage.getItem("calmpath_users") || "[]")
    
    // Check if user already exists
    if (storedUsers.find((u: { email: string }) => u.email === email)) {
      return false
    }

    const newUser: User & { password: string } = {
      id: crypto.randomUUID(),
      name,
      email,
      password,
      aboutYourself,
      completedSessions: 0,
      firstSessionUsed: false,
    }

    storedUsers.push(newUser)
    localStorage.setItem("calmpath_users", JSON.stringify(storedUsers))

    const { password: _, ...userWithoutPassword } = newUser
    setUser(userWithoutPassword)
    localStorage.setItem("calmpath_user", JSON.stringify(userWithoutPassword))
    return true
  }

  const logout = () => {
    setUser(null)
    localStorage.removeItem("calmpath_user")
  }

  const updateUser = (updates: Partial<User>) => {
    if (user) {
      const updatedUser = { ...user, ...updates }
      setUser(updatedUser)
      localStorage.setItem("calmpath_user", JSON.stringify(updatedUser))
      
      // Update in users list too
      const storedUsers = JSON.parse(localStorage.getItem("calmpath_users") || "[]")
      const userIndex = storedUsers.findIndex((u: { id: string }) => u.id === user.id)
      if (userIndex !== -1) {
        storedUsers[userIndex] = { ...storedUsers[userIndex], ...updates }
        localStorage.setItem("calmpath_users", JSON.stringify(storedUsers))
      }
    }
  }

  return (
    <AuthContext.Provider value={{ user, isLoading, login, signup, logout, updateUser }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider")
  }
  return context
}
