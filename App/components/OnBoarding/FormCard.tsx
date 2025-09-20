import React from 'react';
import { View, StyleSheet } from 'react-native';

interface FormCardProps {
    children: React.ReactNode;
}

export const FormCard: React.FC<FormCardProps> = ({ children }) => {
    return (
        <View style={styles.formCard}>
            {children}
        </View>
    );
};

const styles = StyleSheet.create({
    formCard: {
        backgroundColor: 'rgba(255, 255, 255, 0.95)',
        borderRadius: 32,
        minHeight: 500,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 10 },
        shadowOpacity: 0.1,
        shadowRadius: 20,
        elevation: 10,
        overflow: 'hidden',
    },
});