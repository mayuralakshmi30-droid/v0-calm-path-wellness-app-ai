"use client"

import { useState, useEffect, useRef } from "react"
import { useParams, useRouter } from "next/navigation"
import { useApp } from "@/lib/app-context"
import { useAuth } from "@/lib/auth-context"
import { therapists } from "@/lib/therapists"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import {
  Leaf, Video, VideoOff, Mic, MicOff, PhoneOff, Phone, MessageCircle,
  ShieldAlert, Users, Download, FileText, Star, Check, ChevronRight,
} from "lucide-react"
import { cn } from "@/lib/utils"

type CallState = "lobby" | "connecting" | "in-call" | "ended"
type CallMode = "video" | "audio"
type PostCallStep = "report" | "feedback" | "done"

// Generate a therapist report based on the session
function generateTherapistReport(therapistName: string, userName: string, duration: number): string {
  const minutes = Math.floor(duration / 60)
  const reports = [
    {
      summary: `Session with ${userName} focused on exploring emotional patterns and developing healthier coping strategies. ${userName} showed great openness in discussing personal challenges and demonstrated willingness to implement suggested techniques.`,
      observations: `- Presented with mild to moderate anxiety symptoms\n- Demonstrated good self-awareness about triggers\n- Showed positive engagement with therapeutic exercises\n- Communication was open and reflective`,
      exercises: `1. Daily Grounding Exercise: Practice the 5-4-3-2-1 sensory grounding technique every morning for 5 minutes\n2. Thought Journal: Write down 3 negative thoughts each day and reframe them with balanced alternatives\n3. Progressive Muscle Relaxation: Perform 15-minute PMR before bedtime to improve sleep quality\n4. Breathing Exercise: Practice 4-7-8 breathing (inhale 4s, hold 7s, exhale 8s) during moments of stress\n5. Gratitude Practice: List 3 things you are grateful for each evening before sleep`,
      recommendations: `Continue practicing the prescribed exercises daily. Focus on maintaining a regular sleep schedule and incorporating mindfulness into your routine. We recommend scheduling a follow-up session within the next 2 weeks to review progress and adjust the treatment plan if needed.`,
    },
    {
      summary: `Today's session with ${userName} centered on identifying cognitive distortions and developing a personalized toolkit for managing stress. ${userName} actively participated in guided visualization and showed notable progress from previous concerns.`,
      observations: `- Expressed feelings of overwhelm related to work/personal balance\n- Demonstrated improved emotional regulation since initial intake\n- Receptive to cognitive behavioral techniques\n- Identified key patterns in thought processes`,
      exercises: `1. Mindful Breathing: Practice diaphragmatic breathing for 10 minutes twice daily\n2. Worry Time Scheduling: Allocate 20 minutes daily to address worries, then redirect attention\n3. Behavioral Activation: Engage in one enjoyable activity daily, even for 15 minutes\n4. Body Scan Meditation: Perform a 10-minute body scan before sleep using guided audio\n5. Positive Affirmation Practice: Repeat 3 self-affirming statements each morning in front of a mirror`,
      recommendations: `Focus on implementing the behavioral activation exercises to counteract low mood periods. Keep a mood log to track patterns. Consider integrating light physical activity (walking, yoga) into daily routine as this complements the therapeutic work. Follow-up recommended in 10-14 days.`,
    },
  ]
  const chosen = reports[Math.floor(Math.random() * reports.length)]

  return `CALMPATH THERAPIST SESSION REPORT
======================================

Therapist: ${therapistName}
Client: ${userName}
Session Duration: ${minutes > 0 ? `${minutes} minutes` : "< 1 minute"}
Date: ${new Date().toLocaleDateString("en-US", { weekday: "long", year: "numeric", month: "long", day: "numeric" })}

--------------------------------------
SESSION SUMMARY
--------------------------------------
${chosen.summary}

--------------------------------------
CLINICAL OBSERVATIONS
--------------------------------------
${chosen.observations}

--------------------------------------
PRESCRIBED EXERCISES & HOMEWORK
--------------------------------------
${chosen.exercises}

--------------------------------------
RECOMMENDATIONS
--------------------------------------
${chosen.recommendations}

--------------------------------------
NEXT STEPS
--------------------------------------
- Complete all prescribed exercises daily
- Maintain your mood and thought journal
- Schedule next session within 2 weeks
- Contact our crisis helpline if you experience severe distress

This report is confidential and intended solely for the client.
Generated by CalmPath Wellness Platform.`
}

