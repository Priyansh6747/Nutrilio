import { View, Text, StyleSheet, ScrollView, ActivityIndicator, TouchableOpacity, Dimensions } from 'react-native'
import React, { useEffect, useState } from 'react'
import { Ionicons } from '@expo/vector-icons'
import {useUser} from "../../utils/AuthContext";
import Config from "../../utils/Config";

const screenWidth = Dimensions.get('window').width



const TopNutrient = () => {
    const { user } = useUser()
    const [data, setData] = useState(null)
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState(null)
    const [showAll, setShowAll] = useState(false)
    const [viewMode, setViewMode] = useState('total')
    const [showDetailedBreakdown, setShowDetailedBreakdown] = useState(false)
    const [showControls, setShowControls] = useState(false)

    // Date range state
    const [startDate, setStartDate] = useState('2025-10-01')
    const [endDate, setEndDate] = useState('2025-10-25')
    const [topN, setTopN] = useState(10)

    useEffect(() => {
        if (user?.uid) {
            fetchData()
        }
    }, [user, startDate, endDate, topN])

    const fetchData = async () => {
        try {
            setLoading(true)
            setError(null)

            const URL = Config.BaseURL + '/api/v1/log/nutrients/top?username=' +
                encodeURIComponent(user.uid) +
                '&start_date=' + startDate +
                '&end_date=' + endDate +
                '&top_n=' + (topN+1)

            const response = await fetch(URL)

            if (!response.ok) {
                throw new Error(`Failed to fetch nutrition data: ${response.status}`)
            }

            const result = await response.json()

            if (result.status === 'success') {
                // Filter out "Calories" from top_nutrients
                const filteredResult = {
                    ...result,
                    top_nutrients: result.top_nutrients.filter(
                        nutrient => nutrient.name.toLowerCase() !== 'calories'
                    )
                }
                setData(filteredResult)
            } else {
                throw new Error('API returned unsuccessful status')
            }
        } catch (err) {
            setError(err.message)
            console.error('Error fetching nutrition data:', err)
        } finally {
            setLoading(false)
        }
    }

    const adjustDate = (dateType, days) => {
        const currentDate = new Date(dateType === 'start' ? startDate : endDate)
        currentDate.setDate(currentDate.getDate() + days)
        const newDate = currentDate.toISOString().split('T')[0]

        if (dateType === 'start') {
            setStartDate(newDate)
        } else {
            setEndDate(newDate)
        }
    }

    const setQuickRange = (range) => {
        const end = new Date()
        const start = new Date()

        switch(range) {
            case 'week':
                start.setDate(end.getDate() - 7)
                break
            case 'month':
                start.setMonth(end.getMonth() - 1)
                break
            case '3months':
                start.setMonth(end.getMonth() - 3)
                break
        }

        setStartDate(start.toISOString().split('T')[0])
        setEndDate(end.toISOString().split('T')[0])
    }

    const getNutrientColor = (index) => {
        const colors = [
            '#00C4FF', // bright aqua blue
            '#00B894', // teal green
            '#0077B6', // deep ocean blue
            '#48CAE4', // light cyan-blue
            '#80ED99', // mint green
            '#56CFE1', // turquoise
            '#4EA8DE', // medium blue
            '#64DFDF', // aqua accent
            '#B9FBC0', // soft pastel green
            '#38B000'  // bold green pop
        ];

        return colors[index % colors.length]
    }

    const formatDate = (dateString) => {
        const date = new Date(dateString)
        const month = date.toLocaleDateString('en-US', { month: 'short' })
        const day = date.getDate()
        return `${month} ${day}`
    }

    return (
        <ScrollView style={styles.container}>
            <View style={styles.header}>
                <Text style={styles.title}>Top Nutrients</Text>
                <TouchableOpacity onPress={fetchData} style={styles.refreshBtn}>
                    <Ionicons name="refresh" size={20} color="#00c4ff" />
                </TouchableOpacity>
            </View>

            {/* Summary Stats */}
            {!loading && data && (
                <View style={styles.summaryContainer}>
                    <View style={styles.statCard}>
                        <Ionicons name="restaurant" size={28} color="#00c4ff" />
                        <Text style={styles.statValue}>{data.total_meals}</Text>
                        <Text style={styles.statLabel}>Total Meals</Text>
                    </View>
                    <View style={styles.statCard}>
                        <Ionicons name="bar-chart" size={28} color="#38914a" />
                        <Text style={styles.statValue}>{data.top_nutrients?.length || 0}</Text>
                        <Text style={styles.statLabel}>Nutrients</Text>
                    </View>
                </View>
            )}

            {/* Loading State */}
            {loading && (
                <View style={styles.centerContainer}>
                    <ActivityIndicator size="large" color="#00c4ff" />
                    <Text style={styles.loadingText}>Loading nutrition data...</Text>
                </View>
            )}

            {/* Error State */}
            {error && (
                <View style={styles.errorContainer}>
                    <Ionicons name="alert-circle" size={40} color="#FF6B6B" />
                    <Text style={styles.errorText}>Error: {error}</Text>
                    <TouchableOpacity style={styles.retryBtn} onPress={fetchData}>
                        <Text style={styles.retryBtnText}>Retry</Text>
                    </TouchableOpacity>
                </View>
            )}

            {/* Chart Card with Integrated Controls */}
            {!loading && !error && data && data.top_nutrients && data.top_nutrients.length > 0 && (
                <View style={styles.chartCard}>
                    {/* Chart Header with Controls Toggle */}
                    <View style={styles.chartHeader}>
                        <View style={styles.chartTitleRow}>
                            <Text style={styles.chartTitle}>Nutrient Analysis</Text>
                            <View style={styles.dateRangePreview}>
                                <Ionicons name="calendar-outline" size={14} color="#00c4ff" />
                                <Text style={styles.dateRangeText}>
                                    {formatDate(startDate)} - {formatDate(endDate)}
                                </Text>
                            </View>
                        </View>
                        <View style={styles.headerControls}>
                            <TouchableOpacity
                                style={styles.viewModeBtn}
                                onPress={() => setViewMode(viewMode === 'total' ? 'average' : 'total')}
                            >
                                <Ionicons
                                    name={viewMode === 'total' ? 'analytics' : 'trending-up'}
                                    size={14}
                                    color="#00c4ff"
                                />
                                <Text style={styles.viewModeText}>
                                    {viewMode === 'total' ? 'Total' : 'Avg'}
                                </Text>
                            </TouchableOpacity>
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
                    </View>

                    {/* Collapsible Controls */}
                    {showControls && (
                        <View style={styles.controlsContainer}>
                            {/* Quick Select Pills */}
                            <View style={styles.pillContainer}>
                                <TouchableOpacity
                                    style={styles.pill}
                                    onPress={() => setQuickRange('week')}
                                >
                                    <Ionicons name="calendar" size={14} color="#00c4ff" />
                                    <Text style={styles.pillText}>7D</Text>
                                </TouchableOpacity>
                                <TouchableOpacity
                                    style={styles.pill}
                                    onPress={() => setQuickRange('month')}
                                >
                                    <Ionicons name="calendar" size={14} color="#00c4ff" />
                                    <Text style={styles.pillText}>1M</Text>
                                </TouchableOpacity>
                                <TouchableOpacity
                                    style={styles.pill}
                                    onPress={() => setQuickRange('3months')}
                                >
                                    <Ionicons name="calendar" size={14} color="#00c4ff" />
                                    <Text style={styles.pillText}>3M</Text>
                                </TouchableOpacity>
                            </View>

                            {/* Date Display with Inline Controls */}
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
                                            <Text style={styles.dateDay}>{formatDate(startDate).split(' ')[1]}</Text>
                                            <Text style={styles.dateMonth}>{formatDate(startDate).split(' ')[0]}</Text>
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
                                            <Text style={styles.dateDay}>{formatDate(endDate).split(' ')[1]}</Text>
                                            <Text style={styles.dateMonth}>{formatDate(endDate).split(' ')[0]}</Text>
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

                            {/* Top N Control */}
                            <View style={styles.topNContainer}>
                                <Ionicons name="list" size={16} color="#00c4ff" />
                                <Text style={styles.topNLabel}>Show Top</Text>
                                <View style={styles.topNControls}>
                                    <TouchableOpacity
                                        style={styles.topNBtn}
                                        onPress={() => setTopN(Math.max(5, topN - 5))}
                                    >
                                        <Ionicons name="remove" size={16} color="#00c4ff" />
                                    </TouchableOpacity>
                                    <View style={styles.topNBadge}>
                                        <Text style={styles.topNValue}>{topN}</Text>
                                    </View>
                                    <TouchableOpacity
                                        style={styles.topNBtn}
                                        onPress={() => setTopN(Math.min(50, topN + 5))}
                                    >
                                        <Ionicons name="add" size={16} color="#00c4ff" />
                                    </TouchableOpacity>
                                </View>
                                <Text style={styles.topNLabel}>Nutrients</Text>
                            </View>
                        </View>
                    )}

                    {/* Divider */}
                    <View style={styles.divider} />

                    {/* Horizontal Bars */}
                    <View style={styles.horizontalBarsContainer}>
                        {(showAll ? data.top_nutrients : data.top_nutrients.slice(0, 5)).map((item, index) => {
                            const maxValue = Math.max(...data.top_nutrients.map(n =>
                                viewMode === 'total' ? n.total_amount : n.average_per_meal
                            ))
                            const value = viewMode === 'total' ? item.total_amount : item.average_per_meal
                            const percentage = (value / maxValue) * 100

                            return (
                                <View key={index} style={styles.horizontalBarRow}>
                                    <View style={styles.barLabelSection}>
                                        <View style={[styles.barRankBadge, { backgroundColor: getNutrientColor(index) }]}>
                                            <Text style={styles.barRankText}>{index + 1}</Text>
                                        </View>
                                        <Text style={styles.barLabel} numberOfLines={1}>
                                            {item.name}
                                        </Text>
                                    </View>
                                    <View style={styles.barSection}>
                                        <View
                                            style={[
                                                styles.horizontalBar,
                                                {
                                                    width: `${percentage}%`,
                                                    backgroundColor: getNutrientColor(index)
                                                }
                                            ]}
                                        >
                                            <Text style={styles.barValue}>
                                                {value.toFixed(1)} {item.unit}
                                            </Text>
                                        </View>
                                    </View>
                                </View>
                            )
                        })}
                    </View>

                    {data.top_nutrients.length > 5 && (
                        <TouchableOpacity
                            style={styles.viewAllBtn}
                            onPress={() => setShowAll(!showAll)}
                        >
                            <Ionicons
                                name={showAll ? "chevron-up" : "chevron-down"}
                                size={16}
                                color="#00c4ff"
                            />
                            <Text style={styles.viewAllText}>
                                {showAll ? 'Show Less' : 'View All'}
                            </Text>
                        </TouchableOpacity>
                    )}
                </View>
            )}

            {/* Collapsible Detailed Breakdown */}
            {!loading && !error && data && data.top_nutrients && data.top_nutrients.length > 0 && (
                <View style={styles.detailedSection}>
                    <TouchableOpacity
                        style={styles.detailedHeader}
                        onPress={() => setShowDetailedBreakdown(!showDetailedBreakdown)}
                    >
                        <View style={styles.detailedTitleRow}>
                            <Ionicons name="list-outline" size={20} color="#00c4ff" />
                            <Text style={styles.detailedTitle}>Detailed Breakdown</Text>
                        </View>
                        <Ionicons
                            name={showDetailedBreakdown ? "chevron-up" : "chevron-down"}
                            size={20}
                            color="#00c4ff"
                        />
                    </TouchableOpacity>

                    {showDetailedBreakdown && (
                        <View style={styles.dataContainer}>
                            {data.top_nutrients.map((item, index) => (
                                <View key={index} style={styles.nutrientCard}>
                                    <View style={[styles.rankBadge, { backgroundColor: getNutrientColor(index) }]}>
                                        <Text style={styles.rankText}>#{index + 1}</Text>
                                    </View>
                                    <View style={styles.nutrientInfo}>
                                        <Text style={styles.nutrientName}>{item.name}</Text>
                                        <View style={styles.nutrientStats}>
                                            <View style={styles.statRow}>
                                                <View style={styles.statIconLabel}>
                                                    <Ionicons name="analytics" size={14} color="#00c4ff" />
                                                    <Text style={styles.statLabel}>Total:</Text>
                                                </View>
                                                <Text style={styles.statText}>
                                                    {item.total_amount.toFixed(2)} {item.unit}
                                                </Text>
                                            </View>
                                            <View style={styles.statRow}>
                                                <View style={styles.statIconLabel}>
                                                    <Ionicons name="trending-up" size={14} color="#38914a" />
                                                    <Text style={styles.statLabel}>Avg/Meal:</Text>
                                                </View>
                                                <Text style={styles.statText}>
                                                    {item.average_per_meal.toFixed(2)} {item.unit}
                                                </Text>
                                            </View>
                                            <View style={styles.statRow}>
                                                <View style={styles.statIconLabel}>
                                                    <Ionicons name="checkmark-circle" size={14} color="#F7DC6F" />
                                                    <Text style={styles.statLabel}>Occurrences:</Text>
                                                </View>
                                                <Text style={styles.statText}>
                                                    {item.occurrence_count} times
                                                </Text>
                                            </View>
                                        </View>
                                    </View>
                                </View>
                            ))}
                        </View>
                    )}
                </View>
            )}

            {!loading && !error && data && data.top_nutrients && data.top_nutrients.length === 0 && (
                <View style={styles.centerContainer}>
                    <Ionicons name="nutrition-outline" size={64} color="#ccc" />
                    <Text style={styles.emptyText}>No nutrition data available</Text>
                    <Text style={styles.emptySubtext}>Try selecting a different date range</Text>
                </View>
            )}
        </ScrollView>
    )
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#f5f5f5',
        padding: 16,
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
    summaryContainer: {
        flexDirection: 'row',
        gap: 12,
        marginBottom: 16,
    },
    statCard: {
        flex: 1,
        backgroundColor: '#fff',
        borderRadius: 16,
        padding: 16,
        alignItems: 'center',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.08,
        shadowRadius: 4,
        elevation: 3,
    },
    statValue: {
        fontSize: 24,
        fontWeight: '700',
        color: '#0d0d0d',
        marginTop: 8,
        marginBottom: 4,
    },
    statLabel: {
        fontSize: 12,
        fontWeight: '500',
        color: '#888',
        textAlign: 'center',
    },
    chartCard: {
        backgroundColor: '#fff',
        borderRadius: 16,
        padding: 20,
        marginBottom: 16,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.12,
        shadowRadius: 10,
        elevation: 5,
    },
    chartHeader: {
        marginBottom: 16,
    },
    chartTitleRow: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        marginBottom: 12,
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
        paddingVertical: 4,
        borderRadius: 8,
    },
    dateRangeText: {
        fontSize: 11,
        fontWeight: '600',
        color: '#00c4ff',
    },
    headerControls: {
        flexDirection: 'row',
        gap: 10,
    },
    viewModeBtn: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 6,
        backgroundColor: '#f0f9ff',
        paddingHorizontal: 14,
        paddingVertical: 8,
        borderRadius: 12,
        borderWidth: 1,
        borderColor: '#00c4ff',
    },
    viewModeText: {
        fontSize: 12,
        fontWeight: '700',
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
        marginBottom: 16,
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
    topNContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 10,
        backgroundColor: '#fff',
        borderRadius: 12,
        padding: 12,
    },
    topNLabel: {
        fontSize: 13,
        fontWeight: '600',
        color: '#888',
    },
    topNControls: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 10,
    },
    topNBtn: {
        width: 32,
        height: 32,
        borderRadius: 8,
        backgroundColor: '#f0f9ff',
        justifyContent: 'center',
        alignItems: 'center',
        borderWidth: 1,
        borderColor: '#00c4ff',
    },
    topNBadge: {
        backgroundColor: '#00c4ff',
        paddingHorizontal: 16,
        paddingVertical: 6,
        borderRadius: 10,
        minWidth: 50,
        alignItems: 'center',
    },
    topNValue: {
        fontSize: 16,
        fontWeight: '700',
        color: '#fff',
    },
    divider: {
        height: 1,
        backgroundColor: '#f0f0f0',
        marginBottom: 20,
    },
    horizontalBarsContainer: {
        gap: 16,
    },
    horizontalBarRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 12,
    },
    barLabelSection: {
        flexDirection: 'row',
        alignItems: 'center',
        width: 110,
        gap: 8,
    },
    barRankBadge: {
        width: 24,
        height: 24,
        borderRadius: 12,
        justifyContent: 'center',
        alignItems: 'center',
    },
    barRankText: {
        fontSize: 11,
        fontWeight: '700',
        color: '#fff',
    },
    barLabel: {
        fontSize: 13,
        fontWeight: '600',
        color: '#0d0d0d',
        flex: 1,
    },
    barSection: {
        flex: 1,
        height: 32,
        backgroundColor: '#f5f5f5',
        borderRadius: 8,
        overflow: 'hidden',
    },
    horizontalBar: {
        height: '100%',
        justifyContent: 'center',
        paddingHorizontal: 10,
        borderRadius: 8,
        minWidth: 80,
    },
    barValue: {
        fontSize: 11,
        fontWeight: '700',
        color: '#fff',
        textAlign: 'right',
    },
    viewAllBtn: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 6,
        paddingVertical: 12,
        marginTop: 16,
        borderTopWidth: 1,
        borderTopColor: '#f0f0f0',
    },
    viewAllText: {
        fontSize: 14,
        fontWeight: '600',
        color: '#00c4ff',
    },
    detailedSection: {
        backgroundColor: '#fff',
        borderRadius: 16,
        padding: 16,
        marginBottom: 20,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.08,
        shadowRadius: 4,
        elevation: 3,
    },
    detailedHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingVertical: 4,
    },
    detailedTitleRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
    },
    detailedTitle: {
        fontSize: 18,
        fontWeight: '700',
        color: '#0d0d0d',
    },
    centerContainer: {
        alignItems: 'center',
        justifyContent: 'center',
        padding: 40,
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
        marginBottom: 16,
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
        flexDirection: 'row',
        alignItems: 'center',
        gap: 6,
    },
    retryBtnText: {
        color: '#fff',
        fontWeight: '600',
        fontSize: 14,
    },
    dataContainer: {
        gap: 12,
        marginTop: 16,
    },
    nutrientCard: {
        backgroundColor: '#f9f9f9',
        borderRadius: 12,
        padding: 16,
        flexDirection: 'row',
    },
    rankBadge: {
        width: 40,
        height: 40,
        borderRadius: 20,
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 16,
    },
    rankText: {
        color: '#fff',
        fontWeight: 'bold',
        fontSize: 14,
    },
    nutrientInfo: {
        flex: 1,
    },
    nutrientName: {
        fontSize: 16,
        fontWeight: '700',
        color: '#0d0d0d',
        marginBottom: 8,
    },
    nutrientStats: {
        gap: 6,
    },
    statRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    statIconLabel: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 6,
    },
    statText: {
        fontSize: 13,
        color: '#0d0d0d',
        fontWeight: '600',
    },
    emptyText: {
        fontSize: 16,
        color: '#999',
        marginTop: 16,
        marginBottom: 8,
        fontWeight: '600',
    },
    emptySubtext: {
        fontSize: 14,
        color: '#bbb',
    },
})

export default TopNutrient