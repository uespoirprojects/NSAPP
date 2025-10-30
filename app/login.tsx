import { Typography } from '@/components/ui';
import { IconSymbol } from '@/components/ui/icon-symbol';
import { useI18n } from '@/contexts/i18n-context';
import { useTheme } from '@/contexts/theme-context';
import { useThemeColors } from '@/hooks/use-theme-colors';
import { useRouter } from 'expo-router';
import React from 'react';
import {
    Image,
    KeyboardAvoidingView,
    Platform,
    ScrollView,
    Text,
    TextInput,
    TouchableOpacity,
    View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function LoginScreen() {
  const colors = useThemeColors();
  const { t } = useI18n();
  const { effectiveTheme } = useTheme();
  const router = useRouter();
  
  // Use white border in dark mode, grey in light mode
  const borderColor = effectiveTheme === 'dark' ? colors.white : colors.grey;

  const [email, setEmail] = React.useState('');
  const [password, setPassword] = React.useState('');
  const [showPassword, setShowPassword] = React.useState(false);
  const [isSubmitting, setIsSubmitting] = React.useState(false);
  const [errors, setErrors] = React.useState<{ email?: string; password?: string }>({});

  const validate = () => {
    const newErrors: { email?: string; password?: string } = {};
    const emailRegex = /[^\s@]+@[^\s@]+\.[^\s@]+/;
    if (!emailRegex.test(email.trim())) newErrors.email = t('login.invalidEmail');
    if (!password || password.length < 6) newErrors.password = t('login.passwordMinLength');
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleLogin = async () => {
    if (!validate()) return;
    try {
      setIsSubmitting(true);
      // TODO: Implement login logic
      (router.push as any)('/home');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: colors.screenBackground }} edges={['top', 'bottom', 'left', 'right']}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        style={{ flex: 1 }}
      >
        <ScrollView
        contentContainerStyle={{ flexGrow: 1, paddingHorizontal: 24, paddingVertical: 40, justifyContent: 'center', alignItems: 'center' }}
        showsVerticalScrollIndicator={false}
      >
        <View style={{ width: '100%', maxWidth: 420 }}>
        {/* Heading */}
        <View style={{ marginBottom: 40, alignItems: 'center' }}>
          <Typography variant="h1" color={colors.blue}>
            {t('login.title')}
          </Typography>
          <Text style={{ color: colors.text, opacity: 0.7, marginTop: 4, textAlign: 'center' }}>
            {t('login.subtitle')}
          </Text>
        </View>

        {/* Email Input */}
        <View style={{ marginBottom: 16 }}>
          <Text style={{ color: colors.text, marginBottom: 8, fontFamily: 'Poppins-Medium' }}>{t('login.email')}</Text>
          <TextInput
            placeholder={t('login.emailPlaceholder')}
            placeholderTextColor={colors.grey}
            value={email}
            onChangeText={setEmail}
            keyboardType="email-address"
            autoCapitalize="none"
            style={{
              borderWidth: 1,
              borderColor: errors.email ? colors.red : borderColor,
              borderRadius: 16,
              paddingHorizontal: 16,
              paddingVertical: 12,
              color: colors.text,
              fontFamily: 'Poppins-Regular',
              backgroundColor: colors.cardBackground,
            }}
          />
          {errors.email ? (
            <Text style={{ color: colors.red, marginTop: 6, fontFamily: 'Poppins-Regular' }}>{errors.email}</Text>
          ) : null}
        </View>

        {/* Password Input */}
        <View style={{ marginBottom: 24 }}>
          <Text style={{ color: colors.text, marginBottom: 8, fontFamily: 'Poppins-Medium' }}>{t('login.password')}</Text>
          <View
            style={{
              borderWidth: 1,
              borderColor: errors.password ? colors.red : borderColor,
              borderRadius: 16,
              paddingHorizontal: 16,
              paddingVertical: 0,
              backgroundColor: colors.cardBackground,
              flexDirection: 'row',
              alignItems: 'center',
            }}
          >
            <TextInput
              placeholder={t('login.passwordPlaceholder')}
              placeholderTextColor={colors.grey}
              secureTextEntry={!showPassword}
              value={password}
              onChangeText={setPassword}
              style={{
                flex: 1,
                paddingVertical: 12,
                color: colors.text,
                fontFamily: 'Poppins-Regular',
              }}
            />
            <TouchableOpacity 
              onPress={() => setShowPassword((v) => !v)} 
              style={{ paddingVertical: 8, paddingLeft: 12 }}
            >
              <IconSymbol
                name={showPassword ? 'eye-off-outline' : 'eye-outline'}
                size={22}
                color={colors.blue}
              />
            </TouchableOpacity>
          </View>
          {errors.password ? (
            <Text style={{ color: colors.red, marginTop: 6, fontFamily: 'Poppins-Regular' }}>{errors.password}</Text>
          ) : null}
        </View>

        {/* Sign In Button */}
        <TouchableOpacity
          onPress={handleLogin}
          disabled={isSubmitting}
          style={{
            backgroundColor: colors.blue,
            borderRadius: 16,
            paddingVertical: 16,
            alignItems: 'center',
            marginBottom: 16,
            opacity: isSubmitting ? 0.7 : 1,
          }}
        >
          <Text style={{ color: colors.white, fontFamily: 'Poppins-Bold', fontSize: 16 }}>{t('login.signIn')}</Text>
        </TouchableOpacity>

        {/* OR Continue with */}
        <View style={{ flexDirection: 'row', alignItems: 'center', marginVertical: 24 }}>
          <View style={{ flex: 1, height: 1, backgroundColor: colors.grey }} />
          <Text style={{ marginHorizontal: 12, color: colors.text, opacity: 0.7, fontFamily: 'Poppins-Regular' }}>
            {t('login.orContinue')}
          </Text>
          <View style={{ flex: 1, height: 1, backgroundColor: colors.grey }} />
        </View>

        {/* Social Buttons */}
        <View style={{ flexDirection: 'row', justifyContent: 'center', gap: 20, marginBottom: 24 }}>
          <TouchableOpacity style={{ padding: 12, borderWidth: 1, borderColor: colors.grey, borderRadius: 16 }}>
            <Image source={require('@/assets/icons/google.png')} style={{ width: 20, height: 20 }} resizeMode="contain" />
          </TouchableOpacity>

          <TouchableOpacity style={{ padding: 12, borderWidth: 1, borderColor: colors.grey, borderRadius: 16 }}>
            <Image source={require('@/assets/icons/apple.png')} style={{ width: 20, height: 20 }} resizeMode="contain" />
          </TouchableOpacity>

          <TouchableOpacity style={{ padding: 12, borderWidth: 1, borderColor: colors.grey, borderRadius: 16 }}>
            <Image source={require('@/assets/icons/facebook.png')} style={{ width: 20, height: 20 }} resizeMode="contain" />
          </TouchableOpacity>
        </View>

        {/* Link to Sign Up + Divider */}
        <View style={{ alignItems: 'center', marginBottom: 24 }}>
          <View style={{ flexDirection: 'row', alignItems: 'center' }}>
            <Text style={{ color: colors.text, fontFamily: 'Poppins-Regular' }}>{t('login.noAccount')}{' '}</Text>
            <TouchableOpacity onPress={() => (router.push as any)('/signup')}>
              <Text style={{ color: colors.blue, fontFamily: 'Poppins-Bold' }}>{t('login.signUp')}</Text>
            </TouchableOpacity>
          </View>
          <View style={{ width: '75%', height: 1, backgroundColor: colors.grey, marginTop: 16 }} />
        </View>

        {/* Browse Videos Button */}
        <TouchableOpacity
          onPress={() => (router.push as any)('/home')}
          style={{ borderWidth: 1, borderColor: colors.blue, borderRadius: 16, paddingVertical: 16, alignItems: 'center', marginBottom: 40 }}
        >
          <Text style={{ color: colors.blue, fontFamily: 'Poppins-Bold', fontSize: 16 }}>
            {t('login.browseVideos')}
          </Text>
        </TouchableOpacity>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
    </SafeAreaView>
  );
}
