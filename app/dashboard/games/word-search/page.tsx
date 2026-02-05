"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { ArrowLeft, RotateCcw, Trophy, Clock, Target } from "lucide-react"
import { cn } from "@/lib/utils"

const WORDS = ["CALM", "PEACE", "JOY", "LOVE", "HOPE", "REST"]
const GRID_SIZE = 8

interface Cell {
  letter: string
  row: number
  col: number
  isPartOfWord: boolean
  wordIndex?: number
}

function generateGrid(): { grid: Cell[][]; wordPositions: Map<string, [number, number][]> } {
  const grid: Cell[][] = Array(GRID_SIZE).fill(null).map((_, row) =>
    Array(GRID_SIZE).fill(null).map((_, col) => ({
      letter: "",
      row,
      col,
      isPartOfWord: false,
    }))
  )
  
  const wordPositions = new Map<string, [number, number][]>()
  const directions = [
    [0, 1],   // horizontal
    [1, 0],   // vertical
    [1, 1],   // diagonal
  ]
  
  // Place words
  for (let wordIndex = 0; wordIndex < WORDS.length; wordIndex++) {
    const word = WORDS[wordIndex]
    let placed = false
    let attempts = 0
    
    while (!placed && attempts < 100) {
      const direction = directions[Math.floor(Math.random() * directions.length)]
      const maxRow = GRID_SIZE - (direction[0] === 1 ? word.length : 1)
      const maxCol = GRID_SIZE - (direction[1] === 1 ? word.length : 1)
      
      if (maxRow < 0 || maxCol < 0) {
        attempts++
        continue
      }
      
      const startRow = Math.floor(Math.random() * (maxRow + 1))
      const startCol = Math.floor(Math.random() * (maxCol + 1))
      
      let canPlace = true
      for (let i = 0; i < word.length; i++) {
        const row = startRow + i * direction[0]
        const col = startCol + i * direction[1]
        if (grid[row][col].letter !== "" && grid[row][col].letter !== word[i]) {
          canPlace = false
          break
        }
      }
      
      if (canPlace) {
        const positions: [number, number][] = []
        for (let i = 0; i < word.length; i++) {
          const row = startRow + i * direction[0]
          const col = startCol + i * direction[1]
          grid[row][col].letter = word[i]
          grid[row][col].isPartOfWord = true
          grid[row][col].wordIndex = wordIndex
          positions.push([row, col])
        }
        wordPositions.set(word, positions)
        placed = true
      }
      attempts++
    }
  }
  
  // Fill remaining cells with random letters
  const letters = "ABCDEFGHIJKLMNOPQRSTUVWXYZ"
  for (let row = 0; row < GRID_SIZE; row++) {
    for (let col = 0; col < GRID_SIZE; col++) {
      if (grid[row][col].letter === "") {
        grid[row][col].letter = letters[Math.floor(Math.random() * letters.length)]
      }
    }
  }
  
  return { grid, wordPositions }
}

