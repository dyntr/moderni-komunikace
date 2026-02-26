const Footer = () => (
  <footer className="border-t border-border py-10 px-4">
    <div className="container mx-auto flex flex-col md:flex-row items-center justify-between gap-4 text-sm text-muted-foreground">
      <span className="font-heading font-bold text-foreground text-lg">
        <span className="text-gradient">moderní</span>
        <span className="text-foreground/80"> komunikace</span>
      </span>
      <span>© {new Date().getFullYear()} Noeveris s.r.o. | IČO: 23876247 | Všechna práva vyhrazena.</span>
    </div>
  </footer>
);

export default Footer;
