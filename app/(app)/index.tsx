import React, { useMemo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
} from 'react-native';
import { ShoppingBag } from 'lucide-react-native';
import {
  SafeAreaView,
  useSafeAreaInsets,
} from 'react-native-safe-area-context';
import PromoCarousel from '@/components/home/PromoCarousel';
import FeaturedProducts from '@/components/home/FeaturedProducts';
import CategoriesSection from '@/components/home/CategoriesSection';
import {
  useBestSellingProducts,
  useFeaturedProducts,
  useNewProducts,
} from '@/hooks/use-products';
import { NotiBell } from '@/components/shared/NotiBell';

export default function HomeScreen() {
  const insets = useSafeAreaInsets();
  const { data: featureProducts } = useFeaturedProducts();
  const { data: newProducts } = useNewProducts();
  const { data: bestProducts } = useBestSellingProducts();

  // Get greeting based on current time
  const greeting = useMemo(() => {
    const currentHour = new Date().getHours();

    if (currentHour >= 5 && currentHour < 12) {
      return 'Good Morning';
    } else if (currentHour >= 12 && currentHour < 17) {
      return 'Good Afternoon';
    } else if (currentHour >= 17 && currentHour < 21) {
      return 'Good Evening';
    } else {
      return 'Good Night';
    }
  }, []);

  return (
    <SafeAreaView style={styles.container}>
      <View style={[styles.header, { paddingTop: insets.top > 0 ? 0 : 16 }]}>
        <View>
          <Text style={styles.greeting}>{greeting}</Text>
          <Text style={styles.locationText}>
            Delivery to <Text style={styles.locationHighlight}>Home</Text>
          </Text>
        </View>

        <NotiBell />
      </View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        <View style={styles.carouselContainer}>
          <PromoCarousel />
        </View>

        <FeaturedProducts
          title="Featured Products"
          products={featureProducts?.products || []}
          type="featured"
        />

        <CategoriesSection />

        <FeaturedProducts
          title="Best Selling"
          products={bestProducts?.products || []}
          type="best-selling"
        />

        <FeaturedProducts
          title="New Arrivals"
          products={newProducts?.products || []}
          type="new-arrivals"
        />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingBottom: 16,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#F1F5F9',
  },
  greeting: {
    fontFamily: 'Inter-Bold',
    fontSize: 18,
    color: '#1E293B',
    marginBottom: 4,
  },
  locationText: {
    fontFamily: 'Inter-Regular',
    fontSize: 14,
    color: '#64748B',
  },
  locationHighlight: {
    fontFamily: 'Inter-SemiBold',
    color: '#1E40AF',
  },
  cartButton: {
    position: 'relative',
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#F1F5F9',
    justifyContent: 'center',
    alignItems: 'center',
  },
  cartBadge: {
    position: 'absolute',
    top: -4,
    right: -4,
    backgroundColor: '#F97316',
    width: 18,
    height: 18,
    borderRadius: 9,
    justifyContent: 'center',
    alignItems: 'center',
  },
  cartBadgeText: {
    fontFamily: 'Inter-Bold',
    fontSize: 10,
    color: '#FFFFFF',
  },
  scrollContent: {
    paddingBottom: 24,
  },
  carouselContainer: {
    paddingHorizontal: 16,
    marginTop: 16,
  },
});
