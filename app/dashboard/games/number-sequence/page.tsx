"use client"

import { useState, useCallback } from "react"
import Link from "next/link"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { ArrowLeft, Play, RotateCcw, Calculator, Check, X } from "lucide-react"
import { cn } from "@/lib/utils"

type SequenceType = "arithmetic" | "geometric" | "fibonacci" | "square" | "prime"

const generateSequence = (type: SequenceType): { sequence: number[]; answer: number; hint: string } => {
  switch (type) {
    case "arithmetic": {
      const start = Math.floor(Math.random() * 10) + 1
      const diff = Math.floor(Math.random() * 8) + 2
      const seq = Array.from({ length: 5 }, (_, i) => start + i * diff)
      return { sequence: seq.slice(0, 4), answer: seq[4], hint: "Add the same number each time" }
    }
    case "geometric": {
      const start = Math.floor(Math.random() * 3) + 2
      const ratio = Math.floor(Math.random() * 2) + 2
      const seq = Array.from({ length: 5 }, (_, i) => start * Math.pow(ratio, i))
      return { sequence: seq.slice(0, 4), answer: seq[4], hint: "Multiply by the same number each time" }
    }
    case "fibonacci": {
      const a = Math.floor(Math.random() * 5) + 1
      const b = Math.floor(Math.random() * 5) + 1
      const seq = [a, b]
      for (let i = 2; i < 6; i++) {
        seq.push(seq[i - 1] + seq[i - 2])
      }
      return { sequence: seq.slice(0, 5), answer: seq[5], hint: "Each number is the sum of the two before it" }
    }
    case "square": {
      const start = Math.floor(Math.random() * 3) + 1
      const seq = Array.from({ length: 5 }, (_, i) => Math.pow(start + i, 2))
      return { sequence: seq.slice(0, 4), answer: seq[4], hint: "Think about square numbers" }
    }
    case "prime": {
      const primes = [2, 3, 5, 7, 11, 13, 17, 19, 23, 29, 31]
      const startIdx = Math.floor(Math.random() * 4)
      const seq = primes.slice(startIdx, startIdx + 5)
      return { sequence: seq.slice(0, 4), answer: seq[4], hint: "These are special numbers divisible only by 1 and themselves" }
    }
  }
}

