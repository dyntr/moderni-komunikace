import { motion } from "framer-motion";

const BackgroundAnimations = () => (
  <div className="fixed inset-0 pointer-events-none z-0 overflow-hidden">
    {/* Large moving blobs — more visible & more movement */}
    <motion.div
      className="absolute w-[700px] h-[700px] rounded-full"
      style={{ background: "radial-gradient(circle, hsl(250 85% 60% / 0.15) 0%, transparent 65%)", top: "5%", left: "-10%" }}
      animate={{ x: [0, 150, -40, 0], y: [0, 80, -30, 0], scale: [1, 1.35, 0.9, 1] }}
      transition={{ duration: 20, repeat: Infinity, ease: "easeInOut" }}
    />
    <motion.div
      className="absolute w-[600px] h-[600px] rounded-full"
      style={{ background: "radial-gradient(circle, hsl(340 82% 62% / 0.13) 0%, transparent 65%)", top: "25%", right: "-12%" }}
      animate={{ x: [0, -120, 50, 0], y: [0, 100, -40, 0], scale: [1, 1.25, 0.95, 1] }}
      transition={{ duration: 18, repeat: Infinity, ease: "easeInOut", delay: 3 }}
    />
    <motion.div
      className="absolute w-[800px] h-[800px] rounded-full"
      style={{ background: "radial-gradient(circle, hsl(30 90% 62% / 0.12) 0%, transparent 65%)", top: "50%", left: "15%" }}
      animate={{ x: [0, 100, -60, 0], y: [0, -80, 50, 0], scale: [1, 1.2, 0.9, 1] }}
      transition={{ duration: 24, repeat: Infinity, ease: "easeInOut", delay: 6 }}
    />
    <motion.div
      className="absolute w-[500px] h-[500px] rounded-full"
      style={{ background: "radial-gradient(circle, hsl(250 85% 60% / 0.1) 0%, transparent 65%)", top: "70%", right: "5%" }}
      animate={{ x: [0, -80, 40, 0], y: [0, -100, 30, 0], scale: [1, 1.3, 1] }}
      transition={{ duration: 16, repeat: Infinity, ease: "easeInOut", delay: 10 }}
    />
    <motion.div
      className="absolute w-[650px] h-[650px] rounded-full"
      style={{ background: "radial-gradient(circle, hsl(340 82% 62% / 0.1) 0%, transparent 65%)", bottom: "0%", left: "-15%" }}
      animate={{ x: [0, 130, -20, 0], y: [0, -60, 40, 0], scale: [1, 1.3, 0.95, 1] }}
      transition={{ duration: 22, repeat: Infinity, ease: "easeInOut", delay: 5 }}
    />

    {/* Floating geometric shapes — bigger borders, more travel */}
    <motion.div
      className="absolute w-20 h-20 rounded-2xl border-2 border-primary/15 hidden lg:block"
      style={{ top: "18%", right: "12%" }}
      animate={{ rotate: [0, 180, 360], y: [-40, 40, -40], x: [-25, 25, -25] }}
      transition={{ duration: 14, repeat: Infinity, ease: "easeInOut" }}
    />
    <motion.div
      className="absolute w-14 h-14 rounded-xl border-2 border-accent/15 hidden lg:block"
      style={{ top: "42%", left: "6%" }}
      animate={{ rotate: [45, -90, 45], y: [-30, 30, -30], x: [0, 20, 0] }}
      transition={{ duration: 11, repeat: Infinity, ease: "easeInOut", delay: 2 }}
    />
    <motion.div
      className="absolute w-24 h-24 rounded-3xl border-2 border-warm/12 hidden lg:block"
      style={{ top: "62%", right: "6%" }}
      animate={{ rotate: [0, 120, 0], scale: [1, 1.15, 1], y: [-20, 30, -20] }}
      transition={{ duration: 16, repeat: Infinity, ease: "easeInOut", delay: 5 }}
    />
    <motion.div
      className="absolute w-16 h-16 rounded-2xl border-2 border-primary/12 hidden lg:block"
      style={{ top: "82%", left: "10%" }}
      animate={{ rotate: [-45, 90, -45], y: [0, -40, 0], x: [-15, 15, -15] }}
      transition={{ duration: 13, repeat: Infinity, ease: "easeInOut", delay: 8 }}
    />
    <motion.div
      className="absolute w-12 h-12 rounded-xl border-2 border-accent/12 hidden lg:block"
      style={{ top: "35%", right: "30%" }}
      animate={{ rotate: [0, -180, -360], y: [-25, 35, -25] }}
      transition={{ duration: 15, repeat: Infinity, ease: "easeInOut", delay: 4 }}
    />

    {/* Floating dots — larger, more visible, more movement */}
    {[
      { top: "12%", left: "22%", color: "bg-primary/35", size: "w-4 h-4", dur: 6, del: 0 },
      { top: "32%", right: "22%", color: "bg-accent/40", size: "w-3 h-3", dur: 5, del: 1 },
      { top: "48%", left: "38%", color: "bg-warm/35", size: "w-5 h-5", dur: 8, del: 3 },
      { top: "68%", right: "18%", color: "bg-primary/30", size: "w-3.5 h-3.5", dur: 6, del: 4 },
      { top: "22%", left: "50%", color: "bg-accent/30", size: "w-3 h-3", dur: 7, del: 1 },
      { top: "78%", left: "58%", color: "bg-warm/30", size: "w-4 h-4", dur: 9, del: 6 },
      { top: "38%", left: "78%", color: "bg-primary/35", size: "w-3 h-3", dur: 5, del: 2 },
      { top: "58%", left: "8%", color: "bg-accent/35", size: "w-4.5 h-4.5", dur: 10, del: 5 },
      { top: "88%", left: "40%", color: "bg-warm/25", size: "w-3 h-3", dur: 7, del: 7 },
      { top: "5%", left: "65%", color: "bg-primary/25", size: "w-3.5 h-3.5", dur: 8, del: 3 },
    ].map((dot, i) => (
      <motion.div
        key={i}
        className={`absolute rounded-full ${dot.color} ${dot.size} hidden md:block`}
        style={{ top: dot.top, left: dot.left, right: (dot as any).right }}
        animate={{
          y: [-25, 25, -25],
          x: [-15, 15, -15],
          scale: [1, 1.8, 1],
          opacity: [0.4, 1, 0.4],
        }}
        transition={{ duration: dot.dur, repeat: Infinity, ease: "easeInOut", delay: dot.del }}
      />
    ))}

    {/* Grid overlay */}
    <div
      className="absolute inset-0 opacity-[0.025]"
      style={{
        backgroundImage: "linear-gradient(hsl(220 25% 12%) 1px, transparent 1px), linear-gradient(90deg, hsl(220 25% 12%) 1px, transparent 1px)",
        backgroundSize: "100px 100px",
      }}
    />
  </div>
);

export default BackgroundAnimations;
