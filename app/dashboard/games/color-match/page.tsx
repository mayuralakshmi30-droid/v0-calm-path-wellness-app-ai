"use client"

import { useState, useEffect, useCallback } from "react"
import Link from "next/link"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { ArrowLeft, Play, RotateCcw, Zap } from "lucide-react"
import { cn } from "@/lib/utils"

const colors = [
  { name: "Red", bg: "bg-red-500", text: "text-red-500" },
  { name: "Blue", bg: "bg-blue-500", text: "text-blue-500" },
  { name: "Green", bg: "bg-green-500", text: "text-green-500" },
  { name: "Yellow", bg: "bg-yellow-500", text: "text-yellow-500" },
  { name: "Purple", bg: "bg-purple-500", text: "text-purple-500" },
  { name: "Orange", bg: "bg-orange-500", text: "text-orange-500" },
]

export default function ColorMatchPage() {
  const [gameState, setGameState] = useState<"idle" | "playing" | "ended">("idle")
  const [score, setScore] = useState(0)
  const [highScore, setHighScore] = useState(0)
  const [timeLeft, setTimeLeft] = useState(30)
  const [displayColor, setDisplayColor] = useState(colors[0])
  const [textColor, setTextColor] = useState(colors[0])
  const [feedback, setFeedback] = useState<"correct" | "wrong" | null>(null)

  const generateRound = useCallback(() => {
    const randomDisplay = colors[Math.floor(Math.random() * colors.length)]
    const randomText = colors[Math.floor(Math.random() * colors.length)]
    setDisplayColor(randomDisplay)
    setTextColor(randomText)
  }, [])

  useEffect(() => {
    if (gameState !== "playing") return

    const timer = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          setGameState("ended")
          if (score > highScore) setHighScore(score)
          return 0
        }
        return prev - 1
      })
    }, 1000)

    return () => clearInterval(timer)
  }, [gameState, score, highScore])

  const startGame = () => {
    setGameState("playing")
    setScore(0)
    setTimeLeft(30)
    setFeedback(null)
    generateRound()
  }

  const handleAnswer = (isMatch: boolean) => {
    const actualMatch = displayColor.name === textColor.name
    const isCorrect = isMatch === actualMatch

    if (isCorrect) {
      setScore((s) => s + 1)
      setFeedback("correct")
    } else {
      setFeedback("wrong")
    }

    setTimeout(() => {
      setFeedback(null)
      generateRound()
    }, 300)
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" asChild>
          <Link href="/dashboard/games">
            <ArrowLeft className="w-5 h-5" />
          </Link>
        </Button>
        <div>
          <h1 className="text-2xl font-bold text-foreground">Color Match</h1>
          <p className="text-muted-foreground">Does the word match its color?</p>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-4">
        <Card className="bg-card border-border">
          <CardContent className="p-4 text-center">
            <p className="text-sm text-muted-foreground">Score</p>
            <p className="text-2xl font-bold">{score}</p>
          </CardContent>
        </Card>
        <Card className="bg-card border-border">
          <CardContent className="p-4 text-center">
            <p className="text-sm text-muted-foreground">Time</p>
            <p className={cn("text-2xl font-bold", timeLeft <= 5 && "text-red-500")}>{timeLeft}s</p>
          </CardContent>
        </Card>
        <Card className="bg-card border-border">
          <CardContent className="p-4 text-center">
            <p className="text-sm text-muted-foreground">Best</p>
            <p className="text-2xl font-bold">{highScore}</p>
          </CardContent>
        </Card>
      </div>

      {/* Game Area */}
      <Card className={cn(
        "bg-card border-border transition-colors",
        feedback === "correct" && "border-green-500",
        feedback === "wrong" && "border-red-500"
      )}>
        <CardContent className="p-8">
          <div className="flex flex-col items-center justify-center min-h-[300px]">
            {gameState === "idle" && (
              <div className="text-center">
                <div className="w-20 h-20 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-4">
                  <Zap className="w-10 h-10 text-primary" />
                </div>
                <h2 className="text-xl font-semibold mb-2">Ready to Test Your Focus?</h2>
                <p className="text-muted-foreground mb-6 max-w-sm">
                  A color word will appear. Decide if the text COLOR matches the WORD shown.
                </p>
                <Button size="lg" onClick={startGame}>
                  <Play className="w-5 h-5 mr-2" />
                  Start Game
                </Button>
              </div>
            )}

            {gameState === "playing" && (
              <div className="text-center">
                <div className={cn("text-6xl sm:text-8xl font-bold mb-8", textColor.text)}>
                  {displayColor.name}
                </div>
                <p className="text-muted-foreground mb-6">
                  Does the color of the text match the word?
                </p>
                <div className="flex gap-4 justify-center">
                  <Button
                    size="lg"
                    variant="outline"
                    onClick={() => handleAnswer(false)}
                    className="min-w-[120px] bg-transparent"
                  >
                    No Match
                  </Button>
                  <Button
                    size="lg"
                    onClick={() => handleAnswer(true)}
                    className="min-w-[120px]"
                  >
                    Match!
                  </Button>
                </div>
              </div>
            )}

            {gameState === "ended" && (
              <div className="text-center">
                <h2 className="text-2xl font-bold mb-2">{"Time's Up!"}</h2>
                <p className="text-4xl font-bold text-primary mb-2">{score} points</p>
                <p className="text-muted-foreground mb-6">
                  {score > highScore - 1 ? "New high score!" : `High score: ${highScore}`}
                </p>
                <Button size="lg" onClick={startGame}>
                  <RotateCcw className="w-5 h-5 mr-2" />
                  Play Again
                </Button>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Instructions */}
      <Card className="bg-muted/50 border-border">
        <CardHeader>
          <CardTitle className="text-base">How to Play</CardTitle>
        </CardHeader>
        <CardContent className="text-sm text-muted-foreground space-y-2">
          <p>1. Look at the color of the TEXT, not the word itself</p>
          <p>2. If the text color matches the word, click &quot;Match!&quot;</p>
          <p>3. If they don&apos;t match, click &quot;No Match&quot;</p>
          <p>4. Score as many points as you can in 30 seconds!</p>
        </CardContent>
      </Card>
    </div>
  )
}
