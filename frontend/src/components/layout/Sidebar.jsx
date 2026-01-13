import { NavLink, useLocation } from 'react-router-dom';
import { 
  House, 
  Ticket, 
  Users, 
  Gear, 
  SignOut,
  CaretRight,
  Code
} from '@phosphor-icons/react';
import { useAuth } from '../../contexts/AuthContext';
import { ROLE_CONFIG } from '../../services/api';

export default function Sidebar() {
  const { user, logout, isAdmin } = useAuth();
  const location = useLocation();

  const navigation = [
    { name: 'Dashboard', href: '/', icon: House },
    ...(isAdmin ? [{ name: 'Utilizadores', href: '/admin', icon: Users }] : []),
    { name: 'Definições', href: '/settings', icon: Gear },
  ];

  const roleConfig = ROLE_CONFIG[user?.role] || { label: 'User', color: 'text-dark-400' };

  return (
    <aside className="fixed left-0 top-0 h-screen w-60 bg-dark-900 border-r border-dark-800 flex flex-col">
      {/* Logo */}
      <div className="p-4 border-b border-dark-800">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-lg bg-accent/10 border border-accent/20 flex items-center justify-center">
            <Code className="w-5 h-5 text-accent" weight="bold" />
          </div>
          <div className="flex flex-col">
            <span className="text-sm font-semibold text-dark-100">Elder Fernandes</span>
            <span className="text-2xs text-dark-500">Tech Solutions</span>
          </div>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 p-3 space-y-1">
        {navigation.map((item) => {
          const isActive = item.href === '/' 
            ? location.pathname === '/'
            : location.pathname.startsWith(item.href);

          return (
            <NavLink
              key={item.name}
              to={item.href}
              className={`
                flex items-center gap-3 px-3 py-2 rounded-md text-sm font-medium
                transition-all duration-150
                ${isActive 
                  ? 'bg-dark-800 text-dark-100' 
                  : 'text-dark-400 hover:text-dark-200 hover:bg-dark-800/50'
                }
              `}
            >
              <item.icon className="w-4.5 h-4.5" weight={isActive ? 'fill' : 'regular'} />
              {item.name}
              {isActive && (
                <CaretRight className="w-3 h-3 ml-auto text-dark-500" />
              )}
            </NavLink>
          );
        })}
      </nav>

      {/* User Section */}
      <div className="p-3 border-t border-dark-800">
        <div className="flex items-center gap-3 px-3 py-2">
          <div className="w-8 h-8 rounded-full bg-dark-700 flex items-center justify-center text-sm font-medium text-dark-300">
            {user?.name?.charAt(0)?.toUpperCase() || 'U'}
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium text-dark-100 truncate">{user?.name}</p>
            <p className={`text-2xs ${roleConfig.color}`}>{roleConfig.label}</p>
          </div>
        </div>
        <button
          onClick={logout}
          className="w-full flex items-center gap-3 px-3 py-2 mt-1 rounded-md text-sm font-medium text-dark-400 hover:text-red-400 hover:bg-red-500/5 transition-all duration-150"
        >
          <SignOut className="w-4.5 h-4.5" />
          Terminar Sessão
        </button>
      </div>
    </aside>
  );
}
