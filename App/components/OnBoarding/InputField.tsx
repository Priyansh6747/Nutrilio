import React from 'react';
import { View, Text, TextInput, StyleSheet, KeyboardType } from 'react-native';
import Animated, { FadeIn } from 'react-native-reanimated';
import { MaterialCommunityIcons } from '@expo/vector-icons';

interface InputFieldProps {
    label: string;
    hint: string;
    placeholder: string;
    value: string;
    onChangeText: (text: string) => void;
    error?: string;
    icon: string;
    keyboardType?: KeyboardType;
    autoCapitalize?: 'none' | 'sentences' | 'words' | 'characters';
    maxLength?: number;
}

export const InputField: React.FC<InputFieldProps> = ({
                                                          label,
                                                          hint,
                                                          placeholder,
                                                          value,
                                                          onChangeText,
                                                          error,
                                                          icon,
                                                          keyboardType = 'default',
                                                          autoCapitalize = 'none',
                                                          maxLength,
                                                      }) => {
    return (
        <View style={styles.fieldContainer}>
            <View style={styles.fieldHeader}>
                <Text style={styles.fieldLabel}>{label}</Text>
                <Text style={styles.fieldHint}>{hint}</Text>
            </View>
            <View style={[styles.inputContainer, error && styles.inputError]}>
                <TextInput
                    style={styles.input}
                    placeholder={placeholder}
                    placeholderTextColor="#C4B5A0"
                    value={value}
                    onChangeText={onChangeText}
                    keyboardType={keyboardType}
                    autoCapitalize={autoCapitalize}
                    maxLength={maxLength}
                />
                <MaterialCommunityIcons
                    name={icon as any}
                    size={24}
                    color={error ? '#EF4444' : '#f59e0b'}
                />
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
    inputContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#fff',
        borderRadius: 16,
        paddingHorizontal: 18,
        height: 56,
        borderWidth: 2,
        borderColor: 'transparent',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.05,
        shadowRadius: 4,
        elevation: 2,
    },
    inputError: {
        borderColor: '#EF4444',
    },
    input: {
        flex: 1,
        fontSize: 16,
        color: '#000',
        fontWeight: '500',
    },
    errorText: {
        fontSize: 12,
        color: '#EF4444',
        marginTop: 6,
        marginLeft: 4,
    },
});