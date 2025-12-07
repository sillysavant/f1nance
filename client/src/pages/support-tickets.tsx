import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import DashboardLayout from "@/components/DashboardLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { MessageSquare, Plus, Eye } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { Button } from "@/components/ui/button";
import Modal from "@/components/ui/Modal";
import { getCookie } from "@/lib/cookie";

const API_BASE = import.meta.env.VITE_API_BASE_URL || "http://localhost:8000/api/v1";

// Types
interface Ticket {
  id: number;
  subject: string;
  description?: string;
  status: "Open" | "In Progress" | "Resolved" | "Closed";
  created_on: string;
  last_updated: string;
}

const SupportTickets = () => {
  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("All");
  const [modalOpen, setModalOpen] = useState(false);
  const [viewModalOpen, setViewModalOpen] = useState(false);
  const [editingTicket, setEditingTicket] = useState<Ticket | null>(null);
  const [form, setForm] = useState({ subject: "", description: "", status: "Open" });

  const token = getCookie("token");
  const tokenType = getCookie("token_type") || "bearer";

  // Fetch tickets from backend
  const fetchTickets = async () => {
    try {
      const res = await fetch(`${API_BASE}/support-tickets/`, {
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

  // Filter tickets based on search and status
  const filteredTickets = tickets.filter(
    t =>
      t.subject.toLowerCase().includes(search.toLowerCase()) &&
      (statusFilter === "All" || t.status === statusFilter)
  );

  // Modal handlers
  const handleOpenCreateModal = () => {
    setEditingTicket(null);
    setForm({ subject: "", description: "", status: "Open" });
    setModalOpen(true);
  };
  const handleOpenViewModal = (ticket: Ticket) => {
    setEditingTicket(ticket);
    setViewModalOpen(true);
  };
  const handleCloseModal = () => setModalOpen(false);
  const handleCloseViewModal = () => setViewModalOpen(false);
  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) =>
    setForm({ ...form, [e.target.name]: e.target.value });

  // Create ticket
  const handleCreateTicket = async () => {
    try {
      const res = await fetch(`${API_BASE}/support-tickets/`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `${tokenType} ${token}`,
        },
        body: JSON.stringify(form),
      });
      if (!res.ok) throw new Error("Failed to create ticket");
      const newTicket = await res.json();
      setTickets([newTicket, ...tickets]);
      setModalOpen(false);
    } catch (err) {
      console.error(err);
    }
  };

  // Delete ticket
  const handleDeleteTicket = async (id: number) => {
    if (!confirm("Are you sure you want to delete this ticket?")) return;
    try {
      const res = await fetch(`${API_BASE}/support-tickets/${id}/`, {
        method: "DELETE",
        headers: { Authorization: `${tokenType} ${token}` },
      });
      if (!res.ok) throw new Error("Failed to delete ticket");
      setTickets(tickets.filter(t => t.id !== id));
    } catch (err) {
      console.error(err);
    }
  };

  // Status badge colors
  const statusColors: Record<string, string> = {
    Open: "bg-red-600 text-white",
    "In Progress": "bg-yellow-500 text-black",
    Resolved: "bg-green-600 text-white",
    Closed: "bg-gray-500 text-white",
  };

  return (
    <DashboardLayout>
      <div className="p-8 space-y-8">
        {/* Header + Controls */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4"
        >
          <div>
            <h1 className="font-heading text-3xl font-bold mb-1">Support & Operations</h1>
            <p className="text-muted-foreground">View and manage your submitted support requests</p>
          </div>

          <div className="flex flex-col md:flex-row gap-2 w-full md:w-auto">
            <Input
              placeholder="Search tickets..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="flex-1"
            />
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="border border-border rounded-lg px-3 py-2 text-sm text-foreground bg-card focus:outline-none focus:ring-2 focus:ring-primary"
            >
              <option value="All">All Status</option>
              <option value="Open">Open</option>
              <option value="In Progress">In Progress</option>
              <option value="Resolved">Resolved</option>
              <option value="Closed">Closed</option>
            </select>
            <Button onClick={handleOpenCreateModal} className="flex items-center gap-2">
              <Plus className="w-4 h-4" /> New Ticket
            </Button>
          </div>
        </motion.div>

        {/* Tickets Table */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <MessageSquare className="w-5 h-5 text-primary" /> My Support Tickets
            </CardTitle>
          </CardHeader>
          <CardContent>
            {filteredTickets.length === 0 ? (
              <p className="text-sm text-muted-foreground">No tickets found.</p>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-sm">
                  <thead>
                    <tr className="border-b border-border">
                      <th className="px-3 py-2">Subject</th>
                      <th className="px-3 py-2">Status</th>
                      <th className="px-3 py-2">Created On</th>
                      <th className="px-3 py-2">Last Updated</th>
                      <th className="px-3 py-2">Action</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredTickets.map((ticket) => (
                      <tr key={ticket.id} className="border-b border-border hover:bg-muted">
                        <td className="px-3 py-2">{ticket.subject}</td>
                        <td className="px-3 py-2">
                          <span className={`px-2 py-1 rounded-full text-xs font-medium ${statusColors[ticket.status]}`}>
                            {ticket.status}
                          </span>
                        </td>
                        <td className="px-3 py-2">{ticket.created_on.split("T")[0]}</td>
                        <td className="px-3 py-2">{ticket.last_updated.split("T")[0]}</td>
                        <td className="px-3 py-2 flex gap-2">
                          <TooltipProvider>
                            <Tooltip>
                              <TooltipTrigger asChild>
                                <Button size="sm" variant="outline" onClick={() => handleOpenViewModal(ticket)}>
                                  <Eye className="w-4 h-4" />
                                </Button>
                              </TooltipTrigger>
                              <TooltipContent><p>View details of your ticket</p></TooltipContent>
                            </Tooltip>
                          </TooltipProvider>
                          <Button size="sm" variant="destructive" onClick={() => handleDeleteTicket(ticket.id)}>
                            Delete
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

        {/* Create Ticket Modal */}
        {modalOpen && (
          <Modal onClose={handleCloseModal} title="Create New Ticket">
            <div className="space-y-4">
              <div>
                <Input
                  name="subject"
                  value={form.subject}
                  placeholder="Subject"
                  onChange={handleChange}
                />
                {!form.subject.trim() && (
                  <p className="text-red-600 text-xs mt-1">Subject is required.</p>
                )}
              </div>

              <div>
                <textarea
                  name="description"
                  value={form.description}
                  placeholder="Description (min 20 characters)"
                  className="w-full border border-border rounded-lg p-2 bg-card text-foreground placeholder:text-muted-foreground"
                  onChange={handleChange}
                />
                {form.description.trim().length < 20 && (
                  <p className="text-red-600 text-xs mt-1">
                    Description must be at least 20 characters.
                  </p>
                )}
              </div>

              <div className="flex justify-end gap-2">
                <Button variant="outline" onClick={handleCloseModal}>Cancel</Button>
                <Button
                  onClick={handleCreateTicket}
                  disabled={!form.subject.trim() || form.description.trim().length < 20}
                >
                  Submit
                </Button>
              </div>
            </div>
          </Modal>
        )}

        {/* View Ticket Modal */}
        {viewModalOpen && editingTicket && (
          <Modal onClose={handleCloseViewModal} title="Ticket Details">
            <div className="space-y-2">
              <p><strong>Subject:</strong> {editingTicket.subject}</p>
              <p><strong>Status:</strong> {editingTicket.status}</p>
              <p><strong>Created On:</strong> {editingTicket.created_on.split("T")[0]}</p>
              <p><strong>Last Updated:</strong> {editingTicket.last_updated.split("T")[0]}</p>
              <p><strong>Description:</strong> {editingTicket.description || "No details provided."}</p>
              <div className="flex justify-end">
                <Button variant="outline" onClick={handleCloseViewModal}>Close</Button>
              </div>
            </div>
          </Modal>
        )}
      </div>
    </DashboardLayout>
  );
};

export default SupportTickets;
