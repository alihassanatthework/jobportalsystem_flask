import { useState, useRef, useEffect } from "react";
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
    company_name: "",
    location: "",
    job_type: "full_time" as const,
    description: "",
    salary_min: "",
    salary_max: "",
    experience_level: "entry" as const,
  });

  // Job Seeker Profile Form State
  const [jobSeekerForm, setJobSeekerForm] = useState({
    username: "",
    bio: "",
    skills: "",
    experience_years: "",
    education_level: "",
    country: "",
    state: "",
    city: "",
    phone: "",
    resume_url: "",
  });

  // Employer Profile Form State
  const [employerForm, setEmployerForm] = useState({
    company_name: "",
    industry: "",
    company_size: "",
    company_description: "",
    country: "",
    state: "",
    city: "",
    company_website: "",
    phone: "",
  });
  
  // Fetch employer's jobs
  const { data: employerJobs, isLoading: isLoadingJobs } = useQuery({
    queryKey: ['/jobs/employer'],
    queryFn: async () => {
      const response = await apiRequest('GET', '/jobs/employer');
      return response.json();
    },
    enabled: !!user && user.role === 'employer',
  });
  
  // Add job mutation
  const addJobMutation = useMutation({
    mutationFn: async (data: Partial<Job>) => {
      const response = await apiRequest('POST', '/jobs', data);
      return response.json();
    },
    onSuccess: () => {
      toast({
        title: "Job posted successfully",
        description: "Your job has been posted and is now visible to job seekers.",
      });
      queryClient.invalidateQueries({ queryKey: ['/jobs/employer'] });
      queryClient.invalidateQueries({ queryKey: ['/jobs'] });
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
      const response = await apiRequest('PUT', `/jobs/${id}`, data);
      return response.json();
    },
    onSuccess: () => {
      toast({
        title: "Job updated successfully",
        description: "Your job posting has been updated.",
      });
      queryClient.invalidateQueries({ queryKey: ['/jobs/employer'] });
      queryClient.invalidateQueries({ queryKey: ['/jobs'] });
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
      const response = await apiRequest('DELETE', `/jobs/${id}`);
      return response.ok;
    },
    onSuccess: () => {
      toast({
        title: "Job deleted successfully",
        description: "Your job posting has been removed.",
      });
      queryClient.invalidateQueries({ queryKey: ['/jobs/employer'] });
      queryClient.invalidateQueries({ queryKey: ['/jobs'] });
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
  const { data: jobSeekerProfile, isLoading: isLoadingJobSeekerProfile } = useQuery({
    queryKey: ["/users/profile"],
    queryFn: async () => {
      const response = await apiRequest("GET", "/users/profile");
      return response.json();
    },
    enabled: !!user && user.role === 'job_seeker',
  });

  // Fetch employer profile
  const { data: employerProfile, isLoading: isLoadingEmployerProfile } = useQuery({
    queryKey: ["/users/profile"],
    queryFn: async () => {
      const response = await apiRequest("GET", "/users/profile");
      return response.json();
    },
    enabled: !!user && user.role === 'employer',
  });

  // Update job seeker profile mutation
  const updateJobSeekerMutation = useMutation({
    mutationFn: async (data: Partial<JobSeekerProfile>) => {
      const response = await apiRequest("PUT", "/users/profile", data);
      return response.json();
    },
    onSuccess: () => {
      toast({
        title: "Profile updated",
        description: "Your profile information has been updated successfully.",
      });
      queryClient.invalidateQueries({ queryKey: ["/users/profile"] });
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
      const response = await apiRequest("PUT", "/users/profile", data);
      return response.json();
    },
    onSuccess: () => {
      toast({
        title: "Company profile updated",
        description: "Your company information has been updated successfully.",
      });
      queryClient.invalidateQueries({ queryKey: ["/users/profile"] });
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
      username: jobSeekerForm.username,
      bio: jobSeekerForm.bio,
      headline: jobSeekerForm.bio, // Use bio as headline
      summary: jobSeekerForm.bio, // Use bio as summary
      skills: jobSeekerForm.skills.split(",").map((skill) => skill.trim()).filter(Boolean),
      experience_years: jobSeekerForm.experience_years ? Number(jobSeekerForm.experience_years) : undefined,
      education_level: jobSeekerForm.education_level,
      country: jobSeekerForm.country,
      state: jobSeekerForm.state,
      city: jobSeekerForm.city,
      phone: jobSeekerForm.phone,
      resume_url: jobSeekerForm.resume_url,
      // Include structured data from CV parsing
      work_experience: parsedCVData.work_experience,
      education: parsedCVData.education,
      languages: parsedCVData.languages,
      certifications: parsedCVData.certifications,
    });
  };

  const handleEmployerSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    updateEmployerMutation.mutate({
      company_name: employerForm.company_name,
      industry: employerForm.industry,
      company_size: employerForm.company_size,
      company_description: employerForm.company_description,
      country: employerForm.country,
      state: employerForm.state,
      city: employerForm.city,
      company_website: employerForm.company_website,
      phone: employerForm.phone,
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
      company_name: "",
      location: "",
      job_type: "full_time",
      description: "",
      requirements: "",
      salary_min: "",
      salary_max: "",
      contact_email: "",
      application_deadline: ""
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
      job_type: value as "full_time" | "part_time" | "contract" | "internship",
    }));
  };

  const handleExperienceLevelChange = (value: string) => {
    setJobForm((prev) => ({
      ...prev,
      experience_level: value as "entry" | "mid" | "senior" | "executive",
    }));
  };
  
  const handleEditJob = (job: Job) => {
    setSelectedJob(job);
    setJobForm({
      title: job.title || "",
      company_name: job.company_name || "",
      location: job.location || "",
      job_type: job.job_type || "full_time",
      description: job.description || "",
      requirements: job.requirements || "",
      salary_min: job.salary_min ? String(job.salary_min) : "",
      salary_max: job.salary_max ? String(job.salary_max) : "",
      contact_email: job.contact_email || user?.email || "",
      application_deadline: job.application_deadline ? new Date(job.application_deadline).toISOString().split('T')[0] : ""
    });
    setIsJobDialogOpen(true);
  };
  
  const handleAddNewJob = () => {
    setSelectedJob(null);
    setJobForm({
      title: "",
      company_name: employerProfile?.company_name || "",
      location: employerProfile?.city || "",
      job_type: "full_time",
      description: "",
      requirements: "",
      salary_min: "",
      salary_max: "",
      contact_email: user?.email || "",
      application_deadline: ""
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
      description: jobForm.description,
      requirements: jobForm.requirements,
      company_name: jobForm.company_name,
      job_type: jobForm.job_type,
      experience_level: "entry", // Default value, should be selectable in form
      salary_min: jobForm.salary_min ? parseFloat(jobForm.salary_min) : undefined,
      salary_max: jobForm.salary_max ? parseFloat(jobForm.salary_max) : undefined,
      location: jobForm.location,
      contact_email: jobForm.contact_email,
      application_deadline: jobForm.application_deadline ? new Date(jobForm.application_deadline).toISOString() : undefined
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

  const fileInputRef = useRef<HTMLInputElement>(null);
  const [uploadingCV, setUploadingCV] = useState(false);

  // State for storing parsed CV data
  const [parsedCVData, setParsedCVData] = useState<{
    work_experience: any[];
    education: any[];
    languages: any[];
    certifications: any[];
  }>({
    work_experience: [],
    education: [],
    languages: [],
    certifications: [],
  });

  // Populate form when profile data is loaded
  useEffect(() => {
    if (jobSeekerProfile?.profile) {
      const profile = jobSeekerProfile.profile;
      setJobSeekerForm({
        username: profile.username || "",
        bio: profile.bio || "",
        skills: Array.isArray(profile.skills) ? profile.skills.join(", ") : profile.skills || "",
        experience_years: profile.experience_years?.toString() || "",
        education_level: profile.education_level || "",
        country: profile.country || "",
        state: profile.state || "",
        city: profile.city || "",
        phone: profile.phone || "",
        resume_url: profile.resume_url || "",
      });
    }
  }, [jobSeekerProfile]);

  // Function to automatically fill profile from parsed CV data
  const fillProfileFromCV = (parsedData: any) => {
    const mappedData = {
      username: parsedData.username || parsedData.name || jobSeekerForm.username,
      bio: parsedData.headline || parsedData.summary || parsedData.bio || jobSeekerForm.bio,
      skills: parsedData.skills || jobSeekerForm.skills,
      experience_years: parsedData.experience_years || jobSeekerForm.experience_years,
      education_level: parsedData.education_level || jobSeekerForm.education_level,
      phone: parsedData.phone || parsedData.contact || jobSeekerForm.phone,
      country: parsedData.country || parsedData.location?.country || jobSeekerForm.country,
      state: parsedData.state || parsedData.location?.state || jobSeekerForm.state,
      city: parsedData.city || parsedData.location?.city || jobSeekerForm.city,
      resume_url: jobSeekerForm.resume_url,
    };

    setJobSeekerForm((prev) => ({
      ...prev,
      ...mappedData,
    }));

    // Store structured data for display
    setParsedCVData({
      work_experience: parsedData.work_experience || [],
      education: parsedData.education || [],
      languages: parsedData.languages || [],
      certifications: parsedData.certifications || [],
    });

    toast({
      title: "Profile Auto-Filled!",
      description: "Your profile has been automatically populated with CV data. Please review and save.",
    });
  };

  // Handle CV upload and parsing
  const handleCVUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    
    setUploadingCV(true);
    const formData = new FormData();
    formData.append("cv", file);
    
    try {
      const token = localStorage.getItem('access_token');
      const response = await fetch("http://localhost:5000/api/users/profile/parse-cv", {
        method: "POST",
        body: formData,
        headers: token ? { Authorization: `Bearer ${token}` } : undefined,
      });
      
      const data = await response.json();
      
      if (response.ok && data.extracted) {
        // Automatically fill profile with parsed data
        fillProfileFromCV(data.extracted);
        
        toast({
          title: "CV Parsed Successfully!",
          description: `Extracted ${Object.keys(data.extracted).length} fields from your CV. Your profile has been automatically populated.`,
        });
      } else {
        toast({
          title: "Parsing Failed",
          description: data.error || "Could not extract information from the CV. Please try again or manually enter your information.",
          variant: "destructive",
        });
      }
    } catch (err) {
      toast({
        title: "Upload Failed",
        description: (err as Error).message || "Could not upload or parse the CV. Please check your internet connection and try again.",
        variant: "destructive",
      });
    } finally {
      setUploadingCV(false);
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  };

  const updateCVInputRef = useRef<HTMLInputElement>(null);
  const [uploadingUpdateCV, setUploadingUpdateCV] = useState(false);

  const handleUpdateCVUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploadingUpdateCV(true);
    const formData = new FormData();
    formData.append("cv", file);
    try {
      const token = localStorage.getItem('access_token');
      const response = await fetch("http://localhost:5000/api/users/profile/parse-cv", {
        method: "POST",
        body: formData,
        headers: token ? { Authorization: `Bearer ${token}` } : undefined,
      });
      const data = await response.json();
      if (data.extracted) {
        setJobSeekerForm((prev) => ({
          ...prev,
          ...data.extracted,
        }));
        toast({
          title: "CV Parsed!",
          description: "Key information was extracted and filled in the form. Please review and confirm.",
        });
      } else {
        toast({
          title: "Parsing failed",
          description: data.error || "Could not extract information from the CV.",
          variant: "destructive",
        });
      }
    } catch (err) {
      toast({
        title: "Upload failed",
        description: (err as Error).message || "Could not upload or parse the CV.",
        variant: "destructive",
      });
    } finally {
      setUploadingUpdateCV(false);
      if (updateCVInputRef.current) updateCVInputRef.current.value = "";
    }
  };

  const resumeInputRef = useRef<HTMLInputElement>(null);
  const [uploadingResume, setUploadingResume] = useState(false);
  const [uploadedResumeUrl, setUploadedResumeUrl] = useState<string | null>(null);
  const [viewingFile, setViewingFile] = useState(false);
  const [downloadingFile, setDownloadingFile] = useState(false);

  const handleResumeUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploadingResume(true);
    const formData = new FormData();
    formData.append("resume", file); // KEY MUST BE 'resume'
    try {
      const token = localStorage.getItem('access_token');
      const response = await fetch("http://localhost:5000/api/users/profile/upload-resume", {
        method: "POST",
        body: formData,
        headers: token ? { Authorization: `Bearer ${token}` } : undefined,
      });
      const data = await response.json();
      if (data.resume_url) {
        setUploadedResumeUrl(data.resume_url);
        toast({
          title: "Resume Uploaded!",
          description: "Your resume has been uploaded and stored.",
        });
        queryClient.invalidateQueries({ queryKey: ["/users/profile"] });
      } else {
        toast({
          title: "Upload failed",
          description: data.error || "Could not upload the resume.",
          variant: "destructive",
        });
      }
    } catch (err) {
      toast({
        title: "Upload failed",
        description: (err as Error).message || "Could not upload the resume.",
        variant: "destructive",
      });
    } finally {
      setUploadingResume(false);
      if (resumeInputRef.current) resumeInputRef.current.value = "";
    }
  };

  useEffect(() => {
    if (jobSeekerProfile?.profile?.resume_url) {
      setUploadedResumeUrl(null);
    }
  }, [jobSeekerProfile?.profile?.resume_url]);

  if (!user) {
    return (
      <div className="container mx-auto py-16 text-center">
        <h2 className="text-2xl font-bold mb-4">Access Denied</h2>
        <p>You need to log in to view this page.</p>
      </div>
    );
  }

  const isJobSeeker = user.role === "job_seeker";
  const isEmployer = user.role === "employer";
  const isAdmin = user.role === "admin";
  const isLoading = isLoadingJobSeekerProfile || isLoadingEmployerProfile;

  const getProfileInitials = () => {
    if (isJobSeeker && jobSeekerProfile?.username) {
      const names = jobSeekerProfile.username.split(" ");
      return names.length > 1
        ? `${names[0][0]}${names[names.length - 1][0]}`
        : names[0][0];
    } else if (isEmployer && employerProfile?.company_name) {
      return employerProfile.company_name[0];
    } else {
      return user.email ? user.email[0].toUpperCase() : 'U';
    }
  };

  // Add this debug print inside the ProfilePage component, after jobSeekerProfile is fetched:
  console.log('DEBUG: jobSeekerProfile', jobSeekerProfile);

  const resumeUrlToShow = uploadedResumeUrl || jobSeekerProfile?.profile?.resume_url;

  // Function to extract filename from resume URL
  const getResumeFilename = (url: string | null) => {
    if (!url) return "My Resume.pdf";
    const filename = url.split('/').pop();
    return filename || "My Resume.pdf";
  };

  // Function to handle file viewing with authentication
  const handleViewFile = async (fileUrl: string) => {
    setViewingFile(true);
    try {
      const token = localStorage.getItem('access_token');
      if (!token) {
        toast({
          title: "Authentication required",
          description: "Please log in to view files.",
          variant: "destructive",
        });
        return;
      }

      // Create a blob URL for viewing
      const response = await fetch(`http://localhost:5000/api/users${fileUrl}`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (!response.ok) {
        throw new Error('Failed to fetch file');
      }

      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      
      // Open in new tab
      window.open(url, '_blank');
      
      // Clean up the blob URL after a delay
      setTimeout(() => window.URL.revokeObjectURL(url), 1000);
      
    } catch (error) {
      toast({
        title: "Error viewing file",
        description: "Could not load the file. Please try again.",
        variant: "destructive",
      });
    } finally {
      setViewingFile(false);
    }
  };

  // Function to handle file download with authentication
  const handleDownloadFile = async (fileUrl: string) => {
    setDownloadingFile(true);
    try {
      const token = localStorage.getItem('access_token');
      if (!token) {
        toast({
          title: "Authentication required",
          description: "Please log in to download files.",
          variant: "destructive",
        });
        return;
      }

      const response = await fetch(`http://localhost:5000/api/users${fileUrl}?download=true`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (!response.ok) {
        throw new Error('Failed to download file');
      }

      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      
      // Create a temporary link and trigger download
      const a = document.createElement('a');
      a.href = url;
      a.download = getResumeFilename(fileUrl);
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      
      // Clean up the blob URL
      window.URL.revokeObjectURL(url);
      
      toast({
        title: "Download started",
        description: "Your file download has begun.",
      });
      
    } catch (error) {
      toast({
        title: "Error downloading file",
        description: "Could not download the file. Please try again.",
        variant: "destructive",
      });
    } finally {
      setDownloadingFile(false);
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
                  {isJobSeeker && jobSeekerProfile?.username
                    ? jobSeekerProfile.username
                    : isEmployer && employerProfile?.company_name
                    ? employerProfile.company_name
                    : user.email || 'User'}
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
                {isJobSeeker && jobSeekerProfile?.bio && (
                  <p className="text-sm mt-2">{jobSeekerProfile.bio}</p>
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
                          value={user.email || 'User'}
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
                    {/* Resume Upload, View, and Delete */}
                    <div className="mb-4 flex flex-col md:flex-row md:items-center gap-4">
                      <div>
                        <input
                          type="file"
                          accept=".pdf,.doc,.docx"
                          ref={resumeInputRef}
                          style={{ display: "none" }}
                          onChange={handleResumeUpload}
                        />
                        <Button
                          type="button"
                          variant="outline"
                          onClick={() => resumeInputRef.current?.click()}
                          disabled={uploadingResume}
                        >
                          {uploadingResume ? (
                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                          ) : (
                            <Upload className="mr-2 h-4 w-4" />
                          )}
                          Upload Resume (Store)
                        </Button>
                      </div>
                      {resumeUrlToShow && (
                        <div className="flex items-center mt-2 p-4 border rounded-md">
                          <FileText className="h-8 w-8 text-primary mr-4" />
                          <div className="flex-1">
                            <p className="font-medium">{getResumeFilename(resumeUrlToShow)}</p>
                            <p className="text-sm text-gray-500">Uploaded on {new Date().toLocaleDateString()}</p>
                          </div>
                          <Button 
                            variant="outline" 
                            size="sm" 
                            onClick={() => handleViewFile(resumeUrlToShow!)}
                            disabled={viewingFile}
                          >
                            {viewingFile ? (
                              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                            ) : null}
                            View
                          </Button>
                          <Button 
                            variant="outline" 
                            size="sm" 
                            className="ml-2"
                            onClick={() => handleDownloadFile(resumeUrlToShow!)}
                            disabled={downloadingFile}
                          >
                            {downloadingFile ? (
                              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                            ) : null}
                            Download
                          </Button>
                          <Button
                            variant="destructive"
                            size="sm"
                            className="ml-2"
                            onClick={async () => {
                              const token = localStorage.getItem('access_token');
                              const response = await fetch("http://localhost:5000/api/users/profile/delete-resume", {
                                method: "DELETE",
                                headers: token ? { Authorization: `Bearer ${token}` } : undefined,
                              });
                              if (response.ok) {
                                setUploadedResumeUrl(null);
                                toast({
                                  title: "Resume Deleted!",
                                  description: "Your resume has been deleted.",
                                });
                                queryClient.invalidateQueries({ queryKey: ["/users/profile"] });
                              } else {
                                const data = await response.json();
                                toast({
                                  title: "Delete failed",
                                  description: data.error || "Could not delete the resume.",
                                  variant: "destructive",
                                });
                              }
                            }}
                          >
                            Delete
                          </Button>
                        </div>
                      )}
                    </div>
                    {/* CV Parse Upload */}
                    <div className="mb-4 flex flex-col md:flex-row md:items-center gap-4">
                      <div>
                        <input
                          type="file"
                          accept=".pdf,.doc,.docx"
                          ref={fileInputRef}
                          style={{ display: "none" }}
                          onChange={handleCVUpload}
                        />
                        <Button
                          type="button"
                          variant="outline"
                          onClick={() => fileInputRef.current?.click()}
                          disabled={uploadingCV}
                        >
                          {uploadingCV ? (
                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                          ) : (
                            <Upload className="mr-2 h-4 w-4" />
                          )}
                          Upload & Parse CV
                        </Button>
                      </div>
                    </div>
                    <form onSubmit={handleJobSeekerSubmit} className="space-y-4">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <Label htmlFor="username">Full Name</Label>
                          <Input
                            id="username"
                            name="username"
                            value={jobSeekerForm.username}
                            onChange={handleJobSeekerChange}
                          />
                        </div>
                        <div>
                          <Label htmlFor="bio">Professional Headline</Label>
                          <Input
                            id="bio"
                            name="bio"
                            value={jobSeekerForm.bio}
                            onChange={handleJobSeekerChange}
                            placeholder="e.g. Senior Software Engineer"
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
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <Label htmlFor="experience_years">Years of Experience</Label>
                          <Input
                            id="experience_years"
                            name="experience_years"
                            value={jobSeekerForm.experience_years}
                            onChange={handleJobSeekerChange}
                            placeholder="e.g. 3"
                          />
                        </div>
                        <div>
                          <Label htmlFor="education_level">Education Level</Label>
                          <Input
                            id="education_level"
                            name="education_level"
                            value={jobSeekerForm.education_level}
                            onChange={handleJobSeekerChange}
                            placeholder="e.g. Bachelor's, Master's"
                          />
                        </div>
                      </div>
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div>
                          <Label htmlFor="country">Country</Label>
                          <Input
                            id="country"
                            name="country"
                            value={jobSeekerForm.country}
                            onChange={handleJobSeekerChange}
                          />
                        </div>
                        <div>
                          <Label htmlFor="state">State</Label>
                          <Input
                            id="state"
                            name="state"
                            value={jobSeekerForm.state}
                            onChange={handleJobSeekerChange}
                          />
                        </div>
                        <div>
                          <Label htmlFor="city">City</Label>
                          <Input
                            id="city"
                            name="city"
                            value={jobSeekerForm.city}
                            onChange={handleJobSeekerChange}
                          />
                        </div>
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
                      <div>
                        <Label htmlFor="resume_url">Resume URL</Label>
                        <Input
                          id="resume_url"
                          name="resume_url"
                          type="url"
                          value={jobSeekerForm.resume_url}
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

                    {/* Display Parsed CV Data */}
                    {(parsedCVData.work_experience.length > 0 || 
                      parsedCVData.education.length > 0 || 
                      parsedCVData.languages.length > 0 || 
                      parsedCVData.certifications.length > 0) && (
                      <div className="mt-8 space-y-6">
                        <div className="border-t pt-6">
                          <h3 className="text-lg font-semibold mb-4">Parsed CV Information</h3>
                          <p className="text-sm text-gray-600 mb-4">
                            The following information was extracted from your CV. You can edit it above before saving.
                          </p>
                        </div>

                        {/* Work Experience */}
                        {parsedCVData.work_experience.length > 0 && (
                          <div>
                            <h4 className="font-medium mb-2 flex items-center">
                              <Briefcase className="h-4 w-4 mr-2" />
                              Work Experience
                            </h4>
                            <div className="space-y-3">
                              {parsedCVData.work_experience.map((exp, index) => (
                                <div key={index} className="p-3 border rounded-md bg-gray-50 dark:bg-gray-800">
                                  <div className="font-medium">{exp.title || exp.description}</div>
                                  {exp.company && <div className="text-sm text-gray-600">{exp.company}</div>}
                                  {exp.duration && <div className="text-sm text-gray-500">{exp.duration}</div>}
                                </div>
                              ))}
                            </div>
                          </div>
                        )}

                        {/* Education */}
                        {parsedCVData.education.length > 0 && (
                          <div>
                            <h4 className="font-medium mb-2 flex items-center">
                              <Calendar className="h-4 w-4 mr-2" />
                              Education
                            </h4>
                            <div className="space-y-3">
                              {parsedCVData.education.map((edu, index) => (
                                <div key={index} className="p-3 border rounded-md bg-gray-50 dark:bg-gray-800">
                                  <div className="font-medium">{edu.degree || edu.description}</div>
                                  {edu.institution && <div className="text-sm text-gray-600">{edu.institution}</div>}
                                  {edu.year && <div className="text-sm text-gray-500">{edu.year}</div>}
                                </div>
                              ))}
                            </div>
                          </div>
                        )}

                        {/* Languages */}
                        {parsedCVData.languages.length > 0 && (
                          <div>
                            <h4 className="font-medium mb-2">Languages</h4>
                            <div className="flex flex-wrap gap-2">
                              {parsedCVData.languages.map((lang, index) => (
                                <Badge key={index} variant="secondary">
                                  {lang.language} {lang.proficiency && `(${lang.proficiency})`}
                                </Badge>
                              ))}
                            </div>
                          </div>
                        )}

                        {/* Certifications */}
                        {parsedCVData.certifications.length > 0 && (
                          <div>
                            <h4 className="font-medium mb-2 flex items-center">
                              <Star className="h-4 w-4 mr-2" />
                              Certifications
                            </h4>
                            <div className="space-y-3">
                              {parsedCVData.certifications.map((cert, index) => (
                                <div key={index} className="p-3 border rounded-md bg-gray-50 dark:bg-gray-800">
                                  <div className="font-medium">{cert.name || cert.description}</div>
                                  {cert.issuer && <div className="text-sm text-gray-600">{cert.issuer}</div>}
                                  {cert.year && <div className="text-sm text-gray-500">{cert.year}</div>}
                                </div>
                              ))}
                            </div>
                          </div>
                        )}
                      </div>
                    )}
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
                          <Label htmlFor="company_name">Company Name</Label>
                          <Input
                            id="company_name"
                            name="company_name"
                            value={employerForm.company_name}
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
                          <Label htmlFor="company_size">Company Size</Label>
                          <Input
                            id="company_size"
                            name="company_size"
                            value={employerForm.company_size}
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
                        <Label htmlFor="company_description">Company Description</Label>
                        <Textarea
                          id="company_description"
                          name="company_description"
                          value={employerForm.company_description}
                          onChange={handleEmployerChange}
                          rows={4}
                          placeholder="Describe your company, mission, and culture"
                        />
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <Label htmlFor="company_website">Website</Label>
                          <Input
                            id="company_website"
                            name="company_website"
                            type="url"
                            value={employerForm.company_website}
                            onChange={handleEmployerChange}
                            placeholder="https://your-company.com"
                          />
                        </div>
                        <div>
                          <Label htmlFor="phone">Phone Number</Label>
                          <Input
                            id="phone"
                            name="phone"
                            value={employerForm.phone}
                            onChange={handleEmployerChange}
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
                        <input
                          id="resumeUpload"
                          type="file"
                          accept=".pdf,.doc,.docx"
                          ref={updateCVInputRef}
                          style={{ display: "none" }}
                          onChange={handleUpdateCVUpload}
                        />
                        <Button
                          className="mt-2"
                          type="button"
                          variant="outline"
                          onClick={() => updateCVInputRef.current?.click()}
                          disabled={uploadingUpdateCV}
                        >
                          {uploadingUpdateCV ? (
                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                          ) : (
                            <Upload className="mr-2 h-4 w-4" />
                          )}
                          Upload & Parse CV
                        </Button>
                      </div>
                      
                      <div>
                        <Label>Current Resume</Label>
                        {resumeUrlToShow ? (
                          <div className="flex items-center mt-2 p-4 border rounded-md">
                            <FileText className="h-8 w-8 text-primary mr-4" />
                            <div className="flex-1">
                              <p className="font-medium">{getResumeFilename(resumeUrlToShow)}</p>
                              <p className="text-sm text-gray-500">Uploaded on {new Date().toLocaleDateString()}</p>
                            </div>
                            <Button 
                              variant="outline" 
                              size="sm" 
                              onClick={() => handleViewFile(resumeUrlToShow!)}
                              disabled={viewingFile}
                            >
                              {viewingFile ? (
                                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                              ) : null}
                              View
                            </Button>
                            <Button 
                              variant="outline" 
                              size="sm" 
                              className="ml-2"
                              onClick={() => handleDownloadFile(resumeUrlToShow!)}
                              disabled={downloadingFile}
                            >
                              {downloadingFile ? (
                                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                              ) : null}
                              Download
                            </Button>
                          </div>
                        ) : (
                          <div className="p-4 border rounded-md text-center text-gray-500">
                            No resume uploaded yet
                          </div>
                        )}
                      </div>
                      <div className="mb-4 flex flex-col md:flex-row md:items-center gap-4">
                        <div>
                          <input
                            type="file"
                            accept=".pdf,.doc,.docx"
                            ref={resumeInputRef}
                            style={{ display: "none" }}
                            onChange={handleResumeUpload}
                          />
                          <Button
                            type="button"
                            variant="outline"
                            onClick={() => resumeInputRef.current?.click()}
                            disabled={uploadingResume}
                          >
                            {uploadingResume ? (
                              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                            ) : (
                              <Upload className="mr-2 h-4 w-4" />
                            )}
                            Upload Resume (Store)
                          </Button>
                        </div>
                      </div>
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
                  
                  {isLoadingJobs ? (
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
                                    <span className="capitalize">{job.job_type}</span>
                                    {job.salary_min && job.salary_max && (
                                      <>
                                        <span className="mx-2">•</span>
                                        <DollarSign className="h-4 w-4 mr-1" />
                                        <span>${job.salary_min} - ${job.salary_max}</span>
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
                                
                                {job.application_deadline && (
                                  <Badge variant="outline" className="bg-primary/10">
                                    <Calendar className="h-3.5 w-3.5 mr-1" />
                                    Deadline: {format(new Date(job.application_deadline), 'MMM d, yyyy')}
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
                            <Label htmlFor="job_type">Job Type *</Label>
                            <Select 
                              defaultValue={jobForm.job_type}
                              onValueChange={handleJobTypeChange}
                            >
                              <SelectTrigger>
                                <SelectValue placeholder="Select job type" />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="full_time">Full-time</SelectItem>
                                <SelectItem value="part_time">Part-time</SelectItem>
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
                            <Label htmlFor="salary_min">Salary Range (Min)</Label>
                            <Input
                              id="salary_min"
                              name="salary_min"
                              type="text"
                              inputMode="numeric"
                              value={jobForm.salary_min}
                              onChange={handleJobFormChange}
                              placeholder="e.g. 50000"
                            />
                          </div>
                          <div>
                            <Label htmlFor="salary_max">Salary Range (Max)</Label>
                            <Input
                              id="salary_max"
                              name="salary_max"
                              type="text"
                              inputMode="numeric"
                              value={jobForm.salary_max}
                              onChange={handleJobFormChange}
                              placeholder="e.g. 80000"
                            />
                          </div>
                        </div>
                        
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div>
                            <Label htmlFor="contact_email">Contact Email *</Label>
                            <Input
                              id="contact_email"
                              name="contact_email"
                              type="email"
                              value={jobForm.contact_email}
                              onChange={handleJobFormChange}
                              placeholder="e.g. careers@company.com"
                              required
                            />
                          </div>
                          <div>
                            <Label htmlFor="application_deadline">Application Deadline</Label>
                            <Input
                              id="application_deadline"
                              name="application_deadline"
                              type="date"
                              value={jobForm.application_deadline}
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