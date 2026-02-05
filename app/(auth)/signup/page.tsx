"use client"

import React from "react"

import { useState } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Checkbox } from "@/components/ui/checkbox"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogClose } from "@/components/ui/dialog"
import { ScrollArea } from "@/components/ui/scroll-area"
import { useAuth } from "@/lib/auth-context"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Leaf, Eye, EyeOff, AlertCircle, CheckCircle2, MapPin, Globe } from "lucide-react"

export default function SignupPage() {
  const router = useRouter()
  const { signup } = useAuth()
  const [name, setName] = useState("")
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [aboutYourself, setAboutYourself] = useState("")
  const [age, setAge] = useState("")
  const [location, setLocation] = useState("")
  const [languagePreference, setLanguagePreference] = useState("")
  const [showPassword, setShowPassword] = useState(false)
  const [agreedToTerms, setAgreedToTerms] = useState(false)
  const [showTerms, setShowTerms] = useState(false)
  const [error, setError] = useState("")
  const [isLoading, setIsLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")

    if (!agreedToTerms) {
      setError("Please agree to the Terms & Conditions and Privacy Policy")
      return
    }

    if (aboutYourself.length > 100) {
      setError("About yourself must be 100 words or less")
      return
    }

    if (!age || parseInt(age) < 13 || parseInt(age) > 120) {
      setError("Please enter a valid age (13-120)")
      return
    }

    if (!location.trim()) {
      setError("Please enter your location")
      return
    }

    if (!languagePreference) {
      setError("Please select your language preference")
      return
    }

    setIsLoading(true)

    try {
      const success = await signup(name, email, password, aboutYourself, parseInt(age), location, languagePreference)
      if (success) {
        localStorage.setItem("calmpath_just_signed_up", "true")
        router.push("/dashboard")
      } else {
        setError("An account with this email already exists")
      }
    } catch {
      setError("An error occurred. Please try again.")
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-4 py-8">
      <div className="w-full max-w-md">
        <div className="flex flex-col items-center mb-6">
          <div className="flex items-center gap-2 mb-2">
            <div className="w-10 h-10 rounded-full bg-primary flex items-center justify-center">
              <Leaf className="w-6 h-6 text-primary-foreground" />
            </div>
            <span className="text-2xl font-bold text-foreground">CalmPath</span>
          </div>
          <p className="text-muted-foreground text-center">Begin your mental wellness journey</p>
        </div>

        <Card className="border-border shadow-lg">
          <CardHeader className="space-y-1">
            <CardTitle className="text-2xl font-bold text-center">Create Account</CardTitle>
            <CardDescription className="text-center">
              Fill in your details to get started
            </CardDescription>
          </CardHeader>
          <form onSubmit={handleSubmit}>
            <CardContent className="space-y-4">
              {error && (
                <div className="flex items-center gap-2 p-3 bg-destructive/10 border border-destructive/20 rounded-lg text-destructive text-sm">
                  <AlertCircle className="w-4 h-4 flex-shrink-0" />
                  {error}
                </div>
              )}
              
              <div className="space-y-2">
                <Label htmlFor="name">Full Name</Label>
                <Input
                  id="name"
                  type="text"
                  placeholder="John Doe"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  required
                  className="bg-background"
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="your@email.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  className="bg-background"
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="password">Password</Label>
                <div className="relative">
                  <Input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    placeholder="Create a strong password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    minLength={6}
                    className="bg-background pr-10"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                    aria-label={showPassword ? "Hide password" : "Show password"}
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              <div className="space-y-2">
                <div className="flex justify-between items-center">
                  <Label htmlFor="about">Tell us about yourself</Label>
                  <span className={`text-xs ${aboutYourself.split(/\s+/).filter(Boolean).length > 100 ? "text-destructive" : "text-muted-foreground"}`}>
                    {aboutYourself.split(/\s+/).filter(Boolean).length}/100 words
                  </span>
                </div>
                <Textarea
                  id="about"
                  placeholder="Share a bit about yourself and what brings you to CalmPath..."
                  value={aboutYourself}
                  onChange={(e) => setAboutYourself(e.target.value)}
                  className="bg-background min-h-[100px] resize-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="age">Age</Label>
                  <Input
                    id="age"
                    type="number"
                    placeholder="25"
                    min={13}
                    max={120}
                    value={age}
                    onChange={(e) => setAge(e.target.value)}
                    required
                    className="bg-background"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="language">Language Preference</Label>
                  <Select value={languagePreference} onValueChange={setLanguagePreference}>
                    <SelectTrigger id="language" className="bg-background">
                      <SelectValue placeholder="Select language" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="English">English</SelectItem>
                      <SelectItem value="Hindi">Hindi</SelectItem>
                      <SelectItem value="Tamil">Tamil</SelectItem>
                      <SelectItem value="Telugu">Telugu</SelectItem>
                      <SelectItem value="Kannada">Kannada</SelectItem>
                      <SelectItem value="Malayalam">Malayalam</SelectItem>
                      <SelectItem value="Bengali">Bengali</SelectItem>
                      <SelectItem value="Marathi">Marathi</SelectItem>
                      <SelectItem value="Gujarati">Gujarati</SelectItem>
                      <SelectItem value="Punjabi">Punjabi</SelectItem>
                      <SelectItem value="Urdu">Urdu</SelectItem>
                      <SelectItem value="Spanish">Spanish</SelectItem>
                      <SelectItem value="French">French</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="location">Location</Label>
                <div className="relative">
                  <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <Input
                    id="location"
                    type="text"
                    placeholder="e.g., Mumbai, India"
                    value={location}
                    onChange={(e) => setLocation(e.target.value)}
                    required
                    className="bg-background pl-9"
                  />
                </div>
              </div>

              <div className="flex items-start gap-2">
                <Checkbox
                  id="terms"
                  checked={agreedToTerms}
                  onCheckedChange={(checked) => setAgreedToTerms(checked as boolean)}
                  className="mt-0.5"
                />
                <Label htmlFor="terms" className="text-sm font-normal leading-tight cursor-pointer">
                  I agree to the{" "}
                  <button
                    type="button"
                    onClick={() => setShowTerms(true)}
                    className="text-primary hover:underline"
                  >
                    Terms & Conditions
                  </button>{" "}
                  and{" "}
                  <button
                    type="button"
                    onClick={() => setShowTerms(true)}
                    className="text-primary hover:underline"
                  >
                    Privacy Policy
                  </button>
                </Label>
              </div>
            </CardContent>
            
            <CardFooter className="flex flex-col gap-4">
              <Button type="submit" className="w-full" disabled={isLoading}>
                {isLoading ? "Creating Account..." : "Create Account"}
              </Button>
              <p className="text-sm text-center text-muted-foreground">
                Already have an account?{" "}
                <Link href="/login" className="text-primary hover:underline font-medium">
                  Sign in
                </Link>
              </p>
            </CardFooter>
          </form>
        </Card>
      </div>

      <Dialog open={showTerms} onOpenChange={setShowTerms}>
        <DialogContent className="max-w-2xl max-h-[80vh]">
          <DialogHeader>
            <DialogTitle>Terms & Conditions and Privacy Policy</DialogTitle>
            <DialogDescription>
              Please read our terms carefully before using CalmPath
            </DialogDescription>
          </DialogHeader>
          <ScrollArea className="h-[400px] pr-4">
            <div className="space-y-6 text-sm">
              <section>
                <h3 className="font-semibold text-base mb-2">Terms of Service</h3>
                <p className="text-muted-foreground mb-2">
                  Welcome to CalmPath. By using our services, you agree to these terms. Please read them carefully.
                </p>
                <ul className="list-disc list-inside space-y-1 text-muted-foreground">
                  <li>You must be at least 18 years old to use this service</li>
                  <li>You are responsible for maintaining the confidentiality of your account</li>
                  <li>You agree to provide accurate and complete information</li>
                  <li>You will not use the service for any unlawful purpose</li>
                  <li>Sessions with therapists are subject to their availability and professional guidelines</li>
                </ul>
              </section>

              <section>
                <h3 className="font-semibold text-base mb-2">Privacy Policy</h3>
                <p className="text-muted-foreground mb-2">
                  Your privacy is important to us. This policy explains how we collect, use, and protect your information.
                </p>
                
                <h4 className="font-medium mt-3 mb-1">Information We Collect</h4>
                <ul className="list-disc list-inside space-y-1 text-muted-foreground">
                  <li>Personal information (name, email) provided during registration</li>
                  <li>Health-related information you choose to share</li>
                  <li>Mood tracking and journal entries</li>
                  <li>Session history and feedback</li>
                </ul>

                <h4 className="font-medium mt-3 mb-1">How We Use Your Information</h4>
                <ul className="list-disc list-inside space-y-1 text-muted-foreground">
                  <li>To provide and improve our services</li>
                  <li>To match you with appropriate therapists</li>
                  <li>To track your wellness progress</li>
                  <li>To communicate important updates</li>
                </ul>

                <h4 className="font-medium mt-3 mb-1">AI-Driven Behavioral Insights & Data Usage</h4>
                <p className="text-muted-foreground mb-2">
                  By using CalmPath, you acknowledge and consent to the following:
                </p>
                <ul className="list-disc list-inside space-y-1 text-muted-foreground">
                  <li>Your mood tracking data, habit tracker activity, journal entries, and therapist session reports may be analyzed by our AI system to generate personalized behavioral insights and wellness recommendations</li>
                  <li>AI-generated insights are updated on a weekly basis and are based on aggregated patterns from your data across all app features</li>
                  <li>Therapist session reports and feedback you provide after sessions may be cross-referenced with your mood and habit data to deliver more accurate and relevant recommendations</li>
                  <li>Your data is processed locally and is never shared with third parties for advertising or commercial purposes</li>
                  <li>AI-generated insights are for informational purposes only and do not constitute medical advice or replace professional therapy</li>
                  <li>You may delete your data at any time, which will also remove all AI-generated insights associated with your account</li>
                </ul>

                <h4 className="font-medium mt-3 mb-1">Panic Intervention Mode</h4>
                <ul className="list-disc list-inside space-y-1 text-muted-foreground">
                  <li>CalmPath includes a Real-Time Panic Intervention Mode (PIM) accessible from all pages</li>
                  <li>PIM provides guided breathing exercises and grounding techniques during panic or anxiety episodes</li>
                  <li>PIM may offer emergency contact options including crisis helpline numbers</li>
                  <li>PIM is not a substitute for emergency medical services. In life-threatening situations, please contact emergency services immediately</li>
                </ul>

                <h4 className="font-medium mt-3 mb-1">Rewards & Streaks</h4>
                <ul className="list-disc list-inside space-y-1 text-muted-foreground">
                  <li>CalmPath offers a points and streak-based reward system through the Habit Tracker</li>
                  <li>Discounts earned through streaks (e.g., 7-day streak = 5% off, 100-day streak = 30% off therapy sessions) are subject to availability and may change</li>
                  <li>Rewards are non-transferable and apply only to therapy sessions booked through CalmPath</li>
                </ul>

                <h4 className="font-medium mt-3 mb-1">Data Security</h4>
                <p className="text-muted-foreground">
                  We implement industry-standard security measures to protect your data. All communications are encrypted, and access to personal health information is strictly controlled.
                </p>

                <h4 className="font-medium mt-3 mb-1">Your Rights</h4>
                <ul className="list-disc list-inside space-y-1 text-muted-foreground">
                  <li>Access and download your personal data</li>
                  <li>Request deletion of your account and data</li>
                  <li>Opt out of non-essential communications</li>
                  <li>Update or correct your information at any time</li>
                </ul>
              </section>

              <section>
                <h3 className="font-semibold text-base mb-2">Contact Us</h3>
                <p className="text-muted-foreground">
                  If you have questions about these terms or our privacy practices, please contact us at support@calmpath.com
                </p>
              </section>
            </div>
          </ScrollArea>
          <div className="flex justify-end gap-2 pt-4 border-t">
            <DialogClose asChild>
              <Button variant="outline">Close</Button>
            </DialogClose>
            <Button onClick={() => { setAgreedToTerms(true); setShowTerms(false); }}>
              <CheckCircle2 className="w-4 h-4 mr-2" />
              Accept
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}
