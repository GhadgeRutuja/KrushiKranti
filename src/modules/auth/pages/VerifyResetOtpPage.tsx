import { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import { useAppDispatch, useAppSelector } from '../../../shared/hooks';
import { verifyResetOtp, forgotPassword, clearResetError, resetPasswordState } from '../authSlice';
import { ArrowLeft, Loader2, KeyRound, RefreshCw } from 'lucide-react';
import { useTranslation } from 'react-i18next';

export function VerifyResetOtpPage() {
  const { t } = useTranslation();
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const { resetLoading, resetError, resetEmail, resetOtpVerified } = useAppSelector((state) => state.auth);

  const [otp, setOtp] = useState(['', '', '', '', '', '']);
  const [resendCooldown, setResendCooldown] = useState(0);
  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);

  // Redirect if no email (user navigated directly)
  useEffect(() => {
    if (!resetEmail) {
      navigate('/forgot-password');
    }
  }, [resetEmail, navigate]);

  // Navigate to reset password page when OTP is verified
  useEffect(() => {
    if (resetOtpVerified) {
      navigate('/reset-password');
    }
  }, [resetOtpVerified, navigate]);

  // Resend cooldown timer
  useEffect(() => {
    if (resendCooldown > 0) {
      const timer = setTimeout(() => setResendCooldown(resendCooldown - 1), 1000);
      return () => clearTimeout(timer);
    }
  }, [resendCooldown]);

  const handleChange = (index: number, value: string) => {
    if (!/^\d*$/.test(value)) return; // Only allow digits

    const newOtp = [...otp];
    newOtp[index] = value.slice(-1); // Take only last character
    setOtp(newOtp);

    // Auto-focus next input
    if (value && index < 5) {
      inputRefs.current[index + 1]?.focus();
    }
  };

  const handleKeyDown = (index: number, e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Backspace' && !otp[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
  };

  const handlePaste = (e: React.ClipboardEvent) => {
    e.preventDefault();
    const pastedData = e.clipboardData.getData('text').replace(/\D/g, '').slice(0, 6);
    const newOtp = [...otp];
    for (let i = 0; i < pastedData.length; i++) {
      newOtp[i] = pastedData[i];
    }
    setOtp(newOtp);
    if (pastedData.length > 0) {
      inputRefs.current[Math.min(pastedData.length, 5)]?.focus();
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const otpString = otp.join('');
    
    if (otpString.length !== 6) {
      toast.error('Please enter all 6 digits');
      return;
    }

    if (!resetEmail) {
      toast.error('Email not found. Please start over.');
      navigate('/forgot-password');
      return;
    }

    dispatch(clearResetError());
    const result = await dispatch(verifyResetOtp({ email: resetEmail, otp: otpString }));
    if (verifyResetOtp.fulfilled.match(result)) {
      toast.success('OTP verified successfully');
    } else {
      toast.error(result.payload as string);
    }
  };

  const handleResendOtp = async () => {
    if (resendCooldown > 0 || !resetEmail) return;
    
    const result = await dispatch(forgotPassword(resetEmail));
    if (forgotPassword.fulfilled.match(result)) {
      toast.success('New OTP sent to your email');
      setResendCooldown(60);
      setOtp(['', '', '', '', '', '']);
    } else {
      toast.error(result.payload as string);
    }
  };

  const handleCancel = () => {
    dispatch(resetPasswordState());
    navigate('/forgot-password');
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
              {t('auth.verify_otp', 'Verify OTP')}
            </p>
          </div>

          <p className="text-center text-sm text-slate-500 dark:text-slate-400 mb-2">
            {t('auth.otp_sent_to', 'We sent a 6-digit OTP to')}
          </p>
          <p className="text-center text-sm font-semibold text-slate-700 dark:text-slate-300 mb-6">
            {resetEmail}
          </p>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="flex justify-center gap-2">
              {otp.map((digit, index) => (
                <input
                  key={index}
                  ref={(el) => { inputRefs.current[index] = el; }}
                  type="text"
                  inputMode="numeric"
                  maxLength={1}
                  value={digit}
                  onChange={(e) => handleChange(index, e.target.value)}
                  onKeyDown={(e) => handleKeyDown(index, e)}
                  onPaste={handlePaste}
                  className="w-12 h-14 text-center text-xl font-bold border border-slate-200 dark:border-slate-700 rounded-lg 
                           bg-white dark:bg-gray-800 text-slate-900 dark:text-white
                           focus:border-primary-500 focus:ring-2 focus:ring-primary-500/20 outline-none transition-all"
                />
              ))}
            </div>

            {resetError && (
              <div className="p-3 bg-red-50 dark:bg-red-900/10 border border-red-200 dark:border-red-800 rounded">
                <p className="text-[10px] font-bold text-red-600 uppercase text-center">{resetError}</p>
              </div>
            )}

            <button
              type="submit"
              disabled={resetLoading || otp.join('').length !== 6}
              className="w-full btn-primary flex items-center justify-center gap-2 py-2.5 text-xs tracking-widest disabled:opacity-50"
            >
              {resetLoading ? (
                <Loader2 className="animate-spin" size={16} />
              ) : (
                <>
                  <KeyRound size={16} />
                  {t('auth.verify', 'VERIFY OTP')}
                </>
              )}
            </button>
          </form>

          <div className="mt-6 text-center">
            <button
              onClick={handleResendOtp}
              disabled={resendCooldown > 0 || resetLoading}
              className="inline-flex items-center gap-2 text-xs text-slate-500 dark:text-slate-400 hover:text-primary-600 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <RefreshCw size={14} />
              {resendCooldown > 0 
                ? t('auth.resend_in', `Resend in ${resendCooldown}s`)
                : t('auth.resend_otp', 'Resend OTP')}
            </button>
          </div>

          <div className="mt-8 text-center">
            <button
              onClick={handleCancel}
              className="inline-flex items-center gap-2 text-xs text-slate-500 dark:text-slate-400 hover:text-primary-600"
            >
              <ArrowLeft size={14} />
              {t('auth.back_to_forgot_password', 'Back')}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
