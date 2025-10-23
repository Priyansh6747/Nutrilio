import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, ScrollView, Dimensions, ActivityIndicator, TouchableOpacity, Image } from 'react-native';
import { LineChart } from 'react-native-chart-kit';
import { LinearGradient } from 'expo-linear-gradient';
import Svg, { Circle } from 'react-native-svg';
import { useUser } from "../../utils/AuthContext";
import ServerConfig from "../../utils/Config";

const screenWidth = Dimensions.get('window').width;

const formatDate = (date) => {
    if (!(date instanceof Date)) date = new Date(date);
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
};

const CircularProgress = ({ percentage }) => {
    const size = 100;
    const strokeWidth = 8;
    const radius = (size - strokeWidth) / 2;
    const circumference = 2 * Math.PI * radius;
    const strokeDashoffset = circumference - (circumference * Math.min(percentage, 100)) / 100;

    return (
        <View style={styles.circleWrapper}>
            <Svg width={size} height={size}>
                <Circle
                    cx={size / 2}
                    cy={size / 2}
                    r={radius}
                    stroke="rgba(255,255,255,0.3)"
                    strokeWidth={strokeWidth}
                    fill="none"
                />
                <Circle
                    cx={size / 2}
                    cy={size / 2}
                    r={radius}
                    stroke="#fff"
                    strokeWidth={strokeWidth}
                    fill="none"
                    strokeDasharray={`${circumference} ${circumference}`}
                    strokeDashoffset={strokeDashoffset}
                    strokeLinecap="round"
                    rotation="-90"
                    origin={`${size / 2}, ${size / 2}`}
                />
            </Svg>
            <View style={styles.circleCenter}>
                <Text style={styles.percentageText}>{Math.min(percentage, 100).toFixed(0)}%</Text>
            </View>
        </View>
    );
};

