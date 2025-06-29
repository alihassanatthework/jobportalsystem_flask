import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { useAuth } from "@/hooks/use-auth";
import { useLocation } from "wouter";
import { ChevronRight, Users, Building, Target, TrendingUp, BarChart, Shield, Briefcase, User, ArrowRight, CheckCircle } from "lucide-react";

export default function ForEmployersPage() {
  const [_, navigate] = useLocation();
  const { user } = useAuth();

  const goToRegistration = () => {
    navigate("/auth");
  };

  const goToPostJob = () => {
    navigate("/profile");
  };

  return (
    <div className="container mx-auto py-10 px-4 max-w-7xl">
      <div className="space-y-10">
        {/* Hero Section */}
        <section className="text-center space-y-6">
          <Badge variant="outline" className="px-3.5 py-1.5 text-base font-medium">
            For Employers
          </Badge>
          <h1 className="text-4xl md:text-5xl font-bold tracking-tight">
            Find the <span className="text-primary">Perfect Talent</span> for Your Team
          </h1>
          <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
            Connect with qualified candidates and streamline your hiring process with our comprehensive recruitment platform.
          </p>
          <div className="flex flex-wrap gap-4 justify-center pt-4">
            {user && user.userType === "employer" ? (
              <Button size="lg" onClick={goToPostJob}>
                <Briefcase className="mr-2 h-5 w-5" />
                Post a Job
              </Button>
            ) : (
              <Button size="lg" onClick={goToRegistration}>
                <Building className="mr-2 h-5 w-5" />
                Register as Employer
              </Button>
            )}
            <Button size="lg" variant="outline" onClick={() => window.open("#pricing", "_self")}>
              <BarChart className="mr-2 h-5 w-5" />
              View Pricing
            </Button>
          </div>
        </section>

        {/* Benefits Section */}
        <section className="py-12">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold">Why Recruit With Us?</h2>
            <p className="text-muted-foreground mt-2">We provide the tools and reach to make your hiring process efficient and effective</p>
          </div>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            <BenefitCard 
              icon={<Target className="h-10 w-10 text-primary" />}
              title="Targeted Candidate Matching"
              description="Our AI matching algorithm connects you with candidates who best fit your job requirements and company culture."
            />
            <BenefitCard 
              icon={<Users className="h-10 w-10 text-primary" />}
              title="Access to Qualified Talent"
              description="Reach a diverse pool of pre-screened professionals across various industries and experience levels."
            />
            <BenefitCard 
              icon={<Building className="h-10 w-10 text-primary" />}
              title="Employer Branding"
              description="Create a compelling company profile to showcase your culture and attract the right talent."
            />
            <BenefitCard 
              icon={<TrendingUp className="h-10 w-10 text-primary" />}
              title="Advanced Analytics"
              description="Track job performance, applicant engagement, and hiring metrics with intuitive dashboards."
            />
            <BenefitCard 
              icon={<BarChart className="h-10 w-10 text-primary" />}
              title="Cost-Effective Hiring"
              description="Competitive pricing plans designed for businesses of all sizes, from startups to enterprises."
            />
            <BenefitCard 
              icon={<Shield className="h-10 w-10 text-primary" />}
              title="Verified Applicants"
              description="All job seekers are verified to ensure you're connecting with legitimate candidates."
            />
          </div>
        </section>

        {/* How It Works */}
        <section className="py-12 bg-gray-50 dark:bg-gray-800/50 rounded-lg px-6">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold">The Hiring Process Simplified</h2>
            <p className="text-muted-foreground mt-2">Post jobs and connect with qualified candidates in just a few steps</p>
          </div>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            <StepCard 
              number={1}
              title="Create Employer Profile"
              description="Register and build your company profile to showcase your brand and culture."
            />
            <StepCard 
              number={2}
              title="Post Job Listings"
              description="Easily create detailed job postings with our user-friendly interface."
            />
            <StepCard 
              number={3}
              title="Review Applications"
              description="Efficiently screen and manage candidates through our centralized dashboard."
            />
            <StepCard 
              number={4}
              title="Connect & Hire"
              description="Communicate with promising candidates and complete the hiring process."
            />
          </div>
        </section>

        {/* Pricing Section */}
        <section id="pricing" className="py-12">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold">Flexible Recruiting Solutions</h2>
            <p className="text-muted-foreground mt-2">Choose the plan that fits your hiring needs</p>
          </div>
          <div className="grid md:grid-cols-3 gap-8">
            <PricingCard 
              title="Starter"
              price="$99"
              period="per month"
              description="Perfect for small businesses with occasional hiring needs"
              features={[
                "Post up to 3 jobs simultaneously",
                "Basic candidate matching",
                "Standard company profile",
                "Email support"
              ]}
              buttonText="Get Started"
              buttonVariant="outline"
            />
            <PricingCard 
              title="Professional"
              price="$199"
              period="per month"
              description="Ideal for growing companies with regular recruitment"
              features={[
                "Post up to 10 jobs simultaneously",
                "Advanced candidate matching",
                "Featured company profile",
                "Applicant tracking system",
                "Priority email & chat support"
              ]}
              buttonText="Most Popular"
              buttonVariant="default"
              highlighted={true}
            />
            <PricingCard 
              title="Enterprise"
              price="$499"
              period="per month"
              description="Comprehensive solution for large organizations"
              features={[
                "Unlimited job postings",
                "Premium candidate matching",
                "Featured company profile",
                "Advanced analytics dashboard",
                "Dedicated account manager",
                "API access for integration"
              ]}
              buttonText="Contact Sales"
              buttonVariant="outline"
            />
          </div>
        </section>

        {/* Success Stories */}
        <section className="py-12">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold">Employer Success Stories</h2>
            <p className="text-muted-foreground mt-2">Companies that have transformed their hiring process with our platform</p>
          </div>
          <div className="grid md:grid-cols-3 gap-8">
            <TestimonialCard 
              name="Tech Innovations Inc"
              industry="Software Development"
              quote="We reduced our time-to-hire by 45% and found candidates who were a perfect culture fit for our engineering team."
              spokesperson="David Chen, CTO"
            />
            <TestimonialCard 
              name="Global Marketing Solutions"
              industry="Marketing & Advertising"
              quote="The quality of applicants has been exceptional. We've hired 12 talented marketers through the platform in just three months."
              spokesperson="Jennifer Lee, HR Director"
            />
            <TestimonialCard 
              name="Healthcare Partners"
              industry="Healthcare"
              quote="As a growing healthcare provider, we needed specialized talent. This platform helped us connect with qualified professionals quickly."
              spokesperson="Dr. Michael Reynolds, CEO"
            />
          </div>
        </section>

        {/* CTA Section */}
        <section className="py-10 text-center">
          <Card className="bg-primary text-primary-foreground">
            <CardHeader>
              <CardTitle className="text-2xl">Ready to Transform Your Recruitment Process?</CardTitle>
              <CardDescription className="text-primary-foreground/90">Join hundreds of employers who've built successful teams through our platform</CardDescription>
            </CardHeader>
            <CardFooter className="flex justify-center">
              {user && user.userType === "employer" ? (
                <Button size="lg" variant="secondary" onClick={goToPostJob}>
                  <Briefcase className="mr-2 h-5 w-5" />
                  Post Your First Job
                </Button>
              ) : (
                <Button size="lg" variant="secondary" onClick={goToRegistration}>
                  <ArrowRight className="mr-2 h-5 w-5" />
                  Register as an Employer
                </Button>
              )}
            </CardFooter>
          </Card>
        </section>

      </div>
    </div>
  );
}

