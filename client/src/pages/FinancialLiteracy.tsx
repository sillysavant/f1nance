import { useState, useEffect } from "react";
import DashboardLayout from "@/components/DashboardLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { getCookie } from "@/lib/cookie";

const API_BASE = import.meta.env.VITE_API_BASE_URL || "http://localhost:8000/api/v1";

// ============================
// Interfaces
// ============================
interface Section {
  id: number;
  title: string;
  content: string;
  lastUpdated: string;
  reviewedBy: string;
  region: string;
  tags: string[];
  downloadUrl?: string; // <-- reference material
}

interface QuizQuestion {
  id: number;
  question: string;
  options: string[];
  answer: string;
}

interface Module {
  id: number;
  title: string;
  sections: Section[];
  quiz: QuizQuestion[];
}

// ============================
// Helpers
// ============================
const isOutdated = (dateStr: string) => {
  const date = new Date(dateStr);
  const now = new Date();
  const diffMonths =
    (now.getFullYear() - date.getFullYear()) * 12 +
    (now.getMonth() - date.getMonth());
  return diffMonths >= 12;
};

// ============================
// Download Helper
// ============================
const handleDownload = (downloadUrl?: string) => {
  if (!downloadUrl) return alert("No download URL provided");
  const link = document.createElement("a");
  link.href = downloadUrl;
  link.target = "_blank";
  link.download = downloadUrl.split("/").pop() || "document.pdf";
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
};

