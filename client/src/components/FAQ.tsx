import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";

const faqs = [
  {
    question: "Is my financial data secure?",
    answer: "Absolutely. We use bank-grade 256-bit encryption to protect your data. Your information is encrypted both in transit and at rest, and we never sell your data to third parties. We're also GDPR and FERPA conscious.",
  },
  {
    question: "Which countries and currencies do you support?",
    answer: "We support 150+ countries and major currencies including USD, EUR, GBP, INR, CNY, MXN, and more. You can track expenses in multiple currencies and convert between them with real-time exchange rates.",
  },
  {
    question: "Can I link my U.S. bank account?",
    answer: "Yes! Premium users can securely link their U.S. bank accounts using industry-standard Plaid integration. This allows automatic transaction imports, eliminating the need for manual entry.",
  },
  {
    question: "What if I need to cancel?",
    answer: "You can cancel your Premium subscription anytime from your account settings. There are no cancellation fees, and you'll retain access until the end of your billing period. Your data remains accessible even on the free plan.",
  },
  {
    question: "Do you offer student discounts?",
    answer: "Yes! We offer special pricing for verified students. Contact our support team with your student ID to learn about available discounts and institutional partnerships.",
  },
  {
    question: "How does the visa-aware coaching work?",
    answer: "Our AI coaching system is trained on F-1 visa regulations and provides personalized financial advice that respects CPT and OPT work restrictions. It helps you make informed decisions while staying compliant with visa requirements.",
  },
];

const FAQ = () => {
  return (
    <section id="faq" className="section-padding cosmic-bg relative">
      <div className="container-custom">
        <div className="text-center mb-16">
          <h2 className="text-4xl md:text-5xl font-bold font-heading mb-4">
            Frequently asked <span className="gradient-text">questions</span>
          </h2>
          <p className="text-xl text-muted-foreground">
            Everything you need to know about F1nance
          </p>
        </div>

        <div className="max-w-3xl mx-auto">
          <Accordion type="single" collapsible className="space-y-4">
            {faqs.map((faq, index) => (
              <AccordionItem
                key={index}
                value={`item-${index}`}
                className="glass-card px-6 border-none"
              >
                <AccordionTrigger className="text-left hover:no-underline py-6">
                  <span className="font-semibold text-lg">{faq.question}</span>
                </AccordionTrigger>
                <AccordionContent className="text-muted-foreground pb-6 leading-relaxed">
                  {faq.answer}
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        </div>
      </div>
    </section>
  );
};

export default FAQ;
