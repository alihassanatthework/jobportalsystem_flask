import { CirclePlus, Zap, Clock, CheckCircle } from "lucide-react";

export default function FeaturesSection() {
  return (
    <section className="py-12 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
          <div className="space-y-3">
            <div className="inline-flex items-center justify-center h-12 w-12 rounded-md bg-primary-50 text-primary">
              <CirclePlus className="h-6 w-6" />
            </div>
            <h3 className="text-lg font-medium text-neutral-900">Fully Customizable</h3>
            <p className="text-sm text-neutral-500">Personalize every product to match your professional style</p>
          </div>
          
          <div className="space-y-3">
            <div className="inline-flex items-center justify-center h-12 w-12 rounded-md bg-primary-50 text-primary">
              <Zap className="h-6 w-6" />
            </div>
            <h3 className="text-lg font-medium text-neutral-900">Premium Quality</h3>
            <p className="text-sm text-neutral-500">Handcrafted with attention to every detail</p>
          </div>
          
          <div className="space-y-3">
            <div className="inline-flex items-center justify-center h-12 w-12 rounded-md bg-primary-50 text-primary">
              <Clock className="h-6 w-6" />
            </div>
            <h3 className="text-lg font-medium text-neutral-900">Fast Delivery</h3>
            <p className="text-sm text-neutral-500">Express shipping available for urgent job searches</p>
          </div>
          
          <div className="space-y-3">
            <div className="inline-flex items-center justify-center h-12 w-12 rounded-md bg-primary-50 text-primary">
              <CheckCircle className="h-6 w-6" />
            </div>
            <h3 className="text-lg font-medium text-neutral-900">Career-Focused</h3>
            <p className="text-sm text-neutral-500">Designed specifically for professional advancement</p>
          </div>
        </div>
      </div>
    </section>
  );
}
