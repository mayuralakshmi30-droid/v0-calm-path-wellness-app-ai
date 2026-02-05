"use client"

import { useState, useEffect, useCallback } from "react"
import Link from "next/link"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { ArrowLeft, Play, RotateCcw, Eye } from "lucide-react"
import { cn } from "@/lib/utils"

export default function PatternRecallPage() {
  const [gameState, setGameState] = useState<"idle" | "showing" | "input" | "ended">("idle")
  const [pattern, setPattern] = useState<number[]>([])
  const [playerInput, setPlayerInput] = useState<number[]>([])
  const [activeCell, setActiveCell] = useState<number | null>(null)
  const [level, setLevel] = useState(1)
  const [highestLevel, setHighestLevel] = useState(1)
  const [showingIndex, setShowingIndex] = useState(0)

  const gridSize = 9

  const generatePattern = useCallback((length: number) => {
    const newPattern: number[] = []
    for (let i = 0; i < length; i++) {
      newPattern.push(Math.floor(Math.random() * gridSize))
    }
    return newPattern
  }, [])

  const startGame = () => {
    const initialPattern = generatePattern(3)
    setPattern(initialPattern)
    setPlayerInput([])
    setLevel(1)
    setGameState("showing")
    setShowingIndex(0)
  }

  const nextLevel = useCallback(() => {
    const newPattern = generatePattern(3 + level)
    setPattern(newPattern)
    setPlayerInput([])
    setLevel((l) => l + 1)
    setGameState("showing")
    setShowingIndex(0)
  }, [level, generatePattern])

  // Show pattern animation
  useEffect(() => {
    if (gameState !== "showing") return

    if (showingIndex >= pattern.length) {
      setTimeout(() => {
        setGameState("input")
        setActiveCell(null)
      }, 500)
      return
    }

    setActiveCell(pattern[showingIndex])

    const timer = setTimeout(() => {
      setActiveCell(null)
      setTimeout(() => {
        setShowingIndex((i) => i + 1)
      }, 200)
    }, 600)

    return () => clearTimeout(timer)
  }, [gameState, showingIndex, pattern])

  const handleCellClick = (index: number) => {
    if (gameState !== "input") return

    const newInput = [...playerInput, index]
    setPlayerInput(newInput)

    // Flash the cell
    setActiveCell(index)
    setTimeout(() => setActiveCell(null), 200)

    // Check if correct
    if (pattern[newInput.length - 1] !== index) {
      // Wrong!
      setGameState("ended")
      if (level > highestLevel) setHighestLevel(level)
      return
    }

    // Check if complete
    if (newInput.length === pattern.length) {
      // Level complete!
      setTimeout(() => {
        nextLevel()
      }, 500)
    }
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
          <h1 className="text-2xl font-bold text-foreground">Pattern Recall</h1>
          <p className="text-muted-foreground">Remember and repeat the pattern</p>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 gap-4">
        <Card className="bg-card border-border">
          <CardContent className="p-4 text-center">
            <p className="text-sm text-muted-foreground">Level</p>
            <p className="text-2xl font-bold">{level}</p>
          </CardContent>
        </Card>
        <Card className="bg-card border-border">
          <CardContent className="p-4 text-center">
            <p className="text-sm text-muted-foreground">Best</p>
            <p className="text-2xl font-bold">{highestLevel}</p>
          </CardContent>
        </Card>
      </div>

      {/* Game Area */}
      <Card className="bg-card border-border">
        <CardContent className="p-8">
          <div className="flex flex-col items-center justify-center">
            {gameState === "idle" && (
              <div className="text-center mb-8">
                <div className="w-20 h-20 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-4">
                  <Eye className="w-10 h-10 text-primary" />
                </div>
                <h2 className="text-xl font-semibold mb-2">Test Your Memory</h2>
                <p className="text-muted-foreground mb-6 max-w-sm">
                  Watch the pattern light up, then repeat it in the same order.
                </p>
                <Button size="lg" onClick={startGame}>
                  <Play className="w-5 h-5 mr-2" />
                  Start Game
                </Button>
              </div>
            )}

            {gameState === "showing" && (
              <p className="text-lg font-medium text-muted-foreground mb-4">
                Watch the pattern...
              </p>
            )}

            {gameState === "input" && (
              <p className="text-lg font-medium text-primary mb-4">
                Your turn! ({playerInput.length}/{pattern.length})
              </p>
            )}

            {(gameState === "showing" || gameState === "input") && (
              <div className="grid grid-cols-3 gap-3 w-full max-w-[300px]">
                {Array.from({ length: gridSize }).map((_, index) => (
                  <button
                    key={index}
                    onClick={() => handleCellClick(index)}
                    disabled={gameState !== "input"}
                    className={cn(
                      "aspect-square rounded-xl transition-all duration-200",
                      "border-2 border-border",
                      activeCell === index
                        ? "bg-primary scale-95"
                        : "bg-muted hover:bg-muted/80",
                      gameState === "input" && "cursor-pointer hover:scale-95"
                    )}
                  />
                ))}
              </div>
            )}

            {gameState === "ended" && (
              <div className="text-center">
                <h2 className="text-2xl font-bold mb-2">Game Over!</h2>
                <p className="text-4xl font-bold text-primary mb-2">Level {level}</p>
                <p className="text-muted-foreground mb-6">
                  {level > highestLevel - 1 ? "New record!" : `Best: Level ${highestLevel}`}
                </p>
                <Button size="lg" onClick={startGame}>
                  <RotateCcw className="w-5 h-5 mr-2" />
                  Try Again
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
          <p>1. Watch as cells light up in a sequence</p>
          <p>2. Memorize the order of the pattern</p>
          <p>3. Click the cells in the same order</p>
          <p>4. Each level adds one more cell to remember!</p>
        </CardContent>
      </Card>
    </div>
  )
}
