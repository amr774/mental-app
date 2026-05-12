import { createContext, useContext, useState, useCallback } from 'react';

const CartContext = createContext(null);

const CART_KEY = 'mh_cart';
const load = () => { try { return JSON.parse(localStorage.getItem(CART_KEY)) || []; } catch { return []; } };
const save = (items) => { try { localStorage.setItem(CART_KEY, JSON.stringify(items)); } catch {} };

export function CartProvider({ children }) {
    const [items, setItems] = useState(load);

    const addItem = useCallback((item) => {
        // item: { id, itemType:'pet'|'store', name, price, image }
        setItems(prev => {
            if (prev.some(i => i.id === item.id && i.itemType === item.itemType)) return prev;
            const next = [...prev, item];
            save(next);
            return next;
        });
    }, []);

    const removeItem = useCallback((id, itemType) => {
        setItems(prev => {
            const next = prev.filter(i => !(i.id === id && i.itemType === itemType));
            save(next);
            return next;
        });
    }, []);

    const clearCart = useCallback(() => {
        setItems([]);
        save([]);
    }, []);

    const count = items.length;
    const subtotal = items.reduce((s, i) => s + (i.price || 0), 0);

    return (
        <CartContext.Provider value={{ items, addItem, removeItem, clearCart, count, subtotal }}>
            {children}
        </CartContext.Provider>
    );
}

export const useCart = () => useContext(CartContext);
