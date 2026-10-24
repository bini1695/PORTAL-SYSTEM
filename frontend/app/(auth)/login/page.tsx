'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useAuth } from '@/lib/auth-context';
import { loginSchema, type LoginInput } from '@/lib/validations/student';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { GraduationCap, ArrowLeft } from 'lucide-react'; // ✅ ArrowLeft ተጨምሯል

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
      {/* የግራ በኩል ዲዛይን */}
      <div className="hidden lg:flex w-[45%] bg-[#0f2340] relative flex-col justify-between p-12 overflow-hidden">
        <div className="relative z-10 flex items-center justify-between">
          <div className="flex items-center gap-3 text-white">
            <div className="h-10 w-10 rounded-full bg-[#1a3459] flex items-center justify-center border-2 border-amber-400">
              <GraduationCap className="h-5 w-5 text-amber-400" />
            </div>
            <p className="font-bold text-lg leading-tight">Injibara University</p>
          </div>
          
          {/* ✅ ወደ መነሻ ገጽ መመለሻ ሊንክ (በግራ በኩል) */}
          <Link href="/" className="text-slate-400 hover:text-white transition-colors flex items-center gap-1 text-sm">
            <ArrowLeft className="h-4 w-4" /> Home
          </Link>
        </div>
        <div className="relative z-10 text-sm text-slate-400">Registration & Enrollment System</div>
      </div>

      {/* የቀኝ በኩል ዲዛይን */}
      <div className="flex-1 flex flex-col justify-center items-center p-8 sm:p-12 lg:p-16 bg-slate-50 relative">
        
        {/* ✅ ወደ መነሻ ገጽ መመለሻ ሊንክ (በቀኝ በኩል ከላይ) */}
        <div className="absolute top-8 right-8 lg:hidden">
          <Link href="/" className="text-slate-500 hover:text-[#0f2340] transition-colors flex items-center gap-1 text-sm font-medium">
            <ArrowLeft className="h-4 w-4" /> Back to Home
          </Link>
        </div>

        <div className="w-full max-w-md space-y-8">
          <div className="text-center lg:text-left">
            <h2 className="text-3xl font-bold text-[#0f2340] mb-2">Welcome back</h2>
            <p className="text-slate-500 text-sm">Log in to manage your registration.</p>
          </div>

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
            <div className="space-y-2">
              <Label className="text-sm font-semibold text-slate-700">Student ID or email</Label>
              <Input 
                type="email" 
                placeholder="you@injibara.edu.et" 
                className="h-11 bg-white border-slate-300" 
                {...register('email')} 
              />
              {errors.email && <p className="text-xs text-red-500">{errors.email.message}</p>}
            </div>

            <div className="space-y-2">
              <Label className="text-sm font-semibold text-slate-700">Password</Label>
              <Input 
                type="password" 
                placeholder="Enter your password" 
                className="h-11 bg-white border-slate-300" 
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

          {/* ✅ ወደ መነሻ ገጽ መመለሻ ሊንክ (ከታች) */}
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