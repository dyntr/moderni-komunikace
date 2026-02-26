import { useState, useEffect } from "react";
import { Menu, X, ArrowUpRight } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

const links = [
  { label: "Služby", href: "#sluzby" },
  { label: "Proč my", href: "#proc-my" },
  { label: "Reference", href: "#reference" },
  { label: "Proces", href: "#proces" },
  { label: "Ceník", href: "#cenik" },
  { label: "FAQ", href: "#faq" },
];

const Navbar = () => {
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  useEffect(() => {
    const handler = () => setScrolled(window.scrollY > 40);
    window.addEventListener("scroll", handler);
    return () => window.removeEventListener("scroll", handler);
  }, []);

  return (
    <nav
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-500 ${
        scrolled
          ? "bg-background/80 backdrop-blur-2xl border-b border-border/40 shadow-[0_1px_20px_hsl(220_25%_12%/0.04)]"
          : "bg-transparent"
      }`}
    >
      <div className="container mx-auto flex items-center justify-between h-16 md:h-20 px-4">
        <a href="#" className="font-heading text-xl md:text-2xl font-bold tracking-tight">
          <span className="text-gradient">moderní</span>
          <span className="text-foreground/80"> komunikace</span>
        </a>

        <div className="hidden md:flex items-center gap-1">
          {links.map((l) => (
            <a
              key={l.href}
              href={l.href}
              className="text-sm text-muted-foreground hover:text-foreground px-3.5 py-2 rounded-xl hover:bg-foreground/[0.04] transition-all duration-300"
            >
              {l.label}
            </a>
          ))}
          <a
            href="#kontakt"
            className="ml-3 inline-flex items-center gap-1.5 text-sm font-medium bg-foreground text-background px-5 py-2.5 rounded-full hover:opacity-90 transition-opacity"
          >
            Konzultace <ArrowUpRight size={14} />
          </a>
        </div>

        <button className="md:hidden text-foreground" onClick={() => setMobileOpen(!mobileOpen)}>
          {mobileOpen ? <X size={24} /> : <Menu size={24} />}
        </button>
      </div>

      <AnimatePresence>
        {mobileOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className="md:hidden bg-background/95 backdrop-blur-2xl border-b border-border/40 overflow-hidden"
          >
            <div className="flex flex-col gap-1 p-5">
              {links.map((l) => (
                <a key={l.href} href={l.href} className="text-foreground/70 hover:text-foreground py-2.5 px-3 rounded-xl hover:bg-foreground/[0.04] transition-all" onClick={() => setMobileOpen(false)}>
                  {l.label}
                </a>
              ))}
              <a href="#kontakt" className="bg-foreground text-background px-5 py-3 rounded-full text-center font-medium mt-2" onClick={() => setMobileOpen(false)}>
                Konzultace
              </a>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </nav>
  );
};

export default Navbar;
