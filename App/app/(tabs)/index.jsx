import { View, Text, Dimensions, ScrollView, StyleSheet } from 'react-native';
import React from 'react';
import {
    LineChart,
    BarChart,
    PieChart,
    ProgressChart,
    ContributionGraph,
} from 'react-native-chart-kit';

const screenWidth = Dimensions.get('window').width;

const Index = () => {
    // Line Chart Data
    const lineData = {
        labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'],
        datasets: [
            {
                data: [20, 45, 28, 80, 99, 43],
                color: (opacity = 1) => `rgba(134, 65, 244, ${opacity})`,
                strokeWidth: 2,
            },
        ],
        legend: ['Monthly Sales'],
    };

    // Bar Chart Data
    const barData = {
        labels: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri'],
        datasets: [
            {
                data: [50, 70, 40, 90, 60],
            },
        ],
    };

    // Pie Chart Data
    const pieData = [
        {
            name: 'React',
            population: 45,
            color: '#61DAFB',
            legendFontColor: '#7F7F7F',
            legendFontSize: 12,
        },
        {
            name: 'Vue',
            population: 25,
            color: '#42B883',
            legendFontColor: '#7F7F7F',
            legendFontSize: 12,
        },
        {
            name: 'Angular',
            population: 20,
            color: '#DD0031',
            legendFontColor: '#7F7F7F',
            legendFontSize: 12,
        },
        {
            name: 'Svelte',
            population: 10,
            color: '#FF3E00',
            legendFontColor: '#7F7F7F',
            legendFontSize: 12,
        },
    ];

    // Progress Chart Data
    const progressData = {
        labels: ['Swim', 'Bike', 'Run'],
        data: [0.4, 0.6, 0.8],
    };

    // Contribution Graph Data
    const commitsData = [
        { date: '2024-01-02', count: 1 },
        { date: '2024-01-03', count: 2 },
        { date: '2024-01-04', count: 3 },
        { date: '2024-01-05', count: 4 },
        { date: '2024-01-06', count: 5 },
        { date: '2024-01-30', count: 2 },
        { date: '2024-01-31', count: 3 },
        { date: '2024-03-01', count: 2 },
        { date: '2024-04-02', count: 4 },
        { date: '2024-03-05', count: 2 },
        { date: '2024-02-30', count: 4 },
    ];

    // Chart Config
    const chartConfig = {
        backgroundGradientFrom: '#ffffff',
        backgroundGradientTo: '#ffffff',
        decimalPlaces: 0,
        color: (opacity = 1) => `rgba(0, 123, 255, ${opacity})`,
        labelColor: (opacity = 1) => `rgba(0, 0, 0, ${opacity})`,
        style: {
            borderRadius: 16,
        },
        propsForDots: {
            r: '6',
            strokeWidth: '2',
            stroke: '#007bff',
        },
    };

    return (
        <ScrollView style={styles.container}>
            <Text style={styles.title}>React Native Chart Kit Examples</Text>

            {/* Line Chart */}
            <View style={styles.chartContainer}>
                <Text style={styles.chartTitle}>Line Chart</Text>
                <LineChart
                    data={lineData}
                    width={screenWidth - 32}
                    height={220}
                    chartConfig={chartConfig}
                    bezier
                    style={styles.chart}
                />
            </View>

            {/* Bar Chart */}
            <View style={styles.chartContainer}>
                <Text style={styles.chartTitle}>Bar Chart</Text>
                <BarChart
                    data={barData}
                    width={screenWidth - 32}
                    height={220}
                    chartConfig={chartConfig}
                    style={styles.chart}
                    yAxisLabel="$"
                    yAxisSuffix="k"
                />
            </View>

            {/* Pie Chart */}
            <View style={styles.chartContainer}>
                <Text style={styles.chartTitle}>Pie Chart</Text>
                <PieChart
                    data={pieData}
                    width={screenWidth - 32}
                    height={220}
                    chartConfig={chartConfig}
                    accessor="population"
                    backgroundColor="transparent"
                    paddingLeft="15"
                    style={styles.chart}
                />
            </View>

            {/* Progress Chart */}
            <View style={styles.chartContainer}>
                <Text style={styles.chartTitle}>Progress Chart</Text>
                <ProgressChart
                    data={progressData}
                    width={screenWidth - 32}
                    height={220}
                    chartConfig={chartConfig}
                    style={styles.chart}
                />
            </View>

            {/* Contribution Graph */}
            <View style={styles.chartContainer}>
                <Text style={styles.chartTitle}>Contribution Graph</Text>
                <ContributionGraph
                    values={commitsData}
                    endDate={new Date('2024-04-01')}
                    numDays={105}
                    width={screenWidth - 32}
                    height={220}
                    chartConfig={chartConfig}
                    style={styles.chart}
                />
            </View>
        </ScrollView>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#f5f5f5',
        padding: 16,
    },
    title: {
        fontSize: 24,
        fontWeight: 'bold',
        marginBottom: 20,
        textAlign: 'center',
    },
    chartContainer: {
        marginBottom: 24,
        backgroundColor: '#fff',
        borderRadius: 16,
        padding: 16,
    },
    chartTitle: {
        fontSize: 18,
        fontWeight: '600',
        marginBottom: 12,
    },
    chart: {
        borderRadius: 16,
    },
});

export default Index;