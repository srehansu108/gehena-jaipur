// src/components/layout/Header.jsx

import { useState } from 'react';
import { Bars3Icon, XMarkIcon, BellIcon, UserCircleIcon } from '@heroicons/react/24/outline';
import { useAuth } from '../../contexts/AuthContext';

export default function Header({ sidebarOpen, setSidebarOpen }) {
  const { user } = useAuth();
  const [showNotifications, setShowNotifications] = useState(false);

  return (
    <header className="bg-white border-b border-slate-200 px-6 py-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <button
            onClick={() => setSidebarOpen(!sidebarOpen)}
            className="p-2 rounded-lg hover:bg-slate-100 transition-colors"
          >
            {sidebarOpen ? (
              <XMarkIcon className="h-6 w-6 text-slate-600" />
            ) : (
              <Bars3Icon className="h-6 w-6 text-slate-600" />
            )}
          </button>
          
          <div className="hidden sm:block">
            <h2 className="text-lg font-semibold text-slate-800">
              Welcome back, {user?.name || 'Admin'}! 👋
            </h2>
          </div>
        </div>

        <div className="flex items-center gap-4">
          {/* Notifications */}
          <button
            onClick={() => setShowNotifications(!showNotifications)}
            className="relative p-2 rounded-lg hover:bg-slate-100 transition-colors"
          >
            <BellIcon className="h-6 w-6 text-slate-600" />
            <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full"></span>
          </button>

          {/* User Profile */}
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-indigo-100 flex items-center justify-center">
              <UserCircleIcon className="h-8 w-8 text-indigo-600" />
            </div>
            <div className="hidden md:block">
              <p className="text-sm font-medium text-slate-800">{user?.name || 'Admin'}</p>
              <p className="text-xs text-slate-500">{user?.role || 'Super Admin'}</p>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
}