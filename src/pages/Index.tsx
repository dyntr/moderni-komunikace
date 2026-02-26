import Navbar from "@/components/Navbar";
import HeroSection from "@/components/HeroSection";
import ServicesSection from "@/components/ServicesSection";
import BenefitsSection from "@/components/BenefitsSection";
import PortfolioSection from "@/components/PortfolioSection";
import ProcessSection from "@/components/ProcessSection";
import PricingSection from "@/components/PricingSection";
import FAQSection from "@/components/FAQSection";
import ContactSection from "@/components/ContactSection";
import Footer from "@/components/Footer";
import BackgroundAnimations from "@/components/BackgroundAnimations";

const Index = () => (
  <div className="min-h-screen bg-background text-foreground relative">
    <BackgroundAnimations />
    <Navbar />
    <HeroSection />
    <ServicesSection />
    <BenefitsSection />
    <PortfolioSection />
    <ProcessSection />
    <PricingSection />
    <FAQSection />
    <ContactSection />
    <Footer />
  </div>
);

export default Index;
