import { Event, useActiveEvents } from '@/hooks/use-events';
import React, { useState, useRef, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Image,
  Dimensions,
  TouchableOpacity,
  FlatList,
} from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  interpolate,
  Extrapolate,
} from 'react-native-reanimated';

const { width } = Dimensions.get('window');

interface PromoItem {
  id: string;
  title: string;
  description: string;
  image: string;
  backgroundColor: string;
}

const initialPromo: Event[] = [
  {
    id: '15443',
    title: 'No more Event',
    description: 'Thank You for shopping!',
    isActive: true,
    imageUrl: '',
    createdAt: '2023-08-17T14:30:00Z',
    updatedAt: '2023-08-14T12:00:00Z',
  },
];

const PromoCarousel: React.FC = () => {
  const [activeIndex, setActiveIndex] = useState(0);
  const flatListRef = useRef<FlatList>(null);
  const scrollX = useSharedValue(0);
  const { data: events } = useActiveEvents();

  const promos = events?.events
    ? [...events.events, ...initialPromo]
    : initialPromo;

  // Auto scroll functionality
  useEffect(() => {
    const timer = setInterval(() => {
      const nextIndex = (activeIndex + 1) % Math.max(promos.length || 1, 1);
      flatListRef?.current?.scrollToIndex({
        index: nextIndex,
        animated: true,
      });
      setActiveIndex(nextIndex);
    }, 5000);

    return () => clearInterval(timer);
  }, [events?.events?.length]);

  const renderItem = ({ item, index }: { item: Event; index: number }) => {
    return (
      <View style={[styles.slide, { backgroundColor: '#DCFCE7', width }]}>
        <View style={styles.textContainer}>
          <Text style={styles.title}>{item.title}</Text>
          <Text style={styles.description}>{item.description}</Text>
          <TouchableOpacity style={styles.button}>
            <Text style={styles.buttonText}>Shop Now</Text>
          </TouchableOpacity>
        </View>
        <Image
          source={{ uri: item.imageUrl || undefined }}
          style={styles.image}
        />
      </View>
    );
  };

  const onScroll = (event: any) => {
    const offsetX = event.nativeEvent.contentOffset.x;
    scrollX.value = offsetX;
    const index = Math.round(offsetX / width);
    if (index !== activeIndex) {
      setActiveIndex(index);
    }
  };

  return (
    <View style={styles.container}>
      <FlatList
        ref={flatListRef}
        data={promos}
        keyExtractor={(item) => item.id}
        renderItem={renderItem}
        horizontal
        pagingEnabled
        showsHorizontalScrollIndicator={false}
        onScroll={onScroll}
        scrollEventThrottle={16}
      />

      <View style={styles.pagination}>
        {promos.map((_, index) => (
          <Animated.View
            key={index}
            style={[
              styles.dot,
              {
                backgroundColor: index === activeIndex ? '#1E40AF' : '#CBD5E1',
              },
            ]}
          />
        ))}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    height: 180,
    marginBottom: 24,
  },
  slide: {
    flexDirection: 'row',
    height: 180,
    borderRadius: 12,
    overflow: 'hidden',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 16,
  },
  textContainer: {
    flex: 1,
    paddingRight: 16,
  },
  title: {
    fontFamily: 'Inter-Bold',
    fontSize: 18,
    color: '#1E293B',
    marginBottom: 4,
  },
  description: {
    fontFamily: 'Inter-Medium',
    fontSize: 14,
    color: '#475569',
    marginBottom: 12,
  },
  button: {
    backgroundColor: '#1E40AF',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 6,
    alignSelf: 'flex-start',
  },
  buttonText: {
    fontFamily: 'Inter-SemiBold',
    fontSize: 14,
    color: '#FFFFFF',
  },
  image: {
    width: '50%',
    height: 120,
    borderRadius: 12,
  },
  pagination: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 12,
  },
  dot: {
    height: 8,
    width: 8,
    borderRadius: 4,
    marginHorizontal: 4,
  },
});

export default PromoCarousel;
