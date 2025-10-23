import {View, Text, StyleSheet, TouchableOpacity, Modal, TextInput, Alert} from 'react-native'
import React, {useState} from 'react'
import {useUser} from "../../utils/AuthContext";
import ServerConfig from "../../utils/Config";

const DrinkCard = ({id, amount, timestamp, onDelete}) => {
    const {user} = useUser()
    const username = user.uid;
    const BaseURL = ServerConfig.BaseURL;

    const [menuVisible, setMenuVisible] = useState(false)
    const [editModalVisible, setEditModalVisible] = useState(false)
    const [editAmount, setEditAmount] = useState(amount.toString())
    const [loading, setLoading] = useState(false)

    // Format timestamp to readable format
    const formatTime = (timestamp) => {
        const date = new Date(timestamp)
        return date.toLocaleTimeString('en-US', {
            hour: '2-digit',
            minute: '2-digit',
            hour12: true
        })
    }

    const handleDelete = async () => {
        Alert.alert(
            'Delete Entry',
            'Are you sure you want to delete this water intake entry?',
            [
                {text: 'Cancel', style: 'cancel'},
                {
                    text: 'Delete',
                    style: 'destructive',
                    onPress: async () => {
                        try {
                            setLoading(true)
                            const response = await fetch(
                                `${BaseURL}/water/intake/${username}/${id}`,
                                {method: 'DELETE'}
                            )

                            if (!response.ok) {
                                throw new Error('Failed to delete water intake')
                            }

                            setMenuVisible(false)
                            onDelete?.() // Refresh the list
                        } catch (error) {
                            Alert.alert('Error', 'Failed to delete entry: ' + error.message)
                        } finally {
                            setLoading(false)
                        }
                    }
                }
            ]
        )
    }

    const handleEdit = () => {
        setEditAmount(amount.toString())
        setMenuVisible(false)
        setEditModalVisible(true)
    }

    const handleUpdate = async () => {
        try {
            setLoading(true)
            const response = await fetch(
                `${BaseURL}/water/intake/${username}/${id}`,
                {
                    method: 'PUT',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({
                        amount: parseInt(editAmount),
                        timestamp: timestamp
                    })
                }
            )

            if (!response.ok) {
                throw new Error('Failed to update water intake')
            }

            setEditModalVisible(false)
            onDelete?.() // Refresh the list
        } catch (error) {
            Alert.alert('Error', 'Failed to update entry: ' + error.message)
        } finally {
            setLoading(false)
        }
    }

    return (
        <View style={styles.card}>
            <View style={styles.content}>
                <View style={styles.infoContainer}>
                    <Text style={styles.amountText}>{amount}ml</Text>
                    <Text style={styles.timeText}>{formatTime(timestamp)}</Text>
                </View>

                <TouchableOpacity
                    style={styles.menuButton}
                    onPress={() => setMenuVisible(true)}
                >
                    <Text style={styles.menuDots}>⋮</Text>
                </TouchableOpacity>
            </View>

            {/* Menu Modal */}
            <Modal
                visible={menuVisible}
                transparent={true}
                animationType="fade"
                onRequestClose={() => setMenuVisible(false)}
            >
                <TouchableOpacity
                    style={styles.modalOverlay}
                    activeOpacity={1}
                    onPress={() => setMenuVisible(false)}
                >
                    <View style={styles.menuContainer}>
                        <TouchableOpacity
                            style={styles.menuItem}
                            onPress={handleEdit}
                            disabled={loading}
                        >
                            <Text style={styles.menuItemText}>Edit</Text>
                        </TouchableOpacity>

                        <View style={styles.menuDivider} />

                        <TouchableOpacity
                            style={styles.menuItem}
                            onPress={handleDelete}
                            disabled={loading}
                        >
                            <Text style={[styles.menuItemText, styles.deleteText]}>Delete</Text>
                        </TouchableOpacity>
                    </View>
                </TouchableOpacity>
            </Modal>

            {/* Edit Modal */}
            <Modal
                visible={editModalVisible}
                transparent={true}
                animationType="slide"
                onRequestClose={() => setEditModalVisible(false)}
            >
                <View style={styles.editModalOverlay}>
                    <View style={styles.editModalContainer}>
                        <Text style={styles.editModalTitle}>Edit Water Intake</Text>

                        <Text style={styles.label}>Amount (ml)</Text>
                        <TextInput
                            style={styles.input}
                            value={editAmount}
                            onChangeText={setEditAmount}
                            keyboardType="numeric"
                            placeholder="Enter amount"
                        />

                        <View style={styles.editModalButtons}>
                            <TouchableOpacity
                                style={[styles.button, styles.cancelButton]}
                                onPress={() => setEditModalVisible(false)}
                                disabled={loading}
                            >
                                <Text style={styles.cancelButtonText}>Cancel</Text>
                            </TouchableOpacity>

                            <TouchableOpacity
                                style={[styles.button, styles.saveButton]}
                                onPress={handleUpdate}
                                disabled={loading || !editAmount}
                            >
                                <Text style={styles.saveButtonText}>
                                    {loading ? 'Saving...' : 'Save'}
                                </Text>
                            </TouchableOpacity>
                        </View>
                    </View>
                </View>
            </Modal>
        </View>
    )
}

