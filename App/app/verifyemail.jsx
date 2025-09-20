import {View, Text, StyleSheet, TouchableOpacity, Alert, Animated} from 'react-native'
import { getAuth, sendEmailVerification } from 'firebase/auth';
import React, {useState, useEffect, useRef} from 'react'
import {app} from "../firebaseConfig";
import * as Updates from 'expo-updates';
import { LinearGradient } from 'expo-linear-gradient';

const Verifyemail = () => {
    const [isRefreshing, setIsRefreshing] = useState(false)
    const [isResending, setIsResending] = useState(false)

    // Animation values
    const fadeAnim = useRef(new Animated.Value(0)).current;
    const slideAnim = useRef(new Animated.Value(50)).current;
    const scaleAnim = useRef(new Animated.Value(0.9)).current;

    useEffect(() => {
        // Entry animation
        Animated.parallel([
            Animated.timing(fadeAnim, {
                toValue: 1,
                duration: 800,
                useNativeDriver: true,
            }),
            Animated.timing(slideAnim, {
                toValue: 0,
                duration: 800,
                useNativeDriver: true,
            }),
            Animated.timing(scaleAnim, {
                toValue: 1,
                duration: 800,
                useNativeDriver: true,
            }),
        ]).start();
    }, []);

    const handleRefresh = async () => {
        setIsRefreshing(true)

        try {
            const auth = getAuth(app);
            const user = auth.currentUser;

            if (!user) {
                Alert.alert(
                    'Error',
                    'No user found. Please try logging in again.',
                    [{text: 'OK'}]
                )
                return;
            }

            // Reload user to get latest verification status
            await user.reload();

            console.log('user', JSON.stringify(user));

            if (user.emailVerified) {
                Alert.alert(
                    'Success!',
                    'Email verified successfully!',
                    [{
                        text: 'Continue',
                        onPress: async () => await Updates.reloadAsync()
                    }]
                )
            } else {
                Alert.alert(
                    'Not Verified',
                    'Please check your email and click the verification link.',
                    [{text: 'OK'}]
                )
            }

        } catch (error) {
            console.error('Refresh error:', error);
            Alert.alert(
                'Error',
                'Failed to refresh verification status. Please try again.',
                [{text: 'OK'}]
            )
        } finally {
            setIsRefreshing(false)
        }
    }

    const resendEmail = async () => {
        setIsResending(true)

        try {
            const auth = getAuth(app);
            const user = auth.currentUser;

            if (!user) {
                Alert.alert(
                    'Error',
                    'No user found. Please try logging in again.',
                    [{text: 'OK'}]
                )
                return;
            }

            await sendEmailVerification(user);
            Alert.alert(
                'Email Sent',
                'Verification email has been sent. Please check your inbox and spam folder.',
                [{text: 'OK'}]
            )
        } catch (error) {
            console.error('Resend error:', error);
            let errorMessage = 'Failed to resend email. Please try again.';

            if (error.code === 'auth/too-many-requests') {
                errorMessage = 'Too many requests. Please wait a moment before trying again.';
            }

            Alert.alert(
                'Error',
                errorMessage,
                [{text: 'OK'}]
            )
        } finally {
            setIsResending(false)
        }
    }

    const AnimatedButton = ({ children, style, onPress, disabled, gradient }) => {
        const buttonScale = useRef(new Animated.Value(1)).current;

        const handlePressIn = () => {
            if (!disabled) {
                Animated.spring(buttonScale, {
                    toValue: 0.95,
                    useNativeDriver: true,
                }).start();
            }
        };

        const handlePressOut = () => {
            if (!disabled) {
                Animated.spring(buttonScale, {
                    toValue: 1,
                    useNativeDriver: true,
                }).start();
            }
        };

        return (
            <Animated.View style={[{ transform: [{ scale: buttonScale }] }]}>
                <TouchableOpacity
                    style={style}
                    onPress={onPress}
                    disabled={disabled}
                    onPressIn={handlePressIn}
                    onPressOut={handlePressOut}
                    activeOpacity={1}
                >
                    {gradient ? (
                        <LinearGradient
                            colors={disabled ? ['#E0E0E0', '#CCCCCC'] : ['#059669', '#10B981']}
                            start={{ x: 0, y: 0 }}
                            end={{ x: 1, y: 1 }}
                            style={styles.gradientButton}
                        >
                            {children}
                        </LinearGradient>
                    ) : (
                        <View style={styles.secondaryButtonContent}>
                            {children}
                        </View>
                    )}
                </TouchableOpacity>
            </Animated.View>
        );
    };

    return (
        <View style={styles.container}>
            <Animated.View
                style={[
                    styles.content,
                    {
                        opacity: fadeAnim,
                        transform: [
                            { translateY: slideAnim },
                            { scale: scaleAnim }
                        ]
                    }
                ]}
            >
                {/* Glass card container */}
                <View style={styles.glassCard}>
                    {/* Icon container with gradient */}
                    <View style={styles.iconContainer}>
                        <LinearGradient
                            colors={['#059669', '#10B981']}
                            style={styles.iconGradient}
                        >
                            <Text style={styles.iconText}>✉️</Text>
                        </LinearGradient>
                    </View>

                    <Text style={styles.title}>Verify Your Email</Text>

                    <Text style={styles.description}>
                        We've sent a verification email to your inbox.
                        Please click the link in the email to verify your account.
                    </Text>

                    <View style={styles.buttonContainer}>
                        <AnimatedButton
                            style={[
                                styles.button,
                                (isRefreshing || isResending) && styles.disabledButton
                            ]}
                            onPress={handleRefresh}
                            disabled={isRefreshing || isResending}
                            gradient={true}
                        >
                            <Text style={[
                                styles.primaryButtonText,
                                (isRefreshing || isResending) && styles.disabledButtonText
                            ]}>
                                {isRefreshing ? 'Checking...' : 'Check Verification Status'}
                            </Text>
                        </AnimatedButton>

                        <AnimatedButton
                            style={[
                                styles.button,
                                styles.secondaryButton,
                                (isRefreshing || isResending) && styles.disabledSecondaryButton
                            ]}
                            onPress={resendEmail}
                            disabled={isRefreshing || isResending}
                            gradient={false}
                        >
                            <Text style={[
                                styles.secondaryButtonText,
                                (isRefreshing || isResending) && styles.disabledButtonText
                            ]}>
                                {isResending ? 'Sending...' : 'Resend Email'}
                            </Text>
                        </AnimatedButton>
                    </View>

                    <Text style={styles.helpText}>
                        Didn't receive the email? Check your spam folder or try resending.
                    </Text>
                </View>
            </Animated.View>
        </View>
    )
}

