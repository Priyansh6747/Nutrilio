import React, { useState, useRef } from 'react';
import {
    View,
    Text,
    StyleSheet,
    TouchableOpacity,
    Modal,
    Image,
    ActivityIndicator,
    ScrollView,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { CameraView, useCameraPermissions } from 'expo-camera';
import * as ImagePicker from 'expo-image-picker';
import { LinearGradient } from 'expo-linear-gradient';
import ServerConfig from "../../utils/Config";

const ConfirmationModal = ({ visible, data, foodName, onCancel, onRetake, onUseSuggested, onProceed }) => {
    if (!visible || !data) return null;

    return (
        <Modal
            visible={visible}
            animationType="fade"
            transparent={true}
            statusBarTranslucent={true}
        >
            <View style={styles.confirmModalOverlay}>
                <View style={styles.confirmModalContainer}>
                    <LinearGradient
                        colors={['#06B6D4', '#3B82F6', '#10B981']}
                        start={{ x: 0, y: 0 }}
                        end={{ x: 1, y: 1 }}
                        style={styles.gradientBackground}
                    >
                        <ScrollView
                            contentContainerStyle={styles.confirmModalContent}
                            showsVerticalScrollIndicator={false}
                        >
                            {/* Icon */}
                            <View style={styles.iconContainer}>
                                {data.type === 'error' ? (
                                    <Ionicons name="alert-circle" size={64} color="#fff" />
                                ) : data.type === 'low_confidence' ? (
                                    <Ionicons name="warning" size={64} color="#FFD700" />
                                ) : (
                                    <Ionicons name="checkmark-circle" size={64} color="#fff" />
                                )}
                            </View>

                            {/* Title */}
                            <Text style={styles.confirmTitle}>
                                {data.type === 'error'
                                    ? 'Analysis Failed'
                                    : data.type === 'low_confidence'
                                        ? 'Low Confidence Match'
                                        : 'Confirm Food Detection'}
                            </Text>

                            {/* Content */}
                            {data.type === 'error' ? (
                                <Text style={styles.confirmMessage}>
                                    We couldn't analyze your food image. Please try again.
                                </Text>
                            ) : (
                                <View style={styles.detailsContainer}>
                                    {data.type === 'low_confidence' && (
                                        <View style={styles.warningBadge}>
                                            <Text style={styles.warningText}>
                                                ⚠️ The image does not seem to match "{foodName}"
                                            </Text>
                                        </View>
                                    )}

                                    <View style={styles.infoRow}>
                                        <Text style={styles.infoLabel}>Detected:</Text>
                                        <Text style={styles.infoValue}>{data.detectedName}</Text>
                                    </View>

                                    <View style={styles.infoRow}>
                                        <Text style={styles.infoLabel}>Your Input:</Text>
                                        <Text style={styles.infoValue}>{foodName}</Text>
                                    </View>

                                    <View style={styles.descriptionBox}>
                                        <Text style={styles.descriptionText}>
                                            {data.detectedDescription}
                                        </Text>
                                    </View>

                                    <View style={styles.confidenceContainer}>
                                        <Text style={styles.confidenceLabel}>Confidence</Text>
                                        <View style={styles.confidenceBar}>
                                            <View
                                                style={[
                                                    styles.confidenceFill,
                                                    {
                                                        width: `${data.confidencePercent}%`,
                                                        backgroundColor: data.confidence < 0.20
                                                            ? '#FFA500'
                                                            : '#4CAF50'
                                                    }
                                                ]}
                                            />
                                        </View>
                                        <Text style={styles.confidencePercent}>
                                            {data.confidencePercent}%
                                        </Text>
                                    </View>

                                    {data.suggestedFood && (
                                        <View style={styles.suggestionBox}>
                                            <Text style={styles.suggestionLabel}>Did you mean:</Text>
                                            <Text style={styles.suggestionText}>
                                                {data.suggestedFood}
                                            </Text>
                                        </View>
                                    )}
                                </View>
                            )}

                            {/* Buttons */}
                            <View style={styles.buttonContainer}>
                                {data.type === 'error' ? (
                                    <>
                                        <TouchableOpacity
                                            style={[styles.modalButton, styles.secondaryButton]}
                                            onPress={onCancel}
                                        >
                                            <Text style={styles.secondaryButtonText}>Cancel</Text>
                                        </TouchableOpacity>
                                        <TouchableOpacity
                                            style={[styles.modalButton, styles.primaryButton]}
                                            onPress={onRetake}
                                        >
                                            <Text style={styles.primaryButtonText}>Retry</Text>
                                        </TouchableOpacity>
                                    </>
                                ) : (
                                    <>
                                        <TouchableOpacity
                                            style={[styles.modalButton, styles.secondaryButton]}
                                            onPress={onCancel}
                                        >
                                            <Text style={styles.secondaryButtonText}>Cancel</Text>
                                        </TouchableOpacity>
                                        <TouchableOpacity
                                            style={[styles.modalButton, styles.secondaryButton]}
                                            onPress={onRetake}
                                        >
                                            <Text style={styles.secondaryButtonText}>Retake</Text>
                                        </TouchableOpacity>
                                        {data.suggestedFood && (
                                            <TouchableOpacity
                                                style={[styles.modalButton, styles.accentButton]}
                                                onPress={() => onUseSuggested(data.suggestedFood)}
                                            >
                                                <Text style={styles.primaryButtonText}>Use Suggested</Text>
                                            </TouchableOpacity>
                                        )}
                                        <TouchableOpacity
                                            style={[styles.modalButton, styles.primaryButton]}
                                            onPress={onProceed}
                                        >
                                            <Text style={styles.primaryButtonText}>
                                                {data.type === 'low_confidence'
                                                    ? 'Use Original'
                                                    : 'Set Amount'}
                                            </Text>
                                        </TouchableOpacity>
                                    </>
                                )}
                            </View>
                        </ScrollView>
                    </LinearGradient>
                </View>
            </View>
        </Modal>
    );
};

const CameraScanModal = ({
                             visible,
                             foodName,
                             foodDescription,
                             selectedMeal,
                             onClose,
                             onSuccess,
                         }) => {
    const [permission, requestPermission] = useCameraPermissions();
    const [facing, setFacing] = useState('back');
    const [flash, setFlash] = useState('off');
    const [capturedImage, setCapturedImage] = useState(null);
    const [analyzing, setAnalyzing] = useState(false);
    const [predictionResult, setPredictionResult] = useState(null);
    const [showConfirmModal, setShowConfirmModal] = useState(false);
    const [confirmationData, setConfirmationData] = useState(null);
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
            showConfirmationDialog(data, imageUri);

        } catch (error) {
            setAnalyzing(false);
            console.error('Error analyzing food:', error);

            // Show error in custom modal
            setConfirmationData({
                type: 'error',
                imageUri: imageUri,
            });
            setShowConfirmModal(true);
        }
    };

    const showConfirmationDialog = (data, imageUri) => {
        const { result, confidence, suggested_food } = data;
        const confidencePercent = (confidence * 100).toFixed(1);

        setConfirmationData({
            type: confidence < 0.20 ? 'low_confidence' : 'success',
            data: data,
            imageUri: imageUri,
            detectedName: result.name,
            detectedDescription: result.description,
            confidencePercent: confidencePercent,
            suggestedFood: suggested_food,
            confidence: confidence,
        });
        setShowConfirmModal(true);
    };

    const proceedToAmountModal = (overrideName = null) => {
        const finalFoodName = overrideName || foodName;

        if (onSuccess) {
            onSuccess({
                foodName: finalFoodName,
                imageUri: confirmationData.imageUri,
                predictionData: confirmationData.data,
                userProvidedDescription: foodDescription,
                mealType: selectedMeal
            });
        }

        resetFlow();
    };

    const resetFlow = () => {
        setCapturedImage(null);
        setPredictionResult(null);
        setAnalyzing(false);
        setShowConfirmModal(false);
        setConfirmationData(null);
        onClose();
    };

    const retakePhoto = () => {
        setCapturedImage(null);
        setAnalyzing(false);
        setPredictionResult(null);
        setShowConfirmModal(false);
        setConfirmationData(null);
    };

    const handleRetryError = () => {
        setShowConfirmModal(false);
        if (confirmationData?.imageUri) {
            analyzeFoodImage(confirmationData.imageUri);
        }
    };

    const toggleFlash = () => {
        setFlash(flash === 'off' ? 'on' : 'off');
    };

    const toggleCameraFacing = () => {
        setFacing(facing === 'back' ? 'front' : 'back');
    };

    return (
        <>
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
                            <>
                                <CameraView
                                    ref={cameraRef}
                                    style={styles.camera}
                                    facing={facing}
                                    flash={flash}
                                />
                                <View style={styles.cameraOverlay}>
                                    <View style={styles.scanFrame}>
                                        <View style={[styles.scanCorner, styles.scanCornerTL]} />
                                        <View style={[styles.scanCorner, styles.scanCornerTR]} />
                                        <View style={[styles.scanCorner, styles.scanCornerBL]} />
                                        <View style={[styles.scanCorner, styles.scanCornerBR]} />
                                    </View>
                                    <Text style={styles.scanHint}>Center {foodName} in the frame</Text>
                                </View>
                            </>
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

            {/* Confirmation Modal - Rendered separately */}
            <ConfirmationModal
                visible={showConfirmModal}
                data={confirmationData}
                foodName={foodName}
                onCancel={resetFlow}
                onRetake={confirmationData?.type === 'error' ? handleRetryError : retakePhoto}
                onUseSuggested={proceedToAmountModal}
                onProceed={() => proceedToAmountModal()}
            />
        </>
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
        ...StyleSheet.absoluteFillObject,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: 'rgba(0,0,0,0.1)',
        pointerEvents: 'none',
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
    // Custom Confirmation Modal Styles
    confirmModalOverlay: {
        flex: 1,
        backgroundColor: 'rgba(0, 0, 0, 0.9)',
        justifyContent: 'center',
        alignItems: 'center',
        padding: 20,
    },
    confirmModalContainer: {
        width: '100%',
        maxWidth: 400,
        borderRadius: 24,
        overflow: 'hidden',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 10 },
        shadowOpacity: 0.5,
        shadowRadius: 20,
        elevation: 999,
    },
    gradientBackground: {
        width: '100%',
    },
    confirmModalContent: {
        padding: 28,
        alignItems: 'center',
    },
    iconContainer: {
        marginBottom: 20,
    },
    confirmTitle: {
        fontSize: 24,
        fontWeight: '700',
        color: '#fff',
        textAlign: 'center',
        marginBottom: 16,
        textShadowColor: 'rgba(0, 0, 0, 0.3)',
        textShadowOffset: { width: 0, height: 2 },
        textShadowRadius: 4,
    },
    confirmMessage: {
        fontSize: 16,
        color: '#fff',
        textAlign: 'center',
        marginBottom: 24,
        lineHeight: 24,
        opacity: 0.95,
    },
    detailsContainer: {
        width: '100%',
        marginBottom: 20,
    },
    warningBadge: {
        backgroundColor: 'rgba(255, 215, 0, 0.2)',
        borderRadius: 12,
        padding: 12,
        marginBottom: 16,
        borderWidth: 1,
        borderColor: 'rgba(255, 215, 0, 0.4)',
    },
    warningText: {
        color: '#fff',
        fontSize: 14,
        textAlign: 'center',
        fontWeight: '500',
    },
    infoRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingVertical: 10,
        borderBottomWidth: 1,
        borderBottomColor: 'rgba(255, 255, 255, 0.2)',
    },
    infoLabel: {
        fontSize: 14,
        color: '#fff',
        fontWeight: '600',
        opacity: 0.8,
    },
    infoValue: {
        fontSize: 14,
        color: '#fff',
        fontWeight: '500',
        maxWidth: '60%',
        textAlign: 'right',
    },
    descriptionBox: {
        backgroundColor: 'rgba(255, 255, 255, 0.15)',
        borderRadius: 12,
        padding: 12,
        marginTop: 12,
        marginBottom: 16,
    },
    descriptionText: {
        color: '#fff',
        fontSize: 14,
        lineHeight: 20,
        opacity: 0.9,
    },
    confidenceContainer: {
        marginVertical: 16,
    },
    confidenceLabel: {
        fontSize: 14,
        color: '#fff',
        fontWeight: '600',
        marginBottom: 8,
        opacity: 0.9,
    },
    confidenceBar: {
        height: 8,
        backgroundColor: 'rgba(255, 255, 255, 0.2)',
        borderRadius: 4,
        overflow: 'hidden',
        marginBottom: 6,
    },
    confidenceFill: {
        height: '100%',
        borderRadius: 4,
    },
    confidencePercent: {
        fontSize: 18,
        color: '#fff',
        fontWeight: '700',
        textAlign: 'center',
    },
    suggestionBox: {
        backgroundColor: 'rgba(255, 255, 255, 0.15)',
        borderRadius: 12,
        padding: 14,
        marginTop: 12,
        borderWidth: 1,
        borderColor: 'rgba(255, 255, 255, 0.3)',
    },
    suggestionLabel: {
        fontSize: 13,
        color: '#fff',
        opacity: 0.8,
        marginBottom: 4,
    },
    suggestionText: {
        fontSize: 16,
        color: '#fff',
        fontWeight: '600',
    },
    buttonContainer: {
        width: '100%',
        gap: 12,
        marginTop: 8,
    },
    modalButton: {
        paddingVertical: 14,
        borderRadius: 12,
        alignItems: 'center',
        justifyContent: 'center',
    },
    primaryButton: {
        backgroundColor: '#fff',
    },
    primaryButtonText: {
        color: '#06B6D4',
        fontSize: 16,
        fontWeight: '700',
    },
    secondaryButton: {
        backgroundColor: 'rgba(255, 255, 255, 0.2)',
        borderWidth: 1,
        borderColor: 'rgba(255, 255, 255, 0.4)',
    },
    secondaryButtonText: {
        color: '#fff',
        fontSize: 16,
        fontWeight: '600',
    },
    accentButton: {
        backgroundColor: 'rgba(255, 215, 0, 0.3)',
        borderWidth: 1,
        borderColor: 'rgba(255, 215, 0, 0.6)',
    },
});

export default CameraScanModal;