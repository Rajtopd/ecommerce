'use client';

import { createContext, useContext } from 'react';

// Admin-managed site data (content, categories, zones, settings), fetched
// server-side in the root layout and shared with client components.
const SiteDataContext = createContext({ content: {}, categories: [], zones: [], settings: {} });

export function SiteDataProvider({ value, children }) {
  return <SiteDataContext.Provider value={value}>{children}</SiteDataContext.Provider>;
}

export function useSiteData() {
  return useContext(SiteDataContext);
}

// Content accessor with fallback to the original hardcoded value.
export function useContent() {
  const { content } = useSiteData();
  return (key, fallback = '') => {
    const v = content?.[key];
    return v === undefined || v === null || v === '' ? fallback : v;
  };
}
