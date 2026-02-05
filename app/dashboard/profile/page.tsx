"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { useAuth } from "@/lib/auth-context"
import { useApp } from "@/lib/app-context"
import Link from "next/link"
import { User, Calendar, Clock, IndianRupee, Star, Download, MessageSquare, Check, X, MapPin, Globe, Video, ExternalLink, FileText } from "lucide-react"
import { cn } from "@/lib/utils"

function downloadReportPDF(reportText: string, therapistName: string) {
  const printWindow = window.open("", "_blank")
  if (!printWindow) {
    const blob = new Blob([reportText], { type: "text/plain" })
    const url = URL.createObjectURL(blob)
    const a = document.createElement("a")
    a.href = url
    a.download = `CalmPath_Report_${therapistName.replace(/\s/g, "_")}.txt`
    a.click()
    URL.revokeObjectURL(url)
    return
  }
  const sections = reportText.split("--------------------------------------")
  printWindow.document.write(`<!DOCTYPE html><html><head><title>CalmPath Report - ${therapistName}</title>
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
      pre { white-space: pre-wrap; font-family: inherit; font-size: 14px; margin: 0; }
      .footer { text-align: center; border-top: 1px solid #e5e7eb; padding-top: 16px; margin-top: 30px; color: #999; font-size: 11px; }
    </style></head><body>
    <div class="header"><h1>CalmPath</h1><p>Wellness Session Report</p></div>
    ${sections.map((s: string, i: number) => {
      const trimmed = s.trim()
      if (i === 0) {
        const lines = trimmed.split("\\n").filter((l: string) => l.includes(":"))
        return '<div class="meta"><div class="meta-grid">' + lines.map((l: string) => {
          const [label, ...val] = l.split(":")
          return '<div class="meta-item"><label>' + label.trim() + '</label><span>' + val.join(":").trim() + '</span></div>'
        }).join("") + '</div></div>'
      }
      if (!trimmed) return ""
      const lines = trimmed.split("\\n")
      const title = lines[0]
      const content = lines.slice(1).join("\\n").trim()
      if (!title || !content) return ""
      return '<div class="section"><h2>' + title + '</h2><pre>' + content + '</pre></div>'
    }).join("")}
    <div class="footer"><p>Confidential - CalmPath Wellness Platform</p></div>
    </body></html>`)
  printWindow.document.close()
  setTimeout(() => { printWindow.print() }, 500)
}

