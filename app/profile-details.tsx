import React, { useState, useEffect } from 'react';
import {
  StyleSheet,
  View,
  Text,
  TouchableOpacity,
  Alert,
  Platform,
} from 'react-native';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import {
  User as UserIcon,
  Phone,
  Home,
  Key,
  MapPin,
} from 'lucide-react-native';
import { router } from 'expo-router';
import * as Location from 'expo-location';
import { Container } from '@/components/shared/Container';
import { Header } from '@/components/shared/Header';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { useAuth } from '@/lib/auth/auth-provider';
import { authApi } from '@/lib/api';
import { colors } from '@/constants/colors';
import { fonts } from '@/constants/fonts';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function ProfileDetailsScreen() {
  const { user, updateUser } = useAuth();
  const queryClient = useQueryClient();

  const [isEditing, setIsEditing] = useState(false);
  const [name, setName] = useState(user?.name || '');
  const [phone, setPhone] = useState(user?.phone || '');
  const [roomNumber, setRoomNumber] = useState(user?.roomNumber || '');
  const [floor, setFloor] = useState(user?.floor?.toString() || '');
  const [address, setAddress] = useState(user?.address || '');
  const [latitude, setLatitude] = useState(user?.latitude?.toString() || '');
  const [longitude, setLongitude] = useState(user?.longitude?.toString() || '');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [locationPermission, setLocationPermission] = useState(false);
  const [errors, setErrors] = useState({
    name: '',
    phone: '',
    roomNumber: '',
    floor: '',
    address: '',
    password: '',
    confirmPassword: '',
  });

  useEffect(() => {
    (async () => {
      const { status } = await Location.requestForegroundPermissionsAsync();
      setLocationPermission(status === 'granted');
    })();
  }, []);

  const updateProfileMutation = useMutation({
    mutationFn: (data: {
      name?: string;
      phone?: string;
      roomNumber?: string;
      floor?: number;
      address?: string;
      latitude?: number;
      longitude?: number;
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

  const validate = () => {
    let isValid = true;
    const newErrors = {
      name: '',
      phone: '',
      roomNumber: '',
      floor: '',
      address: '',
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

  const handleGetCurrentLocation = async () => {
    if (!locationPermission) {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        if (Platform.OS === 'web') {
          alert('Permission to access location was denied');
        } else {
          Alert.alert(
            'Permission Denied',
            'Permission to access location was denied'
          );
        }
        return;
      }
      setLocationPermission(true);
    }

    try {
      const location = await Location.getCurrentPositionAsync({});
      setLatitude(location.coords.latitude.toString());
      setLongitude(location.coords.longitude.toString());

      // Get address from coordinates (reverse geocoding)
      const addresses = await Location.reverseGeocodeAsync({
        latitude: location.coords.latitude,
        longitude: location.coords.longitude,
      });

      if (addresses && addresses.length > 0) {
        const addressObj = addresses[0];
        const formattedAddress = [
          addressObj.name,
          addressObj.street,
          addressObj.city,
          addressObj.region,
          addressObj.postalCode,
          addressObj.country,
        ]
          .filter(Boolean)
          .join(', ');

        setAddress(formattedAddress);
      }
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : 'Failed to get location';
      if (Platform.OS === 'web') {
        alert(`Error: ${errorMessage}`);
      } else {
        Alert.alert('Error', `Failed to get location: ${errorMessage}`);
      }
    }
  };

  const handleSave = () => {
    if (!validate()) return;

    const data: any = { name };
    if (phone) data.phone = phone;
    if (roomNumber) data.roomNumber = roomNumber;
    if (floor) data.floor = parseInt(floor);
    if (address) data.address = address;
    if (latitude) data.latitude = parseFloat(latitude);
    if (longitude) data.longitude = parseFloat(longitude);
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

        {user?.address && (
          <View style={styles.infoItem}>
            <MapPin size={20} color={colors.textLight} />
            <Text style={styles.infoText}>{user.address}</Text>
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
        label="Address (Optional)"
        placeholder="Enter your address"
        value={address}
        onChangeText={setAddress}
        error={errors.address}
        leftIcon={<MapPin size={20} color={colors.textLight} />}
      />

      <View style={styles.locationContainer}>
        <Button
          variant="outline"
          onPress={handleGetCurrentLocation}
          style={styles.locationButton}
        >
          Get Current Location
        </Button>

        {latitude && longitude ? (
          <Text style={styles.locationText}>
            Location: {parseFloat(latitude).toFixed(6)},{' '}
            {parseFloat(longitude).toFixed(6)}
          </Text>
        ) : null}
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
            setAddress(user?.address || '');
            setLatitude(user?.latitude?.toString() || '');
            setLongitude(user?.longitude?.toString() || '');
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

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: colors.background }}>
      <View style={styles.container}>
        <Header title="Profile Details" showBack />

        <Container>
          {isEditing ? renderProfileEdit() : renderProfileView()}
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
    backgroundColor: colors.primaryLight,
    paddingVertical: 4,
    paddingHorizontal: 12,
    borderRadius: 12,
    alignSelf: 'flex-start',
  },
  roleText: {
    fontSize: 12,
    fontFamily: fonts.medium,
    color: colors.primaryDark,
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
  locationContainer: {
    marginBottom: 16,
  },
  locationButton: {
    marginBottom: 8,
  },
  locationText: {
    fontSize: 14,
    fontFamily: fonts.regular,
    color: colors.textLight,
    marginTop: 4,
  },
});
