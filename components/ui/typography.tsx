import { Text } from 'react-native';

interface TypographyProps {
  children: React.ReactNode;
  variant?: 'h1' | 'h2' | 'h3' | 'body' | 'caption';
  color?: string;
}

export function Typography({ children, variant = 'body', color = '#030213' }: TypographyProps) {
  const getStyle = () => {
    switch (variant) {
      case 'h1':
        return {
          fontSize: 32,
          fontWeight: 'bold',
          fontFamily: 'Poppins-Bold',
          lineHeight: 40,
        };
      case 'h2':
        return {
          fontSize: 24,
          fontWeight: '600',
          fontFamily: 'Poppins-SemiBold',
          lineHeight: 32,
        };
      case 'h3':
        return {
          fontSize: 20,
          fontWeight: '600',
          fontFamily: 'Poppins-SemiBold',
          lineHeight: 28,
        };
      case 'body':
        return {
          fontSize: 16,
          fontWeight: '400',
          fontFamily: 'Poppins-Regular',
          lineHeight: 24,
        };
      case 'caption':
        return {
          fontSize: 14,
          fontWeight: '400',
          fontFamily: 'Poppins-Regular',
          lineHeight: 20,
        };
      default:
        return {
          fontSize: 16,
          fontWeight: '400',
          fontFamily: 'Poppins-Regular',
          lineHeight: 24,
        };
    }
  };

  return (
    <Text style={[{ color }, getStyle()]}>
      {children}
    </Text>
  );
}
