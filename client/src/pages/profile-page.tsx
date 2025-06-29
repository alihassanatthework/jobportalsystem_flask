import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { useAuth } from "@/hooks/use-auth";
import { useToast } from "@/hooks/use-toast";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { JobSeekerProfile, EmployerProfile, Job } from "@shared/schema";
import { Link } from "wouter";
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Separator } from "@/components/ui/separator";
import { 
  Loader2, Save, User, Building, Briefcase, PenSquare, 
  Trash2, PlusCircle, Calendar, MapPin, DollarSign, Clock,
  Heart, Eye, MessageCircle, FileText, Star, LogOut,
  MessageSquare, Users, InboxIcon, Ban, CheckCircle,
  Upload, Send
} from "lucide-react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogTrigger, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { format } from "date-fns";

export default function ProfilePage() {
  const { user, logoutMutation } = useAuth();
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState("account");
  const [isJobDialogOpen, setIsJobDialogOpen] = useState(false);
  const [selectedJob, setSelectedJob] = useState<Job | null>(null);
  
  // Job Form State
  const [jobForm, setJobForm] = useState({
    title: "",
    company: "",
    location: "",
    jobType: "full-time",
    description: "",
    requirements: "",
    salaryMin: "",
    salaryMax: "",
    contactEmail: "",
    applicationDeadline: ""
  });

  // Job Seeker Profile Form State
  const [jobSeekerForm, setJobSeekerForm] = useState({
    fullName: "",
    headline: "",
    bio: "",
    skills: "",
    experience: "",
    education: "",
    location: "",
    phone: "",
    resumeUrl: "",
  });

  // Employer Profile Form State
  const [employerForm, setEmployerForm] = useState({
    companyName: "",
    industry: "",
    companySize: "",
    description: "",
    location: "",
    website: "",
    logoUrl: "",
  });
  
  // Fetch employer's jobs
  const { data: employerJobs, isLoading: loadingJobs } = useQuery<Job[]>({
    queryKey: ['/api/jobs/employer'],
    enabled: !!user && user.userType === 'employer',
  });
  
  // Add job mutation
  const addJobMutation = useMutation({
    mutationFn: async (data: Partial<Job>) => {
      const response = await apiRequest('POST', '/api/jobs', data);
      return response.json();
    },
    onSuccess: () => {
      toast({
        title: "Job posted successfully",
        description: "Your job has been posted and is now visible to job seekers.",
      });
      queryClient.invalidateQueries({ queryKey: ['/api/jobs/employer'] });
      queryClient.invalidateQueries({ queryKey: ['/api/jobs'] });
      setIsJobDialogOpen(false);
      resetJobForm();
    },
    onError: (error: Error) => {
      toast({
        title: "Failed to post job",
        description: error.message || "There was an error posting your job. Please try again.",
        variant: "destructive",
      });
    },
  });
  
  // Update job mutation
  const updateJobMutation = useMutation({
    mutationFn: async ({ id, data }: { id: number; data: Partial<Job> }) => {
      const response = await apiRequest('PUT', `/api/jobs/${id}`, data);
      return response.json();
    },
    onSuccess: () => {
      toast({
        title: "Job updated successfully",
        description: "Your job posting has been updated.",
      });
      queryClient.invalidateQueries({ queryKey: ['/api/jobs/employer'] });
      queryClient.invalidateQueries({ queryKey: ['/api/jobs'] });
      setIsJobDialogOpen(false);
      setSelectedJob(null);
      resetJobForm();
    },
    onError: (error: Error) => {
      toast({
        title: "Failed to update job",
        description: error.message || "There was an error updating your job. Please try again.",
        variant: "destructive",
      });
    },
  });
  
  // Delete job mutation
  const deleteJobMutation = useMutation({
    mutationFn: async (id: number) => {
      const response = await apiRequest('DELETE', `/api/jobs/${id}`);
      return response.ok;
    },
    onSuccess: () => {
      toast({
        title: "Job deleted successfully",
        description: "Your job posting has been removed.",
      });
      queryClient.invalidateQueries({ queryKey: ['/api/jobs/employer'] });
      queryClient.invalidateQueries({ queryKey: ['/api/jobs'] });
    },
    onError: (error: Error) => {
      toast({
        title: "Failed to delete job",
        description: error.message || "There was an error deleting your job. Please try again.",
        variant: "destructive",
      });
    },
  });

  // Fetch job seeker profile
  const { data: jobSeekerProfile, isLoading: loadingJobSeekerProfile } = useQuery<JobSeekerProfile>({
    queryKey: ["/api/profile/job-seeker"],
    enabled: !!user && user.userType === "job_seeker",
    onSuccess: (data) => {
      if (data) {
        setJobSeekerForm({
          fullName: data.fullName || "",
          headline: data.headline || "",
          bio: data.bio || "",
          skills: (data.skills || []).join(", "),
          experience: data.experience || "",
          education: data.education || "",
          location: data.location || "",
          phone: data.phone || "",
          resumeUrl: data.resumeUrl || "",
        });
      }
    },
  });

  // Fetch employer profile
  const { data: employerProfile, isLoading: loadingEmployerProfile } = useQuery<EmployerProfile>({
    queryKey: ["/api/profile/employer"],
    enabled: !!user && user.userType === "employer",
    onSuccess: (data) => {
      if (data) {
        setEmployerForm({
          companyName: data.companyName || "",
          industry: data.industry || "",
          companySize: data.companySize || "",
          description: data.description || "",
          location: data.location || "",
          website: data.website || "",
          logoUrl: data.logoUrl || "",
        });
      }
    },
  });

  // Update job seeker profile mutation
  const updateJobSeekerMutation = useMutation({
    mutationFn: async (data: Partial<JobSeekerProfile>) => {
      const response = await apiRequest("PUT", "/api/profile/job-seeker", data);
      return response.json();
    },
    onSuccess: () => {
      toast({
        title: "Profile updated",
        description: "Your profile information has been updated successfully.",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/profile/job-seeker"] });
    },
    onError: (error: Error) => {
      toast({
        title: "Update failed",
        description: error.message || "Failed to update your profile. Please try again.",
        variant: "destructive",
      });
    },
  });

  // Update employer profile mutation
  const updateEmployerMutation = useMutation({
    mutationFn: async (data: Partial<EmployerProfile>) => {
      const response = await apiRequest("PUT", "/api/profile/employer", data);
      return response.json();
    },
    onSuccess: () => {
      toast({
        title: "Company profile updated",
        description: "Your company information has been updated successfully.",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/profile/employer"] });
    },
    onError: (error: Error) => {
      toast({
        title: "Update failed",
        description: error.message || "Failed to update your company profile. Please try again.",
        variant: "destructive",
      });
    },
  });

  const handleJobSeekerSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    updateJobSeekerMutation.mutate({
      fullName: jobSeekerForm.fullName,
      headline: jobSeekerForm.headline,
      bio: jobSeekerForm.bio,
      skills: jobSeekerForm.skills.split(",").map((skill) => skill.trim()).filter(Boolean),
      experience: jobSeekerForm.experience,
      education: jobSeekerForm.education,
      location: jobSeekerForm.location,
      phone: jobSeekerForm.phone,
      resumeUrl: jobSeekerForm.resumeUrl,
    });
  };

  const handleEmployerSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    updateEmployerMutation.mutate({
      companyName: employerForm.companyName,
      industry: employerForm.industry,
      companySize: employerForm.companySize,
      description: employerForm.description,
      location: employerForm.location,
      website: employerForm.website,
      logoUrl: employerForm.logoUrl,
    });
  };

  const handleJobSeekerChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setJobSeekerForm((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleEmployerChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setEmployerForm((prev) => ({
      ...prev,
      [name]: value,
    }));
  };
  
  // Job form handlers
  const resetJobForm = () => {
    setJobForm({
      title: "",
      company: "",
      location: "",
      jobType: "full-time",
      description: "",
      requirements: "",
      salaryMin: "",
      salaryMax: "",
      contactEmail: "",
      applicationDeadline: ""
    });
  };
  
  const handleJobFormChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setJobForm((prev) => ({
      ...prev,
      [name]: value,
    }));
  };
  
  const handleJobTypeChange = (value: string) => {
    setJobForm((prev) => ({
      ...prev,
      jobType: value,
    }));
  };
  
  const handleEditJob = (job: Job) => {
    setSelectedJob(job);
    setJobForm({
      title: job.title || "",
      company: employerProfile?.companyName || "",
      location: job.location || "",
      jobType: job.jobType || "full-time",
      description: job.description || "",
      requirements: job.requirements || "",
      salaryMin: job.salaryMin || "",
      salaryMax: job.salaryMax || "",
      contactEmail: job.contactEmail || user?.email || "",
      applicationDeadline: job.applicationDeadline ? new Date(job.applicationDeadline).toISOString().split('T')[0] : ""
    });
    setIsJobDialogOpen(true);
  };
  
  const handleAddNewJob = () => {
    setSelectedJob(null);
    setJobForm({
      title: "",
      company: employerProfile?.companyName || "",
      location: employerProfile?.location || "",
      jobType: "full-time",
      description: "",
      requirements: "",
      salaryMin: "",
      salaryMax: "",
      contactEmail: user?.email || "",
      applicationDeadline: ""
    });
    setIsJobDialogOpen(true);
  };
  
  const handleDeleteJob = (jobId: number) => {
    if (confirm("Are you sure you want to delete this job posting? This action cannot be undone.")) {
      deleteJobMutation.mutate(jobId);
    }
  };
  
  const handleSubmitJob = (e: React.FormEvent) => {
    e.preventDefault();
    
    const jobData = {
      title: jobForm.title,
      location: jobForm.location,
      jobType: jobForm.jobType,
      description: jobForm.description,
      requirements: jobForm.requirements,
      salaryMin: jobForm.salaryMin,
      salaryMax: jobForm.salaryMax,
      contactEmail: jobForm.contactEmail,
      applicationDeadline: jobForm.applicationDeadline ? new Date(jobForm.applicationDeadline).toISOString() : undefined
    };
    
    if (selectedJob) {
      updateJobMutation.mutate({ 
        id: selectedJob.id, 
        data: jobData
      });
    } else {
      addJobMutation.mutate(jobData);
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
  const isAdmin = user.userType === "admin";
  const isLoading = loadingJobSeekerProfile || loadingEmployerProfile;

  const getProfileInitials = () => {
    if (isJobSeeker && jobSeekerProfile?.fullName) {
      const names = jobSeekerProfile.fullName.split(" ");
      return names.length > 1
        ? `${names[0][0]}${names[names.length - 1][0]}`
        : names[0][0];
    } else if (isEmployer && employerProfile?.companyName) {
      return employerProfile.companyName[0];
    } else {
      return user.username[0].toUpperCase();
    }
  };

  return (
    <div className="container mx-auto py-8 px-4 md:px-6">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">Your Profile</h1>
        <p className="text-gray-600 dark:text-gray-400">
          Manage your personal information and settings
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        {/* Sidebar */}
        <div className="md:col-span-1">
          <Card>
            <CardContent className="p-6">
              <div className="flex flex-col items-center text-center mb-6">
                <Avatar className="h-24 w-24 mb-4">
                  {isEmployer && employerProfile?.logoUrl ? (
                    <AvatarImage src={employerProfile.logoUrl} alt="Company Logo" />
                  ) : (
                    <>
                      <AvatarFallback className="text-lg">
                        {getProfileInitials()}
                      </AvatarFallback>
                    </>
                  )}
                </Avatar>
                <h2 className="text-xl font-semibold">
                  {isJobSeeker && jobSeekerProfile?.fullName
                    ? jobSeekerProfile.fullName
                    : isEmployer && employerProfile?.companyName
                    ? employerProfile.companyName
                    : user.username}
                </h2>
                <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                  {isJobSeeker
                    ? "Job Seeker"
                    : isEmployer
                    ? "Employer"
                    : isAdmin
                    ? "Administrator"
                    : "User"}
                </p>
                {isJobSeeker && jobSeekerProfile?.headline && (
                  <p className="text-sm mt-2">{jobSeekerProfile.headline}</p>
                )}
                {isEmployer && employerProfile?.industry && (
                  <p className="text-sm mt-2">{employerProfile.industry}</p>
                )}
              </div>

              <Separator className="my-4" />

              <div className="space-y-1">
                <Button
                  variant={activeTab === "account" ? "default" : "ghost"}
                  className="w-full justify-start"
                  onClick={() => setActiveTab("account")}
                >
                  <User className="mr-2 h-4 w-4" />
                  Account
                </Button>
                
                {/* Admin Navigation */}
                {isAdmin && (
                  <>
                    <Button
                      variant={activeTab === "review-feedback" ? "default" : "ghost"}
                      className="w-full justify-start"
                      onClick={() => setActiveTab("review-feedback")}
                    >
                      <MessageSquare className="mr-2 h-4 w-4" />
                      Review Feedback
                    </Button>
                    <Button
                      variant={activeTab === "manage-users" ? "default" : "ghost"}
                      className="w-full justify-start"
                      onClick={() => setActiveTab("manage-users")}
                    >
                      <Users className="mr-2 h-4 w-4" />
                      Manage Users
                    </Button>
                  </>
                )}
                
                {/* Job Seeker Navigation */}
                {isJobSeeker && (
                  <>
                    <Button
                      variant={activeTab === "profile" ? "default" : "ghost"}
                      className="w-full justify-start"
                      onClick={() => setActiveTab("profile")}
                    >
                      <User className="mr-2 h-4 w-4" />
                      Profile
                    </Button>
                    <Button
                      variant={activeTab === "wishlist" ? "default" : "ghost"}
                      className="w-full justify-start"
                      onClick={() => setActiveTab("wishlist")}
                    >
                      <Heart className="mr-2 h-4 w-4" />
                      Wishlist
                    </Button>
                    <Button
                      variant={activeTab === "applications" ? "default" : "ghost"}
                      className="w-full justify-start"
                      onClick={() => setActiveTab("applications")}
                    >
                      <FileText className="mr-2 h-4 w-4" />
                      My Applications
                    </Button>
                    <Button
                      variant={activeTab === "messages" ? "default" : "ghost"}
                      className="w-full justify-start"
                      onClick={() => setActiveTab("messages")}
                    >
                      <MessageCircle className="mr-2 h-4 w-4" />
                      Messages
                    </Button>
                    <Button
                      variant={activeTab === "cv" ? "default" : "ghost"}
                      className="w-full justify-start"
                      onClick={() => setActiveTab("cv")}
                    >
                      <FileText className="mr-2 h-4 w-4" />
                      Update CV
                    </Button>
                    <Button
                      variant={activeTab === "feedback" ? "default" : "ghost"}
                      className="w-full justify-start"
                      onClick={() => setActiveTab("feedback")}
                    >
                      <Star className="mr-2 h-4 w-4" />
                      Add Feedback
                    </Button>
                  </>
                )}
                
                {/* Employer Navigation */}
                {isEmployer && (
                  <>
                    <Button
                      variant={activeTab === "company" ? "default" : "ghost"}
                      className="w-full justify-start"
                      onClick={() => setActiveTab("company")}
                    >
                      <Building className="mr-2 h-4 w-4" />
                      Company
                    </Button>
                    <Button
                      variant={activeTab === "jobs" ? "default" : "ghost"}
                      className="w-full justify-start"
                      onClick={() => setActiveTab("jobs")}
                    >
                      <Briefcase className="mr-2 h-4 w-4" />
                      Job Postings
                    </Button>
                    <Button
                      variant={activeTab === "watchlist" ? "default" : "ghost"}
                      className="w-full justify-start"
                      onClick={() => setActiveTab("watchlist")}
                    >
                      <Eye className="mr-2 h-4 w-4" />
                      Watchlist
                    </Button>
                    <Button
                      variant={activeTab === "messages" ? "default" : "ghost"}
                      className="w-full justify-start"
                      onClick={() => setActiveTab("messages")}
                    >
                      <MessageCircle className="mr-2 h-4 w-4" />
                      Messages
                    </Button>
                    <Button
                      variant={activeTab === "requests" ? "default" : "ghost"}
                      className="w-full justify-start"
                      onClick={() => setActiveTab("requests")}
                    >
                      <InboxIcon className="mr-2 h-4 w-4" />
                      Manage Requests
                    </Button>
                    <Button
                      variant={activeTab === "feedback" ? "default" : "ghost"}
                      className="w-full justify-start"
                      onClick={() => setActiveTab("feedback")}
                    >
                      <Star className="mr-2 h-4 w-4" />
                      Add Feedback
                    </Button>
                  </>
                )}
                
                {/* Logout Button for All Users */}
                <Button
                  variant="ghost"
                  className="w-full justify-start text-red-500 hover:text-red-700 hover:bg-red-100 dark:hover:bg-red-900 dark:hover:text-red-300"
                  onClick={() => {
                    if (confirm("Are you sure you want to log out?")) {
                      logoutMutation.mutate();
                    }
                  }}
                  disabled={logoutMutation.isPending}
                >
                  {logoutMutation.isPending ? (
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  ) : (
                    <LogOut className="mr-2 h-4 w-4" />
                  )}
                  Log Out
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Main Content */}
        <div className="md:col-span-3">
          {isLoading ? (
            <div className="flex items-center justify-center h-64">
              <Loader2 className="h-8 w-8 animate-spin text-primary mr-2" />
              <p>Loading profile information...</p>
            </div>
          ) : (
            <>
              {activeTab === "account" && (
                <Card>
                  <CardHeader>
                    <CardTitle>Account Information</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <div>
                        <Label htmlFor="username">Username</Label>
                        <Input
                          id="username"
                          value={user.username}
                          disabled
                        />
                      </div>
                      <div>
                        <Label htmlFor="email">Email</Label>
                        <Input
                          id="email"
                          type="email"
                          value={user.email || ""}
                          disabled
                        />
                      </div>
                      <div>
                        <Label htmlFor="usertype">Account Type</Label>
                        <Input
                          id="usertype"
                          value={
                            isJobSeeker
                              ? "Job Seeker"
                              : isEmployer
                              ? "Employer"
                              : "Administrator"
                          }
                          disabled
                        />
                      </div>

                      <div className="pt-4">
                        <Button variant="outline">Change Password</Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              )}

              {activeTab === "profile" && isJobSeeker && (
                <Card>
                  <CardHeader>
                    <CardTitle>Profile Information</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <form onSubmit={handleJobSeekerSubmit} className="space-y-4">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <Label htmlFor="fullName">Full Name</Label>
                          <Input
                            id="fullName"
                            name="fullName"
                            value={jobSeekerForm.fullName}
                            onChange={handleJobSeekerChange}
                          />
                        </div>
                        <div>
                          <Label htmlFor="headline">Professional Headline</Label>
                          <Input
                            id="headline"
                            name="headline"
                            value={jobSeekerForm.headline}
                            onChange={handleJobSeekerChange}
                            placeholder="e.g. Senior Software Engineer"
                          />
                        </div>
                      </div>

                      <div>
                        <Label htmlFor="bio">Professional Summary</Label>
                        <Textarea
                          id="bio"
                          name="bio"
                          value={jobSeekerForm.bio}
                          onChange={handleJobSeekerChange}
                          rows={4}
                          placeholder="Brief overview of your professional background and career goals"
                        />
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <Label htmlFor="location">Location</Label>
                          <Input
                            id="location"
                            name="location"
                            value={jobSeekerForm.location}
                            onChange={handleJobSeekerChange}
                            placeholder="e.g. New York, NY"
                          />
                        </div>
                        <div>
                          <Label htmlFor="phone">Phone Number</Label>
                          <Input
                            id="phone"
                            name="phone"
                            value={jobSeekerForm.phone}
                            onChange={handleJobSeekerChange}
                          />
                        </div>
                      </div>

                      <div>
                        <Label htmlFor="skills">Skills (comma separated)</Label>
                        <Input
                          id="skills"
                          name="skills"
                          value={jobSeekerForm.skills}
                          onChange={handleJobSeekerChange}
                          placeholder="e.g. JavaScript, React, Node.js"
                        />
                      </div>

                      <div>
                        <Label htmlFor="experience">Work Experience</Label>
                        <Textarea
                          id="experience"
                          name="experience"
                          value={jobSeekerForm.experience}
                          onChange={handleJobSeekerChange}
                          rows={4}
                          placeholder="Summarize your work history"
                        />
                      </div>

                      <div>
                        <Label htmlFor="education">Education</Label>
                        <Textarea
                          id="education"
                          name="education"
                          value={jobSeekerForm.education}
                          onChange={handleJobSeekerChange}
                          rows={3}
                          placeholder="List your education background"
                        />
                      </div>

                      <div>
                        <Label htmlFor="resumeUrl">Resume URL</Label>
                        <Input
                          id="resumeUrl"
                          name="resumeUrl"
                          type="url"
                          value={jobSeekerForm.resumeUrl}
                          onChange={handleJobSeekerChange}
                          placeholder="Link to your resume"
                        />
                      </div>

                      <Button 
                        type="submit"
                        disabled={updateJobSeekerMutation.isPending}
                        className="mt-4"
                      >
                        {updateJobSeekerMutation.isPending && (
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        )}
                        <Save className="mr-2 h-4 w-4" />
                        Save Profile
                      </Button>
                    </form>
                  </CardContent>
                </Card>
              )}

              {/* Admin Pages */}
              {activeTab === "review-feedback" && isAdmin && (
                <Card>
                  <CardHeader>
                    <CardTitle>Review Feedback</CardTitle>
                    <CardDescription>Review and manage user feedback</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="text-center py-16">
                      <MessageSquare className="h-16 w-16 text-gray-400 mx-auto mb-4" />
                      <h3 className="text-xl font-medium mb-2">No Feedback to Review</h3>
                      <p className="text-gray-500 dark:text-gray-400 max-w-md mx-auto">
                        User feedback will appear here when it is submitted.
                      </p>
                    </div>
                  </CardContent>
                </Card>
              )}
              
              {activeTab === "manage-users" && isAdmin && (
                <Card>
                  <CardHeader>
                    <CardTitle>Manage Users</CardTitle>
                    <CardDescription>Block, suspend, or reactivate users</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="flex justify-end mb-4">
                      <Input 
                        type="search"
                        placeholder="Search users..."
                        className="max-w-xs"
                      />
                    </div>
                    
                    <div className="rounded-md border">
                      <Table>
                        <TableHeader>
                          <TableRow>
                            <TableHead>Username</TableHead>
                            <TableHead>User Type</TableHead>
                            <TableHead>Status</TableHead>
                            <TableHead>Actions</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          <TableRow>
                            <TableCell className="font-medium">employer@example.com</TableCell>
                            <TableCell>Employer</TableCell>
                            <TableCell>
                              <Badge variant="outline" className="bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300 border-green-400">Active</Badge>
                            </TableCell>
                            <TableCell>
                              <div className="flex space-x-2">
                                <Button variant="outline" size="sm">
                                  <Ban className="h-4 w-4 mr-1" />
                                  Block
                                </Button>
                                <Button variant="outline" size="sm">
                                  <Clock className="h-4 w-4 mr-1" />
                                  Suspend
                                </Button>
                              </div>
                            </TableCell>
                          </TableRow>
                          <TableRow>
                            <TableCell className="font-medium">jobseeker@example.com</TableCell>
                            <TableCell>Job Seeker</TableCell>
                            <TableCell>
                              <Badge variant="outline" className="bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300 border-yellow-400">Suspended</Badge>
                            </TableCell>
                            <TableCell>
                              <div className="flex space-x-2">
                                <Button variant="outline" size="sm">
                                  <Ban className="h-4 w-4 mr-1" />
                                  Block
                                </Button>
                                <Button variant="outline" size="sm">
                                  <CheckCircle className="h-4 w-4 mr-1" />
                                  Reactivate
                                </Button>
                              </div>
                            </TableCell>
                          </TableRow>
                          <TableRow>
                            <TableCell className="font-medium">blockeduser@example.com</TableCell>
                            <TableCell>Job Seeker</TableCell>
                            <TableCell>
                              <Badge variant="destructive">Blocked</Badge>
                            </TableCell>
                            <TableCell>
                              <div className="flex space-x-2">
                                <Button variant="outline" size="sm">
                                  <CheckCircle className="h-4 w-4 mr-1" />
                                  Reactivate
                                </Button>
                              </div>
                            </TableCell>
                          </TableRow>
                        </TableBody>
                      </Table>
                    </div>
                  </CardContent>
                </Card>
              )}
              
              {/* Employer Pages */}
              {activeTab === "company" && isEmployer && (
                <Card>
                  <CardHeader>
                    <CardTitle>Company Information</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <form onSubmit={handleEmployerSubmit} className="space-y-4">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <Label htmlFor="companyName">Company Name</Label>
                          <Input
                            id="companyName"
                            name="companyName"
                            value={employerForm.companyName}
                            onChange={handleEmployerChange}
                            required
                          />
                        </div>
                        <div>
                          <Label htmlFor="industry">Industry</Label>
                          <Input
                            id="industry"
                            name="industry"
                            value={employerForm.industry}
                            onChange={handleEmployerChange}
                            required
                            placeholder="e.g. Technology, Healthcare, Finance"
                          />
                        </div>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <Label htmlFor="companySize">Company Size</Label>
                          <Input
                            id="companySize"
                            name="companySize"
                            value={employerForm.companySize}
                            onChange={handleEmployerChange}
                            placeholder="e.g. 1-10, 11-50, 51-200, 201-500, 500+"
                          />
                        </div>
                        <div>
                          <Label htmlFor="location">Location</Label>
                          <Input
                            id="location"
                            name="location"
                            value={employerForm.location}
                            onChange={handleEmployerChange}
                            placeholder="e.g. San Francisco, CA"
                          />
                        </div>
                      </div>

                      <div>
                        <Label htmlFor="description">Company Description</Label>
                        <Textarea
                          id="description"
                          name="description"
                          value={employerForm.description}
                          onChange={handleEmployerChange}
                          rows={4}
                          placeholder="Describe your company, mission, and culture"
                        />
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <Label htmlFor="website">Website</Label>
                          <Input
                            id="website"
                            name="website"
                            type="url"
                            value={employerForm.website}
                            onChange={handleEmployerChange}
                            placeholder="https://your-company.com"
                          />
                        </div>
                        <div>
                          <Label htmlFor="logoUrl">Logo URL</Label>
                          <Input
                            id="logoUrl"
                            name="logoUrl"
                            type="url"
                            value={employerForm.logoUrl}
                            onChange={handleEmployerChange}
                            placeholder="Link to your company logo"
                          />
                        </div>
                      </div>

                      <Button 
                        type="submit"
                        disabled={updateEmployerMutation.isPending}
                        className="mt-4"
                      >
                        {updateEmployerMutation.isPending && (
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        )}
                        <Save className="mr-2 h-4 w-4" />
                        Save Company Profile
                      </Button>
                    </form>
                  </CardContent>
                </Card>
              )}
              
              {/* Job Seeker Pages */}
              {activeTab === "wishlist" && isJobSeeker && (
                <Card>
                  <CardHeader>
                    <CardTitle>Your Wishlist</CardTitle>
                    <CardDescription>Jobs you've saved for later</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="text-center py-16">
                      <Heart className="h-16 w-16 text-gray-400 mx-auto mb-4" />
                      <h3 className="text-xl font-medium mb-2">Your Wishlist is Empty</h3>
                      <p className="text-gray-500 dark:text-gray-400 max-w-md mx-auto">
                        Browse jobs and click the heart icon to add them to your wishlist for easy access later.
                      </p>
                      <Button className="mt-4" asChild>
                        <Link href="/jobs">Browse Jobs</Link>
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              )}
              
              {activeTab === "applications" && isJobSeeker && (
                <Card>
                  <CardHeader>
                    <CardTitle>Your Applications</CardTitle>
                    <CardDescription>Track the status of your job applications</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="text-center py-16">
                      <FileText className="h-16 w-16 text-gray-400 mx-auto mb-4" />
                      <h3 className="text-xl font-medium mb-2">No Applications Yet</h3>
                      <p className="text-gray-500 dark:text-gray-400 max-w-md mx-auto">
                        You haven't applied to any jobs yet. Browse jobs and start applying!
                      </p>
                      <Button className="mt-4" asChild>
                        <Link href="/jobs">Browse Jobs</Link>
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              )}
              
              {activeTab === "messages" && (isJobSeeker || isEmployer) && (
                <Card>
                  <CardHeader>
                    <CardTitle>Messages</CardTitle>
                    <CardDescription>Your conversations with {isJobSeeker ? "employers" : "job seekers"}</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="text-center py-16">
                      <MessageCircle className="h-16 w-16 text-gray-400 mx-auto mb-4" />
                      <h3 className="text-xl font-medium mb-2">No Messages Yet</h3>
                      <p className="text-gray-500 dark:text-gray-400 max-w-md mx-auto">
                        When you have conversations with {isJobSeeker ? "employers" : "job seekers"}, they will appear here.
                      </p>
                    </div>
                  </CardContent>
                </Card>
              )}
              
              {activeTab === "cv" && isJobSeeker && (
                <Card>
                  <CardHeader>
                    <CardTitle>Update CV</CardTitle>
                    <CardDescription>Manage your resume and CV</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <div>
                        <Label htmlFor="resumeUpload">Upload Resume (PDF)</Label>
                        <Input id="resumeUpload" type="file" accept=".pdf" />
                      </div>
                      
                      <div>
                        <Label>Current Resume</Label>
                        {jobSeekerProfile?.resumeUrl ? (
                          <div className="flex items-center mt-2 p-4 border rounded-md">
                            <FileText className="h-8 w-8 text-primary mr-4" />
                            <div className="flex-1">
                              <p className="font-medium">My Resume.pdf</p>
                              <p className="text-sm text-gray-500">Uploaded on {new Date().toLocaleDateString()}</p>
                            </div>
                            <Button variant="outline" size="sm" asChild>
                              <a href={jobSeekerProfile.resumeUrl} target="_blank" rel="noopener noreferrer">
                                View
                              </a>
                            </Button>
                          </div>
                        ) : (
                          <div className="p-4 border rounded-md text-center text-gray-500">
                            No resume uploaded yet
                          </div>
                        )}
                      </div>
                      
                      <Button className="mt-2">
                        <Upload className="mr-2 h-4 w-4" />
                        Upload Resume
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              )}
              
              {activeTab === "feedback" && (isJobSeeker || isEmployer) && (
                <Card>
                  <CardHeader>
                    <CardTitle>Add Feedback</CardTitle>
                    <CardDescription>Help us improve your experience</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <form className="space-y-4">
                      <div>
                        <Label htmlFor="feedbackType">Feedback Type</Label>
                        <Select defaultValue="suggestion">
                          <SelectTrigger>
                            <SelectValue placeholder="Select type" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="suggestion">Suggestion</SelectItem>
                            <SelectItem value="issue">Report an Issue</SelectItem>
                            <SelectItem value="praise">Praise</SelectItem>
                            <SelectItem value="other">Other</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      
                      <div>
                        <Label htmlFor="feedbackTitle">Title</Label>
                        <Input id="feedbackTitle" placeholder="Brief title for your feedback" />
                      </div>
                      
                      <div>
                        <Label htmlFor="feedbackDetails">Details</Label>
                        <Textarea 
                          id="feedbackDetails" 
                          placeholder="Please provide details about your feedback..."
                          rows={5}
                        />
                      </div>
                      
                      <Button className="w-full">
                        <Send className="mr-2 h-4 w-4" />
                        Submit Feedback
                      </Button>
                    </form>
                  </CardContent>
                </Card>
              )}
              
              {/* Employer Pages */}
              {activeTab === "watchlist" && isEmployer && (
                <Card>
                  <CardHeader>
                    <CardTitle>Your Watchlist</CardTitle>
                    <CardDescription>Job seekers you're keeping an eye on</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="text-center py-16">
                      <Eye className="h-16 w-16 text-gray-400 mx-auto mb-4" />
                      <h3 className="text-xl font-medium mb-2">Your Watchlist is Empty</h3>
                      <p className="text-gray-500 dark:text-gray-400 max-w-md mx-auto">
                        Add promising candidates to your watchlist to track them.
                      </p>
                    </div>
                  </CardContent>
                </Card>
              )}
              
              {activeTab === "requests" && isEmployer && (
                <Card>
                  <CardHeader>
                    <CardTitle>Manage Requests</CardTitle>
                    <CardDescription>Handle incoming job applications and inquiries</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="text-center py-16">
                      <InboxIcon className="h-16 w-16 text-gray-400 mx-auto mb-4" />
                      <h3 className="text-xl font-medium mb-2">No Pending Requests</h3>
                      <p className="text-gray-500 dark:text-gray-400 max-w-md mx-auto">
                        Incoming applications and inquiries will appear here.
                      </p>
                    </div>
                  </CardContent>
                </Card>
              )}
              
              {activeTab === "jobs" && isEmployer && (
                <>
                  <div className="flex justify-between items-center mb-4">
                    <h2 className="text-2xl font-bold">Your Job Listings</h2>
                    <Button onClick={handleAddNewJob}>
                      <PlusCircle className="mr-2 h-4 w-4" />
                      Post New Job
                    </Button>
                  </div>
                  
                  {loadingJobs ? (
                    <div className="flex items-center justify-center h-64">
                      <Loader2 className="h-8 w-8 animate-spin text-primary mr-2" />
                      <p>Loading your job listings...</p>
                    </div>
                  ) : employerJobs && employerJobs.length > 0 ? (
                    <div className="grid grid-cols-1 gap-4">
                      {employerJobs.map((job) => (
                        <Card key={job.id} className="overflow-hidden">
                          <CardContent className="p-0">
                            <div className="p-6">
                              <div className="flex justify-between items-start">
                                <div>
                                  <h3 className="text-xl font-semibold">{job.title}</h3>
                                  <div className="flex items-center text-sm text-gray-500 dark:text-gray-400 mt-1">
                                    <MapPin className="h-4 w-4 mr-1" />
                                    <span>{job.location || "Remote"}</span>
                                    <span className="mx-2">•</span>
                                    <Clock className="h-4 w-4 mr-1" />
                                    <span className="capitalize">{job.jobType}</span>
                                    {job.salaryMin && job.salaryMax && (
                                      <>
                                        <span className="mx-2">•</span>
                                        <DollarSign className="h-4 w-4 mr-1" />
                                        <span>${job.salaryMin} - ${job.salaryMax}</span>
                                      </>
                                    )}
                                  </div>
                                </div>
                                <div className="flex space-x-2">
                                  <Button 
                                    variant="outline" 
                                    size="sm"
                                    onClick={() => handleEditJob(job)}
                                  >
                                    <PenSquare className="h-4 w-4 mr-1" />
                                    Edit
                                  </Button>
                                  <Button 
                                    variant="destructive" 
                                    size="sm"
                                    onClick={() => handleDeleteJob(job.id)}
                                  >
                                    <Trash2 className="h-4 w-4 mr-1" />
                                    Delete
                                  </Button>
                                </div>
                              </div>
                              
                              <div className="mt-4">
                                <p className="text-sm line-clamp-2">
                                  {job.description}
                                </p>
                              </div>
                              
                              <div className="mt-4 flex flex-wrap gap-2">
                                <Badge variant="outline" className="bg-primary/10">
                                  <Calendar className="h-3.5 w-3.5 mr-1" />
                                  Posted: {format(new Date(job.createdAt), 'MMM d, yyyy')}
                                </Badge>
                                
                                {job.applicationDeadline && (
                                  <Badge variant="outline" className="bg-primary/10">
                                    <Calendar className="h-3.5 w-3.5 mr-1" />
                                    Deadline: {format(new Date(job.applicationDeadline), 'MMM d, yyyy')}
                                  </Badge>
                                )}
                              </div>
                            </div>
                          </CardContent>
                        </Card>
                      ))}
                    </div>
                  ) : (
                    <Card>
                      <CardContent className="p-6 text-center">
                        <div className="flex flex-col items-center justify-center space-y-4 py-12">
                          <Briefcase className="h-16 w-16 text-gray-400 dark:text-gray-600" />
                          <div className="space-y-2">
                            <h3 className="text-xl font-semibold">No Job Listings Yet</h3>
                            <p className="text-gray-500 dark:text-gray-400 max-w-sm mx-auto">
                              You haven't posted any jobs yet. Click the button below to create your first job listing.
                            </p>
                          </div>
                          <Button onClick={handleAddNewJob}>
                            <PlusCircle className="mr-2 h-4 w-4" />
                            Post Your First Job
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  )}
                  
                  {/* Job Form Dialog */}
                  <Dialog open={isJobDialogOpen} onOpenChange={setIsJobDialogOpen}>
                    <DialogContent className="sm:max-w-[600px]">
                      <DialogHeader>
                        <DialogTitle>{selectedJob ? "Edit Job Posting" : "Create New Job Posting"}</DialogTitle>
                        <DialogDescription>
                          {selectedJob 
                            ? "Update the details of your job posting. Click save when you're done."
                            : "Fill out the form below to create a new job posting."
                          }
                        </DialogDescription>
                      </DialogHeader>
                      
                      <form onSubmit={handleSubmitJob} className="space-y-4">
                        <div>
                          <Label htmlFor="title">Job Title *</Label>
                          <Input
                            id="title"
                            name="title"
                            value={jobForm.title}
                            onChange={handleJobFormChange}
                            placeholder="e.g. Senior Frontend Developer"
                            required
                          />
                        </div>
                        
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div>
                            <Label htmlFor="location">Location *</Label>
                            <Input
                              id="location"
                              name="location"
                              value={jobForm.location}
                              onChange={handleJobFormChange}
                              placeholder="e.g. New York, Remote"
                              required
                            />
                          </div>
                          <div>
                            <Label htmlFor="jobType">Job Type *</Label>
                            <Select 
                              defaultValue={jobForm.jobType}
                              onValueChange={handleJobTypeChange}
                            >
                              <SelectTrigger>
                                <SelectValue placeholder="Select job type" />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="full-time">Full-time</SelectItem>
                                <SelectItem value="part-time">Part-time</SelectItem>
                                <SelectItem value="contract">Contract</SelectItem>
                                <SelectItem value="internship">Internship</SelectItem>
                                <SelectItem value="freelance">Freelance</SelectItem>
                              </SelectContent>
                            </Select>
                          </div>
                        </div>
                        
                        <div>
                          <Label htmlFor="description">Job Description *</Label>
                          <Textarea
                            id="description"
                            name="description"
                            value={jobForm.description}
                            onChange={handleJobFormChange}
                            rows={4}
                            placeholder="Describe the job role, responsibilities, etc."
                            required
                          />
                        </div>
                        
                        <div>
                          <Label htmlFor="requirements">Requirements</Label>
                          <Textarea
                            id="requirements"
                            name="requirements"
                            value={jobForm.requirements}
                            onChange={handleJobFormChange}
                            rows={3}
                            placeholder="List the required skills, experience, etc."
                          />
                        </div>
                        
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div>
                            <Label htmlFor="salaryMin">Salary Range (Min)</Label>
                            <Input
                              id="salaryMin"
                              name="salaryMin"
                              type="text"
                              inputMode="numeric"
                              value={jobForm.salaryMin}
                              onChange={handleJobFormChange}
                              placeholder="e.g. 50000"
                            />
                          </div>
                          <div>
                            <Label htmlFor="salaryMax">Salary Range (Max)</Label>
                            <Input
                              id="salaryMax"
                              name="salaryMax"
                              type="text"
                              inputMode="numeric"
                              value={jobForm.salaryMax}
                              onChange={handleJobFormChange}
                              placeholder="e.g. 80000"
                            />
                          </div>
                        </div>
                        
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div>
                            <Label htmlFor="contactEmail">Contact Email *</Label>
                            <Input
                              id="contactEmail"
                              name="contactEmail"
                              type="email"
                              value={jobForm.contactEmail}
                              onChange={handleJobFormChange}
                              placeholder="e.g. careers@company.com"
                              required
                            />
                          </div>
                          <div>
                            <Label htmlFor="applicationDeadline">Application Deadline</Label>
                            <Input
                              id="applicationDeadline"
                              name="applicationDeadline"
                              type="date"
                              value={jobForm.applicationDeadline}
                              onChange={handleJobFormChange}
                            />
                          </div>
                        </div>
                        
                        <DialogFooter>
                          <Button type="button" variant="outline" onClick={() => setIsJobDialogOpen(false)}>
                            Cancel
                          </Button>
                          <Button 
                            type="submit"
                            disabled={addJobMutation.isPending || updateJobMutation.isPending}
                          >
                            {(addJobMutation.isPending || updateJobMutation.isPending) && (
                              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                            )}
                            {selectedJob ? "Update Job" : "Post Job"}
                          </Button>
                        </DialogFooter>
                      </form>
                    </DialogContent>
                  </Dialog>
                </>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
}