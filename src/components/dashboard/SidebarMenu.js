import React from 'react';
import { Link } from 'react-router-dom';

const SidebarMenu = ({ activeView, setActiveView, userName }) => {
  const menuItems = [
    { id: 'home', label: 'Home', icon: '🏠' },
    { id: 'grocery', label: 'Grocery', icon: '🥕' },
    { id: 'offers', label: 'Offers', icon: '🏷️' },
    { id: 'ebt', label: 'EBT', icon: '💳' },
    { id: 'convenience', label: 'Convenience', icon: '🏪' },
    { id: 'alcohol', label: 'Alcohol', icon: '🍷' },
    { id: 'retail', label: 'Retail', icon: '🛍️' },
  ];
  
  const userItems = [
    { id: 'flyers', label: 'Flyers', icon: '📰' },
    { id: 'account', label: 'Account', icon: '👤' },
  ];

  return (
    <aside className="w-64 bg-white border-r border-gray-200 hidden md:block">
      <div className="p-5 flex flex-col h-full">
        {/* Logo */}
        <Link to="/" className="flex items-center mb-8">
          <svg viewBox="0 0 100 50" className="w-10 h-10 mr-2" xmlns="http://www.w3.org/2000/svg">
            {/* K-Human hybrid */}
            <circle cx="12" cy="10" r="5" fill="#2F4A22" />
            <rect x="10" y="15" width="4" height="23" rx="2" fill="#2F4A22" />
            <path d="M12 22 L24 12" stroke="#2F4A22" strokeWidth="4" strokeLinecap="round" />
            <path d="M12 22 L24 35" stroke="#2F4A22" strokeWidth="4" strokeLinecap="round" />
            
            {/* Shopping cart */}
            <path d="M35 35 L55 35 L52 20 L38 20 Z" fill="none" stroke="#2F4A22" strokeWidth="2.5" />
            <path d="M38 20 L35 14 L32 14" stroke="#2F4A22" strokeWidth="2.5" strokeLinecap="round" />
            <line x1="41" y1="20" x2="41" y2="35" stroke="#2F4A22" strokeWidth="1.5" />
            <line x1="46" y1="20" x2="46" y2="35" stroke="#2F4A22" strokeWidth="1.5" />
            <circle cx="42" cy="40" r="2.5" fill="none" stroke="#2F4A22" strokeWidth="1.5" />
            <circle cx="52" cy="40" r="2.5" fill="none" stroke="#2F4A22" strokeWidth="1.5" />
          </svg>
          <span className="text-lg font-bold text-gray-800">Kirova</span>
        </Link>
      
        {/* Main menu */}
        <nav className="mb-8">
          {menuItems.map(item => (
            <button
              key={item.id}
              onClick={() => setActiveView(item.id)}
              className={`flex items-center w-full px-4 py-3 rounded-lg text-left mb-1 ${
                activeView === item.id 
                  ? 'bg-green-50 text-green-700 font-medium' 
                  : 'text-gray-700 hover:bg-gray-100'
              }`}
            >
              <span className="mr-3 text-xl">{item.icon}</span>
              <span>{item.label}</span>
              {item.label === 'Grocery' && (
                <span className="ml-auto bg-green-600 text-white text-xs font-bold px-2 py-1 rounded">
                  New
                </span>
              )}
            </button>
          ))}
        </nav>
        
        <div className="mt-auto pt-6 border-t border-gray-200">
          <h3 className="text-lg font-medium mb-4 text-gray-700">You</h3>
          {userItems.map(item => (
            <button
              key={item.id}
              onClick={() => setActiveView(item.id)}
              className={`flex items-center w-full px-4 py-3 rounded-lg text-left mb-1 ${
                activeView === item.id 
                  ? 'bg-green-50 text-green-700 font-medium' 
                  : 'text-gray-700 hover:bg-gray-100'
              }`}
            >
              <span className="mr-3 text-xl">{item.icon}</span>
              <span>{item.label}</span>
            </button>
          ))}
        </div>
      </div>
    </aside>
  );
};

export default SidebarMenu;