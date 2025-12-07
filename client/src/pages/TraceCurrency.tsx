import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import DashboardLayout from "@/components/DashboardLayout";
import { Search, Coins, AlertTriangle, CheckCircle } from "lucide-react";
import { Input } from "@/components/ui/input";
import { getCurrencyTracing } from "@/lib/currencyApi"; // backend call

const iconMap = {
  traced: <Coins className="w-5 h-5 text-secondary" />,
  warning: <AlertTriangle className="w-5 h-5 text-destructive" />,
  verified: <CheckCircle className="w-5 h-5 text-accent" />,
  default: <Search className="w-5 h-5 text-muted-foreground" />,
};

interface RecordItem {
  title: string;
  description: string;
  status: "traced" | "warning" | "verified";
  date: string;
}

const TracingCurrency = () => {
  const [records, setRecords] = useState<RecordItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [base, setBase] = useState("USD");
  const [targets, setTargets] = useState("EUR,KES,GBP");
  const [amount, setAmount] = useState(1);

  const fetchRecords = async () => {
    setIsLoading(true);
    try {
      const data = await getCurrencyTracing(base, targets); // pass base & targets dynamically
      setRecords(data || []);
    } catch (err) {
      console.error("Failed to fetch currency tracing:", err);
      setRecords([]);
    } finally {
      setIsLoading(false);
    }
  };

  // Fetch on mount, when base/targets change, and every 30s automatically
  useEffect(() => {
    fetchRecords();
    const interval = setInterval(fetchRecords, 30000); // 30 seconds
    return () => clearInterval(interval); // cleanup on unmount
  }, [base, targets]);

  return (
    <DashboardLayout>
      <div className="p-8">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <h1 className="font-heading text-3xl font-bold mb-2">
            Trace Currency
          </h1>
          <p className="text-muted-foreground">
            View real-time exchange rates to avoid visa/tax mistakes
          </p>
        </motion.div>

        {/* Controls */}
        <div className="flex flex-col md:flex-row gap-4 mb-6">
          <div className="flex-1">
            <p className="mb-2 font-medium">Base Currency</p>
            <Input
              value={base}
              onChange={(e) => setBase(e.target.value.toUpperCase())}
            />
          </div>
          <div className="flex-1">
            <p className="mb-2 font-medium">Target Currencies (comma-separated)</p>
            <Input
              value={targets}
              onChange={(e) => setTargets(e.target.value.toUpperCase())}
            />
          </div>
          <div className="flex-1">
            <p className="mb-2 font-medium">Amount</p>
            <Input
              type="number"
              value={amount}
              onChange={(e) => setAmount(Number(e.target.value))}
            />
          </div>
        </div>

        {/* Records List */}
        {isLoading ? (
          <div className="text-center text-muted-foreground">Loading...</div>
        ) : records.length === 0 ? (
          <div className="text-center text-muted-foreground">
            No currency tracing data.
          </div>
        ) : (
          <div className="space-y-4">
            {records.map((item, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.05 }}
                className="flex items-center gap-4 p-4 rounded-lg bg-gradient-to-br from-card via-card to-card/50 border border-border"
              >
                <div className="flex-shrink-0">
                  {iconMap[item.status] || iconMap.default}
                </div>
                <div className="flex-1">
                  <p className="font-medium">{item.title}</p>
                  <p className="text-sm text-muted-foreground">
                    {item.description} (Amount: {amount})
                  </p>
                </div>
                <span className="text-xs text-muted-foreground">{item.date}</span>
              </motion.div>
            ))}
          </div>
        )}
      </div>
    </DashboardLayout>
  );
};

export default TracingCurrency;
