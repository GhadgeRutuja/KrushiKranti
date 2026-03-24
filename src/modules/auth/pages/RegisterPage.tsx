import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Link, useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import { useAppDispatch, useAppSelector } from '../../../shared/hooks';
import { register as registerUser, createAdmin, clearError } from '../authSlice';
import { Eye, EyeOff, UserPlus, ShieldCheck, Loader2 } from 'lucide-react';
import type { Role } from '../types';
import { GoogleLoginButton } from '../components/GoogleLoginButton';
import { useTranslation } from 'react-i18next';

const registerSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters'),
  email: z.string().email('Please enter a valid email'),
  password: z.string()
    .min(8, 'Password must be at least 8 characters')
    .regex(/[a-z]/, 'Password must contain at least one lowercase letter')
    .regex(/[A-Z]/, 'Password must contain at least one uppercase letter')
    .regex(/\d/, 'Password must contain at least one digit'),
  confirmPassword: z.string(),
  role: z.enum(['farmer', 'wholesaler', 'user', 'admin'] as const),
  phone: z.string().optional(),
}).refine((data) => data.password === data.confirmPassword, {
  message: "Passwords don't match",
  path: ['confirmPassword'],
});

type RegisterFormData = z.infer<typeof registerSchema>;

export function RegisterPage() {
  const { t } = useTranslation();
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const { registerLoading, adminCreateLoading, adminCreateError, error } = useAppSelector((state) => state.auth);
  const isLoading = registerLoading || adminCreateLoading;

  const roleOptions: { value: Role; label: string; description: string }[] = [
    { value: 'user', label: t('auth.role_consumer', 'Consumer'), description: t('auth.role_consumer_desc', 'Buy products retail') },
    { value: 'farmer', label: t('auth.role_farmer', 'Farmer'), description: t('auth.role_farmer_desc', 'Sell your produce') },
    { value: 'wholesaler', label: t('auth.role_wholesaler', 'Wholesaler'), description: t('auth.role_wholesaler_desc', 'Buy in bulk') },
    // { value: 'admin', label: 'Administrator', description: 'Full platform management access' },
  ];

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm<RegisterFormData>({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      role: 'user',
    },
  });

  const selectedRole = watch('role');

  const onSubmit = async (data: RegisterFormData) => {
    dispatch(clearError());
    const { confirmPassword: _, ...payload } = data;

    if (payload.role === 'admin') {
      const result = await dispatch(createAdmin({ name: payload.name, email: payload.email, password: payload.password }));
      if (createAdmin.fulfilled.match(result)) {
        toast.success('Admin account created! Please sign in.');
        navigate('/admin/login');
      } else {
        toast.error((result.payload as string) || 'Unable to create admin account. Please try again.');
      }
      return;
    }

    const result = await dispatch(registerUser(payload));
    if (registerUser.fulfilled.match(result)) {
      toast.success(t('auth.otp_sent', 'OTP has been sent to your email!'));
      navigate('/verify-otp');
    } else {
      toast.error((result.payload as string) || 'Unable to create your account. Please try again.');
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50 dark:bg-gray-950 px-4 py-12">
      <div className="w-full max-w-md">
        <div className="p-8 bg-white dark:bg-gray-900 border border-slate-200 dark:border-slate-800 rounded-lg">
          <div className="text-center mb-10">
            <h1 className="text-2xl font-black text-primary-600">
              Krushi<span className="text-accent-500">Kranti</span>
            </h1>
            <p className="text-slate-500 dark:text-slate-400 mt-2 text-sm font-bold uppercase tracking-widest">
              {t('auth.create_account')}
            </p>
          </div>

          {selectedRole === 'admin' && (
            <div className="mb-6 p-3 bg-amber-50 dark:bg-amber-900/10 border border-amber-200 dark:border-amber-800 rounded flex items-start gap-2">
              <ShieldCheck size={14} className="text-amber-600 mt-0.5 shrink-0" />
              <p className="text-[10px] font-bold text-amber-700 dark:text-amber-400 uppercase tracking-widest">
                Admin accounts have full platform access. No email verification required.
              </p>
            </div>
          )}

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
            <div>
              <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1.5">
                {t('common.profile')}
              </label>
              <input
                type="text"
                {...register('name')}
                className="input-field"
                placeholder="Full Name"
              />
              {errors.name && (
                <p className="mt-1 text-[10px] font-bold text-red-500 uppercase">{errors.name.message}</p>
              )}
            </div>

            <div>
              <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1.5">
                {t('auth.email')}
              </label>
              <input
                type="email"
                {...register('email')}
                className="input-field"
                placeholder="you@email.com"
              />
              {errors.email && (
                <p className="mt-1 text-[10px] font-bold text-red-500 uppercase">{errors.email.message}</p>
              )}
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="col-span-2">
                <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1.5">
                  {t('auth.role')}
                </label>
                <select {...register('role')} className="input-field">
                  {roleOptions.map((option) => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div>
              <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1.5">
                {t('auth.password')}
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
            </div>

            <div>
              <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1.5">
                {t('auth.confirm_password')}
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

            {(error || adminCreateError) && (
              <div className="p-3 bg-red-50 dark:bg-red-900/10 border border-red-200 dark:border-red-800 rounded">
                <p className="text-[10px] font-bold text-red-600 uppercase">{error || adminCreateError}</p>
              </div>
            )}

            <button
              type="submit"
              disabled={isLoading}
              className="w-full btn-primary flex items-center justify-center gap-2 py-2.5 text-xs tracking-widest uppercase"
            >
              {isLoading ? (
                <Loader2 className="animate-spin" size={16} />
              ) : selectedRole === 'admin' ? (
                <>
                  <ShieldCheck size={16} />
                  Create Admin Account
                </>
              ) : (
                <>
                  <UserPlus size={16} />
                  {t('auth.create_account')}
                </>
              )}
            </button>
          </form>

          <div className="my-8 flex items-center gap-3">
            <div className="flex-1 h-px bg-slate-100 dark:bg-slate-800"></div>
            <span className="text-[10px] text-slate-400 uppercase tracking-widest font-extrabold">{t('auth.or')}</span>
            <div className="flex-1 h-px bg-slate-100 dark:bg-slate-800"></div>
          </div>

          <GoogleLoginButton />

          <div className="mt-10 text-center">
            <p className="text-xs text-slate-500 dark:text-slate-400">
              {t('auth.already_have_account')}{' '}
              <Link
                to="/login"
                className="text-primary-600 font-extrabold uppercase tracking-tighter"
              >
                {t('auth.login_here')}
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
