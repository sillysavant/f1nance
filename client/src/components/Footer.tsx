import { Facebook, Twitter, Instagram, Linkedin, Mail } from "lucide-react";

const Footer = () => {
  const footerLinks = {
    Product: [
      { name: "Features", href: "#features" },
      { name: "Pricing", href: "#pricing" },
      { name: "Security", href: "#security" },
      { name: "Roadmap", href: "#roadmap" },
    ],
    Resources: [
      { name: "F-1 Tax Guide", href: "#tax" },
      { name: "CPT/OPT Info", href: "#visa" },
      { name: "Blog", href: "#blog" },
      { name: "Help Center", href: "#help" },
    ],
    Company: [
      { name: "About Us", href: "#about" },
      { name: "Careers", href: "#careers" },
      { name: "Press Kit", href: "#press" },
      { name: "Contact", href: "#contact" },
    ],
    Legal: [
      { name: "Privacy Policy", href: "#privacy" },
      { name: "Terms of Service", href: "#terms" },
      { name: "Cookie Policy", href: "#cookies" },
      { name: "Compliance", href: "#compliance" },
    ],
  };

  const socialLinks = [
    { icon: Twitter, href: "#", label: "Twitter" },
    { icon: Facebook, href: "#", label: "Facebook" },
    { icon: Instagram, href: "#", label: "Instagram" },
    { icon: Linkedin, href: "#", label: "LinkedIn" },
    { icon: Mail, href: "#", label: "Email" },
  ];

  return (
    <footer className="bg-card border-t border-border">
      <div className="container-custom py-12">
        <div className="grid md:grid-cols-2 lg:grid-cols-6 gap-8 mb-12">
          {/* Brand Column */}
          <div className="lg:col-span-2">
            <div className="text-2xl font-bold font-heading mb-4">
              <span className="gradient-text">F1nance</span>
            </div>
            <p className="text-muted-foreground mb-6 max-w-xs">
              The complete financial solution for F-1 visa students in the United States.
            </p>
            <div className="flex gap-4">
              {socialLinks.map((social) => (
                <a
                  key={social.label}
                  href={social.href}
                  aria-label={social.label}
                  className="w-10 h-10 rounded-lg bg-muted hover:bg-primary/20 flex items-center justify-center transition-colors group"
                >
                  <social.icon className="text-muted-foreground group-hover:text-primary transition-colors" size={18} />
                </a>
              ))}
            </div>
          </div>

          {/* Link Columns */}
          {Object.entries(footerLinks).map(([category, links]) => (
            <div key={category}>
              <h3 className="font-semibold font-heading mb-4">{category}</h3>
              <ul className="space-y-2">
                {links.map((link) => (
                  <li key={link.name}>
                    <a
                      href={link.href}
                      className="text-muted-foreground hover:text-primary transition-colors text-sm"
                    >
                      {link.name}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        {/* Bottom Bar */}
        <div className="pt-8 border-t border-border flex flex-col md:flex-row justify-between items-center gap-4">
          <p className="text-sm text-muted-foreground">
            © {new Date().getFullYear()} F1nance. All rights reserved.
          </p>
          <div className="flex items-center gap-4">
            <select
              className="bg-muted text-foreground px-3 py-1.5 rounded-md text-sm border border-border focus:outline-none focus:ring-2 focus:ring-primary"
              aria-label="Select language"
            >
              <option>English</option>
              <option>Español</option>
              <option>中文</option>
              <option>हिन्दी</option>
            </select>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
