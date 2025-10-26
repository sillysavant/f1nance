import { useEffect, useRef } from "react";
import { Button } from "@/components/ui/button";
import { ArrowRight, MessageCircle } from "lucide-react";
import cosmicBg from "@/assets/cosmic-bg.png";

const FinalCTA = () => {
  const parallaxRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleScroll = () => {
      if (parallaxRef.current) {
        const scrolled = window.scrollY;
        const offset = parallaxRef.current.offsetTop;
        const distance = scrolled - offset;
        if (distance > -500) {
          parallaxRef.current.style.transform = `translateY(${distance * 0.2}px)`;
        }
      }
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <section className="section-padding relative overflow-hidden cosmic-bg">
      {/* Parallax Background */}
      <div
        ref={parallaxRef}
        className="parallax-layer opacity-20 pointer-events-none"
        style={{
          backgroundImage: `url(${cosmicBg})`,
          backgroundSize: "cover",
          backgroundPosition: "center",
        }}
      />

      <div className="container-custom relative z-10">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-5xl md:text-6xl lg:text-7xl font-bold font-heading mb-6 leading-tight">
            Ready to feel in <span className="gradient-text">control</span>?
          </h2>
          <p className="text-xl md:text-2xl text-muted-foreground mb-10 leading-relaxed">
            Join thousands of F-1 students who are mastering their U.S. finances with confidence.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center mb-8">
            <Button variant="hero" size="xl">
              Get Started Free
              <ArrowRight className="ml-2" size={20} />
            </Button>
            <Button variant="glass" size="xl">
              <MessageCircle className="mr-2" size={20} />
              Talk to Us
            </Button>
          </div>

          <p className="text-sm text-muted-foreground">
            Join free—no credit card required. Bank-grade encryption. You control your data.
          </p>

          {/* Decorative glow effects */}
          <div className="absolute top-1/2 left-1/4 w-64 h-64 bg-primary/10 rounded-full blur-3xl -z-10" />
          <div className="absolute top-1/2 right-1/4 w-64 h-64 bg-accent/10 rounded-full blur-3xl -z-10" />
        </div>
      </div>
    </section>
  );
};

export default FinalCTA;
