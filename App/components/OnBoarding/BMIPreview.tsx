import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import Animated, { ZoomIn } from 'react-native-reanimated';
import { LinearGradient } from 'expo-linear-gradient';
import { MaterialCommunityIcons } from '@expo/vector-icons';

interface BMIPreviewProps {
    weight: string;
    height: string;
}

export const BMIPreview: React.FC<BMIPreviewProps> = ({ weight, height }) => {
    const calculateBMI = (): number | null => {
        const weightNum = parseFloat(weight);
        const heightNum = parseFloat(height);

        if (!weightNum || !heightNum || weightNum <= 0 || heightNum <= 0) {
            return null;
        }

        const heightInMeters = heightNum / 100;
        return weightNum / Math.pow(heightInMeters, 2);
    };

    const bmi = calculateBMI();

    if (!bmi) {
        return null;
    }

    return (
        <Animated.View entering={ZoomIn} style={styles.bmiCard}>
            <LinearGradient
                colors={['#EBF5FF', '#DBEAFE']}
                style={styles.bmiGradient}
            >
                <MaterialCommunityIcons name="chart-line" size={20} color="#3b82f6" />
                <Text style={styles.bmiText}>
                    BMI Preview: {bmi.toFixed(1)}
                </Text>
            </LinearGradient>
        </Animated.View>
    );
};

const styles = StyleSheet.create({
    bmiCard: {
        marginTop: 16,
        borderRadius: 16,
        overflow: 'hidden',
    },
    bmiGradient: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        padding: 16,
        gap: 8,
    },
    bmiText: {
        fontSize: 14,
        fontWeight: '600',
        color: '#3b82f6',
    },
});