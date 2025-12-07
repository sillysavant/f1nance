/* ## http://localhost:8080/admin/users */
import { useState, useEffect, ChangeEvent } from "react";
import { motion } from "framer-motion";
import AdminDashboardLayout from "@/components/AdminDashboardLayout";
import { Eye, Trash2, Plus } from "lucide-react";
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
interface User {
  id: number;
  email: string;
  username: string;
  full_name?: string;
  nationality: string;
  education: string;
  visa_status?: string;
  is_active: boolean;
  is_verified: boolean;
  is_superuser: boolean;
  created_at: string;
  updated_at: string;
}

const AdminManageUsers = () => {
  const [users, setUsers] = useState<User[]>([]);
  const [search, setSearch] = useState("");
  const [editingUser, setEditingUser] = useState<User | null>(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [createModalOpen, setCreateModalOpen] = useState(false);
  const [formData, setFormData] = useState<
  Partial<User & { password?: string; hashed_password?: string }>
    >({});

  const token = getCookie("admin_token");
  const tokenType = getCookie("token_type") || "bearer";

  // -------------------
  // Fetch users
  // -------------------
  const fetchUsers = async () => {
    try {
      const res = await fetch(`${API_BASE}/admin/users/`, {
        headers: { Authorization: `${tokenType} ${token}` },
      });
      if (!res.ok) throw new Error("Failed to fetch users");
      const data = await res.json();
      setUsers(data);
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  // -------------------
  // Filter users
  // -------------------
  const filteredUsers = users.filter(
    (u) =>
      u.username.toLowerCase().includes(search.toLowerCase()) ||
      u.email.toLowerCase().includes(search.toLowerCase()) ||
      (u.full_name?.toLowerCase().includes(search.toLowerCase()) ?? false)
  );

  // -------------------
  // Delete user
  // -------------------
  const handleDeleteUser = async (id: number) => {
    if (!confirm("Are you sure you want to delete this user?")) return;
    try {
      const res = await fetch(`${API_BASE}/admin/users/${id}/`, {
        method: "DELETE",
        headers: { Authorization: `${tokenType} ${token}` },
      });
      if (!res.ok) throw new Error("Failed to delete user");
      fetchUsers();
    } catch (err) {
      console.error(err);
      alert("Failed to delete user");
    }
  };

  // -------------------
  // Modal handlers
  // -------------------
  const openEditModal = (user: User) => {
    setEditingUser(user);
    setFormData(user);
    setModalOpen(true);
  };
  const closeEditModal = () => setModalOpen(false);

  const openCreateModal = () => {
    setFormData({});
    setCreateModalOpen(true);
  };
  const closeCreateModal = () => setCreateModalOpen(false);

  // -------------------
  // Update user
  // -------------------
  const handleUpdateUser = async () => {
    if (!editingUser) return;
    try {
      const payload = { ...formData };
      if (payload.password) payload.hashed_password = payload.password;

      const res = await fetch(`${API_BASE}/admin/users/${editingUser.id}/`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `${tokenType} ${token}`,
        },
        body: JSON.stringify(payload),
      });
      if (!res.ok) throw new Error("Failed to update user");
      fetchUsers();
      closeEditModal();
    } catch (err) {
      console.error(err);
      alert("Failed to update user");
    }
  };

  // -------------------
  // Create user
  // -------------------
  const handleCreateUser = async () => {
    try {
      const payload = { ...formData };
      if (payload.password) payload.hashed_password = payload.password;

      const res = await fetch(`${API_BASE}/admin/users/`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `${tokenType} ${token}`,
        },
        body: JSON.stringify(payload),
      });
      if (!res.ok) throw new Error("Failed to create user");
      fetchUsers();
      closeCreateModal();
    } catch (err) {
      console.error(err);
      alert("Failed to create user");
    }
  };

  // -------------------
  // Handle form changes
  // -------------------
  const handleChange = (key: keyof (User & { password?: string }), value: any) => {
    setFormData((prev) => ({ ...prev, [key]: value }));
  };

  return (
    <AdminDashboardLayout>
      <div className="p-8 space-y-8">
        {/* Header */}
        <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} className="flex justify-between items-center">
          <div>
            <h1 className="font-heading text-3xl font-bold mb-2">Manage Users</h1>
            <p className="text-muted-foreground">View, edit, and manage all registered users</p>
          </div>
          <Button variant="default" onClick={openCreateModal} className="flex items-center gap-2">
            <Plus className="w-4 h-4" /> Create User
          </Button>
        </motion.div>

        {/* Search */}
        <Input
          placeholder="Search users..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="max-w-sm"
        />

        {/* Users Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm border border-border rounded-lg">
            <thead className="bg-muted/20">
              <tr>
                <th className="px-3 py-2">Username</th>
                <th className="px-3 py-2">Full Name</th>
                <th className="px-3 py-2">Email</th>
                <th className="px-3 py-2">Nationality</th>
                <th className="px-3 py-2">Verified</th>
                <th className="px-3 py-2">Active</th>
                <th className="px-3 py-2">Admin</th>
                <th className="px-3 py-2">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredUsers.length === 0 ? (
                <tr>
                  <td colSpan={8} className="text-center py-4 text-muted-foreground">
                    No users found.
                  </td>
                </tr>
              ) : (
                filteredUsers.map((u) => (
                  <tr key={u.id} className="border-b border-border hover:bg-muted">
                    <td className="px-3 py-2">{u.username}</td>
                    <td className="px-3 py-2">{u.full_name || "-"}</td>
                    <td className="px-3 py-2">{u.email}</td>
                    <td className="px-3 py-2">{u.nationality}</td>
                    <td className="px-3 py-2">{u.is_verified ? "Yes" : "No"}</td>
                    <td className="px-3 py-2">{u.is_active ? "Yes" : "No"}</td>
                    <td className="px-3 py-2">{u.is_superuser ? "Yes" : "No"}</td>
                    <td className="px-3 py-2 flex gap-2">
                      <TooltipProvider>
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <Button size="sm" variant="outline" onClick={() => openEditModal(u)}>
                              <Eye className="w-4 h-4" />
                            </Button>
                          </TooltipTrigger>
                          <TooltipContent>View / Edit User</TooltipContent>
                        </Tooltip>
                      </TooltipProvider>
                      <Button size="sm" variant="destructive" onClick={() => handleDeleteUser(u.id)}>
                        <Trash2 className="w-4 h-4" /> Delete
                      </Button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Modal for Editing User */}
        {modalOpen && editingUser && (
          <Modal onClose={closeEditModal} title="Edit User">
            <div className="space-y-4">
              {["username", "full_name", "email", "nationality", "education", "visa_status"].map((field) => (
                <label key={field} className="flex flex-col">
                  {field.replace("_", " ").toUpperCase()}
                  <Input
                    value={(formData as any)[field] || ""}
                    onChange={(e) => handleChange(field as keyof (User & { password?: string }), e.target.value)}
                  />
                </label>
              ))}

              <div className="flex gap-4">
                <label className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    checked={formData.is_verified || false}
                    onChange={(e) => handleChange("is_verified", e.target.checked)}
                  />
                  Verified
                </label>
                <label className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    checked={formData.is_active || false}
                    onChange={(e) => handleChange("is_active", e.target.checked)}
                  />
                  Active
                </label>
                <label className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    checked={formData.is_superuser || false}
                    onChange={(e) => handleChange("is_superuser", e.target.checked)}
                  />
                  Admin
                </label>
              </div>

              <div className="flex justify-end gap-2">
                <Button variant="outline" onClick={closeEditModal}>Cancel</Button>
                <Button onClick={handleUpdateUser}>Update User</Button>
              </div>
            </div>
          </Modal>
        )}

        {/* Modal for Creating User */}
        {createModalOpen && (
          <Modal onClose={closeCreateModal} title="Create New User">
            <div className="space-y-4">
              {["username", "full_name", "email", "nationality", "education", "visa_status"].map((field) => (
                <label key={field} className="flex flex-col">
                  {field.replace("_", " ").toUpperCase()}
                  <Input
                    value={(formData as any)[field] || ""}
                    onChange={(e) => handleChange(field as keyof (User & { password?: string }), e.target.value)}
                  />
                </label>
              ))}

              <label className="flex flex-col">
                PASSWORD
                <Input
                  type="password"
                  value={formData.password || ""}
                  onChange={(e) => handleChange("password", e.target.value)}
                />
              </label>

              <div className="flex gap-4">
                <label className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    checked={formData.is_verified || false}
                    onChange={(e) => handleChange("is_verified", e.target.checked)}
                  />
                  Verified
                </label>
                <label className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    checked={formData.is_active ?? true}
                    onChange={(e) => handleChange("is_active", e.target.checked)}
                  />
                  Active
                </label>
                <label className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    checked={formData.is_superuser || false}
                    onChange={(e) => handleChange("is_superuser", e.target.checked)}
                  />
                  Admin
                </label>
              </div>

              <div className="flex justify-end gap-2">
                <Button variant="outline" onClick={closeCreateModal}>Cancel</Button>
                <Button onClick={handleCreateUser}>Create User</Button>
              </div>
            </div>
          </Modal>
        )}
      </div>
    </AdminDashboardLayout>
  );
};

export default AdminManageUsers;
