import React from 'react';
import {
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
    TextInput,
    ActivityIndicator,
} from 'react-native';
import Animated, {
    FadeIn,
    SlideInLeft,
    SlideOutRight,
    BounceIn,
    ZoomIn,
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

interface Step2Props {
    formData: FormData;
    setFormData: (data: FormData) => void;
    onBack: () => void;
    onSubmit: (skipOptional: boolean) => void;
    isLoading: boolean;
}

const Step2: React.FC<Step2Props> = ({
                                         formData,
                                         setFormData,
                                         onBack,
                                         onSubmit,
                                         isLoading
                                     }) => {
    return (
        <Animated.View
            entering={SlideInLeft.springify()}
            exiting={SlideOutRight.springify()}
            style={styles.stepContainer}
        >
            {/* Decorative Elements */}
            <View style={styles.decorativeDot1} />
            <View style={styles.decorativeDot2} />
            <View style={styles.decorativeDot3} />

            <View style={styles.contentWrapper}>
                <Animated.View entering={FadeIn.delay(200)}>
                    <Text style={styles.stepTitle}>Body Metrics 📏</Text>
                    <Text style={styles.stepSubtitle}>Help us personalize your nutrition</Text>
                </Animated.View>

                <Animated.View entering={FadeIn.delay(300)} style={styles.formSection}>
                    {/* Optional Badge */}
                    <Animated.View
                        entering={BounceIn.delay(400)}
                        style={styles.optionalBadge}
                    >
                        <MaterialCommunityIcons name="information" size={18} color="#3b82f6" />
                        <Text style={styles.optionalText}>These fields are optional</Text>
                    </Animated.View>

                    {/* Weight Field */}
                    <View style={styles.fieldContainer}>
                        <View style={styles.fieldHeader}>
                            <Text style={styles.fieldLabel}>Weight</Text>
                            <Text style={styles.fieldHint}>In kilograms (kg)</Text>
                        </View>
                        <View style={styles.inputContainer}>
                            <TextInput
                                style={styles.input}
                                placeholder="75.5"
                                placeholderTextColor="#C4B5A0"
                                value={formData.weight}
                                onChangeText={(text) => setFormData({ ...formData, weight: text })}
                                keyboardType="decimal-pad"
                            />
                            <MaterialCommunityIcons name="weight-kilogram" size={24} color="#f59e0b" />
                        </View>
                    </View>

                    {/* Height Field */}
                    <View style={styles.fieldContainer}>
                        <View style={styles.fieldHeader}>
                            <Text style={styles.fieldLabel}>Height</Text>
                            <Text style={styles.fieldHint}>In centimeters (cm)</Text>
                        </View>
                        <View style={styles.inputContainer}>
                            <TextInput
                                style={styles.input}
                                placeholder="180"
                                placeholderTextColor="#C4B5A0"
                                value={formData.height}
                                onChangeText={(text) => setFormData({ ...formData, height: text })}
                                keyboardType="decimal-pad"
                            />
                            <MaterialCommunityIcons name="human-male-height" size={24} color="#f59e0b" />
                        </View>
                    </View>

                    {/* BMI Preview Card */}
                    {formData.weight && formData.height && (
                        <Animated.View entering={ZoomIn} style={styles.bmiCard}>
                            <LinearGradient
                                colors={['#EBF5FF', '#DBEAFE']}
                                style={styles.bmiGradient}
                            >
                                <MaterialCommunityIcons name="chart-line" size={20} color="#3b82f6" />
                                <Text style={styles.bmiText}>
                                    BMI Preview: {(parseFloat(formData.weight) / Math.pow(parseFloat(formData.height) / 100, 2)).toFixed(1)}
                                </Text>
                            </LinearGradient>
                        </Animated.View>
                    )}
                </Animated.View>

                <Animated.View entering={FadeIn.delay(400)} style={styles.actionButtons}>
                    <TouchableOpacity
                        onPress={onBack}
                        style={styles.backButton}
                        activeOpacity={0.8}
                    >
                        <Ionicons name="chevron-back" size={20} color="#000" />
                        <Text style={styles.backButtonText}>Back</Text>
                    </TouchableOpacity>

                    <TouchableOpacity
                        onPress={() => onSubmit(true)}
                        style={styles.skipButton}
                        activeOpacity={0.8}
                        disabled={isLoading}
                    >
                        <Text style={styles.skipButtonText}>Skip</Text>
                    </TouchableOpacity>

                    <TouchableOpacity
                        onPress={() => onSubmit(false)}
                        style={styles.finishButton}
                        activeOpacity={0.8}
                        disabled={isLoading}
                    >
                        <LinearGradient
                            colors={['#3b82f6', '#2563eb']}
                            style={styles.gradientButton}
                            start={{ x: 0, y: 0 }}
                            end={{ x: 1, y: 1 }}
                        >
                            {isLoading ? (
                                <ActivityIndicator size="small" color="#fff" />
                            ) : (
                                <>
                                    <Text style={styles.finishButtonText}>Complete</Text>
                                    <Ionicons name="checkmark-circle" size={20} color="#fff" />
                                </>
                            )}
                        </LinearGradient>
                    </TouchableOpacity>
                </Animated.View>
            </View>
        </Animated.View>
    );
};

export default Step2;

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
    input: {
        flex: 1,
        fontSize: 16,
        color: '#000',
        fontWeight: '500',
    },
    optionalBadge: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: '#EBF5FF',
        paddingVertical: 10,
        paddingHorizontal: 16,
        borderRadius: 12,
        marginBottom: 24,
        gap: 6,
    },
    optionalText: {
        fontSize: 13,
        color: '#3b82f6',
        fontWeight: '600',
    },
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
    actionButtons: {
        flexDirection: 'row',
        gap: 12,
        marginTop: 8,
    },
    backButton: {
        flex: 0.8,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: '#F3F4F6',
        paddingVertical: 16,
        borderRadius: 16,
        gap: 4,
    },
    backButtonText: {
        fontSize: 15,
        fontWeight: '600',
        color: '#000',
    },
    skipButton: {
        flex: 0.8,
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: '#FFF7ED',
        paddingVertical: 16,
        borderRadius: 16,
    },
    skipButtonText: {
        fontSize: 15,
        fontWeight: '600',
        color: '#f59e0b',
    },
    finishButton: {
        flex: 1.4,
        borderRadius: 16,
        overflow: 'hidden',
    },
    finishButtonText: {
        color: '#fff',
        fontSize: 15,
        fontWeight: '700',
    },
    gradientButton: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        paddingVertical: 18,
        paddingHorizontal: 32,
        gap: 8,
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