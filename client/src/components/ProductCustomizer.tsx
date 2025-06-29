import { useState } from "react";
import { X, Check, Pencil } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";

interface ProductCustomizerProps {
  product: {
    id: number;
    name: string;
    price: number;
    category: string;
    image: string;
  };
  onCancel: () => void;
  onComplete: (customization: { text: string; color: string; font: string; }) => void;
}

export default function ProductCustomizer({ product, onCancel, onComplete }: ProductCustomizerProps) {
  const [customizationText, setCustomizationText] = useState("");
  const [customizationColor, setCustomizationColor] = useState("#4F46E5");
  const [customizationFont, setCustomizationFont] = useState("Sans-serif");
  
  const handleComplete = () => {
    if (customizationText.trim()) {
      onComplete({
        text: customizationText,
        color: customizationColor,
        font: customizationFont
      });
    }
  };
  
  return (
    <Dialog open={true} onOpenChange={(open) => !open && onCancel()}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <div className="flex items-start">
            <div className="mx-auto flex-shrink-0 flex items-center justify-center h-12 w-12 rounded-full bg-primary-50 sm:mx-0 sm:h-10 sm:w-10">
              <Pencil className="h-6 w-6 text-primary" />
            </div>
            <div className="mt-3 text-center sm:mt-0 sm:ml-4 sm:text-left">
              <DialogTitle>Customize Your Product</DialogTitle>
              <DialogDescription>
                Personalize your {product.name} with custom options. Preview will update as you make changes.
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>
        
        <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-4">
            <div>
              <Label htmlFor="customizationText">Custom Text</Label>
              <Input 
                id="customizationText" 
                value={customizationText} 
                onChange={(e) => setCustomizationText(e.target.value)} 
                placeholder="Your name, title, etc."
              />
            </div>
            
            <div>
              <Label htmlFor="customizationColor">Text Color</Label>
              <div className="mt-1 flex items-center space-x-2">
                <input 
                  type="color" 
                  id="customizationColor" 
                  value={customizationColor} 
                  onChange={(e) => setCustomizationColor(e.target.value)} 
                  className="h-8 w-8 rounded border border-neutral-300"
                />
                <Select value={customizationColor} onValueChange={(value) => setCustomizationColor(value)}>
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Select a color" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="#4F46E5">Indigo</SelectItem>
                    <SelectItem value="#000000">Black</SelectItem>
                    <SelectItem value="#1F2937">Dark Gray</SelectItem>
                    <SelectItem value="#F97316">Orange</SelectItem>
                    <SelectItem value="#06B6D4">Cyan</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            
            <div>
              <Label htmlFor="customizationFont">Font Style</Label>
              <Select value={customizationFont} onValueChange={(value) => setCustomizationFont(value)}>
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Select a font" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Sans-serif">Sans-serif</SelectItem>
                  <SelectItem value="Serif">Serif</SelectItem>
                  <SelectItem value="Monospace">Monospace</SelectItem>
                  <SelectItem value="Cursive">Cursive</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div className="pt-4">
              <p className="text-sm text-neutral-500">Customization adds $10.00 to the product price.</p>
            </div>
          </div>
          
          <div className="bg-neutral-50 p-4 rounded-lg">
            <h4 className="text-sm font-medium text-neutral-700 mb-3">Preview</h4>
            <div className="aspect-w-4 aspect-h-3 bg-white border border-neutral-200 rounded-md overflow-hidden">
              <div className="flex items-center justify-center h-full">
                {customizationText ? (
                  <div 
                    style={{
                      color: customizationColor,
                      fontFamily: customizationFont
                    }} 
                    className="text-lg font-medium"
                  >
                    {customizationText}
                  </div>
                ) : (
                  <div className="text-neutral-400 text-sm">Enter custom text to preview</div>
                )}
              </div>
            </div>
            
            <div className="mt-4">
              <p className="text-sm font-medium text-neutral-900">{product.name}</p>
              <p className="text-sm text-neutral-500">Base price: ${product.price.toFixed(2)}</p>
              {customizationText && (
                <>
                  <p className="text-sm text-secondary mt-1">Customization: +$10.00</p>
                  <p className="text-sm font-medium text-neutral-900 mt-2">
                    Total: ${(product.price + 10).toFixed(2)}
                  </p>
                </>
              )}
            </div>
          </div>
        </div>

        <DialogFooter className="sm:flex sm:flex-row-reverse">
          <Button
            onClick={handleComplete}
            disabled={!customizationText.trim()}
          >
            <Check className="h-4 w-4 mr-1" />
            Add to Cart
          </Button>
          <Button
            variant="outline"
            onClick={onCancel}
            className="mt-3 sm:mt-0 sm:mr-3"
          >
            <X className="h-4 w-4 mr-1" />
            Cancel
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
