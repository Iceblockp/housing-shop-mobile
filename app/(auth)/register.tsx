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
import { Link, router } from 'expo-router';
import { Mail, Key, User as UserIcon, Phone, Home } from 'lucide-react-native';
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
  const [errors, setErrors] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
    phone: '',
    roomNumber: '',
    floor: '',
  });

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

            <Button onPress={handleRegister} loading={isLoading} fullWidth>
              Sign Up
            </Button>
          </View>

          <View style={styles.footerContainer}>
            <Text style={styles.footerText}>Already have an account? </Text>
            <TouchableOpacity onPress={() => router.push('/(auth)/login')}>
              <Text style={styles.signInText}>Sign In</Text>
            </TouchableOpacity>
            {/* <Link href="/(auth)/login" asChild>
            </Link> */}
          </View>
        </View>
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
});
