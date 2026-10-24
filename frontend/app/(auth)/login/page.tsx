'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useAuth } from '@/lib/auth-context';
import { loginSchema, type LoginInput } from '@/lib/validations/student';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { ArrowLeft } from 'lucide-react';

export default function LoginPage() {
  const router = useRouter();
  const { login } = useAuth();
  const [serverError, setServerError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const { register, handleSubmit, formState: { errors } } = useForm<LoginInput>({ resolver: zodResolver(loginSchema) });

  const onSubmit = async (data: LoginInput) => {
    setServerError(null);
    setLoading(true);
    try {
      await login(data.email, data.password);
      
      const storedUser = localStorage.getItem('sres_user');
      if (storedUser) {
        const parsed = JSON.parse(storedUser);
        switch (parsed.role) {
          case 'ADMIN': router.push('/admin'); break;
          case 'BURSAR': router.push('/bursar'); break;
          case 'FACULTY': router.push('/faculty'); break;
          default: router.push('/student'); break;
        }
      } else {
        router.push('/');
      }
    } catch (err) {
      setServerError((err as Error).message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen bg-white">
      
      {/* የግራ በኩል ዲዛይን (ምስል + ሎጎ) */}
      <div className="hidden lg:flex w-[45%] relative flex-col justify-between p-12 overflow-hidden">
        
        {/* ✅ ምስሉ (Blur የለም፣ ግልጽ ሆኖ ይታያል) */}
        <div className="absolute inset-0 z-0">
          <Image 
            src="/assets/images/inu-campus.jpg" 
            alt="Injibara University Campus" 
            fill 
            className="object-cover"
            priority
          />
          {/* ✅ ቀላል የጨለማ ንብርብር (30% ብቻ) - ጽሑፎቹ እንዲነበቡ */}
          <div className="absolute inset-0 bg-black/30"></div>
        </div>

        {/* የላይኛው ክፍል (ሎጎ + ወደ መነሻ ሊንክ) */}
        <div className="relative z-10 flex items-center justify-between">
          <div className="flex items-center gap-3 text-white">
            <div className="h-10 w-10 rounded-md overflow-hidden bg-white/10 backdrop-blur-sm flex items-center justify-center border border-white/20">
              <Image 
                src="/assets/icons/logo.jpg" 
                alt="Injibara University Logo" 
                width={40}
                height={40}
                className="object-contain"
              />
            </div>
            <p className="font-bold text-lg leading-tight drop-shadow-md">Injibara University</p>
          </div>
          
          <Link href="/" className="text-white hover:text-slate-200 transition-colors flex items-center gap-1 text-sm font-medium drop-shadow-md">
            <ArrowLeft className="h-4 w-4" /> Home
          </Link>
        </div>

        {/* የመሃል ክፍል (ጽሑፍ በምስሉ ላይ) */}
        <div className="relative z-10 max-w-md my-auto">
          <h2 className="text-3xl font-bold text-white mb-4 drop-shadow-lg">Your next chapter starts here.</h2>
          <p className="text-slate-100 text-base leading-relaxed drop-shadow-md">
            A connected home for your academic journey. Learn, plan and move forward with Injibara University.
          </p>
        </div>

        {/* የታችኛው ክፍል */}
        <div className="relative z-10 text-sm text-slate-200 drop-shadow-md">
          Registration & Enrollment System
        </div>
      </div>

      {/* የቀኝ በኩል ዲዛይን (ፎርሙ) */}
      <div className="flex-1 flex flex-col justify-center items-center p-8 sm:p-12 lg:p-16 bg-slate-50 relative">
        
        <div className="absolute top-8 right-8 lg:hidden">
          <Link href="/" className="text-slate-500 hover:text-[#0f2340] transition-colors flex items-center gap-1 text-sm font-medium">
            <ArrowLeft className="h-4 w-4" /> Back to Home
          </Link>
        </div>

        <div className="w-full max-w-md space-y-8">
          <div className="text-center lg:text-left">
            <h2 className="text-3xl font-bold text-[#0f2340] mb-2">Welcome back</h2>
            <p className="text-slate-500 text-sm">Log in to manage your registration and enrollment.</p>
          </div>

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
            <div className="space-y-2">
              <Label className="text-sm font-semibold text-slate-700">Email address</Label>
              <Input 
                type="email" 
                placeholder="you@injibara.edu.et" 
                className="h-11 bg-white border-slate-300 focus-visible:ring-[#0f2340]" 
                {...register('email')} 
              />
              {errors.email && <p className="text-xs text-red-500">{errors.email.message}</p>}
            </div>

            <div className="space-y-2">
              <Label className="text-sm font-semibold text-slate-700">Password</Label>
              <Input 
                type="password" 
                placeholder="Enter your password" 
                className="h-11 bg-white border-slate-300 focus-visible:ring-[#0f2340]" 
                {...register('password')} 
              />
              {errors.password && <p className="text-xs text-red-500">{errors.password.message}</p>}
            </div>

            {serverError && (
              <div className="p-3 bg-red-50 border border-red-200 text-red-600 text-sm rounded-lg">{serverError}</div>
            )}

            <Button type="submit" disabled={loading} className="w-full h-12 bg-[#0f2340] hover:bg-[#1a3459] text-white font-medium text-base rounded-md">
              {loading ? 'Logging in...' : 'Log in'}
            </Button>
          </form>

          <p className="text-center text-sm text-slate-600">
            New student?{' '}
            <Link href="/register" className="font-bold text-[#0f2340] hover:underline">
              Create an account
            </Link>
          </p>

          <div className="text-center">
            <Link href="/" className="text-xs text-slate-400 hover:text-slate-600 hover:underline">
              Back to Home
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}