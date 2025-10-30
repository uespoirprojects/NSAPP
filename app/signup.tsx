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

export default function SignupScreen() {
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
            Create Account
          </Typography>
          <Text className="text-gray-500 font-poppins-regular mt-1">
            Sign up to start your learning journey
          </Text>
        </View>

        {/* Name Inputs */}
        <View className="mb-4">
          <Text className="text-gray-700 font-poppins-medium mb-2">First Name</Text>
          <TextInput
            placeholder="Enter your first name"
            className="border border-gray-300 rounded-2xl px-4 py-3 font-poppins-regular text-gray-800"
          />
        </View>

        <View className="mb-4">
          <Text className="text-gray-700 font-poppins-medium mb-2">Last Name</Text>
          <TextInput
            placeholder="Enter your last name"
            className="border border-gray-300 rounded-2xl px-4 py-3 font-poppins-regular text-gray-800"
          />
        </View>

        {/* Email Input */}
        <View className="mb-4">
          <Text className="text-gray-700 font-poppins-medium mb-2">Email</Text>
          <TextInput
            placeholder="Enter your email"
            keyboardType="email-address"
            className="border border-gray-300 rounded-2xl px-4 py-3 font-poppins-regular text-gray-800"
          />
        </View>

        {/* Password Input */}
        <View className="mb-4">
          <Text className="text-gray-700 font-poppins-medium mb-2">Password</Text>
          <TextInput
            placeholder="Create a password"
            secureTextEntry
            className="border border-gray-300 rounded-2xl px-4 py-3 font-poppins-regular text-gray-800"
          />
        </View>

        {/* Address Input */}
        <View className="mb-4">
          <Text className="text-gray-700 font-poppins-medium mb-2">Address</Text>
          <TextInput
            placeholder="Your address"
            className="border border-gray-300 rounded-2xl px-4 py-3 font-poppins-regular text-gray-800"
          />
        </View>

        {/* City Input */}
        <View className="mb-4">
          <Text className="text-gray-700 font-poppins-medium mb-2">City</Text>
          <TextInput
            placeholder="Enter your city"
            className="border border-gray-300 rounded-2xl px-4 py-3 font-poppins-regular text-gray-800"
          />
        </View>

        {/* Province Input */}
        <View className="mb-4">
          <Text className="text-gray-700 font-poppins-medium mb-2">Province</Text>
          <TextInput
            placeholder="Enter your province"
            className="border border-gray-300 rounded-2xl px-4 py-3 font-poppins-regular text-gray-800"
          />
        </View>

        {/* Date of Birth Input */}
        <View className="mb-6">
          <Text className="text-gray-700 font-poppins-medium mb-2">Date of Birth</Text>
          <TextInput
            placeholder="YYYY-MM-DD"
            className="border border-gray-300 rounded-2xl px-4 py-3 font-poppins-regular text-gray-800"
          />
        </View>

        {/* Sign Up Button */}
        <TouchableOpacity className="bg-brand-blue rounded-2xl py-4 items-center mb-4">
          <Text className="text-white font-poppins-bold text-base">Sign Up</Text>
        </TouchableOpacity>

        {/* OR Continue with */}
        <View className="flex-row items-center my-6">
          <View className="flex-1 h-[1px] bg-gray-300" />
          <Text className="mx-3 text-gray-500 font-poppins-regular">
            or sign up with
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

        {/* Link to Login */}
        <View className="flex-row justify-center mb-10">
          <Text className="text-gray-600 font-poppins-regular">
            Already have an account?{' '}
          </Text>
          <TouchableOpacity onPress={() => router.push('/login')}>
            <Text className="text-brand-blue font-poppins-bold">Sign in</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}
