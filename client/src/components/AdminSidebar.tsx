import { Link, useLocation, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import {
  LayoutDashboard,
  Users,
  FileText,
  Book,
  Settings,
  LogOut,
  DollarSign,
  CreditCard,
} from "lucide-react";
import { removeCookie } from "@/lib/cookie";

const AdminSidebar = () => {
  const location = useLocation();
  const navigate = useNavigate();

  const navItems = [
    { icon: LayoutDashboard, label: "Dashboard", path: "/admin/dashboard" },
    { icon: Users, label: "Manage Users", path: "/admin/users" },
    { icon: FileText, label: "All Support Tickets", path: "/admin/support-tickets" },
    { icon: Book, label: "Tax & Compliance Resources", path: "/admin/resources" },
    { icon: FileText, label: "Financial Modules", path: "/admin/financial-modules" },
    { icon: DollarSign, label: "Monitor Subscriptions", path: "/admin/monitor-subscriptions" },
    { icon: CreditCard, label: "Manage Payments", path: "/admin/manage-payments" },
  ];

  const handleLogout = () => {
    removeCookie("admin_token");
    removeCookie("token_type");
    navigate("/");
  };

  return (
    <aside className="w-64 bg-card border-r border-border flex flex-col h-screen overflow-hidden">
      {/* Logo */}
      <div className="p-6 border-b border-border">
        <Link to="/admin/dashboard" className="flex items-center space-x-2 group">
          <div className="w-10 h-10 bg-gradient-to-br from-primary to-secondary rounded-lg flex items-center justify-center font-heading font-bold text-xl">
            A
          </div>
          <span className="font-heading font-bold text-xl bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
            Admin
          </span>
        </Link>
      </div>

      {/* Navigation */}
      <nav className="flex-1 p-4 space-y-2 overflow-hidden">
        {navItems.map((item) => {
          // Use startsWith to match nested routes as well
          const isActive = location.pathname.startsWith(item.path);
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

      {/* Logout */}
      <div className="p-4 border-t border-border">
        <button
          onClick={handleLogout}
          className="w-full flex items-center gap-3 px-4 py-3 rounded-lg hover:bg-muted transition-colors text-muted-foreground hover:text-destructive"
        >
          <LogOut className="w-4 h-4 mr-3" />
          Logout
        </button>
      </div>
    </aside>
  );
};

export default AdminSidebar;
