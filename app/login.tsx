import { Typography } from '@/components/ui';
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

export default function LoginScreen() {
  const router = useRouter();

  return (
    <KeyboardAvoidingView
      className="flex-1 bg-white"
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <ScrollView
  contentContainerStyle={{ flexGrow: 1, paddingHorizontal: 24, paddingVertical: 40 }}
  showsVerticalScrollIndicator={false}
      >
        {/* Heading */}
        <View className="mb-10">
          <Typography variant="h1" color="#155DFC">
            Edulearn
          </Typography>
          <Text className="text-gray-500 font-poppins-regular mt-1">
            Sign in to continue learning
          </Text>
        </View>

        {/* Email Input */}
        <View className="mb-4">
          <Text className="text-gray-700 font-poppins-medium mb-2">Email</Text>
          <TextInput
            placeholder="Enter your email"
            className="border border-gray-300 rounded-2xl px-4 py-3 font-poppins-regular text-gray-800"
            keyboardType="email-address"
          />
        </View>

        {/* Password Input */}
        <View className="mb-6">
          <Text className="text-gray-700 font-poppins-medium mb-2">Password</Text>
          <TextInput
            placeholder="Enter your password"
            secureTextEntry
            className="border border-gray-300 rounded-2xl px-4 py-3 font-poppins-regular text-gray-800"
          />
        </View>

        {/* Sign In Button */}
        <TouchableOpacity className="bg-brand-blue rounded-2xl py-4 items-center mb-4">
          <Text className="text-white font-poppins-bold text-base">Sign In</Text>
        </TouchableOpacity>

        {/* OR Continue with */}
        <View className="flex-row items-center my-6">
          <View className="flex-1 h-[1px] bg-gray-300" />
          <Text className="mx-3 text-gray-500 font-poppins-regular">
            or continue with
          </Text>
          <View className="flex-1 h-[1px] bg-gray-300" />
        </View>

        {/* Social Buttons */}
        <View className="flex-row justify-center gap-x-5 mb-8">
          <TouchableOpacity className="p-3 border border-gray-300 rounded-2xl">
            <Image
              source={require('@/assets/icons/google.png')}
              className="w-5 h-5"
              resizeMode="contain"
            />
          </TouchableOpacity>

          <TouchableOpacity className="p-3 border border-gray-300 rounded-2xl">
            <Image
              source={require('@/assets/icons/apple.png')}
              className="w-5 h-5"
              resizeMode="contain"
            />
          </TouchableOpacity>

          <TouchableOpacity className="p-3 border border-gray-300 rounded-2xl">
            <Image
              source={require('@/assets/icons/facebook.png')}
              className="w-5 h-5"
              resizeMode="contain"
            />
          </TouchableOpacity>
        </View>

        {/* Link to Sign Up + Divider */}
        <View className="flex-col items-center mb-6">
          <View className="flex-row items-center">
            <Text className="text-gray-600 font-poppins-regular">
              Don’t have an account?{' '}
            </Text>
            <TouchableOpacity onPress={() => router.push('/signup')}>
              <Text className="text-brand-blue font-poppins-bold">Sign up</Text>
            </TouchableOpacity>
          </View>
          <View className="w-3/4 h-[1px] bg-gray-300 mt-4" />
        </View>

        {/* Browse Videos Button */}
        <TouchableOpacity
          className="border border-brand-blue rounded-2xl py-4 items-center mb-10"
          onPress={() => console.log('Browse videos pressed')}
        >
          <Text className="text-brand-blue font-poppins-bold text-base">
            Browse Videos
          </Text>
        </TouchableOpacity>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}
