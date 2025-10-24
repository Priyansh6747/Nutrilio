import { View, Text, TouchableOpacity, Modal, StyleSheet, Animated } from 'react-native'
import React, { useState, useRef } from 'react'
import { useUser } from "../../utils/AuthContext"
import { LinearGradient } from 'expo-linear-gradient'
import Slider from '@react-native-community/slider'
import { Ionicons } from '@expo/vector-icons'
import ServerConfig from "../../utils/Config"

const baseUrl = ServerConfig.BaseURL

const AddDrink = ({selectedDate, onDateChange, onDrinkAdded}) => {
    const { user } = useUser()
    const username = user.uid

    const [showCustomSlider, setShowCustomSlider] = useState(false)
    const [showSettings, setShowSettings] = useState(false)
    const [customAmount, setCustomAmount] = useState(250)
    const [glassSize, setGlassSize] = useState(250)
    const [loading, setLoading] = useState(false)

    const fadeAnim = useRef(new Animated.Value(0)).current

    const addQuickGlass = async () => {
        try {
            setLoading(true)
            const URL = `${baseUrl}/api/v1/water/water/quick-glass/${username}`
            console.log(URL)
            const response = await fetch(URL, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ date: selectedDate })
            })

            if (response.ok) {
                showSuccessFeedback()
                // Trigger re-render of charts by updating the date
                if (onDateChange) {
                    onDateChange(selectedDate)
                }
                // Trigger refresh of all components
                if (onDrinkAdded) {
                    onDrinkAdded()
                }
            }
        } catch (error) {
            console.error('Error adding quick glass:', error)
        } finally {
            setLoading(false)
        }
    }

    const addCustomAmount = async () => {
        try {
            setLoading(true)
            const response = await fetch(`${baseUrl}/api/v1/water/water/intake/${username}`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    amount: customAmount,
                    date: selectedDate
                })
            })

            if (response.ok) {
                setShowCustomSlider(false)
                showSuccessFeedback()
                // Trigger re-render of charts by updating the date
                if (onDateChange) {
                    onDateChange(selectedDate)
                }
                // Trigger refresh of all components
                if (onDrinkAdded) {
                    onDrinkAdded()
                }
            }
        } catch (error) {
            console.error('Error adding custom amount:', error)
        } finally {
            setLoading(false)
        }
    }

    const updateGlassSize = async () => {
        try {
            setLoading(true)
            const URL = `${baseUrl}/api/v1/user/${username}/glass-size?glass_size=${glassSize}`;
            console.log(URL)
            const response = await fetch(URL, {
                method: 'PATCH',
                headers: {
                    'Content-Type': 'application/json',
                }
            })

            if (response.ok) {
                setShowSettings(false)
                showSuccessFeedback()
            }
        } catch (error) {
            console.error('Error updating glass size:', error)
        } finally {
            setLoading(false)
        }
    }

    const showSuccessFeedback = () => {
        Animated.sequence([
            Animated.timing(fadeAnim, {
                toValue: 1,
                duration: 300,
                useNativeDriver: true,
            }),
            Animated.delay(1000),
            Animated.timing(fadeAnim, {
                toValue: 0,
                duration: 300,
                useNativeDriver: true,
            })
        ]).start()
    }

    return (
        <View style={styles.container}>
            <LinearGradient
                colors={['#e8f5f1', '#e3f2fd', '#ffffff']}
                style={styles.gradient}
            >
                {/* Success Feedback */}
                <Animated.View style={[styles.successBadge, { opacity: fadeAnim }]}>
                    <Ionicons name="checkmark-circle" size={24} color="#4CAF50" />
                    <Text style={styles.successText}>Success!</Text>
                </Animated.View>

                {/* Main Buttons */}
                <View style={styles.buttonsRow}>
                    <View style={styles.quickGlassContainer}>
                        <TouchableOpacity
                            style={[styles.button, styles.quickGlassButton]}
                            onPress={addQuickGlass}
                            disabled={loading}
                        >
                            <Ionicons name="water" size={28} color="#2196F3" />
                            <Text style={styles.buttonText}>Quick Glass</Text>
                            <Text style={styles.buttonSubtext}>{glassSize}ml</Text>
                        </TouchableOpacity>

                        {/* Settings Icon on Quick Glass */}
                        <TouchableOpacity
                            style={styles.settingsButton}
                            onPress={() => setShowSettings(true)}
                        >
                            <Ionicons name="settings-outline" size={18} color="#666" />
                        </TouchableOpacity>
                    </View>

                    <TouchableOpacity
                        style={[styles.button, styles.customButton]}
                        onPress={() => setShowCustomSlider(true)}
                        disabled={loading}
                    >
                        <Ionicons name="add-circle" size={28} color="#00BCD4" />
                        <Text style={styles.buttonText}>Custom Amount</Text>
                        <Text style={styles.buttonSubtext}>Choose volume</Text>
                    </TouchableOpacity>
                </View>

                {/* Custom Slider Modal */}
                <Modal
                    visible={showCustomSlider}
                    transparent
                    animationType="slide"
                    onRequestClose={() => setShowCustomSlider(false)}
                >
                    <View style={styles.modalOverlay}>
                        <View style={styles.modalContent}>
                            <Text style={styles.modalTitle}>Custom Amount</Text>
                            <Text style={styles.amountDisplay}>{customAmount} ml</Text>

                            <Slider
                                style={styles.slider}
                                minimumValue={50}
                                maximumValue={1000}
                                step={50}
                                value={customAmount}
                                onValueChange={setCustomAmount}
                                minimumTrackTintColor="#2196F3"
                                maximumTrackTintColor="#ddd"
                                thumbTintColor="#2196F3"
                            />

                            <View style={styles.modalButtons}>
                                <TouchableOpacity
                                    style={[styles.modalButton, styles.cancelButton]}
                                    onPress={() => setShowCustomSlider(false)}
                                >
                                    <Text style={styles.cancelButtonText}>Cancel</Text>
                                </TouchableOpacity>

                                <TouchableOpacity
                                    style={[styles.modalButton, styles.confirmButton]}
                                    onPress={addCustomAmount}
                                    disabled={loading}
                                >
                                    <Text style={styles.confirmButtonText}>Add</Text>
                                </TouchableOpacity>
                            </View>
                        </View>
                    </View>
                </Modal>

                {/* Settings Modal */}
                <Modal
                    visible={showSettings}
                    transparent
                    animationType="slide"
                    onRequestClose={() => setShowSettings(false)}
                >
                    <View style={styles.modalOverlay}>
                        <View style={styles.modalContent}>
                            <Text style={styles.modalTitle}>Quick Glass Size</Text>
                            <Text style={styles.amountDisplay}>{glassSize} ml</Text>

                            <Slider
                                style={styles.slider}
                                minimumValue={100}
                                maximumValue={500}
                                step={50}
                                value={glassSize}
                                onValueChange={setGlassSize}
                                minimumTrackTintColor="#4CAF50"
                                maximumTrackTintColor="#ddd"
                                thumbTintColor="#4CAF50"
                            />

                            <View style={styles.modalButtons}>
                                <TouchableOpacity
                                    style={[styles.modalButton, styles.cancelButton]}
                                    onPress={() => setShowSettings(false)}
                                >
                                    <Text style={styles.cancelButtonText}>Cancel</Text>
                                </TouchableOpacity>

                                <TouchableOpacity
                                    style={[styles.modalButton, styles.confirmButton]}
                                    onPress={updateGlassSize}
                                    disabled={loading}
                                >
                                    <Text style={styles.confirmButtonText}>Save</Text>
                                </TouchableOpacity>
                            </View>
                        </View>
                    </View>
                </Modal>
            </LinearGradient>
        </View>
    )
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    gradient: {
        flex: 1,
        padding: 20,
        justifyContent: 'center',
    },
    successBadge: {
        position: 'absolute',
        top: 60,
        alignSelf: 'center',
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#fff',
        paddingHorizontal: 20,
        paddingVertical: 10,
        borderRadius: 25,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.2,
        shadowRadius: 4,
        elevation: 5,
        zIndex: 1000,
    },
    successText: {
        marginLeft: 8,
        fontSize: 16,
        fontWeight: '600',
        color: '#4CAF50',
    },
    buttonsRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        gap: 15,
    },
    quickGlassContainer: {
        flex: 1,
        position: 'relative',
    },
    button: {
        backgroundColor: '#fff',
        borderRadius: 20,
        padding: 18,
        alignItems: 'center',
        justifyContent: 'center',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.1,
        shadowRadius: 8,
        elevation: 5,
        minHeight: 110,
    },
    quickGlassButton: {
        borderWidth: 2,
        borderColor: '#E3F2FD',
    },
    customButton: {
        flex: 1,
        borderWidth: 2,
        borderColor: '#E0F7FA',
    },
    buttonText: {
        fontSize: 15,
        fontWeight: '600',
        color: '#333',
        marginTop: 8,
        textAlign: 'center',
    },
    buttonSubtext: {
        fontSize: 11,
        color: '#999',
        marginTop: 3,
    },
    settingsButton: {
        position: 'absolute',
        top: 8,
        right: 8,
        backgroundColor: '#f5f5f5',
        borderRadius: 20,
        width: 36,
        height: 36,
        alignItems: 'center',
        justifyContent: 'center',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.1,
        shadowRadius: 2,
        elevation: 2,
    },
    modalOverlay: {
        flex: 1,
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
        justifyContent: 'center',
        alignItems: 'center',
    },
    modalContent: {
        backgroundColor: '#fff',
        borderRadius: 20,
        padding: 30,
        width: '85%',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 8,
        elevation: 10,
    },
    modalTitle: {
        fontSize: 20,
        fontWeight: '700',
        color: '#333',
        textAlign: 'center',
        marginBottom: 20,
    },
    amountDisplay: {
        fontSize: 48,
        fontWeight: '700',
        color: '#2196F3',
        textAlign: 'center',
        marginBottom: 20,
    },
    slider: {
        width: '100%',
        height: 40,
        marginBottom: 30,
    },
    modalButtons: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        gap: 10,
    },
    modalButton: {
        flex: 1,
        paddingVertical: 15,
        borderRadius: 12,
        alignItems: 'center',
    },
    cancelButton: {
        backgroundColor: '#f5f5f5',
    },
    confirmButton: {
        backgroundColor: '#2196F3',
    },
    cancelButtonText: {
        fontSize: 16,
        fontWeight: '600',
        color: '#666',
    },
    confirmButtonText: {
        fontSize: 16,
        fontWeight: '600',
        color: '#fff',
    },
})

export default AddDrink