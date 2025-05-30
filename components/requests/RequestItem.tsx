import { Alert, Linking, Platform, StyleSheet, Text, View } from 'react-native';
import React from 'react';
import { Request } from '@/types/request';
import { useAuth } from '@/lib/auth/auth-provider';
import { useGetAdmin } from '@/hooks/useAdmin';
import { Button } from '../ui/Button';
import { Info, Phone, Reply, Trash2 } from 'lucide-react-native';
import AdminReplyModel from '../ui/AdminReplyModel';
import { colors } from '@/constants/colors';
import { useDeleteRequest } from '@/hooks/use-requests';
import { router } from 'expo-router';

interface RequestItemProps {
  request: Request;
}

const RequestItem = ({ request }: RequestItemProps) => {
  const { isAdmin } = useAuth();
  const { data: admin } = useGetAdmin();
  const { mutate } = useDeleteRequest(request.id);
  const [isAdminReply, setIsAdminReply] = React.useState(false);
  const { title, description, adminReply, createdAt, user } = request;
  const handleCallAdmin = () => {
    // This would normally use the admin's phone number from the app settings
    // For now, use a placeholder number
    const phoneNumber = admin?.phone || '+959425743536';

    if (Platform.OS === 'web') {
      alert(`Please call the admin at: ${phoneNumber}`);
    } else {
      Linking.openURL(`tel:${phoneNumber}`);
    }
  };
  const handleCallUser = (phoneNumber: string) => {
    // This would normally use the admin's phone number from the app settings
    // For now, use a placeholder number

    if (Platform.OS === 'web') {
      alert(`Please call the admin at: ${phoneNumber}`);
    } else {
      Linking.openURL(`tel:${phoneNumber}`);
    }
  };

  const handleDetail = () => {
    // Implement detail logic here
    router.push(`/request/${request.id}`);
  };

  const handleDelete = () => {
    // Implement delete logic here

    Alert.alert(
      'Delete Message',
      'Are you sure you want to delete this message?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: () => {
            mutate();
          },
        },
      ]
    );
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>{title}</Text>
        <Text style={styles.date}>
          {new Date(createdAt).toLocaleDateString()}{' '}
          <Info
            size={20}
            color={colors.gray}
            style={{}}
            onPress={() => handleDetail()}
          />
        </Text>
      </View>
      <Text style={styles.description}>{description}</Text>

      <View
        style={{
          display: 'flex',
          flexDirection: 'row',
          justifyContent: 'space-between',
        }}
      >
        <View style={styles.userInfo}>
          <Text style={styles.userName}>{user.name}</Text>
          <Text style={styles.userEmail}>{user.email}</Text>
          {user.phone && <Text style={styles.userPhone}>{user.phone}</Text>}
        </View>
        {isAdmin && user.phone ? (
          <Phone
            size={20}
            color="black"
            style={{}}
            onPress={() => handleCallUser(user.phone as string)}
          />
        ) : (
          <Phone
            size={20}
            color="black"
            style={{}}
            onPress={() => handleCallAdmin()}
          />
        )}
      </View>

      {adminReply ? (
        <View style={styles.replyContainer}>
          <Text style={styles.replyLabel}>Admin Reply:</Text>
          <Text style={styles.replyText}>{adminReply}</Text>
        </View>
      ) : (
        <Text style={styles.noReply}>No reply from admin yet</Text>
      )}
      {isAdmin && (
        <Reply
          size={20}
          color="black"
          style={{}}
          onPress={() => setIsAdminReply(true)}
        />
      )}
      {isAdmin && (
        <AdminReplyModel
          isVisible={isAdminReply}
          onClose={() => setIsAdminReply(false)}
          id={request.id}
        />
      )}
    </View>
  );
};

export default RequestItem;

const styles = StyleSheet.create({
  container: {
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 2,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  title: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
  },
  date: {
    fontSize: 12,
    color: '#666',
  },
  description: {
    fontSize: 14,
    color: '#555',
    marginBottom: 12,
  },
  userInfo: {
    marginBottom: 12,
  },
  userName: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#333',
  },
  userEmail: {
    fontSize: 12,
    color: '#666',
  },
  userPhone: {
    fontSize: 12,
    color: '#666',
  },
  replyContainer: {
    backgroundColor: '#f9f9f9',
    padding: 12,
    borderRadius: 8,
    marginTop: 8,
  },
  replyLabel: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#333',
  },
  replyText: {
    fontSize: 14,
    color: '#555',
  },
  noReply: {
    fontSize: 12,
    color: '#999',
    fontStyle: 'italic',
  },
});
