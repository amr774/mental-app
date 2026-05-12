import { useState, useEffect } from 'react';
import { useLang } from '../context/LanguageContext';
import { useCart } from '../context/CartContext';
import { storeService } from '../services/api';
import './Store.css';

const CATEGORIES = ['all', 'general', 'books', 'electronics', 'toys', 'other'];
const CONDITION_COLOR = { new: '#4ade80', 'like-new': '#4ecdc4', good: '#94a3b8', fair: '#fbbf24' };

// ── localStorage saved items ──────────────────────────────────────
const SAVED_KEY  = 'mh_store_saved';
const loadSaved  = () => { try { return new Set(JSON.parse(localStorage.getItem(SAVED_KEY)) || []); } catch { return new Set(); } };
const writeSaved = (set) => { try { localStorage.setItem(SAVED_KEY, JSON.stringify([...set])); } catch {} };

export default function Store() {
  const { t } = useLang();
  const { addItem, items: cartItems } = useCart();

  const [items,    setItems]    = useState([]);
  const [search,   setSearch]   = useState('');
  const [category, setCategory] = useState('all');
  const [loading,  setLoading]  = useState(true);

  const [savedIds, setSavedIds] = useState(loadSaved);
  const [added,    setAdded]    = useState({}); // flash state per item

  const loadItems = async () => {
    setLoading(true);
    try {
      const data = await storeService.getAll(search, category === 'all' ? '' : category);
      setItems(data);
    } catch { setItems([]); }
    finally { setLoading(false); }
  };

  useEffect(() => { loadItems(); }, [search, category]);

  const toggleSave = (id) => {
    setSavedIds(prev => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      writeSaved(next);
      return next;
    });
  };

  const handleAddToCart = (item) => {
    addItem({
      id:       item._id,
      itemType: 'store',
      name:     item.title,
      price:    item.price,
      image:    item.image || '',
    });
    setAdded(prev => ({ ...prev, [item._id]: true }));
    setTimeout(() => setAdded(prev => ({ ...prev, [item._id]: false })), 1800);
  };

  const isInCart = (id) => cartItems.some(i => i.id === id && i.itemType === 'store');

  const catIcon = (cat) =>
    cat === 'books' ? '📚' : cat === 'electronics' ? '💻' : cat === 'toys' ? '🧸' : '📦';

  return (
    <div className="page">
      <div className="animate-fade-up">
        <span className="badge badge-teal">{t('store.badge')}</span>
        <h1 className="display store-heading">{t('store.heading')}</h1>
        <p className="subtext">{t('store.sub')}</p>
      </div>

      {/* Filters */}
      <div className="store-filters animate-fade-up">
        <div className="store-search-wrap">
          <span>🔍</span>
          <input
            className="input"
            placeholder={t('store.searchPlaceholder')}
            value={search}
            onChange={e => setSearch(e.target.value)}
          />
          {search && <button className="pet-search-clear" onClick={() => setSearch('')}>✕</button>}
        </div>
        <div className="store-cats">
          {CATEGORIES.map(c => (
            <button
              key={c}
              className={`pet-chip ${category === c ? 'active' : ''}`}
              onClick={() => setCategory(c)}
            >
              {t(`store.cat.${c}`) || c}
            </button>
          ))}
        </div>
      </div>

      {loading ? (
        <p style={{ color: 'var(--text-3)', fontSize: 14 }}>{t('store.loading')}</p>
      ) : items.length === 0 ? (
        <div className="store-empty">
          <p>🛒</p>
          <p>{t('store.empty')}</p>
        </div>
      ) : (
        <div className="store-grid animate-fade-up delay-1">
          {items.map(item => {
            const saved = savedIds.has(item._id);
            return (
              <div key={item._id} className={`store-card card ${item.status === 'sold' ? 'store-card-sold' : ''}`}>
                {item.status === 'sold' && <div className="store-sold-ribbon">{t('store.sold')}</div>}

                {item.image
                  ? <img src={item.image} alt={item.title} className="store-card-img"
                         onError={e => { e.currentTarget.style.display = 'none'; }} />
                  : <div className="store-card-icon-placeholder">{catIcon(item.category)}</div>
                }

                <div className="store-card-top">
                  <span className="store-item-icon">{catIcon(item.category)}</span>
                  <span
                    className="badge"
                    style={{ background: CONDITION_COLOR[item.condition] + '22', color: CONDITION_COLOR[item.condition] }}
                  >
                    {t(`store.cond.${item.condition}`) || item.condition}
                  </span>
                </div>

                <h3 className="store-item-title">{item.title}</h3>
                {item.description && <p className="store-item-desc">{item.description}</p>}

                <div className="store-item-footer">
                  <span className="store-price">{item.price} {t('store.currency')}</span>
                  <span className="store-category">{t(`store.cat.${item.category}`) || item.category}</span>
                </div>

                <div className="store-seller">
                  <span>👤 {item.sellerName}</span>
                </div>

                {item.status !== 'sold' && (
                  <div className="store-card-actions">
                    <button
                      className={`btn btn-sm store-save-btn ${saved ? 'saved' : ''}`}
                      onClick={() => toggleSave(item._id)}
                    >
                      {saved ? '🔖 ' + t('store.saved') : '🔖 ' + t('store.save')}
                    </button>
                    <button
                      className={`btn btn-sm store-buy-btn ${isInCart(item._id) || added[item._id] ? 'btn-ghost' : 'btn-primary'}`}
                      onClick={() => handleAddToCart(item)}
                      disabled={isInCart(item._id)}
                    >
                      {added[item._id] ? '✅ ' + t('checkout.added') : isInCart(item._id) ? '🛒 ' + t('checkout.inCart') : '🛒 ' + t('checkout.addToCart')}
                    </button>
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
