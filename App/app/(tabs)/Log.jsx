import React, { useState, useRef, useEffect } from 'react';
import {
    View,
    Text,
    StyleSheet,
    TextInput,
    TouchableOpacity,
    ScrollView,
    FlatList,
    Modal,
    Image,
    Alert,
    ActivityIndicator,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { CameraView, useCameraPermissions } from 'expo-camera';
import * as ImagePicker from 'expo-image-picker';
import ServerConfig from "../../utils/Config";

const Log = () => {
    const [searchQuery, setSearchQuery] = useState('');
    const [selectedMeal, setSelectedMeal] = useState(null);
    const [scanModalVisible, setScanModalVisible] = useState(false);
    const [nameInputModalVisible, setNameInputModalVisible] = useState(false);
    const [permission, requestPermission] = useCameraPermissions();
    const [facing, setFacing] = useState('back');
    const [flash, setFlash] = useState('off');
    const [capturedImage, setCapturedImage] = useState(null);
    const [analyzing, setAnalyzing] = useState(false);
    const [foodName, setFoodName] = useState('');
    const [foodDescription, setFoodDescription] = useState('');
    const [predictionResult, setPredictionResult] = useState(null);
    const cameraRef = useRef(null);

    const mealTimes = [
        {
            id: 'breakfast',
            name: 'Breakfast',
            icon: '🌅',
            time: '6-11 AM',
            color: '#FF9800',
        },
        {
            id: 'lunch',
            name: 'Lunch',
            icon: '☀️',
            time: '11 AM-4 PM',
            color: '#FFC107',
        },
        {
            id: 'dinner',
            name: 'Dinner',
            icon: '🌙',
            time: '4-10 PM',
            color: '#3F51B5',
        },
        {
            id: 'snacks',
            name: 'Snacks',
            icon: '🍎',
            time: 'Anytime',
            color: '#E91E63',
        },
    ];

    const recentFoods = [
        {
            id: '1',
            name: 'Greek Yogurt',
            details: 'Fage • 1 cup',
            calories: 130,
            color: '#E8F5E9',
            icon: '🥛',
        },
        {
            id: '2',
            name: 'Banana',
            details: 'Medium • 1 piece',
            calories: 105,
            color: '#FFF9C4',
            icon: '🍌',
        },
        {
            id: '3',
            name: 'Chicken Breast',
            details: 'Grilled • 100g',
            calories: 165,
            color: '#FFE0B2',
            icon: '🍗',
        },
        {
            id: '4',
            name: 'Brown Rice',
            details: 'Cooked • 1 cup',
            calories: 215,
            color: '#D7CCC8',
            icon: '🍚',
        },
    ];

    const handleScanFood = () => {
        // Step 1: Show name input modal first
        setNameInputModalVisible(true);
    };

    const handleNameSubmit = async () => {
        // Validate that name is provided
        if (!foodName.trim()) {
            Alert.alert('Required', 'Please enter a food name');
            return;
        }

        // Close name input modal
        setNameInputModalVisible(false);

        // Step 2: Request camera permission if needed
        if (!permission?.granted) {
            const result = await requestPermission();
            if (!result.granted) {
                Alert.alert(
                    'Camera Permission Required',
                    'Please enable camera access in your device settings to use this feature.',
                    [{ text: 'OK' }]
                );
                // Reset state
                setFoodName('');
                setFoodDescription('');
                return;
            }
        }

        // Step 3: Open camera modal
        setScanModalVisible(true);
    };

    const handleSearchFood = () => {
        // Navigate to search screen
        console.log('Search food:', searchQuery);
    };

    const takePicture = async () => {
        if (cameraRef.current) {
            try {
                const photo = await cameraRef.current.takePictureAsync({
                    quality: 0.8,
                    base64: false,
                    exif: false,
                });
                setCapturedImage(photo.uri);
                // Step 4: Send to server for analysis
                analyzeFoodImage(photo.uri);
            } catch (error) {
                console.error('Error taking picture:', error);
                Alert.alert('Error', 'Failed to capture image. Please try again.');
            }
        }
    };

    const pickImageFromGallery = async () => {
        try {
            const result = await ImagePicker.launchImageLibraryAsync({
                mediaTypes: ImagePicker.MediaTypeOptions.Images,
                allowsEditing: true,
                aspect: [4, 3],
                quality: 0.8,
            });

            if (!result.canceled) {
                setCapturedImage(result.assets[0].uri);
                // Step 4: Send to server for analysis
                analyzeFoodImage(result.assets[0].uri);
            }
        } catch (error) {
            console.error('Error picking image:', error);
            Alert.alert('Error', 'Failed to pick image. Please try again.');
        }
    };

    const analyzeFoodImage = async (imageUri) => {
        setAnalyzing(true);

        try {
            // Create FormData for multipart/form-data request
            const formData = new FormData();

            // Add the image file to FormData
            const filename = imageUri.split('/').pop();
            const match = /\.(\w+)$/.exec(filename);
            const type = match ? `image/${match[1]}` : `image/jpeg`;

            formData.append('image', {
                uri: imageUri,
                name: filename,
                type: type,
            });

            // Add user-provided name and description
            formData.append('name', foodName);
            formData.append('description', foodDescription);

            // Make the API call
            const URL = ServerConfig.BaseURL + '/api/v1/log/predict';
            const response = await fetch(URL, {
                method: 'POST',
                body: formData,
                headers: {
                    'Content-Type': 'multipart/form-data',
                    // Add any authentication headers if needed
                    // 'Authorization': `Bearer ${yourAuthToken}`,
                },
            });

            setAnalyzing(false);

            if (!response.ok) {
                throw new Error(`Server returned ${response.status}`);
            }

            const data = await response.json();

            // Store prediction result
            setPredictionResult(data);

            // Step 5: Show confirmation dialog
            showConfirmationDialog(data);

        } catch (error) {
            setAnalyzing(false);
            console.error('Error analyzing food:', error);

            Alert.alert(
                'Analysis Failed',
                'We couldn\'t analyze your food image. Please try again.',
                [
                    {
                        text: 'Retry',
                        onPress: () => analyzeFoodImage(imageUri)
                    },
                    {
                        text: 'Cancel',
                        style: 'cancel',
                        onPress: resetFlow
                    }
                ]
            );
        }
    };

    const showConfirmationDialog = (data) => {
        const { result, confidence, timestamp } = data;
        const detectedName = result.name;
        const detectedDescription = result.description;
        const confidencePercent = (confidence * 100).toFixed(1);

        Alert.alert(
            'Confirm Food Detection',
            `Detected: ${detectedName}\n\nYour input: ${foodName}\n\n${detectedDescription}\n\nConfidence: ${confidencePercent}%\n\nWould you like to add this to your log?`,
            [
                {
                    text: 'Cancel',
                    style: 'cancel',
                    onPress: resetFlow
                },
                {
                    text: 'Add to Log',
                    onPress: () => addFoodToLog(data)
                }
            ]
        );
    };

    const addFoodToLog = (data) => {
        // Close modals and reset state
        setScanModalVisible(false);

        // TODO: Implement actual logging logic to save to database/state
        console.log('Adding food to log:', {
            userProvidedName: foodName,
            userProvidedDescription: foodDescription,
            detectedName: data.result.name,
            detectedDescription: data.result.description,
            confidence: data.confidence,
            timestamp: data.timestamp,
            imageUri: capturedImage,
            mealType: selectedMeal
        });

        // Show success message
        Alert.alert('Success', `${foodName} added to your log!`, [
            {
                text: 'OK',
                onPress: resetFlow
            }
        ]);
    };

    const resetFlow = () => {
        setCapturedImage(null);
        setFoodName('');
        setFoodDescription('');
        setPredictionResult(null);
        setAnalyzing(false);
        setScanModalVisible(false);
        setNameInputModalVisible(false);
    };

    const retakePhoto = () => {
        setCapturedImage(null);
        setAnalyzing(false);
        setPredictionResult(null);
    };

    const toggleFlash = () => {
        setFlash(flash === 'off' ? 'on' : 'off');
    };

    const toggleCameraFacing = () => {
        setFacing(facing === 'back' ? 'front' : 'back');
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
            <Modal
                visible={nameInputModalVisible}
                animationType="slide"
                transparent={true}
                onRequestClose={() => {
                    setNameInputModalVisible(false);
                    setFoodName('');
                    setFoodDescription('');
                }}
            >
                <View style={styles.nameModalOverlay}>
                    <View style={styles.nameModalContent}>
                        <View style={styles.nameModalHeader}>
                            <Text style={styles.nameModalTitle}>Name Your Food</Text>
                            <TouchableOpacity
                                onPress={() => {
                                    setNameInputModalVisible(false);
                                    setFoodName('');
                                    setFoodDescription('');
                                }}
                            >
                                <Ionicons name="close" size={24} color="#666" />
                            </TouchableOpacity>
                        </View>

                        <Text style={styles.inputLabel}>Food Name *</Text>
                        <TextInput
                            style={styles.nameInput}
                            placeholder="e.g., Grilled Chicken"
                            placeholderTextColor="#999"
                            value={foodName}
                            onChangeText={setFoodName}
                            autoFocus
                        />

                        <Text style={styles.inputLabel}>Description (Optional)</Text>
                        <TextInput
                            style={[styles.nameInput, styles.descriptionInput]}
                            placeholder="e.g., With vegetables and rice"
                            placeholderTextColor="#999"
                            value={foodDescription}
                            onChangeText={setFoodDescription}
                            multiline
                            numberOfLines={3}
                        />

                        <TouchableOpacity
                            style={styles.continueButton}
                            onPress={handleNameSubmit}
                            activeOpacity={0.8}
                        >
                            <Text style={styles.continueButtonText}>Continue to Camera</Text>
                            <Ionicons name="camera" size={20} color="#fff" />
                        </TouchableOpacity>
                    </View>
                </View>
            </Modal>

            {/* Camera Scan Modal */}
            <Modal
                visible={scanModalVisible}
                animationType="slide"
                presentationStyle="fullScreen"
                onRequestClose={resetFlow}
            >
                <View style={styles.modalContainer}>
                    <View style={styles.modalHeader}>
                        <TouchableOpacity
                            style={styles.closeButton}
                            onPress={resetFlow}
                        >
                            <Ionicons name="close" size={28} color="#fff" />
                        </TouchableOpacity>
                        <Text style={styles.modalTitle}>
                            {capturedImage ? 'Review Photo' : 'Scan Your Food'}
                        </Text>
                        <TouchableOpacity
                            style={styles.flipButton}
                            onPress={toggleCameraFacing}
                            disabled={capturedImage !== null}
                        >
                            {!capturedImage && (
                                <Ionicons name="camera-reverse" size={28} color="#fff" />
                            )}
                        </TouchableOpacity>
                    </View>

                    {capturedImage ? (
                        <View style={styles.imagePreviewContainer}>
                            <Image source={{ uri: capturedImage }} style={styles.capturedImagePreview} />
                            {analyzing && (
                                <View style={styles.analyzingOverlay}>
                                    <ActivityIndicator size="large" color="#fff" />
                                    <Text style={styles.analyzingText}>Analyzing {foodName}...</Text>
                                </View>
                            )}
                        </View>
                    ) : (
                        permission?.granted ? (
                            <CameraView
                                ref={cameraRef}
                                style={styles.camera}
                                facing={facing}
                                flash={flash}
                            >
                                <View style={styles.cameraOverlay}>
                                    <View style={styles.scanFrame}>
                                        <View style={[styles.scanCorner, styles.scanCornerTL]} />
                                        <View style={[styles.scanCorner, styles.scanCornerTR]} />
                                        <View style={[styles.scanCorner, styles.scanCornerBL]} />
                                        <View style={[styles.scanCorner, styles.scanCornerBR]} />
                                    </View>
                                    <Text style={styles.scanHint}>Center {foodName} in the frame</Text>
                                </View>
                            </CameraView>
                        ) : (
                            <View style={styles.permissionContainer}>
                                <Ionicons name="camera-outline" size={80} color="#fff" />
                                <Text style={styles.permissionText}>Camera permission is required</Text>
                                <TouchableOpacity
                                    style={styles.permissionButton}
                                    onPress={requestPermission}
                                >
                                    <Text style={styles.permissionButtonText}>Grant Permission</Text>
                                </TouchableOpacity>
                            </View>
                        )
                    )}

                    <View style={styles.scanControls}>
                        {capturedImage ? (
                            <>
                                <TouchableOpacity
                                    style={styles.retakeButton}
                                    onPress={retakePhoto}
                                    disabled={analyzing}
                                >
                                    <Ionicons name="refresh" size={24} color="#fff" />
                                    <Text style={styles.controlText}>Retake</Text>
                                </TouchableOpacity>
                            </>
                        ) : (
                            <>
                                <TouchableOpacity
                                    style={styles.galleryButton}
                                    onPress={pickImageFromGallery}
                                    activeOpacity={0.7}
                                >
                                    <Ionicons name="images-outline" size={24} color="#fff" />
                                    <Text style={styles.controlText}>Gallery</Text>
                                </TouchableOpacity>

                                <TouchableOpacity
                                    style={styles.captureButton}
                                    onPress={takePicture}
                                    activeOpacity={0.7}
                                    disabled={!permission?.granted}
                                >
                                    <View style={styles.captureButtonInner} />
                                </TouchableOpacity>

                                <TouchableOpacity
                                    style={styles.flashButton}
                                    onPress={toggleFlash}
                                    activeOpacity={0.7}
                                    disabled={!permission?.granted}
                                >
                                    <Ionicons
                                        name={flash === 'on' ? 'flash' : 'flash-outline'}
                                        size={24}
                                        color={flash === 'on' ? '#FFD700' : '#fff'}
                                    />
                                    <Text style={styles.controlText}>{flash === 'on' ? 'On' : 'Off'}</Text>
                                </TouchableOpacity>
                            </>
                        )}
                    </View>
                </View>
            </Modal>
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
    // Name Input Modal Styles
    nameModalOverlay: {
        flex: 1,
        backgroundColor: 'rgba(0,0,0,0.5)',
        justifyContent: 'center',
        alignItems: 'center',
    },
    nameModalContent: {
        backgroundColor: '#fff',
        borderRadius: 24,
        padding: 24,
        width: '85%',
        maxWidth: 400,
    },
    nameModalHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 24,
    },
    nameModalTitle: {
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
    // Modal Styles
    modalContainer: {
        flex: 1,
        backgroundColor: '#000',
    },
    modalHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingHorizontal: 20,
        paddingTop: 60,
        paddingBottom: 20,
        backgroundColor: 'rgba(0,0,0,0.5)',
        zIndex: 10,
    },
    closeButton: {
        width: 40,
        height: 40,
        borderRadius: 20,
        backgroundColor: 'rgba(255,255,255,0.2)',
        justifyContent: 'center',
        alignItems: 'center',
    },
    flipButton: {
        width: 40,
        height: 40,
        borderRadius: 20,
        backgroundColor: 'rgba(255,255,255,0.2)',
        justifyContent: 'center',
        alignItems: 'center',
    },
    modalTitle: {
        fontSize: 18,
        fontWeight: '700',
        color: '#fff',
        letterSpacing: 0.3,
    },
    camera: {
        flex: 1,
    },
    cameraOverlay: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: 'rgba(0,0,0,0.1)',
    },
    scanFrame: {
        width: 280,
        height: 280,
        position: 'relative',
    },
    scanCorner: {
        position: 'absolute',
        width: 40,
        height: 40,
        borderColor: '#4CAF50',
        borderWidth: 3,
    },
    scanCornerTL: {
        top: 0,
        left: 0,
        borderRightWidth: 0,
        borderBottomWidth: 0,
    },
    scanCornerTR: {
        top: 0,
        right: 0,
        borderLeftWidth: 0,
        borderBottomWidth: 0,
    },
    scanCornerBL: {
        bottom: 0,
        left: 0,
        borderRightWidth: 0,
        borderTopWidth: 0,
    },
    scanCornerBR: {
        bottom: 0,
        right: 0,
        borderLeftWidth: 0,
        borderTopWidth: 0,
    },
    scanHint: {
        position: 'absolute',
        bottom: 100,
        color: '#fff',
        fontSize: 16,
        fontWeight: '500',
        backgroundColor: 'rgba(0,0,0,0.5)',
        paddingHorizontal: 16,
        paddingVertical: 8,
        borderRadius: 20,
    },
    permissionContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: '#1A1A1A',
    },
    permissionText: {
        fontSize: 18,
        fontWeight: '600',
        color: '#fff',
        marginTop: 20,
        marginBottom: 30,
    },
    permissionButton: {
        backgroundColor: '#4CAF50',
        paddingHorizontal: 24,
        paddingVertical: 12,
        borderRadius: 25,
    },
    permissionButtonText: {
        color: '#fff',
        fontSize: 16,
        fontWeight: '600',
    },
    imagePreviewContainer: {
        flex: 1,
        backgroundColor: '#000',
    },
    capturedImagePreview: {
        flex: 1,
        resizeMode: 'contain',
    },
    analyzingOverlay: {
        ...StyleSheet.absoluteFillObject,
        backgroundColor: 'rgba(0,0,0,0.7)',
        justifyContent: 'center',
        alignItems: 'center',
    },
    analyzingText: {
        fontSize: 16,
        color: '#fff',
        marginTop: 16,
        fontWeight: '500',
    },
    scanControls: {
        flexDirection: 'row',
        justifyContent: 'space-around',
        alignItems: 'center',
        paddingVertical: 40,
        paddingHorizontal: 20,
        backgroundColor: 'rgba(0,0,0,0.8)',
    },
    galleryButton: {
        alignItems: 'center',
    },
    flashButton: {
        alignItems: 'center',
    },
    retakeButton: {
        alignItems: 'center',
    },
    controlText: {
        fontSize: 12,
        color: '#fff',
        marginTop: 8,
        fontWeight: '500',
    },
    captureButton: {
        width: 80,
        height: 80,
        borderRadius: 40,
        backgroundColor: '#fff',
        justifyContent: 'center',
        alignItems: 'center',
        borderWidth: 4,
        borderColor: 'rgba(255,255,255,0.3)',
    },
    captureButtonInner: {
        width: 64,
        height: 64,
        borderRadius: 32,
        backgroundColor: '#fff',
    },
});

export default Log;