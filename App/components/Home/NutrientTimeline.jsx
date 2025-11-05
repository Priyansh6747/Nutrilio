import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Animated, ScrollView, ActivityIndicator, Modal } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useUser } from "../../utils/AuthContext";
import Config from "../../utils/Config";
import NutrientChart from './NutrientChart';

const NutrientTimeline = () => {
    const [data, setData] = useState(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [statsAnimation] = useState(new Animated.Value(0));
    const [showControls, setShowControls] = useState(false);
    const { user } = useUser();

    // Date range state
    const [startDate, setStartDate] = useState('2025-10-20');
    const [endDate, setEndDate] = useState('2025-11-02');

    // Nutrient selection
    const [selectedNutrient, setSelectedNutrient] = useState('fat');
    const [showNutrientDropdown, setShowNutrientDropdown] = useState(false);

    const nutrients = [
        { name: 'fat', label: 'Fat', icon: 'water', color: '#00C4FF' },
        { name: 'protein', label: 'Protein', icon: 'fitness', color: '#00B894' },
        { name: 'carbohydrates', label: 'Carbohydrates', icon: 'leaf', color: '#0077B6' },
        { name: 'fiber', label: 'Fiber', icon: 'nutrition', color: '#48CAE4' },
        { name: 'sugar', label: 'Sugar', icon: 'ice-cream', color: '#80ED99' },
        { name: 'sodium', label: 'Sodium', icon: 'medical', color: '#56CFE1' },
        { name: 'calcium', label: 'Calcium', icon: 'shield-checkmark', color: '#4EA8DE' },
        { name: 'iron', label: 'Iron', icon: 'flash', color: '#64DFDF' },
        { name: 'vitamin_c', label: 'Vitamin C', icon: 'sunny', color: '#B9FBC0' },
        { name: 'vitamin_d', label: 'Vitamin D', icon: 'partly-sunny', color: '#38B000' },
        { name: 'vitamin_a', label: 'Vitamin A', icon: 'eye', color: '#FF6B6B' },
        { name: 'vitamin_e', label: 'Vitamin E', icon: 'heart', color: '#FF9FF3' },
        { name: 'vitamin_k', label: 'Vitamin K', icon: 'pulse', color: '#54A0FF' },
        { name: 'cholesterol', label: 'Cholesterol', icon: 'warning', color: '#FFA502' },
        { name: 'potassium', label: 'Potassium', icon: 'battery-charging', color: '#A29BFE' },
        { name: 'magnesium', label: 'Magnesium', icon: 'magnet', color: '#6C5CE7' },
        { name: 'zinc', label: 'Zinc', icon: 'sparkles', color: '#00D2D3' },
        { name: 'phosphorus', label: 'Phosphorus', icon: 'diamond', color: '#FF7979' },
    ];

    useEffect(() => {
        if (user?.uid) {
            fetchData();
        }
    }, [user, startDate, endDate, selectedNutrient]);

    const fetchData = async () => {
        try {
            setLoading(true);
            setError(null);

            const URL = Config.BaseURL + `/api/v1/log/nutrients/timeline?username=${user.uid}&start_date=${startDate}&end_date=${endDate}&nutrient_name=${selectedNutrient}`;

            let res = await fetch(URL);
            if (!res.ok) throw new Error('Error fetching nutrient timeline');

            let result = await res.json();
            setData(result);

            // Animate stats
            statsAnimation.setValue(0);
            Animated.timing(statsAnimation, {
                toValue: 1,
                duration: 800,
                delay: 500,
                useNativeDriver: true
            }).start();
        } catch (err) {
            setError(err.message);
            console.log(err);
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

    const getCurrentNutrient = () => {
        return nutrients.find(n => n.name === selectedNutrient) || nutrients[0];
    };

    const handleNutrientSelect = (nutrientName) => {
        setSelectedNutrient(nutrientName);
        setShowNutrientDropdown(false);
    };

    if (loading) {
        return (
            <View style={styles.container}>
                <View style={styles.centerContainer}>
                    <ActivityIndicator size="large" color="#00c4ff" />
                    <Text style={styles.loadingText}>Loading timeline data...</Text>
                </View>
            </View>
        );
    }

    if (error) {
        return (
            <ScrollView style={styles.container}>
                <View style={styles.header}>
                    <Text style={styles.title}>Nutrient Timeline</Text>
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

    if (!data) {
        return (
            <View style={styles.container}>
                <Text>No data available</Text>
            </View>
        );
    }

    const currentNutrient = getCurrentNutrient();

    return (
        <ScrollView style={styles.container}>
            {/* Header */}
            <View style={styles.header}>
                <Text style={styles.title}>Nutrient Timeline</Text>
                <TouchableOpacity onPress={fetchData} style={styles.refreshBtn}>
                    <Ionicons name="refresh" size={20} color="#00c4ff" />
                </TouchableOpacity>
            </View>

            <View style={styles.card}>
                {/* Chart Header with Controls */}
                <View style={styles.chartHeader}>
                    <View style={styles.chartTitleRow}>
                        <TouchableOpacity
                            style={styles.nutrientSelector}
                            onPress={() => setShowNutrientDropdown(true)}
                        >
                            <Ionicons name={currentNutrient.icon} size={20} color={currentNutrient.color} />
                            <Text style={styles.chartTitle}>{currentNutrient.label}</Text>
                            <Ionicons name="chevron-down" size={16} color="#00c4ff" />
                        </TouchableOpacity>
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

                {/* Nutrient Dropdown Modal */}
                <Modal
                    visible={showNutrientDropdown}
                    transparent={true}
                    animationType="fade"
                    onRequestClose={() => setShowNutrientDropdown(false)}
                >
                    <TouchableOpacity
                        style={styles.modalOverlay}
                        activeOpacity={1}
                        onPress={() => setShowNutrientDropdown(false)}
                    >
                        <View style={styles.dropdownContainer}>
                            <View style={styles.dropdownHeader}>
                                <Text style={styles.dropdownTitle}>Select Nutrient</Text>
                                <TouchableOpacity onPress={() => setShowNutrientDropdown(false)}>
                                    <Ionicons name="close" size={24} color="#666" />
                                </TouchableOpacity>
                            </View>
                            <ScrollView style={styles.dropdownScroll}>
                                {nutrients.map((nutrient) => (
                                    <TouchableOpacity
                                        key={nutrient.name}
                                        style={[
                                            styles.dropdownItem,
                                            selectedNutrient === nutrient.name && styles.dropdownItemActive
                                        ]}
                                        onPress={() => handleNutrientSelect(nutrient.name)}
                                    >
                                        <View style={styles.dropdownItemLeft}>
                                            <View style={[styles.iconContainer, { backgroundColor: `${nutrient.color}1A` }]}>
                                                <Ionicons name={nutrient.icon} size={24} color={nutrient.color} />
                                            </View>
                                            <Text style={[
                                                styles.dropdownItemLabel,
                                                selectedNutrient === nutrient.name && styles.dropdownItemLabelActive
                                            ]}>
                                                {nutrient.label}
                                            </Text>
                                        </View>
                                        {selectedNutrient === nutrient.name && (
                                            <Ionicons name="checkmark-circle" size={24} color={nutrient.color} />
                                        )}
                                    </TouchableOpacity>
                                ))}
                            </ScrollView>
                        </View>
                    </TouchableOpacity>
                </Modal>

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

                {/* Chart Component */}
                <NutrientChart
                    data={data.timeline}
                    nutrient={currentNutrient}
                />

                {/* Stats Footer */}
                <Animated.View style={[
                    styles.statsContainer,
                    {
                        opacity: statsAnimation,
                        transform: [{
                            translateY: statsAnimation.interpolate({
                                inputRange: [0, 1],
                                outputRange: [20, 0]
                            })
                        }]
                    }
                ]}>
                    <View style={[styles.statChip, { backgroundColor: `${currentNutrient.color}1A` }]}>
                        <Text style={styles.statLabel}>Avg</Text>
                        <Text style={[styles.statValue, { color: currentNutrient.color }]}>
                            {Math.round(data.statistics.average * 10) / 10}
                        </Text>
                    </View>
                    <View style={[styles.statChip, { backgroundColor: `${currentNutrient.color}1A` }]}>
                        <Text style={styles.statLabel}>Max</Text>
                        <Text style={[styles.statValue, { color: currentNutrient.color }]}>
                            {Math.round(data.statistics.max * 10) / 10}
                        </Text>
                    </View>
                    <View style={[styles.statChip, { backgroundColor: `${currentNutrient.color}1A` }]}>
                        <Text style={styles.statLabel}>Total</Text>
                        <Text style={[styles.statValue, { color: currentNutrient.color }]}>
                            {Math.round(data.statistics.total * 10) / 10}
                        </Text>
                    </View>
                </Animated.View>
            </View>
        </ScrollView>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#f5f5f5',
        padding: 20,
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
    nutrientSelector: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 10,
        backgroundColor: '#f0f9ff',
        paddingHorizontal: 16,
        paddingVertical: 12,
        borderRadius: 12,
        borderWidth: 1,
        borderColor: '#00c4ff',
        alignSelf: 'flex-start',
    },
    chartTitle: {
        fontSize: 16,
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
    modalOverlay: {
        flex: 1,
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
        justifyContent: 'center',
        alignItems: 'center',
        padding: 20,
    },
    dropdownContainer: {
        backgroundColor: '#fff',
        borderRadius: 20,
        width: '100%',
        maxWidth: 400,
        maxHeight: '80%',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 10 },
        shadowOpacity: 0.3,
        shadowRadius: 20,
        elevation: 10,
    },
    dropdownHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        padding: 20,
        borderBottomWidth: 1,
        borderBottomColor: '#f0f0f0',
    },
    dropdownTitle: {
        fontSize: 20,
        fontWeight: '700',
        color: '#0d0d0d',
    },
    dropdownScroll: {
        maxHeight: 500,
    },
    dropdownItem: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: 16,
        borderBottomWidth: 1,
        borderBottomColor: '#f5f5f5',
    },
    dropdownItemActive: {
        backgroundColor: '#f0f9ff',
    },
    dropdownItemLeft: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 12,
        flex: 1,
    },
    iconContainer: {
        width: 44,
        height: 44,
        borderRadius: 12,
        justifyContent: 'center',
        alignItems: 'center',
    },
    dropdownItemLabel: {
        fontSize: 16,
        fontWeight: '600',
        color: '#0d0d0d',
        flex: 1,
    },
    dropdownItemLabelActive: {
        color: '#00c4ff',
        fontWeight: '700',
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
    statsContainer: {
        flexDirection: 'row',
        justifyContent: 'space-around',
        marginTop: 16,
    },
    statChip: {
        borderRadius: 20,
        paddingVertical: 10,
        paddingHorizontal: 20,
        shadowColor: '#00c4ff',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 2,
        minWidth: 90,
        alignItems: 'center',
    },
    statLabel: {
        fontSize: 11,
        color: '#666',
        fontWeight: '600',
    },
    statValue: {
        fontSize: 16,
        fontWeight: '700',
        paddingBottom: 6,
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
});

export default NutrientTimeline;