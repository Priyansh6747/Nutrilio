import React, { useState, useRef } from 'react';
import {
    View,
    Text,
    StyleSheet,
    TouchableOpacity,
    Modal,
    Image,
    Alert,
    ActivityIndicator,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { CameraView, useCameraPermissions } from 'expo-camera';
import * as ImagePicker from 'expo-image-picker';
import ServerConfig from "../../utils/Config";

const CameraScanModal = ({
                             visible,
                             foodName,
                             foodDescription,
                             selectedMeal,
                             onClose,
                         }) => {
    const [permission, requestPermission] = useCameraPermissions();
    const [facing, setFacing] = useState('back');
    const [flash, setFlash] = useState('off');
    const [capturedImage, setCapturedImage] = useState(null);
    const [analyzing, setAnalyzing] = useState(false);
    const [predictionResult, setPredictionResult] = useState(null);
    const cameraRef = useRef(null);

    const takePicture = async () => {
        if (cameraRef.current) {
            try {
                const photo = await cameraRef.current.takePictureAsync({
                    quality: 0.8,
                    base64: false,
                    exif: false,
                });
                setCapturedImage(photo.uri);
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
            const formData = new FormData();
            const filename = imageUri.split('/').pop();
            const match = /\.(\w+)$/.exec(filename);
            const type = match ? `image/${match[1]}` : `image/jpeg`;

            formData.append('image', {
                uri: imageUri,
                name: filename,
                type: type,
            });
            formData.append('name', foodName);
            formData.append('description', foodDescription);

            const URL = ServerConfig.BaseURL + '/api/v1/log/predict';
            const response = await fetch(URL, {
                method: 'POST',
                body: formData,
                headers: {
                    'Content-Type': 'multipart/form-data',
                },
            });

            setAnalyzing(false);

            if (!response.ok) {
                throw new Error(`Server returned ${response.status}`);
            }

            const data = await response.json();
            setPredictionResult(data);
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
        const { result, confidence } = data;
        const detectedName = result.name;
        const detectedDescription = result.description;
        const confidencePercent = (confidence * 100).toFixed(1);

        // Check if confidence is below 20%
        if (confidence < 0.20) {
            Alert.alert(
                'Low Confidence Match',
                `⚠️ The image does not seem to match "${foodName}".\n\nConfidence: ${confidencePercent}%\n\nThe food in the image may be different from what you described. Are you sure you want to proceed?`,
                [
                    {
                        text: 'Cancel',
                        style: 'cancel',
                        onPress: resetFlow
                    },
                    {
                        text: 'Retake Photo',
                        onPress: retakePhoto
                    },
                    {
                        text: 'Proceed Anyway',
                        onPress: () => addFoodToLog(data),
                        style: 'destructive'
                    }
                ]
            );
        } else {
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
        }
    };

    const addFoodToLog = (data) => {
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

        Alert.alert('Success', `${foodName} added to your log!`, [
            {
                text: 'OK',
                onPress: resetFlow
            }
        ]);
    };

    const resetFlow = () => {
        setCapturedImage(null);
        setPredictionResult(null);
        setAnalyzing(false);
        onClose();
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

    return (
        <Modal
            visible={visible}
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
    );
};

const styles = StyleSheet.create({
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

export default CameraScanModal;