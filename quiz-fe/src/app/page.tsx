import HeaderClient from '../components/home/HeaderClient';
import HeroClient from '../components/home/HeroClient';
import CategoriesClient from '../components/home/CategoriesClient';

export const metadata = {
  title: 'QuizMaster',
  description: 'Daily English Quiz platform',
};

export default function HomePage() {
  // Keep this file minimal: composition only. Interactive pieces live in client components.
  return (
    <div>
      <HeaderClient />
      <main>
        <HeroClient />
        <CategoriesClient />
      </main>
    </div>
  );
}