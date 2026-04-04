"use client";
import BackgroundCanvas from "@/components/BackgroundCanvas";
import FloatingHeader from "@/components/FloatingHeader";
import HeroSection from "@/components/HeroSection";
import HowItWorks from "@/components/HowItWorks";
import FeaturesInteractive from "@/components/FeaturesInteractive";
import ThreatDashboard from "@/components/dashboard/ThreatDashboard";
import ComparisonSection from "@/components/ComparisonSection";
import AboutUs from "@/components/AboutUs";
import CalendarModal from "@/components/CalendarModal";
import { useState } from "react";

export default function Home() {
  const [isCalendarOpen, setIsCalendarOpen] = useState(false);

  return (
    <main className="relative w-full min-h-screen">
      <BackgroundCanvas />
      <FloatingHeader onOpenCalendar={() => setIsCalendarOpen(true)} />

      <div className="relative z-10 w-full flex flex-col items-center">
        <HeroSection onOpenCalendar={() => setIsCalendarOpen(true)} />
        <HowItWorks />
        <FeaturesInteractive />
        <ThreatDashboard />
        <ComparisonSection />
        <AboutUs />
      </div>

      <CalendarModal isOpen={isCalendarOpen} onClose={() => setIsCalendarOpen(false)} />
    </main>
  );
}
