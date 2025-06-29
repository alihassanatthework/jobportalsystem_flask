import { useEffect, useState } from "react";
import { useAuth } from "@/hooks/use-auth";
import { useQuery, useMutation } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";
import { Redirect, useLocation } from "wouter";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  Table, TableBody, TableCell, TableHead, 
  TableHeader, TableRow 
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { 
  LayoutDashboard, Users, BarChart3, MessageSquare, 
  Ban, Clock, CheckCircle, Search, Info
} from "lucide-react";
import { apiRequest, queryClient } from "@/lib/queryClient";

type UserStatus = "active" | "blocked" | "suspended";

type User = {
  id: number;
  username: string;
  email: string;
  userType: "admin" | "employer" | "job_seeker";
  status: UserStatus;
  profileCompleted: boolean;
  createdAt: string;
};

export default function AdminDashboardPage() {
  const { user, isLoading } = useAuth();
  const [, navigate] = useLocation();
  const { toast } = useToast();
  const [searchQuery, setSearchQuery] = useState("");
  const [userTypeFilter, setUserTypeFilter] = useState<string>("all");
  const [statusFilter, setStatusFilter] = useState<string>("all");

  // Redirect if not admin
  if (!isLoading && (!user || user.userType !== "admin")) {
    return <Redirect to="/" />;
  }

  // Fetch all users
  const { data: users = [], isLoading: isLoadingUsers } = useQuery({
    queryKey: ["/api/admin/users"],
    queryFn: async () => {
      const response = await apiRequest("GET", "/api/admin/users");
      const data = await response.json();
      return data;
    },
    enabled: !!user && user.userType === "admin",
  });

  // Mutation to update user status
  const updateUserStatusMutation = useMutation({
    mutationFn: async ({ userId, status }: { userId: number; status: UserStatus }) => {
      const response = await apiRequest(
        "PUT", 
        `/api/admin/users/${userId}/status`,
        { status }
      );
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/users"] });
      toast({
        title: "User status updated",
        description: "The user's status has been successfully updated.",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Failed to update user status",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  // Stats calculation
  const totalUsers = users.length;
  const employerCount = users.filter((u: User) => u.userType === "employer").length;
  const jobSeekerCount = users.filter((u: User) => u.userType === "job_seeker").length;
  const blockedCount = users.filter((u: User) => u.status === "blocked").length;

  // Filter users based on search and filters
  const filteredUsers = users.filter((user: User) => {
    const matchesSearch = 
      user.username.toLowerCase().includes(searchQuery.toLowerCase()) ||
      user.email.toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchesUserType = userTypeFilter === "all" || user.userType === userTypeFilter;
    const matchesStatus = statusFilter === "all" || user.status === statusFilter;
    
    return matchesSearch && matchesUserType && matchesStatus;
  });

  // Handle status change
  const handleStatusChange = (userId: number, status: UserStatus) => {
    updateUserStatusMutation.mutate({ userId, status });
  };

  // If still loading, show loading state
  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-8 max-w-7xl">
      <h1 className="text-3xl font-bold mb-6">Admin Dashboard</h1>
      
      {/* Stats cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center space-x-4">
              <Users className="h-10 w-10 text-primary" />
              <div>
                <p className="text-sm text-muted-foreground">Total Users</p>
                <h3 className="text-2xl font-bold">{totalUsers}</h3>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center space-x-4">
              <BarChart3 className="h-10 w-10 text-blue-500" />
              <div>
                <p className="text-sm text-muted-foreground">Employers</p>
                <h3 className="text-2xl font-bold">{employerCount}</h3>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center space-x-4">
              <LayoutDashboard className="h-10 w-10 text-green-500" />
              <div>
                <p className="text-sm text-muted-foreground">Job Seekers</p>
                <h3 className="text-2xl font-bold">{jobSeekerCount}</h3>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center space-x-4">
              <Ban className="h-10 w-10 text-red-500" />
              <div>
                <p className="text-sm text-muted-foreground">Blocked Users</p>
                <h3 className="text-2xl font-bold">{blockedCount}</h3>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
      
      {/* User management section */}
      <Card className="mb-8">
        <CardHeader>
          <CardTitle>User Management</CardTitle>
          <CardDescription>Manage all registered users - block, suspend, or activate accounts</CardDescription>
        </CardHeader>
        <CardContent>
          {/* Filters and search */}
          <div className="flex flex-col md:flex-row space-y-4 md:space-y-0 md:space-x-4 mb-6">
            <div className="relative flex-1">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                type="search"
                placeholder="Search by username or email..."
                className="pl-8"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
            
            <select
              className="h-10 rounded-md border border-input bg-background px-3 py-2"
              value={userTypeFilter}
              onChange={(e) => setUserTypeFilter(e.target.value)}
            >
              <option value="all">All User Types</option>
              <option value="employer">Employers</option>
              <option value="job_seeker">Job Seekers</option>
              <option value="admin">Admins</option>
            </select>
            
            <select
              className="h-10 rounded-md border border-input bg-background px-3 py-2"
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
            >
              <option value="all">All Statuses</option>
              <option value="active">Active</option>
              <option value="blocked">Blocked</option>
              <option value="suspended">Suspended</option>
            </select>
          </div>
          
          {/* Users table */}
          {isLoadingUsers ? (
            <div className="flex justify-center items-center py-20">
              <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
            </div>
          ) : filteredUsers.length === 0 ? (
            <div className="text-center py-16">
              <Info className="h-16 w-16 text-gray-400 mx-auto mb-4" />
              <h3 className="text-xl font-medium mb-2">No Users Found</h3>
              <p className="text-gray-500 dark:text-gray-400 max-w-md mx-auto">
                {searchQuery || userTypeFilter !== "all" || statusFilter !== "all" 
                  ? "Try adjusting your search or filters to find what you're looking for."
                  : "There are no users in the system yet."}
              </p>
            </div>
          ) : (
            <div className="rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Username</TableHead>
                    <TableHead>Email</TableHead>
                    <TableHead>Type</TableHead>
                    <TableHead>Created</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredUsers.map((user: User) => (
                    <TableRow key={user.id}>
                      <TableCell className="font-medium">{user.username}</TableCell>
                      <TableCell>{user.email}</TableCell>
                      <TableCell>
                        <Badge variant="outline" className={
                          user.userType === "admin" 
                            ? "bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-300 border-purple-400"
                            : user.userType === "employer"
                              ? "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300 border-blue-400"
                              : "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300 border-green-400"
                        }>
                          {user.userType === "admin" 
                            ? "Admin" 
                            : user.userType === "employer" 
                              ? "Employer" 
                              : "Job Seeker"
                          }
                        </Badge>
                      </TableCell>
                      <TableCell>{new Date(user.createdAt).toLocaleDateString()}</TableCell>
                      <TableCell>
                        <Badge variant="outline" className={
                          user.status === "active" 
                            ? "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300 border-green-400"
                            : user.status === "blocked"
                              ? "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300 border-red-400"
                              : "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300 border-yellow-400"
                        }>
                          {user.status.charAt(0).toUpperCase() + user.status.slice(1)}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <div className="flex space-x-2">
                          {user.status === "active" && (
                            <>
                              <Button 
                                variant="outline" 
                                size="sm"
                                onClick={() => handleStatusChange(user.id, "blocked")}
                                disabled={user.userType === "admin"}
                              >
                                <Ban className="h-4 w-4 mr-1" />
                                Block
                              </Button>
                              <Button 
                                variant="outline" 
                                size="sm"
                                onClick={() => handleStatusChange(user.id, "suspended")}
                                disabled={user.userType === "admin"}
                              >
                                <Clock className="h-4 w-4 mr-1" />
                                Suspend
                              </Button>
                            </>
                          )}
                          
                          {user.status === "blocked" && (
                            <Button 
                              variant="outline"
                              size="sm" 
                              onClick={() => handleStatusChange(user.id, "active")}
                            >
                              <CheckCircle className="h-4 w-4 mr-1" />
                              Activate
                            </Button>
                          )}
                          
                          {user.status === "suspended" && (
                            <>
                              <Button 
                                variant="outline" 
                                size="sm"
                                onClick={() => handleStatusChange(user.id, "active")}
                              >
                                <CheckCircle className="h-4 w-4 mr-1" />
                                Activate
                              </Button>
                              <Button 
                                variant="outline" 
                                size="sm"
                                onClick={() => handleStatusChange(user.id, "blocked")}
                              >
                                <Ban className="h-4 w-4 mr-1" />
                                Block
                              </Button>
                            </>
                          )}
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}