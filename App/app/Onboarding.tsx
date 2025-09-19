import { useUser } from '@/hooks/authContext';
import { router } from 'expo-router';
import { updateProfile } from 'firebase/auth';
import React, { useState } from 'react';
import { Alert, StyleSheet, Text, TouchableOpacity, View } from 'react-native';

const Onboarding: React.FC = () => {
    const { user, updateUser } = useUser();
    const [isLoading, setIsLoading] = useState(false);

    const handleCompleteOnboarding = async () => {
        if (!user) {
            Alert.alert('Error', 'No user found. Please try logging in again.');
            return;
        }

        setIsLoading(true);
        
        try {
            // Update user profile with a display name if they don't have one
            if (!user.displayName) {
                await updateProfile(user, {
                    displayName: user.email?.split('@')[0] || 'User'
                });
                
                // Reload user to get updated profile
                await user.reload();
                
                // Update the auth context
                updateUser(user);
            }
            
            // Navigate to tabs after completing onboarding
            router.replace('/(tabs)');
        } catch (error) {
            console.error('Error completing onboarding:', error);
            Alert.alert('Error', 'Failed to complete onboarding. Please try again.');
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <View style={styles.container}>
            <View style={styles.content}>
                <Text style={styles.title}>Welcome to Nutrilio!</Text>
                <Text style={styles.description}>
                    Your email has been verified successfully. Let's complete your profile setup.
                </Text>
                
                <TouchableOpacity 
                    style={[styles.button, isLoading && styles.disabledButton]}
                    onPress={handleCompleteOnboarding}
                    disabled={isLoading}
                >
                    <Text style={styles.buttonText}>
                        {isLoading ? 'Setting up...' : 'Complete Setup'}
                    </Text>
                </TouchableOpacity>
            </View>
        </View>
    );
};

export default Onboarding;

const styles = StyleSheet.create({
    container: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: '#FAFAFA',
        padding: 20,
    },
    content: {
        width: '100%',
        maxWidth: 400,
        alignItems: 'center',
    },
    title: {
        fontSize: 28,
        fontWeight: '700',
        color: '#1A1A1A',
        marginBottom: 16,
        textAlign: 'center',
    },
    description: {
        fontSize: 16,
        color: '#4A4A4A',
        textAlign: 'center',
        lineHeight: 24,
        marginBottom: 32,
    },
    button: {
        backgroundColor: '#10B981',
        paddingVertical: 18,
        paddingHorizontal: 32,
        borderRadius: 16,
        minWidth: 200,
        alignItems: 'center',
    },
    disabledButton: {
        backgroundColor: '#E0E0E0',
    },
    buttonText: {
        color: 'white',
        fontSize: 16,
        fontWeight: '600',
    },
});