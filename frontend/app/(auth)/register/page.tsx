'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useAuth } from '@/lib/auth-context';
import { registerSchema, type RegisterInput } from '@/lib/validations/student';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { GraduationCap, CheckCircle2, User, Shield, Briefcase } from 'lucide-react';

const roles = [
  { id: 'STUDENT', title: 'Student', desc: 'Enroll and manage your studies', icon: GraduationCap },
  { id: 'FACULTY', title: 'Faculty', desc: 'Teach and support students', icon: User },
  { id: 'ADMIN', title: 'Admin', desc: 'Manage academic operations', icon: Shield },
  { id: 'BURSAR', title: 'Bursar', desc: 'Manage fees and payments', icon: Briefcase },
];

export default function RegisterPage() {
  const router = useRouter();
  const { register: registerUser } = useAuth();
  const [serverError, setServerError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [selectedRole, setSelectedRole] = useState('STUDENT');

  const { register, handleSubmit, formState: { errors } } = useForm<RegisterInput>({ resolver: zodResolver(registerSchema) });

  const onSubmit = async (data: RegisterInput) => {
    setServerError(null);
    setLoading(true);
    try {
      // ✅ ተጠቃሚውን መመዝገብ
      await registerUser({ ...data, role: selectedRole });
      
      // ✅ ከምዝገባ በኋላ ወደ ሎጊን ገጽ መላክ
      router.push('/login');
    } catch (err) {
      setServerError((err as Error).message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen bg-white">
      {/* የግራ በኩል ዲዛይን (እንዳለ ይቆይ) */}
      <div className="hidden lg:flex w-[45%] bg-[#0f2340] relative flex-col justify-between p-12 overflow-hidden">
        <div className="relative z-10 flex items-center gap-3 text-white">
          <div className="h-10 w-10 rounded-full bg-[#1a3459] flex items-center justify-center border-2 border-amber-400">
            <GraduationCap className="h-5 w-5 text-amber-400" />
          </div>
          <p className="font-bold text-lg leading-tight">Injibara University</p>
        </div>
        <div className="relative z-10 text-sm text-slate-400">Registration & Enrollment System</div>
      </div>

      {/* የቀኝ በኩል ፎርም */}
      <div className="flex-1 flex flex-col justify-center items-center p-8 sm:p-12 lg:p-16 bg-slate-50">
        <div className="w-full max-w-lg space-y-6">
          <div>
            <h2 className="text-3xl font-bold text-[#0f2340] mb-2">Create your account</h2>
            <p className="text-slate-500 text-sm">Choose your role, then complete your details.</p>
          </div>

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
            
            {/* ✅ የሮል ምርጫ ክፍል */}
            <div>
              <Label className="text-sm font-semibold text-slate-700 mb-3 block">I am registering as a...</Label>
              <div className="grid grid-cols-2 gap-3">
                {roles.map((role) => {
                  const Icon = role.icon;
                  const isSelected = selectedRole === role.id;
                  return (
                    <div
                      key={role.id}
                      onClick={() => setSelectedRole(role.id)}
                      className={`relative cursor-pointer p-3 rounded-xl border-2 transition-all flex flex-col gap-1 ${
                        isSelected
                          ? 'border-[#0f2340] bg-[#0f2340]/5'
                          : 'border-slate-200 hover:border-slate-300 bg-white'
                      }`}
                    >
                      <Icon className={`h-5 w-5 ${isSelected ? 'text-[#0f2340]' : 'text-slate-400'}`} />
                      <p className={`font-semibold text-sm ${isSelected ? 'text-[#0f2340]' : 'text-slate-700'}`}>{role.title}</p>
                      <p className="text-[10px] text-slate-500 leading-tight">{role.desc}</p>
                      {isSelected && (
                        <div className="absolute top-3 right-3 h-4 w-4 bg-[#0f2340] rounded-full flex items-center justify-center">
                          <CheckCircle2 className="h-3 w-3 text-white" />
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <Label className="text-xs font-semibold text-slate-700">First name</Label>
                <Input className="h-10 bg-white border-slate-300" {...register('firstName')} />
                {errors.firstName && <p className="text-xs text-red-500">{errors.firstName.message}</p>}
              </div>
              <div className="space-y-1.5">
                <Label className="text-xs font-semibold text-slate-700">Last name</Label>
                <Input className="h-10 bg-white border-slate-300" {...register('lastName')} />
                {errors.lastName && <p className="text-xs text-red-500">{errors.lastName.message}</p>}
              </div>
            </div>

            <div className="space-y-1.5">
              <Label className="text-xs font-semibold text-slate-700">Email</Label>
              <Input type="email" className="h-10 bg-white border-slate-300" {...register('email')} />
              {errors.email && <p className="text-xs text-red-500">{errors.email.message}</p>}
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <Label className="text-xs font-semibold text-slate-700">Password</Label>
                <Input type="password" className="h-10 bg-white border-slate-300" {...register('password')} />
                {errors.password && <p className="text-xs text-red-500">{errors.password.message}</p>}
              </div>
              <div className="space-y-1.5">
                <Label className="text-xs font-semibold text-slate-700">Confirm password</Label>
                <Input type="password" className="h-10 bg-white border-slate-300" />
              </div>
            </div>

            {serverError && (
              <div className="p-3 bg-red-50 border border-red-200 text-red-600 text-sm rounded-lg">{serverError}</div>
            )}

            <Button type="submit" disabled={loading} className="w-full h-12 bg-[#0f2340] hover:bg-[#1a3459] text-white font-medium text-base rounded-md mt-2">
              {loading ? 'Creating account...' : 'Create account'}
            </Button>
          </form>

          <p className="text-center text-sm text-slate-600">
            Already registered?{' '}
            <Link href="/login" className="font-bold text-[#0f2340] hover:underline">
              Log in
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}