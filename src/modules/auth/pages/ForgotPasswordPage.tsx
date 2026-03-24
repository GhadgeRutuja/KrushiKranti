import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Link, useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import { useAppDispatch, useAppSelector } from '../../../shared/hooks';
import { forgotPassword, clearResetError } from '../authSlice';
import { Mail, ArrowLeft, Loader2 } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { useEffect } from 'react';

const forgotPasswordSchema = z.object({
  email: z.string().email('Please enter a valid email'),
});

type ForgotPasswordFormData = z.infer<typeof forgotPasswordSchema>;

export function ForgotPasswordPage() {
  const { t } = useTranslation();
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const { resetLoading, resetError, resetEmail } = useAppSelector((state) => state.auth);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<ForgotPasswordFormData>({
    resolver: zodResolver(forgotPasswordSchema),
  });

  // Navigate to verify OTP page when email is set (OTP sent successfully)
  useEffect(() => {
    if (resetEmail) {
      navigate('/verify-reset-otp');
    }
  }, [resetEmail, navigate]);

  const onSubmit = async (data: ForgotPasswordFormData) => {
    dispatch(clearResetError());
    const result = await dispatch(forgotPassword(data.email));
    if (forgotPassword.fulfilled.match(result)) {
      toast.success('OTP sent to your email');
    } else {
      toast.error(result.payload as string);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50 dark:bg-gray-950 px-4">
      <div className="w-full max-w-md">
        <div className="p-8 bg-white dark:bg-gray-900 border border-slate-200 dark:border-slate-800 rounded-lg shadow-none">
          <div className="text-center mb-8">
            <h1 className="text-2xl font-black text-primary-600">
              Krushi<span className="text-accent-500">Kranti</span>
            </h1>
            <p className="text-slate-500 dark:text-slate-400 mt-2 text-sm font-bold uppercase tracking-widest">
              {t('auth.forgot_password', 'Forgot Password')}
            </p>
          </div>

          <p className="text-center text-sm text-slate-500 dark:text-slate-400 mb-6">
            {t('auth.forgot_password_description', 'Enter your email address and we\'ll send you an OTP to reset your password.')}
          </p>

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
            <div>
              <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1.5">
                {t('auth.email', 'Email')}
              </label>
              <input
                type="email"
                {...register('email')}
                className="input-field"
                placeholder="your@email.com"
              />
              {errors.email && (
                <p className="mt-1 text-[10px] font-bold text-red-500 uppercase">{errors.email.message}</p>
              )}
            </div>

            {resetError && (
              <div className="p-3 bg-red-50 dark:bg-red-900/10 border border-red-200 dark:border-red-800 rounded">
                <p className="text-[10px] font-bold text-red-600 uppercase">{resetError}</p>
              </div>
            )}

            <button
              type="submit"
              disabled={resetLoading}
              className="w-full btn-primary flex items-center justify-center gap-2 py-2.5 text-xs tracking-widest"
            >
              {resetLoading ? (
                <Loader2 className="animate-spin" size={16} />
              ) : (
                <>
                  <Mail size={16} />
                  {t('auth.send_otp', 'SEND OTP')}
                </>
              )}
            </button>
          </form>

          <div className="mt-8 text-center">
            <Link
              to="/login"
              className="inline-flex items-center gap-2 text-xs text-slate-500 dark:text-slate-400 hover:text-primary-600"
            >
              <ArrowLeft size={14} />
              {t('auth.back_to_login', 'Back to Login')}
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
