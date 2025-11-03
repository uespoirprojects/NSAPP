import { Typography } from '@/components/ui';
import { IconSymbol } from '@/components/ui/icon-symbol';
import { getCategoryById, getVideoById, getVideosByCategory } from '@/constants/videos';
import { useI18n } from '@/contexts/i18n-context';
import { useThemeColors } from '@/hooks/use-theme-colors';
import type { Video } from '@/types/video';
import { getYouTubeEmbedUrl } from '@/utils/video-helpers';
import { router, useLocalSearchParams } from 'expo-router';
import React, { useMemo, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  Animated,
  Dimensions,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { WebView } from 'react-native-webview';

const { width } = Dimensions.get('window');
const SIDEBAR_WIDTH = width * 0.75;

interface LessonSidebarProps {
  videos: Video[];
  selectedVideoId: string;
  onSelectVideo: (video: Video) => void;
  onClose: () => void;
}

const LessonSidebar: React.FC<LessonSidebarProps> = ({
  videos,
  selectedVideoId,
  onSelectVideo,
  onClose,
}) => {
  const colors = useThemeColors();
  const { t, currentLanguage } = useI18n();

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: colors.cardBackground }} edges={['top', 'bottom']}>
      <View
        style={{
          flexDirection: 'row',
          justifyContent: 'space-between',
          alignItems: 'center',
          padding: 16,
          borderBottomWidth: 1,
          borderBottomColor: colors.grey,
        }}
      >
        <Typography variant="h2" color={colors.text}>
          {t('video.courseVideos')}
        </Typography>
        <TouchableOpacity onPress={onClose} style={{ padding: 8 }}>
          <IconSymbol name="close-outline" size={24} color={colors.text} />
        </TouchableOpacity>
      </View>
      <ScrollView style={{ flex: 1 }}>
        {videos.map((video) => {
          const videoTitle = video.title[currentLanguage as keyof typeof video.title] || video.title.fr;
          const isSelected = video.id === selectedVideoId;

          return (
            <TouchableOpacity
              key={video.id}
              onPress={() => {
                onSelectVideo(video);
                onClose();
              }}
              style={{
                padding: 16,
                marginBottom: 12,
                marginHorizontal: 16,
                borderRadius: 12,
                backgroundColor: isSelected ? colors.lightBlue : colors.whiteSmoke,
                borderLeftWidth: isSelected ? 4 : 0,
                borderLeftColor: isSelected ? colors.blue : 'transparent',
              }}
              activeOpacity={0.7}
            >
              <Typography
                variant="body"
                color={isSelected ? colors.blue : colors.text}
                style={{ fontFamily: 'Poppins-SemiBold' }}
              >
                {videoTitle}
              </Typography>
              {video.duration && (
                <Text style={{ color: colors.text, fontFamily: 'Poppins-Regular', fontSize: 12, marginTop: 4 }}>
                  {video.duration}
                </Text>
              )}
            </TouchableOpacity>
          );
        })}
      </ScrollView>
    </SafeAreaView>
  );
};

