import React, { useState } from 'react';
import {
    Modal,
    View,
    Text,
    ScrollView,
    TextInput,
    TouchableOpacity,
    ActivityIndicator,
    Alert,
    StyleSheet,
    Image,
    Platform
} from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import Config from "../../utils/Config";

const EditProfileModal = ({
                              visible,
                              onClose,
                              profile,
                              user,
                              onProfileUpdate
                          }) => {
    const [updating, setUpdating] = useState(false);
    const [editForm, setEditForm] = useState({
        profilePic: profile?.profile?.img || '',
        displayName: profile?.profile?.display_name || '',
        bio: profile?.bio || profile?.profile?.bio || '',
        interests: profile?.profile?.interest || []
    });
    const [selectedImage, setSelectedImage] = useState(null);
    const [newInterest, setNewInterest] = useState('');

    // Reset form when modal opens
    React.useEffect(() => {
        if (visible && profile) {
            setEditForm({
                profilePic: profile.profile?.img || '',
                displayName: profile.profile?.display_name || '',
                bio: profile.bio || profile.profile?.bio || '',
                interests: profile.profile?.interest || []
            });
            setSelectedImage(null);
        }
    }, [visible, profile]);

    const requestPermissions = async () => {
        try {
            // Request media library permissions
            const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();

            if (status !== 'granted') {
                Alert.alert(
                    'Permission Required',
                    'Please allow access to your photo library in Settings to upload images.',
                    [
                        { text: 'Cancel', style: 'cancel' },
                        { text: 'Open Settings', onPress: () => ImagePicker.requestMediaLibraryPermissionsAsync() }
                    ]
                );
                return false;
            }
            return true;
        } catch (error) {
            console.error('Permission request error:', error);
            Alert.alert('Error', 'Failed to request permissions');
            return false;
        }
    };

    const pickImage = async () => {
        try {
            const hasPermission = await requestPermissions();
            if (!hasPermission) return;

            const result = await ImagePicker.launchImageLibraryAsync({
                mediaTypes: ImagePicker.MediaTypeOptions.Images, // Use MediaTypeOptions for better compatibility
                allowsEditing: true,
                aspect: [1, 1],
                quality: 0.8,
                allowsMultipleSelection: false, // Ensure single selection
            });

            console.log('Image picker result:', result); // Debug log

            if (!result.canceled && result.assets && result.assets[0]) {
                const selectedAsset = result.assets[0];

                // Validate the selected image
                if (selectedAsset.uri) {
                    setSelectedImage(selectedAsset);
                    console.log('Image selected:', selectedAsset.uri);
                } else {
                    Alert.alert('Error', 'Failed to get image URI');
                }
            } else {
                console.log('Image selection cancelled or failed');
            }
        } catch (error) {
            console.error('Image picker error:', error);
            Alert.alert('Error', 'Failed to pick image from gallery');
        }
    };

    const takePhoto = async () => {
        try {
            const { status } = await ImagePicker.requestCameraPermissionsAsync();
            if (status !== 'granted') {
                Alert.alert(
                    'Permission Required',
                    'Please allow camera access in Settings to take photos.',
                    [
                        { text: 'Cancel', style: 'cancel' },
                        { text: 'Open Settings', onPress: () => ImagePicker.requestCameraPermissionsAsync() }
                    ]
                );
                return;
            }

            const result = await ImagePicker.launchCameraAsync({
                allowsEditing: true,
                aspect: [1, 1],
                quality: 0.8,
                mediaTypes: ImagePicker.MediaTypeOptions.Images,
            });

            console.log('Camera result:', result); // Debug log

            if (!result.canceled && result.assets && result.assets[0]) {
                const selectedAsset = result.assets[0];

                if (selectedAsset.uri) {
                    setSelectedImage(selectedAsset);
                    console.log('Photo taken:', selectedAsset.uri);
                } else {
                    Alert.alert('Error', 'Failed to get photo URI');
                }
            }
        } catch (error) {
            console.error('Camera error:', error);
            Alert.alert('Error', 'Failed to take photo');
        }
    };

    const showImageOptions = () => {
        Alert.alert(
            'Profile Picture',
            'Choose how to add your profile picture',
            [
                { text: 'Camera', onPress: takePhoto },
                { text: 'Gallery', onPress: pickImage },
                { text: 'Cancel', style: 'cancel' }
            ]
        );
    };

    const addInterest = () => {
        if (newInterest.trim() && !editForm.interests.includes(newInterest.trim())) {
            setEditForm(prev => ({
                ...prev,
                interests: [...prev.interests, newInterest.trim()]
            }));
            setNewInterest('');
        }
    };

    const removeInterest = (indexToRemove) => {
        setEditForm(prev => ({
            ...prev,
            interests: prev.interests.filter((_, index) => index !== indexToRemove)
        }));
    };

    const handleClose = () => {
        setNewInterest('');
        setSelectedImage(null);
        onClose();
    };

    const saveProfile = async () => {
        setUpdating(true);
        try {
            const formData = new FormData();

            // Add profile picture
            if (selectedImage) {
                const fileExtension = selectedImage.uri.split('.').pop()?.toLowerCase() || 'jpg';
                const fileName = selectedImage.fileName || `profile_${Date.now()}.${fileExtension}`;

                // Fix MIME type mapping
                const getMimeType = (extension) => {
                    switch (extension) {
                        case 'jpg':
                        case 'jpeg':
                            return 'image/jpeg';
                        case 'png':
                            return 'image/png';
                        case 'gif':
                            return 'image/gif';
                        case 'webp':
                            return 'image/webp';
                        default:
                            return 'image/jpeg';
                    }
                };

                formData.append('file', {
                    uri: selectedImage.uri,
                    type: selectedImage.type || getMimeType(fileExtension),
                    name: fileName
                });
            }

            // Add text fields (only if they have values)
            if (editForm.displayName?.trim()) {
                formData.append('display_name', editForm.displayName.trim());
            }
            if (editForm.bio?.trim()) {
                formData.append('bio', editForm.bio.trim());
            }
            if (editForm.interests.length > 0) {
                formData.append('interest', editForm.interests.join(', '));
            }

            const URL = Config.BaseURL + '/api/v1/user/' + user.uid + '/profile';

            const response = await fetch(URL, {
                method: 'PUT',
                // Don't set Content-Type - let FormData handle it automatically
                body: formData
            });

            if (!response.ok) {
                const errorData = await response.text();
                throw new Error(`HTTP ${response.status}: ${errorData}`);
            }

            const result = await response.json();
            await onProfileUpdate();
            handleClose();

        } catch (error) {
            console.error('Profile update error:', error);
            Alert.alert('Error', error.message || 'Failed to update profile');
        } finally {
            setUpdating(false);
        }
    };

    const getCurrentImageUri = () => {
        if (selectedImage && selectedImage.uri) {
            return selectedImage.uri;
        }
        return editForm.profilePic;
    };

    return (
        <Modal
            animationType="slide"
            transparent={true}
            visible={visible}
            onRequestClose={handleClose}
        >
            <View style={styles.modalOverlay}>
                <View style={styles.modalContainer}>
                    <View style={styles.modalHeader}>
                        <Text style={styles.modalTitle}>Edit Profile</Text>
                        <TouchableOpacity onPress={handleClose}>
                            <Text style={styles.closeButton}>✕</Text>
                        </TouchableOpacity>
                    </View>

                    <ScrollView style={styles.modalContent} showsVerticalScrollIndicator={false}>
                        {/* Profile Picture */}
                        <View style={styles.inputGroup}>
                            <Text style={styles.inputLabel}>Profile Picture</Text>

                            {/* Current/Preview Image */}
                            {getCurrentImageUri() ? (
                                <View style={styles.imagePreviewContainer}>
                                    <Image
                                        source={{ uri: getCurrentImageUri() }}
                                        style={styles.imagePreview}
                                        resizeMode="cover"
                                        onError={(error) => console.log('Image load error:', error)}
                                    />
                                </View>
                            ) : null}

                            {/* Image Source Toggle */}
                            <TouchableOpacity style={styles.imagePickerButton} onPress={showImageOptions}>
                                <Text style={styles.imagePickerText}>
                                    {getCurrentImageUri() ? 'Change Picture' : 'Add Picture'}
                                </Text>
                            </TouchableOpacity>

                            {/* File Upload Info */}
                            {selectedImage && (
                                <View style={styles.uploadInfo}>
                                    <Text style={styles.uploadInfoText}>
                                        📁 {selectedImage.fileName || 'Selected image'}
                                        {selectedImage.fileSize ? ` (${Math.round(selectedImage.fileSize / 1024)}KB)` : ''}
                                    </Text>
                                </View>
                            )}
                        </View>

                        {/* Display Name */}
                        <View style={styles.inputGroup}>
                            <Text style={styles.inputLabel}>Display Name</Text>
                            <TextInput
                                style={styles.textInput}
                                value={editForm.displayName}
                                onChangeText={(text) => setEditForm(prev => ({...prev, displayName: text}))}
                                placeholder="Enter your display name"
                                maxLength={50}
                            />
                        </View>

                        {/* Bio */}
                        <View style={styles.inputGroup}>
                            <Text style={styles.inputLabel}>Bio</Text>
                            <TextInput
                                style={[styles.textInput, styles.bioInput]}
                                value={editForm.bio}
                                onChangeText={(text) => setEditForm(prev => ({...prev, bio: text}))}
                                placeholder="Tell us about yourself..."
                                multiline={true}
                                numberOfLines={4}
                                maxLength={200}
                            />
                            <Text style={styles.charCount}>{editForm.bio.length}/200</Text>
                        </View>

                        {/* Interests */}
                        <View style={styles.inputGroup}>
                            <Text style={styles.inputLabel}>Interests</Text>
                            <View style={styles.interestInputContainer}>
                                <TextInput
                                    style={[styles.textInput, styles.interestInput]}
                                    value={newInterest}
                                    onChangeText={setNewInterest}
                                    placeholder="Add an interest"
                                    onSubmitEditing={addInterest}
                                    returnKeyType="done"
                                />
                                <TouchableOpacity style={styles.addInterestButton} onPress={addInterest}>
                                    <Text style={styles.addInterestText}>Add</Text>
                                </TouchableOpacity>
                            </View>

                            {/* Current Interests */}
                            <View style={styles.currentInterests}>
                                {editForm.interests.map((interest, index) => (
                                    <View key={index} style={styles.interestChip}>
                                        <Text style={styles.interestChipText}>{interest}</Text>
                                        <TouchableOpacity
                                            style={styles.removeInterestButton}
                                            onPress={() => removeInterest(index)}
                                        >
                                            <Text style={styles.removeInterestText}>×</Text>
                                        </TouchableOpacity>
                                    </View>
                                ))}
                            </View>
                        </View>
                    </ScrollView>

                    {/* Modal Footer */}
                    <View style={styles.modalFooter}>
                        <TouchableOpacity
                            style={styles.cancelButton}
                            onPress={handleClose}
                            disabled={updating}
                        >
                            <Text style={styles.cancelButtonText}>Cancel</Text>
                        </TouchableOpacity>
                        <TouchableOpacity
                            style={[styles.saveButton, updating && styles.disabledButton]}
                            onPress={saveProfile}
                            disabled={updating}
                        >
                            {updating ? (
                                <ActivityIndicator size="small" color="#fff" />
                            ) : (
                                <Text style={styles.saveButtonText}>Save</Text>
                            )}
                        </TouchableOpacity>
                    </View>
                </View>
            </View>
        </Modal>
    );
};

