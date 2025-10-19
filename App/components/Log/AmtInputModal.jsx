import React, { useState } from 'react';
import {
    View,
    Text,
    StyleSheet,
    TouchableOpacity,
    Modal,
    Image, ScrollView,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import Slider from '@react-native-community/slider';

const AmountInputModal = ({
                              visible,
                              foodName,
                              imageUri,
                              minAmount = 50,
                              maxAmount = 500,
                              onConfirm,
                              onClose,
                          }) => {
    const [amount, setAmount] = useState((minAmount + maxAmount) / 2);
    const [unit, setUnit] = useState('g'); // 'g' for grams or 'ml' for milliliters

    const handleConfirm = () => {
        onConfirm(amount, unit);
    };

    const toggleUnit = () => {
        setUnit(unit === 'g' ? 'ml' : 'g');
    };

    const getAmountLabel = () => {
        if (amount < 100) return 'Small portion';
        if (amount < 200) return 'Regular portion';
        if (amount < 350) return 'Large portion';
        return 'Extra large portion';
    };

    return (
        <Modal
            visible={visible}
            animationType="slide"
            presentationStyle="pageSheet"
            onRequestClose={onClose}
        >
            <ScrollView style={styles.modalContainer}>
                {/* Header */}
                <View style={styles.header}>
                    <TouchableOpacity
                        style={styles.closeButton}
                        onPress={onClose}
                    >
                        <Ionicons name="close" size={28} color="#212121" />
                    </TouchableOpacity>
                    <Text style={styles.headerTitle}>Set Amount</Text>
                    <View style={styles.placeholder} />
                </View>

                {/* Food Image & Name */}
                <View style={styles.foodSection}>
                    <View style={styles.imageContainer}>
                        {imageUri ? (
                            <Image source={{ uri: imageUri }} style={styles.foodImage} />
                        ) : (
                            <View style={styles.imagePlaceholder}>
                                <Ionicons name="fast-food-outline" size={60} color="#9E9E9E" />
                            </View>
                        )}
                    </View>
                    <Text style={styles.foodName}>{foodName}</Text>
                    <View style={styles.portionBadge}>
                        <Text style={styles.portionText}>{getAmountLabel()}</Text>
                    </View>
                </View>

                {/* Amount Display */}
                <View style={styles.amountDisplayContainer}>
                    <View style={styles.amountDisplay}>
                        <Text style={styles.amountValue}>{Math.round(amount)}</Text>
                        <TouchableOpacity
                            style={styles.unitButton}
                            onPress={toggleUnit}
                            activeOpacity={0.7}
                        >
                            <Text style={styles.unitText}>{unit}</Text>
                            <Ionicons name="swap-horizontal" size={16} color="#4CAF50" />
                        </TouchableOpacity>
                    </View>
                    <Text style={styles.amountLabel}>Estimated amount</Text>
                </View>

                {/* Slider Section */}
                <View style={styles.sliderSection}>
                    <View style={styles.sliderContainer}>
                        <Slider
                            style={styles.slider}
                            minimumValue={minAmount}
                            maximumValue={maxAmount}
                            value={amount}
                            onValueChange={setAmount}
                            minimumTrackTintColor="#4CAF50"
                            maximumTrackTintColor="#E0E0E0"
                            thumbTintColor="#4CAF50"
                        />
                        <View style={styles.sliderLabels}>
                            <Text style={styles.sliderLabel}>{minAmount}{unit}</Text>
                            <Text style={styles.sliderLabel}>{maxAmount}{unit}</Text>
                        </View>
                    </View>

                    {/* Quick Amount Buttons */}
                    <View style={styles.quickAmounts}>
                        <Text style={styles.quickAmountsTitle}>Quick select:</Text>
                        <View style={styles.quickButtonsRow}>
                            {[
                                { label: '1/4', value: minAmount + (maxAmount - minAmount) * 0.25 },
                                { label: '1/2', value: minAmount + (maxAmount - minAmount) * 0.5 },
                                { label: '3/4', value: minAmount + (maxAmount - minAmount) * 0.75 },
                                { label: 'Full', value: maxAmount },
                            ].map((item) => (
                                <TouchableOpacity
                                    key={item.label}
                                    style={[
                                        styles.quickButton,
                                        Math.abs(amount - item.value) < 10 && styles.quickButtonActive,
                                    ]}
                                    onPress={() => setAmount(item.value)}
                                    activeOpacity={0.7}
                                >
                                    <Text
                                        style={[
                                            styles.quickButtonText,
                                            Math.abs(amount - item.value) < 10 && styles.quickButtonTextActive,
                                        ]}
                                    >
                                        {item.label}
                                    </Text>
                                </TouchableOpacity>
                            ))}
                        </View>
                    </View>
                </View>

                {/* Info Card */}
                <View style={styles.infoCard}>
                    <Ionicons name="information-circle-outline" size={20} color="#2196F3" />
                    <Text style={styles.infoText}>
                        Adjust the slider to match your portion size. You can toggle between grams and milliliters.
                    </Text>
                </View>

                {/* Action Buttons */}
                <View style={styles.actionButtons}>
                    <TouchableOpacity
                        style={styles.cancelButton}
                        onPress={onClose}
                        activeOpacity={0.7}
                    >
                        <Text style={styles.cancelButtonText}>Cancel</Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                        style={styles.confirmButton}
                        onPress={handleConfirm}
                        activeOpacity={0.7}
                    >
                        <Ionicons name="checkmark" size={20} color="#fff" />
                        <Text style={styles.confirmButtonText}>Confirm Amount</Text>
                    </TouchableOpacity>
                </View>
            </ScrollView>
        </Modal>
    );
};

const styles = StyleSheet.create({
    modalContainer: {
        flex: 1,
        backgroundColor: '#FAFAFA',
        paddingBottom: 0,
    },
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingHorizontal: 20,
        paddingTop: 60,
        paddingBottom: 20,
        backgroundColor: '#FFFFFF',
        borderBottomWidth: 1,
        borderBottomColor: '#F0F0F0',
    },
    closeButton: {
        width: 40,
        height: 40,
        borderRadius: 20,
        backgroundColor: '#F5F5F5',
        justifyContent: 'center',
        alignItems: 'center',
    },
    headerTitle: {
        fontSize: 20,
        fontWeight: '800',
        color: '#212121',
        letterSpacing: -0.3,
    },
    placeholder: {
        width: 40,
    },
    foodSection: {
        alignItems: 'center',
        paddingVertical: 32,
        backgroundColor: '#FFFFFF',
        marginBottom: 24,
    },
    imageContainer: {
        marginBottom: 20,
    },
    foodImage: {
        width: 140,
        height: 140,
        borderRadius: 20,
        borderWidth: 3,
        borderColor: '#E8F5E9',
    },
    imagePlaceholder: {
        width: 140,
        height: 140,
        borderRadius: 20,
        backgroundColor: '#F5F5F5',
        justifyContent: 'center',
        alignItems: 'center',
        borderWidth: 2,
        borderColor: '#E0E0E0',
        borderStyle: 'dashed',
    },
    foodName: {
        fontSize: 24,
        fontWeight: '800',
        color: '#212121',
        marginBottom: 12,
        letterSpacing: -0.5,
        textAlign: 'center',
    },
    portionBadge: {
        backgroundColor: '#E8F5E9',
        paddingHorizontal: 16,
        paddingVertical: 8,
        borderRadius: 20,
    },
    portionText: {
        fontSize: 14,
        fontWeight: '700',
        color: '#4CAF50',
        letterSpacing: 0.2,
    },
    amountDisplayContainer: {
        alignItems: 'center',
        marginBottom: 32,
        paddingHorizontal: 24,
    },
    amountDisplay: {
        flexDirection: 'row',
        alignItems: 'baseline',
        marginBottom: 8,
        gap: 12,
    },
    amountValue: {
        fontSize: 64,
        fontWeight: '800',
        color: '#4CAF50',
        letterSpacing: -2,
    },
    unitButton: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#E8F5E9',
        paddingHorizontal: 12,
        paddingVertical: 8,
        borderRadius: 16,
        gap: 4,
    },
    unitText: {
        fontSize: 20,
        fontWeight: '700',
        color: '#4CAF50',
    },
    amountLabel: {
        fontSize: 15,
        color: '#757575',
        fontWeight: '600',
    },
    sliderSection: {
        paddingHorizontal: 24,
        marginBottom: 24,
    },
    sliderContainer: {
        backgroundColor: '#FFFFFF',
        borderRadius: 20,
        padding: 24,
        marginBottom: 20,
        shadowColor: '#000',
        shadowOffset: {
            width: 0,
            height: 4,
        },
        shadowOpacity: 0.08,
        shadowRadius: 12,
        elevation: 3,
    },
    slider: {
        width: '100%',
        height: 40,
    },
    sliderLabels: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginTop: 8,
    },
    sliderLabel: {
        fontSize: 13,
        color: '#9E9E9E',
        fontWeight: '600',
    },
    quickAmounts: {
        backgroundColor: '#FFFFFF',
        borderRadius: 20,
        padding: 20,
        shadowColor: '#000',
        shadowOffset: {
            width: 0,
            height: 4,
        },
        shadowOpacity: 0.08,
        shadowRadius: 12,
        elevation: 3,
    },
    quickAmountsTitle: {
        fontSize: 15,
        fontWeight: '700',
        color: '#212121',
        marginBottom: 12,
        letterSpacing: -0.2,
    },
    quickButtonsRow: {
        flexDirection: 'row',
        gap: 10,
    },
    quickButton: {
        flex: 1,
        paddingVertical: 12,
        paddingHorizontal: 16,
        borderRadius: 14,
        backgroundColor: '#F5F5F5',
        alignItems: 'center',
        borderWidth: 2,
        borderColor: 'transparent',
    },
    quickButtonActive: {
        backgroundColor: '#E8F5E9',
        borderColor: '#4CAF50',
    },
    quickButtonText: {
        fontSize: 14,
        fontWeight: '700',
        color: '#757575',
    },
    quickButtonTextActive: {
        color: '#4CAF50',
    },
    infoCard: {
        flexDirection: 'row',
        backgroundColor: '#E3F2FD',
        marginHorizontal: 24,
        marginBottom: 24,
        padding: 16,
        borderRadius: 16,
        gap: 12,
    },
    infoText: {
        flex: 1,
        fontSize: 13,
        color: '#1976D2',
        lineHeight: 18,
        fontWeight: '500',
    },
    actionButtons: {
        flexDirection: 'row',
        paddingHorizontal: 24,
        paddingBottom: 40,
        gap: 12,
    },
    cancelButton: {
        flex: 1,
        paddingVertical: 16,
        borderRadius: 16,
        backgroundColor: '#F5F5F5',
        alignItems: 'center',
        justifyContent: 'center',
    },
    cancelButtonText: {
        fontSize: 16,
        fontWeight: '700',
        color: '#757575',
        letterSpacing: -0.2,
    },
    confirmButton: {
        flex: 2,
        flexDirection: 'row',
        paddingVertical: 16,
        borderRadius: 16,
        backgroundColor: '#4CAF50',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 8,
        shadowColor: '#4CAF50',
        shadowOffset: {
            width: 0,
            height: 4,
        },
        shadowOpacity: 0.3,
        shadowRadius: 8,
        elevation: 4,
    },
    confirmButtonText: {
        fontSize: 16,
        fontWeight: '700',
        color: '#FFFFFF',
        letterSpacing: -0.2,
    },
});

export default AmountInputModal;