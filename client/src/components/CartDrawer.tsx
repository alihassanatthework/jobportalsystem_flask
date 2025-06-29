import { X, ShoppingBag } from "lucide-react";
import { useCart } from "@/hooks/use-cart";
import CartItem from "@/components/CartItem";
import { Button } from "@/components/ui/button";

interface CartDrawerProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function CartDrawer({ isOpen, onClose }: CartDrawerProps) {
  const { cartItems, cartTotal } = useCart();
  
  if (!isOpen) return null;
  
  return (
    <div className="fixed inset-0 z-50 overflow-hidden">
      <div 
        className="absolute inset-0 bg-neutral-900 bg-opacity-50" 
        onClick={onClose}
      ></div>
      <div className="absolute inset-y-0 right-0 max-w-full flex">
        <div className="relative w-screen max-w-md">
          <div className="h-full flex flex-col bg-white shadow-xl">
            <div className="flex-1 h-0 overflow-y-auto custom-scrollbar">
              <div className="py-6 px-4 bg-primary sm:px-6">
                <div className="flex items-center justify-between">
                  <h2 className="text-lg font-medium text-white">Shopping Cart</h2>
                  <button 
                    onClick={onClose} 
                    className="text-white hover:text-neutral-200"
                  >
                    <X className="h-6 w-6" />
                  </button>
                </div>
                <p className="mt-1 text-sm text-primary-light">
                  {cartItems.length} {cartItems.length === 1 ? 'item' : 'items'}
                </p>
              </div>
              
              <div className="flex-1 py-6 px-4 sm:px-6">
                {cartItems.length === 0 ? (
                  <div className="text-center py-24">
                    <ShoppingBag className="mx-auto h-12 w-12 text-neutral-400" />
                    <h3 className="mt-2 text-sm font-medium text-neutral-900">Your cart is empty</h3>
                    <p className="mt-1 text-sm text-neutral-500">Start shopping to add items to your cart.</p>
                    <div className="mt-6">
                      <Button onClick={onClose}>
                        View Products
                      </Button>
                    </div>
                  </div>
                ) : (
                  <div className="space-y-6">
                    {cartItems.map((item) => (
                      <CartItem key={item.id} item={item} />
                    ))}
                  </div>
                )}
              </div>
            </div>
            
            {cartItems.length > 0 && (
              <div className="border-t border-neutral-200 py-6 px-4 sm:px-6">
                <div className="flex justify-between text-base font-medium text-neutral-900">
                  <p>Subtotal</p>
                  <p>${cartTotal.toFixed(2)}</p>
                </div>
                <p className="mt-0.5 text-sm text-neutral-500">Shipping and taxes calculated at checkout.</p>
                <div className="mt-6">
                  <Button className="w-full justify-center" size="lg">
                    Checkout
                  </Button>
                </div>
                <div className="mt-6 flex justify-center text-sm text-center text-neutral-500">
                  <p>
                    or{' '}
                    <button 
                      onClick={onClose} 
                      className="text-primary font-medium hover:text-primary-dark"
                    >
                      Continue Shopping<span aria-hidden="true"> &rarr;</span>
                    </button>
                  </p>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
