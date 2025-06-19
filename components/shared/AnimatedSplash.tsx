import React, { useEffect, useRef } from 'react';
import { View, StyleSheet, Dimensions } from 'react-native';
import LottieView from 'lottie-react-native';

interface AnimatedSplashProps {
  onAnimationFinish?: () => void;
}

const { width, height } = Dimensions.get('window');

export const AnimatedSplash: React.FC<AnimatedSplashProps> = ({
  onAnimationFinish,
}) => {
  const animation = useRef<LottieView>(null);

  useEffect(() => {
    if (animation.current) {
      animation.current.play();
    }
  }, []);

  return (
    <View style={styles.container}>
      <LottieView
        ref={animation}
        source={require('@/assets/animations/splash.json')}
        style={styles.animation}
        autoPlay={false}
        loop={false}
        onAnimationFinish={onAnimationFinish}
        resizeMode="contain"
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
  },
  animation: {
    width: width * 0.8,
    height: height * 0.8,
  },
});