function downloadReportAsPDF(reportText: string, therapistName: string) {
  // Create a styled HTML document for printing as PDF
  const printWindow = window.open("", "_blank")
  if (!printWindow) {
    // Fallback: download as text file
    const blob = new Blob([reportText], { type: "text/plain" })
    const url = URL.createObjectURL(blob)
    const a = document.createElement("a")
    a.href = url
    a.download = `CalmPath_Report_${therapistName.replace(/\s/g, "_")}_${new Date().toISOString().split("T")[0]}.txt`
    a.click()
    URL.revokeObjectURL(url)
    return
  }

  const sections = reportText.split("--------------------------------------")

  printWindow.document.write(`
    <!DOCTYPE html>
    <html>
    <head>
      <title>CalmPath Session Report - ${therapistName}</title>
      <style>
        @media print { body { -webkit-print-color-adjust: exact; print-color-adjust: exact; } }
        body { font-family: 'Segoe UI', system-ui, sans-serif; max-width: 700px; margin: 40px auto; padding: 0 20px; color: #1a1a1a; line-height: 1.6; }
        .header { text-align: center; border-bottom: 3px solid #16a34a; padding-bottom: 20px; margin-bottom: 30px; }
        .header h1 { color: #16a34a; font-size: 24px; margin: 0 0 4px; }
        .header p { color: #666; margin: 0; font-size: 13px; }
        .meta { background: #f0fdf4; border: 1px solid #bbf7d0; border-radius: 8px; padding: 16px; margin-bottom: 24px; }
        .meta-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 8px; }
        .meta-item label { font-size: 11px; text-transform: uppercase; letter-spacing: 0.05em; color: #666; display: block; }
        .meta-item span { font-weight: 600; font-size: 14px; }
        .section { margin-bottom: 24px; }
        .section h2 { font-size: 14px; text-transform: uppercase; letter-spacing: 0.05em; color: #16a34a; border-bottom: 1px solid #e5e7eb; padding-bottom: 6px; margin-bottom: 12px; }
        .section p, .section li { font-size: 14px; }
        .section ul { padding-left: 20px; }
        .footer { text-align: center; border-top: 1px solid #e5e7eb; padding-top: 16px; margin-top: 30px; color: #999; font-size: 11px; }
        pre { white-space: pre-wrap; font-family: inherit; font-size: 14px; margin: 0; }
      </style>
    </head>
    <body>
      <div class="header">
        <h1>CalmPath</h1>
        <p>Wellness Session Report</p>
      </div>
      ${sections.map((s, i) => {
        const trimmed = s.trim()
        if (i === 0) {
          // Header section with meta info
          const lines = trimmed.split("\n").filter((l: string) => !l.startsWith("==="))
          return `<div class="meta"><div class="meta-grid">${lines.filter((l: string) => l.includes(":")).map((l: string) => {
            const [label, ...val] = l.split(":")
            return `<div class="meta-item"><label>${label.trim()}</label><span>${val.join(":").trim()}</span></div>`
          }).join("")}</div></div>`
        }
        if (!trimmed) return ""
        const lines = trimmed.split("\n")
        const title = lines[0]
        const content = lines.slice(1).join("\n").trim()
        if (!title || !content) return ""
        return `<div class="section"><h2>${title}</h2><pre>${content}</pre></div>`
      }).join("")}
      <div class="footer">
        <p>This report is confidential and intended solely for the client.</p>
        <p>Generated by CalmPath Wellness Platform on ${new Date().toLocaleDateString()}</p>
      </div>
    </body>
    </html>
  `)
  printWindow.document.close()
  setTimeout(() => {
    printWindow.print()
  }, 500)
}

