import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Job } from "@shared/schema";
import { Link } from "wouter";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Loader2, Briefcase, MapPin, Clock, Search } from "lucide-react";

export default function JobsListPage() {
  const [jobType, setJobType] = useState<string>("all");
  const [location, setLocation] = useState<string>("all");
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [currentSearchQuery, setCurrentSearchQuery] = useState<string>("");

  const {
    data: jobs,
    isLoading,
    isError,
  } = useQuery<Job[]>({
    queryKey: [
      `/api/jobs`,
      { jobType: jobType !== "all" ? jobType : undefined,
        location: location !== "all" ? location : undefined,
        search: currentSearchQuery || undefined }
    ],
  });

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setCurrentSearchQuery(searchQuery);
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return new Intl.DateTimeFormat("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    }).format(date);
  };

  return (
    <div className="container mx-auto py-8 px-4 md:px-6">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">Find Your Perfect Job</h1>
        <p className="text-gray-600 dark:text-gray-400">
          Explore job opportunities that match your skills and career goals
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 mb-8">
        <div className="lg:col-span-4 p-4 bg-white dark:bg-gray-800 rounded-lg shadow">
          <form onSubmit={handleSearch} className="flex flex-col md:flex-row gap-4">
            <div className="flex-1">
              <Label htmlFor="search" className="sr-only">
                Search Jobs
              </Label>
              <div className="relative">
                <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-gray-500 dark:text-gray-400" />
                <Input
                  id="search"
                  type="text"
                  placeholder="Job title, keywords, or company"
                  className="pl-8"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>
            </div>
            <div className="w-full md:w-[180px]">
              <Label htmlFor="job-type" className="sr-only">
                Job Type
              </Label>
              <Select value={jobType} onValueChange={setJobType}>
                <SelectTrigger id="job-type">
                  <SelectValue placeholder="Job Type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Job Types</SelectItem>
                  <SelectItem value="full-time">Full Time</SelectItem>
                  <SelectItem value="part-time">Part Time</SelectItem>
                  <SelectItem value="contract">Contract</SelectItem>
                  <SelectItem value="internship">Internship</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="w-full md:w-[180px]">
              <Label htmlFor="location" className="sr-only">
                Location
              </Label>
              <Select value={location} onValueChange={setLocation}>
                <SelectTrigger id="location">
                  <SelectValue placeholder="Location" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Locations</SelectItem>
                  <SelectItem value="New York">New York</SelectItem>
                  <SelectItem value="San Francisco">San Francisco</SelectItem>
                  <SelectItem value="Chicago">Chicago</SelectItem>
                  <SelectItem value="Remote">Remote</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <Button type="submit" className="shrink-0">
              Search Jobs
            </Button>
          </form>
        </div>
      </div>

      {isLoading ? (
        <div className="flex justify-center items-center py-12">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
          <span className="ml-2">Loading jobs...</span>
        </div>
      ) : isError ? (
        <div className="text-center py-12">
          <p className="text-red-500">Error loading jobs. Please try again later.</p>
        </div>
      ) : jobs && jobs.length > 0 ? (
        <div className="grid grid-cols-1 gap-6">
          {jobs.map((job) => (
            <Link key={job.id} href={`/jobs/${job.id}`}>
              <Card className="cursor-pointer hover:border-primary transition-colors">
                <CardHeader>
                  <div className="flex justify-between items-start">
                    <div>
                      <CardTitle className="text-xl">{job.title}</CardTitle>
                      <CardDescription className="mt-1">
                        {/* Here we would normally display the company name */}
                        Company Name
                      </CardDescription>
                    </div>
                    <Badge variant={job.jobType === "full-time" ? "default" : "outline"}>
                      {job.jobType.replace("-", " ").replace(/\b\w/g, (l) => l.toUpperCase())}
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent>
                  <p className="text-gray-700 dark:text-gray-300 line-clamp-2 mb-4">
                    {job.description}
                  </p>
                  <div className="flex flex-wrap gap-3 text-sm text-gray-600 dark:text-gray-400">
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
                    <div className="flex items-center">
                      <Clock className="h-4 w-4 mr-1 opacity-70" />
                      Posted {formatDate(job.postedAt)}
                    </div>
                  </div>
                  {job.skills && job.skills.length > 0 && (
                    <div className="mt-4 flex flex-wrap gap-2">
                      {job.skills.slice(0, 4).map((skill, index) => (
                        <Badge key={index} variant="outline">
                          {skill}
                        </Badge>
                      ))}
                      {job.skills.length > 4 && (
                        <Badge variant="outline">+{job.skills.length - 4} more</Badge>
                      )}
                    </div>
                  )}
                </CardContent>
                <CardFooter>
                  <Button variant="ghost" className="ml-auto">
                    View Details
                  </Button>
                </CardFooter>
              </Card>
            </Link>
          ))}
        </div>
      ) : (
        <div className="text-center py-12 bg-gray-50 dark:bg-gray-800 rounded-lg">
          <h3 className="text-lg font-medium mb-2">No jobs found</h3>
          <p className="text-gray-600 dark:text-gray-400 mb-4">
            Try adjusting your search filters to find more opportunities
          </p>
          {(jobType !== "all" || location !== "all" || currentSearchQuery) && (
            <Button
              variant="outline"
              onClick={() => {
                setJobType("all");
                setLocation("all");
                setSearchQuery("");
                setCurrentSearchQuery("");
              }}
            >
              Clear Filters
            </Button>
          )}
        </div>
      )}
    </div>
  );
}