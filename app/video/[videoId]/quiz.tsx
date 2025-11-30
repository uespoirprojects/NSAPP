import { Typography } from '@/components/ui';
import { IconSymbol } from '@/components/ui/icon-symbol';
import { useI18n } from '@/contexts/i18n-context';
import { useThemeColors } from '@/hooks/use-theme-colors';
import {
    getRandomQuizQuestions,
    QuizQuestionWithMeta,
} from '@/services/quizService';
import { getSubjectByIdDirect } from '@/services/subjectSyncService';
import type { QuizLanguage } from '@/types/quiz';
import { router, useLocalSearchParams } from 'expo-router';
import React from 'react';
import {
    ActivityIndicator,
    ScrollView,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

const TOTAL_QUESTIONS = 10;

export default function VideoQuizScreen() {
  const { videoId, subjectId } = useLocalSearchParams<{ videoId?: string; subjectId?: string }>();
  const colors = useThemeColors();
  const { currentLanguage, t } = useI18n();
  const [questions, setQuestions] = React.useState<QuizQuestionWithMeta[]>([]);
  const [currentIndex, setCurrentIndex] = React.useState(0);
  const [answers, setAnswers] = React.useState<Record<string | number, string>>(
    {},
  );
  const [subject, setSubject] = React.useState<any>(undefined);
  const [isLoadingQuestions, setIsLoadingQuestions] = React.useState(false);

  React.useEffect(() => {
    const loadSubject = async () => {
      if (!subjectId) {
        setSubject(undefined);
        return;
      }
      try {
        // Fetch directly from Firestore to get the latest quizSlug (bypasses cache)
        const subjectData = await getSubjectByIdDirect(subjectId);
        console.log('[quiz] Loaded subject:', subjectData?.id, 'quizSlug:', subjectData?.quizSlug);
        setSubject(subjectData);
      } catch (error) {
        console.error('Error loading subject:', error);
        setSubject(undefined);
      }
    };
    loadSubject();
  }, [subjectId]);

  const totalQuestions = questions.length;
  const currentQuestion =
    totalQuestions > 0 ? questions[currentIndex] : undefined;
  const selectedOption = currentQuestion
    ? answers[currentQuestion.id]
    : undefined;
  const isLastQuestion = totalQuestions > 0 && currentIndex === totalQuestions - 1;
  const progress =
    totalQuestions > 0 ? ((currentIndex + 1) / totalQuestions) * 100 : 0;

  React.useEffect(() => {
    // Only load quiz questions after subject is loaded from database
    if (!subject || !subject.quizSlug) {
      setQuestions([]);
      setIsLoadingQuestions(false);
      return;
    }

    const loadQuestions = async () => {
      setIsLoadingQuestions(true);
      try {
        console.log('[quiz] Loading quiz for subject:', subject.id, 'quizSlug:', subject.quizSlug);
        const items = await getRandomQuizQuestions(
          currentLanguage as QuizLanguage,
          TOTAL_QUESTIONS,
          subject.quizSlug,
        );
        setQuestions(items);
        setCurrentIndex(0);
        setAnswers({});
      } catch (error) {
        console.error('Error loading quiz questions:', error);
        setQuestions([]);
      } finally {
        setIsLoadingQuestions(false);
      }
    };
    
    loadQuestions();
  }, [currentLanguage, videoId, subjectId, subject?.quizSlug]);

  const handleOptionPress = (option: string) => {
    if (!currentQuestion) {
      return;
    }
    setAnswers((prev) => ({
      ...prev,
      [currentQuestion.id]: option,
    }));
  };

  const isCorrectResponse = React.useCallback(
    (question: QuizQuestionWithMeta, userAnswer?: string): boolean => {
      if (!question.answer) {
        return false;
      }

      if (Array.isArray(question.answer)) {
        return userAnswer ? question.answer.includes(userAnswer) : false;
      }

      return userAnswer === question.answer;
    },
    [],
  );

  const calculateScore = React.useCallback(() => {
    return questions.reduce((acc, question) => {
      const userAnswer = answers[question.id];
      return isCorrectResponse(question, userAnswer) ? acc + 1 : acc;
    }, 0);
  }, [answers, questions, isCorrectResponse]);

  const handleSubmit = React.useCallback(() => {
    if (!videoId) {
      return;
    }
    const computedScore = calculateScore();
    const params = {
      videoId,
      score: computedScore.toString(),
      total: totalQuestions.toString(),
      subjectId,
    };
    router.push({
      pathname: '/video/[videoId]/quiz-result',
      params,
    });
  }, [calculateScore, router, totalQuestions, videoId, subjectId]);

  const handleNext = () => {
    // Prevent navigation if no answer is selected
    if (!currentQuestion || !selectedOption || !hasSelectedAnswer) {
      return;
    }
    if (isLastQuestion) {
      handleSubmit();
      return;
    }
    setCurrentIndex((prev) => prev + 1);
  };

  const handlePrevious = () => {
    if (currentIndex === 0) {
      return;
    }
    setCurrentIndex((prev) => Math.max(prev - 1, 0));
  };

  const getOptionStyle = (option: string) => {
    if (!currentQuestion) {
      return {};
    }

    const isSelected = selectedOption === option;

    return {
      borderColor: isSelected ? colors.blue : colors.grey,
      backgroundColor: isSelected ? colors.lightBlue : colors.cardBackground,
    };
  };

  const hasSelectedAnswer = Boolean(
    currentQuestion && answers[currentQuestion.id],
  );
  const isNextDisabled = !hasSelectedAnswer;
  const nextLabel = isLastQuestion ? t('quiz.submit') : t('quiz.next');

  const handleBackToVideos = () => {
    if (subject?.categoryId) {
      router.replace(`/videos/${subject.categoryId}`);
      return;
    }
    router.back();
  };

  return (
    <SafeAreaView
      style={{ flex: 1, backgroundColor: colors.screenBackground }}
      edges={['top', 'bottom', 'left', 'right']}
    >
      <View style={styles.header}>
        <TouchableOpacity
          onPress={handleBackToVideos}
          style={styles.backButton}
        >
          <IconSymbol name="arrow-back-outline" size={24} color={colors.text} />
        </TouchableOpacity>
        <View style={{ flex: 1 }}>
          <Typography
            variant="h3"
            color={colors.text}
            style={{ fontFamily: 'Poppins-SemiBold' }}
          >
            {subject
              ? subject.title[currentLanguage as keyof typeof subject.title] || subject.title.fr
              : t('quiz.defaultTitle')}
          </Typography>
          <Text
            style={{
              color: colors.text,
              opacity: 0.7,
              fontFamily: 'Poppins-Regular',
              fontSize: 12,
              marginTop: 4,
            }}
          >
            {t('quiz.subtitle')}
          </Text>
        </View>
      </View>

      {isLoadingQuestions ? (
        <View style={styles.emptyState}>
          <ActivityIndicator size="large" color={colors.blue} />
          <Typography variant="body" color={colors.text} style={{ marginTop: 16, opacity: 0.7 }}>
            {t('quiz.loading') || 'Loading quiz questions...'}
          </Typography>
        </View>
      ) : totalQuestions === 0 ? (
        <View style={styles.emptyState}>
          <Typography variant="body" color={colors.text}>
            {t('quiz.empty')}
          </Typography>
        </View>
      ) : (
        <>
          <View style={styles.progressContainer}>
            <View style={styles.statusRow}>
              <Text style={[styles.statusText, { color: colors.text }]}>
                {`${t('quiz.question')} ${currentIndex + 1} ${t('quiz.of')} ${totalQuestions}`}
              </Text>
              <Text style={[styles.statusText, { color: colors.text }]}>
                {`${Math.round(progress)}%`}
              </Text>
            </View>
            <View style={[styles.progressTrack, { backgroundColor: colors.grey }]}>
              <View
                style={[
                  styles.progressFill,
                  { width: `${progress}%`, backgroundColor: colors.blue },
                ]}
              />
            </View>
          </View>

          <ScrollView
            contentContainerStyle={styles.content}
            showsVerticalScrollIndicator={false}
          >
            <View
              style={[
                styles.card,
                {
                  backgroundColor: colors.cardBackground,
                  borderColor: colors.grey,
                },
              ]}
            >
              <Text
                style={{
                  color: colors.text,
                  fontFamily: 'Poppins-Regular',
                  fontSize: 12,
                  marginBottom: 8,
                }}
              >
                {currentQuestion?.moduleTitle}
              </Text>
              <Text
                style={{
                  color: colors.text,
                  fontFamily: 'Poppins-SemiBold',
                  fontSize: 18,
                  lineHeight: 26,
                  marginBottom: 16,
                }}
              >
                {currentQuestion?.question}
              </Text>

              {currentQuestion?.options && Array.isArray(currentQuestion.options) && currentQuestion.options.length > 0 ? (
                currentQuestion.options.map((option) => (
                  <TouchableOpacity
                    key={option}
                    activeOpacity={0.8}
                    onPress={() => handleOptionPress(option)}
                    style={[
                      styles.optionButton,
                      getOptionStyle(option),
                    ]}
                  >
                    <Text
                      style={{
                        color: colors.text,
                        fontFamily: 'Poppins-Medium',
                        fontSize: 14,
                      }}
                    >
                      {option}
                    </Text>
                  </TouchableOpacity>
                ))
              ) : (
                <Text style={{ color: colors.text, opacity: 0.7, fontStyle: 'italic', padding: 16 }}>
                  {t('quiz.noOptions') || 'No options available for this question'}
                </Text>
              )}
            </View>
          </ScrollView>

          <View style={styles.footer}>
            <View style={styles.footerRow}>
              <TouchableOpacity
                activeOpacity={0.8}
                onPress={handlePrevious}
                disabled={currentIndex === 0}
                style={[
                  styles.secondaryButton,
                  {
                    borderColor: currentIndex === 0 ? colors.grey : colors.blue,
                    backgroundColor:
                      currentIndex === 0 ? colors.grey : colors.cardBackground,
                  },
                ]}
              >
                <Text
                  style={{
                    color: currentIndex === 0 ? colors.white : colors.blue,
                    fontFamily: 'Poppins-SemiBold',
                    fontSize: 16,
                  }}
                >
                  {t('quiz.previous')}
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                activeOpacity={isNextDisabled ? 1 : 0.8}
                onPress={handleNext}
                disabled={isNextDisabled}
                style={[
                  styles.primaryButton,
                  {
                    backgroundColor: isNextDisabled ? colors.grey : colors.blue,
                    opacity: isNextDisabled ? 0.6 : 1,
                  },
                ]}
              >
                <Text
                  style={{
                    color: colors.white,
                    fontFamily: 'Poppins-SemiBold',
                    fontSize: 16,
                  }}
                >
                  {nextLabel}
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </>
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  backButton: {
    padding: 8,
    marginRight: 12,
  },
  progressContainer: {
    paddingHorizontal: 16,
    paddingBottom: 12,
  },
  statusRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  statusText: {
    fontFamily: 'Poppins-Medium',
    fontSize: 12,
  },
  progressTrack: {
    width: '100%',
    height: 6,
    borderRadius: 4,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    borderRadius: 4,
  },
  content: {
    paddingHorizontal: 16,
    paddingBottom: 24,
  },
  card: {
    padding: 20,
    borderRadius: 16,
    borderWidth: 1,
    marginBottom: 16,
  },
  optionButton: {
    paddingVertical: 14,
    paddingHorizontal: 16,
    borderRadius: 12,
    borderWidth: 1,
    marginBottom: 12,
  },
  footer: {
    paddingHorizontal: 16,
    paddingVertical: 16,
  },
  footerRow: {
    flexDirection: 'row',
    gap: 12,
  },
  primaryButton: {
    flex: 1,
    borderRadius: 12,
    paddingVertical: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  secondaryButton: {
    flex: 1,
    borderRadius: 12,
    paddingVertical: 16,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
  },
  emptyState: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
  },
});
