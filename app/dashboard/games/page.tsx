"use client"

import Link from "next/link"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Gamepad2, Grid3X3, Brain, FileText, ArrowRight, Palette, Zap, Wind, Target, Puzzle, Calculator, Eye, Timer } from "lucide-react"

const games = [
  {
    id: "memory",
    name: "Memory Match",
    description: "Flip cards and find matching pairs. Great for focus and memory.",
    icon: Brain,
    color: "bg-blue-500",
    difficulty: "Easy",
    category: "Memory",
    href: "/dashboard/games/memory",
  },
  {
    id: "sudoku",
    name: "Sudoku",
    description: "Classic number puzzle to train logical thinking and patience.",
    icon: Grid3X3,
    color: "bg-teal-500",
    difficulty: "Medium",
    category: "Logic",
    href: "/dashboard/games/sudoku",
  },
  {
    id: "word-search",
    name: "Word Search",
    description: "Find hidden words in a grid. Relaxing and vocabulary-boosting.",
    icon: FileText,
    color: "bg-violet-500",
    difficulty: "Easy",
    category: "Words",
    href: "/dashboard/games/word-search",
  },
  {
    id: "breathing",
    name: "Breathing Exercise",
    description: "Follow guided breathing patterns to reduce stress and anxiety.",
    icon: Wind,
    color: "bg-cyan-500",
    difficulty: "Easy",
    category: "Relaxation",
    href: "/dashboard/games/breathing",
  },
  {
    id: "color-match",
    name: "Color Match",
    description: "Test your reaction time by matching colors. Improves focus.",
    icon: Palette,
    color: "bg-pink-500",
    difficulty: "Medium",
    category: "Focus",
    href: "/dashboard/games/color-match",
  },
  {
    id: "pattern-recall",
    name: "Pattern Recall",
    description: "Remember and repeat patterns. Enhances short-term memory.",
    icon: Eye,
    color: "bg-amber-500",
    difficulty: "Medium",
    category: "Memory",
    href: "/dashboard/games/pattern-recall",
  },
  {
    id: "number-sequence",
    name: "Number Sequence",
    description: "Find the next number in the sequence. Sharpens analytical thinking.",
    icon: Calculator,
    color: "bg-emerald-500",
    difficulty: "Hard",
    category: "Logic",
    href: "/dashboard/games/number-sequence",
  },
  {
    id: "focus-timer",
    name: "Focus Timer",
    description: "Pomodoro-style focus sessions with calming ambient sounds.",
    icon: Timer,
    color: "bg-indigo-500",
    difficulty: "Easy",
    category: "Focus",
    href: "/dashboard/games/focus-timer",
  },
  {
    id: "spot-difference",
    name: "Spot the Difference",
    description: "Find subtle differences between images. Trains attention to detail.",
    icon: Target,
    color: "bg-rose-500",
    difficulty: "Medium",
    category: "Focus",
    href: "/dashboard/games/spot-difference",
  },
]

const categories = ["All", "Memory", "Logic", "Focus", "Words", "Relaxation"]

"use client"

import { useState } from "react"

export default function GamesPage() {
  const [selectedCategory, setSelectedCategory] = useState("All")

  const filteredGames = selectedCategory === "All" 
    ? games 
    : games.filter(game => game.category === selectedCategory)

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl lg:text-3xl font-bold text-foreground">Mind Games & Relaxation</h1>
        <p className="text-muted-foreground mt-1">Take a break and engage your mind with these calming games</p>
      </div>

      {/* Benefits Card */}
      <Card className="bg-primary/5 border-primary/20">
        <CardContent className="p-4 flex items-center gap-4">
          <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
            <Gamepad2 className="w-6 h-6 text-primary" />
          </div>
          <div>
            <h3 className="font-medium text-foreground">Why Play Mind Games?</h3>
            <p className="text-sm text-muted-foreground">
              These games are designed to help reduce stress, improve focus, and give your mind a healthy break. 
              Playing for just 10-15 minutes can help lower anxiety levels and sharpen cognitive skills.
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Category Filter */}
      <div className="flex flex-wrap gap-2">
        {categories.map((category) => (
          <Button
            key={category}
            variant={selectedCategory === category ? "default" : "outline"}
            size="sm"
            onClick={() => setSelectedCategory(category)}
            className={selectedCategory !== category ? "bg-transparent" : ""}
          >
            {category}
          </Button>
        ))}
      </div>

      {/* Games Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredGames.map((game) => {
          const Icon = game.icon
          return (
            <Card key={game.id} className="bg-card border-border hover:shadow-lg transition-all group">
              <CardHeader className="pb-3">
                <div className="flex items-start justify-between">
                  <div className={`w-12 h-12 rounded-xl ${game.color} flex items-center justify-center`}>
                    <Icon className="w-6 h-6 text-white" />
                  </div>
                  <div className="flex gap-1">
                    <Badge variant="outline" className="text-xs">
                      {game.category}
                    </Badge>
                    <Badge variant="secondary" className="text-xs">
                      {game.difficulty}
                    </Badge>
                  </div>
                </div>
                <CardTitle className="text-lg mt-3">{game.name}</CardTitle>
                <CardDescription>{game.description}</CardDescription>
              </CardHeader>
              <CardContent>
                <Button asChild className="w-full group-hover:bg-primary/90">
                  <Link href={game.href}>
                    Play Now
                    <ArrowRight className="w-4 h-4 ml-2 transition-transform group-hover:translate-x-1" />
                  </Link>
                </Button>
              </CardContent>
            </Card>
          )
        })}
      </div>
    </div>
  )
}