const styles = StyleSheet.create({
    card: {
        backgroundColor: '#fff',
        borderRadius: 12,
        padding: 16,
        marginBottom: 12,
        shadowColor: '#000',
        shadowOffset: {width: 0, height: 2},
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 3,
    },
    content: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    infoContainer: {
        flex: 1,
    },
    amountText: {
        fontSize: 24,
        fontWeight: 'bold',
        color: '#2196F3',
        marginBottom: 4,
    },
    timeText: {
        fontSize: 14,
        color: '#666',
    },
    menuButton: {
        padding: 8,
    },
    menuDots: {
        fontSize: 24,
        color: '#666',
        fontWeight: 'bold',
    },
    modalOverlay: {
        flex: 1,
        backgroundColor: 'rgba(0,0,0,0.5)',
        justifyContent: 'center',
        alignItems: 'center',
    },
    menuContainer: {
        backgroundColor: '#fff',
        borderRadius: 8,
        minWidth: 150,
        shadowColor: '#000',
        shadowOffset: {width: 0, height: 2},
        shadowOpacity: 0.25,
        shadowRadius: 4,
        elevation: 5,
    },
    menuItem: {
        padding: 16,
    },
    menuItemText: {
        fontSize: 16,
        color: '#333',
    },
    deleteText: {
        color: '#f44336',
    },
    menuDivider: {
        height: 1,
        backgroundColor: '#e0e0e0',
    },
    editModalOverlay: {
        flex: 1,
        backgroundColor: 'rgba(0,0,0,0.5)',
        justifyContent: 'center',
        alignItems: 'center',
        padding: 20,
    },
    editModalContainer: {
        backgroundColor: '#fff',
        borderRadius: 12,
        padding: 24,
        width: '100%',
        maxWidth: 400,
    },
    editModalTitle: {
        fontSize: 20,
        fontWeight: 'bold',
        marginBottom: 20,
        textAlign: 'center',
    },
    label: {
        fontSize: 14,
        color: '#666',
        marginBottom: 8,
    },
    input: {
        borderWidth: 1,
        borderColor: '#ddd',
        borderRadius: 8,
        padding: 12,
        fontSize: 16,
        marginBottom: 20,
    },
    editModalButtons: {
        flexDirection: 'row',
        gap: 12,
    },
    button: {
        flex: 1,
        padding: 14,
        borderRadius: 8,
        alignItems: 'center',
    },
    cancelButton: {
        backgroundColor: '#f5f5f5',
    },
    cancelButtonText: {
        color: '#666',
        fontSize: 16,
        fontWeight: '600',
    },
    saveButton: {
        backgroundColor: '#2196F3',
    },
    saveButtonText: {
        color: '#fff',
        fontSize: 16,
        fontWeight: '600',
    },
})

export default DrinkCard