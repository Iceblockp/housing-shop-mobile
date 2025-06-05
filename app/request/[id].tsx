import React from 'react';
import {
  StyleSheet,
  View,
  Text,
  ScrollView,
  Alert,
  Platform,
} from 'react-native';
import { router, useLocalSearchParams } from 'expo-router';
import { useQuery } from '@tanstack/react-query';
import { Phone, Trash2 } from 'lucide-react-native';
import { Container } from '@/components/shared/Container';
import { Header } from '@/components/shared/Header';
import { Button } from '@/components/ui/Button';
import { colors } from '@/constants/colors';
import { fonts } from '@/constants/fonts';
import { Linking } from 'react-native';
import { useAuth } from '@/lib/auth/auth-provider';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRequest, useDeleteRequest } from '@/hooks/use-requests';
import { useGetAdmin } from '@/hooks/useAdmin';
import AdminReplyModel from '@/components/ui/AdminReplyModel';

export default function RequestDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { isAdmin } = useAuth();
  const [isAdminReply, setIsAdminReply] = React.useState(false);
  const { data: admin } = useGetAdmin();
  const { mutate: deleteRequest } = useDeleteRequest(id);

  const { data: request, isLoading, error } = useRequest(id);

  const handleDelete = () => {
    Alert.alert(
      'Delete Request',
      'Are you sure you want to delete this request?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: () => {
            deleteRequest();
            router.push('/(app)/request');
          },
        },
      ]
    );
  };

  const handleCallAdmin = () => {
    const phoneNumber = admin?.phone || '+959425743536';
    if (Platform.OS === 'web') {
      alert(`Please call the admin at: ${phoneNumber}`);
    } else {
      Linking.openURL(`tel:${phoneNumber}`);
    }
  };

  const handleCallUser = (phoneNumber: string) => {
    if (Platform.OS === 'web') {
      alert(`Please call the user at: ${phoneNumber}`);
    } else {
      Linking.openURL(`tel:${phoneNumber}`);
    }
  };

  if (isLoading) {
    return (
      <SafeAreaView style={{ flex: 1, backgroundColor: colors.background }}>
        <Container>
          <Header title="Request Details" showBack />
          <View style={styles.loadingContainer}>
            <Text>Loading...</Text>
          </View>
        </Container>
      </SafeAreaView>
    );
  }

  if (error || !request) {
    return (
      <SafeAreaView style={{ flex: 1, backgroundColor: colors.background }}>
        <Container>
          <Header title="Request Details" showBack />
          <View style={styles.errorContainer}>
            <Text style={styles.errorText}>Failed to load request details</Text>
          </View>
        </Container>
      </SafeAreaView>
    );
  }
  const handleGoBack = () => {
    router.push('/(app)/request');
  };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: colors.background }}>
      <Header title="Request Details" showBack onBackPress={handleGoBack} />
      <Container>
        <ScrollView style={styles.container}>
          <View style={styles.section}>
            <Text style={styles.title}>{request.title}</Text>
            <Text style={styles.date}>
              {new Date(request.createdAt).toLocaleDateString()}
            </Text>
          </View>

          <View style={styles.section}>
            <Text style={styles.description}>{request.description}</Text>
          </View>

          <View style={styles.section}>
            <View style={styles.userInfo}>
              <Text style={styles.userName}>{request.user.name}</Text>
              <Text style={styles.userEmail}>{request.user.email}</Text>
              {request.user.phone && (
                <Text style={styles.userPhone}>{request.user.phone}</Text>
              )}
            </View>
            {isAdmin && request.user.phone ? (
              <Button
                variant="outline"
                onPress={() => handleCallUser(request.user.phone as string)}
                leftIcon={<Phone size={20} color={colors.primary} />}
              >
                Call User
              </Button>
            ) : (
              !isAdmin && (
                <Button
                  variant="outline"
                  onPress={handleCallAdmin}
                  leftIcon={<Phone size={20} color={colors.primary} />}
                >
                  Call Admin
                </Button>
              )
            )}
          </View>

          {request.adminReply ? (
            <View style={styles.section}>
              <Text style={styles.replyLabel}>Admin Reply:</Text>
              <Text style={styles.replyText}>{request.adminReply}</Text>
            </View>
          ) : (
            <View style={styles.section}>
              <Text style={styles.noReply}>No reply from admin yet</Text>
              {isAdmin && (
                <Button onPress={() => setIsAdminReply(true)}>Add Reply</Button>
              )}
            </View>
          )}
          <Button
            style={{ backgroundColor: colors.error }}
            onPress={handleDelete}
          >
            Delete
          </Button>
        </ScrollView>

        {isAdmin && (
          <AdminReplyModel
            isVisible={isAdminReply}
            onClose={() => setIsAdminReply(false)}
            id={request.id}
          />
        )}
      </Container>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  errorText: {
    color: colors.error,
    fontSize: 16,
    fontFamily: fonts.medium,
  },
  section: {
    marginBottom: 24,
  },
  title: {
    fontSize: 24,
    fontFamily: fonts.semiBold,
    marginBottom: 8,
  },
  date: {
    fontSize: 14,
    color: colors.gray,
    fontFamily: fonts.regular,
  },
  description: {
    fontSize: 16,
    lineHeight: 24,
    fontFamily: fonts.regular,
  },
  userInfo: {
    marginBottom: 16,
  },
  userName: {
    fontSize: 18,
    fontFamily: fonts.medium,
    marginBottom: 4,
  },
  userEmail: {
    fontSize: 14,
    color: colors.gray,
    fontFamily: fonts.regular,
    marginBottom: 4,
  },
  userPhone: {
    fontSize: 14,
    color: colors.gray,
    fontFamily: fonts.regular,
  },
  replyLabel: {
    fontSize: 18,
    fontFamily: fonts.medium,
    marginBottom: 8,
  },
  replyText: {
    fontSize: 16,
    lineHeight: 24,
    fontFamily: fonts.regular,
  },
  noReply: {
    fontSize: 16,
    color: colors.gray,
    fontFamily: fonts.regular,
    marginBottom: 16,
  },
});
