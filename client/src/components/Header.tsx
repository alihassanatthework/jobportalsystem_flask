import { useState, useEffect } from "react";
import { Link, useLocation } from "wouter";
import { 
  Menu, Search, Briefcase, User, X, Bell, 
  Settings, LogOut, FileText, Building, Users,
  MessageSquare, BookOpen, LayoutDashboard
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/hooks/use-auth";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { ThemeToggle } from "./ThemeToggle";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

export default function Header() {
  const [location, setLocation] = useLocation();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const { user, logoutMutation } = useAuth();
  
  // Track active link
  const [activeLink, setActiveLink] = useState("/");
  
  // Update active link when location changes
  useEffect(() => {
    setActiveLink(location);
  }, [location]);

  return (
    <header className="bg-white dark:bg-gray-800 shadow-sm sticky top-0 z-40">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16 items-center">
          {/* Logo */}
          <div className="flex-shrink-0 flex items-center">
            <Link href="/" className="flex items-center">
              <Briefcase className="h-8 w-8 text-primary" />
              <span className="ml-2 text-xl font-semibold text-gray-900 dark:text-white">JobConnect</span>
            </Link>
          </div>
          
          {/* Desktop Navigation */}
          <nav className="hidden md:flex space-x-6">
            <Link 
              href="/" 
              className={`inline-flex items-center px-1 pt-1 text-sm font-medium border-b-2 ${
                activeLink === "/" 
                  ? "text-primary border-primary" 
                  : "text-gray-600 dark:text-gray-300 border-transparent hover:border-gray-300 hover:text-gray-700 dark:hover:text-white"
              }`}
            >
              Home
            </Link>
            <Link 
              href="/jobs" 
              className={`inline-flex items-center px-1 pt-1 text-sm font-medium border-b-2 ${
                activeLink === "/jobs" 
                  ? "text-primary border-primary" 
                  : "text-gray-600 dark:text-gray-300 border-transparent hover:border-gray-300 hover:text-gray-700 dark:hover:text-white"
              }`}
            >
              Find Jobs
            </Link>
            
            {/* Show "For Job Seekers" only to non-employers */}
            {(!user || user.userType !== "employer") && (
              <Link 
                href="/job-seekers" 
                className={`inline-flex items-center px-1 pt-1 text-sm font-medium border-b-2 ${
                  activeLink === "/job-seekers" 
                    ? "text-primary border-primary" 
                    : "text-gray-600 dark:text-gray-300 border-transparent hover:border-gray-300 hover:text-gray-700 dark:hover:text-white"
                }`}
              >
                For Job Seekers
              </Link>
            )}
            
            {/* Show "For Employers" only to non-job seekers */}
            {(!user || user.userType !== "job_seeker") && (
              <Link 
                href="/employers" 
                className={`inline-flex items-center px-1 pt-1 text-sm font-medium border-b-2 ${
                  activeLink === "/employers" 
                    ? "text-primary border-primary" 
                    : "text-gray-600 dark:text-gray-300 border-transparent hover:border-gray-300 hover:text-gray-700 dark:hover:text-white"
                }`}
              >
                For Employers
              </Link>
            )}
            
            {/* Admin specific navigation */}
            {user && user.userType === "admin" && (
              <Link 
                href="/admin/dashboard" 
                className={`inline-flex items-center px-1 pt-1 text-sm font-medium border-b-2 ${
                  activeLink === "/admin/dashboard" 
                    ? "text-primary border-primary" 
                    : "text-gray-600 dark:text-gray-300 border-transparent hover:border-gray-300 hover:text-gray-700 dark:hover:text-white"
                }`}
              >
                Admin Dashboard
              </Link>
            )}
            
            <Link 
              href="/resources" 
              className={`inline-flex items-center px-1 pt-1 text-sm font-medium border-b-2 ${
                activeLink === "/resources" 
                  ? "text-primary border-primary" 
                  : "text-gray-600 dark:text-gray-300 border-transparent hover:border-gray-300 hover:text-gray-700 dark:hover:text-white"
              }`}
            >
              Resources
            </Link>
          </nav>
          
          {/* Action buttons */}
          <div className="flex items-center space-x-4">
            {/* Theme toggle */}
            <ThemeToggle />
            
            {/* Search button */}
            <button 
              onClick={() => setSearchOpen(!searchOpen)} 
              className="p-2 text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 focus:outline-none"
            >
              <Search className="h-5 w-5" />
            </button>
            
            {/* Notifications - Only for logged in users */}
            {user && (
              <Link href="/notifications" className="p-2 text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 focus:outline-none relative">
                <Bell className="h-5 w-5" />
                <Badge className="absolute top-0 right-0 -mt-1 -mr-1 px-1.5 py-0.5 text-xs" variant="secondary">2</Badge>
              </Link>
            )}
            
            {/* Account menu */}
            {user ? (
              <div className="hidden sm:flex items-center">
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" className="relative h-8 flex items-center gap-2 p-1 pr-2">
                      <Avatar className="h-8 w-8">
                        <AvatarFallback className="bg-primary/10 text-primary">
                          {user.username.substring(0, 2).toUpperCase()}
                        </AvatarFallback>
                      </Avatar>
                      <div className="hidden md:block text-left">
                        <span className="text-sm font-medium text-gray-700 dark:text-gray-200">
                          {user.username}
                        </span>
                        <p className="text-xs text-gray-500 dark:text-gray-400">
                          {user.userType === "admin" 
                            ? "Administrator" 
                            : user.userType === "job_seeker" 
                              ? "Job Seeker" 
                              : "Employer"}
                        </p>
                      </div>
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent className="w-56" align="end" forceMount>
                    <DropdownMenuLabel className="font-normal">
                      <div className="flex flex-col space-y-1">
                        <p className="text-sm font-medium leading-none">{user.username}</p>
                        <p className="text-xs leading-none text-muted-foreground">
                          {user.userType === "admin" 
                            ? "Administrator" 
                            : user.userType === "job_seeker" 
                              ? "Job Seeker" 
                              : "Employer"}
                        </p>
                      </div>
                    </DropdownMenuLabel>
                    <DropdownMenuSeparator />
                    <DropdownMenuGroup>
                      <DropdownMenuItem asChild>
                        <Link href="/profile" className="cursor-pointer">
                          <User className="mr-2 h-4 w-4" />
                          <span>Profile</span>
                        </Link>
                      </DropdownMenuItem>
                      
                      {/* Admin options */}
                      {user.userType === "admin" && (
                        <>
                          <DropdownMenuItem asChild>
                            <Link href="/admin/dashboard" className="cursor-pointer">
                              <LayoutDashboard className="mr-2 h-4 w-4" />
                              <span>Admin Dashboard</span>
                            </Link>
                          </DropdownMenuItem>
                          <DropdownMenuItem asChild>
                            <Link href="/admin/users" className="cursor-pointer">
                              <Users className="mr-2 h-4 w-4" />
                              <span>Manage Users</span>
                            </Link>
                          </DropdownMenuItem>
                        </>
                      )}
                      
                      {/* Job Seeker options */}
                      {user.userType === "job_seeker" && (
                        <>
                          <DropdownMenuItem asChild>
                            <Link href="/applications" className="cursor-pointer">
                              <FileText className="mr-2 h-4 w-4" />
                              <span>My Applications</span>
                            </Link>
                          </DropdownMenuItem>
                          <DropdownMenuItem asChild>
                            <Link href="/messages" className="cursor-pointer">
                              <MessageSquare className="mr-2 h-4 w-4" />
                              <span>Messages</span>
                            </Link>
                          </DropdownMenuItem>
                        </>
                      )}
                      
                      {/* Employer options */}
                      {user.userType === "employer" && (
                        <>
                          <DropdownMenuItem asChild>
                            <Link href="/profile?tab=posted-jobs" className="cursor-pointer">
                              <Briefcase className="mr-2 h-4 w-4" />
                              <span>My Job Posts</span>
                            </Link>
                          </DropdownMenuItem>
                          <DropdownMenuItem asChild>
                            <Link href="/profile?tab=received-applications" className="cursor-pointer">
                              <FileText className="mr-2 h-4 w-4" />
                              <span>Applications Received</span>
                            </Link>
                          </DropdownMenuItem>
                          <DropdownMenuItem asChild>
                            <Link href="/messages" className="cursor-pointer">
                              <MessageSquare className="mr-2 h-4 w-4" />
                              <span>Messages</span>
                            </Link>
                          </DropdownMenuItem>
                        </>
                      )}
                    </DropdownMenuGroup>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem asChild>
                      <Link href="/settings" className="cursor-pointer">
                        <Settings className="mr-2 h-4 w-4" />
                        <span>Settings</span>
                      </Link>
                    </DropdownMenuItem>
                    <DropdownMenuItem 
                      className="cursor-pointer"
                      onClick={() => logoutMutation.mutate()}
                    >
                      <LogOut className="mr-2 h-4 w-4" />
                      <span>Log out</span>
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            ) : (
              <div className="hidden sm:flex items-center gap-2">
                <Button variant="ghost" asChild>
                  <Link href="/auth">Sign In</Link>
                </Button>
                <Button asChild>
                  <Link href="/auth">Sign Up</Link>
                </Button>
              </div>
            )}
            
            {/* Mobile menu button */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="md:hidden p-2 rounded-md text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-primary"
            >
              <Menu className="h-6 w-6" />
            </button>
          </div>
        </div>
      </div>
      
      {/* Mobile menu */}
      {mobileMenuOpen && (
        <div className="md:hidden bg-white dark:bg-gray-800 border-t border-gray-200 dark:border-gray-700">
          <div className="pt-2 pb-3 space-y-1">
            <Link 
              href="/" 
              className={`block pl-3 pr-4 py-2 border-l-4 text-base font-medium ${
                activeLink === "/" 
                  ? "border-primary text-primary bg-primary-50 dark:bg-primary-900/20" 
                  : "border-transparent text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 hover:border-gray-300 hover:text-gray-700 dark:hover:text-white"
              }`}
              onClick={() => setMobileMenuOpen(false)}
            >
              Home
            </Link>
            <Link 
              href="/jobs" 
              className={`block pl-3 pr-4 py-2 border-l-4 text-base font-medium ${
                activeLink === "/jobs" 
                  ? "border-primary text-primary bg-primary-50 dark:bg-primary-900/20" 
                  : "border-transparent text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 hover:border-gray-300 hover:text-gray-700 dark:hover:text-white"
              }`}
              onClick={() => setMobileMenuOpen(false)}
            >
              Find Jobs
            </Link>
            
            {/* Show "For Job Seekers" only to non-employers */}
            {(!user || user.userType !== "employer") && (
              <Link 
                href="/job-seekers" 
                className={`block pl-3 pr-4 py-2 border-l-4 text-base font-medium ${
                  activeLink === "/job-seekers" 
                    ? "border-primary text-primary bg-primary-50 dark:bg-primary-900/20" 
                    : "border-transparent text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 hover:border-gray-300 hover:text-gray-700 dark:hover:text-white"
                }`}
                onClick={() => setMobileMenuOpen(false)}
              >
                For Job Seekers
              </Link>
            )}
            
            {/* Show "For Employers" only to non-job seekers */}
            {(!user || user.userType !== "job_seeker") && (
              <Link 
                href="/employers" 
                className={`block pl-3 pr-4 py-2 border-l-4 text-base font-medium ${
                  activeLink === "/employers" 
                    ? "border-primary text-primary bg-primary-50 dark:bg-primary-900/20" 
                    : "border-transparent text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 hover:border-gray-300 hover:text-gray-700 dark:hover:text-white"
                }`}
                onClick={() => setMobileMenuOpen(false)}
              >
                For Employers
              </Link>
            )}
            
            {/* Admin specific navigation */}
            {user && user.userType === "admin" && (
              <Link 
                href="/admin/dashboard" 
                className={`block pl-3 pr-4 py-2 border-l-4 text-base font-medium ${
                  activeLink === "/admin/dashboard" 
                    ? "border-primary text-primary bg-primary-50 dark:bg-primary-900/20" 
                    : "border-transparent text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 hover:border-gray-300 hover:text-gray-700 dark:hover:text-white"
                }`}
                onClick={() => setMobileMenuOpen(false)}
              >
                Admin Dashboard
              </Link>
            )}
            
            <Link 
              href="/resources" 
              className={`block pl-3 pr-4 py-2 border-l-4 text-base font-medium ${
                activeLink === "/resources" 
                  ? "border-primary text-primary bg-primary-50 dark:bg-primary-900/20" 
                  : "border-transparent text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 hover:border-gray-300 hover:text-gray-700 dark:hover:text-white"
              }`}
              onClick={() => setMobileMenuOpen(false)}
            >
              Resources
            </Link>
            
            {/* User-specific links */}
            {user && (
              <>
                {/* Common link for all user types */}
                <Link 
                  href="/profile" 
                  className={`block pl-3 pr-4 py-2 border-l-4 text-base font-medium ${
                    activeLink === "/profile" 
                      ? "border-primary text-primary bg-primary-50 dark:bg-primary-900/20" 
                      : "border-transparent text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 hover:border-gray-300 hover:text-gray-700 dark:hover:text-white"
                  }`}
                  onClick={() => setMobileMenuOpen(false)}
                >
                  My Profile
                </Link>
                
                {/* Job Seeker links */}
                {user.userType === "job_seeker" && (
                  <>
                    <Link 
                      href="/applications" 
                      className={`block pl-3 pr-4 py-2 border-l-4 text-base font-medium ${
                        activeLink === "/applications" 
                          ? "border-primary text-primary bg-primary-50 dark:bg-primary-900/20" 
                          : "border-transparent text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 hover:border-gray-300 hover:text-gray-700 dark:hover:text-white"
                      }`}
                      onClick={() => setMobileMenuOpen(false)}
                    >
                      My Applications
                    </Link>
                    <Link 
                      href="/messages" 
                      className={`block pl-3 pr-4 py-2 border-l-4 text-base font-medium ${
                        activeLink === "/messages" 
                          ? "border-primary text-primary bg-primary-50 dark:bg-primary-900/20" 
                          : "border-transparent text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 hover:border-gray-300 hover:text-gray-700 dark:hover:text-white"
                      }`}
                      onClick={() => setMobileMenuOpen(false)}
                    >
                      Messages
                    </Link>
                  </>
                )}
                
                {/* Employer links */}
                {user.userType === "employer" && (
                  <>
                    <Link 
                      href="/profile?tab=posted-jobs" 
                      className="block pl-3 pr-4 py-2 border-l-4 border-transparent text-base font-medium text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 hover:border-gray-300 hover:text-gray-700 dark:hover:text-white"
                      onClick={() => setMobileMenuOpen(false)}
                    >
                      My Job Posts
                    </Link>
                    <Link 
                      href="/profile?tab=received-applications" 
                      className="block pl-3 pr-4 py-2 border-l-4 border-transparent text-base font-medium text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 hover:border-gray-300 hover:text-gray-700 dark:hover:text-white"
                      onClick={() => setMobileMenuOpen(false)}
                    >
                      Applications Received
                    </Link>
                    <Link 
                      href="/messages" 
                      className={`block pl-3 pr-4 py-2 border-l-4 text-base font-medium ${
                        activeLink === "/messages" 
                          ? "border-primary text-primary bg-primary-50 dark:bg-primary-900/20" 
                          : "border-transparent text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 hover:border-gray-300 hover:text-gray-700 dark:hover:text-white"
                      }`}
                      onClick={() => setMobileMenuOpen(false)}
                    >
                      Messages
                    </Link>
                  </>
                )}
                
                {/* Admin links */}
                {user.userType === "admin" && (
                  <>
                    <Link 
                      href="/admin/dashboard" 
                      className={`block pl-3 pr-4 py-2 border-l-4 text-base font-medium ${
                        activeLink === "/admin/dashboard" 
                          ? "border-primary text-primary bg-primary-50 dark:bg-primary-900/20" 
                          : "border-transparent text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 hover:border-gray-300 hover:text-gray-700 dark:hover:text-white"
                      }`}
                      onClick={() => setMobileMenuOpen(false)}
                    >
                      Admin Dashboard
                    </Link>
                    <Link 
                      href="/admin/users" 
                      className={`block pl-3 pr-4 py-2 border-l-4 text-base font-medium ${
                        activeLink === "/admin/users" 
                          ? "border-primary text-primary bg-primary-50 dark:bg-primary-900/20" 
                          : "border-transparent text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 hover:border-gray-300 hover:text-gray-700 dark:hover:text-white"
                      }`}
                      onClick={() => setMobileMenuOpen(false)}
                    >
                      Manage Users
                    </Link>
                  </>
                )}
                
                <Link 
                  href="/settings" 
                  className={`block pl-3 pr-4 py-2 border-l-4 text-base font-medium ${
                    activeLink === "/settings" 
                      ? "border-primary text-primary bg-primary-50 dark:bg-primary-900/20" 
                      : "border-transparent text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 hover:border-gray-300 hover:text-gray-700 dark:hover:text-white"
                  }`}
                  onClick={() => setMobileMenuOpen(false)}
                >
                  Settings
                </Link>
              </>
            )}
          </div>
          <div className="pt-4 pb-3 border-t border-gray-200 dark:border-gray-700">
            <div className="flex items-center px-4">
              <div className="flex-shrink-0">
                <Avatar className="h-10 w-10">
                  <AvatarFallback className="bg-primary/10 text-primary">
                    {user ? user.username.substring(0, 2).toUpperCase() : 'GU'}
                  </AvatarFallback>
                </Avatar>
              </div>
              <div className="ml-3 flex-grow">
                {user ? (
                  <>
                    <div className="text-base font-medium text-gray-800 dark:text-white">{user.username}</div>
                    <Button 
                      variant="link" 
                      className="text-sm font-medium text-gray-500 dark:text-gray-400 p-0" 
                      onClick={() => logoutMutation.mutate()}
                    >
                      Sign Out
                    </Button>
                  </>
                ) : (
                  <div className="space-y-1">
                    <Link href="/auth" className="block text-base font-medium text-gray-800 dark:text-white">
                      Sign In
                    </Link>
                    <Link href="/auth" className="block text-sm font-medium text-gray-500 dark:text-gray-400">
                      or Create Account
                    </Link>
                  </div>
                )}
              </div>
              <ThemeToggle />
            </div>
          </div>
        </div>
      )}
      
      {/* Search panel */}
      {searchOpen && (
        <div className="fixed inset-0 z-50 overflow-hidden">
          <div 
            className="absolute inset-0 bg-gray-900 bg-opacity-50" 
            onClick={() => setSearchOpen(false)}
          ></div>
          <div className="absolute inset-x-0 top-0 bg-white dark:bg-gray-800 shadow-lg transform transition-all p-4">
            <div className="max-w-7xl mx-auto">
              <div className="flex items-center">
                <div className="flex-grow">
                  <input 
                    type="text" 
                    placeholder="Search for jobs, companies, or keywords..." 
                    className="w-full border-0 focus:ring-0 text-lg bg-transparent" 
                    autoFocus
                  />
                </div>
                <button 
                  onClick={() => setSearchOpen(false)} 
                  className="p-2 text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200"
                >
                  <X className="h-6 w-6" />
                </button>
              </div>
              <div className="mt-3 pb-2">
                <p className="text-sm text-gray-500 dark:text-gray-400">Popular searches:</p>
                <div className="flex flex-wrap gap-2 mt-2">
                  <span className="px-3 py-1 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-200 text-sm rounded-full">Software Engineer</span>
                  <span className="px-3 py-1 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-200 text-sm rounded-full">Remote</span>
                  <span className="px-3 py-1 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-200 text-sm rounded-full">Marketing</span>
                  <span className="px-3 py-1 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-200 text-sm rounded-full">Data Analyst</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </header>
  );
}
