import { useState, useEffect } from 'react';
import { petService, wishlistService } from '../services/api';
import { useLang }  from '../context/LanguageContext';
import { useCart }  from '../context/CartContext';
import { useSaved } from '../context/SavedContext';
import './PetStore.css';

const TYPE_EMOJI = {
  cat: '🐱', dog: '🐶', bird: '🐦', fish: '🐠', rabbit: '🐰', hamster: '🐹', turtle: '🐢',
};
const petEmoji = (type = '') => TYPE_EMOJI[type.toLowerCase()] || '🐾';


const PET_TYPES = ['all', 'dog', 'cat', 'bird', 'fish', 'rabbit', 'hamster'];
const MOOD_CHIPS = ['calm', 'anxious', 'lonely', 'stress', 'playful', 'social', 'general', 'sad'];

export default function PetStore() {
  const { t } = useLang();
  const { addItem, items: cartItems } = useCart();
  const { toggleSave, isSaved } = useSaved();

  const [pets,      setPets]      = useState([]);
  const [loading,   setLoading]   = useState(true);
  const [search,    setSearch]    = useState('');
  const [typeFilter,setTypeFilter]= useState('all');
  const [added,     setAdded]     = useState({});

  useEffect(() => {
    petService.getAll(typeFilter === 'all' ? '' : typeFilter, '', search)
      .then(data => setPets(data.length > 0 ? data : []))
      .catch(() => setPets([]))
      .finally(() => setLoading(false));
  }, [search, typeFilter]);

  const handleToggleSave = (pet) => {
    toggleSave({ id: pet._id || pet.id, itemType: 'pet', name: pet.name, price: pet.price || 0, image: pet.image || '' });
  };

  const handleAddToCart = (pet) => {
    const id = pet._id || pet.id;
    addItem({
      id,
      itemType: 'pet',
      name:     pet.name,
      price:    pet.price || 0,
      image:    pet.image || '',
    });
    setAdded(prev => ({ ...prev, [id]: true }));
    setTimeout(() => setAdded(prev => ({ ...prev, [id]: false })), 1800);
  };

  const isInCart = (id) => cartItems.some(i => i.id === id && i.itemType === 'pet');

  const isSold = (pet) => pet.status === 'sold';

  return (
    <div className="page">
      {/* Header */}
      <div className="animate-fade-up">
        <span className="badge badge-teal">{t('pets.badge')}</span>
        <h1 className="display pet-heading">{t('pets.heading')}</h1>
        <p className="subtext">{t('pets.sub')}</p>
      </div>

      {/* Filters */}
      <div className="store-filters animate-fade-up">
        <div className="store-search-wrap">
          <span>🔍</span>
          <input
            className="input"
            placeholder={t('pets.searchPlaceholder')}
            value={search}
            onChange={e => setSearch(e.target.value)}
          />
          {search && <button className="pet-search-clear" onClick={() => setSearch('')}>✕</button>}
        </div>

        {/* Type filter chips */}
        <div className="pet-mood-chips">
          {PET_TYPES.map(tp => (
            <button
              key={tp}
              className={`pet-chip ${typeFilter === tp ? 'active' : ''}`}
              onClick={() => setTypeFilter(tp)}
            >
              {tp === 'all' ? '🐾 ' + t('store.cat.all') : petEmoji(tp) + ' ' + tp}
            </button>
          ))}
        </div>

        {/* Mood chips */}
        <div className="pet-mood-chips">
          {MOOD_CHIPS.map(mood => (
            <button
              key={mood}
              className={`pet-chip ${search === mood ? 'active' : ''}`}
              onClick={() => setSearch(s => s === mood ? '' : mood)}
            >
              {mood}
            </button>
          ))}
        </div>
      </div>

      {/* Grid */}
      {loading ? (
        <p style={{ color: 'var(--text-3)', fontSize: 14 }}>{t('store.loading')}</p>
      ) : pets.length === 0 ? (
        <div className="pets-empty">
          <p>🐾</p>
          <p>{t('pets.empty')}</p>
        </div>
      ) : (
        <div className="store-grid animate-fade-up delay-1">
          {pets.map((pet, i) => {
            const id   = pet._id || pet.id;
            const sold = isSold(pet);
            const saved = isSaved(id, 'pet');

            return (
              <div key={id} className={`store-card card animate-fade-up delay-${(i % 4) + 1} ${sold ? 'store-card-sold' : ''}`}>
                {sold && <div className="store-sold-ribbon">{t('pets.sold')}</div>}

                {/* Image */}
                {pet.image
                  ? <img src={pet.image} alt={pet.name} className="store-card-img"
                         onError={e => { e.currentTarget.style.display = 'none'; }} />
                  : <div className="pet-emoji-placeholder">{petEmoji(pet.type)}</div>
                }

                {/* Type badge row */}
                <div className="store-card-top">
                  <span className="store-item-icon">{petEmoji(pet.type)}</span>
                  {pet.personality && (
                    <span className="badge badge-teal" style={{ fontSize: 11 }}>{pet.personality}</span>
                  )}
                </div>

                <h3 className="store-item-title">{pet.name}</h3>
                <span className="badge badge-lavender" style={{ alignSelf: 'flex-start', marginTop: -8 }}>{pet.type}</span>
                {pet.description && <p className="store-item-desc">{pet.description}</p>}

                <div className="store-item-footer">
                  <span className="store-price">{pet.price > 0 ? `${pet.price} ${t('store.currency')}` : t('pets.priceFree')}</span>
                </div>

                {!sold && (
                  <div className="store-card-actions">
                    <button
                      className={`btn btn-sm store-save-btn ${saved ? 'saved' : ''}`}
                      onClick={() => handleToggleSave(pet)}
                    >
                      {saved ? '🔖 ' + t('store.saved') : '🔖 ' + t('store.save')}
                    </button>
                    <button
                      className={`btn btn-sm store-buy-btn ${isInCart(id) || added[id] ? 'btn-ghost' : 'btn-primary'}`}
                      onClick={() => handleAddToCart(pet)}
                      disabled={isInCart(id)}
                    >
                      {added[id] ? '✅ ' + t('checkout.added') : isInCart(id) ? '🛒 ' + t('checkout.inCart') : '🛒 ' + t('checkout.addToCart')}
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
