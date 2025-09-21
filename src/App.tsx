import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider } from "./contexts/AuthContext";
import { ProtectedRoute } from "./components/ProtectedRoute";
import { DashboardLayout } from "./components/layout/DashboardLayout";
import Login from "./pages/Login";
import AdminDashboard from "./pages/admin/AdminDashboard";
import AddHealthworker from "./pages/admin/AddHealthworker";
import HealthworkerDashboard from "./pages/healthworker/HealthworkerDashboard";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <AuthProvider>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <Routes>
            {/* Public routes */}
            <Route path="/login" element={<Login />} />
            
            {/* Redirect root to appropriate dashboard */}
            <Route path="/" element={<Navigate to="/login" replace />} />
            
            {/* Admin routes */}
            <Route path="/admin" element={
              <ProtectedRoute requiredRole="admin">
                <DashboardLayout>
                  <AdminDashboard />
                </DashboardLayout>
              </ProtectedRoute>
            } />
            <Route path="/admin/add-healthworker" element={
              <ProtectedRoute requiredRole="admin">
                <DashboardLayout>
                  <AddHealthworker />
                </DashboardLayout>
              </ProtectedRoute>
            } />
            
            {/* Healthworker routes */}
            <Route path="/healthworker" element={
              <ProtectedRoute requiredRole="healthworker">
                <DashboardLayout>
                  <HealthworkerDashboard />
                </DashboardLayout>
              </ProtectedRoute>
            } />
            
            {/* Catch-all route */}
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </TooltipProvider>
    </AuthProvider>
  </QueryClientProvider>
);

export default App;
