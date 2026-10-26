import { useState, useEffect } from 'react';
import { useLang }  from '../context/LanguageContext';
import { useCart }  from '../context/CartContext';
import { useSaved } from '../context/SavedContext';
import { storeService } from '../services/api';
import './Store.css';

const CATEGORIES = ['all', 'general', 'books', 'electronics', 'toys', 'other'];
const CONDITION_COLOR = { new: '#4ade80', 'like-new': '#4ecdc4', good: '#94a3b8', fair: '#fbbf24' };

export default function Store() {
  const { t } = useLang();
  const { addItem, items: cartItems } = useCart();
  const { toggleSave, isSaved } = useSaved();

  const [items,    setItems]    = useState([]);
  const [search,   setSearch]   = useState('');
  const [category, setCategory] = useState('all');
  const [loading,  setLoading]  = useState(true);
  const [added,    setAdded]    = useState({});

  const loadItems = async () => {
    setLoading(true);
    try {
      const data = await storeService.getAll(search, category === 'all' ? '' : category);
      setItems(data);
    } catch { setItems([]); }
    finally { setLoading(false); }
  };

  useEffect(() => { loadItems(); }, [search, category]);

  const handleToggleSave = (item) => {
    toggleSave({
      id: item._id, itemType: 'store',
      name: item.title, price: item.price, image: item.image || '',
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
            const saved = isSaved(item._id, 'store');
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
                      onClick={() => handleToggleSave(item)}
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
