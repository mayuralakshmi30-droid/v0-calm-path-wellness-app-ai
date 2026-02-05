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

// ---- Contextual response engine ----

interface ResponseRule {
  keywords: string[]
  responses: string[]
  followUp?: string
}

const responseRules: ResponseRule[] = [
  // Greetings
  {
    keywords: ["hello", "hi", "hey", "good morning", "good evening", "good afternoon", "howdy"],
    responses: [
      "Hello! How are you feeling today? I'm here to listen and support you.",
      "Hi there! Welcome to CalmPath. What's on your mind today?",
      "Hey! I'm glad you're here. How can I support you today?",
    ],
  },
  // Anxiety
  {
    keywords: ["anxious", "anxiety", "nervous", "panic", "panic attack", "worried", "worrying", "overthinking", "restless"],
    responses: [
      "I understand anxiety can feel overwhelming. Let's work through this together. Can you tell me what's triggering your anxiety right now? Sometimes identifying the source helps us address it more effectively.",
      "Anxiety is your body's natural alarm system, but sometimes it goes off when there's no real danger. Try this: breathe in for 4 counts, hold for 7, and breathe out for 8. This activates your parasympathetic nervous system and calms the fight-or-flight response. How are you feeling right now?",
      "I hear you. Anxiety can be really tough to deal with. One technique that helps many people is the 5-4-3-2-1 grounding method: name 5 things you can see, 4 you can touch, 3 you can hear, 2 you can smell, and 1 you can taste. Would you like to try it together?",
    ],
    followUp: "Would you like me to guide you through a breathing exercise, or would you prefer to talk more about what's causing your anxiety?",
  },
  // Stress
  {
    keywords: ["stressed", "stress", "pressure", "overwhelmed", "overworked", "burned out", "burnout", "too much"],
    responses: [
      "Stress can really weigh on us, both mentally and physically. What's the biggest source of stress for you right now? Sometimes breaking it down into smaller parts can make it feel more manageable.",
      "I'm sorry you're feeling stressed. Your body might be carrying tension -- try this: slowly roll your shoulders back 5 times, then forward 5 times. Unclench your jaw and relax your forehead. How does your body feel when you do that?",
      "Feeling overwhelmed is a sign that you may be taking on more than you can handle right now, and that's okay. Can you identify one thing on your plate that you could delegate, postpone, or let go of? Even small changes can create relief.",
    ],
    followUp: "Would you like to explore some stress management techniques, or would it help to talk through what's causing this pressure?",
  },
  // Depression / Sadness
  {
    keywords: ["sad", "depressed", "depression", "hopeless", "worthless", "empty", "numb", "miserable", "unhappy", "down", "low"],
    responses: [
      "I'm really sorry you're feeling this way. Your feelings are completely valid, and it takes strength to acknowledge them. Can you tell me more about when this started? Sometimes understanding the pattern helps us find ways to cope.",
      "Thank you for trusting me with this. Depression can make everything feel heavy and colorless. One small step that often helps is doing one kind thing for yourself today -- it could be as simple as stepping outside for 5 minutes or having your favorite drink. What sounds doable for you right now?",
      "I hear you, and I want you to know you're not alone in this. Many people experience these feelings, and there is help available. Have you considered talking to one of our professional therapists? They can provide personalized support that goes beyond what I can offer here.",
    ],
    followUp: "Remember, seeking help is a sign of strength, not weakness. Would you like me to suggest some coping strategies, or would you prefer to explore our therapist options?",
  },
  // Sleep
  {
    keywords: ["sleep", "insomnia", "can't sleep", "sleeping", "tired", "exhausted", "fatigue", "restless night", "nightmare", "nightmares"],
    responses: [
      "Sleep issues can really affect your overall wellbeing. Let's look at your sleep habits: What time do you usually go to bed and wake up? Do you use screens before bedtime? A consistent sleep schedule and a screen-free wind-down routine can make a significant difference.",
      "I'm sorry you're struggling with sleep. Here's a technique called 'body scan meditation': lie down, close your eyes, and slowly focus your attention on each part of your body from your toes to your head, consciously relaxing each area. Many people find this helps quiet the mind for sleep.",
      "Poor sleep and mental health are closely connected. Try creating a 'sleep sanctuary': keep your room cool (around 65-68F), use blackout curtains, and avoid caffeine after 2 PM. Also, the 4-7-8 breathing technique (breathe in for 4, hold for 7, out for 8) is excellent for falling asleep. Would any of these work for you?",
    ],
    followUp: "Would you like a personalized bedtime routine, or do you want to explore what might be keeping your mind active at night?",
  },
  // Anger
  {
    keywords: ["angry", "anger", "frustrated", "furious", "irritated", "mad", "rage", "annoyed"],
    responses: [
      "Anger is a natural emotion, and it's important to express it in healthy ways rather than suppress it. What's making you feel this way? Understanding the root cause can help us find constructive outlets.",
      "When you feel anger rising, try the STOP technique: Stop what you're doing, Take a breath, Observe what you're feeling without judgment, and Proceed thoughtfully. This creates space between the trigger and your response. What triggered your anger today?",
      "I understand you're feeling frustrated. Anger often masks deeper emotions like hurt, fear, or disappointment. When you sit with this feeling, can you identify what's underneath the anger? That awareness can be incredibly powerful.",
    ],
    followUp: "Would you like to explore some anger management techniques, or would it help to talk through the situation that's causing this?",
  },
  // Loneliness
  {
    keywords: ["lonely", "alone", "isolated", "no friends", "no one", "nobody", "disconnected"],
    responses: [
      "Feeling lonely can be incredibly painful, and I want you to know that reaching out here shows real courage. Loneliness doesn't mean something is wrong with you -- it's a human need for connection. What kind of connections are you missing most right now?",
      "I'm sorry you're feeling isolated. Social connection is a fundamental human need. One small step: could you reach out to one person today, even with a simple text? It doesn't have to be deep -- sometimes just saying 'thinking of you' to someone can open a door. What feels comfortable for you?",
      "Loneliness is more common than people think, and it can affect anyone. You might find it helpful to join a community group, volunteer, or try a hobby class where you can meet people with shared interests. In the meantime, I'm here whenever you need to talk.",
    ],
    followUp: "Would you like to explore ways to build meaningful connections, or would you prefer to talk more about how you're feeling?",
  },
  // Self-esteem / Confidence
  {
    keywords: ["confidence", "self-esteem", "insecure", "not good enough", "worthless", "ugly", "failure", "loser", "hate myself", "self-doubt"],
    responses: [
      "I hear you, and I want to challenge that inner critic. The thoughts telling you you're not enough are not facts -- they're patterns that can be changed. Can you tell me one thing you did well recently, even something small? Let's start building a different narrative together.",
      "Low self-esteem often develops from repeated negative experiences or messages, but it doesn't define who you truly are. Try this exercise: write down 3 things you appreciate about yourself each night before bed. It might feel awkward at first, but over time it rewires how your brain perceives you.",
      "Many people struggle with self-doubt, and it's more about the stories we tell ourselves than reality. A powerful technique is to ask: 'Would I say this to my best friend?' If not, why say it to yourself? You deserve the same compassion you give others.",
    ],
    followUp: "Would you like to work on some self-compassion exercises, or would it help to explore where these feelings might be coming from?",
  },
  // Relationships
  {
    keywords: ["relationship", "breakup", "partner", "boyfriend", "girlfriend", "spouse", "husband", "wife", "marriage", "dating", "ex", "heartbreak", "cheating"],
    responses: [
      "Relationship challenges can be deeply emotional. Whether it's conflict, distance, or a breakup, your feelings are valid. Can you tell me more about what's happening? I'd like to understand so I can offer the most relevant support.",
      "Relationships are one of the most complex parts of life. It's important to remember that healthy relationships require open communication, mutual respect, and boundaries. What aspect of your relationship is causing you the most concern right now?",
      "I'm sorry you're going through this. Whether you're dealing with a breakup or relationship difficulties, it's okay to grieve and feel hurt. Healing takes time, and there's no 'right' timeline. What would feel supportive for you right now -- talking it through, or some coping strategies?",
    ],
    followUp: "Would you like to discuss communication strategies, or would you prefer to talk to one of our couples/family therapists?",
  },
  // Work / Career
  {
    keywords: ["work", "job", "career", "boss", "coworker", "office", "workplace", "fired", "promoted", "interview", "resign"],
    responses: [
      "Work-related stress is one of the most common challenges people face. It's important to set boundaries between your professional and personal life. Can you tell me what specific aspect of work is affecting you? Is it workload, relationships, or something else?",
      "I understand work pressures can feel relentless. One approach that helps: at the end of each workday, write down 3 things you accomplished (no matter how small) and one boundary you'll set tomorrow. This builds a sense of control and prevents burnout. What does your typical workday look like?",
      "Career concerns can stir up a lot of anxiety about the future. Remember: your worth isn't defined by your job title. Let's focus on what you can control right now. What's the one thing about your work situation you'd most like to change?",
    ],
    followUp: "Would you like strategies for managing work stress, or would it help to explore deeper feelings about your career path?",
  },
  // Motivation
  {
    keywords: ["motivation", "motivated", "lazy", "procrastinating", "procrastination", "stuck", "unmotivated", "no energy", "can't focus"],
    responses: [
      "Lack of motivation is often a sign that something deeper needs attention -- it could be burnout, unclear goals, or even your body telling you to rest. Instead of forcing yourself, try the '2-minute rule': commit to just 2 minutes of a task. Often, starting is the hardest part. What's one thing you've been putting off?",
      "I get it -- some days it feels impossible to get started. Here's something important: motivation often follows action, not the other way around. Try doing the smallest possible version of what you need to do. Just open the document. Just put on your shoes. The rest tends to follow. What's been hardest to start?",
      "Feeling stuck can be frustrating. Let's approach this differently: what excited you recently, even briefly? Reconnecting with what genuinely interests you can reignite your drive. Sometimes we lose motivation because we're pursuing goals that no longer align with who we are.",
    ],
    followUp: "Would you like to explore goal-setting techniques, or would it help to understand why you're feeling unmotivated?",
  },
  // Breathing / Meditation
  {
    keywords: ["breathing", "breathe", "meditate", "meditation", "mindfulness", "calm down", "relax", "relaxation"],
    responses: [
      "Great choice! Let's do a breathing exercise together. Try box breathing:\n\n1. Breathe IN slowly for 4 seconds\n2. HOLD your breath for 4 seconds\n3. Breathe OUT slowly for 4 seconds\n4. HOLD empty for 4 seconds\n\nRepeat this 4 times. Focus only on the counting. How do you feel after trying it?",
      "Mindfulness is a wonderful practice. Here's a quick 1-minute meditation: close your eyes, take three deep breaths, and then simply observe your thoughts passing like clouds in the sky -- don't engage with them, just watch them float by. After 60 seconds, gently open your eyes. Would you like to try this?",
      "Let's try the 4-7-8 technique, which is excellent for calming your nervous system:\n\n1. Breathe IN through your nose for 4 seconds\n2. HOLD for 7 seconds\n3. Breathe OUT through your mouth for 8 seconds\n\nThis pattern activates your parasympathetic nervous system and tells your body it's safe to relax. Try it 3 times and tell me how you feel.",
    ],
  },
  // Gratitude / Positive
  {
    keywords: ["grateful", "gratitude", "thankful", "happy", "good", "great", "wonderful", "better", "positive", "blessed"],
    responses: [
      "That's wonderful to hear! Positive emotions are just as important to explore as difficult ones. What specifically is making you feel this way? Naming the source of our joy helps us recreate it.",
      "I love that you're feeling positive! Savoring good moments is a powerful wellbeing practice. Try to really sit with this feeling for 30 seconds -- notice where you feel it in your body, what thoughts come with it. This trains your brain to notice and hold onto the good.",
      "That's great! Did you know that regularly noting what you're grateful for can physically change your brain? People who practice gratitude show increased activity in the prefrontal cortex, which helps with emotional regulation. Keep this up -- you're literally rewiring your brain for happiness!",
    ],
  },
  // Grief / Loss
  {
    keywords: ["grief", "loss", "died", "death", "passed away", "mourning", "miss them", "funeral"],
    responses: [
      "I'm deeply sorry for your loss. Grief is one of the most profound human experiences, and there's no right way to go through it. Please know that whatever you're feeling -- sadness, anger, confusion, numbness -- it's all part of the process. Would you like to tell me about the person you've lost?",
      "Losing someone we love changes us forever, and that's okay. Grief doesn't have a timeline, and anyone who tells you to 'move on' doesn't understand. Be gentle with yourself right now. Is there a memory of them that brings you comfort?",
      "I hear your pain, and I want you to know that grieving is not a sign of weakness -- it's a reflection of how deeply you loved. Take things one day at a time, one hour at a time if needed. Professional grief counseling can also be incredibly helpful. Would you like me to suggest a therapist who specializes in this?",
    ],
    followUp: "Would you like to talk more about your feelings, or would you prefer some gentle coping strategies for grief?",
  },
  // Eating / Body image
  {
    keywords: ["eating", "weight", "body image", "diet", "food", "binge", "anorexia", "bulimia", "fat", "thin", "calories"],
    responses: [
      "Body image and our relationship with food can be really complex. I want you to know that your worth has nothing to do with how you look or what you eat. Can you tell me more about what's going on? Are you struggling with how you see yourself, or with eating patterns?",
      "Thank you for sharing something so personal. Our culture puts enormous pressure on how we should look, and it can be exhausting. Remember: healthy looks different on every body. What would it feel like to focus on how your body feels rather than how it looks?",
      "Eating concerns and body image issues deserve professional attention. While I'm here to listen, I'd strongly encourage you to speak with a therapist who specializes in this area -- they can provide tools and support that make a real difference. Would you like me to help with that?",
    ],
    followUp: "Would you like to explore self-acceptance exercises, or would you prefer to connect with a specialist in this area?",
  },
  // Help / Emergency
  {
    keywords: ["suicide", "kill myself", "end it", "self-harm", "cutting", "hurt myself", "don't want to live", "suicidal"],
    responses: [
      "I'm really concerned about what you're sharing, and I want you to know that your life matters. If you're in immediate danger, please call the National Suicide Prevention Lifeline at 988 (call or text) or go to your nearest emergency room right now.\n\nYou don't have to go through this alone. Crisis counselors are available 24/7 and can provide the immediate support you need. Will you reach out to them?",
    ],
  },
  // Therapy / Therapist
  {
    keywords: ["therapist", "therapy", "counselor", "counseling", "professional help", "psychologist", "psychiatrist"],
    responses: [
      "That's a really positive step you're considering! Therapy can be transformative. CalmPath has licensed therapists specializing in various areas -- from anxiety and depression to trauma and relationships. You can browse them on the dashboard and filter by language, specialty, and type. Would you like help finding the right fit?",
      "Reaching out for professional help is one of the bravest things you can do. Different therapists use different approaches -- CBT for thought patterns, EMDR for trauma, DBT for emotional regulation. What are the main concerns you'd like to address? That will help me point you in the right direction.",
      "Therapy is an investment in yourself, and your first session on CalmPath is completely free! You can explore our therapist directory, filter by language and specialization, read reviews, and book a session that works with your schedule. What type of support are you looking for?",
    ],
  },
  // Thank you
  {
    keywords: ["thank", "thanks", "appreciate", "helpful", "helped"],
    responses: [
      "You're very welcome! I'm always here whenever you need to talk. Remember, taking care of your mental health is a daily practice, not a one-time fix. Is there anything else on your mind?",
      "I'm glad I could help! Don't hesitate to come back anytime -- whether you need to vent, want coping strategies, or just need someone to listen. How are you feeling right now compared to when we started chatting?",
      "It means a lot to hear that. Your willingness to work on your wellbeing is inspiring. Keep being kind to yourself, and remember I'm here 24/7. Is there anything else you'd like to explore?",
    ],
  },
  // General how are you / wellbeing check
  {
    keywords: ["how are you", "what can you do", "who are you", "your name", "what are you"],
    responses: [
      "I'm CalmPath's wellness assistant! I'm here to listen, provide emotional support, suggest coping techniques, and help connect you with professional therapists when needed. I'm not a replacement for therapy, but I'm always available when you need someone to talk to. What's on your mind?",
      "I'm your mental health companion here at CalmPath. I can help with anxiety, stress, sleep issues, motivation, relationships, and more. I can also guide you through breathing exercises and help you find the right therapist. How can I support you today?",
    ],
  },
]

