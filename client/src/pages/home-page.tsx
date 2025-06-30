import { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { Link, useLocation } from "wouter";
import { Job } from "@shared/schema";
import { useAuth } from "@/hooks/use-auth";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Loader2, BriefcaseBusiness, Briefcase, Building, Search, MapPin, LucideIcon, CheckCircle2, LineChart, Users, ArrowRight } from "lucide-react";

// Feature type for the features section
type Feature = {
  title: string;
  description: string;
  icon: LucideIcon;
};

// Sample features
const features: Feature[] = [
  {
    title: "Find Top Jobs",
    description: "Browse thousands of the latest job openings from top employers.",
    icon: Briefcase,
  },
  {
    title: "Smart Matching",
    description: "Our AI-powered system connects you with opportunities that match your skills and experience.",
    icon: CheckCircle2,
  },
  {
    title: "Career Growth",
    description: "Get valuable insights and resources to help advance your career journey.",
    icon: LineChart,
  },
  {
    title: "Connect with Employers",
    description: "Communicate directly with hiring managers and recruiters.",
    icon: Users,
  },
];

export default function HomePage() {
  const [, navigate] = useLocation();
  const { user } = useAuth();
  
  // Temporarily disable jobs query to fix the API issue
  // const { data: latestJobs, isLoading } = useQuery<Job[]>({
  //   queryKey: ["/jobs", { limit: 6 }],
  // });

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return new Intl.DateTimeFormat("en-US", {
      month: "short",
      day: "numeric",
    }).format(date);
  };

  return (
    <div className="min-h-screen flex flex-col">
      <main className="flex-grow">
        {/* Hero Section */}
        <section className="bg-gradient-to-b from-blue-50 to-white dark:from-gray-900 dark:to-gray-800 pt-20 pb-16 md:pt-28 md:pb-24">
          <div className="container mx-auto px-4 md:px-6">
            <div className="flex flex-col md:flex-row items-center">
              <div className="md:w-1/2 md:pr-10">
                <h1 className="text-4xl md:text-5xl font-bold leading-tight tracking-tight text-gray-900 dark:text-white mb-4">
                  Find Your Dream Job <span className="text-primary">Today</span>
                </h1>
                <p className="text-xl text-gray-600 dark:text-gray-300 mb-8 max-w-lg">
                  Connect with top employers and discover opportunities that match your skills and career goals.
                </p>
                <div className="flex flex-col sm:flex-row gap-4">
                  {user ? (
                    <>
                      <Button 
                        size="lg" 
                        onClick={() => navigate("/jobs")}
                        className="group relative overflow-hidden"
                      >
                        <span className="relative z-10">Browse Jobs</span>
                      </Button>
                      <Button 
                        size="lg" 
                        variant="outline" 
                        onClick={() => navigate("/profile")}
                        className="group relative overflow-hidden"
                      >
                        <span className="relative z-10">My Dashboard</span>
                      </Button>
                    </>
                  ) : (
                    <>
                      <Button 
                        size="lg" 
                        onClick={() => navigate("/auth")}
                        className="group relative overflow-hidden"
                      >
                        <span className="relative z-10">Get Started</span>
                      </Button>
                      <Button 
                        size="lg" 
                        variant="outline" 
                        onClick={() => navigate("/jobs")}
                        className="group relative overflow-hidden"
                      >
                        <span className="relative z-10">Browse Jobs</span>
                      </Button>
                    </>
                  )}
                </div>
              </div>
              <div className="md:w-1/2 mt-10 md:mt-0">
                <div className="relative">
                  <div className="w-full h-64 md:h-80 lg:h-96 bg-gradient-to-r from-blue-400 to-purple-500 rounded-lg flex items-center justify-center text-white text-xl font-bold shadow-xl">
                    Job Portal Dashboard Preview
                  </div>
                  <div className="absolute -bottom-6 -right-6 w-24 h-24 bg-primary rounded-full flex items-center justify-center text-white shadow-lg">
                    <Briefcase className="w-10 h-10" />
                  </div>
                </div>
              </div>
            </div>

            {/* Search Bar */}
            <div className="mt-16 max-w-4xl mx-auto">
              <Card className="border-0 shadow-lg">
                <CardContent className="p-4">
                  <form className="flex flex-col md:flex-row gap-4" onSubmit={(e) => {
                    e.preventDefault();
                    navigate("/jobs");
                  }}>
                    <div className="flex-1 relative">
                      <Search className="absolute left-3 top-3 h-5 w-5 text-gray-400" />
                      <input
                        type="text"
                        placeholder="Job title, keywords, or company"
                        className="w-full pl-10 pr-4 py-2.5 rounded-md border border-gray-200 dark:border-gray-700 focus:outline-none focus:ring-2 focus:ring-primary"
                      />
                    </div>
                    <div className="flex-1 relative">
                      <MapPin className="absolute left-3 top-3 h-5 w-5 text-gray-400" />
                      <input
                        type="text"
                        placeholder="Location"
                        className="w-full pl-10 pr-4 py-2.5 rounded-md border border-gray-200 dark:border-gray-700 focus:outline-none focus:ring-2 focus:ring-primary"
                      />
                    </div>
                    <Button type="submit" className="md:w-auto">
                      Find Jobs
                    </Button>
                  </form>
                </CardContent>
              </Card>
            </div>
          </div>
        </section>

        {/* Features Section */}
        <section className="py-16 bg-white dark:bg-gray-800">
          <div className="container mx-auto px-4 md:px-6">
            <div className="text-center mb-12">
              <h2 className="text-3xl font-bold text-gray-900 dark:text-white">Why Choose Our Platform</h2>
              <p className="mt-4 text-xl text-gray-600 dark:text-gray-300 max-w-2xl mx-auto">
                We provide the tools and resources you need to succeed in your job search.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
              {features.map((feature, index) => (
                <div key={index}>
                  <Card className="border-0 shadow-sm hover:shadow-md transition-all duration-300 h-full group">
                    <CardHeader>
                      <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center text-primary mb-4 group-hover:scale-110 transition-transform duration-300">
                        <feature.icon className="h-6 w-6" />
                      </div>
                      <CardTitle className="group-hover:text-primary transition-colors duration-300">{feature.title}</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <p className="text-gray-600 dark:text-gray-300">{feature.description}</p>
                    </CardContent>
                  </Card>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Call to Action Section */}
        {!user && (
          <section className="py-16 bg-primary text-white">
            <div className="container mx-auto px-4 md:px-6 text-center">
              <h2 className="text-3xl font-bold mb-4">Ready to Start Your Journey?</h2>
              <p className="text-xl mb-8 max-w-2xl mx-auto">
                Join thousands of job seekers and employers who have found success on our platform.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Button 
                  size="lg" 
                  variant="secondary"
                  onClick={() => navigate("/auth")}
                >
                  Sign Up Now
                </Button>
                <Button 
                  size="lg" 
                  variant="outline"
                  onClick={() => navigate("/auth")}
                >
                  Already have an account? Sign In
                </Button>
              </div>
            </div>
          </section>
        )}
      </main>
    </div>
  );
}
