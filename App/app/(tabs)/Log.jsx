import React, { useState } from 'react';
import {
    View,
    Text,
    StyleSheet,
    TouchableOpacity,
    ScrollView,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import NameInputModal from '../../Components/Log/NameInputModal';
import CameraScanModal from '../../Components/Log/CameraScanModal';
import BarcodeScanModal from '../../Components/Log/BarcodeScanner';
import AmountInputModal from '../../Components/Log/AmtInputModal';
import Toast from '../../Components/ToastB';
import useToast from '../../utils/useToast';
import {useUser} from "../../utils/AuthContext";
import ServerConfig from "../../utils/Config";
import DateNav from "../../Components/DateNav";
import Stats from "../../Components/Log/Stats";
import History from "../../Components/Log/History";


const Log = () => {
    const [selectedMeal, setSelectedMeal] = useState(null);
    const [scanModalVisible, setScanModalVisible] = useState(false);
    const [barcodeModalVisible, setBarcodeModalVisible] = useState(false);
    const [nameInputModalVisible, setNameInputModalVisible] = useState(false);
    const [amountModalVisible, setAmountModalVisible] = useState(false);
    const [foodName, setFoodName] = useState('');
    const [foodDescription, setFoodDescription] = useState('');
    const [currentFoodData, setCurrentFoodData] = useState(null);
    const [selectedDate, setSelectedDate] = useState(new Date());

    // Add refresh trigger state
    const [refreshTrigger, setRefreshTrigger] = useState(0);

    const { toast, showToast, hideToast } = useToast();
    const {user} = useUser()

    // Function to trigger refresh
    const triggerRefresh = () => {
        setRefreshTrigger(prev => prev + 1);
    };

    // Handle date change from DateNav
    const handleDateChange = (newDate) => {
        setSelectedDate(newDate);
        triggerRefresh(); // This will cause Stats and History to re-fetch data
    };

    const handleScanFood = () => {
        setNameInputModalVisible(true);
    };

    const handleBarcode = () => {
        setBarcodeModalVisible(true);
    };

    const handleBarcodeScanned = ({ type, data }) => {
        console.log('Barcode Result:', type, data);
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

    const startAnalysis = async (foodData, amount, unit) => {
        const URL = `${ServerConfig.BaseURL}/api/v1/log/analyse`;

        try {
            const requestBody = {
                username: user.uid,
                name: foodData.foodName,
                description: foodData.userProvidedDescription || '',
                amnt: amount,
            };

            const response = await fetch(URL, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(requestBody),
            });

            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            const result = await response.json();
            console.log('Analysis started:', result);

            return result;
        } catch (error) {
            console.error('Error starting analysis:', error);
            showToast('Failed to start analysis. Please try again.', 'error', 3000);
            throw error;
        }
    };

    const handleAmountConfirm = async (amount, unit) => {
        console.log('Food Log Entry:', {
            ...currentFoodData,
            amount: amount,
            unit: unit,
        });

        try {
            const analysisResult = await startAnalysis(currentFoodData, amount, unit);

            showToast(
                `${currentFoodData.foodName} (${amount}${unit}) added to your log!`,
                'success',
                3000
            );

            console.log('Analysis doc_id:', analysisResult.doc_id);

            // Trigger refresh after successful addition
            triggerRefresh();

        } catch (error) {
            console.error('Failed to confirm amount:', error);
        } finally {
            resetAllFlows();
        }
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


    const isToday = () => {
        const today = new Date();
        return selectedDate.toDateString() === today.toDateString();
    };

    return (
        <View style={styles.container}>
            <DateNav
                selectedDate={selectedDate}
                onDateChange={handleDateChange}
            />
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
                {isToday() &&
                    <View style={styles.actionButtons}>
                        <TouchableOpacity
                            style={styles.actionCard}
                            onPress={handleScanFood}
                            activeOpacity={0.7}
                        >
                            <View style={[styles.actionIconContainer, styles.snapIconBg]}>
                                <Ionicons name="camera" size={28} color="#0EA5E9" />
                            </View>
                            <Text style={styles.actionTitle}>Snap Food</Text>
                            <Text style={styles.actionSubtitle}>AI recognizes{'\n'}your meal</Text>
                        </TouchableOpacity>

                        <TouchableOpacity
                            style={styles.actionCard}
                            onPress={handleBarcode}
                            activeOpacity={0.7}
                        >
                            <View style={[styles.actionIconContainer, styles.barcodeIconBg]}>
                                <Ionicons name="barcode-outline" size={28} color="#10B981" />
                            </View>
                            <Text style={styles.actionTitle}>Barcode</Text>
                            <Text style={styles.actionSubtitle}>Scan package</Text>
                        </TouchableOpacity>
                    </View>}

                <Stats selectedDate={selectedDate} refresh={refreshTrigger}/>
                <History selectedDate={selectedDate} refresh={refreshTrigger}/>
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
        backgroundColor: '#F0F9FF',
        marginBottom: 90
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
        shadowColor: '#06B6D4',
        shadowOffset: {
            width: 0,
            height: 4,
        },
        shadowOpacity: 0.1,
        shadowRadius: 12,
        elevation: 4,
    },
    headerTitle: {
        fontSize: 34,
        fontWeight: '800',
        color: '#0C4A6E',
        marginBottom: 6,
        letterSpacing: -0.5,
    },
    headerSubtitle: {
        fontSize: 16,
        color: '#0891B2',
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
        shadowColor: '#06B6D4',
        shadowOffset: {
            width: 0,
            height: 8,
        },
        shadowOpacity: 0.12,
        shadowRadius: 16,
        elevation: 6,
        borderWidth: 1,
        borderColor: '#E0F2FE',
    },
    actionIconContainer: {
        width: 72,
        height: 72,
        borderRadius: 36,
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 16,
    },
    snapIconBg: {
        backgroundColor: '#E0F2FE',
    },
    barcodeIconBg: {
        backgroundColor: '#D1FAE5',
    },
    actionTitle: {
        fontSize: 17,
        fontWeight: '700',
        color: '#0C4A6E',
        marginBottom: 6,
        letterSpacing: -0.2,
    },
    actionSubtitle: {
        fontSize: 13,
        color: '#0891B2',
        textAlign: 'center',
        lineHeight: 18,
        fontWeight: '500',
    },
});

export default Log;