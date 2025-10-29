import { Typography } from '@/components/ui';
import { useThemeColors } from '@/hooks/use-theme-colors';
import { useState } from 'react';
import { TouchableOpacity, View } from 'react-native';

export default function MyLearningScreen() {
  const colors = useThemeColors();
  const [selectedFilter, setSelectedFilter] = useState<'In Progress' | 'Completed'>('In Progress');

  return (
    <View style={{ flex: 1, backgroundColor: colors.screenBackground }}>
      {/* Header Section */}
      <View style={{ padding: 20, paddingTop: 40 }}>
        <Typography variant="h2" color={colors.blue} style={{ marginBottom: 8 }}>
          My Learning
        </Typography>
        <Typography variant="body" color={colors.text}>
          Track your progress and continue learning
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
            backgroundColor: selectedFilter === 'In Progress' ? colors.white : 'transparent',
            borderRadius: 50,
            paddingVertical: 12,
            paddingHorizontal: 16,
            alignItems: 'center',
          }}
          onPress={() => setSelectedFilter('In Progress')}
        >
          <Typography
            variant="body"
            color={colors.text}
            style={{ fontWeight: selectedFilter === 'In Progress' ? '600' : '400' }}
          >
            In Progress
          </Typography>
        </TouchableOpacity>

        <TouchableOpacity
          style={{
            flex: 1,
            backgroundColor: selectedFilter === 'Completed' ? colors.white : 'transparent',
            borderRadius: 50,
            paddingVertical: 12,
            paddingHorizontal: 16,
            alignItems: 'center',
          }}
          onPress={() => setSelectedFilter('Completed')}
        >
          <Typography
            variant="body"
            color={colors.text}
            style={{ fontWeight: selectedFilter === 'Completed' ? '600' : '400' }}
          >
            Completed
          </Typography>
        </TouchableOpacity>
      </View>
    </View>
  );
}
