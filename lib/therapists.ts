export interface Therapist {
  id: string
  name: string
  title: string
  qualifications: string[]
  specialties: string[]
  pricePerSession: number
  rating: number
  reviewCount: number
  availableSlots: {
    day: string
    times: string[]
  }[]
  languages: string[]
  bio: string
  image: string
}

export const therapists: Therapist[] = [
  {
    id: "1",
    name: "Dr. Sarah Mitchell",
    title: "Clinical Psychologist",
    qualifications: ["Ph.D. in Clinical Psychology", "Licensed CBT Practitioner", "15+ years experience"],
    specialties: ["Anxiety", "Depression", "Stress Management"],
    pricePerSession: 1500,
    rating: 4.9,
    reviewCount: 234,
    availableSlots: [
      { day: "Monday", times: ["9:00 AM", "11:00 AM", "2:00 PM", "4:00 PM"] },
      { day: "Wednesday", times: ["10:00 AM", "1:00 PM", "3:00 PM"] },
      { day: "Friday", times: ["9:00 AM", "11:00 AM", "2:00 PM"] },
    ],
    languages: ["English", "Hindi", "French"],
    bio: "Dr. Mitchell specializes in helping individuals overcome anxiety and depression using evidence-based approaches. Her warm and empathetic style creates a safe space for healing.",
    image: "/therapists/sarah.jpg",
  },
  {
    id: "2",
    name: "Dr. James Chen",
    title: "Psychiatrist",
    qualifications: ["M.D. in Psychiatry", "Board Certified", "12+ years experience"],
    specialties: ["Mood Disorders", "PTSD", "Medication Management"],
    pricePerSession: 2500,
    rating: 4.8,
    reviewCount: 189,
    availableSlots: [
      { day: "Tuesday", times: ["10:00 AM", "12:00 PM", "3:00 PM"] },
      { day: "Thursday", times: ["9:00 AM", "11:00 AM", "1:00 PM", "4:00 PM"] },
    ],
    languages: ["English", "Tamil", "Kannada"],
    bio: "Dr. Chen combines medication management with therapeutic techniques to provide comprehensive mental health care. He believes in treating the whole person, not just symptoms.",
    image: "/therapists/james.jpg",
  },
  {
    id: "3",
    name: "Dr. Emily Rodriguez",
    title: "Marriage & Family Therapist",
    qualifications: ["Ph.D. in Family Therapy", "LMFT Licensed", "10+ years experience"],
    specialties: ["Couples Therapy", "Family Dynamics", "Communication"],
    pricePerSession: 1200,
    rating: 4.9,
    reviewCount: 312,
    availableSlots: [
      { day: "Monday", times: ["10:00 AM", "2:00 PM", "5:00 PM"] },
      { day: "Tuesday", times: ["9:00 AM", "11:00 AM", "3:00 PM"] },
      { day: "Saturday", times: ["10:00 AM", "12:00 PM", "2:00 PM"] },
    ],
    languages: ["English", "Spanish", "Telugu"],
    bio: "Dr. Rodriguez helps families and couples build stronger connections through improved communication and understanding. She creates a judgment-free zone for all.",
    image: "/therapists/emily.jpg",
  },
  {
    id: "4",
    name: "Dr. Michael Thompson",
    title: "Behavioral Therapist",
    qualifications: ["Psy.D. in Behavioral Psychology", "ABA Certified", "8+ years experience"],
    specialties: ["OCD", "Phobias", "Behavioral Issues"],
    pricePerSession: 1800,
    rating: 4.7,
    reviewCount: 156,
    availableSlots: [
      { day: "Wednesday", times: ["9:00 AM", "11:00 AM", "1:00 PM", "3:00 PM"] },
      { day: "Thursday", times: ["10:00 AM", "2:00 PM", "4:00 PM"] },
      { day: "Friday", times: ["9:00 AM", "12:00 PM"] },
    ],
    languages: ["English", "Hindi", "Marathi"],
    bio: "Dr. Thompson uses proven behavioral techniques to help clients overcome fears, compulsions, and unwanted behaviors. He focuses on practical, actionable strategies.",
    image: "/therapists/michael.jpg",
  },
  {
    id: "5",
    name: "Dr. Aisha Patel",
    title: "Trauma Specialist",
    qualifications: ["Ph.D. in Trauma Psychology", "EMDR Certified", "14+ years experience"],
    specialties: ["Trauma", "PTSD", "Grief & Loss"],
    pricePerSession: 2000,
    rating: 4.9,
    reviewCount: 278,
    availableSlots: [
      { day: "Monday", times: ["11:00 AM", "2:00 PM", "4:00 PM"] },
      { day: "Tuesday", times: ["9:00 AM", "1:00 PM", "3:00 PM"] },
      { day: "Thursday", times: ["10:00 AM", "12:00 PM", "2:00 PM"] },
    ],
    languages: ["English", "Hindi", "Gujarati", "Urdu"],
    bio: "Dr. Patel specializes in trauma recovery using EMDR and other evidence-based approaches. She provides a compassionate space for healing from life's most difficult experiences.",
    image: "/therapists/aisha.jpg",
  },
  {
    id: "6",
    name: "Dr. David Kim",
    title: "Mindfulness Therapist",
    qualifications: ["Ph.D. in Psychology", "MBSR Certified", "9+ years experience"],
    specialties: ["Mindfulness", "Stress", "Work-Life Balance"],
    pricePerSession: 1000,
    rating: 4.8,
    reviewCount: 201,
    availableSlots: [
      { day: "Tuesday", times: ["8:00 AM", "10:00 AM", "4:00 PM", "6:00 PM"] },
      { day: "Wednesday", times: ["9:00 AM", "11:00 AM", "3:00 PM"] },
      { day: "Friday", times: ["10:00 AM", "2:00 PM", "4:00 PM"] },
    ],
    languages: ["English", "Bengali", "Malayalam"],
    bio: "Dr. Kim integrates mindfulness-based approaches with traditional therapy to help clients find balance, reduce stress, and cultivate inner peace in their daily lives.",
    image: "/therapists/david.jpg",
  },
]
