// src/components/home/Features.jsx - PINK THEME ✅
import { Shield, Truck, RefreshCw, Gem } from 'lucide-react';

const features = [
  {
    icon: Shield,
    title: "100% Certified",
    description: "Hallmarked jewellery with authenticity certificate"
  },
  {
    icon: Truck,
    title: "Free Shipping",
    description: "On orders above ₹50,000"
  },
  {
    icon: RefreshCw,
    title: "30-Day Returns",
    description: "Easy returns & exchange policy"
  },
  {
    icon: Gem,
    title: "Lifetime Maintenance",
    description: "Free cleaning & polishing"
  }
];

export function Features() {
  return (
    <section className="py-16 bg-gradient-to-b from-white to-pink-50/20">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
          {features.map((feature, index) => (
            <div 
              key={index} 
              className="text-center group cursor-pointer p-6 rounded-2xl transition-all duration-500 hover:shadow-pink-lg hover:bg-white/50"
            >
              <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-pink-50 to-rose-50 rounded-full mb-4 group-hover:bg-gradient-to-br group-hover:from-pink-100 group-hover:to-rose-100 transition-all duration-500 shadow-sm group-hover:shadow-pink-md">
                <feature.icon className="w-8 h-8 text-pink-600 group-hover:text-pink-700 transition-colors duration-300" />
              </div>
              <h3 className="font-semibold text-gray-900 mb-2 group-hover:text-pink-600 transition-colors duration-300">
                {feature.title}
              </h3>
              <p className="text-gray-500 text-sm group-hover:text-gray-700 transition-colors duration-300">
                {feature.description}
              </p>
            </div>
          ))}
        </div>

        {/* Optional: Decorative divider with pink theme */}
        <div className="flex items-center justify-center gap-4 mt-12">
          <span className="w-20 h-0.5 bg-gradient-to-r from-transparent to-pink-300"></span>
          <span className="w-2 h-2 bg-pink-400 rounded-full animate-pulse"></span>
          <span className="w-20 h-0.5 bg-gradient-to-l from-transparent to-pink-300"></span>
        </div>
      </div>
    </section>
  );
}