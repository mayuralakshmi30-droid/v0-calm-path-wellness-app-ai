"use client"

import { useState, useEffect, useRef, useCallback } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { cn } from "@/lib/utils"
import { X, Phone, Heart, Wind, ChevronRight, Volume2, VolumeX } from "lucide-react"

type PIMStep = "button" | "landing" | "breathing" | "grounding" | "reassurance" | "contacts"

const GROUNDING_STEPS = [
  { sense: "SEE", instruction: "Name 5 things you can see right now. Look around slowly.", count: 5 },
  { sense: "TOUCH", instruction: "Name 4 things you can physically feel. Focus on textures.", count: 4 },
  { sense: "HEAR", instruction: "Name 3 things you can hear. Listen carefully.", count: 3 },
  { sense: "SMELL", instruction: "Name 2 things you can smell. Breathe gently.", count: 2 },
  { sense: "TASTE", instruction: "Name 1 thing you can taste. Stay present.", count: 1 },
]

const REASSURANCE_MESSAGES = [
  "What you are feeling right now is a panic response. It is your body's alarm system, and it WILL pass.",
  "Your heart is beating fast to send oxygen to your muscles. This is your body protecting you -- not harming you.",
  "The dizziness or tingling you may feel is from rapid breathing. Slow breaths will ease this within minutes.",
  "No one has ever been permanently harmed by a panic attack. You are safe, even if it does not feel that way right now.",
  "This feeling has a peak, and you are getting through it. Most panic attacks resolve within 10-20 minutes.",
  "You have survived every difficult moment before this one. You will survive this too.",
]

