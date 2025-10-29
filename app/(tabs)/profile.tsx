import { Typography } from '@/components/ui';
import { IconSymbol } from '@/components/ui/icon-symbol';
import { useTheme } from '@/contexts/theme-context';
import { useThemeColors } from '@/hooks/use-theme-colors';
import { useState } from 'react';
import { ScrollView, Switch, TouchableOpacity, View } from 'react-native';

export default function ProfileScreen() {
  const colors = useThemeColors();
  const { effectiveTheme, themeMode, setThemeMode } = useTheme();
  const [isLogoutPressed, setIsLogoutPressed] = useState(false);

  const isDarkMode = effectiveTheme === 'dark';

  const handleThemeToggle = (value: boolean) => {
    setThemeMode(value ? 'dark' : 'light');
  };

  const userInfo = {
    name: 'John Doe',
    email: 'johndoe@gmail.com',
    initials: 'JD',
  };

  return (
    <View style={{ flex: 1, backgroundColor: colors.screenBackground }}>
      <ScrollView style={{ flex: 1 }} contentContainerStyle={{ padding: 20, paddingTop: 40 }}>
        {/* Avatar Section */}
        <View style={{ alignItems: 'center', marginBottom: 24 }}>
          <View
            style={{
              width: 100,
              height: 100,
              borderRadius: 50,
              backgroundColor: colors.blue,
              justifyContent: 'center',
              alignItems: 'center',
              borderWidth: 3,
              borderColor: colors.white,
              marginBottom: 16,
            }}
          >
            <Typography variant="h1" style={{ color: colors.white }}>
              {userInfo.initials}
            </Typography>
          </View>

          <Typography variant="h2" color={colors.text} style={{ marginBottom: 8 }}>
            {userInfo.name}
          </Typography>
          <Typography variant="body" color={colors.text}>
            {userInfo.email}
          </Typography>
        </View>

        {/* Settings Cards */}
        <View style={{ gap: 12, marginBottom: 24 }}>
          {/* Dark Mode Card */}
          <TouchableOpacity
            style={{
              backgroundColor: colors.cardBackground,
              borderRadius: 12,
              padding: 16,
              flexDirection: 'row',
              alignItems: 'center',
              borderWidth: 1,
              borderColor: colors.grey,
            }}
            activeOpacity={0.7}
          >
            <IconSymbol 
              name={isDarkMode ? "moon-outline" : "sunny-outline"} 
              size={24} 
              color={colors.blue} 
            />
            <View style={{ flex: 1, marginLeft: 12 }}>
              <Typography variant="body" color={colors.text}>
                Dark Mode
              </Typography>
            </View>
            <Switch
              value={isDarkMode}
              onValueChange={handleThemeToggle}
              trackColor={{ false: colors.grey, true: colors.blue }}
              thumbColor={colors.white}
            />
          </TouchableOpacity>

          {/* Account Settings Card */}
          <TouchableOpacity
            style={{
              backgroundColor: colors.cardBackground,
              borderRadius: 12,
              padding: 16,
              flexDirection: 'row',
              alignItems: 'center',
              borderWidth: 1,
              borderColor: colors.grey,
            }}
            activeOpacity={0.7}
          >
            <IconSymbol name="settings-outline" size={24} color={colors.blue} />
            <View style={{ flex: 1, marginLeft: 12 }}>
              <Typography variant="body" color={colors.text}>
                Account Settings
              </Typography>
            </View>
            <IconSymbol name="chevron-forward-outline" size={20} color={colors.blue} />
          </TouchableOpacity>

          {/* Privacy Policy Card */}
          <TouchableOpacity
            style={{
              backgroundColor: colors.cardBackground,
              borderRadius: 12,
              padding: 16,
              flexDirection: 'row',
              alignItems: 'center',
              borderWidth: 1,
              borderColor: colors.grey,
            }}
            activeOpacity={0.7}
          >
            <IconSymbol name="shield-outline" size={24} color={colors.blue} />
            <View style={{ flex: 1, marginLeft: 12 }}>
              <Typography variant="body" color={colors.text}>
                Privacy Policy
              </Typography>
            </View>
            <IconSymbol name="chevron-forward-outline" size={20} color={colors.blue} />
          </TouchableOpacity>
        </View>

        {/* Logout Button */}
        <TouchableOpacity
          style={{
            backgroundColor: isLogoutPressed ? colors.red : colors.cardBackground,
            borderRadius: 12,
            padding: 16,
            flexDirection: 'row',
            alignItems: 'center',
            justifyContent: 'center',
            borderWidth: 1,
            borderColor: colors.red,
          }}
          activeOpacity={1}
          onPressIn={() => setIsLogoutPressed(true)}
          onPressOut={() => setIsLogoutPressed(false)}
        >
          <IconSymbol name="log-out-outline" size={20} color={isLogoutPressed ? colors.white : colors.red} />
          <Typography variant="body" color={isLogoutPressed ? colors.white : colors.red} style={{ marginLeft: 8 }}>
            Logout
          </Typography>
        </TouchableOpacity>
      </ScrollView>
    </View>
  );
}