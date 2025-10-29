import { Typography } from '@/components/ui';
import { CustomColors } from '@/constants/theme';
import { useState } from 'react';
import { TouchableOpacity, View } from 'react-native';

export default function MyLearningScreen() {
  const [selectedFilter, setSelectedFilter] = useState<'In Progress' | 'Completed'>('In Progress');

  return (
    <View style={{ flex: 1, backgroundColor: CustomColors.lightBlue }}>
      {/* Header Section */}
      <View style={{ padding: 20, paddingTop: 40 }}>
        <Typography variant="h2" color={CustomColors.blue} style={{ marginBottom: 8 }}>
          My Learning
        </Typography>
        <Typography variant="body" color={CustomColors.black}>
          Track your progress and continue learning
        </Typography>
      </View>

      {/* Filter Buttons */}
      <View
        style={{
          marginHorizontal: 20,
          marginBottom: 20,
          backgroundColor: CustomColors.grey,
          borderRadius: 50,
          padding: 4,
          flexDirection: 'row',
        }}
      >
        <TouchableOpacity
          style={{
            flex: 1,
            backgroundColor: selectedFilter === 'In Progress' ? CustomColors.white : 'transparent',
            borderRadius: 50,
            paddingVertical: 12,
            paddingHorizontal: 16,
            alignItems: 'center',
          }}
          onPress={() => setSelectedFilter('In Progress')}
        >
          <Typography
            variant="body"
            color={CustomColors.black}
            style={{ fontWeight: selectedFilter === 'In Progress' ? '600' : '400' }}
          >
            In Progress
          </Typography>
        </TouchableOpacity>

        <TouchableOpacity
          style={{
            flex: 1,
            backgroundColor: selectedFilter === 'Completed' ? CustomColors.white : 'transparent',
            borderRadius: 50,
            paddingVertical: 12,
            paddingHorizontal: 16,
            alignItems: 'center',
          }}
          onPress={() => setSelectedFilter('Completed')}
        >
          <Typography
            variant="body"
            color={CustomColors.black}
            style={{ fontWeight: selectedFilter === 'Completed' ? '600' : '400' }}
          >
            Completed
          </Typography>
        </TouchableOpacity>
      </View>
    </View>
  );
}