export function PanicIntervention() {
  const [step, setStep] = useState<PIMStep>("button")
  const [breathPhase, setBreathPhase] = useState<"inhale" | "hold" | "exhale">("inhale")
  const [breathCount, setBreathCount] = useState(0)
  const [breathTimer, setBreathTimer] = useState(4)
  const [groundingIndex, setGroundingIndex] = useState(0)
  const [reassuranceIndex, setReassuranceIndex] = useState(0)
  const [isMuted, setIsMuted] = useState(false)
  const [pulseAnim, setPulseAnim] = useState(true)
  const breathIntervalRef = useRef<ReturnType<typeof setInterval> | null>(null)
  const synthRef = useRef<SpeechSynthesis | null>(null)

  useEffect(() => {
    if (typeof window !== "undefined") {
      synthRef.current = window.speechSynthesis
    }
  }, [])

  const speak = useCallback((text: string) => {
    if (isMuted || !synthRef.current) return
    synthRef.current.cancel()
    const utterance = new SpeechSynthesisUtterance(text)
    utterance.rate = 0.75
    utterance.pitch = 0.9
    utterance.volume = 0.8
    const voices = synthRef.current.getVoices()
    const calm = voices.find(v => v.name.includes("Female") || v.name.includes("Samantha") || v.lang.startsWith("en"))
    if (calm) utterance.voice = calm
    synthRef.current.speak(utterance)
  }, [isMuted])

  // Breathing cycle
  useEffect(() => {
    if (step !== "breathing") {
      if (breathIntervalRef.current) clearInterval(breathIntervalRef.current)
      return
    }

    const durations = { inhale: 4, hold: 4, exhale: 6 }
    setBreathTimer(durations[breathPhase])

    breathIntervalRef.current = setInterval(() => {
      setBreathTimer((prev) => {
        if (prev <= 1) {
          setBreathPhase((phase) => {
            if (phase === "inhale") {
              speak("Hold")
              return "hold"
            }
            if (phase === "hold") {
              speak("Breathe out slowly")
              return "exhale"
            }
            setBreathCount((c) => c + 1)
            speak("Breathe in")
            return "inhale"
          })
          return 0
        }
        return prev - 1
      })
    }, 1000)

    return () => {
      if (breathIntervalRef.current) clearInterval(breathIntervalRef.current)
    }
  }, [step, breathPhase, speak])

  const startBreathing = () => {
    setBreathPhase("inhale")
    setBreathCount(0)
    setBreathTimer(4)
    setStep("breathing")
    speak("Let us breathe together. Breathe in slowly through your nose.")
  }

  const startGrounding = () => {
    setGroundingIndex(0)
    setStep("grounding")
    speak(`${GROUNDING_STEPS[0].sense}. ${GROUNDING_STEPS[0].instruction}`)
  }

  const nextGrounding = () => {
    if (groundingIndex < GROUNDING_STEPS.length - 1) {
      const next = groundingIndex + 1
      setGroundingIndex(next)
      speak(`${GROUNDING_STEPS[next].sense}. ${GROUNDING_STEPS[next].instruction}`)
    } else {
      speak("You did it. You are grounded and present. Well done.")
      setStep("landing")
    }
  }

  const startReassurance = () => {
    setReassuranceIndex(0)
    setStep("reassurance")
    speak(REASSURANCE_MESSAGES[0])
  }

  const nextReassurance = () => {
    if (reassuranceIndex < REASSURANCE_MESSAGES.length - 1) {
      const next = reassuranceIndex + 1
      setReassuranceIndex(next)
      speak(REASSURANCE_MESSAGES[next])
    } else {
      setStep("landing")
    }
  }

  const closePIM = () => {
    if (synthRef.current) synthRef.current.cancel()
    if (breathIntervalRef.current) clearInterval(breathIntervalRef.current)
    setStep("button")
    setPulseAnim(false)
    setTimeout(() => setPulseAnim(true), 100)
  }

  // Floating PIM button
  if (step === "button") {
    return (
      <button
        onClick={() => {
          setStep("landing")
          speak("You are not alone. Let us get through this together. Choose what feels right.")
        }}
        className={cn(
          "fixed bottom-6 right-6 z-[100] flex items-center gap-2 px-4 py-3 rounded-full",
          "bg-rose-600 hover:bg-rose-700 text-white shadow-xl",
          "transition-all duration-200 hover:scale-105",
          "focus:outline-none focus:ring-4 focus:ring-rose-300",
          pulseAnim && "animate-pulse"
        )}
        aria-label="Panic Intervention Mode"
      >
        <Heart className="w-5 h-5 fill-white" />
        <span className="font-semibold text-sm hidden sm:inline">PIM</span>
      </button>
    )
  }

  // Full-screen PIM overlay
  return (
    <div className="fixed inset-0 z-[100] bg-slate-900/95 backdrop-blur-md flex items-center justify-center p-4 overflow-y-auto">
      {/* Top bar */}
      <div className="fixed top-0 left-0 right-0 flex items-center justify-between px-5 py-4 z-10">
        <div className="flex items-center gap-2">
          <Heart className="w-5 h-5 text-rose-400 fill-rose-400" />
          <span className="text-white/90 font-semibold text-sm tracking-wide uppercase">Panic Intervention Mode</span>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => setIsMuted(!isMuted)}
            className="p-2 rounded-full hover:bg-white/10 text-white/70 transition-colors"
            aria-label={isMuted ? "Unmute voice" : "Mute voice"}
          >
            {isMuted ? <VolumeX className="w-5 h-5" /> : <Volume2 className="w-5 h-5" />}
          </button>
          <button
            onClick={closePIM}
            className="p-2 rounded-full hover:bg-white/10 text-white/70 transition-colors"
            aria-label="Close"
          >
            <X className="w-5 h-5" />
          </button>
        </div>
      </div>

      {/* Landing */}
      {step === "landing" && (
        <div className="w-full max-w-md space-y-5 text-center">
          <div className="space-y-3">
            <p className="text-3xl font-bold text-white text-balance">You are safe.</p>
            <p className="text-lg text-white/70 text-pretty">Choose what feels right for you right now.</p>
          </div>
          <div className="space-y-3">
            <button
              onClick={startBreathing}
              className="w-full flex items-center gap-4 p-5 rounded-2xl bg-teal-600/20 border border-teal-500/30 hover:bg-teal-600/30 transition-colors text-left"
            >
              <div className="w-12 h-12 rounded-full bg-teal-500/20 flex items-center justify-center shrink-0">
                <Wind className="w-6 h-6 text-teal-300" />
              </div>
              <div>
                <p className="text-white font-semibold">Guided Breathing</p>
                <p className="text-white/60 text-sm">4-4-6 breathing to calm your body</p>
              </div>
            </button>

            <button
              onClick={startGrounding}
              className="w-full flex items-center gap-4 p-5 rounded-2xl bg-indigo-600/20 border border-indigo-500/30 hover:bg-indigo-600/30 transition-colors text-left"
            >
              <div className="w-12 h-12 rounded-full bg-indigo-500/20 flex items-center justify-center shrink-0">
                <span className="text-2xl font-bold text-indigo-300">5</span>
              </div>
              <div>
                <p className="text-white font-semibold">5-4-3-2-1 Grounding</p>
                <p className="text-white/60 text-sm">Use your senses to feel present</p>
              </div>
            </button>

            <button
              onClick={startReassurance}
              className="w-full flex items-center gap-4 p-5 rounded-2xl bg-amber-600/20 border border-amber-500/30 hover:bg-amber-600/30 transition-colors text-left"
            >
              <div className="w-12 h-12 rounded-full bg-amber-500/20 flex items-center justify-center shrink-0">
                <Heart className="w-6 h-6 text-amber-300" />
              </div>
              <div>
                <p className="text-white font-semibold">What Is Happening to Me?</p>
                <p className="text-white/60 text-sm">Understand and reassure your body</p>
              </div>
            </button>

            <button
              onClick={() => setStep("contacts")}
              className="w-full flex items-center gap-4 p-5 rounded-2xl bg-rose-600/20 border border-rose-500/30 hover:bg-rose-600/30 transition-colors text-left"
            >
              <div className="w-12 h-12 rounded-full bg-rose-500/20 flex items-center justify-center shrink-0">
                <Phone className="w-6 h-6 text-rose-300" />
              </div>
              <div>
                <p className="text-white font-semibold">Talk to Someone</p>
                <p className="text-white/60 text-sm">Crisis helplines and emergency contacts</p>
              </div>
            </button>
          </div>
        </div>
      )}

      {/* Breathing exercise */}
      {step === "breathing" && (
        <div className="w-full max-w-sm text-center space-y-8">
          {/* Animated breathing circle */}
          <div className="relative flex items-center justify-center">
            <div
              className={cn(
                "w-48 h-48 rounded-full flex items-center justify-center transition-all duration-1000 ease-in-out",
                breathPhase === "inhale" && "scale-110 bg-teal-400/20 border-2 border-teal-400/40",
                breathPhase === "hold" && "scale-110 bg-teal-500/25 border-2 border-teal-500/50",
                breathPhase === "exhale" && "scale-90 bg-teal-300/15 border-2 border-teal-300/30",
              )}
            >
              <div className="text-center">
                <p className="text-4xl font-light text-white">{breathTimer}</p>
                <p className="text-lg text-teal-300 font-medium mt-1 uppercase tracking-widest">
                  {breathPhase === "inhale" ? "Breathe In" : breathPhase === "hold" ? "Hold" : "Breathe Out"}
                </p>
              </div>
            </div>
          </div>

          <div>
            <p className="text-white/60 text-sm">Breath cycle {breathCount + 1}</p>
            <p className="text-white/40 text-xs mt-1">
              {breathPhase === "inhale"
                ? "In through your nose... Fill your lungs slowly."
                : breathPhase === "hold"
                ? "Hold gently. You are doing great."
                : "Out through your mouth... Let go of the tension."}
            </p>
          </div>

          <div className="flex gap-3 justify-center">
            <Button variant="outline" onClick={() => setStep("landing")} className="bg-transparent text-white/70 border-white/20 hover:bg-white/10 hover:text-white">
              Back
            </Button>
            {breathCount >= 3 && (
              <Button onClick={() => { speak("You did beautifully. Your body is calming down."); setStep("landing"); }} className="bg-teal-600 hover:bg-teal-700 text-white">
                I Feel Better
              </Button>
            )}
          </div>
        </div>
      )}

      {/* Grounding exercise */}
      {step === "grounding" && (
        <div className="w-full max-w-sm text-center space-y-6">
          <div className="flex gap-1.5 justify-center mb-2">
            {GROUNDING_STEPS.map((_, i) => (
              <div key={i} className={cn("w-10 h-1.5 rounded-full transition-colors", i <= groundingIndex ? "bg-indigo-400" : "bg-white/15")} />
            ))}
          </div>

          <Card className="bg-white/5 border-indigo-500/30">
            <CardContent className="p-8 space-y-4">
              <div className="w-16 h-16 rounded-full bg-indigo-500/20 flex items-center justify-center mx-auto">
                <span className="text-3xl font-bold text-indigo-300">{GROUNDING_STEPS[groundingIndex].count}</span>
              </div>
              <p className="text-2xl font-semibold text-white uppercase tracking-wider">
                {GROUNDING_STEPS[groundingIndex].sense}
              </p>
              <p className="text-white/70 text-base leading-relaxed">
                {GROUNDING_STEPS[groundingIndex].instruction}
              </p>
            </CardContent>
          </Card>

          <div className="flex gap-3 justify-center">
            <Button variant="outline" onClick={() => setStep("landing")} className="bg-transparent text-white/70 border-white/20 hover:bg-white/10 hover:text-white">
              Back
            </Button>
            <Button onClick={nextGrounding} className="bg-indigo-600 hover:bg-indigo-700 text-white gap-1">
              {groundingIndex < GROUNDING_STEPS.length - 1 ? "Next" : "Done"}
              <ChevronRight className="w-4 h-4" />
            </Button>
          </div>
        </div>
      )}

      {/* Reassurance */}
      {step === "reassurance" && (
        <div className="w-full max-w-sm text-center space-y-6">
          <div className="flex gap-1.5 justify-center">
            {REASSURANCE_MESSAGES.map((_, i) => (
              <div key={i} className={cn("w-6 h-1.5 rounded-full transition-colors", i <= reassuranceIndex ? "bg-amber-400" : "bg-white/15")} />
            ))}
          </div>

          <Card className="bg-white/5 border-amber-500/30">
            <CardContent className="p-8">
              <Heart className="w-8 h-8 text-amber-400 mx-auto mb-4" />
              <p className="text-lg text-white leading-relaxed text-pretty">
                {REASSURANCE_MESSAGES[reassuranceIndex]}
              </p>
            </CardContent>
          </Card>

          <div className="flex gap-3 justify-center">
            <Button variant="outline" onClick={() => setStep("landing")} className="bg-transparent text-white/70 border-white/20 hover:bg-white/10 hover:text-white">
              Back
            </Button>
            <Button onClick={nextReassurance} className="bg-amber-600 hover:bg-amber-700 text-white gap-1">
              {reassuranceIndex < REASSURANCE_MESSAGES.length - 1 ? "Next" : "I Understand"}
              <ChevronRight className="w-4 h-4" />
            </Button>
          </div>
        </div>
      )}

      {/* Emergency Contacts */}
      {step === "contacts" && (
        <div className="w-full max-w-sm space-y-5">
          <div className="text-center space-y-2">
            <p className="text-2xl font-bold text-white">You Are Not Alone</p>
            <p className="text-white/60 text-sm">Reach out when you need support. There is no shame in asking for help.</p>
          </div>

          <div className="space-y-3">
            <a href="tel:988" className="flex items-center gap-4 p-4 rounded-xl bg-rose-600/20 border border-rose-500/30 hover:bg-rose-600/30 transition-colors">
              <div className="w-10 h-10 rounded-full bg-rose-500/20 flex items-center justify-center shrink-0">
                <Phone className="w-5 h-5 text-rose-300" />
              </div>
              <div>
                <p className="text-white font-semibold">988 Suicide & Crisis Lifeline</p>
                <p className="text-white/50 text-xs">Call or text 988 -- 24/7</p>
              </div>
            </a>

            <a href="tel:+919152987821" className="flex items-center gap-4 p-4 rounded-xl bg-indigo-600/20 border border-indigo-500/30 hover:bg-indigo-600/30 transition-colors">
              <div className="w-10 h-10 rounded-full bg-indigo-500/20 flex items-center justify-center shrink-0">
                <Phone className="w-5 h-5 text-indigo-300" />
              </div>
              <div>
                <p className="text-white font-semibold">iCall (India)</p>
                <p className="text-white/50 text-xs">+91 9152987821 -- Mon-Sat, 8am-10pm</p>
              </div>
            </a>

            <a href="tel:+918046110007" className="flex items-center gap-4 p-4 rounded-xl bg-teal-600/20 border border-teal-500/30 hover:bg-teal-600/30 transition-colors">
              <div className="w-10 h-10 rounded-full bg-teal-500/20 flex items-center justify-center shrink-0">
                <Phone className="w-5 h-5 text-teal-300" />
              </div>
              <div>
                <p className="text-white font-semibold">NIMHANS Helpline (India)</p>
                <p className="text-white/50 text-xs">+91 80-46110007 -- 24/7</p>
              </div>
            </a>

            <a href="sms:741741&body=HELLO" className="flex items-center gap-4 p-4 rounded-xl bg-amber-600/20 border border-amber-500/30 hover:bg-amber-600/30 transition-colors">
              <div className="w-10 h-10 rounded-full bg-amber-500/20 flex items-center justify-center shrink-0">
                <span className="text-amber-300 font-bold text-sm">SMS</span>
              </div>
              <div>
                <p className="text-white font-semibold">Crisis Text Line</p>
                <p className="text-white/50 text-xs">Text HELLO to 741741 -- 24/7</p>
              </div>
            </a>
          </div>

          <Button variant="outline" onClick={() => setStep("landing")} className="w-full bg-transparent text-white/70 border-white/20 hover:bg-white/10 hover:text-white">
            Back
          </Button>
        </div>
      )}
    </div>
  )
}
