import { useState, useEffect, useRef } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import toast from 'react-hot-toast';
import { useAppDispatch, useAppSelector } from '../../../shared/hooks';
import { verifyOtp, resendOtp, clearOtpError, resetOtpState } from '../authSlice';
import { Mail, ArrowLeft, Loader2, RefreshCw, CheckCircle } from 'lucide-react';
import { useTranslation } from 'react-i18next';

export function VerifyOtpPage() {
  const { t } = useTranslation();
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const { otpLoading, otpVerified, otpError, pendingVerificationEmail } = useAppSelector(
    (state) => state.auth
  );

  const [otp, setOtp] = useState(['', '', '', '', '', '']);
  const [resendCooldown, setResendCooldown] = useState(0);
  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);

  // Redirect if no pending email
  useEffect(() => {
    if (!pendingVerificationEmail) {
      navigate('/register');
    }
  }, [pendingVerificationEmail, navigate]);

  // Handle OTP verified successfully
  useEffect(() => {
    if (otpVerified) {
      toast.success(t('auth.email_verified', 'Email verified successfully!'));
      dispatch(resetOtpState());
      navigate('/login');
    }
  }, [otpVerified, navigate, dispatch, t]);

  // Resend cooldown timer
  useEffect(() => {
    if (resendCooldown > 0) {
      const timer = setTimeout(() => setResendCooldown(resendCooldown - 1), 1000);
      return () => clearTimeout(timer);
    }
  }, [resendCooldown]);

  // Show error toast
  useEffect(() => {
    if (otpError) {
      toast.error(otpError);
    }
  }, [otpError]);

  const handleOtpChange = (index: number, value: string) => {
    // Allow only numeric input
    if (value && !/^\d+$/.test(value)) return;

    const newOtp = [...otp];
    // Handle paste
    if (value.length > 1) {
      const digits = value.slice(0, 6).split('');
      digits.forEach((digit, i) => {
        if (index + i < 6) {
          newOtp[index + i] = digit;
        }
      });
      setOtp(newOtp);
      // Focus last filled input or last input
      const focusIndex = Math.min(index + digits.length, 5);
      inputRefs.current[focusIndex]?.focus();
      return;
    }

    newOtp[index] = value;
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

  const handleVerifyOtp = async () => {
    dispatch(clearOtpError());
    const otpString = otp.join('');
    
    if (otpString.length !== 6) {
      toast.error(t('auth.otp_required', 'Please enter the 6-digit OTP'));
      return;
    }

    if (!pendingVerificationEmail) {
      toast.error(t('auth.session_expired', 'Session expired. Please register again.'));
      navigate('/register');
      return;
    }

    await dispatch(verifyOtp({ email: pendingVerificationEmail, otp: otpString }));
  };

  const handleResendOtp = async () => {
    if (resendCooldown > 0 || !pendingVerificationEmail) return;

    dispatch(clearOtpError());
    const result = await dispatch(resendOtp({ email: pendingVerificationEmail }));
    
    if (resendOtp.fulfilled.match(result)) {
      toast.success(t('auth.otp_resent', 'OTP has been sent again.'));
      setResendCooldown(60); // 60 second cooldown
      setOtp(['', '', '', '', '', '']);
      inputRefs.current[0]?.focus();
    }
  };

  const handleBackToRegister = () => {
    dispatch(resetOtpState());
    navigate('/register');
  };

  const maskedEmail = pendingVerificationEmail
    ? pendingVerificationEmail.replace(/(.{2})(.*)(@.*)/, '$1***$3')
    : '';

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50 dark:bg-gray-950 px-4 py-12">
      <div className="w-full max-w-md">
        <div className="p-8 bg-white dark:bg-gray-900 border border-slate-200 dark:border-slate-800 rounded-lg">
          {/* Header */}
          <div className="text-center mb-8">
            <div className="mx-auto w-16 h-16 bg-primary-100 dark:bg-primary-900/30 rounded-full flex items-center justify-center mb-4">
              <Mail className="w-8 h-8 text-primary-600" />
            </div>
            <h1 className="text-2xl font-black text-slate-900 dark:text-white">
              {t('auth.verify_email', 'Verify Your Email')}
            </h1>
            <p className="text-slate-500 dark:text-slate-400 mt-2 text-sm">
              {t('auth.otp_sent_message', 'Enter the OTP sent to your email.')}
            </p>
            {maskedEmail && (
              <p className="text-primary-600 font-semibold mt-1 text-sm">
                {maskedEmail}
              </p>
            )}
          </div>

          {/* OTP Input */}
          <div className="mb-6">
            <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-3 text-center">
              {t('auth.enter_otp', 'Enter 6-digit OTP')}
            </label>
            <div className="flex justify-center gap-2 sm:gap-3">
              {otp.map((digit, index) => (
                <input
                  key={index}
                  ref={(el) => { inputRefs.current[index] = el; }}
                  type="text"
                  inputMode="numeric"
                  maxLength={6}
                  value={digit}
                  onChange={(e) => handleOtpChange(index, e.target.value)}
                  onKeyDown={(e) => handleKeyDown(index, e)}
                  className="w-10 h-12 sm:w-12 sm:h-14 text-center text-xl font-bold 
                    border border-slate-200 dark:border-slate-700 
                    bg-slate-50 dark:bg-gray-800 
                    rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500
                    text-slate-900 dark:text-white
                    transition-all duration-200"
                  autoFocus={index === 0}
                />
              ))}
            </div>
          </div>

          {/* Error Display */}
          {otpError && (
            <div className="mb-4 p-3 bg-red-50 dark:bg-red-900/10 border border-red-200 dark:border-red-800 rounded">
              <p className="text-[10px] font-bold text-red-600 uppercase text-center">{otpError}</p>
            </div>
          )}

          {/* Verify Button */}
          <button
            onClick={handleVerifyOtp}
            disabled={otpLoading || otp.join('').length !== 6}
            className="w-full btn-primary flex items-center justify-center gap-2 py-3 text-xs tracking-widest uppercase disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {otpLoading ? (
              <Loader2 className="animate-spin" size={18} />
            ) : (
              <>
                <CheckCircle size={18} />
                {t('auth.verify_otp', 'Verify OTP')}
              </>
            )}
          </button>

          {/* Resend OTP */}
          <div className="mt-6 text-center">
            <p className="text-sm text-slate-500 dark:text-slate-400 mb-2">
              {t('auth.didnt_receive_otp', "Didn't receive the OTP?")}
            </p>
            <button
              onClick={handleResendOtp}
              disabled={otpLoading || resendCooldown > 0}
              className="inline-flex items-center gap-2 text-primary-600 hover:text-primary-700 font-semibold text-sm disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              <RefreshCw size={16} className={otpLoading ? 'animate-spin' : ''} />
              {resendCooldown > 0
                ? t('auth.resend_in', `Resend in ${resendCooldown}s`, { seconds: resendCooldown })
                : t('auth.resend_otp', 'Resend OTP')}
            </button>
          </div>

          {/* Back to Register */}
          <div className="mt-8 pt-6 border-t border-slate-100 dark:border-slate-800">
            <button
              onClick={handleBackToRegister}
              className="w-full flex items-center justify-center gap-2 text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-300 text-sm transition-colors"
            >
              <ArrowLeft size={16} />
              {t('auth.back_to_register', 'Back to Register')}
            </button>
          </div>

          {/* Already verified link */}
          <div className="mt-4 text-center">
            <p className="text-xs text-slate-500 dark:text-slate-400">
              {t('auth.already_verified', 'Already verified?')}{' '}
              <Link
                to="/login"
                className="text-primary-600 font-extrabold uppercase tracking-tighter"
              >
                {t('auth.login_here', 'Login here')}
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
