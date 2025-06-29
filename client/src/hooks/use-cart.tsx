import { createContext, ReactNode, useContext, useState } from "react";
import { useToast } from "@/hooks/use-toast";

type CartItem = {
  id: number;
  name: string;
  price: number;
  category: string;
  image: string;
  quantity: number;
  customization: {
    text: string;
    color: string;
    font: string;
  } | null;
};

type CartContextType = {
  cartItems: CartItem[];
  cartTotal: number;
  isOpen: boolean;
  openCart: () => void;
  closeCart: () => void;
  addToCart: (item: CartItem) => void;
  updateItemQuantity: (id: number, quantity: number) => void;
  removeItem: (id: number) => void;
};

const CartContext = createContext<CartContextType | undefined>(undefined);

export function CartProvider({ children }: { children: ReactNode }) {
  const [cartItems, setCartItems] = useState<CartItem[]>([]);
  const [isOpen, setIsOpen] = useState(false);
  const { toast } = useToast();

  const cartTotal = cartItems.reduce(
    (total, item) => 
      total + (item.price + (item.customization ? 10 : 0)) * item.quantity, 
    0
  );

  const openCart = () => {
    setIsOpen(true);
  };

  const closeCart = () => {
    setIsOpen(false);
  };

  const addToCart = (item: CartItem) => {
    const existingItemIndex = cartItems.findIndex(
      (cartItem) => 
        cartItem.id === item.id && 
        JSON.stringify(cartItem.customization) === JSON.stringify(item.customization)
    );

    if (existingItemIndex !== -1) {
      // Item exists with same customization - increase quantity
      const updatedItems = [...cartItems];
      updatedItems[existingItemIndex].quantity += item.quantity;
      setCartItems(updatedItems);
    } else {
      // New item or different customization - add to cart
      setCartItems([...cartItems, item]);
    }

    toast({
      title: "Added to cart",
      description: `${item.name} has been added to your cart.`,
    });
    
    openCart();
    
    // Auto close cart after delay
    setTimeout(() => {
      closeCart();
    }, 3000);
  };

  const updateItemQuantity = (id: number, quantity: number) => {
    setCartItems(
      cartItems.map((item) => 
        item.id === id ? { ...item, quantity } : item
      )
    );
  };

  const removeItem = (id: number) => {
    setCartItems(cartItems.filter((item) => item.id !== id));
  };

  return (
    <CartContext.Provider
      value={{
        cartItems,
        cartTotal,
        isOpen,
        openCart,
        closeCart,
        addToCart,
        updateItemQuantity,
        removeItem,
      }}
    >
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error("useCart must be used within a CartProvider");
  }
  return context;
}
