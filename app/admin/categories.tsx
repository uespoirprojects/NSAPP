import { Typography } from '@/components/ui';
import { IconSymbol } from '@/components/ui/icon-symbol';
import { useThemeColors } from '@/hooks/use-theme-colors';
import {
    createCategory,
    deleteCategory,
    getCategories,
    updateCategory,
    type Category,
    type CategoryInput,
} from '@/services/adminService';
import { clearCache } from '@/services/subjectSyncService';
import React, { useEffect, useState } from 'react';
import {
    ActivityIndicator,
    Alert,
    Modal,
    ScrollView,
    TextInput,
    TouchableOpacity,
    View,
    useWindowDimensions,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function CategoriesScreen() {
  const colors = useThemeColors();
  const { width: windowWidth, height: windowHeight } = useWindowDimensions();
  const isWideLayout = windowWidth > windowHeight || windowWidth >= 900;
  const contentMaxWidth = Math.min(windowWidth * 0.9, 1200);

  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [modalVisible, setModalVisible] = useState(false);
  const [editingCategory, setEditingCategory] = useState<Category | null>(null);
  const [formData, setFormData] = useState<CategoryInput>({
    name: { fr: '', ht: '', en: '', es: '' },
    order: 0,
  });

  useEffect(() => {
    loadCategories();
  }, []);

  const loadCategories = async () => {
    try {
      setLoading(true);
      const data = await getCategories();
      setCategories(data);
    } catch (error) {
      console.error('Error loading categories:', error);
      Alert.alert('Error', 'Failed to load categories');
    } finally {
      setLoading(false);
    }
  };

  const openCreateModal = () => {
    setEditingCategory(null);
    setFormData({
      name: { fr: '', ht: '', en: '', es: '' },
      order: categories.length > 0 ? Math.max(...categories.map((c) => c.order)) + 1 : 1,
    });
    setModalVisible(true);
  };

  const openEditModal = (category: Category) => {
    setEditingCategory(category);
    setFormData({
      name: category.name,
      order: category.order,
    });
    setModalVisible(true);
  };

  const handleSave = async () => {
    try {
      if (!formData.name.fr.trim() || !formData.name.en.trim()) {
        Alert.alert('Validation Error', 'French and English names are required');
        return;
      }

      if (editingCategory) {
        await updateCategory(editingCategory.id, formData);
        Alert.alert('Success', 'Category updated successfully');
      } else {
        await createCategory(formData);
        Alert.alert('Success', 'Category created successfully');
      }

      // Clear cache so the app fetches fresh data
      await clearCache();

      setModalVisible(false);
      loadCategories();
    } catch (error: any) {
      Alert.alert('Error', error.message || 'Failed to save category');
    }
  };

  const handleDelete = (category: Category) => {
    Alert.alert(
      'Delete Category',
      `Are you sure you want to delete "${category.name.fr}"?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            try {
              await deleteCategory(category.id);
              // Clear cache so the app fetches fresh data
              await clearCache();
              Alert.alert('Success', 'Category deleted successfully');
              loadCategories();
            } catch (error: any) {
              Alert.alert('Error', error.message || 'Failed to delete category');
            }
          },
        },
      ]
    );
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
          {/* Header with Create Button */}
          <View
            style={{
              flexDirection: 'row',
              justifyContent: 'space-between',
              alignItems: 'center',
              marginBottom: 24,
            }}
          >
            <Typography variant="h2" color={colors.text} style={{ fontFamily: 'Poppins-SemiBold' }}>
              Categories ({categories.length})
            </Typography>
            <TouchableOpacity
              onPress={openCreateModal}
              style={{
                backgroundColor: colors.blue,
                paddingHorizontal: 20,
                paddingVertical: 10,
                borderRadius: 8,
                flexDirection: 'row',
                alignItems: 'center',
              }}
            >
              <IconSymbol name="add" size={20} color={colors.white} style={{ marginRight: 8 }} />
              <Typography variant="body" color={colors.white} style={{ fontFamily: 'Poppins-SemiBold' }}>
                Create
              </Typography>
            </TouchableOpacity>
          </View>

          {/* Categories List */}
          {loading ? (
            <View style={{ alignItems: 'center', padding: 40 }}>
              <ActivityIndicator size="large" color={colors.blue} />
            </View>
          ) : categories.length === 0 ? (
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
              <IconSymbol name="folder-outline" size={48} color={colors.grey} style={{ marginBottom: 16 }} />
              <Typography variant="h3" color={colors.text} style={{ marginBottom: 8 }}>
                No Categories
              </Typography>
              <Typography variant="body" color={colors.text} style={{ opacity: 0.7, textAlign: 'center' }}>
                Create your first category to get started
              </Typography>
            </View>
          ) : (
            categories.map((category) => (
              <View
                key={category.id}
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
                    <Typography variant="h3" color={colors.text} style={{ marginBottom: 8 }}>
                      {category.name.fr}
                    </Typography>
                    <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginBottom: 8 }}>
                      <Typography variant="body" color={colors.text} style={{ opacity: 0.7, fontSize: 12 }}>
                        FR: {category.name.fr}
                      </Typography>
                      <Typography variant="body" color={colors.text} style={{ opacity: 0.7, fontSize: 12 }}>
                        HT: {category.name.ht}
                      </Typography>
                      <Typography variant="body" color={colors.text} style={{ opacity: 0.7, fontSize: 12 }}>
                        EN: {category.name.en}
                      </Typography>
                      <Typography variant="body" color={colors.text} style={{ opacity: 0.7, fontSize: 12 }}>
                        ES: {category.name.es}
                      </Typography>
                    </View>
                    <Typography variant="body" color={colors.text} style={{ opacity: 0.7, fontSize: 12 }}>
                      Order: {category.order}
                    </Typography>
                  </View>
                  <View style={{ flexDirection: 'row', gap: 8 }}>
                    <TouchableOpacity
                      onPress={() => openEditModal(category)}
                      style={{
                        padding: 8,
                        borderRadius: 6,
                        backgroundColor: `${colors.blue}15`,
                      }}
                    >
                      <IconSymbol name="pencil" size={20} color={colors.blue} />
                    </TouchableOpacity>
                    <TouchableOpacity
                      onPress={() => handleDelete(category)}
                      style={{
                        padding: 8,
                        borderRadius: 6,
                        backgroundColor: `${colors.red}15`,
                      }}
                    >
                      <IconSymbol name="trash-outline" size={20} color={colors.red} />
                    </TouchableOpacity>
                  </View>
                </View>
              </View>
            ))
          )}
        </View>
      </ScrollView>

      {/* Create/Edit Modal */}
      <Modal
        visible={modalVisible}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setModalVisible(false)}
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
              maxHeight: '90%',
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
                {editingCategory ? 'Edit Category' : 'Create Category'}
              </Typography>
              <TouchableOpacity onPress={() => setModalVisible(false)}>
                <IconSymbol name="close" size={24} color={colors.text} />
              </TouchableOpacity>
            </View>

            <ScrollView showsVerticalScrollIndicator={false}>
              <View style={{ marginBottom: 16 }}>
                <Typography variant="body" color={colors.text} style={{ marginBottom: 8, fontFamily: 'Poppins-SemiBold' }}>
                  French Name *
                </Typography>
                <TextInput
                  value={formData.name.fr}
                  onChangeText={(text) => setFormData({ ...formData, name: { ...formData.name, fr: text } })}
                  placeholder="Nom en français"
                  placeholderTextColor={colors.grey}
                  style={{
                    backgroundColor: colors.screenBackground,
                    borderRadius: 8,
                    padding: 12,
                    borderWidth: 1,
                    borderColor: colors.grey,
                    color: colors.text,
                    fontFamily: 'Poppins-Regular',
                  }}
                />
              </View>

              <View style={{ marginBottom: 16 }}>
                <Typography variant="body" color={colors.text} style={{ marginBottom: 8, fontFamily: 'Poppins-SemiBold' }}>
                  Haitian Creole Name
                </Typography>
                <TextInput
                  value={formData.name.ht}
                  onChangeText={(text) => setFormData({ ...formData, name: { ...formData.name, ht: text } })}
                  placeholder="Non an kreyòl"
                  placeholderTextColor={colors.grey}
                  style={{
                    backgroundColor: colors.screenBackground,
                    borderRadius: 8,
                    padding: 12,
                    borderWidth: 1,
                    borderColor: colors.grey,
                    color: colors.text,
                    fontFamily: 'Poppins-Regular',
                  }}
                />
              </View>

              <View style={{ marginBottom: 16 }}>
                <Typography variant="body" color={colors.text} style={{ marginBottom: 8, fontFamily: 'Poppins-SemiBold' }}>
                  English Name *
                </Typography>
                <TextInput
                  value={formData.name.en}
                  onChangeText={(text) => setFormData({ ...formData, name: { ...formData.name, en: text } })}
                  placeholder="Name in English"
                  placeholderTextColor={colors.grey}
                  style={{
                    backgroundColor: colors.screenBackground,
                    borderRadius: 8,
                    padding: 12,
                    borderWidth: 1,
                    borderColor: colors.grey,
                    color: colors.text,
                    fontFamily: 'Poppins-Regular',
                  }}
                />
              </View>

              <View style={{ marginBottom: 16 }}>
                <Typography variant="body" color={colors.text} style={{ marginBottom: 8, fontFamily: 'Poppins-SemiBold' }}>
                  Spanish Name
                </Typography>
                <TextInput
                  value={formData.name.es}
                  onChangeText={(text) => setFormData({ ...formData, name: { ...formData.name, es: text } })}
                  placeholder="Nombre en español"
                  placeholderTextColor={colors.grey}
                  style={{
                    backgroundColor: colors.screenBackground,
                    borderRadius: 8,
                    padding: 12,
                    borderWidth: 1,
                    borderColor: colors.grey,
                    color: colors.text,
                    fontFamily: 'Poppins-Regular',
                  }}
                />
              </View>

              <View style={{ marginBottom: 24 }}>
                <Typography variant="body" color={colors.text} style={{ marginBottom: 8, fontFamily: 'Poppins-SemiBold' }}>
                  Order
                </Typography>
                <TextInput
                  value={formData.order.toString()}
                  onChangeText={(text) => {
                    const num = parseInt(text, 10);
                    if (!isNaN(num) || text === '') {
                      setFormData({ ...formData, order: text === '' ? 0 : num });
                    }
                  }}
                  placeholder="Order number"
                  placeholderTextColor={colors.grey}
                  keyboardType="numeric"
                  style={{
                    backgroundColor: colors.screenBackground,
                    borderRadius: 8,
                    padding: 12,
                    borderWidth: 1,
                    borderColor: colors.grey,
                    color: colors.text,
                    fontFamily: 'Poppins-Regular',
                  }}
                />
              </View>

              <TouchableOpacity
                onPress={handleSave}
                style={{
                  backgroundColor: colors.blue,
                  padding: 16,
                  borderRadius: 8,
                  alignItems: 'center',
                  marginTop: 8,
                }}
              >
                <Typography variant="body" color={colors.white} style={{ fontFamily: 'Poppins-SemiBold' }}>
                  {editingCategory ? 'Update Category' : 'Create Category'}
                </Typography>
              </TouchableOpacity>
            </ScrollView>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}

