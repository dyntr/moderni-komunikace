import { useState } from "react";
import { ExternalLink, X, Eye } from "lucide-react";
import { AnimatePresence, motion } from "framer-motion";
import AnimatedSection from "./AnimatedSection";

import imgSocialGoals from "@/assets/portfolio/socialgoals.png";
import imgVoxable from "@/assets/portfolio/voxable.png";
import imgRockimbo from "@/assets/portfolio/rockimbo.png";
import imgAutazfirem from "@/assets/portfolio/autazfirem.png";
import imgMilocar from "@/assets/portfolio/milocar.png";
import imgSshow from "@/assets/portfolio/sshow.png";
import imgEtcprague from "@/assets/portfolio/etcprague.png";

const filters = ["Vše", "Firemní web", "E-shop", "Landing page"];

const projects = [
  { title: "Social Goals Marketing", desc: "Marketingová agentura — moderní firemní prezentace.", url: "https://socialgoalsmarketing.com", tag: "Firemní web", image: imgSocialGoals },
  { title: "Voxable", desc: "Technologická firma — čistý design a přehledné služby.", url: "https://www.voxable.cz", tag: "Firemní web", image: imgVoxable },
  { title: "RocKimbo Accounting", desc: "Účetní firma — elegantní prezentace s jasným CTA.", url: "https://rockimbosvetlaverze-6bjp25rd00.edgeone.dev", tag: "Firemní web", image: imgRockimbo },
  { title: "Auta z firem", desc: "Prémiový prodej vozidel z firemních flotil.", url: "https://autazfirem.edgeone.dev", tag: "E-shop", image: imgAutazfirem },
  { title: "MiloCar", desc: "Výkup vozidel — výrazný design s jasným CTA.", url: "https://milocar.edgeone.dev", tag: "Landing page", image: imgMilocar },
  { title: "Striptýz-Show.cz", desc: "Zábavní agentura — dynamický fullscreen layout.", url: "https://sshow.edgeone.dev", tag: "Landing page", image: imgSshow },
  { title: "ETC Prague", desc: "Instalatérská firma — profesionální tmavý design.", url: "https://etcprague.edgeone.dev", tag: "Firemní web", image: imgEtcprague },
];

const PortfolioSection = () => {
  const [active, setActive] = useState("Vše");
  const [preview, setPreview] = useState<{ url: string; title: string } | null>(null);
  const filtered = active === "Vše" ? projects : projects.filter((p) => p.tag === active);

  return (
    <>
      <section id="reference" className="section-padding relative overflow-hidden">
        <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-border to-transparent" />
        <motion.div
          className="absolute bottom-[10%] left-[5%] w-[400px] h-[400px] blob-warm pointer-events-none"
          animate={{ x: [0, 30, 0], y: [0, -20, 0], scale: [1, 1.1, 1] }}
          transition={{ duration: 20, repeat: Infinity, ease: "easeInOut" }}
        />
        <motion.div
          className="absolute top-[15%] right-[8%] w-[300px] h-[300px] blob-primary pointer-events-none"
          animate={{ scale: [1, 1.2, 1], y: [0, 25, 0] }}
          transition={{ duration: 16, repeat: Infinity, ease: "easeInOut", delay: 6 }}
        />

        <div className="container mx-auto relative z-10">
          <AnimatedSection className="text-center mb-10 sm:mb-14">
            <span className="pill bg-warm/10 text-warm border border-warm/15 mb-4">Reference</span>
            <h2 className="font-heading text-3xl sm:text-4xl md:text-5xl font-bold tracking-tight mt-4">Naše práce</h2>
          </AnimatedSection>

          <AnimatedSection className="flex flex-wrap justify-center gap-2 mb-10">
            {filters.map((f) => (
              <button
                key={f}
                onClick={() => setActive(f)}
                className={`px-5 py-2 rounded-full text-sm font-medium transition-all duration-300 ${
                  active === f
                    ? "bg-foreground text-background"
                    : "bg-foreground/[0.05] text-foreground/60 hover:bg-foreground/[0.1]"
                }`}
              >
                {f}
              </button>
            ))}
          </AnimatedSection>

          <motion.div layout className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            <AnimatePresence mode="popLayout">
              {filtered.map((p, i) => (
                <motion.div
                  key={p.title}
                  layout
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  transition={{ duration: 0.4, delay: i * 0.04 }}
                >
                  <motion.div
                    whileHover={{ y: -6 }}
                    transition={{ type: "spring", stiffness: 300, damping: 25 }}
                    className="smooth-card overflow-hidden group"
                  >
                    <div
                      className="relative h-52 overflow-hidden bg-muted cursor-pointer"
                      onClick={() => setPreview({ url: p.url, title: p.title })}
                    >
                      <motion.img
                        src={p.image}
                        alt={`Náhled projektu ${p.title}`}
                        className="w-full h-full object-cover object-top"
                        loading="lazy"
                        whileHover={{ scale: 1.05 }}
                        transition={{ duration: 0.5 }}
                      />
                      <div className="absolute inset-0 bg-foreground/0 group-hover:bg-foreground/5 transition-colors duration-300 flex items-center justify-center">
                        <div className="bg-background/90 backdrop-blur-sm rounded-full p-3 opacity-0 group-hover:opacity-100 transition-all duration-300 scale-75 group-hover:scale-100">
                          <Eye size={18} className="text-foreground" />
                        </div>
                      </div>
                    </div>
                    <div className="p-5 sm:p-6">
                      <span className="text-xs text-primary font-medium tracking-wide uppercase">{p.tag}</span>
                      <h3 className="font-heading text-lg font-semibold mt-1 mb-2">{p.title}</h3>
                      <p className="text-muted-foreground text-sm leading-relaxed">{p.desc}</p>
                    </div>
                  </motion.div>
                </motion.div>
              ))}
            </AnimatePresence>
          </motion.div>
        </div>
      </section>

      <AnimatePresence>
        {preview && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-[100] bg-foreground/20 backdrop-blur-md flex flex-col">
            <div className="flex items-center justify-between bg-background border-b border-border px-4 sm:px-6 py-3 shrink-0">
              <div className="flex items-center gap-3 min-w-0">
                <span className="font-heading font-semibold text-sm sm:text-base truncate">{preview.title}</span>
                <a href={preview.url} target="_blank" rel="noopener noreferrer" className="text-muted-foreground hover:text-foreground transition-colors shrink-0">
                  <ExternalLink size={16} />
                </a>
              </div>
              <button onClick={() => setPreview(null)} className="w-9 h-9 rounded-full bg-muted hover:bg-border flex items-center justify-center transition-colors shrink-0">
                <X size={18} />
              </button>
            </div>
            <div className="flex-1 bg-muted">
              <iframe src={preview.url} title={preview.title} className="w-full h-full border-0" sandbox="allow-scripts allow-same-origin allow-popups" />
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};

export default PortfolioSection;
