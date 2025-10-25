import { View, Text, StyleSheet, ActivityIndicator, TouchableOpacity } from 'react-native';
import React, { useState } from 'react';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';

const MealCard = ({ data }) => {
    const [expanded, setExpanded] = useState(false);

    // Handle processing status
    if (data?.status === -1) {
        return (
            <View style={styles.card}>
                <LinearGradient
                    colors={['#0EA5E9', '#10B981']}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 1 }}
                    style={styles.gradientCard}
                >
                    <ActivityIndicator size="large" color="#fff" />
                    <Text style={styles.processingText}>Analyzing your meal...</Text>
                    <Text style={styles.processingSubtext}>
                        {new Date(data.timestamp).toLocaleTimeString()}
                    </Text>
                </LinearGradient>
            </View>
        );
    }

    // Handle missing or invalid data
    if (!data || data.status !== 1) {
        return null;
    }

    // Get macro nutrients
    const getMacro = (name) => {
        return data.nutrients?.find(n => n.name === name) || null;
    };

    const calories = getMacro('Calories');
    const protein = getMacro('Protein');
    const carbs = getMacro('Carbohydrates');
    const fat = getMacro('Fat');

    const mainMacros = ['Calories', 'Protein', 'Carbohydrates', 'Fat'];
    const micronutrients = data.nutrients?.filter(n =>
        !mainMacros.includes(n.name)
    ) || [];

    const formatAmount = (amt, unit) => {
        return `${amt.toFixed(1)}${unit}`;
    };

    return (
        <View style={styles.card}>
            {/* Gradient Header */}
            <LinearGradient
                colors={['#0EA5E9', '#10B981']}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
                style={styles.headerGradient}
            >
                <View style={styles.headerContent}>
                    <View style={styles.titleRow}>
                        <View style={styles.iconCircle}>
                            <Ionicons name="restaurant" size={18} color="#0EA5E9" />
                        </View>
                        <View style={styles.titleInfo}>
                            <Text style={styles.mealName}>{data.name}</Text>
                            <Text style={styles.servingSize}>{data.serving_size}g • {data.category}</Text>
                        </View>
                    </View>
                    <View style={styles.caloriesCompact}>
                        <Text style={styles.caloriesAmount}>{calories?.amt.toFixed(0)}</Text>
                        <Text style={styles.caloriesLabel}>kcal</Text>
                    </View>
                </View>
            </LinearGradient>

            {/* Macros Grid */}
            <View style={styles.macrosGrid}>
                <View style={styles.macroCell}>
                    <View style={[styles.macroDot, { backgroundColor: '#0EA5E9' }]} />
                    <Text style={styles.macroAmount}>{formatAmount(protein?.amt, protein?.unit)}</Text>
                    <Text style={styles.macroLabel}>Protein</Text>
                </View>

                <View style={styles.divider} />

                <View style={styles.macroCell}>
                    <View style={[styles.macroDot, { backgroundColor: '#10B981' }]} />
                    <Text style={styles.macroAmount}>{formatAmount(carbs?.amt, carbs?.unit)}</Text>
                    <Text style={styles.macroLabel}>Carbs</Text>
                </View>

                <View style={styles.divider} />

                <View style={styles.macroCell}>
                    <View style={[styles.macroDot, { backgroundColor: '#06B6D4' }]} />
                    <Text style={styles.macroAmount}>{formatAmount(fat?.amt, fat?.unit)}</Text>
                    <Text style={styles.macroLabel}>Fat</Text>
                </View>
            </View>

            {/* Expand Button */}
            {micronutrients.length > 0 && (
                <TouchableOpacity
                    style={styles.expandButton}
                    onPress={() => setExpanded(!expanded)}
                    activeOpacity={0.7}
                >
                    <Text style={styles.expandText}>
                        {expanded ? 'Less' : 'More Details'}
                    </Text>
                    <Ionicons
                        name={expanded ? 'chevron-up' : 'chevron-down'}
                        size={16}
                        color="#0EA5E9"
                    />
                </TouchableOpacity>
            )}

            {/* Expanded Nutrients */}
            {expanded && (
                <View style={styles.expandedContainer}>
                    {micronutrients.map((nutrient, index) => (
                        <View key={index} style={styles.nutrientRow}>
                            <Text style={styles.nutrientName}>{nutrient.name}</Text>
                            <Text style={styles.nutrientAmount}>
                                {formatAmount(nutrient.amt, nutrient.unit)}
                            </Text>
                        </View>
                    ))}
                </View>
            )}

            {/* Footer */}
            <View style={styles.footer}>
                <Ionicons name="time-outline" size={12} color="#94A3B8" />
                <Text style={styles.timestamp}>
                    {new Date(data.timestamp).toLocaleString()}
                </Text>
            </View>
        </View>
    );
};

