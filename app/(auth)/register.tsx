import React, { useState, useEffect } from 'react';
import {
  StyleSheet,
  View,
  Text,
  TouchableOpacity,
  Alert,
  Platform,
  ScrollView,
} from 'react-native';
import { Link, router } from 'expo-router';
import {
  Mail,
  Key,
  User as UserIcon,
  Phone,
  Home,
  MapPin,
} from 'lucide-react-native';
import * as Location from 'expo-location';
import { Container } from '@/components/shared/Container';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';
import { useAuth } from '@/lib/auth/auth-provider';
import { colors } from '@/constants/colors';
import { fonts } from '@/constants/fonts';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function RegisterScreen() {
  const { register, isLoading } = useAuth();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [phone, setPhone] = useState('');
  const [roomNumber, setRoomNumber] = useState('');
  const [floor, setFloor] = useState('');
  const [address, setAddress] = useState('');
  const [latitude, setLatitude] = useState('');
  const [longitude, setLongitude] = useState('');
  const [locationPermission, setLocationPermission] = useState(false);
  const [errors, setErrors] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
    phone: '',
    roomNumber: '',
    floor: '',
    address: '',
  });

  useEffect(() => {
    (async () => {
      const { status } = await Location.requestForegroundPermissionsAsync();
      setLocationPermission(status === 'granted');
    })();
  }, []);

  const validate = () => {
    let isValid = true;
    const newErrors = {
      name: '',
      email: '',
      password: '',
      confirmPassword: '',
      phone: '',
      roomNumber: '',
      floor: '',
      address: '',
    };

    if (!name.trim()) {
      newErrors.name = 'Name is required';
      isValid = false;
    }

    if (!email.trim()) {
      newErrors.email = 'Email is required';
      isValid = false;
    } else if (!/\S+@\S+\.\S+/.test(email)) {
      newErrors.email = 'Email is invalid';
      isValid = false;
    }

    if (!password) {
      newErrors.password = 'Password is required';
      isValid = false;
    } else if (password.length < 6) {
      newErrors.password = 'Password must be at least 6 characters';
      isValid = false;
    }

    if (password !== confirmPassword) {
      newErrors.confirmPassword = 'Passwords do not match';
      isValid = false;
    }

    if (floor && isNaN(Number(floor))) {
      newErrors.floor = 'Floor must be a number';
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

  const handleRegister = async () => {
    if (!validate()) return;

    try {
      await register({
        name,
        email,
        password,
        phone: phone || undefined,
        roomNumber: roomNumber || undefined,
        floor: floor ? Number(floor) : undefined,
        address: address || undefined,
        latitude: latitude ? Number(latitude) : undefined,
        longitude: longitude ? Number(longitude) : undefined,
      });
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : 'Failed to register';
      if (Platform.OS === 'web') {
        alert(errorMessage);
      } else {
        Alert.alert('Registration Failed', errorMessage);
      }
    }
  };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: colors.background }}>
      <Container>
        <ScrollView style={styles.scrollView}>
          <View style={styles.container}>
            <View style={styles.headerContainer}>
              <Text style={styles.title}>Create Account</Text>
              <Text style={styles.subtitle}>Sign up to join HomeShop</Text>
            </View>

            <View style={styles.formContainer}>
              <Input
                label="Name"
                placeholder="Enter your full name"
                value={name}
                onChangeText={setName}
                error={errors.name}
                leftIcon={<UserIcon size={20} color={colors.textLight} />}
              />

              <Input
                label="Email"
                placeholder="Enter your email"
                value={email}
                onChangeText={setEmail}
                keyboardType="email-address"
                autoCapitalize="none"
                error={errors.email}
                leftIcon={<Mail size={20} color={colors.textLight} />}
              />

              <Input
                label="Password"
                placeholder="Create a password"
                value={password}
                onChangeText={setPassword}
                isPassword
                error={errors.password}
                leftIcon={<Key size={20} color={colors.textLight} />}
              />

              <Input
                label="Confirm Password"
                placeholder="Confirm your password"
                value={confirmPassword}
                onChangeText={setConfirmPassword}
                isPassword
                error={errors.confirmPassword}
                leftIcon={<Key size={20} color={colors.textLight} />}
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

              <Button onPress={handleRegister} loading={isLoading} fullWidth>
                Sign Up
              </Button>
            </View>

            <View style={styles.footerContainer}>
              <Text style={styles.footerText}>Already have an account? </Text>
              <TouchableOpacity onPress={() => router.push('/(auth)/login')}>
                <Text style={styles.signInText}>Sign In</Text>
              </TouchableOpacity>
            </View>
          </View>
        </ScrollView>
      </Container>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    padding: 20,
  },
  headerContainer: {
    alignItems: 'center',
    marginBottom: 30,
  },
  title: {
    fontSize: 28,
    fontFamily: fonts.bold,
    color: colors.text,
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    fontFamily: fonts.regular,
    color: colors.textLight,
    textAlign: 'center',
  },
  formContainer: {
    width: '100%',
    maxWidth: 400,
    alignSelf: 'center',
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  halfWidth: {
    width: '48%',
  },
  footerContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginTop: 24,
  },
  footerText: {
    fontSize: 14,
    fontFamily: fonts.regular,
    color: colors.textLight,
  },
  signInText: {
    fontSize: 14,
    fontFamily: fonts.semiBold,
    color: colors.primary,
  },
  scrollView: {
    flex: 1,
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
