import { useQuery } from "@tanstack/react-query";
import { useRoute } from "wouter";
import { useState } from "react";
import { Loader2 } from "lucide-react";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import ProductCustomizer from "@/components/ProductCustomizer";
import { Button } from "@/components/ui/button";
import { useCart } from "@/hooks/use-cart";

export default function ProductPage() {
  const [_, params] = useRoute<{ id: string }>("/product/:id");
  const productId = params?.id ? parseInt(params.id) : 0;
  
  const { data: product, isLoading } = useQuery({
    queryKey: [`/api/products/${productId}`],
  });
  
  const { addToCart } = useCart();
  const [isCustomizing, setIsCustomizing] = useState(false);
  const [customization, setCustomization] = useState<{
    text: string;
    color: string;
    font: string;
  } | null>(null);

  const handleAddToCart = () => {
    if (product) {
      addToCart({
        ...product,
        quantity: 1,
        customization: customization ? { ...customization } : null
      });
    }
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!product) {
    return (
      <div className="min-h-screen">
        <Header />
        <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
          <div className="text-center">
            <h2 className="text-2xl font-bold">Product Not Found</h2>
            <p className="mt-2">The product you're looking for doesn't exist or has been removed.</p>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen">
      <Header />
      
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 md:py-12">
        {isCustomizing ? (
          <ProductCustomizer 
            product={product}
            onCancel={() => setIsCustomizing(false)}
            onComplete={(customizationData) => {
              setCustomization(customizationData);
              setIsCustomizing(false);
            }}
          />
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="rounded-lg overflow-hidden">
              <img 
                src={product.image} 
                alt={product.name} 
                className="w-full h-auto object-cover aspect-square md:aspect-auto md:h-96"
              />
            </div>
            
            <div className="flex flex-col">
              <h1 className="text-3xl font-bold text-neutral-900">{product.name}</h1>
              <p className="mt-2 text-sm text-neutral-500 capitalize">{product.category.replace('-', ' ')}</p>
              
              <div className="mt-4">
                <p className="text-2xl font-semibold text-neutral-900">${product.price.toFixed(2)}</p>
                {customization && (
                  <p className="text-sm text-secondary mt-1">Customization: +$10.00</p>
                )}
              </div>
              
              <div className="mt-6">
                <h3 className="text-lg font-medium text-neutral-900">Description</h3>
                <p className="mt-2 text-neutral-600">{product.description}</p>
              </div>
              
              {customization ? (
                <div className="mt-6 p-4 bg-neutral-50 rounded-lg">
                  <h3 className="text-sm font-medium text-neutral-900 mb-2">Your Customization</h3>
                  <div className="p-4 bg-white border border-neutral-200 rounded-md flex items-center justify-center h-16">
                    <div
                      style={{
                        color: customization.color,
                        fontFamily: customization.font
                      }}
                      className="text-lg font-medium"
                    >
                      {customization.text}
                    </div>
                  </div>
                  <Button
                    variant="outline"
                    size="sm"
                    className="mt-3"
                    onClick={() => setIsCustomizing(true)}
                  >
                    Edit Customization
                  </Button>
                </div>
              ) : (
                <div className="mt-6">
                  <p className="text-neutral-600 mb-2">Add your personal touch with customization (+$10.00)</p>
                </div>
              )}
              
              <div className="mt-auto pt-8 flex space-x-4">
                {!customization && (
                  <Button
                    variant="outline"
                    onClick={() => setIsCustomizing(true)}
                    className="flex-1 sm:flex-none"
                  >
                    Customize
                  </Button>
                )}
                <Button
                  onClick={handleAddToCart}
                  className="flex-1 sm:flex-none"
                >
                  Add to Cart
                </Button>
              </div>
            </div>
          </div>
        )}
      </main>
      
      <Footer />
    </div>
  );
}
