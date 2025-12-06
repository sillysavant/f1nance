import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import DashboardLayout from "@/components/DashboardLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { DollarSign, TrendingUp, Plus, Edit2, Trash2 } from "lucide-react";
import { getCookie } from "@/lib/cookie";
import Modal from "@/components/ui/Modal";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

const API_BASE = import.meta.env.VITE_API_BASE_URL || "http://localhost:8000/api/v1";

interface Income {
  id: number;
  amount: number;
  description: string;
  date: string;
}

const mapIncome = (i: any): Income => ({
  id: i.id,
  amount: Number(i.amount),
  description: i.description,
  date: i.date,
});

const IncomePage = () => {
  const [incomes, setIncomes] = useState<Income[]>([]);
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState<Income | null>(null);
  const [form, setForm] = useState({ amount: "", description: "" });

  const token = getCookie("token");
  const tokenType = getCookie("token_type") || "bearer";

  const fetchIncomes = async () => {
    try {
      const res = await fetch(`${API_BASE}/income/`, {
        headers: { Authorization: `${tokenType} ${token}` },
      });
      if (!res.ok) throw new Error("Failed to fetch incomes");
      const data = await res.json();
      setIncomes(data.map(mapIncome));
    } catch (err: any) {
      console.error(err.message || err);
    }
  };

  useEffect(() => {
    fetchIncomes();
  }, []);

  const handleOpenModal = (income?: Income) => {
    if (income) {
      setEditing(income);
      setForm({
        amount: income.amount.toString(),
        description: income.description,
      });
    } else {
      setEditing(null);
      setForm({ amount: "", description: "" });
    }
    setModalOpen(true);
  };

  const handleCloseModal = () => setModalOpen(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async () => {
    const method = editing ? "PUT" : "POST";
    const url = editing ? `${API_BASE}/income/${editing.id}/` : `${API_BASE}/income/`;

    const payload: any = { ...form };
    if (form.amount !== "") payload.amount = Number(form.amount);
    else delete payload.amount;

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
        throw new Error(errorData.detail || "Failed to save income");
      }
      fetchIncomes();
      handleCloseModal();
    } catch (err: any) {
      console.error(err.message || err);
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm("Are you sure you want to delete this income?")) return;
    try {
      const res = await fetch(`${API_BASE}/income/${id}/`, {
        method: "DELETE",
        headers: { Authorization: `${tokenType} ${token}` },
      });
      if (!res.ok) throw new Error("Failed to delete income");
      setIncomes(incomes.filter((i) => i.id !== id));
    } catch (err: any) {
      console.error(err.message || err);
    }
  };

  const totalIncome = incomes.reduce((sum, i) => sum + Number(i.amount), 0);

  return (
    <DashboardLayout>
      <div className="p-8">
        <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} className="mb-8 flex justify-between items-center">
          <div>
            <h1 className="font-heading text-3xl font-bold mb-2">Income</h1>
            <p className="text-muted-foreground">Track and manage all sources of income</p>
          </div>
          <Button onClick={() => handleOpenModal()} className="flex items-center gap-2">
            <Plus className="w-4 h-4" /> Add Income
          </Button>
        </motion.div>

        <div className="grid md:grid-cols-3 gap-6 mb-6">
          {/* Total Income */}
          <Card className="bg-gradient-to-br from-card via-card to-card/50 backdrop-blur-sm border-border">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-base">
                <DollarSign className="w-5 h-5 text-primary" />
                Total Income
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="font-heading text-3xl font-bold">
                ${totalIncome.toLocaleString("en-US", { minimumFractionDigits: 2 })}
              </p>
              <p className="text-sm text-muted-foreground mt-1">
                Across {incomes.length} entries
              </p>
            </CardContent>
          </Card>

          {/* Trend (dummy placeholder) */}
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

        {/* Income Table */}
        <Card className="col-span-3">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base">All Income</CardTitle>
          </CardHeader>
          <CardContent>
            {incomes.length === 0 ? (
              <p className="text-muted-foreground text-sm">No income recorded.</p>
            ) : (
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
                    {incomes.map((i) => (
                      <tr key={i.id} className="border-b border-border">
                        <td className="px-3 py-2">${i.amount.toFixed(2)}</td>
                        <td className="px-3 py-2">{i.description}</td>
                        <td className="px-3 py-2">{new Date(i.date).toLocaleDateString()}</td>
                        <td className="px-3 py-2 flex gap-2">
                          <Button size="sm" variant="outline" onClick={() => handleOpenModal(i)}>
                            <Edit2 className="w-4 h-4" />
                          </Button>
                          <Button size="sm" variant="destructive" onClick={() => handleDelete(i.id)}>
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
          <Modal onClose={handleCloseModal} title={editing ? "Edit Income" : "Add Income"}>
            <div className="space-y-4">
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

export default IncomePage;
