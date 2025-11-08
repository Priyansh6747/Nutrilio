import { View, Text, Dimensions, ScrollView, StyleSheet, ActivityIndicator, Animated, TouchableOpacity, Alert } from 'react-native';
import React, { useEffect, useRef } from 'react';
import { useUser } from "../../utils/AuthContext";
import Config from "../../utils/Config";
import { LineChart, BarChart, ProgressChart } from 'react-native-chart-kit';
import { Ionicons } from '@expo/vector-icons';

const screenWidth = Dimensions.get('window').width;

const FadeInView = ({ children, delay = 0, style }) => {
    const fadeAnim = useRef(new Animated.Value(0)).current;
    const translateY = useRef(new Animated.Value(20)).current;

    useEffect(() => {
        Animated.parallel([
            Animated.timing(fadeAnim, {
                toValue: 1,
                duration: 600,
                delay,
                useNativeDriver: true,
            }),
            Animated.timing(translateY, {
                toValue: 0,
                duration: 600,
                delay,
                useNativeDriver: true,
            }),
        ]).start();
    }, []);

    return (
        <Animated.View
            style={[
                style,
                {
                    opacity: fadeAnim,
                    transform: [{ translateY }],
                },
            ]}
        >
            {children}
        </Animated.View>
    );
};

const ScaleInView = ({ children, delay = 0, style }) => {
    const scaleAnim = useRef(new Animated.Value(0.8)).current;
    const opacityAnim = useRef(new Animated.Value(0)).current;

    useEffect(() => {
        Animated.parallel([
            Animated.spring(scaleAnim, {
                toValue: 1,
                delay,
                friction: 8,
                tension: 40,
                useNativeDriver: true,
            }),
            Animated.timing(opacityAnim, {
                toValue: 1,
                duration: 400,
                delay,
                useNativeDriver: true,
            }),
        ]).start();
    }, []);

    return (
        <Animated.View
            style={[
                style,
                {
                    opacity: opacityAnim,
                    transform: [{ scale: scaleAnim }],
                },
            ]}
        >
            {children}
        </Animated.View>
    );
};

const PulseView = ({ children, style }) => {
    const pulseAnim = useRef(new Animated.Value(1)).current;

    useEffect(() => {
        Animated.loop(
            Animated.sequence([
                Animated.timing(pulseAnim, {
                    toValue: 1.05,
                    duration: 1000,
                    useNativeDriver: true,
                }),
                Animated.timing(pulseAnim, {
                    toValue: 1,
                    duration: 1000,
                    useNativeDriver: true,
                }),
            ])
        ).start();
    }, []);

    return (
        <Animated.View
            style={[
                style,
                {
                    transform: [{ scale: pulseAnim }],
                },
            ]}
        >
            {children}
        </Animated.View>
    );
};

