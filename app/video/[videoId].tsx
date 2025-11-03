import { Typography } from '@/components/ui';
import { IconSymbol } from '@/components/ui/icon-symbol';
import { getCategoryById, getVideoById, getVideosByCategory } from '@/constants/videos';
import { useAuth } from '@/contexts/auth-context';
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
  Modal,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
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
  const { isAuthenticated } = useAuth();
  const { videoId } = useLocalSearchParams<{ videoId: string }>();

  // Get video and category data
  const video = getVideoById(videoId || '');
  const category = video ? getCategoryById(video.categoryId) : null;
  // Get videos sorted by order
  const allVideos = category && video 
    ? getVideosByCategory(video.categoryId).sort((a, b) => a.order - b.order)
    : [];

  const [selectedVideo, setSelectedVideo] = useState<Video | null>(video || null);
  
  // Find current video index and calculate next/previous videos
  const currentVideoIndex = useMemo(() => {
    if (!selectedVideo) return -1;
    return allVideos.findIndex((v) => v.id === selectedVideo.id);
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
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const sidebarAnim = React.useRef(new Animated.Value(-SIDEBAR_WIDTH)).current;
  const [videoLoading, setVideoLoading] = useState(true);
  const [showSignupModal, setShowSignupModal] = useState(false);

  // Update selected video when videoId param changes
  React.useEffect(() => {
    if (video) {
      setSelectedVideo(video);
    }
  }, [videoId]);

  // Calculate progress
  const progressPercentage = useMemo(() => {
    if (!category || allVideos.length === 0) return 0;
    if (!isAuthenticated) return 0; // Guest users have 0% progress
    const completedCount = allVideos.filter((v) => completedVideos.has(v.id)).length;
    return (completedCount / allVideos.length) * 100;
  }, [category, allVideos, completedVideos, isAuthenticated]);

  const handleTakeQuiz = () => {
    setShowSignupModal(true);
  };

  const confirmSignup = () => {
    setShowSignupModal(false);
    router.push('/login');
  };

  const handleMarkAsComplete = () => {
    if (!selectedVideo || !isAuthenticated) return;

    if (completedVideos.has(selectedVideo.id)) {
      Alert.alert(t('video.alreadyCompleted'), t('video.alreadyCompletedMessage'));
      return;
    }

    setCompletedVideos(new Set([...completedVideos, selectedVideo.id]));
    Alert.alert(t('common.success'), t('video.markedAsComplete'));
  };

  // Navigate back to the previous page (not previous video)
  const handleBackPress = () => {
    router.back();
  };

  const openSidebar = () => {
    setIsSidebarOpen(true);
    sidebarAnim.setValue(-SIDEBAR_WIDTH);
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
    }).start(() => {
      setIsSidebarOpen(false);
    });
  };

  const handleVideoSelect = (video: Video) => {
    setSelectedVideo(video);
    // Use replace instead of push to avoid adding to navigation stack
    // This ensures back button goes to previous page, not previous video
    (router.replace as any)(`/video/${video.id}`);
    closeSidebar();
  };

  const handlePreviousVideo = () => {
    if (previousVideo) {
      setSelectedVideo(previousVideo);
      // Use replace to update URL without adding to navigation stack
      (router.replace as any)(`/video/${previousVideo.id}`);
    }
  };

  const handleNextVideo = () => {
    if (nextVideo) {
      setSelectedVideo(nextVideo);
      // Use replace to update URL without adding to navigation stack
      (router.replace as any)(`/video/${nextVideo.id}`);
    }
  };

  if (!video || !category || !selectedVideo) {
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
  // Validate and get embed URL
  const embedUrl = selectedVideo?.videoId ? getYouTubeEmbedUrl(selectedVideo.videoId, false) : null;
  
  // Create HTML wrapper for YouTube embed (required for React Native WebView)
  // Use useMemo to ensure it updates when embedUrl changes
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

  // Update video loading and HTML when selectedVideo changes
  React.useEffect(() => {
    if (selectedVideo) {
      setVideoLoading(true);
    }
  }, [selectedVideo?.id]);

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

        <TouchableOpacity onPress={openSidebar} style={{ padding: 8, marginRight: 8 }}>
          <IconSymbol name="menu-outline" size={24} color={colors.text} />
        </TouchableOpacity>

        <View style={{ flex: 1 }}>
          <Typography variant="h3" color={colors.text} style={{ fontFamily: 'Poppins-SemiBold' }}>
            {categoryName}
          </Typography>
          <Text style={{ color: colors.text, fontFamily: 'Poppins-Regular', fontSize: 12, marginTop: 2 }}>
            {isAuthenticated 
              ? `${Math.round(progressPercentage * allVideos.length / 100)} of ${allVideos.length} ${t('video.completed')}`
              : `0 of ${allVideos.length} ${t('video.completed')}`
            }
          </Text>
        </View>
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
          {embedUrl && selectedVideo ? (
            Platform.OS === 'web' ? (
              // Web platform: Use native iframe
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
                  key={selectedVideo.id}
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
            ) : (
              // Native platforms (iOS/Android): Use WebView
              videoHtml && WebView ? (
                <WebView
                  key={selectedVideo.id} // Force re-render when video changes
                  source={{ html: videoHtml }}
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
        <Typography variant="h2" color={colors.text} style={{ marginBottom: 8, fontFamily: 'Poppins-SemiBold' }}>
          {videoTitle}
        </Typography>

        {videoDescription && (
          <Typography variant="body" color={colors.text} style={{ marginBottom: 16, opacity: 0.8 }}>
            {videoDescription}
          </Typography>
        )}

        {!isAuthenticated && (
          <>
            {/* Sign Up Reminder */}
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

            {/* Take Quiz Button */}
            <TouchableOpacity
              onPress={handleTakeQuiz}
              style={{
                backgroundColor: colors.cardBackground,
                borderWidth: 2,
                borderColor: colors.blue,
                borderRadius: 12,
                paddingVertical: 16,
                alignItems: 'center',
                marginBottom: 16,
              }}
              activeOpacity={0.7}
            >
              <Text style={{ color: colors.blue, fontFamily: 'Poppins-SemiBold', fontSize: 16 }}>
                {t('video.takeQuiz')}
              </Text>
            </TouchableOpacity>
          </>
        )}

        {isAuthenticated && (
          <>
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
          </>
        )}
      </ScrollView>

      {/* Course Progress Bar */}
      {isAuthenticated && (
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
      )}

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
                  const vidTitle = vid.title[currentLanguage as keyof typeof vid.title] || vid.title.fr;
                  const isSelected = selectedVideo?.id === vid.id;
                  const isCompleted = completedVideos.has(vid.id);

                  return (
                    <TouchableOpacity
                      key={vid.id}
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
        </TouchableOpacity>
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

    </SafeAreaView>
  );
}
