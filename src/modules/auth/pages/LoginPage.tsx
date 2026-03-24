import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Link, useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import { useAppDispatch, useAppSelector } from "../../../shared/hooks";
import { login, clearError } from "../authSlice";
import { Eye, EyeOff, LogIn, Loader2 } from "lucide-react";
import { GoogleLoginButton } from "../components/GoogleLoginButton";
import { useTranslation } from "react-i18next";

const loginSchema = z.object({
  email: z.string().email("Please enter a valid email"),
  password: z.string().min(6, "Password must be at least 6 characters"),
});

type LoginFormData = z.infer<typeof loginSchema>;

export function LoginPage() {
  const { t } = useTranslation();
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
      toast.success(t("common.welcome") + `, ${user.name}!`);

      // Redirect based on role
      switch (user.role) {
        case "admin":
          navigate("/admin/dashboard");
          break;
        case "farmer":
          navigate("/farmer/dashboard");
          break;
        case "wholesaler":
          navigate("/wholesaler/dashboard");
          break;
        case "delivery":
          navigate("/delivery/dashboard");
          break;
        default:
          navigate("/dashboard");
          break;
      }
    } else {
      toast.error((result.payload as string) || 'Unable to login. Please try again.');
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
              {t("auth.sign_in")}
            </p>
          </div>

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
            <div>
              <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1.5">
                {t("auth.email")}
              </label>
              <input
                type="email"
                {...register("email")}
                className="input-field"
                placeholder="farmer@example.com"
              />
              {errors.email && (
                <p className="mt-1 text-[10px] font-bold text-red-500 uppercase">
                  {errors.email.message}
                </p>
              )}
            </div>

            <div>
              <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1.5">
                {t("auth.password")}
              </label>
              <div className="relative">
                <input
                  type={showPassword ? "text" : "password"}
                  {...register("password")}
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
                  {t("auth.forgot_password", "Forgot Password?")}
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
              className="w-full btn-primary flex items-center justify-center gap-2 py-2.5 text-xs tracking-widest"
            >
              {isLoading ? (
                <Loader2 className="animate-spin" size={16} />
              ) : (
                <>
                  <LogIn size={16} />
                  {t("common.login")}
                </>
              )}
            </button>
          </form>

          <div className="mt-6 flex items-center gap-3">
            <div className="flex-1 h-px bg-slate-100 dark:bg-slate-800"></div>
            <span className="text-[10px] text-slate-400 uppercase tracking-widest font-bold">
              {t("auth.or")}
            </span>
            <div className="flex-1 h-px bg-slate-100 dark:bg-slate-800"></div>
          </div>

          <div className="mt-6">
            <GoogleLoginButton />
          </div>

          <div className="mt-8 text-center">
            <p className="text-xs text-slate-500 dark:text-slate-400">
              {t("auth.dont_have_account")}{" "}
              <Link
                to="/register"
                className="text-primary-600 font-bold uppercase tracking-tighter"
              >
                {t("auth.register_here")}
              </Link>
            </p>
          </div>

          <div className="mt-4 text-center">
            <Link
              to="/admin/login"
              className="text-[10px] font-bold text-slate-400 uppercase tracking-widest hover:text-primary-600 transition-colors"
            >
              Admin Portal →
            </Link>
          </div>

        </div>
      </div>
    </div>
  );
}
