import React from 'react';
import {
  StyleSheet,
  View,
  ScrollView,
  ViewStyle,
  RefreshControl,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { colors } from '@/constants/colors';

interface ContainerProps {
  children: React.ReactNode;
  scrollable?: boolean;
  style?: ViewStyle;
  refreshing?: boolean;
  onRefresh?: () => void;
  contentContainerStyle?: ViewStyle;
}

export function Container({
  children,
  scrollable = true,
  style,
  refreshing = false,
  onRefresh,
  contentContainerStyle,
}: ContainerProps) {
  if (scrollable) {
    return (
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={[
          styles.scrollViewContent,
          contentContainerStyle,
        ]}
        showsVerticalScrollIndicator={false}
        refreshControl={
          onRefresh ? (
            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
          ) : undefined
        }
      >
        {children}
      </ScrollView>
      // <SafeAreaView style={[styles.container, style]} edges={['top', 'right', 'left']}>
      // </SafeAreaView>
    );
  }

  return (
    <View style={[styles.innerContainer, contentContainerStyle]}>
      {children}
    </View>
    // <SafeAreaView style={[styles.container, style]} edges={['top', 'right', 'left']}>
    // </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  innerContainer: {
    flex: 1,
    padding: 16,
  },
  scrollView: {
    flex: 1,
  },
  scrollViewContent: {
    padding: 16,
  },
});
