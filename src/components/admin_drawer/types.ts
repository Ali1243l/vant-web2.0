import React from 'react';

export type TabType =
  | 'analytics'
  | 'products'
  | 'sizes'
  | 'offers'
  | 'banners'
  | 'social'
  | 'controls'
  | 'newsletter'
  | 'welcome_modal'
  | 'backup'
  | 'security'
  | 'ui_components';

export interface AdminNavItem {
  id: TabType;
  label: string;
  labelEn: string;
  icon: React.ComponentType<{ className?: string }>;
  badge?: string | number | null;
  badgeColor?: 'emerald' | 'blue' | 'purple' | 'amber';
  description?: string;
}

export interface AdminNavGroup {
  id: string;
  title: string;
  titleEn: string;
  icon: React.ComponentType<{ className?: string }>;
  items: AdminNavItem[];
}
