const testimonials = [
  {
    quote: "F1nance kept my rent and tuition on track—finally stress-free budgeting.",
    author: "Ananya",
    school: "Arizona State University",
    flag: "🇮🇳",
  },
  {
    quote: "The currency converter is a game-changer. I always know exactly how much I'm spending in my home currency.",
    author: "Carlos",
    school: "University of Texas",
    flag: "🇲🇽",
  },
  {
    quote: "Tax season used to scare me. Now I just upload my documents and follow the guided steps. So simple!",
    author: "Wei",
    school: "Stanford University",
    flag: "🇨🇳",
  },
];

const Testimonials = () => {
  return (
    <section className="section-padding bg-background relative overflow-hidden">
      {/* Background decoration */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-primary/5 rounded-full blur-3xl" />
      
      <div className="container-custom relative z-10">
        <div className="text-center mb-16">
          <h2 className="text-4xl md:text-5xl font-bold font-heading mb-4">
            Trusted by <span className="gradient-text">F-1 students</span> nationwide
          </h2>
          <p className="text-xl text-muted-foreground">
            Join thousands of international students taking control of their finances
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-8">
          {testimonials.map((testimonial, index) => (
            <div
              key={index}
              className="glass-card p-6 animate-slide-up"
              style={{ animationDelay: `${index * 150}ms` }}
            >
              <div className="flex items-start gap-2 mb-4">
                <div className="text-4xl">{testimonial.flag}</div>
                <div className="flex-1">
                  <p className="text-lg font-medium mb-1">{testimonial.author}</p>
                  <p className="text-sm text-muted-foreground">{testimonial.school}</p>
                </div>
              </div>
              <p className="text-foreground/90 leading-relaxed">
                "{testimonial.quote}"
              </p>
            </div>
          ))}
        </div>

        {/* University partners placeholder */}
        <div className="mt-16 text-center">
          <p className="text-sm text-muted-foreground mb-6">Partnered with leading universities</p>
          <div className="flex flex-wrap justify-center gap-8 opacity-50">
            <div className="text-2xl font-bold">MIT</div>
            <div className="text-2xl font-bold">Stanford</div>
            <div className="text-2xl font-bold">Harvard</div>
            <div className="text-2xl font-bold">Berkeley</div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Testimonials;
