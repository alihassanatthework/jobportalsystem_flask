import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { useAuth } from "@/hooks/use-auth";
import { useLocation } from "wouter";
import { ChevronRight, Search, Shield, BookOpen, Target, Award, Users, TrendingUp, ArrowRight, CheckCircle, User, Briefcase } from "lucide-react";

export default function ForJobSeekersPage() {
  const [_, navigate] = useLocation();
  const { user } = useAuth();

  const goToRegistration = () => {
    navigate("/auth");
  };

  const goToJobs = () => {
    navigate("/jobs");
  };

  return (
    <div className="container mx-auto py-10 px-4 max-w-7xl">
      <div className="space-y-10">
        {/* Hero Section */}
        <section className="text-center space-y-6">
          <Badge variant="outline" className="px-3.5 py-1.5 text-base font-medium">
            For Job Seekers
          </Badge>
          <h1 className="text-4xl md:text-5xl font-bold tracking-tight">
            Discover Your <span className="text-primary">Dream Career</span>
          </h1>
          <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
            We connect talented individuals with top employers. Find opportunities that match your skills and aspirations.
          </p>
          <div className="flex flex-wrap gap-4 justify-center pt-4">
            <Button size="lg" onClick={goToJobs}>
              <Search className="mr-2 h-5 w-5" />
              Explore Jobs
            </Button>
            {!user && (
              <Button size="lg" variant="outline" onClick={goToRegistration}>
                <User className="mr-2 h-5 w-5" />
                Create Free Account
              </Button>
            )}
          </div>
        </section>

        {/* Benefits Section */}
        <section className="py-12">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold">Why Choose Our Job Portal?</h2>
            <p className="text-muted-foreground mt-2">We're committed to helping you succeed in your career journey</p>
          </div>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            <BenefitCard 
              icon={<Search className="h-10 w-10 text-primary" />}
              title="Personalized Job Matching"
              description="Our intelligent matching algorithm finds the perfect opportunities based on your skills and preferences."
            />
            <BenefitCard 
              icon={<Shield className="h-10 w-10 text-primary" />}
              title="Verified Employers"
              description="All companies on our platform are thoroughly vetted to ensure legitimate opportunities."
            />
            <BenefitCard 
              icon={<BookOpen className="h-10 w-10 text-primary" />}
              title="Career Resources"
              description="Access guides, templates, and tutorials to help you advance in your career."
            />
            <BenefitCard 
              icon={<Target className="h-10 w-10 text-primary" />}
              title="Targeted Job Alerts"
              description="Receive notifications for new positions that match your criteria and preferences."
            />
            <BenefitCard 
              icon={<Award className="h-10 w-10 text-primary" />}
              title="Professional Profile"
              description="Create a standout profile that showcases your skills and experience to employers."
            />
            <BenefitCard 
              icon={<Users className="h-10 w-10 text-primary" />}
              title="Direct Communication"
              description="Connect directly with hiring managers and recruiters through our messaging system."
            />
          </div>
        </section>

        {/* How It Works */}
        <section className="py-12 bg-gray-50 dark:bg-gray-800/50 rounded-lg px-6">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold">How It Works</h2>
            <p className="text-muted-foreground mt-2">Simple steps to finding your next opportunity</p>
          </div>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            <StepCard 
              number={1}
              title="Create Your Profile"
              description="Sign up and build your professional profile with your skills and experience."
            />
            <StepCard 
              number={2}
              title="Explore Opportunities"
              description="Search for jobs using filters or receive personalized recommendations."
            />
            <StepCard 
              number={3}
              title="Apply With Ease"
              description="Submit applications with just a few clicks through our streamlined process."
            />
            <StepCard 
              number={4}
              title="Connect & Interview"
              description="Communicate with employers and ace your interviews with our resources."
            />
          </div>
        </section>

        {/* Success Stories */}
        <section className="py-12">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold">Success Stories</h2>
            <p className="text-muted-foreground mt-2">Job seekers who found their dream roles on our platform</p>
          </div>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            <TestimonialCard 
              name="Sarah Johnson"
              role="Senior Software Engineer"
              company="Tech Innovations Inc"
              quote="After months of searching, I found the perfect role that matched both my technical skills and salary expectations."
            />
            <TestimonialCard 
              name="Michael Chen"
              role="UX Designer"
              company="CreativeWorks Studio"
              quote="The job matching algorithm suggested a position I wouldn't have found otherwise. Now I'm working at my dream company!"
            />
            <TestimonialCard 
              name="Emily Rodriguez"
              role="Marketing Manager"
              company="Global Brand Solutions"
              quote="The resources section helped me prepare for interviews, and I landed a role with a 30% salary increase."
            />
          </div>
        </section>

        {/* CTA Section */}
        <section className="py-10 text-center">
          <Card className="bg-primary text-primary-foreground">
            <CardHeader>
              <CardTitle className="text-2xl">Ready to Take the Next Step in Your Career?</CardTitle>
              <CardDescription className="text-primary-foreground/90">Join thousands of professionals who've found their dream jobs on our platform</CardDescription>
            </CardHeader>
            <CardFooter className="flex justify-center">
              {user ? (
                <Button size="lg" variant="secondary" onClick={goToJobs}>
                  <Briefcase className="mr-2 h-5 w-5" />
                  Explore Available Jobs
                </Button>
              ) : (
                <Button size="lg" variant="secondary" onClick={goToRegistration}>
                  <ArrowRight className="mr-2 h-5 w-5" />
                  Create Your Account Now
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

interface TestimonialCardProps {
  name: string;
  role: string;
  company: string;
  quote: string;
}

function TestimonialCard({ name, role, company, quote }: TestimonialCardProps) {
  return (
    <Card>
      <CardHeader>
        <div className="mb-4">
          <TrendingUp className="h-8 w-8 text-primary" />
        </div>
        <div className="space-y-1">
          <CardTitle className="text-xl">{name}</CardTitle>
          <CardDescription>
            {role} at {company}
          </CardDescription>
        </div>
      </CardHeader>
      <CardContent>
        <div className="relative">
          <p className="text-muted-foreground italic">"{quote}"</p>
        </div>
      </CardContent>
      <CardFooter>
        <div className="flex items-center text-sm text-muted-foreground">
          <CheckCircle className="h-4 w-4 mr-1 text-green-500" />
          <span>Verified Success Story</span>
        </div>
      </CardFooter>
    </Card>
  );
}