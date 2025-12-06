import { useState } from "react";
import { motion } from "framer-motion";
import DashboardLayout from "@/components/DashboardLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Brain, AlertTriangle, CheckCircle, TrendingUp, Plus } from "lucide-react";
import Modal from "@/components/ui/Modal";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

interface CoachingInput {
  income: string;
  rent: string;
  food: string;
  transit: string;
  school: string;
}

export default function FinancialCoaching() {
  const [modalOpen, setModalOpen] = useState(false);
  const [form, setForm] = useState<CoachingInput>({
    income: "",
    rent: "",
    food: "",
    transit: "",
    school: "",
  });
  const [results, setResults] = useState<any | null>(null);
  const [errors, setErrors] = useState<string[]>([]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const validateInputs = () => {
    const errs: string[] = [];
    const fields = ["income", "rent", "food", "transit", "school"];

    fields.forEach((f) => {
      if (form[f as keyof CoachingInput] === "") {
        errs.push(`${f} is required`);
      }
    });

    const numeric = (v: string) => Number(v);

    if (numeric(form.rent) <= 0) errs.push("Rent must be a positive number");
    if (numeric(form.income) <= 0) errs.push("Income must be a positive number");

    return errs;
  };

  const handleSubmit = () => {
    const validationErrors = validateInputs();
    if (validationErrors.length > 0) {
      setErrors(validationErrors);
      return;
    }

    setErrors([]);

    // Dummy AI output for demo
    const income = Number(form.income);
    const rent = Number(form.rent);
    const food = Number(form.food);
    const transit = Number(form.transit);
    const school = Number(form.school);

    const totalExpenses = rent + food + transit + school;
    const remaining = income - totalExpenses;

    const f1Warnings: string[] = [];
    if (rent > income * 0.6) f1Warnings.push("Rent exceeds typical F-1 safe range ( >60% of income )");
    if (food < 120) f1Warnings.push("Food budget unusually low compared to typical U.S. student living costs");
    if (remaining < 0) f1Warnings.push("Budget negative — cannot sustain monthly expenses");

    setResults({
      income,
      totalExpenses,
      remaining,
      deltas: {
        rentDelta: rent - 900,
        foodDelta: food - 350,
        transitDelta: transit - 90,
      },
      f1Warnings,
    });

    setModalOpen(false);
  };

  const openModal = () => setModalOpen(true);

  return (
    <DashboardLayout>
      <div className="p-8">
        {/* Page Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8 flex justify-between items-center"
        >
          <div>
            <h1 className="font-heading text-3xl font-bold mb-2">AI Financial Advisor</h1>
            <p className="text-muted-foreground">
            Get personalized visa-aware financial guidance. AI-powered financial coaching that understands F-1 visa
              restrictions and opportunities.
            </p>
          </div>

          <Button onClick={openModal} className="flex items-center gap-2">
            <Plus className="w-4 h-4" /> Enter Financial Inputs
          </Button>
        </motion.div>

        {/* Summary Cards */}
        <div className="grid md:grid-cols-3 gap-6 mb-6">
          {/* Income Card */}
          <Card className="bg-gradient-to-br from-card via-card to-card/50 backdrop-blur-sm border-border">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-base">
                <TrendingUp className="w-5 h-5 text-primary" />
                Monthly Income
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="font-heading text-3xl font-bold">
                {results ? `$${results.income}` : "--"}
              </p>
              <p className="text-sm text-muted-foreground mt-1">Reported income</p>
            </CardContent>
          </Card>

          {/* Expenses */}
          <Card className="bg-gradient-to-br from-card via-card to-card/50 backdrop-blur-sm border-border">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-base">
                <Brain className="w-5 h-5 text-primary" />
                Total Monthly Expenses
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="font-heading text-3xl font-bold">
                {results ? `$${results.totalExpenses}` : "--"}
              </p>
              <p className="text-sm text-muted-foreground mt-1">Based on your inputs</p>
            </CardContent>
          </Card>

          {/* Remaining */}
          <Card className="bg-gradient-to-br from-card via-card to-card/50 backdrop-blur-sm border-border">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-base">
                <CheckCircle className="w-5 h-5 text-primary" />
                Remaining Balance
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p
                className={`font-heading text-3xl font-bold ${
                  results && results.remaining < 0 ? "text-red-500" : "text-green-500"
                }`}
              >
                {results ? `$${results.remaining}` : "--"}
              </p>
              <p className="text-sm text-muted-foreground mt-1">After essential expenses</p>
            </CardContent>
          </Card>
        </div>

        {/* AI Output Section */}
        {results && (
          <Card className="col-span-3 mt-6">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-base">
                Budget Analysis — AI Summary
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">

              {/* Deltas */}
              <div>
                <h3 className="font-semibold text-lg mb-2">Projected Budget Deltas</h3>
                <ul className="text-sm space-y-1">
                  <li>• Rent compared to typical: {results.deltas.rentDelta >= 0 ? "+" : ""}{results.deltas.rentDelta}</li>
                  <li>• Food compared to typical: {results.deltas.foodDelta >= 0 ? "+" : ""}{results.deltas.foodDelta}</li>
                  <li>• Transit compared to typical: {results.deltas.transitDelta >= 0 ? "+" : ""}{results.deltas.transitDelta}</li>
                </ul>
              </div>

              {/* F1 WARNINGS */}
              {results.f1Warnings.length > 0 && (
                <div className="p-4 bg-red-100 border border-red-300 rounded-md">
                  <div className="flex items-center gap-2 mb-2 text-red-700 font-semibold text-sm">
                    <AlertTriangle className="w-4 h-4" /> F-1 Rule / Budget Risk Alerts
                  </div>
                  <ul className="text-xs text-red-700 space-y-1">
                    {results.f1Warnings.map((msg: string, i: number) => (
                      <li key={i}>• {msg}</li>
                    ))}
                  </ul>
                </div>
              )}

              {results.f1Warnings.length === 0 && (
                <div className="p-4 bg-green-100 border border-green-300 rounded-md">
                  <div className="flex items-center gap-2 text-green-700 font-semibold text-sm">
                    <CheckCircle className="w-4 h-4" /> Everything looks compliant with F-1 norms
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        )}

        {/* Errors */}
        {errors.length > 0 && (
          <div className="mt-6 p-4 bg-red-100 border border-red-300 rounded-md text-red-800 text-sm">
            <p className="font-semibold mb-2">Please fix the following:</p>
            <ul className="space-y-1">
              {errors.map((e, i) => (
                <li key={i}>• {e}</li>
              ))}
            </ul>
          </div>
        )}

        {/* Modal for Inputs */}
        {modalOpen && (
          <Modal onClose={() => setModalOpen(false)} title="Enter Monthly Financial Inputs">
            <div className="space-y-4">
              <Input name="income" placeholder="Monthly Income" value={form.income} onChange={handleChange} />
              <Input name="rent" placeholder="Rent" value={form.rent} onChange={handleChange} />
              <Input name="food" placeholder="Food Budget" value={form.food} onChange={handleChange} />
              <Input name="transit" placeholder="Transit" value={form.transit} onChange={handleChange} />
              <Input name="school" placeholder="School / Program Fees" value={form.school} onChange={handleChange} />

              <div className="flex justify-end gap-2">
                <Button variant="outline" onClick={() => setModalOpen(false)}>Cancel</Button>
                <Button onClick={handleSubmit}>Analyze</Button>
              </div>
            </div>
          </Modal>
        )}
      </div>
    </DashboardLayout>
  );
}
