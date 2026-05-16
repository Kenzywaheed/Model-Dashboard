import { createContext, useEffect, useMemo, useState } from 'react';

const PaletteContext = createContext(null);

export const palettes = [
  {
    id: 'indigo',
    label: {
      en: 'Static Indigo',
      ar: 'إنديجو ستاتك',
    },
    description: {
      en: 'The main indigo to violet gradient from the static dashboard.',
      ar: 'نفس تدرج الإنديجو والبنفسجي الأساسي في static dashboard.',
    },
    primary: '#6366f1',
    primaryDark: '#8b5cf6',
    primarySoft: '#eef2ff',
    accent: '#f5f3ff',
  },
  {
    id: 'periwinkle',
    label: {
      en: 'Periwinkle Plum',
      ar: 'بيريوينكل بلام',
    },
    description: {
      en: 'The softer blue to plum gradient used in the classic static screen.',
      ar: 'التدرج الأزرق الهادئ مع البرقوقي الموجود في الشاشة الكلاسيك.',
    },
    primary: '#667eea',
    primaryDark: '#764ba2',
    primarySoft: '#e9edff',
    accent: '#f3e8ff',
  },
  {
    id: 'emerald',
    label: {
      en: 'Emerald Flow',
      ar: 'إيميرالد فلو',
    },
    description: {
      en: 'The exact green accent family used for success and request cards.',
      ar: 'نفس عائلة الأخضر المستخدمة في النجاح وكروت الطلبات.',
    },
    primary: '#10b981',
    primaryDark: '#059669',
    primarySoft: '#d1fae5',
    accent: '#ecfdf5',
  },
  {
    id: 'cobalt',
    label: {
      en: 'Studio Blue',
      ar: 'أزرق ستوديو',
    },
    description: {
      en: 'The strong blue family used in chat and support accents.',
      ar: 'نفس عائلة الأزرق القوية المستخدمة في عناصر الشات والدعم.',
    },
    primary: '#3b82f6',
    primaryDark: '#1d4ed8',
    primarySoft: '#dbeafe',
    accent: '#eff6ff',
  },
  {
    id: 'ruby',
    label: {
      en: 'Editorial Ruby',
      ar: 'روبي إدتوريال',
    },
    description: {
      en: 'The same red family used for reject and alert actions.',
      ar: 'نفس عائلة الأحمر المستخدمة في الرفض والتنبيهات.',
    },
    primary: '#ef4444',
    primaryDark: '#dc2626',
    primarySoft: '#fee2e2',
    accent: '#fef2f2',
  },
  {
    id: 'amber',
    label: {
      en: 'Golden Amber',
      ar: 'جولدن أمبر',
    },
    description: {
      en: 'The warm amber family inspired by the rating and highlight color.',
      ar: 'ألوان دافئة مأخوذة من لون التقييمات والهايلايت.',
    },
    primary: '#f59e0b',
    primaryDark: '#d97706',
    primarySoft: '#fef3c7',
    accent: '#fffbeb',
  },
];

const STORAGE_KEY = 'model-dashboard-palette';

const getInitialPalette = () => {
  const savedId = localStorage.getItem(STORAGE_KEY);
  return palettes.find((item) => item.id === savedId) || palettes[0];
};

export const PaletteProvider = ({ children }) => {
  const [palette, setPaletteState] = useState(getInitialPalette);

  useEffect(() => {
    const root = document.documentElement;

    root.style.setProperty('--brand-primary', palette.primary);
    root.style.setProperty('--brand-primary-dark', palette.primaryDark);
    root.style.setProperty('--brand-primary-soft', palette.primarySoft);
    root.style.setProperty('--brand-accent', palette.accent);

    localStorage.setItem(STORAGE_KEY, palette.id);
  }, [palette]);

  const value = useMemo(() => ({
    palette,
    palettes,
    setPalette: (paletteId) => {
      setPaletteState(palettes.find((item) => item.id === paletteId) || palettes[0]);
    },
  }), [palette]);

  return (
    <PaletteContext.Provider value={value}>
      {children}
    </PaletteContext.Provider>
  );
};

export default PaletteContext;
