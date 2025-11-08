import { View, Text, StyleSheet, ScrollView, TouchableOpacity, ActivityIndicator } from 'react-native';
import React, { useEffect } from 'react';
import { useUser } from "../../utils/AuthContext";
import Config from "../../utils/Config";
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';

const FoodRecomendation = () => {
    const [data, setData] = React.useState(null);
    const [goal, setGoal] = React.useState(0);
    const [loading, setLoading] = React.useState(true);
    const { user } = useUser();

    const goalData = [
        { key: "weight_loss", label: "Weight Loss", icon: "flame" },
        { key: "muscle_gain", label: "Muscle Gain", icon: "barbell" },
        { key: "balanced_diet", label: "Balanced Diet", icon: "scale" }
    ];

    useEffect(() => {
        const fetchData = async () => {
            try {
                setLoading(true);
                const URL = Config.BaseURL + `/api/v1/log/recommendations?username=${user.uid}&goal=${goalData[goal].key}`;
                let res = await fetch(URL);
                if (!res.ok)
                    throw new Error("Could not find recommendations");
                const json = await res.json();
                setData(json);
            } catch (err) {
                console.log(err);
            } finally {
                setLoading(false);
            }
        };

        if (user) {
            fetchData();
        }
    }, [user, goal]);

    const getAlignmentColor = (alignment) => {
        if (alignment.includes('good')) return '#10b981';
        if (alignment.includes('moderate')) return '#f59e0b';
        return '#ef4444';
    };

    const getAlignmentGradient = (alignment) => {
        if (alignment.includes('good')) return ['#10b981', '#059669'];
        if (alignment.includes('moderate')) return ['#f59e0b', '#ea580c'];
        return ['#ef4444', '#dc2626'];
    };

    if (loading) {
        return (
            <View style={styles.container}>
                <LinearGradient
                    colors={['#0ea5e9', '#06b6d4', '#059669']}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 1 }}
                    style={styles.loadingContainer}
                >
                    <ActivityIndicator size="large" color="#ffffff" />
                    <Text style={styles.loadingText}>Loading recommendations...</Text>
                </LinearGradient>
            </View>
        );
    }

    if (!data) {
        return (
            <View style={styles.container}>
                <Text style={styles.errorText}>No recommendations available</Text>
            </View>
        );
    }

    return (
        <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
            <LinearGradient
                colors={['#0ea5e9', '#06b6d4', '#059669']}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
                style={styles.header}
            >
                <Text style={styles.headerTitle}>Your Personalized</Text>
                <Text style={styles.headerSubtitle}>Meal Recommendations</Text>
            </LinearGradient>

            {/* Goal Selection Radio Buttons */}
            <View style={styles.goalSelector}>
                <Text style={styles.goalSelectorTitle}>Select Your Goal</Text>
                <View style={styles.radioGroup}>
                    {goalData.map((item, index) => (
                        <TouchableOpacity
                            key={item.key}
                            style={[
                                styles.radioButton,
                                goal === index && styles.radioButtonActive
                            ]}
                            onPress={() => setGoal(index)}
                            activeOpacity={0.7}
                        >
                            <View style={styles.radioCircle}>
                                {goal === index && <View style={styles.radioCircleInner} />}
                            </View>
                            <Ionicons
                                name={item.icon}
                                size={32}
                                color={goal === index ? '#0891b2' : '#94a3b8'}
                                style={styles.radioIconStyle}
                            />
                            <Text style={[
                                styles.radioLabel,
                                goal === index && styles.radioLabelActive
                            ]}>
                                {item.label}
                            </Text>
                        </TouchableOpacity>
                    ))}
                </View>
            </View>

            {/* Stats Cards */}
            <View style={styles.statsContainer}>
                <LinearGradient
                    colors={['#0ea5e9', '#0284c7']}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 1 }}
                    style={styles.statCard}
                >
                    <Ionicons name="trophy" size={28} color="#ffffff" style={styles.statIconStyle} />
                    <Text style={styles.statValue}>{data.user_needs?.TDEE || 0}</Text>
                    <Text style={styles.statLabel}>Daily Calories</Text>
                </LinearGradient>

                <LinearGradient
                    colors={['#059669', '#047857']}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 1 }}
                    style={styles.statCard}
                >
                    <Ionicons name="stats-chart" size={28} color="#ffffff" style={styles.statIconStyle} />
                    <Text style={styles.statValue}>
                        {Math.round(data.recommendations?.nutrient_coverage_summary?.total_gap_filled_pct || 0)}%
                    </Text>
                    <Text style={styles.statLabel}>Gap Filled</Text>
                </LinearGradient>

                <LinearGradient
                    colors={['#8b5cf6', '#7c3aed']}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 1 }}
                    style={styles.statCard}
                >
                    <Ionicons name="restaurant" size={28} color="#ffffff" style={styles.statIconStyle} />
                    <Text style={styles.statValue}>
                        {data.recommendations?.recommended_meals?.length || 0}
                    </Text>
                    <Text style={styles.statLabel}>Options</Text>
                </LinearGradient>
            </View>

            {/* Macro Targets */}
            <View style={styles.macrosContainer}>
                <Text style={styles.sectionTitle}>Daily Targets</Text>
                <View style={styles.macrosGrid}>
                    <View style={styles.macroItem}>
                        <LinearGradient
                            colors={['#ef4444', '#dc2626']}
                            style={styles.macroCircle}
                        >
                            <Text style={styles.macroValue}>
                                {Math.round(data.user_needs?.macros_target?.protein_g || 0)}g
                            </Text>
                        </LinearGradient>
                        <Text style={styles.macroLabel}>Protein</Text>
                    </View>
                    <View style={styles.macroItem}>
                        <LinearGradient
                            colors={['#f59e0b', '#ea580c']}
                            style={styles.macroCircle}
                        >
                            <Text style={styles.macroValue}>
                                {Math.round(data.user_needs?.macros_target?.fat_g || 0)}g
                            </Text>
                        </LinearGradient>
                        <Text style={styles.macroLabel}>Fat</Text>
                    </View>
                    <View style={styles.macroItem}>
                        <LinearGradient
                            colors={['#06b6d4', '#0891b2']}
                            style={styles.macroCircle}
                        >
                            <Text style={styles.macroValue}>
                                {Math.round(data.user_needs?.macros_target?.carbs_g || 0)}g
                            </Text>
                        </LinearGradient>
                        <Text style={styles.macroLabel}>Carbs</Text>
                    </View>
                </View>
            </View>

            {/* Recommended Meals */}
            <View style={styles.mealsContainer}>
                <Text style={styles.sectionTitle}>Top Recommendations</Text>
                {data.recommendations?.recommended_meals?.map((meal, index) => (
                    <View key={meal.meal_id} style={styles.mealCard}>
                        <View style={styles.mealHeader}>
                            <View style={styles.mealTitleRow}>
                                <LinearGradient
                                    colors={index === 0 ? ['#fbbf24', '#f59e0b'] : ['#94a3b8', '#64748b']}
                                    style={styles.rankBadge}
                                >
                                    <Text style={styles.rankText}>#{index + 1}</Text>
                                </LinearGradient>
                                <View style={styles.mealTitleContainer}>
                                    <Text style={styles.mealName}>{meal.name.trim()}</Text>
                                    <Text style={styles.mealReason}>💡 {meal.reason}</Text>
                                </View>
                            </View>
                        </View>

                        <LinearGradient
                            colors={getAlignmentGradient(meal.goal_alignment)}
                            start={{ x: 0, y: 0 }}
                            end={{ x: 1, y: 0 }}
                            style={styles.alignmentBar}
                        >
                            <Text style={styles.alignmentText}>
                                {meal.goal_alignment.charAt(0).toUpperCase() + meal.goal_alignment.slice(1)}
                            </Text>
                            <Text style={styles.scoreText}>Score: {meal.score.toFixed(2)}</Text>
                        </LinearGradient>

                        <View style={styles.nutrientsContainer}>
                            <View style={styles.nutrientRow}>
                                <View style={styles.nutrientItem}>
                                    <Ionicons name="flame" size={24} color="#f59e0b" />
                                    <View>
                                        <Text style={styles.nutrientValue}>
                                            {Math.round(meal.key_nutrients.calories)}
                                        </Text>
                                        <Text style={styles.nutrientLabel}>Calories</Text>
                                    </View>
                                </View>
                                <View style={styles.nutrientItem}>
                                    <Ionicons name="egg" size={24} color="#ef4444" />
                                    <View>
                                        <Text style={styles.nutrientValue}>
                                            {Math.round(meal.key_nutrients.protein_g)}g
                                        </Text>
                                        <Text style={styles.nutrientLabel}>Protein</Text>
                                    </View>
                                </View>
                            </View>
                            <View style={styles.nutrientRow}>
                                <View style={styles.nutrientItem}>
                                    <Ionicons name="nutrition" size={24} color="#10b981" />
                                    <View>
                                        <Text style={styles.nutrientValue}>
                                            {Math.round(meal.key_nutrients.fat_g)}g
                                        </Text>
                                        <Text style={styles.nutrientLabel}>Fat</Text>
                                    </View>
                                </View>
                                <View style={styles.nutrientItem}>
                                    <Ionicons name="medkit" size={24} color="#8b5cf6" />
                                    <View>
                                        <Text style={styles.nutrientValue}>
                                            {meal.key_nutrients.calcium_mg.toFixed(2)}
                                        </Text>
                                        <Text style={styles.nutrientLabel}>Calcium</Text>
                                    </View>
                                </View>
                            </View>
                        </View>
                    </View>
                ))}
            </View>

            {/* Priority Nutrient Gaps */}
            <View style={styles.gapsContainer}>
                <Text style={styles.sectionTitle}>Priority Nutrients to Fill</Text>
                <Text style={styles.gapsSubtitle}>Focus on these nutrients this week</Text>
                <View style={styles.gapsGrid}>
                    {data.gap_analysis?.priority_nutrients?.slice(0, 5).map((nutrient) => {
                        const gap = data.gap_analysis.nutrient_gaps[nutrient];
                        const nutrientIcons = {
                            calories: 'flame',
                            calcium_mg: 'medkit',
                            carbs_g: 'pizza',
                            protein_g: 'egg',
                            vitaminC_mg: 'leaf',
                            fiber_g: 'sparkles',
                            iron_mg: 'flash'
                        };
                        const iconColors = {
                            calories: '#f59e0b',
                            calcium_mg: '#8b5cf6',
                            carbs_g: '#06b6d4',
                            protein_g: '#ef4444',
                            vitaminC_mg: '#10b981',
                            fiber_g: '#f97316',
                            iron_mg: '#eab308'
                        };
                        return (
                            <LinearGradient
                                key={nutrient}
                                colors={['#ffffff', '#f0f9ff']}
                                style={styles.gapCard}
                            >
                                <Ionicons
                                    name={nutrientIcons[nutrient] || 'stats-chart'}
                                    size={28}
                                    color={iconColors[nutrient] || '#059669'}
                                    style={styles.gapIconStyle}
                                />
                                <Text style={styles.gapValue}>
                                    {typeof gap === 'number' ? Math.round(gap) : gap}
                                </Text>
                                <Text style={styles.gapLabel}>
                                    {nutrient.replace(/_/g, ' ').replace(/([A-Z])/g, ' $1').trim()}
                                </Text>
                            </LinearGradient>
                        );
                    })}
                </View>
            </View>

            <View style={styles.bottomPadding} />
        </ScrollView>
    );
};

