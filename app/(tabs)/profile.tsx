import { Typography } from '@/components/ui';
import { IconSymbol } from '@/components/ui/icon-symbol';
import { CustomColors } from '@/constants/theme';
import { useState } from 'react';
import { ScrollView, Switch, TouchableOpacity, View } from 'react-native';

export default function ProfileScreen() {
  const [isLogoutPressed, setIsLogoutPressed] = useState(false);

  const userInfo = {
    name: 'John Doe',
    email: 'johndoe@gmail.com',
    initials: 'JD',
  };

  return (
    <View style={{ flex: 1, backgroundColor: CustomColors.lightBlue }}>
      <ScrollView style={{ flex: 1 }} contentContainerStyle={{ padding: 20, paddingTop: 40 }}>
        {/* Avatar Section */}
        <View style={{ alignItems: 'center', marginBottom: 24 }}>
          <View
            style={{
              width: 100,
              height: 100,
              borderRadius: 50,
              backgroundColor: CustomColors.blue,
              justifyContent: 'center',
              alignItems: 'center',
              borderWidth: 3,
              borderColor: '#FFFFFF',
              marginBottom: 16,
            }}
          >
            <Typography variant="h1" style={{ color: '#FFFFFF' }}>
              {userInfo.initials}
            </Typography>
          </View>

          <Typography variant="h2" color={CustomColors.black} style={{ marginBottom: 8 }}>
            {userInfo.name}
          </Typography>
          <Typography variant="body" color={CustomColors.black}>
            {userInfo.email}
          </Typography>
        </View>

        {/* Settings Cards */}
        <View style={{ gap: 12, marginBottom: 24 }}>
          {/* Dark Mode Card */}
          <TouchableOpacity
            style={{
              backgroundColor: '#FFFFFF',
              borderRadius: 12,
              padding: 16,
              flexDirection: 'row',
              alignItems: 'center',
              borderWidth: 1,
              borderColor: CustomColors.grey,
            }}
            activeOpacity={0.7}
          >
            <IconSymbol name="sunny-outline" size={24} color={CustomColors.blue} />
            <View style={{ flex: 1, marginLeft: 12 }}>
              <Typography variant="body" color={CustomColors.black}>
                Dark Mode
              </Typography>
            </View>
            <Switch
              value={false}
              trackColor={{ false: CustomColors.grey, true: CustomColors.blue }}
              thumbColor="#FFFFFF"
            />
          </TouchableOpacity>

          {/* Account Settings Card */}
          <TouchableOpacity
            style={{
              backgroundColor: '#FFFFFF',
              borderRadius: 12,
              padding: 16,
              flexDirection: 'row',
              alignItems: 'center',
              borderWidth: 1,
              borderColor: CustomColors.grey,
            }}
            activeOpacity={0.7}
          >
            <IconSymbol name="settings-outline" size={24} color={CustomColors.blue} />
            <View style={{ flex: 1, marginLeft: 12 }}>
              <Typography variant="body" color={CustomColors.black}>
                Account Settings
              </Typography>
            </View>
            <IconSymbol name="chevron-forward-outline" size={20} color={CustomColors.blue} />
          </TouchableOpacity>

          {/* Privacy Policy Card */}
          <TouchableOpacity
            style={{
              backgroundColor: '#FFFFFF',
              borderRadius: 12,
              padding: 16,
              flexDirection: 'row',
              alignItems: 'center',
              borderWidth: 1,
              borderColor: CustomColors.grey,
            }}
            activeOpacity={0.7}
          >
            <IconSymbol name="shield-outline" size={24} color={CustomColors.blue} />
            <View style={{ flex: 1, marginLeft: 12 }}>
              <Typography variant="body" color={CustomColors.black}>
                Privacy Policy
              </Typography>
            </View>
            <IconSymbol name="chevron-forward-outline" size={20} color={CustomColors.blue} />
          </TouchableOpacity>
        </View>

        {/* Logout Button */}
        <TouchableOpacity
          style={{
            backgroundColor: isLogoutPressed ? CustomColors.red : '#FFFFFF',
            borderRadius: 12,
            padding: 16,
            flexDirection: 'row',
            alignItems: 'center',
            justifyContent: 'center',
            borderWidth: 1,
            borderColor: CustomColors.red,
          }}
          activeOpacity={1}
          onPressIn={() => setIsLogoutPressed(true)}
          onPressOut={() => setIsLogoutPressed(false)}
        >
          <IconSymbol name="log-out-outline" size={20} color={isLogoutPressed ? '#FFFFFF' : CustomColors.red} />
          <Typography variant="body" color={isLogoutPressed ? '#FFFFFF' : CustomColors.red} style={{ marginLeft: 8 }}>
            Logout
          </Typography>
        </TouchableOpacity>
      </ScrollView>
    </View>
  );
}