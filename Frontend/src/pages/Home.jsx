// src/Home.jsx
import { HeroCarousel } from '../components/home/HeroCarousel';
import { Features } from '../components/home/Features';
import { CategoryGrid } from '../components/home/CategoryGrid';
import { Bestsellers } from '../components/home/Bestsellers';
import { NewArrivals } from '../components/home/NewArrivals';
import { BrandStory } from '../components/home/BrandStory';
import { NewsletterSignup } from '../components/home/NewsletterSignup';
import { Testimonials } from '../components/home/Testimonials';

function Home() {
  return (
    <div className="min-h-screen bg-white">
      <HeroCarousel />
      <Features />
      <CategoryGrid />
      <Bestsellers />
      <NewArrivals />
      <Testimonials />
      <BrandStory />
      <NewsletterSignup />
    </div>
  );
}

export default Home;