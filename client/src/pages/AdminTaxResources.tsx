/* ## http://localhost:8080/admin/tax-resources */
import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import AdminDashboardLayout from "@/components/AdminDashboardLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { FileText, Download, Edit, Trash2, Plus } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { getCookie } from "@/lib/cookie";

const API_BASE = import.meta.env.VITE_API_BASE_URL || "http://localhost:8000/api/v1";

// Types
interface Resource {
  id: number;
  title: string;
  type: string;
  access: "Public" | "Restricted";
  downloadUrl?: string;
}

const AdminTaxResources = () => {
  const [resources, setResources] = useState<Resource[]>([]);
  const [search, setSearch] = useState("");
  const [newResource, setNewResource] = useState<Resource>({
    id: 0,
    title: "",
    type: "",
    access: "Public",
    downloadUrl: "",
  });

  const token = getCookie("token");
  const tokenType = getCookie("token_type") || "bearer";

  // Fetch resources
  const fetchResources = async () => {
    try {
      const res = await fetch(`${API_BASE}/tax-resources/`, {
        headers: { Authorization: `${tokenType} ${token}` },
      });
      if (!res.ok) throw new Error("Failed to fetch resources");
      const data = await res.json();
      setResources(
        data.map((r: any) => ({
          id: r.id,
          title: r.title,
          type: r.type,
          access: r.access,
          downloadUrl: r.download_url,
        }))
      );
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    fetchResources();
  }, []);

  const filteredResources = resources.filter((r) =>
    r.title.toLowerCase().includes(search.toLowerCase())
  );

  // Download
  const handleDownload = async (res: Resource) => {
    if (!res.downloadUrl) return;
    try {
      const response = await fetch(res.downloadUrl, {
        headers: { Authorization: `${tokenType} ${token}` },
      });
      if (!response.ok) throw new Error("Download failed");
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = res.title;
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);
    } catch (err) {
      console.error(err);
      alert("Failed to download resource");
    }
  };

  // Create / Update
  const handleSave = async () => {
    try {
      const method = newResource.id ? "PUT" : "POST";
      const url = newResource.id
        ? `${API_BASE}/tax-resources/${newResource.id}/`
        : `${API_BASE}/tax-resources/`;

      const res = await fetch(url, {
        method,
        headers: {
          "Content-Type": "application/json",
          Authorization: `${tokenType} ${token}`,
        },
        body: JSON.stringify({
          title: newResource.title,
          type: newResource.type,
          access: newResource.access,
          download_url: newResource.downloadUrl,
        }),
      });

      if (!res.ok) throw new Error("Failed to save resource");
      setNewResource({ id: 0, title: "", type: "", access: "Public", downloadUrl: "" });
      fetchResources();
    } catch (err) {
      console.error(err);
      alert("Failed to save resource");
    }
  };

  // Delete
  const handleDelete = async (id: number) => {
    if (!confirm("Are you sure you want to delete this resource?")) return;
    try {
      const res = await fetch(`${API_BASE}/tax-resources/${id}/`, {
        method: "DELETE",
        headers: { Authorization: `${tokenType} ${token}` },
      });
      if (!res.ok) throw new Error("Failed to delete resource");
      fetchResources();
    } catch (err) {
      console.error(err);
      alert("Failed to delete resource");
    }
  };

  return (
    <AdminDashboardLayout>
      <div className="p-8 space-y-8">
        {/* Header */}
        <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }}>
          <h1 className="font-heading text-3xl font-bold mb-2">Tax & Compliance</h1>
          <p className="text-muted-foreground">Manage tax guides and compliance resources</p>
        </motion.div>

        {/* Search */}
        <Input
          placeholder="Search resources..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="max-w-sm"
        />

        {/* New Resource Form */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Plus className="w-5 h-5 text-primary" /> {newResource.id ? "Edit Resource" : "Add Resource"}
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <Input
              placeholder="Title"
              value={newResource.title}
              onChange={(e) => setNewResource({ ...newResource, title: e.target.value })}
            />
            <Input
              placeholder="Type (e.g., PDF, Guide)"
              value={newResource.type}
              onChange={(e) => setNewResource({ ...newResource, type: e.target.value })}
            />
            <Input
              placeholder="Download URL"
              value={newResource.downloadUrl}
              onChange={(e) => setNewResource({ ...newResource, downloadUrl: e.target.value })}
            />
            <select
              value={newResource.access}
              onChange={(e) =>
                setNewResource({ ...newResource, access: e.target.value as "Public" | "Restricted" })
              }
              className="border rounded p-2 bg-card text-foreground"
            >
              <option value="Public">Public</option>
              <option value="Restricted">Restricted</option>
            </select>
            <Button onClick={handleSave}>{newResource.id ? "Update" : "Create"}</Button>
          </CardContent>
        </Card>

        {/* Resources Table */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <FileText className="w-5 h-5 text-primary" /> Existing Resources
            </CardTitle>
          </CardHeader>
          <CardContent>
            {filteredResources.length === 0 ? (
              <p className="text-sm text-muted-foreground">No resources found.</p>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-sm">
                  <thead>
                    <tr className="border-b border-border">
                      <th className="px-3 py-2">Title</th>
                      <th className="px-3 py-2">Type</th>
                      <th className="px-3 py-2">Access</th>
                      <th className="px-3 py-2">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredResources.map((res) => (
                      <tr key={res.id} className="border-b border-border">
                        <td className="px-3 py-2">{res.title}</td>
                        <td className="px-3 py-2">{res.type}</td>
                        <td className="px-3 py-2">{res.access}</td>
                        <td className="px-3 py-2 flex gap-2">
                          {res.downloadUrl && (
                            <Button
                              size="sm"
                              variant="outline"
                              className="flex items-center gap-1"
                              onClick={() => handleDownload(res)}
                            >
                              <Download className="w-4 h-4" /> Download
                            </Button>
                          )}
                          <Button
                            size="sm"
                            variant="outline"
                            className="flex items-center gap-1"
                            onClick={() => setNewResource(res)}
                          >
                            <Edit className="w-4 h-4" /> Edit
                          </Button>
                          <Button
                            size="sm"
                            variant="destructive"
                            className="flex items-center gap-1"
                            onClick={() => handleDelete(res.id)}
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
      </div>
    </AdminDashboardLayout>
  );
};

export default AdminTaxResources;
