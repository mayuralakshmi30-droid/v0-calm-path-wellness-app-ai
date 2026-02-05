"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
  Heart,
  Brain,
  Users,
  MessageCircle,
  Gamepad2,
  BookOpen,
  CheckCircle,
  ArrowRight,
  Sparkles,
  Shield,
  Clock,
} from "lucide-react";
import Link from "next/link";

const Page = () => {
  const features = [
    {
      icon: Users,
      title: "Licensed Therapists",
      description:
        "Connect with certified psychologists and therapists. First session is always free!",
    },
    {
      icon: Heart,
      title: "Mood Tracking",
      description:
        "Track your daily emotions and identify patterns to better understand yourself.",
    },
    {
      icon: CheckCircle,
      title: "Habit Tracker",
      description:
        "Build healthy habits with our intuitive tracking system and streak rewards.",
    },
    {
      icon: BookOpen,
      title: "Personal Journal",
      description:
        "Express your thoughts privately with mood-tagged journal entries.",
    },
    {
      icon: MessageCircle,
      title: "AI Companion",
      description:
        "Chat with our supportive AI for immediate emotional support anytime.",
    },
    {
      icon: Gamepad2,
      title: "Relaxation Games",
      description:
        "Unwind with calming games designed to reduce stress and anxiety.",
    },
  ];

  const benefits = [
    {
      icon: Shield,
      title: "100% Confidential",
      description: "Your privacy is our top priority",
    },
    {
      icon: Clock,
      title: "24/7 Access",
      description: "Support whenever you need it",
    },
    {
      icon: Sparkles,
      title: "First Session Free",
      description: "Try therapy risk-free",
    },
  ];

  return (
    <div className="min-h-screen bg-background">
      {/* Navigation */}
      <nav className="fixed top-0 left-0 right-0 z-50 bg-background/80 backdrop-blur-md border-b border-border">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-full bg-primary flex items-center justify-center">
                <Brain className="w-5 h-5 text-primary-foreground" />
              </div>
              <span className="text-xl font-bold text-foreground">
                CalmPath
              </span>
            </div>
            <div className="flex items-center gap-4">
              <Link href="/login">
                <Button variant="ghost" className="text-foreground">
                  Login
                </Button>
              </Link>
              <Link href="/signup">
                <Button className="bg-primary text-primary-foreground hover:bg-primary/90">
                  Get Started
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="pt-32 pb-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="text-center max-w-3xl mx-auto">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 text-primary mb-6">
              <Sparkles className="w-4 h-4" />
              <span className="text-sm font-medium">
                Your First Session is Free
              </span>
            </div>
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-foreground mb-6 text-balance">
              Your Path to{" "}
              <span className="text-primary">Mental Wellness</span> Starts Here
            </h1>
            <p className="text-lg sm:text-xl text-muted-foreground mb-8 text-pretty">
              Connect with licensed therapists, track your mood, build healthy
              habits, and discover tools designed to support your mental health
              journey.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link href="/signup">
                <Button
                  size="lg"
                  className="bg-primary text-primary-foreground hover:bg-primary/90 w-full sm:w-auto"
                >
                  Start Your Journey
                  <ArrowRight className="w-4 h-4 ml-2" />
                </Button>
              </Link>
              <Link href="/login">
                <Button
                  size="lg"
                  variant="outline"
                  className="w-full sm:w-auto bg-transparent"
                >
                  I Have an Account
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Benefits Bar */}
      <section className="py-8 bg-primary/5 border-y border-border">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {benefits.map((benefit, index) => (
              <div key={index} className="flex items-center justify-center gap-3">
                <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                  <benefit.icon className="w-5 h-5 text-primary" />
                </div>
                <div>
                  <p className="font-semibold text-foreground">
                    {benefit.title}
                  </p>
                  <p className="text-sm text-muted-foreground">
                    {benefit.description}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl sm:text-4xl font-bold text-foreground mb-4">
              Everything You Need for Mental Wellness
            </h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              CalmPath provides comprehensive tools and professional support to
              help you on your mental health journey.
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {features.map((feature, index) => (
              <Card
                key={index}
                className="bg-card border-border hover:shadow-lg transition-shadow"
              >
                <CardContent className="p-6">
                  <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center mb-4">
                    <feature.icon className="w-6 h-6 text-primary" />
                  </div>
                  <h3 className="text-xl font-semibold text-card-foreground mb-2">
                    {feature.title}
                  </h3>
                  <p className="text-muted-foreground">{feature.description}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 bg-primary/5">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-3xl sm:text-4xl font-bold text-foreground mb-4">
            Ready to Start Your Wellness Journey?
          </h2>
          <p className="text-lg text-muted-foreground mb-8">
            Join thousands of people who have found their path to better mental
            health with CalmPath.
          </p>
          <Link href="/signup">
            <Button
              size="lg"
              className="bg-primary text-primary-foreground hover:bg-primary/90"
            >
              Get Started Free
              <ArrowRight className="w-4 h-4 ml-2" />
            </Button>
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-12 px-4 sm:px-6 lg:px-8 border-t border-border">
        <div className="max-w-7xl mx-auto">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-full bg-primary flex items-center justify-center">
                <Brain className="w-5 h-5 text-primary-foreground" />
              </div>
              <span className="text-lg font-bold text-foreground">
                CalmPath
              </span>
            </div>
            <p className="text-sm text-muted-foreground">
              2024 CalmPath. Supporting your mental wellness journey.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Page;
