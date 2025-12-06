// AdminMonitorSubscriptions.tsx
import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import AdminDashboardLayout from "@/components/AdminDashboardLayout";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { getCookie } from "@/lib/cookie";

const API_BASE = import.meta.env.VITE_API_BASE_URL || "http://localhost:8000/api/v1";

interface Subscription {
  id: number;
  user_id: number;
  plan_name: string;
  status: string;
  mrr: number;
  churned: boolean;
}

const AdminMonitorSubscriptions = () => {
  const [subscriptions, setSubscriptions] = useState<Subscription[]>([]);
  const [search, setSearch] = useState("");
  const token = getCookie("admin_token");
  const tokenType = getCookie("token_type") || "bearer";

  const fetchSubscriptions = async () => {
    try {
      const res = await fetch(`${API_BASE}/admin/support/subscriptions`, {
        headers: { Authorization: `${tokenType} ${token}` },
      });
      if (!res.ok) throw new Error("Failed to fetch subscriptions");
      setSubscriptions(await res.json());
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    fetchSubscriptions();
  }, []);

  const filteredSubs = subscriptions.filter((s) => s.plan_name.toLowerCase().includes(search.toLowerCase()));

  return (
    <AdminDashboardLayout>
      <div className="p-8">
        <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} className="mb-8 flex justify-between items-center">
          <div>
            <h1 className="font-heading text-3xl font-bold mb-2">Monitor Subscriptions</h1>
            <p className="text-muted-foreground">View all subscriptions and monitor MRR / Churn metrics</p>
          </div>
        </motion.div>

        <Input placeholder="Search plan..." value={search} onChange={(e) => setSearch(e.target.value)} className="max-w-sm mb-4" />

        <Card>
          <CardHeader>
            <CardTitle>Subscriptions</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <table className="w-full text-left">
                <thead>
                  <tr className="border-b border-border">
                    <th className="px-3 py-2">User ID</th>
                    <th className="px-3 py-2">Plan</th>
                    <th className="px-3 py-2">Status</th>
                    <th className="px-3 py-2">MRR</th>
                    <th className="px-3 py-2">Churned</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredSubs.map((s) => (
                    <tr key={s.id} className="border-b border-border">
                      <td className="px-3 py-2">{s.user_id}</td>
                      <td className="px-3 py-2">{s.plan_name}</td>
                      <td className="px-3 py-2">{s.status}</td>
                      <td className="px-3 py-2">{s.mrr}</td>
                      <td className="px-3 py-2">{s.churned ? "Yes" : "No"}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      </div>
    </AdminDashboardLayout>
  );
};

export default AdminMonitorSubscriptions;
