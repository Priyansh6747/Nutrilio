import React, { useState, useEffect } from 'react';
import {
    View,
    Text,
    StyleSheet,
    Modal,
    TouchableOpacity,
    Alert,
    Dimensions,
} from 'react-native';
import { CameraView, useCameraPermissions } from 'expo-camera';
import { Ionicons } from '@expo/vector-icons';
import ServerConfig from "../../utils/Config";

const { width, height } = Dimensions.get('window');

const BarcodeScanModal = ({ visible, onClose, onBarcodeScanned }) => {
    const [permission, requestPermission] = useCameraPermissions();
    const [scanned, setScanned] = useState(false);

    useEffect(() => {
        if (visible) {
            setScanned(false);
            if (!permission?.granted) {
                requestPermission();
            }
        }
    }, [visible]);

    const handleBarCodeScanned = async ({ type, data }) => {
        if (scanned) return;

        setScanned(true);

        try {
            const URL = ServerConfig.BaseURL + `/api/v1/log/barcode/read/${data}`;
            const response = await fetch(URL);
            const res = await response.json();

            // Console log the barcode information
            console.log('Barcode Scanned:');
            console.log('Type:', type);
            console.log('Data:', data);
            console.log('Product Response:', res);

            // Extract product information
            const productName = res?.product?.product_name || 'Unknown Product';
            const brandName = res?.product?.brands || 'Unknown Brand';

            // Show alert with product info
            Alert.alert(
                'Product Found',
                `${productName}\n${brandName}\n\nBarcode: ${data}`,
                [
                    {
                        text: 'Scan Again',
                        onPress: () => setScanned(false),
                        style: 'cancel',
                    },
                    {
                        text: 'Use This',
                        onPress: () => {
                            if (onBarcodeScanned) {
                                onBarcodeScanned({ type, data, product: res?.product });
                            }
                            onClose();
                        },
                    },
                ]
            );
        } catch (error) {
            console.error('Error fetching product data:', error);

            // Show alert with barcode info if API fails
            Alert.alert(
                'Barcode Detected',
                `Could not fetch product details.\n\nBarcode: ${data}`,
                [
                    {
                        text: 'Scan Again',
                        onPress: () => setScanned(false),
                        style: 'cancel',
                    },
                    {
                        text: 'Use This',
                        onPress: () => {
                            if (onBarcodeScanned) {
                                onBarcodeScanned({ type, data });
                            }
                            onClose();
                        },
                    },
                ]
            );
        }
    };

    if (!permission) {
        return (
            <Modal
                animationType="slide"
                transparent={false}
                visible={visible}
                onRequestClose={onClose}
            >
                <View style={styles.permissionContainer}>
                    <Ionicons name="camera-outline" size={64} color="#999" />
                    <Text style={styles.permissionText}>Requesting camera permission...</Text>
                </View>
            </Modal>
        );
    }

    if (!permission.granted) {
        return (
            <Modal
                animationType="slide"
                transparent={false}
                visible={visible}
                onRequestClose={onClose}
            >
                <View style={styles.permissionContainer}>
                    <Ionicons name="camera-off-outline" size={64} color="#FF5252" />
                    <Text style={styles.permissionTitle}>Camera Access Denied</Text>
                    <Text style={styles.permissionDescription}>
                        Please enable camera permissions in your settings to scan barcodes
                    </Text>
                    <TouchableOpacity
                        style={styles.permissionButton}
                        onPress={requestPermission}
                        activeOpacity={0.7}
                    >
                        <Text style={styles.permissionButtonText}>Grant Permission</Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                        style={styles.closeButton}
                        onPress={onClose}
                        activeOpacity={0.7}
                    >
                        <Text style={styles.closeButtonText}>Close</Text>
                    </TouchableOpacity>
                </View>
            </Modal>
        );
    }

    return (
        <Modal
            animationType="slide"
            transparent={false}
            visible={visible}
            onRequestClose={onClose}
        >
            <View style={styles.container}>
                {/* Header */}
                <View style={styles.header}>
                    <TouchableOpacity
                        style={styles.closeIconButton}
                        onPress={onClose}
                        activeOpacity={0.7}
                    >
                        <Ionicons name="close" size={28} color="#fff" />
                    </TouchableOpacity>
                    <Text style={styles.headerTitle}>Scan Barcode</Text>
                    <View style={styles.placeholder} />
                </View>

                {/* Camera Scanner */}
                <View style={styles.scannerContainer}>
                    <CameraView
                        style={StyleSheet.absoluteFillObject}
                        facing="back"
                        onBarcodeScanned={scanned ? undefined : handleBarCodeScanned}
                        barcodeScannerSettings={{
                            barcodeTypes: [
                                'qr',
                                'ean13',
                                'ean8',
                                'upc_a',
                                'upc_e',
                                'code128',
                                'code39',
                                'code93',
                                'codabar',
                                'itf14',
                            ],
                        }}
                    />

                    {/* Scan Frame Overlay */}
                    <View style={styles.overlay}>
                        {/* Top overlay */}
                        <View style={styles.overlayTop} />

                        {/* Middle row with sides and scan area */}
                        <View style={styles.overlayMiddle}>
                            <View style={styles.overlaySide} />

                            {/* Scan Frame */}
                            <View style={styles.scanFrame}>
                                {/* Corner markers */}
                                <View style={[styles.corner, styles.topLeft]} />
                                <View style={[styles.corner, styles.topRight]} />
                                <View style={[styles.corner, styles.bottomLeft]} />
                                <View style={[styles.corner, styles.bottomRight]} />

                                {/* Scanning animation line */}
                                {!scanned && (
                                    <View style={styles.scanLineContainer}>
                                        <View style={styles.scanLine} />
                                    </View>
                                )}
                            </View>

                            <View style={styles.overlaySide} />
                        </View>

                        {/* Bottom overlay */}
                        <View style={styles.overlayBottom}>
                            <View style={styles.instructionContainer}>
                                <Ionicons name="scan" size={32} color="#4CAF50" />
                                <Text style={styles.instructionText}>
                                    Position barcode within the frame
                                </Text>
                                <Text style={styles.instructionSubtext}>
                                    Scanning will happen automatically
                                </Text>
                            </View>
                        </View>
                    </View>
                </View>

                {/* Rescan Button (shown after scan) */}
                {scanned && (
                    <View style={styles.rescanContainer}>
                        <TouchableOpacity
                            style={styles.rescanButton}
                            onPress={() => setScanned(false)}
                            activeOpacity={0.7}
                        >
                            <Ionicons name="refresh" size={24} color="#fff" />
                            <Text style={styles.rescanText}>Scan Again</Text>
                        </TouchableOpacity>
                    </View>
                )}
            </View>
        </Modal>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#000',
    },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingTop: 60,
        paddingBottom: 20,
        paddingHorizontal: 20,
        backgroundColor: 'rgba(0, 0, 0, 0.8)',
        zIndex: 10,
    },
    closeIconButton: {
        width: 44,
        height: 44,
        borderRadius: 22,
        backgroundColor: 'rgba(255, 255, 255, 0.2)',
        justifyContent: 'center',
        alignItems: 'center',
    },
    headerTitle: {
        fontSize: 20,
        fontWeight: '700',
        color: '#fff',
        letterSpacing: 0.3,
    },
    placeholder: {
        width: 44,
    },
    scannerContainer: {
        flex: 1,
        position: 'relative',
    },
    overlay: {
        ...StyleSheet.absoluteFillObject,
        justifyContent: 'space-between',
    },
    overlayTop: {
        flex: 1,
        backgroundColor: 'rgba(0, 0, 0, 0.6)',
    },
    overlayMiddle: {
        flexDirection: 'row',
    },
    overlaySide: {
        flex: 1,
        backgroundColor: 'rgba(0, 0, 0, 0.6)',
    },
    scanFrame: {
        width: width * 0.7,
        height: width * 0.5,
        position: 'relative',
    },
    corner: {
        position: 'absolute',
        width: 30,
        height: 30,
        borderColor: '#4CAF50',
    },
    topLeft: {
        top: 0,
        left: 0,
        borderTopWidth: 4,
        borderLeftWidth: 4,
        borderTopLeftRadius: 8,
    },
    topRight: {
        top: 0,
        right: 0,
        borderTopWidth: 4,
        borderRightWidth: 4,
        borderTopRightRadius: 8,
    },
    bottomLeft: {
        bottom: 0,
        left: 0,
        borderBottomWidth: 4,
        borderLeftWidth: 4,
        borderBottomLeftRadius: 8,
    },
    bottomRight: {
        bottom: 0,
        right: 0,
        borderBottomWidth: 4,
        borderRightWidth: 4,
        borderBottomRightRadius: 8,
    },
    scanLineContainer: {
        position: 'absolute',
        top: '50%',
        left: 0,
        right: 0,
        height: 2,
    },
    scanLine: {
        height: 2,
        backgroundColor: '#4CAF50',
        shadowColor: '#4CAF50',
        shadowOffset: {
            width: 0,
            height: 0,
        },
        shadowOpacity: 0.8,
        shadowRadius: 8,
        elevation: 5,
    },
    overlayBottom: {
        flex: 1,
        backgroundColor: 'rgba(0, 0, 0, 0.6)',
        justifyContent: 'center',
        alignItems: 'center',
    },
    instructionContainer: {
        alignItems: 'center',
        paddingHorizontal: 40,
    },
    instructionText: {
        fontSize: 16,
        fontWeight: '600',
        color: '#fff',
        textAlign: 'center',
        marginTop: 16,
        letterSpacing: 0.3,
    },
    instructionSubtext: {
        fontSize: 14,
        color: 'rgba(255, 255, 255, 0.7)',
        textAlign: 'center',
        marginTop: 8,
    },
    rescanContainer: {
        position: 'absolute',
        bottom: 40,
        left: 0,
        right: 0,
        alignItems: 'center',
        zIndex: 10,
    },
    rescanButton: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#4CAF50',
        paddingHorizontal: 32,
        paddingVertical: 16,
        borderRadius: 30,
        gap: 10,
        shadowColor: '#000',
        shadowOffset: {
            width: 0,
            height: 4,
        },
        shadowOpacity: 0.3,
        shadowRadius: 8,
        elevation: 8,
    },
    rescanText: {
        fontSize: 16,
        fontWeight: '700',
        color: '#fff',
        letterSpacing: 0.3,
    },
    permissionContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: '#F8F9FA',
        paddingHorizontal: 40,
    },
    permissionTitle: {
        fontSize: 22,
        fontWeight: '700',
        color: '#1A1A1A',
        marginTop: 20,
        marginBottom: 12,
        textAlign: 'center',
        letterSpacing: 0.3,
    },
    permissionText: {
        fontSize: 16,
        color: '#666',
        marginTop: 16,
        textAlign: 'center',
    },
    permissionDescription: {
        fontSize: 15,
        color: '#666',
        textAlign: 'center',
        lineHeight: 22,
    },
    permissionButton: {
        marginTop: 24,
        backgroundColor: '#4CAF50',
        paddingHorizontal: 40,
        paddingVertical: 16,
        borderRadius: 30,
    },
    permissionButtonText: {
        fontSize: 16,
        fontWeight: '700',
        color: '#fff',
        letterSpacing: 0.3,
    },
    closeButton: {
        marginTop: 16,
        paddingHorizontal: 40,
        paddingVertical: 16,
    },
    closeButtonText: {
        fontSize: 16,
        fontWeight: '600',
        color: '#666',
        letterSpacing: 0.3,
    },
});

export default BarcodeScanModal;