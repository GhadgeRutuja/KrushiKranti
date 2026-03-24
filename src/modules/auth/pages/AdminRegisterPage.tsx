import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Link, useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import { useAppDispatch, useAppSelector } from '../../../shared/hooks';
import { createAdmin, clearError } from '../authSlice';
import { Eye, EyeOff, ShieldCheck, Loader2 } from 'lucide-react';

const adminRegisterSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters').max(100, 'Name too long'),
  email: z.string().email('Please enter a valid email'),
  password: z
    .string()
    .min(8, 'Password must be at least 8 characters')
    .regex(/[a-z]/, 'Must contain at least one lowercase letter')
    .regex(/[A-Z]/, 'Must contain at least one uppercase letter')
    .regex(/\d/, 'Must contain at least one digit'),
  confirmPassword: z.string(),
}).refine((data) => data.password === data.confirmPassword, {
  message: "Passwords don't match",
  path: ['confirmPassword'],
});

type AdminRegisterFormData = z.infer<typeof adminRegisterSchema>;

export function AdminRegisterPage() {
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const { adminCreateLoading, adminCreateError } = useAppSelector((state) => state.auth);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<AdminRegisterFormData>({
    resolver: zodResolver(adminRegisterSchema),
  });

  const onSubmit = async (data: AdminRegisterFormData) => {
    dispatch(clearError());
    const { confirmPassword: _, ...payload } = data;
    const result = await dispatch(createAdmin(payload));
    if (createAdmin.fulfilled.match(result)) {
      toast.success('Admin account created successfully!');
      navigate('/admin/login');
    } else {
      toast.error(result.payload as string);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50 dark:bg-gray-950 px-4 py-12">
      <div className="w-full max-w-md">
        <div className="p-8 bg-white dark:bg-gray-900 border border-slate-200 dark:border-slate-800 rounded-lg shadow-none">
          <div className="text-center mb-8">
            <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-primary-50 dark:bg-primary-900/20 mb-4">
              <ShieldCheck className="text-primary-600" size={24} />
            </div>
            <h1 className="text-2xl font-black text-primary-600">
              Krushi<span className="text-accent-500">Kranti</span>
            </h1>
            <p className="text-slate-500 dark:text-slate-400 mt-2 text-sm font-bold uppercase tracking-widest">
              Create Admin Account
            </p>
          </div>

          <div className="mb-6 p-3 bg-amber-50 dark:bg-amber-900/10 border border-amber-200 dark:border-amber-800 rounded">
            <p className="text-[10px] font-bold text-amber-700 dark:text-amber-400 uppercase tracking-widest text-center">
              Admin accounts have full platform access
            </p>
          </div>

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
            <div>
              <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1.5">
                Full Name
              </label>
              <input
                type="text"
                {...register('name')}
                className="input-field"
                placeholder="Admin Full Name"
              />
              {errors.name && (
                <p className="mt-1 text-[10px] font-bold text-red-500 uppercase">{errors.name.message}</p>
              )}
            </div>

            <div>
              <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1.5">
                Email Address
              </label>
              <input
                type="email"
                {...register('email')}
                className="input-field"
                placeholder="admin@krushikranti.com"
              />
              {errors.email && (
                <p className="mt-1 text-[10px] font-bold text-red-500 uppercase">{errors.email.message}</p>
              )}
            </div>

            <div>
              <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1.5">
                Password
              </label>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  {...register('password')}
                  className="input-field pr-10"
                  placeholder="••••••••"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400"
                >
                  {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
              {errors.password && (
                <p className="mt-1 text-[10px] font-bold text-red-500 uppercase">{errors.password.message}</p>
              )}
              <p className="mt-1 text-[9px] text-slate-400 uppercase tracking-wide">
                Min 8 chars · uppercase · lowercase · digit
              </p>
            </div>

            <div>
              <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1.5">
                Confirm Password
              </label>
              <div className="relative">
                <input
                  type={showConfirmPassword ? 'text' : 'password'}
                  {...register('confirmPassword')}
                  className="input-field pr-10"
                  placeholder="••••••••"
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400"
                >
                  {showConfirmPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
              {errors.confirmPassword && (
                <p className="mt-1 text-[10px] font-bold text-red-500 uppercase">{errors.confirmPassword.message}</p>
              )}
            </div>

            {adminCreateError && (
              <div className="p-3 bg-red-50 dark:bg-red-900/10 border border-red-200 dark:border-red-800 rounded">
                <p className="text-[10px] font-bold text-red-600 uppercase">{adminCreateError}</p>
              </div>
            )}

            <button
              type="submit"
              disabled={adminCreateLoading}
              className="w-full btn-primary flex items-center justify-center gap-2 py-2.5 text-xs tracking-widest uppercase"
            >
              {adminCreateLoading ? (
                <Loader2 className="animate-spin" size={16} />
              ) : (
                <>
                  <ShieldCheck size={16} />
                  Create Admin Account
                </>
              )}
            </button>
          </form>

          <div className="mt-8 text-center">
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Already have an admin account?{' '}
              <Link
                to="/admin/login"
                className="text-primary-600 font-bold uppercase tracking-tighter"
              >
                Admin Login
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
