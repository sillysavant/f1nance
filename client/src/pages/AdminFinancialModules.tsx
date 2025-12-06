// src/pages/AdminFinancialModules.tsx
import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import AdminDashboardLayout from "@/components/AdminDashboardLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { FileText, Download, Edit, Trash2, Plus } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { getCookie } from "@/lib/cookie";

const API_BASE = import.meta.env.VITE_API_BASE_URL || "http://localhost:8000/api/v1";

// Types
interface QuizQuestionOut {
  id: number;
  question: string;
  options: string[];
  answer: string;
}

interface SectionOut {
  id: number;
  title: string;
  content: string;
  lastUpdated?: string | null;
  reviewedBy?: string | null;
  region?: string | null;
  tags: string[];
  download_url?: string | null;
}

interface ModuleOut {
  id: number;
  user_id: number;
  title: string;
  sections: SectionOut[];
  quiz: QuizQuestionOut[];
}

export default function AdminFinancialModules() {
  const [modules, setModules] = useState<ModuleOut[]>([]);
  const [search, setSearch] = useState("");
  const [editingModule, setEditingModule] = useState<ModuleOut | null>(null);
  const [newModuleTitle, setNewModuleTitle] = useState("");
  const [editingSection, setEditingSection] = useState<SectionOut | null>(null);
  const [editingQuiz, setEditingQuiz] = useState<QuizQuestionOut | null>(null);

  const token = getCookie("admin_token");
  const tokenType = getCookie("admin_token_type") || "bearer";
  const authHeaders = token ? { Authorization: `${tokenType} ${token}` } : {};

  const fetchModules = async () => {
    try {
      const res = await fetch(`${API_BASE}/admin/financial-modules/`, {
        headers: { "Content-Type": "application/json", ...authHeaders },
      });
      if (!res.ok) throw new Error("Failed to fetch modules");
      const data = await res.json();
      setModules(data);
    } catch (err: any) {
      console.error(err);
      alert("Failed to load modules");
    }
  };

  useEffect(() => {
    fetchModules();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const filtered = modules.filter((m) =>
    m.title.toLowerCase().includes(search.toLowerCase())
  );

  // Create module
  const handleCreateModule = async () => {
    if (!newModuleTitle.trim()) return alert("Module title required");
    try {
      const res = await fetch(`${API_BASE}/admin/financial-modules/`, {
        method: "POST",
        headers: { "Content-Type": "application/json", ...authHeaders },
        body: JSON.stringify({ title: newModuleTitle }),
      });
      if (!res.ok) {
        const err = await res.json().catch(() => null);
        throw new Error(err?.detail || "Failed to create module");
      }
      setNewModuleTitle("");
      fetchModules();
    } catch (err: any) {
      console.error(err);
      alert(err.message || "Create failed");
    }
  };

  // Delete module
  const handleDeleteModule = async (id: number) => {
    if (!confirm("Delete module?")) return;
    try {
      const res = await fetch(`${API_BASE}/admin/financial-modules/${id}/`, {
        method: "DELETE",
        headers: { ...authHeaders },
      });
      if (res.status !== 204) throw new Error("Failed to delete");
      fetchModules();
    } catch (err) {
      console.error(err);
      alert("Delete failed");
    }
  };

  // Save module (update title)
  const handleSaveModuleTitle = async () => {
    if (!editingModule) return;
    try {
      const res = await fetch(`${API_BASE}/admin/financial-modules/${editingModule.id}/`, {
        method: "PUT",
        headers: { "Content-Type": "application/json", ...authHeaders },
        body: JSON.stringify({
          title: editingModule.title,
          // For simplicity, send sections/quiz as current state (backend will overwrite)
          sections: editingModule.sections.map((s) => ({
            title: s.title,
            content: s.content,
            last_updated: s.lastUpdated,
            reviewed_by: s.reviewedBy,
            region: s.region,
            tags: s.tags,
            download_url: s.download_url,
          })),
          quiz: editingModule.quiz.map((q) => ({
            question: q.question,
            options: q.options,
            answer: q.answer,
          })),
        }),
      });
      if (!res.ok) {
        const err = await res.json().catch(() => null);
        throw new Error(err?.detail || "Failed to update module");
      }
      setEditingModule(null);
      fetchModules();
    } catch (err: any) {
      console.error(err);
      alert(err.message || "Update failed");
    }
  };

  // Section handlers: add/edit/delete on the client and send full module update on save
  const handleAddSection = () => {
    if (!editingModule) return;
    const newSection: SectionOut = {
      id: Date.now(), // temp id client-side
      title: "New Section",
      content: "",
      lastUpdated: new Date().toISOString(),
      reviewedBy: "",
      region: "US",
      tags: [],
      download_url: "",
    };
    setEditingModule({ ...editingModule, sections: [...editingModule.sections, newSection] });
    setEditingSection(newSection);
  };

  const handleDeleteSection = (secId: number) => {
    if (!editingModule) return;
    if (!confirm("Delete section?")) return;
    setEditingModule({
      ...editingModule,
      sections: editingModule.sections.filter((s) => s.id !== secId),
    });
    setEditingSection(null);
  };

  const handleSectionChange = (patch: Partial<SectionOut>) => {
    if (!editingModule || !editingSection) return;
    const updated = { ...editingSection, ...patch };
    setEditingSection(updated);
    setEditingModule({
      ...editingModule,
      sections: editingModule.sections.map((s) => (s.id === updated.id ? updated : s)),
    });
  };

  // Quiz handlers
  const handleAddQuiz = () => {
    if (!editingModule) return;
    const newQuiz: QuizQuestionOut = { id: Date.now(), question: "New question", options: ["A", "B"], answer: "A" };
    setEditingModule({ ...editingModule, quiz: [...editingModule.quiz, newQuiz] });
    setEditingQuiz(newQuiz);
  };

  const handleDeleteQuiz = (qid: number) => {
    if (!editingModule) return;
    if (!confirm("Delete question?")) return;
    setEditingModule({
      ...editingModule,
      quiz: editingModule.quiz.filter((q) => q.id !== qid),
    });
    setEditingQuiz(null);
  };

  const handleQuizChange = (patch: Partial<QuizQuestionOut>) => {
    if (!editingModule || !editingQuiz) return;
    const updated = { ...editingQuiz, ...patch };
    setEditingQuiz(updated);
    setEditingModule({
      ...editingModule,
      quiz: editingModule.quiz.map((q) => (q.id === updated.id ? updated : q)),
    });
  };

  // Download section PDF (fixed for external URLs)
const handleDownload = (downloadUrl?: string, filename?: string) => {
    if (!downloadUrl) return alert("No download URL provided");
  
    // Open in a new tab (works for external URLs without CORS issues)
    const link = document.createElement("a");
    link.href = downloadUrl;
    link.target = "_blank"; // open in new tab
    link.download = filename || downloadUrl.split("/").pop() || "document.pdf"; // optional filename
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <AdminDashboardLayout>
      <div className="p-8 space-y-6">
        <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }}>
          <h1 className="font-heading text-3xl font-bold mb-2">Financial Modules (Admin)</h1>
          <p className="text-muted-foreground">Manage financial literacy modules, sections and quizzes</p>
        </motion.div>

        <div className="flex gap-4 items-center">
          <Input placeholder="Search modules..." value={search} onChange={(e) => setSearch(e.target.value)} className="max-w-sm" />
          <div className="flex gap-2">
            <Input placeholder="New module title" value={newModuleTitle} onChange={(e) => setNewModuleTitle(e.target.value)} />
            <Button onClick={handleCreateModule}><Plus className="w-4 h-4 mr-2" /> Create</Button>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {filtered.map((m) => (
            <Card key={m.id} className="cursor-pointer">
              <CardHeader className="flex items-center justify-between">
                <CardTitle>{m.title}</CardTitle>
                <div className="flex gap-2">
                  <Button size="sm" variant="outline" onClick={() => setEditingModule(m)}><Edit className="w-4 h-4" /> Edit</Button>
                  <Button size="sm" variant="destructive" onClick={() => handleDeleteModule(m.id)}><Trash2 className="w-4 h-4" /> Delete</Button>
                </div>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground mb-2">Sections: {m.sections.length} · Questions: {m.quiz.length}</p>

                <div className="space-y-2">
                  {m.sections.slice(0, 3).map((s) => (
                    <div key={s.id} className="p-2 rounded bg-muted/30 flex justify-between items-center">
                      <div>
                        <div className="font-medium">{s.title}</div>
                        <div className="text-xs text-muted-foreground">{s.reviewedBy || ""}</div>
                      </div>
                      <div className="flex gap-2">
                        {s.download_url && (
                          <Button size="sm" variant="outline" onClick={() => handleDownload(s.download_url, s.title)}><Download className="w-4 h-4" /></Button>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Editor modal-ish area (inline) */}
        {editingModule && (
          <Card className="mt-6">
            <CardHeader>
              <CardTitle>Edit Module</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <Input value={editingModule.title} onChange={(e) => setEditingModule({ ...editingModule, title: e.target.value })} />

              <div>
                <div className="flex items-center justify-between mb-2">
                  <h4 className="font-semibold">Sections</h4>
                  <div className="flex gap-2">
                    <Button size="sm" onClick={handleAddSection}>Add Section</Button>
                  </div>
                </div>

                <div className="space-y-2">
                  {editingModule.sections.map((s) => (
                    <div key={s.id} className="p-3 border rounded">
                      <div className="flex justify-between">
                        <Input value={s.title} onChange={(e) => {
                          const patched = { ...s, title: e.target.value };
                          setEditingModule({ ...editingModule, sections: editingModule.sections.map((x) => x.id === s.id ? patched : x) });
                        }} />
                        <div className="flex gap-2">
                          <Button size="sm" variant="outline" onClick={() => { setEditingSection(s); }}>Edit</Button>
                          <Button size="sm" variant="destructive" onClick={() => handleDeleteSection(s.id)}>Delete</Button>
                        </div>
                      </div>
                      <div className="text-xs text-muted-foreground mt-2">{s.download_url ? `Download URL: ${s.download_url}` : "No download URL"}</div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Section edit panel */}
              {editingSection && (
                <div className="p-4 border rounded bg-card">
                  <h5 className="font-semibold mb-2">Editing section: {editingSection.title}</h5>
                  <Input value={editingSection.title} onChange={(e) => handleSectionChange({ title: e.target.value })} placeholder="Section title" />
                  <Input value={editingSection.content} onChange={(e) => handleSectionChange({ content: e.target.value })} placeholder="Section content" />
                  <Input value={editingSection.reviewedBy || ""} onChange={(e) => handleSectionChange({ reviewedBy: e.target.value })} placeholder="Reviewed by" />
                  <Input value={editingSection.region || ""} onChange={(e) => handleSectionChange({ region: e.target.value })} placeholder="Region" />
                  <Input value={editingSection.tags?.join(",") || ""} onChange={(e) => handleSectionChange({ tags: e.target.value.split(",").map(t => t.trim()) })} placeholder="Tags (comma separated)" />
                  <Input value={editingSection.download_url || ""} onChange={(e) => handleSectionChange({ download_url: e.target.value })} placeholder="Download URL (http...)" />
                  <div className="flex gap-2 mt-2">
                    <Button onClick={() => setEditingSection(null)}>Close</Button>
                  </div>
                </div>
              )}

              {/* Quiz management */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <h4 className="font-semibold">Quiz Questions</h4>
                  <Button size="sm" onClick={handleAddQuiz}>Add Question</Button>
                </div>

                <div className="space-y-2">
                  {editingModule.quiz.map((q) => (
                    <div key={q.id} className="p-3 border rounded">
                      <Input value={q.question} onChange={(e) => {
                        const patched = { ...q, question: e.target.value };
                        setEditingModule({ ...editingModule, quiz: editingModule.quiz.map(x => x.id === q.id ? patched : x) });
                      }} />
                      <div className="flex gap-2 mt-2">
                        <Input value={q.options.join(",")} onChange={(e) => {
                          const patched = { ...q, options: e.target.value.split(",").map(s => s.trim()) };
                          setEditingModule({ ...editingModule, quiz: editingModule.quiz.map(x => x.id === q.id ? patched : x) });
                        }} placeholder="Options comma separated" />
                        <Input value={q.answer} onChange={(e) => {
                          const patched = { ...q, answer: e.target.value };
                          setEditingModule({ ...editingModule, quiz: editingModule.quiz.map(x => x.id === q.id ? patched : x) });
                        }} placeholder="Answer" />
                        <Button size="sm" variant="destructive" onClick={() => handleDeleteQuiz(q.id)}>Delete</Button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="flex gap-2">
                <Button onClick={handleSaveModuleTitle}>Save Module</Button>
                <Button variant="ghost" onClick={() => setEditingModule(null)}>Cancel</Button>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </AdminDashboardLayout>
  );
}
