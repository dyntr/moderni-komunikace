import { useState } from "react";
import { Send, Mail, Phone, MapPin, Loader2 } from "lucide-react";
import { motion } from "framer-motion";
import AnimatedSection from "./AnimatedSection";
import { useToast } from "@/hooks/use-toast";

const ContactSection = () => {
  const [form, setForm] = useState({ name: "", email: "", message: "" });
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await fetch("https://api.web3forms.com/submit", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          access_key: "c27d515c-bb87-4827-a9f2-ccf781fb010a",
          name: form.name,
          email: form.email,
          message: form.message,
          subject: `Nová poptávka z webu od ${form.name}`,
        }),
      });
      const data = await res.json();
      if (data.success) {
        toast({ title: "Odesláno! ✅", description: "Děkujeme za zprávu, ozveme se vám co nejdříve." });
        setForm({ name: "", email: "", message: "" });
      } else {
        throw new Error("Odeslání selhalo");
      }
    } catch {
      toast({ title: "Chyba ❌", description: "Nepodařilo se odeslat zprávu. Zkuste to prosím znovu.", variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };

  return (
    <section id="kontakt" className="section-padding relative overflow-hidden">
      <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-border to-transparent" />
      <motion.div
        className="absolute top-[10%] right-0 w-[500px] h-[500px] blob-accent pointer-events-none"
        animate={{ x: [0, -30, 0], y: [0, 20, 0], scale: [1, 1.1, 1] }}
        transition={{ duration: 22, repeat: Infinity, ease: "easeInOut" }}
      />
      <motion.div
        className="absolute bottom-[10%] left-0 w-[400px] h-[400px] blob-primary pointer-events-none"
        animate={{ x: [0, 35, 0], scale: [1, 1.15, 1] }}
        transition={{ duration: 18, repeat: Infinity, ease: "easeInOut", delay: 4 }}
      />

      <div className="container mx-auto max-w-5xl relative z-10">
        <AnimatedSection className="text-center mb-10 sm:mb-14">
          <span className="pill bg-primary/10 text-primary border border-primary/15 mb-4">Kontakt</span>
          <h2 className="font-heading text-3xl sm:text-4xl md:text-5xl font-bold tracking-tight mt-4">
            Posuňme váš web
            <br className="hidden sm:block" /> na další úroveň
          </h2>
        </AnimatedSection>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 sm:gap-10">
          <AnimatedSection>
            <div className="smooth-card p-6 sm:p-8">
              <form onSubmit={handleSubmit} className="space-y-5">
                <div>
                  <label className="text-sm font-medium mb-1.5 block">Jméno</label>
                  <input
                    type="text"
                    required
                    value={form.name}
                    onChange={(e) => setForm({ ...form, name: e.target.value })}
                    className="w-full bg-muted border border-border rounded-xl px-4 py-3 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary/30 transition-all"
                    placeholder="Vaše jméno"
                  />
                </div>
                <div>
                  <label className="text-sm font-medium mb-1.5 block">E-mail</label>
                  <input
                    type="email"
                    required
                    value={form.email}
                    onChange={(e) => setForm({ ...form, email: e.target.value })}
                    className="w-full bg-muted border border-border rounded-xl px-4 py-3 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary/30 transition-all"
                    placeholder="vas@email.cz"
                  />
                </div>
                <div>
                  <label className="text-sm font-medium mb-1.5 block">Zpráva</label>
                  <textarea
                    required
                    rows={5}
                    value={form.message}
                    onChange={(e) => setForm({ ...form, message: e.target.value })}
                    className="w-full bg-muted border border-border rounded-xl px-4 py-3 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary/30 transition-all resize-none"
                    placeholder="Popište nám svůj projekt…"
                  />
                </div>
                <motion.button
                  type="submit"
                  disabled={loading}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  className="inline-flex items-center gap-2 bg-foreground text-background font-medium px-8 py-3.5 rounded-full text-sm hover:opacity-90 transition-opacity disabled:opacity-60"
                >
                  {loading ? <><Loader2 size={15} className="animate-spin" /> Odesílám…</> : <>Odeslat zprávu <Send size={15} /></>}
                </motion.button>
              </form>
            </div>
          </AnimatedSection>

          <AnimatedSection delay={0.15} className="flex flex-col justify-center gap-6">
            <div>
              <h3 className="font-heading font-semibold text-lg mb-5">Kontaktní údaje</h3>
              <div className="space-y-4">
                {[
                  { icon: Mail, label: "info@modernikomunikace.com", href: "mailto:info@modernikomunikace.com" },
                  { icon: Phone, label: "704 096 969", href: "tel:+420704096969" },
                  { icon: MapPin, label: "Příčná 1892/4, Praha 1, 110 00" },
                ].map((item) => {
                  const Wrapper = item.href ? "a" : "div";
                  return (
                    <motion.div key={item.label} whileHover={{ x: 4 }} transition={{ type: "spring", stiffness: 300 }}>
                      <Wrapper {...(item.href ? { href: item.href } : {})} className="flex items-center gap-3 text-muted-foreground hover:text-foreground transition-colors group">
                        <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center group-hover:bg-primary/15 transition-colors">
                          <item.icon size={17} className="text-primary" />
                        </div>
                        <span className="text-sm">{item.label}</span>
                      </Wrapper>
                    </motion.div>
                  );
                })}
              </div>
            </div>

            <div className="flex gap-3 mt-2">
              <motion.a whileHover={{ y: -2 }} href="mailto:info@modernikomunikace.com" className="inline-flex items-center gap-2 bg-muted border border-border text-foreground font-medium px-5 py-2.5 rounded-full text-sm hover:bg-border/60 transition-all">
                <Mail size={15} /> Napsat email
              </motion.a>
              <motion.a whileHover={{ y: -2 }} href="tel:+420704096969" className="inline-flex items-center gap-2 bg-muted border border-border text-foreground font-medium px-5 py-2.5 rounded-full text-sm hover:bg-border/60 transition-all">
                <Phone size={15} /> Zavolat
              </motion.a>
            </div>
          </AnimatedSection>
        </div>
      </div>
    </section>
  );
};

export default ContactSection;