// Fallback responses when no keywords match
const fallbackResponses = [
  "Thank you for sharing that with me. Can you tell me more about how this is making you feel? The more I understand, the better I can support you.",
  "I appreciate you opening up. Let's explore this further -- what emotions come up for you when you think about this situation?",
  "That's an important thing to reflect on. How has this been affecting your daily life -- your sleep, appetite, energy, or relationships?",
  "I hear you. Sometimes it helps to look at things from a different angle. If your best friend told you this, what advice would you give them?",
  "Thank you for trusting me with that. Would you like to explore some coping strategies, or do you just need someone to listen right now?",
]

function generateBotResponse(userMessage: string, conversationHistory: Message[]): string {
  const lowerMsg = userMessage.toLowerCase()

  // Check each rule for keyword matches, score by number of matches
  let bestMatch: ResponseRule | null = null
  let bestScore = 0

  for (const rule of responseRules) {
    let score = 0
    for (const keyword of rule.keywords) {
      if (lowerMsg.includes(keyword)) {
        score += keyword.split(" ").length // Multi-word keywords score higher
      }
    }
    if (score > bestScore) {
      bestScore = score
      bestMatch = rule
    }
  }

  if (bestMatch && bestScore > 0) {
    const randomIdx = Math.floor(Math.random() * bestMatch.responses.length)
    let response = bestMatch.responses[randomIdx]

    // Add follow-up on first mention of topic (check if we already asked this follow-up)
    if (bestMatch.followUp && conversationHistory.length < 8) {
      const alreadyAsked = conversationHistory.some(
        (m) => m.sender === "bot" && m.content.includes(bestMatch!.followUp!)
      )
      if (!alreadyAsked) {
        response += "\n\n" + bestMatch.followUp
      }
    }

    return response
  }

  // Fallback
  const fallbackIdx = Math.floor(Math.random() * fallbackResponses.length)
  return fallbackResponses[fallbackIdx]
}

