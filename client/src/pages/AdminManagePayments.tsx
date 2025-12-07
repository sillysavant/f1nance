import { useState, useEffect } from "react";
import AdminDashboardLayout from "@/components/AdminDashboardLayout";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { getCookie } from "@/lib/cookie";

const API_BASE = import.meta.env.VITE_API_BASE_URL || "http://localhost:8000/api/v1";

interface Payment {
  id: number;
  user_id: number;
  amount: number;
  status: string;
  refunded: boolean;
  refunded_at?: string;
}

const AdminManagePayments = () => {
  const [payments, setPayments] = useState<Payment[]>([]);
  const [processing, setProcessing] = useState<number | null>(null); // track which payment is being refunded
  const token = getCookie("admin_token");
  const tokenType = getCookie("token_type") || "bearer";

  const fetchPayments = async () => {
    try {
      const res = await fetch(`${API_BASE}/admin/support/payments`, {
        headers: { Authorization: `${tokenType} ${token}` },
      });
      if (!res.ok) throw new Error("Failed to fetch payments");
      setPayments(await res.json());
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    fetchPayments();
  }, []);

  const handleRefund = async (paymentId: number) => {
    try {
      setProcessing(paymentId); // start processing
      const res = await fetch(`${API_BASE}/admin/support/payments/${paymentId}/refund`, {
        method: "PATCH",
        headers: { Authorization: `${tokenType} ${token}` },
      });
      if (!res.ok) throw new Error("Failed to refund payment");

      const updatedPayment = await res.json();
      setPayments((prev) =>
        prev.map((p) => (p.id === paymentId ? updatedPayment : p))
      );
    } catch (err) {
      console.error(err);
      alert("Refund failed. See console for details.");
    } finally {
      setProcessing(null); // stop processing
    }
  };

  return (
    <AdminDashboardLayout>
      <div className="p-8">
        <h1 className="text-3xl font-bold mb-4">Manage Payments</h1>
        <Card>
          <CardHeader>
            <CardTitle>Payments</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <table className="w-full text-left">
                <thead>
                  <tr className="border-b border-border">
                    <th className="px-3 py-2">ID</th>
                    <th className="px-3 py-2">User ID</th>
                    <th className="px-3 py-2">Amount</th>
                    <th className="px-3 py-2">Status</th>
                    <th className="px-3 py-2">Refunded</th>
                    <th className="px-3 py-2">Refunded At</th>
                    <th className="px-3 py-2">Action</th>
                  </tr>
                </thead>
                <tbody>
                  {payments.map((p) => (
                    <tr key={p.id} className="border-b border-border">
                      <td className="px-3 py-2">{p.id}</td>
                      <td className="px-3 py-2">{p.user_id}</td>
                      <td className="px-3 py-2">{p.amount}</td>
                      <td className="px-3 py-2">{p.status}</td>
                      <td className="px-3 py-2">{p.refunded ? "Yes" : "No"}</td>
                      <td className="px-3 py-2">{p.refunded_at || "-"}</td>
                      <td className="px-3 py-2">
                        {!p.refunded && (
                          <Button
                            size="sm"
                            disabled={processing === p.id}
                            onClick={() => handleRefund(p.id)}
                          >
                            {processing === p.id ? "Processing..." : "Refund"}
                          </Button>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      </div>
    </AdminDashboardLayout>
  );
};

export default AdminManagePayments;
