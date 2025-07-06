import React, { useEffect, useRef } from 'react';
import { View, Animated, Dimensions, StyleSheet } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';

interface SkeletonLoaderProps {
  width?: number | string;
  height?: number;
  borderRadius?: number;
  style?: any;
}

const { width: screenWidth } = Dimensions.get('window');

export const SkeletonLoader: React.FC<SkeletonLoaderProps> = ({
  width = '100%',
  height = 20,
  borderRadius = 4,
  style,
}) => {
  const animatedValue = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    const animate = () => {
      Animated.sequence([
        Animated.timing(animatedValue, {
          toValue: 1,
          duration: 1000,
          useNativeDriver: true,
        }),
        Animated.timing(animatedValue, {
          toValue: 0,
          duration: 1000,
          useNativeDriver: true,
        }),
      ]).start(() => animate());
    };

    animate();
  }, [animatedValue]);

  const translateX = animatedValue.interpolate({
    inputRange: [0, 1],
    outputRange: [-screenWidth, screenWidth],
  });

  return (
    <View
      style={[
        styles.container,
        {
          width,
          height,
          borderRadius,
        },
        style,
      ]}
    >
      <Animated.View
        style={[
          styles.shimmer,
          {
            transform: [{ translateX }],
          },
        ]}
      >
        <LinearGradient
          colors={['transparent', 'rgba(255,255,255,0.8)', 'transparent']}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 0 }}
          style={styles.gradient}
        />
      </Animated.View>
    </View>
  );
};

// Pre-built skeleton components for common use cases
export const ItemCardSkeleton: React.FC = () => (
  <View style={styles.itemCardSkeleton}>
    <SkeletonLoader height={200} borderRadius={12} style={{ marginBottom: 12 }} />
    <SkeletonLoader height={16} width="80%" style={{ marginBottom: 8 }} />
    <SkeletonLoader height={14} width="60%" style={{ marginBottom: 8 }} />
    <View style={styles.skeletonRow}>
      <SkeletonLoader height={12} width={60} />
      <SkeletonLoader height={12} width={40} />
    </View>
  </View>
);

export const CategoryCardSkeleton: React.FC = () => (
  <View style={styles.categoryCardSkeleton}>
    <SkeletonLoader width={60} height={60} borderRadius={30} style={{ marginBottom: 8 }} />
    <SkeletonLoader height={12} width={50} />
  </View>
);

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#E0E0E0',
    overflow: 'hidden',
  },
  shimmer: {
    flex: 1,
    width: '30%',
  },
  gradient: {
    flex: 1,
  },
  itemCardSkeleton: {
    width: screenWidth * 0.7,
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 16,
    marginRight: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  categoryCardSkeleton: {
    alignItems: 'center',
    marginRight: 20,
    width: 80,
  },
  skeletonRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
});
