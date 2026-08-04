import React from 'react';
import { CalendarDays, Settings } from 'lucide-react';

const BottomNav = ({ activeTab, onTabChange }) => {
  const items = [
    { key: 'kegiatan', label: 'Kegiatan', Icon: CalendarDays },
    { key: 'pengaturan', label: 'Pengaturan', Icon: Settings },
  ];

  return (
    <nav
      className="fixed bottom-0 left-0 right-0 z-50 bg-white border-t border-gray-200 pb-[env(safe-area-inset-bottom)]"
      style={{ boxShadow: '0 -4px 6px -1px rgba(0,0,0,0.05)' }}
    >
      <div className="max-w-md mx-auto flex gap-2 px-3 py-2">
        {items.map(({ key, label, Icon }) => {
          const active = activeTab === key;
          return (
            <button
              key={key}
              type="button"
              onClick={() => onTabChange(key)}
              data-testid={`nav-${key}`}
              className={`flex-1 min-h-12 flex flex-col items-center justify-center gap-0.5 rounded-xl py-2 px-2 transition-all active:scale-[0.98] ${
                active
                  ? 'bg-blue-900 text-white shadow-sm font-semibold'
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200 hover:text-gray-800'
              }`}
            >
              <Icon size={22} strokeWidth={active ? 2.5 : 1.8} />
              <span className={`text-xs ${active ? 'font-semibold' : 'font-medium'}`}>{label}</span>
            </button>
          );
        })}
      </div>
    </nav>
  );
};

export default BottomNav;
