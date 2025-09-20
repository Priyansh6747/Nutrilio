import React, { useRef, useEffect, useState } from 'react';
import {
    View,
    Text,
    TextInput,
    TouchableOpacity,
    Alert,
    ActivityIndicator,
    Animated,
    ScrollView,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { styles } from './Styles';

// Step 1: Basic Information (Display Name, Age, Gender)
export const BasicInfoStep = ({ displayName, setDisplayName, age, setAge, gender, setGender, onNext }) => {
    const fadeAnim = useRef(new Animated.Value(0)).current;
    const slideAnim = useRef(new Animated.Value(30)).current;
    const genderOptions = ['Male', 'Female', 'Non-binary', 'Prefer not to say'];

    useEffect(() => {
        Animated.parallel([
            Animated.timing(fadeAnim, {
                toValue: 1,
                duration: 800,
                useNativeDriver: true,
            }),
            Animated.timing(slideAnim, {
                toValue: 0,
                duration: 600,
                useNativeDriver: true,
            }),
        ]).start();
    }, []);

    const handleNext = () => {
        if (!displayName.trim()) {
            Alert.alert('Error', 'Please enter a display name');
            return;
        }
        if (displayName.trim().length < 2) {
            Alert.alert('Error', 'Display name must be at least 2 characters long');
            return;
        }
        if (!age) {
            Alert.alert('Error', 'Please enter your age');
            return;
        }
        const ageNum = parseInt(age);
        if (isNaN(ageNum) || ageNum < 13 || ageNum > 120) {
            Alert.alert('Error', 'Please enter a valid age between 13 and 120');
            return;
        }
        onNext();
    };

    return (
        <Animated.View
            style={[
                styles.stepContainer,
                {
                    opacity: fadeAnim,
                    transform: [{ translateY: slideAnim }]
                }
            ]}
        >
            <ScrollView showsVerticalScrollIndicator={false}>
                <View style={styles.stepHeader}>
                    <Text style={styles.stepTitle}>Let's get to know you</Text>
                    <Text style={styles.stepSubtitle}>Tell us your basic information</Text>
                </View>

                <View style={styles.inputSection}>
                    <Text style={styles.label}>Display Name *</Text>
                    <View style={styles.inputWrapper}>
                        <TextInput
                            style={styles.input}
                            placeholder="Enter your display name"
                            placeholderTextColor="#999"
                            value={displayName}
                            onChangeText={setDisplayName}
                            maxLength={50}
                            autoCapitalize="words"
                            returnKeyType="next"
                        />
                    </View>
                </View>

                <View style={styles.inputSection}>
                    <Text style={styles.label}>Age *</Text>
                    <View style={styles.inputWrapper}>
                        <TextInput
                            style={styles.input}
                            placeholder="Enter your age"
                            placeholderTextColor="#999"
                            value={age}
                            onChangeText={setAge}
                            keyboardType="numeric"
                            maxLength={3}
                            returnKeyType="done"
                        />
                    </View>
                </View>

                <View style={styles.inputSection}>
                    <Text style={styles.label}>Gender</Text>
                    <View style={styles.optionsGrid}>
                        {genderOptions.map((option) => (
                            <TouchableOpacity
                                key={option}
                                style={[
                                    styles.optionButton,
                                    gender === option && styles.optionButtonSelected
                                ]}
                                onPress={() => setGender(option)}
                                activeOpacity={0.8}
                            >
                                {gender === option ? (
                                    <LinearGradient
                                        colors={['#10B981', '#34D399']}
                                        style={styles.selectedOptionGradient}
                                    >
                                        <Text style={styles.optionTextSelected}>
                                            {option}
                                        </Text>
                                    </LinearGradient>
                                ) : (
                                    <Text style={styles.optionText}>
                                        {option}
                                    </Text>
                                )}
                            </TouchableOpacity>
                        ))}
                    </View>
                </View>

                <TouchableOpacity
                    style={styles.nextButton}
                    onPress={handleNext}
                    activeOpacity={0.9}
                >
                    <LinearGradient
                        colors={['#10B981', '#34D399']}
                        style={styles.nextButtonGradient}
                    >
                        <Text style={styles.nextButtonText}>Continue</Text>
                    </LinearGradient>
                </TouchableOpacity>
            </ScrollView>
        </Animated.View>
    );
};

// Step 2: Height & Weight (Optional)
export const HeightWeightStep = ({
                                     height,
                                     setHeight,
                                     weight,
                                     setWeight,
                                     onComplete,
                                     onBack,
                                     loading
                                 }) => {
    const fadeAnim = useRef(new Animated.Value(0)).current;
    const slideAnim = useRef(new Animated.Value(30)).current;

    useEffect(() => {
        Animated.parallel([
            Animated.timing(fadeAnim, {
                toValue: 1,
                duration: 800,
                useNativeDriver: true,
            }),
            Animated.timing(slideAnim, {
                toValue: 0,
                duration: 600,
                useNativeDriver: true,
            }),
        ]).start();
    }, []);

    const validateHeight = (value) => {
        if (!value) return true; // Optional field
        const heightNum = parseFloat(value);
        return !isNaN(heightNum) && heightNum >= 50 && heightNum <= 300; // cm
    };

    const validateWeight = (value) => {
        if (!value) return true; // Optional field
        const weightNum = parseFloat(value);
        return !isNaN(weightNum) && weightNum >= 20 && weightNum <= 500; // kg
    };

    const handleComplete = () => {
        if (height && !validateHeight(height)) {
            Alert.alert('Error', 'Please enter a valid height between 50-300 cm');
            return;
        }
        if (weight && !validateWeight(weight)) {
            Alert.alert('Error', 'Please enter a valid weight between 20-500 kg');
            return;
        }
        onComplete();
    };

    return (
        <Animated.View
            style={[
                styles.stepContainer,
                {
                    opacity: fadeAnim,
                    transform: [{ translateY: slideAnim }]
                }
            ]}
        >
            <ScrollView showsVerticalScrollIndicator={false}>
                <View style={styles.stepHeader}>
                    <Text style={styles.stepTitle}>Physical Information</Text>
                    <Text style={styles.stepSubtitle}>Optional - Help us personalize your experience</Text>
                </View>

                <View style={styles.inputSection}>
                    <Text style={styles.label}>Height (cm)</Text>
                    <Text style={styles.sublabel}>Optional - Enter your height in centimeters</Text>
                    <View style={styles.inputWrapper}>
                        <TextInput
                            style={styles.input}
                            placeholder="e.g. 170"
                            placeholderTextColor="#999"
                            value={height}
                            onChangeText={setHeight}
                            keyboardType="numeric"
                            maxLength={5}
                            returnKeyType="next"
                        />
                    </View>
                </View>

                <View style={styles.inputSection}>
                    <Text style={styles.label}>Weight (kg)</Text>
                    <Text style={styles.sublabel}>Optional - Enter your weight in kilograms</Text>
                    <View style={styles.inputWrapper}>
                        <TextInput
                            style={styles.input}
                            placeholder="e.g. 65"
                            placeholderTextColor="#999"
                            value={weight}
                            onChangeText={setWeight}
                            keyboardType="numeric"
                            maxLength={5}
                            returnKeyType="done"
                        />
                    </View>
                </View>

                <View style={styles.infoBox}>
                    <Text style={styles.infoText}>
                        💡 This information is optional and will help us provide better health and fitness recommendations.
                        You can skip this step or add it later in your profile settings.
                    </Text>
                </View>

                <View style={styles.buttonRow}>
                    <TouchableOpacity
                        style={styles.backButton}
                        onPress={onBack}
                        activeOpacity={0.7}
                        disabled={loading}
                    >
                        <Text style={styles.backButtonText}>Back</Text>
                    </TouchableOpacity>

                    <TouchableOpacity
                        style={[styles.nextButton, { flex: 1, marginLeft: 12 }]}
                        onPress={handleComplete}
                        activeOpacity={0.9}
                        disabled={loading}
                    >
                        <LinearGradient
                            colors={['#10B981', '#34D399']}
                            style={styles.nextButtonGradient}
                        >
                            {loading ? (
                                <ActivityIndicator color="#FFFFFF" size="small" />
                            ) : (
                                <Text style={styles.nextButtonText}>Complete Setup</Text>
                            )}
                        </LinearGradient>
                    </TouchableOpacity>
                </View>
            </ScrollView>
        </Animated.View>
    );
};