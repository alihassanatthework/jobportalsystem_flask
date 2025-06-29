import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { useParams, useLocation } from "wouter";
import { Job } from "@shared/schema";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/use-auth";
import { Loader2, MapPin, Briefcase, Calendar, Clock, ArrowLeft, Building, CheckCircle } from "lucide-react";
import { apiRequest, queryClient } from "@/lib/queryClient";

export default function JobDetailsPage() {
  const { id } = useParams<{ id: string }>();
  const [, navigate] = useLocation();
  const { user } = useAuth();
  const { toast } = useToast();
  const [resumeUrl, setResumeUrl] = useState("");
  const [coverLetter, setCoverLetter] = useState("");

  const {
    data: job,
    isLoading,
    isError,
  } = useQuery<Job>({
    queryKey: [`/api/jobs/${id}`],
  });

  const { data: hasApplied, isLoading: checkingApplication } = useQuery<boolean>({
    queryKey: [`/api/jobs/${id}/has-applied`],
    enabled: !!user && user.userType === "job_seeker",
  });

  const applyMutation = useMutation({
    mutationFn: async () => {
      const response = await apiRequest("POST", `/api/jobs/${id}/apply`, {
        resumeUrl,
        coverLetter,
      });
      return response.json();
    },
    onSuccess: () => {
      toast({
        title: "Application submitted",
        description: "Your job application has been submitted successfully.",
        variant: "default",
      });
      queryClient.invalidateQueries({ queryKey: [`/api/jobs/${id}/has-applied`] });
    },
    onError: (error: Error) => {
      toast({
        title: "Application failed",
        description: error.message || "Failed to submit your application. Please try again.",
        variant: "destructive",
      });
    },
  });

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return new Intl.DateTimeFormat("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    }).format(date);
  };

  const handleApply = (e: React.FormEvent) => {
    e.preventDefault();
    applyMutation.mutate();
  };

  if (isLoading || checkingApplication) {
    return (
      <div className="container mx-auto py-10 flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary mr-2" />
        <p>Loading job details...</p>
      </div>
    );
  }

  if (isError || !job) {
    return (
      <div className="container mx-auto py-10 text-center">
        <h2 className="text-2xl font-bold mb-4">Job Not Found</h2>
        <p className="mb-6">The job you're looking for doesn't exist or has been removed.</p>
        <Button onClick={() => navigate("/jobs")}>Browse Jobs</Button>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-8 px-4 md:px-6">
      <Button
        variant="ghost"
        className="mb-6 pl-0"
        onClick={() => navigate("/jobs")}
      >
        <ArrowLeft className="mr-2 h-4 w-4" />
        Back to Jobs
      </Button>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="md:col-span-2">
          <Card>
            <CardHeader>
              <div className="flex flex-col md:flex-row md:justify-between md:items-center gap-4">
                <div>
                  <CardTitle className="text-2xl md:text-3xl">{job.title}</CardTitle>
                  <div className="flex items-center mt-2 text-gray-600 dark:text-gray-400">
                    <Building className="h-4 w-4 mr-1" />
                    <span>Company Name</span>
                  </div>
                </div>
                <Badge className="w-fit" variant={job.jobType === "full-time" ? "default" : "outline"}>
                  {job.jobType.replace("-", " ").replace(/\b\w/g, (l) => l.toUpperCase())}
                </Badge>
              </div>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 text-sm">
                <div className="flex items-center">
                  <MapPin className="h-4 w-4 mr-2 text-gray-500" />
                  <span>{job.location}</span>
                </div>
                <div className="flex items-center">
                  <Briefcase className="h-4 w-4 mr-2 text-gray-500" />
                  <span>
                    {job.salaryMin && job.salaryMax
                      ? `$${job.salaryMin} - $${job.salaryMax}`
                      : job.salaryMin
                      ? `From $${job.salaryMin}`
                      : job.salaryMax
                      ? `Up to $${job.salaryMax}`
                      : "Salary not specified"}
                  </span>
                </div>
                <div className="flex items-center">
                  <Clock className="h-4 w-4 mr-2 text-gray-500" />
                  <span>Posted {formatDate(job.postedAt)}</span>
                </div>
              </div>

              {job.skills && job.skills.length > 0 && (
                <div>
                  <h3 className="font-medium mb-2">Required Skills</h3>
                  <div className="flex flex-wrap gap-2">
                    {job.skills.map((skill, index) => (
                      <Badge key={index} variant="outline">
                        {skill}
                      </Badge>
                    ))}
                  </div>
                </div>
              )}

              <div>
                <h3 className="font-medium mb-2">Job Description</h3>
                <p className="whitespace-pre-line text-gray-700 dark:text-gray-300">
                  {job.description}
                </p>
              </div>

              <div>
                <h3 className="font-medium mb-2">Qualifications</h3>
                <p className="whitespace-pre-line text-gray-700 dark:text-gray-300">
                  {job.qualifications}
                </p>
              </div>

              <div>
                <h3 className="font-medium mb-2">Responsibilities</h3>
                <p className="whitespace-pre-line text-gray-700 dark:text-gray-300">
                  {job.responsibilities}
                </p>
              </div>
            </CardContent>
          </Card>
        </div>

        <div>
          <Card className="sticky top-4">
            <CardHeader>
              <CardTitle className="text-xl">Apply for this job</CardTitle>
            </CardHeader>
            <CardContent>
              {user ? (
                hasApplied ? (
                  <div className="flex flex-col items-center justify-center py-6 text-center text-green-600 dark:text-green-500">
                    <CheckCircle className="h-12 w-12 mb-2" />
                    <h3 className="text-lg font-medium mb-1">Application Submitted</h3>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      You've already applied for this position
                    </p>
                  </div>
                ) : user.userType === "job_seeker" ? (
                  <form onSubmit={handleApply}>
                    <div className="space-y-4">
                      <div>
                        <label
                          htmlFor="resume-url"
                          className="block text-sm font-medium mb-1"
                        >
                          Resume URL (optional)
                        </label>
                        <Input
                          id="resume-url"
                          type="url"
                          placeholder="https://your-resume-link.com"
                          value={resumeUrl}
                          onChange={(e) => setResumeUrl(e.target.value)}
                        />
                      </div>
                      <div>
                        <label
                          htmlFor="cover-letter"
                          className="block text-sm font-medium mb-1"
                        >
                          Cover Letter (optional)
                        </label>
                        <Textarea
                          id="cover-letter"
                          placeholder="Introduce yourself and explain why you're a good fit for this position..."
                          rows={5}
                          value={coverLetter}
                          onChange={(e) => setCoverLetter(e.target.value)}
                        />
                      </div>
                    </div>
                    <Button
                      className="w-full mt-6"
                      type="submit"
                      disabled={applyMutation.isPending}
                    >
                      {applyMutation.isPending && (
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      )}
                      Apply Now
                    </Button>
                  </form>
                ) : (
                  <div className="text-center py-6">
                    <p className="mb-4 text-amber-600 dark:text-amber-500">
                      Only job seekers can apply for positions.
                    </p>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      You're currently logged in as an employer or admin.
                    </p>
                  </div>
                )
              ) : (
                <div className="text-center py-6">
                  <p className="mb-4">You need to sign in to apply for this job</p>
                  <Button className="w-full" onClick={() => navigate("/auth")}>
                    Sign In / Register
                  </Button>
                </div>
              )}
            </CardContent>
            <Separator />
            <CardFooter className="flex justify-between py-4">
              <div className="text-sm text-gray-600 dark:text-gray-400">
                <Clock className="h-4 w-4 inline-block mr-1" />
                <span>
                  {job.expiresAt
                    ? `Expires: ${formatDate(job.expiresAt)}`
                    : "No expiration date"}
                </span>
              </div>
            </CardFooter>
          </Card>
        </div>
      </div>
    </div>
  );
}