// src/pages/AboutUs.jsx — DYNAMIC ✅
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import * as Icons from 'lucide-react';
import { ChevronRight } from 'lucide-react';
import { aboutPageApi } from '../api/aboutPageApi';

// Fallback content — mirrors your current hardcoded page
const FALLBACK = {
  hero: {
    badge: 'Our Story',
    title: 'Crafting Timeless',
    highlight: 'Elegance',
    titleSuffix: 'Since 1994',
    description:
      'We are leading Manufacturer & Exporter of fine jewelry, committed to offering the best quality at competitive prices.',
  },
  muse: {
    badge: 'Our Muse',
    title: 'The Spirit of',
    highlight: 'Gehna',
    paragraphs: [
      '"Gehna" - a word that resonates with the beauty of adornment. Our brand is inspired by the rich heritage of Indian jewelry.',
      'At Gehna Store, we believe that every piece of jewelry tells a story.',
    ],
    image: { url: 'https://images.unsplash.com/photo-1603561591411-07134e71a2a9?w=800&h=600&fit=crop' },
    statNumber: '30+',
    statLabel: 'Years of Excellence',
  },
  heritage: [
    { icon: 'Crown', title: 'Heritage Chic', description: 'Luxurious jewels from the house of Gehna shaped in elegant constituents personify the heritage of India.' },
    { icon: 'Gem', title: 'Art Revival', description: "Led by the passion of our artisans, Gehna is the finest reflection of India's unmatched jewellery traditions." },
    { icon: 'Sparkles', title: 'Craftsmanship', description: 'Renowned for our signature magnificent pieces and rare craftsmanship.' },
  ],
  values: [
    { icon: 'Gem', title: 'Authenticity', description: 'Every piece is crafted with genuine materials.' },
    { icon: 'Shield', title: 'Quality Assurance', description: 'Rigorous quality checks at every stage.' },
    { icon: 'Heart', title: 'Customer Trust', description: 'We build lasting relationships through transparency.' },
    { icon: 'Sparkles', title: 'Innovation', description: 'Blending traditional techniques with contemporary design.' },
  ],
  milestones: [
    { year: '1994', title: 'The Beginning', description: 'Gehna Store was founded with a vision to bring authentic Indian jewelry to the world.' },
    { year: '2000', title: 'Global Expansion', description: 'Started exporting to international markets.' },
    { year: '2010', title: 'Digital Revolution', description: 'Launched our online store.' },
    { year: '2015', title: 'Craftsmanship Excellence', description: 'Recognized globally for design and quality.' },
    { year: '2020', title: 'Sustainable Future', description: 'Committed to ethical sourcing.' },
    { year: '2024', title: '30 Years of Legacy', description: 'Celebrating three decades of timeless elegance.' },
  ],
  team: [],
  features: [
    { icon: 'Gem', title: 'Authentic Materials', description: '925 Sterling Silver, 22K, 18K, 14K, 10K, 9K Gold' },
    { icon: 'Sparkles', title: 'Design Excellence', description: 'Beautifully fabricated to perfection' },
    { icon: 'Shield', title: 'Quality Certified', description: 'IGI Certified, Hallmarked, ISO 9001:2015' },
    { icon: 'Truck', title: 'Global Shipping', description: 'Exporting worldwide with secure delivery' },
  ],
  certifications: [
    { icon: 'BadgeCheck', label: 'IGI Certified' },
    { icon: 'BadgeCheck', label: 'Hallmarked Gold' },
    { icon: 'BadgeCheck', label: 'ISO 9001:2015' },
    { icon: 'BadgeCheck', label: 'Ethical Sourcing' },
  ],
  cta: {
    title: 'Experience the',
    highlight: 'Gehna',
    titleSuffix: 'Difference',
    description: 'Explore our exquisite collection and discover jewelry that tells your story.',
    primaryBtn: { label: 'Explore Collection', link: '/products' },
    secondaryBtn: { label: 'Contact Us', link: '/contact' },
  },
};

const Icon = ({ name, className }) => {
  const C = Icons[name] || Icons.Gem;
  return <C className={className} />;
};

