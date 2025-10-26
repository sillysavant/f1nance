import { useEffect, useRef } from "react";
import { Button } from "@/components/ui/button";
import { ArrowRight, Play, Shield, Award, Users } from "lucide-react";
import heroDashboard from "@/assets/hero-dashboard.png";
import cosmicBg from "@/assets/cosmic-bg.png";

const Hero = () => {
  const parallaxRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleScroll = () => {
      if (parallaxRef.current) {
        const scrolled = window.scrollY;
        parallaxRef.current.style.transform = `translateY(${scrolled * 0.3}px)`;
      }
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <section className="relative min-h-screen flex items-center justify-center overflow-hidden cosmic-bg">
      {/* Parallax Background */}
      <div
        ref={parallaxRef}
        className="parallax-layer opacity-30 pointer-events-none"
        style={{
          backgroundImage: `url(${cosmicBg})`,
          backgroundSize: "cover",
          backgroundPosition: "center",
        }}
      />

      <div className="container-custom relative z-10 pt-32 pb-20">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          {/* Left Content */}
          <div className="text-center lg:text-left animate-slide-up">
            <h1 className="text-5xl md:text-6xl lg:text-7xl font-bold font-heading mb-6 leading-tight">
              Master U.S. money as an{" "}
              <span className="gradient-text">F-1 student</span>
            </h1>
            <p className="text-xl md:text-2xl text-muted-foreground mb-8 leading-relaxed">
              Budget smarter, convert currencies, upload tax docs, and get
              visa-aware AI coaching—all in one place.
            </p>

            {/* CTAs */}
            <div className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start mb-12">
              <Button variant="hero" size="xl">
                Get Started Free
                <ArrowRight className="ml-2" size={20} />
              </Button>
              <Button variant="glass" size="xl">
                <Play className="mr-2" size={20} />
                See How It Works
              </Button>
            </div>

            {/* Trust Badges */}
            <div className="flex flex-wrap gap-6 justify-center lg:justify-start text-sm text-muted-foreground">
              <div className="flex items-center gap-2">
                <Users className="text-secondary" size={18} />
                <span>Student-friendly</span>
              </div>
              <div className="flex items-center gap-2">
                <Shield className="text-primary" size={18} />
                <span>Bank-grade security</span>
              </div>
              <div className="flex items-center gap-2">
                <Award className="text-accent" size={18} />
                <span>GDPR/FERPA conscious</span>
              </div>
            </div>
          </div>

          {/* Right Content - Dashboard Image */}
          <div className="relative animate-float">
            <div className="relative z-10">
              <img
                src={heroDashboard}
                alt="F1nance Dashboard showing budget tracking, currency conversion, and financial insights"
                className="w-full h-auto drop-shadow-2xl"
              />
            </div>
            {/* Glow effects */}
            <div className="absolute top-1/4 -left-20 w-64 h-64 bg-primary/20 rounded-full blur-3xl animate-pulse-glow" />
            <div className="absolute bottom-1/4 -right-20 w-64 h-64 bg-secondary/20 rounded-full blur-3xl animate-pulse-glow" />
          </div>
        </div>
      </div>

      {/* Bottom gradient fade */}
      <div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-background to-transparent" />
    </section>
  );
};

export default Hero;
