import { Typography } from '@/components/ui';
import { IconSymbol } from '@/components/ui/icon-symbol';
import { getSubjectById } from '@/constants/subjects';
import { useAuth } from '@/contexts/auth-context';
import { useI18n } from '@/contexts/i18n-context';
import { useThemeColors } from '@/hooks/use-theme-colors';
import { saveQuizResult } from '@/services/progressService';
import { router, useLocalSearchParams } from 'expo-router';
import React, { useEffect } from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

const PASSING_SCORE = 70;

export default function QuizResultScreen() {
  const { t } = useI18n();
  const colors = useThemeColors();
  const { isAuthenticated, firebaseUser } = useAuth();
  const { videoId, score, total, subjectId } = useLocalSearchParams<{
    videoId?: string;
    score?: string;
    total?: string;
    subjectId?: string;
  }>();

  const [subject, setSubject] = React.useState<any>(undefined);

  React.useEffect(() => {
    const loadSubject = async () => {
      if (!subjectId) {
        setSubject(undefined);
        return;
      }
      try {
        const subjectData = await getSubjectById(subjectId);
        setSubject(subjectData);
      } catch (error) {
        console.error('Error loading subject:', error);
        setSubject(undefined);
      }
    };
    loadSubject();
  }, [subjectId]);

  const totalQuestions = React.useMemo(() => {
    const parsed = Number(total);
    return Number.isNaN(parsed) ? 0 : parsed;
  }, [total]);

  const correctAnswers = React.useMemo(() => {
    const parsed = Number(score);
    return Number.isNaN(parsed) ? 0 : parsed;
  }, [score]);

  const percentage = React.useMemo(() => {
    if (!totalQuestions || totalQuestions <= 0) {
      return 0;
    }
    return Math.round((correctAnswers / totalQuestions) * 100);
  }, [correctAnswers, totalQuestions]);

  const isPassing = percentage >= PASSING_SCORE;
  
  // Save quiz result to Firestore when component mounts
  useEffect(() => {
    const saveResult = async () => {
      if (!isAuthenticated || !firebaseUser?.uid || !videoId) return;
      
      try {
        await saveQuizResult(
          firebaseUser.uid,
          videoId,
          correctAnswers,
          totalQuestions,
          subject?.id,
          subject?.categoryId
        );
      } catch (error) {
        console.error('Failed to save quiz result:', error);
        // Don't show error to user, just log it
      }
    };

    saveResult();
  }, [isAuthenticated, firebaseUser?.uid, videoId, correctAnswers, totalQuestions, subject?.id, subject?.categoryId]);

  const statusColors = React.useMemo(
    () =>
      isPassing
        ? {
            iconBackground: '#E8F8ED',
            iconColor: '#26A749',
            accentColor: colors.blue,
          }
        : {
            iconBackground: '#FFF5E6',
            iconColor: '#F97316',
            accentColor: '#F97316',
          },
    [colors.blue, isPassing],
  );

  const handleGoBack = () => {
    if (videoId) {
      router.replace({
        pathname: '/video/[videoId]',
        params: subjectId ? { videoId, subjectId } : { videoId },
      });
    } else {
      router.back();
    }
  };

  const handleRetake = () => {
    if (!videoId) {
      return;
    }
    router.replace({
      pathname: '/video/[videoId]/quiz',
      params: subjectId ? { videoId, subjectId } : { videoId },
    });
  };

  return (
    <SafeAreaView
      style={{ flex: 1, backgroundColor: colors.screenBackground }}
      edges={['top', 'bottom', 'left', 'right']}
    >
      <View style={styles.header}>
        <TouchableOpacity onPress={handleGoBack} style={styles.backButton}>
          <IconSymbol name="arrow-back-outline" size={24} color={colors.text} />
        </TouchableOpacity>
        <Typography
          variant="h3"
          color={colors.text}
          style={{ fontFamily: 'Poppins-SemiBold' }}
        >
          {t('quiz.resultsTitle')}
        </Typography>
      </View>

      <View style={styles.content}>
        <View
          style={[
            styles.iconWrapper,
            { backgroundColor: statusColors.iconBackground },
          ]}
        >
          <IconSymbol
            name={isPassing ? 'checkmark' : 'close'}
            size={36}
            color={statusColors.iconColor}
          />
        </View>

        <Text
          style={[
            styles.congratsText,
            { color: isPassing ? colors.text : statusColors.iconColor },
          ]}
        >
          {isPassing ? t('quiz.resultsCongrats') : t('quiz.resultsTryAgain')}
        </Text>
        <Text
          style={[styles.summaryText, { color: colors.text, opacity: 0.7 }]}
        >
          {isPassing
            ? t('quiz.resultsSummary', {
                score: correctAnswers,
                total: totalQuestions,
              })
            : t('quiz.resultsFailureSummary', {
                score: correctAnswers,
                total: totalQuestions,
              })}
        </Text>

        <View
          style={[
            styles.scoreCard,
            {
              backgroundColor: colors.cardBackground,
              borderColor: colors.grey,
            },
          ]}
        >
          <Text
            style={[styles.scoreValue, { color: statusColors.accentColor }]}
          >{`${percentage}%`}</Text>
          <Text style={[styles.scoreLabel, { color: colors.text, opacity: 0.7 }]}>
            {t('quiz.scoreLabel')}
          </Text>
          <View style={[styles.scoreProgress, { backgroundColor: colors.grey }]}>
            <View
              style={[
                styles.scoreFill,
              {
                backgroundColor: statusColors.accentColor,
                width: `${percentage}%`,
              },
              ]}
            />
          </View>
        </View>
      </View>

      <View style={styles.footer}>
        <TouchableOpacity
          activeOpacity={0.85}
          onPress={handleGoBack}
          style={[
            styles.primaryButton,
            { backgroundColor: statusColors.accentColor },
          ]}
        >
          <Text style={styles.primaryButtonText}>{t('quiz.continueLearning')}</Text>
        </TouchableOpacity>

        <TouchableOpacity
          activeOpacity={0.85}
          onPress={handleRetake}
          style={[
            styles.secondaryButton,
            {
              borderColor: statusColors.accentColor,
              backgroundColor: colors.cardBackground,
            },
          ]}
        >
          <Text
            style={[
              styles.secondaryButtonText,
              { color: statusColors.accentColor },
            ]}
          >
            {t('quiz.retakeQuiz')}
          </Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    gap: 12,
  },
  backButton: {
    padding: 8,
  },
  content: {
    flex: 1,
    alignItems: 'center',
    paddingHorizontal: 24,
    paddingTop: 40,
  },
  iconWrapper: {
    width: 88,
    height: 88,
    borderRadius: 44,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 24,
  },
  congratsText: {
    fontFamily: 'Poppins-SemiBold',
    fontSize: 20,
    marginBottom: 8,
    textAlign: 'center',
  },
  summaryText: {
    fontFamily: 'Poppins-Regular',
    fontSize: 14,
    textAlign: 'center',
    marginBottom: 32,
  },
  scoreCard: {
    width: '100%',
    borderRadius: 20,
    borderWidth: 1,
    paddingVertical: 32,
    alignItems: 'center',
    gap: 12,
  },
  scoreValue: {
    fontFamily: 'Poppins-Bold',
    fontSize: 36,
  },
  scoreLabel: {
    fontFamily: 'Poppins-Medium',
    fontSize: 14,
  },
  scoreProgress: {
    width: '70%',
    height: 10,
    borderRadius: 6,
    overflow: 'hidden',
    marginTop: 4,
  },
  scoreFill: {
    height: '100%',
    borderRadius: 6,
  },
  footer: {
    paddingHorizontal: 24,
    paddingBottom: 24,
    gap: 12,
  },
  primaryButton: {
    borderRadius: 12,
    paddingVertical: 16,
    alignItems: 'center',
  },
  primaryButtonText: {
    color: '#FFFFFF',
    fontFamily: 'Poppins-SemiBold',
    fontSize: 16,
  },
  secondaryButton: {
    borderRadius: 12,
    paddingVertical: 16,
    alignItems: 'center',
    borderWidth: 2,
  },
  secondaryButtonText: {
    fontFamily: 'Poppins-SemiBold',
    fontSize: 16,
  },
});

