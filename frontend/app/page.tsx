'use client';

import Link from 'next/link';
import Image from 'next/image';
import { GraduationCap, ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/button';

export default function HomePage() {
  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 font-sans">
      
      {/* Top Bar / Header */}
      <header className="bg-white border-b border-slate-200">
        <div className="max-w-6xl mx-auto px-6 h-20 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-md bg-slate-900 flex items-center justify-center text-white border-2 border-amber-400">
              <GraduationCap className="h-5 w-5 text-amber-400" />
            </div>
            <div>
              <p className="font-bold text-lg leading-tight text-slate-900">Injibara University</p>
              <p className="text-[10px] text-slate-500 uppercase tracking-wider font-semibold">Registration & Enrollment System</p>
            </div>
          </div>
          
          <nav className="hidden md:flex items-center gap-6 text-sm font-medium text-slate-600">
            <Link href="#" className="hover:text-slate-900">Home</Link>
            <Link href="#" className="hover:text-slate-900">Admissions</Link>
            <Link href="#" className="hover:text-slate-900">Courses</Link>
            <Link href="#" className="hover:text-slate-900">Help</Link>
          </nav>

          <div className="flex items-center gap-3">
            <Button asChild variant="outline" className="border-slate-300 text-slate-700 hover:bg-slate-100 rounded-md">
              <Link href="/login">Log in</Link>
            </Button>
            <Button asChild className="bg-slate-900 hover:bg-slate-800 text-white rounded-md">
              <Link href="/register">Register</Link>
            </Button>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="max-w-6xl mx-auto px-6 py-16 md:py-24 grid lg:grid-cols-2 gap-12 items-center">
        <div className="space-y-6">
          <div className="inline-block px-3 py-1 bg-amber-100 text-amber-800 text-xs font-bold tracking-wider rounded-md uppercase">
            Student Portal
          </div>
          
          <h1 className="text-4xl md:text-5xl font-extrabold text-slate-900 leading-[1.15]">
            Register and enroll at <br />
            <span className="text-slate-800">Injibara University,</span> <br />
            all in one place.
          </h1>
          
          <p className="text-lg text-slate-500 max-w-md">
            Create your student account, choose your courses and track your enrollment status online.
          </p>

          <div className="flex gap-4 pt-2">
            <Button asChild size="lg" className="bg-slate-900 hover:bg-slate-800 text-white rounded-md px-8">
              <Link href="/register">Create account</Link>
            </Button>
            <Button asChild size="lg" variant="outline" className="border-slate-300 text-slate-700 hover:bg-slate-100 rounded-md px-8">
              <Link href="/login">Student login</Link>
            </Button>
          </div>
        </div>

        <div className="relative aspect-[4/3] w-full rounded-xl overflow-hidden border border-slate-200 shadow-xl bg-white p-4">
           <div className="absolute inset-0 bg-slate-100 flex items-center justify-center text-slate-400">
             {/* ምስል ከሌለ ይህ ይታያል፤ ምስል ካለዎት በ public ፎልደር ያስቀምጡ */}
             <Image 
               src="https://images.unsplash.com/photo-1541339907198-e08756dedf3f?q=80&w=1000&auto=format&fit=crop"
               alt="Kosober Gateway"
               fill
               className="object-cover"
             />
           </div>
           <div className="absolute bottom-0 left-0 right-0 bg-white/90 backdrop-blur-sm p-3 text-xs text-slate-600 border-t border-slate-200">
             Kosober Gateway, Injibara University
           </div>
        </div>
      </section>

      {/* Steps Section */}
      <section className="max-w-6xl mx-auto px-6 py-16">
        <h2 className="text-2xl font-bold text-slate-900 mb-8">How enrollment works</h2>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
            <p className="text-xs font-bold text-slate-400 uppercase mb-2">Step 1</p>
            <h3 className="text-lg font-bold text-slate-900 mb-2">Create your account</h3>
            <p className="text-sm text-slate-500">Sign up with your student details.</p>
          </div>

          <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
            <p className="text-xs font-bold text-slate-400 uppercase mb-2">Step 2</p>
            <h3 className="text-lg font-bold text-slate-900 mb-2">Verify your records</h3>
            <p className="text-sm text-slate-500">The registrar confirms your information.</p>
          </div>

          <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
            <p className="text-xs font-bold text-slate-400 uppercase mb-2">Step 3</p>
            <h3 className="text-lg font-bold text-slate-900 mb-2">Register for courses</h3>
            <p className="text-sm text-slate-500">Pick your courses for the semester.</p>
          </div>

          <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
            <p className="text-xs font-bold text-slate-400 uppercase mb-2">Step 4</p>
            <h3 className="text-lg font-bold text-slate-900 mb-2">Get enrolled</h3>
            <p className="text-sm text-slate-500">Track your status and see your schedule.</p>
          </div>
        </div>
      </section>

    </div>
  );
}