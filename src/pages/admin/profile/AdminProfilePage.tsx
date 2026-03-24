import { useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
import {
    FiEye,
    FiEyeOff,
    FiImage,
    FiLock,
    FiMail,
    FiShield,
    FiUser,
} from "react-icons/fi";
import { useAppDispatch, useAppSelector } from "../../../shared/hooks";
import {
    resetAdminPasswordUpdateState,
    updateAdminPassword,
} from "../../../modules/auth/authSlice";

interface FormInputProps {
    id: string;
    label: string;
    type?: string;
    value: string;
    placeholder?: string;
    icon: React.ComponentType<{ className?: string }>;
    onChange: (value: string) => void;
    error?: string;
    readOnly?: boolean;
}

function FormInput({
    id,
    label,
    type = "text",
    value,
    placeholder,
    icon: Icon,
    onChange,
    error,
    readOnly = false,
}: FormInputProps) {
    return (
        <div>
            <label
                htmlFor={id}
                className="mb-1.5 block text-sm font-medium text-slate-700 dark:text-slate-200"
            >
                {label}
            </label>
            <div
                className={`flex items-center gap-2 rounded-lg border bg-white px-3 py-2 shadow-sm dark:bg-slate-900 ${error
                    ? "border-red-300 dark:border-red-500"
                    : "border-slate-200 dark:border-slate-700"
                    }`}
            >
                <Icon className="text-slate-400" />
                <input
                    id={id}
                    type={type}
                    value={value}
                    placeholder={placeholder}
                    onChange={(e) => onChange(e.target.value)}
                    readOnly={readOnly}
                    className="w-full bg-transparent text-sm text-slate-800 outline-none placeholder:text-slate-400 dark:text-slate-100"
                />
            </div>
            {error && <p className="mt-1 text-xs text-red-600 dark:text-red-400">{error}</p>}
        </div>
    );
}

interface PasswordInputProps {
    id: string;
    label: string;
    value: string;
    onChange: (value: string) => void;
    error?: string;
}

function PasswordInput({ id, label, value, onChange, error }: PasswordInputProps) {
    const { t } = useTranslation();
    const [visible, setVisible] = useState(false);

    return (
        <div>
            <label
                htmlFor={id}
                className="mb-1.5 block text-sm font-medium text-slate-700 dark:text-slate-200"
            >
                {label}
            </label>
            <div
                className={`flex items-center gap-2 rounded-lg border bg-white px-3 py-2 shadow-sm dark:bg-slate-900 ${error
                    ? "border-red-300 dark:border-red-500"
                    : "border-slate-200 dark:border-slate-700"
                    }`}
            >
                <FiLock className="text-slate-400" />
                <input
                    id={id}
                    type={visible ? "text" : "password"}
                    value={value}
                    onChange={(e) => onChange(e.target.value)}
                    className="w-full bg-transparent text-sm text-slate-800 outline-none placeholder:text-slate-400 dark:text-slate-100"
                />
                <button
                    type="button"
                    onClick={() => setVisible((prev) => !prev)}
                    className="text-slate-500 hover:text-slate-700 dark:hover:text-slate-300"
                    aria-label={visible ? t("admin_profile.hide_password") : t("admin_profile.show_password")}
                >
                    {visible ? <FiEyeOff /> : <FiEye />}
                </button>
            </div>
            {error && <p className="mt-1 text-xs text-red-600 dark:text-red-400">{error}</p>}
        </div>
    );
}

function getInitials(name: string): string {
    const initials = name
        .split(" ")
        .filter(Boolean)
        .map((part) => part[0])
        .join("")
        .slice(0, 2)
        .toUpperCase();

    return initials || "AD";
}

export function AdminProfilePage() {
    const { t } = useTranslation();
    const dispatch = useAppDispatch();
    const { user, adminPasswordUpdateLoading, adminPasswordUpdateSuccess, adminPasswordUpdateError } =
        useAppSelector((state) => state.auth);

    const [currentPassword, setCurrentPassword] = useState("");
    const [newPassword, setNewPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");
    const [avatarFileName, setAvatarFileName] = useState("");
    const [avatarPreview, setAvatarPreview] = useState<string | null>(null);

    const fieldErrors = useMemo(() => {
        const errors: Record<string, string> = {};

        if (newPassword && newPassword.length < 8) {
            errors.newPassword = t("admin_profile.new_password_min");
        }

        if (confirmPassword && confirmPassword !== newPassword) {
            errors.confirmPassword = t("admin_profile.password_mismatch");
        }

        return errors;
    }, [newPassword, confirmPassword, t]);

    const clearForm = () => {
        setCurrentPassword("");
        setNewPassword("");
        setConfirmPassword("");
        dispatch(resetAdminPasswordUpdateState());
    };

    const handlePasswordSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
        event.preventDefault();

        if (!currentPassword) {
            return;
        }

        if (newPassword.length < 8 || confirmPassword !== newPassword) {
            return;
        }

        await dispatch(
            updateAdminPassword({
                currentPassword,
                newPassword,
            }),
        );
    };

    const handleAvatarChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (!file) return;

        setAvatarFileName(file.name);

        const reader = new FileReader();
        reader.onload = () => {
            setAvatarPreview(typeof reader.result === "string" ? reader.result : null);
        };
        reader.readAsDataURL(file);
    };

    const adminName = user?.name || t("admin_profile.default_admin_name");
    const adminEmail = user?.email || "admin@krushikranti.com";
    const adminRole = user?.role || "admin";

    return (
        <div className="min-h-screen bg-soft-bg px-4 py-6 dark:bg-gray-950 md:px-8">
            <div className="w-full space-y-6">
                <header>
                    <h1 className="text-2xl font-semibold text-slate-900 dark:text-slate-100">
                        {t("admin_profile.title")}
                    </h1>
                    <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
                        {t("admin_profile.subtitle")}
                    </p>
                </header>

                <section className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900 md:p-6">
                    <h2 className="mb-4 text-lg font-semibold text-slate-900 dark:text-slate-100">
                        {t("admin_profile.admin_information")}
                    </h2>

                    <div className="grid gap-6 md:grid-cols-[180px_1fr] md:items-center">
                        <div className="flex flex-col items-center gap-3">
                            <div className="relative">
                                <div className="flex h-28 w-28 items-center justify-center overflow-hidden rounded-full border-2 border-yellow-300 bg-green-600 text-2xl font-semibold text-white shadow-md">
                                    {avatarPreview ? (
                                        <img
                                            src={avatarPreview}
                                            alt="Admin avatar"
                                            className="h-full w-full object-cover"
                                        />
                                    ) : (
                                        getInitials(adminName)
                                    )}
                                </div>
                                <label
                                    htmlFor="avatarUpload"
                                    className="absolute -bottom-1 -right-1 flex h-9 w-9 cursor-pointer items-center justify-center rounded-full border border-slate-200 bg-white text-slate-600 shadow-sm hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-300"
                                    title={t("admin_profile.upload_avatar")}
                                >
                                    <FiImage />
                                </label>
                                <input
                                    id="avatarUpload"
                                    type="file"
                                    accept="image/*"
                                    onChange={handleAvatarChange}
                                    className="hidden"
                                />
                            </div>
                            {avatarFileName && (
                                <p className="max-w-40 truncate text-xs text-slate-500 dark:text-slate-400">
                                    {avatarFileName}
                                </p>
                            )}
                        </div>

                        <div className="grid gap-4 sm:grid-cols-2">
                            <FormInput
                                id="adminName"
                                label={t("admin_profile.name")}
                                value={adminName}
                                icon={FiUser}
                                onChange={() => undefined}
                                readOnly
                            />
                            <FormInput
                                id="adminEmail"
                                label={t("admin_profile.email")}
                                value={adminEmail}
                                icon={FiMail}
                                onChange={() => undefined}
                                readOnly
                            />
                            <FormInput
                                id="adminRole"
                                label={t("admin_profile.role")}
                                value={adminRole.toUpperCase()}
                                icon={FiShield}
                                onChange={() => undefined}
                                readOnly
                            />
                        </div>
                    </div>
                </section>

                <section className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900 md:p-6">
                    <h2 className="mb-4 text-lg font-semibold text-slate-900 dark:text-slate-100">
                        {t("admin_profile.change_password")}
                    </h2>

                    <form onSubmit={handlePasswordSubmit} className="space-y-4">
                        <PasswordInput
                            id="currentPassword"
                            label={t("admin_profile.current_password")}
                            value={currentPassword}
                            onChange={setCurrentPassword}
                            error={!currentPassword && adminPasswordUpdateError ? t("admin_profile.current_password_required") : undefined}
                        />

                        <PasswordInput
                            id="newPassword"
                            label={t("admin_profile.new_password")}
                            value={newPassword}
                            onChange={setNewPassword}
                            error={fieldErrors.newPassword}
                        />

                        <PasswordInput
                            id="confirmPassword"
                            label={t("admin_profile.confirm_new_password")}
                            value={confirmPassword}
                            onChange={setConfirmPassword}
                            error={fieldErrors.confirmPassword}
                        />

                        {adminPasswordUpdateError && (
                            <p className="rounded-md border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700 dark:border-red-900/40 dark:bg-red-900/20 dark:text-red-300">
                                {adminPasswordUpdateError}
                            </p>
                        )}

                        {adminPasswordUpdateSuccess && (
                            <p className="rounded-md border border-green-200 bg-green-50 px-3 py-2 text-sm text-green-700 dark:border-green-900/40 dark:bg-green-900/20 dark:text-green-300">
                                {t("admin_profile.password_updated_success")}
                            </p>
                        )}

                        <div className="flex flex-wrap items-center gap-3 pt-2">
                            <button
                                type="button"
                                onClick={clearForm}
                                className="rounded-md border border-slate-300 px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50 dark:border-slate-700 dark:text-slate-200 dark:hover:bg-slate-800"
                            >
                                {t("common.cancel")}
                            </button>
                            <button
                                type="submit"
                                disabled={
                                    adminPasswordUpdateLoading ||
                                    !currentPassword ||
                                    !newPassword ||
                                    !confirmPassword ||
                                    Boolean(fieldErrors.newPassword || fieldErrors.confirmPassword)
                                }
                                className="rounded-md bg-green-600 px-4 py-2 text-sm font-semibold text-white hover:bg-green-700 disabled:cursor-not-allowed disabled:opacity-60"
                            >
                                {adminPasswordUpdateLoading ? t("admin_profile.updating") : t("admin_profile.update_password")}
                            </button>
                        </div>
                    </form>
                </section>
            </div>
        </div>
    );
}
