import React from 'react';
import {
    View,
    Text,
    StyleSheet,
    ScrollView
} from 'react-native';

const InterestsSection = ({ interests }) => {
    if (!interests || interests.length === 0) {
        return null;
    }

    return (
        <View style={styles.interestsSection}>
            <Text style={styles.sectionTitle}>Interests</Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                <View style={styles.interestsContainer}>
                    {interests.map((interest, index) => (
                        <View key={index} style={styles.interestTag}>
                            <Text style={styles.interestText}>
                                {interest}
                            </Text>
                        </View>
                    ))}
                </View>
            </ScrollView>
        </View>
    );
};

const styles = StyleSheet.create({
    interestsSection: {
        backgroundColor: '#fff',
        paddingVertical: 20,
        paddingLeft: 20,
        marginTop: 8,
        borderBottomWidth: 1,
        borderBottomColor: '#f0f0f0',
    },
    sectionTitle: {
        fontSize: 18,
        fontWeight: 'bold',
        color: '#333',
        marginBottom: 15,
    },
    interestsContainer: {
        flexDirection: 'row',
        gap: 15,
        paddingRight: 20,
    },
    interestTag: {
        backgroundColor: '#ff7600',
        paddingHorizontal: 12,
        paddingVertical: 6,
        borderRadius: 15,
    },
    interestText: {
        color: '#fff',
        fontSize: 12,
        fontWeight: '500',
    },
});

export default InterestsSection;