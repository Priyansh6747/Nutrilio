import { StyleSheet } from 'react-native';

export const styles = StyleSheet.create({
    wrapper: {
        flex: 1,
        backgroundColor: '#F8F9FA',
    },
    container: {
        flexGrow: 1,
        paddingHorizontal: 24,
        paddingTop: 60,
        paddingBottom: 40,
    },
    // Progress Bar Styles
    progressContainer: {
        marginBottom: 40,
        alignItems: 'center',
    },
    progressBar: {
        width: '100%',
        height: 6,
        backgroundColor: '#E5E5E5',
        borderRadius: 3,
        overflow: 'hidden',
        marginBottom: 12,
    },
    progressFill: {
        height: '100%',
        borderRadius: 3,
    },
    progressGradient: {
        flex: 1,
        borderRadius: 3,
    },
    progressText: {
        fontSize: 14,
        color: '#6B6B6B',
        fontWeight: '500',
    },
    // Step Container
    stepContainer: {
        flex: 1,
    },
    stepHeader: {
        marginBottom: 40,
        alignItems: 'center',
    },
    stepTitle: {
        fontSize: 28,
        fontWeight: '700',
        color: '#1A1A1A',
        marginBottom: 12,
        textAlign: 'center',
        letterSpacing: -0.5,
    },
    stepSubtitle: {
        fontSize: 16,
        color: '#6B6B6B',
        textAlign: 'center',
        lineHeight: 24,
        maxWidth: 280,
    },
    // Input Section
    inputSection: {
        marginBottom: 32,
    },
    label: {
        fontSize: 16,
        fontWeight: '600',
        color: '#1A1A1A',
        marginBottom: 8,
        letterSpacing: -0.2,
    },
    sublabel: {
        fontSize: 14,
        color: '#6B6B6B',
        marginBottom: 16,
        lineHeight: 20,
    },
    inputWrapper: {
        backgroundColor: '#FFFFFF',
        borderRadius: 16,
        shadowColor: '#000',
        shadowOffset: {
            width: 0,
            height: 1,
        },
        shadowOpacity: 0.1,
        shadowRadius: 2,
        elevation: 2,
    },
    input: {
        height: 56,
        paddingHorizontal: 20,
        fontSize: 16,
        color: '#1A1A1A',
        backgroundColor: 'transparent',
        borderRadius: 16,
    },
    // Gender Options
    optionsGrid: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: 12,
    },
    optionButton: {
        paddingHorizontal: 20,
        paddingVertical: 12,
        borderRadius: 24,
        backgroundColor: '#FFFFFF',
        minWidth: 80,
        alignItems: 'center',
        shadowColor: '#000',
        shadowOffset: {
            width: 0,
            height: 1,
        },
        shadowOpacity: 0.05,
        shadowRadius: 1,
        elevation: 1,
    },
    optionButtonSelected: {
        backgroundColor: 'transparent',
        shadowOpacity: 0.15,
    },
    selectedOptionGradient: {
        paddingHorizontal: 20,
        paddingVertical: 12,
        borderRadius: 24,
        justifyContent: 'center',
        alignItems: 'center',
        minWidth: 80,
    },
    optionText: {
        fontSize: 14,
        color: '#1A1A1A',
        fontWeight: '500',
    },
    optionTextSelected: {
        color: '#FFFFFF',
        fontWeight: '600',
        fontSize: 14,
    },
    // Info Box for Step 2
    infoBox: {
        backgroundColor: '#F0FDF4',
        borderRadius: 16,
        padding: 20,
        marginBottom: 32,
        borderWidth: 1,
        borderColor: '#BBF7D0',
    },
    infoText: {
        fontSize: 14,
        color: '#059669',
        lineHeight: 20,
        textAlign: 'center',
    },
    // Buttons
    nextButton: {
        borderRadius: 16,
        overflow: 'hidden',
        shadowColor: '#10B981',
        shadowOffset: {
            width: 0,
            height: 4,
        },
        shadowOpacity: 0.3,
        shadowRadius: 8,
        elevation: 8,
    },
    nextButtonGradient: {
        height: 54,
        justifyContent: 'center',
        alignItems: 'center',
        borderRadius: 16,
        paddingHorizontal: 32,
    },
    nextButtonText: {
        color: '#FFFFFF',
        fontSize: 16,
        fontWeight: '600',
        letterSpacing: -0.2,
    },
    backButton: {
        paddingVertical: 16,
        paddingHorizontal: 24,
        borderRadius: 16,
        backgroundColor: '#FFFFFF',
        alignItems: 'center',
        justifyContent: 'center',
        minWidth: 100,
        shadowColor: '#000',
        shadowOffset: {
            width: 0,
            height: 1,
        },
        shadowOpacity: 0.05,
        shadowRadius: 1,
        elevation: 1,
    },
    backButtonText: {
        color: '#6B6B6B',
        fontSize: 16,
        fontWeight: '500',
    },
    buttonRow: {
        flexDirection: 'row',
        alignItems: 'center',
        marginTop: 20,
    },
    completeButtonDisabled: {
        opacity: 0.6,
        shadowOpacity: 0.1,
    },
});