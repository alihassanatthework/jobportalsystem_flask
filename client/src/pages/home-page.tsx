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
import { motion } from "framer-motion";

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
  
  const { data: latestJobs, isLoading } = useQuery<Job[]>({
    queryKey: ["/api/jobs", { limit: 6 }],
  });

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
              <motion.div 
                initial={{ opacity: 0, x: -50 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.8 }}
                className="md:w-1/2 md:pr-10"
              >
                <h1 className="text-4xl md:text-5xl font-bold leading-tight tracking-tight text-gray-900 dark:text-white mb-4">
                  Find Your Dream Job <motion.span 
                    className="text-primary bg-clip-text"
                    initial={{ backgroundSize: "100%" }}
                    animate={{ 
                      backgroundImage: [
                        "linear-gradient(90deg, #4F46E5, #8B5CF6)",
                        "linear-gradient(90deg, #8B5CF6, #4F46E5)",
                        "linear-gradient(90deg, #4F46E5, #8B5CF6)"
                      ]
                    }}
                    transition={{ duration: 4, repeat: Infinity }}
                  >Today</motion.span>
                </h1>
                <motion.p 
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.3, duration: 0.8 }}
                  className="text-xl text-gray-600 dark:text-gray-300 mb-8 max-w-lg"
                >
                  Connect with top employers and discover opportunities that match your skills and career goals.
                </motion.p>
                <motion.div 
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.6, duration: 0.8 }}
                  className="flex flex-col sm:flex-row gap-4"
                >
                  <Button 
                    size="lg" 
                    onClick={() => navigate("/jobs")}
                    className="group relative overflow-hidden"
                  >
                    <span className="relative z-10">Browse Jobs</span>
                    <span className="absolute inset-0 bg-primary-dark transform scale-x-0 group-hover:scale-x-100 transition-transform origin-left duration-300"></span>
                  </Button>
                  <Button 
                    size="lg" 
                    variant="outline" 
                    onClick={() => !user && navigate("/auth")}
                    className="group relative overflow-hidden"
                  >
                    <span className="relative z-10">{user ? "My Dashboard" : "Join Now"}</span>
                    <span className="absolute inset-0 bg-gray-100 dark:bg-gray-700 transform scale-x-0 group-hover:scale-x-100 transition-transform origin-left duration-300"></span>
                  </Button>
                </motion.div>
              </motion.div>
              <motion.div 
                initial={{ opacity: 0, x: 50 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.8 }}
                className="md:w-1/2 mt-10 md:mt-0"
              >
                <div className="relative">
                  <motion.div 
                    initial={{ y: 20 }}
                    animate={{ y: [0, -10, 0] }}
                    transition={{ duration: 4, repeat: Infinity, repeatType: "reverse" }}
                    className="w-full h-64 md:h-80 lg:h-96 bg-gradient-to-r from-blue-400 to-purple-500 rounded-lg flex items-center justify-center text-white text-xl font-bold shadow-xl"
                  >
                    {/* We'll replace this with an actual image later */}
                    Job Portal Dashboard Preview
                  </motion.div>
                  <motion.div 
                    initial={{ scale: 0 }}
                    animate={{ scale: 1, rotate: [0, 10, 0] }}
                    transition={{ 
                      scale: { delay: 0.5, duration: 0.5, type: "spring" },
                      rotate: { delay: 1, duration: 2, repeat: Infinity, repeatType: "reverse" }
                    }}
                    className="absolute -bottom-6 -right-6 w-24 h-24 bg-primary rounded-full flex items-center justify-center text-white shadow-lg"
                  >
                    <Briefcase className="w-10 h-10" />
                  </motion.div>
                </div>
              </motion.div>
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
            <motion.div 
              className="text-center mb-12"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-100px" }}
              transition={{ duration: 0.7 }}
            >
              <h2 className="text-3xl font-bold text-gray-900 dark:text-white">Why Choose Our Platform</h2>
              <p className="mt-4 text-xl text-gray-600 dark:text-gray-300 max-w-2xl mx-auto">
                We provide the tools and resources you need to succeed in your job search.
              </p>
            </motion.div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
              {features.map((feature, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 30 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true, margin: "-50px" }}
                  transition={{ delay: index * 0.1, duration: 0.5 }}
                >
                  <Card className="border-0 shadow-sm hover:shadow-md transition-all duration-300 h-full group">
                    <CardHeader>
                      <motion.div 
                        className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center text-primary mb-4 group-hover:scale-110 transition-transform duration-300"
                        whileHover={{ rotate: [0, -10, 10, -10, 0] }}
                        transition={{ duration: 0.5 }}
                      >
                        <feature.icon className="h-6 w-6" />
                      </motion.div>
                      <CardTitle className="group-hover:text-primary transition-colors duration-300">{feature.title}</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <p className="text-gray-600 dark:text-gray-300">{feature.description}</p>
                    </CardContent>
                  </Card>
                </motion.div>
              ))}
            </div>
          </div>
        </section>
        
        {/* Latest Jobs Section */}
        <section id="latest-jobs" className="py-16 bg-gray-50 dark:bg-gray-900">
          <div className="container mx-auto px-4 md:px-6">
            <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-12">
              <div>
                <h2 className="text-3xl font-bold text-gray-900 dark:text-white">Latest Job Openings</h2>
                <p className="mt-2 text-gray-600 dark:text-gray-300">
                  Explore the newest opportunities from top employers
                </p>
              </div>
              <Button variant="outline" className="mt-4 md:mt-0" asChild>
                <Link href="/jobs">View All Jobs</Link>
              </Button>
            </div>
            
            {isLoading ? (
              <div className="flex justify-center items-center py-20">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
              </div>
            ) : !latestJobs || latestJobs.length === 0 ? (
              <div className="text-center py-16 bg-white dark:bg-gray-800 rounded-lg shadow">
                <Briefcase className="h-12 w-12 mx-auto text-gray-400 mb-4" />
                <h3 className="text-lg font-medium mb-2">No jobs found</h3>
                <p className="text-gray-600 dark:text-gray-400 mb-4">
                  Check back soon for new job opportunities
                </p>
                <Button asChild>
                  <Link href="/auth">Create Account</Link>
                </Button>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {latestJobs.map((job) => (
                  <Link key={job.id} href={`/jobs/${job.id}`}>
                    <Card className="h-full cursor-pointer hover:border-primary transition-colors">
                      <CardHeader className="pb-2">
                        <div className="flex justify-between items-start">
                          <div>
                            <CardTitle className="line-clamp-1">{job.title}</CardTitle>
                            <CardDescription className="flex items-center mt-1">
                              <Building className="h-4 w-4 mr-1" />
                              Company Name
                            </CardDescription>
                          </div>
                          <Badge variant={job.jobType === "full-time" ? "default" : "outline"}>
                            {job.jobType.replace("-", " ").replace(/\b\w/g, (l) => l.toUpperCase())}
                          </Badge>
                        </div>
                      </CardHeader>
                      <CardContent>
                        <p className="text-gray-700 dark:text-gray-300 line-clamp-2 text-sm mb-3">
                          {job.description}
                        </p>
                        <div className="flex flex-wrap gap-2 text-sm text-gray-500 dark:text-gray-400">
                          <div className="flex items-center">
                            <MapPin className="h-4 w-4 mr-1 opacity-70" />
                            {job.location}
                          </div>
                          <div className="flex items-center">
                            <Briefcase className="h-4 w-4 mr-1 opacity-70" />
                            {job.salaryMin && job.salaryMax
                              ? `$${job.salaryMin} - $${job.salaryMax}`
                              : job.salaryMin
                              ? `From $${job.salaryMin}`
                              : job.salaryMax
                              ? `Up to $${job.salaryMax}`
                              : "Salary not specified"}
                          </div>
                        </div>
                      </CardContent>
                      <CardFooter className="border-t pt-4 flex justify-between">
                        <div className="text-sm text-gray-500 dark:text-gray-400">
                          Posted {formatDate(job.postedAt)}
                        </div>
                        <Button variant="ghost" size="sm">View Details</Button>
                      </CardFooter>
                    </Card>
                  </Link>
                ))}
              </div>
            )}
          </div>
        </section>

        {/* CTA Section */}
        <section className="py-16 bg-primary text-white relative overflow-hidden">
          {/* Animated background elements */}
          <motion.div 
            className="absolute top-0 left-0 w-64 h-64 rounded-full bg-white opacity-5"
            animate={{ 
              x: [0, 100, 0],
              y: [0, 50, 0],
              scale: [1, 1.2, 1] 
            }}
            transition={{ duration: 15, repeat: Infinity, repeatType: "reverse" }}
          />
          <motion.div 
            className="absolute bottom-0 right-0 w-96 h-96 rounded-full bg-white opacity-5"
            animate={{ 
              x: [0, -100, 0],
              y: [0, -50, 0],
              scale: [1, 1.3, 1] 
            }}
            transition={{ duration: 20, repeat: Infinity, repeatType: "reverse" }}
          />
          
          <div className="container mx-auto px-4 md:px-6 text-center relative z-10">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-100px" }}
              transition={{ duration: 0.7 }}
            >
              <h2 className="text-3xl md:text-4xl font-bold mb-4">Ready to Take the Next Step in Your Career?</h2>
              <p className="text-xl mb-8 max-w-3xl mx-auto">
                Join thousands of professionals who've found their dream jobs through our platform.
              </p>
              <motion.div 
                className="flex flex-col sm:flex-row justify-center gap-4"
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: 0.3, duration: 0.5 }}
              >
                <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.98 }}>
                  <Button variant="secondary" size="lg" asChild className="relative overflow-hidden group">
                    <Link href="/jobs" className="flex items-center gap-2">
                      Browse Jobs
                      <motion.span
                        initial={{ x: -10, opacity: 0 }}
                        animate={{ x: 0, opacity: 1 }}
                        transition={{ delay: 0.5 }}
                      >
                        <ArrowRight className="h-4 w-4 group-hover:translate-x-1 transition-transform" />
                      </motion.span>
                    </Link>
                  </Button>
                </motion.div>
                
                {!user && (
                  <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.98 }}>
                    <Button 
                      variant="outline" 
                      size="lg" 
                      className="bg-transparent text-white border-white hover:bg-white hover:text-primary" 
                      asChild
                    >
                      <Link href="/auth">Sign Up Now</Link>
                    </Button>
                  </motion.div>
                )}
              </motion.div>
            </motion.div>
          </div>
        </section>

        {/* Newsletter Section */}
        <section className="py-16 bg-white dark:bg-gray-800">
          <div className="container mx-auto px-4 md:px-6">
            <motion.div 
              className="max-w-3xl mx-auto text-center"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.7 }}
            >
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5 }}
              >
                <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-4">Get Career Tips & Job Alerts</h2>
                <p className="text-xl text-gray-600 dark:text-gray-300 mb-8">
                  Subscribe to our newsletter for exclusive career advice and be the first to know about new opportunities.
                </p>
              </motion.div>
              
              <motion.form 
                className="flex flex-col sm:flex-row gap-3 max-w-lg mx-auto"
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: 0.2, duration: 0.5 }}
              >
                <motion.div
                  className="flex-1"
                  whileTap={{ scale: 0.99 }}
                >
                  <input 
                    type="email" 
                    placeholder="Enter your email"
                    className="w-full px-4 py-3 rounded-md border border-gray-300 dark:border-gray-600 focus:outline-none focus:ring-2 focus:ring-primary" 
                    required
                  />
                </motion.div>
                <motion.div
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  <Button type="submit" className="w-full sm:w-auto">
                    Subscribe
                  </Button>
                </motion.div>
              </motion.form>
              
              <motion.p 
                className="mt-4 text-sm text-gray-500 dark:text-gray-400"
                initial={{ opacity: 0 }}
                whileInView={{ opacity: 1 }}
                viewport={{ once: true }}
                transition={{ delay: 0.4, duration: 0.5 }}
              >
                We care about your data. Read our 
                <Link href="#" className="font-medium text-primary hover:underline hover:text-primary/80 transition-colors ml-1">
                  Privacy Policy
                </Link>.
              </motion.p>
            </motion.div>
          </div>
        </section>
      </main>
    </div>
  );
}
