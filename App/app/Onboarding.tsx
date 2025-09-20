import { useUser } from '@/hooks/authContext';
import { router } from 'expo-router';
import { updateProfile } from 'firebase/auth';
import React, { useState } from 'react';
import {
    Alert,
    StyleSheet,
    Text,
    View,
    KeyboardAvoidingView,
    Platform,
    ScrollView,
    Dimensions,
} from 'react-native';
import Animated, {
    FadeIn,
    ZoomIn,
    useAnimatedStyle,
    withSpring,
    useSharedValue,
} from 'react-native-reanimated';
import { LinearGradient } from 'expo-linear-gradient';
import { MaterialCommunityIcons } from '@expo/vector-icons';

import Step1 from '../components/OnBoarding/Step1';
import Step2 from '../components/OnBoarding/step2';
import BackendConfig from "@/BackendConfig";
import baseURL from "@/BackendConfig";

const { width: screenWidth, height: screenHeight } = Dimensions.get('window');

interface FormData {
    nickname: string;
    age: string;
    gender: 'male' | 'female' | 'other' | '';
    weight: string;
    height: string;
}

interface FormErrors {
    nickname?: string;
    age?: string;
    gender?: string;
    weight?: string;
    height?: string;
}

const Onboarding: React.FC = () => {
    const { user, updateUser } = useUser();
    const [currentStep, setCurrentStep] = useState(1);
    const [isLoading, setIsLoading] = useState(false);
    const [formData, setFormData] = useState<FormData>({
        nickname: '',
        age: '',
        gender: '',
        weight: '',
        height: '',
    });
    const [errors, setErrors] = useState<FormErrors>({});

    // Animation values
    const progressWidth = useSharedValue(0);

    React.useEffect(() => {
        progressWidth.value = withSpring(currentStep === 1 ? 50 : 100);
    }, [currentStep]);

    const validateStep1 = () => {
        const newErrors: FormErrors = {};

        if (!formData.nickname.trim()) {
            newErrors.nickname = 'Give yourself a cool nickname!';
        } else if (formData.nickname.length < 2) {
            newErrors.nickname = 'Make it at least 2 characters';
        }

        if (!formData.age) {
            newErrors.age = 'We need to know your age';
        } else if (parseInt(formData.age) < 1 || parseInt(formData.age) > 120) {
            newErrors.age = 'Enter a valid age';
        }

        if (!formData.gender) {
            newErrors.gender = 'Select how you identify';
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleNext = () => {
        if (validateStep1()) {
            setCurrentStep(2);
            setErrors({});
        }
    };

    const handleBack = () => {
        setCurrentStep(1);
        setErrors({});
    };

    const handleSubmit = async (skipOptional: boolean = false) => {
        if (!user) {
            Alert.alert('Error', 'No user found. Please try logging in again.');
            return;
        }

        setIsLoading(true);

        try {
            const apiData = {
                username: user.uid,
                nickname: formData.nickname,
                gender: formData.gender,
                age: parseInt(formData.age),
                ...(formData.height && !skipOptional && { height: parseFloat(formData.height) }),
                ...(formData.weight && !skipOptional && { weight: parseFloat(formData.weight) }),
            };



            const URL = baseURL + '/api/v1/user/init';
            console.log(URL);
            console.log(apiData);

            const response = await fetch(URL, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(apiData),
            });

            if (!response.ok) {
                throw new Error('Failed to save profile data');
            }

            await updateProfile(user, {
                displayName: formData.nickname,
            });

            await user.reload();
            updateUser(user);

            router.replace('/(tabs)');
        } catch (error) {
            console.error('Error completing onboarding:', error);
            Alert.alert('Error', 'Failed to complete onboarding. Please try again.');
        } finally {
            setIsLoading(false);
        }
    };

    const animatedProgressStyle = useAnimatedStyle(() => {
        return {
            width: `${progressWidth.value}%`,
        };
    });

    return (
        <KeyboardAvoidingView
            style={styles.container}
            behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        >
            <LinearGradient
                colors={['#ffedd4', '#fed7aa']}
                style={styles.backgroundGradient}
            />

            <ScrollView
                contentContainerStyle={styles.scrollContainer}
                keyboardShouldPersistTaps="handled"
                showsVerticalScrollIndicator={false}
            >
                {/* Header */}
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

                {/* Progress Indicator */}
                <View style={styles.progressWrapper}>
                    <View style={styles.progressBackground}>
                        <Animated.View style={[styles.progressFill, animatedProgressStyle]} />
                    </View>
                    <View style={styles.stepIndicators}>
                        <View style={[styles.stepDot, currentStep >= 1 && styles.stepDotActive]}>
                            <Text style={styles.stepNumber}>1</Text>
                        </View>
                        <View style={[styles.stepLine, currentStep >= 2 && styles.stepLineActive]} />
                        <View style={[styles.stepDot, currentStep >= 2 && styles.stepDotActive]}>
                            <Text style={styles.stepNumber}>2</Text>
                        </View>
                    </View>
                </View>

                {/* Form Steps */}
                <View style={styles.formCard}>
                    {currentStep === 1 ? (
                        <Step1
                            formData={formData}
                            setFormData={setFormData}
                            errors={errors}
                            setErrors={setErrors}
                            onNext={handleNext}
                        />
                    ) : (
                        <Step2
                            formData={formData}
                            setFormData={setFormData}
                            onBack={handleBack}
                            onSubmit={handleSubmit}
                            isLoading={isLoading}
                        />
                    )}
                </View>
            </ScrollView>
        </KeyboardAvoidingView>
    );
};

export default Onboarding;

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    backgroundGradient: {
        position: 'absolute',
        left: 0,
        right: 0,
        top: 0,
        bottom: 0,
    },
    scrollContainer: {
        flexGrow: 1,
        paddingHorizontal: 20,
        paddingTop: 20,
        paddingBottom: 40,
    },
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
    stepLine: {
        width: 60,
        height: 2,
        backgroundColor: 'rgba(255, 255, 255, 0.5)',
        marginHorizontal: 8,
    },
    stepLineActive: {
        backgroundColor: '#10B981',
    },
    formCard: {
        backgroundColor: 'rgba(255, 255, 255, 0.95)',
        borderRadius: 32,
        minHeight: 500,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 10 },
        shadowOpacity: 0.1,
        shadowRadius: 20,
        elevation: 10,
        overflow: 'hidden',
    },
});