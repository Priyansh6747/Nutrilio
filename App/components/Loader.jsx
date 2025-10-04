import React, { useEffect } from 'react';
import { View, Text, StyleSheet, Dimensions } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import * as Animatable from 'react-native-animatable';

const { width, height } = Dimensions.get('window');

export default function LoadingScreen() {
    return (
        <LinearGradient
            colors={['#4CAF50', '#2196F3']}
            style={styles.container}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
        >
            {/* Animated background shapes */}
            <Animatable.View
                animation={{
                    0: { scale: 1, rotate: '0deg', opacity: 0.1 },
                    1: { scale: 1.3, rotate: '360deg', opacity: 0.05 },
                }}
                iterationCount="infinite"
                duration={8000}
                easing="linear"
                style={styles.shape1}
            />
            <Animatable.View
                animation={{
                    0: { scale: 1, rotate: '0deg', opacity: 0.1 },
                    1: { scale: 1.3, rotate: '-360deg', opacity: 0.05 },
                }}
                iterationCount="infinite"
                duration={10000}
                easing="linear"
                style={styles.shape2}
            />

            {/* Main content */}
            <View style={styles.content}>
                {/* Logo with icon */}
                <Animatable.View
                    animation="bounceIn"
                    duration={800}
                    style={styles.logoWrapper}
                >
                    <View style={styles.logoCircle}>
                        <Animatable.View
                            animation={{
                                0: { rotate: '0deg' },
                                1: { rotate: '360deg' },
                            }}
                            iterationCount="infinite"
                            duration={20000}
                            easing="linear"
                        >
                            <Ionicons name="nutrition" size={64} color="#4CAF50" />
                        </Animatable.View>
                    </View>
                </Animatable.View>

                {/* Brand name */}
                <Animatable.View
                    animation="fadeInUp"
                    delay={300}
                    duration={600}
                    style={styles.brandContainer}
                >
                    <Text style={styles.brandName}>Nutrilio</Text>
                    <View style={styles.taglineContainer}>
                        <Animatable.View
                            animation="flash"
                            iterationCount="infinite"
                            duration={2000}
                            delay={1000}
                            style={styles.taglineDot}
                        />
                        <Text style={styles.tagline}>Smart Nutrition Tracking</Text>
                    </View>
                </Animatable.View>

                {/* Loading spinner */}
                <Animatable.View
                    animation="fadeIn"
                    delay={600}
                    duration={400}
                    style={styles.spinnerContainer}
                >
                    <Animatable.View
                        animation={{
                            0: { rotate: '0deg' },
                            1: { rotate: '360deg' },
                        }}
                        iterationCount="infinite"
                        duration={1000}
                        easing="linear"
                        style={styles.spinner}
                    >
                        <View style={styles.spinnerArc} />
                    </Animatable.View>
                </Animatable.View>
            </View>

            {/* Bottom accent */}
            <Animatable.View
                animation="fadeInUp"
                delay={400}
                duration={600}
                style={styles.bottomAccent}
            >
                <View style={styles.accentLine} />
            </Animatable.View>

            {/* Floating food icons */}
            {[
                { icon: 'leaf-outline', left: '15%', delay: 0 },
                { icon: 'fitness-outline', right: '15%', delay: 300 },
                { icon: 'water-outline', left: '10%', delay: 600 },
                { icon: 'flame-outline', right: '10%', delay: 900 },
            ].map((item, index) => (
                <Animatable.View
                    key={index}
                    animation={{
                        0: { translateY: height, opacity: 0, scale: 0.5 },
                        0.3: { opacity: 0.3, scale: 1 },
                        0.7: { opacity: 0.2 },
                        1: { translateY: -100, opacity: 0, scale: 0.8 },
                    }}
                    iterationCount="infinite"
                    duration={4000}
                    delay={item.delay}
                    style={[
                        styles.floatingIcon,
                        {
                            left: item.left,
                            right: item.right,
                            bottom: -50,
                        },
                    ]}
                >
                    <Ionicons name={item.icon} size={28} color="rgba(255,255,255,0.4)" />
                </Animatable.View>
            ))}
        </LinearGradient>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
    },
    shape1: {
        position: 'absolute',
        top: -100,
        right: -100,
        width: 300,
        height: 300,
        borderRadius: 150,
        backgroundColor: '#fff',
    },
    shape2: {
        position: 'absolute',
        bottom: -150,
        left: -150,
        width: 400,
        height: 400,
        borderRadius: 200,
        backgroundColor: '#fff',
    },
    content: {
        alignItems: 'center',
        gap: 32,
        zIndex: 10,
    },
    logoWrapper: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 12 },
        shadowOpacity: 0.3,
        shadowRadius: 20,
        elevation: 15,
    },
    logoCircle: {
        width: 130,
        height: 130,
        borderRadius: 65,
        backgroundColor: '#fff',
        alignItems: 'center',
        justifyContent: 'center',
        borderWidth: 6,
        borderColor: 'rgba(255,255,255,0.3)',
    },
    brandContainer: {
        alignItems: 'center',
        gap: 8,
    },
    brandName: {
        fontSize: 52,
        fontWeight: '900',
        color: '#fff',
        letterSpacing: -2,
        textShadowColor: 'rgba(0,0,0,0.2)',
        textShadowOffset: { width: 0, height: 2 },
        textShadowRadius: 8,
    },
    taglineContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
    },
    taglineDot: {
        width: 6,
        height: 6,
        borderRadius: 3,
        backgroundColor: '#FFD700',
    },
    tagline: {
        fontSize: 16,
        color: 'rgba(255,255,255,0.95)',
        fontWeight: '600',
        letterSpacing: 0.5,
    },
    spinnerContainer: {
        marginTop: 16,
    },
    spinner: {
        width: 50,
        height: 50,
        borderRadius: 25,
        borderWidth: 4,
        borderColor: 'rgba(255,255,255,0.2)',
        borderTopColor: '#fff',
    },
    spinnerArc: {
        width: '100%',
        height: '100%',
    },
    bottomAccent: {
        position: 'absolute',
        bottom: 60,
        width: width * 0.6,
        alignItems: 'center',
    },
    accentLine: {
        width: 60,
        height: 4,
        borderRadius: 2,
        backgroundColor: 'rgba(255,255,255,0.5)',
    },
    floatingIcon: {
        position: 'absolute',
        zIndex: 1,
    },
});