const styles = StyleSheet.create({
    card: {
        backgroundColor: '#fff',
        borderRadius: 12,
        marginVertical: 6,
        marginHorizontal: 16,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.08,
        shadowRadius: 6,
        elevation: 2,
        overflow: 'hidden',
    },
    gradientCard: {
        padding: 32,
        alignItems: 'center',
        justifyContent: 'center',
        borderRadius: 12,
    },
    processingText: {
        fontSize: 15,
        fontWeight: '600',
        color: '#fff',
        marginTop: 12,
    },
    processingSubtext: {
        fontSize: 13,
        color: 'rgba(255,255,255,0.8)',
        marginTop: 4,
    },
    headerGradient: {
        padding: 14,
    },
    headerContent: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    titleRow: {
        flexDirection: 'row',
        alignItems: 'center',
        flex: 1,
    },
    iconCircle: {
        width: 36,
        height: 36,
        borderRadius: 18,
        backgroundColor: '#fff',
        justifyContent: 'center',
        alignItems: 'center',
    },
    titleInfo: {
        marginLeft: 10,
        flex: 1,
    },
    mealName: {
        fontSize: 16,
        fontWeight: '700',
        color: '#fff',
    },
    servingSize: {
        fontSize: 12,
        color: 'rgba(255,255,255,0.85)',
        marginTop: 2,
    },
    caloriesCompact: {
        alignItems: 'flex-end',
    },
    caloriesAmount: {
        fontSize: 28,
        fontWeight: '700',
        color: '#fff',
        lineHeight: 32,
    },
    caloriesLabel: {
        fontSize: 11,
        color: 'rgba(255,255,255,0.85)',
        fontWeight: '600',
    },
    macrosGrid: {
        flexDirection: 'row',
        paddingVertical: 14,
        paddingHorizontal: 12,
    },
    macroCell: {
        flex: 1,
        alignItems: 'center',
    },
    macroDot: {
        width: 8,
        height: 8,
        borderRadius: 4,
        marginBottom: 6,
    },
    macroAmount: {
        fontSize: 15,
        fontWeight: '700',
        color: '#1E293B',
        marginBottom: 2,
    },
    macroLabel: {
        fontSize: 11,
        color: '#64748B',
        fontWeight: '500',
    },
    divider: {
        width: 1,
        backgroundColor: '#E2E8F0',
        marginHorizontal: 8,
    },
    expandButton: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        paddingVertical: 10,
        borderTopWidth: 1,
        borderTopColor: '#F1F5F9',
    },
    expandText: {
        fontSize: 13,
        fontWeight: '600',
        color: '#0EA5E9',
        marginRight: 4,
    },
    expandedContainer: {
        paddingHorizontal: 14,
        paddingTop: 8,
        paddingBottom: 12,
        backgroundColor: '#F8FAFC',
    },
    nutrientRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        paddingVertical: 6,
    },
    nutrientName: {
        fontSize: 13,
        color: '#64748B',
        flex: 1,
    },
    nutrientAmount: {
        fontSize: 13,
        fontWeight: '600',
        color: '#1E293B',
    },
    footer: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 14,
        paddingVertical: 8,
        backgroundColor: '#FAFBFC',
    },
    timestamp: {
        fontSize: 11,
        color: '#94A3B8',
        marginLeft: 4,
    },
});

export default MealCard;