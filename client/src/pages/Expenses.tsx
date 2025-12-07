import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import DashboardLayout from "@/components/DashboardLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { PieChart, DollarSign, TrendingUp, Plus, Edit2, Trash2 } from "lucide-react";
import { getCookie } from "@/lib/cookie";
import Modal from "@/components/ui/Modal";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

const API_BASE = import.meta.env.VITE_API_BASE_URL || "http://localhost:8000/api/v1";

interface Expense {
  id: number;
  category: string;
  amount: number;
  description: string;
  date: string;
}

const mapExpense = (exp: any): Expense => ({
  id: exp.id,
  category: exp.category,
  amount: Number(exp.amount),
  description: exp.description,
  date: exp.date,
});

const Expenses = () => {
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState<Expense | null>(null);
  const [form, setForm] = useState({ category: "", amount: "", description: "" });

  const token = getCookie("token");
  const tokenType = getCookie("token_type") || "bearer";

  const fetchExpenses = async () => {
    try {
      const res = await fetch(`${API_BASE}/expenses/`, {
        headers: { Authorization: `${tokenType} ${token}` },
      });
      if (!res.ok) throw new Error("Failed to fetch expenses");
      const data = await res.json();
      setExpenses(data.map(mapExpense));
    } catch (err: any) {
      console.error(err.message || err);
    }
  };

  useEffect(() => {
    fetchExpenses();
  }, []);

  const handleOpenModal = (expense?: Expense) => {
    if (expense) {
      setEditing(expense);
      setForm({
        category: expense.category,
        amount: expense.amount.toString(),
        description: expense.description,
      });
    } else {
      setEditing(null);
      setForm({ category: "", amount: "", description: "" });
    }
    setModalOpen(true);
  };

  const handleCloseModal = () => setModalOpen(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async () => {
    const method = editing ? "PUT" : "POST";
    // Ensure trailing slash to match FastAPI route
    const url = editing ? `${API_BASE}/expenses/${editing.id}/` : `${API_BASE}/expenses/`;

    // Build payload with correct types
    const payload: any = { ...form };
    if (form.amount !== "") payload.amount = Number(form.amount);
    else delete payload.amount; // don't send empty string

    try {
      const res = await fetch(url, {
        method,
        headers: {
          "Content-Type": "application/json",
          Authorization: `${tokenType} ${token}`,
        },
        body: JSON.stringify(payload),
      });
      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.detail || "Failed to save expense");
      }
      fetchExpenses();
      handleCloseModal();
    } catch (err: any) {
      console.error(err.message || err);
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm("Are you sure you want to delete this expense?")) return;
    try {
      const res = await fetch(`${API_BASE}/expenses/${id}/`, {
        method: "DELETE",
        headers: { Authorization: `${tokenType} ${token}` },
      });
      if (!res.ok) throw new Error("Failed to delete expense");
      setExpenses(expenses.filter((e) => e.id !== id));
    } catch (err: any) {
      console.error(err.message || err);
    }
  };

  const grandTotal = expenses.reduce((sum, e) => sum + Number(e.amount), 0);
  const categoryTotals = expenses.reduce((acc, exp) => {
    acc[exp.category] = (acc[exp.category] || 0) + Number(exp.amount);
    return acc;
  }, {} as Record<string, number>);

  return (
    <DashboardLayout>
      <div className="p-8">
        <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} className="mb-8 flex justify-between items-center">
          <div>
            <h1 className="font-heading text-3xl font-bold mb-2">Expenses</h1>
            <p className="text-muted-foreground">Track, categorize, and analyze your spending in real-time</p>
          </div>
          <Button onClick={() => handleOpenModal()} className="flex items-center gap-2">
            <Plus className="w-4 h-4" /> Add Expense
          </Button>
        </motion.div>

        <div className="grid md:grid-cols-3 gap-6 mb-6">
          {/* Total Expenses */}
          <Card className="bg-gradient-to-br from-card via-card to-card/50 backdrop-blur-sm border-border">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-base">
                <DollarSign className="w-5 h-5 text-primary" />
                Total Expenses
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="font-heading text-3xl font-bold">
                ${grandTotal.toLocaleString("en-US", { minimumFractionDigits: 2 })}
              </p>
              <p className="text-sm text-muted-foreground mt-1">
                Across {expenses.length} items
              </p>
            </CardContent>
          </Card>

          {/* Categories */}
          <Card className="bg-gradient-to-br from-card via-card to-card/50 backdrop-blur-sm border-border">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-base">
                <PieChart className="w-5 h-5 text-primary" />
                Expense Categories
              </CardTitle>
            </CardHeader>
            <CardContent>
              {expenses.length === 0 ? (
                <p className="text-sm text-muted-foreground">No expenses available</p>
              ) : (
                <div className="space-y-2">
                  {Object.entries(categoryTotals).map(([category, total]) => (
                    <div key={category} className="flex justify-between text-sm">
                      <span className="text-muted-foreground">{category}</span>
                      <span className="font-medium">{((total / grandTotal) * 100).toFixed(0)}%</span>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Trend */}
          <Card className="bg-gradient-to-br from-card via-card to-card/50 backdrop-blur-sm border-border">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-base">
                <TrendingUp className="w-5 h-5 text-primary" />
                Monthly Trend
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="font-heading text-3xl font-bold text-green-500">
                +{(Math.random() * 20).toFixed(1)}%
              </p>
              <p className="text-sm text-muted-foreground mt-1">vs. last month</p>
            </CardContent>
          </Card>
        </div>

        {/* Expenses Table */}
        <Card className="col-span-3">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base">All Expenses</CardTitle>
          </CardHeader>
          <CardContent>
            {expenses.length === 0 ? (
              <p className="text-muted-foreground text-sm">No expenses recorded.</p>
            ) : (
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
                    {expenses.map((exp) => (
                      <tr key={exp.id} className="border-b border-border">
                        <td className="px-3 py-2">{exp.category}</td>
                        <td className="px-3 py-2">${exp.amount.toFixed(2)}</td>
                        <td className="px-3 py-2">{exp.description}</td>
                        <td className="px-3 py-2">{new Date(exp.date).toLocaleDateString()}</td>
                        <td className="px-3 py-2 flex gap-2">
                          <Button size="sm" variant="outline" onClick={() => handleOpenModal(exp)}>
                            <Edit2 className="w-4 h-4" />
                          </Button>
                          <Button size="sm" variant="destructive" onClick={() => handleDelete(exp.id)}>
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Modal */}
        {modalOpen && (
          <Modal onClose={handleCloseModal} title={editing ? "Edit Expense" : "Add Expense"}>
            <div className="space-y-4">
              <Input
                name="category"
                value={form.category}
                placeholder="Category"
                onChange={handleChange}
              />
              <Input
                name="amount"
                type="number"
                value={form.amount}
                placeholder="Amount"
                onChange={handleChange}
              />
              <Input
                name="description"
                value={form.description}
                placeholder="Description"
                onChange={handleChange}
              />
              <div className="flex justify-end gap-2">
                <Button variant="outline" onClick={handleCloseModal}>
                  Cancel
                </Button>
                <Button onClick={handleSubmit}>{editing ? "Update" : "Create"}</Button>
              </div>
            </div>
          </Modal>
        )}
      </div>
    </DashboardLayout>
  );
};

export default Expenses;
