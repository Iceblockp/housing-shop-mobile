import React, { useState } from 'react';
import { 
  StyleSheet, 
  TextInput, 
  View, 
  Text, 
  TextInputProps, 
  TouchableOpacity,
  Platform
} from 'react-native';
import { Eye, EyeOff } from 'lucide-react-native';
import { colors } from '@/constants/colors';
import { fonts } from '@/constants/fonts';

interface InputProps extends TextInputProps {
  label?: string;
  error?: string;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
  isPassword?: boolean;
  fullWidth?: boolean;
}

export function Input({
  label,
  error,
  leftIcon,
  rightIcon,
  isPassword = false,
  fullWidth = true,
  style,
  ...props
}: InputProps) {
  const [secureTextEntry, setSecureTextEntry] = useState(isPassword);

  const toggleSecureEntry = () => {
    setSecureTextEntry(!secureTextEntry);
  };

  const passwordIcon = secureTextEntry ? (
    <Eye size={20} color={colors.textLight} />
  ) : (
    <EyeOff size={20} color={colors.textLight} />
  );

  return (
    <View style={[styles.container, fullWidth && styles.fullWidth]}>
      {label && <Text style={styles.label}>{label}</Text>}

      <View style={[
        styles.inputContainer,
        error ? styles.inputError : null,
        leftIcon ? styles.withLeftIcon : null,
        (rightIcon || isPassword) ? styles.withRightIcon : null,
        style
      ]}>
        {leftIcon && <View style={styles.leftIcon}>{leftIcon}</View>}

        <TextInput
          style={[
            styles.input,
            Platform.OS === 'web' && styles.webInput,
            leftIcon ? styles.inputWithLeftIcon : null,
            (rightIcon || isPassword) ? styles.inputWithRightIcon : null,
          ]}
          placeholderTextColor={colors.textLight}
          secureTextEntry={secureTextEntry}
          {...props}
        />

        {isPassword ? (
          <TouchableOpacity style={styles.rightIcon} onPress={toggleSecureEntry}>
            {passwordIcon}
          </TouchableOpacity>
        ) : rightIcon ? (
          <View style={styles.rightIcon}>{rightIcon}</View>
        ) : null}
      </View>

      {error && <Text style={styles.errorText}>{error}</Text>}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginBottom: 16,
  },
  fullWidth: {
    width: '100%',
  },
  label: {
    marginBottom: 6,
    fontSize: 14,
    fontFamily: fonts.medium,
    color: colors.textDark,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 8,
    backgroundColor: colors.card,
  },
  input: {
    flex: 1,
    paddingVertical: 12,
    paddingHorizontal: 16,
    fontSize: 16,
    fontFamily: fonts.regular,
    color: colors.text,
  },
  webInput: {
    outlineStyle: 'none',
  },
  inputWithLeftIcon: {
    paddingLeft: 8,
  },
  inputWithRightIcon: {
    paddingRight: 8,
  },
  withLeftIcon: {
    paddingLeft: 8,
  },
  withRightIcon: {
    paddingRight: 8,
  },
  leftIcon: {
    paddingLeft: 8,
  },
  rightIcon: {
    paddingRight: 8,
  },
  inputError: {
    borderColor: colors.error,
  },
  errorText: {
    marginTop: 4,
    color: colors.error,
    fontSize: 12,
    fontFamily: fonts.regular,
  },
});