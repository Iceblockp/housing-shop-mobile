import React, { useState, useEffect } from 'react';
import {
  StyleSheet,
  View,
  Text,
  TextInput,
  ScrollView,
  ActivityIndicator,
  Alert,
  Switch,
  Image,
  TouchableOpacity,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Header } from '@/components/shared/Header';
import { useAuth } from '@/lib/auth/auth-provider';
import { router, useLocalSearchParams } from 'expo-router';
import { colors } from '@/constants/colors';
import { fonts } from '@/constants/fonts';
import { Button } from '@/components/ui/Button';
import { useEvents, useUpdateEvent } from '@/hooks/use-events';
import { Image as ImageIcon } from 'lucide-react-native';
import { pickAndUploadImage } from '@/lib/utils';

export default function EditEventScreen() {
  const { isAdmin } = useAuth();
  const { id } = useLocalSearchParams<{ id: string }>();
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Form state
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [imageUrl, setImageUrl] = useState('');
  const [isActive, setIsActive] = useState(true);
  const [isUploading, setIsUploading] = useState(false);

  // Redirect if not admin
  useEffect(() => {
    if (!isAdmin) {
      router.replace('/');
    }
  }, [isAdmin]);

  // Fetch event data
  const { data, isLoading: isLoadingEvents } = useEvents();
  const event = data?.events.find((e) => e.id === id);

  // Update mutation
  const updateEvent = useUpdateEvent();

  // Set form values when event data is loaded
  useEffect(() => {
    if (event) {
      setTitle(event.title);
      setDescription(event.description || '');
      setImageUrl(event.imageUrl || '');
      setIsActive(event.isActive);
    }
  }, [event]);

  const handleSubmit = async () => {
    if (!title) {
      Alert.alert('Error', 'Please fill in all required fields');
      return;
    }

    try {
      setIsSubmitting(true);

      await updateEvent.mutateAsync({
        id: id || '',
        data: {
          title,
          description: description || undefined,
          imageUrl: imageUrl || undefined,
          isActive,
        },
      });

      Alert.alert('Success', 'Event updated successfully', [
        { text: 'OK', onPress: () => router.back() },
      ]);
    } catch (error) {
      console.error('Error updating event:', error);
      Alert.alert('Error', 'Failed to update event');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!isAdmin) {
    return null;
  }

  if (isLoadingEvents || !event) {
    return (
      <SafeAreaView style={styles.container}>
        <Header title="Edit Event" showBack />
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={colors.primary} />
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <Header title="Edit Event" showBack />

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.contentContainer}
      >
        <View style={styles.formGroup}>
          <Text style={styles.label}>Title *</Text>
          <TextInput
            style={styles.input}
            value={title}
            onChangeText={setTitle}
            placeholder="Event title"
            placeholderTextColor="#94A3B8"
          />
        </View>

        <View style={styles.formGroup}>
          <Text style={styles.label}>Description</Text>
          <TextInput
            style={[styles.input, styles.textArea]}
            value={description}
            onChangeText={setDescription}
            placeholder="Event description"
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
            onPress={() => {
              pickAndUploadImage(setIsUploading, setImageUrl, [16, 9]);
            }}
            disabled={isUploading}
          >
            {isUploading ? (
              <View style={styles.loadingContainer}>
                <ActivityIndicator size="large" color={colors.primary} />
                <Text style={styles.loadingText}>Uploading...</Text>
              </View>
            ) : imageUrl ? (
              <Image source={{ uri: imageUrl }} style={styles.previewImage} />
            ) : (
              <View style={styles.imagePlaceholder}>
                <ImageIcon size={24} color="#94A3B8" />
                <Text style={styles.imagePlaceholderText}>Select an image</Text>
              </View>
            )}
          </TouchableOpacity>
        </View>

        <View style={styles.formGroup}>
          <Text style={styles.label}>Active</Text>
          <Switch
            value={isActive}
            onValueChange={setIsActive}
            trackColor={{ false: '#CBD5E1', true: colors.primaryLight }}
            thumbColor={isActive ? colors.primary : '#F1F5F9'}
          />
        </View>

        <Button
          variant="primary"
          onPress={handleSubmit}
          style={styles.submitButton}
          disabled={isSubmitting || isUploading}
        >
          {isSubmitting
            ? 'Updating...'
            : isUploading
            ? 'Uploading Image...'
            : 'Update Event'}
        </Button>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 8,
    color: colors.primary,
    fontSize: 14,
    fontFamily: fonts.medium,
  },
  scrollView: {
    flex: 1,
  },
  contentContainer: {
    padding: 16,
  },
  formGroup: {
    marginBottom: 16,
  },
  label: {
    fontSize: 16,
    fontFamily: fonts.medium,
    color: '#334155',
    marginBottom: 8,
  },
  input: {
    borderWidth: 1,
    borderColor: '#E2E8F0',
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    color: '#334155',
    backgroundColor: '#F8FAFC',
  },
  textArea: {
    height: 100,
    textAlignVertical: 'top',
  },
  imagePickerButton: {
    borderWidth: 1,
    borderColor: '#E2E8F0',
    borderRadius: 8,
    backgroundColor: '#F8FAFC',
    height: 200,
    justifyContent: 'center',
    alignItems: 'center',
    overflow: 'hidden',
  },
  previewImage: {
    width: '100%',
    height: '100%',
    resizeMode: 'cover',
  },
  imagePlaceholder: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  imagePlaceholderText: {
    marginTop: 8,
    color: '#94A3B8',
    fontSize: 14,
  },
  submitButton: {
    marginTop: 24,
    marginBottom: 40,
  },
});
