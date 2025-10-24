import { View, Text, TouchableOpacity, StyleSheet, Animated } from 'react-native';
import React, { useEffect, useState, useRef } from 'react';
import { useUser } from "../../utils/AuthContext";
import ServerConfig from "../../utils/Config";
import { Ionicons } from '@expo/vector-icons';

const Streak = () => {
    const { user } = useUser();
    const [currentStreak, setCurrentStreak] = useState(0);
    const [longestStreak, setLongestStreak] = useState(0);
    const [showLongest, setShowLongest] = useState(false);
    const [loading, setLoading] = useState(true);

    // Animation values
    const flameScale = useRef(new Animated.Value(1)).current;
    const flameRotate = useRef(new Animated.Value(0)).current;
    const flameY = useRef(new Animated.Value(0)).current;
    const tooltipOpacity = useRef(new Animated.Value(0)).current;
    const tooltipScale = useRef(new Animated.Value(0.8)).current;

    const fetchStreak = async () => {
        try {
            const URL = `${ServerConfig.BaseURL}/api/v1/water/water/streak/${user.uid}`;
            let result = await fetch(URL);
            if (!result.ok) {
                throw Error("Failed to fetch streak");
            }
            let data = await result.json();
            setCurrentStreak(data.current_streak);
            setLongestStreak(data.longest_streak);
        } catch (error) {
            console.error("Error fetching streak:", error);
        } finally {
            setLoading(false);
        }
    };

    // Continuous flame flicker animation
    useEffect(() => {
        if (currentStreak > 0) {
            const flickerAnimation = Animated.loop(
                Animated.sequence([
                    Animated.parallel([
                        Animated.timing(flameScale, {
                            toValue: 1.1,
                            duration: 400,
                            useNativeDriver: true,
                        }),
                        Animated.timing(flameRotate, {
                            toValue: -3,
                            duration: 400,
                            useNativeDriver: true,
                        }),
                        Animated.timing(flameY, {
                            toValue: -2,
                            duration: 400,
                            useNativeDriver: true,
                        }),
                    ]),
                    Animated.parallel([
                        Animated.timing(flameScale, {
                            toValue: 0.95,
                            duration: 300,
                            useNativeDriver: true,
                        }),
                        Animated.timing(flameRotate, {
                            toValue: 3,
                            duration: 300,
                            useNativeDriver: true,
                        }),
                        Animated.timing(flameY, {
                            toValue: 1,
                            duration: 300,
                            useNativeDriver: true,
                        }),
                    ]),
                    Animated.parallel([
                        Animated.timing(flameScale, {
                            toValue: 1,
                            duration: 350,
                            useNativeDriver: true,
                        }),
                        Animated.timing(flameRotate, {
                            toValue: 0,
                            duration: 350,
                            useNativeDriver: true,
                        }),
                        Animated.timing(flameY, {
                            toValue: 0,
                            duration: 350,
                            useNativeDriver: true,
                        }),
                    ]),
                ])
            );
            flickerAnimation.start();
            return () => flickerAnimation.stop();
        }
    }, [currentStreak]);

    useEffect(() => {
        if (user?.uid) {
            fetchStreak();
        }
    }, [user]);

    const handlePress = () => {
        setShowLongest(!showLongest);
    };

    // Tooltip animation
    useEffect(() => {
        if (showLongest) {
            Animated.parallel([
                Animated.spring(tooltipOpacity, {
                    toValue: 1,
                    friction: 6,
                    tension: 40,
                    useNativeDriver: true,
                }),
                Animated.spring(tooltipScale, {
                    toValue: 1,
                    friction: 6,
                    tension: 40,
                    useNativeDriver: true,
                }),
            ]).start();
        } else {
            Animated.parallel([
                Animated.timing(tooltipOpacity, {
                    toValue: 0,
                    duration: 150,
                    useNativeDriver: true,
                }),
                Animated.timing(tooltipScale, {
                    toValue: 0.8,
                    duration: 150,
                    useNativeDriver: true,
                }),
            ]).start();
        }
    }, [showLongest]);

    const rotateInterpolate = flameRotate.interpolate({
        inputRange: [-10, 10],
        outputRange: ['-10deg', '10deg'],
    });

    return (
        <View style={styles.container}>
            {showLongest && (
                <Animated.View
                    style={[
                        styles.tooltip,
                        {
                            opacity: tooltipOpacity,
                            transform: [{ scale: tooltipScale }],
                        },
                    ]}
                >
                    <Text style={styles.tooltipText}>
                        Longest: {longestStreak} 👑
                    </Text>
                    <View style={styles.tooltipArrow} />
                </Animated.View>
            )}

            <TouchableOpacity
                onPress={handlePress}
                style={styles.fireButton}
                activeOpacity={0.7}
            >
                <Animated.View
                    style={{
                        transform: [
                            { scale: flameScale },
                            { rotate: rotateInterpolate },
                            { translateY: flameY },
                        ],
                    }}
                >
                    <Ionicons
                        name="flame"
                        size={40}
                        color={currentStreak > 0 ? "#FF6B35" : "#CCC"}
                    />
                </Animated.View>
            </TouchableOpacity>

            <Text style={styles.currentStreakText}>
                {currentStreak}
            </Text>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        alignItems: 'center',
        position: 'relative',
    },
    fireButton: {
        padding: 8,
        alignItems: 'center',
        justifyContent: 'center',
    },
    currentStreakText: {
        fontSize: 14,
        fontWeight: '600',
        color: '#FF6B35',
        marginTop: 2,
    },
    tooltip: {
        position: 'absolute',
        top: -40,
        backgroundColor: '#333',
        paddingHorizontal: 12,
        paddingVertical: 8,
        borderRadius: 8,
        zIndex: 1000,
    },
    tooltipText: {
        color: 'white',
        fontSize: 13,
        fontWeight: '600',
    },
    tooltipArrow: {
        position: 'absolute',
        bottom: -4,
        left: '50%',
        marginLeft: -4,
        width: 0,
        height: 0,
        borderLeftWidth: 4,
        borderRightWidth: 4,
        borderTopWidth: 4,
        borderLeftColor: 'transparent',
        borderRightColor: 'transparent',
        borderTopColor: '#333',
    },
});

export default Streak;