// constants/fonts.ts

import { Platform } from 'react-native';

export const Fonts = {
  // Example for a regular font
  regular: Platform.select({
    ios: 'System Font', // Or a specific iOS font like 'Helvetica Neue'
    android: 'sans-serif', // Or a specific Android font like 'Roboto'
    default: 'System Font',
  }),
  // Example for a medium font
  medium: Platform.select({
    ios: 'System Font Medium', // Or 'Helvetica Neue Medium'
    android: 'sans-serif-medium', // Or 'Roboto Medium'
    default: 'System Font',
  }),
  // Example for a bold font
  bold: Platform.select({
    ios: 'System Font Bold', // Or 'Helvetica Neue Bold'
    android: 'sans-serif-bold', // Or 'Roboto Bold'
    default: 'System Font',
  }),
  // Add other font styles as needed (e.g., light, italic)
};

// You can also define font sizes and line heights here if you wish
export const FontSizes = {
  small: 12,
  medium: 16,
  large: 20,
  extraLarge: 24,
};

export const LineHeights = {
  small: 18,
  medium: 24,
  large: 30,
};
