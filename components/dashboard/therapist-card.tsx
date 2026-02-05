"use client"

import { useState } from "react"
import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { useApp } from "@/lib/app-context"
import { useAuth } from "@/lib/auth-context"
import type { Therapist } from "@/lib/therapists"
import { Star, Clock, MessageCircle, Calendar, Check, IndianRupee, Gift } from "lucide-react"

interface TherapistCardProps {
  therapist: Therapist
  onChat: (therapist: Therapist) => void
}

export function TherapistCard({ therapist, onChat }: TherapistCardProps) {
  const { user, updateUser } = useAuth()
  const { bookSession } = useApp()
  const [showBooking, setShowBooking] = useState(false)
  const [selectedDay, setSelectedDay] = useState<string>("")
  const [selectedTime, setSelectedTime] = useState<string>("")
  const [bookingSuccess, setBookingSuccess] = useState(false)

  const isFirstSessionFree = user && !user.firstSessionUsed
  const sessionPrice = isFirstSessionFree ? 0 : therapist.pricePerSession

  const handleBookSession = () => {
    if (!selectedDay || !selectedTime) return

    const sessionDate = getNextDateForDay(selectedDay)
    
    bookSession({
      therapistId: therapist.id,
      therapistName: therapist.name,
      date: sessionDate,
      time: selectedTime,
      price: sessionPrice,
      isFree: isFirstSessionFree || false,
    })

    if (isFirstSessionFree) {
      updateUser({ firstSessionUsed: true })
    }

    setBookingSuccess(true)
    setTimeout(() => {
      setShowBooking(false)
      setBookingSuccess(false)
      setSelectedDay("")
      setSelectedTime("")
    }, 2000)
  }

  const getNextDateForDay = (dayName: string): string => {
    const days = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"]
    const today = new Date()
    const todayIndex = today.getDay()
    const targetIndex = days.indexOf(dayName)
    let daysUntilTarget = targetIndex - todayIndex
    if (daysUntilTarget <= 0) daysUntilTarget += 7
    const targetDate = new Date(today)
    targetDate.setDate(today.getDate() + daysUntilTarget)
    return targetDate.toISOString().split("T")[0]
  }

  const availableTimesForDay = therapist.availableSlots.find(slot => slot.day === selectedDay)?.times || []

  return (
    <>
      <Card className="bg-card border-border hover:shadow-lg transition-shadow">
        <CardHeader className="pb-3">
          <div className="flex items-start gap-4">
            <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center text-2xl font-bold text-primary flex-shrink-0">
              {therapist.name.split(" ").map(n => n[0]).join("")}
            </div>
            <div className="flex-1 min-w-0">
              <h3 className="font-semibold text-lg text-card-foreground">{therapist.name}</h3>
              <p className="text-sm text-muted-foreground">{therapist.title}</p>
              <div className="flex items-center gap-1 mt-1">
                <Star className="w-4 h-4 fill-amber-400 text-amber-400" />
                <span className="text-sm font-medium">{therapist.rating}</span>
                <span className="text-sm text-muted-foreground">({therapist.reviewCount} reviews)</span>
              </div>
            </div>
          </div>
        </CardHeader>
        
        <CardContent className="space-y-3">
          <div>
            <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide mb-1">Qualifications</p>
            <div className="flex flex-wrap gap-1">
              {therapist.qualifications.slice(0, 2).map((qual) => (
                <Badge key={qual} variant="secondary" className="text-xs font-normal">
                  {qual}
                </Badge>
              ))}
            </div>
          </div>

          <div>
            <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide mb-1">Specialties</p>
            <div className="flex flex-wrap gap-1">
              {therapist.specialties.map((spec) => (
                <Badge key={spec} variant="outline" className="text-xs">
                  {spec}
                </Badge>
              ))}
            </div>
          </div>

          <div className="flex items-center gap-2 text-sm">
            <Clock className="w-4 h-4 text-muted-foreground" />
            <span className="text-muted-foreground">
              Available: {therapist.availableSlots.map(s => s.day.slice(0, 3)).join(", ")}
            </span>
          </div>

          <div className="flex items-center justify-between pt-2 border-t border-border">
            <div className="flex items-center gap-1">
              {isFirstSessionFree ? (
                <div className="flex items-center gap-1 text-primary">
                  <Gift className="w-4 h-4" />
                  <span className="font-bold">FREE</span>
                  <span className="text-xs text-muted-foreground line-through ml-1">₹{therapist.pricePerSession}</span>
                </div>
              ) : (
                <>
                  <IndianRupee className="w-4 h-4 text-muted-foreground" />
                  <span className="font-bold text-lg">{therapist.pricePerSession}</span>
                  <span className="text-sm text-muted-foreground">/session</span>
                </>
              )}
            </div>
          </div>
        </CardContent>

        <CardFooter className="gap-2">
          <Button 
            variant="outline" 
            size="sm" 
            className="flex-1 bg-transparent"
            onClick={() => onChat(therapist)}
          >
            <MessageCircle className="w-4 h-4 mr-2" />
            Chat
          </Button>
          <Button 
            size="sm" 
            className="flex-1"
            onClick={() => setShowBooking(true)}
          >
            <Calendar className="w-4 h-4 mr-2" />
            Book Session
          </Button>
        </CardFooter>
      </Card>

      <Dialog open={showBooking} onOpenChange={setShowBooking}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Book Session with {therapist.name}</DialogTitle>
            <DialogDescription>
              Select your preferred day and time for the session
            </DialogDescription>
          </DialogHeader>

          {bookingSuccess ? (
            <div className="py-8 text-center">
              <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
                <Check className="w-8 h-8 text-primary" />
              </div>
              <h3 className="font-semibold text-lg mb-2">Session Booked!</h3>
              <p className="text-muted-foreground">
                Your session has been scheduled successfully.
              </p>
            </div>
          ) : (
            <>
              <div className="space-y-4 py-4">
                <div className="p-3 bg-muted rounded-lg">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-muted-foreground">Session Price</span>
                    {isFirstSessionFree ? (
                      <div className="flex items-center gap-2">
                        <Badge className="bg-primary text-primary-foreground">
                          <Gift className="w-3 h-3 mr-1" />
                          First Session Free!
                        </Badge>
                      </div>
                    ) : (
                      <span className="font-bold">₹{therapist.pricePerSession}</span>
                    )}
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium">Select Day</label>
                  <Select value={selectedDay} onValueChange={(value) => { setSelectedDay(value); setSelectedTime(""); }}>
                    <SelectTrigger>
                      <SelectValue placeholder="Choose a day" />
                    </SelectTrigger>
                    <SelectContent>
                      {therapist.availableSlots.map((slot) => (
                        <SelectItem key={slot.day} value={slot.day}>
                          {slot.day}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {selectedDay && (
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Select Time</label>
                    <Select value={selectedTime} onValueChange={setSelectedTime}>
                      <SelectTrigger>
                        <SelectValue placeholder="Choose a time" />
                      </SelectTrigger>
                      <SelectContent>
                        {availableTimesForDay.map((time) => (
                          <SelectItem key={time} value={time}>
                            {time}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                )}
              </div>

              <DialogFooter>
                <Button variant="outline" onClick={() => setShowBooking(false)}>
                  Cancel
                </Button>
                <Button onClick={handleBookSession} disabled={!selectedDay || !selectedTime}>
                  Confirm Booking
                </Button>
              </DialogFooter>
            </>
          )}
        </DialogContent>
      </Dialog>
    </>
  )
}
