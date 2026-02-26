import { Globe, RefreshCw, Layout, ShoppingCart, Search, Settings, ArrowUpRight } from "lucide-react";
import { motion } from "framer-motion";
import AnimatedSection from "./AnimatedSection";

const services = [
  { icon: Globe, title: "Tvorba webů", desc: "Kompletní weby navržené přesně pro vaše podnikání.", color: "bg-primary/10 text-primary" },
  { icon: RefreshCw, title: "Redesign", desc: "Vaše stránky zaslouží moderní vzhled a technologie.", color: "bg-accent/10 text-accent" },
  { icon: Layout, title: "Landing pages", desc: "Konverzní stránky, které přivedou zákazníky.", color: "bg-warm/10 text-warm" },
  { icon: ShoppingCart, title: "E-shop řešení", desc: "Online prodej bez kompromisů, připravený na růst.", color: "bg-primary/10 text-primary" },
  { icon: Search, title: "SEO & rychlost", desc: "Technicky čistý základ, který vyhledávače milují.", color: "bg-accent/10 text-accent" },
  { icon: Settings, title: "Správa webu", desc: "Dlouhodobý servis, aktualizace a rozvoj.", color: "bg-warm/10 text-warm" },
];

const ServicesSection = () => (
  <section id="sluzby" className="section-padding relative overflow-hidden">
    {/* Animated background blob */}
    <motion.div
      className="absolute top-0 left-[10%] w-[500px] h-[500px] blob-primary pointer-events-none"
      animate={{ x: [0, 30, 0], y: [0, -20, 0], scale: [1, 1.1, 1] }}
      transition={{ duration: 18, repeat: Infinity, ease: "easeInOut" }}
    />
    <motion.div
      className="absolute bottom-[10%] right-[5%] w-[350px] h-[350px] blob-warm pointer-events-none"
      animate={{ x: [0, -25, 0], scale: [1, 1.15, 1] }}
      transition={{ duration: 22, repeat: Infinity, ease: "easeInOut", delay: 5 }}
    />

    <div className="container mx-auto relative z-10">
      <AnimatedSection className="text-center mb-14">
        <span className="pill bg-primary/10 text-primary border border-primary/15 mb-4">Služby</span>
        <h2 className="font-heading text-3xl sm:text-4xl md:text-5xl font-bold tracking-tight mt-4">
          Co pro vás děláme
        </h2>
      </AnimatedSection>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-5">
        {services.map((s, i) => (
          <AnimatedSection key={s.title} delay={i * 0.08}>
            <motion.div
              whileHover={{ y: -6 }}
              transition={{ type: "spring", stiffness: 300, damping: 25 }}
              className="smooth-card p-6 sm:p-7 h-full group cursor-default"
            >
              <div className={`w-12 h-12 rounded-2xl ${s.color} flex items-center justify-center mb-5`}>
                <s.icon size={22} />
              </div>
              <h3 className="font-heading text-lg font-semibold mb-2 flex items-center gap-2">
                {s.title}
                <ArrowUpRight size={15} className="text-muted-foreground/0 group-hover:text-primary group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-all" />
              </h3>
              <p className="text-muted-foreground text-sm leading-relaxed">{s.desc}</p>
            </motion.div>
          </AnimatedSection>
        ))}
      </div>
    </div>
  </section>
);

export default ServicesSection;
