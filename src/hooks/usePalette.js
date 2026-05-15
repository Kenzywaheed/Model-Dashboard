import { useContext } from 'react';
import PaletteContext from '../context/PaletteContext';

export const usePalette = () => useContext(PaletteContext);
