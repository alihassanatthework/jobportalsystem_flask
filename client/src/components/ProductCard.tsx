import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { useState } from "react";
import ProductCustomizer from "@/components/ProductCustomizer";
import { useCart } from "@/hooks/use-cart";

interface ProductCardProps {
  product: {
    id: number;
    name: string;
    price: number;
    description: string;
    category: string;
    image: string;
  };
}

export default function ProductCard({ product }: ProductCardProps) {
  const [isCustomizing, setIsCustomizing] = useState(false);
  const { addToCart } = useCart();

  const handleAddToCart = () => {
    addToCart({
      ...product,
      quantity: 1,
      customization: null
    });
  };

  const handleCustomize = (customization: { text: string; color: string; font: string; }) => {
    addToCart({
      ...product,
      quantity: 1,
      customization
    });
    setIsCustomizing(false);
  };

  return (
    <>
      <div className="product-card bg-white rounded-lg shadow-md overflow-hidden">
        <Link href={`/product/${product.id}`}>
          <div className="aspect-w-3 aspect-h-2">
            <img 
              src={product.image} 
              alt={product.name} 
              className="w-full h-56 object-cover"
            />
          </div>
        </Link>
        <div className="p-4">
          <Link href={`/product/${product.id}`}>
            <h3 className="text-lg font-medium text-neutral-900">{product.name}</h3>
          </Link>
          <p className="mt-1 text-sm text-neutral-500">{product.description}</p>
          <div className="mt-3 flex justify-between items-center">
            <span className="text-lg font-medium text-neutral-900">${product.price.toFixed(2)}</span>
            <div className="flex space-x-2">
              <Button 
                variant="outline" 
                size="sm"
                onClick={() => setIsCustomizing(true)}
              >
                Customize
              </Button>
              <Button 
                size="sm"
                onClick={handleAddToCart}
              >
                Add to Cart
              </Button>
            </div>
          </div>
        </div>
      </div>

      {isCustomizing && (
        <ProductCustomizer 
          product={product} 
          onCancel={() => setIsCustomizing(false)}
          onComplete={handleCustomize}
        />
      )}
    </>
  );
}
