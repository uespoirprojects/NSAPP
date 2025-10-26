import { Text, View } from 'react-native';

interface ButtonProps {
  title: string;
  onPress?: () => void;
  variant?: 'primary' | 'secondary';
  children?: React.ReactNode;
}

export function Button({ title, onPress, variant = 'primary' }: ButtonProps) {
  const backgroundColor = variant === 'primary' ? '#155DFC' : '#ECECF0';
  const textColor = variant === 'primary' ? 'white' : '#030213';

  return (
    <View
      style={{
        backgroundColor,
        paddingHorizontal: 20,
        paddingVertical: 12,
        borderRadius: 8,
        alignItems: 'center',
      }}
      onTouchEnd={onPress}
    >
      <Text
        style={{
          color: textColor,
          fontSize: 16,
          fontWeight: '600',
          fontFamily: 'Poppins-SemiBold',
        }}
      >
        {title}
      </Text>
    </View>
  );
}