export default function VideoScreenAuthenticated() {
  const colors = useThemeColors();
  const { t, currentLanguage } = useI18n();
  const { videoId } = useLocalSearchParams<{ videoId: string }>();

  // Get video and category data
  const video = getVideoById(videoId || '');
  const category = video ? getCategoryById(video.categoryId) : null;
  const allVideos = category && video ? getVideosByCategory(video.categoryId) : [];
  const [selectedVideo, setSelectedVideo] = useState<Video | null>(video || null);

  // Update selected video when videoId param changes
  React.useEffect(() => {
    if (video) {
      setSelectedVideo(video);
    }
  }, [videoId]);
  const [completedVideos, setCompletedVideos] = useState<Set<string>>(new Set());
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const sidebarAnim = useState(new Animated.Value(-SIDEBAR_WIDTH))[0];
  const [videoLoading, setVideoLoading] = useState(true);

  // Calculate progress
  const progressPercentage = useMemo(() => {
    if (!category || allVideos.length === 0) return 0;
    const completedCount = allVideos.filter((v) => completedVideos.has(v.id)).length;
    return (completedCount / allVideos.length) * 100;
  }, [category, allVideos, completedVideos]);

  const handleBackPress = () => {
    router.back();
  };

  const handleMarkAsComplete = () => {
    if (!selectedVideo) return;

    if (completedVideos.has(selectedVideo.id)) {
      Alert.alert(t('video.alreadyCompleted'), t('video.alreadyCompletedMessage'));
      return;
    }

    setCompletedVideos(new Set([...completedVideos, selectedVideo.id]));
    Alert.alert(t('common.success'), t('video.markedAsComplete'));
  };

  const openSidebar = () => {
    setIsSidebarOpen(true);
    Animated.timing(sidebarAnim, {
      toValue: 0,
      duration: 300,
      useNativeDriver: true,
    }).start();
  };

  const closeSidebar = () => {
    Animated.timing(sidebarAnim, {
      toValue: -SIDEBAR_WIDTH,
      duration: 300,
      useNativeDriver: true,
    }).start(() => setIsSidebarOpen(false));
  };

  const handleVideoSelect = (video: Video) => {
    setSelectedVideo(video);
    // Navigate to the video player screen
    (router.push as any)(`/video/${video.id}`);
  };

  if (!category || allVideos.length === 0 || !selectedVideo) {
    return (
      <SafeAreaView style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: colors.screenBackground }} edges={['top', 'bottom', 'left', 'right']}>
        <Typography variant="body" color={colors.text}>
          {t('video.notFound')}
        </Typography>
        <TouchableOpacity
          onPress={handleBackPress}
          style={{ marginTop: 20, padding: 12, backgroundColor: colors.blue, borderRadius: 8 }}
        >
          <Text style={{ color: colors.white, fontFamily: 'Poppins-SemiBold' }}>{t('common.back')}</Text>
        </TouchableOpacity>
      </SafeAreaView>
    );
  }

  const categoryName = category.name[currentLanguage as keyof typeof category.name] || category.name.fr;
  const videoTitle = selectedVideo.title[currentLanguage as keyof typeof selectedVideo.title] || selectedVideo.title.fr;
  const videoDescription = selectedVideo.description
    ? selectedVideo.description[currentLanguage as keyof typeof selectedVideo.description] || selectedVideo.description.fr
    : '';
  const isCompleted = completedVideos.has(selectedVideo.id);
  const embedUrl = getYouTubeEmbedUrl(selectedVideo.videoId, false);

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: colors.screenBackground }} edges={['top', 'bottom', 'left', 'right']}>
      {/* Header */}
      <View
        style={{
          flexDirection: 'row',
          alignItems: 'center',
          paddingHorizontal: 16,
          paddingVertical: 12,
          borderBottomWidth: 1,
          borderBottomColor: colors.grey,
          backgroundColor: colors.cardBackground,
        }}
      >
        <TouchableOpacity onPress={handleBackPress} style={{ padding: 8, marginRight: 8 }}>
          <IconSymbol name="arrow-back-outline" size={24} color={colors.text} />
        </TouchableOpacity>

        <View style={{ flex: 1 }}>
          <Typography variant="h3" color={colors.text} style={{ fontFamily: 'Poppins-SemiBold' }}>
            {categoryName}
          </Typography>
          <Text style={{ color: colors.text, fontFamily: 'Poppins-Regular', fontSize: 12, marginTop: 2 }}>
            {Math.round(progressPercentage * allVideos.length / 100)} of {allVideos.length} {t('video.completed')}
          </Text>
        </View>

        <TouchableOpacity onPress={openSidebar} style={{ padding: 8, marginLeft: 8 }}>
          <IconSymbol name="menu-outline" size={24} color={colors.text} />
        </TouchableOpacity>
      </View>

      {/* Main Content */}
      <ScrollView
        style={{ flex: 1 }}
        contentContainerStyle={{ paddingHorizontal: 16, paddingVertical: 16 }}
        showsVerticalScrollIndicator={false}
      >
        {/* Video Player */}
        <View
          style={{
            width: '100%',
            backgroundColor: colors.black,
            borderRadius: 12,
            marginBottom: 16,
            overflow: 'hidden',
            aspectRatio: 16 / 9,
          }}
        >
          {videoLoading && (
            <View
              style={{
                position: 'absolute',
                top: 0,
                left: 0,
                right: 0,
                bottom: 0,
                justifyContent: 'center',
                alignItems: 'center',
                backgroundColor: colors.black,
              }}
            >
              <ActivityIndicator size="large" color={colors.white} />
            </View>
          )}
          <WebView
            source={{ uri: embedUrl }}
            style={{ backgroundColor: colors.black }}
            onLoadStart={() => setVideoLoading(true)}
            onLoadEnd={() => setVideoLoading(false)}
            allowsFullscreenVideo
            mediaPlaybackRequiresUserAction={false}
          />
        </View>

        {/* Video Info */}
        <Typography variant="h2" color={colors.text} style={{ marginBottom: 8, fontFamily: 'Poppins-SemiBold' }}>
          {videoTitle}
        </Typography>

        {videoDescription && (
          <Typography variant="body" color={colors.text} style={{ marginBottom: 16, opacity: 0.8 }}>
            {videoDescription}
          </Typography>
        )}

        <Text style={{ color: colors.text, fontFamily: 'Poppins-Regular', fontSize: 14, marginBottom: 16, lineHeight: 20 }}>
          {t('video.completeToTrack')}
        </Text>

        <TouchableOpacity
          onPress={handleMarkAsComplete}
          style={{
            backgroundColor: isCompleted ? '#4CAF50' : colors.blue,
            borderRadius: 12,
            paddingVertical: 16,
            alignItems: 'center',
            marginBottom: 16,
          }}
          activeOpacity={0.7}
        >
          <Text style={{ color: colors.white, fontFamily: 'Poppins-SemiBold', fontSize: 16 }}>
            {isCompleted ? `${t('video.completed')} ✓` : t('video.markAsComplete')}
          </Text>
        </TouchableOpacity>
      </ScrollView>

      {/* Course Progress Bar */}
      <View
        style={{
          paddingHorizontal: 16,
          paddingVertical: 12,
          borderTopWidth: 1,
          borderTopColor: colors.grey,
          backgroundColor: colors.cardBackground,
        }}
      >
        <Text style={{ color: colors.text, fontFamily: 'Poppins-Medium', fontSize: 12, marginBottom: 8 }}>
          {t('video.courseProgress')}
        </Text>
        <View
          style={{
            width: '100%',
            height: 8,
            backgroundColor: colors.grey,
            borderRadius: 4,
            overflow: 'hidden',
            marginBottom: 8,
          }}
        >
          <View
            style={{
              height: '100%',
              backgroundColor: colors.blue,
              borderRadius: 4,
              width: `${progressPercentage}%`,
            }}
          />
        </View>
        <Text style={{ color: colors.text, fontFamily: 'Poppins-Regular', fontSize: 12, textAlign: 'right' }}>
          {Math.round(progressPercentage)}%
        </Text>
      </View>

      {/* Sidebar Overlay */}
      {isSidebarOpen && (
        <TouchableOpacity
          activeOpacity={1}
          onPress={closeSidebar}
          style={StyleSheet.absoluteFill}
        >
          <View
            style={{
              position: 'absolute',
              top: 0,
              left: 0,
              bottom: 0,
              right: 0,
              backgroundColor: 'rgba(0, 0, 0, 0.5)',
            }}
          />
          <Animated.View
            style={{
              transform: [{ translateX: sidebarAnim }],
              width: SIDEBAR_WIDTH,
              height: '100%',
              position: 'absolute',
              top: 0,
              left: 0,
              backgroundColor: colors.cardBackground,
              shadowColor: colors.black,
              shadowOffset: { width: -2, height: 0 },
              shadowOpacity: 0.25,
              shadowRadius: 10,
              elevation: 10,
            }}
          >
            <LessonSidebar
              videos={allVideos}
              selectedVideoId={selectedVideo.id}
              onSelectVideo={handleVideoSelect}
              onClose={closeSidebar}
            />
          </Animated.View>
        </TouchableOpacity>
      )}
    </SafeAreaView>
  );
}
