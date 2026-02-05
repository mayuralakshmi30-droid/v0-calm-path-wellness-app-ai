"use client"

import React from "react"

import { useState, useRef, useEffect } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { ScrollArea } from "@/components/ui/scroll-area"
import { useApp } from "@/lib/app-context"
import type { Therapist } from "@/lib/therapists"
import { Send, X } from "lucide-react"

interface TherapistChatProps {
  therapist: Therapist | null
  open: boolean
  onClose: () => void
}

export function TherapistChat({ therapist, open, onClose }: TherapistChatProps) {
  const { getChatMessages, addChatMessage } = useApp()
  const [message, setMessage] = useState("")
  const scrollRef = useRef<HTMLDivElement>(null)

  const messages = therapist ? getChatMessages(therapist.id) : []

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight
    }
  }, [messages])

  const handleSend = () => {
    if (!message.trim() || !therapist) return

    addChatMessage({
      therapistId: therapist.id,
      content: message,
      sender: "user",
    })

    // Simulate therapist response
    setTimeout(() => {
      const responses = [
        "Thank you for reaching out. I understand how you feel, and I'm here to help.",
        "That's a great question. Let's explore this further in our next session.",
        "I appreciate you sharing that with me. It takes courage to open up.",
        "I hear you. Let's work through this together step by step.",
        "Thank you for your message. I'll make a note of this for our upcoming session.",
        "That's completely normal to feel that way. Many of my clients experience similar feelings.",
      ]
      const randomResponse = responses[Math.floor(Math.random() * responses.length)]
      
      addChatMessage({
        therapistId: therapist.id,
        content: randomResponse,
        sender: "therapist",
      })
    }, 1000)

    setMessage("")
  }

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault()
      handleSend()
    }
  }

  if (!therapist) return null

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md h-[600px] flex flex-col p-0">
        <DialogHeader className="p-4 border-b border-border">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center text-sm font-bold text-primary">
                {therapist.name.split(" ").map(n => n[0]).join("")}
              </div>
              <div>
                <DialogTitle className="text-base">{therapist.name}</DialogTitle>
                <p className="text-xs text-muted-foreground">{therapist.title}</p>
              </div>
            </div>
            <Button variant="ghost" size="icon" onClick={onClose}>
              <X className="w-4 h-4" />
              <span className="sr-only">Close</span>
            </Button>
          </div>
        </DialogHeader>

        <ScrollArea className="flex-1 p-4" ref={scrollRef}>
          <div className="space-y-4">
            {messages.length === 0 && (
              <div className="text-center py-8">
                <p className="text-muted-foreground text-sm">
                  Start a conversation with {therapist.name}
                </p>
                <p className="text-xs text-muted-foreground mt-1">
                  They typically respond within a few hours
                </p>
              </div>
            )}
            
            {messages.map((msg) => (
              <div
                key={msg.id}
                className={`flex ${msg.sender === "user" ? "justify-end" : "justify-start"}`}
              >
                <div
                  className={`max-w-[80%] rounded-2xl px-4 py-2 ${
                    msg.sender === "user"
                      ? "bg-primary text-primary-foreground rounded-br-sm"
                      : "bg-muted text-foreground rounded-bl-sm"
                  }`}
                >
                  <p className="text-sm">{msg.content}</p>
                  <p className={`text-xs mt-1 ${msg.sender === "user" ? "text-primary-foreground/70" : "text-muted-foreground"}`}>
                    {new Date(msg.timestamp).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </ScrollArea>

        <div className="p-4 border-t border-border">
          <div className="flex items-center gap-2">
            <Input
              placeholder="Type your message..."
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              onKeyDown={handleKeyPress}
              className="flex-1"
            />
            <Button size="icon" onClick={handleSend} disabled={!message.trim()}>
              <Send className="w-4 h-4" />
              <span className="sr-only">Send message</span>
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
