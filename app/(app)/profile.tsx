import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
  Platform,
} from 'react-native';
import {
  SafeAreaView,
  useSafeAreaInsets,
} from 'react-native-safe-area-context';
import {
  ChevronRight,
  Package,
  ShoppingCart,
  Settings,
  HelpCircle,
  LogOut,
  Ticket,
  User as UserIcon,
  MailQuestion,
  Info,
  BarChart4,
  Tags,
  Calendar,
  ShoppingBasket,
} from 'lucide-react-native';
import { router } from 'expo-router';
import { useAuth } from '@/lib/auth/auth-provider';
import { colors } from '@/constants/colors';
import { fonts } from '@/constants/fonts';

export default function ProfileScreen() {
  const insets = useSafeAreaInsets();
  const { user, logout } = useAuth();
  const { isAdmin } = useAuth();

  const handleLogout = () => {
    if (Platform.OS === 'web') {
      // For web, we can use a more styled confirm dialog
      if (confirm('Are you sure you want to log out?')) {
        logout();
      }
    } else {
      // For mobile, use the native Alert component for better UX
      Alert.alert('Logout', 'Are you sure you want to log out?', [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Logout',
          style: 'destructive',
          onPress: () => logout(),
        },
      ]);
    }
  };

  const MenuOption = ({
    icon,
    title,
    onPress,
  }: {
    icon: React.ReactNode;
    title: string;
    onPress: () => void;
  }) => (
    <TouchableOpacity style={styles.menuOption} onPress={onPress}>
      <View style={styles.menuIconContainer}>{icon}</View>
      <Text style={styles.menuTitle}>{title}</Text>
      <ChevronRight size={20} color="#94A3B8" />
    </TouchableOpacity>
  );

  return (
    <SafeAreaView style={styles.container}>
      <View style={[styles.header, { paddingTop: insets.top > 0 ? 0 : 16 }]}>
        <Text style={styles.title}>Profile</Text>
      </View>

      <ScrollView showsVerticalScrollIndicator={false}>
        <View style={styles.profileSection}>
          <View style={styles.profileImage}>
            <UserIcon size={40} color={colors.primary} />
          </View>
          <View style={styles.profileInfo}>
            <Text style={styles.profileName}>{user?.name || 'User'}</Text>
            <Text style={styles.profileEmail}>
              {user?.email || 'user@example.com'}
            </Text>
          </View>
          <TouchableOpacity
            style={styles.editButton}
            onPress={() => router.push('/profile-details')}
          >
            <Text style={styles.editButtonText}>View</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Account</Text>

          <MenuOption
            icon={<Package size={20} color="#1E40AF" />}
            title="My Orders"
            onPress={() => router.push('/orders')}
          />
          <MenuOption
            icon={<MailQuestion size={20} color="#1E40AF" />}
            title="Request"
            onPress={() => router.push('/request')}
          />
          <MenuOption
            icon={<ShoppingCart size={20} color="#1E40AF" />}
            title="My Cart"
            onPress={() => router.push('/cart')}
          />

          <MenuOption
            icon={<Ticket size={20} color="#1E40AF" />}
            title="My Coupons"
            onPress={() => {
              isAdmin ? router.push('/admin/coupons') : router.push('/coupons');
            }}
          />
          <MenuOption
            icon={<Info size={20} color="#1E40AF" />}
            title="About"
            onPress={() => {
              router.push('/about');
            }}
          />
        </View>

        {isAdmin && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Admin</Text>

            <MenuOption
              icon={<ShoppingBasket size={20} color="#1E40AF" />}
              title="Product Management"
              onPress={() => router.push('/admin/products')}
            />
            <MenuOption
              icon={<Tags size={20} color="#1E40AF" />}
              title="Category Management"
              onPress={() => router.push('/admin/categories')}
            />
            <MenuOption
              icon={<Calendar size={20} color="#1E40AF" />}
              title="Events Management"
              onPress={() => router.push('/admin/events')}
            />
            <MenuOption
              icon={<BarChart4 size={20} color="#1E40AF" />}
              title="Analytics"
              onPress={() => router.push('/admin/analytics')}
            />
          </View>
        )}

        <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
          <LogOut size={20} color="#EF4444" />
          <Text style={styles.logoutText}>Log Out</Text>
        </TouchableOpacity>

        <Text style={styles.versionText}>Version 1.0.0</Text>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  header: {
    paddingHorizontal: 16,
    paddingBottom: 16,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#F1F5F9',
  },
  title: {
    fontFamily: fonts.bold,
    fontSize: 24,
    color: '#1E293B',
  },
  profileSection: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 24,
    borderBottomWidth: 1,
    borderBottomColor: '#F1F5F9',
  },
  profileImage: {
    width: 70,
    height: 70,
    borderRadius: 35,
    backgroundColor: colors.primaryLight,
    justifyContent: 'center',
    alignItems: 'center',
  },
  profileInfo: {
    flex: 1,
    marginLeft: 16,
  },
  profileName: {
    fontFamily: fonts.bold,
    fontSize: 18,
    color: '#1E293B',
    marginBottom: 4,
  },
  profileEmail: {
    fontFamily: fonts.regular,
    fontSize: 14,
    color: '#64748B',
  },
  editButton: {
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: '#1E40AF',
  },
  editButtonText: {
    fontFamily: fonts.medium,
    fontSize: 14,
    color: '#1E40AF',
  },
  section: {
    paddingTop: 24,
    paddingHorizontal: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#F1F5F9',
    paddingBottom: 8,
  },
  sectionTitle: {
    fontFamily: fonts.bold,
    fontSize: 16,
    color: '#1E293B',
    marginBottom: 16,
  },
  menuOption: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
  },
  menuIconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#F1F5F9',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  menuTitle: {
    flex: 1,
    fontFamily: fonts.medium,
    fontSize: 16,
    color: '#1E293B',
  },
  logoutButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 32,
    marginHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#EF4444',
  },
  logoutText: {
    fontFamily: fonts.medium,
    fontSize: 16,
    color: '#EF4444',
    marginLeft: 8,
  },
  versionText: {
    fontFamily: fonts.regular,
    fontSize: 12,
    color: '#94A3B8',
    textAlign: 'center',
    marginTop: 24,
    marginBottom: 32,
  },
});
