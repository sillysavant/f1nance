import { motion } from "framer-motion";
import NavBar from "@/components/NavBar";
import { TrendingUp, TrendingDown, Calendar, Award } from "lucide-react";

const Dashboard = () => {
  return (
    <NavBar>
      <div className="p-8">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <h1 className="font-heading text-3xl font-bold mb-2">
            Welcome back,{" "}
            <span className="bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
              John
            </span>
          </h1>
          <p className="text-muted-foreground">
            Here's your financial overview for this month
          </p>
        </motion.div>

        {/* Stats Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="bg-gradient-to-br from-card via-card to-card/50 backdrop-blur-sm rounded-xl border border-border p-6"
          >
            <div className="flex items-center justify-between mb-4">
              <span className="text-muted-foreground text-sm font-medium">
                Income
              </span>
              <TrendingUp className="w-5 h-5 text-secondary" />
            </div>
            <p className="font-heading text-3xl font-bold mb-1">$2,450</p>
            <p className="text-xs text-secondary">+12% from last month</p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="bg-gradient-to-br from-card via-card to-card/50 backdrop-blur-sm rounded-xl border border-border p-6"
          >
            <div className="flex items-center justify-between mb-4">
              <span className="text-muted-foreground text-sm font-medium">
                Expenses
              </span>
              <TrendingDown className="w-5 h-5 text-destructive" />
            </div>
            <p className="font-heading text-3xl font-bold mb-1">$1,876</p>
            <p className="text-xs text-destructive">+8% from last month</p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="bg-gradient-to-br from-card via-card to-card/50 backdrop-blur-sm rounded-xl border border-border p-6"
          >
            <div className="flex items-center justify-between mb-4">
              <span className="text-muted-foreground text-sm font-medium">
                Budget Remaining
              </span>
              <Award className="w-5 h-5 text-accent" />
            </div>
            <p className="font-heading text-3xl font-bold mb-1">$574</p>
            <p className="text-xs text-muted-foreground">
              23% of monthly budget
            </p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="bg-gradient-to-br from-card via-card to-card/50 backdrop-blur-sm rounded-xl border border-border p-6"
          >
            <div className="flex items-center justify-between mb-4">
              <span className="text-muted-foreground text-sm font-medium">
                Financial Score
              </span>
              <Calendar className="w-5 h-5 text-primary" />
            </div>
            <p className="font-heading text-3xl font-bold mb-1">78/100</p>
            <p className="text-xs text-primary">Good standing</p>
          </motion.div>
        </div>

        <div className="grid lg:grid-cols-2 gap-6">
          {/* Income vs Expenses Chart */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
            className="bg-gradient-to-br from-card via-card to-card/50 backdrop-blur-sm rounded-xl border border-border p-6"
          >
            <h3 className="font-heading text-xl font-semibold mb-6">
              Income vs Expenses
            </h3>
            <div className="flex items-end gap-3 h-64">
              {[
                { month: "Jan", income: 70, expense: 60 },
                { month: "Feb", income: 85, expense: 75 },
                { month: "Mar", income: 65, expense: 70 },
                { month: "Apr", income: 90, expense: 65 },
                { month: "May", income: 80, expense: 85 },
                { month: "Jun", income: 95, expense: 78 },
              ].map((data, i) => (
                <div
                  key={i}
                  className="flex-1 flex flex-col gap-2 items-center"
                >
                  <div className="w-full flex gap-1 items-end h-48">
                    <div
                      className="flex-1 bg-gradient-to-t from-secondary to-secondary/50 rounded-t transition-all hover:opacity-80"
                      style={{ height: `${data.income}%` }}
                    />
                    <div
                      className="flex-1 bg-gradient-to-t from-destructive/50 to-destructive/20 rounded-t transition-all hover:opacity-80"
                      style={{ height: `${data.expense}%` }}
                    />
                  </div>
                  <span className="text-xs text-muted-foreground">
                    {data.month}
                  </span>
                </div>
              ))}
            </div>
            <div className="flex justify-center gap-6 mt-6">
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-gradient-to-br from-secondary to-secondary/50" />
                <span className="text-sm text-muted-foreground">Income</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-gradient-to-br from-destructive/50 to-destructive/20" />
                <span className="text-sm text-muted-foreground">Expenses</span>
              </div>
            </div>
          </motion.div>

          {/* Key Payment Dates */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6 }}
            className="bg-gradient-to-br from-card via-card to-card/50 backdrop-blur-sm rounded-xl border border-border p-6"
          >
            <h3 className="font-heading text-xl font-semibold mb-6">
              Upcoming Payments
            </h3>
            <div className="space-y-4">
              {[
                {
                  name: "Rent Payment",
                  date: "Dec 1",
                  amount: "$850",
                  type: "rent",
                },
                {
                  name: "Tuition Due",
                  date: "Dec 15",
                  amount: "$3,200",
                  type: "tuition",
                },
                {
                  name: "Tax Filing Deadline",
                  date: "Dec 20",
                  amount: "-",
                  type: "tax",
                },
                {
                  name: "Utilities",
                  date: "Dec 5",
                  amount: "$120",
                  type: "utility",
                },
              ].map((payment, i) => (
                <div
                  key={i}
                  className="flex items-center justify-between p-4 rounded-lg bg-muted/30 hover:bg-muted/50 transition-colors"
                >
                  <div>
                    <p className="font-medium">{payment.name}</p>
                    <p className="text-sm text-muted-foreground">
                      {payment.date}
                    </p>
                  </div>
                  <span
                    className={`font-semibold ${
                      payment.type === "tuition"
                        ? "text-destructive"
                        : payment.type === "tax"
                        ? "text-accent"
                        : "text-foreground"
                    }`}
                  >
                    {payment.amount}
                  </span>
                </div>
              ))}
            </div>
          </motion.div>
        </div>

        {/* Financial Literacy Progress */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.7 }}
          className="mt-6 bg-gradient-to-br from-card via-card to-card/50 backdrop-blur-sm rounded-xl border border-border p-6"
        >
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-heading text-xl font-semibold">
              Financial Literacy Progress
            </h3>
            <span className="text-sm text-muted-foreground">78% Complete</span>
          </div>
          <div className="w-full h-4 bg-muted rounded-full overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-primary via-secondary to-accent rounded-full transition-all duration-1000"
              style={{ width: "78%" }}
            />
          </div>
          <p className="mt-4 text-sm text-muted-foreground">
            Keep learning! Complete 3 more modules to reach Expert level.
          </p>
        </motion.div>
      </div>
    </NavBar>
  );
};

export default Dashboard;