const Insight = () => {
    const [data, setData] = React.useState(null);
    const [loading, setLoading] = React.useState(true);
    const [refreshing, setRefreshing] = React.useState(false);
    const [refreshProgress, setRefreshProgress] = React.useState(0);
    const { user } = useUser();
    const spinValue = useRef(new Animated.Value(0)).current;
    const progressAnim = useRef(new Animated.Value(0)).current;

    useEffect(() => {
        Animated.loop(
            Animated.timing(spinValue, {
                toValue: 1,
                duration: 1000,
                useNativeDriver: true,
            })
        ).start();
    }, []);

    const spin = spinValue.interpolate({
        inputRange: [0, 1],
        outputRange: ['0deg', '360deg'],
    });

    useEffect(() => {
        const fetchData = async () => {
            try {
                const URL = Config.BaseURL + `/api/v1/habit/report/${user.uid}`;
                let response = await fetch(URL);
                if (!response.ok)
                    throw new Error("Could not fetch data");
                let jsonData = await response.json();
                setData(jsonData);
            } catch (error) {
                console.error('Error fetching data:', error);
            } finally {
                setLoading(false);
            }
        };
        fetchData();
    }, [user]);

    const handleRefresh = async () => {
        setRefreshing(true);
        setRefreshProgress(0);

        // Animate progress bar
        Animated.timing(progressAnim, {
            toValue: 100,
            duration: 30000, // 30 seconds
            useNativeDriver: false,
        }).start();

        // Update progress percentage
        const interval = setInterval(() => {
            setRefreshProgress(prev => {
                if (prev >= 100) {
                    clearInterval(interval);
                    return 100;
                }
                return prev + 3.33; // Update every ~900ms for 30 seconds
            });
        }, 900);

        try {
            // Initiate refresh
            const refreshURL = Config.BaseURL + `/api/v1/habit/refresh/${user.uid}`;
            const refreshResponse = await fetch(refreshURL);

            if (!refreshResponse.ok) {
                const errorData = await refreshResponse.json();
                if (refreshResponse.status === 409) {
                    Alert.alert('Analysis In Progress', 'An analysis is already running for your account. Please wait.');
                } else {
                    throw new Error(errorData.detail || 'Failed to refresh analysis');
                }
                clearInterval(interval);
                setRefreshing(false);
                progressAnim.setValue(0);
                setRefreshProgress(0);
                return;
            }

            const refreshData = await refreshResponse.json();

            // Poll for completion (check every 2 seconds for up to 30 seconds)
            let attempts = 0;
            const maxAttempts = 15;

            const pollForCompletion = async () => {
                if (attempts >= maxAttempts) {
                    clearInterval(interval);
                    Alert.alert(
                        'Analysis Taking Longer',
                        'Your analysis is still processing. Please check back in a few moments.',
                        [{ text: 'OK' }]
                    );
                    setRefreshing(false);
                    progressAnim.setValue(0);
                    setRefreshProgress(0);
                    return;
                }

                try {
                    const dataURL = Config.BaseURL + `/api/v1/habit/report/${user.uid}`;
                    const dataResponse = await fetch(dataURL);

                    if (dataResponse.ok) {
                        const newData = await dataResponse.json();

                        // Check if the data is different (analysis completed)
                        if (newData.report.generated_at !== data?.report?.generated_at) {
                            setData(newData);
                            clearInterval(interval);
                            progressAnim.setValue(0);
                            setRefreshProgress(100);

                            setTimeout(() => {
                                setRefreshing(false);
                                setRefreshProgress(0);
                                Alert.alert('Success', 'Your habit analysis has been refreshed!');
                            }, 500);
                            return;
                        }
                    }
                } catch (error) {
                    console.error('Polling error:', error);
                }

                attempts++;
                setTimeout(pollForCompletion, 2000);
            };

            // Start polling after initial request
            setTimeout(pollForCompletion, 2000);

        } catch (error) {
            console.error('Refresh error:', error);
            clearInterval(interval);
            Alert.alert('Error', error.message || 'Failed to refresh analysis. Please try again.');
            setRefreshing(false);
            progressAnim.setValue(0);
            setRefreshProgress(0);
        }
    };

    if (loading) {
        return (
            <View style={styles.loadingContainer}>
                <Animated.View style={{ transform: [{ rotate: spin }] }}>
                    <Ionicons name="fitness" size={64} color="#10b981" />
                </Animated.View>
                <Text style={styles.loadingText}>Loading insights...</Text>
            </View>
        );
    }

    if (!data?.report) {
        return (
            <FadeInView style={styles.errorContainer}>
                <Ionicons name="alert-circle-outline" size={64} color="#ef4444" />
                <Text style={styles.errorText}>No data available</Text>
            </FadeInView>
        );
    }

    const { report } = data;

    // Prepare chart data
    const forecastDates = report.forecast_data.map(d => {
        const date = new Date(d.date);
        return `${date.getMonth() + 1}/${date.getDate()}`;
    });

    const caloriesData = {
        labels: forecastDates,
        datasets: [{
            data: report.forecast_data.map(d => Math.max(0, d.calories)),
            color: (opacity = 1) => `rgba(16, 185, 129, ${opacity})`,
            strokeWidth: 3,
        }],
        legend: ['Calories Forecast']
    };

    const macrosData = {
        labels: forecastDates,
        datasets: [
            {
                data: report.forecast_data.map(d => Math.max(0, d.protein_g)),
                color: (opacity = 1) => `rgba(59, 130, 246, ${opacity})`,
            },
            {
                data: report.forecast_data.map(d => Math.max(0, d.carbohydrates_g)),
                color: (opacity = 1) => `rgba(168, 85, 247, ${opacity})`,
            },
            {
                data: report.forecast_data.map(d => Math.max(0, d.fat_g)),
                color: (opacity = 1) => `rgba(249, 115, 22, ${opacity})`,
            },
        ],
        legend: ['Protein', 'Carbs', 'Fat']
    };

    const hydrationData = {
        labels: forecastDates,
        datasets: [{
            data: report.forecast_data.map(d => Math.max(0, d.water_intake_ml)),
        }]
    };

    const progressData = {
        labels: ['Protein', 'Carbs', 'Fat'],
        data: [
            Math.min(report.forecast_data[0]?.protein_g / 100 || 0, 1),
            Math.min(report.forecast_data[0]?.carbohydrates_g / 100 || 0, 1),
            Math.min(report.forecast_data[0]?.fat_g / 100 || 0, 1),
        ],
        colors: [
            (opacity = 1) => `rgba(59, 130, 246, ${opacity})`,
            (opacity = 1) => `rgba(168, 85, 247, ${opacity})`,
            (opacity = 1) => `rgba(249, 115, 22, ${opacity})`,
        ]
    };

    const chartConfig = {
        backgroundGradientFrom: '#ffffff',
        backgroundGradientTo: '#ffffff',
        decimalPlaces: 0,
        color: (opacity = 1) => `rgba(16, 185, 129, ${opacity})`,
        labelColor: (opacity = 1) => `rgba(71, 85, 105, ${opacity})`,
        style: { borderRadius: 16 },
        propsForDots: {
            r: '5',
            strokeWidth: '2',
            stroke: '#10b981',
        },
    };

    const getScoreColor = (score) => {
        if (score >= 80) return '#10b981';
        if (score >= 60) return '#f59e0b';
        return '#ef4444';
    };

    const getTrendIcon = (trend) => {
        if (trend === 'up') return 'trending-up';
        if (trend === 'down') return 'trending-down';
        return 'remove';
    };

    const getTrendColor = (trend) => {
        if (trend === 'up') return '#10b981';
        if (trend === 'down') return '#ef4444';
        return '#64748b';
    };

    return (
        <View style={styles.wrapper}>
            <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
                {/* Header Score Card */}
                <ScaleInView delay={100}>
                    <View style={[styles.scoreCard, { borderLeftColor: getScoreColor(report.overall_score.score) }]}>
                        <View style={styles.scoreHeader}>
                            <View>
                                <Text style={styles.scoreLabel}>Overall Health Score</Text>
                                <Text style={[styles.scoreValue, { color: getScoreColor(report.overall_score.score) }]}>
                                    {report.overall_score.score}
                                </Text>
                                <Text style={styles.scoreGrade}>Grade: {report.overall_score.grade}</Text>
                            </View>
                            <PulseView>
                                <View style={[styles.scoreBadge, { backgroundColor: getScoreColor(report.overall_score.score) }]}>
                                    <Ionicons name="fitness" size={40} color="#ffffff" />
                                </View>
                            </PulseView>
                        </View>
                        <Text style={styles.scoreDescription}>{report.overall_score.description}</Text>
                    </View>
                </ScaleInView>

                {/* Summary */}
                <FadeInView delay={200} style={styles.summaryCard}>
                    <View style={styles.sectionHeader}>
                        <Ionicons name="analytics" size={24} color="#10b981" />
                        <Text style={styles.sectionTitle}>Quick Summary</Text>
                    </View>
                    <Text style={styles.summaryText}>{report.summary}</Text>
                </FadeInView>

                {/* Risk Flags */}
                {report.risk_flags && report.risk_flags.length > 0 && (
                    <FadeInView delay={300} style={styles.riskCard}>
                        <View style={styles.sectionHeader}>
                            <Ionicons name="warning" size={24} color="#f59e0b" />
                            <Text style={styles.sectionTitle}>Attention Needed</Text>
                        </View>
                        {report.risk_flags.map((flag, index) => (
                            <FadeInView key={index} delay={350 + index * 50} style={styles.riskItem}>
                                <Text style={styles.riskText}>{flag}</Text>
                            </FadeInView>
                        ))}
                    </FadeInView>
                )}

                {/* Engagement Metrics */}
                <FadeInView delay={400} style={styles.card}>
                    <View style={styles.sectionHeader}>
                        <Ionicons name="pulse" size={24} color="#3b82f6" />
                        <Text style={styles.sectionTitle}>Engagement Metrics</Text>
                    </View>
                    <View style={styles.metricsGrid}>
                        <ScaleInView delay={450} style={styles.metricItem}>
                            <Ionicons name="restaurant" size={28} color="#3b82f6" />
                            <Text style={styles.metricLabel}>Meals/Day</Text>
                            <Text style={styles.metricValue}>
                                {report.engagement.meal_frequency.avg_meals_per_day.toFixed(1)}
                            </Text>
                            <Text style={styles.metricStatus}>
                                {report.engagement.meal_frequency.description}
                            </Text>
                        </ScaleInView>
                        <ScaleInView delay={500} style={styles.metricItem}>
                            <Ionicons name="water" size={28} color="#06b6d4" />
                            <Text style={styles.metricLabel}>Water (ml/day)</Text>
                            <Text style={styles.metricValue}>
                                {report.engagement.hydration.avg_ml_per_day.toFixed(0)}
                            </Text>
                            <Text style={styles.metricStatus}>
                                {report.engagement.hydration.description}
                            </Text>
                        </ScaleInView>
                        <ScaleInView delay={550} style={styles.metricItem}>
                            <Ionicons name="flame" size={28} color="#f59e0b" />
                            <Text style={styles.metricLabel}>Streak</Text>
                            <Text style={styles.metricValue}>
                                {report.engagement.streak.projected_streak.toFixed(0)}
                            </Text>
                            <Text style={styles.metricStatus}>
                                {report.engagement.streak.description}
                            </Text>
                        </ScaleInView>
                    </View>
                </FadeInView>

                {/* Calories Forecast */}
                <FadeInView delay={600} style={styles.card}>
                    <View style={styles.sectionHeader}>
                        <Ionicons name="flame-outline" size={24} color="#10b981" />
                        <Text style={styles.sectionTitle}>Calories Forecast</Text>
                    </View>
                    <LineChart
                        data={caloriesData}
                        width={screenWidth - 48}
                        height={220}
                        chartConfig={chartConfig}
                        bezier
                        style={styles.chart}
                    />
                </FadeInView>

                {/* Macro Trends */}
                <FadeInView delay={700} style={styles.card}>
                    <View style={styles.sectionHeader}>
                        <Ionicons name="stats-chart" size={24} color="#3b82f6" />
                        <Text style={styles.sectionTitle}>Macro Trends</Text>
                    </View>
                    {report.macro_trends.map((trend, index) => (
                        <FadeInView key={index} delay={750 + index * 100} style={styles.trendItem}>
                            <View style={styles.trendHeader}>
                                <Ionicons
                                    name={getTrendIcon(trend.trend)}
                                    size={24}
                                    color={getTrendColor(trend.trend)}
                                />
                                <Text style={styles.trendFeature}>{trend.feature.replace(/_/g, ' ').toUpperCase()}</Text>
                            </View>
                            <Text style={styles.trendDescription}>{trend.description}</Text>
                            <View style={styles.trendStats}>
                                <View style={styles.trendStat}>
                                    <Text style={styles.trendStatLabel}>Recent Avg</Text>
                                    <Text style={styles.trendStatValue}>{trend.recent_mean.toFixed(1)}</Text>
                                </View>
                                <View style={styles.trendStat}>
                                    <Text style={styles.trendStatLabel}>Forecast Avg</Text>
                                    <Text style={styles.trendStatValue}>{trend.forecast_mean.toFixed(1)}</Text>
                                </View>
                                <View style={styles.trendStat}>
                                    <Text style={styles.trendStatLabel}>Change</Text>
                                    <Text style={[styles.trendStatValue, { color: getTrendColor(trend.trend) }]}>
                                        {trend.percent_change.toFixed(1)}%
                                    </Text>
                                </View>
                            </View>
                        </FadeInView>
                    ))}
                </FadeInView>

                {/* Macronutrients Forecast */}
                <FadeInView delay={800} style={styles.card}>
                    <View style={styles.sectionHeader}>
                        <Ionicons name="nutrition" size={24} color="#a855f7" />
                        <Text style={styles.sectionTitle}>Macronutrients Forecast</Text>
                    </View>
                    <LineChart
                        data={macrosData}
                        width={screenWidth - 48}
                        height={220}
                        chartConfig={{
                            ...chartConfig,
                            color: (opacity = 1) => `rgba(59, 130, 246, ${opacity})`,
                        }}
                        bezier
                        style={styles.chart}
                    />
                </FadeInView>

                {/* Hydration Forecast */}
                <FadeInView delay={900} style={styles.card}>
                    <View style={styles.sectionHeader}>
                        <Ionicons name="water-outline" size={24} color="#06b6d4" />
                        <Text style={styles.sectionTitle}>Hydration Forecast (ml)</Text>
                    </View>
                    <BarChart
                        data={hydrationData}
                        width={screenWidth - 48}
                        height={220}
                        chartConfig={{
                            ...chartConfig,
                            color: (opacity = 1) => `rgba(6, 182, 212, ${opacity})`,
                        }}
                        style={styles.chart}
                    />
                </FadeInView>

                {/* Today's Progress */}
                <FadeInView delay={1000} style={styles.card}>
                    <View style={styles.sectionHeader}>
                        <Ionicons name="speedometer" size={24} color="#f59e0b" />
                        <Text style={styles.sectionTitle}>Today's Macro Progress</Text>
                    </View>
                    <ProgressChart
                        data={progressData}
                        width={screenWidth - 48}
                        height={220}
                        chartConfig={chartConfig}
                        style={styles.chart}
                    />
                </FadeInView>

                {/* Metadata */}
                <FadeInView delay={1100} style={styles.metadataCard}>
                    <Text style={styles.metadataTitle}>Data Quality</Text>
                    <View style={styles.metadataRow}>
                        <Text style={styles.metadataLabel}>Days with data:</Text>
                        <Text style={styles.metadataValue}>{report.metadata.data_quality.days_with_data}</Text>
                    </View>
                    <View style={styles.metadataRow}>
                        <Text style={styles.metadataLabel}>Completeness:</Text>
                        <Text style={styles.metadataValue}>{report.metadata.data_quality.completeness}%</Text>
                    </View>
                    <View style={styles.metadataRow}>
                        <Text style={styles.metadataLabel}>Generated:</Text>
                        <Text style={styles.metadataValue}>
                            {new Date(report.generated_at).toLocaleDateString()}
                        </Text>
                    </View>
                </FadeInView>
            </ScrollView>

            {/* Floating Refresh Button */}
            {!loading && (
                <ScaleInView delay={200} style={styles.floatingButtonContainer}>
                    <TouchableOpacity
                        style={[styles.floatingButton, refreshing && styles.floatingButtonRefreshing]}
                        onPress={handleRefresh}
                        disabled={refreshing}
                        activeOpacity={0.8}
                    >
                        {refreshing ? (
                            <>
                                <Animated.View style={{ transform: [{ rotate: spin }] }}>
                                    <Ionicons name="sync" size={24} color="#ffffff" />
                                </Animated.View>
                                <View style={styles.floatingProgressRing}>
                                    <Animated.View
                                        style={[
                                            styles.floatingProgressFill,
                                            {
                                                transform: [{
                                                    rotate: progressAnim.interpolate({
                                                        inputRange: [0, 100],
                                                        outputRange: ['0deg', '360deg'],
                                                    })
                                                }]
                                            }
                                        ]}
                                    />
                                </View>
                            </>
                        ) : (
                            <Ionicons name="refresh" size={24} color="#ffffff" />
                        )}
                    </TouchableOpacity>
                    {refreshing && (
                        <FadeInView delay={0} style={styles.refreshStatusBadge}>
                            <Text style={styles.refreshStatusText}>
                                {Math.round(refreshProgress)}%
                            </Text>
                        </FadeInView>
                    )}
                </ScaleInView>
            )}
        </View>
    );
};

