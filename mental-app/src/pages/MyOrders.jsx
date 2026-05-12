import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useLang } from '../context/LanguageContext';
import { orderService } from '../services/api';
import './MyOrders.css';

const STATUS_META = {
    pending:   { icon: '🕐', color: '#d97706', bg: 'rgba(251,191,36,0.12)',  label: 'admin.status.pending'   },
    confirmed: { icon: '✅', color: '#0d9488', bg: 'rgba(78,205,196,0.12)',  label: 'admin.status.confirmed' },
    cancelled: { icon: '❌', color: '#dc2626', bg: 'rgba(248,113,113,0.12)', label: 'admin.status.cancelled' },
    delivered: { icon: '📦', color: '#16a34a', bg: 'rgba(74,222,128,0.12)',  label: 'admin.status.delivered' },
};

const STEPS = ['pending', 'confirmed', 'delivered'];

function StatusBar({ status }) {
    if (status === 'cancelled') {
        return (
            <div className="ord-cancelled-bar">
                ❌ Order cancelled
            </div>
        );
    }
    const idx = STEPS.indexOf(status);
    return (
        <div className="ord-steps">
            {STEPS.map((s, i) => {
                const meta = STATUS_META[s];
                const done    = i <= idx;
                const current = i === idx;
                return (
                    <div key={s} className={`ord-step ${done ? 'done' : ''} ${current ? 'current' : ''}`}>
                        <div className="ord-step-circle">{done ? '✓' : (i + 1)}</div>
                        <span className="ord-step-label">{meta.icon}</span>
                        {i < STEPS.length - 1 && <div className={`ord-step-line ${i < idx ? 'done' : ''}`} />}
                    </div>
                );
            })}
        </div>
    );
}

export default function MyOrders() {
    const { t } = useLang();
    const navigate = useNavigate();
    const [orders,  setOrders]  = useState([]);
    const [loading, setLoading] = useState(true);
    const [expanded, setExpanded] = useState({});

    useEffect(() => {
        orderService.getMine()
            .then(data => setOrders(Array.isArray(data) ? data : []))
            .catch(() => setOrders([]))
            .finally(() => setLoading(false));
    }, []);

    function toggle(id) {
        setExpanded(prev => ({ ...prev, [id]: !prev[id] }));
    }

    if (loading) {
        return (
            <div className="ord-page">
                <p className="ord-loading">{t('community.loading')}</p>
            </div>
        );
    }

    return (
        <div className="ord-page">
            <div className="ord-header animate-fade-up">
                <span className="badge badge-teal">{t('orders.badge')}</span>
                <h1 className="ord-title">{t('orders.heading')}</h1>
                <p className="ord-sub">{t('orders.sub')}</p>
            </div>

            {orders.length === 0 ? (
                <div className="ord-empty card animate-fade-up">
                    <span>🛒</span>
                    <p>{t('orders.empty')}</p>
                    <button className="btn btn-primary" onClick={() => navigate('/store')}>{t('checkout.browsStore')}</button>
                </div>
            ) : (
                <div className="ord-list animate-fade-up delay-1">
                    {orders.map(order => {
                        const oid  = order._id || order.id;
                        const meta = STATUS_META[order.status] || STATUS_META.pending;
                        const open = expanded[oid];

                        return (
                            <div key={oid} className="ord-card card">
                                {/* Card header */}
                                <div className="ord-card-top" onClick={() => toggle(oid)}>
                                    <div className="ord-card-left">
                                        <span className="ord-id">#{oid?.slice(-6).toUpperCase()}</span>
                                        <span className="ord-date">
                                            {order.createdAt ? new Date(order.createdAt).toLocaleDateString() : ''}
                                        </span>
                                    </div>
                                    <div className="ord-card-right">
                                        <span className="ord-total">{order.totalAmount} {t('store.currency')}</span>
                                        <span
                                            className="ord-status-badge"
                                            style={{ background: meta.bg, color: meta.color }}
                                        >
                                            {meta.icon} {t(meta.label)}
                                        </span>
                                        <span className="ord-chevron">{open ? '▲' : '▼'}</span>
                                    </div>
                                </div>

                                {/* Progress steps */}
                                <StatusBar status={order.status} />

                                {/* Expanded details */}
                                {open && (
                                    <div className="ord-details animate-fade-up">
                                        {/* Items */}
                                        <div className="ord-section">
                                            <p className="ord-section-title">📦 {t('admin.orderItems')}</p>
                                            <div className="ord-items">
                                                {order.items?.map((item, i) => (
                                                    <div key={i} className="ord-item">
                                                        {item.image
                                                            ? <img src={item.image} alt={item.name} className="ord-item-img"
                                                                   onError={e => { e.currentTarget.style.display = 'none'; }} />
                                                            : <div className="ord-item-img ord-item-ph">
                                                                {item.itemType === 'pet' ? '🐾' : '📦'}
                                                              </div>
                                                        }
                                                        <div className="ord-item-info">
                                                            <p className="ord-item-name">{item.name}</p>
                                                            <span className="badge badge-teal" style={{ fontSize: 10 }}>
                                                                {item.itemType === 'pet' ? t('checkout.typePet') : t('checkout.typeStore')}
                                                            </span>
                                                        </div>
                                                        <span className="ord-item-price">{item.price} {t('store.currency')}</span>
                                                    </div>
                                                ))}
                                            </div>
                                        </div>

                                        {/* Totals */}
                                        <div className="ord-section">
                                            <div className="ord-totals">
                                                <div className="ord-total-row">
                                                    <span>{t('checkout.subtotal')}</span>
                                                    <span>{order.totalAmount - order.deliveryFee} {t('store.currency')}</span>
                                                </div>
                                                <div className="ord-total-row">
                                                    <span>🚚 {t('checkout.delivery')}</span>
                                                    <span>{order.deliveryFee} {t('store.currency')}</span>
                                                </div>
                                                <div className="ord-total-row ord-total-final">
                                                    <span>{t('checkout.total')}</span>
                                                    <span>{order.totalAmount} {t('store.currency')}</span>
                                                </div>
                                            </div>
                                        </div>

                                        {/* Delivery info */}
                                        <div className="ord-section">
                                            <p className="ord-section-title">📍 {t('orders.deliveryTo')}</p>
                                            <div className="ord-delivery-info">
                                                <span>👤 {order.customer?.fullName}</span>
                                                <span>📞 {order.customer?.phone}</span>
                                                <span>🗺️ {order.customer?.governorate} — {order.customer?.address}</span>
                                                <span>
                                                    💳 {order.paymentMethod === 'visa'
                                                        ? t('checkout.visa')
                                                        : t('checkout.cash')}
                                                </span>
                                            </div>
                                        </div>
                                    </div>
                                )}
                            </div>
                        );
                    })}
                </div>
            )}
        </div>
    );
}