export default function WordSearchPage() {
  const [grid, setGrid] = useState<Cell[][]>([])
  const [wordPositions, setWordPositions] = useState<Map<string, [number, number][]>>(new Map())
  const [foundWords, setFoundWords] = useState<Set<string>>(new Set())
  const [selectedCells, setSelectedCells] = useState<[number, number][]>([])
  const [time, setTime] = useState(0)
  const [isPlaying, setIsPlaying] = useState(false)
  const [isComplete, setIsComplete] = useState(false)

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
    const { grid: newGrid, wordPositions: newWordPositions } = generateGrid()
    setGrid(newGrid)
    setWordPositions(newWordPositions)
    setFoundWords(new Set())
    setSelectedCells([])
    setTime(0)
    setIsPlaying(false)
    setIsComplete(false)
  }

  const handleCellClick = (row: number, col: number) => {
    if (!isPlaying) setIsPlaying(true)
    
    const cellIndex = selectedCells.findIndex(([r, c]) => r === row && c === col)
    
    if (cellIndex !== -1) {
      // Deselect if already selected
      setSelectedCells(selectedCells.slice(0, cellIndex))
    } else {
      // Add to selection
      const newSelection = [...selectedCells, [row, col] as [number, number]]
      setSelectedCells(newSelection)
      
      // Check if selection forms a word
      const selectedWord = newSelection.map(([r, c]) => grid[r][c].letter).join("")
      
      if (WORDS.includes(selectedWord)) {
        const positions = wordPositions.get(selectedWord)
        if (positions) {
          const isCorrectPath = newSelection.every(([r, c], i) => 
            positions[i] && positions[i][0] === r && positions[i][1] === c
          )
          
          if (isCorrectPath) {
            const newFound = new Set(foundWords)
            newFound.add(selectedWord)
            setFoundWords(newFound)
            setSelectedCells([])
            
            if (newFound.size === WORDS.length) {
              setIsComplete(true)
              setIsPlaying(false)
            }
          }
        }
      }
    }
  }

  const isCellSelected = (row: number, col: number) => {
    return selectedCells.some(([r, c]) => r === row && c === col)
  }

  const isCellFound = (row: number, col: number) => {
    for (const word of foundWords) {
      const positions = wordPositions.get(word)
      if (positions?.some(([r, c]) => r === row && c === col)) {
        return true
      }
    }
    return false
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
          <h1 className="text-2xl font-bold text-foreground">Word Search</h1>
          <p className="text-muted-foreground text-sm">Find the hidden wellness words</p>
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
            <Target className="w-5 h-5 text-muted-foreground" />
            <div>
              <p className="text-xs text-muted-foreground">Found</p>
              <p className="font-bold">{foundWords.size}/{WORDS.length}</p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Words to Find */}
      <Card className="bg-card border-border">
        <CardContent className="p-3">
          <p className="text-xs font-medium text-muted-foreground mb-2">Find these words:</p>
          <div className="flex flex-wrap gap-2">
            {WORDS.map((word) => (
              <span
                key={word}
                className={cn(
                  "px-2 py-1 rounded text-sm font-medium transition-all",
                  foundWords.has(word)
                    ? "bg-primary/20 text-primary line-through"
                    : "bg-muted text-muted-foreground"
                )}
              >
                {word}
              </span>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Game Board */}
      <Card className="bg-card border-border">
        <CardContent className="p-4">
          {isComplete ? (
            <div className="py-8 text-center">
              <div className="w-20 h-20 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
                <Trophy className="w-10 h-10 text-primary" />
              </div>
              <h2 className="text-2xl font-bold mb-2">Amazing!</h2>
              <p className="text-muted-foreground mb-4">
                You found all words in {formatTime(time)}!
              </p>
              <Button onClick={startNewGame}>
                <RotateCcw className="w-4 h-4 mr-2" />
                Play Again
              </Button>
            </div>
          ) : (
            <div className="grid grid-cols-8 gap-1">
              {grid.map((row, rowIndex) =>
                row.map((cell, colIndex) => (
                  <button
                    key={`${rowIndex}-${colIndex}`}
                    onClick={() => handleCellClick(rowIndex, colIndex)}
                    className={cn(
                      "aspect-square rounded text-sm font-bold flex items-center justify-center transition-all",
                      isCellFound(rowIndex, colIndex)
                        ? "bg-primary/20 text-primary"
                        : isCellSelected(rowIndex, colIndex)
                        ? "bg-accent text-accent-foreground ring-2 ring-primary"
                        : "bg-muted hover:bg-muted/80 text-foreground"
                    )}
                  >
                    {cell.letter}
                  </button>
                ))
              )}
            </div>
          )}
        </CardContent>
      </Card>

      <div className="flex justify-center gap-2">
        <Button variant="outline" onClick={() => setSelectedCells([])}>
          Clear Selection
        </Button>
        <Button variant="outline" onClick={startNewGame}>
          <RotateCcw className="w-4 h-4 mr-2" />
          New Puzzle
        </Button>
      </div>
    </div>
  )
}
