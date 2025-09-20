import { View, Alert, ScrollView, Text, Image, TouchableOpacity, Animated, ActivityIndicator } from 'react-native';
import React, { useState, useRef, useEffect } from 'react';
import { LinearGradient } from 'expo-linear-gradient';
import { getAuth, updateProfile } from "firebase/auth";
import * as Updates from 'expo-updates';
import ServerConfig from '../utils/Config';
import OnBoardingOpener from "../Components/OnBoarding/OnBoardingOpener";
import ProgressBar from '../Components/OnBoarding/ProgressBar';
import { BasicInfoStep, HeightWeightStep } from '../Components/OnBoarding/OnBoardingSteps';
import { styles } from '../Components/OnBoarding/Styles';

// 2-step onboarding:
// 1st step: displayname, age, gender
// 2nd step (optional): height, weight

// Main Onboarding Component
const Onboarding = () => {
    const [displayName, setDisplayName] = useState('');
    const [age, setAge] = useState('');
    const [gender, setGender] = useState('Male');
    const [height, setHeight] = useState('');
    const [weight, setWeight] = useState('');
    const [loading, setLoading] = useState(false);
    const [initialScreen, setInitialScreen] = useState(true);
    const [currentStep, setCurrentStep] = useState(1);

    const auth = getAuth();
    const user = auth.currentUser;
    const totalSteps = 2;

    const handleUserInit = async () => {
        try {
            const user = getAuth().currentUser;

            if (!user) {
                throw new Error('No authenticated user found');
            }

            // Create JSON payload matching your API structure
            const requestBody = {
                username: user.uid, // Using Firebase UID as username
                nickname: displayName.trim(), // Using display name as nickname
                age: parseInt(age),
                gender: gender.toLowerCase(),
            };

            // Add optional fields only if they have values
            if (height && height.trim()) {
                requestBody.height = parseFloat(height);
            }
            if (weight && weight.trim()) {
                requestBody.weight = parseFloat(weight);
            }

            console.log('Request body:', requestBody);

            const URL = 'http://192.168.0.113:8000/api/v1/user/init';
            const response = await fetch(URL, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(requestBody),
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.error || errorData.message || 'Failed to initialize user');
            }

            const responseData = await response.json();
            console.log('User initialized successfully:', responseData);
            return responseData;
        } catch (error) {
            console.error('Error initializing user:', error);
            throw error;
        }
    };

    const handleComplete = async () => {
        console.log('Completed user:');
        if (!user) {
            Alert.alert('Error', 'No authenticated user found');
            return;
        }

        if (!displayName.trim()) {
            Alert.alert('Error', 'Please enter your display name');
            return;
        }

        if (!age) {
            Alert.alert('Error', 'Please enter your age');
            return;
        }

        setLoading(true);

        try {
            await handleUserInit();
            await updateProfile(user, {
                displayName: displayName.trim()
            });

            console.log("Profile updated successfully!");
            Alert.alert('Success', 'Profile setup completed successfully!', [
                {
                    text: 'OK',
                    onPress: () => {
                        Updates.reloadAsync();
                    }
                }
            ]);
        } catch (error) {
            console.error("Error updating profile:", error);
            Alert.alert('Error', error.message || 'Failed to complete profile setup');
        } finally {
            setLoading(false);
        }
    };

    if (initialScreen) {
        return <OnBoardingOpener onStart={() => setInitialScreen(false)} />;
    }

    const renderCurrentStep = () => {
        switch (currentStep) {
            case 1:
                return (
                    <BasicInfoStep
                        displayName={displayName}
                        setDisplayName={setDisplayName}
                        age={age}
                        setAge={setAge}
                        gender={gender}
                        setGender={setGender}
                        onNext={() => setCurrentStep(2)}
                    />
                );
            case 2:
                return (
                    <HeightWeightStep
                        height={height}
                        setHeight={setHeight}
                        weight={weight}
                        setWeight={setWeight}
                        onComplete={handleComplete}
                        onBack={() => setCurrentStep(1)}
                        loading={loading}
                    />
                );
            default:
                return null;
        }
    };

    return (
        <View style={styles.wrapper}>
            <ScrollView
                contentContainerStyle={styles.container}
                showsVerticalScrollIndicator={false}
            >
                <ProgressBar currentStep={currentStep} totalSteps={totalSteps} />
                {renderCurrentStep()}
            </ScrollView>
        </View>
    );
};

export default Onboarding;