const styles = StyleSheet.create({
    modalOverlay: {
        flex: 1,
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
        justifyContent: 'center',
        alignItems: 'center',
    },
    modalContainer: {
        backgroundColor: '#fff',
        width: '90%',
        maxHeight: '85%',
        borderRadius: 15,
        elevation: 5,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.25,
        shadowRadius: 3.84,
    },
    modalHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingHorizontal: 20,
        paddingVertical: 15,
        borderBottomWidth: 1,
        borderBottomColor: '#f0f0f0',
    },
    modalTitle: {
        fontSize: 20,
        fontWeight: 'bold',
        color: '#333',
    },
    closeButton: {
        fontSize: 24,
        color: '#666',
        fontWeight: 'bold',
    },
    modalContent: {
        paddingHorizontal: 20,
        paddingVertical: 15,
        maxHeight: 450,
    },
    inputGroup: {
        marginBottom: 20,
    },
    inputLabel: {
        fontSize: 16,
        fontWeight: '600',
        color: '#333',
        marginBottom: 8,
    },
    textInput: {
        borderWidth: 1,
        borderColor: '#ddd',
        borderRadius: 8,
        paddingHorizontal: 12,
        paddingVertical: 10,
        fontSize: 16,
        backgroundColor: '#fff',
    },
    bioInput: {
        height: 80,
        textAlignVertical: 'top',
    },
    charCount: {
        textAlign: 'right',
        fontSize: 12,
        color: '#666',
        marginTop: 4,
    },
    imagePreviewContainer: {
        alignItems: 'center',
        marginBottom: 10,
    },
    imagePreview: {
        width: 100,
        height: 100,
        borderRadius: 50,
        borderWidth: 2,
        borderColor: '#ddd',
    },
    imagePickerButton: {
        backgroundColor: 'rgba(255,78,0,0.24)',
        paddingVertical: 12,
        paddingHorizontal: 15,
        borderRadius: 8,
        alignItems: 'center',
        marginBottom: 10,
    },
    imagePickerText: {
        color: '#333',
        fontWeight: '600',
        fontSize: 16,
    },
    uploadInfo: {
        backgroundColor: '#e8f5e8',
        padding: 8,
        borderRadius: 5,
        marginTop: 5,
    },
    uploadInfoText: {
        color: '#2d5a2d',
        fontSize: 12,
        textAlign: 'center',
    },
    interestInputContainer: {
        flexDirection: 'row',
        gap: 10,
        alignItems: 'center',
    },
    interestInput: {
        flex: 1,
    },
    addInterestButton: {
        backgroundColor: '#ff7600',
        paddingHorizontal: 15,
        paddingVertical: 10,
        borderRadius: 8,
    },
    addInterestText: {
        color: '#fff',
        fontWeight: '600',
    },
    currentInterests: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: 8,
        marginTop: 10,
    },
    interestChip: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#f0f0f0',
        paddingHorizontal: 12,
        paddingVertical: 6,
        borderRadius: 15,
        gap: 5,
    },
    interestChipText: {
        fontSize: 14,
        color: '#333',
    },
    removeInterestButton: {
        backgroundColor: '#ff4444',
        borderRadius: 10,
        width: 20,
        height: 20,
        alignItems: 'center',
        justifyContent: 'center',
    },
    removeInterestText: {
        color: '#fff',
        fontSize: 12,
        fontWeight: 'bold',
    },
    modalFooter: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        paddingHorizontal: 20,
        paddingVertical: 15,
        borderTopWidth: 1,
        borderTopColor: '#f0f0f0',
        gap: 10,
    },
    cancelButton: {
        flex: 1,
        backgroundColor: '#f0f0f0',
        paddingVertical: 12,
        borderRadius: 8,
        alignItems: 'center',
    },
    cancelButtonText: {
        color: '#333',
        fontSize: 16,
        fontWeight: '600',
    },
    saveButton: {
        flex: 1,
        backgroundColor: '#ff7600',
        paddingVertical: 12,
        borderRadius: 8,
        alignItems: 'center',
        justifyContent: 'center',
    },
    saveButtonText: {
        color: '#fff',
        fontSize: 16,
        fontWeight: '600',
    },
    disabledButton: {
        backgroundColor: '#ccc',
    },
});

export default EditProfileModal;