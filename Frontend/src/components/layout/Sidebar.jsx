// src/components/layout/Sidebar.jsx

import { NavLink } from 'react-router-dom';
import { 
  HomeIcon, 
  UsersIcon, 
  Cog6ToothIcon,
  ChartBarIcon,
  ShoppingBagIcon,
  DocumentTextIcon,
  ArrowRightOnRectangleIcon
} from '@heroicons/react/24/outline';
import { useAuth } from '../../contexts/AuthContext';

const navigation = [
  { name: 'Dashboard', href: '/admin/dashboard', icon: HomeIcon },
  { name: 'Users', href: '/admin/users', icon: UsersIcon },
  { name: 'Products', href: '/admin/products', icon: ShoppingBagIcon },
  { name: 'Order Management', href: '/admin/order-management', icon: ShoppingBagIcon },
  { name: 'Analytics', href: '/admin/analytics', icon: ChartBarIcon },
  { name: 'Reports', href: '/admin/reports', icon: DocumentTextIcon },
  { name: 'Settings', href: '/admin/settings', icon: Cog6ToothIcon },
  
];

export default function Sidebar({ open, setOpen }) {
  const { logout } = useAuth();

  const handleLogout = async () => {
    await logout();
    window.location.href = '/admin/login';
  };

  return (
    <aside className={`${
      open ? 'w-64' : 'w-20'
    } bg-slate-900 text-white transition-all duration-300 flex flex-col`}>
      <div className="p-4 border-b border-slate-700">
        <h1 className={`text-xl font-bold ${!open && 'hidden'}`}>
          Admin<span className="text-indigo-400">Pro</span>
        </h1>
        <div className={`${open ? 'block' : 'hidden'} text-xs text-slate-400`}>
          v2.0.0
        </div>
      </div>

      <nav className="flex-1 p-4 space-y-1 overflow-y-auto">
        {navigation.map((item) => (
          <NavLink
            key={item.name}
            to={item.href}
            className={({ isActive }) =>
              `flex items-center gap-3 px-4 py-3 rounded-lg transition-all ${
                isActive 
                  ? 'bg-indigo-600 text-white' 
                  : 'text-slate-300 hover:bg-slate-800 hover:text-white'
              } ${!open && 'justify-center'}`
            }
          >
            <item.icon className="h-6 w-6 shrink-0" />
            <span className={`${!open && 'hidden'}`}>{item.name}</span>
          </NavLink>
        ))}
      </nav>

      <div className="p-4 border-t border-slate-700">
        <button
          onClick={handleLogout}
          className={`flex items-center gap-3 w-full px-4 py-3 rounded-lg text-slate-300 hover:bg-slate-800 hover:text-white transition-all ${
            !open && 'justify-center'
          }`}
        >
          <ArrowRightOnRectangleIcon className="h-6 w-6 shrink-0" />
          <span className={`${!open && 'hidden'}`}>Logout</span>
        </button>
      </div>
    </aside>
  );
}