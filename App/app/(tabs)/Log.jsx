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

const Log = () => {
    const [selectedMeal, setSelectedMeal] = useState(null);
    const [scanModalVisible, setScanModalVisible] = useState(false);
    const [barcodeModalVisible, setBarcodeModalVisible] = useState(false);
    const [nameInputModalVisible, setNameInputModalVisible] = useState(false);
    const [amountModalVisible, setAmountModalVisible] = useState(false);
    const [foodName, setFoodName] = useState('');
    const [foodDescription, setFoodDescription] = useState('');
    const [currentFoodData, setCurrentFoodData] = useState(null);

    const { toast, showToast, hideToast } = useToast();

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

    const handleAmountConfirm = (amount, unit) => {
        console.log('Food Log Entry:', {
            ...currentFoodData,
            amount: amount,
            unit: unit,
        });

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