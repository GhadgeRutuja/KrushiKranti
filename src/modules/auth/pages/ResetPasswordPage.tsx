import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import { useAppDispatch, useAppSelector } from '../../../shared/hooks';
import { resetPassword, clearResetError, resetPasswordState } from '../authSlice';
import { Eye, EyeOff, KeyRound, Loader2, CheckCircle } from 'lucide-react';
import { useTranslation } from 'react-i18next';

const resetPasswordSchema = z.object({
  newPassword: z
    .string()
    .min(8, 'Password must be at least 8 characters')
    .regex(/[A-Z]/, 'Password must contain at least one uppercase letter')
    .regex(/[a-z]/, 'Password must contain at least one lowercase letter')
    .regex(/[0-9]/, 'Password must contain at least one digit'),
  confirmPassword: z.string(),
}).refine((data) => data.newPassword === data.confirmPassword, {
  message: "Passwords don't match",
  path: ['confirmPassword'],
});

type ResetPasswordFormData = z.infer<typeof resetPasswordSchema>;

export function ResetPasswordPage() {
  const { t } = useTranslation();
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const { resetLoading, resetError, resetEmail, resetToken, resetSuccess } = useAppSelector((state) => state.auth);
  
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<ResetPasswordFormData>({
    resolver: zodResolver(resetPasswordSchema),
  });

  // Redirect if no reset token (user navigated directly)
  useEffect(() => {
    if (!resetEmail || !resetToken) {
      navigate('/forgot-password');
    }
  }, [resetEmail, resetToken, navigate]);

  const onSubmit = async (data: ResetPasswordFormData) => {
    if (!resetEmail || !resetToken) {
      toast.error('Reset session expired. Please start over.');
      navigate('/forgot-password');
      return;
    }

    dispatch(clearResetError());
    const result = await dispatch(resetPassword({
      email: resetEmail,
      resetToken: resetToken,
      newPassword: data.newPassword,
    }));

    if (resetPassword.fulfilled.match(result)) {
      toast.success('Password reset successful!');
    } else {
      toast.error(result.payload as string);
    }
  };

  const handleGoToLogin = () => {
    dispatch(resetPasswordState());
    navigate('/login');
  };

  // Show success screen
  if (resetSuccess) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50 dark:bg-gray-950 px-4">
        <div className="w-full max-w-md">
          <div className="p-8 bg-white dark:bg-gray-900 border border-slate-200 dark:border-slate-800 rounded-lg shadow-none text-center">
            <div className="w-16 h-16 mx-auto mb-6 bg-green-100 dark:bg-green-900/20 rounded-full flex items-center justify-center">
              <CheckCircle className="w-8 h-8 text-green-600 dark:text-green-400" />
            </div>
            
            <h2 className="text-xl font-bold text-slate-900 dark:text-white mb-2">
              {t('auth.password_reset_success', 'Password Reset Successful!')}
            </h2>
            
            <p className="text-sm text-slate-500 dark:text-slate-400 mb-6">
              {t('auth.password_reset_success_message', 'Your password has been reset successfully. You can now login with your new password.')}
            </p>
            
            <button
              onClick={handleGoToLogin}
              className="w-full btn-primary py-2.5 text-xs tracking-widest"
            >
              {t('auth.go_to_login', 'GO TO LOGIN')}
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50 dark:bg-gray-950 px-4">
      <div className="w-full max-w-md">
        <div className="p-8 bg-white dark:bg-gray-900 border border-slate-200 dark:border-slate-800 rounded-lg shadow-none">
          <div className="text-center mb-8">
            <h1 className="text-2xl font-black text-primary-600">
              Krushi<span className="text-accent-500">Kranti</span>
            </h1>
            <p className="text-slate-500 dark:text-slate-400 mt-2 text-sm font-bold uppercase tracking-widest">
              {t('auth.reset_password', 'Reset Password')}
            </p>
          </div>

          <p className="text-center text-sm text-slate-500 dark:text-slate-400 mb-6">
            {t('auth.enter_new_password', 'Enter your new password below.')}
          </p>

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
            <div>
              <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1.5">
                {t('auth.new_password', 'New Password')}
              </label>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  {...register('newPassword')}
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
              {errors.newPassword && (
                <p className="mt-1 text-[10px] font-bold text-red-500 uppercase">{errors.newPassword.message}</p>
              )}
            </div>

            <div>
              <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1.5">
                {t('auth.confirm_password', 'Confirm Password')}
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

            <div className="p-3 bg-slate-50 dark:bg-gray-800 rounded border border-slate-100 dark:border-slate-700">
              <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">
                {t('auth.password_requirements', 'Password must contain:')}
              </p>
              <ul className="mt-2 space-y-1 text-[9px] text-slate-500 dark:text-slate-400">
                <li>• At least 8 characters</li>
                <li>• One uppercase letter (A-Z)</li>
                <li>• One lowercase letter (a-z)</li>
                <li>• One digit (0-9)</li>
              </ul>
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
                  <KeyRound size={16} />
                  {t('auth.reset_password_btn', 'RESET PASSWORD')}
                </>
              )}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
