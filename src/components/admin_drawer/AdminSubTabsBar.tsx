import React from 'react';
import type { TabType, AdminNavGroup } from './types';

interface AdminSubTabsBarProps {
  currentActiveGroup: AdminNavGroup;
  activeTab: TabType;
  setActiveTab: (tab: TabType) => void;
}

export const AdminSubTabsBar: React.FC<AdminSubTabsBarProps> = ({
  currentActiveGroup,
  activeTab,
  setActiveTab,
}) => {
  if (currentActiveGroup.items.length <= 1) {
    return null;
  }

  const activeItem = currentActiveGroup.items.find((i) => i.id === activeTab);
  const GroupIcon = currentActiveGroup.icon;

  return (
    <div className="mb-6 flex flex-col sm:flex-row sm:items-center justify-between gap-3 rounded-2xl border border-white/10 bg-[#121524]/90 p-3 sm:p-4 backdrop-blur-md shadow-lg">
      <div className="flex items-center gap-3 min-w-0">
        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-[#004ad7]/20 border border-[#004ad7]/30 text-[#3b82f6]">
          <GroupIcon className="h-5 w-5" />
        </div>
        <div className="min-w-0">
          <div className="flex items-center gap-2">
            <span className="text-[11px] font-semibold text-[#60a5fa] uppercase tracking-wider">
              {currentActiveGroup.title}
            </span>
            <span className="text-white/30 text-xs">•</span>
            <span className="text-xs font-bold text-white truncate">
              {activeItem?.label}
            </span>
          </div>
          <p className="text-[11px] text-white/50 mt-0.5 line-clamp-1">
            {activeItem?.description}
          </p>
        </div>
      </div>

      {/* Clean Sub-Tab Toggle Pills */}
      <div className="flex items-center gap-1.5 overflow-x-auto p-1 rounded-xl bg-black/40 border border-white/10 scrollbar-none">
        {currentActiveGroup.items.map((item) => {
          const isActive = activeTab === item.id;
          const Icon = item.icon;
          return (
            <button
              key={item.id}
              type="button"
              onClick={() => setActiveTab(item.id)}
              className={`flex items-center gap-2 rounded-lg px-3 py-1.5 text-xs font-semibold whitespace-nowrap transition-all cursor-pointer ${
                isActive
                  ? 'bg-[#004ad7] text-white shadow-md shadow-[#004ad7]/25'
                  : 'text-white/60 hover:text-white hover:bg-white/[0.04]'
              }`}
            >
              <Icon className={`h-3.5 w-3.5 ${isActive ? 'text-white' : 'text-white/50'}`} />
              <span>{item.label}</span>
              {item.badge !== null && item.badge !== undefined && (
                <span
                  className={`rounded-full px-1.5 py-0.2 text-[9.5px] font-mono font-bold ${
                    isActive ? 'bg-white/20 text-white' : 'bg-white/10 text-white/70'
                  }`}
                >
                  {item.badge}
                </span>
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
};

export default AdminSubTabsBar;
