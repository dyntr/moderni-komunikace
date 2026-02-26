import { useState } from "react";
import { Check, ChevronDown, Sparkles, ArrowRight } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import AnimatedSection from "./AnimatedSection";

const plans = [
  {
    name: "Start",
    price: "15 000",
    unit: "Kč",
    prefix: "od",
    desc: "Pro živnostníky a menší firmy, které potřebují jednoduše fungující web.",
    features: ["Moderní one-page web", "Responzivní design", "Kontaktní formulář", "SEO základ", "Napojení na sítě"],
    details: ["Dodání cca za týden", "1 kolo revizí v ceně", "Hosting poradenství"],
    featured: false,
    accent: "primary",
  },
  {
    name: "Business",
    price: "30 000",
    unit: "Kč",
    prefix: "od",
    desc: "Pro firmy, které chtějí profesionální prezentaci s rozšířenými funkcemi.",
    features: ["Vícestránkový web na míru", "Pokročilý design a animace", "Blog / aktuality", "Rozšířené SEO", "Správa obsahu (CMS)", "Prioritní podpora"],
    details: ["Dodání cca za 2 týdny", "3 kola revizí v ceně", "CMS zaškolení", "30 dní podpory"],
    featured: true,
    accent: "accent",
  },
  {
    name: "Premium",
    price: "na míru",
    unit: "",
    prefix: "",
    desc: "Komplexní řešení pro náročné projekty — e-shopy, platformy, aplikace.",
    features: ["Kompletní web / e-shop", "Unikátní UX/UI design", "Vlastní funkcionality", "Integrace třetích stran", "Dlouhodobá správa", "Dedikovaný tým"],
    details: ["Individuální timeline", "Neomezené revize", "Osobní konzultant", "SLA smlouva"],
    featured: false,
    accent: "warm",
  },
];

const PricingCard = ({ plan, index }: { plan: typeof plans[0]; index: number }) => {
  const [expanded, setExpanded] = useState(false);

  return (
    <AnimatedSection delay={index * 0.12}>
      <motion.div
        whileHover={{ y: -8 }}
        transition={{ type: "spring", stiffness: 300, damping: 20 }}
        className={`rounded-3xl p-6 sm:p-8 h-full flex flex-col relative overflow-hidden transition-all duration-300 ${
          plan.featured
            ? "bg-foreground text-background shadow-[0_20px_60px_hsl(220_25%_12%/0.15)]"
            : "smooth-card"
        }`}
      >
        {plan.featured && (
          <motion.span
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            className="inline-flex items-center gap-1.5 text-xs font-heading font-semibold uppercase tracking-widest mb-4 text-background/70"
          >
            <Sparkles size={13} /> Nejoblíbenější
          </motion.span>
        )}

        <h3 className="font-heading text-2xl font-bold mb-3">{plan.name}</h3>

        <div className="mb-4 flex items-baseline gap-1.5 flex-wrap">
          {plan.prefix && <span className="text-sm opacity-40">{plan.prefix}</span>}
          <span className="font-heading text-4xl sm:text-5xl font-extrabold tracking-tight whitespace-nowrap">
            {plan.price}
          </span>
          {plan.unit && <span className="text-base font-medium opacity-50">{plan.unit}</span>}
        </div>

        <p className={`text-sm mb-6 leading-relaxed ${plan.featured ? "text-background/60" : "text-muted-foreground"}`}>
          {plan.desc}
        </p>

        <ul className="space-y-3 mb-5 flex-1">
          {plan.features.map((f) => (
            <li key={f} className="flex items-start gap-3 text-sm">
              <Check size={16} className={`flex-shrink-0 mt-0.5 ${plan.featured ? "text-background/50" : "text-primary"}`} />
              <span className={plan.featured ? "text-background/80" : "text-foreground/70"}>{f}</span>
            </li>
          ))}
        </ul>

        <button
          onClick={() => setExpanded(!expanded)}
          className={`flex items-center gap-1.5 text-xs font-medium mb-5 transition-colors ${
            plan.featured ? "text-background/50 hover:text-background/70" : "text-primary hover:text-primary/80"
          }`}
        >
          {expanded ? "Skrýt detaily" : "Zobrazit detaily"}
          <motion.span animate={{ rotate: expanded ? 180 : 0 }} transition={{ duration: 0.2 }}>
            <ChevronDown size={14} />
          </motion.span>
        </button>

        <AnimatePresence>
          {expanded && (
            <motion.ul
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: "auto", opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.3 }}
              className="space-y-2 mb-5 overflow-hidden"
            >
              {plan.details.map((d) => (
                <motion.li key={d} initial={{ x: -10, opacity: 0 }} animate={{ x: 0, opacity: 1 }} className={`flex items-start gap-2 text-xs ${plan.featured ? "text-background/40" : "text-muted-foreground"}`}>
                  <span className={`w-1 h-1 rounded-full mt-1.5 flex-shrink-0 ${plan.featured ? "bg-background/30" : "bg-primary/40"}`} />
                  {d}
                </motion.li>
              ))}
            </motion.ul>
          )}
        </AnimatePresence>

        <a
          href="#kontakt"
          className={`text-center font-medium py-3.5 rounded-full transition-all text-sm block group ${
            plan.featured
              ? "bg-background text-foreground hover:opacity-90"
              : "bg-foreground text-background hover:opacity-90"
          }`}
        >
          <span className="inline-flex items-center gap-1.5">
            Mám zájem <ArrowRight size={14} className="group-hover:translate-x-0.5 transition-transform" />
          </span>
        </a>
      </motion.div>
    </AnimatedSection>
  );
};

const PricingSection = () => (
  <section id="cenik" className="section-padding relative overflow-hidden">
    <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-border to-transparent" />
    <motion.div
      className="absolute top-[20%] left-[5%] w-[500px] h-[500px] blob-accent pointer-events-none"
      animate={{ x: [0, 40, 0], y: [0, -25, 0], scale: [1, 1.1, 1] }}
      transition={{ duration: 24, repeat: Infinity, ease: "easeInOut" }}
    />
    <motion.div
      className="absolute bottom-[15%] right-[8%] w-[350px] h-[350px] blob-warm pointer-events-none"
      animate={{ scale: [1, 1.2, 1], x: [0, -20, 0] }}
      transition={{ duration: 18, repeat: Infinity, ease: "easeInOut", delay: 6 }}
    />

    <div className="container mx-auto relative z-10">
      <AnimatedSection className="text-center mb-12 sm:mb-16">
        <span className="pill bg-accent/10 text-accent border border-accent/15 mb-4">Ceník</span>
        <h2 className="font-heading text-3xl sm:text-4xl md:text-5xl font-bold tracking-tight mt-4">Orientační ceník</h2>
        <p className="mt-4 max-w-xl mx-auto text-muted-foreground">
          Každý projekt je unikátní. Konečnou nabídku připravíme na míru.
        </p>
      </AnimatedSection>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-5 sm:gap-6 max-w-5xl mx-auto">
        {plans.map((p, i) => (
          <PricingCard key={p.name} plan={p} index={i} />
        ))}
      </div>
    </div>
  </section>
);

export default PricingSection;
