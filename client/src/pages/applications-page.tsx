import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { useAuth } from "@/hooks/use-auth";
import { Application } from "@shared/schema";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Link } from "wouter";
import {
  Loader2,
  Briefcase,
  Building,
  Calendar,
  ArrowLeft,
  ExternalLink,
  CheckCircle2,
  AlertCircle,
  Clock,
  Eye,
} from "lucide-react";

export default function ApplicationsPage() {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState<string>("all");

  // Fetch applications for job seeker
  const {
    data: jobSeekerApplications,
    isLoading: loadingJobSeekerApplications,
    isError: errorJobSeekerApplications,
  } = useQuery<Application[]>({
    queryKey: ["/api/applications/job-seeker"],
    enabled: !!user && user.userType === "job_seeker",
  });

  // Fetch applications for employer
  const {
    data: employerApplications,
    isLoading: loadingEmployerApplications,
    isError: errorEmployerApplications,
  } = useQuery<Application[]>({
    queryKey: ["/api/applications/employer"],
    enabled: !!user && user.userType === "employer",
  });

  const isLoading = loadingJobSeekerApplications || loadingEmployerApplications;
  const isError = errorJobSeekerApplications || errorEmployerApplications;
  const applications = user?.userType === "job_seeker" ? jobSeekerApplications : employerApplications;

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return new Intl.DateTimeFormat("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    }).format(date);
  };

  const getStatusBadgeVariant = (status: string) => {
    switch (status) {
      case "applied":
        return "secondary";
      case "reviewed":
        return "outline";
      case "interviewing":
        return "default";
      case "offered":
        return "success";
      case "rejected":
        return "destructive";
      default:
        return "outline";
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "applied":
        return <Clock className="h-4 w-4 mr-1" />;
      case "reviewed":
        return <Eye className="h-4 w-4 mr-1" />;
      case "interviewing":
        return <Calendar className="h-4 w-4 mr-1" />;
      case "offered":
        return <CheckCircle2 className="h-4 w-4 mr-1" />;
      case "rejected":
        return <AlertCircle className="h-4 w-4 mr-1" />;
      default:
        return <Clock className="h-4 w-4 mr-1" />;
    }
  };

  if (!user) {
    return (
      <div className="container mx-auto py-16 text-center">
        <h2 className="text-2xl font-bold mb-4">Access Denied</h2>
        <p>You need to log in to view this page.</p>
      </div>
    );
  }

  const isJobSeeker = user.userType === "job_seeker";
  const isEmployer = user.userType === "employer";

  // Filter applications based on status if not showing all
  const filteredApplications = activeTab === "all"
    ? applications
    : applications?.filter((app) => app.status === activeTab);

  return (
    <div className="container mx-auto py-8 px-4 md:px-6">
      <Button variant="ghost" className="mb-6 pl-0" asChild>
        <Link href="/">
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to Dashboard
        </Link>
      </Button>

      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">
          {isJobSeeker ? "My Applications" : "Candidate Applications"}
        </h1>
        <p className="text-gray-600 dark:text-gray-400">
          {isJobSeeker
            ? "Track the status of your job applications"
            : "Review applications for your job postings"}
        </p>
      </div>

      <Tabs defaultValue="all" value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="mb-6">
          <TabsTrigger value="all">All</TabsTrigger>
          <TabsTrigger value="applied">Applied</TabsTrigger>
          <TabsTrigger value="reviewed">Reviewed</TabsTrigger>
          <TabsTrigger value="interviewing">Interviewing</TabsTrigger>
          <TabsTrigger value="offered">Offered</TabsTrigger>
          <TabsTrigger value="rejected">Rejected</TabsTrigger>
        </TabsList>

        <TabsContent value={activeTab}>
          {isLoading ? (
            <div className="flex items-center justify-center h-64">
              <Loader2 className="h-8 w-8 animate-spin text-primary mr-2" />
              <p>Loading applications...</p>
            </div>
          ) : isError ? (
            <div className="text-center py-16">
              <p className="text-red-500">
                Error loading applications. Please try again later.
              </p>
            </div>
          ) : !filteredApplications || filteredApplications.length === 0 ? (
            <div className="text-center py-16 bg-gray-50 dark:bg-gray-800 rounded-lg">
              <Briefcase className="h-12 w-12 mx-auto text-gray-400 mb-4" />
              <h3 className="text-lg font-medium mb-2">No applications found</h3>
              <p className="text-gray-600 dark:text-gray-400 mb-4">
                {isJobSeeker
                  ? activeTab === "all"
                    ? "You haven't applied to any jobs yet."
                    : `You don't have any applications with status '${activeTab}'.`
                  : activeTab === "all"
                  ? "No candidates have applied to your job listings yet."
                  : `No applications with status '${activeTab}'.`}
              </p>
              {isJobSeeker && (
                <Button asChild>
                  <Link href="/jobs">Browse Jobs</Link>
                </Button>
              )}
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-6">
              {filteredApplications.map((application) => (
                <Card key={application.id}>
                  <CardContent className="p-0">
                    <div className="flex flex-col md:flex-row md:items-center p-6">
                      <div className="flex-1">
                        <div className="flex flex-col md:flex-row md:items-center gap-2 mb-2">
                          <h3 className="text-lg font-semibold">
                            {isJobSeeker && application.job
                              ? application.job.title
                              : isEmployer && application.jobSeeker
                              ? `${application.jobSeeker.jobSeekerProfile?.fullName || application.jobSeeker.username}'s Application`
                              : "Job Application"}
                          </h3>
                          <Badge
                            variant={getStatusBadgeVariant(application.status)}
                            className="w-fit md:ml-2"
                          >
                            {getStatusIcon(application.status)}
                            {application.status.charAt(0).toUpperCase() + application.status.slice(1)}
                          </Badge>
                        </div>
                        
                        <div className="text-sm text-gray-500 dark:text-gray-400 mb-3">
                          {isJobSeeker ? (
                            <div className="flex items-center">
                              <Building className="h-4 w-4 mr-1" />
                              <span>Company Name</span>
                            </div>
                          ) : (
                            application.jobSeeker?.jobSeekerProfile?.headline && (
                              <div>{application.jobSeeker.jobSeekerProfile.headline}</div>
                            )
                          )}
                        </div>

                        <div className="flex flex-wrap gap-x-4 gap-y-2 text-sm">
                          <div className="flex items-center text-gray-600 dark:text-gray-400">
                            <Calendar className="h-4 w-4 mr-1" />
                            Applied on {formatDate(application.appliedAt)}
                          </div>
                          
                          {application.compatibilityScore && (
                            <div className="flex items-center text-green-600 dark:text-green-500">
                              <CheckCircle2 className="h-4 w-4 mr-1" />
                              Match Score: {application.compatibilityScore}%
                            </div>
                          )}
                        </div>
                      </div>
                      
                      <div className="mt-4 md:mt-0 flex flex-col md:flex-row gap-3 items-start md:items-center">
                        {isJobSeeker ? (
                          <Link href={`/jobs/${application.jobId}`}>
                            <Button size="sm" variant="outline">
                              <Eye className="h-4 w-4 mr-1" />
                              View Job
                            </Button>
                          </Link>
                        ) : (
                          <>
                            <Link href={`/applications/${application.id}`}>
                              <Button size="sm">
                                <Eye className="h-4 w-4 mr-1" />
                                Review
                              </Button>
                            </Link>
                            {application.resumeUrl && (
                              <Button size="sm" variant="outline" asChild>
                                <a href={application.resumeUrl} target="_blank" rel="noopener noreferrer">
                                  <ExternalLink className="h-4 w-4 mr-1" />
                                  Resume
                                </a>
                              </Button>
                            )}
                          </>
                        )}
                      </div>
                    </div>
                    
                    {application.coverLetter && (
                      <>
                        <Separator />
                        <div className="p-6">
                          <h4 className="font-medium mb-2">Cover Letter</h4>
                          <p className="text-gray-700 dark:text-gray-300 whitespace-pre-line">
                            {application.coverLetter.length > 250
                              ? `${application.coverLetter.substring(0, 250)}...`
                              : application.coverLetter}
                          </p>
                          {application.coverLetter.length > 250 && isEmployer && (
                            <Link href={`/applications/${application.id}`}>
                              <Button variant="link" className="mt-2 h-auto p-0">
                                Read more
                              </Button>
                            </Link>
                          )}
                        </div>
                      </>
                    )}
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}