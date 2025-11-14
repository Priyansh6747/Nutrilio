import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Animated, ActivityIndicator } from 'react-native';
import Svg, { Path, Circle, G, Text as SvgText } from 'react-native-svg';
import { Ionicons } from '@expo/vector-icons';
import { useUser } from "../../utils/AuthContext";
import Config from "../../utils/Config";

const NutrientDistribution = () => {
  const { user } = useUser();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [selectedIndex, setSelectedIndex] = useState(null);
  const [scaleAnim] = useState(new Animated.Value(0));
  const [showControls, setShowControls] = useState(false);

  // Date range state
  const [startDate, setStartDate] = useState('2025-10-20');
  const [endDate, setEndDate] = useState('2025-11-02');

  useEffect(() => {
    if (user?.uid) {
      fetchData();
    }
  }, [user, startDate, endDate]);

  const fetchData = async () => {
    try {
      setLoading(true);
      setError(null);

      const URL = Config.BaseURL + `/api/v1/log/nutrients/distribution?username=${user.uid}&start_date=${startDate}&end_date=${endDate}`;
      const response = await fetch(URL);

      if (!response.ok) {
        throw new Error(response.statusText);
      }

      const jsonData = await response.json();
      setData(jsonData);

      // Animate entry
      scaleAnim.setValue(0);
      Animated.spring(scaleAnim, {
        toValue: 1,
        friction: 8,
        tension: 40,
        useNativeDriver: true
      }).start();
    } catch (err) {
      console.error(err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const adjustDate = (dateType, days) => {
    const currentDate = new Date(dateType === 'start' ? startDate : endDate);
    currentDate.setDate(currentDate.getDate() + days);
    const newDate = currentDate.toISOString().split('T')[0];

    if (dateType === 'start') {
      setStartDate(newDate);
    } else {
      setEndDate(newDate);
    }
  };

  const setQuickRange = (range) => {
    const end = new Date();
    const start = new Date();

    switch (range) {
      case 'week':
        start.setDate(end.getDate() - 7);
        break;
      case 'month':
        start.setMonth(end.getMonth() - 1);
        break;
      case '3months':
        start.setMonth(end.getMonth() - 3);
        break;
    }

    setStartDate(start.toISOString().split('T')[0]);
    setEndDate(end.toISOString().split('T')[0]);
  };

  const formatDateDisplay = (dateString) => {
    const date = new Date(dateString);
    const month = date.toLocaleDateString('en-US', { month: 'short' });
    const day = date.getDate();
    return { month, day };
  };

  const formatDateRange = (start, end) => {
    const startDate = new Date(start);
    const endDate = new Date(end);
    return `${startDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })} – ${endDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}`;
  };

  // Color palette array
  const colorPalette = [
    '#00c4ff', '#0096c7', '#0077b6', '#00b4d8', '#48cae4',
    '#06d6a0', '#1dd3b0', '#20c997', '#38914a', '#52b788',
    '#74c69d', '#95d5b2', '#b7e4c7', '#06ffa5', '#2ec4b6',
    '#118ab2', '#073b4c', '#4cc9f0', '#3a86ff', '#06d6a0'
  ];

  const getColor = (index) => colorPalette[index % colorPalette.length];

  // Donut Chart Component
  const DonutChart = ({ data, selectedIndex, onSelectSlice }) => {
    const size = 260;
    const strokeWidth = 45;
    const radius = (size - strokeWidth) / 2;
    const cx = size / 2;
    const cy = size / 2;

    const filteredData = data.filter(item => item.name !== 'Calories');
    const topNutrients = filteredData.slice(0, 5);
    const total = topNutrients.reduce((sum, item) => sum + item.percentage, 0);

    let currentAngle = -90;

    const slices = topNutrients.map((item, index) => {
      const percentage = item.percentage;
      const angle = (percentage / total) * 360;
      const startAngle = currentAngle;
      const endAngle = currentAngle + angle;

      currentAngle = endAngle;

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
            <Circle cx={cx} cy={cy} r={radius - strokeWidth} fill="#f9fbff" />
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

  const generateInsight = (distribution) => {
    if (!distribution || distribution.length === 0) return '';

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
      <View style={styles.mainContainer}>
        <View style={styles.centerContainer}>
          <ActivityIndicator size="large" color="#00c4ff" />
          <Text style={styles.loadingText}>Loading distribution data...</Text>
        </View>
      </View>
    );
  }

  if (error) {
    return (
      <ScrollView style={styles.mainContainer}>
        <View style={styles.header}>
          <Text style={styles.title}>Nutrient Distribution</Text>
          <TouchableOpacity onPress={fetchData} style={styles.refreshBtn}>
            <Ionicons name="refresh" size={20} color="#00c4ff" />
          </TouchableOpacity>
        </View>
        <View style={styles.errorContainer}>
          <Ionicons name="alert-circle" size={40} color="#FF6B6B" />
          <Text style={styles.errorText}>Error: {error}</Text>
          <TouchableOpacity style={styles.retryBtn} onPress={fetchData}>
            <Text style={styles.retryBtnText}>Retry</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    );
  }

  if (!data || !data.distribution) {
    return (
      <View style={styles.mainContainer}>
        <Text>No data available</Text>
      </View>
    );
  }

  return (
    <ScrollView style={styles.mainContainer}>
      <View style={styles.card}>
        {/* Header with Controls */}
        <View style={styles.chartHeader}>
          <View style={styles.chartTitleRow}>
            <Text style={styles.chartTitle}>Nutrient Distribution</Text>
            <View style={styles.dateRangePreview}>
              <Ionicons name="calendar-outline" size={14} color="#00c4ff" />
              <Text style={styles.dateRangeText}>
                {formatDateRange(data.start_date, data.end_date)}
              </Text>
            </View>
          </View>
          <TouchableOpacity
            style={[styles.controlsToggleBtn, showControls && styles.controlsToggleBtnActive]}
            onPress={() => setShowControls(!showControls)}
          >
            <Ionicons
              name={showControls ? "options" : "options-outline"}
              size={16}
              color="#00c4ff"
            />
          </TouchableOpacity>
        </View>

        {/* Collapsible Controls */}
        {showControls && (
          <View style={styles.controlsContainer}>
            {/* Quick Select Pills */}
            <View style={styles.pillContainer}>
              <TouchableOpacity style={styles.pill} onPress={() => setQuickRange('week')}>
                <Ionicons name="calendar" size={14} color="#00c4ff" />
                <Text style={styles.pillText}>7D</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.pill} onPress={() => setQuickRange('month')}>
                <Ionicons name="calendar" size={14} color="#00c4ff" />
                <Text style={styles.pillText}>1M</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.pill} onPress={() => setQuickRange('3months')}>
                <Ionicons name="calendar" size={14} color="#00c4ff" />
                <Text style={styles.pillText}>3M</Text>
              </TouchableOpacity>
            </View>

            {/* Date Controls */}
            <View style={styles.dateDisplayContainer}>
              <View style={styles.dateBlock}>
                <Text style={styles.dateBlockLabel}>FROM</Text>
                <View style={styles.dateInlineControls}>
                  <TouchableOpacity
                    style={styles.miniBtn}
                    onPress={() => adjustDate('start', -1)}
                  >
                    <Ionicons name="chevron-back" size={16} color="#00c4ff" />
                  </TouchableOpacity>
                  <View style={styles.dateDisplay}>
                    <Text style={styles.dateDay}>{formatDateDisplay(startDate).day}</Text>
                    <Text style={styles.dateMonth}>{formatDateDisplay(startDate).month}</Text>
                  </View>
                  <TouchableOpacity
                    style={styles.miniBtn}
                    onPress={() => adjustDate('start', 1)}
                  >
                    <Ionicons name="chevron-forward" size={16} color="#00c4ff" />
                  </TouchableOpacity>
                </View>
              </View>

              <View style={styles.dateSeparator}>
                <Ionicons name="arrow-forward" size={20} color="#00c4ff" />
              </View>

              <View style={styles.dateBlock}>
                <Text style={styles.dateBlockLabel}>TO</Text>
                <View style={styles.dateInlineControls}>
                  <TouchableOpacity
                    style={styles.miniBtn}
                    onPress={() => adjustDate('end', -1)}
                  >
                    <Ionicons name="chevron-back" size={16} color="#00c4ff" />
                  </TouchableOpacity>
                  <View style={styles.dateDisplay}>
                    <Text style={styles.dateDay}>{formatDateDisplay(endDate).day}</Text>
                    <Text style={styles.dateMonth}>{formatDateDisplay(endDate).month}</Text>
                  </View>
                  <TouchableOpacity
                    style={styles.miniBtn}
                    onPress={() => adjustDate('end', 1)}
                  >
                    <Ionicons name="chevron-forward" size={16} color="#00c4ff" />
                  </TouchableOpacity>
                </View>
              </View>
            </View>
          </View>
        )}

        <View style={styles.divider} />

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
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  mainContainer: {
    flex: 1,
    backgroundColor: '#f5f5f5',
    padding: 20,
  },
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    padding: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.05,
    shadowRadius: 10,
    elevation: 5,
    marginBottom: 20,
  },
  chartHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 16,
  },
  chartTitleRow: {
    flex: 1,
    gap: 12,
  },
  chartTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#0d0d0d',
  },
  dateRangePreview: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: '#f0f9ff',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 8,
    alignSelf: 'flex-start',
  },
  dateRangeText: {
    fontSize: 11,
    fontWeight: '600',
    color: '#00c4ff',
  },
  controlsToggleBtn: {
    width: 40,
    height: 40,
    borderRadius: 12,
    backgroundColor: '#f0f9ff',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#e0e0e0',
  },
  controlsToggleBtnActive: {
    borderColor: '#00c4ff',
    backgroundColor: '#e6f7ff',
  },
  controlsContainer: {
    backgroundColor: '#f9f9f9',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
  },
  pillContainer: {
    flexDirection: 'row',
    gap: 10,
    marginBottom: 16,
  },
  pill: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    backgroundColor: '#fff',
    paddingVertical: 10,
    paddingHorizontal: 12,
    borderRadius: 10,
    borderWidth: 1.5,
    borderColor: '#00c4ff',
  },
  pillText: {
    color: '#00c4ff',
    fontSize: 13,
    fontWeight: '700',
  },
  dateDisplayContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 12,
  },
  dateBlock: {
    flex: 1,
    alignItems: 'center',
  },
  dateBlockLabel: {
    fontSize: 10,
    fontWeight: '700',
    color: '#888',
    letterSpacing: 1,
    marginBottom: 8,
  },
  dateInlineControls: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  miniBtn: {
    width: 32,
    height: 32,
    borderRadius: 8,
    backgroundColor: '#f0f9ff',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#00c4ff',
  },
  dateDisplay: {
    alignItems: 'center',
    minWidth: 60,
  },
  dateDay: {
    fontSize: 24,
    fontWeight: '700',
    color: '#0d0d0d',
    lineHeight: 28,
  },
  dateMonth: {
    fontSize: 11,
    fontWeight: '600',
    color: '#888',
    textTransform: 'uppercase',
  },
  dateSeparator: {
    paddingHorizontal: 12,
  },
  divider: {
    height: 1,
    backgroundColor: '#f0f0f0',
    marginBottom: 20,
  },
  centerContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: 40,
    flex: 1,
  },
  loadingText: {
    marginTop: 12,
    fontSize: 14,
    color: '#888',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  title: {
    fontSize: 28,
    fontWeight: '700',
    color: '#0d0d0d',
  },
  refreshBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#fff',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  errorContainer: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 24,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 4,
    elevation: 3,
  },
  errorText: {
    color: '#FF6B6B',
    fontSize: 14,
    marginTop: 12,
    marginBottom: 16,
    textAlign: 'center',
  },
  retryBtn: {
    backgroundColor: '#00c4ff',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 10,
  },
  retryBtnText: {
    color: '#fff',
    fontWeight: '600',
    fontSize: 14,
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