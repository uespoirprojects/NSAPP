import { Typography } from '@/components/ui';
import { IconSymbol } from '@/components/ui/icon-symbol';
import { useI18n } from '@/contexts/i18n-context';
import { useThemeColors } from '@/hooks/use-theme-colors';
import { router } from 'expo-router';
import React from 'react';
import type { ViewStyle } from 'react-native';
import { ScrollView, TouchableOpacity, View, useWindowDimensions } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function PrivacyPolicyScreen() {
  const colors = useThemeColors();
  const { t, currentLanguage } = useI18n();
  const { width: windowWidth, height: windowHeight } = useWindowDimensions();
  const isWideLayout = windowWidth > windowHeight || windowWidth >= 900;
  const contentMaxWidth = Math.min(windowWidth * 0.8, 800);
  const responsiveContainerStyle: ViewStyle = {
    width: isWideLayout ? contentMaxWidth : '100%',
    alignSelf: isWideLayout ? 'center' : 'stretch',
  };

  const privacyPolicy = t('privacyPolicy.content', { returnObjects: true }) as string[];
  const lastUpdated = t('privacyPolicy.lastUpdated');

  return (
    <SafeAreaView
      style={{
        flex: 1,
        backgroundColor: colors.screenBackground,
        alignItems: isWideLayout ? 'center' : 'stretch',
      }}
      edges={['top', 'bottom', 'left', 'right']}
    >
      {/* Header */}
      <View
        style={[
          {
            flexDirection: 'row',
            alignItems: 'center',
            padding: 20,
            paddingBottom: 16,
            borderBottomWidth: 1,
            borderBottomColor: colors.grey,
          },
          responsiveContainerStyle,
        ]}
      >
        <TouchableOpacity
          onPress={() => router.back()}
          style={{
            width: 40,
            height: 40,
            borderRadius: 20,
            backgroundColor: colors.cardBackground,
            alignItems: 'center',
            justifyContent: 'center',
            marginRight: 12,
            borderWidth: 1,
            borderColor: colors.grey,
          }}
          activeOpacity={0.7}
        >
          <IconSymbol name="arrow-back-outline" size={24} color={colors.text} />
        </TouchableOpacity>
        <Typography variant="h2" color={colors.text} style={{ flex: 1 }}>
          {t('privacyPolicy.title')}
        </Typography>
      </View>

      {/* Content */}
      <ScrollView
        style={{ flex: 1, width: '100%' }}
        contentContainerStyle={{
          padding: 20,
          paddingTop: 24,
          alignItems: isWideLayout ? 'center' : 'stretch',
        }}
      >
        <View style={responsiveContainerStyle}>
          {/* Last Updated */}
          {lastUpdated && (
            <Typography
              variant="caption"
              color={colors.text}
              style={{ marginBottom: 24, opacity: 0.7, fontStyle: 'italic' }}
            >
              {lastUpdated}
            </Typography>
          )}

          {/* Privacy Policy Content */}
          {Array.isArray(privacyPolicy) && privacyPolicy.length > 0 ? (
            privacyPolicy.map((section, index) => {
              // Check if this is a heading (starts with ## or is a title)
              const isHeading = section.startsWith('##') || (index === 0 && section.length < 100);
              const isSubHeading = section.startsWith('###');
              const cleanText = section.replace(/^##+ /, '').trim();

              if (isSubHeading) {
                return (
                  <Typography
                    key={index}
                    variant="h3"
                    color={colors.text}
                    style={{
                      marginTop: index > 0 ? 24 : 0,
                      marginBottom: 12,
                      fontFamily: 'Poppins-SemiBold',
                    }}
                  >
                    {cleanText}
                  </Typography>
                );
              }

              if (isHeading) {
                return (
                  <Typography
                    key={index}
                    variant="h2"
                    color={colors.blue}
                    style={{
                      marginTop: index > 0 ? 32 : 0,
                      marginBottom: 16,
                      fontFamily: 'Poppins-Bold',
                    }}
                  >
                    {cleanText}
                  </Typography>
                );
              }

              return (
                <Typography
                  key={index}
                  variant="body"
                  color={colors.text}
                  style={{
                    marginBottom: 16,
                    lineHeight: 24,
                    opacity: 0.9,
                  }}
                >
                  {section}
                </Typography>
              );
            })
          ) : (
            <Typography variant="body" color={colors.text} style={{ opacity: 0.7 }}>
              {t('privacyPolicy.noContent') || 'Privacy policy content is not available.'}
            </Typography>
          )}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

