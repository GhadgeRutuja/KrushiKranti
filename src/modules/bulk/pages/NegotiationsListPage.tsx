import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAppDispatch, useAppSelector } from '../../../shared/hooks';
import { fetchConversations } from '../negotiationSlice';
import { RiLoader4Line, RiChat3Line, RiCheckboxCircleLine, RiCloseCircleLine } from 'react-icons/ri';

interface NegotiationsListPageProps {
    chatBasePath: string; // e.g. '/farmer/chat' or '/wholesaler/chat' or '/admin/chat'
    title?: string;
}

export function NegotiationsListPage({ chatBasePath, title = 'My Negotiations' }: NegotiationsListPageProps) {
    const dispatch = useAppDispatch();
    const navigate = useNavigate();
    const { conversations, isLoading } = useAppSelector((state) => state.negotiation);

    useEffect(() => {
        dispatch(fetchConversations());
    }, [dispatch]);

    const getStatusBadge = (status: string) => {
        switch (status) {
            case 'ACTIVE': return { bg: '#dbeafe', color: '#2563eb', icon: <RiChat3Line size={12} /> };
            case 'AGREED': return { bg: '#f0fdf4', color: '#16a34a', icon: <RiCheckboxCircleLine size={12} /> };
            case 'REJECTED': return { bg: '#fef2f2', color: '#ef4444', icon: <RiCloseCircleLine size={12} /> };
            default: return { bg: '#f1f5f9', color: '#64748b', icon: null };
        }
    };

    const formatDate = (ts: string) => {
        try {
            return new Date(ts).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' });
        } catch { return ''; }
    };

    return (
        <div style={{ padding: '24px 20px', maxWidth: 900, margin: '0 auto' }}>
            <div style={{ marginBottom: 24 }}>
                <h1 style={{ fontSize: 24, fontWeight: 700, color: '#1a1a2e' }}>{title}</h1>
                <p style={{ color: '#64748b', fontSize: 14 }}>View and manage your bulk marketplace negotiations</p>
            </div>

            {isLoading ? (
                <div style={{ textAlign: 'center', padding: 60 }}>
                    <RiLoader4Line className="animate-spin" size={36} style={{ color: '#16a34a' }} />
                </div>
            ) : conversations.length === 0 ? (
                <div style={{
                    textAlign: 'center', padding: 60, background: '#f8fafc',
                    borderRadius: 16, border: '1px solid #e2e8f0',
                }}>
                    <RiChat3Line size={48} style={{ color: '#94a3b8', margin: '0 auto 16px' }} />
                    <p style={{ color: '#64748b' }}>No negotiations yet</p>
                </div>
            ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                    {conversations.map((conv) => {
                        const badge = getStatusBadge(conv.status);
                        return (
                            <div key={conv.id}
                                onClick={() => navigate(`${chatBasePath}/${conv.id}`)}
                                style={{
                                    display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                                    background: '#fff', borderRadius: 12, border: '1px solid #e2e8f0',
                                    padding: '16px 20px', cursor: 'pointer', transition: 'all 0.2s',
                                }}
                                onMouseEnter={(e) => { e.currentTarget.style.borderColor = '#16a34a'; e.currentTarget.style.boxShadow = '0 4px 12px rgba(0,0,0,0.06)'; }}
                                onMouseLeave={(e) => { e.currentTarget.style.borderColor = '#e2e8f0'; e.currentTarget.style.boxShadow = 'none'; }}
                            >
                                <div>
                                    <h3 style={{ fontSize: 16, fontWeight: 600, color: '#1a1a2e', marginBottom: 4 }}>
                                        {conv.bulkProductName}
                                    </h3>
                                    <p style={{ fontSize: 13, color: '#64748b' }}>
                                        Farmer: {conv.farmerName} • Wholesaler: {conv.wholesalerName}
                                    </p>
                                    <p style={{ fontSize: 12, color: '#94a3b8', marginTop: 4 }}>
                                        Started {formatDate(conv.createdAt)}
                                    </p>
                                </div>
                                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                                    <span style={{
                                        display: 'flex', alignItems: 'center', gap: 4,
                                        padding: '4px 12px', borderRadius: 20, fontSize: 12, fontWeight: 600,
                                        background: badge.bg, color: badge.color,
                                    }}>
                                        {badge.icon} {conv.status}
                                    </span>
                                </div>
                            </div>
                        );
                    })}
                </div>
            )}
        </div>
    );
}
