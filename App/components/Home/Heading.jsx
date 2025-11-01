import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';

const Heading = ({
                     title = "Nutrillio",
                     subtitle = "Track your nutrients with precision",
                     onActionPress,
                     actionIcon,
                     theme = "blue" // "blue" or "green"
                 }) => {
    const themeColor = theme === "blue" ? "#00c4ff" : "#38914a";

    return (
        <View style={styles.container}>
            <View style={styles.textBlock}>
                <Text style={[styles.title, { color: themeColor }]}>
                    {title}
                </Text>
                <Text style={styles.subtitle}>
                    {subtitle}
                </Text>
            </View>

            {actionIcon && onActionPress && (
                <TouchableOpacity
                    onPress={onActionPress}
                    style={styles.actionButton}
                    activeOpacity={0.7}
                >
                    {actionIcon}
                </TouchableOpacity>
            )}
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingHorizontal: 20,
        paddingVertical: 16,
        backgroundColor: 'rgba(255,255,255,0.12)',
    },
    textBlock: {
        flex: 1,
    },
    title: {
        fontFamily: 'Poppins-SemiBold',
        fontSize: 22,
        marginBottom: 4,
    },
    subtitle: {
        fontFamily: 'Poppins-Regular',
        fontSize: 14,
        color: '#666',
        lineHeight: 20,
    },
    actionButton: {
        padding: 8,
        marginLeft: 12,
    },
});

export default Heading;