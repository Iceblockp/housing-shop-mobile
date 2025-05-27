import React from 'react';
import { 
  StyleSheet, 
  TouchableOpacity, 
  Text, 
  View, 
  ActivityIndicator,
  TouchableOpacityProps 
} from 'react-native';
import { fonts } from '@/constants/fonts';
import { colors } from '@/constants/colors';

type ButtonVariant = 'primary' | 'secondary' | 'outline' | 'ghost' | 'danger';
type ButtonSize = 'sm' | 'md' | 'lg';

interface ButtonProps extends TouchableOpacityProps {
  variant?: ButtonVariant;
  size?: ButtonSize;
  loading?: boolean;
  fullWidth?: boolean;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
  children: React.ReactNode;
}

export function Button({
  variant = 'primary',
  size = 'md',
  loading = false,
  fullWidth = false,
  disabled = false,
  leftIcon,
  rightIcon,
  style,
  children,
  ...props
}: ButtonProps) {
  // Determine styles based on variant and size
  const getVariantStyle = () => {
    switch (variant) {
      case 'primary':
        return {
          backgroundColor: colors.primary,
          borderColor: colors.primary,
        };
      case 'secondary':
        return {
          backgroundColor: colors.secondary,
          borderColor: colors.secondary,
        };
      case 'outline':
        return {
          backgroundColor: 'transparent',
          borderColor: colors.primary,
          borderWidth: 1,
        };
      case 'ghost':
        return {
          backgroundColor: 'transparent',
          borderColor: 'transparent',
        };
      case 'danger':
        return {
          backgroundColor: colors.error,
          borderColor: colors.error,
        };
      default:
        return {
          backgroundColor: colors.primary,
          borderColor: colors.primary,
        };
    }
  };

  const getTextStyle = () => {
    switch (variant) {
      case 'outline':
      case 'ghost':
        return { color: colors.primary };
      default:
        return { color: 'white' };
    }
  };

  const getSizeStyle = () => {
    switch (size) {
      case 'sm':
        return {
          container: { paddingVertical: 6, paddingHorizontal: 12 },
          text: { fontSize: 14 },
        };
      case 'lg':
        return {
          container: { paddingVertical: 14, paddingHorizontal: 20 },
          text: { fontSize: 16 },
        };
      default:
        return {
          container: { paddingVertical: 10, paddingHorizontal: 16 },
          text: { fontSize: 16 },
        };
    }
  };

  const variantStyle = getVariantStyle();
  const textStyle = getTextStyle();
  const sizeStyle = getSizeStyle();

  const containerStyles = [
    styles.container,
    variantStyle,
    sizeStyle.container,
    fullWidth && styles.fullWidth,
    disabled && styles.disabled,
    style,
  ];

  const textStyles = [
    styles.text,
    textStyle,
    sizeStyle.text,
    disabled && styles.disabledText,
  ];

  return (
    <TouchableOpacity
      style={containerStyles}
      disabled={disabled || loading}
      activeOpacity={0.8}
      {...props}
    >
      <View style={styles.content}>
        {leftIcon && !loading && <View style={styles.iconLeft}>{leftIcon}</View>}
        
        {loading ? (
          <ActivityIndicator 
            color={variant === 'outline' || variant === 'ghost' ? colors.primary : 'white'} 
            size="small" 
          />
        ) : (
          <Text style={textStyles}>
            {typeof children === 'string' ? children : ''}
          </Text>
        )}
        
        {rightIcon && !loading && <View style={styles.iconRight}>{rightIcon}</View>}
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: {
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'row',
  },
  content: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  text: {
    fontFamily: fonts.medium,
    textAlign: 'center',
  },
  fullWidth: {
    width: '100%',
  },
  disabled: {
    opacity: 0.6,
  },
  disabledText: {
    color: colors.textLight,
  },
  iconLeft: {
    marginRight: 8,
  },
  iconRight: {
    marginLeft: 8,
  },
});