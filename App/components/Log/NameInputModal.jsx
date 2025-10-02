import React from 'react';
import {
    View,
    Text,
    StyleSheet,
    TextInput,
    TouchableOpacity,
    Modal,
    Alert,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';

const NameInputModal = ({
                            visible,
                            foodName,
                            foodDescription,
                            onFoodNameChange,
                            onFoodDescriptionChange,
                            onSubmit,
                            onClose,
                        }) => {
    const handleSubmit = () => {
        if (!foodName.trim()) {
            Alert.alert('Required', 'Please enter a food name');
            return;
        }
        onSubmit();
    };

    return (
        <Modal
            visible={visible}
            animationType="slide"
            transparent={true}
            onRequestClose={onClose}
        >
            <View style={styles.modalOverlay}>
                <View style={styles.modalContent}>
                    <View style={styles.modalHeader}>
                        <Text style={styles.modalTitle}>Name Your Food</Text>
                        <TouchableOpacity onPress={onClose}>
                            <Ionicons name="close" size={24} color="#666" />
                        </TouchableOpacity>
                    </View>

                    <Text style={styles.inputLabel}>Food Name *</Text>
                    <TextInput
                        style={styles.nameInput}
                        placeholder="e.g., Grilled Chicken"
                        placeholderTextColor="#999"
                        value={foodName}
                        onChangeText={onFoodNameChange}
                        autoFocus
                    />

                    <Text style={styles.inputLabel}>Description (Optional)</Text>
                    <TextInput
                        style={[styles.nameInput, styles.descriptionInput]}
                        placeholder="e.g., With vegetables and rice"
                        placeholderTextColor="#999"
                        value={foodDescription}
                        onChangeText={onFoodDescriptionChange}
                        multiline
                        numberOfLines={3}
                    />

                    <TouchableOpacity
                        style={styles.continueButton}
                        onPress={handleSubmit}
                        activeOpacity={0.8}
                    >
                        <Text style={styles.continueButtonText}>Continue to Camera</Text>
                        <Ionicons name="camera" size={20} color="#fff" />
                    </TouchableOpacity>
                </View>
            </View>
        </Modal>
    );
};

const styles = StyleSheet.create({
    modalOverlay: {
        flex: 1,
        backgroundColor: 'rgba(0,0,0,0.5)',
        justifyContent: 'center',
        alignItems: 'center',
    },
    modalContent: {
        backgroundColor: '#fff',
        borderRadius: 24,
        padding: 24,
        width: '85%',
        maxWidth: 400,
    },
    modalHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 24,
    },
    modalTitle: {
        fontSize: 24,
        fontWeight: '700',
        color: '#1A1A1A',
        letterSpacing: 0.3,
    },
    inputLabel: {
        fontSize: 14,
        fontWeight: '600',
        color: '#666',
        marginBottom: 8,
        marginTop: 12,
    },
    nameInput: {
        backgroundColor: '#F8F9FA',
        borderRadius: 12,
        padding: 16,
        fontSize: 16,
        color: '#1A1A1A',
        borderWidth: 2,
        borderColor: '#F0F0F0',
    },
    descriptionInput: {
        height: 80,
        textAlignVertical: 'top',
    },
    continueButton: {
        backgroundColor: '#4CAF50',
        borderRadius: 12,
        padding: 16,
        flexDirection: 'row',
        justifyContent: 'center',
        alignItems: 'center',
        gap: 8,
        marginTop: 24,
    },
    continueButtonText: {
        color: '#fff',
        fontSize: 16,
        fontWeight: '700',
        letterSpacing: 0.3,
    },
});

export default NameInputModal;