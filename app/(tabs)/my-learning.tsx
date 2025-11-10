import { Typography } from '@/components/ui';
import { useI18n } from '@/contexts/i18n-context';
import { useThemeColors } from '@/hooks/use-theme-colors';
import { useState } from 'react';
import { TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function MyLearningScreen() {
  const colors = useThemeColors();
  const { t } = useI18n();
  const [selectedFilter, setSelectedFilter] = useState<'inProgress' | 'completed'>('inProgress');

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: colors.screenBackground }} edges={['top', 'bottom', 'left', 'right']}>
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
            backgroundColor:
              selectedFilter === 'inProgress' ? colors.blue : 'transparent',
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
            style={{ fontFamily: selectedFilter === 'inProgress' ? 'Poppins-Bold' : 'Poppins-Regular' }}
          >
            {t('myLearning.filters.inProgress')}
          </Typography>
        </TouchableOpacity>

        <TouchableOpacity
          style={{
            flex: 1,
            backgroundColor:
              selectedFilter === 'completed' ? colors.blue : 'transparent',
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
              style={{ fontFamily: selectedFilter === 'completed' ? 'Poppins-Bold' : 'Poppins-Regular' }}
          >
            {t('myLearning.filters.completed')}
          </Typography>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}