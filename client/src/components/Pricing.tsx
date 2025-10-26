import { Button } from "@/components/ui/button";
import { Check } from "lucide-react";

const plans = [
  {
    name: "Free",
    price: "$0",
    period: "forever",
    description: "Perfect for getting started with essential tools",
    features: [
      "Basic budgeting tools",
      "Currency conversion",
      "Financial resources library",
      "Community support",
      "Transaction tracking",
    ],
    cta: "Start Free",
    popular: false,
  },
  {
    name: "Premium",
    price: "$9.99",
    period: "per month",
    description: "Complete financial toolkit for serious students",
    features: [
      "Everything in Free, plus:",
      "Bank account linking",
      "Visa-aware AI coaching",
      "Tax document upload & checklists",
      "Smart reminders & notifications",
      "Scenario simulators",
      "Priority support",
      "Export financial reports",
    ],
    cta: "Upgrade to Premium",
    popular: true,
    badge: "Most Popular",
  },
];

const Pricing = () => {
  return (
    <section id="pricing" className="section-padding cosmic-bg relative">
      <div className="container-custom">
        <div className="text-center mb-16">
          <h2 className="text-4xl md:text-5xl font-bold font-heading mb-4">
            Simple, transparent <span className="gradient-text">pricing</span>
          </h2>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Start free, upgrade when you need more. Student discounts available.
          </p>
        </div>

        <div className="grid md:grid-cols-2 gap-8 max-w-5xl mx-auto">
          {plans.map((plan, index) => (
            <div
              key={plan.name}
              className={`glass-card p-8 relative animate-slide-up ${
                plan.popular ? "ring-2 ring-primary" : ""
              }`}
              style={{ animationDelay: `${index * 100}ms` }}
            >
              {plan.popular && (
                <div className="absolute -top-4 left-1/2 -translate-x-1/2">
                  <span className="bg-primary text-primary-foreground px-4 py-1 rounded-full text-sm font-semibold">
                    {plan.badge}
                  </span>
                </div>
              )}

              <div className="mb-6">
                <h3 className="text-2xl font-bold font-heading mb-2">{plan.name}</h3>
                <p className="text-muted-foreground text-sm mb-4">{plan.description}</p>
                <div className="flex items-baseline gap-2">
                  <span className="text-5xl font-bold font-heading">{plan.price}</span>
                  <span className="text-muted-foreground">/{plan.period}</span>
                </div>
              </div>

              <Button
                variant={plan.popular ? "hero" : "outline"}
                size="lg"
                className="w-full mb-8"
              >
                {plan.cta}
              </Button>

              <ul className="space-y-3">
                {plan.features.map((feature) => (
                  <li key={feature} className="flex items-start gap-3">
                    <Check className="text-primary shrink-0 mt-0.5" size={18} />
                    <span className="text-foreground/90">{feature}</span>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <p className="text-center text-sm text-muted-foreground mt-8">
          Student discount available. Cancel anytime. No hidden fees.
        </p>
      </div>
    </section>
  );
};

export default Pricing;
