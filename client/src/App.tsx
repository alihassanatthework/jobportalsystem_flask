import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import Header from "./components/Header";
import Footer from "./components/Footer";
import NotFound from "./pages/not-found";
import HomePage from "./pages/home-page";
import AuthPage from "./pages/auth-page";
import JobDetailsPage from "./pages/job-details-page";
import JobsListPage from "./pages/jobs-list-page";
import ProfilePage from "./pages/profile-page";
import ApplicationsPage from "./pages/applications-page";
import ResourcesPage from "./pages/resources-page";
import ForJobSeekersPage from "./pages/for-job-seekers-page";
import ForEmployersPage from "./pages/for-employers-page";
import AdminDashboardPage from "./pages/admin-dashboard-page";
import ManageUsersPage from "./pages/manage-users-page";
import NotificationsPage from "./pages/notifications-page";
import { ProtectedRoute } from "./lib/protected-route";
import { AuthProvider } from "./hooks/use-auth";
import { ThemeProvider } from "./hooks/use-theme";

function Router() {
  return (
    <Switch>
      <Route path="/" component={HomePage} />
      <Route path="/auth" component={AuthPage} />
      <Route path="/jobs" component={JobsListPage} />
      <Route path="/jobs/:id" component={JobDetailsPage} />
      <Route path="/resources" component={ResourcesPage} />
      <Route path="/job-seekers" component={ForJobSeekersPage} />
      <Route path="/employers" component={ForEmployersPage} />
      <ProtectedRoute path="/profile" component={ProfilePage} />
      <ProtectedRoute path="/applications" component={ApplicationsPage} />
      <ProtectedRoute path="/notifications" component={NotificationsPage} />
      <ProtectedRoute path="/admin/dashboard" component={AdminDashboardPage} />
      <ProtectedRoute path="/admin/users" component={ManageUsersPage} />
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider>
        <AuthProvider>
          <div className="flex flex-col min-h-screen">
            <Header />
            <div className="flex-grow">
              <Router />
            </div>
            <Footer />
          </div>
          <Toaster />
        </AuthProvider>
      </ThemeProvider>
    </QueryClientProvider>
  );
}

export default App;
