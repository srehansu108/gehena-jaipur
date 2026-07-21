import React, { useState } from 'react';
import { 
  HomeIcon,
  InformationCircleIcon,
  PhoneIcon,
  ShoppingBagIcon,
  Bars3Icon,
  XMarkIcon
} from '@heroicons/react/24/outline';

const AdminPages = () => {
  const [currentPage, setCurrentPage] = useState('home');
  const [sidebarOpen, setSidebarOpen] = useState(false);

  // Navigation items
  const navItems = [
    { id: 'home', label: 'Home', icon: HomeIcon },
    { id: 'about', label: 'About Us', icon: InformationCircleIcon },
    { id: 'contact', label: 'Contact Us', icon: PhoneIcon },
    { id: 'boutique', label: 'Boutique', icon: ShoppingBagIcon },
  ];

  // ===== PAGE CONTENT RENDERER =====
  const renderPageContent = () => {
    switch(currentPage) {
      case 'home':
        return <div className="p-6 bg-white rounded-xl shadow-sm border border-pink-100">
          <h2 className="text-2xl font-bold text-slate-800 mb-4">Home Page Editor</h2>
          <p className="text-slate-500 mb-4">Edit homepage content, hero section, featured products, and banners.</p>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="p-4 bg-pink-50 rounded-lg border border-pink-200">
              <h3 className="font-semibold text-slate-700">Hero Section</h3>
              <p className="text-sm text-slate-500 mt-1">Edit title, subtitle, and CTA buttons</p>
              <button className="mt-2 text-sm text-pink-600 font-medium hover:text-pink-700">Edit →</button>
            </div>
            <div className="p-4 bg-pink-50 rounded-lg border border-pink-200">
              <h3 className="font-semibold text-slate-700">Featured Products</h3>
              <p className="text-sm text-slate-500 mt-1">Manage featured products</p>
              <button className="mt-2 text-sm text-pink-600 font-medium hover:text-pink-700">Edit →</button>
            </div>
            <div className="p-4 bg-pink-50 rounded-lg border border-pink-200">
              <h3 className="font-semibold text-slate-700">Banners</h3>
              <p className="text-sm text-slate-500 mt-1">Edit promotional banners</p>
              <button className="mt-2 text-sm text-pink-600 font-medium hover:text-pink-700">Edit →</button>
            </div>
            <div className="p-4 bg-pink-50 rounded-lg border border-pink-200">
              <h3 className="font-semibold text-slate-700">Categories</h3>
              <p className="text-sm text-slate-500 mt-1">Manage product categories</p>
              <button className="mt-2 text-sm text-pink-600 font-medium hover:text-pink-700">Edit →</button>
            </div>
          </div>
        </div>;

      case 'about':
        return <div className="p-6 bg-white rounded-xl shadow-sm border border-pink-100">
          <h2 className="text-2xl font-bold text-slate-800 mb-4">About Us Page Editor</h2>
          <p className="text-slate-500 mb-4">Edit about us content, mission, vision, and team information.</p>
          <div className="space-y-4">
            <div className="p-4 bg-pink-50 rounded-lg border border-pink-200">
              <h3 className="font-semibold text-slate-700">About Content</h3>
              <p className="text-sm text-slate-500 mt-1">Edit company description and story</p>
              <button className="mt-2 text-sm text-pink-600 font-medium hover:text-pink-700">Edit →</button>
            </div>
            <div className="p-4 bg-pink-50 rounded-lg border border-pink-200">
              <h3 className="font-semibold text-slate-700">Mission & Vision</h3>
              <p className="text-sm text-slate-500 mt-1">Edit mission and vision statements</p>
              <button className="mt-2 text-sm text-pink-600 font-medium hover:text-pink-700">Edit →</button>
            </div>
            <div className="p-4 bg-pink-50 rounded-lg border border-pink-200">
              <h3 className="font-semibold text-slate-700">Team Members</h3>
              <p className="text-sm text-slate-500 mt-1">Manage team member profiles</p>
              <button className="mt-2 text-sm text-pink-600 font-medium hover:text-pink-700">Edit →</button>
            </div>
          </div>
        </div>;

      case 'contact':
        return <div className="p-6 bg-white rounded-xl shadow-sm border border-pink-100">
          <h2 className="text-2xl font-bold text-slate-800 mb-4">Contact Us Page Editor</h2>
          <p className="text-slate-500 mb-4">Edit contact information, form settings, and location details.</p>
          <div className="space-y-4">
            <div className="p-4 bg-pink-50 rounded-lg border border-pink-200">
              <h3 className="font-semibold text-slate-700">Contact Details</h3>
              <p className="text-sm text-slate-500 mt-1">Edit phone, email, and address</p>
              <button className="mt-2 text-sm text-pink-600 font-medium hover:text-pink-700">Edit →</button>
            </div>
            <div className="p-4 bg-pink-50 rounded-lg border border-pink-200">
              <h3 className="font-semibold text-slate-700">Form Settings</h3>
              <p className="text-sm text-slate-500 mt-1">Configure contact form fields</p>
              <button className="mt-2 text-sm text-pink-600 font-medium hover:text-pink-700">Edit →</button>
            </div>
            <div className="p-4 bg-pink-50 rounded-lg border border-pink-200">
              <h3 className="font-semibold text-slate-700">Location Map</h3>
              <p className="text-sm text-slate-500 mt-1">Update map location</p>
              <button className="mt-2 text-sm text-pink-600 font-medium hover:text-pink-700">Edit →</button>
            </div>
          </div>
        </div>;

      case 'boutique':
        return <div className="p-6 bg-white rounded-xl shadow-sm border border-pink-100">
          <h2 className="text-2xl font-bold text-slate-800 mb-4">Boutique Page Editor</h2>
          <p className="text-slate-500 mb-4">Manage products, collections, and store settings.</p>
          <div className="space-y-4">
            <div className="p-4 bg-pink-50 rounded-lg border border-pink-200">
              <h3 className="font-semibold text-slate-700">Products</h3>
              <p className="text-sm text-slate-500 mt-1">Add, edit, or remove products</p>
              <button className="mt-2 text-sm text-pink-600 font-medium hover:text-pink-700">Manage →</button>
            </div>
            <div className="p-4 bg-pink-50 rounded-lg border border-pink-200">
              <h3 className="font-semibold text-slate-700">Collections</h3>
              <p className="text-sm text-slate-500 mt-1">Manage product collections</p>
              <button className="mt-2 text-sm text-pink-600 font-medium hover:text-pink-700">Edit →</button>
            </div>
            <div className="p-4 bg-pink-50 rounded-lg border border-pink-200">
              <h3 className="font-semibold text-slate-700">Store Settings</h3>
              <p className="text-sm text-slate-500 mt-1">Configure store preferences</p>
              <button className="mt-2 text-sm text-pink-600 font-medium hover:text-pink-700">Settings →</button>
            </div>
          </div>
        </div>;

      default:
        return <div className="p-6 bg-white rounded-xl shadow-sm border border-pink-100">
          <h2 className="text-2xl font-bold text-slate-800">Page Editor</h2>
          <p className="text-slate-500">Select a page to edit from the header navigation.</p>
        </div>;
    }
  };

  return (
    <div className="min-h-screen bg-slate-50">
      
      {/* ===== HEADER ===== */}
      <header className="sticky top-0 z-50 bg-white border-b border-pink-100 shadow-sm">
        <div className="px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-14">
            
            {/* Left - Logo */}
            <div className="flex items-center gap-3">
              <button 
                onClick={() => setSidebarOpen(!sidebarOpen)}
                className="p-1.5 rounded-lg hover:bg-pink-50 text-pink-600 lg:hidden"
              >
                <Bars3Icon className="h-5 w-5" />
              </button>
              <div className="flex items-center gap-2">
                <span className="text-xl font-bold bg-gradient-to-r from-pink-600 to-amber-500 bg-clip-text text-transparent">
                  💎 LUXE
                </span>
                <span className="text-xs bg-pink-100 text-pink-600 px-2 py-0.5 rounded-full font-semibold">
                  Admin
                </span>
              </div>
            </div>

            {/* Center - Navigation */}
            <nav className="hidden lg:flex items-center gap-1">
              {navItems.map((item) => {
                const Icon = item.icon;
                return (
                  <button
                    key={item.id}
                    onClick={() => setCurrentPage(item.id)}
                    className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-sm font-medium transition-all duration-300 ${
                      currentPage === item.id
                        ? 'bg-gradient-to-r from-pink-600 to-rose-500 text-white shadow-sm'
                        : 'text-slate-600 hover:bg-pink-50 hover:text-pink-600'
                    }`}
                  >
                    <Icon className="h-4 w-4" />
                    {item.label}
                  </button>
                );
              })}
            </nav>

            {/* Right - Profile */}
            <div className="flex items-center gap-3">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-full bg-gradient-to-r from-pink-600 to-rose-500 flex items-center justify-center text-white text-sm font-bold">
                  A
                </div>
                <div className="hidden md:block">
                  <p className="text-sm font-semibold text-slate-900">Admin</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Mobile Navigation */}
        <div className="lg:hidden border-t border-pink-100 bg-white/50 backdrop-blur-sm">
          <div className="flex justify-around px-2 py-1.5">
            {navItems.map((item) => {
              const Icon = item.icon;
              return (
                <button
                  key={item.id}
                  onClick={() => setCurrentPage(item.id)}
                  className={`flex flex-col items-center gap-0.5 px-2 py-1 rounded-lg text-xs transition-all duration-300 ${
                    currentPage === item.id
                      ? 'text-pink-600 font-semibold'
                      : 'text-slate-500 hover:text-pink-600'
                  }`}
                >
                  <Icon className="h-4 w-4" />
                  <span>{item.label}</span>
                </button>
              );
            })}
          </div>
        </div>
      </header>

      {/* ===== MOBILE SIDEBAR ===== */}
      {sidebarOpen && (
        <div className="fixed inset-0 z-50 lg:hidden">
          <div className="absolute inset-0 bg-black/20 backdrop-blur-sm" onClick={() => setSidebarOpen(false)}></div>
          <div className="absolute left-0 top-0 h-full w-64 bg-white shadow-xl">
            <div className="p-4 border-b border-pink-100 flex justify-between items-center">
              <span className="text-lg font-bold bg-gradient-to-r from-pink-600 to-amber-500 bg-clip-text text-transparent">
                💎 LUXE Admin
              </span>
              <button onClick={() => setSidebarOpen(false)} className="p-1.5 hover:bg-pink-50 rounded-lg">
                <XMarkIcon className="h-5 w-5 text-slate-600" />
              </button>
            </div>
            <div className="p-3 space-y-1">
              {navItems.map((item) => {
                const Icon = item.icon;
                return (
                  <button
                    key={item.id}
                    onClick={() => {
                      setCurrentPage(item.id);
                      setSidebarOpen(false);
                    }}
                    className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-300 ${
                      currentPage === item.id
                        ? 'bg-gradient-to-r from-pink-600 to-rose-500 text-white shadow-sm'
                        : 'text-slate-600 hover:bg-pink-50 hover:text-pink-600'
                    }`}
                  >
                    <Icon className="h-5 w-5" />
                    {item.label}
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* ===== CONTENT AREA ===== */}
      <div className="p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto">
        {renderPageContent()}
      </div>

      {/* ===== FOOTER ===== */}
      <footer className="bg-white border-t border-pink-100 mt-4">
        <div className="px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-4">
              <span className="text-sm font-bold bg-gradient-to-r from-pink-600 to-amber-500 bg-clip-text text-transparent">
                💎 LUXE
              </span>
              <span className="text-sm text-slate-400">|</span>
              <span className="text-sm text-slate-500">Admin Panel v1.0</span>
            </div>
            <div className="flex items-center gap-6 text-sm text-slate-500">
              <button className="hover:text-pink-600 transition-colors">Dashboard</button>
              <button className="hover:text-pink-600 transition-colors">Settings</button>
              <button className="hover:text-pink-600 transition-colors">Help</button>
              <button className="text-red-500 hover:text-red-600 transition-colors font-medium">Logout</button>
            </div>
          </div>
          <div className="mt-4 pt-4 border-t border-pink-100 text-center">
            <p className="text-xs text-slate-400">© 2026 LUXE Jewellery. All rights reserved. ✨</p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default AdminPages;