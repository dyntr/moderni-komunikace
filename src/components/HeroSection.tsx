import { motion } from "framer-motion";
import { ArrowRight, Sparkles } from "lucide-react";
import AnimatedCounter from "./AnimatedCounter";

const words = ["prodávají.", "zaujmou.", "konvertují.", "rostou."];

const HeroSection = () => (
  <section className="relative min-h-screen flex items-center justify-center section-padding pt-28 sm:pt-36 overflow-hidden">
    {/* Vivid background blobs */}
    <div className="absolute inset-0 overflow-hidden pointer-events-none">
      <motion.div
        className="absolute -top-[30%] right-[10%] w-[700px] h-[700px] rounded-full"
        style={{ background: "radial-gradient(circle, hsl(250 85% 60% / 0.12) 0%, transparent 60%)" }}
        animate={{ scale: [1, 1.2, 1], rotate: [0, 30, 0] }}
        transition={{ duration: 20, repeat: Infinity, ease: "easeInOut" }}
      />
      <motion.div
        className="absolute top-[50%] -left-[20%] w-[600px] h-[600px] rounded-full"
        style={{ background: "radial-gradient(circle, hsl(340 82% 62% / 0.1) 0%, transparent 60%)" }}
        animate={{ scale: [1, 1.15, 1], x: [0, 40, 0] }}
        transition={{ duration: 18, repeat: Infinity, ease: "easeInOut", delay: 3 }}
      />
      <motion.div
        className="absolute -bottom-[15%] right-[30%] w-[500px] h-[500px] rounded-full"
        style={{ background: "radial-gradient(circle, hsl(30 90% 62% / 0.1) 0%, transparent 60%)" }}
        animate={{ scale: [1, 1.25, 1] }}
        transition={{ duration: 14, repeat: Infinity, ease: "easeInOut", delay: 5 }}
      />

      {/* Grid pattern overlay */}
      <div
        className="absolute inset-0 opacity-[0.03]"
        style={{
          backgroundImage: "linear-gradient(hsl(220 25% 12%) 1px, transparent 1px), linear-gradient(90deg, hsl(220 25% 12%) 1px, transparent 1px)",
          backgroundSize: "80px 80px",
        }}
      />

      {/* Decorative shapes */}
      <motion.div
        className="absolute top-[15%] left-[8%] w-20 h-20 rounded-3xl border border-primary/15 hidden lg:block"
        animate={{ rotate: [0, 90, 0], y: [-10, 10, -10] }}
        transition={{ duration: 12, repeat: Infinity, ease: "easeInOut" }}
      />
      <motion.div
        className="absolute top-[25%] right-[8%] w-4 h-4 rounded-full bg-accent/30 hidden lg:block"
        animate={{ scale: [1, 1.8, 1], opacity: [0.3, 0.7, 0.3] }}
        transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
      />
      <motion.div
        className="absolute bottom-[25%] left-[15%] w-3 h-3 rounded-full bg-warm/40 hidden lg:block"
        animate={{ scale: [1, 2, 1], opacity: [0.4, 0.8, 0.4] }}
        transition={{ duration: 5, repeat: Infinity, ease: "easeInOut", delay: 1 }}
      />
      <motion.div
        className="absolute bottom-[30%] right-[12%] w-16 h-16 rounded-2xl border border-warm/10 hidden lg:block"
        animate={{ rotate: [45, 135, 45], y: [0, -15, 0] }}
        transition={{ duration: 16, repeat: Infinity, ease: "easeInOut" }}
      />
    </div>

    <div className="container mx-auto relative z-10">
      <div className="max-w-7xl mx-auto text-center">
        {/* Badge */}
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5, delay: 0.1, type: "spring" }}
          className="inline-flex items-center gap-2 bg-foreground/[0.06] backdrop-blur-sm border border-foreground/[0.08] rounded-full px-5 py-2 mb-8"
        >
          <motion.div
            animate={{ rotate: [0, 15, -15, 0] }}
            transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
          >
            <Sparkles size={14} className="text-primary" />
          </motion.div>
          <span className="text-sm font-medium text-foreground/70">Webdesign studio</span>
        </motion.div>

        {/* Main heading with staggered word reveal */}
        <div className="overflow-hidden mb-3">
          <motion.h1
            initial={{ opacity: 0, y: 60 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.9, delay: 0.2, ease: [0.22, 1, 0.36, 1] }}
            className="font-heading text-5xl sm:text-6xl md:text-7xl lg:text-[6.5rem] xl:text-[8rem] font-extrabold leading-[0.95] tracking-tighter"
          >
            Tvoříme weby,
          </motion.h1>
        </div>
        <div className="overflow-hidden mb-8">
          <motion.h1
            initial={{ opacity: 0, y: 60 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.9, delay: 0.35, ease: [0.22, 1, 0.36, 1] }}
            className="font-heading text-5xl sm:text-6xl md:text-7xl lg:text-[6.5rem] xl:text-[8rem] font-extrabold leading-[0.95] tracking-tighter"
          >
            které{" "}
            <motion.span
              className="text-gradient inline-block"
              animate={{ backgroundPosition: ["0% 50%", "100% 50%", "0% 50%"] }}
              transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }}
              style={{ backgroundSize: "200% 200%" }}
            >
              prodávají.
            </motion.span>
          </motion.h1>
        </div>

        {/* Subtitle with line */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.55 }}
          className="flex items-center justify-center gap-4 mb-10"
        >
          <motion.div
            initial={{ scaleX: 0 }}
            animate={{ scaleX: 1 }}
            transition={{ duration: 0.8, delay: 0.7 }}
            className="h-px w-12 bg-gradient-to-r from-transparent to-foreground/20 hidden sm:block origin-right"
          />
          <p className="text-lg sm:text-xl text-muted-foreground max-w-lg leading-relaxed">
            Moderní weby na míru — rychlé, krásné a&nbsp;připravené pro růst.
          </p>
          <motion.div
            initial={{ scaleX: 0 }}
            animate={{ scaleX: 1 }}
            transition={{ duration: 0.8, delay: 0.7 }}
            className="h-px w-12 bg-gradient-to-l from-transparent to-foreground/20 hidden sm:block origin-left"
          />
        </motion.div>

        {/* CTA buttons */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.7 }}
          className="flex flex-col sm:flex-row gap-4 justify-center mb-16 sm:mb-20"
        >
          <motion.a
            href="#kontakt"
            whileHover={{ scale: 1.04 }}
            whileTap={{ scale: 0.97 }}
            className="inline-flex items-center justify-center gap-2 bg-foreground text-background font-medium px-8 py-4 rounded-full text-base shadow-[0_8px_30px_hsl(220_25%_12%/0.12)] hover:shadow-[0_12px_40px_hsl(220_25%_12%/0.2)] transition-shadow group"
          >
            Nezávazná konzultace
            <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform" />
          </motion.a>
          <motion.a
            href="#reference"
            whileHover={{ scale: 1.04 }}
            whileTap={{ scale: 0.97 }}
            className="inline-flex items-center justify-center gap-2 border-2 border-foreground/12 text-foreground font-medium px-8 py-4 rounded-full text-base hover:border-foreground/25 hover:bg-foreground/[0.03] transition-all"
          >
            Ukázky naší práce
          </motion.a>
        </motion.div>

        {/* Counters with colored accents */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 0.9 }}
          className="flex justify-center gap-10 sm:gap-16"
        >
          <div className="relative">
            <div className="absolute -inset-4 rounded-2xl bg-primary/[0.04]" />
            <AnimatedCounter target={120} suffix="+" label="Projektů" />
          </div>
          <div className="w-px bg-gradient-to-b from-transparent via-border to-transparent" />
          <div className="relative">
            <div className="absolute -inset-4 rounded-2xl bg-accent/[0.04]" />
            <AnimatedCounter target={95} suffix="%" label="Spokojených" />
          </div>
          <div className="w-px bg-gradient-to-b from-transparent via-border to-transparent" />
          <div className="relative">
            <div className="absolute -inset-4 rounded-2xl bg-warm/[0.04]" />
            <AnimatedCounter target={5} suffix="+" label="Let praxe" />
          </div>
        </motion.div>
      </div>
    </div>

    {/* Scroll indicator */}
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ delay: 1.5 }}
      className="absolute bottom-10 left-1/2 -translate-x-1/2"
    >
      <motion.div
        animate={{ y: [0, 8, 0] }}
        transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
        className="w-6 h-10 rounded-full border-2 border-foreground/15 flex items-start justify-center p-1.5"
      >
        <motion.div
          className="w-1.5 h-3 rounded-full bg-primary/40"
          animate={{ y: [0, 8, 0], opacity: [1, 0.3, 1] }}
          transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
        />
      </motion.div>
    </motion.div>
  </section>
);

export default HeroSection;
