'use client';

import AntDesign from '@expo/vector-icons/AntDesign';
import { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  Modal,
  TouchableWithoutFeedback,
  Switch,
  StyleSheet,
  Alert,
} from 'react-native';
import { Input } from './Input';
import { Ticket } from 'lucide-react-native';
import { colors } from '@/constants/colors';
import { fonts } from '@/constants/fonts';
import { Button } from './Button';
import { useCreateCoupon } from '@/hooks/use-admin-coupons';

type Props = {
  isVisible: boolean;
  onClose: () => void;
};

export default function CouponCreateModal({ isVisible, onClose }: Props) {
  const [code, setCode] = useState('');
  const [secretCode, setSecretCode] = useState('');
  const [amount, setAmount] = useState('');
  const [userId, setUserId] = useState('');
  const [isUsed, setIsUsed] = useState(false);

  const { mutate, isPending } = useCreateCoupon();

  const [errors, setErrors] = useState({
    code: '',
    secretCode: '',
    amount: '',
  });

  const validate = () => {
    let isValid = true;
    const newErrors = {
      code: '',
      secretCode: '',
      amount: '',
    };

    if (!code.trim()) {
      newErrors.code = 'Coupon code is required';
      isValid = false;
    }

    if (!secretCode.trim()) {
      newErrors.secretCode = 'Secret code is required';
      isValid = false;
    }

    if (!amount.trim() || isNaN(Number(amount)) || Number(amount) <= 0) {
      newErrors.amount = 'Valid amount is required';
      isValid = false;
    }

    setErrors(newErrors);
    return isValid;
  };

  const handleSave = () => {
    if (!validate()) return;

    mutate(
      {
        code,
        secretCode,
        amount: Number(amount),
        isUsed,
        userId: userId.trim() ? userId : undefined,
      },
      {
        onSuccess() {
          // Reset form
          setCode('');
          setSecretCode('');
          setAmount('');
          setUserId('');
          setIsUsed(false);
          onClose();
        },
        onError(error) {
          Alert.alert(
            'Error',
            error instanceof Error ? error.message : 'Failed to create coupon'
          );
        },
      }
    );
  };

  const generateRandomCode = () => {
    const randomCode = Math.random()
      .toString(36)
      .substring(2, 10)
      .toUpperCase();
    setCode(randomCode);
  };

  const generateRandomSecretCode = () => {
    const randomCode = Math.random()
      .toString(36)
      .substring(2, 10)
      .toUpperCase();
    setSecretCode(randomCode);
  };

  return (
    <Modal visible={isVisible} animationType="slide" transparent>
      <TouchableWithoutFeedback onPress={onClose}>
        <View style={styles.overlay}>
          <TouchableWithoutFeedback>
            <View style={styles.modalContainer}>
              <View style={styles.modalHeader}>
                <Text style={styles.modalTitle}>Create New Coupon</Text>
                <TouchableOpacity onPress={onClose}>
                  <AntDesign name="close" color="black" size={24} />
                </TouchableOpacity>
              </View>

              <View style={styles.formContainer}>
                <View style={styles.inputRow}>
                  <View style={styles.inputContainer}>
                    <Input
                      label="Coupon Code"
                      placeholder="Enter coupon code"
                      value={code}
                      onChangeText={setCode}
                      error={errors.code}
                    />
                  </View>
                  <TouchableOpacity
                    style={styles.generateButton}
                    onPress={generateRandomCode}
                  >
                    <Text style={styles.generateButtonText}>Generate</Text>
                  </TouchableOpacity>
                </View>

                <View style={styles.inputRow}>
                  <View style={styles.inputContainer}>
                    <Input
                      label="Secret Code"
                      placeholder="Enter secret code"
                      value={secretCode}
                      onChangeText={setSecretCode}
                      error={errors.secretCode}
                    />
                  </View>
                  <TouchableOpacity
                    style={styles.generateButton}
                    onPress={generateRandomSecretCode}
                  >
                    <Text style={styles.generateButtonText}>Generate</Text>
                  </TouchableOpacity>
                </View>

                <Input
                  label="Amount"
                  placeholder="Enter coupon amount"
                  value={amount}
                  onChangeText={setAmount}
                  keyboardType="numeric"
                  error={errors.amount}
                />

                <Input
                  label="User ID (Optional)"
                  placeholder="Enter user ID if assigning to specific user"
                  value={userId}
                  onChangeText={setUserId}
                />

                <View style={styles.switchContainer}>
                  <Text style={styles.switchLabel}>Mark as Used</Text>
                  <Switch
                    value={isUsed}
                    onValueChange={setIsUsed}
                    trackColor={{ false: colors.border, true: colors.primary }}
                    thumbColor={isUsed ? colors.white : colors.white}
                  />
                </View>
              </View>

              <Button
                onPress={handleSave}
                loading={isPending}
                disabled={isPending}
              >
                Create Coupon
              </Button>
            </View>
          </TouchableWithoutFeedback>
        </View>
      </TouchableWithoutFeedback>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    justifyContent: 'flex-end',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  modalContainer: {
    backgroundColor: 'white',
    borderRadius: 24,
    padding: 16,
    maxHeight: '80%',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  modalTitle: {
    fontSize: 20,
    fontFamily: fonts.semiBold,
  },
  formContainer: {
    marginBottom: 16,
  },
  inputRow: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    marginBottom: 16,
  },
  inputContainer: {
    flex: 1,
  },
  generateButton: {
    backgroundColor: colors.secondary,
    paddingVertical: 12,
    paddingHorizontal: 12,
    borderRadius: 8,
    marginLeft: 8,
    marginBottom: 8,
  },
  generateButtonText: {
    color: colors.white,
    fontFamily: fonts.medium,
    fontSize: 14,
  },
  switchContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginVertical: 16,
  },
  switchLabel: {
    fontSize: 16,
    fontFamily: fonts.medium,
    color: colors.text,
  },
});
