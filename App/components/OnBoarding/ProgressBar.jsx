import React from 'react';
import { View, Text, Animated } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { styles } from './Styles';

const ProgressBar = ({ currentStep, totalSteps }) => {
    const progress = (currentStep / totalSteps) * 100;

    return (
        <View style={styles.progressContainer}>
            <View style={styles.progressBar}>
                <Animated.View style={[styles.progressFill, { width: `${progress}%` }]}>
                    <LinearGradient
                        colors={['#10B981', '#34D399']}
                        style={styles.progressGradient}
                        start={{ x: 0, y: 0 }}
                        end={{ x: 1, y: 0 }}
                    />
                </Animated.View>
            </View>
            <Text style={styles.progressText}>{currentStep} of {totalSteps}</Text>
        </View>
    );
};

export default ProgressBar;