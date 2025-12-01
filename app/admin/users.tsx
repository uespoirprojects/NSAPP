import { Typography } from '@/components/ui';
import { IconSymbol } from '@/components/ui/icon-symbol';
import { useThemeColors } from '@/hooks/use-theme-colors';
import {
    getUsers,
    updateUserRole,
    type AdminUser,
} from '@/services/adminService';
import type { UserRole } from '@/services/authService';
import { router } from 'expo-router';
import React, { useEffect, useState } from 'react';
import {
    ActivityIndicator,
    Alert,
    Modal,
    ScrollView,
    Text,
    TouchableOpacity,
    View,
    useWindowDimensions,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function UsersScreen() {
  const colors = useThemeColors();
  const { width: windowWidth, height: windowHeight } = useWindowDimensions();
  const isWideLayout = windowWidth > windowHeight || windowWidth >= 900;
  const contentMaxWidth = Math.min(windowWidth * 0.9, 1200);

  const [users, setUsers] = useState<AdminUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [roleModalVisible, setRoleModalVisible] = useState(false);
  const [userToUpdate, setUserToUpdate] = useState<AdminUser | null>(null);
  const [updatingRole, setUpdatingRole] = useState(false);

  useEffect(() => {
    loadUsers();
  }, []);

  const loadUsers = async () => {
    try {
      setLoading(true);
      const usersData = await getUsers();
      setUsers(usersData);
    } catch (error) {
      console.error('Error loading users:', error);
      Alert.alert('Error', 'Failed to load users');
    } finally {
      setLoading(false);
    }
  };

  const openRoleModal = (user: AdminUser) => {
    setUserToUpdate(user);
    setRoleModalVisible(true);
  };

  const handleRoleChange = async (newRole: UserRole) => {
    if (!userToUpdate) return;

    try {
      setUpdatingRole(true);
      await updateUserRole(userToUpdate.id, newRole);
      Alert.alert('Success', `User role updated to ${newRole}`);
      setRoleModalVisible(false);
      setUserToUpdate(null);
      loadUsers(); // Reload users to show updated role
    } catch (error: any) {
      console.error('Error updating user role:', error);
      Alert.alert('Error', error.message || 'Failed to update user role');
    } finally {
      setUpdatingRole(false);
    }
  };

  const formatDate = (timestamp: any) => {
    if (!timestamp) return 'N/A';
    try {
      const date = timestamp.toDate ? timestamp.toDate() : new Date(timestamp);
      return date.toLocaleDateString();
    } catch {
      return 'N/A';
    }
  };

  const getRoleBadgeColor = (role: UserRole) => {
    return role === 'admin' ? '#4CAF50' : colors.blue;
  };

  return (
    <SafeAreaView
      style={{
        flex: 1,
        backgroundColor: colors.screenBackground,
        alignItems: isWideLayout ? 'center' : 'stretch',
      }}
      edges={['top', 'bottom']}
    >
      <ScrollView
        style={{ flex: 1 }}
        contentContainerStyle={{
          padding: 20,
          alignItems: isWideLayout ? 'center' : 'stretch',
        }}
      >
        <View
          style={{
            width: '100%',
            maxWidth: contentMaxWidth,
            alignSelf: isWideLayout ? 'center' : 'stretch',
          }}
        >
          {/* Header with Back Button */}
          <View
            style={{
              flexDirection: 'row',
              justifyContent: 'space-between',
              alignItems: 'center',
              marginBottom: 24,
            }}
          >
            <View style={{ flexDirection: 'row', alignItems: 'center', flex: 1 }}>
              <TouchableOpacity
                onPress={() => router.back()}
                style={{
                  marginRight: 12,
                  padding: 8,
                }}
              >
                <IconSymbol name="arrow-back-outline" size={24} color={colors.text} />
              </TouchableOpacity>
              <Typography variant="h2" color={colors.text} style={{ fontFamily: 'Poppins-SemiBold' }}>
                Users ({users.length})
              </Typography>
            </View>
          </View>

          {/* Users List */}
          {loading ? (
            <View style={{ alignItems: 'center', padding: 40 }}>
              <ActivityIndicator size="large" color={colors.blue} />
            </View>
          ) : users.length === 0 ? (
            <View
              style={{
                backgroundColor: colors.cardBackground,
                borderRadius: 12,
                padding: 40,
                alignItems: 'center',
                borderWidth: 1,
                borderColor: colors.grey,
              }}
            >
              <IconSymbol name="people-outline" size={48} color={colors.grey} style={{ marginBottom: 16 }} />
              <Typography variant="h3" color={colors.text} style={{ marginBottom: 8 }}>
                No Users
              </Typography>
              <Typography variant="body" color={colors.text} style={{ opacity: 0.7, textAlign: 'center' }}>
                No users found in the system
              </Typography>
            </View>
          ) : (
            users.map((user) => (
              <View
                key={user.id}
                style={{
                  backgroundColor: colors.cardBackground,
                  borderRadius: 12,
                  padding: 16,
                  marginBottom: 12,
                  borderWidth: 1,
                  borderColor: colors.grey,
                }}
              >
                <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                  <View style={{ flex: 1 }}>
                    <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 8 }}>
                      <Typography variant="h3" color={colors.text} style={{ marginRight: 12 }}>
                        {user.firstName} {user.lastName}
                      </Typography>
                      <View
                        style={{
                          backgroundColor: `${getRoleBadgeColor(user.role)}15`,
                          paddingHorizontal: 8,
                          paddingVertical: 4,
                          borderRadius: 6,
                          borderWidth: 1,
                          borderColor: getRoleBadgeColor(user.role),
                        }}
                      >
                        <Text
                          style={{
                            color: getRoleBadgeColor(user.role),
                            fontSize: 10,
                            fontFamily: 'Poppins-SemiBold',
                            textTransform: 'uppercase',
                          }}
                        >
                          {user.role}
                        </Text>
                      </View>
                    </View>
                    <Typography variant="body" color={colors.text} style={{ opacity: 0.7, fontSize: 12, marginBottom: 4 }}>
                      Email: {user.email}
                    </Typography>
                    {user.address && (
                      <Typography variant="body" color={colors.text} style={{ opacity: 0.7, fontSize: 12, marginBottom: 4 }}>
                        Address: {user.address}
                      </Typography>
                    )}
                    {(user.city || user.province) && (
                      <Typography variant="body" color={colors.text} style={{ opacity: 0.7, fontSize: 12, marginBottom: 4 }}>
                        {user.city && user.province ? `${user.city}, ${user.province}` : user.city || user.province}
                      </Typography>
                    )}
                    <Typography variant="body" color={colors.text} style={{ opacity: 0.7, fontSize: 12 }}>
                      Joined: {formatDate(user.createdAt)}
                    </Typography>
                  </View>
                  <TouchableOpacity
                    onPress={() => openRoleModal(user)}
                    style={{
                      padding: 8,
                      borderRadius: 6,
                      backgroundColor: `${colors.blue}15`,
                    }}
                  >
                    <IconSymbol name="shield-outline" size={20} color={colors.blue} />
                  </TouchableOpacity>
                </View>
              </View>
            ))
          )}
        </View>
      </ScrollView>

      {/* Role Change Modal */}
      <Modal
        visible={roleModalVisible}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setRoleModalVisible(false)}
      >
        <View
          style={{
            flex: 1,
            backgroundColor: 'rgba(0, 0, 0, 0.5)',
            justifyContent: 'flex-end',
          }}
        >
          <View
            style={{
              backgroundColor: colors.cardBackground,
              borderTopLeftRadius: 20,
              borderTopRightRadius: 20,
              padding: 20,
              maxHeight: '60%',
            }}
          >
            <View
              style={{
                flexDirection: 'row',
                justifyContent: 'space-between',
                alignItems: 'center',
                marginBottom: 24,
              }}
            >
              <Typography variant="h2" color={colors.text} style={{ fontFamily: 'Poppins-SemiBold' }}>
                Change User Role
              </Typography>
              <TouchableOpacity onPress={() => setRoleModalVisible(false)}>
                <IconSymbol name="close" size={24} color={colors.text} />
              </TouchableOpacity>
            </View>

            {userToUpdate && (
              <>
                <View style={{ marginBottom: 16 }}>
                  <Typography variant="body" color={colors.text} style={{ marginBottom: 8, opacity: 0.7 }}>
                    User
                  </Typography>
                  <Typography variant="h3" color={colors.text}>
                    {userToUpdate.firstName} {userToUpdate.lastName}
                  </Typography>
                  <Typography variant="body" color={colors.text} style={{ opacity: 0.7, fontSize: 12, marginTop: 4 }}>
                    {userToUpdate.email}
                  </Typography>
                </View>

                <View style={{ marginBottom: 24 }}>
                  <Typography variant="body" color={colors.text} style={{ marginBottom: 12, fontFamily: 'Poppins-SemiBold' }}>
                    Select Role
                  </Typography>

                  <TouchableOpacity
                    onPress={() => handleRoleChange('user')}
                    disabled={updatingRole || userToUpdate.role === 'user'}
                    style={{
                      backgroundColor: userToUpdate.role === 'user' ? `${colors.blue}15` : colors.screenBackground,
                      borderRadius: 8,
                      padding: 16,
                      marginBottom: 12,
                      borderWidth: 2,
                      borderColor: userToUpdate.role === 'user' ? colors.blue : colors.grey,
                      opacity: updatingRole ? 0.6 : 1,
                    }}
                  >
                    <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
                      <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                        <IconSymbol name="person-outline" size={24} color={colors.blue} style={{ marginRight: 12 }} />
                        <View>
                          <Typography variant="h3" color={colors.text}>
                            Regular User
                          </Typography>
                          <Typography variant="body" color={colors.text} style={{ opacity: 0.7, fontSize: 12 }}>
                            Can access courses and take quizzes
                          </Typography>
                        </View>
                      </View>
                      {userToUpdate.role === 'user' && (
                        <IconSymbol name="checkmark-circle" size={24} color={colors.blue} />
                      )}
                    </View>
                  </TouchableOpacity>

                  <TouchableOpacity
                    onPress={() => handleRoleChange('admin')}
                    disabled={updatingRole || userToUpdate.role === 'admin'}
                    style={{
                      backgroundColor: userToUpdate.role === 'admin' ? `${colors.blue}15` : colors.screenBackground,
                      borderRadius: 8,
                      padding: 16,
                      borderWidth: 2,
                      borderColor: userToUpdate.role === 'admin' ? colors.blue : colors.grey,
                      opacity: updatingRole ? 0.6 : 1,
                    }}
                  >
                    <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
                      <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                        <IconSymbol name="shield-outline" size={24} color="#4CAF50" style={{ marginRight: 12 }} />
                        <View>
                          <Typography variant="h3" color={colors.text}>
                            Admin
                          </Typography>
                          <Typography variant="body" color={colors.text} style={{ opacity: 0.7, fontSize: 12 }}>
                            Can manage categories, subjects, and users
                          </Typography>
                        </View>
                      </View>
                      {userToUpdate.role === 'admin' && (
                        <IconSymbol name="checkmark-circle" size={24} color="#4CAF50" />
                      )}
                    </View>
                  </TouchableOpacity>
                </View>

                {updatingRole && (
                  <View style={{ alignItems: 'center', padding: 16 }}>
                    <ActivityIndicator size="small" color={colors.blue} />
                  </View>
                )}
              </>
            )}
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}

