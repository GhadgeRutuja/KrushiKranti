import { motion } from 'framer-motion';
import { Sprout, Building2, User, ArrowRight, Loader2 } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useAppDispatch, useAppSelector } from '../../../shared/hooks';
import { useState } from 'react';
import type { Role } from '../types';
import toast from 'react-hot-toast';
import { setUser } from '../authSlice';
import { useTranslation } from 'react-i18next';

export function RoleSelectionPage() {
    const { t } = useTranslation();
    const navigate = useNavigate();
    const dispatch = useAppDispatch();
    const { user } = useAppSelector((state) => state.auth);
    const [selectedRole, setSelectedRole] = useState<Role | null>(null);
    const [isUpdating, setIsUpdating] = useState(false);

    const roles = [
        {
            id: 'farmer' as Role,
            title: t('dashboards.farmer.title'),
            description: t('auth.farmer_desc'),
            icon: Sprout,
            color: 'bg-green-100 text-green-600',
        },
        {
            id: 'wholesaler' as Role,
            title: t('dashboards.wholesaler.title'),
            description: t('auth.wholesaler_desc'),
            icon: Building2,
            color: 'bg-purple-100 text-purple-600',
        },
        {
            id: 'user' as Role,
            title: t('common.products'),
            description: t('auth.user_desc'),
            icon: User,
            color: 'bg-blue-100 text-blue-600',
        },
    ];

    const handleRoleSelection = async () => {
        if (!selectedRole || !user) return;

        setIsUpdating(true);
        try {
            // In a real app, this would be an API call
            await new Promise(resolve => setTimeout(resolve, 1000));

            const updatedUser = { ...user, role: selectedRole };
            dispatch(setUser(updatedUser));
            localStorage.setItem('user', JSON.stringify(updatedUser));

            toast.success(t('common.welcome') + `!`);

            switch (selectedRole) {
                case 'farmer': navigate('/farmer/dashboard'); break;
                case 'wholesaler': navigate('/wholesaler/dashboard'); break;
                default: navigate('/dashboard'); break;
            }
        } catch (error) {
            toast.error(t('common.error_occurred') || 'Failed to update role. Please try again.');
        } finally {
            setIsUpdating(false);
        }
    };

    return (
        <div className="min-h-screen bg-soft-bg dark:bg-gray-900 py-12 px-4 flex items-center justify-center">
            <div className="max-w-2xl w-full">
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="text-center mb-12"
                >
                    <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-4">{t('auth.choose_path')}</h1>
                    <p className="text-gray-600 dark:text-gray-400 text-lg">
                        {t('auth.choose_path_desc')}
                    </p>
                </motion.div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
                    {roles.map((role) => (
                        <motion.button
                            key={role.id}
                            whileHover={{ scale: 1.02 }}
                            whileTap={{ scale: 0.98 }}
                            onClick={() => setSelectedRole(role.id)}
                            className={`p-6 rounded-3xl border-2 text-left transition-all relative overflow-hidden group
                ${selectedRole === role.id
                                    ? 'border-primary-600 bg-primary-50/50 dark:bg-primary-900/20'
                                    : 'border-gray-100 dark:border-gray-800 bg-white dark:bg-gray-800 hover:border-primary-300'}`}
                        >
                            <div className={`w-12 h-12 rounded-2xl flex items-center justify-center mb-6 ${role.color}`}>
                                <role.icon size={24} />
                            </div>
                            <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">{role.title}</h3>
                            <p className="text-sm text-gray-500 dark:text-gray-400 leading-relaxed">{role.description}</p>

                            {selectedRole === role.id && (
                                <motion.div
                                    layoutId="active-selection"
                                    className="absolute top-4 right-4 text-primary-600"
                                >
                                    <div className="w-6 h-6 rounded-full bg-primary-600 text-white flex items-center justify-center">
                                        <ArrowRight size={14} />
                                    </div>
                                </motion.div>
                            )}
                        </motion.button>
                    ))}
                </div>

                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="flex justify-center"
                >
                    <button
                        onClick={handleRoleSelection}
                        disabled={!selectedRole || isUpdating}
                        className="btn-primary px-12 py-4 text-lg flex items-center gap-3 disabled:opacity-50 disabled:grayscale transition-all shadow-xl shadow-primary-600/20"
                    >
                        {isUpdating ? (
                            <Loader2 className="animate-spin" size={24} />
                        ) : (
                            <>
                                {t('auth.start_journey')}
                                <ArrowRight size={20} />
                            </>
                        )}
                    </button>
                </motion.div>
            </div>
        </div>
    );
}
