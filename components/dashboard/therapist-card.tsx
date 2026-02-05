"use client"

import { useState, useEffect, useRef, useCallback } from "react"
import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { useApp } from "@/lib/app-context"
import { useAuth } from "@/lib/auth-context"
import type { Therapist } from "@/lib/therapists"
import { Star, Clock, MessageCircle, Calendar, Check, IndianRupee, Gift, Globe, QrCode, ShieldCheck, Loader2 } from "lucide-react"

// Simple QR Code generator using canvas
function generateQRCodeDataURL(data: string, size: number = 200): string {
  // Create a UPI-style QR code visual representation
  const canvas = document.createElement("canvas")
  canvas.width = size
  canvas.height = size
  const ctx = canvas.getContext("2d")
  if (!ctx) return ""

  // White background
  ctx.fillStyle = "#ffffff"
  ctx.fillRect(0, 0, size, size)

  // Generate deterministic pattern from the data string
  const moduleCount = 25
  const moduleSize = size / moduleCount
  
  // Simple hash function to generate pattern
  let hash = 0
  for (let i = 0; i < data.length; i++) {
    const char = data.charCodeAt(i)
    hash = ((hash << 5) - hash) + char
    hash = hash & hash
  }

  // Draw QR modules
  ctx.fillStyle = "#000000"
  
  // Position detection patterns (top-left, top-right, bottom-left)
  const drawFinderPattern = (x: number, y: number) => {
    // Outer ring
    for (let i = 0; i < 7; i++) {
      for (let j = 0; j < 7; j++) {
        if (i === 0 || i === 6 || j === 0 || j === 6 || (i >= 2 && i <= 4 && j >= 2 && j <= 4)) {
          ctx.fillRect((x + i) * moduleSize, (y + j) * moduleSize, moduleSize, moduleSize)
        }
      }
    }
  }

  drawFinderPattern(0, 0)
  drawFinderPattern(moduleCount - 7, 0)
  drawFinderPattern(0, moduleCount - 7)

  // Timing patterns
  for (let i = 8; i < moduleCount - 8; i++) {
    if (i % 2 === 0) {
      ctx.fillRect(i * moduleSize, 6 * moduleSize, moduleSize, moduleSize)
      ctx.fillRect(6 * moduleSize, i * moduleSize, moduleSize, moduleSize)
    }
  }

  // Data modules (pseudo-random based on hash)
  const seed = Math.abs(hash)
  for (let row = 0; row < moduleCount; row++) {
    for (let col = 0; col < moduleCount; col++) {
      // Skip finder patterns and timing patterns
      if ((row < 9 && col < 9) || (row < 9 && col > moduleCount - 9) || (row > moduleCount - 9 && col < 9)) continue
      if (row === 6 || col === 6) continue

      const index = row * moduleCount + col
      const val = ((seed * (index + 1) * 7919) >>> 0) % 100
      if (val < 45) {
        ctx.fillRect(col * moduleSize, row * moduleSize, moduleSize, moduleSize)
      }
    }
  }

  return canvas.toDataURL()
}

type BookingStep = "payment" | "scheduling" | "success"

interface TherapistCardProps {
  therapist: Therapist
  onChat: (therapist: Therapist) => void
}

