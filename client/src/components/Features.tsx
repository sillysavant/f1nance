import { DollarSign, Bell, Calculator } from "lucide-react";
import { Button } from "@/components/ui/button";

const features = [
  {
    icon: DollarSign,
    title: "Currency Conversion",
    description: "Live exchange rates at your fingertips. Pin your home currency and convert instantly with real-time data from major banks.",
    highlights: ["Real-time rates", "Multiple currencies", "Pin favorites"],
  },
  {
    icon: Bell,
    title: "Smart Reminders",
    description: "Never miss rent, bills, or tax deadlines. Get timezone-aware notifications that keep you on track with all your financial obligations.",
    highlights: ["Rent reminders", "Bill alerts", "Tax deadlines"],
  },
  {
    icon: Calculator,
    title: "Scenario Simulators",
    description: "Plan ahead with confidence. Simulate rent vs. campus costs, credit card usage, and CPT/OPT budgeting scenarios before making decisions.",
    highlights: ["Budget planning", "CPT/OPT simulations", "Cost comparisons"],
  },
];

const Features = () => {
  return (
    <section id="features" className="section-padding cosmic-bg relative">
      <div className="container-custom">
        <div className="text-center mb-16">
          <h2 className="text-4xl md:text-5xl font-bold font-heading mb-4">
            Powerful features for <span className="gradient-text">smart students</span>
          </h2>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Tools built specifically for the unique financial needs of F-1 visa holders
          </p>
        </div>

        <div className="space-y-24">
          {features.map((feature, index) => (
            <div
              key={feature.title}
              className={`grid lg:grid-cols-2 gap-12 items-center ${
                index % 2 === 1 ? "lg:flex-row-reverse" : ""
              }`}
            >
              {/* Content */}
              <div className={`${index % 2 === 1 ? "lg:order-2" : ""} animate-slide-up`}>
                <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-primary/10 mb-6">
                  <feature.icon className="text-primary" size={32} />
                </div>
                <h3 className="text-3xl md:text-4xl font-bold font-heading mb-4">
                  {feature.title}
                </h3>
                <p className="text-lg text-muted-foreground mb-6 leading-relaxed">
                  {feature.description}
                </p>
                <ul className="space-y-2 mb-6">
                  {feature.highlights.map((highlight) => (
                    <li key={highlight} className="flex items-center gap-2 text-foreground">
                      <div className="w-1.5 h-1.5 rounded-full bg-primary" />
                      <span>{highlight}</span>
                    </li>
                  ))}
                </ul>
                <Button variant="outline" size="lg">
                  See details
                </Button>
              </div>

              {/* Visual */}
              <div className={`${index % 2 === 1 ? "lg:order-1" : ""} relative`}>
                <div className="glass-card aspect-video flex items-center justify-center">
                  <feature.icon className="text-primary/20" size={120} />
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Features;
