import React, { useState, useEffect } from 'react';
import Modal from 'react-native-modal';
import {
  StyleSheet,
  View,
  Text,
  FlatList,
  TouchableOpacity,
  TextInput,
  ActivityIndicator,
  RefreshControl,
  Alert,
  Image,
} from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import { Image as ImageIcon } from 'lucide-react-native';
import { pickAndUploadImage } from '@/lib/utils';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Header } from '@/components/shared/Header';
import { useAuth } from '@/lib/auth/auth-provider';
import { router } from 'expo-router';
import { colors } from '@/constants/colors';
import { fonts } from '@/constants/fonts';
import { Search, Plus, Edit2, Trash2 } from 'lucide-react-native';
import { Button } from '@/components/ui/Button';
import {
  useCategories,
  useDeleteCategory,
  useCreateCategory,
  useUpdateCategory,
} from '@/hooks/use-categories';
import { Category } from '@/types';

// Import the categories hook
// This is a placeholder - you'll need to implement this hook

export default function AdminCategoriesScreen() {
  const { isAdmin } = useAuth();
  const [searchQuery, setSearchQuery] = useState('');
  const [refreshing, setRefreshing] = useState(false);
  const [isCreateModalVisible, setIsCreateModalVisible] = useState(false);
  const [isEditModalVisible, setIsEditModalVisible] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<Category | null>(
    null
  );

  // Redirect if not admin
  useEffect(() => {
    if (!isAdmin) {
      router.replace('/');
    }
  }, [isAdmin]);

  // This is a placeholder - you'll need to implement the hook
  const { data: categories, isLoading, refetch } = useCategories();

  const filteredCategories =
    categories?.filter((category) =>
      category.name.toLowerCase().includes(searchQuery.toLowerCase())
    ) || [];

  const handleRefresh = async () => {
    setRefreshing(true);
    await refetch();
    setRefreshing(false);
  };

  const createCategory = useCreateCategory();
  const updateCategory = useUpdateCategory();

  const handleAddCategory = () => {
    // Using a modal approach instead of navigation
    setIsCreateModalVisible(true);
  };

  const handleCreateCategory = async (data: {
    name: string;
    description?: string;
    imageUrl?: string;
  }) => {
    try {
      await createCategory.mutateAsync(data);
      setIsCreateModalVisible(false);
      Alert.alert('Success', 'Category created successfully');
      refetch();
    } catch (error) {
      console.error('Error creating category:', error);
      Alert.alert('Error', 'Failed to create category');
    }
  };

  const handleUpdateCategory = async (data: {
    name: string;
    description?: string;
    imageUrl?: string;
  }) => {
    if (!selectedCategory) return;

    try {
      await updateCategory.mutateAsync({
        id: selectedCategory.id,
        data,
      });
      setIsEditModalVisible(false);
      setSelectedCategory(null);
      Alert.alert('Success', 'Category updated successfully');
      refetch();
    } catch (error) {
      console.error('Error updating category:', error);
      Alert.alert('Error', 'Failed to update category');
    }
  };

  const handleEditCategory = (category: Category) => {
    setSelectedCategory(category);
    setIsEditModalVisible(true);
  };

  const deleteCategory = useDeleteCategory();

  const handleDeleteCategory = (categoryId: string, categoryName: string) => {
    Alert.alert(
      'Delete Category',
      `Are you sure you want to delete ${categoryName}?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            try {
              await deleteCategory.mutateAsync(categoryId);
              Alert.alert('Success', 'Category deleted successfully');
              refetch();
            } catch (error) {
              console.error('Error deleting category:', error);
              Alert.alert('Error', 'Failed to delete category');
            }
          },
        },
      ]
    );
  };

  const renderCategoryItem = ({ item }: { item: Category }) => (
    <View style={styles.categoryItem}>
      <View style={styles.categoryImageContainer}>
        {item.imageUrl ? (
          <Image
            source={{ uri: item.imageUrl }}
            style={styles.categoryImage}
            resizeMode="cover"
          />
        ) : (
          <View style={[styles.categoryImage, styles.placeholderImage]} />
        )}
      </View>
      <View style={styles.categoryInfo}>
        <Text style={styles.categoryName} numberOfLines={1}>
          {item.name}
        </Text>
        {item.description && (
          <Text style={styles.categoryDescription} numberOfLines={2}>
            {item.description}
          </Text>
        )}
      </View>
      <View style={styles.actionButtons}>
        <TouchableOpacity
          style={[styles.actionButton, styles.editButton]}
          onPress={() => handleEditCategory(item)}
        >
          <Edit2 size={16} color="#fff" />
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.actionButton, styles.deleteButton]}
          onPress={() => handleDeleteCategory(item.id, item.name)}
        >
          <Trash2 size={16} color="#fff" />
        </TouchableOpacity>
      </View>
    </View>
  );

  if (!isAdmin) {
    return null;
  }

  return (
    <SafeAreaView style={styles.container}>
      <Header title="Category Management" showBack />

      <View style={styles.searchContainer}>
        <View style={styles.searchInputContainer}>
          <Search size={20} color="#94A3B8" style={styles.searchIcon} />
          <TextInput
            style={styles.searchInput}
            placeholder="Search categories..."
            value={searchQuery}
            onChangeText={setSearchQuery}
            placeholderTextColor="#94A3B8"
          />
        </View>
      </View>

      <View style={styles.headerContainer}>
        <Text style={styles.headerTitle}>
          Categories ({filteredCategories.length})
        </Text>
        <Button
          variant="primary"
          onPress={handleAddCategory}
          style={styles.addButton}
          leftIcon={<Plus size={16} color="#fff" />}
        >
          Add New
        </Button>
      </View>

      <FlatList
        data={filteredCategories}
        renderItem={renderCategoryItem}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.listContainer}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={handleRefresh} />
        }
        ListEmptyComponent={
          !isLoading ? (
            <View style={styles.emptyContainer}>
              <Text style={styles.emptyText}>No categories found</Text>
              <Text style={styles.emptySubtext}>
                Add a new category or change your search criteria
              </Text>
            </View>
          ) : (
            <ActivityIndicator
              size="large"
              color={colors.primary}
              style={styles.loader}
            />
          )
        }
      />

      {/* Create Category Modal */}
      {isCreateModalVisible && (
        <CategoryFormModal
          isVisible={isCreateModalVisible}
          onClose={() => setIsCreateModalVisible(false)}
          onSubmit={handleCreateCategory}
          title="Add New Category"
        />
      )}

      {/* Edit Category Modal */}
      {isEditModalVisible && selectedCategory && (
        <CategoryFormModal
          isVisible={isEditModalVisible}
          onClose={() => setIsEditModalVisible(false)}
          onSubmit={handleUpdateCategory}
          title="Edit Category"
          initialValues={selectedCategory}
        />
      )}
    </SafeAreaView>
  );
}

// Category Form Modal Component
interface CategoryFormModalProps {
  isVisible: boolean;
  onClose: () => void;
  onSubmit: (data: {
    name: string;
    description?: string;
    imageUrl?: string;
  }) => void;
  title: string;
  initialValues?: Category;
}

function CategoryFormModal({
  isVisible,
  onClose,
  onSubmit,
  title,
  initialValues,
}: CategoryFormModalProps) {
  const [name, setName] = useState(initialValues?.name || '');
  const [description, setDescription] = useState(
    initialValues?.description || ''
  );
  const [imageUrl, setImageUrl] = useState(initialValues?.imageUrl || '');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isUploading, setIsUploading] = useState(false);

  useEffect(() => {
    if (initialValues) {
      setName(initialValues.name);
      setDescription(initialValues.description || '');
      setImageUrl(initialValues.imageUrl || '');
    }
  }, [initialValues]);

  const handleSubmit = async () => {
    if (!name) {
      Alert.alert('Error', 'Name is required');
      return;
    }

    try {
      setIsSubmitting(true);

      await onSubmit({
        name,
        description: description || '',
        imageUrl: imageUrl || '',
      });
    } catch (error) {
      console.error('Error submitting category:', error);
      Alert.alert('Error', 'Failed to save category');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Modal
      isVisible={isVisible}
      onBackdropPress={onClose}
      onBackButtonPress={onClose}
      avoidKeyboard
      style={styles.modal}
    >
      <View style={styles.modalContent}>
        <Text style={styles.modalTitle}>{title}</Text>

        <View style={styles.formGroup}>
          <Text style={styles.label}>Name *</Text>
          <TextInput
            style={styles.input}
            value={name}
            onChangeText={setName}
            placeholder="Category name"
            placeholderTextColor="#94A3B8"
          />
        </View>

        <View style={styles.formGroup}>
          <Text style={styles.label}>Description</Text>
          <TextInput
            style={[styles.input, styles.textArea]}
            value={description}
            onChangeText={setDescription}
            placeholder="Category description"
            placeholderTextColor="#94A3B8"
            multiline
            numberOfLines={4}
            textAlignVertical="top"
          />
        </View>

        <View style={styles.formGroup}>
          <Text style={styles.label}>Image</Text>
          <TouchableOpacity
            style={styles.imagePickerButton}
            onPress={() =>
              pickAndUploadImage(setIsUploading, setImageUrl, [4, 3])
            }
            disabled={isUploading}
          >
            {imageUrl ? (
              <Image source={{ uri: imageUrl }} style={styles.previewImage} />
            ) : (
              <View style={styles.imagePlaceholder}>
                <ImageIcon size={24} color="#94A3B8" />
                <Text style={styles.imagePlaceholderText}>Select an image</Text>
              </View>
            )}
            {isUploading && (
              <View style={styles.uploadingOverlay}>
                <ActivityIndicator size="large" color={colors.primary} />
                <Text style={styles.uploadingText}>Uploading...</Text>
              </View>
            )}
          </TouchableOpacity>
        </View>

        <View style={styles.modalActions}>
          <Button
            variant="outline"
            onPress={onClose}
            style={styles.modalButton}
          >
            Cancel
          </Button>
          <Button
            variant="primary"
            onPress={handleSubmit}
            style={styles.modalButton}
            disabled={isSubmitting || isUploading}
          >
            {isSubmitting
              ? 'Saving...'
              : isUploading
              ? 'Uploading Image...'
              : 'Save'}
          </Button>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  searchContainer: {
    flexDirection: 'row',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#F1F5F9',
  },
  searchInputContainer: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F1F5F9',
    borderRadius: 8,
    paddingHorizontal: 12,
  },
  imagePickerButton: {
    width: '100%',
    height: 150,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
    overflow: 'hidden',
  },
  previewImage: {
    width: '100%',
    height: '100%',
  },
  imagePlaceholder: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  imagePlaceholderText: {
    marginTop: 8,
    color: '#94A3B8',
    fontSize: 14,
    fontFamily: fonts.regular,
  },
  uploadingOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  uploadingText: {
    color: '#FFFFFF',
    marginTop: 10,
    fontSize: 14,
    fontFamily: fonts.medium,
  },
  searchIcon: {
    marginRight: 8,
  },
  searchInput: {
    flex: 1,
    height: 40,
    fontFamily: fonts.regular,
    fontSize: 14,
    color: '#1E293B',
  },
  headerContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  headerTitle: {
    fontFamily: fonts.bold,
    fontSize: 16,
    color: '#1E293B',
  },
  addButton: {
    height: 36,
    paddingHorizontal: 12,
  },
  listContainer: {
    paddingHorizontal: 16,
    paddingBottom: 16,
  },
  categoryItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 16,
    backgroundColor: '#FFFFFF',
    borderRadius: 8,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: '#F1F5F9',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 2,
  },
  categoryImageContainer: {
    marginRight: 12,
  },
  categoryImage: {
    width: 50,
    height: 50,
    borderRadius: 8,
  },
  placeholderImage: {
    backgroundColor: '#F1F5F9',
  },
  categoryInfo: {
    flex: 1,
    marginRight: 8,
  },
  categoryName: {
    fontFamily: fonts.medium,
    fontSize: 16,
    color: '#1E293B',
    marginBottom: 4,
  },
  categoryDescription: {
    fontFamily: fonts.regular,
    fontSize: 12,
    color: '#64748B',
  },
  actionButtons: {
    flexDirection: 'row',
  },
  actionButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: 8,
  },
  editButton: {
    backgroundColor: colors.primary,
  },
  deleteButton: {
    backgroundColor: '#EF4444',
  },
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 32,
  },
  emptyText: {
    fontFamily: fonts.medium,
    fontSize: 16,
    color: '#1E293B',
    marginBottom: 8,
  },
  emptySubtext: {
    fontFamily: fonts.regular,
    fontSize: 14,
    color: '#64748B',
    textAlign: 'center',
  },
  loader: {
    marginTop: 32,
  },
  // Modal styles
  modal: {
    margin: 0,
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: '#FFFFFF',
    borderTopLeftRadius: 16,
    borderTopRightRadius: 16,
    padding: 20,
    maxHeight: '80%',
  },
  modalTitle: {
    fontFamily: fonts.bold,
    fontSize: 18,
    color: '#1E293B',
    marginBottom: 16,
  },
  formGroup: {
    marginBottom: 16,
  },
  label: {
    fontFamily: fonts.medium,
    fontSize: 14,
    color: '#1E293B',
    marginBottom: 8,
  },
  input: {
    height: 48,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    borderRadius: 8,
    paddingHorizontal: 12,
    fontFamily: fonts.regular,
    fontSize: 14,
    color: '#1E293B',
  },
  textArea: {
    height: 100,
    paddingTop: 12,
    paddingBottom: 12,
    textAlignVertical: 'top',
  },
  modalActions: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    marginTop: 16,
  },
  modalButton: {
    minWidth: 100,
    marginLeft: 12,
  },
});
