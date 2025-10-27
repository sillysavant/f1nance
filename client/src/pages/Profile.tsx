import { useState } from "react";
import { motion } from "framer-motion";
import DashboardLayout from "@/components/DashboardLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useToast } from "@/hooks/use-toast";
import { useNavigate } from "react-router-dom";
import { FileText, Trash2, Eye, PlusCircle, Building2, TrendingUp, PieChart, DollarSign } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";

const Profile = () => {
  const [name, setName] = useState("John Student");
  const [email, setEmail] = useState("john.student@university.edu");
  const [school, setSchool] = useState("University of California");
  const [country, setCountry] = useState("India");
  const { toast } = useToast();
  const navigate = useNavigate();

  const handleSave = () => {
    toast({
      title: "Profile updated",
      description: "Your profile has been successfully updated.",
    });
  };

  const handleLogout = () => {
    toast({
      title: "Logged out",
      description: "You've been successfully logged out.",
    });
    navigate("/");
  };

  // Mock documents data
  const [documents] = useState([
    { id: 1, name: "W-2_2023.pdf", type: "Tax", date: "2024-01-15", status: "Verified" },
    { id: 2, name: "I-20_Current.pdf", type: "Visa", date: "2024-01-10", status: "Active" },
    { id: 3, name: "Bank_Statement_Dec.pdf", type: "Bank", date: "2024-01-05", status: "Verified" },
  ]);

  // Mock bank accounts data
  const [bankAccounts] = useState([
    { id: 1, name: "Chase Checking", type: "Checking", lastSync: "2024-01-15", balance: 2450.00, accountNumber: "****1234" },
    { id: 2, name: "Bank of America Savings", type: "Savings", lastSync: "2024-01-14", balance: 8750.50, accountNumber: "****5678" },
  ]);

  const totalBalance = bankAccounts.reduce((sum, acc) => sum + acc.balance, 0);

  return (
    <DashboardLayout>
      <div className="p-8 max-w-6xl">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
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
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-gradient-to-br from-card via-card to-card/50 backdrop-blur-sm rounded-xl border border-border p-8"
            >
              {/* Avatar Section */}
              <div className="flex items-center gap-6 mb-8 pb-8 border-b border-border">
                <Avatar className="w-24 h-24 border-4 border-primary/30">
                  <AvatarFallback className="bg-gradient-to-br from-primary to-secondary text-primary-foreground font-semibold text-2xl">
                    JS
                  </AvatarFallback>
                </Avatar>
                <div>
                  <h3 className="font-heading text-xl font-semibold mb-1">{name}</h3>
                  <p className="text-sm text-muted-foreground mb-3">F-1 Visa Student</p>
                  <Button variant="outline" size="sm">Change Photo</Button>
                </div>
              </div>

              {/* Form */}
              <form onSubmit={(e) => { e.preventDefault(); handleSave(); }} className="space-y-6">
                <div className="grid md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <Label htmlFor="name">Full Name</Label>
                    <Input
                      id="name"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      className="bg-background border-border focus:border-primary"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="email">Email</Label>
                    <Input
                      id="email"
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="bg-background border-border focus:border-primary"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="school">School/University</Label>
                    <Input
                      id="school"
                      value={school}
                      onChange={(e) => setSchool(e.target.value)}
                      className="bg-background border-border focus:border-primary"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="country">Home Country</Label>
                    <Input
                      id="country"
                      value={country}
                      onChange={(e) => setCountry(e.target.value)}
                      className="bg-background border-border focus:border-primary"
                    />
                  </div>
                </div>

                {/* Subscription Info */}
                <div className="pt-6 border-t border-border">
                  <div className="flex items-center justify-between mb-4">
                    <div>
                      <h3 className="font-heading text-lg font-semibold mb-1">Premium Plan</h3>
                      <p className="text-sm text-muted-foreground">Active since January 2024</p>
                    </div>
                    <Button variant="outline">Upgrade</Button>
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="flex gap-4 pt-6">
                  <Button
                    type="submit"
                    className="bg-gradient-to-r from-primary to-secondary hover:opacity-90 text-primary-foreground font-semibold"
                  >
                    Save Changes
                  </Button>
                  <Button
                    type="button"
                    variant="destructive"
                    onClick={handleLogout}
                  >
                    Logout
                  </Button>
                </div>
              </form>
            </motion.div>
          </TabsContent>

          {/* Documents Tab */}
          <TabsContent value="documents">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="space-y-6"
            >
              <div className="flex items-center justify-between">
                <p className="text-muted-foreground">View and manage all your uploaded documents</p>
                <Button
                  onClick={() => navigate("/dashboard/upload-documents")}
                  className="bg-gradient-to-r from-primary to-secondary hover:opacity-90 text-primary-foreground font-semibold"
                >
                  <PlusCircle className="w-4 h-4 mr-2" />
                  Add New Document
                </Button>
              </div>

              <div className="bg-gradient-to-br from-card via-card to-card/50 backdrop-blur-sm rounded-xl border border-border overflow-hidden">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Name</TableHead>
                      <TableHead>Type</TableHead>
                      <TableHead>Date Uploaded</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {documents.map((doc) => (
                      <TableRow key={doc.id} className="group">
                        <TableCell className="font-medium flex items-center gap-2">
                          <FileText className="w-4 h-4 text-primary" />
                          {doc.name}
                        </TableCell>
                        <TableCell>
                          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-primary/10 text-primary">
                            {doc.type}
                          </span>
                        </TableCell>
                        <TableCell className="text-muted-foreground">{doc.date}</TableCell>
                        <TableCell>
                          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-500/10 text-green-500">
                            {doc.status}
                          </span>
                        </TableCell>
                        <TableCell className="text-right">
                          <div className="flex items-center justify-end gap-2">
                            <Button variant="ghost" size="sm">
                              <Eye className="w-4 h-4" />
                            </Button>
                            <Button variant="ghost" size="sm" className="text-destructive hover:text-destructive">
                              <Trash2 className="w-4 h-4" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>

              {documents.length === 0 && (
                <div className="bg-gradient-to-br from-card via-card to-card/50 backdrop-blur-sm rounded-xl border border-border p-12 text-center">
                  <FileText className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                  <p className="text-muted-foreground mb-4">No documents uploaded yet</p>
                  <Button
                    onClick={() => navigate("/dashboard/upload-documents")}
                    variant="outline"
                  >
                    Upload Your First Document
                  </Button>
                </div>
              )}
            </motion.div>
          </TabsContent>

          {/* Manage Bank Accounts Tab */}
          <TabsContent value="banking">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="space-y-6"
            >
              <div className="flex items-center justify-between">
                <p className="text-muted-foreground">Connect and analyze your banking data</p>
                <Button className="bg-gradient-to-r from-primary to-secondary hover:opacity-90 text-primary-foreground font-semibold">
                  <Building2 className="w-4 h-4 mr-2" />
                  Link New Bank
                </Button>
              </div>

              {/* Linked Accounts Section */}
              <div className="bg-gradient-to-br from-card via-card to-card/50 backdrop-blur-sm rounded-xl border border-border p-6">
                <h3 className="font-heading text-xl font-semibold mb-4">Linked Accounts</h3>
                <div className="space-y-4">
                  {bankAccounts.map((account) => (
                    <div
                      key={account.id}
                      className="flex items-center justify-between p-4 bg-background/50 rounded-lg border border-border hover:border-primary/50 transition-colors"
                    >
                      <div className="flex items-center gap-4">
                        <div className="p-3 bg-gradient-to-br from-primary/20 to-secondary/20 rounded-lg">
                          <Building2 className="w-6 h-6 text-primary" />
                        </div>
                        <div>
                          <p className="font-semibold">{account.name}</p>
                          <p className="text-sm text-muted-foreground">
                            {account.type} • {account.accountNumber}
                          </p>
                          <p className="text-xs text-muted-foreground mt-1">
                            Last synced: {account.lastSync}
                          </p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="font-heading text-2xl font-bold">
                          ${account.balance.toLocaleString('en-US', { minimumFractionDigits: 2 })}
                        </p>
                        <Button variant="ghost" size="sm" className="mt-2">
                          Sync Now
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Account Analysis Widgets */}
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
                      ${totalBalance.toLocaleString('en-US', { minimumFractionDigits: 2 })}
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
                    <div className="space-y-2">
                      <div className="flex justify-between text-sm">
                        <span className="text-muted-foreground">Housing</span>
                        <span className="font-medium">35%</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="text-muted-foreground">Food</span>
                        <span className="font-medium">25%</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="text-muted-foreground">Transport</span>
                        <span className="font-medium">15%</span>
                      </div>
                    </div>
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
            </motion.div>
          </TabsContent>
        </Tabs>
      </div>
    </DashboardLayout>
  );
};

export default Profile;
