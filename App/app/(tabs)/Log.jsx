import React, { useState } from 'react';
import {
    View,
    Text,
    StyleSheet,
    TextInput,
    TouchableOpacity,
    ScrollView,
    FlatList,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import NameInputModal from '../../Components/Log/NameInputModal';
import CameraScanModal from '../../Components/Log/CameraScanModal';
import { mealTimes, recentFoods } from '../../Components/Log/constants';

const Log = () => {
    const [searchQuery, setSearchQuery] = useState('');
    const [selectedMeal, setSelectedMeal] = useState(null);
    const [scanModalVisible, setScanModalVisible] = useState(false);
    const [nameInputModalVisible, setNameInputModalVisible] = useState(false);
    const [foodName, setFoodName] = useState('');
    const [foodDescription, setFoodDescription] = useState('');

    const handleScanFood = () => {
        setNameInputModalVisible(true);
    };

    const handleSearchFood = () => {
        console.log('Search food:', searchQuery);
    };

    const handleNameSubmit = () => {
        setNameInputModalVisible(false);
        setScanModalVisible(true);
    };

    const resetFlow = () => {
        setFoodName('');
        setFoodDescription('');
        setScanModalVisible(false);
        setNameInputModalVisible(false);
    };

    const renderMealTime = ({ item }) => (
        <TouchableOpacity
            style={[
                styles.mealCard,
                selectedMeal === item.id && styles.mealCardSelected,
            ]}
            onPress={() => setSelectedMeal(item.id)}
            activeOpacity={0.7}
        >
            <View style={[styles.mealIconContainer, { backgroundColor: item.color + '20' }]}>
                <Text style={styles.mealEmoji}>{item.icon}</Text>
            </View>
            <Text style={styles.mealName}>{item.name}</Text>
            <Text style={styles.mealTime}>{item.time}</Text>
        </TouchableOpacity>
    );

    const renderRecentFood = ({ item }) => (
        <TouchableOpacity style={styles.recentFoodCard} activeOpacity={0.7}>
            <View style={[styles.foodIconContainer, { backgroundColor: item.color }]}>
                <Text style={styles.foodEmoji}>{item.icon}</Text>
            </View>
            <View style={styles.foodInfo}>
                <Text style={styles.foodName}>{item.name}</Text>
                <Text style={styles.foodDetails}>{item.details}</Text>
            </View>
            <View style={styles.caloriesContainer}>
                <Text style={styles.caloriesText}>{item.calories} cal</Text>
                <TouchableOpacity style={styles.addButton}>
                    <Ionicons name="add" size={20} color="#4CAF50" />
                </TouchableOpacity>
            </View>
        </TouchableOpacity>
    );

    return (
        <View style={styles.container}>
            <ScrollView
                style={styles.scrollView}
                showsVerticalScrollIndicator={false}
            >
                {/* Header */}
                <View style={styles.header}>
                    <Text style={styles.headerTitle}>Log Your Food</Text>
                    <Text style={styles.headerSubtitle}>Track your meals and nutrition</Text>
                </View>

                {/* Action Buttons */}
                <View style={styles.actionButtons}>
                    <TouchableOpacity
                        style={styles.actionCard}
                        onPress={handleScanFood}
                        activeOpacity={0.7}
                    >
                        <View style={[styles.actionIconContainer, { backgroundColor: '#E8F5E9' }]}>
                            <Ionicons name="camera" size={28} color="#4CAF50" />
                        </View>
                        <Text style={styles.actionTitle}>Snap Food</Text>
                        <Text style={styles.actionSubtitle}>AI recognizes{'\n'}your meal</Text>
                    </TouchableOpacity>

                    <TouchableOpacity
                        style={styles.actionCard}
                        onPress={handleSearchFood}
                        activeOpacity={0.7}
                    >
                        <View style={[styles.actionIconContainer, { backgroundColor: '#E3F2FD' }]}>
                            <Ionicons name="search" size={28} color="#2196F3" />
                        </View>
                        <Text style={styles.actionTitle}>Search Food</Text>
                        <Text style={styles.actionSubtitle}>Manual entry</Text>
                    </TouchableOpacity>
                </View>

                {/* Search Bar */}
                <View style={styles.searchContainer}>
                    <Ionicons name="search" size={20} color="#999" style={styles.searchIcon} />
                    <TextInput
                        style={styles.searchInput}
                        placeholder="Search foods, brands, or scan barcode"
                        placeholderTextColor="#999"
                        value={searchQuery}
                        onChangeText={setSearchQuery}
                    />
                    {searchQuery.length > 0 && (
                        <TouchableOpacity onPress={() => setSearchQuery('')}>
                            <Ionicons name="close-circle" size={20} color="#999" />
                        </TouchableOpacity>
                    )}
                </View>

                {/* Add to Meal Section */}
                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>Add to meal</Text>
                    <FlatList
                        data={mealTimes}
                        renderItem={renderMealTime}
                        keyExtractor={(item) => item.id}
                        horizontal
                        showsHorizontalScrollIndicator={false}
                        contentContainerStyle={styles.mealList}
                    />
                </View>

                {/* Recent Foods Section */}
                <View style={styles.section}>
                    <View style={styles.recentHeader}>
                        <Ionicons name="time-outline" size={22} color="#4CAF50" />
                        <Text style={styles.sectionTitle}>Recent Foods</Text>
                    </View>
                    <FlatList
                        data={recentFoods}
                        renderItem={renderRecentFood}
                        keyExtractor={(item) => item.id}
                        scrollEnabled={false}
                    />
                </View>

                {/* Quick Add Section */}
                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>Quick Add</Text>
                    <View style={styles.quickAddContainer}>
                        <TouchableOpacity style={styles.quickAddButton} activeOpacity={0.7}>
                            <Ionicons name="water" size={24} color="#2196F3" />
                            <Text style={styles.quickAddText}>Water</Text>
                        </TouchableOpacity>
                        <TouchableOpacity style={styles.quickAddButton} activeOpacity={0.7}>
                            <Ionicons name="cafe" size={24} color="#795548" />
                            <Text style={styles.quickAddText}>Coffee</Text>
                        </TouchableOpacity>
                        <TouchableOpacity style={styles.quickAddButton} activeOpacity={0.7}>
                            <Ionicons name="barbell" size={24} color="#FF9800" />
                            <Text style={styles.quickAddText}>Exercise</Text>
                        </TouchableOpacity>
                    </View>
                </View>
            </ScrollView>

            {/* Name Input Modal */}
            <NameInputModal
                visible={nameInputModalVisible}
                foodName={foodName}
                foodDescription={foodDescription}
                onFoodNameChange={setFoodName}
                onFoodDescriptionChange={setFoodDescription}
                onSubmit={handleNameSubmit}
                onClose={() => {
                    setNameInputModalVisible(false);
                    setFoodName('');
                    setFoodDescription('');
                }}
            />

            {/* Camera Scan Modal */}
            <CameraScanModal
                visible={scanModalVisible}
                foodName={foodName}
                foodDescription={foodDescription}
                selectedMeal={selectedMeal}
                onClose={resetFlow}
            />
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#F8F9FA',
    },
    scrollView: {
        flex: 1,
    },
    header: {
        paddingHorizontal: 20,
        paddingTop: 60,
        paddingBottom: 24,
        backgroundColor: '#fff',
    },
    headerTitle: {
        fontSize: 32,
        fontWeight: '700',
        color: '#1A1A1A',
        marginBottom: 8,
        letterSpacing: 0.5,
    },
    headerSubtitle: {
        fontSize: 16,
        color: '#999',
        fontWeight: '400',
    },
    actionButtons: {
        flexDirection: 'row',
        paddingHorizontal: 20,
        marginTop: 20,
        gap: 12,
    },
    actionCard: {
        flex: 1,
        backgroundColor: '#fff',
        borderRadius: 20,
        padding: 20,
        alignItems: 'center',
        shadowColor: '#000',
        shadowOffset: {
            width: 0,
            height: 4,
        },
        shadowOpacity: 0.08,
        shadowRadius: 12,
        elevation: 4,
    },
    actionIconContainer: {
        width: 64,
        height: 64,
        borderRadius: 32,
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 12,
    },
    actionTitle: {
        fontSize: 16,
        fontWeight: '700',
        color: '#1A1A1A',
        marginBottom: 4,
        letterSpacing: 0.2,
    },
    actionSubtitle: {
        fontSize: 13,
        color: '#999',
        textAlign: 'center',
        lineHeight: 18,
    },
    searchContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#fff',
        marginHorizontal: 20,
        marginTop: 20,
        paddingHorizontal: 16,
        paddingVertical: 12,
        borderRadius: 16,
        borderWidth: 2,
        borderColor: '#F0F0F0',
    },
    searchIcon: {
        marginRight: 10,
    },
    searchInput: {
        flex: 1,
        fontSize: 15,
        color: '#1A1A1A',
    },
    section: {
        marginTop: 32,
        paddingHorizontal: 20,
    },
    sectionTitle: {
        fontSize: 20,
        fontWeight: '700',
        color: '#1A1A1A',
        marginBottom: 16,
        letterSpacing: 0.3,
    },
    mealList: {
        gap: 12,
    },
    mealCard: {
        backgroundColor: '#fff',
        borderRadius: 16,
        padding: 16,
        alignItems: 'center',
        minWidth: 100,
        borderWidth: 2,
        borderColor: '#F0F0F0',
        shadowColor: '#000',
        shadowOffset: {
            width: 0,
            height: 2,
        },
        shadowOpacity: 0.06,
        shadowRadius: 8,
        elevation: 2,
    },
    mealCardSelected: {
        borderColor: '#4CAF50',
        backgroundColor: '#E8F5E9',
    },
    mealIconContainer: {
        width: 48,
        height: 48,
        borderRadius: 24,
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 8,
    },
    mealEmoji: {
        fontSize: 24,
    },
    mealName: {
        fontSize: 15,
        fontWeight: '700',
        color: '#1A1A1A',
        marginBottom: 4,
        letterSpacing: 0.2,
    },
    mealTime: {
        fontSize: 12,
        color: '#999',
        fontWeight: '500',
    },
    recentHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 10,
        marginBottom: 16,
    },
    recentFoodCard: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#fff',
        borderRadius: 16,
        padding: 16,
        marginBottom: 12,
        shadowColor: '#000',
        shadowOffset: {
            width: 0,
            height: 2,
        },
        shadowOpacity: 0.06,
        shadowRadius: 8,
        elevation: 2,
    },
    foodIconContainer: {
        width: 48,
        height: 48,
        borderRadius: 12,
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 12,
    },
    foodEmoji: {
        fontSize: 24,
    },
    foodInfo: {
        flex: 1,
    },
    foodName: {
        fontSize: 16,
        fontWeight: '700',
        color: '#1A1A1A',
        marginBottom: 4,
        letterSpacing: 0.2,
    },
    foodDetails: {
        fontSize: 13,
        color: '#999',
        fontWeight: '400',
    },
    caloriesContainer: {
        alignItems: 'flex-end',
    },
    caloriesText: {
        fontSize: 15,
        fontWeight: '700',
        color: '#4CAF50',
        marginBottom: 8,
        letterSpacing: 0.2,
    },
    addButton: {
        width: 32,
        height: 32,
        borderRadius: 16,
        backgroundColor: '#E8F5E9',
        justifyContent: 'center',
        alignItems: 'center',
    },
    quickAddContainer: {
        flexDirection: 'row',
        gap: 12,
    },
    quickAddButton: {
        flex: 1,
        backgroundColor: '#fff',
        borderRadius: 16,
        padding: 20,
        alignItems: 'center',
        shadowColor: '#000',
        shadowOffset: {
            width: 0,
            height: 2,
        },
        shadowOpacity: 0.06,
        shadowRadius: 8,
        elevation: 2,
    },
    quickAddText: {
        fontSize: 14,
        fontWeight: '600',
        color: '#1A1A1A',
        marginTop: 8,
        letterSpacing: 0.2,
    },
});

export default Log;