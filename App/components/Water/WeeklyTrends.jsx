import {View, Text, ScrollView, StyleSheet, Dimensions} from 'react-native'
import React, {useState, useEffect} from 'react'
import {useUser} from "../../utils/AuthContext";
import ServerConfig from "../../utils/Config";
import {LinearGradient} from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';

const {width} = Dimensions.get('window');

const WeeklyTrends = ({selectedDate}) => {
    const {user} = useUser();
    const [stats, setStats] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (selectedDate) {
            fetchStats();
        }
    }, [selectedDate]); // Fixed: Added selectedDate dependency

    const fetchStats = async () => {
        try {
            setLoading(true);
            const URL = `${ServerConfig.BaseURL}/api/v1/water/water/summary/${user.uid}/weekly?target_date=${formatDateForAPI(selectedDate)}`;
            let result = await fetch(URL);
            let data = await result.json();
            setStats(data);
        } catch (error) {
            console.error('Error fetching stats:', error);
            setStats(null);
        } finally {
            setLoading(false);
        }
    }

    const formatDateForAPI = (date) => {
        if (!date) return '';
        const d = new Date(date);
        const year = d.getFullYear();
        const month = String(d.getMonth() + 1).padStart(2, '0');
        const day = String(d.getDate()).padStart(2, '0');
        return `${year}-${month}-${day}`;
    }

    const formatDate = (dateString) => {
        const date = new Date(dateString);
        const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
        return days[date.getDay()];
    }

    const getBarHeight = (percentage) => {
        return Math.min(percentage, 100);
    }

    if (loading) {
        return (
            <View style={styles.container}>
                <Text style={styles.loadingText}>Loading...</Text>
            </View>
        )
    }

    if (!stats || !stats.daily_stats) {
        return (
            <View style={styles.container}>
                <Text style={styles.errorText}>No data available</Text>
            </View>
        )
    }

    return (
        <ScrollView style={styles.container}>
            <LinearGradient
                colors={['#667eea', '#4fd1c5', '#38b2ac']}
                start={{x: 0, y: 0}}
                end={{x: 1, y: 1}}
                style={styles.headerGradient}
            >
                <Text style={styles.title}>Weekly Trends</Text>
                <Text style={styles.dateRange}>
                    {stats.week_start} - {stats.week_end}
                </Text>
            </LinearGradient>

            {/* Summary Cards - Compact Version */}
            <View style={styles.summaryContainer}>
                <View style={styles.summaryRow}>
                    <View style={styles.summaryCard}>
                        <Ionicons name="water" size={22} color="#4fd1c5" />
                        <Text style={styles.summaryValue}>
                            {(stats.total_intake || 0).toLocaleString()}
                        </Text>
                        <Text style={styles.summaryLabel}>Total ml</Text>
                    </View>

                    <View style={styles.summaryCard}>
                        <Ionicons name="bar-chart" size={22} color="#667eea" />
                        <Text style={styles.summaryValue}>
                            {Math.round(stats.average_daily_intake || 0).toLocaleString()}
                        </Text>
                        <Text style={styles.summaryLabel}>Daily Avg</Text>
                    </View>

                    <View style={styles.summaryCard}>
                        <Ionicons name="analytics" size={22} color="#38b2ac" />
                        <Text style={styles.summaryValue}>
                            {(stats.average_percentage || 0).toFixed(0)}%
                        </Text>
                        <Text style={styles.summaryLabel}>Avg Goal</Text>
                    </View>
                </View>

                <View style={styles.summaryRow}>
                    <View style={styles.summaryCard}>
                        <Ionicons name="checkmark-circle" size={22} color="#48bb78" />
                        <Text style={styles.summaryValue}>
                            {stats.days_met_goal || 0}/{stats.days_tracked || 0}
                        </Text>
                        <Text style={styles.summaryLabel}>Goals Met</Text>
                    </View>

                    <View style={styles.summaryCard}>
                        <Ionicons name="calendar" size={22} color="#f093fb" />
                        <Text style={styles.summaryValue}>
                            {stats.days_tracked || 0}
                        </Text>
                        <Text style={styles.summaryLabel}>Days Logged</Text>
                    </View>

                    <View style={styles.summaryCard}>
                        <Ionicons name="trophy" size={22} color="#f5576c" />
                        <Text style={styles.summaryValue}>
                            {Math.round((stats.days_met_goal / stats.days_tracked * 100) || 0)}%
                        </Text>
                        <Text style={styles.summaryLabel}>Success Rate</Text>
                    </View>
                </View>
            </View>

            {/* Daily Chart */}
            <View style={styles.chartContainer}>
                <Text style={styles.sectionTitle}>Daily Progress</Text>
                <View style={styles.chart}>
                    {stats.daily_stats.map((day, index) => (
                        <View key={index} style={styles.chartBar}>
                            <Text style={styles.percentageText}>
                                {day.percentage_completed > 0 ? `${day.percentage_completed.toFixed(0)}%` : ''}
                            </Text>
                            <View style={styles.barContainer}>
                                <LinearGradient
                                    colors={day.percentage_completed >= 100
                                        ? ['#48bb78', '#38a169']
                                        : ['#4fd1c5', '#667eea']}
                                    style={[
                                        styles.bar,
                                        {height: `${getBarHeight(day.percentage_completed)}%`}
                                    ]}
                                />
                            </View>
                            <Text style={styles.dayLabel}>{formatDate(day.date)}</Text>
                            <Text style={styles.intakeText}>{day.total_intake}ml</Text>
                        </View>
                    ))}
                </View>
            </View>

            {/* Daily Details */}
            <View style={styles.detailsContainer}>
                <Text style={styles.sectionTitle}>Daily Breakdown</Text>
                {stats.daily_stats.map((day, index) => (
                    <LinearGradient
                        key={index}
                        colors={['#f7fafc', '#edf2f7']}
                        style={styles.dayCard}
                    >
                        <View style={styles.dayCardHeader}>
                            <View>
                                <Text style={styles.dayCardDate}>{day.date}</Text>
                                <Text style={styles.dayCardDay}>{formatDate(day.date)}</Text>
                            </View>
                            <View style={styles.dayCardStats}>
                                <Text style={[
                                    styles.dayCardPercentage,
                                    {color: day.percentage_completed >= 100 ? '#48bb78' : '#667eea'}
                                ]}>
                                    {day.percentage_completed.toFixed(1)}%
                                </Text>
                            </View>
                        </View>
                        <View style={styles.dayCardBody}>
                            <View style={styles.statRow}>
                                <Text style={styles.statLabel}>Total Intake:</Text>
                                <Text style={styles.statValue}>{day.total_intake} ml</Text>
                            </View>
                            <View style={styles.statRow}>
                                <Text style={styles.statLabel}>Recommended:</Text>
                                <Text style={styles.statValue}>{day.recommended_intake} ml</Text>
                            </View>
                            <View style={styles.statRow}>
                                <Text style={styles.statLabel}>Records:</Text>
                                <Text style={styles.statValue}>{day.intake_count}</Text>
                            </View>
                        </View>
                        <View style={styles.progressBarContainer}>
                            <View style={styles.progressBarBg}>
                                <LinearGradient
                                    colors={day.percentage_completed >= 100
                                        ? ['#48bb78', '#38a169']
                                        : ['#4fd1c5', '#667eea']}
                                    style={[
                                        styles.progressBarFill,
                                        {width: `${Math.min(day.percentage_completed, 100)}%`}
                                    ]}
                                />
                            </View>
                        </View>
                    </LinearGradient>
                ))}
            </View>
        </ScrollView>
    )
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#f7fafc',
    },
    loadingText: {
        textAlign: 'center',
        marginTop: 50,
        fontSize: 16,
        color: '#718096',
    },
    errorText: {
        textAlign: 'center',
        marginTop: 50,
        fontSize: 16,
        color: '#e53e3e',
    },
    headerGradient: {
        padding: 24,
        paddingTop: 40,
        borderBottomLeftRadius: 24,
        borderBottomRightRadius: 24,
    },
    title: {
        fontSize: 28,
        fontWeight: 'bold',
        color: '#ffffff',
        marginBottom: 8,
    },
    dateRange: {
        fontSize: 16,
        color: '#e6fffa',
        opacity: 0.9,
    },
    // Compact Summary Cards
    summaryContainer: {
        padding: 16,
        gap: 10,
    },
    summaryRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        gap: 8,
    },
    summaryCard: {
        flex: 1,
        backgroundColor: '#ffffff',
        borderRadius: 12,
        padding: 12,
        alignItems: 'center',
        justifyContent: 'center',
        borderWidth: 1,
        borderColor: '#e2e8f0',
        shadowColor: '#000',
        shadowOffset: {width: 0, height: 2},
        shadowOpacity: 0.05,
        shadowRadius: 4,
        elevation: 2,
        gap: 6,
    },
    summaryValue: {
        fontSize: 18,
        fontWeight: 'bold',
        color: '#2d3748',
    },
    summaryLabel: {
        fontSize: 11,
        color: '#718096',
        textAlign: 'center',
    },
    chartContainer: {
        padding: 16,
        paddingBottom: 8,
    },
    sectionTitle: {
        fontSize: 20,
        fontWeight: '600',
        color: '#2d3748',
        marginBottom: 16,
    },
    chart: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'flex-end',
        height: 200,
        paddingHorizontal: 8,
    },
    chartBar: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'flex-end',
        marginHorizontal: 4,
    },
    percentageText: {
        fontSize: 11,
        fontWeight: '600',
        color: '#4a5568',
        marginBottom: 4,
        height: 16,
    },
    barContainer: {
        width: '100%',
        height: 140,
        backgroundColor: '#e2e8f0',
        borderRadius: 8,
        justifyContent: 'flex-end',
        overflow: 'hidden',
    },
    bar: {
        width: '100%',
        borderRadius: 8,
    },
    dayLabel: {
        fontSize: 12,
        fontWeight: '600',
        color: '#2d3748',
        marginTop: 8,
    },
    intakeText: {
        fontSize: 10,
        color: '#718096',
        marginTop: 2,
    },
    detailsContainer: {
        padding: 16,
    },
    dayCard: {
        borderRadius: 16,
        padding: 16,
        marginBottom: 12,
        borderWidth: 1,
        borderColor: '#e2e8f0',
    },
    dayCardHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 12,
    },
    dayCardDate: {
        fontSize: 16,
        fontWeight: '600',
        color: '#2d3748',
    },
    dayCardDay: {
        fontSize: 13,
        color: '#718096',
        marginTop: 2,
    },
    dayCardPercentage: {
        fontSize: 24,
        fontWeight: 'bold',
    },
    dayCardBody: {
        marginBottom: 12,
    },
    statRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginBottom: 8,
    },
    statLabel: {
        fontSize: 14,
        color: '#718096',
    },
    statValue: {
        fontSize: 14,
        fontWeight: '600',
        color: '#2d3748',
    },
    progressBarContainer: {
        marginTop: 8,
    },
    progressBarBg: {
        height: 8,
        backgroundColor: '#e2e8f0',
        borderRadius: 4,
        overflow: 'hidden',
    },
    progressBarFill: {
        height: '100%',
        borderRadius: 4,
    },
});

export default WeeklyTrends