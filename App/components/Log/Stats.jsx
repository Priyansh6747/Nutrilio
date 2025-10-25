import {View, Text, StyleSheet, ActivityIndicator, ScrollView} from 'react-native'
import React, {useState, useEffect} from 'react'
import {useUser} from "../../utils/AuthContext";
import ServerConfig from "../../utils/Config";
import {Ionicons} from '@expo/vector-icons';

const formatDate = (date) => {
    if (!(date instanceof Date)) date = new Date(date);
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
};

// Nutrient configuration with icons, colors, and targets
const nutrientConfig = {
    'Calories': { icon: 'flame', color: '#f97316', target: 2000, unit: 'kcal', category: 'macro' },
    'Protein': { icon: 'fitness', color: '#06b6d4', target: 120, category: 'macro' },
    'Carbohydrates': { icon: 'nutrition', color: '#eab308', target: 250, category: 'macro' },
    'Fat': { icon: 'water', color: '#84cc16', target: 65, category: 'macro' },
    'Fiber': { icon: 'leaf', color: '#22c55e', target: 30, category: 'macro' },
    'Sugar': { icon: 'cube', color: '#f59e0b', target: 50, category: 'macro' },
    'Saturated Fat': { icon: 'alert-circle', color: '#ef4444', target: 20, category: 'fat' },
    'Trans Fat': { icon: 'close-circle', color: '#dc2626', target: 2, category: 'fat' },
    'Cholesterol': { icon: 'pulse', color: '#f43f5e', target: 300, category: 'fat' },
    'Monounsaturated Fat': { icon: 'leaf-outline', color: '#10b981', target: 25, category: 'fat' },
    'Polyunsaturated Fat': { icon: 'leaf', color: '#059669', target: 20, category: 'fat' },
    'Calcium': { icon: 'fitness-outline', color: '#64748b', target: 1000, category: 'mineral' },
    'Iron': { icon: 'magnet', color: '#991b1b', target: 18, category: 'mineral' },
    'Magnesium': { icon: 'sparkles', color: '#0891b2', target: 400, category: 'mineral' },
    'Phosphorus': { icon: 'diamond-outline', color: '#7c3aed', target: 700, category: 'mineral' },
    'Potassium': { icon: 'flash', color: '#ec4899', target: 3500, category: 'mineral' },
    'Sodium': { icon: 'water-outline', color: '#8b5cf6', target: 2300, category: 'mineral' },
    'Zinc': { icon: 'shield-checkmark', color: '#059669', target: 11, unit: 'mg', category: 'mineral' },
    'Vitamin A': { icon: 'eye', color: '#f97316', target: 900, category: 'vitamin' },
    'Vitamin C': { icon: 'sunny', color: '#fb923c', target: 90, category: 'vitamin' },
    'Vitamin E': { icon: 'leaf-outline', color: '#84cc16', target: 15, category: 'vitamin' },
    'Vitamin B1 (Thiamin)': { icon: 'cellular', color: '#06b6d4', target: 1.2, category: 'vitamin' },
    'Vitamin B2 (Riboflavin)': { icon: 'cellular', color: '#14b8a6', target: 1.3, category: 'vitamin' },
    'Vitamin B3 (Niacin)': { icon: 'cellular', color: '#10b981', target: 16, category: 'vitamin' },
    'Vitamin B6': { icon: 'cellular', color: '#22c55e', target: 1.7, category: 'vitamin' },
    'Folate (B9)': { icon: 'heart-outline', color: '#84cc16', target: 400, category: 'vitamin' },
};

const NutrientCard = ({iconName, name, current, target, unit, color}) => {
    const percentage = Math.min((current / target) * 100, 100);

    // Use the unit from API response directly
    let displayValue = current;
    let displayTarget = target;
    let displayUnit = unit || 'g';

    // Convert g to mg for minerals when they come as g in API
    if (unit === 'g' && current < 5) {
        // Minerals like Calcium, Magnesium, Phosphorus, Potassium, Sodium come as 'g' but are better displayed in mg
        displayValue = Math.round(current * 1000);
        displayTarget = Math.round(target);
        displayUnit = 'mg';
    }

    return (
        <View style={styles.nutrientCard}>
            <View style={styles.nutrientHeader}>
                <Ionicons name={iconName} size={18} color={color} style={styles.nutrientIcon} />
                <Text style={styles.nutrientName}>{name}</Text>
                <Text style={styles.nutrientValues}>
                    {displayValue.toFixed(displayUnit === 'g' ? 1 : 0)}/{displayTarget}{displayUnit}
                </Text>
            </View>
            <View style={styles.progressBarContainer}>
                <View
                    style={[
                        styles.progressBar,
                        {width: `${percentage}%`, backgroundColor: color}
                    ]}
                />
            </View>
        </View>
    );
};