// ---- End response engine ----

const suggestionChips = [
  "I'm feeling anxious",
  "I can't sleep at night",
  "Help me with stress",
  "I need motivation",
  "I feel lonely",
  "Guide me through breathing",
  "I want to find a therapist",
]

export default function ChatbotPage() {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: "welcome",
      content:
        "Hello! I'm your CalmPath wellness companion. I'm here to listen, support you, and help with anything from anxiety and stress to sleep issues and finding the right therapist. How are you feeling today?",
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

    const updatedMessages = [...messages, userMessage]
    setMessages(updatedMessages)
    setInput("")
    setIsTyping(true)

    // Generate contextual response
    const typingDelay = 800 + Math.min(messageText.length * 15, 2000)
    setTimeout(() => {
      const responseContent = generateBotResponse(messageText, updatedMessages)
      const botMessage: Message = {
        id: crypto.randomUUID(),
        content: responseContent,
        sender: "bot",
        timestamp: new Date(),
      }
      setMessages((prev) => [...prev, botMessage])
      setIsTyping(false)
    }, typingDelay)
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
        <p className="text-muted-foreground mt-1">
          Your supportive companion for mental wellness
        </p>
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
                <div
                  className={cn(
                    "w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0",
                    message.sender === "user" ? "bg-primary" : "bg-primary/10"
                  )}
                >
                  {message.sender === "user" ? (
                    <User className="w-4 h-4 text-primary-foreground" />
                  ) : (
                    <Bot className="w-4 h-4 text-primary" />
                  )}
                </div>
                <div
                  className={cn(
                    "max-w-[75%] rounded-2xl px-4 py-3",
                    message.sender === "user"
                      ? "bg-primary text-primary-foreground rounded-br-sm"
                      : "bg-muted text-foreground rounded-bl-sm"
                  )}
                >
                  <p className="text-sm leading-relaxed whitespace-pre-line">
                    {message.content}
                  </p>
                  <p
                    className={cn(
                      "text-xs mt-1",
                      message.sender === "user"
                        ? "text-primary-foreground/70"
                        : "text-muted-foreground"
                    )}
                  >
                    {message.timestamp.toLocaleTimeString("en-US", {
                      hour: "numeric",
                      minute: "2-digit",
                    })}
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
                    <span
                      className="w-2 h-2 bg-muted-foreground/50 rounded-full animate-bounce"
                      style={{ animationDelay: "0ms" }}
                    />
                    <span
                      className="w-2 h-2 bg-muted-foreground/50 rounded-full animate-bounce"
                      style={{ animationDelay: "150ms" }}
                    />
                    <span
                      className="w-2 h-2 bg-muted-foreground/50 rounded-full animate-bounce"
                      style={{ animationDelay: "300ms" }}
                    />
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
            <Button
              size="icon"
              onClick={() => handleSend()}
              disabled={!input.trim() || isTyping}
            >
              <Send className="w-4 h-4" />
              <span className="sr-only">Send message</span>
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
