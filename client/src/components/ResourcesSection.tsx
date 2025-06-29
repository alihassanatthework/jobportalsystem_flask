import { ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function ResourcesSection() {
  const resources = [
    {
      title: "Resume Writing Guide",
      description: "Learn how to craft a compelling resume that highlights your skills and experience effectively.",
      image: "https://images.unsplash.com/photo-1586281380349-632531db7ed4?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=800&q=80"
    },
    {
      title: "Interview Preparation Tips",
      description: "Essential strategies to help you prepare for and excel in job interviews across industries.",
      image: "https://images.unsplash.com/photo-1521791136064-7986c2920216?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=800&q=80"
    },
    {
      title: "Networking Strategies",
      description: "Learn effective networking techniques to build professional relationships and unlock opportunities.",
      image: "https://images.unsplash.com/photo-1611095973763-414019e72400?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=800&q=80"
    }
  ];

  return (
    <section className="py-16 bg-neutral-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <h2 className="text-2xl font-bold text-neutral-900">Career Resources</h2>
          <p className="mt-4 text-lg text-neutral-600 max-w-2xl mx-auto">
            Access valuable resources to help you excel in your job search and career development.
          </p>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {resources.map((resource, index) => (
            <div key={index} className="bg-white rounded-lg shadow-sm overflow-hidden">
              <img 
                src={resource.image} 
                alt={resource.title} 
                className="w-full h-48 object-cover"
              />
              <div className="p-6">
                <h3 className="text-lg font-medium text-neutral-900">{resource.title}</h3>
                <p className="mt-2 text-neutral-600">{resource.description}</p>
                <a href="#" className="mt-4 inline-flex items-center text-primary hover:text-primary-dark">
                  Read More
                  <ArrowRight className="ml-1 h-4 w-4" />
                </a>
              </div>
            </div>
          ))}
        </div>
        
        <div className="mt-10 text-center">
          <Button size="lg">
            View All Resources
          </Button>
        </div>
      </div>
    </section>
  );
}
