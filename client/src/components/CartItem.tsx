import { Minus, Plus, Trash2 } from "lucide-react";
import { useCart } from "@/hooks/use-cart";
import { Button } from "@/components/ui/button";

interface CartItemProps {
  item: {
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
}

export default function CartItem({ item }: CartItemProps) {
  const { updateItemQuantity, removeItem } = useCart();
  
  const itemTotal = (item.price + (item.customization ? 10 : 0)) * item.quantity;
  
  return (
    <div className="flex items-start">
      <div className="flex-shrink-0 w-20 h-20 bg-neutral-200 rounded-md overflow-hidden">
        <img src={item.image} alt={item.name} className="w-full h-full object-center object-cover" />
      </div>
      <div className="ml-4 flex-1 flex flex-col">
        <div>
          <div className="flex justify-between">
            <h3 className="text-sm font-medium text-neutral-900">{item.name}</h3>
            <p className="ml-4 text-sm font-medium text-neutral-900">${itemTotal.toFixed(2)}</p>
          </div>
          <p className="mt-1 text-sm text-neutral-500 capitalize">{item.category.replace('-', ' ')}</p>
          {item.customization && (
            <p className="mt-1 text-sm text-secondary">Customized (+$10.00)</p>
          )}
        </div>
        <div className="flex-1 flex items-end justify-between text-sm">
          <div className="flex items-center">
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8 p-0 text-neutral-500 hover:text-neutral-700"
              onClick={() => {
                if (item.quantity > 1) {
                  updateItemQuantity(item.id, item.quantity - 1);
                }
              }}
              disabled={item.quantity <= 1}
            >
              <Minus className="h-4 w-4" />
            </Button>
            <span className="mx-2 text-neutral-900">{item.quantity}</span>
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8 p-0 text-neutral-500 hover:text-neutral-700"
              onClick={() => updateItemQuantity(item.id, item.quantity + 1)}
            >
              <Plus className="h-4 w-4" />
            </Button>
          </div>
          <Button
            variant="ghost"
            size="sm"
            className="font-medium text-primary hover:text-primary-dark"
            onClick={() => removeItem(item.id)}
          >
            <Trash2 className="h-4 w-4 mr-1" />
            Remove
          </Button>
        </div>
      </div>
    </div>
  );
}
