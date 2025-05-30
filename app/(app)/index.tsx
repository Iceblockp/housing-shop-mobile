import React, { useState } from 'react';
import { StyleSheet, View, Text, TextInput } from 'react-native';
import { Search, X } from 'lucide-react-native';
import { Container } from '@/components/shared/Container';
import { Header } from '@/components/shared/Header';
import { CategoryList } from '@/components/home/CategoryList';
import { ProductList } from '@/components/home/ProductList';
import { colors } from '@/constants/colors';
import { fonts } from '@/constants/fonts';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useQueryClient } from '@tanstack/react-query';

export default function HomeScreen() {
  const [searchQuery, setSearchQuery] = useState('');
  const queryClient = useQueryClient();

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: 'white' }}>
      <View style={styles.container}>
        <Header title="HomeShop" showBack={false} />

        <Container
          scrollable={false}
          onRefresh={() =>
            queryClient.invalidateQueries({ queryKey: ['products'] })
          }
        >
          <View style={styles.searchContainer}>
            <Search
              size={20}
              color={colors.textLight}
              style={styles.searchIcon}
            />
            <TextInput
              style={styles.searchInput}
              placeholder="Search products..."
              placeholderTextColor={colors.textLight}
              value={searchQuery}
              onChangeText={setSearchQuery}
            />
            {searchQuery && (
              <X
                size={20}
                color={colors.textLight}
                style={styles.searchIcon}
                onPress={() => setSearchQuery('')}
              />
            )}
          </View>

          {searchQuery ? (
            <ProductList
              title={`Search Results for "${searchQuery}"`}
              searchQuery={searchQuery}
            />
          ) : (
            <>
              {/* <CategoryList /> */}
              <ProductList header={CategoryList} title="All Products" />
            </>
          )}
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
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.card,
    borderRadius: 8,
    paddingHorizontal: 12,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: colors.border,
  },
  searchIcon: {
    marginRight: 8,
  },
  searchInput: {
    flex: 1,
    height: 44,
    fontFamily: fonts.regular,
    fontSize: 16,
    color: colors.text,
  },
});
