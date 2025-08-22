import Header from "../components/Header";
import Hero from "../components/Hero";
import Features from "../components/Features";
import PricingPlans from "../components/PricingPlans";

export default function Page() {
  return (
    <div className="relative min-h-screen overflow-hidden">
      <Header />
      <Hero />
      <Features />
      <PricingPlans />
    </div>
  );
}
