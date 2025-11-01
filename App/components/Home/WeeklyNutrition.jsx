import { View, Text, ScrollView, StyleSheet, Dimensions } from 'react-native';
import React, { useEffect, useState } from 'react';
import { LineChart } from 'react-native-chart-kit';
import { Ionicons } from '@expo/vector-icons';
import { useUser } from "../../utils/AuthContext";
import Config from "../../utils/Config";

const { width: screenWidth } = Dimensions.get('window');

const WeeklyNutrition = () => {
    const { user } = useUser();
    const [data, setData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        let isMounted = true;

        const fetchData = async () => {
            try {
                setLoading(true);
                const URL = Config.BaseURL + '/api/v1/log/nutrition/weekly?username=' + encodeURIComponent(user.uid);
                const response = await fetch(URL);

                if (!response.ok) {
                    throw new Error(response.statusText);
                }

                const jsonData = await response.json();

                if (isMounted) {
                    setData(jsonData);
                }
            } catch (err) {
                console.error(err);
                if (isMounted) {
                    setError(err.message);
                }
            } finally {
                if (isMounted) {
                    setLoading(false);
                }
            }
        };

        if (user?.uid) {
            fetchData();
        }

        return () => {
            isMounted = false;
        };
    }, [user?.uid]);

    const formatDate = (dateStr) => {
        const date = new Date(dateStr);
        return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
    };

    const getWeekdayShort = (dateStr) => {
        const date = new Date(dateStr);
        return date.toLocaleDateString('en-US', { weekday: 'short' });
    };

    const getNutrientValue = (nutrients, name) => {
        const nutrient = nutrients?.find(n => n.name === name);
        return nutrient?.amt || 0;
    };

    const findHighestCalorieDay = (dailyStats) => {
        if (!dailyStats || dailyStats.length === 0) return null;

        let maxDay = dailyStats[0];
        dailyStats.forEach(day => {
            const dayCalories = getNutrientValue(day.nutrient_totals, 'Calories');
            const maxCalories = getNutrientValue(maxDay.nutrient_totals, 'Calories');
            if (dayCalories > maxCalories) {
                maxDay = day;
            }
        });
        return maxDay;
    };

    const StatCard = ({ iconName, label, value, unit, colors }) => (
        <View style={[styles.statCard, { backgroundColor: colors.bg }]}>
            <Ionicons name={iconName} size={32} color={colors.text} style={styles.statIcon} />
            <Text style={styles.statLabel}>{label}</Text>
            <Text style={styles.statValue}>
                {typeof value === 'number' ? value.toFixed(1) : value}
                <Text style={styles.statUnit}> {unit}</Text>
            </Text>
        </View>
    );

    const NutrientBar = ({ label, amount, unit, max, color }) => {
        const percentage = Math.min((amount / max) * 100, 100);

        return (
            <View style={styles.nutrientBarContainer}>
                <View style={styles.nutrientBarHeader}>
                    <Text style={styles.nutrientLabel}>{label}</Text>
                    <Text style={styles.nutrientValue}>
                        {amount.toFixed(1)} {unit}
                    </Text>
                </View>
                <View style={styles.nutrientBarTrack}>
                    <View
                        style={[
                            styles.nutrientBarFill,
                            { width: `${percentage}%`, backgroundColor: color }
                        ]}
                    />
                </View>
                <Text style={styles.nutrientPercentage}>{percentage.toFixed(0)}% of RDA</Text>
            </View>
        );
    };

    if (loading) {
        return (
            <View style={styles.centerContainer}>
                <Text style={styles.loadingText}>Loading...</Text>
            </View>
        );
    }

    if (error) {
        return (
            <View style={styles.centerContainer}>
                <Text style={styles.errorText}>Error: {error}</Text>
            </View>
        );
    }

    if (!data) {
        return (
            <View style={styles.centerContainer}>
                <Text style={styles.loadingText}>No data available</Text>
            </View>
        );
    }

    // Prepare chart data
    const labels = data.daily_stats?.map(day => getWeekdayShort(day.date)) || [];
    const caloriesData = data.daily_stats?.map(day =>
        getNutrientValue(day.nutrient_totals, 'Calories')
    ) || [];

    const lineData = {
        labels: labels,
        datasets: [
            {
                data: caloriesData.length > 0 ? caloriesData : [0],
                color: (opacity = 1) => `rgba(0, 196, 255, ${opacity})`,
                strokeWidth: 3,
            },
        ],
        legend: ['Daily Calories'],
    };

    const highestDay = findHighestCalorieDay(data.daily_stats);
    const highestDayName = highestDay ? getWeekdayShort(highestDay.date) : '';

    return (
        <ScrollView style={styles.container}>
            {/* Header Bar */}
            <View style={styles.headerBar}>
                <View style={styles.headerContent}>
                    <View style={styles.headerTitle}>
                        <Text style={styles.title}>Weekly Nutrition Summary</Text>
                        <View style={styles.subtitleRow}>
                            <Ionicons name="calendar-outline" size={16} color="rgba(255, 255, 255, 0.9)" />
                            <Text style={styles.subtitle}>
                                {formatDate(data.week_start)} — {formatDate(data.week_end)}
                            </Text>
                        </View>
                    </View>
                    <View style={styles.headerBadges}>
                        <View style={styles.badge}>
                            <Ionicons name="calendar" size={14} color="#fff" />
                            <Text style={styles.badgeText}>{data.days_tracked} days tracked</Text>
                        </View>
                        <View style={styles.badge}>
                            <Ionicons name="restaurant" size={14} color="#fff" />
                            <Text style={styles.badgeText}>{data.total_meals} meals logged</Text>
                        </View>
                    </View>
                </View>
            </View>

            {/* Stats Cards */}
            <View style={styles.statsContainer}>
                <ScrollView
                    horizontal
                    showsHorizontalScrollIndicator={false}
                    contentContainerStyle={styles.statsScroll}
                >
                    <StatCard
                        iconName="flame"
                        label="Total Calories"
                        value={getNutrientValue(data.weekly_nutrient_totals, 'Calories')}
                        unit="kcal"
                        colors={{ bg: '#e0f7ff', text: '#00c4ff' }}
                    />
                    <StatCard
                        iconName="fitness"
                        label="Protein"
                        value={getNutrientValue(data.weekly_nutrient_totals, 'Protein')}
                        unit="g"
                        colors={{ bg: '#e8f5e9', text: '#38914a' }}
                    />
                    <StatCard
                        iconName="water"
                        label="Fat"
                        value={getNutrientValue(data.weekly_nutrient_totals, 'Fat')}
                        unit="g"
                        colors={{ bg: '#e0f7ff', text: '#00c4ff' }}
                    />
                    <StatCard
                        iconName="nutrition"
                        label="Carbs"
                        value={getNutrientValue(data.weekly_nutrient_totals, 'Carbohydrates')}
                        unit="g"
                        colors={{ bg: '#e8f5e9', text: '#38914a' }}
                    />
                </ScrollView>
            </View>

            {/* Weekly Trends Chart */}
            <View style={styles.section}>
                <Text style={styles.sectionTitle}>Weekly Trends</Text>
                <Text style={styles.sectionSubtitle}>Track your calorie intake throughout the week</Text>

                <View style={styles.chartContainer}>
                    <LineChart
                        data={lineData}
                        width={screenWidth - 64}
                        height={220}
                        chartConfig={{
                            backgroundColor: '#ffffff',
                            backgroundGradientFrom: '#ffffff',
                            backgroundGradientTo: '#f8f9fa',
                            decimalPlaces: 0,
                            color: (opacity = 1) => `rgba(0, 196, 255, ${opacity})`,
                            labelColor: (opacity = 1) => `rgba(0, 0, 0, ${opacity})`,
                            style: {
                                borderRadius: 16,
                            },
                            propsForDots: {
                                r: '6',
                                strokeWidth: '2',
                                stroke: '#00c4ff',
                            },
                            propsForBackgroundLines: {
                                strokeDasharray: '',
                                stroke: '#e3e3e3',
                                strokeWidth: 1,
                            },
                        }}
                        bezier
                        style={styles.chart}
                        withInnerLines={true}
                        withOuterLines={true}
                        withVerticalLines={false}
                        withHorizontalLines={true}
                    />
                </View>

                <View style={styles.insightBox}>
                    <Ionicons name="bulb" size={16} color="#00c4ff" style={{ marginRight: 8 }} />
                    <Text style={styles.insightText}>
                        You maintained consistent intake across {data.days_tracked} tracked days.
                        {highestDay && ` ${highestDayName} was your highest calorie day with ${getNutrientValue(highestDay.nutrient_totals, 'Calories').toFixed(0)} kcal.`}
                    </Text>
                </View>
            </View>

            {/* Nutrient Breakdown */}
            <View style={styles.section}>
                <Text style={styles.sectionTitle}>Average Daily Nutrients</Text>
                <Text style={styles.sectionSubtitle}>Based on {data.days_tracked} days of tracking</Text>

                <View style={styles.nutrientsContainer}>
                    <NutrientBar
                        label="Calories"
                        amount={getNutrientValue(data.average_daily_nutrients, 'Calories')}
                        unit="kcal"
                        max={2500}
                        color="#00c4ff"
                    />
                    <NutrientBar
                        label="Protein"
                        amount={getNutrientValue(data.average_daily_nutrients, 'Protein')}
                        unit="g"
                        max={150}
                        color="#38914a"
                    />
                    <NutrientBar
                        label="Fat"
                        amount={getNutrientValue(data.average_daily_nutrients, 'Fat')}
                        unit="g"
                        max={80}
                        color="#00c4ff"
                    />
                    <NutrientBar
                        label="Carbohydrates"
                        amount={getNutrientValue(data.average_daily_nutrients, 'Carbohydrates')}
                        unit="g"
                        max={300}
                        color="#38914a"
                    />
                    <NutrientBar
                        label="Fiber"
                        amount={getNutrientValue(data.average_daily_nutrients, 'Fiber')}
                        unit="g"
                        max={30}
                        color="#00c4ff"
                    />
                    <NutrientBar
                        label="Sugar"
                        amount={getNutrientValue(data.average_daily_nutrients, 'Sugar')}
                        unit="g"
                        max={50}
                        color="#38914a"
                    />
                </View>
            </View>
        </ScrollView>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#f8f9fa',
    },
    centerContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: '#f8f9fa',
    },
    loadingText: {
        fontSize: 16,
        color: '#666',
    },
    errorText: {
        fontSize: 16,
        color: '#e74c3c',
    },
    headerBar: {
        backgroundColor: '#00c4ff',
        paddingTop: 60,
        paddingBottom: 100,
        paddingHorizontal: 20,
    },
    headerContent: {
        flexDirection: 'column',
    },
    headerTitle: {
        marginBottom: 16,
    },
    title: {
        fontSize: 28,
        fontWeight: '700',
        color: '#fff',
        marginBottom: 8,
    },
    subtitle: {
        fontSize: 15,
        color: 'rgba(255, 255, 255, 0.9)',
        marginLeft: 6,
    },
    subtitleRow: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    headerBadges: {
        flexDirection: 'row',
        gap: 10,
    },
    badge: {
        backgroundColor: 'rgba(255, 255, 255, 0.2)',
        paddingHorizontal: 12,
        paddingVertical: 8,
        borderRadius: 20,
        flexDirection: 'row',
        alignItems: 'center',
        gap: 6,
    },
    badgeText: {
        color: '#fff',
        fontSize: 13,
        fontWeight: '600',
    },
    statsContainer: {
        marginTop: -60,
        paddingHorizontal: 20,
        marginBottom: 20,
    },
    statsScroll: {
        gap: 12,
        paddingRight: 20,
    },
    statCard: {
        borderRadius: 16,
        padding: 20,
        minWidth: 150,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 8,
        elevation: 3,
    },
    statIcon: {
        marginBottom: 8,
    },
    statLabel: {
        fontSize: 13,
        color: '#666',
        marginBottom: 8,
        fontWeight: '500',
    },
    statValue: {
        fontSize: 28,
        fontWeight: '700',
        color: '#333',
    },
    statUnit: {
        fontSize: 14,
        fontWeight: '400',
        color: '#999',
    },
    section: {
        backgroundColor: '#fff',
        marginHorizontal: 20,
        marginBottom: 20,
        borderRadius: 16,
        padding: 24,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 8,
        elevation: 3,
    },
    sectionTitle: {
        fontSize: 20,
        fontWeight: '700',
        color: '#333',
        marginBottom: 4,
    },
    sectionSubtitle: {
        fontSize: 13,
        color: '#999',
        marginBottom: 20,
    },
    chartContainer: {
        backgroundColor: '#f8f9fa',
        borderRadius: 12,
        padding: 16,
        marginVertical: 12,
        alignItems: 'center',
    },
    chart: {
        marginVertical: 8,
        borderRadius: 16,
    },
    insightBox: {
        marginTop: 16,
        padding: 16,
        backgroundColor: '#f0fcff',
        borderRadius: 12,
        borderLeftWidth: 4,
        borderLeftColor: '#00c4ff',
        flexDirection: 'row',
        alignItems: 'flex-start',
    },
    insightText: {
        fontSize: 13,
        color: '#666',
        lineHeight: 20,
        flex: 1,
    },
    nutrientsContainer: {
        marginTop: 8,
    },
    nutrientBarContainer: {
        marginBottom: 20,
    },
    nutrientBarHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginBottom: 8,
    },
    nutrientLabel: {
        fontSize: 15,
        fontWeight: '600',
        color: '#333',
    },
    nutrientValue: {
        fontSize: 14,
        color: '#666',
    },
    nutrientBarTrack: {
        height: 10,
        backgroundColor: '#f0f0f0',
        borderRadius: 5,
        overflow: 'hidden',
    },
    nutrientBarFill: {
        height: '100%',
        borderRadius: 5,
    },
    nutrientPercentage: {
        fontSize: 12,
        color: '#999',
        marginTop: 4,
    },
});

export default WeeklyNutrition;