export default function MeetPage() {
  const params = useParams()
  const router = useRouter()
  const { getSessionByMeetCode, markMeetLinkUsed, completeSession, addSessionReport, addSessionFeedback } = useApp()
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

  // Post-call state
  const [postCallStep, setPostCallStep] = useState<PostCallStep>("report")
  const [reportText, setReportText] = useState("")
  const [feedbackRating, setFeedbackRating] = useState(0)
  const [feedbackTherapistBehavior, setFeedbackTherapistBehavior] = useState("")
  const [feedbackSessionHelpful, setFeedbackSessionHelpful] = useState("")
  const [feedbackComfortable, setFeedbackComfortable] = useState("")
  const [feedbackRecommend, setFeedbackRecommend] = useState("")
  const [feedbackImprove, setFeedbackImprove] = useState("")
  const [feedbackExercisesClarity, setFeedbackExercisesClarity] = useState("")
  const [feedbackAdditional, setFeedbackAdditional] = useState("")
  const [feedbackSubmitted, setFeedbackSubmitted] = useState(false)

  const session = getSessionByMeetCode(meetCode)
  const therapist = session ? therapists.find(t => t.id === session.therapistId) : null
  const isExpired = !session || session.meetLinkUsed || session.status !== "scheduled"

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
    setTimeout(() => {
      setCallState("in-call")
    }, 2000)
  }

  const handleEndCall = () => {
    if (timerRef.current) clearInterval(timerRef.current)
    // Generate the report
    const report = generateTherapistReport(
      session?.therapistName || "Therapist",
      user?.name || "Client",
      callDuration,
    )
    setReportText(report)
    // Save report and mark session
    if (session) {
      addSessionReport(session.id, report)
      markMeetLinkUsed(session.id)
      completeSession(session.id)
    }
    setPostCallStep("report")
    setCallState("ended")
  }

  const handleDownloadReport = () => {
    downloadReportAsPDF(reportText, session?.therapistName || "Therapist")
  }

  const handleSubmitFeedback = () => {
    if (!session) return
    const fullFeedback = [
      `Overall Rating: ${feedbackRating}/5`,
      `Therapist Behavior: ${feedbackTherapistBehavior}`,
      `Session Helpful: ${feedbackSessionHelpful}`,
      `Felt Comfortable: ${feedbackComfortable}`,
      `Would Recommend: ${feedbackRecommend}`,
      `Exercises Clarity: ${feedbackExercisesClarity}`,
      `What Could Improve: ${feedbackImprove}`,
      feedbackAdditional ? `Additional Comments: ${feedbackAdditional}` : "",
    ].filter(Boolean).join("\n")
    addSessionFeedback(session.id, fullFeedback)
    setFeedbackSubmitted(true)
    setTimeout(() => {
      setPostCallStep("done")
    }, 1500)
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
              This meeting link has already been used or is no longer valid. Meeting links are one-time use only.
            </p>
            <Button onClick={() => router.push("/dashboard/profile")} className="w-full">
              Back to Profile
            </Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  // Call ended -- post-session flow
  if (callState === "ended") {
    return (
      <div className="min-h-[80vh] flex items-center justify-center p-4">
        <Card className="bg-card border-border max-w-2xl w-full">
          <CardContent className="p-6 sm:p-8">
            {/* Step indicator */}
            <div className="flex items-center gap-2 mb-6">
              <div className={cn(
                "flex items-center gap-1.5 text-xs font-medium",
                postCallStep === "report" ? "text-primary" : "text-muted-foreground"
              )}>
                <div className={cn(
                  "w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold",
                  postCallStep === "report" ? "bg-primary text-primary-foreground" : "bg-primary/20 text-primary"
                )}>
                  {postCallStep !== "report" ? <Check className="w-3.5 h-3.5" /> : "1"}
                </div>
                Report
              </div>
              <div className={cn("flex-1 h-0.5", postCallStep !== "report" ? "bg-primary" : "bg-border")} />
              <div className={cn(
                "flex items-center gap-1.5 text-xs font-medium",
                postCallStep === "feedback" ? "text-primary" : "text-muted-foreground"
              )}>
                <div className={cn(
                  "w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold",
                  postCallStep === "feedback" ? "bg-primary text-primary-foreground" :
                    postCallStep === "done" ? "bg-primary/20 text-primary" : "bg-muted text-muted-foreground"
                )}>
                  {postCallStep === "done" ? <Check className="w-3.5 h-3.5" /> : "2"}
                </div>
                Feedback
              </div>
              <div className={cn("flex-1 h-0.5", postCallStep === "done" ? "bg-primary" : "bg-border")} />
              <div className={cn(
                "flex items-center gap-1.5 text-xs font-medium",
                postCallStep === "done" ? "text-primary" : "text-muted-foreground"
              )}>
                <div className={cn(
                  "w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold",
                  postCallStep === "done" ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground"
                )}>
                  3
                </div>
                Done
              </div>
            </div>

            {/* STEP 1: Report */}
            {postCallStep === "report" && (
              <div className="space-y-6">
                <div className="text-center">
                  <div className="w-14 h-14 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-3">
                    <FileText className="w-7 h-7 text-primary" />
                  </div>
                  <h2 className="text-xl font-bold">Session Report</h2>
                  <p className="text-sm text-muted-foreground mt-1">
                    Your therapist has prepared a report with observations and exercises
                  </p>
                </div>

                <div className="p-4 bg-muted/50 rounded-lg flex items-center justify-between text-sm">
                  <div>
                    <span className="text-muted-foreground">Session with </span>
                    <span className="font-medium">{session?.therapistName}</span>
                  </div>
                  <span className="text-muted-foreground">Duration: {formatDuration(callDuration)}</span>
                </div>

                <div className="bg-muted/30 border border-border rounded-lg p-4 max-h-72 overflow-y-auto">
                  <pre className="text-sm whitespace-pre-wrap font-sans leading-relaxed">
                    {reportText}
                  </pre>
                </div>

                <div className="flex flex-col sm:flex-row gap-3">
                  <Button onClick={handleDownloadReport} variant="outline" className="flex-1">
                    <Download className="w-4 h-4 mr-2" />
                    Download Report (PDF)
                  </Button>
                  <Button onClick={() => setPostCallStep("feedback")} className="flex-1">
                    Continue to Feedback
                    <ChevronRight className="w-4 h-4 ml-2" />
                  </Button>
                </div>
              </div>
            )}

            {/* STEP 2: Feedback Form */}
            {postCallStep === "feedback" && (
              <div className="space-y-6">
                <div className="text-center">
                  <div className="w-14 h-14 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-3">
                    <Star className="w-7 h-7 text-primary" />
                  </div>
                  <h2 className="text-xl font-bold">Session Feedback</h2>
                  <p className="text-sm text-muted-foreground mt-1">
                    Help us improve by sharing your experience with {session?.therapistName}
                  </p>
                </div>

                {feedbackSubmitted ? (
                  <div className="py-8 text-center">
                    <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
                      <Check className="w-8 h-8 text-primary" />
                    </div>
                    <h3 className="font-semibold text-lg">Thank you for your feedback!</h3>
                    <p className="text-muted-foreground text-sm mt-1">Your response helps us provide better care.</p>
                  </div>
                ) : (
                  <div className="space-y-5 max-h-[60vh] overflow-y-auto pr-1">
                    {/* Overall Rating */}
                    <div className="space-y-2">
                      <Label className="text-sm font-semibold">1. How would you rate this session overall?</Label>
                      <div className="flex items-center gap-1">
                        {[1, 2, 3, 4, 5].map((star) => (
                          <button
                            key={star}
                            type="button"
                            onClick={() => setFeedbackRating(star)}
                            className="p-1 hover:scale-110 transition-transform"
                            aria-label={`Rate ${star} stars`}
                          >
                            <Star
                              className={cn(
                                "w-8 h-8",
                                star <= feedbackRating
                                  ? "fill-amber-400 text-amber-400"
                                  : "text-muted-foreground/30"
                              )}
                            />
                          </button>
                        ))}
                        {feedbackRating > 0 && (
                          <span className="text-sm text-muted-foreground ml-2">{feedbackRating}/5</span>
                        )}
                      </div>
                    </div>

                    {/* Therapist behavior */}
                    <div className="space-y-2">
                      <Label className="text-sm font-semibold">2. How was the therapist{"'"}s behavior and professionalism?</Label>
                      <RadioGroup value={feedbackTherapistBehavior} onValueChange={setFeedbackTherapistBehavior}>
                        <div className="flex items-center gap-2">
                          <RadioGroupItem value="Excellent" id="behavior-excellent" />
                          <Label htmlFor="behavior-excellent" className="text-sm font-normal">Excellent - Very professional and empathetic</Label>
                        </div>
                        <div className="flex items-center gap-2">
                          <RadioGroupItem value="Good" id="behavior-good" />
                          <Label htmlFor="behavior-good" className="text-sm font-normal">Good - Professional and attentive</Label>
                        </div>
                        <div className="flex items-center gap-2">
                          <RadioGroupItem value="Average" id="behavior-average" />
                          <Label htmlFor="behavior-average" className="text-sm font-normal">Average - Could be more engaged</Label>
                        </div>
                        <div className="flex items-center gap-2">
                          <RadioGroupItem value="Below Average" id="behavior-below" />
                          <Label htmlFor="behavior-below" className="text-sm font-normal">Below Average - Felt disconnected</Label>
                        </div>
                      </RadioGroup>
                    </div>

                    {/* Session helpful */}
                    <div className="space-y-2">
                      <Label className="text-sm font-semibold">3. Did you find this session helpful for your concerns?</Label>
                      <RadioGroup value={feedbackSessionHelpful} onValueChange={setFeedbackSessionHelpful}>
                        <div className="flex items-center gap-2">
                          <RadioGroupItem value="Very helpful" id="helpful-very" />
                          <Label htmlFor="helpful-very" className="text-sm font-normal">Very helpful - I gained valuable insights</Label>
                        </div>
                        <div className="flex items-center gap-2">
                          <RadioGroupItem value="Somewhat helpful" id="helpful-some" />
                          <Label htmlFor="helpful-some" className="text-sm font-normal">Somewhat helpful - Some useful points</Label>
                        </div>
                        <div className="flex items-center gap-2">
                          <RadioGroupItem value="Neutral" id="helpful-neutral" />
                          <Label htmlFor="helpful-neutral" className="text-sm font-normal">Neutral - Not sure yet</Label>
                        </div>
                        <div className="flex items-center gap-2">
                          <RadioGroupItem value="Not helpful" id="helpful-not" />
                          <Label htmlFor="helpful-not" className="text-sm font-normal">Not helpful - Did not address my needs</Label>
                        </div>
                      </RadioGroup>
                    </div>

                    {/* Comfortable */}
                    <div className="space-y-2">
                      <Label className="text-sm font-semibold">4. Did you feel comfortable and safe during the session?</Label>
                      <RadioGroup value={feedbackComfortable} onValueChange={setFeedbackComfortable}>
                        <div className="flex items-center gap-2">
                          <RadioGroupItem value="Very comfortable" id="comfort-very" />
                          <Label htmlFor="comfort-very" className="text-sm font-normal">Very comfortable - Felt completely safe</Label>
                        </div>
                        <div className="flex items-center gap-2">
                          <RadioGroupItem value="Comfortable" id="comfort-ok" />
                          <Label htmlFor="comfort-ok" className="text-sm font-normal">Comfortable - Mostly at ease</Label>
                        </div>
                        <div className="flex items-center gap-2">
                          <RadioGroupItem value="Somewhat uncomfortable" id="comfort-some" />
                          <Label htmlFor="comfort-some" className="text-sm font-normal">Somewhat uncomfortable - A bit uneasy at times</Label>
                        </div>
                        <div className="flex items-center gap-2">
                          <RadioGroupItem value="Uncomfortable" id="comfort-not" />
                          <Label htmlFor="comfort-not" className="text-sm font-normal">Uncomfortable - Did not feel safe</Label>
                        </div>
                      </RadioGroup>
                    </div>

                    {/* Exercises clarity */}
                    <div className="space-y-2">
                      <Label className="text-sm font-semibold">5. Were the prescribed exercises and recommendations clear?</Label>
                      <RadioGroup value={feedbackExercisesClarity} onValueChange={setFeedbackExercisesClarity}>
                        <div className="flex items-center gap-2">
                          <RadioGroupItem value="Very clear" id="clarity-very" />
                          <Label htmlFor="clarity-very" className="text-sm font-normal">Very clear - I know exactly what to do</Label>
                        </div>
                        <div className="flex items-center gap-2">
                          <RadioGroupItem value="Clear" id="clarity-ok" />
                          <Label htmlFor="clarity-ok" className="text-sm font-normal">Clear - Mostly understood</Label>
                        </div>
                        <div className="flex items-center gap-2">
                          <RadioGroupItem value="Somewhat unclear" id="clarity-some" />
                          <Label htmlFor="clarity-some" className="text-sm font-normal">Somewhat unclear - Need more explanation</Label>
                        </div>
                        <div className="flex items-center gap-2">
                          <RadioGroupItem value="Not clear" id="clarity-not" />
                          <Label htmlFor="clarity-not" className="text-sm font-normal">Not clear - Confusing instructions</Label>
                        </div>
                      </RadioGroup>
                    </div>

                    {/* Recommend */}
                    <div className="space-y-2">
                      <Label className="text-sm font-semibold">6. Would you recommend this therapist to others?</Label>
                      <RadioGroup value={feedbackRecommend} onValueChange={setFeedbackRecommend}>
                        <div className="flex items-center gap-2">
                          <RadioGroupItem value="Definitely yes" id="recommend-yes" />
                          <Label htmlFor="recommend-yes" className="text-sm font-normal">Definitely yes</Label>
                        </div>
                        <div className="flex items-center gap-2">
                          <RadioGroupItem value="Probably yes" id="recommend-prob" />
                          <Label htmlFor="recommend-prob" className="text-sm font-normal">Probably yes</Label>
                        </div>
                        <div className="flex items-center gap-2">
                          <RadioGroupItem value="Not sure" id="recommend-unsure" />
                          <Label htmlFor="recommend-unsure" className="text-sm font-normal">Not sure</Label>
                        </div>
                        <div className="flex items-center gap-2">
                          <RadioGroupItem value="Probably not" id="recommend-no" />
                          <Label htmlFor="recommend-no" className="text-sm font-normal">Probably not</Label>
                        </div>
                      </RadioGroup>
                    </div>

                    {/* What could improve */}
                    <div className="space-y-2">
                      <Label className="text-sm font-semibold">7. What could be improved in future sessions?</Label>
                      <Textarea
                        placeholder="Share any suggestions for improvement..."
                        value={feedbackImprove}
                        onChange={(e) => setFeedbackImprove(e.target.value)}
                        className="min-h-[80px]"
                      />
                    </div>

                    {/* Additional comments */}
                    <div className="space-y-2">
                      <Label className="text-sm font-semibold">8. Any additional comments or thoughts?</Label>
                      <Textarea
                        placeholder="Anything else you would like to share..."
                        value={feedbackAdditional}
                        onChange={(e) => setFeedbackAdditional(e.target.value)}
                        className="min-h-[80px]"
                      />
                    </div>

                    <Button
                      onClick={handleSubmitFeedback}
                      className="w-full"
                      size="lg"
                      disabled={feedbackRating === 0 || !feedbackTherapistBehavior || !feedbackSessionHelpful || !feedbackComfortable}
                    >
                      Submit Feedback
                    </Button>
                  </div>
                )}
              </div>
            )}

            {/* STEP 3: Done */}
            {postCallStep === "done" && (
              <div className="text-center py-8 space-y-6">
                <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto">
                  <Check className="w-8 h-8 text-primary" />
                </div>
                <div>
                  <h2 className="text-xl font-bold">All Done!</h2>
                  <p className="text-muted-foreground mt-1">
                    Your session with {session?.therapistName} is complete.
                  </p>
                  <p className="text-sm text-muted-foreground mt-1">
                    The report and your feedback have been saved to your profile.
                  </p>
                </div>
                <div className="flex flex-col gap-3 max-w-xs mx-auto">
                  <Button onClick={() => router.push("/dashboard/profile")}>
                    View in Profile
                  </Button>
                  <Button variant="outline" onClick={handleDownloadReport}>
                    <Download className="w-4 h-4 mr-2" />
                    Download Report Again
                  </Button>
                  <Button variant="ghost" onClick={() => router.push("/dashboard")}>
                    Go to Dashboard
                  </Button>
                </div>
              </div>
            )}
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
            <div className="flex items-center gap-3 mb-8">
              <div className="w-10 h-10 rounded-full bg-primary flex items-center justify-center">
                <Leaf className="w-5 h-5 text-primary-foreground" />
              </div>
              <div>
                <h2 className="font-bold text-lg">CalmPath Session</h2>
                <p className="text-xs text-muted-foreground">Secure & private video call</p>
              </div>
            </div>

            <div className="p-4 bg-muted/50 rounded-lg mb-6 space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">Therapist</span>
                <span className="font-medium">{session?.therapistName}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">Date</span>
                <span className="font-medium">
                  {session?.date && new Date(session.date).toLocaleDateString("en-US", {
                    weekday: "short", month: "short", day: "numeric",
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
        <div className={cn("flex-1 flex items-center justify-center bg-muted", showChat && "hidden sm:flex")}>
          {callMode === "video" && !isVideoOff ? (
            <div className="relative w-full h-full">
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
                  No messages yet. Start chatting during the session.
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
              <form onSubmit={(e) => { e.preventDefault(); handleSendChat() }} className="flex gap-2">
                <input
                  type="text"
                  placeholder="Type a message..."
                  value={chatInput}
                  onChange={(e) => setChatInput(e.target.value)}
                  className="flex h-9 w-full rounded-md border border-input bg-background px-3 py-1 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                />
                <Button size="sm" type="submit" className="h-9 px-3">Send</Button>
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
