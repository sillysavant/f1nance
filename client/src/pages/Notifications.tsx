import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import DashboardLayout from "@/components/DashboardLayout";
import { Bell, DollarSign, AlertTriangle, CheckCircle } from "lucide-react";
import { getNotifications } from "@/lib/notificationsApi"; // implement API call

const iconMap = {
  payment: <DollarSign className="w-5 h-5 text-secondary" />,
  alert: <AlertTriangle className="w-5 h-5 text-destructive" />,
  success: <CheckCircle className="w-5 h-5 text-accent" />,
  default: <Bell className="w-5 h-5 text-muted-foreground" />,
};

const Notifications = () => {
  const [notifications, setNotifications] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchNotifications = async () => {
      try {
        const data = await getNotifications(); // fetch from backend
        setNotifications(data || []);
      } catch (err) {
        console.error("Failed to fetch notifications:", err);
      } finally {
        setIsLoading(false);
      }
    };

    fetchNotifications();
  }, []);

  return (
    <DashboardLayout>
      <div className="p-8">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <h1 className="font-heading text-3xl font-bold mb-2">Notifications</h1>
          <p className="text-muted-foreground">
            Stay updated with your financial activities
          </p>
        </motion.div>

        {/* Notifications List */}
        {isLoading ? (
          <div className="text-center text-muted-foreground">Loading...</div>
        ) : notifications.length === 0 ? (
          <div className="text-center text-muted-foreground">No notifications.</div>
        ) : (
          <div className="space-y-4">
            {notifications.map((notif, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.05 }}
                className="flex items-center gap-4 p-4 rounded-lg bg-gradient-to-br from-card via-card to-card/50 border border-border"
              >
                <div className="flex-shrink-0">
                  {iconMap[notif.type] || iconMap.default}
                </div>
                <div className="flex-1">
                  <p className="font-medium">{notif.title}</p>
                  <p className="text-sm text-muted-foreground">{notif.message}</p>
                </div>
                <span className="text-xs text-muted-foreground">{notif.date}</span>
              </motion.div>
            ))}
          </div>
        )}
      </div>
    </DashboardLayout>
  );
};

export default Notifications;
