import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Link, useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import { useAppDispatch, useAppSelector } from '../../../shared/hooks';
import { login, clearError } from '../authSlice';
import { Eye, EyeOff, ShieldCheck, Loader2 } from 'lucide-react';

const loginSchema = z.object({
  email: z.string().email('Please enter a valid email'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
});

type LoginFormData = z.infer<typeof loginSchema>;

export function AdminLoginPage() {
  const [showPassword, setShowPassword] = useState(false);
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const { isLoading, error } = useAppSelector((state) => state.auth);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
  });

  const onSubmit = async (data: LoginFormData) => {
    dispatch(clearError());
    const result = await dispatch(login(data));
    if (login.fulfilled.match(result)) {
      const user = result.payload.user;
      if (user.role !== 'admin') {
        toast.error('Access denied. This portal is for administrators only.');
        return;
      }
      toast.success(`Welcome back, ${user.name}!`);
      navigate('/admin/dashboard');
    } else {
      toast.error((result.payload as string) || 'Unable to login. Please verify your credentials.');
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50 dark:bg-gray-950 px-4">
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
              Admin Portal
            </p>
          </div>

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
            <div>
              <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1.5">
                Admin Email
              </label>
              <input
                type="email"
                {...register('email')}
                className="input-field"
                placeholder="admin@krushikranti.com"
              />
              {errors.email && (
                <p className="mt-1 text-[10px] font-bold text-red-500 uppercase">
                  {errors.email.message}
                </p>
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
                <p className="mt-1 text-[10px] font-bold text-red-500 uppercase">
                  {errors.password.message}
                </p>
              )}
              <div className="mt-2 text-right">
                <Link
                  to="/forgot-password"
                  className="text-[10px] font-bold text-primary-600 uppercase tracking-widest hover:underline"
                >
                  Forgot Password?
                </Link>
              </div>
            </div>

            {error && (
              <div className="p-3 bg-red-50 dark:bg-red-900/10 border border-red-200 dark:border-red-800 rounded">
                <p className="text-[10px] font-bold text-red-600 uppercase">
                  {error}
                </p>
              </div>
            )}

            <button
              type="submit"
              disabled={isLoading}
              className="w-full btn-primary flex items-center justify-center gap-2 py-2.5 text-xs tracking-widest uppercase"
            >
              {isLoading ? (
                <Loader2 className="animate-spin" size={16} />
              ) : (
                <>
                  <ShieldCheck size={16} />
                  Sign In as Admin
                </>
              )}
            </button>
          </form>

          <div className="mt-8 text-center space-y-3">
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Need to create an admin account?{' '}
              <Link
                to="/admin/register"
                className="text-primary-600 font-bold uppercase tracking-tighter"
              >
                Register Here
              </Link>
            </p>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Not an admin?{' '}
              <Link
                to="/login"
                className="text-primary-600 font-bold uppercase tracking-tighter"
              >
                Regular Login
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
