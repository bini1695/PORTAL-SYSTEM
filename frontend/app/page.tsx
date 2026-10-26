'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { Button } from '@/components/ui/button';

export default function HomePage() {
  // 👇 የዓመቱን ቁጥር ለመያዝ State
  const [currentYear, setCurrentYear] = useState<number | null>(null);

  // 👇 ገጹ ከተጫነ በኋላ ብቻ ዓመቱን ማስላት
  useEffect(() => {
    setCurrentYear(new Date().getFullYear());
  }, []);

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 font-sans">
      
      {/* 1. Header / Navigation - DARK GREEN THEME */}
      <header className="bg-emerald-900 border-b border-emerald-950 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between">
          <div className="flex items-center gap-3">
            {/* Logo */}
            <div className="h-10 w-10 rounded-md overflow-hidden flex items-center justify-center relative bg-white shadow-sm">
              <Image 
                src="/assets/icons/logo.jpg" 
                alt="Injibara University Logo" 
                fill 
                className="object-contain"
              />
            </div>
            <div>
              <p className="font-bold text-lg leading-tight text-white">Injibara University</p>
              <p className="text-[10px] text-emerald-200 uppercase tracking-wider font-semibold">Registration & Enrollment System</p>
            </div>
          </div>
          
          <nav className="hidden md:flex items-center gap-8 text-sm font-medium text-emerald-100">
            <Link href="#" className="hover:text-white transition-colors">Home</Link>
            <Link href="#" className="hover:text-white transition-colors">Admissions</Link>
            <Link href="#" className="hover:text-white transition-colors">Courses</Link>
            <Link href="#" className="hover:text-white transition-colors">Help</Link>
          </nav>

          <div className="flex items-center gap-3">
            <Button asChild variant="outline" className="border-emerald-700 text-emerald-50 hover:bg-emerald-800 hover:text-white rounded-md bg-transparent">
              <Link href="/login">Log in</Link>
            </Button>
            <Button asChild className="bg-white text-emerald-900 hover:bg-emerald-50 rounded-md font-semibold">
              <Link href="/register">Register</Link>
            </Button>
          </div>
        </div>
      </header>

      {/* 2. Hero Section */}
      <section className="max-w-7xl mx-auto px-6 py-16 md:py-24 grid lg:grid-cols-[1fr_1.2fr] gap-12 items-center">
        
        {/* Left Side - Text (40%) */}
        <div className="space-y-6 order-2 lg:order-1">
          <div className="inline-block px-3 py-1 bg-amber-100 text-amber-800 text-xs font-bold tracking-wider rounded-md uppercase">
            Student Portal
          </div>
          
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-extrabold text-slate-900 leading-[1.1]">
            Register and enroll at <br />
            <span className="text-slate-800">Injibara University,</span> <br />
            all in one place.
          </h1>
          
          <p className="text-lg text-slate-500 max-w-md">
            Create your student account, choose your courses and track your enrollment status online.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 pt-2">
            <Button asChild size="lg" className="bg-emerald-900 hover:bg-emerald-800 text-white rounded-md px-8 w-full sm:w-auto">
              <Link href="/register">Create account</Link>
            </Button>
            <Button asChild size="lg" variant="outline" className="border-slate-300 text-slate-700 hover:bg-slate-100 rounded-md px-8 w-full sm:w-auto">
              <Link href="/login">Student login</Link>
            </Button>
          </div>
        </div>

        {/* Right Side - Image (60%) */}
        <div className="relative w-full order-1 lg:order-2">
          <div className="relative aspect-[16/10] lg:aspect-[4/3] xl:aspect-[16/11] rounded-2xl overflow-hidden shadow-xl group">
            <Image 
              src="/assets/images/inu-campus.jpg" 
              alt="Kosober Gateway, Injibara University"
              fill
              className="object-cover group-hover:scale-105 transition-transform duration-700"
              priority
            />
          </div>
        </div>

      </section>

      {/* 3. Steps Section */}
      <section className="bg-white border-t border-slate-200">
        <div className="max-w-7xl mx-auto px-6 py-20">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-slate-900 mb-3">How enrollment works</h2>
            <p className="text-slate-500 max-w-2xl mx-auto">
              Follow these simple steps to complete your registration and start your academic journey.
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {/* Step 1 */}
            <div className="bg-slate-50 p-6 rounded-2xl border border-slate-100 hover:border-emerald-200 hover:shadow-md transition-all group">
              <div className="h-10 w-10 rounded-full bg-emerald-900 text-white flex items-center justify-center font-bold mb-4 group-hover:scale-110 transition-transform">
                1
              </div>
              <h3 className="text-lg font-bold text-slate-900 mb-2">Create your account</h3>
              <p className="text-sm text-slate-500 leading-relaxed">Sign up with your student details and set up your profile.</p>
            </div>

            {/* Step 2 */}
            <div className="bg-slate-50 p-6 rounded-2xl border border-slate-100 hover:border-emerald-200 hover:shadow-md transition-all group">
              <div className="h-10 w-10 rounded-full bg-emerald-900 text-white flex items-center justify-center font-bold mb-4 group-hover:scale-110 transition-transform">
                2
              </div>
              <h3 className="text-lg font-bold text-slate-900 mb-2">Verify your records</h3>
              <p className="text-sm text-slate-500 leading-relaxed">The registrar confirms your information and approves your account.</p>
            </div>

            {/* Step 3 */}
            <div className="bg-slate-50 p-6 rounded-2xl border border-slate-100 hover:border-emerald-200 hover:shadow-md transition-all group">
              <div className="h-10 w-10 rounded-full bg-emerald-900 text-white flex items-center justify-center font-bold mb-4 group-hover:scale-110 transition-transform">
                3
              </div>
              <h3 className="text-lg font-bold text-slate-900 mb-2">Register for courses</h3>
              <p className="text-sm text-slate-500 leading-relaxed">Browse the catalog and pick the courses for your semester.</p>
            </div>

            {/* Step 4 */}
            <div className="bg-slate-50 p-6 rounded-2xl border border-slate-100 hover:border-emerald-200 hover:shadow-md transition-all group">
              <div className="h-10 w-10 rounded-full bg-emerald-900 text-white flex items-center justify-center font-bold mb-4 group-hover:scale-110 transition-transform">
                4
              </div>
              <h3 className="text-lg font-bold text-slate-900 mb-2">Get enrolled</h3>
              <p className="text-sm text-slate-500 leading-relaxed">Track your enrollment status, view your schedule, and start learning.</p>
            </div>
          </div>
        </div>
      </section>

      {/* 4. Footer */}
      <footer className="bg-emerald-900 py-12 text-emerald-200">
        <div className="max-w-7xl mx-auto px-6 flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2 text-white">
            <p className="font-semibold">Injibara University</p>
          </div>
          <p className="text-sm">
            {/* 👇 ዓመቱ እስኪሰላ ድረስ የአሁኑን ዓመት ያሳያል */}
            © {currentYear || 2026} SRES System. All rights reserved.
          </p>
          <div className="flex gap-4 text-sm">
            <Link href="#" className="hover:text-white transition-colors">Privacy</Link>
            <Link href="#" className="hover:text-white transition-colors">Terms</Link>
          </div>
        </div>
      </footer>

    </div>
  );
}