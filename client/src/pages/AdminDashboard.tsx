import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import AdminDashboardLayout from "@/components/AdminDashboardLayout";
import { TrendingUp, Users, FileText, Award } from "lucide-react";
import { getCookie } from "@/lib/cookie";

const API_BASE = import.meta.env.VITE_API_BASE_URL || "http://localhost:8000/api/v1";

const AdminDashboard = () => {
  const [adminName, setAdminName] = useState("Admin");
  const [stats, setStats] = useState({
    totalUsers: 0,
    pendingTickets: 0,
    revenue: 0,
    financialScore: 0,
  });

  const token = getCookie("admin_token");
  const tokenType = getCookie("token_type") || "bearer";

  useEffect(() => {
    // Fetch admin info
    const fetchAdmin = async () => {
      try {
        const res = await fetch(`${API_BASE}/admin/me`, {
          headers: { Authorization: `${tokenType} ${token}` },
        });
        if (!res.ok) throw new Error("Failed to fetch admin info");
        const admin = await res.json();
        setAdminName(admin.full_name || admin.username || "Admin");
      } catch (err) {
        console.error("Failed to fetch admin:", err);
      }
    };

    // Fetch dashboard stats
    const fetchStats = async () => {
      try {
        const res = await fetch(`${API_BASE}/admin/dashboard-stats`, {
          headers: { Authorization: `${tokenType} ${token}` },
        });
        if (!res.ok) throw new Error("Failed to fetch dashboard stats");
        const data = await res.json();

        // Map backend keys to frontend state
        setStats({
          totalUsers: data.total_users || 0,
          pendingTickets: data.pending_tickets || 0,
          revenue: data.total_revenue || 0,
          financialScore: data.financial_score || 85, // static or calculated
        });
      } catch (err) {
        console.error("Failed to fetch dashboard stats:", err);
      }
    };

    fetchAdmin();
    fetchStats();
  }, []);

  return (
    <AdminDashboardLayout>
      <div className="p-8">
        {/* Header */}
        <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} className="mb-8">
          <h1 className="font-heading text-3xl font-bold mb-2">
            Welcome back,{" "}
            <span className="bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
              {adminName}
            </span>
          </h1>
          <p className="text-muted-foreground">Here's your admin overview</p>
        </motion.div>

        {/* Stats Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {/* Total Users */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="bg-gradient-to-br from-card via-card to-card/50 backdrop-blur-sm rounded-xl border border-border p-6"
          >
            <div className="flex items-center justify-between mb-4">
              <span className="text-muted-foreground text-sm font-medium">Total Users</span>
              <Users className="w-5 h-5 text-secondary" />
            </div>
            <p className="font-heading text-3xl font-bold mb-1">{stats.totalUsers}</p>
            <p className="text-xs text-secondary">+5% from last month</p>
          </motion.div>

          {/* Pending Tickets */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="bg-gradient-to-br from-card via-card to-card/50 backdrop-blur-sm rounded-xl border border-border p-6"
          >
            <div className="flex items-center justify-between mb-4">
              <span className="text-muted-foreground text-sm font-medium">Pending Tickets</span>
              <FileText className="w-5 h-5 text-accent" />
            </div>
            <p className="font-heading text-3xl font-bold mb-1">{stats.pendingTickets}</p>
            <p className="text-xs text-muted-foreground">Needs attention</p>
          </motion.div>

          {/* Revenue */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="bg-gradient-to-br from-card via-card to-card/50 backdrop-blur-sm rounded-xl border border-border p-6"
          >
            <div className="flex items-center justify-between mb-4">
              <span className="text-muted-foreground text-sm font-medium">Revenue</span>
              <TrendingUp className="w-5 h-5 text-accent" />
            </div>
            <p className="font-heading text-3xl font-bold mb-1">${stats.revenue}</p>
            <p className="text-xs text-secondary">+12% from last month</p>
          </motion.div>

          {/* Financial Score */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="bg-gradient-to-br from-card via-card to-card/50 backdrop-blur-sm rounded-xl border border-border p-6"
          >
            <div className="flex items-center justify-between mb-4">
              <span className="text-muted-foreground text-sm font-medium">Financial Score</span>
              <Award className="w-5 h-5 text-primary" />
            </div>
            <p className="font-heading text-3xl font-bold mb-1">{stats.financialScore}/100</p>
            <p className="text-xs text-primary">Excellent</p>
          </motion.div>
        </div>
      </div>
    </AdminDashboardLayout>
  );
};

export default AdminDashboard;
