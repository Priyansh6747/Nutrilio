import React, { useState } from 'react';
import {
    View,
    Text,
    StyleSheet,
    TouchableOpacity,
    ScrollView,
    FlatList,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import NameInputModal from '../../Components/Log/NameInputModal';
import CameraScanModal from '../../Components/Log/CameraScanModal';
import BarcodeScanModal from '../../Components/Log/BarcodeScanner';
import AmountInputModal from '../../Components/Log/AmtInputModal';
import Toast from '../../Components/ToastB';
import useToast from '../../utils/useToast';
import { mealTimes, recentFoods } from '../../Components/Log/constants';

const Log = () => {
    const [searchQuery, setSearchQuery] = useState('');
    const [selectedMeal, setSelectedMeal] = useState(null);
    const [scanModalVisible, setScanModalVisible] = useState(false);
    const [barcodeModalVisible, setBarcodeModalVisible] = useState(false);
    const [nameInputModalVisible, setNameInputModalVisible] = useState(false);
    const [amountModalVisible, setAmountModalVisible] = useState(false);
    const [foodName, setFoodName] = useState('');
    const [foodDescription, setFoodDescription] = useState('');
    const [currentFoodData, setCurrentFoodData] = useState(null);

    // Initialize toast
    const { toast, showToast, hideToast } = useToast();

    const handleScanFood = () => {
        setNameInputModalVisible(true);
    };

    const handleBarcode = () => {
        setBarcodeModalVisible(true);
    };

    const handleBarcodeScanned = ({ type, data }) => {
        console.log('Barcode Result:');
        console.log('Type:', type);
        console.log('Data:', data);
        showToast('Barcode scanned successfully!', 'success', 2000);
    };

    const handleNameSubmit = () => {
        setNameInputModalVisible(false);
        setScanModalVisible(true);
    };

    const handleCameraSuccess = (data) => {
        setCurrentFoodData(data);
        setScanModalVisible(false);
        setAmountModalVisible(true);
    };

    const handleAmountConfirm = (amount, unit) => {
        console.log('Food Log Entry:', {
            ...currentFoodData,
            amount: amount,
            unit: unit,
        });

        // Show success toast instead of Alert
        showToast(
            `${currentFoodData.foodName} (${amount}${unit}) added to your log!`,
            'success',
            3000
        );

        resetAllFlows();
    };

    const resetAllFlows = () => {
        setFoodName('');
        setFoodDescription('');
        setScanModalVisible(false);
        setNameInputModalVisible(false);
        setAmountModalVisible(false);
        setCurrentFoodData(null);
    };

    const resetCameraFlow = () => {
        setFoodName('');
        setFoodDescription('');
        setScanModalVisible(false);
        setNameInputModalVisible(false);
    };

    const handleQuickAdd = (item) => {
        // Example of using different toast types
        switch(item) {
            case 'water':
                showToast('💧 Water logged!', 'info', 2000);
                break;
            case 'coffee':
                showToast('☕ Coffee logged!', 'success', 2000);
                break;
            case 'exercise':
                showToast('💪 Exercise logged!', 'warning', 2000);
                break;
        }
    };

    const renderMealTime = ({ item }) => (
        <TouchableOpacity
            style={[
                styles.mealCard,
                selectedMeal === item.id && styles.mealCardSelected,
            ]}
            onPress={() => {
                setSelectedMeal(item.id);
                showToast(`${item.name} selected`, 'info', 1500);
            }}
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
        <TouchableOpacity
            style={styles.recentFoodCard}
            activeOpacity={0.7}
            onPress={() => showToast(`${item.name} selected`, 'success', 2000)}
        >
            <View style={[styles.foodIconContainer, { backgroundColor: item.color }]}>
                <Text style={styles.foodEmoji}>{item.icon}</Text>
            </View>
            <View style={styles.foodInfo}>
                <Text style={styles.foodName}>{item.name}</Text>
                <Text style={styles.foodDetails}>{item.details}</Text>
            </View>
            <View style={styles.caloriesContainer}>
                <Text style={styles.caloriesText}>{item.calories} cal</Text>
                <TouchableOpacity
                    style={styles.addButton}
                    onPress={() => showToast(`${item.name} added to log!`, 'success', 2000)}
                >
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
                        onPress={handleBarcode}
                        activeOpacity={0.7}
                    >
                        <View style={[styles.actionIconContainer, { backgroundColor: '#E3F2FD' }]}>
                            <Ionicons name="barcode-outline" size={28} color="#2196F3" />
                        </View>
                        <Text style={styles.actionTitle}>Barcode</Text>
                        <Text style={styles.actionSubtitle}>Scan package</Text>
                    </TouchableOpacity>
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
                <View style={[styles.section, { marginBottom: 40 }]}>
                    <Text style={styles.sectionTitle}>Quick Add</Text>
                    <View style={styles.quickAddContainer}>
                        <TouchableOpacity
                            style={styles.quickAddButton}
                            activeOpacity={0.7}
                            onPress={() => handleQuickAdd('water')}
                        >
                            <Ionicons name="water" size={24} color="#2196F3" />
                            <Text style={styles.quickAddText}>Water</Text>
                        </TouchableOpacity>
                        <TouchableOpacity
                            style={styles.quickAddButton}
                            activeOpacity={0.7}
                            onPress={() => handleQuickAdd('coffee')}
                        >
                            <Ionicons name="cafe" size={24} color="#795548" />
                            <Text style={styles.quickAddText}>Coffee</Text>
                        </TouchableOpacity>
                        <TouchableOpacity
                            style={styles.quickAddButton}
                            activeOpacity={0.7}
                            onPress={() => handleQuickAdd('exercise')}
                        >
                            <Ionicons name="barbell" size={24} color="#FF9800" />
                            <Text style={styles.quickAddText}>Exercise</Text>
                        </TouchableOpacity>
                    </View>
                </View>
            </ScrollView>

            {/* Modals */}
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

            <CameraScanModal
                visible={scanModalVisible}
                foodName={foodName}
                foodDescription={foodDescription}
                selectedMeal={selectedMeal}
                onClose={resetCameraFlow}
                onSuccess={handleCameraSuccess}
            />

            <BarcodeScanModal
                visible={barcodeModalVisible}
                onClose={() => setBarcodeModalVisible(false)}
                onBarcodeScanned={handleBarcodeScanned}
            />

            <AmountInputModal
                visible={amountModalVisible}
                foodName={currentFoodData?.foodName || ''}
                imageUri={currentFoodData?.imageUri || null}
                minAmount={50}
                maxAmount={500}
                onConfirm={handleAmountConfirm}
                onClose={() => {
                    setAmountModalVisible(false);
                    resetAllFlows();
                }}
            />

            {/* Toast Component */}
            <Toast
                visible={toast.visible}
                message={toast.message}
                type={toast.type}
                duration={toast.duration}
                onHide={hideToast}
            />
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#FAFAFA',
    },
    scrollView: {
        flex: 1,
    },
    header: {
        paddingHorizontal: 24,
        paddingTop: 64,
        paddingBottom: 28,
        backgroundColor: '#FFFFFF',
        borderBottomLeftRadius: 24,
        borderBottomRightRadius: 24,
        shadowColor: '#000',
        shadowOffset: {
            width: 0,
            height: 2,
        },
        shadowOpacity: 0.05,
        shadowRadius: 8,
        elevation: 3,
    },
    headerTitle: {
        fontSize: 34,
        fontWeight: '800',
        color: '#212121',
        marginBottom: 6,
        letterSpacing: -0.5,
    },
    headerSubtitle: {
        fontSize: 16,
        color: '#757575',
        fontWeight: '500',
        letterSpacing: 0.1,
    },
    actionButtons: {
        flexDirection: 'row',
        paddingHorizontal: 24,
        marginTop: 24,
        gap: 16,
    },
    actionCard: {
        flex: 1,
        backgroundColor: '#FFFFFF',
        borderRadius: 24,
        padding: 24,
        alignItems: 'center',
        shadowColor: '#000',
        shadowOffset: {
            width: 0,
            height: 8,
        },
        shadowOpacity: 0.1,
        shadowRadius: 16,
        elevation: 5,
    },
    actionIconContainer: {
        width: 72,
        height: 72,
        borderRadius: 36,
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 16,
    },
    actionTitle: {
        fontSize: 17,
        fontWeight: '700',
        color: '#212121',
        marginBottom: 6,
        letterSpacing: -0.2,
    },
    actionSubtitle: {
        fontSize: 13,
        color: '#757575',
        textAlign: 'center',
        lineHeight: 18,
        fontWeight: '500',
    },
    section: {
        marginTop: 36,
        paddingHorizontal: 24,
    },
    sectionTitle: {
        fontSize: 22,
        fontWeight: '800',
        color: '#212121',
        marginBottom: 18,
        letterSpacing: -0.3,
    },
    mealList: {
        gap: 14,
    },
    mealCard: {
        backgroundColor: '#FFFFFF',
        borderRadius: 20,
        padding: 18,
        alignItems: 'center',
        minWidth: 110,
        borderWidth: 2,
        borderColor: '#F5F5F5',
        shadowColor: '#000',
        shadowOffset: {
            width: 0,
            height: 4,
        },
        shadowOpacity: 0.08,
        shadowRadius: 12,
        elevation: 3,
    },
    mealCardSelected: {
        borderColor: '#4CAF50',
        backgroundColor: '#F1F8F4',
        transform: [{ scale: 1.02 }],
    },
    mealIconContainer: {
        width: 56,
        height: 56,
        borderRadius: 28,
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 12,
    },
    mealEmoji: {
        fontSize: 28,
    },
    mealName: {
        fontSize: 15,
        fontWeight: '700',
        color: '#212121',
        marginBottom: 4,
        letterSpacing: -0.1,
    },
    mealTime: {
        fontSize: 12,
        color: '#9E9E9E',
        fontWeight: '600',
    },
    recentHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 10,
        marginBottom: 18,
    },
    recentFoodCard: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#FFFFFF',
        borderRadius: 20,
        padding: 18,
        marginBottom: 14,
        shadowColor: '#000',
        shadowOffset: {
            width: 0,
            height: 4,
        },
        shadowOpacity: 0.08,
        shadowRadius: 12,
        elevation: 3,
    },
    foodIconContainer: {
        width: 56,
        height: 56,
        borderRadius: 16,
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 16,
    },
    foodEmoji: {
        fontSize: 28,
    },
    foodInfo: {
        flex: 1,
    },
    foodName: {
        fontSize: 16,
        fontWeight: '700',
        color: '#212121',
        marginBottom: 5,
        letterSpacing: -0.2,
    },
    foodDetails: {
        fontSize: 13,
        color: '#9E9E9E',
        fontWeight: '500',
    },
    caloriesContainer: {
        alignItems: 'flex-end',
    },
    caloriesText: {
        fontSize: 16,
        fontWeight: '800',
        color: '#4CAF50',
        marginBottom: 10,
        letterSpacing: -0.2,
    },
    addButton: {
        width: 36,
        height: 36,
        borderRadius: 18,
        backgroundColor: '#E8F5E9',
        justifyContent: 'center',
        alignItems: 'center',
        shadowColor: '#4CAF50',
        shadowOffset: {
            width: 0,
            height: 2,
        },
        shadowOpacity: 0.15,
        shadowRadius: 4,
        elevation: 2,
    },
    quickAddContainer: {
        flexDirection: 'row',
        gap: 14,
    },
    quickAddButton: {
        flex: 1,
        backgroundColor: '#FFFFFF',
        borderRadius: 20,
        padding: 24,
        alignItems: 'center',
        shadowColor: '#000',
        shadowOffset: {
            width: 0,
            height: 4,
        },
        shadowOpacity: 0.08,
        shadowRadius: 12,
        elevation: 3,
    },
    quickAddText: {
        fontSize: 14,
        fontWeight: '700',
        color: '#212121',
        marginTop: 10,
        letterSpacing: -0.1,
    },
});

export default Log;