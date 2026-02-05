"use client"

import { useState, useEffect, useRef } from "react"
import { useParams, useRouter } from "next/navigation"
import { useApp } from "@/lib/app-context"
import { useAuth } from "@/lib/auth-context"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Leaf, Video, VideoOff, Mic, MicOff, PhoneOff, Phone, Monitor, MessageCircle, Clock, ShieldAlert, Users } from "lucide-react"
import { cn } from "@/lib/utils"

type CallState = "lobby" | "connecting" | "in-call" | "ended" | "expired"
type CallMode = "video" | "audio"

export default function MeetPage() {
  const params = useParams()
  const router = useRouter()
  const { getSessionByMeetCode, markMeetLinkUsed } = useApp()
  const { user } = useAuth()
  const meetCode = params.code as string

  const [callState, setCallState] = useState<CallState>("lobby")
  const [callMode, setCallMode] = useState<CallMode>("video")
  const [isMuted, setIsMuted] = useState(false)
  const [isVideoOff, setIsVideoOff] = useState(false)
  const [callDuration, setCallDuration] = useState(0)
  const [showChat, setShowChat] = useState(false)
  const [chatInput, setChatInput] = useState("")
  const [chatMessages, setChatMessages] = useState<{ sender: string; text: string; time: string }[]>([])
  const timerRef = useRef<NodeJS.Timeout | null>(null)

  const session = getSessionByMeetCode(meetCode)

  // Check if session exists and link is valid
  const isExpired = !session || session.meetLinkUsed || session.status !== "scheduled"

  // Call duration timer
  useEffect(() => {
    if (callState === "in-call") {
      timerRef.current = setInterval(() => {
        setCallDuration((prev) => prev + 1)
      }, 1000)
    }
    return () => {
      if (timerRef.current) clearInterval(timerRef.current)
    }
  }, [callState])

  const formatDuration = (seconds: number) => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`
  }

  const handleJoinCall = (mode: CallMode) => {
    if (isExpired) return
    setCallMode(mode)
    setCallState("connecting")
    // Simulate connection delay
    setTimeout(() => {
      setCallState("in-call")
    }, 2000)
  }

  const handleEndCall = () => {
    if (timerRef.current) clearInterval(timerRef.current)
    setCallState("ended")
    if (session) {
      markMeetLinkUsed(session.id)
    }
  }

  const handleSendChat = () => {
    if (!chatInput.trim()) return
    setChatMessages((prev) => [
      ...prev,
      {
        sender: user?.name || "You",
        text: chatInput,
        time: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
      },
    ])
    setChatInput("")
  }

  // Expired / invalid link
  if (isExpired && callState === "lobby") {
    return (
      <div className="min-h-[80vh] flex items-center justify-center p-4">
        <Card className="bg-card border-border max-w-md w-full">
          <CardContent className="p-8 text-center">
            <div className="w-16 h-16 bg-destructive/10 rounded-full flex items-center justify-center mx-auto mb-4">
              <ShieldAlert className="w-8 h-8 text-destructive" />
            </div>
            <h2 className="text-xl font-bold mb-2">Link Expired</h2>
            <p className="text-muted-foreground mb-6">
              This meeting link has already been used or is no longer valid. Meeting links are one-time use only and can only be accessed for scheduled sessions.
            </p>
            <Button onClick={() => router.push("/dashboard/profile")} className="w-full">
              Back to Profile
            </Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  // Call ended
  if (callState === "ended") {
    return (
      <div className="min-h-[80vh] flex items-center justify-center p-4">
        <Card className="bg-card border-border max-w-md w-full">
          <CardContent className="p-8 text-center">
            <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
              <Phone className="w-8 h-8 text-primary" />
            </div>
            <h2 className="text-xl font-bold mb-2">Call Ended</h2>
            <p className="text-muted-foreground mb-2">
              Session with {session?.therapistName}
            </p>
            <p className="text-sm text-muted-foreground mb-1">
              Duration: {formatDuration(callDuration)}
            </p>
            <p className="text-xs text-muted-foreground mb-6">
              This meeting link has been marked as used and cannot be reused.
            </p>
            <div className="flex flex-col gap-2">
              <Button onClick={() => router.push("/dashboard/profile")}>
                Back to Profile
              </Button>
              <Button variant="outline" onClick={() => router.push("/dashboard")}>
                Go to Dashboard
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  // Lobby
  if (callState === "lobby") {
    return (
      <div className="min-h-[80vh] flex items-center justify-center p-4">
        <Card className="bg-card border-border max-w-lg w-full">
          <CardContent className="p-8">
            {/* Header */}
            <div className="flex items-center gap-3 mb-8">
              <div className="w-10 h-10 rounded-full bg-primary flex items-center justify-center">
                <Leaf className="w-5 h-5 text-primary-foreground" />
              </div>
              <div>
                <h2 className="font-bold text-lg">CalmPath Session</h2>
                <p className="text-xs text-muted-foreground">Secure & private video call</p>
              </div>
            </div>

            {/* Session details */}
            <div className="p-4 bg-muted/50 rounded-lg mb-6 space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">Therapist</span>
                <span className="font-medium">{session?.therapistName}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">Date</span>
                <span className="font-medium">
                  {session?.date && new Date(session.date).toLocaleDateString("en-US", {
                    weekday: "short",
                    month: "short",
                    day: "numeric",
                  })}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">Time</span>
                <span className="font-medium">{session?.time}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">Link Status</span>
                <Badge variant="secondary" className="text-xs bg-primary/10 text-primary">One-time use</Badge>
              </div>
            </div>

            {/* Preview area */}
            <div className="relative aspect-video bg-muted rounded-xl mb-6 flex items-center justify-center overflow-hidden">
              <div className="text-center">
                <div className="w-20 h-20 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-3">
                  <span className="text-2xl font-bold text-primary">
                    {user?.name?.split(" ").map(n => n[0]).join("").slice(0, 2)}
                  </span>
                </div>
                <p className="text-sm text-muted-foreground">{user?.name}</p>
              </div>
              <div className="absolute top-3 left-3">
                <Badge variant="secondary" className="text-xs">
                  <Users className="w-3 h-3 mr-1" />
                  Waiting to join
                </Badge>
              </div>
            </div>

            {/* Join buttons */}
            <div className="flex flex-col gap-3">
              <Button size="lg" onClick={() => handleJoinCall("video")} className="w-full">
                <Video className="w-5 h-5 mr-2" />
                Join with Video
              </Button>
              <Button size="lg" variant="outline" onClick={() => handleJoinCall("audio")} className="w-full">
                <Mic className="w-5 h-5 mr-2" />
                Join with Audio Only
              </Button>
            </div>

            <p className="text-xs text-center text-muted-foreground mt-4">
              By joining, you agree to CalmPath{"'"}s session privacy policy. This link will expire after use.
            </p>
          </CardContent>
        </Card>
      </div>
    )
  }

  // Connecting
  if (callState === "connecting") {
    return (
      <div className="min-h-[80vh] flex items-center justify-center p-4">
        <div className="text-center">
          <div className="w-20 h-20 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-6" />
          <h2 className="text-xl font-bold mb-2">Connecting...</h2>
          <p className="text-muted-foreground">Setting up your secure {callMode} call with {session?.therapistName}</p>
        </div>
      </div>
    )
  }

  // In-call interface
  return (
    <div className="fixed inset-0 bg-background z-50 flex flex-col">
      {/* Top bar */}
      <div className="flex items-center justify-between px-4 py-3 bg-card border-b border-border">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-full bg-primary flex items-center justify-center">
            <Leaf className="w-4 h-4 text-primary-foreground" />
          </div>
          <div>
            <p className="text-sm font-medium">Session with {session?.therapistName}</p>
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 rounded-full bg-red-500 animate-pulse" />
              <span className="text-xs text-muted-foreground">{formatDuration(callDuration)}</span>
            </div>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Badge variant="secondary" className="text-xs">
            {callMode === "video" ? "Video Call" : "Audio Call"}
          </Badge>
          <Badge variant="secondary" className="text-xs bg-primary/10 text-primary">
            Encrypted
          </Badge>
        </div>
      </div>

      {/* Main call area */}
      <div className="flex-1 flex relative">
        {/* Main video / audio view */}
        <div className={cn("flex-1 flex items-center justify-center bg-muted", showChat && "hidden sm:flex")}>
          {callMode === "video" && !isVideoOff ? (
            // Simulated video call view
            <div className="relative w-full h-full">
              {/* Therapist main view */}
              <div className="absolute inset-0 flex items-center justify-center bg-muted">
                <div className="text-center">
                  <div className="w-32 h-32 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-4">
                    <span className="text-4xl font-bold text-primary">
                      {session?.therapistName?.split(" ").map(n => n[0]).join("").slice(0, 2)}
                    </span>
                  </div>
                  <p className="text-lg font-medium">{session?.therapistName}</p>
                  <p className="text-sm text-muted-foreground">In session</p>
                </div>
              </div>

              {/* Self-view (picture-in-picture) */}
              <div className="absolute bottom-4 right-4 w-36 h-28 sm:w-48 sm:h-36 rounded-xl bg-card border-2 border-border shadow-lg flex items-center justify-center overflow-hidden">
                <div className="text-center">
                  <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-1">
                    <span className="text-sm font-bold text-primary">
                      {user?.name?.split(" ").map(n => n[0]).join("").slice(0, 2)}
                    </span>
                  </div>
                  <p className="text-xs text-muted-foreground">You</p>
                </div>
              </div>
            </div>
          ) : (
            // Audio only or video off
            <div className="text-center">
              <div className="flex items-center justify-center gap-8">
                <div className="text-center">
                  <div className="w-28 h-28 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-3">
                    <span className="text-3xl font-bold text-primary">
                      {session?.therapistName?.split(" ").map(n => n[0]).join("").slice(0, 2)}
                    </span>
                  </div>
                  <p className="font-medium">{session?.therapistName}</p>
                  <p className="text-xs text-muted-foreground">In session</p>
                </div>
                <div className="text-center">
                  <div className="w-28 h-28 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-3">
                    <span className="text-3xl font-bold text-primary">
                      {user?.name?.split(" ").map(n => n[0]).join("").slice(0, 2)}
                    </span>
                  </div>
                  <p className="font-medium">You</p>
                  <div className="flex items-center justify-center gap-1 mt-1">
                    {!isMuted && (
                      <>
                        <div className="w-1 h-3 bg-primary rounded-full animate-pulse" />
                        <div className="w-1 h-5 bg-primary rounded-full animate-pulse" style={{ animationDelay: "0.1s" }} />
                        <div className="w-1 h-4 bg-primary rounded-full animate-pulse" style={{ animationDelay: "0.2s" }} />
                        <div className="w-1 h-6 bg-primary rounded-full animate-pulse" style={{ animationDelay: "0.3s" }} />
                        <div className="w-1 h-3 bg-primary rounded-full animate-pulse" style={{ animationDelay: "0.4s" }} />
                      </>
                    )}
                  </div>
                </div>
              </div>
              {callMode === "audio" && (
                <p className="text-sm text-muted-foreground mt-6">Audio call in progress</p>
              )}
            </div>
          )}
        </div>

        {/* Chat sidebar */}
        {showChat && (
          <div className="w-full sm:w-80 border-l border-border flex flex-col bg-card">
            <div className="flex items-center justify-between p-3 border-b border-border">
              <h3 className="font-medium text-sm">In-call Chat</h3>
              <Button variant="ghost" size="sm" onClick={() => setShowChat(false)} className="h-7 w-7 p-0">
                <span className="sr-only">Close chat</span>
                <span className="text-muted-foreground">x</span>
              </Button>
            </div>
            <div className="flex-1 overflow-y-auto p-3 space-y-3">
              {chatMessages.length === 0 && (
                <p className="text-xs text-muted-foreground text-center py-8">
                  No messages yet. Send a message to start chatting during the session.
                </p>
              )}
              {chatMessages.map((msg, i) => (
                <div key={i} className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-medium">{msg.sender}</span>
                    <span className="text-xs text-muted-foreground">{msg.time}</span>
                  </div>
                  <p className="text-sm bg-muted/50 rounded-lg px-3 py-2">{msg.text}</p>
                </div>
              ))}
            </div>
            <div className="p-3 border-t border-border">
              <form
                onSubmit={(e) => {
                  e.preventDefault()
                  handleSendChat()
                }}
                className="flex gap-2"
              >
                <input
                  type="text"
                  placeholder="Type a message..."
                  value={chatInput}
                  onChange={(e) => setChatInput(e.target.value)}
                  className="flex h-9 w-full rounded-md border border-input bg-background px-3 py-1 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                />
                <Button size="sm" type="submit" className="h-9 px-3">
                  Send
                </Button>
              </form>
            </div>
          </div>
        )}
      </div>

      {/* Bottom controls */}
      <div className="flex items-center justify-center gap-3 px-4 py-4 bg-card border-t border-border">
        <Button
          variant={isMuted ? "destructive" : "outline"}
          size="lg"
          className="rounded-full w-12 h-12 p-0"
          onClick={() => setIsMuted(!isMuted)}
          aria-label={isMuted ? "Unmute" : "Mute"}
        >
          {isMuted ? <MicOff className="w-5 h-5" /> : <Mic className="w-5 h-5" />}
        </Button>

        {callMode === "video" && (
          <Button
            variant={isVideoOff ? "destructive" : "outline"}
            size="lg"
            className="rounded-full w-12 h-12 p-0"
            onClick={() => setIsVideoOff(!isVideoOff)}
            aria-label={isVideoOff ? "Turn on camera" : "Turn off camera"}
          >
            {isVideoOff ? <VideoOff className="w-5 h-5" /> : <Video className="w-5 h-5" />}
          </Button>
        )}

        <Button
          variant="outline"
          size="lg"
          className="rounded-full w-12 h-12 p-0"
          onClick={() => setShowChat(!showChat)}
          aria-label="Toggle chat"
        >
          <MessageCircle className="w-5 h-5" />
        </Button>

        <Button
          variant="destructive"
          size="lg"
          className="rounded-full w-14 h-14 p-0"
          onClick={handleEndCall}
          aria-label="End call"
        >
          <PhoneOff className="w-6 h-6" />
        </Button>
      </div>
    </div>
  )
}
