import { Navbar } from "@/components/landing/Navbar";
import { Features as FeaturesSection } from "@/components/landing/Features";
import { Footer } from "@/components/landing/Footer";

const FeaturesPage = () => (
  <div className="min-h-screen bg-background">
    <Navbar />
    <div className="pt-24">
      <FeaturesSection />
    </div>
    <Footer />
  </div>
);

export default FeaturesPage;
