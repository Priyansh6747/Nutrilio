import { View, Text, Image, TouchableOpacity, StyleSheet } from 'react-native';
import React from 'react';

const ProfileCard = ({ Name, IMG, Gender, clg, identifier, connections = 234, posts = 56 }) => {
    return (
        <View style={styles.container}>
            <View style={styles.imageContainer}>
                <Image
                    source={{ uri: IMG }}
                    style={styles.profileImage}
                    resizeMode="cover"
                />
            </View>

            <Text style={styles.name}>{Name}</Text>
            <Text style={styles.identifier}>@{identifier}</Text>
            <Text style={styles.college}>{clg}</Text>
            <Text style={styles.additionalInfo}>
                Computer Science Major • Photography enthusiast • Coffee lover ☕
            </Text>
            <View style={styles.statsContainer}>
                <Text style={styles.stats}>
                    {connections} connections    {posts} posts
                </Text>
            </View>

            {/* Connect Button */}
            <TouchableOpacity style={styles.connectButton}>
                <Text style={styles.connectButtonText}>Connect</Text>
            </TouchableOpacity>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        backgroundColor: 'white',
        borderRadius: 8,
        padding: 16,
        alignItems: 'center',
        shadowColor: '#000',
        shadowOffset: {
            width: 0,
            height: 1,
        },
        shadowOpacity: 0.08,
        shadowRadius: 4,
        elevation: 2,
        margin: 12,
        flex: 1,
        minWidth: 280,
        maxWidth: '100%',
    },
    imageContainer: {
        width: 70,
        height: 70,
        borderRadius: 35,
        overflow: 'hidden',
        marginBottom: 10,
        borderWidth: 2,
        borderColor: '#e0e6ed',
    },
    profileImage: {
        width: '100%',
        height: '100%',
    },
    name: {
        fontSize: 18,
        fontWeight: '600',
        color: '#1a1a1a',
        marginBottom: 3,
        textAlign: 'center',
    },
    identifier: {
        fontSize: 13,
        color: '#ff6b35',
        marginBottom: 6,
        fontWeight: '500',
    },
    college: {
        fontSize: 13,
        color: '#666',
        marginBottom: 6,
        textAlign: 'center',
        paddingHorizontal: 8,
    },
    additionalInfo: {
        fontSize: 11,
        color: '#888',
        textAlign: 'center',
        lineHeight: 16,
        marginBottom: 12,
        paddingHorizontal: 4,
    },
    statsContainer: {
        marginBottom: 16,
    },
    stats: {
        fontSize: 11,
        color: '#888',
        textAlign: 'center',
    },
    connectButton: {
        backgroundColor: '#ff6b35',
        paddingVertical: 10,
        paddingHorizontal: 32,
        borderRadius: 20,
        width: '90%',
        minHeight: 44,
        justifyContent: 'center',
    },
    connectButtonText: {
        color: 'white',
        fontSize: 15,
        fontWeight: '600',
        textAlign: 'center',
    },
});

export default ProfileCard;