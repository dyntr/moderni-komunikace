import { motion } from "framer-motion";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import AnimatedSection from "./AnimatedSection";

const faqs = [
  { q: "Jak dlouho trvá tvorba webu?", a: "Vše závisí na vzájemné domluvě. Jednodušší web jsme schopni dodat i do jednoho týdne. U rozsáhlejších projektů se domluvíme na reálném termínu." },
  { q: "Co potřebuji dodat?", a: "Ideálně texty, fotografie a logo. Pokud nemáte, poradíme s copywritingem i grafikou. Zvládneme celý obsah za vás." },
  { q: "Kolik stojí web?", a: "Cena závisí na rozsahu. Jednoduché weby začínají od 15 000 Kč. Připravíme vám nezávaznou kalkulaci na míru." },
  { q: "Jak funguje správa webu?", a: "Nabízíme měsíční paušální správu — aktualizace, zálohy, drobné úpravy a technický dohled." },
  { q: "Řešíte i SEO?", a: "Ano. Každý web stavíme s technickým SEO základem. Pro pokročilou optimalizaci nabízíme rozšířené služby." },
  { q: "Co s hostingem?", a: "Poradíme s výběrem hostingu a domény. Nastavíme vše potřebné, případně hosting zajistíme." },
  { q: "Mohu web upravovat sám?", a: "Samozřejmě. Pokud web postavíme na CMS, zvládnete běžné úpravy sami. Zaškolíme vás." },
  { q: "Děláte i e-shopy?", a: "Ano. Vytvoříme přehledný e-shop s platební bránou, správou produktů a analytikou." },
];

const FAQSection = () => (
  <section id="faq" className="section-padding relative overflow-hidden">
    <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-border to-transparent" />
    <motion.div
      className="absolute bottom-[10%] right-[10%] w-[400px] h-[400px] blob-primary pointer-events-none"
      animate={{ x: [0, -35, 0], y: [0, 25, 0], scale: [1, 1.15, 1] }}
      transition={{ duration: 22, repeat: Infinity, ease: "easeInOut" }}
    />
    <motion.div
      className="absolute top-[20%] left-[5%] w-[300px] h-[300px] blob-warm pointer-events-none"
      animate={{ scale: [1, 1.2, 1], y: [0, -20, 0] }}
      transition={{ duration: 16, repeat: Infinity, ease: "easeInOut", delay: 3 }}
    />

    <div className="container mx-auto max-w-3xl relative z-10">
      <AnimatedSection className="text-center mb-10 sm:mb-14">
        <span className="pill bg-warm/10 text-warm border border-warm/15 mb-4">FAQ</span>
        <h2 className="font-heading text-3xl sm:text-4xl md:text-5xl font-bold tracking-tight mt-4">Časté dotazy</h2>
      </AnimatedSection>

      <AnimatedSection>
        <Accordion type="single" collapsible className="space-y-3">
          {faqs.map((f, i) => (
            <AccordionItem key={i} value={`faq-${i}`} className="smooth-card px-5 sm:px-6 hover:translate-y-0">
              <AccordionTrigger className="font-heading font-medium text-sm sm:text-base text-left hover:no-underline py-4 sm:py-5">
                {f.q}
              </AccordionTrigger>
              <AccordionContent className="text-muted-foreground leading-relaxed pb-5">
                {f.a}
              </AccordionContent>
            </AccordionItem>
          ))}
        </Accordion>
      </AnimatedSection>
    </div>
  </section>
);

export default FAQSection;
