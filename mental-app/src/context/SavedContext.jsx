import { createContext, useContext, useState, useCallback } from 'react';

const SavedContext = createContext(null);

const KEY = 'mh_saved_v2';
const load    = () => { try { return JSON.parse(localStorage.getItem(KEY)) || []; } catch { return []; } };
const persist = (items) => { try { localStorage.setItem(KEY, JSON.stringify(items)); } catch { /* Storage may be unavailable; keep the in-memory state. */ } };

export function SavedProvider({ children }) {
  const [items, setItems] = useState(load);

  const toggleSave = useCallback((item) => {
    setItems(prev => {
      const exists = prev.some(i => i.id === item.id && i.itemType === item.itemType);
      const next = exists
        ? prev.filter(i => !(i.id === item.id && i.itemType === item.itemType))
        : [...prev, item];
      persist(next);
      return next;
    });
  }, []);

  const isSaved = useCallback((id, itemType) => {
    return items.some(i => i.id === id && i.itemType === itemType);
  }, [items]);

  const remove = useCallback((id, itemType) => {
    setItems(prev => {
      const next = prev.filter(i => !(i.id === id && i.itemType === itemType));
      persist(next);
      return next;
    });
  }, []);

  return (
    <SavedContext.Provider value={{ items, toggleSave, isSaved, remove, count: items.length }}>
      {children}
    </SavedContext.Provider>
  );
}

export const useSaved = () => useContext(SavedContext);
