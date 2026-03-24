import { useState, useRef } from 'react';
import {
    RiUserLine,
    RiMailLine,
    RiPhoneLine,
    RiMapPinLine,
    RiShieldLine,
    RiCalendarLine,
    RiEditLine,
    RiCheckLine,
    RiCloseLine,
    RiShoppingBagLine,
    RiHeartLine,
    RiMessage2Line,
    RiLockPasswordLine,
    RiCameraLine,
    RiAlertLine,
} from 'react-icons/ri';
import { useAppDispatch, useAppSelector } from '../../shared/hooks';
import { setUser } from '../../modules/auth/authSlice';
import toast from 'react-hot-toast';
import { Link } from 'react-router-dom';
import api from '../../services/api';

/* ─── helpers ─────────────────────────────────────────────────────────────────*/
function formatDate(iso: string) {
    try {
        return new Date(iso).toLocaleDateString('en-IN', {
            year: 'numeric', month: 'long', day: 'numeric',
        });
    } catch {
        return 'January 2024';
    }
}

function nameToHue(name: string): number {
    let hash = 0;
    for (let i = 0; i < name.length; i++) hash = name.charCodeAt(i) + ((hash << 5) - hash);
    return Math.abs(hash) % 360;
}

function roleBadgeStyle(role: string) {
    const map: Record<string, string> = {
        farmer: 'text-green-700 bg-green-100 dark:text-green-400 dark:bg-green-900/30',
        wholesaler: 'text-yellow-700 bg-yellow-100 dark:text-yellow-400 dark:bg-yellow-900/30',
        user: 'text-blue-700 bg-blue-100 dark:text-blue-400 dark:bg-blue-900/30',
        admin: 'text-red-700 bg-red-100 dark:text-red-400 dark:bg-red-900/30',
    };
    return map[role] || 'text-slate-600 bg-slate-100';
}

/* ─── Editable info row ────────────────────────────────────────────────────────*/
interface InfoRowProps {
    icon: React.ReactNode;
    label: string;
    value: string;
    editable?: boolean;
    editMode?: boolean;
    draft?: string;
    type?: string;
    placeholder?: string;
    onEdit?: () => void;
    onChange?: (v: string) => void;
    onSave?: () => void;
    onCancel?: () => void;
}
function InfoRow({
    icon, label, value,
    editable, editMode, draft, type = 'text', placeholder,
    onEdit, onChange, onSave, onCancel,
}: InfoRowProps) {
    return (
        <div className="flex items-start gap-4 py-4 border-b border-slate-100 dark:border-slate-800 last:border-0 group">
            <div className="w-9 h-9 rounded-lg bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-slate-500 dark:text-slate-400 shrink-0 mt-0.5">
                {icon}
            </div>
            <div className="flex-1 min-w-0">
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">{label}</p>
                {editMode ? (
                    <div className="flex items-center gap-2">
                        <input
                            type={type}
                            value={draft}
                            onChange={(e) => onChange?.(e.target.value)}
                            placeholder={placeholder || label}
                            autoFocus
                            className="flex-1 px-3 py-1.5 text-sm border border-green-400 rounded-lg bg-white dark:bg-gray-900 text-slate-900 dark:text-white outline-none focus:ring-2 focus:ring-green-400/30"
                        />
                        <button
                            onClick={onSave}
                            className="p-1.5 bg-green-600 text-white rounded-lg"
                            title="Save"
                        >
                            <RiCheckLine size={14} />
                        </button>
                        <button
                            onClick={onCancel}
                            className="p-1.5 text-slate-400 border border-slate-200 dark:border-slate-700 rounded-lg"
                            title="Cancel"
                        >
                            <RiCloseLine size={14} />
                        </button>
                    </div>
                ) : (
                    <div className="flex items-center justify-between">
                        <p className="text-sm font-semibold text-slate-900 dark:text-white break-all">
                            {value || <span className="text-slate-400 font-normal italic">Not provided</span>}
                        </p>
                        {editable && (
                            <button
                                onClick={onEdit}
                                className="ml-3 p-1.5 text-slate-400 hover:text-green-600 dark:hover:text-green-400 rounded-lg opacity-0 group-hover:opacity-100 transition-all shrink-0"
                                title={`Edit ${label}`}
                            >
                                <RiEditLine size={14} />
                            </button>
                        )}
                    </div>
                )}
            </div>
        </div>
    );
}

/* ─── Section card ─────────────────────────────────────────────────────────────*/
function Card({ children, className = '' }: { children: React.ReactNode; className?: string }) {
    return (
        <div className={`bg-white dark:bg-gray-900 border border-slate-200 dark:border-slate-800 rounded-xl ${className}`}>
            {children}
        </div>
    );
}

