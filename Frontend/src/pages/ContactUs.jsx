// src/pages/ContactUs.jsx — DYNAMIC ✅
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import * as Icons from 'lucide-react';
import { ChevronRight, Send, User, MessageSquare, CheckCircle, Navigation, ExternalLink, Headphones } from 'lucide-react';
import { contactPageApi } from '../api/contactPageApi';
import { contactMessageApi } from '../api/contactMessageApi';

// Fallback content — minimal, used only if API fails
const FALLBACK = {
  hero: { badge: 'Get in Touch', title: "Let's", highlight: 'Connect', description: '' },
  contactCards: [],
  quickAssistance: {},
  social: { title: 'Follow Us', links: [] },
  trustBadges: { title: 'Why Trust Us', badges: [] },
  map: {},
  storeLocations: [],
  faqs: [],
  cta: { title: 'Have a', highlight: 'Special', titleSuffix: 'Request?', description: '', primaryBtn: {}, secondaryBtn: {} },
};

const Icon = ({ name, className }) => {
  const C = Icons[name] || Icons.MapPin;
  return <C className={className} />;
};

export function ContactUs() {
  const navigate = useNavigate();
  const [page, setPage] = useState(FALLBACK);
  const [loading, setLoading] = useState(true);
  const [formData, setFormData] = useState({
    name: '', email: '', phone: '', subject: '', message: '', preferredContact: 'email',
  });
  const [formStatus, setFormStatus] = useState(null); // null | 'success' | 'error'
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    window.scrollTo(0, 0);
    let alive = true;

    (async () => {
      try {
        const data = await contactPageApi.get();
        if (alive && data) setPage(data);
      } catch (err) {
        console.error('❌ Failed to fetch Contact page:', err);
      } finally {
        if (alive) setLoading(false);
      }
    })();

    return () => { alive = false; };
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    setFormStatus(null);

    try {
      await contactMessageApi.submit(formData);
      setFormStatus('success');
      setFormData({
        name: '', email: '', phone: '', subject: '', message: '', preferredContact: 'email',
      });
      setTimeout(() => setFormStatus(null), 6000);
    } catch (err) {
      console.error('Contact submit error:', err);
      setFormStatus('error');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (loading) {
    return <div className="min-h-screen bg-white animate-pulse" />;
  }

  const { hero, contactCards = [], quickAssistance, social, trustBadges, map, storeLocations = [], faqs = [], cta } = page;

  return (
    <div className="min-h-screen bg-white">
      {/* HERO */}
      <div className="relative bg-gradient-to-r from-pink-50 via-rose-50 to-pink-50 overflow-hidden">
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-20 left-10 w-64 h-64 bg-pink-300 rounded-full blur-3xl" />
          <div className="absolute bottom-20 right-10 w-96 h-96 bg-rose-300 rounded-full blur-3xl" />
        </div>
        <div className="container mx-auto px-4 py-16 md:py-20 relative">
          <div className="max-w-4xl mx-auto text-center">
            <div className="flex items-center justify-center gap-2 mb-4">
              <span className="w-12 h-0.5 bg-gradient-to-r from-pink-500 to-rose-500" />
              <span className="text-pink-600 text-sm font-semibold tracking-wider uppercase">{hero?.badge}</span>
              <span className="w-12 h-0.5 bg-gradient-to-r from-rose-500 to-pink-500" />
            </div>
            <h1 className="text-4xl md:text-6xl font-serif text-gray-900 mb-6 leading-tight">
              {hero?.title} <span className="text-pink-gradient">{hero?.highlight}</span>
            </h1>
            <p className="text-lg md:text-xl text-gray-600 max-w-3xl mx-auto leading-relaxed">
              {hero?.description}
            </p>
          </div>
        </div>
      </div>

      {/* CONTACT CARDS */}
      {contactCards.length > 0 && (
        <div className="container mx-auto px-4 -mt-8 relative z-10">
          <div className="max-w-6xl mx-auto">
            <div className="grid md:grid-cols-4 gap-6">
              {contactCards.map((info, i) => (
                <div key={i} className="bg-white rounded-2xl shadow-pink-md p-6 hover:shadow-pink-lg transition-all border border-pink-100/50 group">
                  <div className="w-14 h-14 bg-gradient-to-br from-pink-100 to-rose-100 rounded-xl flex items-center justify-center mb-4 text-pink-600 group-hover:bg-gradient-to-br group-hover:from-pink-500 group-hover:to-rose-500 group-hover:text-white transition group-hover:scale-110">
                    <Icon name={info.icon} className="w-6 h-6" />
                  </div>
                  <h3 className="font-semibold text-gray-900 mb-2 group-hover:text-pink-600">{info.title}</h3>
                  {(info.details || []).map((d, idx) => (
                    <p key={idx} className="text-sm text-gray-600 leading-relaxed">{d}</p>
                  ))}
                  {info.action && info.actionLink && (
                    <a
                      href={info.actionLink}
                      target={info.actionLink.startsWith('http') ? '_blank' : '_self'}
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1 text-pink-600 font-medium text-sm mt-3 hover:text-pink-700 transition-colors"
                    >
                      {info.action} <ChevronRight className="w-4 h-4" />
                    </a>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* FORM + SIDEBAR */}
      <div className="py-16">
        <div className="container mx-auto px-4">
          <div className="max-w-6xl mx-auto">
            <div className="grid lg:grid-cols-5 gap-8">
              {/* FORM */}
              <div className="lg:col-span-3 bg-white rounded-2xl shadow-pink-md border border-pink-100/50 p-8">
                <div className="mb-6">
                  <div className="flex items-center gap-2 mb-2">
                    <Icons.Heart className="w-5 h-5 text-pink-500" />
                    <h2 className="text-2xl font-serif text-gray-900">Send Us a Message</h2>
                  </div>
                  <p className="text-gray-600">Fill in the details below and we'll get back to you within 24 hours.</p>
                </div>

                {formStatus === 'success' && (
                  <div className="mb-6 p-4 bg-green-50 border border-green-200 rounded-lg flex items-center gap-3">
                    <CheckCircle className="w-5 h-5 text-green-600" />
                    <span className="text-green-700">Thank you! Your message has been sent.</span>
                  </div>
                )}
                {formStatus === 'error' && (
                  <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg flex items-center gap-3">
                    <Icons.AlertCircle className="w-5 h-5 text-red-600" />
                    <span className="text-red-700">Failed to send. Please try again.</span>
                  </div>
                )}

                <form onSubmit={handleSubmit} className="space-y-5">
                  <div className="grid sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Full Name *</label>
                      <div className="relative">
                        <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-pink-400" />
                        <input type="text" name="name" value={formData.name} onChange={handleChange} required
                          className="w-full pl-10 pr-4 py-2.5 border border-pink-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-pink-500"
                          placeholder="Enter your full name" />
                      </div>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Email *</label>
                      <div className="relative">
                        <Icons.Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-pink-400" />
                        <input type="email" name="email" value={formData.email} onChange={handleChange} required
                          className="w-full pl-10 pr-4 py-2.5 border border-pink-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-pink-500"
                          placeholder="Enter your email" />
                      </div>
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Phone Number</label>
                    <div className="relative">
                      <Icons.Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-pink-400" />
                      <input type="tel" name="phone" value={formData.phone} onChange={handleChange}
                        className="w-full pl-10 pr-4 py-2.5 border border-pink-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-pink-500"
                        placeholder="Enter your phone number" />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Subject</label>
                    <div className="relative">
                      <MessageSquare className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-pink-400" />
                      <input type="text" name="subject" value={formData.subject} onChange={handleChange}
                        className="w-full pl-10 pr-4 py-2.5 border border-pink-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-pink-500"
                        placeholder="What is this regarding?" />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Message *</label>
                    <textarea name="message" value={formData.message} onChange={handleChange} required rows="5"
                      className="w-full px-4 py-2.5 border border-pink-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-pink-500 resize-none"
                      placeholder="Tell us how we can help you..." />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Preferred Contact Method</label>
                    <div className="flex flex-wrap gap-3">
                      {['email', 'phone', 'whatsapp'].map((m) => (
                        <label key={m} className="flex items-center gap-2 cursor-pointer">
                          <input type="radio" name="preferredContact" value={m}
                            checked={formData.preferredContact === m} onChange={handleChange}
                            className="w-4 h-4 text-pink-600 focus:ring-pink-500" />
                          <span className="text-sm text-gray-700 capitalize">{m}</span>
                        </label>
                      ))}
                    </div>
                  </div>

                  <button type="submit" disabled={isSubmitting}
                    className="w-full bg-gradient-to-r from-pink-500 to-rose-500 text-white py-3 rounded-xl font-semibold hover:from-pink-600 hover:to-rose-600 transition flex items-center justify-center gap-2 disabled:opacity-70 shadow-md">
                    {isSubmitting ? (
                      <>
                        <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                        Sending...
                      </>
                    ) : (
                      <>
                        <Send className="w-5 h-5" /> Send Message
                      </>
                    )}
                  </button>
                </form>
              </div>

              {/* SIDEBAR */}
              <div className="lg:col-span-2 space-y-6">
                {quickAssistance && (
                  <div className="bg-gradient-to-br from-pink-50 to-rose-50 rounded-2xl p-6 border border-pink-100">
                    <h3 className="font-serif text-xl text-gray-900 mb-4">{quickAssistance.title}</h3>
                    <div className="space-y-3">
                      {quickAssistance.phone && (
                        <div className="flex items-center gap-3">
                          <Icons.Phone className="w-5 h-5 text-pink-600" />
                          <div>
                            <p className="text-sm text-gray-500">Call us</p>
                            <p className="font-semibold text-gray-900">{quickAssistance.phone}</p>
                          </div>
                        </div>
                      )}
                      {quickAssistance.email && (
                        <div className="flex items-center gap-3">
                          <Icons.Mail className="w-5 h-5 text-pink-600" />
                          <div>
                            <p className="text-sm text-gray-500">Email us</p>
                            <p className="font-semibold text-gray-900">{quickAssistance.email}</p>
                          </div>
                        </div>
                      )}
                      {quickAssistance.hours && (
                        <div className="flex items-center gap-3">
                          <Icons.Clock className="w-5 h-5 text-pink-600" />
                          <div>
                            <p className="text-sm text-gray-500">Working hours</p>
                            <p className="font-semibold text-gray-900">{quickAssistance.hours}</p>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                )}

                {social?.links?.length > 0 && (
                  <div className="bg-white rounded-2xl border border-pink-100 p-6">
                    <h3 className="font-serif text-xl text-gray-900 mb-4">{social.title}</h3>
                    <div className="flex gap-3 flex-wrap">
                      {social.links.map((l, i) => (
                        <a key={i} href={l.url} target="_blank" rel="noopener noreferrer"
                          className="w-12 h-12 bg-pink-50 rounded-xl flex items-center justify-center hover:bg-gradient-to-r hover:from-pink-500 hover:to-rose-500 hover:text-white transition hover:scale-110">
                          <Icon name={l.icon} className="w-5 h-5 text-pink-600 hover:text-white" />
                        </a>
                      ))}
                    </div>
                  </div>
                )}

                {trustBadges?.badges?.length > 0 && (
                  <div className="bg-white rounded-2xl border border-pink-100 p-6">
                    <h3 className="font-serif text-xl text-gray-900 mb-4">{trustBadges.title}</h3>
                    <div className="space-y-2">
                      {trustBadges.badges.map((b, i) => (
                        <div key={i} className="flex items-center gap-2 text-sm text-gray-600">
                          <Icon name={b.icon} className="w-4 h-4 text-pink-600" />
                          <span>{b.text}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* MAP */}
      {map?.iframeUrl && (
        <div className="py-16 bg-gradient-to-b from-pink-50/30 to-white">
          <div className="container mx-auto px-4">
            <div className="max-w-6xl mx-auto">
              <div className="text-center mb-8">
                <div className="flex items-center justify-center gap-2 mb-4">
                  <span className="w-8 h-0.5 bg-gradient-to-r from-pink-500 to-rose-500" />
                  <span className="text-pink-600 text-sm font-semibold uppercase tracking-wider">{map.badge}</span>
                  <span className="w-8 h-0.5 bg-gradient-to-r from-rose-500 to-pink-500" />
                </div>
                <h2 className="text-3xl font-serif text-gray-900 mb-3">
                  {map.title} <span className="text-pink-gradient">{map.highlight}</span>
                </h2>
                <p className="text-gray-600 max-w-3xl mx-auto">{map.address}</p>
                {map.externalLink && (
                  <a href={map.externalLink} target="_blank" rel="noopener noreferrer"
                    className="inline-flex items-center gap-2 text-pink-600 font-medium hover:text-pink-700 mt-2">
                    <ExternalLink className="w-4 h-4" /> Open in Google Maps
                  </a>
                )}
              </div>

              <div className="relative w-full rounded-2xl overflow-hidden shadow-pink-lg">
                <iframe src={map.iframeUrl} width="100%" height="450" style={{ border: 0 }}
                  allowFullScreen loading="lazy" referrerPolicy="no-referrer-when-downgrade"
                  title="Store Location" className="w-full" />
                {map.pinLabel && (
                  <div className="absolute bottom-4 right-4 bg-white/90 backdrop-blur-sm px-3 py-1.5 rounded-lg shadow-pink-md border border-pink-100">
                    <div className="flex items-center gap-2 text-xs text-gray-700">
                      <Navigation className="w-4 h-4 text-pink-600" />
                      <span className="font-medium">{map.pinLabel}</span>
                    </div>
                  </div>
                )}
              </div>

              <div className="grid md:grid-cols-3 gap-4 mt-6">
                {map.address && (
                  <div className="bg-white rounded-xl p-4 shadow-pink-md border border-pink-100/50 flex items-center gap-3">
                    <Icons.MapPin className="w-5 h-5 text-pink-600" />
                    <div>
                      <p className="text-xs text-gray-500">Address</p>
                      <p className="text-sm font-medium text-gray-800 line-clamp-2">{map.address}</p>
                    </div>
                  </div>
                )}
                {map.phone && (
                  <div className="bg-white rounded-xl p-4 shadow-pink-md border border-pink-100/50 flex items-center gap-3">
                    <Icons.Phone className="w-5 h-5 text-pink-600" />
                    <div>
                      <p className="text-xs text-gray-500">Phone</p>
                      <p className="text-sm font-medium text-gray-800">{map.phone}</p>
                    </div>
                  </div>
                )}
                {map.hours && (
                  <div className="bg-white rounded-xl p-4 shadow-pink-md border border-pink-100/50 flex items-center gap-3">
                    <Icons.Clock className="w-5 h-5 text-pink-600" />
                    <div>
                      <p className="text-xs text-gray-500">Working Hours</p>
                      <p className="text-sm font-medium text-gray-800">{map.hours}</p>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* STORE LOCATIONS */}
      {storeLocations.length > 0 && (
        <div className="py-16 bg-white">
          <div className="container mx-auto px-4">
            <div className="max-w-6xl mx-auto">
              <div className="text-center mb-12">
                <h2 className="text-3xl font-serif text-gray-900 mb-4">
                  Visit Our <span className="text-pink-gradient">Showrooms</span>
                </h2>
              </div>
              <div className="grid md:grid-cols-3 gap-6">
                {storeLocations.map((loc, i) => (
                  <div key={i} className={`bg-white rounded-2xl p-6 shadow-pink-md hover:shadow-pink-lg transition ${loc.isMain ? 'border-2 border-pink-300' : 'border border-pink-100/50'}`}>
                    {loc.isMain && (
                      <span className="inline-block bg-gradient-to-r from-pink-500 to-rose-500 text-white text-xs px-3 py-1 rounded-full mb-3">Main Store</span>
                    )}
                    <div className="flex items-start gap-3 mb-4">
                      <Icons.MapPin className="w-5 h-5 text-pink-600 flex-shrink-0 mt-1" />
                      <div>
                        <h4 className="font-semibold text-gray-900">{loc.name}</h4>
                        <p className="text-sm text-gray-600 mt-1">{loc.address}</p>
                      </div>
                    </div>
                    <div className="space-y-1 text-sm text-gray-600">
                      {loc.phone && <p><Icons.Phone className="w-3 h-3 inline mr-2 text-pink-600" />{loc.phone}</p>}
                      {loc.timings && <p><Icons.Clock className="w-3 h-3 inline mr-2 text-pink-600" />{loc.timings}</p>}
                    </div>
                    {loc.mapLink && (
                      <a href={loc.mapLink} target="_blank" rel="noopener noreferrer"
                        className="inline-flex items-center gap-1 text-pink-600 font-medium text-sm mt-3 hover:text-pink-700">
                        Get Directions →
                      </a>
                    )}
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* FAQS */}
      {faqs.length > 0 && (
        <div className="py-16 bg-gradient-to-b from-pink-50/30 to-white">
          <div className="container mx-auto px-4">
            <div className="max-w-4xl mx-auto">
              <div className="text-center mb-12">
                <h2 className="text-3xl font-serif text-gray-900 mb-4">
                  Frequently Asked <span className="text-pink-gradient">Questions</span>
                </h2>
              </div>
              <div className="grid md:grid-cols-2 gap-4">
                {faqs.map((faq, i) => (
                  <div key={i} className="bg-white border border-pink-100/50 rounded-xl p-5 hover:border-pink-200 hover:shadow-pink-md transition">
                    <h4 className="font-semibold text-gray-900 mb-2">{faq.question}</h4>
                    <p className="text-sm text-gray-600 leading-relaxed">{faq.answer}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* CTA */}
      {cta && (
        <div className="py-16 bg-gradient-to-r from-pink-600 to-rose-600">
          <div className="container mx-auto px-4">
            <div className="max-w-4xl mx-auto text-center text-white">
              <div className="flex justify-center mb-4">
                <Headphones className="w-16 h-16 text-pink-200" />
              </div>
              <h2 className="text-3xl md:text-4xl font-serif mb-4">
                {cta.title} <span className="text-pink-200">{cta.highlight}</span> {cta.titleSuffix}
              </h2>
              <p className="text-lg text-pink-100 mb-8 max-w-2xl mx-auto">{cta.description}</p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                {cta.primaryBtn?.label && (
                  <button
                    onClick={() => {
                      const formElement = document.querySelector('form');
                      if (formElement) formElement.scrollIntoView({ behavior: 'smooth', block: 'center' });
                    }}
                    className="bg-white text-pink-600 px-8 py-3 rounded-full font-semibold hover:bg-pink-50 transition shadow-lg"
                  >
                    {cta.primaryBtn.label}
                  </button>
                )}
                {cta.secondaryBtn?.label && (
                  <button
                    onClick={() => navigate(cta.secondaryBtn.link || '/products')}
                    className="border-2 border-white text-white px-8 py-3 rounded-full font-semibold hover:bg-white/10 transition"
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

export default ContactUs;