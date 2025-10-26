import { Wallet, Link2, Brain, FileText } from "lucide-react";

const benefits = [
  {
    icon: Wallet,
    title: "Smart Budgeting",
    description: "Track income, expenses, and goals with one tap. Stay on top of your finances effortlessly.",
  },
  {
    icon: Link2,
    title: "Bank Linking",
    description: "Securely import transactions—no spreadsheets. Connect your accounts seamlessly.",
  },
  {
    icon: Brain,
    title: "Visa-Aware Coaching",
    description: "AI tips that respect CPT/OPT rules. Get personalized advice for international students.",
  },
  {
    icon: FileText,
    title: "Tax Docs Upload",
    description: "Scan W-2/1042-S and get guided next steps. Simplify your tax filing process.",
  },
];

const Benefits = () => {
  return (
    <section className="section-padding bg-background relative">
      <div className="container-custom">
        <div className="text-center mb-16">
          <h2 className="text-4xl md:text-5xl font-bold font-heading mb-4">
            Everything you need in <span className="gradient-text">one app</span>
          </h2>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Designed specifically for F-1 students navigating U.S. finances
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
          {benefits.map((benefit, index) => (
            <div
              key={benefit.title}
              className="glass-card p-6 group animate-slide-up"
              style={{ animationDelay: `${index * 100}ms` }}
            >
              <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center mb-4 group-hover:bg-primary/20 transition-colors">
                <benefit.icon className="text-primary" size={24} />
              </div>
              <h3 className="text-xl font-semibold font-heading mb-2">
                {benefit.title}
              </h3>
              <p className="text-muted-foreground text-sm leading-relaxed">
                {benefit.description}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Benefits;
