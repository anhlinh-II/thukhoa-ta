import CategoriesClient from "@/share/components/home/CategoriesClient";
import HeaderClient from "@/share/components/home/HeaderClient";
import HeroClient from "@/share/components/home/HeroClient";
import FeaturesSection from "@/share/components/home/FeaturesSection";
import CTASection from "@/share/components/home/CTASection";

export const metadata = {
  title: 'QuizMaster',
  description: 'Daily English Quiz platform',
};

export default function HomePage() {
  // Keep this file minimal: composition only. Interactive pieces live in client components.
  return (
    <div className="home-bright">
      <main>
        <HeroClient />
        <FeaturesSection />
        <CTASection />
        <CategoriesClient />
      </main>
    </div>
  );
}