const Dashboard = ({ selectedDate }) => {
    const { user } = useUser();
    const [data, setData] = useState(null);
    const [loading, setLoading] = useState(true);

    const fetchWaterStats = async () => {
        try {
            setLoading(true);
            const URL = ServerConfig.BaseURL + `/api/v1/water/water/stats/${user.uid}/daily/${formatDate(selectedDate)}`;
            const response = await fetch(URL);
            const result = await response.json();
            setData(result);
        } catch (error) {
            console.error('Error fetching water stats:', error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchWaterStats();
    }, [selectedDate]);

    if (loading) {
        return (
            <View style={styles.loadingContainer}>
                <ActivityIndicator size="large" color="#4FACFE" />
            </View>
        );
    }

    if (!data) {
        return (
            <View style={styles.errorContainer}>
                <Text style={styles.errorText}>No data available</Text>
            </View>
        );
    }

    const chartConfig = {
        backgroundColor: '#ffffff',
        backgroundGradientFrom: '#4FACFE',
        backgroundGradientTo: '#00F5A0',
        decimalPlaces: 0,
        color: (opacity = 1) => `rgba(255, 255, 255, ${opacity})`,
        labelColor: (opacity = 1) => `rgba(255, 255, 255, ${opacity})`,
        style: { borderRadius: 16 },
        propsForDots: { r: '4', strokeWidth: '2', stroke: '#fff' }
    };


    const hourlyData = new Array(24).fill(0);
    data.intakes.forEach(intake => {
        const hour = new Date(intake.timestamp).getHours();
        hourlyData[hour] += intake.amount;
    });

    const labels = [];
    const dataPoints = [];
    for (let i = 0; i < 24; i += 4) {
        const endHour = Math.min(i + 4, 24);
        labels.push(`${i === 0 ? '12am' : i < 12 ? i + 'am' : i === 12 ? '12pm' : (i - 12) + 'pm'}`);

        // Sum all hours in this 4-hour bucket
        let bucketSum = 0;
        for (let h = i; h < endHour; h++) {
            bucketSum += hourlyData[h];
        }
        dataPoints.push(bucketSum);
    }

    const lineChartData = {
        labels: labels,
        datasets: [{
            data: dataPoints.length > 0 && dataPoints.some(v => v > 0) ? dataPoints : [0, 0, 0, 0, 0, 0]
        }]
    };

    const avgIntake = data.intake_count > 0 ? Math.round(data.total_intake / data.intake_count) : 0;

    return (
        <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
            {/* Compact Hero Section */}
            <LinearGradient
                colors={['#4FACFE', '#00F5A0']}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
                style={styles.heroGradient}
            >
                <View style={styles.heroContent}>
                    {/* Progress Circle - Compact */}
                    <View style={styles.progressSection}>
                        <CircularProgress percentage={data.percentage_completed} />
                        <View style={styles.mainStats}>
                            <Text style={styles.mainAmount}>{data.total_intake}</Text>
                            <Text style={styles.mainLabel}>/ {data.recommended_intake}ml</Text>
                        </View>
                    </View>

                    {/* Inline Stats */}
                    <View style={styles.inlineStats}>
                        <View style={styles.inlineStat}>
                            <Text style={styles.inlineStatValue}>{data.intake_count}</Text>
                            <Text style={styles.inlineStatLabel}>drinks</Text>
                        </View>
                        <View style={styles.statDivider} />
                        <View style={styles.inlineStat}>
                            <Text style={styles.inlineStatValue}>{avgIntake}</Text>
                            <Text style={styles.inlineStatLabel}>avg ml</Text>
                        </View>
                        <View style={styles.statDivider} />
                        <View style={styles.inlineStat}>
                            <Text style={styles.inlineStatValue}>{Math.max(0, data.recommended_intake - data.total_intake)}</Text>
                            <Text style={styles.inlineStatLabel}>left</Text>
                        </View>
                    </View>
                </View>
            </LinearGradient>

            {/* Hourly Chart - Compact */}
            <View style={styles.chartCard}>
                <Text style={styles.cardTitle}>Today's Pattern</Text>
                <LineChart
                    data={lineChartData}
                    width={screenWidth - 32}
                    height={160}
                    chartConfig={chartConfig}
                    bezier
                    style={styles.chart}
                    withDots={true}
                    withInnerLines={false}
                    withOuterLines={false}
                    withVerticalLines={false}
                    fromZero={true}
                    segments={4}
                />
            </View>
            <View style={{ height: 20 }} />
        </ScrollView>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#F5F7FA',
    },
    loadingContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: '#F5F7FA',
    },
    errorContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: '#F5F7FA',
    },
    errorText: {
        fontSize: 16,
        color: '#666',
    },
    heroGradient: {
        margin: 16,
        marginBottom: 12,
        borderRadius: 20,
        padding: 20,
        elevation: 6,
        shadowColor: '#4FACFE',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.25,
        shadowRadius: 8,
    },
    heroContent: {
        gap: 16,
    },
    progressSection: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 20,
    },
    circleWrapper: {
        position: 'relative',
        width: 100,
        height: 100,
    },
    circleCenter: {
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        justifyContent: 'center',
        alignItems: 'center',
    },
    percentageText: {
        fontSize: 26,
        fontWeight: 'bold',
        color: '#fff',
    },
    mainStats: {
        flex: 1,
    },
    mainAmount: {
        fontSize: 36,
        fontWeight: 'bold',
        color: '#fff',
    },
    mainLabel: {
        fontSize: 16,
        color: 'rgba(255,255,255,0.9)',
        marginTop: 2,
    },
    inlineStats: {
        flexDirection: 'row',
        backgroundColor: 'rgba(255,255,255,0.2)',
        borderRadius: 12,
        padding: 12,
        justifyContent: 'space-around',
        alignItems: 'center',
    },
    inlineStat: {
        flex: 1,
        alignItems: 'center',
    },
    inlineStatValue: {
        fontSize: 20,
        fontWeight: 'bold',
        color: '#fff',
    },
    inlineStatLabel: {
        fontSize: 11,
        color: 'rgba(255,255,255,0.9)',
        marginTop: 2,
        textTransform: 'uppercase',
    },
    statDivider: {
        width: 1,
        height: 30,
        backgroundColor: 'rgba(255,255,255,0.3)',
    },
    chartCard: {
        marginHorizontal: 16,
        marginBottom: 12,
        backgroundColor: '#fff',
        borderRadius: 16,
        padding: 16,
        elevation: 2,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.08,
        shadowRadius: 4,
    },
    cardTitle: {
        fontSize: 16,
        fontWeight: '600',
        color: '#333',
        marginBottom: 8,
    },
    chart: {
        borderRadius: 12,
        marginRight:60
    },
    intakesCard: {
        marginHorizontal: 16,
        backgroundColor: '#fff',
        borderRadius: 16,
        padding: 16,
        elevation: 2,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.08,
        shadowRadius: 4,
    },
    intakeRow: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingVertical: 10,
        borderBottomWidth: 1,
        borderBottomColor: '#F0F0F0',
    },
    intakeLeft: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 12,
    },
    droplet: {
        width: 36,
        height: 36,
        borderRadius: 18,
        backgroundColor: '#E8F5FF',
        justifyContent: 'center',
        alignItems: 'center',
    },
    dropletIcon: {
        fontSize: 18,
    },
    intakeAmount: {
        fontSize: 15,
        fontWeight: '600',
        color: '#333',
    },
    intakeTime: {
        fontSize: 13,
        color: '#888',
    },
});

export default Dashboard;