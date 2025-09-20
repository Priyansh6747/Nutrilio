import React from 'react';
import { View, Text, Pressable, StyleSheet } from 'react-native';
import Animated, { FadeIn } from 'react-native-reanimated';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { GenderOption } from './types';

interface GenderSelectorProps {
    selectedGender: string;
    onGenderSelect: (gender: 'male' | 'female' | 'other') => void;
    error?: string;
}

const GENDER_OPTIONS: GenderOption[] = [
    { value: 'male', icon: 'gender-male', label: 'Male' },
    { value: 'female', icon: 'gender-female', label: 'Female' },
    { value: 'other', icon: 'gender-non-binary', label: 'Other' },
];

export const GenderSelector: React.FC<GenderSelectorProps> = ({
                                                                  selectedGender,
                                                                  onGenderSelect,
                                                                  error,
                                                              }) => {
    return (
        <View style={styles.fieldContainer}>
            <View style={styles.fieldHeader}>
                <Text style={styles.fieldLabel}>Gender</Text>
                <Text style={styles.fieldHint}>How do you identify?</Text>
            </View>
            <View style={styles.genderGrid}>
                {GENDER_OPTIONS.map((option) => (
                    <Pressable
                        key={option.value}
                        onPress={() => onGenderSelect(option.value)}
                        style={({ pressed }) => [
                            styles.genderOption,
                            selectedGender === option.value && styles.genderOptionActive,
                            pressed && styles.genderOptionPressed,
                        ]}
                    >
                        <MaterialCommunityIcons
                            name={option.icon as any}
                            size={32}
                            color={selectedGender === option.value ? '#fff' : '#3b82f6'}
                        />
                        <Text style={[
                            styles.genderLabel,
                            selectedGender === option.value && styles.genderLabelActive
                        ]}>
                            {option.label}
                        </Text>
                    </Pressable>
                ))}
            </View>
            {error && (
                <Animated.Text entering={FadeIn} style={styles.errorText}>
                    {error}
                </Animated.Text>
            )}
        </View>
    );
};

const styles = StyleSheet.create({
    fieldContainer: {
        marginBottom: 24,
    },
    fieldHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 10,
    },
    fieldLabel: {
        fontSize: 15,
        fontWeight: '600',
        color: '#000',
    },
    fieldHint: {
        fontSize: 12,
        color: '#9CA3AF',
    },
    genderGrid: {
        flexDirection: 'row',
        gap: 12,
    },
    genderOption: {
        flex: 1,
        backgroundColor: '#fff',
        borderRadius: 16,
        paddingVertical: 20,
        alignItems: 'center',
        borderWidth: 2,
        borderColor: 'transparent',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.05,
        shadowRadius: 4,
        elevation: 2,
    },
    genderOptionActive: {
        backgroundColor: '#3b82f6',
        borderColor: '#3b82f6',
    },
    genderOptionPressed: {
        transform: [{ scale: 0.98 }],
    },
    genderLabel: {
        fontSize: 13,
        fontWeight: '600',
        color: '#6B7280',
        marginTop: 8,
    },
    genderLabelActive: {
        color: '#fff',
    },
    errorText: {
        fontSize: 12,
        color: '#EF4444',
        marginTop: 6,
        marginLeft: 4,
    },
});