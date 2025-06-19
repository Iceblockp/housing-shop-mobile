import React from 'react';
import {
  StyleSheet,
  View,
  Text,
  ScrollView,
  Alert,
  Platform,
  ActivityIndicator,
  TouchableOpacity,
} from 'react-native';
import { router, useLocalSearchParams } from 'expo-router';
import {
  Phone,
  Trash2,
  Calendar,
  User,
  Mail,
  MessageCircle,
  ArrowLeft,
} from 'lucide-react-native';
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
import { format } from 'date-fns';

export default function RequestDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { isAdmin } = useAuth();
  const [isAdminReply, setIsAdminReply] = React.useState(false);
  const { data: admin } = useGetAdmin();
  const { mutate: deleteRequest, isPending: isDeleting } = useDeleteRequest(id);
  const { data: request, isLoading, error, refetch } = useRequest(id);

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
            router.push('/request');
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

  const handleGoBack = () => {
    router.back();
  };

  if (isLoading) {
    return (
      <SafeAreaView style={{ flex: 1, backgroundColor: colors.background }}>
        <Header title="Request Details" showBack onBackPress={handleGoBack} />
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={colors.primary} />
          <Text style={styles.loadingText}>Loading request details...</Text>
        </View>
      </SafeAreaView>
    );
  }

  if (error || !request) {
    return (
      <SafeAreaView style={{ flex: 1, backgroundColor: colors.background }}>
        <Header title="Request Details" showBack onBackPress={handleGoBack} />
        <View style={styles.errorContainer}>
          <Text style={styles.errorText}>Failed to load request details</Text>
          <Button
            variant="outline"
            onPress={() => refetch()}
            style={styles.retryButton}
          >
            Retry
          </Button>
        </View>
      </SafeAreaView>
    );
  }

  const formattedDate = format(new Date(request.createdAt), 'PPP');

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: colors.background }}>
      <Header title="Request Details" showBack onBackPress={handleGoBack} />
      <Container>
        <ScrollView
          style={styles.container}
          showsVerticalScrollIndicator={false}
        >
          {/* Status Badge */}
          <View style={styles.statusContainer}>
            <View
              style={[
                styles.statusBadge,
                request.adminReply ? styles.repliedBadge : styles.pendingBadge,
              ]}
            >
              <Text style={styles.statusText}>
                {request.adminReply ? 'Replied' : 'Pending'}
              </Text>
            </View>
          </View>

          {/* Title and Date Section */}
          <View style={styles.card}>
            <Text style={styles.title}>{request.title}</Text>
            <View style={styles.dateContainer}>
              <Calendar size={16} color={colors.textLight} />
              <Text style={styles.date}>{formattedDate}</Text>
            </View>

            {/* Description */}
            <View style={styles.descriptionContainer}>
              <Text style={styles.descriptionLabel}>Description:</Text>
              <Text style={styles.description}>{request.description}</Text>
            </View>
          </View>

          {/* User Info Card */}
          <View style={styles.card}>
            <Text style={styles.sectionTitle}>User Information</Text>
            <View style={styles.userInfoRow}>
              <User size={18} color={colors.textLight} />
              <Text style={styles.userInfoText}>{request.user.name}</Text>
            </View>

            <View style={styles.userInfoRow}>
              <Mail size={18} color={colors.textLight} />
              <Text style={styles.userInfoText}>{request.user.email}</Text>
            </View>

            {request.user.phone && (
              <View style={styles.userInfoRow}>
                <Phone size={18} color={colors.textLight} />
                <Text style={styles.userInfoText}>{request.user.phone}</Text>
              </View>
            )}

            {/* Call Button */}
            {isAdmin && request.user.phone ? (
              <Button
                variant="outline"
                onPress={() => handleCallUser(request.user.phone as string)}
                leftIcon={<Phone size={20} color={colors.primary} />}
                style={styles.actionButton}
              >
                Call User
              </Button>
            ) : (
              !isAdmin && (
                <Button
                  variant="outline"
                  onPress={handleCallAdmin}
                  leftIcon={<Phone size={20} color={colors.primary} />}
                  style={styles.actionButton}
                >
                  Call Admin
                </Button>
              )
            )}
          </View>

          {/* Admin Reply Card */}
          <View style={styles.card}>
            <Text style={styles.sectionTitle}>
              <MessageCircle
                size={20}
                color={colors.textDark}
                style={styles.replyIcon}
              />
              Admin Response
            </Text>

            {request.adminReply ? (
              <View style={styles.replyContainer}>
                <Text style={styles.replyText}>{request.adminReply}</Text>
              </View>
            ) : (
              <View style={styles.noReplyContainer}>
                <Text style={styles.noReply}>No reply from admin yet</Text>
                {isAdmin && (
                  <Button
                    onPress={() => setIsAdminReply(true)}
                    style={styles.actionButton}
                  >
                    Add Reply
                  </Button>
                )}
              </View>
            )}
          </View>

          {/* Action Buttons */}
          <View style={styles.actionsContainer}>
            <Button
              variant="outline"
              onPress={handleGoBack}
              leftIcon={<ArrowLeft size={20} color={colors.textLight} />}
              style={[styles.actionButton, styles.backButton]}
            >
              Back to Requests
            </Button>

            <Button
              variant="danger"
              onPress={handleDelete}
              leftIcon={<Trash2 size={20} color="white" />}
              style={styles.actionButton}
              loading={isDeleting}
            >
              Delete Request
            </Button>
          </View>
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
    backgroundColor: colors.background,
  },
  loadingText: {
    marginTop: 12,
    fontSize: 16,
    fontFamily: fonts.regular,
    color: colors.textLight,
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: colors.background,
    padding: 20,
  },
  errorText: {
    color: colors.error,
    fontSize: 16,
    fontFamily: fonts.medium,
    marginBottom: 16,
  },
  retryButton: {
    minWidth: 120,
  },
  statusContainer: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    marginBottom: 12,
  },
  statusBadge: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  pendingBadge: {
    backgroundColor: colors.warning + '20',
    borderWidth: 1,
    borderColor: colors.warning,
  },
  repliedBadge: {
    backgroundColor: colors.success + '20',
    borderWidth: 1,
    borderColor: colors.success,
  },
  statusText: {
    fontSize: 14,
    fontFamily: fonts.medium,
    color: colors.textDark,
  },
  card: {
    backgroundColor: colors.card,
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 3,
    elevation: 2,
  },
  title: {
    fontSize: 22,
    fontFamily: fonts.semiBold,
    color: colors.textDark,
    marginBottom: 8,
  },
  dateContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  date: {
    fontSize: 14,
    fontFamily: fonts.regular,
    color: colors.textLight,
    marginLeft: 6,
  },
  descriptionContainer: {
    borderTopWidth: 1,
    borderTopColor: colors.border,
    paddingTop: 16,
  },
  descriptionLabel: {
    fontSize: 16,
    fontFamily: fonts.medium,
    color: colors.textDark,
    marginBottom: 8,
  },
  description: {
    fontSize: 16,
    lineHeight: 24,
    fontFamily: fonts.regular,
    color: colors.text,
  },
  sectionTitle: {
    fontSize: 18,
    fontFamily: fonts.semiBold,
    color: colors.textDark,
    marginBottom: 16,
    flexDirection: 'row',
    alignItems: 'center',
  },
  userInfoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  userInfoText: {
    fontSize: 16,
    fontFamily: fonts.regular,
    color: colors.text,
    marginLeft: 12,
  },
  replyIcon: {
    marginRight: 8,
  },
  replyContainer: {
    backgroundColor: colors.background,
    borderRadius: 8,
    padding: 16,
  },
  replyText: {
    fontSize: 16,
    lineHeight: 24,
    fontFamily: fonts.regular,
    color: colors.text,
  },
  noReplyContainer: {
    alignItems: 'center',
    padding: 16,
  },
  noReply: {
    fontSize: 16,
    fontFamily: fonts.regular,
    color: colors.textLight,
    marginBottom: 16,
    textAlign: 'center',
  },
  actionsContainer: {
    marginTop: 8,
    marginBottom: 24,
  },
  actionButton: {
    marginTop: 12,
  },
  backButton: {
    marginBottom: 8,
  },
});