const Stats = ({selectedDate, refresh}) => {
    const {user} = useUser();
    const [data, setData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    const fetchData = async () => {
        try {
            setLoading(true);
            const URL = `${ServerConfig.BaseURL}/api/v1/log/nutrition/daily?username=${user.uid}&date=${formatDate(selectedDate)}`
            let res = await fetch(URL);
            if (!res.ok)
                throw new Error(res.statusText);
            let json = await res.json();
            setData(json);
            setError(null);
        } catch (err) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchData();
    }, [selectedDate, refresh]);

    if (loading) {
        return (
            <View style={styles.centerContainer}>
                <ActivityIndicator size="large" color="#10b981" />
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

    if (!data || !data.nutrient_totals || data.nutrient_totals.length === 0) {
        return (
            <View style={styles.centerContainer}>
                <Text style={styles.emptyText}>No nutrition data available</Text>
            </View>
        );
    }

    // Categorize nutrients
    const macros = [];
    const fats = [];
    const vitamins = [];
    const minerals = [];

    data.nutrient_totals.forEach(nutrient => {
        const config = nutrientConfig[nutrient.name];
        if (!config) return; // Skip if no config

        const item = {
            ...nutrient,
            ...config
        };

        switch (config.category) {
            case 'macro':
                macros.push(item);
                break;
            case 'fat':
                fats.push(item);
                break;
            case 'vitamin':
                vitamins.push(item);
                break;
            case 'mineral':
                minerals.push(item);
                break;
        }
    });

    return (
        <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
            <View style={styles.container}>
                {/* Macronutrients */}
                <View style={styles.card}>
                    <Text style={styles.sectionTitle}>Macronutrients</Text>
                    {macros.map((nutrient, index) => (
                        <NutrientCard
                            key={index}
                            iconName={nutrient.icon}
                            name={nutrient.name}
                            current={nutrient.amt}
                            target={nutrient.target}
                            unit={nutrient.unit}
                            color={nutrient.color}
                        />
                    ))}
                </View>

                {/* Fats Breakdown */}
                {fats.length > 0 && (
                    <View style={styles.card}>
                        <Text style={styles.sectionTitle}>Fats Breakdown</Text>
                        {fats.map((nutrient, index) => (
                            <NutrientCard
                                key={index}
                                iconName={nutrient.icon}
                                name={nutrient.name}
                                current={nutrient.amt}
                                target={nutrient.target}
                                unit={nutrient.unit}
                                color={nutrient.color}
                            />
                        ))}
                    </View>
                )}

                {/* Vitamins */}
                {vitamins.length > 0 && (
                    <View style={styles.card}>
                        <Text style={styles.sectionTitle}>Vitamins</Text>
                        {vitamins.map((nutrient, index) => (
                            <NutrientCard
                                key={index}
                                iconName={nutrient.icon}
                                name={nutrient.name}
                                current={nutrient.amt}
                                target={nutrient.target}
                                unit={nutrient.unit}
                                color={nutrient.color}
                            />
                        ))}
                    </View>
                )}

                {/* Minerals */}
                {minerals.length > 0 && (
                    <View style={styles.card}>
                        <Text style={styles.sectionTitle}>Minerals</Text>
                        {minerals.map((nutrient, index) => (
                            <NutrientCard
                                key={index}
                                iconName={nutrient.icon}
                                name={nutrient.name}
                                current={nutrient.amt}
                                target={nutrient.target}
                                unit={nutrient.unit}
                                color={nutrient.color}
                            />
                        ))}
                    </View>
                )}
            </View>
        </ScrollView>
    );
};

const styles = StyleSheet.create({
    scrollView: {
        flex: 1,
    },
    container: {
        padding: 16,
    },
    centerContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        padding: 16,
    },
    card: {
        backgroundColor: '#ffffff',
        borderRadius: 16,
        padding: 20,
        marginBottom: 16,
        shadowColor: '#000',
        shadowOffset: {width: 0, height: 2},
        shadowOpacity: 0.1,
        shadowRadius: 8,
        elevation: 3,
    },
    sectionTitle: {
        fontSize: 18,
        fontWeight: '600',
        color: '#10b981',
        marginBottom: 16,
    },
    nutrientCard: {
        marginBottom: 14,
    },
    nutrientHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 8,
    },
    nutrientIcon: {
        marginRight: 8,
    },
    nutrientName: {
        fontSize: 13,
        color: '#374151',
        flex: 1,
    },
    nutrientValues: {
        fontSize: 12,
        color: '#6b7280',
        fontWeight: '500',
    },
    progressBarContainer: {
        height: 6,
        backgroundColor: '#e5e7eb',
        borderRadius: 3,
        overflow: 'hidden',
    },
    progressBar: {
        height: '100%',
        borderRadius: 3,
    },
    errorText: {
        color: '#ef4444',
        fontSize: 14,
    },
    emptyText: {
        color: '#6b7280',
        fontSize: 14,
    },
});

export default Stats;