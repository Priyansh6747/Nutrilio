import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, Dimensions, TouchableOpacity, Animated } from 'react-native';
import Svg, { Path, Circle, G, Text as SvgText } from 'react-native-svg';
import { useUser } from "../../utils/AuthContext";
import Config from "../../utils/Config";

const NutrientDistribution = () => {
  const { user } = useUser();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [selectedIndex, setSelectedIndex] = useState(null);
  const [scaleAnim] = useState(new Animated.Value(0));

  // Date range state
  const [startDate, setStartDate] = useState('2025-10-20');
  const [endDate, setEndDate] = useState('2025-11-02');

  useEffect(() => {
    let isMounted = true;

    const fetchData = async () => {
      try {
        setLoading(true);
        const URL = Config.BaseURL + `/api/v1/log/nutrients/distribution?username=${user.uid}&start_date=${startDate}&end_date=${endDate}`;
        const response = await fetch(URL);

        if (!response.ok) {
          throw new Error(response.statusText);
        }

        const jsonData = await response.json();

        if (isMounted) {
          setData(jsonData);

          // Animate entry
          Animated.spring(scaleAnim, {
            toValue: 1,
            friction: 8,
            tension: 40,
            useNativeDriver: true
          }).start();
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
  }, [user?.uid, startDate, endDate]);

  // Color palette array (20 colors: blue, teal, green, mint spectrum)
  const colorPalette = [
    '#00c4ff', // bright blue
    '#0096c7', // ocean blue
    '#0077b6', // deep blue
    '#00b4d8', // sky blue
    '#48cae4', // light blue
    '#06d6a0', // mint green
    '#1dd3b0', // teal
    '#20c997', // turquoise
    '#38914a', // forest green
    '#52b788', // sage green
    '#74c69d', // light sage
    '#95d5b2', // pale green
    '#b7e4c7', // mint cream
    '#06ffa5', // neon mint
    '#2ec4b6', // medium teal
    '#118ab2', // steel blue
    '#073b4c', // dark teal
    '#4cc9f0', // bright cyan
    '#3a86ff', // royal blue
    '#06d6a0'  // mint (repeat for safety)
  ];

  const getColor = (index) => colorPalette[index % colorPalette.length];

  // Donut Chart Component
  const DonutChart = ({ data, selectedIndex, onSelectSlice }) => {
    const size = 260;
    const strokeWidth = 45;
    const radius = (size - strokeWidth) / 2;
    const cx = size / 2;
    const cy = size / 2;

    // Filter out Calories and show top 5 nutrients for the chart
    const filteredData = data.filter(item => item.name !== 'Calories');
    const topNutrients = filteredData.slice(0, 5);
    const total = topNutrients.reduce((sum, item) => sum + item.percentage, 0);

    let currentAngle = -90; // Start from top

    const slices = topNutrients.map((item, index) => {
      const percentage = item.percentage;
      const angle = (percentage / total) * 360;
      const startAngle = currentAngle;
      const endAngle = currentAngle + angle;

      currentAngle = endAngle;

      // Calculate arc path
      const startRad = (startAngle * Math.PI) / 180;
      const endRad = (endAngle * Math.PI) / 180;

      const x1 = cx + radius * Math.cos(startRad);
      const y1 = cy + radius * Math.sin(startRad);
      const x2 = cx + radius * Math.cos(endRad);
      const y2 = cy + radius * Math.sin(endRad);

      const largeArc = angle > 180 ? 1 : 0;

      const pathData = [
        `M ${cx} ${cy}`,
        `L ${x1} ${y1}`,
        `A ${radius} ${radius} 0 ${largeArc} 1 ${x2} ${y2}`,
        'Z'
      ].join(' ');

      return {
        path: pathData,
        color: getColor(index),
        name: item.name,
        percentage: item.percentage
      };
    });

    const totalAmount = data.reduce((sum, item) => sum + item.amount, 0);
    const displayTotal = totalAmount >= 1000
      ? `${(totalAmount / 1000).toFixed(1)}k`
      : totalAmount.toFixed(0);

    return (
      <View style={styles.chartWrapper}>
        <Svg width={size} height={size}>
          <G>
            {slices.map((slice, index) => (
              <Path
                key={index}
                d={slice.path}
                fill={slice.color}
                opacity={selectedIndex === null || selectedIndex === index ? 1 : 0.3}
                onPress={() => onSelectSlice(index)}
              />
            ))}
            {/* Inner circle to create donut effect */}
            <Circle
              cx={cx}
              cy={cy}
              r={radius - strokeWidth}
              fill="#f9fbff"
            />
            {/* Center text */}
            <SvgText
              x={cx}
              y={cy - 10}
              textAnchor="middle"
              fontSize="28"
              fontWeight="700"
              fill="#333"
            >
              {displayTotal}
            </SvgText>
            <SvgText
              x={cx}
              y={cy + 15}
              textAnchor="middle"
              fontSize="14"
              fill="#999"
            >
              Nutrients
            </SvgText>
          </G>
        </Svg>
      </View>
    );
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  };

  const generateInsight = (distribution) => {
    if (!distribution || distribution.length === 0) return '';

    // Filter out Calories for insights
    const filteredDistribution = distribution.filter(item => item.name !== 'Calories');
    if (filteredDistribution.length === 0) return '';

    const top = filteredDistribution[0];
    const lowNutrients = filteredDistribution
      .filter(n => ['Protein', 'Fiber', 'Vitamin C'].includes(n.name))
      .filter(n => n.percentage < 2);

    let insight = `Most of your intake came from ${top.name} (${top.percentage.toFixed(1)}%).`;

    if (lowNutrients.length > 0) {
      const names = lowNutrients.map(n => n.name).join(', ');
      insight += ` Try balancing with more ${names}.`;
    }

    return insight;
  };

  if (loading) {
    return (
      <View style={styles.container}>
        <View style={styles.loadingContainer}>
          <Text style={styles.loadingText}>Loading nutrient data...</Text>
        </View>
      </View>
    );
  }

  if (error) {
    return (
      <View style={styles.container}>
        <View style={styles.errorContainer}>
          <Text style={styles.errorText}>Error: {error}</Text>
        </View>
      </View>
    );
  }

  if (!data || !data.distribution) {
    return null;
  }

  return (
    <Animated.View style={[styles.container, {
      transform: [{ scale: scaleAnim }],
      opacity: scaleAnim
    }]}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.title}>Nutrient Distribution</Text>
        <Text style={styles.subtitle}>
          {formatDate(data.start_date)} – {formatDate(data.end_date)}
        </Text>
      </View>

      {/* Donut Chart */}
      <DonutChart
        data={data.distribution}
        selectedIndex={selectedIndex}
        onSelectSlice={setSelectedIndex}
      />

      {/* Legend List */}
      <ScrollView
        style={styles.legendContainer}
        showsVerticalScrollIndicator={false}
        nestedScrollEnabled={true}
      >
        {data.distribution.filter(item => item.name !== 'Calories').map((item, index) => (
          <TouchableOpacity
            key={index}
            style={[
              styles.legendItem,
              selectedIndex === index && styles.legendItemSelected
            ]}
            onPress={() => setSelectedIndex(selectedIndex === index ? null : index)}
            activeOpacity={0.7}
          >
            <View style={styles.legendLeft}>
              <View style={[styles.colorDot, { backgroundColor: getColor(index) }]} />
              <View style={styles.legendTextContainer}>
                <Text style={styles.legendName}>{item.name}</Text>
                <Text style={styles.legendPercentage}>{item.percentage.toFixed(2)}%</Text>
              </View>
            </View>
            <Text style={styles.legendAmount}>
              {item.amount.toFixed(2)} {item.unit}
            </Text>
          </TouchableOpacity>
        ))}
      </ScrollView>

      {/* Insights */}
      <View style={styles.insightContainer}>
        <Text style={styles.insightText}>{generateInsight(data.distribution)}</Text>
      </View>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#f9fbff',
    borderRadius: 20,
    padding: 16,
    marginTop: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 12,
    elevation: 5,
  },
  loadingContainer: {
    padding: 40,
    alignItems: 'center',
  },
  loadingText: {
    color: '#666',
    fontSize: 14,
  },
  errorContainer: {
    padding: 20,
    alignItems: 'center',
  },
  errorText: {
    color: '#ef476f',
    fontSize: 14,
  },
  header: {
    marginBottom: 20,
  },
  title: {
    fontSize: 22,
    fontWeight: '700',
    color: '#333',
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 14,
    color: '#999',
    fontWeight: '500',
  },
  chartWrapper: {
    alignItems: 'center',
    marginVertical: 20,
  },
  legendContainer: {
    maxHeight: 300,
    marginTop: 20,
  },
  legendItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 12,
    borderRadius: 12,
    marginBottom: 8,
    backgroundColor: '#fff',
  },
  legendItemSelected: {
    backgroundColor: '#e6f7ff',
    borderWidth: 1,
    borderColor: '#00c4ff',
  },
  legendLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  colorDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
    marginRight: 12,
  },
  legendTextContainer: {
    flex: 1,
  },
  legendName: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333',
    marginBottom: 2,
  },
  legendPercentage: {
    fontSize: 12,
    color: '#999',
  },
  legendAmount: {
    fontSize: 13,
    fontWeight: '600',
    color: '#666',
    marginLeft: 12,
  },
  insightContainer: {
    marginTop: 20,
    padding: 16,
    backgroundColor: '#e6f7ff',
    borderRadius: 12,
    borderLeftWidth: 4,
    borderLeftColor: '#00c4ff',
  },
  insightText: {
    fontSize: 13,
    lineHeight: 20,
    color: '#555',
  },
});

export default NutrientDistribution;