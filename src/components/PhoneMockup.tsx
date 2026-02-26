import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Smartphone } from "lucide-react";

import imgSocialGoals from "@/assets/portfolio/socialgoals.png";
import imgVoxable from "@/assets/portfolio/voxable.png";
import imgRockimbo from "@/assets/portfolio/rockimbo.png";
import imgMilocar from "@/assets/portfolio/milocar.png";

const screenshots = [imgSocialGoals, imgVoxable, imgRockimbo, imgMilocar];

const PhoneMockup = ({ className = "" }: { className?: string }) => {
  const [expanded, setExpanded] = useState(false);
  const [currentImg, setCurrentImg] = useState(0);

  // Cycle images every 4s
  useState(() => {
    const interval = setInterval(() => {
      setCurrentImg((prev) => (prev + 1) % screenshots.length);
    }, 4000);
    return () => clearInterval(interval);
  });

  return (
    <div className={`relative ${className}`}>
      {/* Small floating phone icon / trigger */}
      <motion.div
        className="cursor-pointer relative z-30"
        onHoverStart={() => setExpanded(true)}
        onHoverEnd={() => setExpanded(false)}
        onClick={() => setExpanded(!expanded)}
      >
        {/* Small phone preview */}
        <motion.div
          className="phone-mockup w-[56px] h-[100px] overflow-hidden relative"
          animate={{
            y: [0, -6, 0],
          }}
          transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
        >
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[28px] h-[6px] phone-notch z-20 rounded-b-md" />
          <div className="absolute inset-[2px] rounded-[0.85rem] overflow-hidden bg-muted">
            <img
              src={screenshots[currentImg]}
              alt="Web preview"
              className="w-full h-full object-cover object-top"
            />
          </div>
          <div className="absolute bottom-1 left-1/2 -translate-x-1/2 w-[20px] h-[2px] rounded-full bg-foreground/20 z-20" />
        </motion.div>

        {/* Glow pulse behind */}
        <div className="absolute -inset-3 bg-primary/10 rounded-full blur-xl animate-pulse pointer-events-none" />
        
        {/* Label */}
        <motion.span
          className="absolute -bottom-6 left-1/2 -translate-x-1/2 text-[10px] text-muted-foreground whitespace-nowrap font-medium"
          animate={{ opacity: expanded ? 0 : 1 }}
        >
          <Smartphone size={10} className="inline mr-0.5 -mt-0.5" /> Ukázka
        </motion.span>
      </motion.div>

      {/* Expanded phone on hover */}
      <AnimatePresence>
        {expanded && (
          <motion.div
            className="absolute bottom-full right-0 mb-3 z-40"
            initial={{ opacity: 0, scale: 0.6, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.6, y: 20 }}
            transition={{ type: "spring", stiffness: 400, damping: 25 }}
          >
            {/* Backdrop glow */}
            <div className="absolute -inset-6 bg-gradient-to-br from-primary/15 via-accent/10 to-transparent rounded-3xl blur-2xl pointer-events-none" />
            
            <div className="phone-mockup w-[200px] h-[400px] overflow-hidden relative">
              <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[80px] h-[18px] phone-notch z-20 rounded-b-lg" />
              <div className="absolute inset-[3px] rounded-[1.6rem] overflow-hidden bg-muted">
                <AnimatePresence mode="wait">
                  <motion.img
                    key={currentImg}
                    src={screenshots[currentImg]}
                    alt="Ukázka webu"
                    className="w-full object-cover object-top absolute inset-0"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1, y: ["0%", "-30%", "0%"] }}
                    exit={{ opacity: 0 }}
                    transition={{
                      opacity: { duration: 0.4 },
                      y: { duration: 8, repeat: Infinity, ease: "easeInOut" },
                    }}
                  />
                </AnimatePresence>
              </div>
              <div className="absolute bottom-2 left-1/2 -translate-x-1/2 w-[70px] h-[3px] rounded-full bg-foreground/20 z-20" />
            </div>

            {/* Dots indicator */}
            <div className="flex justify-center gap-1.5 mt-2">
              {screenshots.map((_, i) => (
                <div
                  key={i}
                  className={`w-1.5 h-1.5 rounded-full transition-colors duration-300 ${
                    i === currentImg ? "bg-primary" : "bg-muted-foreground/30"
                  }`}
                />
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default PhoneMockup;
