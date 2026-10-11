import React, { useState } from "react";
import {
  Lock,
  Globe,
  Sparkles,
  Eye,
  EyeOff,
  ChevronDown,
} from "lucide-react";
import type { TabType, AdminNavGroup } from "./types";

interface AdminSidebarNavProps {
  isAr: boolean;
  activeTab: TabType;
  setActiveTab: (tab: TabType) => void;
  navGroups: AdminNavGroup[];
  currentActiveGroup: AdminNavGroup;
  mobileMenuOpen: boolean;
  setMobileMenuOpen: React.Dispatch<React.SetStateAction<boolean>>;
  mobileMenuRef: React.RefObject<HTMLDivElement | null>;
  siteSettings: {
    maintenance_mode?: boolean;
    [key: string]: any;
  };
  updateSiteSettings: (settings: any) => Promise<any> | void;
  controls: Record<string, any>;
  toggleVisibility: (key: string) => Promise<any> | void;
}

export const AdminSidebarNav: React.FC<AdminSidebarNavProps> = ({
  isAr,
  activeTab,
  setActiveTab,
  navGroups,
  currentActiveGroup,
  mobileMenuOpen,
  setMobileMenuOpen,
  mobileMenuRef,
  siteSettings,
  updateSiteSettings,
  controls,
  toggleVisibility,
}) => {
  const [expandedGroups, setExpandedGroups] = useState<Record<string, boolean>>({
    catalog_group: true,
    marketing_group: true,
    design_group: true,
    system_group: true,
  });

  const toggleGroup = (groupId: string) => {
    setExpandedGroups((prev) => ({
      ...prev,
      [groupId]: !prev[groupId],
    }));
  };

  return (
            <aside className="shrink-0 border-b md:border-b-0 md:border-e border-white/10 bg-[#0f121a] p-3 md:w-64 lg:w-72 flex flex-col justify-between overflow-x-hidden md:overflow-y-auto">
              {/* MOBILE VIEW (< md): Dropdown Group Selector + Horizontal Sub-Pills */}
              <div className="md:hidden flex flex-col gap-2.5 w-full" ref={mobileMenuRef}>
                {/* Mobile Quick Maintenance Mode Toggle */}
                <div className="flex items-center justify-between px-3 py-2 rounded-xl border border-white/10 bg-white/[0.03]">
                  <div className="flex items-center gap-2">
                    <Lock className="h-3.5 w-3.5 text-[#3b82f6]" />
                    <span className="text-xs font-bold text-white">
                      {isAr ? 'وضع الصيانة للمتجر:' : 'Store Maintenance:'}
                    </span>
                  </div>
                  <button
                    type="button"
                    onClick={() => updateSiteSettings({ maintenance_mode: !siteSettings.maintenance_mode })}
                    className={`flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[11px] font-bold border transition-all cursor-pointer ${
                      siteSettings.maintenance_mode
                        ? 'border-[#004ad7]/50 bg-[#004ad7]/25 text-white ring-1 ring-[#3b82f6]/40'
                        : 'border-white/15 bg-white/[0.05] text-white/50'
                    }`}
                  >
                    {siteSettings.maintenance_mode ? <Lock className="h-3 w-3 text-[#60a5fa]" /> : <Globe className="h-3 w-3" />}
                    <span>{siteSettings.maintenance_mode ? (isAr ? 'مفعل (مغلق)' : 'ON') : (isAr ? 'معطل (مفتوح)' : 'OFF')}</span>
                  </button>
                </div>

                {/* Mobile Quick Storefront Banner Toggle */}
                <div className="flex items-center justify-between px-3 py-2 rounded-xl border border-white/10 bg-white/[0.03]">
                  <div className="flex items-center gap-2">
                    <Sparkles className="h-3.5 w-3.5 text-[#3b82f6]" />
                    <span className="text-xs font-bold text-white">
                      {isAr ? 'واجهة الترحيب والتريندات:' : 'Welcome Banner:'}
                    </span>
                  </div>
                  <button
                    type="button"
                    onClick={() => toggleVisibility('banner_hero_visible')}
                    className={`flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[11px] font-bold border transition-all cursor-pointer ${
                      controls['banner_hero_visible']?.visible
                        ? 'border-[#004ad7]/40 bg-[#004ad7]/20 text-white'
                        : 'border-white/15 bg-white/[0.05] text-white/50'
                    }`}
                  >
                    {controls['banner_hero_visible']?.visible ? <Eye className="h-3 w-3 text-[#3b82f6]" /> : <EyeOff className="h-3 w-3" />}
                    <span>{controls['banner_hero_visible']?.visible ? (isAr ? 'مفعلة' : 'ON') : (isAr ? 'معطلة' : 'OFF')}</span>
                  </button>
                </div>

                <div className="relative">
                  <button
                    type="button"
                    onClick={() => setMobileMenuOpen((v) => !v)}
                    className="w-full flex items-center justify-between rounded-xl border border-white/15 bg-white/[0.05] hover:bg-white/[0.08] px-3.5 py-2.5 text-xs font-bold text-white shadow-sm transition-all cursor-pointer"
                  >
                    <div className="flex items-center gap-2.5 min-w-0">
                      <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-[#004ad7]/25 text-[#60a5fa] border border-[#004ad7]/30">
                        <currentActiveGroup.icon className="h-4 w-4" />
                      </div>
                      <div className="text-start truncate">
                        <span className="block text-[10px] text-white/50 font-normal">{isAr ? 'القسم الحالي' : 'Active Section'}</span>
                        <span className="block text-xs font-bold text-white truncate">{currentActiveGroup.title}</span>
                      </div>
                    </div>
                    <div className="flex items-center gap-1.5 shrink-0 text-white/60">
                      <span className="text-[11px] font-semibold text-[#60a5fa]">
                        {currentActiveGroup.items.find((i) => i.id === activeTab)?.labelEn || currentActiveGroup.titleEn}
                      </span>
                      <ChevronDown className={`h-4 w-4 transition-transform duration-200 ${mobileMenuOpen ? 'rotate-180' : ''}`} />
                    </div>
                  </button>

                  {/* Mobile Full Dropdown Menu */}
                  {mobileMenuOpen && (
                    <div className="absolute top-full left-0 right-0 mt-1.5 rounded-2xl border border-white/15 bg-[#121524] p-2 shadow-2xl z-50 max-h-[75vh] overflow-y-auto backdrop-blur-2xl">
                      <div className="space-y-3 p-1">
                        {navGroups.map((group) => {
                          const GroupIcon = group.icon;
                          return (
                            <div key={group.id} className="rounded-xl border border-white/5 bg-white/[0.02] p-1.5">
                              <div className="flex items-center gap-2 px-2 py-1 text-[11px] font-bold text-white/40 uppercase tracking-wider">
                                <GroupIcon className="h-3.5 w-3.5 text-[#3b82f6]" />
                                <span>{group.title}</span>
                              </div>
                              <div className="mt-1 space-y-1">
                                {group.items.map((item) => {
                                  const isActive = activeTab === item.id;
                                  const ItemIcon = item.icon;
                                  return (
                                    <button
                                      key={item.id}
                                      type="button"
                                      onClick={() => {
                                        setActiveTab(item.id);
                                        setMobileMenuOpen(false);
                                      }}
                                      className={`w-full flex items-center justify-between rounded-lg px-2.5 py-2 text-xs font-medium transition-all cursor-pointer ${
                                        isActive
                                          ? 'bg-[#004ad7] text-white font-bold shadow-sm'
                                          : 'text-white/70 hover:bg-white/[0.05] hover:text-white'
                                      }`}
                                    >
                                      <div className="flex items-center gap-2 min-w-0">
                                        <ItemIcon className="h-3.5 w-3.5 shrink-0" />
                                        <span className="truncate">{item.label}</span>
                                      </div>
                                      {item.badge !== null && item.badge !== undefined && (
                                        <span
                                          className={`text-[9.5px] px-2 py-0.5 rounded-full font-mono font-bold ${
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
                        })}
                      </div>
                    </div>
                  )}
                </div>

                {/* Mobile Sub-Item Navigation Pills (If current group has multiple items) */}
                {currentActiveGroup.items.length > 1 && (
                  <div className="flex items-center gap-1.5 overflow-x-auto py-1 scrollbar-none">
                    {currentActiveGroup.items.map((item) => {
                      const isActive = activeTab === item.id;
                      const ItemIcon = item.icon;
                      return (
                        <button
                          key={item.id}
                          type="button"
                          onClick={() => setActiveTab(item.id)}
                          className={`flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs whitespace-nowrap transition-all cursor-pointer ${
                            isActive
                              ? 'bg-[#004ad7] text-white font-bold shadow-md shadow-[#004ad7]/25'
                              : 'bg-white/[0.04] border border-white/10 text-white/70 hover:text-white hover:bg-white/[0.08]'
                          }`}
                        >
                          <ItemIcon className="h-3.5 w-3.5" />
                          <span>{item.label}</span>
                          {item.badge !== null && item.badge !== undefined && (
                            <span
                              className={`rounded-full px-1.5 py-0.2 text-[9px] font-mono font-bold ${
                                isActive ? 'bg-white/20 text-white' : 'bg-white/10 text-white/60'
                              }`}
                            >
                              {item.badge}
                            </span>
                          )}
                        </button>
                      );
                    })}
                  </div>
                )}
              </div>

              {/* DESKTOP VIEW (>= md): Collapsible Accordion Group Dropdowns */}
              <nav className="hidden md:flex flex-col gap-2.5 w-full">
                {/* Quick Store Maintenance Mode Toggle Card */}
                <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-3 mb-0.5">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-[#004ad7]/20 border border-[#004ad7]/30 text-[#60a5fa]">
                        <Lock className="h-3.5 w-3.5" />
                      </div>
                      <div>
                        <div className="text-xs font-bold text-white">
                          {isAr ? 'وضع الصيانة للمتجر' : 'Store Maintenance Mode'}
                        </div>
                        <div className="text-[10px] text-zinc-400">
                          {siteSettings.maintenance_mode
                            ? (isAr ? 'المتجر مغلق وتظهر شاشة الصيانة' : 'Store closed to visitors')
                            : (isAr ? 'المتجر متاح ومفتوح للزبائن' : 'Store is live to visitors')}
                        </div>
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={() => updateSiteSettings({ maintenance_mode: !siteSettings.maintenance_mode })}
                      className={`flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[11px] font-bold border transition-all cursor-pointer ${
                        siteSettings.maintenance_mode
                          ? 'border-[#004ad7]/50 bg-[#004ad7]/25 text-white ring-1 ring-[#3b82f6]/40 shadow-xs'
                          : 'border-white/15 bg-white/[0.05] text-white/50 hover:text-white'
                      }`}
                    >
                      {siteSettings.maintenance_mode ? <Lock className="h-3 w-3 text-[#60a5fa]" /> : <Globe className="h-3 w-3" />}
                      <span>{siteSettings.maintenance_mode ? (isAr ? 'مفعل (مغلق)' : 'ON') : (isAr ? 'معطل (مفتوح)' : 'OFF')}</span>
                    </button>
                  </div>
                </div>

                {/* Quick Storefront Hero & Trends Banner Toggle Card */}
                <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-3 mb-1">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-[#004ad7]/20 border border-[#004ad7]/30 text-[#3b82f6]">
                        <Sparkles className="h-3.5 w-3.5" />
                      </div>
                      <div>
                        <div className="text-xs font-bold text-white">
                          {isAr ? 'واجهة الترحيب والتريندات' : 'Storefront Welcome Banner'}
                        </div>
                        <div className="text-[10px] text-white/50">
                          {isAr ? 'الظهور لجميع زوار المتجر' : 'Visible to store visitors'}
                        </div>
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={() => toggleVisibility('banner_hero_visible')}
                      className={`flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[11px] font-bold border transition-all cursor-pointer ${
                        controls['banner_hero_visible']?.visible
                          ? 'border-[#004ad7]/40 bg-[#004ad7]/20 text-white'
                          : 'border-white/15 bg-white/[0.05] text-white/50 hover:text-white'
                      }`}
                    >
                      {controls['banner_hero_visible']?.visible ? <Eye className="h-3 w-3 text-[#3b82f6]" /> : <EyeOff className="h-3 w-3" />}
                      <span>{controls['banner_hero_visible']?.visible ? (isAr ? 'مفعلة' : 'ON') : (isAr ? 'معطلة' : 'OFF')}</span>
                    </button>
                  </div>
                </div>

                {navGroups.map((group) => {
                  const isExpanded = !!expandedGroups[group.id];
                  const hasActiveChild = group.items.some((i) => i.id === activeTab);
                  const GroupIcon = group.icon;

                  // Standalone item (like Analytics) without sub-children
                  if (group.items.length === 1) {
                    const singleItem = group.items[0];
                    const isActive = activeTab === singleItem.id;
                    return (
                      <button
                        key={group.id}
                        type="button"
                        onClick={() => setActiveTab(singleItem.id)}
                        className={`flex items-center justify-between rounded-xl px-3.5 py-2.5 text-xs font-semibold transition-all cursor-pointer ${
                          isActive
                            ? 'bg-[#004ad7] text-white shadow-md shadow-[#004ad7]/25 font-bold ring-1 ring-[#3b82f6]/40'
                            : 'text-white/70 hover:bg-white/[0.05] hover:text-white'
                        }`}
                      >
                        <div className="flex items-center gap-2.5">
                          <GroupIcon className={`h-4 w-4 ${isActive ? 'text-white' : 'text-[#3b82f6]'}`} />
                          <span>{singleItem.label}</span>
                        </div>
                        <span className="flex h-2 w-2 rounded-full bg-emerald-400 animate-pulse" />
                      </button>
                    );
                  }

                  // Collapsible group with sub-items
                  return (
                    <div
                      key={group.id}
                      className={`rounded-2xl border transition-all ${
                        hasActiveChild
                          ? 'border-white/15 bg-white/[0.03]'
                          : 'border-white/5 bg-transparent hover:border-white/10'
                      }`}
                    >
                      {/* Group Header Toggle */}
                      <button
                        type="button"
                        onClick={() => toggleGroup(group.id)}
                        className="w-full flex items-center justify-between px-3 py-2 text-start text-xs font-bold text-white transition-all cursor-pointer hover:bg-white/[0.03] rounded-t-2xl"
                      >
                        <div className="flex items-center gap-2.5">
                          <div
                            className={`flex h-6 w-6 items-center justify-center rounded-lg border text-xs ${
                              hasActiveChild
                                ? 'bg-[#004ad7]/25 border-[#004ad7]/40 text-[#60a5fa]'
                                : 'bg-white/[0.04] border-white/10 text-white/60'
                            }`}
                          >
                            <GroupIcon className="h-3.5 w-3.5" />
                          </div>
                          <span className={hasActiveChild ? 'text-white font-bold' : 'text-white/80 font-semibold'}>
                            {group.title}
                          </span>
                        </div>
                        <div className="flex items-center gap-2">
                          <ChevronDown
                            className={`h-3.5 w-3.5 text-white/40 transition-transform duration-200 ${
                              isExpanded ? 'rotate-180 text-white/70' : ''
                            }`}
                          />
                        </div>
                      </button>

                      {/* Dropdown Items List */}
                      {isExpanded && (
                        <div className="px-1.5 pb-1.5 pt-0.5 space-y-1">
                          {group.items.map((item) => {
                            const isActive = activeTab === item.id;
                            const ItemIcon = item.icon;
                            return (
                              <button
                                key={item.id}
                                type="button"
                                onClick={() => setActiveTab(item.id)}
                                className={`w-full flex items-center justify-between rounded-xl px-2.5 py-2 text-xs font-medium transition-all cursor-pointer ${
                                  isActive
                                    ? 'bg-[#004ad7] text-white font-bold shadow-md shadow-[#004ad7]/25'
                                    : 'text-white/65 hover:bg-white/[0.05] hover:text-white'
                                }`}
                              >
                                <div className="flex items-center gap-2 min-w-0">
                                  <ItemIcon
                                    className={`h-3.5 w-3.5 shrink-0 ${
                                      isActive ? 'text-white' : 'text-white/50'
                                    }`}
                                  />
                                  <span className="truncate">{item.label}</span>
                                </div>
                                {item.badge !== null && item.badge !== undefined && (
                                  <span
                                    className={`rounded-full px-2 py-0.5 text-[9.5px] font-mono font-bold ${
                                      isActive
                                        ? 'bg-white/20 text-white'
                                        : 'bg-white/10 text-white/60'
                                    }`}
                                  >
                                    {item.badge}
                                  </span>
                                )}
                              </button>
                            );
                          })}
                        </div>
                      )}
                    </div>
                  );
                })}
              </nav>

              <div className="hidden md:block mt-6 pt-4 border-t border-white/10 text-[11px] text-white/40">
                <div className="flex items-center justify-between">
                  <span>VANT Master OS</span>
                  <span className="font-mono text-emerald-400 text-[10px]">v3.2 PRO</span>
                </div>
              </div>
            </aside>

  );
};

export default AdminSidebarNav;
