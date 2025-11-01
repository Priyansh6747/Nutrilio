import React, { useState, useRef, useEffect } from 'react';
import { TouchableOpacity, Text, Animated, StyleSheet } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import {router} from "expo-router";

export default function ChatbotButton() {
    const [isChatOpen, setIsChatOpen] = useState(false);
    const scaleAnim = useRef(new Animated.Value(1)).current;
    const pulseAnim = useRef(new Animated.Value(1)).current;

    const toggleChat = () => {
        setIsChatOpen(!isChatOpen);
        router.push('../Chatbot')
    };

    // Press feedback animation
    const onPressIn = () => {
        Animated.spring(scaleAnim, {
            toValue: 0.9,
            useNativeDriver: true,
        }).start();
    };

    const onPressOut = () => {
        Animated.spring(scaleAnim, {
            toValue: 1,
            friction: 3,
            useNativeDriver: true,
        }).start();
    };

    // Subtle looping pulse effect
    useEffect(() => {
        Animated.loop(
            Animated.sequence([
                Animated.timing(pulseAnim, {
                    toValue: 1.08,
                    duration: 2000,
                    useNativeDriver: true,
                }),
                Animated.timing(pulseAnim, {
                    toValue: 1,
                    duration: 2000,
                    useNativeDriver: true,
                }),
            ])
        ).start();
    }, []);

    return (
        <Animated.View
            style={[
                styles.container,
                { transform: [{ scale: Animated.multiply(scaleAnim, pulseAnim) }] },
            ]}
        >
            <TouchableOpacity
                activeOpacity={0.8}
                onPress={toggleChat}
                onPressIn={onPressIn}
                onPressOut={onPressOut}
            >
                <LinearGradient
                    colors={['#00c4ff', '#38914a']}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 1 }}
                    style={styles.gradient}
                >
                    <Text style={styles.icon}>💬</Text>
                </LinearGradient>
            </TouchableOpacity>
        </Animated.View>
    );
}

const styles = StyleSheet.create({
    container: {
        position: 'absolute',
        bottom: 100,
        right: 20,
        zIndex: 999,
        elevation: 10,
    },
    gradient: {
        width: 65,
        height: 65,
        borderRadius: 32.5,
        justifyContent: 'center',
        alignItems: 'center',
        shadowColor: '#00C6FF',
        shadowOffset: { width: 0, height: 5 },
        shadowOpacity: 0.4,
        shadowRadius: 6,
        elevation: 10,
    },
    icon: {
        fontSize: 30,
        color: 'white',
    },
});
