import React, { useEffect, useRef } from 'react';
import {
    View,
    Text,
    StyleSheet,
    Animated,
    Dimensions,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';

const { width } = Dimensions.get('window');

const Toast = ({
                   visible,
                   message,
                   duration = 2000,
                   onHide,
                   type = 'success' // 'success', 'error', 'info', 'warning'
               }) => {
    const translateY = useRef(new Animated.Value(100)).current;
    const opacity = useRef(new Animated.Value(0)).current;

    useEffect(() => {
        if (visible) {
            // Show toast
            Animated.parallel([
                Animated.timing(translateY, {
                    toValue: 0,
                    duration: 300,
                    useNativeDriver: true,
                }),
                Animated.timing(opacity, {
                    toValue: 1,
                    duration: 300,
                    useNativeDriver: true,
                }),
            ]).start();

            // Auto hide after duration
            const timer = setTimeout(() => {
                hideToast();
            }, duration);

            return () => clearTimeout(timer);
        } else {
            hideToast();
        }
    }, [visible, duration]);

    const hideToast = () => {
        Animated.parallel([
            Animated.timing(translateY, {
                toValue: 100,
                duration: 300,
                useNativeDriver: true,
            }),
            Animated.timing(opacity, {
                toValue: 0,
                duration: 300,
                useNativeDriver: true,
            }),
        ]).start(() => {
            if (onHide) onHide();
        });
    };

    const getToastConfig = () => {
        switch (type) {
            case 'success':
                return {
                    icon: 'checkmark-circle',
                    backgroundColor: '#4CAF50',
                    borderColor: '#45A049',
                };
            case 'error':
                return {
                    icon: 'close-circle',
                    backgroundColor: '#F44336',
                    borderColor: '#E53935',
                };
            case 'warning':
                return {
                    icon: 'warning',
                    backgroundColor: '#FF9800',
                    borderColor: '#FB8C00',
                };
            case 'info':
                return {
                    icon: 'information-circle',
                    backgroundColor: '#2196F3',
                    borderColor: '#1E88E5',
                };
            default:
                return {
                    icon: 'checkmark-circle',
                    backgroundColor: '#4CAF50',
                    borderColor: '#45A049',
                };
        }
    };

    const config = getToastConfig();

    if (!visible && opacity._value === 0) {
        return null;
    }

    return (
        <Animated.View
            style={[
                styles.container,
                {
                    transform: [{ translateY }],
                    opacity,
                },
            ]}
        >
            <View
                style={[
                    styles.toast,
                    {
                        backgroundColor: config.backgroundColor,
                        borderLeftColor: config.borderColor,
                    }
                ]}
            >
                <View style={styles.iconContainer}>
                    <Ionicons name={config.icon} size={24} color="#FFFFFF" />
                </View>
                <Text style={styles.message} numberOfLines={2}>
                    {message}
                </Text>
            </View>
        </Animated.View>
    );
};

const styles = StyleSheet.create({
    container: {
        position: 'absolute',
        bottom: 100,
        left: 0,
        right: 0,
        alignItems: 'center',
        zIndex: 9999,
        paddingHorizontal: 24,
    },
    toast: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#4CAF50',
        borderRadius: 16,
        paddingVertical: 16,
        paddingHorizontal: 20,
        maxWidth: width - 48,
        minWidth: width * 0.7,
        shadowColor: '#000',
        shadowOffset: {
            width: 0,
            height: 8,
        },
        shadowOpacity: 0.3,
        shadowRadius: 16,
        elevation: 10,
        borderLeftWidth: 4,
        borderLeftColor: '#45A049',
    },
    iconContainer: {
        marginRight: 12,
    },
    message: {
        flex: 1,
        fontSize: 15,
        fontWeight: '600',
        color: '#FFFFFF',
        letterSpacing: 0.2,
        lineHeight: 20,
    },
});

export default Toast;