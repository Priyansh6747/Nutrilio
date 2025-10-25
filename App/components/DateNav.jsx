import { View, Text, TouchableOpacity, StyleSheet, Animated, Dimensions } from 'react-native';
import React, { useState, useEffect, useRef } from 'react';
import { LinearGradient } from 'expo-linear-gradient';

const { width } = Dimensions.get('window');

const DateNav = ({ selectedDate, onDateChange }) => {
    const [currentDate, setCurrentDate] = useState(selectedDate || new Date());
    const [visibleDates, setVisibleDates] = useState([]);
    const slideAnim = useRef(new Animated.Value(0)).current;
    const scaleAnims = useRef([]).current;

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    useEffect(() => {
        generateVisibleDates();
        // Initialize scale animations for each date
        if (scaleAnims.length === 0) {
            for (let i = 0; i < 5; i++) {
                scaleAnims.push(new Animated.Value(1));
            }
        }
    }, []);

    useEffect(() => {
        generateVisibleDates();
    }, [currentDate]);

    const generateVisibleDates = () => {
        const dates = [];
        for (let i = -2; i <= 2; i++) {
            const date = new Date(currentDate);
            date.setDate(date.getDate() + i);
            dates.push(date);
        }
        setVisibleDates(dates);
    };

    const animateSlide = (direction, callback) => {
        const distance = direction === 'left' ? -20 : 20;

        Animated.sequence([
            Animated.timing(slideAnim, {
                toValue: distance,
                duration: 200,
                useNativeDriver: true,
            }),
            Animated.timing(slideAnim, {
                toValue: 0,
                duration: 200,
                useNativeDriver: true,
            })
        ]).start();

        setTimeout(callback, 200);
    };

    const animateScale = (index) => {
        Animated.sequence([
            Animated.spring(scaleAnims[index], {
                toValue: 1.15,
                friction: 4,
                tension: 100,
                useNativeDriver: true,
            }),
            Animated.spring(scaleAnims[index], {
                toValue: 1,
                friction: 4,
                tension: 100,
                useNativeDriver: true,
            })
        ]).start();
    };

    const formatDay = (date) => {
        return date.getDate();
    };

    const formatWeekday = (date) => {
        return date.toLocaleDateString('en-US', { weekday: 'short' });
    };

    const canGoForward = () => {
        const nextDay = new Date(currentDate);
        nextDay.setDate(nextDay.getDate() + 1);
        nextDay.setHours(0, 0, 0, 0);
        return nextDay <= today;
    };

    const handlePrevDay = () => {
        animateSlide('right', () => {
            const prevDay = new Date(currentDate);
            prevDay.setDate(prevDay.getDate() - 1);
            setCurrentDate(prevDay);
            onDateChange?.(prevDay);
            animateScale(2);
        });
    };

    const handleNextDay = () => {
        if (canGoForward()) {
            animateSlide('left', () => {
                const nextDay = new Date(currentDate);
                nextDay.setDate(nextDay.getDate() + 1);
                setCurrentDate(nextDay);
                onDateChange?.(nextDay);
                animateScale(2);
            });
        }
    };

    const handleDatePress = (date, index) => {
        const selectedDateTime = new Date(date);
        selectedDateTime.setHours(0, 0, 0, 0);

        if (selectedDateTime <= today) {
            const direction = index < 2 ? 'right' : index > 2 ? 'left' : null;

            if (direction) {
                animateSlide(direction, () => {
                    setCurrentDate(date);
                    onDateChange?.(date);
                    animateScale(2);
                });
            } else {
                setCurrentDate(date);
                onDateChange?.(date);
                animateScale(index);
            }
        }
    };

    const isSelected = (date) => {
        return date.toDateString() === currentDate.toDateString();
    };

    const isFutureDate = (date) => {
        const checkDate = new Date(date);
        checkDate.setHours(0, 0, 0, 0);
        return checkDate > today;
    };

    return (
        <View style={styles.container}>
            <TouchableOpacity
                onPress={handlePrevDay}
                style={styles.arrowButton}
                activeOpacity={0.6}
            >
                <Text style={styles.arrowText}>←</Text>
            </TouchableOpacity>

            <Animated.View
                style={[
                    styles.datesWrapper,
                    { transform: [{ translateX: slideAnim }] }
                ]}
            >
                <View style={styles.datesContainer}>
                    {visibleDates.map((date, index) => {
                        const selected = isSelected(date);
                        const future = isFutureDate(date);

                        return (
                            <Animated.View
                                key={`${date.toDateString()}-${index}`}
                                style={[
                                    styles.dateWrapper,
                                    { transform: [{ scale: scaleAnims[index] || 1 }] }
                                ]}
                            >
                                {selected ? (
                                    <LinearGradient
                                        colors={['#3b82f6', '#10b981']}
                                        start={{ x: 0, y: 0 }}
                                        end={{ x: 1, y: 1 }}
                                        style={styles.dateCircle}
                                    >
                                        <TouchableOpacity
                                            onPress={() => handleDatePress(date, index)}
                                            style={styles.dateButton}
                                            activeOpacity={0.8}
                                        >
                                            <Text style={styles.selectedDayText}>{formatDay(date)}</Text>
                                            <Text style={styles.selectedWeekdayText}>{formatWeekday(date)}</Text>
                                        </TouchableOpacity>
                                    </LinearGradient>
                                ) : (
                                    <TouchableOpacity
                                        onPress={() => handleDatePress(date, index)}
                                        style={[
                                            styles.dateCircle,
                                            styles.inactiveDateCircle,
                                            future && styles.disabledDateCircle
                                        ]}
                                        activeOpacity={future ? 1 : 0.6}
                                        disabled={future}
                                    >
                                        <Text style={[
                                            styles.dayText,
                                            future && styles.disabledText
                                        ]}>
                                            {formatDay(date)}
                                        </Text>
                                        <Text style={[
                                            styles.weekdayText,
                                            future && styles.disabledText
                                        ]}>
                                            {formatWeekday(date)}
                                        </Text>
                                    </TouchableOpacity>
                                )}
                            </Animated.View>
                        );
                    })}
                </View>
            </Animated.View>

            <TouchableOpacity
                onPress={handleNextDay}
                style={[styles.arrowButton, !canGoForward() && styles.arrowButtonDisabled]}
                activeOpacity={canGoForward() ? 0.6 : 1}
                disabled={!canGoForward()}
            >
                <Text style={[
                    styles.arrowText,
                    !canGoForward() && styles.arrowTextDisabled
                ]}>
                    →
                </Text>
            </TouchableOpacity>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingVertical: 16,
        backgroundColor: '#ffffff',
        borderRadius: 16,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.05,
        shadowRadius: 8,
        elevation: 2,
    },
    arrowButton: {
        width: 40,
        height: 40,
        alignItems: 'center',
        justifyContent: 'center',
        marginHorizontal: 8,
    },
    arrowButtonDisabled: {
        opacity: 0.3,
    },
    arrowText: {
        fontSize: 24,
        color: '#10b981',
        fontWeight: 'bold',
    },
    arrowTextDisabled: {
        color: '#cbd5e1',
    },
    datesWrapper: {
        flex: 1,
        overflow: 'hidden',
    },
    datesContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-evenly',
    },
    dateWrapper: {
        alignItems: 'center',
        justifyContent: 'center',
    },
    dateCircle: {
        width: 60,
        height: 60,
        borderRadius: 30,
        alignItems: 'center',
        justifyContent: 'center',
    },
    inactiveDateCircle: {
        backgroundColor: '#f1f5f9',
        borderWidth: 2,
        borderColor: '#e2e8f0',
    },
    disabledDateCircle: {
        backgroundColor: '#f8fafc',
        borderColor: '#f1f5f9',
    },
    dateButton: {
        alignItems: 'center',
        justifyContent: 'center',
    },
    selectedDayText: {
        fontSize: 20,
        fontWeight: 'bold',
        color: '#ffffff',
    },
    selectedWeekdayText: {
        fontSize: 10,
        color: '#ffffff',
        marginTop: 2,
        textTransform: 'uppercase',
    },
    dayText: {
        fontSize: 18,
        fontWeight: '600',
        color: '#334155',
    },
    weekdayText: {
        fontSize: 10,
        color: '#64748b',
        marginTop: 2,
        textTransform: 'uppercase',
    },
    disabledText: {
        color: '#cbd5e1',
    },
});

export default DateNav;