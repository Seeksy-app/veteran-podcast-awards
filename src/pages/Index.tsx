import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { Hero } from "@/components/home/Hero";
import { CategoriesPreview } from "@/components/home/CategoriesPreview";
import { HowItWorks } from "@/components/home/HowItWorks";
import { CallToAction } from "@/components/home/CallToAction";

const Index = () => {
  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main>
        <Hero />
        <HowItWorks />
        <CategoriesPreview />
        <CallToAction />
      </main>
      <Footer />
    </div>
  );
};

export default Index;
