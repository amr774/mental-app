import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useCart }  from '../context/CartContext';
import { useAuth }  from '../context/AuthContext';
import { useLang }  from '../context/LanguageContext';
import { orderService } from '../services/api';
import './Checkout.css';

const GOVERNORATES = [
    'القاهرة','الجيزة','الإسكندرية','القليوبية','الغربية','الدقهلية',
    'الشرقية','المنوفية','البحيرة','كفر الشيخ','دمياط','بورسعيد',
    'الإسماعيلية','السويس','شمال سيناء','جنوب سيناء','مطروح',
    'أسيوط','سوهاج','قنا','الأقصر','أسوان','المنيا','بني سويف',
    'الفيوم','الوادي الجديد','البحر الأحمر',
];

const DELIVERY_FEE = 70;

const EMPTY_FORM = {
    fullName: '', email: '', phone: '', governorate: '', address: '',
};

export default function Checkout() {
    const { t } = useLang();
    const { user } = useAuth();
    const { items, subtotal, removeItem, clearCart } = useCart();
    const navigate = useNavigate();

    const [form,      setForm]      = useState({
        ...EMPTY_FORM,
        fullName: user?.name  || '',
        email:    user?.email || '',
    });
    const [payment,   setPayment]   = useState('cash');
    const [visa,      setVisa]      = useState({ number: '', expiry: '', cvv: '', name: '' });
    const [errors,    setErrors]    = useState({});
    const [submitting,setSubmitting]= useState(false);
    const [success,   setSuccess]   = useState(false);
    const [orderNum,  setOrderNum]  = useState('');

    const total = subtotal + DELIVERY_FEE;

    function setField(k, v) { setForm(f => ({ ...f, [k]: v })); }
    function setVField(k, v) {
        if (k === 'number')  v = v.replace(/\D/g, '').slice(0, 16).replace(/(.{4})/g, '$1 ').trim();
        if (k === 'expiry')  v = v.replace(/\D/g, '').slice(0, 4).replace(/^(\d{2})(\d)/, '$1/$2');
        if (k === 'cvv')     v = v.replace(/\D/g, '').slice(0, 3);
        setVisa(f => ({ ...f, [k]: v }));
    }

    function validate() {
        const e = {};
        if (!form.fullName.trim())    e.fullName    = t('checkout.errRequired');
        if (!form.email.trim())       e.email       = t('checkout.errRequired');
        if (!form.phone.trim())       e.phone       = t('checkout.errRequired');
        if (!form.governorate)        e.governorate = t('checkout.errRequired');
        if (!form.address.trim())     e.address     = t('checkout.errRequired');
        if (payment === 'visa') {
            if (visa.number.replace(/\s/g, '').length < 16) e.visaNumber = t('checkout.errVisa');
            if (visa.expiry.length < 5)  e.visaExpiry = t('checkout.errVisa');
            if (visa.cvv.length < 3)     e.visaCvv    = t('checkout.errVisa');
            if (!visa.name.trim())       e.visaName   = t('checkout.errRequired');
        }
        return e;
    }

    async function handleSubmit(e) {
        e.preventDefault();
        if (!items.length) return;
        const errs = validate();
        if (Object.keys(errs).length) { setErrors(errs); return; }
        setErrors({});
        setSubmitting(true);
        try {
            const order = await orderService.create({
                items: items.map(i => ({
                    itemId:   i.id,
                    itemType: i.itemType,
                    name:     i.name,
                    price:    i.price,
                    image:    i.image || '',
                })),
                customer:      form,
                paymentMethod: payment,
                deliveryFee:   DELIVERY_FEE,
                totalAmount:   total,
            });
            setOrderNum(order._id?.slice(-6).toUpperCase() || '------');
            clearCart();
            setSuccess(true);
        } catch (err) {
            setErrors({ submit: err.message || t('checkout.errSubmit') });
        } finally {
            setSubmitting(false);
        }
    }

    /* ── Success screen ── */
    if (success) {
        return (
            <div className="chk-page">
                <div className="chk-success card animate-fade-up">
                    <div className="chk-success-icon">🎉</div>
                    <h2 className="chk-success-title">{t('checkout.successTitle')}</h2>
                    <p className="chk-success-sub">{t('checkout.successSub')}</p>
                    <div className="chk-order-num">
                        <span>{t('checkout.orderNum')}</span>
                        <strong>#{orderNum}</strong>
                    </div>
                    <p className="chk-success-note">{t('checkout.successNote')}</p>
                    <button className="btn btn-primary" onClick={() => navigate('/')}>{t('checkout.backHome')}</button>
                </div>
            </div>
        );
    }

    /* ── Empty cart ── */
    if (!items.length) {
        return (
            <div className="chk-page">
                <div className="chk-empty card">
                    <span>🛒</span>
                    <p>{t('checkout.emptyCart')}</p>
                    <button className="btn btn-primary" onClick={() => navigate('/store')}>{t('checkout.browsStore')}</button>
                </div>
            </div>
        );
    }

    return (
        <div className="chk-page">
            <div className="chk-header animate-fade-up">
                <span className="badge badge-teal">{t('checkout.badge')}</span>
                <h1 className="chk-title">{t('checkout.heading')}</h1>
            </div>

            <div className="chk-layout">
                {/* ── Left: Form ── */}
                <form className="chk-form card animate-fade-up" onSubmit={handleSubmit}>
                    {/* Customer info */}
                    <h3 className="chk-section-title">📋 {t('checkout.customerInfo')}</h3>
                    <div className="chk-grid2">
                        <div className="input-group">
                            <label className="input-label">{t('checkout.fullName')} *</label>
                            <input className={`input ${errors.fullName ? 'input-err' : ''}`}
                                value={form.fullName} onChange={e => setField('fullName', e.target.value)}
                                placeholder={t('checkout.fullNamePh')} />
                            {errors.fullName && <span className="chk-err">{errors.fullName}</span>}
                        </div>
                        <div className="input-group">
                            <label className="input-label">{t('checkout.email')} *</label>
                            <input className={`input ${errors.email ? 'input-err' : ''}`} type="email"
                                value={form.email} onChange={e => setField('email', e.target.value)}
                                placeholder="example@email.com" />
                            {errors.email && <span className="chk-err">{errors.email}</span>}
                        </div>
                        <div className="input-group">
                            <label className="input-label">{t('checkout.phone')} *</label>
                            <input className={`input ${errors.phone ? 'input-err' : ''}`}
                                value={form.phone} onChange={e => setField('phone', e.target.value)}
                                placeholder="01X XXXX XXXX" />
                            {errors.phone && <span className="chk-err">{errors.phone}</span>}
                        </div>
                        <div className="input-group">
                            <label className="input-label">{t('checkout.governorate')} *</label>
                            <select className={`input ${errors.governorate ? 'input-err' : ''}`}
                                value={form.governorate} onChange={e => setField('governorate', e.target.value)}>
                                <option value="">— {t('checkout.selectGov')} —</option>
                                {GOVERNORATES.map(g => <option key={g} value={g}>{g}</option>)}
                            </select>
                            {errors.governorate && <span className="chk-err">{errors.governorate}</span>}
                        </div>
                        <div className="input-group chk-full">
                            <label className="input-label">{t('checkout.address')} *</label>
                            <textarea className={`input chk-textarea ${errors.address ? 'input-err' : ''}`} rows={2}
                                value={form.address} onChange={e => setField('address', e.target.value)}
                                placeholder={t('checkout.addressPh')} />
                            {errors.address && <span className="chk-err">{errors.address}</span>}
                        </div>
                    </div>

                    {/* Payment method */}
                    <h3 className="chk-section-title">💳 {t('checkout.payment')}</h3>
                    <div className="chk-payment-methods">
                        <label className={`chk-pay-option ${payment === 'cash' ? 'active' : ''}`}>
                            <input type="radio" name="payment" value="cash"
                                checked={payment === 'cash'} onChange={() => setPayment('cash')} />
                            <span className="chk-pay-icon">💵</span>
                            <div>
                                <strong>{t('checkout.cash')}</strong>
                                <p>{t('checkout.cashSub')}</p>
                            </div>
                        </label>
                        <label className={`chk-pay-option ${payment === 'visa' ? 'active' : ''}`}>
                            <input type="radio" name="payment" value="visa"
                                checked={payment === 'visa'} onChange={() => setPayment('visa')} />
                            <span className="chk-pay-icon">💳</span>
                            <div>
                                <strong>{t('checkout.visa')}</strong>
                                <p>{t('checkout.visaSub')}</p>
                            </div>
                        </label>
                    </div>

                    {/* Visa test form */}
                    {payment === 'visa' && (
                        <div className="chk-visa-form animate-fade-up">
                            <div className="chk-test-banner">🔒 {t('checkout.testMode')}</div>
                            <div className="chk-grid2">
                                <div className="input-group chk-full">
                                    <label className="input-label">{t('checkout.cardNumber')}</label>
                                    <input className={`input chk-card-input ${errors.visaNumber ? 'input-err' : ''}`}
                                        value={visa.number} onChange={e => setVField('number', e.target.value)}
                                        placeholder="1234 5678 9012 3456" maxLength={19} />
                                    {errors.visaNumber && <span className="chk-err">{errors.visaNumber}</span>}
                                </div>
                                <div className="input-group chk-full">
                                    <label className="input-label">{t('checkout.cardName')}</label>
                                    <input className={`input ${errors.visaName ? 'input-err' : ''}`}
                                        value={visa.name} onChange={e => setVField('name', e.target.value)}
                                        placeholder={t('checkout.cardNamePh')} />
                                    {errors.visaName && <span className="chk-err">{errors.visaName}</span>}
                                </div>
                                <div className="input-group">
                                    <label className="input-label">{t('checkout.expiry')}</label>
                                    <input className={`input ${errors.visaExpiry ? 'input-err' : ''}`}
                                        value={visa.expiry} onChange={e => setVField('expiry', e.target.value)}
                                        placeholder="MM/YY" maxLength={5} />
                                    {errors.visaExpiry && <span className="chk-err">{errors.visaExpiry}</span>}
                                </div>
                                <div className="input-group">
                                    <label className="input-label">{t('checkout.cvv')}</label>
                                    <input className={`input ${errors.visaCvv ? 'input-err' : ''}`}
                                        value={visa.cvv} onChange={e => setVField('cvv', e.target.value)}
                                        placeholder="123" maxLength={3} type="password" />
                                    {errors.visaCvv && <span className="chk-err">{errors.visaCvv}</span>}
                                </div>
                            </div>
                        </div>
                    )}

                    {errors.submit && <div className="chk-submit-err">{errors.submit}</div>}

                    <button className="btn btn-primary chk-submit" type="submit" disabled={submitting}>
                        {submitting ? '…' : `✅ ${t('checkout.placeOrder')} — ${total} ${t('store.currency')}`}
                    </button>
                </form>

                {/* ── Right: Order summary ── */}
                <aside className="chk-summary animate-fade-up delay-1">
                    <div className="card">
                        <h3 className="chk-section-title">🧾 {t('checkout.summary')}</h3>
                        <div className="chk-items">
                            {items.map(item => (
                                <div key={`${item.itemType}-${item.id}`} className="chk-item">
                                    {item.image
                                        ? <img src={item.image} alt={item.name} className="chk-item-img"
                                               onError={e => { e.currentTarget.style.display = 'none'; }} />
                                        : <div className="chk-item-img chk-item-img-ph">
                                            {item.itemType === 'pet' ? '🐾' : '📦'}
                                          </div>
                                    }
                                    <div className="chk-item-info">
                                        <p className="chk-item-name">{item.name}</p>
                                        <span className="chk-item-type badge badge-teal" style={{ fontSize: 10 }}>
                                            {item.itemType === 'pet' ? t('checkout.typePet') : t('checkout.typeStore')}
                                        </span>
                                    </div>
                                    <div className="chk-item-right">
                                        <span className="chk-item-price">{item.price} {t('store.currency')}</span>
                                        <button className="chk-remove" onClick={() => removeItem(item.id, item.itemType)} title={t('checkout.remove')}>✕</button>
                                    </div>
                                </div>
                            ))}
                        </div>
                        <div className="chk-totals">
                            <div className="chk-total-row">
                                <span>{t('checkout.subtotal')}</span>
                                <span>{subtotal} {t('store.currency')}</span>
                            </div>
                            <div className="chk-total-row">
                                <span>🚚 {t('checkout.delivery')}</span>
                                <span>{DELIVERY_FEE} {t('store.currency')}</span>
                            </div>
                            <div className="chk-total-row chk-total-final">
                                <span>{t('checkout.total')}</span>
                                <span>{total} {t('store.currency')}</span>
                            </div>
                        </div>
                    </div>
                </aside>
            </div>
        </div>
    );
}
