import {View, Text, Dimensions, StyleSheet, ActivityIndicator} from 'react-native'
import React, {useEffect, useState} from 'react'
import {useUser} from "../../utils/AuthContext";
import Config from "../../utils/Config";
import {ContributionGraph} from 'react-native-chart-kit';

const screenWidth = Dimensions.get('window').width;

const EngagementChart = () => {
    const {user} = useUser();
    const [data, setData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchData = async () => {
            try {
                setLoading(true);
                const URL = Config.BaseURL + `/api/v1/log/graph?username=${user.uid}`;
                const res = await fetch(URL);
                const jsonData = await res.json();

                if (jsonData.success) {
                    setData(jsonData.data);
                } else {
                    setError('Failed to fetch data');
                }
            } catch (e) {
                console.error(e);
                setError('Error loading data');
            } finally {
                setLoading(false);
            }
        }

        if (user?.uid) {
            fetchData();
        }
    }, [user]);

    // Transform daily_activity data to ContributionGraph format
    const getCommitsData = () => {
        if (!data?.daily_activity) return [];

        return data.daily_activity
            .filter(day => day.combined_intensity > 0) // Only include days with activity
            .map(day => ({
                date: day.date,
                count: day.combined_intensity
            }));
    };

    // Get end date from data
    const getEndDate = () => {
        if (!data?.end_date) return new Date();
        return new Date(data.end_date);
    };

    // Generate 25 intensity level colors from light to dark
    const generateIntensityColors = () => {
        const colors = [];
        // Base color: #00C4FF (rgb(0, 196, 255))
        // Create gradient from very light to very dark
        for (let i = 0; i < 25; i++) {
            const intensity = i / 24; // 0 to 1

            if (i === 0) {
                // Lightest (almost white)
                colors.push('#F0F9FF');
            } else if (i < 5) {
                // Very light blue
                const lightness = 95 - (i * 4);
                colors.push(`hsl(195, 100%, ${lightness}%)`);
            } else if (i < 10) {
                // Light blue
                const lightness = 75 - ((i - 5) * 3);
                colors.push(`hsl(195, 95%, ${lightness}%)`);
            } else if (i < 15) {
                // Medium blue
                const lightness = 60 - ((i - 10) * 3);
                colors.push(`hsl(195, 90%, ${lightness}%)`);
            } else if (i < 20) {
                // Dark blue
                const lightness = 45 - ((i - 15) * 3);
                colors.push(`hsl(195, 85%, ${lightness}%)`);
            } else {
                // Very dark blue
                const lightness = 30 - ((i - 20) * 2);
                colors.push(`hsl(195, 80%, ${lightness}%)`);
            }
        }
        return colors;
    };

    const intensityColors = generateIntensityColors();

    // Chart configuration with 25 intensity levels
    const chartConfig = {
        backgroundColor: '#FFFFFF',
        backgroundGradientFrom: '#FFFFFF',
        backgroundGradientTo: '#FFFFFF',
        color: (opacity = 1) => `rgba(0, 196, 255, ${opacity})`,
        labelColor: (opacity = 1) => `rgba(95, 99, 104, ${opacity})`,
        style: {
            borderRadius: 16,
        },
        // Add the 25 intensity level colors
        fillShadowGradient: intensityColors[24],
        fillShadowGradientOpacity: 1,
    };

    if (loading) {
        return (
            <View style={styles.container}>
                <ActivityIndicator size="large" color="#00C4FF" />
                <Text style={styles.loadingText}>Loading engagement data...</Text>
            </View>
        );
    }

    if (error) {
        return (
            <View style={styles.container}>
                <Text style={styles.errorText}>{error}</Text>
            </View>
        );
    }

    if (!data) {
        return (
            <View style={styles.container}>
                <Text style={styles.errorText}>No data available</Text>
            </View>
        );
    }

    const commitsData = getCommitsData();

    return (
        <View style={styles.container}>
            <View style={styles.chartContainer}>
                <Text style={styles.chartTitle}>Activity Heatmap</Text>
                <Text style={styles.chartSubtitle}>
                    Last 90 days · {data.statistics.combined_active_days} active days
                </Text>

                <ContributionGraph
                    values={commitsData}
                    endDate={getEndDate()}
                    numDays={90}
                    width={screenWidth - 32}
                    height={220}
                    chartConfig={chartConfig}
                    style={styles.chart}
                    tooltipDataAttrs={{}}
                />

                {/* Enhanced Legend with 25 levels visualization */}
                <View style={styles.legend}>
                    <Text style={styles.legendText}>Less</Text>
                    <View style={styles.legendColors}>
                        {[0, 6, 12, 18, 24].map((index) => (
                            <View
                                key={index}
                                style={[styles.legendBox, {backgroundColor: intensityColors[index]}]}
                            />
                        ))}
                    </View>
                    <Text style={styles.legendText}>More</Text>
                </View>

                <Text style={styles.legendSubtext}>25 intensity levels</Text>

                {/* Statistics */}
                <View style={styles.statsContainer}>
                    <View style={styles.statItem}>
                        <Text style={styles.statValue}>{data.statistics.meal_stats.total_meals}</Text>
                        <Text style={styles.statLabel}>Total Meals</Text>
                    </View>
                    <View style={styles.statItem}>
                        <Text style={styles.statValue}>{data.statistics.water_stats.total_intake}ml</Text>
                        <Text style={styles.statLabel}>Water Intake</Text>
                    </View>
                    <View style={styles.statItem}>
                        <Text style={styles.statValue}>{data.statistics.meal_stats.current_streak}</Text>
                        <Text style={styles.statLabel}>Current Streak</Text>
                    </View>
                    <View style={styles.statItem}>
                        <Text style={styles.statValue}>{data.statistics.water_stats.days_met_goal}</Text>
                        <Text style={styles.statLabel}>Goals Met</Text>
                    </View>
                </View>
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        padding: 16,
        backgroundColor: '#F9FAFB',
    },
    chartContainer: {
        backgroundColor: '#FFFFFF',
        borderRadius: 16,
        padding: 16,
        shadowColor: '#000',
        shadowOffset: {width: 0, height: 2},
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 3,
    },
    chartTitle: {
        fontSize: 20,
        fontWeight: 'bold',
        color: '#212121',
        marginBottom: 4,
    },
    chartSubtitle: {
        fontSize: 14,
        color: '#5F6368',
        marginBottom: 16,
    },
    chart: {
        borderRadius: 16,
        marginVertical: 8,
    },
    legend: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        marginTop: 12,
        gap: 8,
    },
    legendColors: {
        flexDirection: 'row',
        gap: 4,
    },
    legendBox: {
        width: 12,
        height: 12,
        borderRadius: 2,
    },
    legendText: {
        fontSize: 12,
        color: '#5F6368',
    },
    legendSubtext: {
        fontSize: 10,
        color: '#9E9E9E',
        textAlign: 'center',
        marginTop: 4,
    },
    statsContainer: {
        flexDirection: 'row',
        justifyContent: 'space-around',
        marginTop: 20,
        paddingTop: 16,
        borderTopWidth: 1,
        borderTopColor: '#E0E0E0',
    },
    statItem: {
        alignItems: 'center',
    },
    statValue: {
        fontSize: 18,
        fontWeight: 'bold',
        color: '#00C4FF',
    },
    statLabel: {
        fontSize: 12,
        color: '#5F6368',
        marginTop: 4,
    },
    loadingText: {
        marginTop: 12,
        fontSize: 14,
        color: '#5F6368',
    },
    errorText: {
        fontSize: 14,
        color: '#ef4444',
        textAlign: 'center',
    },
});

export default EngagementChart;