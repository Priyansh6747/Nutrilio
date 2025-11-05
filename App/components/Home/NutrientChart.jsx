import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, Dimensions, Animated } from 'react-native';
import Svg, { Path, Circle, Defs, LinearGradient, Stop } from 'react-native-svg';

const NutrientChart = ({ data, nutrient }) => {
    const [hoveredPoint, setHoveredPoint] = useState(null);
    const [animatedValue] = useState(new Animated.Value(0));

    useEffect(() => {
        // Animate chart when data changes
        animatedValue.setValue(0);
        Animated.timing(animatedValue, {
            toValue: 1,
            duration: 1500,
            useNativeDriver: true
        }).start();
    }, [data, nutrient]);

    const chartWidth = Dimensions.get('window').width - 80;
    const chartHeight = 200;
    const padding = { top: 20, right: 20, bottom: 30, left: 40 };

    const maxAmount = Math.max(...data.map(d => d.amount), 0.5);
    const xScale = (chartWidth - padding.left - padding.right) / (data.length - 1);
    const yScale = (chartHeight - padding.top - padding.bottom) / maxAmount;

    const generatePath = () => {
        let path = '';
        data.forEach((point, i) => {
            const x = padding.left + i * xScale;
            const y = chartHeight - padding.bottom - point.amount * yScale;

            if (i === 0) {
                path += `M ${x} ${y}`;
            } else {
                const prevX = padding.left + (i - 1) * xScale;
                const prevY = chartHeight - padding.bottom - data[i - 1].amount * yScale;
                const cpX = (prevX + x) / 2;
                path += ` Q ${cpX} ${prevY}, ${x} ${y}`;
            }
        });
        return path;
    };

    const generateFillPath = () => {
        let path = generatePath();
        const lastX = padding.left + (data.length - 1) * xScale;
        const bottomY = chartHeight - padding.bottom;
        path += ` L ${lastX} ${bottomY} L ${padding.left} ${bottomY} Z`;
        return path;
    };

    const formatDate = (dateString) => {
        const date = new Date(dateString);
        return `${date.getMonth() + 1}/${date.getDate()}`;
    };

    return (
        <View style={styles.chartContainer}>
            <Svg width={chartWidth} height={chartHeight}>
                <Defs>
                    <LinearGradient id="gradient" x1="0" y1="0" x2="0" y2="1">
                        <Stop offset="0" stopColor={`${nutrient.color}4D`} />
                        <Stop offset="1" stopColor={`${nutrient.color}00`} />
                    </LinearGradient>
                </Defs>

                <Path d={generateFillPath()} fill="url(#gradient)" />
                <Path
                    d={generatePath()}
                    stroke={nutrient.color}
                    strokeWidth="3"
                    fill="none"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                />

                {data.map((point, i) => {
                    const x = padding.left + i * xScale;
                    const y = chartHeight - padding.bottom - point.amount * yScale;
                    return (
                        <Circle
                            key={i}
                            cx={x}
                            cy={y}
                            r={hoveredPoint === i ? 6 : 4}
                            fill={nutrient.color}
                            stroke="#fff"
                            strokeWidth="2"
                        />
                    );
                })}
            </Svg>

            {/* X-axis labels */}
            <View style={styles.xAxisLabels}>
                {data.filter((_, i) => i % 2 === 0).map((point, i) => (
                    <Text key={i} style={styles.axisLabel}>
                        {new Date(point.date).getDate()}
                    </Text>
                ))}
            </View>

            {/* Tooltip */}
            {hoveredPoint !== null && (
                <View style={[styles.tooltip, {
                    left: padding.left + hoveredPoint * xScale - 40,
                    top: chartHeight - padding.bottom - data[hoveredPoint].amount * yScale - 80
                }]}>
                    <Text style={styles.tooltipDate}>{formatDate(data[hoveredPoint].date)}</Text>
                    <Text style={styles.tooltipText}>Amount: {data[hoveredPoint].amount.toFixed(2)}</Text>
                    <Text style={styles.tooltipText}>Meals: {data[hoveredPoint].meal_count}</Text>
                </View>
            )}
        </View>
    );
};

const styles = StyleSheet.create({
    chartContainer: {
        position: 'relative',
        marginBottom: 20,
    },
    xAxisLabels: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        paddingHorizontal: 40,
        marginTop: 8,
    },
    axisLabel: {
        fontSize: 11,
        color: '#AAA',
        fontWeight: '500',
    },
    tooltip: {
        position: 'absolute',
        backgroundColor: '#FFFFFF',
        borderRadius: 12,
        padding: 12,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 8,
        elevation: 4,
        minWidth: 100,
    },
    tooltipDate: {
        fontSize: 13,
        fontWeight: '700',
        color: '#333',
        marginBottom: 4,
    },
    tooltipText: {
        fontSize: 12,
        color: '#666',
        marginTop: 2,
    },
});

export default NutrientChart;