// ============================
// Main Component
// ============================
export default function FinancialLiteracy() {
  const [modules, setModules] = useState<Module[]>([]);
  const [selectedModule, setSelectedModule] = useState<Module | null>(null);
  const [selectedSection, setSelectedSection] = useState<Section | null>(null);
  const [searchTag, setSearchTag] = useState("");
  const [answers, setAnswers] = useState<Record<number, string>>({}); // questionId -> answer
  const [sectionScore, setSectionScore] = useState<number | null>(null);

  const token = getCookie("token");
  const tokenType = getCookie("token_type") || "bearer";

  // ============================
  // Fetch Modules from API
  // ============================
  const fetchModules = async () => {
    try {
      const res = await fetch(`${API_BASE}/financial-modules/`, {
        headers: { Authorization: `${tokenType} ${token}` },
      });
      if (!res.ok) throw new Error("Failed to fetch modules");
      const data = await res.json();
      setModules(data);
    } catch (err: any) {
      console.error(err.message || err);
    }
  };

  useEffect(() => {
    fetchModules();
  }, []);

  // ============================
  // Quiz Handlers
  // ============================
  const handleAnswer = (questionId: number, selected: string) => {
    setAnswers(prev => ({ ...prev, [questionId]: selected }));
  };

  const calculateSectionScore = () => {
    if (!selectedSection || !selectedModule) return;
    const sectionQuestions = selectedModule.quiz.filter(q =>
      selectedModule.sections.some(s => s.id === selectedSection.id)
    );

    let correct = sectionQuestions.reduce((acc, q) => {
      return acc + (answers[q.id] === q.answer ? 1 : 0);
    }, 0);

    setSectionScore(correct);
  };

  // ============================
  // Filtered Sections
  // ============================
  const filteredSections = selectedModule
    ? selectedModule.sections.filter(s =>
        searchTag.trim() ? s.tags.includes(searchTag.trim()) : true
      )
    : [];

  // ============================
  // Render
  // ============================
  return (
    <DashboardLayout>
      <div className="p-6 space-y-6">
        {/* Tag Search */}
        <div className="flex gap-4 items-center">
          <Input
            placeholder="Filter by CPT, OPT, Residency, International..."
            value={searchTag}
            onChange={(e) => setSearchTag(e.target.value)}
            className="max-w-sm"
          />
          <Button variant="outline" onClick={() => setSearchTag("")}>
            Clear
          </Button>
        </div>

        {/* Module List */}
        {!selectedModule && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {modules.map((module) => (
              <Card
                key={module.id}
                className="cursor-pointer hover:bg-accent"
                onClick={() => setSelectedModule(module)}
              >
                <CardHeader>
                  <CardTitle>{module.title}</CardTitle>
                </CardHeader>
              </Card>
            ))}
          </div>
        )}

        {/* Section List */}
        {selectedModule && !selectedSection && (
          <>
            <Button variant="outline" onClick={() => setSelectedModule(null)}>
              Back
            </Button>

            <h2 className="text-2xl font-bold mt-4">{selectedModule.title}</h2>

            <div className="grid grid-cols-1 gap-4 mt-4">
              {filteredSections.map((section) => (
                <Card
                  key={section.id}
                  className="cursor-pointer hover:bg-accent"
                  onClick={() => setSelectedSection(section)}
                >
                  <CardHeader>
                    <CardTitle>{section.title}</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-xs text-muted-foreground mt-2">
                      Last updated: {new Date(section.lastUpdated).toLocaleDateString()}
                    </p>
                    <p className="text-xs mt-1">
                      Reviewed by: <span className="font-semibold">{section.reviewedBy || "N/A"}</span>
                    </p>

                    {section.region !== "US" && (
                      <p className="text-xs text-yellow-600 mt-1">
                        ⚠️ Region not covered for your profile
                      </p>
                    )}

                    {isOutdated(section.lastUpdated) && (
                      <p className="text-xs text-red-600 mt-1">
                        ⚠️ This section may be outdated
                      </p>
                    )}

                    <div className="flex flex-col gap-2 mt-3">
                      <div className="flex flex-wrap gap-2">
                        {section.tags.map((tag) => (
                          <span
                            key={tag}
                            className="px-2 py-1 bg-secondary rounded text-xs cursor-pointer hover:bg-primary hover:text-white"
                            onClick={() => setSearchTag(tag)}
                          >
                            {tag}
                          </span>
                        ))}
                      </div>

  
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </>
        )}

        {/* Section Details + Quiz */}
        {selectedSection && (
          <>
            <Button variant="outline" onClick={() => setSelectedSection(null)}>
              Back
            </Button>

            <Card className="mt-4">
              <CardHeader>
                <CardTitle>{selectedSection.title}</CardTitle>
              </CardHeader>
              <CardContent>
                <p>{selectedSection.content}</p>
                <p className="text-xs text-muted-foreground mt-3">
                  Last updated: {new Date(selectedSection.lastUpdated).toLocaleDateString()}
                </p>
                <p className="text-xs mt-1">
                  Reviewed by: <span className="font-semibold">{selectedSection.reviewedBy || "N/A"}</span>
                </p>

                {selectedSection.region !== "US" && (
                  <p className="text-xs text-yellow-600 mt-1">
                    ⚠️ Region not covered for your profile
                  </p>
                )}

                {isOutdated(selectedSection.lastUpdated) && (
                  <p className="text-xs text-red-600 mt-1">
                    ⚠️ This section may be outdated
                  </p>
                )}

                {/* Always show button with tooltip if disabled */}
                <Button
                  size="sm"
                  variant="outline"
                  className="mt-2"
                  onClick={() => handleDownload(selectedSection.downloadUrl)}
                  disabled={!selectedSection.downloadUrl}
                  title={selectedSection.downloadUrl ? "" : "No reference material available"}
                >
                  Click to Read / Download Reference Material
                </Button>
              </CardContent>
            </Card>

            {/* Quiz */}
            <div className="mt-6">
              <h3 className="text-xl font-semibold mb-4">Quiz</h3>

              {selectedModule.quiz
                .filter(q => selectedModule.sections.some(s => s.id === selectedSection.id))
                .map((q) => (
                  <Card key={q.id} className="mb-4">
                    <CardHeader>
                      <CardTitle>{q.question}</CardTitle>
                    </CardHeader>
                    <CardContent>
                      {q.options.map((opt) => (
                        <label key={opt} className="flex items-center space-x-2 mb-2">
                          <input
                            type="radio"
                            name={`question-${q.id}`}
                            value={opt}
                            checked={answers[q.id] === opt}
                            onChange={() => handleAnswer(q.id, opt)}
                          />
                          <span>{opt}</span>
                        </label>
                      ))}
                    </CardContent>
                  </Card>
                ))}

              <Button onClick={calculateSectionScore}>Submit Quiz</Button>

              {sectionScore !== null && (
                <p className="mt-4 text-lg font-bold">
                  Your score: {sectionScore}/{selectedModule.quiz.filter(q => selectedModule.sections.some(s => s.id === selectedSection.id)).length}
                </p>
              )}
            </div>
          </>
        )}
      </div>
    </DashboardLayout>
  );
}
