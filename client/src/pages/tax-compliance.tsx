import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import DashboardLayout from "@/components/DashboardLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { FileText, Download } from "lucide-react";
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

const TaxCompliance = () => {
  const [resources, setResources] = useState<Resource[]>([]);
  const [search, setSearch] = useState("");

  const token = getCookie("token");
  const tokenType = getCookie("token_type") || "bearer";

  // Fetch resources from backend
  const fetchResources = async () => {
    try {
      const res = await fetch(`${API_BASE}/tax-resources/`, {
        headers: {
          Authorization: `${tokenType} ${token}`,
        },
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
    } catch (e) {
      console.error(e);
    }
  };

  useEffect(() => {
    fetchResources();
  }, []);

  const filteredResources = resources.filter((r) =>
    r.title.toLowerCase().includes(search.toLowerCase())
  );

  // Download function (supports authenticated downloads)
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

  return (
    <DashboardLayout>
      <div className="p-8 space-y-8">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex justify-between items-center"
        >
          <div>
            <h1 className="font-heading text-3xl font-bold mb-2">Tax & Compliance</h1>
            <p className="text-muted-foreground">
              Access public tax guides and compliance resources for F-1 students
            </p>
          </div>
        </motion.div>

        {/* Search */}
        <Input
          placeholder="Search resources..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="max-w-sm"
        />

        {/* Resources Table */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <FileText className="w-5 h-5 text-primary" />
              Tax Resources
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
                      <th className="px-3 py-2">Download</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredResources.map((res) => (
                      <tr
                        key={res.id}
                        className={`border-b border-border ${
                          res.access === "Restricted" ? "opacity-50" : ""
                        }`}
                      >
                        <td className="px-3 py-2">{res.title}</td>
                        <td className="px-3 py-2">{res.type}</td>
                        <td className="px-3 py-2">
                          {res.access === "Public" && res.downloadUrl ? (
                            <Button
                              size="sm"
                              variant="outline"
                              className="flex items-center gap-1"
                              onClick={() => handleDownload(res)}
                            >
                              <Download className="w-4 h-4" /> Download
                            </Button>
                          ) : (
                            <TooltipProvider>
                              <Tooltip>
                                <TooltipTrigger asChild>
                                  <Button
                                    size="sm"
                                    variant="outline"
                                    disabled
                                    className="flex items-center gap-1"
                                  >
                                    <Download className="w-4 h-4" /> Download
                                  </Button>
                                </TooltipTrigger>
                                <TooltipContent>
                                  <p>Restricted: You do not have access to this resource</p>
                                </TooltipContent>
                              </Tooltip>
                            </TooltipProvider>
                          )}
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
    </DashboardLayout>
  );
};

export default TaxCompliance;