export default Verifyemail

const styles = StyleSheet.create({
    container: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: '#f0fdf4', // Light green background
        padding: 20,
    },
    content: {
        width: '100%',
        maxWidth: 400,
        alignItems: 'center',
    },
    glassCard: {
        width: '100%',
        backgroundColor: 'rgba(255, 255, 255, 0.95)',
        borderRadius: 24,
        padding: 32,
        alignItems: 'center',
        shadowColor: '#10B981', // Green shadow
        shadowOffset: {
            width: 0,
            height: 8,
        },
        shadowOpacity: 0.1,
        shadowRadius: 24,
        elevation: 12,
        borderWidth: 1,
        borderColor: 'rgba(16, 185, 129, 0.1)', // Light green border
    },
    iconContainer: {
        marginBottom: 24,
    },
    iconGradient: {
        width: 80,
        height: 80,
        borderRadius: 24,
        justifyContent: 'center',
        alignItems: 'center',
        shadowColor: '#10B981', // Green shadow
        shadowOffset: {
            width: 0,
            height: 4,
        },
        shadowOpacity: 0.3,
        shadowRadius: 8,
        elevation: 8,
    },
    iconText: {
        fontSize: 32,
    },
    title: {
        fontSize: 28,
        fontWeight: '700',
        color: '#1f2937', // Dark gray
        marginBottom: 16,
        textAlign: 'center',
        letterSpacing: -0.5,
    },
    description: {
        fontSize: 16,
        color: '#4b5563', // Medium gray
        textAlign: 'center',
        lineHeight: 24,
        marginBottom: 32,
        fontWeight: '400',
    },
    buttonContainer: {
        width: '100%',
        gap: 16,
        marginBottom: 24,
    },
    button: {
        borderRadius: 16,
        overflow: 'hidden',
        shadowColor: '#000',
        shadowOffset: {
            width: 0,
            height: 4,
        },
        shadowOpacity: 0.1,
        shadowRadius: 8,
        elevation: 6,
    },
    gradientButton: {
        paddingVertical: 18,
        paddingHorizontal: 24,
        alignItems: 'center',
        justifyContent: 'center',
        minHeight: 56,
    },
    secondaryButton: {
        borderWidth: 2,
        borderColor: '#10B981', // Green border
        shadowColor: '#10B981', // Green shadow
        shadowOpacity: 0.15,
    },
    secondaryButtonContent: {
        paddingVertical: 18,
        paddingHorizontal: 24,
        alignItems: 'center',
        justifyContent: 'center',
        minHeight: 56,
        backgroundColor: 'rgba(255, 255, 255, 0.9)',
    },
    disabledButton: {
        shadowOpacity: 0,
        elevation: 0,
    },
    disabledSecondaryButton: {
        borderColor: '#d1d5db', // Light gray border
        shadowOpacity: 0,
        elevation: 0,
    },
    primaryButtonText: {
        color: 'white',
        fontSize: 16,
        fontWeight: '600',
        letterSpacing: 0.5,
    },
    secondaryButtonText: {
        color: '#10B981', // Green text
        fontSize: 16,
        fontWeight: '600',
        letterSpacing: 0.5,
    },
    disabledButtonText: {
        color: '#9ca3af', // Gray text for disabled state
    },
    helpText: {
        fontSize: 14,
        color: '#6b7280', // Medium gray
        textAlign: 'center',
        lineHeight: 20,
        fontWeight: '400',
    },
});