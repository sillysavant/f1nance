import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Index from "./pages/Index";
import NotFound from "./pages/NotFound";
import Auth from "./pages/Auth";
import { ProtectedRoute } from "./components/ProtectedRoute";
import Dashboard from "./pages/Dashboard";
import Profile from "./pages/Profile";
import Notifications from "./pages/Notifications";
import Expenses from "./pages/Expenses";
import Engagement from "./pages/Engagement";
import AIAdvisor from "./pages/AIAdvisor";
import Settings from "./pages/Settings";
import UploadDocuments from "./pages/UploadDocuments";
import VerifyEmail from "./pages/VerifyEmail";
import FinancialLiteracy from "./pages/FinancialLiteracy";
import Income from "./pages/Income";
import TaxCompliance from "./pages/tax-compliance";
import SupportTickets from "./pages/support-tickets";
import BudgetTracking from "./pages/BudgetTracking";
import AdminAuth from "./pages/AdminAuth";
import AdminDashboard from "./pages/AdminDashboard";
import AdminTaxResources from "./pages/AdminTaxResources"; // <-- NEW import
import { AdminProtectedRoute } from "./components/AdminProtectedRoute"; 
import AdminSupportTickets from "./pages/AdminSupportTickets"; // <-- import your page
import AdminFinancialModules from "./pages/AdminFinancialModules";
import AdminManageUsers from "./pages/AdminManageUsers"; // 
import AdminMonitorSubscriptions from "./pages/AdminMonitorSubscriptions"; // <-- NEW import
import AdminManagePayments from "./pages/AdminManagePayments";
import Payments from "./pages/PaymentsPage"; // <-- import your PaymentsPage
const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Index />} />
          <Route path="/auth" element={<Auth />} />
          <Route path="/dashboard" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
          <Route path="/admin/auth" element={<AdminAuth />} />
          <Route path="/dashboard/profile" element={<ProtectedRoute><Profile /></ProtectedRoute>} />
          <Route path="/dashboard/notifications" element={<ProtectedRoute><Notifications /></ProtectedRoute>} />
          <Route path="/dashboard/budget-tracking" element={<ProtectedRoute><BudgetTracking /></ProtectedRoute>} />
          <Route path="/dashboard/expenses" element={<ProtectedRoute><Expenses /></ProtectedRoute>} />
          <Route path="/dashboard/income" element={<ProtectedRoute><Income /></ProtectedRoute>} />
          <Route path="/dashboard/engagement" element={<ProtectedRoute><Engagement /></ProtectedRoute>} />
          <Route path="/dashboard/ai-advisor" element={<ProtectedRoute><AIAdvisor /></ProtectedRoute>} />
          <Route path="/dashboard/financial-literacy" element={<ProtectedRoute><FinancialLiteracy /></ProtectedRoute>} />
          <Route path="/dashboard/tax-compliance" element={<ProtectedRoute><TaxCompliance /></ProtectedRoute>} />
          <Route path="/dashboard/support-tickets" element={<ProtectedRoute><SupportTickets /></ProtectedRoute>} />
          <Route path="/dashboard/settings" element={<ProtectedRoute><Settings /></ProtectedRoute>} />
          <Route path="/dashboard/upload-documents" element={<ProtectedRoute><UploadDocuments /></ProtectedRoute>} />
          <Route path="/verify-email" element={<VerifyEmail />} />

          <Route
            path="/dashboard/payments"
            element={
              <ProtectedRoute>
                <Payments />
              </ProtectedRoute>
            }
          />

          {/* Admin Routes */}
          <Route path="/admin/dashboard" element={<AdminProtectedRoute><AdminDashboard /></AdminProtectedRoute>} />
          <Route path="/admin/resources" element={<AdminProtectedRoute><AdminTaxResources /></AdminProtectedRoute>} /> {/* <-- NEW */}
          <Route path="/admin/users" element={<AdminProtectedRoute><AdminManageUsers /></AdminProtectedRoute>} /> {/* <-- NEW */}
          {/* <-- NEW AdminMonitorSubscriptions route */}
          <Route
            path="/admin/monitor-subscriptions"
            element={
              <AdminProtectedRoute>
                <AdminMonitorSubscriptions />
              </AdminProtectedRoute>
            }
          />
          <Route
            path="/admin/manage-payments"
            element={
              <AdminProtectedRoute>
                <AdminManagePayments />
              </AdminProtectedRoute>
            }
          />


          <Route
          path="/admin/support-tickets"
          element={
            <AdminProtectedRoute>
              <AdminSupportTickets />
            </AdminProtectedRoute>
          }
            />
          <Route
            path="/admin/financial-modules"
            element={
              <AdminProtectedRoute>
                <AdminFinancialModules />
              </AdminProtectedRoute>
            }
          />



          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
