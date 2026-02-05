"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { cn } from "@/lib/utils"
import { useAuth } from "@/lib/auth-context"
import { Button } from "@/components/ui/button"
import { ScrollArea } from "@/components/ui/scroll-area"
import {
  Leaf,
  Home,
  SmilePlus,
  History,
  MessageCircle,
  BookOpen,
  Gamepad2,
  User,
  LogOut,
  CheckSquare,
  Menu,
  X,
} from "lucide-react"
import { useState } from "react"

const navItems = [
  { href: "/dashboard", label: "Home", icon: Home },
  { href: "/dashboard/mood-tracker", label: "Mood Tracker", icon: SmilePlus },
  { href: "/dashboard/mood-history", label: "Mood History", icon: History },
  { href: "/dashboard/habit-tracker", label: "Habit Tracker", icon: CheckSquare },
  { href: "/dashboard/chatbot", label: "Chatbot", icon: MessageCircle },
  { href: "/dashboard/journal", label: "Journal", icon: BookOpen },
  { href: "/dashboard/games", label: "Games", icon: Gamepad2 },
  { href: "/dashboard/profile", label: "My Profile", icon: User },
]

export function Sidebar() {
  const pathname = usePathname()
  const { user, logout } = useAuth()
  const [isOpen, setIsOpen] = useState(false)

  const handleLogout = () => {
    logout()
    window.location.href = "/login"
  }

  return (
    <>
      {/* Mobile menu button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="lg:hidden fixed top-4 left-4 z-50 p-2 bg-card rounded-lg shadow-md border border-border"
        aria-label="Toggle menu"
      >
        {isOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
      </button>

      {/* Overlay for mobile */}
      {isOpen && (
        <div
          className="lg:hidden fixed inset-0 bg-background/80 backdrop-blur-sm z-40"
          onClick={() => setIsOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside
        className={cn(
          "fixed left-0 top-0 z-40 h-screen w-64 bg-sidebar-background border-r border-sidebar-border transition-transform lg:translate-x-0",
          isOpen ? "translate-x-0" : "-translate-x-full"
        )}
      >
        <div className="flex flex-col h-full">
          {/* Logo */}
          <div className="flex items-center gap-2 p-4 border-b border-sidebar-border">
            <div className="w-9 h-9 rounded-full bg-primary flex items-center justify-center">
              <Leaf className="w-5 h-5 text-primary-foreground" />
            </div>
            <span className="text-xl font-bold text-sidebar-foreground">CalmPath</span>
          </div>

          {/* User greeting */}
          <div className="px-4 py-3 border-b border-sidebar-border">
            <p className="text-sm text-sidebar-foreground/60">Welcome back,</p>
            <p className="font-medium text-sidebar-foreground truncate">{user?.name || "User"}</p>
          </div>

          {/* Navigation */}
          <ScrollArea className="flex-1 py-2">
            <nav className="px-2 space-y-1">
              {navItems.map((item) => {
                const Icon = item.icon
                const isActive = pathname === item.href || 
                  (item.href !== "/dashboard" && pathname.startsWith(item.href))
                
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    onClick={() => setIsOpen(false)}
                    className={cn(
                      "flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors",
                      isActive
                        ? "bg-sidebar-primary text-sidebar-primary-foreground"
                        : "text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground"
                    )}
                  >
                    <Icon className="w-5 h-5 flex-shrink-0" />
                    {item.label}
                  </Link>
                )
              })}
            </nav>
          </ScrollArea>

          {/* Logout */}
          <div className="p-4 border-t border-sidebar-border">
            <Button
              variant="ghost"
              className="w-full justify-start text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground"
              onClick={handleLogout}
            >
              <LogOut className="w-5 h-5 mr-3" />
              Sign Out
            </Button>
          </div>
        </div>
      </aside>
    </>
  )
}