export function AboutUs() {
  const navigate = useNavigate();
  const [page, setPage] = useState(FALLBACK);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    window.scrollTo(0, 0);
    let alive = true;

    (async () => {
      try {
        const data = await aboutPageApi.get();
        if (alive && data) setPage(data);
      } catch (err) {
        console.error('❌ Failed to fetch About page:', err);
      } finally {
        if (alive) setLoading(false);
      }
    })();

    return () => { alive = false; };
  }, []);

  if (loading) {
    return <div className="min-h-screen bg-white animate-pulse" />;
  }

  const { hero, muse, heritage = [], values = [], milestones = [], team = [], features = [], certifications = [], cta } = page;

  return (
    <div className="min-h-screen bg-white">
      {/* ---------- HERO ---------- */}
      <div className="relative bg-gradient-to-r from-pink-50 via-rose-50 to-pink-50 overflow-hidden">
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-20 left-10 w-64 h-64 bg-pink-300 rounded-full blur-3xl" />
          <div className="absolute bottom-20 right-10 w-96 h-96 bg-rose-300 rounded-full blur-3xl" />
        </div>
        <div className="container mx-auto px-4 py-16 md:py-24 relative">
          <div className="max-w-4xl mx-auto text-center">
            <div className="flex items-center justify-center gap-2 mb-4">
              <span className="w-12 h-0.5 bg-gradient-to-r from-pink-500 to-rose-500" />
              <span className="text-pink-600 text-sm font-semibold tracking-wider uppercase">{hero?.badge}</span>
              <span className="w-12 h-0.5 bg-gradient-to-r from-rose-500 to-pink-500" />
            </div>
            <h1 className="text-4xl md:text-6xl font-serif text-gray-900 mb-6 leading-tight">
              {hero?.title} <br />
              <span className="text-pink-gradient">{hero?.highlight}</span> {hero?.titleSuffix}
            </h1>
            <p className="text-lg md:text-xl text-gray-600 max-w-3xl mx-auto leading-relaxed">
              {hero?.description}
            </p>
          </div>
        </div>
      </div>

      {/* ---------- MUSE ---------- */}
      <div className="py-16 bg-white border-b border-pink-100">
        <div className="container mx-auto px-4">
          <div className="max-w-6xl mx-auto">
            <div className="grid md:grid-cols-2 gap-12 items-center">
              <div className="relative">
                {muse?.image?.url && (
                  <div className="relative rounded-2xl overflow-hidden shadow-pink-lg">
                    <img src={muse.image.url} alt={muse.image.alt || 'Heritage'} className="w-full h-96 object-cover" />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/30 to-transparent" />
                  </div>
                )}
                <div className="absolute -bottom-6 -right-6 bg-gradient-to-r from-pink-500 to-rose-500 text-white px-6 py-4 rounded-xl shadow-pink-lg">
                  <div className="text-3xl font-bold">{muse?.statNumber}</div>
                  <div className="text-sm font-light">{muse?.statLabel}</div>
                </div>
              </div>
              <div>
                <div className="flex items-center gap-2 mb-4">
                  <span className="w-8 h-0.5 bg-gradient-to-r from-pink-500 to-rose-500" />
                  <span className="text-pink-600 text-sm font-semibold uppercase tracking-wider">{muse?.badge}</span>
                </div>
                <h2 className="text-3xl md:text-4xl font-serif text-gray-900 mb-6">
                  {muse?.title} <span className="text-pink-gradient">{muse?.highlight}</span>
                </h2>
                {(muse?.paragraphs || []).map((p, i) => (
                  <p key={i} className="text-gray-600 leading-relaxed mb-4">{p}</p>
                ))}
                <div className="flex items-center gap-2 text-pink-600 font-medium">
                  <span>Discover Our Legacy</span>
                  <ChevronRight className="w-4 h-4" />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ---------- HERITAGE ---------- */}
      {heritage.length > 0 && (
        <div className="py-16 bg-gradient-to-b from-pink-50/30 to-white">
          <div className="container mx-auto px-4">
            <div className="max-w-6xl mx-auto">
              <div className="grid md:grid-cols-3 gap-8">
                {heritage.map((h, i) => (
                  <div key={i} className="bg-white p-8 rounded-2xl shadow-md hover:shadow-pink-lg transition-all border border-pink-100/50 group">
                    <div className="w-14 h-14 bg-gradient-to-br from-pink-100 to-rose-100 rounded-xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                      <Icon name={h.icon} className="w-7 h-7 text-pink-600" />
                    </div>
                    <h3 className="text-xl font-serif text-gray-900 mb-3">{h.title}</h3>
                    <p className="text-gray-600 leading-relaxed">{h.description}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ---------- VALUES ---------- */}
      {values.length > 0 && (
        <div className="py-16 bg-white">
          <div className="container mx-auto px-4">
            <div className="max-w-6xl mx-auto">
              <div className="text-center mb-12">
                <h2 className="text-3xl md:text-4xl font-serif text-gray-900 mb-4">
                  What We <span className="text-pink-gradient">Stand For</span>
                </h2>
              </div>
              <div className="grid md:grid-cols-4 gap-6">
                {values.map((v, i) => (
                  <div key={i} className="text-center p-6 rounded-xl hover:bg-gradient-to-br hover:from-pink-50 hover:to-rose-50 transition border border-transparent hover:border-pink-200 group">
                    <div className="w-14 h-14 bg-gradient-to-br from-pink-100 to-rose-100 rounded-xl flex items-center justify-center mx-auto mb-4 text-pink-600 group-hover:scale-110 transition-transform">
                      <Icon name={v.icon} className="w-7 h-7" />
                    </div>
                    <h4 className="font-semibold text-gray-900 mb-2">{v.title}</h4>
                    <p className="text-sm text-gray-600">{v.description}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ---------- MILESTONES ---------- */}
      {milestones.length > 0 && (
        <div className="py-16 bg-gradient-to-br from-pink-50 via-rose-50 to-pink-50">
          <div className="container mx-auto px-4">
            <div className="max-w-6xl mx-auto">
              <div className="text-center mb-12">
                <h2 className="text-3xl md:text-4xl font-serif text-gray-900 mb-4">
                  Milestones of <span className="text-pink-gradient">Excellence</span>
                </h2>
              </div>
              <div className="grid md:grid-cols-3 gap-6">
                {milestones.map((m, i) => (
                  <div key={i} className="bg-white p-6 rounded-xl shadow-md hover:shadow-pink-lg transition border border-pink-100/50">
                    <div className="text-3xl font-bold text-pink-gradient mb-2">{m.year}</div>
                    <h4 className="font-semibold text-gray-900 mb-2">{m.title}</h4>
                    <p className="text-sm text-gray-600">{m.description}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ---------- TEAM ---------- */}
      {team.length > 0 && (
        <div className="py-16 bg-white">
          <div className="container mx-auto px-4">
            <div className="max-w-6xl mx-auto">
              <div className="text-center mb-12">
                <h2 className="text-3xl md:text-4xl font-serif text-gray-900 mb-4">
                  Meet the <span className="text-pink-gradient">Artisans</span>
                </h2>
              </div>
              <div className="grid md:grid-cols-4 gap-6">
                {team.map((t, i) => (
                  <div key={i} className="text-center group p-4 rounded-xl hover:shadow-pink-lg transition">
                    <div className="relative w-40 h-40 mx-auto mb-4 rounded-full overflow-hidden shadow-lg ring-2 ring-pink-200 group-hover:ring-pink-500 transition">
                      {t.image?.url ? (
                        <img src={t.image.url} alt={t.name} className="w-full h-full object-cover group-hover:scale-110 transition" />
                      ) : (
                        <div className="w-full h-full bg-pink-100 text-pink-600 flex items-center justify-center text-4xl font-serif">
                          {t.name?.charAt(0)}
                        </div>
                      )}
                    </div>
                    <h4 className="font-semibold text-gray-900">{t.name}</h4>
                    <p className="text-sm text-pink-600 font-medium mb-2">{t.role}</p>
                    <p className="text-sm text-gray-600">{t.description}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ---------- FEATURES + CERTIFICATIONS ---------- */}
      {(features.length > 0 || certifications.length > 0) && (
        <div className="py-16 bg-gradient-to-b from-pink-50/30 to-white">
          <div className="container mx-auto px-4">
            <div className="max-w-6xl mx-auto">
              {features.length > 0 && (
                <>
                  <div className="text-center mb-12">
                    <h2 className="text-3xl md:text-4xl font-serif text-gray-900 mb-4">
                      Why Choose <span className="text-pink-gradient">Gehna Store</span>
                    </h2>
                  </div>
                  <div className="grid md:grid-cols-4 gap-6">
                    {features.map((f, i) => (
                      <div key={i} className="bg-white p-6 rounded-xl text-center shadow-md hover:shadow-pink-lg transition border border-pink-100/50 group">
                        <div className="w-16 h-16 bg-gradient-to-br from-pink-100 to-rose-100 rounded-full flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition">
                          <Icon name={f.icon} className="w-8 h-8 text-pink-600" />
                        </div>
                        <h4 className="font-semibold text-gray-900 mb-2">{f.title}</h4>
                        <p className="text-sm text-gray-600">{f.description}</p>
                      </div>
                    ))}
                  </div>
                </>
              )}

              {certifications.length > 0 && (
                <div className="mt-12 bg-white rounded-2xl p-8 shadow-md border border-pink-100/50">
                  <div className="flex flex-wrap justify-center items-center gap-8">
                    {certifications.map((c, i) => (
                      <div key={i} className="flex items-center gap-3">
                        <div className="text-pink-600">
                          <Icon name={c.icon} className="w-8 h-8" />
                        </div>
                        <span className="text-sm font-medium text-gray-700">{c.label}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* ---------- CTA ---------- */}
      {cta && (
        <div className="py-16 bg-gradient-to-r from-pink-600 to-rose-600">
          <div className="container mx-auto px-4">
            <div className="max-w-4xl mx-auto text-center text-white">
              <h2 className="text-3xl md:text-4xl font-serif mb-4">
                {cta.title} <span className="text-pink-200">{cta.highlight}</span> {cta.titleSuffix}
              </h2>
              <p className="text-lg text-pink-100 mb-8 max-w-2xl mx-auto">{cta.description}</p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                {cta.primaryBtn?.label && (
                  <button
                    onClick={() => navigate(cta.primaryBtn.link || '/products')}
                    className="bg-white text-pink-600 px-8 py-3 rounded-full font-semibold hover:bg-pink-50 transition-all shadow-lg"
                  >
                    {cta.primaryBtn.label}
                  </button>
                )}
                {cta.secondaryBtn?.label && (
                  <button
                    onClick={() => navigate(cta.secondaryBtn.link || '/contact')}
                    className="border-2 border-white text-white px-8 py-3 rounded-full font-semibold hover:bg-white/10 transition-all"
                  >
                    {cta.secondaryBtn.label}
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default AboutUs;