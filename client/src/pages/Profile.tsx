import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useUser } from "@/hooks/use-user";
import DashboardLayout from "@/components/DashboardLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useToast } from "@/hooks/use-toast";
import { useNavigate } from "react-router-dom";
import {
  FileText,
  Trash2,
  Eye,
  PlusCircle,
  Building2,
  TrendingUp,
  PieChart,
  DollarSign
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { updateUserProfile } from "@/lib/authApi";
import { getCookie } from "@/lib/cookie";

const API_BASE = import.meta.env.VITE_API_BASE_URL || "http://localhost:8000/api/v1";

interface Document {
  id: number;
  file_name: string;
  document_type: string;
  tags: string;
  uploaded_at: string;
  file_url?: string; // URL for inline view/download
}

interface BankAccount {
  id: number;
  name: string;
  type: string;
  lastSync: string;
  balance: number;
  accountNumber: string;
}

interface Expense {
  id: number;
  category: string;
  amount: number;
  description: string;
  date: string;
}

const mapBankAccount = (acc: any): BankAccount => ({
  id: acc.id,
  name: acc.name,
  type: acc.type,
  accountNumber: acc.account_number,
  balance: acc.balance,
  lastSync: acc.last_sync,
});

const mapExpense = (exp: any): Expense => ({
  id: exp.id,
  category: exp.category,
  amount: exp.amount,
  description: exp.description,
  date: exp.date,
});

const Profile = () => {
  const { user, refreshUser } = useUser();
  const [name, setName] = useState(user?.full_name || "");
  const [email, setEmail] = useState(user?.email || "");
  const [school, setSchool] = useState(user?.education || "");
  const [country, setCountry] = useState(user?.nationality || "");
  const [documents, setDocuments] = useState<Document[]>([]);
  const [viewingDoc, setViewingDoc] = useState<Document | null>(null); // For modal
  const { toast } = useToast();
  const navigate = useNavigate();

  const [bankAccounts, setBankAccounts] = useState<BankAccount[]>([]);
  const totalBalance = bankAccounts.reduce((sum, acc) => sum + acc.balance, 0);

  // Modal state
const [showLinkBank, setShowLinkBank] = useState(false);
const [linkMethod, setLinkMethod] = useState<"manual" | "automatic">("manual");

// Manual bank input
const [manualBank, setManualBank] = useState({
  name: "",
  type: "Checking",
  accountNumber: "",
  balance: 0,
});

const [expenses, setExpenses] = useState<Expense[]>([]);

  useEffect(() => {
    if (user) {
      setName(user.full_name);
      setEmail(user.email);
      setSchool(user.education || "");
      setCountry(user.nationality || "");
    }
  }, [user]);

  useEffect(() => {
    if (!user) return;
  
    const token = getCookie("token");
    const tokenType = getCookie("token_type") || "bearer";
  
    const fetchDocuments = async () => {
      try {
        const res = await fetch(`${API_BASE}/documents/`, {
          headers: { Authorization: `${tokenType} ${token}` },
        });
        if (!res.ok) throw new Error("Failed to fetch documents");
        const data: Document[] = await res.json();
  
        // ✅ Set file_url for download/view
        const docsWithUrls = data.map((doc) => ({
          ...doc,
          file_url: `${API_BASE}/documents/download/${doc.id}`, // remove trailing slash
        }));
  
        setDocuments(docsWithUrls);
      } catch (err: any) {
        toast({
          title: "Error",
          description: err.message || "Could not load documents",
          variant: "destructive",
        });
      }
    };
  
    fetchDocuments();
  }, [user]);
  

  useEffect(() => {
    if (!user) return;
  
    const token = getCookie("token");
    const tokenType = getCookie("token_type") || "bearer";
  
    const fetchBankAccounts = async () => {
      try {
        const res = await fetch(`${API_BASE}/bank-accounts/`, {
          headers: { Authorization: `${tokenType} ${token}` },
        });
        if (!res.ok) throw new Error("Failed to fetch bank accounts");
        const data: any[] = await res.json();
  
        setBankAccounts(data.map(mapBankAccount));
      } catch (err: any) {
        toast({
          title: "Error",
          description: err.message || "Could not load bank accounts",
          variant: "destructive",
        });
      }
    };
  
    fetchBankAccounts();
  }, [user]);
  
  
  useEffect(() => {
    if (!user) return;
  
    const token = getCookie("token");
    const tokenType = getCookie("token_type") || "bearer";
  
    const fetchExpenses = async () => {
      try {
        const res = await fetch(`${API_BASE}/expenses/`, {
          headers: { Authorization: `${tokenType} ${token}` },
        });
        if (!res.ok) throw new Error("Failed to fetch expenses");
  
        const data: any[] = await res.json();
        setExpenses(data.map(mapExpense)); // dynamic mapping
      } catch (err: any) {
        toast({
          title: "Error",
          description: err.message || "Could not load expenses",
          variant: "destructive",
        });
      }
    };
  
    fetchExpenses();
  }, [user]);

  const handleSave = async () => {
    try {
      await updateUserProfile({
        full_name: name,
        education: school,
        nationality: country,
        visa_status: user?.visa_status,
      });
      toast({
        title: "Profile updated",
        description: "Your profile has been successfully updated.",
      });
      refreshUser?.();
    } catch (err: any) {
      toast({
        title: "Update failed",
        description: err?.message || "Something went wrong.",
      });
    }
  };

  const handleLogout = () => {
    toast({
      title: "Logged out",
      description: "You've been successfully logged out.",
    });
    navigate("/");
  };

  const deleteDocument = async (docId: number) => {
    if (!confirm("Are you sure you want to delete this document?")) return;
  
    try {
      const token = getCookie("token");
      const tokenType = getCookie("token_type") || "bearer";
  
      const res = await fetch(`${API_BASE}/documents/${docId}/`, {
        method: "DELETE",
        headers: { Authorization: `${tokenType} ${token}` },
      });
  
      if (!res.ok) throw new Error("Failed to delete document");
  
      setDocuments((prev) => prev.filter((doc) => doc.id !== docId));
      toast({ title: "Deleted", description: "Document deleted successfully." });
    } catch (err: any) {
      toast({ title: "Delete failed", description: err?.message || "Something went wrong.", variant: "destructive" });
    }
  };

  const downloadDocument = async (doc: Document) => {
    try {
      const token = getCookie("token");
      const tokenType = getCookie("token_type") || "bearer";
  
      const res = await fetch(doc.file_url!, {
        headers: { Authorization: `${tokenType} ${token}` },
      });
  
      if (!res.ok) throw new Error("Failed to download document");
  
      const blob = await res.blob();
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.setAttribute("download", doc.file_name);
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);
    } catch (err: any) {
      toast({
        title: "Download failed",
        description: err?.message || "Could not download document",
        variant: "destructive",
      });
    }
  };
  

  return (
    <DashboardLayout>
      <div className="p-8 max-w-6xl">
        <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} className="mb-8">
          <h1 className="font-heading text-3xl font-bold mb-2">Profile Settings</h1>
          <p className="text-muted-foreground">Manage your account information, documents, and bank connections</p>
        </motion.div>

        <Tabs defaultValue="account" className="w-full">
          <TabsList className="grid w-full grid-cols-3 mb-8">
            <TabsTrigger value="account">Account Info</TabsTrigger>
            <TabsTrigger value="documents">Documents</TabsTrigger>
            <TabsTrigger value="banking">Manage Bank Accounts</TabsTrigger>
          </TabsList>

          {/* Account Info Tab */}
          <TabsContent value="account">
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="bg-gradient-to-br from-card via-card to-card/50 backdrop-blur-sm rounded-xl border border-border p-8">
              <div className="flex items-center gap-6 mb-8 pb-8 border-b border-border">
                <Avatar className="w-24 h-24 border-4 border-primary/30">
                  <AvatarFallback className="bg-gradient-to-br from-primary to-secondary text-primary-foreground font-semibold text-2xl">
                    {name ? name.charAt(0) + name.split(" ")[1]?.charAt(0) : "JS"}
                  </AvatarFallback>
                </Avatar>
                <div>
                  <h3 className="font-heading text-xl font-semibold mb-1">{name}</h3>
                  <p className="text-sm text-muted-foreground">F-1 Visa Student</p>
                  <Button variant="outline" size="sm">Change Photo</Button>
                </div>
              </div>

              <form onSubmit={(e) => { e.preventDefault(); handleSave(); }} className="space-y-6">
                <div className="grid md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <Label htmlFor="name">Full Name</Label>
                    <Input id="name" value={name} onChange={(e) => setName(e.target.value)} className="bg-background border-border focus:border-primary" />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="email">Email</Label>
                    <Input id="email" type="email" value={email} readOnly disabled className="bg-muted border-border cursor-not-allowed" />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="school">School/University</Label>
                    <Input id="school" value={school} onChange={(e) => setSchool(e.target.value)} className="bg-background border-border focus:border-primary" />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="country">Home Country</Label>
                    <Input id="country" value={country} onChange={(e) => setCountry(e.target.value)} className="bg-background border-border focus:border-primary" />
                  </div>
                </div>

                <div className="pt-6 border-t border-border flex items-center justify-between mb-4">
                  <div>
                    <h3 className="font-heading text-lg font-semibold mb-1">Premium Plan</h3>
                    <p className="text-sm text-muted-foreground">Active since January 2024</p>
                  </div>
                  <Button variant="outline">Upgrade</Button>
                </div>

                <div className="flex gap-4 pt-6">
                  <Button type="submit" className="bg-gradient-to-r from-primary to-secondary hover:opacity-90 text-primary-foreground font-semibold">
                    Save Changes
                  </Button>
                  <Button type="button" variant="destructive" onClick={handleLogout}>
                    Logout
                  </Button>
                </div>
              </form>
            </motion.div>
          </TabsContent>

          {/* Documents Tab */}
          <TabsContent value="documents">
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
              <div className="flex items-center justify-between">
                <p className="text-muted-foreground">View and manage all your uploaded documents</p>
                <Button onClick={() => navigate("/dashboard/upload-documents")} className="bg-gradient-to-r from-primary to-secondary hover:opacity-90 text-primary-foreground font-semibold">
                  <PlusCircle className="w-4 h-4 mr-2" />
                  Add New Document
                </Button>
              </div>

              {documents.length > 0 ? (
                <div className="bg-gradient-to-br from-card via-card to-card/50 backdrop-blur-sm rounded-xl border border-border overflow-hidden">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Name</TableHead>
                        <TableHead>Type</TableHead>
                        <TableHead>Date Uploaded</TableHead>
                        <TableHead>Tags</TableHead>
                        <TableHead className="text-right">Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {documents.map((doc) => (
                        <TableRow key={doc.id} className="group">
                          <TableCell className="font-medium flex items-center gap-2">
                            <FileText className="w-4 h-4 text-primary" />
                            {doc.file_name}
                          </TableCell>
                          <TableCell>
                            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-primary/10 text-primary">
                              {doc.document_type}
                            </span>
                          </TableCell>
                          <TableCell className="text-muted-foreground">
                            {new Date(doc.uploaded_at).toLocaleDateString()}
                          </TableCell>
                          <TableCell>
                            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-500/10 text-green-500">
                              {doc.tags || "N/A"}
                            </span>
                          </TableCell>
                          <TableCell className="text-right">
                            <div className="flex items-center justify-end gap-2">
                              <Button variant="ghost" size="sm" onClick={() => setViewingDoc(doc)}>
                                <Eye className="w-4 h-4" />
                              </Button>
                              <Button
                                variant="ghost"
                                size="sm"
                                className="text-destructive hover:text-destructive"
                                onClick={() => deleteDocument(doc.id)}
                              >
                                <Trash2 className="w-4 h-4" />
                              </Button>
                            </div>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              ) : (
                <div className="bg-gradient-to-br from-card via-card to-card/50 backdrop-blur-sm rounded-xl border border-border p-12 text-center">
                  <FileText className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                  <p className="text-muted-foreground mb-4">No documents uploaded yet</p>
                  <Button onClick={() => navigate("/dashboard/upload-documents")} variant="outline">
                    Upload Your First Document
                  </Button>
                </div>
              )}

              {/* PDF / Image Modal */}
              <AnimatePresence>
                {viewingDoc && (
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4"
                  >
                    <motion.div
                      initial={{ scale: 0.8 }}
                      animate={{ scale: 1 }}
                      exit={{ scale: 0.8 }}
                      className="bg-card rounded-xl shadow-lg w-full max-w-4xl h-full md:h-[80vh] flex flex-col"
                    >
                      <div className="flex justify-between items-center p-4 border-b border-border">
                        <h3 className="font-semibold text-lg">{viewingDoc.file_name}</h3>
                        <div className="flex gap-2">
                          <Button variant="outline" size="sm" onClick={() => downloadDocument(viewingDoc)}>
                            Download
                          </Button>
                          <Button variant="destructive" size="sm" onClick={() => setViewingDoc(null)}>Close</Button>
                        </div>
                      </div>
                      <div className="flex-1 overflow-auto">
                        {viewingDoc.file_url?.endsWith(".pdf") ? (
                          <iframe
                            src={viewingDoc.file_url}
                            className="w-full h-full"
                            style={{ border: "none" }}
                          />
                        ) : (
                          <img
                            src={viewingDoc.file_url}
                            alt={viewingDoc.file_name}
                            className="object-contain w-full h-full"
                          />
                        )}
                      </div>
                    </motion.div>
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>
          </TabsContent>

          {/* Banking Tab */}
          <TabsContent value="banking">
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
              <div className="flex items-center justify-between">
                <p className="text-muted-foreground">Connect and analyze your banking data</p>
                <Button
                  onClick={() => setShowLinkBank(true)}
                  className="bg-gradient-to-r from-primary to-secondary hover:opacity-90 text-primary-foreground font-semibold"
                >
                  <Building2 className="w-4 h-4 mr-2" />
                  Link New Bank
                </Button>
              </div>

              {/* Linked Accounts */}
              <div className="bg-gradient-to-br from-card via-card to-card/50 backdrop-blur-sm rounded-xl border border-border p-6">
                <h3 className="font-heading text-xl font-semibold mb-4">Linked Accounts</h3>
                <div className="space-y-4">
                  {bankAccounts.map((account) => (
                    <div key={account.id} className="flex items-center justify-between p-4 bg-background/50 rounded-lg border border-border hover:border-primary/50 transition-colors">
                      <div className="flex items-center gap-4">
                        <div className="p-3 bg-gradient-to-br from-primary/20 to-secondary/20 rounded-lg">
                          <Building2 className="w-6 h-6 text-primary" />
                        </div>
                        <div>
                          <p className="font-semibold">{account.name}</p>
                          <p className="text-sm text-muted-foreground">
                          {account.type} • {account.accountNumber ? `****${account.accountNumber.slice(-4)}` : "****"}


                          </p>
                          <p className="text-xs text-muted-foreground mt-1">
                          Last synced: {account.lastSync ? new Date(account.lastSync).toLocaleDateString() : "Never"}

                            </p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="font-heading text-2xl font-bold">
                          ${account.balance.toLocaleString("en-US", { minimumFractionDigits: 2 })}
                        </p>
                        <Button
                          variant="ghost"
                          size="sm"
                          className="mt-2"
                          onClick={async () => {
                            try {
                              const token = getCookie("token");
                              const tokenType = getCookie("token_type") || "bearer";

                              const res = await fetch(`${API_BASE}/bank-accounts/${account.id}/sync/`, {
                                method: "POST",
                                headers: { Authorization: `${tokenType} ${token}` },
                              });
                              if (!res.ok) throw new Error("Sync failed");
                              toast({ title: "Synced", description: `${account.name} synced successfully` });
                              
                              // Refresh all accounts with mapping
                              const updatedRes = await fetch(`${API_BASE}/bank-accounts/`, {
                                headers: { Authorization: `${tokenType} ${token}` },
                              });
                              const updatedData: any[] = await updatedRes.json();
                              setBankAccounts(updatedData.map(mapBankAccount));

                              if (!res.ok) throw new Error("Sync failed");
                              toast({ title: "Synced", description: `${account.name} synced successfully` });
                            } catch (err: any) {
                              toast({ title: "Sync failed", description: err?.message || "Something went wrong", variant: "destructive" });
                            }
                          }}
                        >
                          Sync Now
                        </Button>

                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Analysis Cards */}
              <div className="grid md:grid-cols-3 gap-6">
                <Card className="bg-gradient-to-br from-card via-card to-card/50 backdrop-blur-sm border-border">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2 text-base">
                      <DollarSign className="w-5 h-5 text-primary" />
                      Total Balance
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="font-heading text-3xl font-bold">
                      ${totalBalance.toLocaleString("en-US", { minimumFractionDigits: 2 })}
                    </p>
                    <p className="text-sm text-muted-foreground mt-1">Across {bankAccounts.length} accounts</p>
                  </CardContent>
                </Card>

                <Card className="bg-gradient-to-br from-card via-card to-card/50 backdrop-blur-sm border-border">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2 text-base">
                      <PieChart className="w-5 h-5 text-primary" />
                      Expense Categories
                    </CardTitle>
                  </CardHeader>

                  <CardContent>
                    {expenses.length === 0 ? (
                      <p className="text-sm text-muted-foreground">No expenses available</p>
                    ) : (
                      <div className="space-y-2">
                        {Object.entries(
                          expenses.reduce((acc, exp) => {
                            acc[exp.category] = (acc[exp.category] || 0) + exp.amount;
                            return acc;
                          }, {} as Record<string, number>)
                        ).map(([category, total]) => {
                          const grandTotal = expenses.reduce((sum, e) => sum + e.amount, 0);
                          const percentage = ((total / grandTotal) * 100).toFixed(0);

                          return (
                            <div key={category} className="flex justify-between text-sm">
                              <span className="text-muted-foreground">{category}</span>
                              <span className="font-medium">{percentage}%</span>
                            </div>
                          );
                        })}
                      </div>
                    )}
                  </CardContent>
                </Card>

                <Card className="bg-gradient-to-br from-card via-card to-card/50 backdrop-blur-sm border-border">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2 text-base">
                      <TrendingUp className="w-5 h-5 text-primary" />
                      Monthly Trend
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="font-heading text-3xl font-bold text-green-500">+12.5%</p>
                    <p className="text-sm text-muted-foreground mt-1">vs. last month</p>
                  </CardContent>
                </Card>
              </div>

              {/* Security Note */}
              <div className="bg-gradient-to-br from-card via-card to-card/50 backdrop-blur-sm rounded-xl border border-border p-6">
                <div className="flex items-start gap-3">
                  <div className="p-2 bg-primary/10 rounded-lg">
                    <Building2 className="w-5 h-5 text-primary" />
                  </div>
                  <div>
                    <h4 className="font-semibold mb-2">Your banking data is secure</h4>
                    <p className="text-sm text-muted-foreground">
                      F1nance never stores your credentials. All data is encrypted in transit and at rest.
                      We use read-only connections to ensure your accounts remain secure.
                    </p>
                  </div>
                </div>
              </div>

              <AnimatePresence>
  {showLinkBank && (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4"
    >
      <motion.div
        initial={{ scale: 0.8 }}
        animate={{ scale: 1 }}
        exit={{ scale: 0.8 }}
        className="bg-card rounded-xl shadow-lg w-full max-w-lg p-6"
      >
        <h3 className="font-semibold text-lg mb-4">Link New Bank Account</h3>

        {/* Method selection */}
        <div className="flex gap-4 mb-6">
          <Button
            variant={linkMethod === "manual" ? "default" : "outline"}
            onClick={() => setLinkMethod("manual")}
          >
            Manual Entry
          </Button>
          <Button
            variant={linkMethod === "automatic" ? "default" : "outline"}
            onClick={() => setLinkMethod("automatic")}
          >
            Automatic Link
          </Button>
        </div>

        {/* Manual Entry */}
        {linkMethod === "manual" && (
          <form
            onSubmit={async (e) => {
              e.preventDefault();
              try {
                const token = getCookie("token");
                const tokenType = getCookie("token_type") || "bearer";

                const res = await fetch(`${API_BASE}/bank-accounts/`, {
                  method: "POST",
                  headers: {
                    "Content-Type": "application/json",
                    Authorization: `${tokenType} ${token}`,
                  },
                  body: JSON.stringify({
                    name: manualBank.name,
                    type: manualBank.type,
                    account_number: manualBank.accountNumber,
                    balance: manualBank.balance,
                  }),
                });
                if (!res.ok) throw new Error("Failed to add bank");
                
                const newBank = await res.json();
                setBankAccounts((prev) => [...prev, mapBankAccount(newBank)]);
                
                toast({ title: "Bank added", description: `${manualBank.name} added successfully` });
                setShowLinkBank(false);
                setManualBank({ name: "", type: "Checking", accountNumber: "", balance: 0 });
              } catch (err: any) {
                toast({ title: "Error", description: err?.message || "Something went wrong", variant: "destructive" });
              }
            }}
            className="space-y-4"
          >
            <div className="space-y-2">
              <Label>Bank Name</Label>
              <Input
                value={manualBank.name}
                onChange={(e) => setManualBank({ ...manualBank, name: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <Label>Account Type</Label>
              <Input
                value={manualBank.type}
                onChange={(e) => setManualBank({ ...manualBank, type: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <Label>Account Number</Label>
              <Input
                value={manualBank.accountNumber}
                onChange={(e) => setManualBank({ ...manualBank, accountNumber: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <Label>Initial Balance</Label>
              <Input
                type="number"
                value={manualBank.balance}
                onChange={(e) => setManualBank({ ...manualBank, balance: parseFloat(e.target.value) })}
              />
            </div>

            <div className="flex justify-end gap-4">
              <Button type="button" variant="destructive" onClick={() => setShowLinkBank(false)}>Cancel</Button>
              <Button type="submit">Add Bank</Button>
            </div>
          </form>
        )}

        {/* Automatic Linking */}
        {linkMethod === "automatic" && (
          <div className="space-y-4">
            <p className="text-sm text-muted-foreground">
              Connect your bank securely in real time. F1nance does not store credentials.
            </p>
            <Button
              onClick={async () => {
                try {
                  const token = getCookie("token");
                  const tokenType = getCookie("token_type") || "bearer";

                  const res = await fetch(`${API_BASE}/bank-accounts/link-session/`, {
                    method: "POST",
                    headers: { Authorization: `${tokenType} ${token}` },
                  });
                  if (!res.ok) throw new Error("Failed to start bank link");

                  const data = await res.json();
                  window.open(data.link_url, "_blank");
                  toast({ title: "Bank Link Started", description: "Follow instructions to connect your account" });
                  setShowLinkBank(false);
                } catch (err: any) {
                  toast({ title: "Error", description: err?.message || "Something went wrong", variant: "destructive" });
                }
              }}
            >
              Connect Automatically
            </Button>
          </div>
        )}
      </motion.div>
    </motion.div>
  )}
</AnimatePresence>

            </motion.div>
          </TabsContent>
        </Tabs>
      </div>
    </DashboardLayout>
  );
};

export default Profile;