export default function NumberSequencePage() {
  const [gameState, setGameState] = useState<"idle" | "playing" | "correct" | "wrong">("idle")
  const [sequence, setSequence] = useState<number[]>([])
  const [answer, setAnswer] = useState(0)
  const [hint, setHint] = useState("")
  const [userAnswer, setUserAnswer] = useState("")
  const [score, setScore] = useState(0)
  const [streak, setStreak] = useState(0)
  const [showHint, setShowHint] = useState(false)

  const sequenceTypes: SequenceType[] = ["arithmetic", "geometric", "fibonacci", "square", "prime"]

  const generateNewPuzzle = useCallback(() => {
    const type = sequenceTypes[Math.floor(Math.random() * sequenceTypes.length)]
    const puzzle = generateSequence(type)
    setSequence(puzzle.sequence)
    setAnswer(puzzle.answer)
    setHint(puzzle.hint)
    setUserAnswer("")
    setShowHint(false)
    setGameState("playing")
  }, [])

  const startGame = () => {
    setScore(0)
    setStreak(0)
    generateNewPuzzle()
  }

  const handleSubmit = () => {
    const numAnswer = parseInt(userAnswer)
    if (numAnswer === answer) {
      setScore((s) => s + (10 * (streak + 1)))
      setStreak((s) => s + 1)
      setGameState("correct")
    } else {
      setStreak(0)
      setGameState("wrong")
    }
  }

  const handleNext = () => {
    generateNewPuzzle()
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
          <h1 className="text-2xl font-bold text-foreground">Number Sequence</h1>
          <p className="text-muted-foreground">Find the next number in the pattern</p>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 gap-4">
        <Card className="bg-card border-border">
          <CardContent className="p-4 text-center">
            <p className="text-sm text-muted-foreground">Score</p>
            <p className="text-2xl font-bold">{score}</p>
          </CardContent>
        </Card>
        <Card className="bg-card border-border">
          <CardContent className="p-4 text-center">
            <p className="text-sm text-muted-foreground">Streak</p>
            <p className="text-2xl font-bold">{streak}</p>
          </CardContent>
        </Card>
      </div>

      {/* Game Area */}
      <Card className={cn(
        "bg-card border-border transition-colors",
        gameState === "correct" && "border-green-500",
        gameState === "wrong" && "border-red-500"
      )}>
        <CardContent className="p-8">
          <div className="flex flex-col items-center justify-center min-h-[300px]">
            {gameState === "idle" && (
              <div className="text-center">
                <div className="w-20 h-20 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-4">
                  <Calculator className="w-10 h-10 text-primary" />
                </div>
                <h2 className="text-xl font-semibold mb-2">Test Your Logic</h2>
                <p className="text-muted-foreground mb-6 max-w-sm">
                  Find the pattern and predict the next number in the sequence.
                </p>
                <Button size="lg" onClick={startGame}>
                  <Play className="w-5 h-5 mr-2" />
                  Start Game
                </Button>
              </div>
            )}

            {(gameState === "playing" || gameState === "correct" || gameState === "wrong") && (
              <div className="w-full max-w-md">
                {/* Sequence Display */}
                <div className="flex flex-wrap justify-center gap-3 mb-8">
                  {sequence.map((num, i) => (
                    <div
                      key={i}
                      className="w-14 h-14 sm:w-16 sm:h-16 rounded-xl bg-primary/10 flex items-center justify-center text-xl sm:text-2xl font-bold text-primary"
                    >
                      {num}
                    </div>
                  ))}
                  <div
                    className={cn(
                      "w-14 h-14 sm:w-16 sm:h-16 rounded-xl flex items-center justify-center text-xl sm:text-2xl font-bold border-2 border-dashed",
                      gameState === "correct" && "bg-green-500/20 border-green-500 text-green-600",
                      gameState === "wrong" && "bg-red-500/20 border-red-500 text-red-600",
                      gameState === "playing" && "border-primary/50"
                    )}
                  >
                    {gameState === "playing" ? "?" : answer}
                  </div>
                </div>

                {gameState === "playing" && (
                  <>
                    {/* Input */}
                    <div className="flex gap-2 mb-4">
                      <Input
                        type="number"
                        placeholder="Your answer"
                        value={userAnswer}
                        onChange={(e) => setUserAnswer(e.target.value)}
                        onKeyDown={(e) => e.key === "Enter" && userAnswer && handleSubmit()}
                        className="text-center text-lg"
                      />
                      <Button onClick={handleSubmit} disabled={!userAnswer}>
                        Submit
                      </Button>
                    </div>

                    {/* Hint */}
                    <div className="text-center">
                      {showHint ? (
                        <p className="text-sm text-muted-foreground bg-muted p-2 rounded">
                          Hint: {hint}
                        </p>
                      ) : (
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => setShowHint(true)}
                          className="text-muted-foreground"
                        >
                          Need a hint?
                        </Button>
                      )}
                    </div>
                  </>
                )}

                {gameState === "correct" && (
                  <div className="text-center">
                    <div className="flex items-center justify-center gap-2 text-green-600 mb-4">
                      <Check className="w-6 h-6" />
                      <span className="text-xl font-semibold">Correct!</span>
                    </div>
                    <p className="text-muted-foreground mb-4">
                      +{10 * streak} points (Streak: {streak})
                    </p>
                    <Button onClick={handleNext}>
                      Next Puzzle
                    </Button>
                  </div>
                )}

                {gameState === "wrong" && (
                  <div className="text-center">
                    <div className="flex items-center justify-center gap-2 text-red-600 mb-4">
                      <X className="w-6 h-6" />
                      <span className="text-xl font-semibold">Not quite!</span>
                    </div>
                    <p className="text-muted-foreground mb-4">
                      The answer was {answer}. {hint}
                    </p>
                    <Button onClick={handleNext}>
                      Try Another
                    </Button>
                  </div>
                )}
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
          <p>1. Look at the sequence of numbers</p>
          <p>2. Find the pattern connecting them</p>
          <p>3. Enter what you think comes next</p>
          <p>4. Build streaks for bonus points!</p>
        </CardContent>
      </Card>
    </div>
  )
}
