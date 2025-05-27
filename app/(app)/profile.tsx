import React, { useState } from 'react';
import {
  StyleSheet,
  View,
  Text,
  TouchableOpacity,
  Alert,
  Platform,
  ScrollView,
} from 'react-native';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import {
  LogOut,
  User as UserIcon,
  Phone,
  Home,
  Mail,
  Key,
  Package,
  ShoppingCart,
  Settings,
  ChevronRight,
} from 'lucide-react-native';
import { router } from 'expo-router';
import { Container } from '@/components/shared/Container';
import { Header } from '@/components/shared/Header';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { useAuth } from '@/lib/auth/auth-provider';
import { authApi } from '@/lib/api';
import { colors } from '@/constants/colors';
import { fonts } from '@/constants/fonts';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function ProfileScreen() {
  const { user, logout, updateUser, isAdmin } = useAuth();
  const queryClient = useQueryClient();

  const [isEditing, setIsEditing] = useState(false);
  const [name, setName] = useState(user?.name || '');
  const [phone, setPhone] = useState(user?.phone || '');
  const [roomNumber, setRoomNumber] = useState(user?.roomNumber || '');
  const [floor, setFloor] = useState(user?.floor?.toString() || '');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [errors, setErrors] = useState({
    name: '',
    phone: '',
    roomNumber: '',
    floor: '',
    password: '',
    confirmPassword: '',
  });

  const updateProfileMutation = useMutation({
    mutationFn: (data: {
      name?: string;
      phone?: string;
      roomNumber?: string;
      floor?: number;
      password?: string;
    }) => authApi.updateProfile(data),
    onSuccess: (updatedUser) => {
      updateUser(updatedUser);
      setIsEditing(false);
      setPassword('');
      setConfirmPassword('');
      queryClient.invalidateQueries({ queryKey: ['profile'] });

      if (Platform.OS === 'web') {
        alert('Profile updated successfully!');
      } else {
        Alert.alert('Success', 'Your profile has been updated successfully!');
      }
    },
    onError: (error) => {
      const errorMessage =
        error instanceof Error ? error.message : 'Failed to update profile';

      if (Platform.OS === 'web') {
        alert(`Error: ${errorMessage}`);
      } else {
        Alert.alert('Error', `Failed to update profile: ${errorMessage}`);
      }
    },
  });

  const handleLogout = () => {
    if (Platform.OS === 'web') {
      if (confirm('Are you sure you want to log out?')) {
        logout();
      }
    } else {
      Alert.alert('Logout', 'Are you sure you want to log out?', [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Logout', style: 'destructive', onPress: () => logout() },
      ]);
    }
  };

  const validate = () => {
    let isValid = true;
    const newErrors = {
      name: '',
      phone: '',
      roomNumber: '',
      floor: '',
      password: '',
      confirmPassword: '',
    };

    if (!name.trim()) {
      newErrors.name = 'Name is required';
      isValid = false;
    }

    if (floor && isNaN(Number(floor))) {
      newErrors.floor = 'Floor must be a number';
      isValid = false;
    }

    if (password && password.length < 6) {
      newErrors.password = 'Password must be at least 6 characters';
      isValid = false;
    }

    if (password && password !== confirmPassword) {
      newErrors.confirmPassword = 'Passwords do not match';
      isValid = false;
    }

    setErrors(newErrors);
    return isValid;
  };

  const handleSave = () => {
    if (!validate()) return;

    const data: any = { name };
    if (phone) data.phone = phone;
    if (roomNumber) data.roomNumber = roomNumber;
    if (floor) data.floor = parseInt(floor);
    if (password) data.password = password;

    updateProfileMutation.mutate(data);
  };

  const renderProfileView = () => (
    <View style={styles.profileSection}>
      <View style={styles.profileHeader}>
        <View style={styles.avatar}>
          <UserIcon size={40} color={colors.primary} />
        </View>
        <View style={styles.profileInfo}>
          <Text style={styles.profileName}>{user?.name}</Text>
          <Text style={styles.profileEmail}>{user?.email}</Text>
          <View style={styles.roleContainer}>
            <Text style={styles.roleText}>{user?.role}</Text>
          </View>
        </View>
      </View>

      <View style={styles.infoContainer}>
        {user?.phone && (
          <View style={styles.infoItem}>
            <Phone size={20} color={colors.textLight} />
            <Text style={styles.infoText}>{user.phone}</Text>
          </View>
        )}

        {user?.roomNumber && (
          <View style={styles.infoItem}>
            <Home size={20} color={colors.textLight} />
            <Text style={styles.infoText}>
              Room {user.roomNumber}
              {user?.floor ? `, Floor ${user.floor}` : ''}
            </Text>
          </View>
        )}
      </View>

      <Button variant="outline" onPress={() => setIsEditing(true)} fullWidth>
        Edit Profile
      </Button>
    </View>
  );

  const renderProfileEdit = () => (
    <View style={styles.editSection}>
      <Input
        label="Name"
        placeholder="Enter your full name"
        value={name}
        onChangeText={setName}
        error={errors.name}
        leftIcon={<UserIcon size={20} color={colors.textLight} />}
      />

      <Input
        label="Phone (Optional)"
        placeholder="Enter your phone number"
        value={phone}
        onChangeText={setPhone}
        keyboardType="phone-pad"
        error={errors.phone}
        leftIcon={<Phone size={20} color={colors.textLight} />}
      />

      <View style={styles.row}>
        <View style={styles.halfWidth}>
          <Input
            label="Room Number (Optional)"
            placeholder="Room number"
            value={roomNumber}
            onChangeText={setRoomNumber}
            error={errors.roomNumber}
            leftIcon={<Home size={20} color={colors.textLight} />}
          />
        </View>
        <View style={styles.halfWidth}>
          <Input
            label="Floor (Optional)"
            placeholder="Floor number"
            value={floor}
            onChangeText={setFloor}
            keyboardType="numeric"
            error={errors.floor}
            leftIcon={<Home size={20} color={colors.textLight} />}
          />
        </View>
      </View>

      <Input
        label="New Password (Optional)"
        placeholder="Leave blank to keep current"
        value={password}
        onChangeText={setPassword}
        isPassword
        error={errors.password}
        leftIcon={<Key size={20} color={colors.textLight} />}
      />

      {password && (
        <Input
          label="Confirm New Password"
          placeholder="Confirm your new password"
          value={confirmPassword}
          onChangeText={setConfirmPassword}
          isPassword
          error={errors.confirmPassword}
          leftIcon={<Key size={20} color={colors.textLight} />}
        />
      )}

      <View style={styles.buttonContainer}>
        <Button
          variant="outline"
          onPress={() => {
            setIsEditing(false);
            setPassword('');
            setConfirmPassword('');
            setName(user?.name || '');
            setPhone(user?.phone || '');
            setRoomNumber(user?.roomNumber || '');
            setFloor(user?.floor?.toString() || '');
          }}
          style={styles.cancelButton}
        >
          Cancel
        </Button>
        <Button
          onPress={handleSave}
          loading={updateProfileMutation.isPending}
          style={styles.saveButton}
        >
          Save
        </Button>
      </View>
    </View>
  );

  const renderMenuItems = () => (
    <View style={styles.menuSection}>
      <Text style={styles.menuTitle}>My Account</Text>

      <TouchableOpacity
        style={styles.menuItem}
        onPress={() => router.push('/orders')}
      >
        <View style={styles.menuIconContainer}>
          <Package size={20} color={colors.primary} />
        </View>
        <Text style={styles.menuText}>My Orders</Text>
        <ChevronRight size={20} color={colors.textLight} />
      </TouchableOpacity>

      <TouchableOpacity
        style={styles.menuItem}
        onPress={() => router.push('/cart')}
      >
        <View style={styles.menuIconContainer}>
          <ShoppingCart size={20} color={colors.primary} />
        </View>
        <Text style={styles.menuText}>My Cart</Text>
        <ChevronRight size={20} color={colors.textLight} />
      </TouchableOpacity>

      {isAdmin && (
        <>
          <Text style={[styles.menuTitle, styles.adminTitle]}>Admin</Text>

          <TouchableOpacity
            style={styles.menuItem}
            onPress={() => router.push('/admin/products')}
          >
            <View style={[styles.menuIconContainer, styles.adminIcon]}>
              <ShoppingCart size={20} color={colors.secondary} />
            </View>
            <Text style={styles.menuText}>Manage Products</Text>
            <ChevronRight size={20} color={colors.textLight} />
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.menuItem}
            onPress={() => router.push('/admin/categories')}
          >
            <View style={[styles.menuIconContainer, styles.adminIcon]}>
              <Settings size={20} color={colors.secondary} />
            </View>
            <Text style={styles.menuText}>Manage Categories</Text>
            <ChevronRight size={20} color={colors.textLight} />
          </TouchableOpacity>
        </>
      )}
    </View>
  );

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: colors.background }}>
      <View style={styles.container}>
        <Header title="My Profile" showBack={false} />

        <Container>
          {isEditing ? renderProfileEdit() : renderProfileView()}

          {!isEditing && renderMenuItems()}

          <Button
            variant="outline"
            leftIcon={<LogOut size={20} color={colors.error} />}
            onPress={handleLogout}
            style={styles.logoutButton}
          >
            Logout
          </Button>
        </Container>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  profileSection: {
    backgroundColor: colors.card,
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
  },
  profileHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  avatar: {
    width: 70,
    height: 70,
    borderRadius: 35,
    backgroundColor: colors.primaryLight,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  profileInfo: {
    flex: 1,
  },
  profileName: {
    fontSize: 20,
    fontFamily: fonts.semiBold,
    color: colors.text,
    marginBottom: 4,
  },
  profileEmail: {
    fontSize: 14,
    fontFamily: fonts.regular,
    color: colors.textLight,
    marginBottom: 8,
  },
  roleContainer: {
    backgroundColor: colors.isAdmin
      ? colors.secondaryLight
      : colors.primaryLight,
    paddingVertical: 4,
    paddingHorizontal: 12,
    borderRadius: 12,
    alignSelf: 'flex-start',
  },
  roleText: {
    fontSize: 12,
    fontFamily: fonts.medium,
    color: colors.isAdmin ? colors.secondaryDark : colors.primaryDark,
  },
  infoContainer: {
    marginBottom: 16,
  },
  infoItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  infoText: {
    fontSize: 14,
    fontFamily: fonts.regular,
    color: colors.text,
    marginLeft: 12,
  },
  editSection: {
    backgroundColor: colors.card,
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  halfWidth: {
    width: '48%',
  },
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 8,
  },
  cancelButton: {
    flex: 1,
    marginRight: 8,
  },
  saveButton: {
    flex: 1,
    marginLeft: 8,
  },
  menuSection: {
    backgroundColor: colors.card,
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
  },
  menuTitle: {
    fontSize: 16,
    fontFamily: fonts.semiBold,
    color: colors.textDark,
    marginBottom: 12,
  },
  adminTitle: {
    marginTop: 16,
    color: colors.secondary,
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  menuIconContainer: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: colors.primaryLight,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  adminIcon: {
    backgroundColor: colors.secondaryLight,
  },
  menuText: {
    flex: 1,
    fontSize: 16,
    fontFamily: fonts.medium,
    color: colors.text,
  },
  logoutButton: {
    marginVertical: 16,
  },
});
