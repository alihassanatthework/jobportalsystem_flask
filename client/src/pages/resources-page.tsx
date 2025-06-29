import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { ExternalLink, Download, FileText, BookOpen, Video, Laptop } from "lucide-react";

export default function ResourcesPage() {
  const [activeTab, setActiveTab] = useState("guides");

  return (
    <div className="container mx-auto py-10 px-4 max-w-7xl">
      <div className="space-y-6">
        <div className="text-center space-y-2">
          <h1 className="text-3xl font-bold tracking-tight">Career Resources</h1>
          <p className="text-muted-foreground max-w-3xl mx-auto">
            Find helpful resources to boost your job search, improve your resume, and prepare for interviews.
          </p>
        </div>

        <Tabs defaultValue="guides" className="w-full" onValueChange={setActiveTab}>
          <div className="flex justify-center">
            <TabsList className="mb-8">
              <TabsTrigger value="guides" className="px-4 py-2">Guides</TabsTrigger>
              <TabsTrigger value="templates" className="px-4 py-2">Resume Templates</TabsTrigger>
              <TabsTrigger value="tutorials" className="px-4 py-2">Tutorials</TabsTrigger>
              <TabsTrigger value="blogs" className="px-4 py-2">Career Blog</TabsTrigger>
            </TabsList>
          </div>

          <TabsContent value="guides" className="space-y-6">
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              <ResourceCard 
                title="The Ultimate Job Search Guide" 
                description="Learn effective strategies to find and land your dream job."
                icon={<FileText className="h-10 w-10 text-primary" />}
                link="#"
              />
              <ResourceCard 
                title="Interview Preparation Handbook" 
                description="Comprehensive guide to ace your job interviews with confidence."
                icon={<BookOpen className="h-10 w-10 text-primary" />}
                link="#"
              />
              <ResourceCard 
                title="Salary Negotiation Tips" 
                description="How to negotiate the best compensation package for your skills."
                icon={<FileText className="h-10 w-10 text-primary" />}
                link="#"
              />
              <ResourceCard 
                title="Career Transition Guide" 
                description="Steps to successfully change your career path and industry."
                icon={<FileText className="h-10 w-10 text-primary" />}
                link="#"
              />
              <ResourceCard 
                title="Remote Work Success Manual" 
                description="Best practices for productivity and work-life balance in remote positions."
                icon={<Laptop className="h-10 w-10 text-primary" />}
                link="#"
              />
              <ResourceCard 
                title="Networking for Professionals" 
                description="Build and leverage professional relationships to advance your career."
                icon={<FileText className="h-10 w-10 text-primary" />}
                link="#"
              />
            </div>
          </TabsContent>

          <TabsContent value="templates" className="space-y-6">
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              <DownloadCard 
                title="Professional Resume Template" 
                description="Clean and professional resume design suitable for most industries."
                fileType="DOCX, PDF"
                link="#"
              />
              <DownloadCard 
                title="Creative Resume Template" 
                description="Stand out with this modern design for creative professionals."
                fileType="DOCX, PDF"
                link="#"
              />
              <DownloadCard 
                title="Technical Resume Template" 
                description="Optimized layout for technical roles to highlight your skills."
                fileType="DOCX, PDF"
                link="#"
              />
              <DownloadCard 
                title="Executive Resume Template" 
                description="Professional template for senior management and executive positions."
                fileType="DOCX, PDF"
                link="#"
              />
              <DownloadCard 
                title="Entry-level Resume Template" 
                description="Perfect for recent graduates and those new to the workforce."
                fileType="DOCX, PDF"
                link="#"
              />
              <DownloadCard 
                title="Cover Letter Template Pack" 
                description="Matching cover letter templates for all resume styles."
                fileType="DOCX, PDF"
                link="#"
              />
            </div>
          </TabsContent>

          <TabsContent value="tutorials" className="space-y-6">
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              <TutorialCard 
                title="Resume Writing Masterclass" 
                description="Learn how to craft a compelling resume that gets you noticed."
                duration="45 minutes"
                link="#"
              />
              <TutorialCard 
                title="LinkedIn Profile Optimization" 
                description="Tips to make your LinkedIn profile stand out to recruiters."
                duration="30 minutes"
                link="#"
              />
              <TutorialCard 
                title="Technical Interview Preparation" 
                description="Practice common coding questions and interview scenarios."
                duration="60 minutes"
                link="#"
              />
              <TutorialCard 
                title="Behavioral Interview Techniques" 
                description="How to structure your answers using the STAR method."
                duration="40 minutes"
                link="#"
              />
              <TutorialCard 
                title="Portfolio Building for Creatives" 
                description="Showcase your best work to attract potential employers."
                duration="35 minutes"
                link="#"
              />
              <TutorialCard 
                title="Personal Branding Workshop" 
                description="Develop a consistent professional brand across platforms."
                duration="50 minutes"
                link="#"
              />
            </div>
          </TabsContent>

          <TabsContent value="blogs" className="space-y-6">
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              <BlogCard 
                title="10 Emerging Job Skills for 2025" 
                description="Stay ahead of the curve with these in-demand skills for the future job market."
                date="April 15, 2025"
                readTime="7 min read"
                link="#"
              />
              <BlogCard 
                title="How to Make a Career Change at Any Age" 
                description="Practical advice for transitioning to a new career path regardless of your experience level."
                date="April 10, 2025"
                readTime="9 min read"
                link="#"
              />
              <BlogCard 
                title="Remote Work Trends Post-Pandemic" 
                description="How companies are adapting their policies and what it means for job seekers."
                date="April 5, 2025"
                readTime="6 min read"
                link="#"
              />
              <BlogCard 
                title="The Rise of AI in Recruitment" 
                description="Understanding how algorithms influence hiring decisions and how to optimize your application."
                date="March 28, 2025"
                readTime="8 min read"
                link="#"
              />
              <BlogCard 
                title="Mastering the Art of Salary Negotiation" 
                description="Expert strategies to ensure you're compensated fairly for your skills and experience."
                date="March 20, 2025"
                readTime="10 min read"
                link="#"
              />
              <BlogCard 
                title="Building Resilience in Your Career" 
                description="Tools and techniques to navigate setbacks and thrive in a changing job market."
                date="March 15, 2025"
                readTime="5 min read"
                link="#"
              />
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}

interface ResourceCardProps {
  title: string;
  description: string;
  icon: React.ReactNode;
  link: string;
}

function ResourceCard({ title, description, icon, link }: ResourceCardProps) {
  return (
    <Card className="overflow-hidden">
      <CardHeader className="pb-3">
        <div className="mb-2">
          {icon}
        </div>
        <CardTitle>{title}</CardTitle>
        <CardDescription>{description}</CardDescription>
      </CardHeader>
      <CardContent>
        <Button variant="outline" className="w-full" asChild>
          <a href={link} target="_blank" rel="noopener noreferrer">
            <ExternalLink className="h-4 w-4 mr-2" />
            Read Guide
          </a>
        </Button>
      </CardContent>
    </Card>
  );
}

interface DownloadCardProps {
  title: string;
  description: string;
  fileType: string;
  link: string;
}

function DownloadCard({ title, description, fileType, link }: DownloadCardProps) {
  return (
    <Card className="overflow-hidden">
      <CardHeader className="pb-3">
        <CardTitle>{title}</CardTitle>
        <CardDescription>{description}</CardDescription>
      </CardHeader>
      <CardContent className="space-y-2">
        <p className="text-sm text-muted-foreground">Available formats: {fileType}</p>
        <Button variant="outline" className="w-full" asChild>
          <a href={link} download>
            <Download className="h-4 w-4 mr-2" />
            Download Template
          </a>
        </Button>
      </CardContent>
    </Card>
  );
}

interface TutorialCardProps {
  title: string;
  description: string;
  duration: string;
  link: string;
}

function TutorialCard({ title, description, duration, link }: TutorialCardProps) {
  return (
    <Card className="overflow-hidden">
      <CardHeader className="pb-3">
        <div className="mb-2">
          <Video className="h-10 w-10 text-primary" />
        </div>
        <CardTitle>{title}</CardTitle>
        <CardDescription>{description}</CardDescription>
      </CardHeader>
      <CardContent className="space-y-2">
        <p className="text-sm text-muted-foreground">Duration: {duration}</p>
        <Button variant="outline" className="w-full" asChild>
          <a href={link} target="_blank" rel="noopener noreferrer">
            <ExternalLink className="h-4 w-4 mr-2" />
            Watch Tutorial
          </a>
        </Button>
      </CardContent>
    </Card>
  );
}

interface BlogCardProps {
  title: string;
  description: string;
  date: string;
  readTime: string;
  link: string;
}

function BlogCard({ title, description, date, readTime, link }: BlogCardProps) {
  return (
    <Card className="overflow-hidden">
      <CardHeader className="pb-3">
        <CardTitle>{title}</CardTitle>
        <CardDescription>{description}</CardDescription>
      </CardHeader>
      <CardContent className="space-y-2">
        <div className="flex items-center justify-between text-sm text-muted-foreground">
          <span>{date}</span>
          <span>{readTime}</span>
        </div>
        <Button variant="outline" className="w-full" asChild>
          <a href={link} target="_blank" rel="noopener noreferrer">
            <ExternalLink className="h-4 w-4 mr-2" />
            Read Article
          </a>
        </Button>
      </CardContent>
    </Card>
  );
}