import React, { createContext, useState, useContext, useEffect } from 'react';

const CartContext = createContext();

export const useCart = () => {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error('useCart must be used within CartProvider');
  }
  return context;
};

export const CartProvider = ({ children }) => {
  const [cartItems, setCartItems] = useState(() => {
    // Load cart from localStorage on init
    const savedCart = localStorage.getItem('cart');
    return savedCart ? JSON.parse(savedCart) : [];
  });

  // Save cart to localStorage whenever it changes
  useEffect(() => {
    localStorage.setItem('cart', JSON.stringify(cartItems));
  }, [cartItems]);

  const addToCart = (product, selectedColor, selectedSize, selectedMaterial, selectedBranding = [], quantity = 1) => {
    setCartItems(prevItems => {
      // Check if item with same product, color, size, material AND branding already exists
      const existingItemIndex = prevItems.findIndex(
        item => 
          item.id === product.id && 
          item.selectedColor === selectedColor && 
          item.selectedSize === selectedSize &&
          item.selectedMaterial === selectedMaterial &&
          JSON.stringify(item.selectedBranding) === JSON.stringify(selectedBranding)
      );

      if (existingItemIndex > -1) {
        // Update quantity of existing item
        const updatedItems = [...prevItems];
        updatedItems[existingItemIndex].quantity += quantity;
        return updatedItems;
      } else {
        // Calculate total branding price
        const brandingPrice = selectedBranding.reduce((sum, b) => sum + (b.location?.price || 0), 0);
        
        // Add new item
        return [...prevItems, {
          id: product.id,
          name: product.name,
          article: product.article,
          price_from: product.price_from,
          image: product.images?.[0]?.image_url || '/images/placeholder.jpg',
          selectedColor,
          selectedSize,
          selectedMaterial,
          selectedBranding,
          brandingPrice,
          quantity,
          category_name: product.category_name
        }];
      }
    });
  };

  const removeFromCart = (itemIndex) => {
    setCartItems(prevItems => prevItems.filter((_, i) => i !== itemIndex));
  };

  const updateQuantity = (itemIndex, newQuantity) => {
    if (newQuantity < 1) {
      removeFromCart(itemIndex);
      return;
    }

    setCartItems(prevItems => 
      prevItems.map((item, i) => 
        i === itemIndex ? { ...item, quantity: newQuantity } : item
      )
    );
  };

  const clearCart = () => {
    setCartItems([]);
  };

  const getTotalPrice = () => {
    return cartItems.reduce((total, item) => total + (item.price_from * item.quantity), 0);
  };

  const getTotalItems = () => {
    return cartItems.reduce((total, item) => total + item.quantity, 0);
  };

  return (
    <CartContext.Provider value={{
      cartItems,
      addToCart,
      removeFromCart,
      updateQuantity,
      clearCart,
      getTotalPrice,
      getTotalItems
    }}>
      {children}
    </CartContext.Provider>
  );
};
