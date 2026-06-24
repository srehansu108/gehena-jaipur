// src/pages/AboutUs.jsx - PINK THEME ✅
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Award, Gem, Shield, Truck, Clock, 
  Users, Star, Heart, Crown, Sparkles,
  ChevronRight, Quote, MapPin, Phone,
  Mail, Instagram, Facebook, Twitter,
  Youtube, Globe, Leaf, BadgeCheck
} from 'lucide-react';

export function AboutUs() {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('story');

  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  // Team members data
  const teamMembers = [
    {
      name: 'Rajesh Kumar',
      role: 'Founder & CEO',
      image: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=300&h=300&fit=crop',
      description: 'With over 25 years of experience in the jewelry industry, Rajesh brings a vision of excellence and authenticity.'
    },
    {
      name: 'Priya Singh',
      role: 'Head of Design',
      image: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=300&h=300&fit=crop',
      description: 'A graduate from NIFT, Priya leads our design team with a passion for blending traditional craftsmanship with modern aesthetics.'
    },
    {
      name: 'Amit Sharma',
      role: 'Master Craftsman',
      image: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=300&h=300&fit=crop',
      description: 'With 30 years of experience in jewelry making, Amit ensures every piece meets the highest standards of quality.'
    },
    {
      name: 'Sneha Patel',
      role: 'Quality Assurance Head',
      image: 'https://images.unsplash.com/photo-1580489944761-15a19d654956?w=300&h=300&fit=crop',
      description: 'Sneha leads our QA team with a commitment to perfection, ensuring each piece is flawless and certified.'
    },
  ];

  // Milestones data
  const milestones = [
    { year: '1994', title: 'The Beginning', description: 'Gehna Store was founded with a vision to bring authentic Indian jewelry to the world.' },
    { year: '2000', title: 'Global Expansion', description: 'Started exporting to international markets across Europe and the Middle East.' },
    { year: '2010', title: 'Digital Revolution', description: 'Launched our online store to reach customers worldwide.' },
    { year: '2015', title: 'Craftsmanship Excellence', description: 'Recognized for exceptional design and quality standards globally.' },
    { year: '2020', title: 'Sustainable Future', description: 'Committed to ethical sourcing and sustainable practices.' },
    { year: '2024', title: '30 Years of Legacy', description: 'Celebrating three decades of timeless elegance and craftsmanship.' },
  ];

  // Values data
  const values = [
    {
      icon: <Gem className="w-6 h-6" />,
      title: 'Authenticity',
      description: 'Every piece is crafted with genuine materials and carries a certificate of authenticity.'
    },
    {
      icon: <Shield className="w-6 h-6" />,
      title: 'Quality Assurance',
      description: 'Rigorous quality checks at every stage ensure you receive nothing but the best.'
    },
    {
      icon: <Heart className="w-6 h-6" />,
      title: 'Customer Trust',
      description: 'We build lasting relationships through transparency and exceptional service.'
    },
    {
      icon: <Sparkles className="w-6 h-6" />,
      title: 'Innovation',
      description: 'Blending traditional techniques with contemporary design for unique creations.'
    },
  ];

  // Certifications
  const certifications = [
    { icon: <BadgeCheck className="w-8 h-8" />, label: 'IGI Certified' },
    { icon: <BadgeCheck className="w-8 h-8" />, label: 'Hallmarked Gold' },
    { icon: <BadgeCheck className="w-8 h-8" />, label: 'ISO 9001:2015' },
    { icon: <BadgeCheck className="w-8 h-8" />, label: 'Ethical Sourcing' },
  ];

  return (
    <div className="min-h-screen bg-white">
      {/* Hero Section */}
      <div className="relative bg-gradient-to-r from-pink-50 via-rose-50 to-pink-50 overflow-hidden">
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-20 left-10 w-64 h-64 bg-pink-300 rounded-full blur-3xl"></div>
          <div className="absolute bottom-20 right-10 w-96 h-96 bg-rose-300 rounded-full blur-3xl"></div>
        </div>
        
        <div className="container mx-auto px-4 py-16 md:py-24 relative">
          <div className="max-w-4xl mx-auto text-center">
            <div className="flex items-center justify-center gap-2 mb-4">
              <span className="w-12 h-0.5 bg-gradient-to-r from-pink-500 to-rose-500"></span>
              <span className="text-pink-600 text-sm font-semibold tracking-wider uppercase">Our Story</span>
              <span className="w-12 h-0.5 bg-gradient-to-r from-rose-500 to-pink-500"></span>
            </div>
            <h1 className="text-4xl md:text-6xl font-serif text-gray-900 mb-6 leading-tight">
              Crafting Timeless <br />
              <span className="text-pink-gradient">Elegance</span> Since 1994
            </h1>
            <p className="text-lg md:text-xl text-gray-600 max-w-3xl mx-auto leading-relaxed">
              We are leading Manufacturer & Exporter of fine jewelry, committed to offering 
              the best quality at competitive prices. Our journey is a testament to the 
              enduring beauty of Indian craftsmanship.
            </p>
          </div>
        </div>
      </div>

      {/* The Muse Section */}
      <div className="py-16 bg-white border-b border-pink-100">
        <div className="container mx-auto px-4">
          <div className="max-w-6xl mx-auto">
            <div className="grid md:grid-cols-2 gap-12 items-center">
              <div className="relative">
                <div className="relative rounded-2xl overflow-hidden shadow-pink-lg">
                  <img 
                    src="https://images.unsplash.com/photo-1603561591411-07134e71a2a9?w=800&h=600&fit=crop"
                    alt="Gehna Heritage"
                    className="w-full h-96 object-cover"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/30 to-transparent"></div>
                </div>
                <div className="absolute -bottom-6 -right-6 bg-gradient-to-r from-pink-500 to-rose-500 text-white px-6 py-4 rounded-xl shadow-pink-lg">
                  <div className="text-3xl font-bold">30+</div>
                  <div className="text-sm font-light">Years of Excellence</div>
                </div>
              </div>
              
              <div>
                <div className="flex items-center gap-2 mb-4">
                  <span className="w-8 h-0.5 bg-gradient-to-r from-pink-500 to-rose-500"></span>
                  <span className="text-pink-600 text-sm font-semibold uppercase tracking-wider">Our Muse</span>
                </div>
                <h2 className="text-3xl md:text-4xl font-serif text-gray-900 mb-6">
                  The Spirit of <span className="text-pink-gradient">Gehna</span>
                </h2>
                <p className="text-gray-600 leading-relaxed mb-6">
                  "Gehna" - a word that resonates with the beauty of adornment. Our brand is inspired by 
                  the rich heritage of Indian jewelry and the timeless elegance it brings to every occasion. 
                  From the royal courts of ancient India to the modern woman of today, jewelry has always been 
                  a symbol of grace, tradition, and celebration.
                </p>
                <p className="text-gray-600 leading-relaxed mb-6">
                  At Gehna Store, we believe that every piece of jewelry tells a story. Whether it's the 
                  intricate craftsmanship of a temple necklace or the delicate beauty of a diamond pendant, 
                  each creation is designed to make you feel special and unique.
                </p>
                <div className="flex items-center gap-2 text-pink-600 font-medium hover:text-pink-700 transition-colors cursor-pointer">
                  <span>Discover Our Legacy</span>
                  <ChevronRight className="w-4 h-4" />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Heritage & Craftsmanship */}
      <div className="py-16 bg-gradient-to-b from-pink-50/30 to-white">
        <div className="container mx-auto px-4">
          <div className="max-w-6xl mx-auto">
            <div className="grid md:grid-cols-3 gap-8">
              <div className="bg-white p-8 rounded-2xl shadow-md hover:shadow-pink-lg transition-all duration-300 border border-pink-100/50 hover:border-pink-200 group">
                <div className="w-14 h-14 bg-gradient-to-br from-pink-100 to-rose-100 rounded-xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-300">
                  <Crown className="w-7 h-7 text-pink-600" />
                </div>
                <h3 className="text-xl font-serif text-gray-900 mb-3 group-hover:text-pink-600 transition-colors duration-300">Heritage Chic</h3>
                <p className="text-gray-600 leading-relaxed">
                  Luxurious jewels from the house of Gehna shaped in elegant constituents 
                  personify the heritage of India with a modern eclectic twist.
                </p>
              </div>

              <div className="bg-white p-8 rounded-2xl shadow-md hover:shadow-pink-lg transition-all duration-300 border border-pink-100/50 hover:border-pink-200 group">
                <div className="w-14 h-14 bg-gradient-to-br from-pink-100 to-rose-100 rounded-xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-300">
                  <Gem className="w-7 h-7 text-pink-600" />
                </div>
                <h3 className="text-xl font-serif text-gray-900 mb-3 group-hover:text-pink-600 transition-colors duration-300">Art Revival</h3>
                <p className="text-gray-600 leading-relaxed">
                  Led by the passion of our artisans, Gehna is the finest reflection of 
                  India's unmatched jewellery traditions and workmanship.
                </p>
              </div>

              <div className="bg-white p-8 rounded-2xl shadow-md hover:shadow-pink-lg transition-all duration-300 border border-pink-100/50 hover:border-pink-200 group">
                <div className="w-14 h-14 bg-gradient-to-br from-pink-100 to-rose-100 rounded-xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-300">
                  <Sparkles className="w-7 h-7 text-pink-600" />
                </div>
                <h3 className="text-xl font-serif text-gray-900 mb-3 group-hover:text-pink-600 transition-colors duration-300">Craftsmanship</h3>
                <p className="text-gray-600 leading-relaxed">
                  Renowned for our signature magnificent pieces and rare craftsmanship, 
                  we harmonize classical tradition with modern interpretation.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Our Values */}
      <div className="py-16 bg-white">
        <div className="container mx-auto px-4">
          <div className="max-w-6xl mx-auto">
            <div className="text-center mb-12">
              <div className="flex items-center justify-center gap-2 mb-4">
                <span className="w-8 h-0.5 bg-gradient-to-r from-pink-500 to-rose-500"></span>
                <span className="text-pink-600 text-sm font-semibold uppercase tracking-wider">Our Values</span>
                <span className="w-8 h-0.5 bg-gradient-to-r from-rose-500 to-pink-500"></span>
              </div>
              <h2 className="text-3xl md:text-4xl font-serif text-gray-900 mb-4">
                What We <span className="text-pink-gradient">Stand For</span>
              </h2>
              <p className="text-gray-600 max-w-2xl mx-auto">
                Our commitment to excellence is reflected in everything we do, from 
                sourcing the finest materials to delivering exceptional service.
              </p>
            </div>

            <div className="grid md:grid-cols-4 gap-6">
              {values.map((value, index) => (
                <div key={index} className="text-center p-6 rounded-xl hover:bg-gradient-to-br hover:from-pink-50 hover:to-rose-50 transition-all duration-300 border border-transparent hover:border-pink-200 group">
                  <div className="w-14 h-14 bg-gradient-to-br from-pink-100 to-rose-100 rounded-xl flex items-center justify-center mx-auto mb-4 text-pink-600 group-hover:scale-110 transition-transform duration-300">
                    {value.icon}
                  </div>
                  <h4 className="font-semibold text-gray-900 mb-2 group-hover:text-pink-600 transition-colors duration-300">{value.title}</h4>
                  <p className="text-sm text-gray-600 leading-relaxed">{value.description}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Journey & Milestones */}
      <div className="py-16 bg-gradient-to-br from-pink-50 via-rose-50 to-pink-50">
        <div className="container mx-auto px-4">
          <div className="max-w-6xl mx-auto">
            <div className="text-center mb-12">
              <div className="flex items-center justify-center gap-2 mb-4">
                <span className="w-8 h-0.5 bg-gradient-to-r from-pink-500 to-rose-500"></span>
                <span className="text-pink-600 text-sm font-semibold uppercase tracking-wider">Our Journey</span>
                <span className="w-8 h-0.5 bg-gradient-to-r from-rose-500 to-pink-500"></span>
              </div>
              <h2 className="text-3xl md:text-4xl font-serif text-gray-900 mb-4">
                Milestones of <span className="text-pink-gradient">Excellence</span>
              </h2>
              <p className="text-gray-600 max-w-2xl mx-auto">
                From our humble beginnings to becoming a global name in fine jewelry, 
                here are the key moments that shaped our legacy.
              </p>
            </div>

            <div className="grid md:grid-cols-3 gap-6">
              {milestones.map((milestone, index) => (
                <div key={index} className="bg-white p-6 rounded-xl shadow-md hover:shadow-pink-lg transition-all duration-300 border border-pink-100/50 hover:border-pink-200">
                  <div className="text-3xl font-bold text-pink-gradient mb-2">{milestone.year}</div>
                  <h4 className="font-semibold text-gray-900 mb-2">{milestone.title}</h4>
                  <p className="text-sm text-gray-600 leading-relaxed">{milestone.description}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Team Section */}
      <div className="py-16 bg-white">
        <div className="container mx-auto px-4">
          <div className="max-w-6xl mx-auto">
            <div className="text-center mb-12">
              <div className="flex items-center justify-center gap-2 mb-4">
                <span className="w-8 h-0.5 bg-gradient-to-r from-pink-500 to-rose-500"></span>
                <span className="text-pink-600 text-sm font-semibold uppercase tracking-wider">Our Team</span>
                <span className="w-8 h-0.5 bg-gradient-to-r from-rose-500 to-pink-500"></span>
              </div>
              <h2 className="text-3xl md:text-4xl font-serif text-gray-900 mb-4">
                Meet the <span className="text-pink-gradient">Artisans</span>
              </h2>
              <p className="text-gray-600 max-w-2xl mx-auto">
                The passion and expertise of our team members bring each piece to life.
              </p>
            </div>

            <div className="grid md:grid-cols-4 gap-6">
              {teamMembers.map((member, index) => (
                <div key={index} className="text-center group p-4 rounded-xl hover:shadow-pink-lg transition-all duration-300">
                  <div className="relative w-40 h-40 mx-auto mb-4 rounded-full overflow-hidden shadow-lg ring-2 ring-pink-200 group-hover:ring-pink-500 transition-all duration-300">
                    <img 
                      src={member.image} 
                      alt={member.name}
                      className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                    />
                  </div>
                  <h4 className="font-semibold text-gray-900 group-hover:text-pink-600 transition-colors duration-300">{member.name}</h4>
                  <p className="text-sm text-pink-600 font-medium mb-2">{member.role}</p>
                  <p className="text-sm text-gray-600 leading-relaxed">{member.description}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Why Choose Us */}
      <div className="py-16 bg-gradient-to-b from-pink-50/30 to-white">
        <div className="container mx-auto px-4">
          <div className="max-w-6xl mx-auto">
            <div className="text-center mb-12">
              <h2 className="text-3xl md:text-4xl font-serif text-gray-900 mb-4">
                Why Choose <span className="text-pink-gradient">Gehna Store</span>
              </h2>
              <p className="text-gray-600 max-w-2xl mx-auto">
                We are determined to provide you the beautiful designs of jewelry with best of the quality.
              </p>
            </div>

            <div className="grid md:grid-cols-4 gap-6">
              <div className="bg-white p-6 rounded-xl text-center shadow-md hover:shadow-pink-lg transition-all duration-300 border border-pink-100/50 hover:border-pink-200 group">
                <div className="w-16 h-16 bg-gradient-to-br from-pink-100 to-rose-100 rounded-full flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform duration-300">
                  <Gem className="w-8 h-8 text-pink-600" />
                </div>
                <h4 className="font-semibold text-gray-900 mb-2 group-hover:text-pink-600 transition-colors duration-300">Authentic Materials</h4>
                <p className="text-sm text-gray-600">925 Sterling Silver, 22K, 18K, 14K, 10K, 9K Gold</p>
              </div>

              <div className="bg-white p-6 rounded-xl text-center shadow-md hover:shadow-pink-lg transition-all duration-300 border border-pink-100/50 hover:border-pink-200 group">
                <div className="w-16 h-16 bg-gradient-to-br from-pink-100 to-rose-100 rounded-full flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform duration-300">
                  <Sparkles className="w-8 h-8 text-pink-600" />
                </div>
                <h4 className="font-semibold text-gray-900 mb-2 group-hover:text-pink-600 transition-colors duration-300">Design Excellence</h4>
                <p className="text-sm text-gray-600">Beautifully fabricated to perfection with unique designs</p>
              </div>

              <div className="bg-white p-6 rounded-xl text-center shadow-md hover:shadow-pink-lg transition-all duration-300 border border-pink-100/50 hover:border-pink-200 group">
                <div className="w-16 h-16 bg-gradient-to-br from-pink-100 to-rose-100 rounded-full flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform duration-300">
                  <Shield className="w-8 h-8 text-pink-600" />
                </div>
                <h4 className="font-semibold text-gray-900 mb-2 group-hover:text-pink-600 transition-colors duration-300">Quality Certified</h4>
                <p className="text-sm text-gray-600">IGI Certified, Hallmarked, ISO 9001:2015</p>
              </div>

              <div className="bg-white p-6 rounded-xl text-center shadow-md hover:shadow-pink-lg transition-all duration-300 border border-pink-100/50 hover:border-pink-200 group">
                <div className="w-16 h-16 bg-gradient-to-br from-pink-100 to-rose-100 rounded-full flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform duration-300">
                  <Truck className="w-8 h-8 text-pink-600" />
                </div>
                <h4 className="font-semibold text-gray-900 mb-2 group-hover:text-pink-600 transition-colors duration-300">Global Shipping</h4>
                <p className="text-sm text-gray-600">Exporting worldwide with secure delivery</p>
              </div>
            </div>

            {/* Certifications */}
            <div className="mt-12 bg-white rounded-2xl p-8 shadow-md border border-pink-100/50">
              <div className="flex flex-wrap justify-center items-center gap-8">
                {certifications.map((cert, index) => (
                  <div key={index} className="flex items-center gap-3">
                    <div className="text-pink-600">{cert.icon}</div>
                    <span className="text-sm font-medium text-gray-700">{cert.label}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* CTA Section */}
      <div className="py-16 bg-gradient-to-r from-pink-600 to-rose-600">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto text-center text-white">
            <h2 className="text-3xl md:text-4xl font-serif mb-4">
              Experience the <span className="text-pink-200">Gehna</span> Difference
            </h2>
            <p className="text-lg text-pink-100 mb-8 max-w-2xl mx-auto">
              Explore our exquisite collection and discover jewelry that tells your story.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <button 
                onClick={() => navigate('/products')}
                className="bg-white text-pink-600 px-8 py-3 rounded-full font-semibold hover:bg-pink-50 transition-all shadow-lg hover:shadow-pink-lg transform hover:scale-[1.02] active:scale-[0.98]"
              >
                Explore Collection
              </button>
              <button 
                onClick={() => navigate('/contact')}
                className="border-2 border-white text-white px-8 py-3 rounded-full font-semibold hover:bg-white/10 transition-all transform hover:scale-[1.02] active:scale-[0.98]"
              >
                Contact Us
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default AboutUs;