import { Typography } from '@/components/ui';
import { IconSymbol } from '@/components/ui/icon-symbol';
import { useThemeColors } from '@/hooks/use-theme-colors';
import { ScrollView, View } from 'react-native';

const categories = [
  { id: '1', name: 'Computer', icon: 'laptop-outline', videoCount: 24 },
  { id: '2', name: 'Mathematics', icon: 'calculator-outline', videoCount: 18 },
  { id: '3', name: 'Physics', icon: 'flask-outline', videoCount: 15 },
  { id: '4', name: 'Languages', icon: 'chatbubbles-outline', videoCount: 12 },
];

export default function HomeScreen() {
  const colors = useThemeColors();

  return (
    <View style={{ flex: 1, backgroundColor: colors.screenBackground }}>
      {/* Header Section */}
      <View style={{ padding: 20, paddingTop: 40 }}>
        <Typography variant="h2" color={colors.blue} style={{ marginBottom: 8 }}>
          Explore Categories
        </Typography>
        <Typography variant="body" color={colors.text}>
          Choose a subject to start learning
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
          {categories.map((category) => (
            <View
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
            >
              <IconSymbol name={category.icon} size={40} color={colors.blue} style={{ marginTop: 5, marginBottom: 25, textAlign: 'center' }}/>
              <Typography
                variant="h3"
                color={colors.text}
                style={{ marginTop: 24, marginBottom: 8, textAlign: 'center' }}
              >
                {category.name}
              </Typography>
              <Typography variant="caption" color={colors.text} style={{ textAlign: 'center' }}>
                {category.videoCount} videos
              </Typography>
            </View>
          ))}
        </View>
      </ScrollView>
    </View>
  );
}