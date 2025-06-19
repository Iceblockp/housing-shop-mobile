import React from 'react';
import { View, Text, StyleSheet, FlatList } from 'react-native';
import { useRouter } from 'expo-router';
import CategoryCard from '@/components/common/CategoryCard';
import { Category } from '@/types';
import { useQuery } from '@tanstack/react-query';
import { categoryApi } from '@/lib/api';

const CategoriesSection = () => {
  const {
    data: categories,
    isLoading,
    error,
  } = useQuery<Category[]>({
    queryKey: ['categories'],
    queryFn: categoryApi.getAll,
  });
  return (
    <View style={styles.container}>
      <Text style={styles.title}>Categories</Text>

      <View style={styles.grid}>
        {categories?.map((category, index) => (
          <View key={category.id} style={styles.categoryCard}>
            <CategoryCard category={category} index={index} />
          </View>
        ))}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginBottom: 24,
    paddingHorizontal: 16,
  },
  title: {
    fontFamily: 'Inter-Bold',
    fontSize: 18,
    color: '#1E293B',
    marginBottom: 12,
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  categoryCard: {
    marginBottom: 12,
  },
});

export default CategoriesSection;
