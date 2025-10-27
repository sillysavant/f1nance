import { motion } from "framer-motion";
import NavBar from "@/components/NavBar";

const Notifications = () => {
  return (
    <NavBar>
      <div className="p-8">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <h1 className="font-heading text-3xl font-bold mb-2">
            Notifications
          </h1>
          <p className="text-muted-foreground">
            Stay updated with your financial activities
          </p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-gradient-to-br from-card via-card to-card/50 backdrop-blur-sm rounded-xl border border-border p-12 text-center"
        >
          <div className="max-w-md mx-auto">
            <div className="w-20 h-20 bg-gradient-to-br from-primary/20 to-secondary/20 rounded-full flex items-center justify-center mx-auto mb-6">
              <span className="text-4xl">🔔</span>
            </div>
            <h2 className="font-heading text-2xl font-semibold mb-3">
              Coming Soon
            </h2>
            <p className="text-muted-foreground">
              Smart notifications for payments, budgets, and financial insights
              will be available here.
            </p>
          </div>
        </motion.div>
      </div>
    </NavBar>
  );
};

export default Notifications;
