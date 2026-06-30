import React from 'react';
import { CalendarDays, Settings } from 'lucide-react';

const BottomNav = ({ activeTab, onTabChange }) => {
  const items = [
    { key: 'kegiatan', label: 'Kegiatan', Icon: CalendarDays },
    { key: 'pengaturan', label: 'Pengaturan', Icon: Settings },
  ];

  return (
    <nav
      className="fixed bottom-0 left-0 right-0 z-50 bg-white border-t border-gray-200"
      style={{ boxShadow: '0 -4px 6px -1px rgba(0,0,0,0.05)' }}
    >
      <div className="max-w-md mx-auto flex">
        {items.map(({ key, label, Icon }) => {
          const active = activeTab === key;
          return (
            <button
              key={key}
              onClick={() => onTabChange(key)}
              data-testid={`nav-${key}`}
              className={`flex-1 flex flex-col items-center justify-center py-2 gap-1 transition-colors ${
                active ? 'text-blue-900' : 'text-gray-400 hover:text-gray-600'
              }`}
            >
              <Icon size={22} strokeWidth={active ? 2.5 : 1.8} />
              <span className={`text-xs ${active ? 'font-semibold' : 'font-normal'}`}>{label}</span>
            </button>
          );
        })}
      </div>
    </nav>
  );
};

export default BottomNav;
