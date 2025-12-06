import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import DashboardLayout from "@/components/DashboardLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { DollarSign, PieChart, Plus, Edit2, Trash2 } from "lucide-react";
import { getCookie } from "@/lib/cookie";
import Modal from "@/components/ui/Modal";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import {
  PieChart as RePieChart,
  Pie,
  Cell,
  Tooltip as PieTooltip,
  ResponsiveContainer,
} from "recharts";

// === Types ===
interface Income {
  id: number;
  amount: number;
  description: string;
  date: string;
}
interface Expense {
  id: number;
  category: string;
  amount: number;
  description: string;
  date: string;
}

// Default expense categories
const expenseCategories = ["Food", "Transport", "Rent", "Utilities", "Entertainment", "Other"];

// Mapping functions
const mapIncome = (i: any): Income => ({
  id: i.id,
  amount: Number(i.amount),
  description: i.description,
  date: i.date,
});
const mapExpense = (e: any): Expense => ({
  id: e.id,
  category: e.category,
  amount: Number(e.amount),
  description: e.description,
  date: e.date,
});

const API_BASE = import.meta.env.VITE_API_BASE_URL || "http://localhost:8000/api/v1";

// === CurrencyTrace Component ===
interface CurrencyTraceProps {
  amount: number;
  base: string;
  targets: string[];
}

const CurrencyTrace = ({ amount, base, targets }: CurrencyTraceProps) => {
  const [rates, setRates] = useState<Record<string, number>>({});
  const [status, setStatus] = useState<"ok" | "stale" | "error">("ok");
  const [open, setOpen] = useState(false);

  // ******** UPDATED FUNCTION (HARDCODED RATES) ********
  const fetchRates = async () => {
    try {
      const staticRates: Record<string, number> = {
        INR: 89.36, // 1 USD = 89.36 INR
        CNY: 7.08,  // 1 USD = 7.08 CNY
      };

      const converted: Record<string, number> = {};
      for (const target of targets) {
        const rate = staticRates[target];
        converted[target] = rate ? rate * amount : 0;
      }

      setRates(converted);
      setStatus("ok");
    } catch (err) {
      console.error("Currency trace error:", err);
      setStatus("error");
      setRates({});
    }
  };
  // *****************************************************

  useEffect(() => {
    fetchRates();
    const interval = setInterval(fetchRates, 30000);
    return () => clearInterval(interval);
  }, [amount, base, targets]);

  return (
    <div className="mt-1 text-xs">
      {status === "error" && <span className="text-red-500">FX Error</span>}
      {status === "stale" && <span className="text-yellow-500">FX Stale</span>}
      {status === "ok" && (
        <span
          className="text-blue-500 cursor-pointer hover:underline"
          onClick={() => setOpen(!open)}
        >
          {open ? "Hide conversions ▲" : "Show conversions ▼"}
        </span>
      )}
      {open && status === "ok" && (
        <div className="flex flex-col gap-1 mt-1 pl-2 border-l border-gray-200">
          {Object.entries(rates).map(([cur, val]) => (
            <span key={cur}>
              {cur}: {val.toFixed(2)}
            </span>
          ))}
        </div>
      )}
    </div>
  );
};