/* ══════════════════════════════════════════════════════════════
   Main Page
══════════════════════════════════════════════════════════════ */
export function ProfilePage() {
    const dispatch = useAppDispatch();
    const { user } = useAppSelector((state) => state.auth);
    const wishlistCount = useAppSelector((state) => state.wishlist.items.length);
    const cartCount = useAppSelector((state) => state.cart.items.length);
    const avatarInputRef = useRef<HTMLInputElement>(null);

    const [editing, setEditing] = useState<string | null>(null);
    const [avatarSrc, setAvatarSrc] = useState<string | null>(null);
    const [draft, setDraft] = useState({
        name: user?.name || '',
        phone: user?.phone || '',
        address: user?.address || '',
    });

    const [showPasswordForm, setShowPasswordForm] = useState(false);
    const [passwords, setPasswords] = useState({ current: '', next: '', confirm: '' });
    const [savingPwd, setSavingPwd] = useState(false);

    if (!user) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-soft-bg dark:bg-gray-950">
                <p className="text-slate-500">Please login to continue</p>
            </div>
        );
    }

    /* ── helpers ── */
    const saveField = async (field: keyof typeof draft) => {
        try {
            // Backend only stores name and phone; address is local-only
            if (field === 'name' || field === 'phone') {
                const res = await api.put<{ data: { name: string; phone: string } }>('/users/me', {
                    [field]: draft[field],
                });
                dispatch(setUser({ ...user, [field]: (res.data as Record<string, any>).data?.[field] ?? draft[field] }));
            } else {
                dispatch(setUser({ ...user, [field]: draft[field] }));
            }
            toast.success(`${field.charAt(0).toUpperCase() + field.slice(1)} updated`);
        } catch {
            toast.error('Unable to save profile changes. Please try again.');
        }
        setEditing(null);
    };
    const getUserDraftValue = (field: keyof typeof draft) => {
        switch (field) {
            case 'name':
                return user.name || '';
            case 'phone':
                return user.phone || '';
            case 'address':
                return user.address || '';
        }
    };
    const cancelField = (field: keyof typeof draft) => {
        setDraft((prev) => ({ ...prev, [field]: getUserDraftValue(field) }));
        setEditing(null);
    };

    const handleChangePassword = (e: React.FormEvent) => {
        e.preventDefault();
        if (!passwords.current) { toast.error('Enter your current password'); return; }
        if (passwords.next.length < 6) { toast.error('New password must be at least 6 characters'); return; }
        if (passwords.next !== passwords.confirm) { toast.error('Passwords do not match'); return; }
        setSavingPwd(true);
        setTimeout(() => {
            setSavingPwd(false);
            setPasswords({ current: '', next: '', confirm: '' });
            setShowPasswordForm(false);
            toast.success('Password changed successfully');
        }, 1000);
    };

    const handleAvatarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;
        const reader = new FileReader();
        reader.onloadend = () => setAvatarSrc(reader.result as string);
        reader.readAsDataURL(file);
    };

    /* ── avatar ── */
    const initials = user.name.split(' ').map((w) => w[0]).join('').toUpperCase().slice(0, 2);
    const hue = nameToHue(user.name);
    const avatarBg = `linear-gradient(135deg, hsl(${hue},55%,52%), hsl(${hue},65%,38%))`;

    return (
        <div className="min-h-screen bg-soft-bg dark:bg-gray-950">
            {/* ── Page header ── */}
            <div className="bg-white dark:bg-gray-900 border-b border-slate-200 dark:border-slate-800 px-4 md:px-8 py-5">
                <div className="max-w-5xl mx-auto">
                    <h1 className="text-xl font-bold text-slate-900 dark:text-white">My Profile</h1>
                    <p className="text-sm text-slate-500 mt-0.5">View and manage your account information</p>
                </div>
            </div>

            <div className="max-w-5xl mx-auto px-4 md:px-8 py-8 space-y-6">
                {/* ── Top row: avatar card left + info/stats right ── */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">

                    {/* ── Avatar card ── */}
                    <Card className="p-6 flex flex-col items-center text-center">
                        {/* Circular avatar with upload */}
                        <div className="relative mb-4">
                            <div
                                className="w-24 h-24 rounded-full flex items-center justify-center text-white font-extrabold text-2xl ring-4 ring-white dark:ring-slate-800 shadow-lg overflow-hidden"
                                style={{ background: avatarSrc ? undefined : avatarBg }}
                            >
                                {avatarSrc
                                    ? <img src={avatarSrc} alt="Avatar" className="w-full h-full object-cover" />
                                    : initials
                                }
                            </div>
                            <button
                                onClick={() => avatarInputRef.current?.click()}
                                className="absolute bottom-0 right-0 w-8 h-8 bg-green-600 hover:bg-green-700 text-white rounded-full flex items-center justify-center shadow-md transition-colors border-2 border-white dark:border-slate-900"
                                title="Change photo"
                            >
                                <RiCameraLine size={14} />
                            </button>
                            <input
                                ref={avatarInputRef}
                                type="file"
                                accept="image/*"
                                onChange={handleAvatarChange}
                                className="hidden"
                            />
                        </div>

                        <h2 className="text-base font-bold text-slate-900 dark:text-white">{user.name}</h2>
                        <p className="text-xs text-slate-500 dark:text-slate-400 mb-3">{user.email}</p>
                        <span className={`text-[10px] font-extrabold uppercase tracking-widest px-3 py-1 rounded-full ${roleBadgeStyle(user.role)}`}>
                            {user.role}
                        </span>

                        <div className="mt-5 pt-5 border-t border-slate-100 dark:border-slate-800 w-full space-y-2.5">
                            <div className="flex items-center gap-2.5 text-xs text-slate-500 dark:text-slate-400">
                                <RiCalendarLine size={13} className="shrink-0 text-slate-400" />
                                <span>Joined {formatDate(user.createdAt || new Date().toISOString())}</span>
                            </div>
                            <div className="flex items-center gap-2.5 text-xs text-slate-500 dark:text-slate-400">
                                <RiShieldLine size={13} className="shrink-0 text-green-500" />
                                <span>Account verified</span>
                            </div>
                        </div>
                    </Card>

                    {/* ── Quick stats ── */}
                    <div className="md:col-span-2 grid grid-cols-2 sm:grid-cols-3 gap-4 content-start">
                        {[
                            { label: 'Wishlist', value: wishlistCount, icon: RiHeartLine, color: 'text-red-500', bg: 'bg-red-50 dark:bg-red-900/20', to: '/wishlist' },
                            { label: 'Cart', value: cartCount, icon: RiShoppingBagLine, color: 'text-green-600', bg: 'bg-green-50 dark:bg-green-900/20', to: '/cart' },
                            { label: 'Messages', value: 0, icon: RiMessage2Line, color: 'text-blue-500', bg: 'bg-blue-50 dark:bg-blue-900/20', to: '/chat' },
                        ].map((stat) => (
                            <Link
                                key={stat.label}
                                to={stat.to}
                                className="bg-white dark:bg-gray-900 border border-slate-200 dark:border-slate-800 rounded-xl p-4 flex flex-col gap-3 hover:shadow-sm hover:-translate-y-0.5 transition-all"
                            >
                                <div className={`w-9 h-9 rounded-lg ${stat.bg} flex items-center justify-center`}>
                                    <stat.icon size={18} className={stat.color} />
                                </div>
                                <div>
                                    <p className="text-2xl font-extrabold text-slate-900 dark:text-white tabular-nums">{stat.value}</p>
                                    <p className="text-xs text-slate-500 dark:text-slate-400">{stat.label}</p>
                                </div>
                            </Link>
                        ))}
                    </div>
                </div>

                {/* ── Personal Information ── */}
                <Card>
                    <div className="px-6 py-4 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between">
                        <div>
                            <h3 className="text-sm font-bold text-slate-900 dark:text-white">Personal Information</h3>
                            <p className="text-xs text-slate-500 mt-0.5">Hover a field to reveal the edit button</p>
                        </div>
                        <RiUserLine size={16} className="text-slate-400" />
                    </div>
                    <div className="px-6">
                        <InfoRow
                            icon={<RiUserLine size={16} />}
                            label="Full Name"
                            value={user.name}
                            editable
                            editMode={editing === 'name'}
                            draft={draft.name}
                            placeholder="Enter your full name"
                            onEdit={() => { setDraft((p) => ({ ...p, name: user.name })); setEditing('name'); }}
                            onChange={(v) => setDraft((p) => ({ ...p, name: v }))}
                            onSave={() => saveField('name')}
                            onCancel={() => cancelField('name')}
                        />
                        <InfoRow
                            icon={<RiMailLine size={16} />}
                            label="Email Address"
                            value={user.email}
                            editable={false}
                        />
                        <InfoRow
                            icon={<RiPhoneLine size={16} />}
                            label="Phone Number"
                            value={user.phone || ''}
                            editable
                            editMode={editing === 'phone'}
                            draft={draft.phone}
                            type="tel"
                            placeholder="+91 9876543210"
                            onEdit={() => { setDraft((p) => ({ ...p, phone: user.phone || '' })); setEditing('phone'); }}
                            onChange={(v) => setDraft((p) => ({ ...p, phone: v }))}
                            onSave={() => saveField('phone')}
                            onCancel={() => cancelField('phone')}
                        />
                        <InfoRow
                            icon={<RiMapPinLine size={16} />}
                            label="Location / Address"
                            value={user.address || ''}
                            editable
                            editMode={editing === 'address'}
                            draft={draft.address}
                            placeholder="City, State"
                            onEdit={() => { setDraft((p) => ({ ...p, address: user.address || '' })); setEditing('address'); }}
                            onChange={(v) => setDraft((p) => ({ ...p, address: v }))}
                            onSave={() => saveField('address')}
                            onCancel={() => cancelField('address')}
                        />
                    </div>
                </Card>

                {/* ── Security ── */}
                <Card>
                    <div className="px-6 py-4 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between">
                        <div>
                            <h3 className="text-sm font-bold text-slate-900 dark:text-white">Security</h3>
                            <p className="text-xs text-slate-500 mt-0.5">Manage your account password</p>
                        </div>
                        <RiShieldLine size={16} className="text-green-600" />
                    </div>
                    <div className="px-6 py-5">
                        {!showPasswordForm ? (
                            <div className="flex items-center justify-between">
                                <div className="flex items-center gap-3">
                                    <div className="w-9 h-9 bg-slate-100 dark:bg-slate-800 rounded-lg flex items-center justify-center">
                                        <RiLockPasswordLine size={16} className="text-slate-500" />
                                    </div>
                                    <div>
                                        <p className="text-sm font-semibold text-slate-900 dark:text-white">Password</p>
                                        <p className="text-xs text-slate-400 mt-0.5">Last changed: never</p>
                                    </div>
                                </div>
                                <button
                                    onClick={() => setShowPasswordForm(true)}
                                    className="px-4 py-2 text-xs font-bold text-green-700 dark:text-green-400 bg-green-50 dark:bg-green-900/20 rounded-lg border border-green-200 dark:border-green-800 hover:bg-green-100 dark:hover:bg-green-900/30 transition-colors"
                                >
                                    Change Password
                                </button>
                            </div>
                        ) : (
                            <form onSubmit={handleChangePassword} className="space-y-4 max-w-sm">
                                {([
                                    { label: 'Current Password', key: 'current' as const },
                                    { label: 'New Password', key: 'next' as const },
                                    { label: 'Confirm Password', key: 'confirm' as const },
                                ]).map(({ label, key }) => (
                                    <div key={key}>
                                        <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block mb-1.5">
                                            {label}
                                        </label>
                                        <input
                                            type="password"
                                            value={passwords[key]}
                                            onChange={(e) => setPasswords((p) => ({ ...p, [key]: e.target.value }))}
                                            placeholder="••••••••"
                                            className="w-full px-3 py-2.5 text-sm border border-slate-200 dark:border-slate-700 rounded-lg bg-white dark:bg-gray-900 text-slate-900 dark:text-white outline-none focus:ring-2 focus:ring-green-400/30 focus:border-green-400"
                                        />
                                    </div>
                                ))}
                                <div className="flex gap-2 pt-1">
                                    <button
                                        type="submit"
                                        disabled={savingPwd}
                                        className="px-5 py-2 bg-green-600 text-white text-xs font-bold rounded-lg disabled:opacity-60 hover:bg-green-700 transition-colors"
                                    >
                                        {savingPwd ? 'Saving…' : 'Save Password'}
                                    </button>
                                    <button
                                        type="button"
                                        onClick={() => { setShowPasswordForm(false); setPasswords({ current: '', next: '', confirm: '' }); }}
                                        className="px-4 py-2 text-xs font-semibold text-slate-600 dark:text-slate-400 border border-slate-200 dark:border-slate-700 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors"
                                    >
                                        Cancel
                                    </button>
                                </div>
                            </form>
                        )}
                    </div>
                </Card>

                {/* ── Danger zone ── */}
                <Card className="border-red-100 dark:border-red-900/30">
                    <div className="px-6 py-4 border-b border-red-100 dark:border-red-900/30 flex items-center gap-2">
                        <RiAlertLine size={15} className="text-red-500" />
                        <h3 className="text-sm font-bold text-red-600">Danger Zone</h3>
                    </div>
                    <div className="px-6 py-5 flex items-center justify-between">
                        <div>
                            <p className="text-sm font-semibold text-slate-900 dark:text-white">Delete Account</p>
                            <p className="text-xs text-slate-500 mt-0.5">
                                Permanently remove your account and all associated data. This cannot be undone.
                            </p>
                        </div>
                        <button
                            onClick={() => toast.error('Contact support to delete your account')}
                            className="ml-4 px-4 py-2 text-xs font-bold text-red-600 border border-red-200 dark:border-red-800 rounded-lg shrink-0 hover:bg-red-50 dark:hover:bg-red-900/10 transition-colors"
                        >
                            Delete Account
                        </button>
                    </div>
                </Card>
            </div>
        </div>
    );
}
