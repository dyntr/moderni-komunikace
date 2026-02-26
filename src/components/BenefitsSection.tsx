import { motion } from "framer-motion";
import AnimatedSection from "./AnimatedSection";

const benefits = [
  { num: "01", title: "Moderní design a UX", desc: "Aktuální trendy, čistý vizuál a skvělý uživatelský zážitek." },
  { num: "02", title: "Rychlost načítání", desc: "Optimalizovaný kód a technologie pro bleskové načtení." },
  { num: "03", title: "Mobilní verze", desc: "Perfektní zobrazení na každém zařízení bez kompromisů." },
  { num: "04", title: "Přehledná struktura", desc: "Intuitivní navigace a jasné sdělení pro zákazníky." },
  { num: "05", title: "Snadná správa", desc: "Web, který zvládnete ovládat sami. A když ne, jsme tu." },
  { num: "06", title: "Férová komunikace", desc: "Transparentní proces, jasné termíny a žádná překvapení." },
];

const BenefitsSection = () => (
  <section id="proc-my" className="section-padding relative overflow-hidden">
    {/* Gradient divider */}
    <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-border to-transparent" />
    
    <motion.div
      className="absolute top-[20%] right-0 w-[500px] h-[500px] blob-accent pointer-events-none"
      animate={{ x: [0, -40, 0], y: [0, 30, 0], scale: [1, 1.15, 1] }}
      transition={{ duration: 20, repeat: Infinity, ease: "easeInOut" }}
    />
    <motion.div
      className="absolute bottom-[15%] left-[5%] w-[350px] h-[350px] blob-primary pointer-events-none"
      animate={{ scale: [1, 1.2, 1], x: [0, 25, 0] }}
      transition={{ duration: 18, repeat: Infinity, ease: "easeInOut", delay: 5 }}
    />

    <div className="container mx-auto relative z-10">
      <AnimatedSection className="text-center mb-14">
        <span className="pill bg-accent/10 text-accent border border-accent/15 mb-4">Proč my</span>
        <h2 className="font-heading text-3xl sm:text-4xl md:text-5xl font-bold tracking-tight mt-4">
          Důvody, proč nám věřit
        </h2>
      </AnimatedSection>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8 max-w-5xl mx-auto">
        {benefits.map((b, i) => (
          <AnimatedSection key={b.title} delay={i * 0.07}>
            <motion.div
              className="group cursor-default"
              whileHover={{ x: 4 }}
              transition={{ type: "spring", stiffness: 300 }}
            >
              <span className={`font-heading text-5xl font-extrabold block mb-2 transition-colors duration-500 ${
                i % 3 === 0 ? "text-primary/15 group-hover:text-primary/30" :
                i % 3 === 1 ? "text-accent/15 group-hover:text-accent/30" :
                "text-warm/15 group-hover:text-warm/30"
              }`}>
                {b.num}
              </span>
              <h3 className="font-heading font-semibold text-lg mb-1 group-hover:text-primary transition-colors duration-300">
                {b.title}
              </h3>
              <p className="text-muted-foreground text-sm leading-relaxed">{b.desc}</p>
            </motion.div>
          </AnimatedSection>
        ))}
      </div>
    </div>
  </section>
);

export default BenefitsSection;
