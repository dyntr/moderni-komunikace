import { MessageSquare, PenTool, Code, Rocket, HeartHandshake } from "lucide-react";
import { motion } from "framer-motion";
import AnimatedSection from "./AnimatedSection";

const steps = [
  { icon: MessageSquare, title: "Konzultace", desc: "Porozumíme vašemu podnikání a nastavíme směr.", color: "bg-primary/10 text-primary" },
  { icon: PenTool, title: "Design", desc: "Připravíme wireframy a vizuální návrh ke schválení.", color: "bg-accent/10 text-accent" },
  { icon: Code, title: "Vývoj", desc: "Web oživíme kódem, vložíme texty a grafiku.", color: "bg-warm/10 text-warm" },
  { icon: Rocket, title: "Spuštění", desc: "Nasadíme, otestujeme a doladíme poslední detaily.", color: "bg-primary/10 text-primary" },
  { icon: HeartHandshake, title: "Péče", desc: "Postaráme se o chod webu a pomůžeme s růstem.", color: "bg-accent/10 text-accent" },
];

const ProcessSection = () => (
  <section id="proces" className="section-padding relative overflow-hidden">
    <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-border to-transparent" />
    <motion.div
      className="absolute top-[30%] right-[5%] w-[400px] h-[400px] blob-primary pointer-events-none"
      animate={{ x: [0, -30, 0], y: [0, 20, 0], scale: [1, 1.15, 1] }}
      transition={{ duration: 20, repeat: Infinity, ease: "easeInOut" }}
    />
    <motion.div
      className="absolute bottom-[5%] left-[10%] w-[300px] h-[300px] blob-accent pointer-events-none"
      animate={{ y: [0, -30, 0], scale: [1, 1.2, 1] }}
      transition={{ duration: 16, repeat: Infinity, ease: "easeInOut", delay: 4 }}
    />

    <div className="container mx-auto relative z-10">
      <AnimatedSection className="text-center mb-14">
        <span className="pill bg-primary/10 text-primary border border-primary/15 mb-4">Proces</span>
        <h2 className="font-heading text-3xl sm:text-4xl md:text-5xl font-bold tracking-tight mt-4">Jak spolupracujeme</h2>
      </AnimatedSection>

      <div className="max-w-3xl mx-auto">
        <div className="flex flex-col gap-6">
          {steps.map((s, i) => (
            <AnimatedSection key={s.title} delay={i * 0.1}>
              <motion.div
                whileHover={{ x: 8 }}
                transition={{ type: "spring", stiffness: 300 }}
                className="smooth-card p-5 sm:p-6 flex items-center gap-5 group"
              >
                <div className="flex items-center gap-5 flex-1">
                  <div className={`w-12 h-12 rounded-2xl ${s.color} flex items-center justify-center flex-shrink-0`}>
                    <s.icon size={20} />
                  </div>
                  <div>
                    <h3 className="font-heading font-semibold text-base sm:text-lg group-hover:text-primary transition-colors">
                      {s.title}
                    </h3>
                    <p className="text-muted-foreground text-sm">{s.desc}</p>
                  </div>
                </div>
                <span className="font-heading text-4xl font-extrabold text-foreground/[0.05] flex-shrink-0 hidden sm:block group-hover:text-primary/15 transition-colors duration-500">
                  {String(i + 1).padStart(2, "0")}
                </span>
              </motion.div>
            </AnimatedSection>
          ))}
        </div>
      </div>
    </div>
  </section>
);

export default ProcessSection;
