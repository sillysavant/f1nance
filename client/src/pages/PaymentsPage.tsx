import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import DashboardLayout from "@/components/DashboardLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { DollarSign, TrendingUp, Plus, Check, Edit2, Trash2, AlertCircle } from "lucide-react";
import { getCookie } from "@/lib/cookie";
import Modal from "@/components/ui/Modal";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

const API_BASE = import.meta.env.VITE_API_BASE_URL || "http://localhost:8000/api/v1";

interface Payment {
  id: number;
  amount: number;
  description: string;
  scheduled_date: string;
  status: "pending" | "done" | "due";
}

const mapPayment = (p: any): Payment => ({
  id: p.id,
  amount: Number(p.amount),
  description: p.description,
  scheduled_date: p.scheduled_date,
  status: p.status || "pending",
});

const PaymentsPage = () => {
  const [payments, setPayments] = useState<Payment[]>([]);
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState<Payment | null>(null);
  const [form, setForm] = useState({ amount: "", description: "", scheduled_date: "" });

  const token = getCookie("token");
  const tokenType = getCookie("token_type") || "bearer";

  // Fetch all payments
  const fetchPayments = async () => {
    try {
      const res = await fetch(`${API_BASE}/payments/`, {
        headers: { Authorization: `${tokenType} ${token}` },
      });
      if (!res.ok) throw new Error("Failed to fetch payments");
      const data = await res.json();
      const updated = data.map((p: any) => {
        const today = new Date();
        const scheduled = new Date(p.scheduled_date);
        if (p.status === "pending" && scheduled < today) p.status = "due";
        return mapPayment(p);
      });
      setPayments(updated);
    } catch (err: any) {
      console.error(err.message || err);
    }
  };

  useEffect(() => {
    fetchPayments();
  }, []);

  const handleOpenModal = (payment?: Payment) => {
    if (payment) {
      setEditing(payment);
      setForm({
        amount: payment.amount.toString(),
        description: payment.description,
        scheduled_date: payment.scheduled_date.split("T")[0],
      });
    } else {
      setEditing(null);
      setForm({ amount: "", description: "", scheduled_date: "" });
    }
    setModalOpen(true);
  };

  const handleCloseModal = () => setModalOpen(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async () => {
    const method = editing ? "PUT" : "POST";
    const url = editing ? `${API_BASE}/payments/${editing.id}/` : `${API_BASE}/payments/`;

    const payload: any = {
      ...form,
      amount: Number(form.amount),
    };

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
        throw new Error(errorData.detail || "Failed to save payment");
      }
      fetchPayments();
      handleCloseModal();
    } catch (err: any) {
      console.error(err.message || err);
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm("Are you sure you want to delete this payment?")) return;
    try {
      const res = await fetch(`${API_BASE}/payments/${id}/`, {
        method: "DELETE",
        headers: { Authorization: `${tokenType} ${token}` },
      });
      if (!res.ok) throw new Error("Failed to delete payment");
      setPayments(payments.filter((p) => p.id !== id));
    } catch (err: any) {
      console.error(err.message || err);
    }
  };

  const handleMarkDone = async (payment: Payment) => {
    try {
      const res = await fetch(`${API_BASE}/payments/${payment.id}/mark-done`, {  // <- note /mark-done
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `${tokenType} ${token}`,
        },
      });
      if (!res.ok) throw new Error("Failed to mark payment as done");
      fetchPayments();
    } catch (err: any) {
      console.error(err.message || err);
    }
  };
  

  const totalPayments = payments.reduce((sum, p) => sum + p.amount, 0);
  const totalDue = payments.filter((p) => p.status === "due").length;

  return (
    <DashboardLayout>
      <div className="p-8">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8 flex justify-between items-center"
        >
          <div>
            <h1 className="font-heading text-3xl font-bold mb-2">Payments</h1>
            <p className="text-muted-foreground">Manage upcoming and overdue payments</p>
          </div>
          <Button onClick={() => handleOpenModal()} className="flex items-center gap-2">
            <Plus className="w-4 h-4" /> Add Payment
          </Button>
        </motion.div>

        <div className="grid md:grid-cols-3 gap-6 mb-6">
          <Card className="bg-gradient-to-br from-card via-card to-card/50 backdrop-blur-sm border-border">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-base">
                <DollarSign className="w-5 h-5 text-primary" /> Total Payments
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="font-heading text-3xl font-bold">
                ${totalPayments.toLocaleString("en-US", { minimumFractionDigits: 2 })}
              </p>
              <p className="text-sm text-muted-foreground mt-1">
                Across {payments.length} payments
              </p>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-card via-card to-card/50 backdrop-blur-sm border-border">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-base">
                <AlertCircle className="w-5 h-5 text-red-500" /> Overdue
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="font-heading text-3xl font-bold text-red-500">{totalDue}</p>
              <p className="text-sm text-muted-foreground mt-1">Payments need attention</p>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-card via-card to-card/50 backdrop-blur-sm border-border">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-base">
                <TrendingUp className="w-5 h-5 text-primary" /> Trend
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

        <Card className="col-span-3">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base">All Payments</CardTitle>
          </CardHeader>
          <CardContent>
            {payments.length === 0 ? (
              <p className="text-muted-foreground text-sm">No payments recorded.</p>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-sm">
                  <thead>
                    <tr className="border-b border-border">
                      <th className="px-3 py-2">Amount</th>
                      <th className="px-3 py-2">Description</th>
                      <th className="px-3 py-2">Scheduled Date</th>
                      <th className="px-3 py-2">Status</th>
                      <th className="px-3 py-2">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {payments.map((p) => (
                      <tr key={p.id} className="border-b border-border">
                        <td className="px-3 py-2">${p.amount.toFixed(2)}</td>
                        <td className="px-3 py-2">{p.description}</td>
                        <td className="px-3 py-2">{new Date(p.scheduled_date).toLocaleDateString()}</td>
                        <td className="px-3 py-2 capitalize">
                          <span
                            className={`px-2 py-1 rounded text-sm font-medium ${
                              p.status === "done"
                                ? "bg-green-100 text-green-700"
                                : p.status === "due"
                                ? "bg-red-100 text-red-700"
                                : "bg-yellow-100 text-yellow-700"
                            }`}
                          >
                            {p.status}
                          </span>
                        </td>
                        <td className="px-3 py-2 flex flex-wrap gap-2">
                          {p.status !== "done" && (
                            <Button
                              size="sm"
                              variant="default"
                              onClick={() => handleMarkDone(p)}
                              className="flex items-center gap-1 bg-green-100 text-green-700 hover:bg-green-200"
                              title="Mark payment as done"
                            >
                              <Check className="w-4 h-4" /> Done
                            </Button>
                          )}
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleOpenModal(p)}
                            className="flex items-center gap-1"
                            title="Edit payment"
                          >
                            <Edit2 className="w-4 h-4" /> Edit
                          </Button>
                          <Button
                            size="sm"
                            variant="destructive"
                            onClick={() => handleDelete(p.id)}
                            className="flex items-center gap-1"
                            title="Delete payment"
                          >
                            <Trash2 className="w-4 h-4" /> Delete
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

        {modalOpen && (
          <Modal onClose={handleCloseModal} title={editing ? "Edit Payment" : "Add Payment"}>
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
              <Input
                name="scheduled_date"
                type="date"
                value={form.scheduled_date}
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

export default PaymentsPage;
