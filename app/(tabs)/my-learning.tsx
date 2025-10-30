import { Typography } from '@/components/ui';
import { useI18n } from '@/contexts/i18n-context';
import { useThemeColors } from '@/hooks/use-theme-colors';
import { CustomColors } from '@/constants/theme';
import { useState } from 'react';
import { TouchableOpacity, View } from 'react-native';

export default function MyLearningScreen() {
  const colors = useThemeColors();
  const { t } = useI18n();
  const [selectedFilter, setSelectedFilter] = useState<'inProgress' | 'completed'>('inProgress');

  return (
    <View style={{ flex: 1, backgroundColor: colors.screenBackground }}>
      {/* Header Section */}
      <View style={{ padding: 20, paddingTop: 40 }}>
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
        }}
      >
        <TouchableOpacity
          style={{
            flex: 1,
            backgroundColor: selectedFilter === 'inProgress' ? colors.white : 'transparent',
            borderRadius: 50,
            paddingVertical: 12,
            paddingHorizontal: 16,
            alignItems: 'center',
          }}
          onPress={() => setSelectedFilter('inProgress')}
        >
          <Typography
            variant="body"
            color={colors.text}
            style={{ fontWeight: selectedFilter === 'inProgress' ? '600' : '400' }}
          >
            {t('myLearning.filters.inProgress')}
          </Typography>
        </TouchableOpacity>

        <TouchableOpacity
          style={{
            flex: 1,
            backgroundColor: selectedFilter === 'completed' ? colors.white : 'transparent',
            borderRadius: 50,
            paddingVertical: 12,
            paddingHorizontal: 16,
            alignItems: 'center',
          }}
          onPress={() => setSelectedFilter('completed')}
        >
          <Typography
            variant="body"
            color={colors.text}
            style={{ fontWeight: selectedFilter === 'completed' ? '600' : '400' }}
          >
            {t('myLearning.filters.completed')}
          </Typography>
        </TouchableOpacity>
      </View>
    </View>
  );
}