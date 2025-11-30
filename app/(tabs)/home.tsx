import { Typography } from '@/components/ui';
import { IconSymbol } from '@/components/ui/icon-symbol';
import { getVideoCategories, videoCategories } from '@/constants/videos';
import { useI18n } from '@/contexts/i18n-context';
import { useThemeColors } from '@/hooks/use-theme-colors';
import type { VideoCategory } from '@/types/video';
import { router } from 'expo-router';
import React, { useEffect, useState } from 'react';
import type { ViewStyle } from 'react-native';
import { ActivityIndicator, RefreshControl, ScrollView, TouchableOpacity, View, useWindowDimensions } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

const categoryIcons = {
  computer: 'laptop-outline',
  mathematics: 'calculator-outline',
  physics: 'flask-outline',
  languages: 'chatbubbles-outline',
};

const categoryColors = {
  computer: '#155DFC', // Blue
  mathematics: '#4CAF50', // Green
  physics: '#FF9800', // Orange
  languages: '#9C27B0', // Purple
};

export default function HomeScreen() {
  const colors = useThemeColors();
  const { t, currentLanguage } = useI18n();
  const { width: windowWidth, height: windowHeight } = useWindowDimensions();
  const isWideLayout = windowWidth > windowHeight || windowWidth >= 900;
  const contentMaxWidth = Math.min(windowWidth * 0.7, 720);
  const responsiveContainerStyle: ViewStyle = {
    width: isWideLayout ? contentMaxWidth : '100%',
    alignSelf: isWideLayout ? 'center' : 'stretch',
  };

  const [categories, setCategories] = useState<VideoCategory[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    loadCategories();
  }, []);

  const loadCategories = async (forceRefresh = false) => {
    try {
      if (forceRefresh) {
        setRefreshing(true);
      } else {
        setLoading(true);
      }
      
      // Clear cache if force refreshing
      if (forceRefresh) {
        const { clearCache } = await import('@/services/subjectSyncService');
        await clearCache();
      }
      
      const fetchedCategories = await getVideoCategories();
      setCategories(fetchedCategories);
    } catch (error) {
      console.error('Error loading categories:', error);
      // Fallback to hardcoded
      setCategories(videoCategories);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const onRefresh = () => {
    loadCategories(true);
  };

  const handleCategoryPress = (categoryId: string) => {
    router.push({
      pathname: '/videos/[categoryId]',
      params: { categoryId },
    });
  };

  return (
    <SafeAreaView
      style={{
        flex: 1,
        backgroundColor: colors.screenBackground,
        alignItems: isWideLayout ? 'center' : 'stretch',
      }}
      edges={['top', 'bottom', 'left', 'right']}
    >
      {/* Header Section */}
      <View style={[{ padding: 20, paddingTop: 20 }, responsiveContainerStyle]}>
        <Typography variant="h2" color={colors.blue} style={{ marginBottom: 8 }}>
          {t('home.title')}
        </Typography>
        <Typography variant="body" color={colors.text}>
          {t('home.subtitle')}
        </Typography>
      </View>

      {/* Categories Cards - Grid Layout */}
      {loading ? (
        <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
          <ActivityIndicator size="large" color={colors.blue} />
          <Typography variant="body" color={colors.text} style={{ marginTop: 16, opacity: 0.7 }}>
            Loading categories...
          </Typography>
        </View>
      ) : (
        <ScrollView
          style={{ flex: 1 }}
          contentContainerStyle={{
            paddingHorizontal: isWideLayout ? 0 : 20,
            alignItems: isWideLayout ? 'center' : 'stretch',
          }}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={onRefresh}
              tintColor={colors.blue}
              colors={[colors.blue]}
            />
          }
        >
          <View
            style={[
              {
                flexDirection: 'row',
                flexWrap: 'wrap',
                justifyContent: 'space-between',
              },
              responsiveContainerStyle,
            ]}
          >
            {categories.map((category) => {
            const videoCount = category.videos.length;
            // Use icon from category data, fallback to hardcoded mapping, then default
            const icon = category.icon || categoryIcons[category.id as keyof typeof categoryIcons] || 'folder-outline';
            const categoryName = category.name[currentLanguage] || category.name.fr;
            const iconColor = categoryColors[category.id as keyof typeof categoryColors] || colors.blue;

            return (
              <TouchableOpacity
                key={category.id}
                style={{
                  backgroundColor: colors.cardBackground,
                  borderRadius: 12,
                  padding: 16,
                  marginBottom: 16,
                  borderWidth: 1,
                  borderColor: colors.grey,
                  width: '48%',
                  alignItems: 'center',
                }}
                onPress={() => handleCategoryPress(category.id)}
                activeOpacity={0.7}
              >
                <IconSymbol name={icon} size={40} color={iconColor} style={{ marginTop: 5, marginBottom: 25, textAlign: 'center' }}/>
                <Typography
                  variant="h3"
                  color={colors.text}
                  style={{ marginTop: 24, marginBottom: 8, textAlign: 'center' }}
                >
                  {categoryName}
                </Typography>
              </TouchableOpacity>
            );
          })}
          </View>
        </ScrollView>
      )}
    </SafeAreaView>
  );
}