export function TherapistCard({ therapist, onChat }: TherapistCardProps) {
  const { user, updateUser } = useAuth()
  const { bookSession } = useApp()
  const [showBooking, setShowBooking] = useState(false)
  const [bookingStep, setBookingStep] = useState<BookingStep>("payment")
  const [selectedDay, setSelectedDay] = useState<string>("")
  const [selectedTime, setSelectedTime] = useState<string>("")
  const [paymentVerified, setPaymentVerified] = useState(false)
  const [verifyingPayment, setVerifyingPayment] = useState(false)
  const [qrDataUrl, setQrDataUrl] = useState<string>("")
  const [transactionId, setTransactionId] = useState("")

  const isFirstSessionFree = user && !user.firstSessionUsed
  const sessionPrice = isFirstSessionFree ? 0 : therapist.pricePerSession

  // Generate QR code when booking dialog opens for paid sessions
  useEffect(() => {
    if (showBooking && !isFirstSessionFree) {
      const upiString = `upi://pay?pa=calmpath@upi&pn=CalmPath&am=${therapist.pricePerSession}&cu=INR&tn=Session-${therapist.name.replace(/\s/g, "-")}`
      const dataUrl = generateQRCodeDataURL(upiString, 200)
      setQrDataUrl(dataUrl)
    }
  }, [showBooking, isFirstSessionFree, therapist.pricePerSession, therapist.name])

  const handleOpenBooking = () => {
    // Reset state
    setSelectedDay("")
    setSelectedTime("")
    setPaymentVerified(false)
    setVerifyingPayment(false)
    setTransactionId("")

    if (isFirstSessionFree) {
      setBookingStep("scheduling")
    } else {
      setBookingStep("payment")
    }
    setShowBooking(true)
  }

  const handleVerifyPayment = useCallback(() => {
    if (!transactionId.trim()) return
    setVerifyingPayment(true)
    // Simulate payment verification (in production, this would call a real API)
    setTimeout(() => {
      setVerifyingPayment(false)
      setPaymentVerified(true)
      setTimeout(() => {
        setBookingStep("scheduling")
      }, 1500)
    }, 2500)
  }, [transactionId])

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

    setBookingStep("success")
    setTimeout(() => {
      setShowBooking(false)
      setBookingStep("payment")
      setSelectedDay("")
      setSelectedTime("")
      setPaymentVerified(false)
      setTransactionId("")
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

          <div>
            <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide mb-1">Languages</p>
            <div className="flex items-center gap-1.5 flex-wrap">
              <Globe className="w-3.5 h-3.5 text-muted-foreground flex-shrink-0" />
              {therapist.languages.map((lang) => (
                <Badge key={lang} variant="secondary" className="text-xs font-normal bg-accent/10 text-accent-foreground">
                  {lang}
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
            onClick={handleOpenBooking}
          >
            <Calendar className="w-4 h-4 mr-2" />
            Book Session
          </Button>
        </CardFooter>
      </Card>

      <Dialog open={showBooking} onOpenChange={setShowBooking}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Book Session with {therapist.name}</DialogTitle>
            <DialogDescription>
              {bookingStep === "payment" && "Complete payment to book your session"}
              {bookingStep === "scheduling" && "Select your preferred day and time"}
              {bookingStep === "success" && "Your session has been booked"}
            </DialogDescription>
          </DialogHeader>

          {/* Step indicator for paid sessions */}
          {!isFirstSessionFree && bookingStep !== "success" && (
            <div className="flex items-center gap-2 px-1">
              <div className={`flex items-center gap-1.5 text-xs font-medium ${bookingStep === "payment" ? "text-primary" : "text-muted-foreground"}`}>
                <div className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold ${bookingStep === "payment" ? "bg-primary text-primary-foreground" : "bg-primary/20 text-primary"}`}>
                  {bookingStep === "scheduling" ? <Check className="w-3.5 h-3.5" /> : "1"}
                </div>
                Payment
              </div>
              <div className={`flex-1 h-0.5 ${bookingStep === "scheduling" ? "bg-primary" : "bg-border"}`} />
              <div className={`flex items-center gap-1.5 text-xs font-medium ${bookingStep === "scheduling" ? "text-primary" : "text-muted-foreground"}`}>
                <div className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold ${bookingStep === "scheduling" ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground"}`}>
                  2
                </div>
                Schedule
              </div>
            </div>
          )}

          {/* SUCCESS step */}
          {bookingStep === "success" && (
            <div className="py-8 text-center">
              <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
                <Check className="w-8 h-8 text-primary" />
              </div>
              <h3 className="font-semibold text-lg mb-2">Session Booked!</h3>
              <p className="text-muted-foreground">
                Your session has been scheduled successfully.
              </p>
            </div>
          )}

          {/* PAYMENT step - QR code */}
          {bookingStep === "payment" && !isFirstSessionFree && (
            <div className="space-y-4 py-2">
              <div className="p-3 bg-muted rounded-lg">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">Session Price</span>
                  <span className="font-bold text-lg">₹{therapist.pricePerSession}</span>
                </div>
              </div>

              {/* QR Code display */}
              <div className="flex flex-col items-center gap-3">
                <div className="p-4 bg-background border-2 border-border rounded-xl">
                  {qrDataUrl ? (
                    <img
                      src={qrDataUrl}
                      alt={`Payment QR code for ₹${therapist.pricePerSession}`}
                      width={200}
                      height={200}
                      className="rounded"
                    />
                  ) : (
                    <div className="w-[200px] h-[200px] flex items-center justify-center">
                      <Loader2 className="w-8 h-8 animate-spin text-muted-foreground" />
                    </div>
                  )}
                </div>
                <div className="text-center">
                  <p className="text-sm font-medium">Scan to pay via UPI</p>
                  <p className="text-xs text-muted-foreground mt-0.5">
                    Pay ₹{therapist.pricePerSession} to calmpath@upi
                  </p>
                </div>
              </div>

              {/* Payment Done button */}
              {!paymentVerified && !verifyingPayment && (
                <Button
                  onClick={() => {
                    setPaymentVerified(true)
                    setTimeout(() => {
                      setBookingStep("scheduling")
                    }, 1000)
                  }}
                  className="w-full"
                  size="lg"
                >
                  <Check className="w-4 h-4 mr-2" />
                  Payment Done
                </Button>
              )}

              {/* Verification status */}
              {paymentVerified && (
                <div className="flex items-center gap-2 p-3 bg-primary/10 border border-primary/20 rounded-lg">
                  <ShieldCheck className="w-5 h-5 text-primary flex-shrink-0" />
                  <div>
                    <p className="text-sm font-medium text-primary">Payment Confirmed</p>
                    <p className="text-xs text-muted-foreground">Redirecting to scheduling...</p>
                  </div>
                </div>
              )}

              {verifyingPayment && (
                <div className="flex items-center justify-center gap-2 py-3">
                  <Loader2 className="w-5 h-5 animate-spin text-primary" />
                  <span className="text-sm text-muted-foreground">Processing...</span>
                </div>
              )}

              <DialogFooter>
                <Button variant="outline" onClick={() => setShowBooking(false)} className="w-full">
                  Cancel
                </Button>
              </DialogFooter>
            </div>
          )}

          {/* SCHEDULING step */}
          {bookingStep === "scheduling" && (
            <>
              <div className="space-y-4 py-2">
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
                      <div className="flex items-center gap-2">
                        <ShieldCheck className="w-4 h-4 text-primary" />
                        <span className="font-bold">₹{therapist.pricePerSession}</span>
                        <Badge variant="secondary" className="text-xs">Paid</Badge>
                      </div>
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
                  <Calendar className="w-4 h-4 mr-2" />
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
