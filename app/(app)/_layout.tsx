import { Tabs } from 'expo-router';
import {
  Home,
  MessageCircleQuestion,
  Package,
  Search,
  ShoppingCart,
  User,
} from 'lucide-react-native';
import { colors } from '@/constants/colors';
import { fonts } from '@/constants/fonts';
import { useCartStore } from '@/lib/cart/cart-store';
import { useAuth } from '@/lib/auth/auth-provider';

export default function AppLayout() {
  const { isAdmin } = useAuth();
  const cartItemsCount = useCartStore((state) => state.getTotalItems());

  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarStyle: {
          backgroundColor: colors.card,
          borderTopColor: colors.border,
          height: 60,
          paddingBottom: 8,
        },
        tabBarLabelStyle: {
          fontFamily: fonts.medium,
          fontSize: 12,
          marginTop: -4,
        },
        tabBarActiveTintColor: colors.primary,
        tabBarInactiveTintColor: colors.textLight,
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: 'Home',
          tabBarIcon: ({ color, size }) => <Home size={size} color={color} />,
        }}
      />
      <Tabs.Screen
        name="search"
        options={{
          title: 'Search',
          tabBarIcon: ({ color, size }) => <Search color={color} size={size} />,
        }}
      />
      <Tabs.Screen
        name="orders"
        options={{
          title: isAdmin ? 'Orders' : 'My Orders',
          tabBarIcon: ({ color, size }) => (
            <Package size={size} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="cart"
        options={{
          title: 'Cart',
          tabBarIcon: ({ color, size }) => (
            <ShoppingCart size={size} color={color} />
          ),
          tabBarBadge: cartItemsCount > 0 ? cartItemsCount : undefined,
          tabBarBadgeStyle: {
            backgroundColor: colors.primary,
            fontSize: 10,
          },
        }}
      />
      <Tabs.Screen
        name="request"
        options={{
          // title: 'Request',
          // tabBarIcon: ({ color, size }) => (
          //   <MessageCircleQuestion size={size} color={color} />
          // ),
          href: null,
        }}
      />
      <Tabs.Screen
        name="profile"
        options={{
          title: 'Profile',
          tabBarIcon: ({ color, size }) => <User size={size} color={color} />,
        }}
      />

      {/* Hidden screens not displayed in the tab bar */}
      <Tabs.Screen
        name="product/[id]"
        options={{
          href: null,
        }}
      />
      <Tabs.Screen
        name="request/[id]"
        options={{
          href: null,
        }}
      />
      <Tabs.Screen
        name="category/[id]"
        options={{
          href: null,
        }}
      />
      <Tabs.Screen
        name="order/[id]"
        options={{
          href: null,
        }}
      />
      <Tabs.Screen
        name="notifications"
        options={{
          href: null,
        }}
      />
      {isAdmin && (
        <>
          <Tabs.Screen
            name="admin/products"
            options={{
              href: null,
            }}
          />
          <Tabs.Screen
            name="admin/categories"
            options={{
              href: null,
            }}
          />
          <Tabs.Screen
            name="admin/add-product"
            options={{
              href: null,
            }}
          />
          <Tabs.Screen
            name="admin/edit-product/[id]"
            options={{
              href: null,
            }}
          />
        </>
      )}
    </Tabs>
  );
}
