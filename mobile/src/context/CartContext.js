import React, { createContext, useContext, useState, useCallback } from 'react';

const CartContext = createContext(null);

export const CartProvider = ({ children }) => {
  const [items, setItems] = useState([]);
  const [addedFlash, setAddedFlash] = useState({}); // { "id:itemType": true }

  const addItem = useCallback((item) => {
    // item must have: { id, itemType, name, price, image? }
    setItems((prev) => {
      const exists = prev.find((i) => i.id === item.id && i.itemType === item.itemType);
      if (exists) return prev;
      return [...prev, { ...item, quantity: 1 }];
    });
    const key = `${item.id}:${item.itemType}`;
    setAddedFlash((prev) => ({ ...prev, [key]: true }));
    setTimeout(() => setAddedFlash((prev) => ({ ...prev, [key]: false })), 1800);
  }, []);

  const removeItem = useCallback((itemId, itemType) => {
    setItems((prev) => prev.filter((i) => !(i.id === itemId && i.itemType === itemType)));
  }, []);

  const clearCart = useCallback(() => setItems([]), []);

  const isInCart = useCallback((itemId, itemType) =>
    items.some((i) => i.id === itemId && i.itemType === itemType), [items]);

  const wasJustAdded = useCallback((itemId, itemType) =>
    !!addedFlash[`${itemId}:${itemType}`], [addedFlash]);

  const total = items.reduce((sum, i) => sum + (i.price || 0) * i.quantity, 0);
  const count = items.length;

  return (
    <CartContext.Provider value={{ items, addItem, removeItem, clearCart, isInCart, wasJustAdded, total, count }}>
      {children}
    </CartContext.Provider>
  );
};

export const useCart = () => {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error('useCart must be used inside CartProvider');
  return ctx;
};

export default CartContext;
