import { ReactNode, useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import {
  LayoutDashboard,
  Bell,
  Receipt,
  Brain,
  Settings,
  LogOut,
  Loader2,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import Sidebar from "@/components/Sidebar";
import { useUser } from "@/hooks/use-user";
import { removeCookie } from "@/lib/cookie";
// import { EmailVerificationAlert } from "@/components/EmailVerificationAlert"; // <- REMOVE THIS
import { logout } from "@/lib/authApi";

interface DashboardLayoutProps {
  children: ReactNode;
}

const DashboardLayout = ({ children }: DashboardLayoutProps) => {
  const location = useLocation();
  const navigate = useNavigate();
  const { user, isLoading, error, fetchUser } = useUser();

  useEffect(() => {
    fetchUser();
  }, [fetchUser]);

  const navItems = [
    { icon: LayoutDashboard, label: "Dashboard", path: "/dashboard" },
    { icon: Bell, label: "Notifications", path: "/dashboard/notifications" },
    { icon: Receipt, label: "Expenses", path: "/dashboard/expenses" },
    { icon: Brain, label: "AI Advisor", path: "/dashboard/ai-advisor" },
    { icon: Settings, label: "Settings", path: "/dashboard/settings" },
  ];

  const handleLogout = async () => {
    try {
      await logout();
      navigate("/");
    } catch (error) {
      console.error('Logout failed:', error);
      navigate("/");
    }
  };

  return (
    <div className="flex h-screen bg-background">
      {/* Sidebar */}
      <Sidebar />

      {/* Main Content */}
      <main className="flex-1 overflow-auto">
        {/* Removed EmailVerificationAlert rendering */}
        {children}
      </main>
    </div>
  );
};

export default DashboardLayout;
