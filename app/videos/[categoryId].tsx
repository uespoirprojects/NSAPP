import { Typography } from '@/components/ui';
import { IconSymbol } from '@/components/ui/icon-symbol';
import { getCategoryById, getVideosByCategory } from '@/constants/videos';
import { useI18n } from '@/contexts/i18n-context';
import { useThemeColors } from '@/hooks/use-theme-colors';
import { getYouTubeThumbnailUrl } from '@/utils/video-helpers';
import { router, useLocalSearchParams } from 'expo-router';
import { Image, ScrollView, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function VideosListScreen() {
  const colors = useThemeColors();
  const { t, currentLanguage } = useI18n();
  const { categoryId } = useLocalSearchParams<{ categoryId: string }>();

  const category = getCategoryById(categoryId || '');
  const videos = getVideosByCategory(categoryId || '');

  if (!category) {
    return (
      <SafeAreaView style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: colors.screenBackground }} edges={['top', 'bottom', 'left', 'right']}>
        <Typography variant="body" color={colors.text}>
          Category not found
        </Typography>
      </SafeAreaView>
    );
  }

  const categoryName = category.name[currentLanguage] || category.name.fr;

  const handleVideoPress = (videoId: string) => {
    // Navigate to video player screen
    (router.push as any)(`/video/${videoId}`);
  };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: colors.screenBackground }} edges={['top', 'bottom', 'left', 'right']}>
      {/* Header Section */}
      <View style={{ padding: 20, paddingTop: 20 }}>
        <Typography variant="h2" color={colors.blue} style={{ marginBottom: 8 }}>
          {categoryName}
        </Typography>
        <Typography variant="body" color={colors.text}>
          {videos.length} {t('common.videos')}
        </Typography>
      </View>

      {/* Videos List */}
      <ScrollView style={{ flex: 1, paddingHorizontal: 20 }}>
        {videos.map((video) => {
          const videoTitle = video.title[currentLanguage] || video.title.fr;
          const thumbnailUrl = getYouTubeThumbnailUrl(video.videoId);

          return (
            <TouchableOpacity
              key={video.id}
              style={{
                backgroundColor: colors.cardBackground,
                borderRadius: 12,
                marginBottom: 16,
                borderWidth: 1,
                borderColor: colors.grey,
                overflow: 'hidden',
              }}
              onPress={() => handleVideoPress(video.id)}
              activeOpacity={0.7}
            >
              {/* Thumbnail */}
              <Image
                source={{ uri: thumbnailUrl }}
                style={{
                  width: '100%',
                  height: 200,
                  backgroundColor: colors.grey,
                }}
                resizeMode="cover"
              />

              {/* Video Info */}
              <View style={{ padding: 16 }}>
                <Typography variant="h3" color={colors.text} style={{ marginBottom: 8 }}>
                  {videoTitle}
                </Typography>
                {video.description && (
                  <Typography variant="caption" color={colors.text} style={{ opacity: 0.7 }}>
                    {video.description[currentLanguage] || video.description.fr}
                  </Typography>
                )}
              </View>

              {/* Play Icon Overlay */}
              <View
                style={{
                  position: 'absolute',
                  top: '35%',
                  left: '50%',
                  transform: [{ translateX: -25 }, { translateY: -25 }],
                  width: 50,
                  height: 50,
                  borderRadius: 25,
                  backgroundColor: 'rgba(0, 0, 0, 0.6)',
                  justifyContent: 'center',
                  alignItems: 'center',
                }}
              >
                <IconSymbol name="play" size={30} color={colors.white} />
              </View>
            </TouchableOpacity>
          );
        })}
      </ScrollView>
    </SafeAreaView>
  );
}
