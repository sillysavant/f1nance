import { FileText, GraduationCap, Briefcase, DollarSign } from "lucide-react";
import { Button } from "@/components/ui/button";

const resources = [
  {
    icon: FileText,
    title: "F-1 Tax Basics",
    description: "Everything you need to know about filing taxes as an international student",
  },
  {
    icon: Briefcase,
    title: "CPT vs. OPT Guide",
    description: "Understand work authorization and how it affects your finances",
  },
  {
    icon: GraduationCap,
    title: "First Week Setup",
    description: "Essential financial steps for your first week in the U.S.",
  },
  {
    icon: DollarSign,
    title: "Scholarship Budgeting",
    description: "Make the most of your scholarship funds with smart planning",
  },
];

const Resources = () => {
  return (
    <section id="resources" className="section-padding bg-background relative">
      <div className="container-custom">
        <div className="text-center mb-16">
          <h2 className="text-4xl md:text-5xl font-bold font-heading mb-4">
            Learn & grow with our <span className="gradient-text">resources</span>
          </h2>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Content reviewed by compliance and tax professionals
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
          {resources.map((resource, index) => (
            <div
              key={resource.title}
              className="glass-card p-6 group cursor-pointer animate-slide-up"
              style={{ animationDelay: `${index * 100}ms` }}
            >
              <div className="w-12 h-12 rounded-lg bg-secondary/10 flex items-center justify-center mb-4 group-hover:bg-secondary/20 transition-colors">
                <resource.icon className="text-secondary" size={24} />
              </div>
              <h3 className="text-lg font-semibold font-heading mb-2">
                {resource.title}
              </h3>
              <p className="text-muted-foreground text-sm mb-4">
                {resource.description}
              </p>
              <span className="text-primary text-sm font-medium group-hover:underline">
                Read more →
              </span>
            </div>
          ))}
        </div>

        <div className="glass-card p-6 flex items-center justify-between flex-wrap gap-4">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-lg bg-accent/10 flex items-center justify-center">
              <GraduationCap className="text-accent" size={24} />
            </div>
            <div>
              <p className="font-semibold">Content reviewed by experts</p>
              <p className="text-sm text-muted-foreground">Compliance & Tax team approved</p>
            </div>
          </div>
          <Button variant="outline">
            View all resources
          </Button>
        </div>
      </div>
    </section>
  );
};

export default Resources;
