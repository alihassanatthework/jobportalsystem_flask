import { useState } from "react";
import { useAuth } from "@/hooks/use-auth";
import { Redirect } from "wouter";
import { 
  Card, CardContent, CardDescription, 
  CardHeader, CardTitle 
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { 
  Bell, Briefcase, Building, MessageSquare, 
  User, Check, X, Calendar, Clock
} from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";

// Mock notification data - will be replaced with API calls later
const mockNotifications = [
  {
    id: 1,
    type: "application_status",
    title: "Application Status Updated",
    message: "Your application for Senior Frontend Developer at Tech Corp has been reviewed",
    isRead: false,
    date: new Date(Date.now() - 1000 * 60 * 30), // 30 minutes ago
    link: "/applications/1",
    iconType: "briefcase"
  },
  {
    id: 2,
    type: "message",
    title: "New Message",
    message: "You have a new message from HR at Tech Corp",
    isRead: false,
    date: new Date(Date.now() - 1000 * 60 * 60 * 2), // 2 hours ago
    link: "/messages",
    iconType: "message"
  },
  {
    id: 3,
    type: "job_match",
    title: "New Job Match",
    message: "We found a new job that matches your profile: UX Designer at Creative Agency",
    isRead: true,
    date: new Date(Date.now() - 1000 * 60 * 60 * 24), // 1 day ago
    link: "/jobs/5",
    iconType: "match"
  },
  {
    id: 4,
    type: "system",
    title: "Profile Completion Reminder",
    message: "Complete your profile to increase your visibility to employers",
    isRead: true,
    date: new Date(Date.now() - 1000 * 60 * 60 * 24 * 2), // 2 days ago
    link: "/profile",
    iconType: "user"
  },
  {
    id: 5,
    type: "application_status",
    title: "Interview Scheduled",
    message: "Your interview for DevOps Engineer at Tech Corp has been scheduled for May 10th",
    isRead: true,
    date: new Date(Date.now() - 1000 * 60 * 60 * 24 * 3), // 3 days ago
    link: "/applications/2",
    iconType: "calendar"
  }
];

// Employer mock notifications
const employerMockNotifications = [
  {
    id: 1,
    type: "application_received",
    title: "New Application Received",
    message: "Jane Smith has applied for the Senior Frontend Developer position",
    isRead: false,
    date: new Date(Date.now() - 1000 * 60 * 45), // 45 minutes ago
    link: "/profile?tab=received-applications",
    iconType: "briefcase"
  },
  {
    id: 2,
    type: "message",
    title: "New Message",
    message: "You have a new message from John Doe regarding the UX Designer position",
    isRead: false,
    date: new Date(Date.now() - 1000 * 60 * 60 * 3), // 3 hours ago
    link: "/messages",
    iconType: "message"
  },
  {
    id: 3,
    type: "job_post_expiring",
    title: "Job Post Expiring Soon",
    message: "Your job post for Mobile Developer will expire in 3 days",
    isRead: true,
    date: new Date(Date.now() - 1000 * 60 * 60 * 24), // 1 day ago
    link: "/profile?tab=posted-jobs",
    iconType: "clock"
  },
  {
    id: 4,
    type: "system",
    title: "Complete Company Profile",
    message: "Add more details to your company profile to attract better candidates",
    isRead: true,
    date: new Date(Date.now() - 1000 * 60 * 60 * 24 * 2), // 2 days ago
    link: "/profile",
    iconType: "building"
  }
];

// Admin mock notifications
const adminMockNotifications = [
  {
    id: 1,
    type: "user_report",
    title: "User Reported",
    message: "A job post has been reported for violating platform guidelines",
    isRead: false,
    date: new Date(Date.now() - 1000 * 60 * 20), // 20 minutes ago
    link: "/admin/reports",
    iconType: "alert"
  },
  {
    id: 2,
    type: "new_user",
    title: "New Employer Registration",
    message: "A new company has registered: Digital Solutions Inc.",
    isRead: false,
    date: new Date(Date.now() - 1000 * 60 * 60 * 1), // 1 hour ago
    link: "/admin/users",
    iconType: "user"
  },
  {
    id: 3,
    type: "system",
    title: "System Update Scheduled",
    message: "A system maintenance is scheduled for May 15th at 2:00 AM UTC",
    isRead: true,
    date: new Date(Date.now() - 1000 * 60 * 60 * 24), // 1 day ago
    link: "/admin/dashboard",
    iconType: "system"
  }
];

function getNotificationIcon(type: string) {
  switch (type) {
    case "briefcase":
      return <Briefcase className="h-5 w-5 text-blue-500" />;
    case "message":
      return <MessageSquare className="h-5 w-5 text-green-500" />;
    case "match":
      return <Briefcase className="h-5 w-5 text-purple-500" />;
    case "user":
      return <User className="h-5 w-5 text-orange-500" />;
    case "building":
      return <Building className="h-5 w-5 text-blue-600" />;
    case "calendar":
      return <Calendar className="h-5 w-5 text-indigo-500" />;
    case "clock":
      return <Clock className="h-5 w-5 text-yellow-600" />;
    case "alert":
      return <Bell className="h-5 w-5 text-red-500" />;
    case "system":
    default:
      return <Bell className="h-5 w-5 text-gray-500" />;
  }
}

function formatNotificationDate(date: Date) {
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffMins = Math.floor(diffMs / (1000 * 60));
  const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

  if (diffMins < 60) {
    return `${diffMins} ${diffMins === 1 ? 'minute' : 'minutes'} ago`;
  } else if (diffHours < 24) {
    return `${diffHours} ${diffHours === 1 ? 'hour' : 'hours'} ago`;
  } else if (diffDays < 7) {
    return `${diffDays} ${diffDays === 1 ? 'day' : 'days'} ago`;
  } else {
    return date.toLocaleDateString();
  }
}

export default function NotificationsPage() {
  const { user, isLoading } = useAuth();
  const [activeTab, setActiveTab] = useState("all");
  
  // Set notifications based on user type
  const allNotifications = user?.userType === "employer" 
    ? employerMockNotifications 
    : user?.userType === "admin"
      ? adminMockNotifications
      : mockNotifications;
  
  const [notifications, setNotifications] = useState(allNotifications);
  const unreadCount = notifications.filter(n => !n.isRead).length;
  
  // Filter notifications based on active tab
  const filteredNotifications = activeTab === "all" 
    ? notifications 
    : activeTab === "unread" 
      ? notifications.filter(n => !n.isRead)
      : notifications.filter(n => n.isRead);
  
  // Mark a notification as read
  const markAsRead = (id: number) => {
    setNotifications(
      notifications.map(n => 
        n.id === id ? { ...n, isRead: true } : n
      )
    );
  };
  
  // Mark all notifications as read
  const markAllAsRead = () => {
    setNotifications(
      notifications.map(n => ({ ...n, isRead: true }))
    );
  };
  
  // Delete a notification
  const deleteNotification = (id: number) => {
    setNotifications(notifications.filter(n => n.id !== id));
  };
  
  // Redirect if not authenticated
  if (!isLoading && !user) {
    return <Redirect to="/auth" />;
  }
  
  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
      </div>
    );
  }
  
  return (
    <div className="container mx-auto py-8 max-w-4xl">
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-2xl font-bold flex items-center">
            <Bell className="mr-2 h-5 w-5" /> Notifications
            {unreadCount > 0 && (
              <Badge variant="secondary" className="ml-2 text-xs">
                {unreadCount} unread
              </Badge>
            )}
          </CardTitle>
          <CardDescription>
            Stay updated with the latest activities and updates
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-between mb-6">
            <Tabs defaultValue="all" value={activeTab} onValueChange={setActiveTab}>
              <TabsList>
                <TabsTrigger value="all">All</TabsTrigger>
                <TabsTrigger value="unread">
                  Unread
                  {unreadCount > 0 && (
                    <Badge variant="secondary" className="ml-2">
                      {unreadCount}
                    </Badge>
                  )}
                </TabsTrigger>
                <TabsTrigger value="read">Read</TabsTrigger>
              </TabsList>
            </Tabs>
            
            {unreadCount > 0 && (
              <Button 
                variant="outline" 
                size="sm" 
                onClick={markAllAsRead}
                className="text-sm"
              >
                <Check className="mr-1 h-4 w-4" />
                Mark all as read
              </Button>
            )}
          </div>
          
          <ScrollArea className="h-[600px] pr-4">
            {filteredNotifications.length === 0 ? (
              <div className="text-center py-12">
                <Bell className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                <h3 className="text-lg font-medium">No notifications</h3>
                <p className="text-muted-foreground">
                  {activeTab === "unread" 
                    ? "You've read all your notifications" 
                    : activeTab === "read" 
                      ? "You have no read notifications" 
                      : "You don't have any notifications"}
                </p>
              </div>
            ) : (
              <div className="space-y-4">
                {filteredNotifications.map(notification => (
                  <div 
                    key={notification.id} 
                    className={`relative p-4 rounded-lg border ${
                      notification.isRead 
                        ? "bg-background" 
                        : "bg-muted/30 border-muted-foreground/20"
                    }`}
                  >
                    <div className="flex">
                      <div className="mr-4 mt-0.5">
                        {getNotificationIcon(notification.iconType)}
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center justify-between mb-1">
                          <h4 className="font-medium text-sm">
                            {notification.title}
                            {!notification.isRead && (
                              <span className="ml-2 inline-block h-2 w-2 rounded-full bg-primary"></span>
                            )}
                          </h4>
                          <span className="text-xs text-muted-foreground">
                            {formatNotificationDate(notification.date)}
                          </span>
                        </div>
                        <p className="text-sm text-muted-foreground mb-2">
                          {notification.message}
                        </p>
                        <div className="flex justify-between mt-2">
                          <Button 
                            variant="link" 
                            className="h-8 px-2 text-xs"
                            asChild
                          >
                            <a href={notification.link}>View details</a>
                          </Button>
                          <div className="flex space-x-1">
                            {!notification.isRead && (
                              <Button 
                                variant="ghost" 
                                size="icon" 
                                className="h-7 w-7" 
                                onClick={() => markAsRead(notification.id)}
                              >
                                <Check className="h-4 w-4" />
                              </Button>
                            )}
                            <Button 
                              variant="ghost" 
                              size="icon" 
                              className="h-7 w-7 text-muted-foreground hover:text-destructive" 
                              onClick={() => deleteNotification(notification.id)}
                            >
                              <X className="h-4 w-4" />
                            </Button>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </ScrollArea>
        </CardContent>
      </Card>
    </div>
  );
}