export default Insight;

const styles = StyleSheet.create({
    wrapper: {
        flex: 1,
        backgroundColor: '#f1f5f9',
    },
    container: {
        flex: 1,
        padding: 16,
    },
    loadingContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: '#f1f5f9',
    },
    loadingText: {
        marginTop: 16,
        fontSize: 16,
        color: '#64748b',
    },
    errorContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: '#f1f5f9',
        padding: 24,
    },
    errorText: {
        marginTop: 16,
        fontSize: 18,
        color: '#64748b',
        textAlign: 'center',
    },
    scoreCard: {
        backgroundColor: '#ffffff',
        borderRadius: 16,
        padding: 20,
        marginBottom: 16,
        borderLeftWidth: 6,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 8,
        elevation: 4,
    },
    scoreHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 12,
    },
    scoreLabel: {
        fontSize: 14,
        color: '#64748b',
        fontWeight: '600',
        marginBottom: 4,
    },
    scoreValue: {
        fontSize: 48,
        fontWeight: 'bold',
    },
    scoreGrade: {
        fontSize: 16,
        color: '#64748b',
        marginTop: 4,
    },
    scoreBadge: {
        width: 80,
        height: 80,
        borderRadius: 40,
        justifyContent: 'center',
        alignItems: 'center',
    },
    scoreDescription: {
        fontSize: 14,
        color: '#475569',
        lineHeight: 20,
    },
    card: {
        backgroundColor: '#ffffff',
        borderRadius: 16,
        padding: 16,
        marginBottom: 16,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 8,
        elevation: 4,
    },
    summaryCard: {
        backgroundColor: '#ecfdf5',
        borderRadius: 16,
        padding: 16,
        marginBottom: 16,
    },
    sectionHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 16,
    },
    sectionTitle: {
        fontSize: 18,
        fontWeight: '700',
        marginLeft: 8,
        color: '#1e293b',
    },
    summaryText: {
        fontSize: 14,
        color: '#047857',
        lineHeight: 22,
    },
    riskCard: {
        backgroundColor: '#fef3c7',
        borderRadius: 16,
        padding: 16,
        marginBottom: 16,
    },
    riskItem: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingVertical: 8,
    },
    riskText: {
        fontSize: 14,
        color: '#92400e',
        lineHeight: 20,
    },
    metricsGrid: {
        flexDirection: 'row',
        justifyContent: 'space-between',
    },
    metricItem: {
        flex: 1,
        alignItems: 'center',
        padding: 12,
        backgroundColor: '#f8fafc',
        borderRadius: 12,
        marginHorizontal: 4,
    },
    metricLabel: {
        fontSize: 11,
        color: '#64748b',
        marginTop: 8,
        textAlign: 'center',
    },
    metricValue: {
        fontSize: 24,
        fontWeight: 'bold',
        color: '#1e293b',
        marginTop: 4,
    },
    metricStatus: {
        fontSize: 10,
        color: '#64748b',
        marginTop: 4,
        textAlign: 'center',
    },
    chart: {
        borderRadius: 16,
        marginVertical: 8,
    },
    trendItem: {
        backgroundColor: '#f8fafc',
        borderRadius: 12,
        padding: 16,
        marginBottom: 12,
    },
    trendHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 8,
    },
    trendFeature: {
        fontSize: 14,
        fontWeight: '700',
        marginLeft: 8,
        color: '#1e293b',
    },
    trendDescription: {
        fontSize: 13,
        color: '#475569',
        marginBottom: 12,
        lineHeight: 20,
    },
    trendStats: {
        flexDirection: 'row',
        justifyContent: 'space-between',
    },
    trendStat: {
        flex: 1,
        alignItems: 'center',
    },
    trendStatLabel: {
        fontSize: 11,
        color: '#64748b',
        marginBottom: 4,
    },
    trendStatValue: {
        fontSize: 16,
        fontWeight: '600',
        color: '#1e293b',
    },
    metadataCard: {
        backgroundColor: '#ffffff',
        borderRadius: 16,
        padding: 16,
        marginBottom: 24,
    },
    metadataTitle: {
        fontSize: 16,
        fontWeight: '700',
        color: '#1e293b',
        marginBottom: 12,
    },
    metadataRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        paddingVertical: 8,
        borderBottomWidth: 1,
        borderBottomColor: '#e2e8f0',
    },
    metadataLabel: {
        fontSize: 14,
        color: '#64748b',
    },
    metadataValue: {
        fontSize: 14,
        fontWeight: '600',
        color: '#1e293b',
    },
    floatingButtonContainer: {
        position: 'absolute',
        bottom: 24,
        right: 24,
        alignItems: 'center',
    },
    floatingButton: {
        width: 64,
        height: 64,
        borderRadius: 32,
        backgroundColor: '#10b981',
        justifyContent: 'center',
        alignItems: 'center',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 12,
        elevation: 8,
    },
    floatingButtonRefreshing: {
        backgroundColor: '#3b82f6',
    },
    floatingProgressRing: {
        position: 'absolute',
        width: 72,
        height: 72,
        borderRadius: 36,
        borderWidth: 3,
        borderColor: 'rgba(255, 255, 255, 0.3)',
        justifyContent: 'center',
        alignItems: 'center',
    },
    floatingProgressFill: {
        position: 'absolute',
        width: 72,
        height: 72,
        borderRadius: 36,
        borderWidth: 3,
        borderColor: '#ffffff',
        borderRightColor: 'transparent',
        borderBottomColor: 'transparent',
    },
    refreshStatusBadge: {
        marginTop: 8,
        backgroundColor: '#3b82f6',
        paddingHorizontal: 12,
        paddingVertical: 6,
        borderRadius: 12,
    },
    refreshStatusText: {
        color: '#ffffff',
        fontSize: 12,
        fontWeight: '700',
    },
});