export default function ProfilePage() {
  const { user } = useAuth()
  const { sessions, addSessionFeedback } = useApp()
  const [feedbackSession, setFeedbackSession] = useState<string | null>(null)
  const [feedbackRating, setFeedbackRating] = useState(0)
  const [fbBehavior, setFbBehavior] = useState("")
  const [fbHelpful, setFbHelpful] = useState("")
  const [fbComfortable, setFbComfortable] = useState("")
  const [fbListening, setFbListening] = useState("")
  const [fbExercises, setFbExercises] = useState("")
  const [fbRecommend, setFbRecommend] = useState("")
  const [fbBookAgain, setFbBookAgain] = useState("")
  const [fbImprove, setFbImprove] = useState("")
  const [fbAdditional, setFbAdditional] = useState("")
  const [viewReport, setViewReport] = useState<string | null>(null)

  const completedSessions = sessions.filter(s => s.status === "completed").sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
  const scheduledSessions = sessions.filter(s => s.status === "scheduled").sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
  const totalSpent = sessions.filter(s => (s.status === "completed" || s.status === "scheduled") && !s.isFree).reduce((acc, s) => acc + s.price, 0)

  const resetFeedbackForm = () => {
    setFeedbackRating(0)
    setFbBehavior("")
    setFbHelpful("")
    setFbComfortable("")
    setFbListening("")
    setFbExercises("")
    setFbRecommend("")
    setFbBookAgain("")
    setFbImprove("")
    setFbAdditional("")
  }

  const handleSubmitFeedback = () => {
    if (!feedbackSession || feedbackRating === 0) return
    const feedbackSessionObj = sessions.find(s => s.id === feedbackSession)
    const fullFeedback = [
      `Overall Rating: ${feedbackRating}/5`,
      `Therapist: ${feedbackSessionObj?.therapistName || "N/A"}`,
      ``,
      fbBehavior ? `Therapist Behavior & Professionalism: ${fbBehavior}` : "",
      fbListening ? `Active Listening & Understanding: ${fbListening}` : "",
      fbHelpful ? `Session Helpfulness: ${fbHelpful}` : "",
      fbComfortable ? `Comfort & Safety: ${fbComfortable}` : "",
      fbExercises ? `Exercises & Recommendations Clarity: ${fbExercises}` : "",
      fbRecommend ? `Would Recommend: ${fbRecommend}` : "",
      fbBookAgain ? `Would Book Again: ${fbBookAgain}` : "",
      fbImprove ? `Suggestions for Improvement: ${fbImprove}` : "",
      fbAdditional ? `Additional Comments: ${fbAdditional}` : "",
    ].filter(Boolean).join("\n")
    addSessionFeedback(feedbackSession, fullFeedback)
    setFeedbackSession(null)
    resetFeedbackForm()
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl lg:text-3xl font-bold text-foreground">My Profile</h1>
        <p className="text-muted-foreground mt-1">Manage your account and view your history</p>
      </div>

      {/* User Card */}
      <Card className="bg-card border-border">
        <CardContent className="p-6">
          <div className="flex flex-col sm:flex-row items-center gap-6">
            <div className="w-24 h-24 rounded-full bg-primary/10 flex items-center justify-center text-3xl font-bold text-primary">
              {user?.name?.split(" ").map(n => n[0]).join("").slice(0, 2)}
            </div>
            <div className="text-center sm:text-left flex-1">
              <h2 className="text-2xl font-bold">{user?.name}</h2>
              <p className="text-muted-foreground">{user?.email}</p>
              <div className="flex flex-wrap items-center gap-3 mt-2 text-sm text-muted-foreground">
                {user?.age && (
                  <span>{user.age} years old</span>
                )}
                {user?.location && (
                  <span className="flex items-center gap-1">
                    <MapPin className="w-3 h-3" />
                    {user.location}
                  </span>
                )}
                {user?.languagePreference && (
                  <span className="flex items-center gap-1">
                    <Globe className="w-3 h-3" />
                    {user.languagePreference}
                  </span>
                )}
              </div>
              {user?.aboutYourself && (
                <p className="text-sm text-muted-foreground mt-2 max-w-md">{user.aboutYourself}</p>
              )}
            </div>
            <div className="flex items-center gap-2">
              {user?.firstSessionUsed ? (
                <Badge variant="secondary">Trial Used</Badge>
              ) : (
                <Badge className="bg-primary text-primary-foreground">Free Trial Available</Badge>
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="bg-card border-border">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                <Calendar className="w-5 h-5 text-primary" />
              </div>
              <div>
                <p className="text-xs text-muted-foreground">Completed</p>
                <p className="text-xl font-bold">{completedSessions.length}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="bg-card border-border">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center">
                <Clock className="w-5 h-5 text-blue-600" />
              </div>
              <div>
                <p className="text-xs text-muted-foreground">Scheduled</p>
                <p className="text-xl font-bold">{scheduledSessions.length}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="bg-card border-border">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-green-100 flex items-center justify-center">
                <IndianRupee className="w-5 h-5 text-green-600" />
              </div>
              <div>
                <p className="text-xs text-muted-foreground">Total Spent</p>
                <p className="text-xl font-bold">₹{totalSpent}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="bg-card border-border">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-amber-100 flex items-center justify-center">
                <Star className="w-5 h-5 text-amber-600" />
              </div>
              <div>
                <p className="text-xs text-muted-foreground">Feedback Given</p>
                <p className="text-xl font-bold">{sessions.filter(s => s.feedback).length}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Sessions Tabs */}
      <Tabs defaultValue="upcoming" className="space-y-4">
        <TabsList className="grid w-full grid-cols-3 max-w-md">
          <TabsTrigger value="upcoming">Upcoming</TabsTrigger>
          <TabsTrigger value="completed">Completed</TabsTrigger>
          <TabsTrigger value="payments">Payments</TabsTrigger>
        </TabsList>

        <TabsContent value="upcoming">
          <Card className="bg-card border-border">
            <CardHeader>
              <CardTitle>Upcoming Sessions</CardTitle>
              <CardDescription>Your scheduled therapy sessions</CardDescription>
            </CardHeader>
            <CardContent>
              {scheduledSessions.length === 0 ? (
                <div className="py-8 text-center">
                  <Calendar className="w-12 h-12 text-muted-foreground mx-auto mb-3" />
                  <p className="text-muted-foreground">No upcoming sessions</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {scheduledSessions.map((session) => (
                    <div key={session.id} className="p-4 bg-muted/50 rounded-lg space-y-3">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="font-medium">{session.therapistName}</p>
                          <p className="text-sm text-muted-foreground">
                            {new Date(session.date).toLocaleDateString("en-US", {
                              weekday: "long",
                              month: "long",
                              day: "numeric",
                            })} at {session.time}
                          </p>
                        </div>
                        <div className="text-right">
                          {session.isFree ? (
                            <Badge className="bg-primary text-primary-foreground">Free Trial</Badge>
                          ) : (
                            <p className="font-bold">₹{session.price}</p>
                          )}
                        </div>
                      </div>
                      {/* Video Call Link */}
                      {session.meetLink && (
                        <div className="flex items-center gap-3 p-3 bg-background border border-border rounded-lg">
                          <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                            <Video className="w-4 h-4 text-primary" />
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="text-xs text-muted-foreground">CalmPath Video Call</p>
                            <p className="text-sm font-medium truncate">
                              {session.meetLinkUsed ? "Link expired (one-time use)" : "Waiting for therapist to start"}
                            </p>
                          </div>
                          {!session.meetLinkUsed ? (
                            <Link href={session.meetLink}>
                              <Button size="sm" variant="default" className="flex-shrink-0">
                                <ExternalLink className="w-3.5 h-3.5 mr-1.5" />
                                Join
                              </Button>
                            </Link>
                          ) : (
                            <Badge variant="secondary" className="flex-shrink-0">Expired</Badge>
                          )}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="completed">
          <Card className="bg-card border-border">
            <CardHeader>
              <CardTitle>Session History</CardTitle>
              <CardDescription>Your completed therapy sessions</CardDescription>
            </CardHeader>
            <CardContent>
              {completedSessions.length === 0 ? (
                <div className="py-8 text-center">
                  <Check className="w-12 h-12 text-muted-foreground mx-auto mb-3" />
                  <p className="text-muted-foreground">No completed sessions yet</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {completedSessions.map((session) => (
                    <div key={session.id} className="p-4 bg-muted/50 rounded-lg space-y-3">
                      <div className="flex items-start justify-between gap-4">
                        <div className="flex-1">
                          <p className="font-medium">{session.therapistName}</p>
                          <p className="text-sm text-muted-foreground">
                            {new Date(session.date).toLocaleDateString("en-US", {
                              weekday: "short",
                              month: "short",
                              day: "numeric",
                            })}
                          </p>
                        </div>
                        <div className="text-right">
                          {session.isFree ? (
                            <Badge variant="secondary">Free</Badge>
                          ) : (
                            <p className="font-bold">₹{session.price}</p>
                          )}
                        </div>
                      </div>

                      {/* Therapist Report */}
                      {session.report && (
                        <div className="p-3 bg-background border border-border rounded-lg space-y-2">
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2">
                              <FileText className="w-4 h-4 text-primary" />
                              <span className="text-sm font-medium">Therapist Report</span>
                            </div>
                            <div className="flex items-center gap-2">
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => setViewReport(viewReport === session.id ? null : session.id)}
                              >
                                {viewReport === session.id ? "Hide" : "View"}
                              </Button>
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => downloadReportPDF(session.report!, session.therapistName)}
                              >
                                <Download className="w-3 h-3 mr-1" />
                                PDF
                              </Button>
                            </div>
                          </div>
                          {viewReport === session.id && (
                            <div className="bg-muted/50 rounded p-3 max-h-60 overflow-y-auto">
                              <pre className="text-xs whitespace-pre-wrap font-sans leading-relaxed">
                                {session.report}
                              </pre>
                            </div>
                          )}
                        </div>
                      )}

                      {/* Feedback Display */}
                      {session.feedback && (
                        <div className="p-3 bg-background border border-border rounded-lg">
                          <div className="flex items-center gap-2 mb-2">
                            <Star className="w-4 h-4 text-amber-500" />
                            <span className="text-sm font-medium">Your Feedback</span>
                            <Badge variant="secondary" className="text-xs">Submitted</Badge>
                          </div>
                          <pre className="text-xs text-muted-foreground whitespace-pre-wrap font-sans leading-relaxed">
                            {session.feedback}
                          </pre>
                        </div>
                      )}

                      {/* Feedback Button (if no feedback yet) */}
                      {!session.feedback && (
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => setFeedbackSession(session.id)}
                          className="w-full"
                        >
                          <MessageSquare className="w-3.5 h-3.5 mr-2" />
                          Leave Feedback
                        </Button>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="payments">
          <Card className="bg-card border-border">
            <CardHeader>
              <CardTitle>Payment History</CardTitle>
              <CardDescription>Your billing and payment records</CardDescription>
            </CardHeader>
            <CardContent>
              {sessions.filter(s => s.status !== "cancelled").length === 0 ? (
                <div className="py-8 text-center">
                  <IndianRupee className="w-12 h-12 text-muted-foreground mx-auto mb-3" />
                  <p className="text-muted-foreground">No payment history yet</p>
                </div>
              ) : (
                <>
                  <div className="p-4 bg-muted/50 rounded-lg mb-4 flex items-center justify-between">
                    <span className="text-sm font-medium text-muted-foreground">Total Amount Spent</span>
                    <span className="text-2xl font-bold text-foreground">₹{totalSpent}</span>
                  </div>
                  <div className="overflow-x-auto">
                    <table className="w-full">
                      <thead>
                        <tr className="border-b border-border">
                          <th className="text-left py-3 px-4 text-sm font-medium text-muted-foreground">Date</th>
                          <th className="text-left py-3 px-4 text-sm font-medium text-muted-foreground">Description</th>
                          <th className="text-right py-3 px-4 text-sm font-medium text-muted-foreground">Amount</th>
                          <th className="text-center py-3 px-4 text-sm font-medium text-muted-foreground">Status</th>
                        </tr>
                      </thead>
                      <tbody>
                        {sessions.filter(s => s.status !== "cancelled").sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()).map((session) => (
                          <tr key={session.id} className="border-b border-border last:border-0">
                            <td className="py-3 px-4 text-sm">
                              {new Date(session.date).toLocaleDateString()}
                            </td>
                            <td className="py-3 px-4 text-sm">
                              Session with {session.therapistName}
                            </td>
                            <td className="py-3 px-4 text-sm text-right font-medium">
                              {session.isFree ? (
                                <span className="text-primary">₹0 (Free)</span>
                              ) : (
                                `₹${session.price}`
                              )}
                            </td>
                            <td className="py-3 px-4 text-center">
                              {session.status === "scheduled" ? (
                                <Badge variant="secondary" className="bg-blue-100 text-blue-700">
                                  Upcoming
                                </Badge>
                              ) : session.status === "completed" ? (
                                <Badge variant="secondary" className="bg-green-100 text-green-700">
                                  Completed
                                </Badge>
                              ) : (
                                <Badge variant="secondary" className="bg-red-100 text-red-700">
                                  Cancelled
                                </Badge>
                              )}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Feedback Dialog */}
      <Dialog open={!!feedbackSession} onOpenChange={(open) => { if (!open) { setFeedbackSession(null); resetFeedbackForm() } }}>
        <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Session Feedback</DialogTitle>
            <DialogDescription>
              Help us improve by sharing your experience with {sessions.find(s => s.id === feedbackSession)?.therapistName}
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-5 py-2">
            {/* Q1: Overall Rating */}
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
                    <Star className={cn("w-7 h-7", star <= feedbackRating ? "fill-amber-400 text-amber-400" : "text-muted-foreground/30")} />
                  </button>
                ))}
                {feedbackRating > 0 && <span className="text-sm text-muted-foreground ml-2">{feedbackRating}/5</span>}
              </div>
            </div>

            {/* Q2: Therapist behavior */}
            <div className="space-y-2">
              <Label className="text-sm font-semibold">2. How was the therapist{"'"}s behavior and professionalism?</Label>
              <RadioGroup value={fbBehavior} onValueChange={setFbBehavior}>
                {["Excellent - Very professional and empathetic", "Good - Professional and attentive", "Average - Could be more engaged", "Below Average - Felt disconnected"].map((opt) => (
                  <div key={opt} className="flex items-center gap-2">
                    <RadioGroupItem value={opt} id={`fb-beh-${opt}`} />
                    <Label htmlFor={`fb-beh-${opt}`} className="text-sm font-normal">{opt}</Label>
                  </div>
                ))}
              </RadioGroup>
            </div>

            {/* Q3: Active listening */}
            <div className="space-y-2">
              <Label className="text-sm font-semibold">3. Did the therapist actively listen and understand your concerns?</Label>
              <RadioGroup value={fbListening} onValueChange={setFbListening}>
                {["Absolutely - Felt truly heard and understood", "Mostly - Listened well with minor gaps", "Somewhat - Missed a few important points", "Not really - Felt unheard or dismissed"].map((opt) => (
                  <div key={opt} className="flex items-center gap-2">
                    <RadioGroupItem value={opt} id={`fb-listen-${opt}`} />
                    <Label htmlFor={`fb-listen-${opt}`} className="text-sm font-normal">{opt}</Label>
                  </div>
                ))}
              </RadioGroup>
            </div>

            {/* Q4: Session helpful */}
            <div className="space-y-2">
              <Label className="text-sm font-semibold">4. Did you find this session helpful for your concerns?</Label>
              <RadioGroup value={fbHelpful} onValueChange={setFbHelpful}>
                {["Very helpful - Gained valuable insights", "Somewhat helpful - Some useful points", "Neutral - Not sure yet", "Not helpful - Did not address my needs"].map((opt) => (
                  <div key={opt} className="flex items-center gap-2">
                    <RadioGroupItem value={opt} id={`fb-help-${opt}`} />
                    <Label htmlFor={`fb-help-${opt}`} className="text-sm font-normal">{opt}</Label>
                  </div>
                ))}
              </RadioGroup>
            </div>

            {/* Q5: Comfort */}
            <div className="space-y-2">
              <Label className="text-sm font-semibold">5. Did you feel comfortable and safe during the session?</Label>
              <RadioGroup value={fbComfortable} onValueChange={setFbComfortable}>
                {["Very comfortable - Felt completely safe", "Comfortable - Mostly at ease", "Somewhat uncomfortable - A bit uneasy at times", "Uncomfortable - Did not feel safe"].map((opt) => (
                  <div key={opt} className="flex items-center gap-2">
                    <RadioGroupItem value={opt} id={`fb-comfort-${opt}`} />
                    <Label htmlFor={`fb-comfort-${opt}`} className="text-sm font-normal">{opt}</Label>
                  </div>
                ))}
              </RadioGroup>
            </div>

            {/* Q6: Exercises clarity */}
            <div className="space-y-2">
              <Label className="text-sm font-semibold">6. Were the prescribed exercises and recommendations clear?</Label>
              <RadioGroup value={fbExercises} onValueChange={setFbExercises}>
                {["Very clear - I know exactly what to do", "Clear - Mostly understood", "Somewhat unclear - Need more explanation", "Not clear - Confusing instructions"].map((opt) => (
                  <div key={opt} className="flex items-center gap-2">
                    <RadioGroupItem value={opt} id={`fb-exer-${opt}`} />
                    <Label htmlFor={`fb-exer-${opt}`} className="text-sm font-normal">{opt}</Label>
                  </div>
                ))}
              </RadioGroup>
            </div>

            {/* Q7: Recommend */}
            <div className="space-y-2">
              <Label className="text-sm font-semibold">7. Would you recommend this therapist to a friend or family member?</Label>
              <RadioGroup value={fbRecommend} onValueChange={setFbRecommend}>
                {["Definitely yes", "Probably yes", "Not sure", "Probably not"].map((opt) => (
                  <div key={opt} className="flex items-center gap-2">
                    <RadioGroupItem value={opt} id={`fb-rec-${opt}`} />
                    <Label htmlFor={`fb-rec-${opt}`} className="text-sm font-normal">{opt}</Label>
                  </div>
                ))}
              </RadioGroup>
            </div>

            {/* Q8: Book again */}
            <div className="space-y-2">
              <Label className="text-sm font-semibold">8. Would you book another session with this therapist?</Label>
              <RadioGroup value={fbBookAgain} onValueChange={setFbBookAgain}>
                {["Yes, definitely", "Yes, but I want to try others too", "Maybe, need to think about it", "No, I would prefer a different therapist"].map((opt) => (
                  <div key={opt} className="flex items-center gap-2">
                    <RadioGroupItem value={opt} id={`fb-again-${opt}`} />
                    <Label htmlFor={`fb-again-${opt}`} className="text-sm font-normal">{opt}</Label>
                  </div>
                ))}
              </RadioGroup>
            </div>

            {/* Q9: Improve */}
            <div className="space-y-2">
              <Label className="text-sm font-semibold">9. What could be improved in future sessions?</Label>
              <Textarea
                placeholder="Share any suggestions for improvement..."
                value={fbImprove}
                onChange={(e) => setFbImprove(e.target.value)}
                className="min-h-[80px]"
              />
            </div>

            {/* Q10: Additional */}
            <div className="space-y-2">
              <Label className="text-sm font-semibold">10. Any additional comments or thoughts about the session?</Label>
              <Textarea
                placeholder="Anything else you would like to share..."
                value={fbAdditional}
                onChange={(e) => setFbAdditional(e.target.value)}
                className="min-h-[80px]"
              />
            </div>
          </div>

          <DialogFooter className="flex-col sm:flex-row gap-2 pt-2">
            <Button variant="outline" onClick={() => { setFeedbackSession(null); resetFeedbackForm() }} className="sm:flex-1">
              Cancel
            </Button>
            <Button
              onClick={handleSubmitFeedback}
              disabled={feedbackRating === 0 || !fbBehavior || !fbHelpful || !fbComfortable}
              className="sm:flex-1"
            >
              Submit Feedback
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
