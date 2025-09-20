import React from 'react';
import {
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
    TextInput,
    Pressable,
} from 'react-native';
import Animated, {
    FadeIn,
    SlideInRight,
    SlideOutLeft,
    useAnimatedStyle,
    withSpring,
    useSharedValue,
    interpolate,
} from 'react-native-reanimated';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';

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

interface Step1Props {
    formData: FormData;
    setFormData: (data: FormData) => void;
    errors: FormErrors;
    setErrors: (errors: FormErrors) => void;
    onNext: () => void;
}

const Step1: React.FC<Step1Props> = ({
                                         formData,
                                         setFormData,
                                         errors,
                                         setErrors,
                                         onNext
                                     }) => {
    const buttonScale = useSharedValue(1);
    const floatingAnimation = useSharedValue(0);

    React.useEffect(() => {
        // Simple floating animation for decorative elements
        floatingAnimation.value = withSpring(1, { duration: 3000 });
    }, [floatingAnimation]);

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

    return (
        <Animated.View
            entering={SlideInRight.springify()}
            exiting={SlideOutLeft.springify()}
            style={styles.stepContainer}
        >
            {/* Decorative Elements */}
            <Animated.View style={[styles.decorativeCircle1, floatingStyle]} />
            <Animated.View style={[styles.decorativeCircle2, floatingStyle]} />

            <View style={styles.contentWrapper}>
                <Animated.View entering={FadeIn.delay(200)}>
                    <Text style={styles.stepTitle}>Hello there! 👋</Text>
                    <Text style={styles.stepSubtitle}>Let's make this personal</Text>
                </Animated.View>

                <Animated.View entering={FadeIn.delay(300)} style={styles.formSection}>
                    {/* Nickname Field */}
                    <View style={styles.fieldContainer}>
                        <View style={styles.fieldHeader}>
                            <Text style={styles.fieldLabel}>Nickname</Text>
                            <Text style={styles.fieldHint}>What your friends call you</Text>
                        </View>
                        <View style={[styles.inputContainer, errors.nickname && styles.inputError]}>
                            <TextInput
                                style={styles.input}
                                placeholder="Johnny, Alex, Sam..."
                                placeholderTextColor="#C4B5A0"
                                value={formData.nickname}
                                onChangeText={(text) => {
                                    setFormData({ ...formData, nickname: text });
                                    if (errors.nickname) setErrors({ ...errors, nickname: '' });
                                }}
                                autoCapitalize="words"
                            />
                            <MaterialCommunityIcons
                                name="account-heart"
                                size={24}
                                color={errors.nickname ? '#EF4444' : '#f59e0b'}
                            />
                        </View>
                        {errors.nickname && (
                            <Animated.Text entering={FadeIn} style={styles.errorText}>
                                {errors.nickname}
                            </Animated.Text>
                        )}
                    </View>

                    {/* Age Field */}
                    <View style={styles.fieldContainer}>
                        <View style={styles.fieldHeader}>
                            <Text style={styles.fieldLabel}>Age</Text>
                            <Text style={styles.fieldHint}>Your current age</Text>
                        </View>
                        <View style={[styles.inputContainer, errors.age && styles.inputError]}>
                            <TextInput
                                style={styles.input}
                                placeholder="25"
                                placeholderTextColor="#C4B5A0"
                                value={formData.age}
                                onChangeText={(text) => {
                                    setFormData({ ...formData, age: text.replace(/[^0-9]/g, '') });
                                    if (errors.age) setErrors({ ...errors, age: '' });
                                }}
                                keyboardType="number-pad"
                                maxLength={3}
                            />
                            <MaterialCommunityIcons
                                name="cake-variant"
                                size={24}
                                color={errors.age ? '#EF4444' : '#f59e0b'}
                            />
                        </View>
                        {errors.age && (
                            <Animated.Text entering={FadeIn} style={styles.errorText}>
                                {errors.age}
                            </Animated.Text>
                        )}
                    </View>

                    {/* Gender Selection */}
                    <View style={styles.fieldContainer}>
                        <View style={styles.fieldHeader}>
                            <Text style={styles.fieldLabel}>Gender</Text>
                            <Text style={styles.fieldHint}>How do you identify?</Text>
                        </View>
                        <View style={styles.genderGrid}>
                            {[
                                { value: 'male', icon: 'gender-male', label: 'Male' },
                                { value: 'female', icon: 'gender-female', label: 'Female' },
                                { value: 'other', icon: 'gender-non-binary', label: 'Other' },
                            ].map((option) => (
                                <Pressable
                                    key={option.value}
                                    onPress={() => {
                                        setFormData({ ...formData, gender: option.value as any });
                                        if (errors.gender) setErrors({ ...errors, gender: '' });
                                    }}
                                    style={({ pressed }) => [
                                        styles.genderOption,
                                        formData.gender === option.value && styles.genderOptionActive,
                                        pressed && styles.genderOptionPressed,
                                    ]}
                                >
                                    <MaterialCommunityIcons
                                        name={option.icon as any}
                                        size={32}
                                        color={formData.gender === option.value ? '#fff' : '#3b82f6'}
                                    />
                                    <Text style={[
                                        styles.genderLabel,
                                        formData.gender === option.value && styles.genderLabelActive
                                    ]}>
                                        {option.label}
                                    </Text>
                                </Pressable>
                            ))}
                        </View>
                        {errors.gender && (
                            <Animated.Text entering={FadeIn} style={styles.errorText}>
                                {errors.gender}
                            </Animated.Text>
                        )}
                    </View>
                </Animated.View>

                <Animated.View entering={FadeIn.delay(400)} style={styles.buttonContainer}>
                    <Pressable
                        onPress={onNext}
                        onPressIn={() => buttonScale.value = withSpring(0.95)}
                        onPressOut={() => buttonScale.value = withSpring(1)}
                    >
                        <Animated.View
                            style={[
                                styles.nextButton,
                                useAnimatedStyle(() => ({
                                    transform: [{ scale: buttonScale.value }],
                                })),
                            ]}
                        >
                            <LinearGradient
                                colors={['#10B981', '#059669']}
                                style={styles.gradientButton}
                                start={{ x: 0, y: 0 }}
                                end={{ x: 1, y: 1 }}
                            >
                                <Text style={styles.nextButtonText}>Continue</Text>
                                <Ionicons name="arrow-forward" size={22} color="#fff" />
                            </LinearGradient>
                        </Animated.View>
                    </Pressable>
                </Animated.View>
            </View>
        </Animated.View>
    );
};

