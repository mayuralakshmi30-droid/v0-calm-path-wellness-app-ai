"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog"
import { Textarea } from "@/components/ui/textarea"
import { useAuth } from "@/lib/auth-context"
import { useApp } from "@/lib/app-context"
import { User, Calendar, Clock, IndianRupee, Star, Download, MessageSquare, Check, X } from "lucide-react"
import { cn } from "@/lib/utils"

export default function ProfilePage() {
  const { user } = useAuth()
  const { sessions, addSessionFeedback } = useApp()
  const [feedbackSession, setFeedbackSession] = useState<string | null>(null)
  const [feedbackText, setFeedbackText] = useState("")

  const completedSessions = sessions.filter(s => s.status === "completed")
  const scheduledSessions = sessions.filter(s => s.status === "scheduled")
  const totalSpent = sessions.filter(s => s.status === "completed" && !s.isFree).reduce((acc, s) => acc + s.price, 0)

  const handleSubmitFeedback = () => {
    if (feedbackSession && feedbackText.trim()) {
      addSessionFeedback(feedbackSession, feedbackText)
      setFeedbackSession(null)
      setFeedbackText("")
    }
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
                    <div key={session.id} className="p-4 bg-muted/50 rounded-lg">
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
                <div className="space-y-3">
                  {completedSessions.map((session) => (
                    <div key={session.id} className="p-4 bg-muted/50 rounded-lg">
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
                          {session.feedback && (
                            <p className="text-sm text-muted-foreground mt-2 italic">
                              {'"'}{session.feedback}{'"'}
                            </p>
                          )}
                          {session.report && (
                            <div className="mt-2 p-2 bg-background rounded border border-border">
                              <p className="text-xs font-medium text-muted-foreground mb-1">Therapist Report:</p>
                              <p className="text-sm">{session.report}</p>
                            </div>
                          )}
                        </div>
                        <div className="text-right flex flex-col items-end gap-2">
                          {session.isFree ? (
                            <Badge variant="secondary">Free</Badge>
                          ) : (
                            <p className="font-bold">₹{session.price}</p>
                          )}
                          {!session.feedback && (
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => setFeedbackSession(session.id)}
                            >
                              <MessageSquare className="w-3 h-3 mr-1" />
                              Feedback
                            </Button>
                          )}
                        </div>
                      </div>
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
              {sessions.filter(s => s.status === "completed").length === 0 ? (
                <div className="py-8 text-center">
                  <IndianRupee className="w-12 h-12 text-muted-foreground mx-auto mb-3" />
                  <p className="text-muted-foreground">No payment history yet</p>
                </div>
              ) : (
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
                      {sessions.filter(s => s.status === "completed").map((session) => (
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
                            <Badge variant="secondary" className="bg-green-100 text-green-700">
                              Paid
                            </Badge>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Feedback Dialog */}
      <Dialog open={!!feedbackSession} onOpenChange={() => setFeedbackSession(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Session Feedback</DialogTitle>
            <DialogDescription>
              Share your thoughts about this session
            </DialogDescription>
          </DialogHeader>
          <Textarea
            placeholder="How was your session? What did you find helpful?"
            value={feedbackText}
            onChange={(e) => setFeedbackText(e.target.value)}
            className="min-h-[120px]"
          />
          <DialogFooter>
            <Button variant="outline" onClick={() => setFeedbackSession(null)}>
              Cancel
            </Button>
            <Button onClick={handleSubmitFeedback} disabled={!feedbackText.trim()}>
              Submit Feedback
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
