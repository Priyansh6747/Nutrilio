import React from 'react';
import { View, StyleSheet } from 'react-native';
import Animated, {
    useAnimatedStyle,
    useSharedValue,
    withSequence,
    withTiming,
    interpolate,
} from 'react-native-reanimated';

interface DecorativeElementsProps {
    variant: 'step1' | 'step2';
}

export const DecorativeElements: React.FC<DecorativeElementsProps> = ({ variant }) => {
    const floatingAnimation = useSharedValue(0);

    React.useEffect(() => {
        floatingAnimation.value = withSequence(
            withTiming(1, { duration: 2000 }),
            withTiming(0, { duration: 2000 })
        );
    }, []);

    const floatingStyle = useAnimatedStyle(() => {
        return {
            transform: [
                {
                    translateY: interpolate(
                        floatingAnimation.value,
                        [0, 1],
                        [0, -10]
                    ),
                },
            ],
        };
    });

    if (variant === 'step1') {
        return (
            <>
                <Animated.View style={[styles.decorativeCircle1, floatingStyle]} />
                <Animated.View style={[styles.decorativeCircle2, floatingStyle]} />
            </>
        );
    }

    return (
        <>
            <View style={styles.decorativeDot1} />
            <View style={styles.decorativeDot2} />
            <View style={styles.decorativeDot3} />
        </>
    );
};

const styles = StyleSheet.create({
    decorativeCircle1: {
        position: 'absolute',
        width: 80,
        height: 80,
        borderRadius: 40,
        backgroundColor: 'rgba(16, 185, 129, 0.1)',
        top: -20,
        right: -20,
    },
    decorativeCircle2: {
        position: 'absolute',
        width: 60,
        height: 60,
        borderRadius: 30,
        backgroundColor: 'rgba(245, 158, 11, 0.1)',
        bottom: 40,
        left: -20,
    },
    decorativeDot1: {
        position: 'absolute',
        width: 12,
        height: 12,
        borderRadius: 6,
        backgroundColor: 'rgba(59, 130, 246, 0.3)',
        top: 20,
        right: 40,
    },
    decorativeDot2: {
        position: 'absolute',
        width: 8,
        height: 8,
        borderRadius: 4,
        backgroundColor: 'rgba(245, 158, 11, 0.3)',
        top: 50,
        left: 30,
    },
    decorativeDot3: {
        position: 'absolute',
        width: 16,
        height: 16,
        borderRadius: 8,
        backgroundColor: 'rgba(16, 185, 129, 0.2)',
        bottom: 60,
        right: 50,
    },
});