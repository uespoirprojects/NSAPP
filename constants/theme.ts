/**
 * Below are the colors that are used in the app. The colors are defined in the light and dark mode.
 * There are many other ways to style your app. For example, [Nativewind](https://www.nativewind.dev/), [Tamagui](https://tamagui.dev/), [unistyles](https://reactnativeunistyles.vercel.app), etc.
 */

import { Platform } from 'react-native';

// Custom color palette
export const CustomColors = {
  blue: '#155DFC',
  lightBlue: '#F2F8FF',
  grey: '#ECECF0',
  red: '#EA222B',
  black: '#030213',
  white: '#FFFFFF',
  whiteSmoke: '#F3F3F5',
};

const tintColorLight = CustomColors.blue;
const tintColorDark = '#fff';

export const Colors = {
  light: {
    text: CustomColors.black,
    background: '#fff',
    tint: tintColorLight,
    icon: CustomColors.grey,
    tabIconDefault: CustomColors.grey,
    tabIconSelected: tintColorLight,
    // Custom colors
    blue: CustomColors.blue,
    lightBlue: CustomColors.lightBlue,
    grey: CustomColors.grey,
    red: CustomColors.red,
    black: CustomColors.black,
    whiteSmoke: CustomColors.whiteSmoke,
  },
  dark: {
    text: '#ECEDEE',
    background: CustomColors.black,
    tint: tintColorDark,
    icon: '#9BA1A6',
    tabIconDefault: '#9BA1A6',
    tabIconSelected: tintColorDark,
    // Custom colors
    blue: CustomColors.blue,
    lightBlue: CustomColors.lightBlue,
    grey: CustomColors.grey,
    red: CustomColors.red,
    black: CustomColors.black,
    whiteSmoke: CustomColors.whiteSmoke,
  },
};

export const Fonts = Platform.select({
  ios: {
    /** Poppins font family for iOS */
    sans: 'Poppins-Regular',
    serif: 'Poppins-Regular',
    rounded: 'Poppins-Regular',
    mono: 'ui-monospace',
    /** Poppins font weights */
    regular: 'Poppins-Regular',
    medium: 'Poppins-Medium',
    semibold: 'Poppins-SemiBold',
    bold: 'Poppins-Bold',
  },
  default: {
    sans: 'Poppins-Regular',
    serif: 'Poppins-Regular',
    rounded: 'Poppins-Regular',
    mono: 'monospace',
    /** Poppins font weights */
    regular: 'Poppins-Regular',
    medium: 'Poppins-Medium',
    semibold: 'Poppins-SemiBold',
    bold: 'Poppins-Bold',
  },
  web: {
    sans: "'Poppins', system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif",
    serif: "'Poppins', Georgia, 'Times New Roman', serif",
    rounded: "'Poppins', 'SF Pro Rounded', 'Hiragino Maru Gothic ProN', Meiryo, 'MS PGothic', sans-serif",
    mono: "SFMono-Regular, Menlo, Monaco, Consolas, 'Liberation Mono', 'Courier New', monospace",
    /** Poppins font weights */
    regular: 'Poppins-Regular',
    medium: 'Poppins-Medium',
    semibold: 'Poppins-SemiBold',
    bold: 'Poppins-Bold',
  },
});