interface BenefitCardProps {
  icon: React.ReactNode;
  title: string;
  description: string;
}

function BenefitCard({ icon, title, description }: BenefitCardProps) {
  return (
    <Card>
      <CardHeader>
        <div className="mb-2">{icon}</div>
        <CardTitle>{title}</CardTitle>
      </CardHeader>
      <CardContent>
        <p className="text-muted-foreground">{description}</p>
      </CardContent>
    </Card>
  );
}

interface StepCardProps {
  number: number;
  title: string;
  description: string;
}

function StepCard({ number, title, description }: StepCardProps) {
  return (
    <div className="flex flex-col items-center text-center">
      <div className="w-14 h-14 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-xl font-bold mb-4">
        {number}
      </div>
      <h3 className="text-xl font-semibold mb-2">{title}</h3>
      <p className="text-muted-foreground">{description}</p>
      {number < 4 && <ChevronRight className="hidden lg:block rotate-90 lg:rotate-0 my-4 text-muted-foreground" />}
    </div>
  );
}

interface PricingCardProps {
  title: string;
  price: string;
  period: string;
  description: string;
  features: string[];
  buttonText: string;
  buttonVariant: "default" | "outline" | "secondary";
  highlighted?: boolean;
}

function PricingCard({ title, price, period, description, features, buttonText, buttonVariant, highlighted = false }: PricingCardProps) {
  return (
    <Card className={highlighted ? "border-primary shadow-lg relative" : ""}>
      {highlighted && (
        <div className="absolute top-0 left-0 right-0 bg-primary text-primary-foreground text-center py-1 text-sm font-medium rounded-t-lg">
          Recommended
        </div>
      )}
      <CardHeader className={highlighted ? "pt-8" : ""}>
        <CardTitle>{title}</CardTitle>
        <div className="flex items-baseline mt-2">
          <span className="text-3xl font-bold">{price}</span>
          <span className="ml-1 text-muted-foreground">{period}</span>
        </div>
        <CardDescription className="mt-2">{description}</CardDescription>
      </CardHeader>
      <CardContent>
        <ul className="space-y-2">
          {features.map((feature, index) => (
            <li key={index} className="flex items-start">
              <CheckCircle className="h-5 w-5 text-primary mr-2 mt-0.5 flex-shrink-0" />
              <span>{feature}</span>
            </li>
          ))}
        </ul>
      </CardContent>
      <CardFooter>
        <Button variant={buttonVariant} className="w-full">
          {buttonText}
        </Button>
      </CardFooter>
    </Card>
  );
}

interface TestimonialCardProps {
  name: string;
  industry: string;
  quote: string;
  spokesperson: string;
}

function TestimonialCard({ name, industry, quote, spokesperson }: TestimonialCardProps) {
  return (
    <Card>
      <CardHeader>
        <div className="mb-4">
          <Building className="h-8 w-8 text-primary" />
        </div>
        <div className="space-y-1">
          <CardTitle className="text-xl">{name}</CardTitle>
          <CardDescription>
            {industry}
          </CardDescription>
        </div>
      </CardHeader>
      <CardContent>
        <div className="relative">
          <p className="text-muted-foreground italic">"{quote}"</p>
          <p className="mt-4 text-sm font-medium">— {spokesperson}</p>
        </div>
      </CardContent>
      <CardFooter>
        <div className="flex items-center text-sm text-muted-foreground">
          <CheckCircle className="h-4 w-4 mr-1 text-green-500" />
          <span>Verified Company</span>
        </div>
      </CardFooter>
    </Card>
  );
}