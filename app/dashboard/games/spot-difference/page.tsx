"use client"

import { useState, useCallback } from "react"
import Link from "next/link"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { ArrowLeft, Play, RotateCcw, Target, Check } from "lucide-react"
import { cn } from "@/lib/utils"

type Shape = {
  id: number
  type: "circle" | "square" | "triangle" | "star"
  color: string
  x: number
  y: number
  size: number
  rotation: number
}

type Puzzle = {
  shapes: Shape[]
  differences: number[] // IDs of shapes that are different
}

const colors = ["#ef4444", "#3b82f6", "#22c55e", "#eab308", "#a855f7", "#f97316"]
const shapeTypes: Shape["type"][] = ["circle", "square", "triangle", "star"]

export default function SpotDifferencePage() {
  const [gameState, setGameState] = useState<"idle" | "playing" | "complete">("idle")
  const [puzzle, setPuzzle] = useState<Puzzle | null>(null)
  const [foundDifferences, setFoundDifferences] = useState<number[]>([])
  const [level, setLevel] = useState(1)
  const [score, setScore] = useState(0)
  const [wrongClicks, setWrongClicks] = useState(0)

  const generatePuzzle = useCallback((diffCount: number) => {
    const shapes: Shape[] = []
    const differences: number[] = []

    // Generate 8-12 shapes
    const shapeCount = 8 + Math.floor(Math.random() * 5)
    
    for (let i = 0; i < shapeCount; i++) {
      shapes.push({
        id: i,
        type: shapeTypes[Math.floor(Math.random() * shapeTypes.length)],
        color: colors[Math.floor(Math.random() * colors.length)],
        x: 10 + Math.random() * 80,
        y: 10 + Math.random() * 80,
        size: 20 + Math.random() * 20,
        rotation: Math.floor(Math.random() * 360),
      })
    }

    // Select random shapes to be different
    const availableIds = [...Array(shapeCount).keys()]
    for (let i = 0; i < diffCount; i++) {
      const idx = Math.floor(Math.random() * availableIds.length)
      differences.push(availableIds[idx])
      availableIds.splice(idx, 1)
    }

    return { shapes, differences }
  }, [])

  const startGame = () => {
    setLevel(1)
    setScore(0)
    setFoundDifferences([])
    setWrongClicks(0)
    setPuzzle(generatePuzzle(3))
    setGameState("playing")
  }

  const nextLevel = () => {
    setLevel((l) => l + 1)
    setFoundDifferences([])
    setWrongClicks(0)
    setPuzzle(generatePuzzle(Math.min(3 + Math.floor(level / 2), 6)))
  }

  const handleShapeClick = (id: number, isRight: boolean) => {
    if (!puzzle || foundDifferences.includes(id)) return

    if (puzzle.differences.includes(id) && isRight) {
      // Clicked on the modified version on the right
      setFoundDifferences((prev) => [...prev, id])
      setScore((s) => s + 10)

      if (foundDifferences.length + 1 === puzzle.differences.length) {
        setGameState("complete")
      }
    } else if (!puzzle.differences.includes(id)) {
      setWrongClicks((w) => w + 1)
    }
  }

  const renderShape = (shape: Shape, modified: boolean, onClick?: () => void) => {
    const modifiedShape = modified && puzzle?.differences.includes(shape.id)
    const isFound = foundDifferences.includes(shape.id)

    // Apply modification if on right side and is a difference
    const displayColor = modifiedShape 
      ? colors[(colors.indexOf(shape.color) + 1) % colors.length]
      : shape.color
    const displaySize = modifiedShape ? shape.size * 1.3 : shape.size

    const style = {
      position: "absolute" as const,
      left: `${shape.x}%`,
      top: `${shape.y}%`,
      width: `${displaySize}px`,
      height: `${displaySize}px`,
      transform: `translate(-50%, -50%) rotate(${shape.rotation}deg)`,
      cursor: onClick ? "pointer" : "default",
    }

    const shapeClass = cn(
      "transition-all",
      isFound && "ring-4 ring-green-500 ring-offset-2"
    )

    if (shape.type === "circle") {
      return (
        <div
          key={shape.id}
          style={{ ...style, backgroundColor: displayColor, borderRadius: "50%" }}
          className={shapeClass}
          onClick={onClick}
        />
      )
    }

    if (shape.type === "square") {
      return (
        <div
          key={shape.id}
          style={{ ...style, backgroundColor: displayColor, borderRadius: "4px" }}
          className={shapeClass}
          onClick={onClick}
        />
      )
    }

    if (shape.type === "triangle") {
      return (
        <div
          key={shape.id}
          style={{
            ...style,
            width: 0,
            height: 0,
            backgroundColor: "transparent",
            borderLeft: `${displaySize / 2}px solid transparent`,
            borderRight: `${displaySize / 2}px solid transparent`,
            borderBottom: `${displaySize}px solid ${displayColor}`,
          }}
          className={shapeClass}
          onClick={onClick}
        />
      )
    }

    // Star
    return (
      <div
        key={shape.id}
        style={style}
        className={shapeClass}
        onClick={onClick}
      >
        <svg viewBox="0 0 24 24" fill={displayColor}>
          <polygon points="12,2 15,9 22,9 17,14 19,21 12,17 5,21 7,14 2,9 9,9" />
        </svg>
      </div>
    )
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
          <h1 className="text-2xl font-bold text-foreground">Spot the Difference</h1>
          <p className="text-muted-foreground">Find the differences between images</p>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-4">
        <Card className="bg-card border-border">
          <CardContent className="p-4 text-center">
            <p className="text-sm text-muted-foreground">Level</p>
            <p className="text-2xl font-bold">{level}</p>
          </CardContent>
        </Card>
        <Card className="bg-card border-border">
          <CardContent className="p-4 text-center">
            <p className="text-sm text-muted-foreground">Score</p>
            <p className="text-2xl font-bold">{score}</p>
          </CardContent>
        </Card>
        <Card className="bg-card border-border">
          <CardContent className="p-4 text-center">
            <p className="text-sm text-muted-foreground">Found</p>
            <p className="text-2xl font-bold">
              {foundDifferences.length}/{puzzle?.differences.length || 0}
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Game Area */}
      <Card className="bg-card border-border">
        <CardContent className="p-4 sm:p-8">
          {gameState === "idle" && (
            <div className="text-center py-12">
              <div className="w-20 h-20 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-4">
                <Target className="w-10 h-10 text-primary" />
              </div>
              <h2 className="text-xl font-semibold mb-2">Train Your Eye</h2>
              <p className="text-muted-foreground mb-6 max-w-sm mx-auto">
                Two images will appear. Find the shapes that are different on the right side.
              </p>
              <Button size="lg" onClick={startGame}>
                <Play className="w-5 h-5 mr-2" />
                Start Game
              </Button>
            </div>
          )}

          {(gameState === "playing" || gameState === "complete") && puzzle && (
            <div className="space-y-4">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                {/* Left Image (Original) */}
                <div className="relative">
                  <p className="text-sm font-medium text-center mb-2 text-muted-foreground">Original</p>
                  <div className="relative aspect-square bg-muted rounded-xl overflow-hidden border-2 border-border">
                    {puzzle.shapes.map((shape) => renderShape(shape, false))}
                  </div>
                </div>

                {/* Right Image (Modified) */}
                <div className="relative">
                  <p className="text-sm font-medium text-center mb-2 text-muted-foreground">
                    Find {puzzle.differences.length - foundDifferences.length} difference{puzzle.differences.length - foundDifferences.length !== 1 ? "s" : ""}
                  </p>
                  <div className="relative aspect-square bg-muted rounded-xl overflow-hidden border-2 border-border">
                    {puzzle.shapes.map((shape) => 
                      renderShape(shape, true, () => handleShapeClick(shape.id, true))
                    )}
                  </div>
                </div>
              </div>

              {gameState === "complete" && (
                <div className="text-center py-4">
                  <div className="inline-flex items-center gap-2 text-green-600 mb-4">
                    <Check className="w-6 h-6" />
                    <span className="text-xl font-semibold">Level Complete!</span>
                  </div>
                  <div>
                    <Button onClick={nextLevel}>
                      Next Level
                    </Button>
                  </div>
                </div>
              )}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Instructions */}
      <Card className="bg-muted/50 border-border">
        <CardHeader>
          <CardTitle className="text-base">How to Play</CardTitle>
        </CardHeader>
        <CardContent className="text-sm text-muted-foreground space-y-2">
          <p>1. Compare the two images side by side</p>
          <p>2. Click on the differences you spot in the RIGHT image</p>
          <p>3. Differences can be color changes or size changes</p>
          <p>4. Find all differences to complete the level!</p>
        </CardContent>
      </Card>
    </div>
  )
}
