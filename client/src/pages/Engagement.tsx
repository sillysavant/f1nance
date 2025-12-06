import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import DashboardLayout from "@/components/DashboardLayout";
import { Bell, CheckCircle, AlertTriangle, Clock } from "lucide-react";
import { getEngagements, snoozeEngagement, markDone } from "@/lib/engagementApi";

const iconMap = {
  done: <CheckCircle className="w-5 h-5 text-accent" />,
  pending: <Bell className="w-5 h-5 text-secondary" />,
  snoozed: <Clock className="w-5 h-5 text-muted-foreground" />,
  alert: <AlertTriangle className="w-5 h-5 text-destructive" />,
  default: <Bell className="w-5 h-5 text-muted-foreground" />,
};

interface EngagementItem {
  id: number;
  module_name: string;
  action: string;
  timestamp: string;
  critical_date?: string | null;
  snoozed_until?: string | null;
  is_done: boolean;
}

const Engagement = () => {
  const [engagements, setEngagements] = useState<EngagementItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchData = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const data = await getEngagements();
      if (Array.isArray(data)) {
        setEngagements(data);
      } else {
        console.warn("Unexpected response from backend:", data);
        setEngagements([]);
        setError("Unexpected data format from server");
      }
    } catch (err) {
      console.error("Failed to fetch engagements:", err);
      setError("Failed to fetch engagement data");
      setEngagements([]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleMarkDone = async (id: number) => {
    try {
      await markDone(id);
      fetchData();
    } catch (err) {
      console.error("Failed to mark done:", err);
    }
  };

  const handleSnooze = async (id: number) => {
    try {
      const snoozedUntil = new Date();
      snoozedUntil.setHours(snoozedUntil.getHours() + 1); // snooze 1 hour
      await snoozeEngagement(id, snoozedUntil.toISOString());
      fetchData();
    } catch (err) {
      console.error("Failed to snooze engagement:", err);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  return (
    <DashboardLayout>
      <div className="p-8">
        <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} className="mb-8">
          <h1 className="font-heading text-3xl font-bold mb-2">Monitor Engagement</h1>
          <p className="text-muted-foreground">Track how users interact with learning modules</p>
        </motion.div>

        {/* Status Messages */}
        {isLoading && <div className="text-center text-muted-foreground">Loading...</div>}
        {error && <div className="text-center text-red-500">{error}</div>}
        {!isLoading && !error && engagements.length === 0 && (
          <div className="text-center text-muted-foreground">No engagement data.</div>
        )}

        {/* Engagement List */}
        {!isLoading && !error && engagements.length > 0 && (
          <div className="space-y-4">
            {engagements.map((item) => {
              const status = item.is_done ? "done" : item.snoozed_until ? "snoozed" : "pending";

              return (
                <motion.div
                  key={item.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.05 }}
                  className="flex items-center gap-4 p-4 rounded-lg bg-gradient-to-br from-card via-card to-card/50 border border-border"
                >
                  <div className="flex-shrink-0">{iconMap[status] || iconMap.default}</div>
                  <div className="flex-1">
                    <p className="font-medium">{item.module_name} ({item.action})</p>
                    <p className="text-sm text-muted-foreground">
                      Critical: {item.critical_date || "None"} | Snoozed until: {item.snoozed_until || "—"}
                    </p>
                  </div>
                  <div className="flex flex-col gap-1">
                    {!item.is_done && (
                      <button onClick={() => handleMarkDone(item.id)} className="px-2 py-1 text-xs rounded bg-green-500 text-white">
                        Mark Done
                      </button>
                    )}
                    <button onClick={() => handleSnooze(item.id)} className="px-2 py-1 text-xs rounded bg-yellow-500 text-white">
                      Snooze
                    </button>
                  </div>
                </motion.div>
              );
            })}
          </div>
        )}
      </div>
    </DashboardLayout>
  );
};

export default Engagement;
