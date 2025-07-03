import React, { useState, useEffect } from 'react';
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
  Switch,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Header } from '@/components/shared/Header';
import { useAuth } from '@/lib/auth/auth-provider';
import { router } from 'expo-router';
import { colors } from '@/constants/colors';
import { fonts } from '@/constants/fonts';
import { Search, Plus, Edit2, Trash2, Calendar } from 'lucide-react-native';
import { Button } from '@/components/ui/Button';
import { useEvents, useUpdateEvent, useDeleteEvent } from '@/hooks/use-events';
import { format, parseISO } from 'date-fns';

export default function AdminEventsScreen() {
  const { isAdmin } = useAuth();
  const [searchQuery, setSearchQuery] = useState('');
  const [refreshing, setRefreshing] = useState(false);

  // Redirect if not admin
  useEffect(() => {
    if (!isAdmin) {
      router.replace('/');
    }
  }, [isAdmin]);

  const { data, isLoading, refetch } = useEvents();

  const events = data?.events || [];

  const filteredEvents = events.filter((event) =>
    event.title.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleRefresh = async () => {
    setRefreshing(true);
    await refetch();
    setRefreshing(false);
  };

  const handleAddEvent = () => {
    router.push('/admin/events/new' as any);
  };

  const handleEditEvent = (eventId: string) => {
    router.push(`/admin/events/${eventId}` as any);
  };

  const { mutateAsync: deleteEvent } = useDeleteEvent();

  const handleDeleteEvent = (eventId: string, eventTitle: string) => {
    Alert.alert(
      'Delete Event',
      `Are you sure you want to delete ${eventTitle}?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            try {
              await deleteEvent(eventId);
              Alert.alert('Success', 'Event deleted successfully');
              refetch();
            } catch (error) {
              console.error('Error deleting event:', error);
              Alert.alert('Error', 'Failed to delete event');
            }
          },
        },
      ]
    );
  };

  const { mutateAsync: updateEvent } = useUpdateEvent();

  const handleToggleActive = async (eventId: string, isActive: boolean) => {
    try {
      await updateEvent({
        id: eventId,
        data: { isActive: !isActive },
      });
      Alert.alert(
        'Success',
        `Event ${isActive ? 'deactivated' : 'activated'} successfully`
      );
      refetch();
    } catch (error) {
      console.error('Error updating event status:', error);
      Alert.alert('Error', 'Failed to update event status');
    }
  };

  const formatDate = (dateString: string) => {
    try {
      return format(parseISO(dateString), 'MMM dd, yyyy');
    } catch (error) {
      return dateString;
    }
  };

  const renderEventItem = ({ item }: { item: any }) => (
    <View style={styles.eventItem}>
      <View style={styles.eventImageContainer}>
        {item.imageUrl ? (
          <Image
            source={{ uri: item.imageUrl }}
            style={styles.eventImage}
            resizeMode="cover"
          />
        ) : (
          <View style={[styles.eventImage, styles.placeholderImage]}>
            <Calendar size={24} color="#94A3B8" />
          </View>
        )}
      </View>
      <View style={styles.eventInfo}>
        <Text style={styles.eventTitle} numberOfLines={1}>
          {item.title}
        </Text>
        {item.description && (
          <Text style={styles.eventDescription} numberOfLines={2}>
            {item.description}
          </Text>
        )}
        <Text style={styles.eventDate}>
          Created: {formatDate(item.createdAt)}
        </Text>
        <View style={styles.activeContainer}>
          <Text style={styles.activeLabel}>
            {item.isActive ? 'Active' : 'Inactive'}
          </Text>
          <Switch
            value={item.isActive}
            onValueChange={() => handleToggleActive(item.id, item.isActive)}
            trackColor={{ false: '#CBD5E1', true: colors.primaryLight }}
            thumbColor={item.isActive ? colors.primary : '#F1F5F9'}
          />
        </View>
      </View>
      <View style={styles.actionButtons}>
        <TouchableOpacity
          style={[styles.actionButton, styles.editButton]}
          onPress={() => handleEditEvent(item.id)}
        >
          <Edit2 size={16} color="#fff" />
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.actionButton, styles.deleteButton]}
          onPress={() => handleDeleteEvent(item.id, item.title)}
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
      <Header title="Events Management" showBack />

      <View style={styles.searchContainer}>
        <View style={styles.searchInputContainer}>
          <Search size={20} color="#94A3B8" style={styles.searchIcon} />
          <TextInput
            style={styles.searchInput}
            placeholder="Search events..."
            value={searchQuery}
            onChangeText={setSearchQuery}
            placeholderTextColor="#94A3B8"
          />
        </View>
      </View>

      <View style={styles.headerContainer}>
        <Text style={styles.headerTitle}>Events ({filteredEvents.length})</Text>
        <Button
          variant="primary"
          onPress={handleAddEvent}
          style={styles.addButton}
          leftIcon={<Plus size={16} color="#fff" />}
        >
          Add New
        </Button>
      </View>

      <FlatList
        data={filteredEvents}
        renderItem={renderEventItem}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.listContainer}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={handleRefresh} />
        }
        ListEmptyComponent={
          !isLoading ? (
            <View style={styles.emptyContainer}>
              <Text style={styles.emptyText}>No events found</Text>
              <Text style={styles.emptySubtext}>
                Add a new event or change your search criteria
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
    </SafeAreaView>
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
  eventItem: {
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
  eventImageContainer: {
    marginRight: 12,
  },
  eventImage: {
    width: 60,
    height: 60,
    borderRadius: 8,
  },
  placeholderImage: {
    backgroundColor: '#F1F5F9',
    justifyContent: 'center',
    alignItems: 'center',
  },
  eventInfo: {
    flex: 1,
    marginRight: 8,
  },
  eventTitle: {
    fontFamily: fonts.medium,
    fontSize: 16,
    color: '#1E293B',
    marginBottom: 4,
  },
  eventDescription: {
    fontFamily: fonts.regular,
    fontSize: 12,
    color: '#64748B',
    marginBottom: 4,
  },
  eventDate: {
    fontFamily: fonts.regular,
    fontSize: 12,
    color: '#94A3B8',
    marginBottom: 4,
  },
  activeContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  activeLabel: {
    fontFamily: fonts.medium,
    fontSize: 12,
    color: '#64748B',
    marginRight: 8,
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
});
