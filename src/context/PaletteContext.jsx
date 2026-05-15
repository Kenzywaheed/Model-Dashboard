import { createContext, useEffect, useMemo, useState } from 'react';

const PaletteContext = createContext(null);

export const palettes = [
  {
    id: 'teal',
    primary: '#4d7b73',
    primaryDark: '#365b55',
    primarySoft: '#dceae6',
    accent: '#f1ece4',
  },
  {
    id: 'clay',
    primary: '#b26e5f',
    primaryDark: '#8d574b',
    primarySoft: '#f4e1dc',
    accent: '#f4ebe5',
  },
  {
    id: 'olive',
    primary: '#7b8653',
    primaryDark: '#5f6840',
    primarySoft: '#e8edd7',
    accent: '#f2efe5',
  },
  {
    id: 'midnight',
    primary: '#4f6b92',
    primaryDark: '#364d6d',
    primarySoft: '#dfe8f4',
    accent: '#e9eef5',
  },
  {
    id: 'berry',
    primary: '#9d587f',
    primaryDark: '#7d4163',
    primarySoft: '#f0dce8',
    accent: '#f6ecf2',
  },
  {
    id: 'sand',
    primary: '#ad8450',
    primaryDark: '#88663d',
    primarySoft: '#f2e4d0',
    accent: '#f7efe4',
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
