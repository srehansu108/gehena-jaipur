// src/pages/ContactUs.jsx - PINK THEME ✅
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  MapPin, Phone, Mail, Clock, Send, 
  MessageSquare, User, Building2, Globe,
  Facebook, Instagram, Twitter, Youtube,
  CheckCircle, AlertCircle, ChevronRight,
  Headphones, Shield, Truck, Star,
  ExternalLink, Navigation, Heart
} from 'lucide-react';

export function ContactUs() {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    subject: '',
    message: '',
    preferredContact: 'email'
  });
  const [formStatus, setFormStatus] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    setTimeout(() => {
      setFormStatus('success');
      setIsSubmitting(false);
      setFormData({
        name: '',
        email: '',
        phone: '',
        subject: '',
        message: '',
        preferredContact: 'email'
      });
      setTimeout(() => setFormStatus(null), 5000);
    }, 1500);
  };

  // Contact information
  const contactInfo = [
    {
      icon: <MapPin className="w-6 h-6" />,
      title: 'Visit Us',
      details: ['14-B, Kothari Bhawan,', 'Mirza Ismail Rd, near Panch Batti,', 'New Colony, Jaipur, Rajasthan 302001'],
      action: 'Get Directions →',
      actionLink: 'https://www.google.com/maps/place/Gehna+Jaipur/@26.9178204,75.8121204,17z'
    },
    {
      icon: <Phone className="w-6 h-6" />,
      title: 'Call Us',
      details: ['+91 91458 42500', '+91 98765 43211', 'Mon-Sat: 10:00 AM - 6:00 PM'],
      action: 'Call Now →',
      actionLink: 'tel:+919145842500'
    },
    {
      icon: <Mail className="w-6 h-6" />,
      title: 'Email Us',
      details: ['info@gehnastore.com', 'support@gehnastore.com', 'We reply within 24 hours'],
      action: 'Send Email →',
      actionLink: 'mailto:info@gehnastore.com'
    },
    {
      icon: <Clock className="w-6 h-6" />,
      title: 'Working Hours',
      details: ['Monday - Saturday: 10:00 AM - 6:00 PM', 'Sunday: Closed', 'Special appointments available'],
      action: 'Book Appointment →',
      actionLink: '/appointments'
    },
  ];

  // Store locations
  const storeLocations = [
    {
      name: 'Jaipur Flagship Store',
      address: '14-B, Kothari Bhawan, Mirza Ismail Rd, near Panch Batti, New Colony, Jaipur, Rajasthan 302001',
      phone: '+91 91458 42500',
      timings: 'Mon-Sat: 10:00 AM - 6:00 PM',
      mapLink: 'https://www.google.com/maps/place/Gehna+Jaipur/@26.9178204,75.8121204,17z',
      isMain: true
    },
    {
      name: 'Delhi Showroom',
      address: '456, Connaught Place, New Delhi 110001',
      phone: '+91 98765 43211',
      timings: 'Mon-Sat: 11:00 AM - 7:00 PM',
      mapLink: 'https://maps.google.com'
    },
    {
      name: 'Mumbai Boutique',
      address: '789, Colaba Causeway, Mumbai 400001',
      phone: '+91 98765 43212',
      timings: 'Mon-Sat: 10:30 AM - 7:30 PM',
      mapLink: 'https://maps.google.com'
    },
  ];

  // FAQ items
  const faqs = [
    {
      question: 'What are your shipping policies?',
      answer: 'We offer free shipping on orders above ₹50,000. Orders are typically processed within 2-3 business days and delivered in 3-5 business days within India.'
    },
    {
      question: 'Do you provide international shipping?',
      answer: 'Yes, we ship internationally to most countries. International shipping costs and delivery times vary by location. Contact us for a specific quote.'
    },
    {
      question: 'What is your return and exchange policy?',
      answer: 'We offer a 30-day return policy on most items. Products must be in original condition with all tags and packaging. Custom-made pieces are non-returnable.'
    },
    {
      question: 'Do you provide certification for your jewelry?',
      answer: 'All our diamond and gemstone jewelry comes with IGI or GIA certification. Gold jewelry is hallmarked with BIS certification.'
    },
    {
      question: 'Can I place a custom order?',
      answer: 'Absolutely! We specialize in custom-made jewelry. Contact our design team to bring your vision to life.'
    },
    {
      question: 'What payment methods do you accept?',
      answer: 'We accept all major credit/debit cards, net banking, UPI, and cash on delivery for eligible orders.'
    },
  ];

  return (
    <div className="min-h-screen bg-white">
      {/* Hero Section */}
      <div className="relative bg-gradient-to-r from-pink-50 via-rose-50 to-pink-50 overflow-hidden">
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-20 left-10 w-64 h-64 bg-pink-300 rounded-full blur-3xl"></div>
          <div className="absolute bottom-20 right-10 w-96 h-96 bg-rose-300 rounded-full blur-3xl"></div>
        </div>
        
        <div className="container mx-auto px-4 py-16 md:py-20 relative">
          <div className="max-w-4xl mx-auto text-center">
            <div className="flex items-center justify-center gap-2 mb-4">
              <span className="w-12 h-0.5 bg-gradient-to-r from-pink-500 to-rose-500"></span>
              <span className="text-pink-600 text-sm font-semibold tracking-wider uppercase">Get in Touch</span>
              <span className="w-12 h-0.5 bg-gradient-to-r from-rose-500 to-pink-500"></span>
            </div>
            <h1 className="text-4xl md:text-6xl font-serif text-gray-900 mb-6 leading-tight">
              Let's <span className="text-pink-gradient">Connect</span>
            </h1>
            <p className="text-lg md:text-xl text-gray-600 max-w-3xl mx-auto leading-relaxed">
              We're here to help you find the perfect piece of jewelry. Reach out to us for 
              any inquiries, custom orders, or assistance.
            </p>
          </div>
        </div>
      </div>

      {/* Contact Cards */}
      <div className="container mx-auto px-4 -mt-8 relative z-10">
        <div className="max-w-6xl mx-auto">
          <div className="grid md:grid-cols-4 gap-6">
            {contactInfo.map((info, index) => (
              <div key={index} className="bg-white rounded-2xl shadow-pink-md p-6 hover:shadow-pink-lg transition-all duration-300 group border border-pink-100/50 hover:border-pink-200">
                <div className="w-14 h-14 bg-gradient-to-br from-pink-100 to-rose-100 rounded-xl flex items-center justify-center mb-4 text-pink-600 group-hover:bg-gradient-to-br group-hover:from-pink-500 group-hover:to-rose-500 group-hover:text-white transition-all duration-300 group-hover:scale-110">
                  {info.icon}
                </div>
                <h3 className="font-semibold text-gray-900 mb-2 group-hover:text-pink-600 transition-colors">{info.title}</h3>
                {info.details.map((detail, idx) => (
                  <p key={idx} className="text-sm text-gray-600 leading-relaxed">{detail}</p>
                ))}
                <a 
                  href={info.actionLink} 
                  target={info.actionLink.startsWith('http') ? '_blank' : '_self'}
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1 text-pink-600 font-medium text-sm mt-3 hover:text-pink-700 transition-colors group-hover:gap-2"
                >
                  {info.action}
                  <ChevronRight className="w-4 h-4" />
                </a>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Contact Form & Map Section */}
      <div className="py-16">
        <div className="container mx-auto px-4">
          <div className="max-w-6xl mx-auto">
            <div className="grid lg:grid-cols-5 gap-8">
              {/* Form Column */}
              <div className="lg:col-span-3 bg-white rounded-2xl shadow-pink-md border border-pink-100/50 p-8">
                <div className="mb-6">
                  <div className="flex items-center gap-2 mb-2">
                    <Heart className="w-5 h-5 text-pink-500" />
                    <h2 className="text-2xl font-serif text-gray-900">Send Us a Message</h2>
                  </div>
                  <p className="text-gray-600">Fill in the details below and we'll get back to you within 24 hours.</p>
                </div>

                {formStatus === 'success' && (
                  <div className="mb-6 p-4 bg-green-50 border border-green-200 rounded-lg flex items-center gap-3">
                    <CheckCircle className="w-5 h-5 text-green-600" />
                    <span className="text-green-700">Thank you! Your message has been sent successfully.</span>
                  </div>
                )}

                <form onSubmit={handleSubmit} className="space-y-5">
                  <div className="grid sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Full Name *</label>
                      <div className="relative">
                        <User className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-pink-400" />
                        <input
                          type="text"
                          name="name"
                          value={formData.name}
                          onChange={handleChange}
                          required
                          className="w-full pl-10 pr-4 py-2.5 border border-pink-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-pink-500 focus:border-transparent transition-all"
                          placeholder="Enter your full name"
                        />
                      </div>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Email Address *</label>
                      <div className="relative">
                        <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-pink-400" />
                        <input
                          type="email"
                          name="email"
                          value={formData.email}
                          onChange={handleChange}
                          required
                          className="w-full pl-10 pr-4 py-2.5 border border-pink-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-pink-500 focus:border-transparent transition-all"
                          placeholder="Enter your email"
                        />
                      </div>
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Phone Number</label>
                    <div className="relative">
                      <Phone className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-pink-400" />
                      <input
                        type="tel"
                        name="phone"
                        value={formData.phone}
                        onChange={handleChange}
                        className="w-full pl-10 pr-4 py-2.5 border border-pink-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-pink-500 focus:border-transparent transition-all"
                        placeholder="Enter your phone number"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Subject *</label>
                    <div className="relative">
                      <MessageSquare className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-pink-400" />
                      <input
                        type="text"
                        name="subject"
                        value={formData.subject}
                        onChange={handleChange}
                        required
                        className="w-full pl-10 pr-4 py-2.5 border border-pink-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-pink-500 focus:border-transparent transition-all"
                        placeholder="What is this regarding?"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Message *</label>
                    <textarea
                      name="message"
                      value={formData.message}
                      onChange={handleChange}
                      required
                      rows="5"
                      className="w-full px-4 py-2.5 border border-pink-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-pink-500 focus:border-transparent transition-all resize-none"
                      placeholder="Tell us how we can help you..."
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Preferred Contact Method</label>
                    <div className="flex flex-wrap gap-3">
                      {['email', 'phone', 'whatsapp'].map((method) => (
                        <label key={method} className="flex items-center gap-2 cursor-pointer">
                          <input
                            type="radio"
                            name="preferredContact"
                            value={method}
                            checked={formData.preferredContact === method}
                            onChange={handleChange}
                            className="w-4 h-4 text-pink-600 focus:ring-pink-500"
                          />
                          <span className="text-sm text-gray-700 capitalize">{method}</span>
                        </label>
                      ))}
                    </div>
                  </div>

                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="w-full bg-gradient-to-r from-pink-500 to-rose-500 text-white py-3 rounded-xl font-semibold hover:from-pink-600 hover:to-rose-600 transition-all duration-300 flex items-center justify-center gap-2 disabled:opacity-70 disabled:cursor-not-allowed shadow-md hover:shadow-pink-lg transform hover:scale-[1.02] active:scale-[0.98]"
                  >
                    {isSubmitting ? (
                      <>
                        <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                        Sending...
                      </>
                    ) : (
                      <>
                        <Send className="w-5 h-5" />
                        Send Message
                      </>
                    )}
                  </button>
                </form>
              </div>

              {/* Sidebar */}
              <div className="lg:col-span-2 space-y-6">
                {/* Quick Contact */}
                <div className="bg-gradient-to-br from-pink-50 to-rose-50 rounded-2xl p-6 border border-pink-100">
                  <h3 className="font-serif text-xl text-gray-900 mb-4">Quick Assistance</h3>
                  <div className="space-y-3">
                    <div className="flex items-center gap-3">
                      <Phone className="w-5 h-5 text-pink-600" />
                      <div>
                        <p className="text-sm text-gray-500">Call us</p>
                        <p className="font-semibold text-gray-900">+91 91458 42500</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <Mail className="w-5 h-5 text-pink-600" />
                      <div>
                        <p className="text-sm text-gray-500">Email us</p>
                        <p className="font-semibold text-gray-900">info@gehnastore.com</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <Clock className="w-5 h-5 text-pink-600" />
                      <div>
                        <p className="text-sm text-gray-500">Working hours</p>
                        <p className="font-semibold text-gray-900">Mon-Sat: 10 AM - 6 PM</p>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Social Media */}
                <div className="bg-white rounded-2xl border border-pink-100 p-6">
                  <h3 className="font-serif text-xl text-gray-900 mb-4">Follow Us</h3>
                  <div className="flex gap-3">
                    <a href="#" className="w-12 h-12 bg-pink-50 rounded-xl flex items-center justify-center hover:bg-gradient-to-r hover:from-pink-500 hover:to-rose-500 hover:text-white transition-all hover:scale-110 transform">
                      <Instagram className="w-5 h-5 text-pink-600 hover:text-white" />
                    </a>
                    <a href="#" className="w-12 h-12 bg-pink-50 rounded-xl flex items-center justify-center hover:bg-gradient-to-r hover:from-pink-500 hover:to-rose-500 hover:text-white transition-all hover:scale-110 transform">
                      <Facebook className="w-5 h-5 text-pink-600 hover:text-white" />
                    </a>
                    <a href="#" className="w-12 h-12 bg-pink-50 rounded-xl flex items-center justify-center hover:bg-gradient-to-r hover:from-pink-500 hover:to-rose-500 hover:text-white transition-all hover:scale-110 transform">
                      <Twitter className="w-5 h-5 text-pink-600 hover:text-white" />
                    </a>
                    <a href="#" className="w-12 h-12 bg-pink-50 rounded-xl flex items-center justify-center hover:bg-gradient-to-r hover:from-pink-500 hover:to-rose-500 hover:text-white transition-all hover:scale-110 transform">
                      <Youtube className="w-5 h-5 text-pink-600 hover:text-white" />
                    </a>
                  </div>
                </div>

                {/* Trust Badges */}
                <div className="bg-white rounded-2xl border border-pink-100 p-6">
                  <h3 className="font-serif text-xl text-gray-900 mb-4">Why Trust Us</h3>
                  <div className="space-y-2">
                    <div className="flex items-center gap-2 text-sm text-gray-600">
                      <Shield className="w-4 h-4 text-pink-600" />
                      <span>100% Certified & Hallmarked</span>
                    </div>
                    <div className="flex items-center gap-2 text-sm text-gray-600">
                      <Truck className="w-4 h-4 text-pink-600" />
                      <span>Free Shipping on ₹50,000+</span>
                    </div>
                    <div className="flex items-center gap-2 text-sm text-gray-600">
                      <Star className="w-4 h-4 text-pink-600" />
                      <span>4.8/5 Customer Rating</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Google Maps Integration */}
      <div className="py-16 bg-gradient-to-b from-pink-50/30 to-white">
        <div className="container mx-auto px-4">
          <div className="max-w-6xl mx-auto">
            <div className="text-center mb-8">
              <div className="flex items-center justify-center gap-2 mb-4">
                <span className="w-8 h-0.5 bg-gradient-to-r from-pink-500 to-rose-500"></span>
                <span className="text-pink-600 text-sm font-semibold uppercase tracking-wider">Find Us</span>
                <span className="w-8 h-0.5 bg-gradient-to-r from-rose-500 to-pink-500"></span>
              </div>
              <h2 className="text-3xl font-serif text-gray-900 mb-3">
                Visit Our <span className="text-pink-gradient">Flagship Store</span>
              </h2>
              <p className="text-gray-600">
                14-B, Kothari Bhawan, Mirza Ismail Rd, near Panch Batti, New Colony, Jaipur, Rajasthan 302001
              </p>
              <a 
                href="https://www.google.com/maps/place/Gehna+Jaipur/@26.9178204,75.8121204,17z" 
                target="_blank" 
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 text-pink-600 font-medium hover:text-pink-700 mt-2 transition-colors"
              >
                <ExternalLink className="w-4 h-4" />
                Open in Google Maps
              </a>
            </div>

            {/* Google Maps Embed */}
            <div className="relative w-full rounded-2xl overflow-hidden shadow-pink-lg">
              <iframe
                src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3557.9274!2d75.8095457!3d26.9178204!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x396db6aaefffffd3%3A0xfd8bf47df9d8fe71!2sGehna%20Jaipur!5e0!3m2!1sen!2sin!4v1710000000000"
                width="100%"
                height="450"
                style={{ border: 0 }}
                allowFullScreen=""
                loading="lazy"
                referrerPolicy="no-referrer-when-downgrade"
                title="Gehna Store Location Map"
                className="w-full"
              />
              <div className="absolute bottom-4 right-4 bg-white/90 backdrop-blur-sm px-3 py-1.5 rounded-lg shadow-pink-md border border-pink-100">
                <div className="flex items-center gap-2 text-xs text-gray-700">
                  <Navigation className="w-4 h-4 text-pink-600" />
                  <span className="font-medium">Gehna Jaipur</span>
                </div>
              </div>
            </div>

            {/* Quick Location Info */}
            <div className="grid md:grid-cols-3 gap-4 mt-6">
              <div className="bg-white rounded-xl p-4 shadow-pink-md border border-pink-100/50 flex items-center gap-3 hover:border-pink-200 transition-all">
                <MapPin className="w-5 h-5 text-pink-600 flex-shrink-0" />
                <div>
                  <p className="text-xs text-gray-500">Address</p>
                  <p className="text-sm font-medium text-gray-800">14-B, Kothari Bhawan, MI Rd, Jaipur</p>
                </div>
              </div>
              <div className="bg-white rounded-xl p-4 shadow-pink-md border border-pink-100/50 flex items-center gap-3 hover:border-pink-200 transition-all">
                <Phone className="w-5 h-5 text-pink-600 flex-shrink-0" />
                <div>
                  <p className="text-xs text-gray-500">Phone</p>
                  <p className="text-sm font-medium text-gray-800">+91 91458 42500</p>
                </div>
              </div>
              <div className="bg-white rounded-xl p-4 shadow-pink-md border border-pink-100/50 flex items-center gap-3 hover:border-pink-200 transition-all">
                <Clock className="w-5 h-5 text-pink-600 flex-shrink-0" />
                <div>
                  <p className="text-xs text-gray-500">Working Hours</p>
                  <p className="text-sm font-medium text-gray-800">Mon-Sat: 10 AM - 6 PM</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Store Locations */}
      <div className="py-16 bg-white">
        <div className="container mx-auto px-4">
          <div className="max-w-6xl mx-auto">
            <div className="text-center mb-12">
              <div className="flex items-center justify-center gap-2 mb-4">
                <span className="w-8 h-0.5 bg-gradient-to-r from-pink-500 to-rose-500"></span>
                <span className="text-pink-600 text-sm font-semibold uppercase tracking-wider">Store Locations</span>
                <span className="w-8 h-0.5 bg-gradient-to-r from-rose-500 to-pink-500"></span>
              </div>
              <h2 className="text-3xl font-serif text-gray-900 mb-4">
                Visit Our <span className="text-pink-gradient">Showrooms</span>
              </h2>
              <p className="text-gray-600 max-w-2xl mx-auto">
                Experience the beauty of Gehna jewelry in person at any of our elegant showrooms.
              </p>
            </div>

            <div className="grid md:grid-cols-3 gap-6">
              {storeLocations.map((location, index) => (
                <div key={index} className={`bg-white rounded-2xl p-6 shadow-pink-md hover:shadow-pink-lg transition-all duration-300 ${location.isMain ? 'border-2 border-pink-300' : 'border border-pink-100/50'}`}>
                  {location.isMain && (
                    <span className="inline-block bg-gradient-to-r from-pink-500 to-rose-500 text-white text-xs px-3 py-1 rounded-full mb-3">Main Store</span>
                  )}
                  <div className="flex items-start gap-3 mb-4">
                    <MapPin className="w-5 h-5 text-pink-600 flex-shrink-0 mt-1" />
                    <div>
                      <h4 className="font-semibold text-gray-900">{location.name}</h4>
                      <p className="text-sm text-gray-600 mt-1">{location.address}</p>
                    </div>
                  </div>
                  <div className="space-y-1 text-sm text-gray-600">
                    <p><Phone className="w-3 h-3 inline mr-2 text-pink-600" />{location.phone}</p>
                    <p><Clock className="w-3 h-3 inline mr-2 text-pink-600" />{location.timings}</p>
                  </div>
                  <a 
                    href={location.mapLink} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1 text-pink-600 font-medium text-sm mt-3 hover:text-pink-700 transition-colors"
                  >
                    Get Directions →
                  </a>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* FAQ Section */}
      <div className="py-16 bg-gradient-to-b from-pink-50/30 to-white">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto">
            <div className="text-center mb-12">
              <div className="flex items-center justify-center gap-2 mb-4">
                <span className="w-8 h-0.5 bg-gradient-to-r from-pink-500 to-rose-500"></span>
                <span className="text-pink-600 text-sm font-semibold uppercase tracking-wider">FAQs</span>
                <span className="w-8 h-0.5 bg-gradient-to-r from-rose-500 to-pink-500"></span>
              </div>
              <h2 className="text-3xl font-serif text-gray-900 mb-4">
                Frequently Asked <span className="text-pink-gradient">Questions</span>
              </h2>
              <p className="text-gray-600 max-w-2xl mx-auto">
                Find quick answers to common questions about our products, shipping, and services.
              </p>
            </div>

            <div className="grid md:grid-cols-2 gap-4">
              {faqs.map((faq, index) => (
                <div key={index} className="bg-white border border-pink-100/50 rounded-xl p-5 hover:border-pink-200 hover:shadow-pink-md transition-all duration-300">
                  <h4 className="font-semibold text-gray-900 mb-2">{faq.question}</h4>
                  <p className="text-sm text-gray-600 leading-relaxed">{faq.answer}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* CTA Section */}
      <div className="py-16 bg-gradient-to-r from-pink-600 to-rose-600">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto text-center text-white">
            <div className="flex justify-center mb-4">
              <Headphones className="w-16 h-16 text-pink-200" />
            </div>
            <h2 className="text-3xl md:text-4xl font-serif mb-4">
              Have a <span className="text-pink-200">Special</span> Request?
            </h2>
            <p className="text-lg text-pink-100 mb-8 max-w-2xl mx-auto">
              Whether it's a custom design, bulk order, or any other inquiry, we're here to help.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <button 
                onClick={() => {
                  const formElement = document.querySelector('form');
                  if (formElement) {
                    formElement.scrollIntoView({ behavior: 'smooth', block: 'center' });
                  }
                }}
                className="bg-white text-pink-600 px-8 py-3 rounded-full font-semibold hover:bg-pink-50 transition-all shadow-lg hover:shadow-pink-lg transform hover:scale-[1.02] active:scale-[0.98]"
              >
                Send Inquiry
              </button>
              <button 
                onClick={() => navigate('/products')}
                className="border-2 border-white text-white px-8 py-3 rounded-full font-semibold hover:bg-white/10 transition-all transform hover:scale-[1.02] active:scale-[0.98]"
              >
                Explore Collection
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default ContactUs;