export default Step1;

const styles = StyleSheet.create({
    stepContainer: {
        flex: 1,
        position: 'relative',
    },
    contentWrapper: {
        padding: 28,
    },
    stepTitle: {
        fontSize: 32,
        fontWeight: '700',
        color: '#000',
        marginBottom: 8,
    },
    stepSubtitle: {
        fontSize: 16,
        color: '#6B7280',
        marginBottom: 32,
    },
    formSection: {
        marginBottom: 24,
    },
    fieldContainer: {
        marginBottom: 24,
    },
    fieldHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 10,
    },
    fieldLabel: {
        fontSize: 15,
        fontWeight: '600',
        color: '#000',
    },
    fieldHint: {
        fontSize: 12,
        color: '#9CA3AF',
    },
    inputContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#fff',
        borderRadius: 16,
        paddingHorizontal: 18,
        height: 56,
        borderWidth: 2,
        borderColor: 'transparent',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.05,
        shadowRadius: 4,
        elevation: 2,
    },
    inputError: {
        borderColor: '#EF4444',
    },
    input: {
        flex: 1,
        fontSize: 16,
        color: '#000',
        fontWeight: '500',
    },
    errorText: {
        fontSize: 12,
        color: '#EF4444',
        marginTop: 6,
        marginLeft: 4,
    },
    genderGrid: {
        flexDirection: 'row',
        gap: 12,
    },
    genderOption: {
        flex: 1,
        backgroundColor: '#fff',
        borderRadius: 16,
        paddingVertical: 20,
        alignItems: 'center',
        borderWidth: 2,
        borderColor: 'transparent',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.05,
        shadowRadius: 4,
        elevation: 2,
    },
    genderOptionActive: {
        backgroundColor: '#3b82f6',
        borderColor: '#3b82f6',
    },
    genderOptionPressed: {
        transform: [{ scale: 0.98 }],
    },
    genderLabel: {
        fontSize: 13,
        fontWeight: '600',
        color: '#6B7280',
        marginTop: 8,
    },
    genderLabelActive: {
        color: '#fff',
    },
    buttonContainer: {
        marginTop: 12,
    },
    nextButton: {
        borderRadius: 20,
        overflow: 'hidden',
    },
    gradientButton: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        paddingVertical: 18,
        paddingHorizontal: 32,
        gap: 8,
    },
    nextButtonText: {
        color: '#fff',
        fontSize: 17,
        fontWeight: '700',
    },
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
});