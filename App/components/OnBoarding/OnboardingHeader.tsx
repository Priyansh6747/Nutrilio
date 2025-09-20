import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import Animated, { FadeIn, ZoomIn } from 'react-native-reanimated';
import { LinearGradient } from 'expo-linear-gradient';
import { MaterialCommunityIcons } from '@expo/vector-icons';

export const OnboardingHeader: React.FC = () => {
    return (
        <View style={styles.header}>
            <Animated.View entering={ZoomIn.delay(100)} style={styles.logoWrapper}>
                <LinearGradient
                    colors={['#10B981', '#059669']}
                    style={styles.logoGradient}
                >
                    <MaterialCommunityIcons name="nutrition" size={36} color="#fff" />
                </LinearGradient>
            </Animated.View>
            <Animated.Text entering={FadeIn.delay(200)} style={styles.appName}>
                Nutrilio
            </Animated.Text>
        </View>
    );
};

const styles = StyleSheet.create({
    header: {
        alignItems: 'center',
        marginBottom: 30,
    },
    logoWrapper: {
        marginBottom: 12,
    },
    logoGradient: {
        width: 72,
        height: 72,
        borderRadius: 24,
        justifyContent: 'center',
        alignItems: 'center',
        shadowColor: '#10B981',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 8,
        elevation: 6,
    },
    appName: {
        fontSize: 36,
        fontWeight: '800',
        color: '#000',
        letterSpacing: -1,
    },
});