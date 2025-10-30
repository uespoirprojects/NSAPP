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

export default function SignupScreen() {
  const colors = useThemeColors();
  const { t } = useI18n();
  const { effectiveTheme } = useTheme();
  const router = useRouter();
  
  // Use white border in dark mode, grey in light mode
  const borderColor = effectiveTheme === 'dark' ? colors.white : colors.grey;

  const [firstName, setFirstName] = React.useState('');
  const [lastName, setLastName] = React.useState('');
  const [email, setEmail] = React.useState('');
  const [password, setPassword] = React.useState('');
  const [address, setAddress] = React.useState('');
  const [city, setCity] = React.useState('');
  const [province, setProvince] = React.useState('');
  const [dateOfBirth, setDateOfBirth] = React.useState('');
  const [showPassword, setShowPassword] = React.useState(false);
  const [isSubmitting, setIsSubmitting] = React.useState(false);
  const [errors, setErrors] = React.useState<{
    firstName?: string;
    lastName?: string;
    email?: string;
    password?: string;
    address?: string;
    city?: string;
    province?: string;
    dateOfBirth?: string;
  }>({});

  const validate = () => {
    const newErrors: typeof errors = {};
    const emailRegex = /[^\s@]+@[^\s@]+\.[^\s@]+/;
    
    if (!firstName.trim()) newErrors.firstName = t('signup.firstNameRequired');
    if (!lastName.trim()) newErrors.lastName = t('signup.lastNameRequired');
    if (!emailRegex.test(email.trim())) newErrors.email = t('signup.invalidEmail');
    if (!password || password.length < 6) newErrors.password = t('signup.passwordMinLength');
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSignUp = async () => {
    if (!validate()) return;
    try {
      setIsSubmitting(true);
      // TODO: Implement signup logic
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
        contentContainerStyle={{ flexGrow: 1, paddingHorizontal: 24, paddingVertical: 50, justifyContent: 'center', alignItems: 'center' }}
        showsVerticalScrollIndicator={false}
      >
        <View style={{ width: '100%', maxWidth: 420 }}>
        {/* Heading */}
        <View style={{ marginBottom: 40, alignItems: 'center' }}>
          <Typography variant="h1" color={colors.blue}>
            {t('signup.title')}
          </Typography>
          <Text style={{ color: colors.text, opacity: 0.7, marginTop: 4, textAlign: 'center' }}>
            {t('signup.subtitle')}
          </Text>
        </View>

        {/* Name Inputs */}
        <View style={{ marginBottom: 16 }}>
          <Text style={{ color: colors.text, marginBottom: 8, fontFamily: 'Poppins-Medium' }}>
            {t('signup.firstName')}
          </Text>
          <TextInput
            placeholder={t('signup.firstNamePlaceholder')}
            placeholderTextColor={colors.grey}
            value={firstName}
            onChangeText={setFirstName}
            style={{
              borderWidth: 1,
              borderColor: errors.firstName ? colors.red : borderColor,
              borderRadius: 16,
              paddingHorizontal: 16,
              paddingVertical: 12,
              color: colors.text,
              fontFamily: 'Poppins-Regular',
              backgroundColor: colors.cardBackground,
            }}
          />
          {errors.firstName ? (
            <Text style={{ color: colors.red, marginTop: 6, fontFamily: 'Poppins-Regular' }}>
              {errors.firstName}
            </Text>
          ) : null}
        </View>

        <View style={{ marginBottom: 16 }}>
          <Text style={{ color: colors.text, marginBottom: 8, fontFamily: 'Poppins-Medium' }}>
            {t('signup.lastName')}
          </Text>
          <TextInput
            placeholder={t('signup.lastNamePlaceholder')}
            placeholderTextColor={colors.grey}
            value={lastName}
            onChangeText={setLastName}
            style={{
              borderWidth: 1,
              borderColor: errors.lastName ? colors.red : borderColor,
              borderRadius: 16,
              paddingHorizontal: 16,
              paddingVertical: 12,
              color: colors.text,
              fontFamily: 'Poppins-Regular',
              backgroundColor: colors.cardBackground,
            }}
          />
          {errors.lastName ? (
            <Text style={{ color: colors.red, marginTop: 6, fontFamily: 'Poppins-Regular' }}>
              {errors.lastName}
            </Text>
          ) : null}
        </View>

        {/* Email Input */}
        <View style={{ marginBottom: 16 }}>
          <Text style={{ color: colors.text, marginBottom: 8, fontFamily: 'Poppins-Medium' }}>
            {t('signup.email')}
          </Text>
          <TextInput
            placeholder={t('signup.emailPlaceholder')}
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
            <Text style={{ color: colors.red, marginTop: 6, fontFamily: 'Poppins-Regular' }}>
              {errors.email}
            </Text>
          ) : null}
        </View>

        {/* Password Input */}
        <View style={{ marginBottom: 16 }}>
          <Text style={{ color: colors.text, marginBottom: 8, fontFamily: 'Poppins-Medium' }}>
            {t('signup.password')}
          </Text>
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
              placeholder={t('signup.passwordPlaceholder')}
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
            <Text style={{ color: colors.red, marginTop: 6, fontFamily: 'Poppins-Regular' }}>
              {errors.password}
            </Text>
          ) : null}
        </View>

        {/* Address Input */}
        <View style={{ marginBottom: 16 }}>
          <Text style={{ color: colors.text, marginBottom: 8, fontFamily: 'Poppins-Medium' }}>
            {t('signup.address')}
          </Text>
          <TextInput
            placeholder={t('signup.addressPlaceholder')}
            placeholderTextColor={colors.grey}
            value={address}
            onChangeText={setAddress}
            style={{
              borderWidth: 1,
              borderColor: errors.address ? colors.red : borderColor,
              borderRadius: 16,
              paddingHorizontal: 16,
              paddingVertical: 12,
              color: colors.text,
              fontFamily: 'Poppins-Regular',
              backgroundColor: colors.cardBackground,
            }}
          />
          {errors.address ? (
            <Text style={{ color: colors.red, marginTop: 6, fontFamily: 'Poppins-Regular' }}>
              {errors.address}
            </Text>
          ) : null}
        </View>

        {/* City Input */}
        <View style={{ marginBottom: 16 }}>
          <Text style={{ color: colors.text, marginBottom: 8, fontFamily: 'Poppins-Medium' }}>
            {t('signup.city')}
          </Text>
          <TextInput
            placeholder={t('signup.cityPlaceholder')}
            placeholderTextColor={colors.grey}
            value={city}
            onChangeText={setCity}
            style={{
              borderWidth: 1,
              borderColor: errors.city ? colors.red : borderColor,
              borderRadius: 16,
              paddingHorizontal: 16,
              paddingVertical: 12,
              color: colors.text,
              fontFamily: 'Poppins-Regular',
              backgroundColor: colors.cardBackground,
            }}
          />
          {errors.city ? (
            <Text style={{ color: colors.red, marginTop: 6, fontFamily: 'Poppins-Regular' }}>
              {errors.city}
            </Text>
          ) : null}
        </View>

        {/* Province Input */}
        <View style={{ marginBottom: 16 }}>
          <Text style={{ color: colors.text, marginBottom: 8, fontFamily: 'Poppins-Medium' }}>
            {t('signup.province')}
          </Text>
          <TextInput
            placeholder={t('signup.provincePlaceholder')}
            placeholderTextColor={colors.grey}
            value={province}
            onChangeText={setProvince}
            style={{
              borderWidth: 1,
              borderColor: errors.province ? colors.red : borderColor,
              borderRadius: 16,
              paddingHorizontal: 16,
              paddingVertical: 12,
              color: colors.text,
              fontFamily: 'Poppins-Regular',
              backgroundColor: colors.cardBackground,
            }}
          />
          {errors.province ? (
            <Text style={{ color: colors.red, marginTop: 6, fontFamily: 'Poppins-Regular' }}>
              {errors.province}
            </Text>
          ) : null}
        </View>

        {/* Date of Birth Input */}
        <View style={{ marginBottom: 24 }}>
          <Text style={{ color: colors.text, marginBottom: 8, fontFamily: 'Poppins-Medium' }}>
            {t('signup.dateOfBirth')}
          </Text>
          <TextInput
            placeholder={t('signup.dateOfBirthPlaceholder')}
            placeholderTextColor={colors.grey}
            value={dateOfBirth}
            onChangeText={setDateOfBirth}
            style={{
              borderWidth: 1,
              borderColor: errors.dateOfBirth ? colors.red : borderColor,
              borderRadius: 16,
              paddingHorizontal: 16,
              paddingVertical: 12,
              color: colors.text,
              fontFamily: 'Poppins-Regular',
              backgroundColor: colors.cardBackground,
            }}
          />
          {errors.dateOfBirth ? (
            <Text style={{ color: colors.red, marginTop: 6, fontFamily: 'Poppins-Regular' }}>
              {errors.dateOfBirth}
            </Text>
          ) : null}
        </View>

        {/* Sign Up Button */}
        <TouchableOpacity
          onPress={handleSignUp}
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
          <Text style={{ color: colors.white, fontFamily: 'Poppins-Bold', fontSize: 16 }}>
            {t('signup.signUp')}
          </Text>
        </TouchableOpacity>

        {/* OR Continue with */}
        <View style={{ flexDirection: 'row', alignItems: 'center', marginVertical: 24 }}>
          <View style={{ flex: 1, height: 1, backgroundColor: colors.grey }} />
          <Text style={{ marginHorizontal: 12, color: colors.text, opacity: 0.7, fontFamily: 'Poppins-Regular' }}>
            {t('signup.orSignUp')}
          </Text>
          <View style={{ flex: 1, height: 1, backgroundColor: colors.grey }} />
        </View>

        {/* Social Buttons */}
        <View style={{ flexDirection: 'row', justifyContent: 'center', gap: 20, marginBottom: 32 }}>
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

        {/* Link to Login */}
        <View style={{ flexDirection: 'row', justifyContent: 'center', marginBottom: 40 }}>
          <Text style={{ color: colors.text, fontFamily: 'Poppins-Regular' }}>
            {t('signup.hasAccount')}{' '}
          </Text>
          <TouchableOpacity onPress={() => (router.push as any)('/login')}>
            <Text style={{ color: colors.blue, fontFamily: 'Poppins-Bold' }}>{t('signup.signIn')}</Text>
          </TouchableOpacity>
        </View>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
    </SafeAreaView>
  );
}