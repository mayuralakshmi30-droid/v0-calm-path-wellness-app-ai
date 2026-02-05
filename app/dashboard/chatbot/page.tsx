"use client"

import React from "react"

import { useState, useRef, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Bot, Send, User, Sparkles } from "lucide-react"
import { cn } from "@/lib/utils"

interface Message {
  id: string
  content: string
  sender: "user" | "bot"
  timestamp: Date
}

const botResponses = [
  "I hear you. It's completely normal to feel that way. Would you like to talk more about what's on your mind?",
  "Thank you for sharing. Remember, taking time to reflect on your feelings is an important part of self-care.",
  "That sounds challenging. What do you think might help you feel better right now?",
  "I understand. Sometimes just expressing our thoughts can help us process them better.",
  "You're taking a positive step by reaching out. How long have you been feeling this way?",
  "It takes courage to share your feelings. Is there anything specific that triggered these thoughts?",
  "Remember to be kind to yourself. What's one small thing you could do today to take care of yourself?",
  "Your feelings are valid. Would it help to try a breathing exercise together?",
  "I'm here to listen. Take your time to express what you're going through.",
  "That's a great observation about yourself. Self-awareness is the first step toward positive change.",
]

const suggestionChips = [
  "I'm feeling stressed",
  "Help me relax",
  "I can't sleep",
  "I need motivation",
  "I'm feeling anxious",
]

export default function ChatbotPage() {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: "welcome",
      content: "Hello! I'm your wellness companion. I'm here to listen and support you on your mental health journey. How are you feeling today?",
      sender: "bot",
      timestamp: new Date(),
    },
  ])
  const [input, setInput] = useState("")
  const [isTyping, setIsTyping] = useState(false)
  const scrollRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight
    }
  }, [messages])

  const handleSend = (text?: string) => {
    const messageText = text || input
    if (!messageText.trim()) return

    const userMessage: Message = {
      id: crypto.randomUUID(),
      content: messageText,
      sender: "user",
      timestamp: new Date(),
    }

    setMessages((prev) => [...prev, userMessage])
    setInput("")
    setIsTyping(true)

    // Simulate bot thinking
    setTimeout(() => {
      const botMessage: Message = {
        id: crypto.randomUUID(),
        content: botResponses[Math.floor(Math.random() * botResponses.length)],
        sender: "bot",
        timestamp: new Date(),
      }
      setMessages((prev) => [...prev, botMessage])
      setIsTyping(false)
    }, 1000 + Math.random() * 1000)
  }

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault()
      handleSend()
    }
  }

  return (
    <div className="h-[calc(100vh-8rem)] lg:h-[calc(100vh-6rem)] flex flex-col">
      <div className="mb-4">
        <h1 className="text-2xl lg:text-3xl font-bold text-foreground">Wellness Chatbot</h1>
        <p className="text-muted-foreground mt-1">Your supportive companion for mental wellness</p>
      </div>

      <Card className="flex-1 flex flex-col bg-card border-border overflow-hidden">
        <CardHeader className="pb-3 border-b border-border">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
              <Bot className="w-5 h-5 text-primary" />
            </div>
            <div>
              <CardTitle className="text-base">CalmPath Assistant</CardTitle>
              <CardDescription className="text-xs">
                {isTyping ? "Typing..." : "Online"}
              </CardDescription>
            </div>
          </div>
        </CardHeader>

        <ScrollArea className="flex-1 p-4" ref={scrollRef}>
          <div className="space-y-4">
            {messages.map((message) => (
              <div
                key={message.id}
                className={cn(
                  "flex gap-3",
                  message.sender === "user" ? "flex-row-reverse" : "flex-row"
                )}
              >
                <div className={cn(
                  "w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0",
                  message.sender === "user" ? "bg-primary" : "bg-primary/10"
                )}>
                  {message.sender === "user" ? (
                    <User className="w-4 h-4 text-primary-foreground" />
                  ) : (
                    <Bot className="w-4 h-4 text-primary" />
                  )}
                </div>
                <div className={cn(
                  "max-w-[75%] rounded-2xl px-4 py-3",
                  message.sender === "user"
                    ? "bg-primary text-primary-foreground rounded-br-sm"
                    : "bg-muted text-foreground rounded-bl-sm"
                )}>
                  <p className="text-sm leading-relaxed">{message.content}</p>
                  <p className={cn(
                    "text-xs mt-1",
                    message.sender === "user" ? "text-primary-foreground/70" : "text-muted-foreground"
                  )}>
                    {message.timestamp.toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit" })}
                  </p>
                </div>
              </div>
            ))}

            {isTyping && (
              <div className="flex gap-3">
                <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
                  <Bot className="w-4 h-4 text-primary" />
                </div>
                <div className="bg-muted rounded-2xl rounded-bl-sm px-4 py-3">
                  <div className="flex gap-1">
                    <span className="w-2 h-2 bg-muted-foreground/50 rounded-full animate-bounce" style={{ animationDelay: "0ms" }} />
                    <span className="w-2 h-2 bg-muted-foreground/50 rounded-full animate-bounce" style={{ animationDelay: "150ms" }} />
                    <span className="w-2 h-2 bg-muted-foreground/50 rounded-full animate-bounce" style={{ animationDelay: "300ms" }} />
                  </div>
                </div>
              </div>
            )}
          </div>
        </ScrollArea>

        {/* Suggestion Chips */}
        {messages.length <= 2 && (
          <div className="px-4 pb-2">
            <div className="flex items-center gap-2 mb-2">
              <Sparkles className="w-4 h-4 text-muted-foreground" />
              <span className="text-xs text-muted-foreground">Suggestions</span>
            </div>
            <div className="flex flex-wrap gap-2">
              {suggestionChips.map((chip) => (
                <button
                  key={chip}
                  onClick={() => handleSend(chip)}
                  className="px-3 py-1.5 text-sm bg-muted hover:bg-muted/80 rounded-full transition-colors text-muted-foreground hover:text-foreground"
                >
                  {chip}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Input */}
        <CardContent className="p-4 border-t border-border">
          <div className="flex items-center gap-2">
            <Input
              placeholder="Type your message..."
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKeyPress}
              className="flex-1"
            />
            <Button size="icon" onClick={() => handleSend()} disabled={!input.trim() || isTyping}>
              <Send className="w-4 h-4" />
              <span className="sr-only">Send message</span>
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
