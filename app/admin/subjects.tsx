import { Typography } from '@/components/ui';
import { IconSymbol } from '@/components/ui/icon-symbol';
import { useThemeColors } from '@/hooks/use-theme-colors';
import {
    createSubject,
    deleteSubject,
    getCategories,
    getSubjects,
    updateSubject,
    type Category,
    type Subject,
    type SubjectInput
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

export default function SubjectsScreen() {
  const colors = useThemeColors();
  const { width: windowWidth, height: windowHeight } = useWindowDimensions();
  const isWideLayout = windowWidth > windowHeight || windowWidth >= 900;
  const contentMaxWidth = Math.min(windowWidth * 0.9, 1200);

  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [deletingSubjectId, setDeletingSubjectId] = useState<string | null>(null);
  const [modalVisible, setModalVisible] = useState(false);
  const [deleteModalVisible, setDeleteModalVisible] = useState(false);
  const [subjectToDelete, setSubjectToDelete] = useState<Subject | null>(null);
  const [editingSubject, setEditingSubject] = useState<Subject | null>(null);
  const [formData, setFormData] = useState<SubjectInput>({
    categoryId: '',
    playlistId: '',
    quizSlug: '',
    title: { fr: '', ht: '', en: '', es: '' },
    description: { fr: '', ht: '', en: '', es: '' },
    order: 0,
  });

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      const [subjectsData, categoriesData] = await Promise.all([
        getSubjects(),
        getCategories(),
      ]);
      setSubjects(subjectsData);
      setCategories(categoriesData);
    } catch (error) {
      console.error('Error loading data:', error);
      Alert.alert('Error', 'Failed to load data');
    } finally {
      setLoading(false);
    }
  };

  const openCreateModal = () => {
    setEditingSubject(null);
    const maxOrder = subjects.length > 0 ? Math.max(...subjects.map((s) => s.order)) + 1 : 1;
    setFormData({
      categoryId: categories.length > 0 ? categories[0].id : '',
      playlistId: '',
      quizSlug: '',
      title: { fr: '', ht: '', en: '', es: '' },
      description: { fr: '', ht: '', en: '', es: '' },
      order: maxOrder,
    });
    setModalVisible(true);
  };

  const openEditModal = (subject: Subject) => {
    setEditingSubject(subject);
    setFormData({
      categoryId: subject.categoryId,
      playlistId: subject.playlistId,
      quizSlug: subject.quizSlug,
      title: subject.title,
      description: subject.description || { fr: '', ht: '', en: '', es: '' },
      order: subject.order,
    });
    setModalVisible(true);
  };

  const handleSave = async () => {
    try {
      // Validation
      if (!formData.categoryId) {
        Alert.alert('Validation Error', 'Please select a category');
        return;
      }

      if (!formData.playlistId.trim()) {
        Alert.alert('Validation Error', 'Playlist ID is required');
        return;
      }

      if (!formData.quizSlug.trim()) {
        Alert.alert('Validation Error', 'Quiz slug is required');
        return;
      }

      if (!formData.title.fr.trim() || !formData.title.en.trim()) {
        Alert.alert('Validation Error', 'French and English titles are required');
        return;
      }

      if (editingSubject) {
        await updateSubject(editingSubject.id, formData);
        Alert.alert('Success', 'Subject updated successfully');
      } else {
        await createSubject(formData);
        Alert.alert('Success', 'Subject created successfully');
      }

      // Clear cache so the app fetches fresh data
      await clearCache();

      setModalVisible(false);
      loadData();
    } catch (error: any) {
      Alert.alert('Error', error.message || 'Failed to save subject');
    }
  };

  const handleDelete = (subject: Subject) => {
    if (deletingSubjectId) {
      // Prevent multiple delete operations
      console.log('[admin/subjects] Delete already in progress');
      return;
    }

    console.log('[admin/subjects] Delete button clicked for subject:', subject.id);
    setSubjectToDelete(subject);
    setDeleteModalVisible(true);
  };

  const confirmDelete = async () => {
    if (!subjectToDelete) {
      return;
    }

    try {
      setDeletingSubjectId(subjectToDelete.id);
      setDeleteModalVisible(false);
      console.log('[admin/subjects] Starting deletion for subject:', subjectToDelete.id);
      
      await deleteSubject(subjectToDelete.id);
      console.log('[admin/subjects] Subject deleted from Firestore');
      
      // Clear cache so the app fetches fresh data
      await clearCache();
      console.log('[admin/subjects] Cache cleared');
      
      Alert.alert('Success', 'Subject deleted successfully');
      console.log('[admin/subjects] Reloading data...');
      await loadData();
      console.log('[admin/subjects] Data reloaded');
      setSubjectToDelete(null);
    } catch (error: any) {
      console.error('[admin/subjects] Delete error:', error);
      console.error('[admin/subjects] Error details:', JSON.stringify(error, null, 2));
      Alert.alert('Error', error.message || 'Failed to delete subject');
      setSubjectToDelete(null);
    } finally {
      setDeletingSubjectId(null);
      console.log('[admin/subjects] Delete operation completed');
    }
  };

  const cancelDelete = () => {
    console.log('[admin/subjects] Delete cancelled by user');
    setDeleteModalVisible(false);
    setSubjectToDelete(null);
  };

  const getCategoryName = (categoryId: string) => {
    const category = categories.find((c) => c.id === categoryId);
    return category ? category.name.fr : 'Unknown';
  };

  const subjectsByCategory = categories.map((category) => ({
    category,
    subjects: subjects.filter((s) => s.categoryId === category.id),
  }));

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
              Subjects ({subjects.length})
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

          {/* Subjects List by Category */}
          {loading ? (
            <View style={{ alignItems: 'center', padding: 40 }}>
              <ActivityIndicator size="large" color={colors.blue} />
            </View>
          ) : subjects.length === 0 ? (
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
              <IconSymbol name="book-outline" size={48} color={colors.grey} style={{ marginBottom: 16 }} />
              <Typography variant="h3" color={colors.text} style={{ marginBottom: 8 }}>
                No Subjects
              </Typography>
              <Typography variant="body" color={colors.text} style={{ opacity: 0.7, textAlign: 'center' }}>
                Create your first subject to get started
              </Typography>
            </View>
          ) : (
            subjectsByCategory.map(({ category, subjects: categorySubjects }) => (
              <View key={category.id} style={{ marginBottom: 32 }}>
                <View
                  style={{
                    flexDirection: 'row',
                    alignItems: 'center',
                    marginBottom: 16,
                  }}
                >
                  <IconSymbol name="folder" size={24} color={colors.blue} style={{ marginRight: 8 }} />
                  <Typography variant="h2" color={colors.text} style={{ fontFamily: 'Poppins-SemiBold' }}>
                    {category.name.fr} ({categorySubjects.length})
                  </Typography>
                </View>

                {categorySubjects.length === 0 ? (
                  <View
                    style={{
                      backgroundColor: colors.cardBackground,
                      borderRadius: 12,
                      padding: 20,
                      borderWidth: 1,
                      borderColor: colors.grey,
                    }}
                  >
                    <Typography variant="body" color={colors.text} style={{ opacity: 0.7, textAlign: 'center' }}>
                      No subjects in this category
                    </Typography>
                  </View>
                ) : (
                  categorySubjects.map((subject) => (
                    <View
                      key={subject.id}
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
                            {subject.title.fr}
                          </Typography>
                          <View style={{ marginBottom: 8 }}>
                            <Typography variant="body" color={colors.text} style={{ opacity: 0.7, fontSize: 12, marginBottom: 4 }}>
                              Playlist ID: {subject.playlistId}
                            </Typography>
                            <Typography variant="body" color={colors.text} style={{ opacity: 0.7, fontSize: 12, marginBottom: 4 }}>
                              Quiz Slug: {subject.quizSlug}
                            </Typography>
                            <Typography variant="body" color={colors.text} style={{ opacity: 0.7, fontSize: 12 }}>
                              Order: {subject.order}
                            </Typography>
                          </View>
                          {subject.description?.fr && (
                            <Typography variant="body" color={colors.text} style={{ opacity: 0.8, fontSize: 12, marginTop: 4 }}>
                              {subject.description.fr}
                            </Typography>
                          )}
                        </View>
                        <View style={{ flexDirection: 'row', gap: 8 }}>
                          <TouchableOpacity
                            onPress={() => openEditModal(subject)}
                            style={{
                              padding: 8,
                              borderRadius: 6,
                              backgroundColor: `${colors.blue}15`,
                            }}
                          >
                            <IconSymbol name="pencil" size={20} color={colors.blue} />
                          </TouchableOpacity>
                          <TouchableOpacity
                            onPress={() => {
                              console.log('[admin/subjects] Delete button pressed for:', subject.id);
                              handleDelete(subject);
                            }}
                            disabled={deletingSubjectId === subject.id || loading}
                            activeOpacity={0.7}
                            style={{
                              padding: 8,
                              borderRadius: 6,
                              backgroundColor: `${colors.red}15`,
                              opacity: (deletingSubjectId === subject.id || loading) ? 0.5 : 1,
                            }}
                          >
                            {deletingSubjectId === subject.id ? (
                              <ActivityIndicator size="small" color={colors.red} />
                            ) : (
                              <IconSymbol name="trash-outline" size={20} color={colors.red} />
                            )}
                          </TouchableOpacity>
                        </View>
                      </View>
                    </View>
                  ))
                )}
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
                {editingSubject ? 'Edit Subject' : 'Create Subject'}
              </Typography>
              <TouchableOpacity onPress={() => setModalVisible(false)}>
                <IconSymbol name="close" size={24} color={colors.text} />
              </TouchableOpacity>
            </View>

            <ScrollView showsVerticalScrollIndicator={false}>
              {/* Category Selection */}
              <View style={{ marginBottom: 16 }}>
                <Typography variant="body" color={colors.text} style={{ marginBottom: 8, fontFamily: 'Poppins-SemiBold' }}>
                  Category *
                </Typography>
                <View
                  style={{
                    backgroundColor: colors.screenBackground,
                    borderRadius: 8,
                    borderWidth: 1,
                    borderColor: colors.grey,
                    padding: 12,
                  }}
                >
                  {categories.length === 0 ? (
                    <Typography variant="body" color={colors.grey}>
                      No categories available. Please create a category first.
                    </Typography>
                  ) : (
                    <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                      {categories.map((category) => (
                        <TouchableOpacity
                          key={category.id}
                          onPress={() => setFormData({ ...formData, categoryId: category.id })}
                          style={{
                            paddingHorizontal: 16,
                            paddingVertical: 8,
                            borderRadius: 6,
                            marginRight: 8,
                            backgroundColor:
                              formData.categoryId === category.id ? colors.blue : 'transparent',
                            borderWidth: 1,
                            borderColor: formData.categoryId === category.id ? colors.blue : colors.grey,
                          }}
                        >
                          <Typography
                            variant="body"
                            color={formData.categoryId === category.id ? colors.white : colors.text}
                            style={{ fontFamily: 'Poppins-SemiBold' }}
                          >
                            {category.name.fr}
                          </Typography>
                        </TouchableOpacity>
                      ))}
                    </ScrollView>
                  )}
                </View>
              </View>

              {/* Playlist ID */}
              <View style={{ marginBottom: 16 }}>
                <Typography variant="body" color={colors.text} style={{ marginBottom: 8, fontFamily: 'Poppins-SemiBold' }}>
                  YouTube Playlist ID * (Required)
                </Typography>
                <TextInput
                  value={formData.playlistId}
                  onChangeText={(text) => setFormData({ ...formData, playlistId: text })}
                  placeholder="PLClySGDbKZTRzwF7LI8paxadsacTVuV9r"
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

              {/* Quiz Slug */}
              <View style={{ marginBottom: 16 }}>
                <Typography variant="body" color={colors.text} style={{ marginBottom: 8, fontFamily: 'Poppins-SemiBold' }}>
                  Quiz Slug *
                </Typography>
                <TextInput
                  value={formData.quizSlug}
                  onChangeText={(text) => setFormData({ ...formData, quizSlug: text.toLowerCase().replace(/\s+/g, '-') })}
                  placeholder="excel, word, basic-computer"
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

              {/* Titles */}
              <View style={{ marginBottom: 16 }}>
                <Typography variant="body" color={colors.text} style={{ marginBottom: 8, fontFamily: 'Poppins-SemiBold' }}>
                  French Title *
                </Typography>
                <TextInput
                  value={formData.title.fr}
                  onChangeText={(text) => setFormData({ ...formData, title: { ...formData.title, fr: text } })}
                  placeholder="Titre en français"
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
                  Haitian Creole Title
                </Typography>
                <TextInput
                  value={formData.title.ht}
                  onChangeText={(text) => setFormData({ ...formData, title: { ...formData.title, ht: text } })}
                  placeholder="Tit an kreyòl"
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
                  English Title *
                </Typography>
                <TextInput
                  value={formData.title.en}
                  onChangeText={(text) => setFormData({ ...formData, title: { ...formData.title, en: text } })}
                  placeholder="Title in English"
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
                  Spanish Title
                </Typography>
                <TextInput
                  value={formData.title.es}
                  onChangeText={(text) => setFormData({ ...formData, title: { ...formData.title, es: text } })}
                  placeholder="Título en español"
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

              {/* Descriptions */}
              <View style={{ marginBottom: 16 }}>
                <Typography variant="body" color={colors.text} style={{ marginBottom: 8, fontFamily: 'Poppins-SemiBold' }}>
                  French Description
                </Typography>
                <TextInput
                  value={formData.description?.fr || ''}
                  onChangeText={(text) =>
                    setFormData({
                      ...formData,
                      description: { ...(formData.description || { fr: '', ht: '', en: '', es: '' }), fr: text },
                    })
                  }
                  placeholder="Description en français"
                  placeholderTextColor={colors.grey}
                  multiline
                  numberOfLines={3}
                  style={{
                    backgroundColor: colors.screenBackground,
                    borderRadius: 8,
                    padding: 12,
                    borderWidth: 1,
                    borderColor: colors.grey,
                    color: colors.text,
                    fontFamily: 'Poppins-Regular',
                    minHeight: 80,
                  }}
                />
              </View>

              {/* Order */}
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
                  {editingSubject ? 'Update Subject' : 'Create Subject'}
                </Typography>
              </TouchableOpacity>
            </ScrollView>
          </View>
        </View>
      </Modal>

      {/* Delete Confirmation Modal */}
      <Modal
        visible={deleteModalVisible}
        transparent
        animationType="fade"
        onRequestClose={cancelDelete}
      >
        <View style={{ flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'center', alignItems: 'center', padding: 20 }}>
          <View style={{ backgroundColor: colors.cardBackground, borderRadius: 20, padding: 24, width: '100%', maxWidth: 400 }}>
            <Typography variant="h2" color={colors.text} style={{ marginBottom: 12, textAlign: 'center' }}>
              Delete Subject
            </Typography>
            <Typography variant="body" color={colors.text} style={{ marginBottom: 24, textAlign: 'center', opacity: 0.8 }}>
              Are you sure you want to delete "{subjectToDelete?.title.fr}"? This action cannot be undone.
            </Typography>
            <View style={{ flexDirection: 'row', gap: 12 }}>
              <TouchableOpacity
                style={{
                  flex: 1,
                  backgroundColor: colors.grey,
                  borderRadius: 12,
                  padding: 16,
                  alignItems: 'center',
                }}
                onPress={cancelDelete}
              >
                <Typography variant="body" color={colors.text} style={{ fontFamily: 'Poppins-SemiBold' }}>
                  Cancel
                </Typography>
              </TouchableOpacity>
              <TouchableOpacity
                style={{
                  flex: 1,
                  backgroundColor: colors.red,
                  borderRadius: 12,
                  padding: 16,
                  alignItems: 'center',
                }}
                onPress={confirmDelete}
                disabled={deletingSubjectId !== null}
              >
                {deletingSubjectId ? (
                  <ActivityIndicator size="small" color={colors.white} />
                ) : (
                  <Typography variant="body" color={colors.white} style={{ fontFamily: 'Poppins-SemiBold' }}>
                    Delete
                  </Typography>
                )}
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}

