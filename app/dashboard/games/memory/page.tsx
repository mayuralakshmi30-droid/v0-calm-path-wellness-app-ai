"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { ArrowLeft, RotateCcw, Trophy, Clock, Zap } from "lucide-react"
import { cn } from "@/lib/utils"

const symbols = ["🌸", "🌺", "🌻", "🌷", "🌹", "🌼", "🍀", "🌿"]

interface Card_ {
  id: number
  symbol: string
  isFlipped: boolean
  isMatched: boolean
}

function shuffleArray<T>(array: T[]): T[] {
  const newArray = [...array]
  for (let i = newArray.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[newArray[i], newArray[j]] = [newArray[j], newArray[i]]
  }
  return newArray
}

function createCards(): Card_[] {
  const pairs = [...symbols, ...symbols]
  return shuffleArray(pairs).map((symbol, index) => ({
    id: index,
    symbol,
    isFlipped: false,
    isMatched: false,
  }))
}

export default function MemoryGamePage() {
  const [cards, setCards] = useState<Card_[]>([])
  const [flippedCards, setFlippedCards] = useState<number[]>([])
  const [moves, setMoves] = useState(0)
  const [matches, setMatches] = useState(0)
  const [time, setTime] = useState(0)
  const [isPlaying, setIsPlaying] = useState(false)
  const [isComplete, setIsComplete] = useState(false)

  useEffect(() => {
    setCards(createCards())
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

  useEffect(() => {
    if (matches === symbols.length && matches > 0) {
      setIsComplete(true)
      setIsPlaying(false)
    }
  }, [matches])

  const handleCardClick = (id: number) => {
    if (!isPlaying) setIsPlaying(true)
    
    const card = cards.find((c) => c.id === id)
    if (!card || card.isFlipped || card.isMatched || flippedCards.length >= 2) return

    const newCards = cards.map((c) =>
      c.id === id ? { ...c, isFlipped: true } : c
    )
    setCards(newCards)

    const newFlipped = [...flippedCards, id]
    setFlippedCards(newFlipped)

    if (newFlipped.length === 2) {
      setMoves((prev) => prev + 1)
      const [first, second] = newFlipped
      const firstCard = newCards.find((c) => c.id === first)
      const secondCard = newCards.find((c) => c.id === second)

      if (firstCard && secondCard && firstCard.symbol === secondCard.symbol) {
        setTimeout(() => {
          setCards((prev) =>
            prev.map((c) =>
              c.id === first || c.id === second ? { ...c, isMatched: true } : c
            )
          )
          setMatches((prev) => prev + 1)
          setFlippedCards([])
        }, 500)
      } else {
        setTimeout(() => {
          setCards((prev) =>
            prev.map((c) =>
              c.id === first || c.id === second ? { ...c, isFlipped: false } : c
            )
          )
          setFlippedCards([])
        }, 1000)
      }
    }
  }

  const resetGame = () => {
    setCards(createCards())
    setFlippedCards([])
    setMoves(0)
    setMatches(0)
    setTime(0)
    setIsPlaying(false)
    setIsComplete(false)
  }

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins}:${secs.toString().padStart(2, "0")}`
  }

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" asChild>
          <Link href="/dashboard/games">
            <ArrowLeft className="w-5 h-5" />
            <span className="sr-only">Back to games</span>
          </Link>
        </Button>
        <div>
          <h1 className="text-2xl font-bold text-foreground">Memory Match</h1>
          <p className="text-muted-foreground text-sm">Find all the matching pairs</p>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-4">
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
            <Zap className="w-5 h-5 text-muted-foreground" />
            <div>
              <p className="text-xs text-muted-foreground">Moves</p>
              <p className="font-bold">{moves}</p>
            </div>
          </CardContent>
        </Card>
        <Card className="bg-card border-border">
          <CardContent className="p-3 flex items-center gap-3">
            <Trophy className="w-5 h-5 text-muted-foreground" />
            <div>
              <p className="text-xs text-muted-foreground">Matches</p>
              <p className="font-bold">{matches}/{symbols.length}</p>
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
              <h2 className="text-2xl font-bold mb-2">Congratulations!</h2>
              <p className="text-muted-foreground mb-4">
                You completed the game in {formatTime(time)} with {moves} moves!
              </p>
              <Button onClick={resetGame}>
                <RotateCcw className="w-4 h-4 mr-2" />
                Play Again
              </Button>
            </div>
          ) : (
            <div className="grid grid-cols-4 gap-3">
              {cards.map((card) => (
                <button
                  key={card.id}
                  onClick={() => handleCardClick(card.id)}
                  disabled={card.isFlipped || card.isMatched}
                  className={cn(
                    "aspect-square rounded-xl text-3xl flex items-center justify-center transition-all duration-300 transform",
                    card.isFlipped || card.isMatched
                      ? "bg-primary/10 rotate-0"
                      : "bg-primary hover:bg-primary/90 cursor-pointer hover:scale-105 rotate-y-180"
                  )}
                  style={{
                    transformStyle: "preserve-3d",
                  }}
                >
                  {(card.isFlipped || card.isMatched) ? (
                    <span className={cn(card.isMatched && "opacity-50")}>{card.symbol}</span>
                  ) : (
                    <span className="text-primary-foreground text-lg font-bold">?</span>
                  )}
                </button>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      <div className="flex justify-center">
        <Button variant="outline" onClick={resetGame}>
          <RotateCcw className="w-4 h-4 mr-2" />
          Reset Game
        </Button>
      </div>
    </div>
  )
}
