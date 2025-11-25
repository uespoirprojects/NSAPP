import { Typography } from '@/components/ui';
import { IconSymbol } from '@/components/ui/icon-symbol';
import { getSubjectsByCategory } from '@/constants/subjects';
import { getCategoryById } from '@/constants/videos';
import { useI18n } from '@/contexts/i18n-context';
import { useThemeColors } from '@/hooks/use-theme-colors';
import { getPlaylistVideos } from '@/services/youtubeService';
import type { SubjectModule } from '@/types/subject';
import type { VideoCategory } from '@/types/video';
import { router, useLocalSearchParams } from 'expo-router';
import React, { useEffect, useState } from 'react';
import { ActivityIndicator, Alert, ScrollView, Text, TouchableOpacity, View, useWindowDimensions } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function VideosListScreen() {
  const colors = useThemeColors();
  const { t, currentLanguage } = useI18n();
  const { categoryId } = useLocalSearchParams<{ categoryId: string }>();
  const { width: windowWidth, height: windowHeight } = useWindowDimensions();
  const isWideLayout = windowWidth > windowHeight || windowWidth >= 900;
  const constrainedWidth = Math.min(windowWidth * 0.7, 720);
  const cardWidth = isWideLayout ? constrainedWidth : windowWidth - 40;

  const [category, setCategory] = useState<VideoCategory | undefined>(undefined);
  const [subjects, setSubjects] = useState<SubjectModule[]>([]);
  const [loading, setLoading] = useState(true);
  const [subjectVideoCounts, setSubjectVideoCounts] = useState<Record<string, number>>({});
  const [loadingSubjectId, setLoadingSubjectId] = useState<string | null>(null);
  const [isRefreshingCounts, setIsRefreshingCounts] = useState(false);

  useEffect(() => {
    loadData();
  }, [categoryId]);

  const loadData = async () => {
    try {
      setLoading(true);
      const [categoryData, subjectsData] = await Promise.all([
        getCategoryById(categoryId || ''),
        getSubjectsByCategory(categoryId || ''),
      ]);
      setCategory(categoryData);
      setSubjects(subjectsData.filter((subject) => Boolean(subject.playlistId)));
    } catch (error) {
      console.error('Error loading category/subjects:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    let isMounted = true;
    const loadCounts = async () => {
      if (!subjects.length) return;
      setIsRefreshingCounts(true);
      try {
        const entries = await Promise.all(
          subjects.map(async (subject) => {
            if (!subject.playlistId) return [subject.id, 0];
            try {
              const videos = await getPlaylistVideos(subject.playlistId);
              return [subject.id, videos.length];
            } catch (error) {
              console.warn('Failed to load playlist for subject:', subject.id, error);
              return [subject.id, 0];
            }
          }),
        );
        if (isMounted) {
          setSubjectVideoCounts(Object.fromEntries(entries));
        }
      } finally {
        if (isMounted) {
          setIsRefreshingCounts(false);
        }
      }
    };

    loadCounts();

    return () => {
      isMounted = false;
    };
  }, [subjects]);

  if (loading) {
    return (
      <SafeAreaView
        style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: colors.screenBackground }}
        edges={['top', 'bottom', 'left', 'right']}
      >
        <ActivityIndicator size="large" color={colors.blue} />
        <Typography variant="body" color={colors.text} style={{ marginTop: 16, opacity: 0.7 }}>
          Loading...
        </Typography>
      </SafeAreaView>
    );
  }

  if (!category) {
    return (
      <SafeAreaView
        style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: colors.screenBackground }}
        edges={['top', 'bottom', 'left', 'right']}
      >
        <Typography variant="body" color={colors.text}>
          Category not found
        </Typography>
      </SafeAreaView>
    );
  }

  const categoryName = category.name[currentLanguage] || category.name.fr;

  const handleSubjectPress = async (subjectId: string, playlistId: string) => {
    if (!playlistId) {
      console.error('[VideosListScreen] No playlistId provided for subject:', subjectId);
      Alert.alert(t('videos.error'), t('videos.noPlaylistId') || 'No playlist ID found for this subject');
      return;
    }
    
    setLoadingSubjectId(subjectId);
    try {
      console.log('[VideosListScreen] Fetching playlist:', playlistId, 'for subject:', subjectId);
      const videos = await getPlaylistVideos(playlistId);
      console.log('[VideosListScreen] Fetched videos:', videos.length);
      
      if (!videos.length) {
        console.error('[VideosListScreen] No videos found in playlist:', playlistId);
        Alert.alert(
          t('videos.error') || 'Error',
          t('videos.noVideosInPlaylist') || 'No videos found in this playlist. Please check the playlist ID.'
        );
        return;
      }
      
      router.push({
        pathname: '/video/[videoId]',
        params: { videoId: videos[0].videoId, subjectId },
      });
    } catch (error: any) {
      console.error('[VideosListScreen] Failed to open subject playlist:', error);
      Alert.alert(
        t('videos.error') || 'Error',
        error.message || t('videos.playlistLoadError') || 'Failed to load playlist videos'
      );
    } finally {
      setLoadingSubjectId(null);
    }
  };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: colors.screenBackground }} edges={['top', 'bottom', 'left', 'right']}>
      <View
        style={{
          padding: 20,
          paddingTop: 20,
          width: isWideLayout ? constrainedWidth : '100%',
          alignSelf: 'center',
        }}
      >
        <TouchableOpacity
          onPress={() => router.back()}
          style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 12 }}
        >
          <IconSymbol name="arrow-back-outline" size={20} color={colors.text} />
          <Text
            style={{
              marginLeft: 8,
              color: colors.text,
              fontFamily: 'Poppins-Medium',
              fontSize: 14,
            }}
          >
            {t('common.back')}
          </Text>
        </TouchableOpacity>
        <Typography variant="h2" color={colors.blue} style={{ marginBottom: 8 }}>
          {categoryName}
        </Typography>
        <Typography variant="body" color={colors.text}>
          {subjects.length} {t('videos.subjects')}
        </Typography>
      </View>

      <ScrollView
        style={{ flex: 1 }}
        contentContainerStyle={{
          paddingHorizontal: isWideLayout ? 0 : 20,
          alignItems: isWideLayout ? 'center' : 'stretch',
          paddingBottom: 20,
        }}
      >
        {subjects.length === 0 ? (
          <View style={{ padding: 20, alignItems: 'center' }}>
            <Typography variant="body" color={colors.text} style={{ opacity: 0.7, textAlign: 'center' }}>
              {t('videos.noSubjects')}
            </Typography>
          </View>
        ) : (
          subjects.map((subject) => {
            const title = subject.title[currentLanguage] || subject.title.fr;
            const description = subject.description
              ? subject.description[currentLanguage] || subject.description.fr
              : '';
            const videoCount = subjectVideoCounts[subject.id];
            const isLoading = loadingSubjectId === subject.id;
            
            // Debug logging
            console.log('[VideosListScreen] Subject data:', {
              id: subject.id,
              playlistId: subject.playlistId,
              hasPlaylistId: !!subject.playlistId,
            });

            return (
              <View
                key={subject.id}
                style={{
                  backgroundColor: colors.cardBackground,
                  borderRadius: 16,
                  padding: 20,
                  marginBottom: 16,
                  borderWidth: 1,
                  borderColor: colors.grey,
                  width: cardWidth,
                }}
              >
                <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 12 }}>
                  <IconSymbol name="book-outline" size={22} color={colors.blue} style={{ marginRight: 12 }} />
                  <Typography variant="h3" color={colors.text}>
                    {title}
                  </Typography>
                </View>

                {description ? (
                  <Typography variant="body" color={colors.text} style={{ opacity: 0.8, marginBottom: 16 }}>
                    {description}
                  </Typography>
                ) : null}

                <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 16 }}>
                  <IconSymbol name="play-circle-outline" size={18} color={colors.blue} style={{ marginRight: 8 }} />
                  <Typography variant="body" color={colors.text} style={{ opacity: 0.8 }}>
                    {typeof videoCount === 'number'
                      ? t('videos.lessonCount', { count: videoCount })
                      : t('videos.loadingCount')}
                  </Typography>
                  {isRefreshingCounts && (
                    <ActivityIndicator size="small" color={colors.blue} style={{ marginLeft: 8 }} />
                  )}
                </View>

                <TouchableOpacity
                  onPress={() => handleSubjectPress(subject.id, subject.playlistId)}
                  disabled={isLoading}
                  style={{
                    backgroundColor: colors.blue,
                    borderRadius: 12,
                    paddingVertical: 14,
                    alignItems: 'center',
                    justifyContent: 'center',
                    opacity: isLoading ? 0.7 : 1,
                  }}
                >
                  {isLoading ? (
                    <ActivityIndicator size="small" color={colors.white} />
                  ) : (
                    <Text style={{ color: colors.white, fontFamily: 'Poppins-SemiBold', fontSize: 16 }}>
                      {t('videos.startSubject')}
                    </Text>
                  )}
                </TouchableOpacity>
              </View>
            );
          })
        )}
      </ScrollView>
    </SafeAreaView>
  );
}