export default FoodRecomendation;

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#f8fafc',
    },
    loadingContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        minHeight: 300,
        borderRadius: 20,
        margin: 16,
    },
    loadingText: {
        color: '#ffffff',
        fontSize: 16,
        marginTop: 12,
        fontWeight: '600',
    },
    header: {
        padding: 32,
        paddingTop: 48,
        borderBottomLeftRadius: 32,
        borderBottomRightRadius: 32,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.2,
        shadowRadius: 12,
        elevation: 8,
    },
    headerTitle: {
        fontSize: 16,
        color: 'rgba(255, 255, 255, 0.9)',
        fontWeight: '500',
        letterSpacing: 1,
        textTransform: 'uppercase',
    },
    headerSubtitle: {
        fontSize: 32,
        fontWeight: 'bold',
        color: '#ffffff',
        marginTop: 4,
    },
    goalSelector: {
        backgroundColor: '#ffffff',
        margin: 16,
        padding: 20,
        borderRadius: 20,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.08,
        shadowRadius: 12,
        elevation: 4,
    },
    goalSelectorTitle: {
        fontSize: 18,
        fontWeight: '700',
        color: '#0f172a',
        marginBottom: 16,
    },
    radioGroup: {
        flexDirection: 'row',
        gap: 10,
    },
    radioButton: {
        flex: 1,
        flexDirection: 'column',
        alignItems: 'center',
        padding: 16,
        borderRadius: 16,
        backgroundColor: '#f8fafc',
        borderWidth: 2,
        borderColor: '#e2e8f0',
    },
    radioButtonActive: {
        backgroundColor: '#e0f2fe',
        borderColor: '#0891b2',
    },
    radioCircle: {
        width: 20,
        height: 20,
        borderRadius: 10,
        borderWidth: 2,
        borderColor: '#94a3b8',
        marginBottom: 8,
        justifyContent: 'center',
        alignItems: 'center',
    },
    radioCircleInner: {
        width: 10,
        height: 10,
        borderRadius: 5,
        backgroundColor: '#0891b2',
    },
    radioIconStyle: {
        marginBottom: 8,
    },
    radioLabel: {
        fontSize: 13,
        fontWeight: '600',
        color: '#64748b',
        textAlign: 'center',
    },
    radioLabelActive: {
        color: '#0891b2',
    },
    statsContainer: {
        flexDirection: 'row',
        paddingHorizontal: 16,
        gap: 12,
        marginTop: 8,
    },
    statCard: {
        flex: 1,
        padding: 20,
        borderRadius: 20,
        alignItems: 'center',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.15,
        shadowRadius: 12,
        elevation: 6,
    },
    statIconStyle: {
        marginBottom: 8,
    },
    statValue: {
        fontSize: 28,
        fontWeight: 'bold',
        color: '#ffffff',
        marginBottom: 4,
    },
    statLabel: {
        fontSize: 12,
        color: 'rgba(255, 255, 255, 0.9)',
        fontWeight: '600',
        textAlign: 'center',
    },
    macrosContainer: {
        padding: 16,
        marginTop: 8,
    },
    sectionTitle: {
        fontSize: 22,
        fontWeight: 'bold',
        color: '#0f172a',
        marginBottom: 4,
    },
    macrosGrid: {
        flexDirection: 'row',
        justifyContent: 'space-around',
        backgroundColor: '#ffffff',
        padding: 24,
        borderRadius: 20,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.08,
        shadowRadius: 12,
        elevation: 4,
        marginTop: 12,
    },
    macroItem: {
        alignItems: 'center',
    },
    macroCircle: {
        width: 80,
        height: 80,
        borderRadius: 40,
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 8,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.2,
        shadowRadius: 8,
        elevation: 4,
    },
    macroValue: {
        fontSize: 20,
        fontWeight: 'bold',
        color: '#ffffff',
    },
    macroLabel: {
        fontSize: 14,
        fontWeight: '600',
        color: '#64748b',
    },
    mealsContainer: {
        padding: 16,
    },
    mealCard: {
        backgroundColor: '#ffffff',
        borderRadius: 20,
        marginBottom: 16,
        overflow: 'hidden',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.1,
        shadowRadius: 16,
        elevation: 6,
    },
    mealHeader: {
        padding: 20,
        paddingBottom: 16,
    },
    mealTitleRow: {
        flexDirection: 'row',
        alignItems: 'flex-start',
        gap: 12,
    },
    rankBadge: {
        width: 44,
        height: 44,
        borderRadius: 22,
        justifyContent: 'center',
        alignItems: 'center',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.2,
        shadowRadius: 4,
        elevation: 3,
    },
    rankText: {
        fontSize: 16,
        fontWeight: 'bold',
        color: '#ffffff',
    },
    mealTitleContainer: {
        flex: 1,
    },
    mealName: {
        fontSize: 20,
        fontWeight: 'bold',
        color: '#0f172a',
        marginBottom: 6,
    },
    mealReason: {
        fontSize: 13,
        color: '#64748b',
        fontStyle: 'italic',
        lineHeight: 18,
    },
    alignmentBar: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingVertical: 12,
        paddingHorizontal: 20,
    },
    alignmentText: {
        color: '#ffffff',
        fontSize: 14,
        fontWeight: '700',
        textTransform: 'capitalize',
    },
    scoreText: {
        color: 'rgba(255, 255, 255, 0.95)',
        fontSize: 13,
        fontWeight: '600',
    },
    nutrientsContainer: {
        padding: 20,
        backgroundColor: '#f8fafc',
        gap: 12,
    },
    nutrientRow: {
        flexDirection: 'row',
        gap: 12,
    },
    nutrientItem: {
        flex: 1,
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#ffffff',
        padding: 14,
        borderRadius: 14,
        gap: 10,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.05,
        shadowRadius: 4,
        elevation: 2,
    },
    nutrientValue: {
        fontSize: 18,
        fontWeight: 'bold',
        color: '#0891b2',
    },
    nutrientLabel: {
        fontSize: 11,
        color: '#64748b',
        fontWeight: '500',
    },
    gapsContainer: {
        padding: 16,
        paddingBottom: 8,
    },
    gapsSubtitle: {
        fontSize: 14,
        color: '#64748b',
        marginBottom: 16,
        marginTop: 4,
    },
    gapsGrid: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: 12,
    },
    gapCard: {
        width: '31%',
        padding: 16,
        borderRadius: 16,
        alignItems: 'center',
        borderWidth: 1,
        borderColor: '#e0f2fe',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.06,
        shadowRadius: 8,
        elevation: 3,
    },
    gapIconStyle: {
        marginBottom: 8,
    },
    gapValue: {
        fontSize: 20,
        fontWeight: 'bold',
        color: '#059669',
        marginBottom: 4,
    },
    gapLabel: {
        fontSize: 11,
        color: '#64748b',
        textAlign: 'center',
        textTransform: 'capitalize',
        fontWeight: '500',
    },
    errorText: {
        fontSize: 16,
        color: '#64748b',
        textAlign: 'center',
        marginTop: 40,
    },
    bottomPadding: {
        height: 32,
    },
});