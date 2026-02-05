"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { ArrowLeft, RotateCcw, Trophy, Clock, Lightbulb } from "lucide-react"
import { cn } from "@/lib/utils"

// Simple Sudoku generator for a 4x4 grid (easier for relaxation)
function generateSudoku(): { puzzle: (number | null)[][]; solution: number[][] } {
  const solution = [
    [1, 2, 3, 4],
    [3, 4, 1, 2],
    [2, 1, 4, 3],
    [4, 3, 2, 1],
  ]
  
  // Randomly shuffle rows within groups and columns
  const shuffled = solution.map(row => [...row])
  
  // Create puzzle by removing some numbers
  const puzzle: (number | null)[][] = shuffled.map(row => [...row])
  const cellsToRemove = 6 // Remove 6 cells for an easy puzzle
  let removed = 0
  
  while (removed < cellsToRemove) {
    const row = Math.floor(Math.random() * 4)
    const col = Math.floor(Math.random() * 4)
    if (puzzle[row][col] !== null) {
      puzzle[row][col] = null
      removed++
    }
  }
  
  return { puzzle, solution: shuffled }
}

export default function SudokuPage() {
  const [puzzle, setPuzzle] = useState<(number | null)[][]>([])
  const [solution, setSolution] = useState<number[][]>([])
  const [userInput, setUserInput] = useState<(number | null)[][]>([])
  const [selectedCell, setSelectedCell] = useState<[number, number] | null>(null)
  const [time, setTime] = useState(0)
  const [isPlaying, setIsPlaying] = useState(false)
  const [isComplete, setIsComplete] = useState(false)
  const [errors, setErrors] = useState<Set<string>>(new Set())

  useEffect(() => {
    startNewGame()
  }, [])

  useEffect(() => {
    let interval: NodeJS.Timeout
    if (isPlaying && !isComplete) {
      interval = setInterval(() => {
        setTime((prev) => prev + 1)
      }, 1000)
    }
    return () => clearInterval(interval)
  }, [isPlaying, isComplete])

  const startNewGame = () => {
    const { puzzle: newPuzzle, solution: newSolution } = generateSudoku()
    setPuzzle(newPuzzle)
    setSolution(newSolution)
    setUserInput(newPuzzle.map(row => [...row]))
    setSelectedCell(null)
    setTime(0)
    setIsPlaying(false)
    setIsComplete(false)
    setErrors(new Set())
  }

  const handleCellClick = (row: number, col: number) => {
    if (puzzle[row][col] !== null) return // Can't select pre-filled cells
    if (!isPlaying) setIsPlaying(true)
    setSelectedCell([row, col])
  }

  const handleNumberInput = (num: number) => {
    if (!selectedCell) return
    const [row, col] = selectedCell
    
    const newInput = userInput.map(r => [...r])
    newInput[row][col] = num
    setUserInput(newInput)
    
    // Check if correct
    const newErrors = new Set(errors)
    const key = `${row}-${col}`
    if (num !== solution[row][col]) {
      newErrors.add(key)
    } else {
      newErrors.delete(key)
    }
    setErrors(newErrors)
    
    // Check if complete
    const isAllFilled = newInput.every(row => row.every(cell => cell !== null))
    const isAllCorrect = newErrors.size === 0
    if (isAllFilled && isAllCorrect) {
      setIsComplete(true)
      setIsPlaying(false)
    }
  }

  const clearCell = () => {
    if (!selectedCell) return
    const [row, col] = selectedCell
    if (puzzle[row][col] !== null) return
    
    const newInput = userInput.map(r => [...r])
    newInput[row][col] = null
    setUserInput(newInput)
    
    const newErrors = new Set(errors)
    newErrors.delete(`${row}-${col}`)
    setErrors(newErrors)
  }

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins}:${secs.toString().padStart(2, "0")}`
  }

  return (
    <div className="max-w-md mx-auto space-y-6">
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" asChild>
          <Link href="/dashboard/games">
            <ArrowLeft className="w-5 h-5" />
            <span className="sr-only">Back to games</span>
          </Link>
        </Button>
        <div>
          <h1 className="text-2xl font-bold text-foreground">Sudoku</h1>
          <p className="text-muted-foreground text-sm">Fill in the grid with numbers 1-4</p>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 gap-4">
        <Card className="bg-card border-border">
          <CardContent className="p-3 flex items-center gap-3">
            <Clock className="w-5 h-5 text-muted-foreground" />
            <div>
              <p className="text-xs text-muted-foreground">Time</p>
              <p className="font-bold">{formatTime(time)}</p>
            </div>
          </CardContent>
        </Card>
        <Card className="bg-card border-border">
          <CardContent className="p-3 flex items-center gap-3">
            <Lightbulb className="w-5 h-5 text-muted-foreground" />
            <div>
              <p className="text-xs text-muted-foreground">Errors</p>
              <p className="font-bold">{errors.size}</p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Game Board */}
      <Card className="bg-card border-border">
        <CardContent className="p-4">
          {isComplete ? (
            <div className="py-8 text-center">
              <div className="w-20 h-20 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
                <Trophy className="w-10 h-10 text-primary" />
              </div>
              <h2 className="text-2xl font-bold mb-2">Well Done!</h2>
              <p className="text-muted-foreground mb-4">
                You solved the puzzle in {formatTime(time)}!
              </p>
              <Button onClick={startNewGame}>
                <RotateCcw className="w-4 h-4 mr-2" />
                New Puzzle
              </Button>
            </div>
          ) : (
            <>
              <div className="grid grid-cols-4 gap-1 mb-4">
                {userInput.map((row, rowIndex) =>
                  row.map((cell, colIndex) => {
                    const isOriginal = puzzle[rowIndex]?.[colIndex] !== null
                    const isSelected = selectedCell?.[0] === rowIndex && selectedCell?.[1] === colIndex
                    const hasError = errors.has(`${rowIndex}-${colIndex}`)
                    
                    return (
                      <button
                        key={`${rowIndex}-${colIndex}`}
                        onClick={() => handleCellClick(rowIndex, colIndex)}
                        className={cn(
                          "aspect-square rounded-lg text-xl font-bold flex items-center justify-center transition-all",
                          isOriginal
                            ? "bg-muted text-foreground cursor-default"
                            : "bg-card border-2 cursor-pointer hover:border-primary/50",
                          isSelected && "ring-2 ring-primary border-primary",
                          hasError && "bg-destructive/10 text-destructive border-destructive",
                          // Add thicker borders for 2x2 boxes
                          colIndex === 1 && "border-r-4 border-r-border",
                          rowIndex === 1 && "border-b-4 border-b-border"
                        )}
                      >
                        {cell}
                      </button>
                    )
                  })
                )}
              </div>

              {/* Number Input */}
              <div className="grid grid-cols-5 gap-2">
                {[1, 2, 3, 4].map((num) => (
                  <Button
                    key={num}
                    variant="outline"
                    onClick={() => handleNumberInput(num)}
                    disabled={!selectedCell}
                    className="aspect-square text-lg font-bold"
                  >
                    {num}
                  </Button>
                ))}
                <Button
                  variant="outline"
                  onClick={clearCell}
                  disabled={!selectedCell}
                  className="aspect-square text-sm bg-transparent"
                >
                  Clear
                </Button>
              </div>
            </>
          )}
        </CardContent>
      </Card>

      <div className="flex justify-center">
        <Button variant="outline" onClick={startNewGame}>
          <RotateCcw className="w-4 h-4 mr-2" />
          New Puzzle
        </Button>
      </div>
    </div>
  )
}