// === Main BudgetTracking Component ===
const BudgetTracking = () => {
  const token = getCookie("token");
  const tokenType = getCookie("token_type") || "bearer";

  const [incomes, setIncomes] = useState<Income[]>([]);
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState<Income | Expense | null>(null);
  const [modalType, setModalType] = useState<"income" | "expense">("income");
  const [form, setForm] = useState({ amount: "", description: "", category: expenseCategories[0] });

  const [currencyBase, setCurrencyBase] = useState("USD");
  const [currencyTargets, setCurrencyTargets] = useState("INR,CNY");

  const fetchIncomes = async () => {
    try {
      const res = await fetch(`${API_BASE}/income/`, { headers: { Authorization: `${tokenType} ${token}` } });
      if (!res.ok) throw new Error("Failed to fetch incomes");
      const data = await res.json();
      setIncomes(data.map(mapIncome));
    } catch (err: any) {
      console.error(err.message || err);
    }
  };

  const fetchExpenses = async () => {
    try {
      const res = await fetch(`${API_BASE}/expenses/`, { headers: { Authorization: `${tokenType} ${token}` } });
      if (!res.ok) throw new Error("Failed to fetch expenses");
      const data = await res.json();
      setExpenses(data.map(mapExpense));
    } catch (err: any) {
      console.error(err.message || err);
    }
  };

  useEffect(() => {
    fetchIncomes();
    fetchExpenses();
  }, []);

  const handleOpenModal = (type: "income" | "expense", item?: Income | Expense) => {
    setModalType(type);
    if (item) {
      setEditing(item);
      if (type === "income") {
        const i = item as Income;
        setForm({ amount: i.amount.toString(), description: i.description, category: expenseCategories[0] });
      } else {
        const e = item as Expense;
        setForm({ amount: e.amount.toString(), description: e.description, category: e.category || expenseCategories[0] });
      }
    } else {
      setEditing(null);
      setForm({ amount: "", description: "", category: expenseCategories[0] });
    }
    setModalOpen(true);
  };
  const handleCloseModal = () => setModalOpen(false);
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => setForm({ ...form, [e.target.name]: e.target.value });
  const handleCategoryChange = (value: string) => setForm({ ...form, category: value });

  const handleSubmit = async () => {
    const isIncome = modalType === "income";
    const editingItem = editing as Income | Expense | null;

    const amountNum = Number(form.amount);
    if (isNaN(amountNum) || amountNum <= 0) return alert("Amount must be a positive number");
    if (!form.description.trim()) return alert("Description is required");
    if (!isIncome && !form.category.trim()) return alert("Category is required");

    const url = editingItem
      ? `${API_BASE}/${isIncome ? "income" : "expenses"}/${editingItem.id}/`
      : `${API_BASE}/${isIncome ? "income" : "expenses"}/`;
    const method = editingItem ? "PUT" : "POST";

    const payload: any = { amount: amountNum, description: form.description.trim() };
    if (!isIncome) payload.category = form.category.trim();

    try {
      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json", Authorization: `${tokenType} ${token}` },
        body: JSON.stringify(payload),
      });
      if (!res.ok) {
        const errData = await res.json();
        throw new Error(errData.detail || "Failed to save");
      }
      isIncome ? fetchIncomes() : fetchExpenses();
      handleCloseModal();
    } catch (err: any) {
      console.error(err.message || err);
    }
  };

  const handleDelete = async (type: "income" | "expense", id: number) => {
    if (!window.confirm("Are you sure you want to delete?")) return;
    try {
      const path = type === "expense" ? "expenses" : "income";
      const res = await fetch(`${API_BASE}/${path}/${id}/`, { method: "DELETE", headers: { Authorization: `${tokenType} ${token}` } });
      if (!res.ok) throw new Error("Failed to delete");
      type === "income" ? fetchIncomes() : fetchExpenses();
    } catch (err: any) {
      console.error(err.message || err);
    }
  };

  const totalIncome = incomes.reduce((sum, i) => sum + i.amount, 0);
  const totalExpenses = expenses.reduce((sum, e) => sum + e.amount, 0);

  const categoryTotals: Record<string, number> = {};
  expenses.forEach((e) => {
    if (!categoryTotals[e.category]) categoryTotals[e.category] = 0;
    categoryTotals[e.category] += e.amount;
  });
  const pieData = Object.entries(categoryTotals).map(([name, value]) => ({ name, value }));

  const COLORS = ["#0088FE", "#00C49F", "#FFBB28", "#FF8042", "#A28BFF", "#FF6584"];
  const incomeExpenseData = [
    { name: "Income", value: totalIncome },
    { name: "Expenses", value: totalExpenses }
  ];
  const IE_COLORS = ["#0088FE", "#FF6384"];

  return (
    <DashboardLayout>
      <div className="p-8">
        <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} className="mb-8 flex justify-between items-center">
          <div>
            <h1 className="font-heading text-3xl font-bold mb-2">Budget Tracking</h1>
            <p className="text-muted-foreground">Track incomes and expenses in one place</p>
          </div>
        </motion.div>

        <div className="flex flex-col md:flex-row gap-4 mb-6">
          <Input
            className="flex-1"
            value={currencyBase}
            onChange={(e) => setCurrencyBase(e.target.value.toUpperCase())}
            placeholder="Base Currency (USD)"
          />
          <Input
            className="flex-1"
            value={currencyTargets}
            onChange={(e) => setCurrencyTargets(e.target.value.toUpperCase())}
            placeholder="Target Currencies (comma-separated)"
          />
        </div>

        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base"><PieChart /> Income vs Expenses</CardTitle>
          </CardHeader>
          <CardContent style={{ height: 200 }}>
            {totalIncome + totalExpenses === 0 ? (
              <p className="text-sm text-muted-foreground">No data yet</p>
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <RePieChart>
                  <Pie
                    data={incomeExpenseData}
                    dataKey="value"
                    nameKey="name"
                    outerRadius={70}
                    label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                  >
                    {incomeExpenseData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={IE_COLORS[index % IE_COLORS.length]} />
                    ))}
                  </Pie>
                  <PieTooltip formatter={(value: number) => `$${value.toFixed(2)}`} />
                </RePieChart>
              </ResponsiveContainer>
            )}
          </CardContent>
        </Card>

        <div className="grid md:grid-cols-3 gap-6 mb-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-base"><DollarSign /> Total Income</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="font-heading text-3xl font-bold">${totalIncome.toLocaleString(undefined, { minimumFractionDigits: 2 })}</p>
              <p className="text-sm text-muted-foreground mt-1">{incomes.length} entries</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-base"><DollarSign /> Total Expenses</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="font-heading text-3xl font-bold">${totalExpenses.toLocaleString(undefined, { minimumFractionDigits: 2 })}</p>
              <p className="text-sm text-muted-foreground mt-1">{expenses.length} items</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-base"><PieChart /> Expense Categories</CardTitle>
            </CardHeader>
            <CardContent style={{ height: 250 }}>
              {pieData.length === 0 ? (
                <p className="text-sm text-muted-foreground">No expenses yet</p>
              ) : (
                <ResponsiveContainer width="100%" height="100%">
                  <RePieChart>
                    <Pie
                      data={pieData}
                      dataKey="value"
                      nameKey="name"
                      outerRadius={80}
                      label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                    >
                      {pieData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <PieTooltip formatter={(value: number) => `$${value.toFixed(2)}`} />
                  </RePieChart>
                </ResponsiveContainer>
              )}
            </CardContent>
          </Card>
        </div>

        <div className="grid md:grid-cols-2 gap-6">
          <Card>
            <CardHeader className="flex justify-between items-center">
              <CardTitle className="flex items-center gap-2 text-base">Income</CardTitle>
              <Button onClick={() => handleOpenModal("income")} className="flex items-center gap-2"><Plus /> Add</Button>
            </CardHeader>
            <CardContent>
              {incomes.length === 0 ? <p className="text-muted-foreground text-sm">No income recorded.</p> :
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-sm">
                    <thead>
                      <tr className="border-b border-border">
                        <th className="px-3 py-2">Amount</th>
                        <th className="px-3 py-2">Description</th>
                        <th className="px-3 py-2">Date</th>
                        <th className="px-3 py-2">Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {incomes.map(i => (
                        <tr key={i.id} className="border-b border-border">
                          <td className="px-3 py-2">${i.amount.toFixed(2)}</td>
                          <td className="px-3 py-2">{i.description}</td>
                          <td className="px-3 py-2">{new Date(i.date).toLocaleDateString()}</td>
                          <td className="px-3 py-2 flex gap-2">
                            <Button size="sm" variant="outline" onClick={() => handleOpenModal("income", i)}><Edit2 /></Button>
                            <Button size="sm" variant="destructive" onClick={() => handleDelete("income", i.id)}><Trash2 /></Button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>}
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex justify-between items-center">
              <CardTitle className="flex items-center gap-2 text-base">Expenses</CardTitle>
              <Button onClick={() => handleOpenModal("expense")} className="flex items-center gap-2"><Plus /> Add</Button>
            </CardHeader>
            <CardContent>
              {expenses.length === 0 ? <p className="text-muted-foreground text-sm">No expenses recorded.</p> :
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-sm">
                    <thead>
                      <tr className="border-b border-border">
                        <th className="px-3 py-2">Category</th>
                        <th className="px-3 py-2">Amount</th>
                        <th className="px-3 py-2">Description</th>
                        <th className="px-3 py-2">Date</th>
                        <th className="px-3 py-2">Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {expenses.map(e => (
                        <tr key={e.id} className="border-b border-border hover:bg-gray-200/30">
                          <td className="px-3 py-2">{e.category}</td>
                          <td className="px-3 py-2">
                            <div className="flex flex-col">
                              <div>${e.amount.toFixed(2)}</div>
                              <div className="opacity-0 hover:opacity-100 transition-opacity">
                                <CurrencyTrace
                                  amount={e.amount}
                                  base={currencyBase}
                                  targets={currencyTargets.split(",")}
                                />
                              </div>
                            </div>
                          </td>
                          <td className="px-3 py-2">{e.description}</td>
                          <td className="px-3 py-2">{new Date(e.date).toLocaleDateString()}</td>
                          <td className="px-3 py-2 flex gap-2">
                            <Button size="sm" variant="outline" onClick={() => handleOpenModal("expense", e)}><Edit2 /></Button>
                            <Button size="sm" variant="destructive" onClick={() => handleDelete("expense", e.id)}><Trash2 /></Button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>}
            </CardContent>
          </Card>
        </div>

        {modalOpen && (
          <Modal onClose={handleCloseModal} title={editing ? `Edit ${modalType}` : `Add ${modalType}`}>
            <div className="space-y-4">
              {modalType === "expense" && (
                <Select value={form.category} onValueChange={handleCategoryChange}>
                  <SelectTrigger>
                    <SelectValue placeholder="Category" />
                  </SelectTrigger>
                  <SelectContent>
                    {expenseCategories.map(cat => (
                      <SelectItem key={cat} value={cat}>{cat}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              )}
              <Input name="amount" type="number" value={form.amount} placeholder="Amount" onChange={handleChange} />
              <Input name="description" value={form.description} placeholder="Description" onChange={handleChange} />
              <div className="flex justify-end gap-2">
                <Button variant="outline" onClick={handleCloseModal}>Cancel</Button>
                <Button onClick={handleSubmit}>{editing ? "Update" : "Create"}</Button>
              </div>
            </div>
          </Modal>
        )}
      </div>
    </DashboardLayout>
  );
};

export default BudgetTracking;
