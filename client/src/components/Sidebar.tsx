import { Link, useLocation, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import {
  LayoutDashboard,
  Bell,
  Receipt,
  Brain,
  Settings,
  LogOut,
  Loader2,
  DollarSign,
  Book,
  FileText,
} from "lucide-react";
import { useUser } from "@/hooks/use-user";
import { removeCookie } from "@/lib/cookie";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";


const Sidebar = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { user, isLoading } = useUser();

  const navItems = [
    { icon: LayoutDashboard, label: "Dashboard", path: "/dashboard" },
    { icon: Bell, label: "Notifications", path: "/dashboard/notifications" },
    { icon: DollarSign, label: "Budget Tracking", path: "/dashboard/budget-tracking" }, // existing
    { icon: DollarSign, label: "Payments", path: "/dashboard/payments" }, // <-- new Payments page
    { icon: Brain, label: "AI Advisor", path: "/dashboard/ai-advisor" },
    { icon: Book, label: "Financial Literacy", path: "/dashboard/financial-literacy" },
    { icon: FileText, label: "Tax & Compliance", path: "/dashboard/tax-compliance" },
    { icon: FileText, label: "Support & Operations", path: "/dashboard/support-tickets" },
  ];
  
  const handleLogout = () => {
    removeCookie('token');
    removeCookie('token_type');
    navigate("/");
  };

  return (
    <aside className="w-64 bg-card border-r border-border flex flex-col h-screen overflow-hidden">
      {/* Logo */}
      <div className="p-6 border-b border-border">
        <Link to="/dashboard" className="flex items-center space-x-2 group">
          <div className="w-10 h-10 bg-gradient-to-br from-primary to-secondary rounded-lg flex items-center justify-center font-heading font-bold text-xl">
            F1
          </div>
          <span className="font-heading font-bold text-xl bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
            F1nance
          </span>
        </Link>
      </div>

      {/* Navigation */}
      <nav className="flex-1 p-4 space-y-2 overflow-hidden">
        {navItems.map((item) => {
          const isActive = location.pathname === item.path;
          return (
            <Link key={item.path} to={item.path}>
              <motion.div
                whileHover={{ x: 4 }}
                className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${
                  isActive
                    ? "bg-gradient-to-r from-primary/20 to-secondary/20 text-primary border border-primary/30"
                    : "text-muted-foreground hover:bg-muted hover:text-foreground"
                }`}
              >
                <item.icon className="w-5 h-5" />
                <span className="font-medium">{item.label}</span>
              </motion.div>
            </Link>
          );
        })}
      </nav>

      {/* User Profile */}
      <div className="p-4 border-t border-border">
        <button
          onClick={() => navigate("/dashboard/profile")}
          className="w-full flex items-center gap-3 px-4 py-3 rounded-lg hover:bg-muted transition-colors mb-2"
        >
          {isLoading ? (
            <div className="flex items-center justify-center w-10 h-10">
              <Loader2 className="h-5 w-5 animate-spin" />
            </div>
          ) : (
            <Avatar className="w-10 h-10 border-2 border-primary/30">
              <AvatarFallback className="bg-gradient-to-br from-primary to-secondary text-primary-foreground font-semibold">
                {user?.full_name?.split(' ').map(n => n[0]).join('') || '??'}
              </AvatarFallback>
            </Avatar>
          )}
          <div className="flex-1 text-left">
            <p className="font-medium text-sm">{user?.full_name || 'Loading...'}</p>
            <p className="text-xs text-muted-foreground">{user?.email}</p>
          </div>
        </button>

        <Button
          variant="ghost"
          onClick={handleLogout}
          className="w-full justify-start text-muted-foreground hover:text-destructive"
        >
          <LogOut className="w-4 h-4 mr-3" />
          Logout
        </Button>
      </div>
    </aside>
  );
};

export default Sidebar;
