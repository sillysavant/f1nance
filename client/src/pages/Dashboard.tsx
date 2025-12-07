import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import DashboardLayout from "@/components/DashboardLayout";
import { TrendingUp, TrendingDown, Calendar, Award } from "lucide-react";
import { getCookie } from "@/lib/cookie";
import { getCurrentUser } from "@/lib/authApi";

interface IncomeItem {
  id: number;
  amount: number;
  description: string;
  date: string;
}

interface ExpenseItem {
  id: number;
  category: string;
  amount: number;
  description: string;
  date: string;
}

interface MonthlyData {
  month: string;
  income: number;
  expense: number;
}

interface Subscription {
  id?: number;
  plan_name: string;
  status: string;
  mrr: number;
  churned: boolean;
}

interface UpcomingPayment {
  id: number;
  description: string;
  amount: number;
  scheduled_date: string;
  status: string;
}

// Detect payment type for coloring
const detectType = (desc: string) => {
  const t = desc.toLowerCase();
  if (t.includes("tuition")) return "tuition";
  if (t.includes("tax")) return "tax";
  if (t.includes("rent")) return "rent";
  if (t.includes("utility")) return "utility";
  return "other";
};

const API_BASE = import.meta.env.VITE_API_BASE_URL || "http://localhost:8000/api/v1";

