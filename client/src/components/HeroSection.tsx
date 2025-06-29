import { Link } from "wouter";
import { Button } from "@/components/ui/button";

export default function HeroSection() {
  return (
    <section className="relative bg-neutral-900 text-white overflow-hidden">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 sm:py-24">
        <div className="relative z-10 max-w-2xl lg:max-w-3xl space-y-5">
          <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold leading-tight">
            Handcrafted Products for Your Professional Journey
          </h1>
          <p className="text-lg sm:text-xl text-neutral-300 max-w-xl">
            Personalized tools and resources to help you stand out in your job search and career advancement.
          </p>
          <div className="flex flex-wrap gap-4">
            <Button asChild size="lg">
              <Link href="#products">
                Browse Products
              </Link>
            </Button>
            <Button variant="outline" asChild size="lg" className="text-white border-white hover:bg-white hover:bg-opacity-10">
              <Link href="#">
                Career Resources
              </Link>
            </Button>
          </div>
        </div>
      </div>
      {/* Background image with overlay */}
      <div className="absolute inset-0 bg-gradient-to-r from-neutral-900 to-transparent">
        <img 
          src="https://images.unsplash.com/photo-1522202176988-66273c2fd55f?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=2070&q=80" 
          alt="Professional workspace" 
          className="absolute inset-0 h-full w-full object-cover object-right mix-blend-overlay opacity-30"
        />
      </div>
    </section>
  );
}
