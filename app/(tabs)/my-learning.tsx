import { Typography } from '@/components/ui';
import { IconSymbol } from '@/components/ui/icon-symbol';
import { getSubjectById } from '@/constants/subjects';
import { getCategoryById } from '@/constants/videos';
import { useAuth } from '@/contexts/auth-context';
import { useI18n } from '@/contexts/i18n-context';
import { useThemeColors } from '@/hooks/use-theme-colors';
import {
  getBestQuizScore,
  getCompletedVideosWithDetails,
  getInProgressVideos,
  getSubjectProgress,
  VideoProgress,
} from '@/services/progressService';
import { getPlaylistVideos } from '@/services/youtubeService';
import { router } from 'expo-router';
import { useEffect, useMemo, useState } from 'react';
import {
  ActivityIndicator,
  FlatList,
  Image,
  SectionList,
  TouchableOpacity,
  View
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

interface VideoProgressWithDetails extends VideoProgress {
  videoTitle?: string;
  thumbnailUrl?: string;
  subjectTitle?: string;
  categoryTitle?: string;
  bestQuizScore?: number;
}

interface SubjectGroup {
  subjectId: string;
  subjectTitle: string;
  categoryTitle?: string;
  progress: {
    totalVideos: number;
    completedVideos: number;
    progressPercentage: number;
  };
  videos: VideoProgressWithDetails[];
}

export default function MyLearningScreen() {
  const colors = useThemeColors();
  const { t, currentLanguage } = useI18n();
  const { isAuthenticated, firebaseUser, isLoading: authLoading } = useAuth();
  const [selectedFilter, setSelectedFilter] = useState<'inProgress' | 'completed'>('inProgress');
  const [loading, setLoading] = useState(true);
  const [inProgressVideos, setInProgressVideos] = useState<VideoProgressWithDetails[]>([]);
  const [completedVideos, setCompletedVideos] = useState<VideoProgressWithDetails[]>([]);
  const [subjectGroups, setSubjectGroups] = useState<SubjectGroup[]>([]);

  // Load user progress
  useEffect(() => {
    const loadProgress = async () => {
      if (!isAuthenticated || !firebaseUser?.uid || authLoading) {
        setLoading(false);
        return;
      }

      try {
        setLoading(true);

        // Get progress data
        const [inProgress, completed] = await Promise.all([
          getInProgressVideos(firebaseUser.uid),
          getCompletedVideosWithDetails(firebaseUser.uid),
        ]);

        // Enrich with video details from playlists
        const enrichedInProgress = await enrichVideoProgress(inProgress);
        const enrichedCompleted = await enrichVideoProgress(completed);

        setInProgressVideos(enrichedInProgress);
        setCompletedVideos(enrichedCompleted);

        // Group videos by subject
        const grouped = await groupVideosBySubject(
          selectedFilter === 'inProgress' ? enrichedInProgress : enrichedCompleted
        );
        setSubjectGroups(grouped);
      } catch (error) {
        console.error('Failed to load progress:', error);
      } finally {
        setLoading(false);
      }
    };

    loadProgress();
  }, [isAuthenticated, firebaseUser?.uid, authLoading]);

  // Update subject groups when filter changes
  useEffect(() => {
    const updateGroups = async () => {
      const videos = selectedFilter === 'inProgress' ? inProgressVideos : completedVideos;
      const grouped = await groupVideosBySubject(videos);
      setSubjectGroups(grouped);
    };

    if (inProgressVideos.length > 0 || completedVideos.length > 0) {
      updateGroups();
    }
  }, [selectedFilter, inProgressVideos, completedVideos]);

  // Enrich video progress with details from playlists
  const enrichVideoProgress = async (
    videos: VideoProgress[]
  ): Promise<VideoProgressWithDetails[]> => {
    const enriched: VideoProgressWithDetails[] = [];

    // Group videos by subject to minimize API calls
    const videosBySubject = new Map<string, VideoProgress[]>();
    for (const video of videos) {
      const subjectId = video.subjectId || 'unknown';
      if (!videosBySubject.has(subjectId)) {
        videosBySubject.set(subjectId, []);
      }
      videosBySubject.get(subjectId)!.push(video);
    }

    // Load playlists and match videos
    for (const [subjectId, subjectVideos] of videosBySubject.entries()) {
      const subject = getSubjectById(subjectId);
      if (!subject || !subject.playlistId) continue;

      try {
        const playlistVideos = await getPlaylistVideos(subject.playlistId);
        const category = getCategoryById(subject.categoryId);

        for (const videoProgress of subjectVideos) {
          const playlistVideo = playlistVideos.find((v) => v.videoId === videoProgress.videoId);
          if (playlistVideo) {
            // Get best quiz score if available
            let bestQuizScore: number | undefined;
            if (firebaseUser?.uid) {
              try {
                const bestScore = await getBestQuizScore(firebaseUser.uid, videoProgress.videoId);
                bestQuizScore = bestScore?.percentage;
              } catch (error) {
                // Ignore quiz score errors
              }
            }

            enriched.push({
              ...videoProgress,
              videoTitle: playlistVideo.title,
              thumbnailUrl: playlistVideo.thumbnailUrl,
              subjectTitle:
                subject.title[currentLanguage as keyof typeof subject.title] || subject.title.fr,
              categoryTitle:
                category?.name[currentLanguage as keyof typeof category.name] || category?.name.fr,
              bestQuizScore,
            });
          }
        }
      } catch (error) {
        console.error(`Failed to load playlist for subject ${subjectId}:`, error);
        // Add videos without details
        for (const videoProgress of subjectVideos) {
          enriched.push({
            ...videoProgress,
            videoTitle: `Video ${videoProgress.videoId}`,
          });
        }
      }
    }

    return enriched;
  };

  // Group videos by subject with progress information
  const groupVideosBySubject = async (
    videos: VideoProgressWithDetails[]
  ): Promise<SubjectGroup[]> => {
    if (!firebaseUser?.uid) return [];

    const groups = new Map<string, VideoProgressWithDetails[]>();

    // Group videos by subjectId
    for (const video of videos) {
      const subjectId = video.subjectId || 'unknown';
      if (!groups.has(subjectId)) {
        groups.set(subjectId, []);
      }
      groups.get(subjectId)!.push(video);
    }

    // Create subject groups with progress info
    const subjectGroups: SubjectGroup[] = [];

    for (const [subjectId, subjectVideos] of groups.entries()) {
      const subject = getSubjectById(subjectId);
      if (!subject) continue;

      // Get total videos in playlist
      let totalVideos = 0;
      try {
        if (subject.playlistId) {
          const playlistVideos = await getPlaylistVideos(subject.playlistId);
          totalVideos = playlistVideos.length;
        }
      } catch (error) {
        console.error(`Failed to load playlist for subject ${subjectId}:`, error);
      }

      // Get progress from Firestore
      const progressData = await getSubjectProgress(firebaseUser.uid, subjectId);

      const category = getCategoryById(subject.categoryId);
      const subjectTitle =
        subject.title[currentLanguage as keyof typeof subject.title] || subject.title.fr;
      const categoryTitle =
        category?.name[currentLanguage as keyof typeof category.name] || category?.name.fr;

      subjectGroups.push({
        subjectId,
        subjectTitle,
        categoryTitle,
        progress: {
          totalVideos: totalVideos || progressData.totalVideos,
          completedVideos: progressData.completedVideos,
          progressPercentage: progressData.progressPercentage,
        },
        videos: subjectVideos,
      });
    }

    // Sort by subject order
    return subjectGroups.sort((a, b) => {
      const subjectA = getSubjectById(a.subjectId);
      const subjectB = getSubjectById(b.subjectId);
      return (subjectA?.order || 0) - (subjectB?.order || 0);
    });
  };

  const currentVideos = useMemo(() => {
    return selectedFilter === 'inProgress' ? inProgressVideos : completedVideos;
  }, [selectedFilter, inProgressVideos, completedVideos]);

  const handleVideoPress = (video: VideoProgressWithDetails) => {
    if (!video.subjectId) return;
    router.push({
      pathname: '/video/[videoId]',
      params: { videoId: video.videoId, subjectId: video.subjectId },
    });
  };

  const renderVideoItem = ({ item }: { item: VideoProgressWithDetails }) => {
    const completionDate = item.completedAt?.toDate();
    const formattedDate = completionDate
      ? new Intl.DateTimeFormat(currentLanguage || 'fr', {
          year: 'numeric',
          month: 'short',
          day: 'numeric',
        }).format(completionDate)
      : null;

    return (
      <TouchableOpacity
        onPress={() => handleVideoPress(item)}
        style={{
          backgroundColor: colors.cardBackground,
          borderRadius: 12,
          marginBottom: 12,
          overflow: 'hidden',
          borderWidth: 1,
          borderColor: colors.grey,
        }}
        activeOpacity={0.7}
      >
        <View style={{ flexDirection: 'row' }}>
          {/* Thumbnail */}
          {item.thumbnailUrl ? (
            <Image
              source={{ uri: item.thumbnailUrl }}
              style={{
                width: 120,
                height: 90,
                backgroundColor: colors.grey,
              }}
              resizeMode="cover"
            />
          ) : (
            <View
              style={{
                width: 120,
                height: 90,
                backgroundColor: colors.grey,
                justifyContent: 'center',
                alignItems: 'center',
              }}
            >
              <IconSymbol name="videocam-outline" size={32} color={colors.text} />
            </View>
          )}

          {/* Content */}
          <View style={{ flex: 1, padding: 12 }}>
            {/* Category/Subject */}
            {(item.categoryTitle || item.subjectTitle) && (
              <Typography
                variant="caption"
                color={colors.text}
                style={{ opacity: 0.6, marginBottom: 4 }}
              >
                {item.categoryTitle || item.subjectTitle}
              </Typography>
            )}

            {/* Video Title */}
            <Typography
              variant="body"
              color={colors.text}
              style={{
                fontFamily: 'Poppins-SemiBold',
                marginBottom: 8,
              }}
              numberOfLines={2}
            >
              {item.videoTitle || `Video ${item.videoId}`}
            </Typography>

            {/* Progress Info */}
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
              {selectedFilter === 'completed' && item.completed && (
                <View
                  style={{
                    flexDirection: 'row',
                    alignItems: 'center',
                    backgroundColor: '#E8F8ED',
                    paddingHorizontal: 8,
                    paddingVertical: 4,
                    borderRadius: 12,
                  }}
                >
                  <IconSymbol name="checkmark-circle" size={16} color="#26A749" />
                  <Typography
                    variant="caption"
                    color="#26A749"
                    style={{ marginLeft: 4, fontFamily: 'Poppins-Medium' }}
                  >
                    {t('myLearning.completed') || 'Completed'}
                  </Typography>
                </View>
              )}

              {item.bestQuizScore !== undefined && (
                <View
                  style={{
                    flexDirection: 'row',
                    alignItems: 'center',
                    backgroundColor: colors.lightBlue,
                    paddingHorizontal: 8,
                    paddingVertical: 4,
                    borderRadius: 12,
                  }}
                >
                  <IconSymbol name="trophy-outline" size={16} color={colors.blue} />
                  <Typography
                    variant="caption"
                    color={colors.blue}
                    style={{ marginLeft: 4, fontFamily: 'Poppins-Medium' }}
                  >
                    {item.bestQuizScore}%
                  </Typography>
                </View>
              )}

              {formattedDate && (
                <Typography variant="caption" color={colors.text} style={{ opacity: 0.6 }}>
                  {formattedDate}
                </Typography>
              )}
            </View>
          </View>
        </View>
      </TouchableOpacity>
    );
  };

  const renderEmptyState = () => {
    const emptyMessage =
      selectedFilter === 'inProgress'
        ? t('myLearning.noInProgress') || 'No videos in progress'
        : t('myLearning.noCompleted') || 'No completed videos yet';

    return (
      <View
        style={{
          flex: 1,
          justifyContent: 'center',
          alignItems: 'center',
          paddingVertical: 60,
        }}
      >
        <IconSymbol
          name={selectedFilter === 'inProgress' ? 'play-outline' : 'checkmark-circle-outline'}
          size={64}
          color={colors.text}
          style={{ opacity: 0.3, marginBottom: 16 }}
        />
        <Typography variant="body" color={colors.text} style={{ opacity: 0.6, textAlign: 'center' }}>
          {emptyMessage}
        </Typography>
      </View>
    );
  };

  if (authLoading || loading) {
    return (
      <SafeAreaView
        style={{ flex: 1, backgroundColor: colors.screenBackground }}
        edges={['top', 'bottom', 'left', 'right']}
      >
        <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
          <ActivityIndicator size="large" color={colors.blue} />
        </View>
      </SafeAreaView>
    );
  }

  if (!isAuthenticated) {
    return (
      <SafeAreaView
        style={{ flex: 1, backgroundColor: colors.screenBackground }}
        edges={['top', 'bottom', 'left', 'right']}
      >
        <View style={{ padding: 20, paddingTop: 20 }}>
          <Typography variant="h2" color={colors.blue} style={{ marginBottom: 8 }}>
            {t('myLearning.title')}
          </Typography>
          <Typography variant="body" color={colors.text}>
            {t('myLearning.subtitle')}
          </Typography>
        </View>
        <View
          style={{
            flex: 1,
            justifyContent: 'center',
            alignItems: 'center',
            paddingHorizontal: 40,
          }}
        >
          <IconSymbol name="lock-closed-outline" size={64} color={colors.text} style={{ opacity: 0.3, marginBottom: 16 }} />
          <Typography variant="h3" color={colors.text} style={{ marginBottom: 8, textAlign: 'center' }}>
            {t('myLearning.signInRequired') || 'Sign In Required'}
          </Typography>
          <Typography variant="body" color={colors.text} style={{ opacity: 0.6, textAlign: 'center', marginBottom: 24 }}>
            {t('myLearning.signInMessage') || 'Please sign in to track your learning progress'}
          </Typography>
          <TouchableOpacity
            onPress={() => router.push('/login')}
            style={{
              backgroundColor: colors.blue,
              paddingHorizontal: 24,
              paddingVertical: 12,
              borderRadius: 12,
            }}
          >
            <Typography variant="body" color={colors.white} style={{ fontFamily: 'Poppins-SemiBold' }}>
              {t('login.signIn') || 'Sign In'}
            </Typography>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView
      style={{ flex: 1, backgroundColor: colors.screenBackground }}
      edges={['top', 'bottom', 'left', 'right']}
    >
      {/* Header Section */}
      <View style={{ padding: 20, paddingTop: 20 }}>
        <Typography variant="h2" color={colors.blue} style={{ marginBottom: 8 }}>
          {t('myLearning.title')}
        </Typography>
        <Typography variant="body" color={colors.text}>
          {t('myLearning.subtitle')}
        </Typography>
      </View>

      {/* Filter Buttons */}
      <View
        style={{
          marginHorizontal: 20,
          marginBottom: 20,
          backgroundColor: colors.grey,
          borderRadius: 50,
          padding: 4,
          flexDirection: 'row',
          gap: 6,
        }}
      >
        <TouchableOpacity
          style={{
            flex: 1,
            backgroundColor: selectedFilter === 'inProgress' ? colors.blue : 'transparent',
            borderRadius: 50,
            paddingVertical: 12,
            paddingHorizontal: 16,
            alignItems: 'center',
          }}
          onPress={() => setSelectedFilter('inProgress')}
        >
          <Typography
            variant="body"
            color={selectedFilter === 'inProgress' ? colors.white : colors.text}
            style={{
              fontFamily: selectedFilter === 'inProgress' ? 'Poppins-Bold' : 'Poppins-Regular',
            }}
          >
            {t('myLearning.filters.inProgress')} ({inProgressVideos.length})
          </Typography>
        </TouchableOpacity>

        <TouchableOpacity
          style={{
            flex: 1,
            backgroundColor: selectedFilter === 'completed' ? colors.blue : 'transparent',
            borderRadius: 50,
            paddingVertical: 12,
            paddingHorizontal: 16,
            alignItems: 'center',
          }}
          onPress={() => setSelectedFilter('completed')}
        >
          <Typography
            variant="body"
            color={selectedFilter === 'completed' ? colors.white : colors.text}
            style={{
              fontFamily: selectedFilter === 'completed' ? 'Poppins-Bold' : 'Poppins-Regular',
            }}
          >
            {t('myLearning.filters.completed')} ({completedVideos.length})
          </Typography>
        </TouchableOpacity>
      </View>

      {/* Video List - Grouped by Subject */}
      {subjectGroups.length > 0 ? (
        <SectionList
          sections={subjectGroups.map((group) => ({
            title: group.subjectTitle,
            data: group.videos,
            subjectId: group.subjectId,
            progress: group.progress,
            categoryTitle: group.categoryTitle,
          }))}
          renderItem={renderVideoItem}
          renderSectionHeader={({ section }) => (
            <View
              style={{
                paddingHorizontal: 20,
                paddingVertical: 12,
                backgroundColor: colors.screenBackground,
                borderBottomWidth: 1,
                borderBottomColor: colors.grey,
                marginTop: 16,
              }}
            >
              <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
                <View style={{ flex: 1 }}>
                  <Typography
                    variant="h3"
                    color={colors.text}
                    style={{ fontFamily: 'Poppins-SemiBold', marginBottom: 4 }}
                  >
                    {section.title}
                  </Typography>
                  {section.categoryTitle && (
                    <Typography variant="caption" color={colors.text} style={{ opacity: 0.6 }}>
                      {section.categoryTitle}
                    </Typography>
                  )}
                </View>
                <View style={{ alignItems: 'flex-end' }}>
                  <Typography
                    variant="body"
                    color={colors.blue}
                    style={{ fontFamily: 'Poppins-SemiBold' }}
                  >
                    {section.progress.completedVideos}/{section.progress.totalVideos}
                  </Typography>
                  <Typography variant="caption" color={colors.text} style={{ opacity: 0.6 }}>
                    {Math.round(section.progress.progressPercentage)}% {t('myLearning.complete') || 'complete'}
                  </Typography>
                </View>
              </View>
              {/* Progress Bar */}
              <View
                style={{
                  marginTop: 8,
                  height: 6,
                  backgroundColor: colors.grey,
                  borderRadius: 3,
                  overflow: 'hidden',
                }}
              >
                <View
                  style={{
                    height: '100%',
                    backgroundColor: colors.blue,
                    width: `${section.progress.progressPercentage}%`,
                    borderRadius: 3,
                  }}
                />
              </View>
            </View>
          )}
          keyExtractor={(item) => item.videoId}
          contentContainerStyle={{
            paddingBottom: 20,
          }}
          ListEmptyComponent={renderEmptyState}
          showsVerticalScrollIndicator={false}
          stickySectionHeadersEnabled={false}
        />
      ) : (
        <FlatList
          data={currentVideos}
          renderItem={renderVideoItem}
          keyExtractor={(item) => item.videoId}
          contentContainerStyle={{
            paddingHorizontal: 20,
            paddingBottom: 20,
          }}
          ListEmptyComponent={renderEmptyState}
          showsVerticalScrollIndicator={false}
        />
      )}
    </SafeAreaView>
  );
}