const Dashboard = () => {
  const token = getCookie("token");
  const tokenType = getCookie("token_type") || "bearer";

  const [userName, setUserName] = useState<string>("User");
  const [subscription, setSubscription] = useState<Subscription | null>(null);

  const [incomeList, setIncomeList] = useState<IncomeItem[]>([]);
  const [expenseList, setExpenseList] = useState<ExpenseItem[]>([]);

  const [totalIncome, setTotalIncome] = useState<number>(0);
  const [totalExpenses, setTotalExpenses] = useState<number>(0);
  const [budgetRemaining, setBudgetRemaining] = useState<number>(0);

  const [chartData, setChartData] = useState<MonthlyData[]>([]);
  const [upcomingPayments, setUpcomingPayments] = useState<UpcomingPayment[]>([]);

  const [showPlanModal, setShowPlanModal] = useState<boolean>(false);
  const [selectedPlan, setSelectedPlan] = useState<"Basic" | "Pro">("Basic");
  const [cardNumber, setCardNumber] = useState<string>("");
  const [expiry, setExpiry] = useState<string>("");
  const [cvv, setCvv] = useState<string>("");

  // --- Fetch user's subscription ---
  const fetchSubscription = async (): Promise<Subscription | null> => {
    try {
      const res = await fetch(`${API_BASE}/subscriptions/me`, {
        headers: { Authorization: `${tokenType} ${token}` },
      });
      if (!res.ok) return null;
      const data = await res.json();
      return data;
    } catch (err) {
      console.error("Error fetching subscription:", err);
      return null;
    }
  };

  // --- Fetch dashboard data ---
  const fetchData = async () => {
    try {
      // Incomes
      const incomeRes = await fetch(`${API_BASE}/income/`, { headers: { Authorization: `${tokenType} ${token}` } });
      const incomeDataRaw = await incomeRes.json();
      const incomeData: IncomeItem[] = (incomeDataRaw || []).map((i: any) => ({
        id: i.id,
        amount: Number(i.amount) || 0,
        description: i.description,
        date: i.date,
      }));

      // Expenses
      const expenseRes = await fetch(`${API_BASE}/expenses/`, { headers: { Authorization: `${tokenType} ${token}` } });
      const expenseDataRaw = await expenseRes.json();
      const expenseData: ExpenseItem[] = (expenseDataRaw || []).map((e: any) => ({
        id: e.id,
        category: e.category || "Other",
        amount: Number(e.amount) || 0,
        description: e.description,
        date: e.date,
      }));

      setIncomeList(incomeData);
      setExpenseList(expenseData);

      // Totals
      const incomeTotal = incomeData.reduce((sum, i) => sum + i.amount, 0);
      const expenseTotal = expenseData.reduce((sum, e) => sum + e.amount, 0);
      setTotalIncome(incomeTotal);
      setTotalExpenses(expenseTotal);
      setBudgetRemaining(incomeTotal - expenseTotal);

      // Chart last 6 months
      const months = ["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"];
      const grouped: MonthlyData[] = months.map(m => ({ month: m, income: 0, expense: 0 }));

      incomeData.forEach(inc => {
        const d = new Date(inc.date);
        if (!isNaN(d.getTime())) grouped[d.getMonth()].income += inc.amount;
      });
      expenseData.forEach(exp => {
        const d = new Date(exp.date);
        if (!isNaN(d.getTime())) grouped[d.getMonth()].expense += exp.amount;
      });

      setChartData(grouped.slice(-6));

      // User info
      const user = await getCurrentUser();
      setUserName(user.full_name || user.username || "User");

      // --- Subscription ---
      const sub = await fetchSubscription();
      if (!sub) {
        setShowPlanModal(true);
      } else {
        setSubscription(sub);
      }

      // Payments
      const paymentsRes = await fetch(`${API_BASE}/payments/`, { headers: { Authorization: `${tokenType} ${token}` } });
      const paymentsRaw = await paymentsRes.json();
      const today = new Date();
      const upcoming = (paymentsRaw || [])
        .map((p: any) => ({
          id: p.id,
          description: p.description,
          amount: Number(p.amount),
          scheduled_date: p.scheduled_date,
          status: p.status || "pending",
        }))
        .filter((p: UpcomingPayment) => new Date(p.scheduled_date) > today && p.status === "pending")
        .sort((a,b)=> new Date(a.scheduled_date).getTime() - new Date(b.scheduled_date).getTime())
        .slice(0,5);

      setUpcomingPayments(upcoming);

    } catch (err) {
      console.error("Failed loading dashboard:", err);
    }
  };

  useEffect(() => { fetchData(); }, []);

  // --- Handle plan submission ---
  const handlePlanSubmit = async () => {
    try {
      const payload = { plan_name: selectedPlan }; // backend only needs plan_name
  
      const res = await fetch(`${API_BASE}/subscriptions/create`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `${tokenType} ${token}`,
        },
        body: JSON.stringify(payload),
      });
  
      if (!res.ok) {
        const errData = await res.json();
        throw new Error(errData.detail || "Failed to create subscription");
      }
  
      const data: Subscription = await res.json();
      setSubscription(data);
      setShowPlanModal(false);
    } catch (err: any) {
      console.error("Subscription error:", err);
      alert(err.message || "Something went wrong while creating subscription");
    }
  };
  
  return (
    <DashboardLayout>
      <div className="p-8">
        {/* --- HEADER --- */}
        <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} className="mb-8">
          <h1 className="font-heading text-3xl font-bold mb-2">
            Welcome back, <span className="bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">{userName}</span>
          </h1>
          <p className="text-muted-foreground">Here's your financial overview for this month</p>
        </motion.div>

        {/* --- SUMMARY CARDS --- */}
        <div className="grid md:grid-cols-2 lg:grid-cols-5 gap-6 mb-8">
          {/* Income */}
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity:1, y:0 }} transition={{ delay:0.1 }} className="bg-card/30 backdrop-blur-sm rounded-xl border border-border p-6">
            <div className="flex items-center justify-between mb-4">
              <span className="text-muted-foreground text-sm font-medium">Income</span>
              <TrendingUp className="w-5 h-5 text-secondary"/>
            </div>
            <p className="font-heading text-3xl font-bold mb-1">${totalIncome.toLocaleString()}</p>
            <p className="text-xs text-secondary">+ calculated dynamically</p>
          </motion.div>

          {/* Expenses */}
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity:1, y:0 }} transition={{ delay:0.2 }} className="bg-card/30 backdrop-blur-sm rounded-xl border border-border p-6">
            <div className="flex items-center justify-between mb-4">
              <span className="text-muted-foreground text-sm font-medium">Expenses</span>
              <TrendingDown className="w-5 h-5 text-destructive"/>
            </div>
            <p className="font-heading text-3xl font-bold mb-1">${totalExpenses.toLocaleString()}</p>
            <p className="text-xs text-destructive">+ calculated dynamically</p>
          </motion.div>

          {/* Budget Remaining */}
          <motion.div initial={{ opacity:0, y:20 }} animate={{ opacity:1, y:0 }} transition={{ delay:0.3 }} className="bg-card/30 backdrop-blur-sm rounded-xl border border-border p-6">
            <div className="flex items-center justify-between mb-4">
              <span className="text-muted-foreground text-sm font-medium">Budget Remaining</span>
              <Award className="w-5 h-5 text-accent"/>
            </div>
            <p className="font-heading text-3xl font-bold mb-1">${budgetRemaining.toLocaleString()}</p>
            <p className="text-xs text-muted-foreground">auto-computed from income - expenses</p>
          </motion.div>

          {/* Financial Score */}
          <motion.div initial={{ opacity:0, y:20 }} animate={{ opacity:1, y:0 }} transition={{ delay:0.4 }} className="bg-card/30 backdrop-blur-sm rounded-xl border border-border p-6">
            <div className="flex items-center justify-between mb-4">
              <span className="text-muted-foreground text-sm font-medium">Financial Score</span>
              <Calendar className="w-5 h-5 text-primary"/>
            </div>
            <p className="font-heading text-3xl font-bold mb-1">78/100</p>
            <p className="text-xs text-primary">Good standing</p>
          </motion.div>

          {/* Subscription Plan */}
          <motion.div initial={{ opacity:0, y:20 }} animate={{ opacity:1, y:0 }} transition={{ delay:0.5 }} className="bg-card/30 backdrop-blur-sm rounded-xl border border-border p-6">
            <div className="flex items-center justify-between mb-4">
              <span className="text-muted-foreground text-sm font-medium">Plan</span>
              <Award className="w-5 h-5 text-primary"/>
            </div>
            <p className="font-heading text-3xl font-bold mb-1">{subscription?.plan_name || "Free Plan"}</p>
            <p className="text-xs text-muted-foreground">Status: {subscription?.status || "inactive"}</p>
          </motion.div>
        </div>

        {/* --- CHART + PAYMENTS --- */}
        <div className="grid lg:grid-cols-2 gap-6">
          {/* Chart */}
          <motion.div initial={{ opacity:0, y:20 }} animate={{ opacity:1, y:0 }} transition={{ delay:0.6 }} className="bg-card/30 backdrop-blur-sm rounded-xl border border-border p-6">
            <h3 className="font-heading text-xl font-semibold mb-6">Income vs Expenses</h3>
            <div className="flex items-end gap-3 h-64">
              {chartData.map((d,i) => (
                <div key={i} className="flex-1 flex flex-col gap-2 items-center">
                  <div className="w-full flex gap-1 items-end h-48">
                    <div className="flex-1 bg-secondary/80 rounded-t" style={{height:`${Math.min(d.income/10,100)}%`}}/>
                    <div className="flex-1 bg-destructive/60 rounded-t" style={{height:`${Math.min(d.expense/10,100)}%`}}/>
                  </div>
                  <span className="text-xs text-muted-foreground">{d.month}</span>
                </div>
              ))}
            </div>
            <div className="flex justify-center gap-6 mt-6">
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-secondary"/>
                <span className="text-sm text-muted-foreground">Income</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-destructive"/>
                <span className="text-sm text-muted-foreground">Expenses</span>
              </div>
            </div>
          </motion.div>

          {/* Upcoming Payments */}
          <motion.div initial={{opacity:0, y:20}} animate={{opacity:1, y:0}} transition={{delay:0.7}} className="bg-card/30 backdrop-blur-sm rounded-xl border border-border p-6">
            <h3 className="font-heading text-xl font-semibold mb-6">Upcoming Payments</h3>
            {upcomingPayments.length === 0 ? (
              <p className="text-muted-foreground text-sm">No upcoming payments.</p>
            ) : (
              <div className="space-y-4">
                {upcomingPayments.map((p) => {
                  const type = detectType(p.description);
                  const typeClass = type==="tuition" ? "text-destructive" : type==="tax" ? "text-accent" : "text-foreground";
                  const formattedDate = new Date(p.scheduled_date).toLocaleDateString("en-US", {month:"short", day:"numeric"});
                  return (
                    <div key={p.id} className="flex items-center justify-between p-4 rounded-lg bg-muted/30 hover:bg-muted/50 transition-colors">
                      <div>
                        <p className="font-medium">{p.description}</p>
                        <p className="text-sm text-muted-foreground">{formattedDate}</p>
                      </div>
                      <span className={`font-semibold ${typeClass}`}>{p.amount ? `$${p.amount.toLocaleString()}` : "-"}</span>
                    </div>
                  );
                })}
              </div>
            )}
          </motion.div>
        </div>
      </div>

      {/* --- PLAN MODAL --- */}
      {showPlanModal && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
          <div className="bg-card/30 backdrop-blur-sm p-8 rounded-xl w-96">
            <h2 className="font-heading text-xl font-bold mb-4">Select Your Plan</h2>
            <div className="flex flex-col gap-4 mb-4">
              <button
                onClick={()=>setSelectedPlan("Basic")}
                className={`p-3 rounded border ${selectedPlan==="Basic"?"border-primary bg-primary/20":"border-border"}`}
              >
                Basic (Free)
              </button>
              <button
                onClick={()=>setSelectedPlan("Pro")}
                className={`p-3 rounded border ${selectedPlan==="Pro"?"border-secondary bg-secondary/20":"border-border"}`}
              >
                Pro ($49.99/month)
              </button>
            </div>
            {selectedPlan==="Pro" && (
              <div className="flex flex-col gap-2 mb-4">
                <input
                  type="text"
                  placeholder="Card Number"
                  value={cardNumber}
                  onChange={(e) => {
                    const val = e.target.value.replace(/\D/g, "");
                    setCardNumber(val.slice(0,16));
                  }}
                  className="p-2 border rounded w-full text-foreground bg-card placeholder:text-muted-foreground"
                />
                <input
                  type="text"
                  placeholder="Expiry MMYY"
                  value={expiry}
                  onChange={(e) => {
                    const val = e.target.value.replace(/\D/g,"");
                    setExpiry(val.slice(0,4));
                  }}
                  className="p-2 border rounded w-full text-foreground bg-card placeholder:text-muted-foreground"
                />
                <input
                  type="text"
                  placeholder="CVV"
                  value={cvv}
                  onChange={(e) => {
                    const val = e.target.value.replace(/\D/g,"");
                    setCvv(val.slice(0,3));
                  }}
                  className="p-2 border rounded w-full text-foreground bg-card placeholder:text-muted-foreground"
                />
              </div>
            )}
            <button onClick={handlePlanSubmit} className="w-full bg-primary text-white p-3 rounded mt-2">Submit Plan</button>
          </div>
        </div>
      )}

    </DashboardLayout>
  );
};

export default Dashboard;
