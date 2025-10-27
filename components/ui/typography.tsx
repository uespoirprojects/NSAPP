import { Text, TextProps, TextStyle } from 'react-native';

interface TypographyProps extends Omit<TextProps, 'style'> {
  children: React.ReactNode;
  variant?: 'h1' | 'h2' | 'h3' | 'body' | 'caption';
  color?: string;
  style?: TextStyle | TextStyle[];
}

export function Typography({ children, variant = 'body', color = '#030213', style, onPress, ...textProps }: TypographyProps) {
  const getStyle = (): TextStyle => {
    const baseStyle = {
      color,
    };

    switch (variant) {
      case 'h1':
        return {
          ...baseStyle,
          fontSize: 32,
          fontWeight: '700' as TextStyle['fontWeight'],
          fontFamily: 'Poppins-Bold',
          lineHeight: 40,
        };
      case 'h2':
        return {
          ...baseStyle,
          fontSize: 24,
          fontWeight: '600' as TextStyle['fontWeight'],
          fontFamily: 'Poppins-SemiBold',
          lineHeight: 32,
        };
      case 'h3':
        return {
          ...baseStyle,
          fontSize: 20,
          fontWeight: '600' as TextStyle['fontWeight'],
          fontFamily: 'Poppins-SemiBold',
          lineHeight: 28,
        };
      case 'body':
        return {
          ...baseStyle,
          fontSize: 16,
          fontWeight: '400' as TextStyle['fontWeight'],
          fontFamily: 'Poppins-Regular',
          lineHeight: 24,
        };
      case 'caption':
        return {
          ...baseStyle,
          fontSize: 14,
          fontWeight: '400' as TextStyle['fontWeight'],
          fontFamily: 'Poppins-Regular',
          lineHeight: 20,
        };
      default:
        return {
          ...baseStyle,
          fontSize: 16,
          fontWeight: '400' as TextStyle['fontWeight'],
          fontFamily: 'Poppins-Regular',
          lineHeight: 24,
        };
    }
  };

  // Merge style with getStyle, but ensure color from props takes precedence
  let mergedStyle: any = getStyle();
  if (style) {
    if (Array.isArray(style)) {
      mergedStyle = [mergedStyle, ...style];
    } else {
      mergedStyle = [mergedStyle, style];
    }
  }

  return (
    <Text style={mergedStyle} onPress={onPress} {...textProps}>
      {children}
    </Text>
  );
}
