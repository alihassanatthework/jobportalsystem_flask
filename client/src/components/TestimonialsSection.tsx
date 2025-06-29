import { User, Star } from "lucide-react";

export default function TestimonialsSection() {
  const testimonials = [
    {
      name: "Michael T.",
      role: "Software Engineer",
      content: "The customized business cards made me stand out at networking events. I received compliments on the design, and the quality was exceptional.",
    },
    {
      name: "Jessica K.",
      role: "Marketing Director",
      content: "The leather portfolio folder made a significant impact during my interviews. It helped me organize my materials and presented a polished, professional image.",
    },
    {
      name: "David R.",
      role: "Financial Analyst",
      content: "I used the Interview Success Kit to prepare for my job interviews. The resources were incredibly helpful, and I landed a position at my dream company.",
    }
  ];

  return (
    <section className="py-16 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <h2 className="text-2xl font-bold text-neutral-900">What Job Seekers Say</h2>
          <p className="mt-4 text-lg text-neutral-600 max-w-2xl mx-auto">
            Our customers have found success in their career journeys with our professional products.
          </p>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {testimonials.map((testimonial, index) => (
            <div key={index} className="bg-neutral-50 rounded-lg p-6 shadow-sm">
              <div className="flex items-center mb-4">
                <div className="h-12 w-12 rounded-full bg-neutral-200 flex items-center justify-center text-neutral-500">
                  <User className="h-6 w-6" />
                </div>
                <div className="ml-4">
                  <h4 className="text-lg font-medium text-neutral-900">{testimonial.name}</h4>
                  <p className="text-sm text-neutral-500">{testimonial.role}</p>
                </div>
              </div>
              <p className="text-neutral-700">{testimonial.content}</p>
              <div className="mt-4 flex text-secondary">
                {[...Array(5)].map((_, i) => (
                  <Star key={i} className="h-5 w-5 fill-current" />
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
