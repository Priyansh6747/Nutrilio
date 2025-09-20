import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import Animated, {
    useAnimatedStyle,
    useSharedValue,
    withSpring,
    useDerivedValue
} from 'react-native-reanimated';

interface ProgressIndicatorProps {
    currentStep: number;
}

export const ProgressIndicator: React.FC<ProgressIndicatorProps> = ({ currentStep }) => {
    const progressValue = useDerivedValue(() => {
        return currentStep === 1 ? 50 : 100;
    });

    const animatedProgressStyle = useAnimatedStyle(() => {
        return {
            width: `${withSpring(progressValue.value)}%`,
        };
    });

    return (
        <View style={styles.progressWrapper}>
            <View style={styles.progressBackground}>
                <Animated.View style={[styles.progressFill, animatedProgressStyle]} />
            </View>
            <View style={styles.stepIndicators}>
                <View style={[styles.stepDot, currentStep >= 1 && styles.stepDotActive]}>
                    <Text style={[styles.stepNumber, currentStep >= 1 && styles.stepNumberActive]}>1</Text>
                </View>
                <View style={[styles.stepLine, currentStep >= 2 && styles.stepLineActive]} />
                <View style={[styles.stepDot, currentStep >= 2 && styles.stepDotActive]}>
                    <Text style={[styles.stepNumber, currentStep >= 2 && styles.stepNumberActive]}>2</Text>
                </View>
            </View>
        </View>
    );
};

const styles = StyleSheet.create({
    progressWrapper: {
        marginBottom: 30,
    },
    progressBackground: {
        height: 4,
        backgroundColor: 'rgba(255, 255, 255, 0.5)',
        borderRadius: 2,
        overflow: 'hidden',
    },
    progressFill: {
        height: '100%',
        backgroundColor: '#10B981',
        borderRadius: 2,
    },
    stepIndicators: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        marginTop: 16,
    },
    stepDot: {
        width: 32,
        height: 32,
        borderRadius: 16,
        backgroundColor: 'rgba(255, 255, 255, 0.8)',
        justifyContent: 'center',
        alignItems: 'center',
    },
    stepDotActive: {
        backgroundColor: '#10B981',
    },
    stepNumber: {
        fontSize: 14,
        fontWeight: '700',
        color: '#000',
    },
    stepNumberActive: {
        color: '#fff',
    },
    stepLine: {
        width: 60,
        height: 2,
        backgroundColor: 'rgba(255, 255, 255, 0.5)',
        marginHorizontal: 8,
    },
    stepLineActive: {
        backgroundColor: '#10B981',
    },
});