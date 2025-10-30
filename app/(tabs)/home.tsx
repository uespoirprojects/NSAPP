import { Typography } from '@/components/ui';
import { IconSymbol } from '@/components/ui/icon-symbol';
import { videoCategories } from '@/constants/videos';
import { useI18n } from '@/contexts/i18n-context';
import { useThemeColors } from '@/hooks/use-theme-colors';
import { router } from 'expo-router';
import { ScrollView, TouchableOpacity, View } from 'react-native';

const categoryIcons = {
  computer: 'laptop-outline',
  mathematics: 'calculator-outline',
  physics: 'flask-outline',
  languages: 'chatbubbles-outline',
};

export default function HomeScreen() {
  const colors = useThemeColors();
  const { t, currentLanguage } = useI18n();

  const handleCategoryPress = (categoryId: string) => {
    // Navigate to videos list screen for this category
    (router.push as any)(`/videos/${categoryId}`);
  };

  return (
    <View style={{ flex: 1, backgroundColor: colors.screenBackground }}>
      {/* Header Section */}
      <View style={{ padding: 20, paddingTop: 40 }}>
        <Typography variant="h2" color={colors.blue} style={{ marginBottom: 8 }}>
          {t('home.title')}
        </Typography>
        <Typography variant="body" color={colors.text}>
          {t('home.subtitle')}
        </Typography>
      </View>

      {/* Categories Cards - Grid Layout */}
      <ScrollView style={{ flex: 1, paddingHorizontal: 20 }}>
        <View
          style={{
            flexDirection: 'row',
            flexWrap: 'wrap',
            justifyContent: 'space-between',
          }}
        >
          {videoCategories.map((category) => {
            const videoCount = category.videos.length;
            const icon = categoryIcons[category.id as keyof typeof categoryIcons] || 'folder-outline';
            const categoryName = category.name[currentLanguage] || category.name.fr;

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
                <IconSymbol name={icon} size={40} color={colors.blue} style={{ marginTop: 5, marginBottom: 25, textAlign: 'center' }}/>
                <Typography
                  variant="h3"
                  color={colors.text}
                  style={{ marginTop: 24, marginBottom: 8, textAlign: 'center' }}
                >
                  {categoryName}
                </Typography>
                <Typography variant="caption" color={colors.text} style={{ textAlign: 'center' }}>
                  {videoCount} {t('common.videos')}
                </Typography>
              </TouchableOpacity>
            );
          })}
        </View>
      </ScrollView>
    </View>
  );
}