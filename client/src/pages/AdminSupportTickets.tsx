import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import AdminDashboardLayout from "@/components/AdminDashboardLayout";
import { Eye, Trash2 } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import Modal from "@/components/ui/Modal";
import { getCookie } from "@/lib/cookie";

const API_BASE = import.meta.env.VITE_API_BASE_URL || "http://localhost:8000/api/v1";

// -------------------
// Types
// -------------------
interface Ticket {
  id: number;
  subject: string;
  description?: string;
  status: "Open" | "In Progress" | "Resolved" | "Closed";
  created_on: string;
  last_updated: string;
  user_id: number;
  user_name?: string;
}

const statusColors: Record<string, string> = {
  Open: "bg-red-600 text-white",
  "In Progress": "bg-yellow-500 text-black",
  Resolved: "bg-green-600 text-white",
  Closed: "bg-gray-500 text-white",
};

const AdminSupportTickets = () => {
  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [search, setSearch] = useState("");
  const [editingTicket, setEditingTicket] = useState<Ticket | null>(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [statusForm, setStatusForm] = useState<"Open" | "In Progress" | "Resolved" | "Closed">("Open");

  const token = getCookie("admin_token");
  const tokenType = getCookie("token_type") || "bearer";

  // -------------------
  // Fetch tickets
  // -------------------
  const fetchTickets = async () => {
    try {
      const res = await fetch(`${API_BASE}/admin/support-tickets/`, {
        headers: { Authorization: `${tokenType} ${token}` },
      });
      if (!res.ok) throw new Error("Failed to fetch tickets");
      const data = await res.json();
      setTickets(data);
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    fetchTickets();
  }, []);

  // -------------------
  // Filter tickets
  // -------------------
  const filteredTickets = tickets.filter((t) =>
    t.subject.toLowerCase().includes(search.toLowerCase())
  );

  // -------------------
  // Delete ticket
  // -------------------
  const handleDeleteTicket = async (id: number) => {
    if (!confirm("Are you sure you want to delete this ticket?")) return;
    try {
      const res = await fetch(`${API_BASE}/admin/support-tickets/${id}/`, {
        method: "DELETE",
        headers: { Authorization: `${tokenType} ${token}` },
      });
      if (!res.ok) throw new Error("Failed to delete ticket");
      fetchTickets();
    } catch (err) {
      console.error(err);
      alert("Failed to delete ticket");
    }
  };

  // -------------------
  // Modal handlers
  // -------------------
  const openModal = (ticket: Ticket) => {
    setEditingTicket(ticket);
    setStatusForm(ticket.status);
    setModalOpen(true);
  };
  const closeModal = () => setModalOpen(false);

  // -------------------
  // Update ticket status
  // -------------------
  const handleUpdateStatus = async () => {
    if (!editingTicket) return;
    try {
      const res = await fetch(`${API_BASE}/admin/support-tickets/${editingTicket.id}/`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `${tokenType} ${token}`,
        },
        body: JSON.stringify({ status: statusForm }),
      });
      if (!res.ok) throw new Error("Failed to update ticket");
      fetchTickets();
      closeModal();
    } catch (err) {
      console.error(err);
      alert("Failed to update ticket status");
    }
  };

  return (
    <AdminDashboardLayout>
      <div className="p-8 space-y-8">
        {/* Header */}
        <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }}>
          <h1 className="font-heading text-3xl font-bold mb-2">Support Tickets</h1>
          <p className="text-muted-foreground">View and manage all user support requests</p>
        </motion.div>

        {/* Search */}
        <Input
          placeholder="Search tickets..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="max-w-sm"
        />

        {/* Tickets Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm border border-border rounded-lg">
            <thead className="bg-muted/20">
              <tr>
                <th className="px-3 py-2">Subject</th>
                <th className="px-3 py-2">Status</th>
                <th className="px-3 py-2">Created On</th>
                <th className="px-3 py-2">User</th>
                <th className="px-3 py-2">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredTickets.length === 0 ? (
                <tr>
                  <td colSpan={5} className="text-center py-4 text-muted-foreground">
                    No tickets found.
                  </td>
                </tr>
              ) : (
                filteredTickets.map((t) => (
                  <tr key={t.id} className="border-b border-border hover:bg-muted">
                    <td className="px-3 py-2">{t.subject}</td>
                    <td className="px-3 py-2">
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${statusColors[t.status]}`}>
                        {t.status}
                      </span>
                    </td>
                    <td className="px-3 py-2">{t.created_on.split("T")[0]}</td>
                    <td className="px-3 py-2">{t.user_name || t.user_id}</td>
                    <td className="px-3 py-2 flex gap-2">
                      <TooltipProvider>
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <Button size="sm" variant="outline" onClick={() => openModal(t)}>
                              <Eye className="w-4 h-4" />
                            </Button>
                          </TooltipTrigger>
                          <TooltipContent>View / Edit Status</TooltipContent>
                        </Tooltip>
                      </TooltipProvider>
                      <Button size="sm" variant="destructive" onClick={() => handleDeleteTicket(t.id)}>
                        <Trash2 className="w-4 h-4" /> Delete
                      </Button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Modal for Updating Status */}
        {modalOpen && editingTicket && (
          <Modal onClose={closeModal} title="Update Ticket Status">
            <div className="space-y-4">
              <p><strong>Subject:</strong> {editingTicket.subject}</p>
              <p><strong>Description:</strong> {editingTicket.description || "No description provided"}</p>
              <p><strong>Status:</strong></p>
              <select
                value={statusForm}
                onChange={(e) => setStatusForm(e.target.value as Ticket["status"])}
                className="border border-border rounded-lg px-3 py-2 w-full bg-card text-foreground"
              >
                <option value="Open">Open</option>
                <option value="In Progress">In Progress</option>
                <option value="Resolved">Resolved</option>
                <option value="Closed">Closed</option>
              </select>

              <div className="flex justify-end gap-2">
                <Button variant="outline" onClick={closeModal}>Cancel</Button>
                <Button onClick={handleUpdateStatus}>Update Status</Button>
              </div>
            </div>
          </Modal>
        )}
      </div>
    </AdminDashboardLayout>
  );
};

export default AdminSupportTickets;
