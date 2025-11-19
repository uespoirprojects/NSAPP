import { Typography } from '@/components/ui';
import { IconSymbol } from '@/components/ui/icon-symbol';
import { getSubjectById } from '@/constants/subjects';
import { getCategoryById } from '@/constants/videos';
import { useAuth } from '@/contexts/auth-context';
import { useI18n } from '@/contexts/i18n-context';
import { useThemeColors } from '@/hooks/use-theme-colors';
import { getCompletedVideos, markVideoAsComplete, updateVideoWatchTime } from '@/services/progressService';
import { getPlaylistVideos, PlaylistVideo } from '@/services/youtubeService';
import { getYouTubeEmbedUrl } from '@/utils/video-helpers';
import Constants from 'expo-constants';
import { router, useLocalSearchParams } from 'expo-router';
import React, { useMemo, useState } from 'react';
import type { ViewStyle } from 'react-native';
import {
  ActivityIndicator,
  Alert,
  Animated,
  Dimensions,
  InteractionManager,
  Modal,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  useWindowDimensions,
  View
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

// Conditionally import WebView only for native platforms
let WebView: any = null;
try {
  if (Platform.OS !== 'web') {
    WebView = require('react-native-webview').WebView;
  }
} catch (e) {
  // WebView not available (e.g., on web platform)
  WebView = null;
}

const { width } = Dimensions.get('window');
const SIDEBAR_WIDTH = width * 0.75;

export default function VideoScreen() {
  const colors = useThemeColors();
  const { t, currentLanguage } = useI18n();
  const { isAuthenticated, firebaseUser } = useAuth();
  const { videoId, subjectId } = useLocalSearchParams<{ videoId: string; subjectId?: string }>();
  const { width: windowWidth, height: windowHeight } = useWindowDimensions();
  const isWideLayout = windowWidth > windowHeight || windowWidth >= 900;
  const contentMaxWidth = Math.min(windowWidth * 0.7, 900);
  const responsiveWidthStyle: ViewStyle = {
    width: isWideLayout ? contentMaxWidth : '100%',
    alignSelf: isWideLayout ? 'center' : 'stretch',
  };
  const subject = subjectId ? getSubjectById(subjectId) : undefined;
  const category = subject ? getCategoryById(subject.categoryId) : null;
  const [playlistVideos, setPlaylistVideos] = useState<PlaylistVideo[]>([]);
  const [playlistError, setPlaylistError] = useState<string | null>(null);
  const [playlistLoading, setPlaylistLoading] = useState<boolean>(true);
  const [selectedVideo, setSelectedVideo] = useState<PlaylistVideo | null>(null);

  React.useEffect(() => {
    let isMounted = true;

    const loadPlaylist = async () => {
      if (!subject || !subject.playlistId) {
        if (!isMounted) return;
        setPlaylistVideos([]);
        setSelectedVideo(null);
        setPlaylistLoading(false);
        setPlaylistError(t('video.playlistMissing'));
        return;
      }

      try {
        setPlaylistLoading(true);
        setPlaylistError(null);
        const videos = await getPlaylistVideos(subject.playlistId);
        if (!isMounted) return;

        setPlaylistVideos(videos);
        const initialVideo =
          videos.find((item) => item.videoId === videoId) || videos[0] || null;
        setSelectedVideo(initialVideo);
      } catch (error) {
        console.error('Failed to load playlist videos:', error);
        if (isMounted) {
          setPlaylistVideos([]);
          setSelectedVideo(null);
          setPlaylistError(t('video.playlistLoadError'));
        }
      } finally {
        if (isMounted) {
          setPlaylistLoading(false);
        }
      }
    };

    loadPlaylist();

    return () => {
      isMounted = false;
    };
  }, [subject?.playlistId, videoId, subject?.id, t]);

  React.useEffect(() => {
    if (!playlistVideos.length) return;
    const match = playlistVideos.find((item) => item.videoId === videoId);
    if (match && match.videoId !== selectedVideo?.videoId) {
      setSelectedVideo(match);
    }
  }, [playlistVideos, videoId]);

  const allVideos = playlistVideos;
  
  // Find current video index and calculate next/previous videos
  const currentVideoIndex = useMemo(() => {
    if (!selectedVideo) return -1;
    return allVideos.findIndex((v) => v.videoId === selectedVideo.videoId);
  }, [selectedVideo, allVideos]);

  const previousVideo = useMemo(() => {
    if (currentVideoIndex <= 0) return null;
    return allVideos[currentVideoIndex - 1];
  }, [currentVideoIndex, allVideos]);

  const nextVideo = useMemo(() => {
    if (currentVideoIndex < 0 || currentVideoIndex >= allVideos.length - 1) return null;
    return allVideos[currentVideoIndex + 1];
  }, [currentVideoIndex, allVideos]);
  const [completedVideos, setCompletedVideos] = useState<Set<string>>(new Set());
  const trackedVideosRef = React.useRef<Set<string>>(new Set());
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const sidebarAnim = React.useRef(new Animated.Value(-SIDEBAR_WIDTH)).current;
  const [videoLoading, setVideoLoading] = useState(true);
  const [showSignupModal, setShowSignupModal] = useState(false);
  const [loadingProgress, setLoadingProgress] = useState(false);

  // Load completed videos from Firestore when authenticated
  React.useEffect(() => {
    const loadCompletedVideos = async () => {
      if (!isAuthenticated || !firebaseUser?.uid) {
        setCompletedVideos(new Set());
        return;
      }

      try {
        setLoadingProgress(true);
        const completed = await getCompletedVideos(firebaseUser.uid);
        setCompletedVideos(new Set(completed));
      } catch (error) {
        console.error('Failed to load completed videos:', error);
      } finally {
        setLoadingProgress(false);
      }
    };

    loadCompletedVideos();
  }, [isAuthenticated, firebaseUser?.uid]);

  // Reload completed videos when video changes to ensure consistency
  // This ensures the button state and sidebar checkmarks are always accurate
  React.useEffect(() => {
    const reloadProgress = async () => {
      if (!isAuthenticated || !firebaseUser?.uid || !selectedVideo) {
        return;
      }

      try {
        // Reload completed videos to ensure consistency when switching videos
        // This ensures the "Mark as Complete" button and sidebar show correct state
        const completed = await getCompletedVideos(firebaseUser.uid);
        setCompletedVideos(new Set(completed));
      } catch (error) {
        console.error('Failed to reload progress:', error);
      }
    };

    // Only reload if we have a valid video selection
    if (selectedVideo?.videoId) {
      reloadProgress();
    }
  }, [isAuthenticated, firebaseUser?.uid, selectedVideo?.videoId]);

  // Mark video as in-progress the first time it's watched
  React.useEffect(() => {
    const markInProgress = async () => {
      if (!isAuthenticated || !firebaseUser?.uid || !selectedVideo || !subject) {
        return;
      }

      if (completedVideos.has(selectedVideo.videoId)) {
        return;
      }

      if (trackedVideosRef.current.has(selectedVideo.videoId)) {
        return;
      }

      try {
        await updateVideoWatchTime(
          firebaseUser.uid,
          selectedVideo.videoId,
          0,
          subject.id,
          subject.categoryId
        );
        trackedVideosRef.current.add(selectedVideo.videoId);
      } catch (error) {
        console.error('Failed to record in-progress video state:', error);
      }
    };

    markInProgress();
  }, [isAuthenticated, firebaseUser?.uid, selectedVideo?.videoId, subject?.id, completedVideos]);

  // Calculate progress
  const progressPercentage = useMemo(() => {
    if (!category || allVideos.length === 0) return 0;
    if (!isAuthenticated) return 0; // Guest users have 0% progress
    const completedCount = allVideos.filter((v) => completedVideos.has(v.videoId)).length;
    return (completedCount / allVideos.length) * 100;
  }, [category, allVideos, completedVideos, isAuthenticated]);

  const handleTakeQuiz = () => {
    if (!selectedVideo || !subject) {
      return;
    }

    if (!isAuthenticated) {
      setShowSignupModal(true);
      return;
    }

    router.push({
      pathname: '/video/[videoId]/quiz',
      params: { videoId: selectedVideo.videoId, subjectId: subject.id },
    });
  };

  const confirmSignup = () => {
    setShowSignupModal(false);
    router.push('/login');
  };

  const handleMarkAsComplete = async () => {
    if (!selectedVideo || !isAuthenticated || !firebaseUser?.uid) return;

    if (completedVideos.has(selectedVideo.videoId)) {
      Alert.alert(t('video.alreadyCompleted'), t('video.alreadyCompletedMessage'));
      return;
    }

    try {
      // Save to Firestore
      await markVideoAsComplete(
        firebaseUser.uid,
        selectedVideo.videoId,
        subject?.id,
        subject?.categoryId
      );

      // Reload completed videos from Firestore to ensure consistency
      const updatedCompleted = await getCompletedVideos(firebaseUser.uid);
      setCompletedVideos(new Set(updatedCompleted));
      
      Alert.alert(t('common.success'), t('video.markedAsComplete'));
    } catch (error) {
      console.error('Failed to mark video as complete:', error);
      Alert.alert(t('common.error') || 'Error', t('video.markCompleteError') || 'Failed to save progress');
    }
  };

  // Navigate back to the previous page (not previous video)
  const handleBackPress = () => {
    if (subject?.categoryId) {
      router.replace(`/videos/${subject.categoryId}`);
    } else {
      router.back();
    }
  };

  const openSidebar = () => {
    if (isSidebarOpen) return;
    setIsSidebarOpen(true);
    
    // Use InteractionManager on mobile to ensure layout is ready before animation
    if (Platform.OS !== 'web') {
      InteractionManager.runAfterInteractions(() => {
        sidebarAnim.setValue(-SIDEBAR_WIDTH);
        Animated.timing(sidebarAnim, {
          toValue: 0,
          duration: 300,
          useNativeDriver: true,
        }).start();
      });
    } else {
      // On web, use requestAnimationFrame for smoother animation
      requestAnimationFrame(() => {
        sidebarAnim.setValue(-SIDEBAR_WIDTH);
        Animated.timing(sidebarAnim, {
          toValue: 0,
          duration: 300,
          useNativeDriver: true,
        }).start();
      });
    }
  };

  const closeSidebar = () => {
    Animated.timing(sidebarAnim, {
      toValue: -SIDEBAR_WIDTH,
      duration: 300,
      useNativeDriver: true,
    }).start(() => {
      setIsSidebarOpen(false);
    });
  };

  const handleVideoSelect = (video: PlaylistVideo) => {
    setSelectedVideo(video);
    // Use replace instead of push to avoid adding to navigation stack
    // This ensures back button goes to previous page, not previous video
    router.replace({
      pathname: '/video/[videoId]',
      params: { videoId: video.videoId, subjectId: subject?.id },
    });
    closeSidebar();
  };

  const handlePreviousVideo = () => {
    if (previousVideo) {
      setSelectedVideo(previousVideo);
      // Use replace to update URL without adding to navigation stack
      router.replace({
        pathname: '/video/[videoId]',
        params: { videoId: previousVideo.videoId, subjectId: subject?.id },
      });
    }
  };

  const handleNextVideo = () => {
    if (nextVideo) {
      setSelectedVideo(nextVideo);
      // Use replace to update URL without adding to navigation stack
      router.replace({
        pathname: '/video/[videoId]',
        params: { videoId: nextVideo.videoId, subjectId: subject?.id },
      });
    }
  };

  const showLoadingState = playlistLoading && !selectedVideo;
  const showErrorState = Boolean(playlistError && !selectedVideo);
  const showNotFoundState = !subject || !category || !selectedVideo;

  const embedUrl = selectedVideo?.videoId ? getYouTubeEmbedUrl(selectedVideo.videoId, false) : null;

  const refererUrl = React.useMemo(() => {
    if (Platform.OS === 'web') {
      if (typeof window !== 'undefined' && window.location) {
        return window.location.origin;
      }
      return 'https://nsapp.com';
    }

    const bundleId =
      Constants.expoConfig?.ios?.bundleIdentifier ||
      Constants.expoConfig?.android?.package ||
      Constants.manifest?.ios?.bundleIdentifier ||
      Constants.manifest?.android?.package ||
      'com.nsapp';

    return `https://${bundleId.toLowerCase()}`;
  }, []);

  const videoHtml = React.useMemo(() => {
    if (!embedUrl) return '';

    return `
    <!DOCTYPE html>
    <html>
      <head>
        <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no">
        <meta http-equiv="Content-Security-Policy" content="default-src * 'unsafe-inline' 'unsafe-eval'; script-src * 'unsafe-inline' 'unsafe-eval'; connect-src * 'unsafe-inline'; img-src * data: blob: 'unsafe-inline'; frame-src *; style-src * 'unsafe-inline';">
        <style>
          * {
            margin: 0;
            padding: 0;
            box-sizing: border-box;
          }
          html, body {
            background-color: #000;
            width: 100%;
            height: 100%;
            overflow: hidden;
          }
          body {
            display: flex;
            justify-content: center;
            align-items: center;
          }
          iframe {
            width: 100%;
            height: 100%;
            border: none;
          }
        </style>
      </head>
      <body>
        <iframe
          id="ytplayer"
          type="text/html"
          src="${embedUrl}"
          frameborder="0"
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share; fullscreen"
          allowfullscreen
          webkitallowfullscreen
          mozallowfullscreen
        ></iframe>
      </body>
    </html>
    `;
  }, [embedUrl]);

  let content: React.ReactNode;

  if (showLoadingState) {
    content = (
      <View
        style={{
          flex: 1,
          justifyContent: 'center',
          alignItems: 'center',
          backgroundColor: colors.screenBackground,
        }}
      >
        <View
          style={{
            width: isWideLayout ? contentMaxWidth : '100%',
            alignItems: 'center',
            paddingHorizontal: 20,
          }}
        >
          <ActivityIndicator size="large" color={colors.blue} />
          <Typography variant="body" color={colors.text} style={{ marginTop: 16, textAlign: 'center' }}>
            {t('video.loadingPlaylist')}
          </Typography>
        </View>
      </View>
    );
  } else if (showErrorState) {
    content = (
      <View
        style={{
          flex: 1,
          justifyContent: 'center',
          alignItems: 'center',
          backgroundColor: colors.screenBackground,
        }}
      >
        <View
          style={{
            width: isWideLayout ? contentMaxWidth : '100%',
            alignItems: 'center',
            paddingHorizontal: 24,
          }}
        >
          <Typography variant="body" color={colors.text} style={{ textAlign: 'center' }}>
            {playlistError}
          </Typography>
          <TouchableOpacity
            onPress={() => {
              if (subject?.playlistId) {
                setPlaylistError(null);
                setPlaylistLoading(true);
                getPlaylistVideos(subject.playlistId, { forceRefresh: true })
                  .then((videos) => {
                    setPlaylistVideos(videos);
                    const initialVideo =
                      videos.find((item) => item.videoId === videoId) || videos[0] || null;
                    setSelectedVideo(initialVideo);
                  })
                  .catch((error) => {
                    console.error('Failed to refresh playlist videos:', error);
                    setPlaylistError(t('video.playlistLoadError'));
                  })
                  .finally(() => setPlaylistLoading(false));
              }
            }}
            style={{
              marginTop: 24,
              padding: 12,
              backgroundColor: colors.blue,
              borderRadius: 8,
            }}
          >
            <Text style={{ color: colors.white, fontFamily: 'Poppins-SemiBold' }}>
              {t('common.retry')}
            </Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  } else if (showNotFoundState) {
    content = (
      <View
        style={{
          flex: 1,
          justifyContent: 'center',
          alignItems: 'center',
          backgroundColor: colors.screenBackground,
        }}
      >
        <View
          style={{
            width: isWideLayout ? contentMaxWidth : '100%',
            alignItems: 'center',
            paddingHorizontal: 24,
          }}
        >
          <Typography variant="body" color={colors.text}>
            {t('video.notFound')}
          </Typography>
          <TouchableOpacity
            onPress={handleBackPress}
            style={{ marginTop: 20, padding: 12, backgroundColor: colors.blue, borderRadius: 8 }}
          >
            <Text style={{ color: colors.white, fontFamily: 'Poppins-SemiBold' }}>
              {t('common.back')}
            </Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  } else {
    const ensuredCategory = category!;
    const ensuredSubject = subject!;
    const ensuredVideo = selectedVideo!;
    const categoryName =
      ensuredCategory.name[currentLanguage as keyof typeof ensuredCategory.name] ||
      ensuredCategory.name.fr;
    const videoTitle = ensuredVideo.title || '';
    const videoDescription = ensuredVideo.description || '';

    content = (
      <>
        {/* Header */}
        <View
          style={[
            {
              flexDirection: 'row',
              alignItems: 'center',
              paddingHorizontal: 16,
              paddingVertical: 12,
              borderBottomWidth: 1,
              borderBottomColor: colors.grey,
              backgroundColor: colors.cardBackground,
            },
            responsiveWidthStyle,
          ]}
        >
          <TouchableOpacity onPress={handleBackPress} style={{ padding: 8, marginRight: 8 }}>
            <IconSymbol name="arrow-back-outline" size={24} color={colors.text} />
          </TouchableOpacity>

          <TouchableOpacity onPress={openSidebar} style={{ padding: 8, marginRight: 8 }}>
            <IconSymbol name="menu-outline" size={24} color={colors.text} />
          </TouchableOpacity>

          <View style={{ flex: 1 }}>
            <Typography variant="h3" color={colors.text} style={{ fontFamily: 'Poppins-SemiBold' }}>
              {categoryName}
            </Typography>
            <Text
              style={{
                color: colors.text,
                fontFamily: 'Poppins-Regular',
                fontSize: 12,
                marginTop: 2,
              }}
            >
              {isAuthenticated
                ? `${Math.round((progressPercentage * allVideos.length) / 100)} of ${allVideos.length} ${t('video.completed')}`
                : `0 of ${allVideos.length} ${t('video.completed')}`}
            </Text>
          </View>
        </View>

        {/* Main Content */}
        <ScrollView
          style={{ flex: 1 }}
          contentContainerStyle={{
            paddingHorizontal: isWideLayout ? 0 : 16,
            paddingVertical: 16,
            alignItems: isWideLayout ? 'center' : 'stretch',
          }}
          showsVerticalScrollIndicator={false}
        >
          {/* Video Player */}
          <View
            style={{
              width: isWideLayout ? contentMaxWidth : '100%',
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
            {embedUrl && ensuredVideo ? (
              Platform.OS === 'web' ? (
                <View style={{ flex: 1 }}>
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
                        zIndex: 1,
                      }}
                    >
                      <ActivityIndicator size="large" color={colors.white} />
                    </View>
                  )}
                  {/* @ts-ignore - iframe is valid for web */}
                  <iframe
                    key={ensuredVideo.videoId}
                    src={embedUrl}
                    style={{
                      width: '100%',
                      height: '100%',
                      border: 'none',
                      backgroundColor: colors.black,
                    }}
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share; fullscreen"
                    allowFullScreen
                    onLoad={() => setVideoLoading(false)}
                    title={videoTitle}
                  />
                </View>
              ) : videoHtml && WebView ? (
                <WebView
                  key={ensuredVideo.videoId}
                  source={{
                    html: videoHtml,
                    baseUrl: refererUrl,
                  }}
                  style={{ backgroundColor: colors.black, flex: 1 }}
                  onLoadStart={() => setVideoLoading(true)}
                  onLoadEnd={() => setVideoLoading(false)}
                  onError={(syntheticEvent: any) => {
                    const { nativeEvent } = syntheticEvent;
                    console.warn('WebView error: ', nativeEvent);
                    setVideoLoading(false);
                  }}
                  onHttpError={(syntheticEvent: any) => {
                    const { nativeEvent } = syntheticEvent;
                    console.warn('WebView HTTP error: ', nativeEvent);
                  }}
                  javaScriptEnabled={true}
                  domStorageEnabled={true}
                  allowsFullscreenVideo={true}
                  mediaPlaybackRequiresUserAction={false}
                  allowsInlineMediaPlayback={true}
                  startInLoadingState={true}
                  mixedContentMode="always"
                  androidHardwareAccelerationDisabled={false}
                  originWhitelist={['*']}
                />
              ) : (
                <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
                  <Typography variant="body" color={colors.text}>
                    {t('video.notFound')}
                  </Typography>
                </View>
              )
            ) : (
              <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
                <Typography variant="body" color={colors.text}>
                  {t('video.notFound')}
                </Typography>
              </View>
            )}
          </View>

          {/* Next/Previous Navigation Buttons */}
          {allVideos.length > 1 && (
            <View
              style={{
                flexDirection: 'row',
                marginBottom: 16,
                width: isWideLayout ? contentMaxWidth : '100%',
                alignSelf: isWideLayout ? 'center' : 'stretch',
              }}
            >
        <TouchableOpacity
          onPress={handlePreviousVideo}
          disabled={!previousVideo}
          style={{
            flex: 1,
            flexDirection: 'row',
            alignItems: 'center',
            justifyContent: 'center',
            backgroundColor: previousVideo ? colors.blue : colors.grey,
            borderRadius: 12,
            paddingVertical: 14,
            paddingHorizontal: 16,
            marginRight: 6,
            opacity: previousVideo ? 1 : 0.5,
          }}
          activeOpacity={0.7}
        >
          <IconSymbol
            name="chevron-back"
            size={20}
            color={colors.white}
            style={{ marginRight: 8 }}
          />
          <Text style={{ color: colors.white, fontFamily: 'Poppins-SemiBold', fontSize: 16 }}>
            {t('video.previous') || 'Previous'}
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          onPress={handleNextVideo}
          disabled={!nextVideo}
          style={{
            flex: 1,
            flexDirection: 'row',
            alignItems: 'center',
            justifyContent: 'center',
            backgroundColor: nextVideo ? colors.blue : colors.grey,
            borderRadius: 12,
            paddingVertical: 14,
            paddingHorizontal: 16,
            marginLeft: 6,
            opacity: nextVideo ? 1 : 0.5,
          }}
          activeOpacity={0.7}
        >
          <Text style={{ color: colors.white, fontFamily: 'Poppins-SemiBold', fontSize: 16 }}>
            {t('video.next') || 'Next'}
          </Text>
          <IconSymbol
            name="chevron-forward"
            size={20}
            color={colors.white}
            style={{ marginLeft: 8 }}
          />
        </TouchableOpacity>
      </View>
    )}

    {/* Video Info */}
          <View
            style={{
              width: isWideLayout ? contentMaxWidth : '100%',
              alignSelf: isWideLayout ? 'center' : 'stretch',
            }}
          >
            <Typography variant="h2" color={colors.text} style={{ marginBottom: 8, fontFamily: 'Poppins-SemiBold' }}>
              {videoTitle}
            </Typography>

            {videoDescription && (
              <Typography variant="body" color={colors.text} style={{ marginBottom: 16, opacity: 0.8 }}>
                {videoDescription}
              </Typography>
            )}

            {!isAuthenticated && (
              <View
                style={{
                  backgroundColor: colors.lightBlue,
                  padding: 16,
                  borderRadius: 12,
                  marginBottom: 16,
                }}
              >
                <Text style={{ color: colors.text, fontFamily: 'Poppins-Regular', fontSize: 14, lineHeight: 20 }}>
                  {t('video.signInToTrack')}
                </Text>
              </View>
            )}

            <TouchableOpacity
              onPress={handleTakeQuiz}
              style={{
                backgroundColor: colors.blue,
                borderRadius: 12,
                paddingVertical: 16,
                alignItems: 'center',
                marginBottom: 16,
              }}
              activeOpacity={0.7}
            >
              <Text style={{ color: colors.white, fontFamily: 'Poppins-SemiBold', fontSize: 16 }}>
                {t('video.takeQuiz')}
              </Text>
            </TouchableOpacity>

            {isAuthenticated && (
              <>
                <Text style={{ color: colors.text, fontFamily: 'Poppins-Regular', fontSize: 14, marginBottom: 16, lineHeight: 20 }}>
                  {t('video.completeToTrack')}
                </Text>

                <TouchableOpacity
                  onPress={handleMarkAsComplete}
                  disabled={completedVideos.has(selectedVideo?.videoId || '')}
                  style={{
                    backgroundColor: completedVideos.has(selectedVideo?.videoId || '') ? '#4CAF50' : colors.blue,
                    borderRadius: 12,
                    paddingVertical: 16,
                    alignItems: 'center',
                    marginBottom: 16,
                    opacity: completedVideos.has(selectedVideo?.videoId || '') ? 0.7 : 1,
                  }}
                  activeOpacity={0.7}
                >
                  <Text style={{ color: colors.white, fontFamily: 'Poppins-SemiBold', fontSize: 16 }}>
                    {completedVideos.has(selectedVideo?.videoId || '') ? `${t('video.completed')} ✓` : t('video.markAsComplete')}
                  </Text>
                </TouchableOpacity>
              </>
            )}
          </View>
  </ScrollView>

      {/* Course Progress Bar */}
      {isAuthenticated && (
        <View
          style={{
              paddingHorizontal: isWideLayout ? 0 : 16,
            paddingVertical: 12,
            borderTopWidth: 1,
            borderTopColor: colors.grey,
            backgroundColor: colors.cardBackground,
              alignItems: isWideLayout ? 'center' : 'stretch',
          }}
        >
            <Text
              style={{
                color: colors.text,
                fontFamily: 'Poppins-Medium',
                fontSize: 12,
                marginBottom: 8,
                width: isWideLayout ? contentMaxWidth : '100%',
                alignSelf: isWideLayout ? 'center' : 'stretch',
              }}
            >
            {t('video.courseProgress')}
          </Text>
          <View
            style={{
                width: isWideLayout ? contentMaxWidth : '100%',
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
      )}

      {/* Sidebar Overlay */}
      {isSidebarOpen && (
        <View style={StyleSheet.absoluteFill} pointerEvents="box-none">
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
          </TouchableOpacity>
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
              zIndex: 1000,
            }}
            pointerEvents="auto"
          >
            <View style={{ flex: 1 }}>
              {/* Sidebar Header */}
              <View
                style={{
                  padding: 16,
                  paddingTop: 20,
                  borderBottomWidth: 1,
                  borderBottomColor: colors.grey,
                }}
              >
                <Typography variant="h2" color={colors.text}>
                  {t('video.courseVideos')}
                </Typography>
              </View>

              {/* Video List */}
              <ScrollView
                style={{ flex: 1 }}
                showsVerticalScrollIndicator={true}
                contentContainerStyle={{ paddingVertical: 8 }}
              >
                {allVideos.map((vid) => {
                  const vidTitle = vid.title;
                  const isSelected = selectedVideo?.videoId === vid.videoId;
                  const isCompleted = completedVideos.has(vid.videoId);

                  return (
                    <TouchableOpacity
                      key={vid.videoId}
                      onPress={() => handleVideoSelect(vid)}
                      style={{
                        paddingHorizontal: 16,
                        paddingVertical: 12,
                        backgroundColor: isSelected ? colors.lightBlue : 'transparent',
                        borderLeftWidth: isSelected ? 3 : 0,
                        borderLeftColor: isSelected ? colors.blue : 'transparent',
                      }}
                      activeOpacity={0.7}
                    >
                      <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
                        <View style={{ flex: 1 }}>
                          <Text
                            style={{
                              color: isSelected ? colors.blue : colors.text,
                              fontFamily: isSelected ? 'Poppins-SemiBold' : 'Poppins-Regular',
                              fontSize: 14,
                              lineHeight: 20,
                            }}
                            numberOfLines={2}
                          >
                            {vidTitle}
                          </Text>
                        </View>
                        {isCompleted && isAuthenticated && (
                          <IconSymbol name="checkmark-circle" size={20} color="#4CAF50" style={{ marginLeft: 8 }} />
                        )}
                      </View>
                    </TouchableOpacity>
                  );
                })}
              </ScrollView>
            </View>
          </Animated.View>
        </View>
      )}

      {/* Signup Required Modal */}
      <Modal
        visible={showSignupModal}
        transparent
        animationType="fade"
        onRequestClose={() => setShowSignupModal(false)}
      >
        <View style={{ flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'center', alignItems: 'center', padding: 20 }}>
          <View style={{ backgroundColor: colors.cardBackground, borderRadius: 20, padding: 24, width: '100%', maxWidth: 400 }}>
            <Typography variant="h2" color={colors.text} style={{ marginBottom: 12, textAlign: 'center' }}>
              {t('video.signupRequired')}
            </Typography>
            <Typography variant="body" color={colors.text} style={{ marginBottom: 24, textAlign: 'center', opacity: 0.8 }}>
              {t('video.signupRequiredMessage')}
            </Typography>
            <View style={{ flexDirection: 'row', gap: 12 }}>
              <TouchableOpacity
                style={{
                  flex: 1,
                  backgroundColor: colors.grey,
                  borderRadius: 12,
                  padding: 16,
                  alignItems: 'center',
                }}
                onPress={() => setShowSignupModal(false)}
              >
                <Typography variant="body" color={colors.text}>
                  {t('common.cancel') || 'Cancel'}
                </Typography>
              </TouchableOpacity>
              <TouchableOpacity
                style={{
                  flex: 1,
                  backgroundColor: colors.blue,
                  borderRadius: 12,
                  padding: 16,
                  alignItems: 'center',
                }}
                onPress={confirmSignup}
              >
                <Typography variant="body" color={colors.white}>
                  {t('login.signIn') || 'Sign In'}
                </Typography>
              </TouchableOpacity>
            </View>
          </View>
        </View>
          </Modal>
    
            </>
          );
    
      }
    
  return (
    <SafeAreaView
      style={{
        flex: 1,
        backgroundColor: colors.screenBackground,
        alignItems: isWideLayout ? 'center' : 'stretch',
      }}
    >
      <View style={{ flex: 1, width: '100%' }}>{content}</View>
    </SafeAreaView>
  );
}
  
