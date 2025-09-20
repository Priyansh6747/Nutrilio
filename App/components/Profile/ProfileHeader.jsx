import React from 'react';
import {
    View,
    Text,
    StyleSheet,
    TouchableOpacity
} from 'react-native';
import { Image } from 'expo-image';

const ProfileHeader = ({ profile, onEditPress }) => {
    const totalPosts = (profile.public_post?.length || 0);

    // Cache busting with timestamp for forcing refresh
    const getImageUri = (imageUrl) => {
        if (!imageUrl) return imageUrl;
        const separator = imageUrl.includes('?') ? '&' : '?';
        return `${imageUrl}${separator}t=${Date.now()}`;
    };

    return (
        <View style={styles.header}>
            <View style={styles.topRow}>
                <Text style={styles.username}>
                    {profile.user_identifier}
                </Text>
            </View>

            <View style={styles.profileMainSection}>
                <View style={styles.profileRow}>
                    <Image
                        source={{
                            uri: getImageUri(profile.profile?.img)
                        }}
                        style={styles.profileImage}
                        cachePolicy="none"

                        // Loading placeholder
                        placeholder={require('../../assets/imgs/default-avatar.jpeg')}
                        transition={200} // Smooth transition

                        // Force re-render when image URL changes
                        key={profile.profile?.img || 'default'}
                    />
                    <View style={styles.statsContainer}>
                        <View style={styles.statItem}>
                            <Text style={styles.statNumber}>
                                {totalPosts}
                            </Text>
                            <Text style={styles.statLabel}>posts</Text>
                        </View>
                        <View style={styles.statItem}>
                            <Text style={styles.statNumber}>0</Text>
                            <Text style={styles.statLabel}>friends</Text>
                        </View>
                    </View>
                </View>

                <View style={styles.profileDetails}>
                    <Text style={styles.displayName}>
                        {profile.profile?.display_name || 'No Name'}
                    </Text>
                    {(profile.bio || profile.profile?.bio) && (
                        <Text style={styles.bio}>
                            {profile.bio || profile.profile?.bio}
                        </Text>
                    )}

                    <View style={styles.compactDetails}>
                        <Text style={styles.detailText}>{profile.email}</Text>
                        <Text style={styles.detailText}>{profile.clg}</Text>
                        {profile.profile?.gender && (
                            <Text style={styles.detailText}>{profile.profile.gender}</Text>
                        )}
                    </View>
                </View>

                <View style={styles.actionButtons}>
                    <TouchableOpacity style={styles.editButton} onPress={onEditPress}>
                        <Text style={styles.editButtonText}>Edit Profile</Text>
                    </TouchableOpacity>
                    <TouchableOpacity style={styles.shareButton}>
                        <Text style={styles.shareButtonText}>Share Profile</Text>
                    </TouchableOpacity>
                </View>
            </View>
        </View>
    );
};

const styles = StyleSheet.create({
    header: {
        backgroundColor: '#fff',
        paddingHorizontal: 20,
        paddingTop: 20,
        paddingBottom: 25,
        borderBottomWidth: 1,
        borderBottomColor: '#f0f0f0',
    },
    topRow: {
        flexDirection: 'row',
        justifyContent: 'flex-start',
        alignItems: 'center',
        marginBottom: 20,
    },
    username: {
        fontSize: 22,
        fontWeight: 'bold',
        color: '#333',
    },
    profileMainSection: {
        gap: 15,
    },
    profileRow: {
        flexDirection: 'row',
        alignItems: 'flex-start',
        gap: 20,
    },
    profileImage: {
        width: 90,
        height: 90,
        borderRadius: 45,
        borderWidth: 3,
        borderColor: '#ff7600',
    },
    statsContainer: {
        flex: 1,
        flexDirection: 'row',
        justifyContent: 'space-around',
        alignItems: 'center',
    },
    statItem: {
        alignItems: 'center',
    },
    statNumber: {
        fontSize: 20,
        fontWeight: 'bold',
        color: '#333',
    },
    statLabel: {
        fontSize: 14,
        color: '#666',
        marginTop: 2,
    },
    profileDetails: {
        gap: 8,
    },
    displayName: {
        fontSize: 18,
        fontWeight: '600',
        color: '#333',
    },
    bio: {
        fontSize: 15,
        color: '#555',
        lineHeight: 20,
    },
    compactDetails: {
        gap: 4,
    },
    detailText: {
        fontSize: 14,
        color: '#666',
    },
    actionButtons: {
        flexDirection: 'row',
        gap: 10,
    },
    editButton: {
        flex: 1,
        backgroundColor: '#ff7600',
        paddingVertical: 10,
        paddingHorizontal: 20,
        borderRadius: 8,
        alignItems: 'center',
    },
    editButtonText: {
        color: '#fff',
        fontSize: 15,
        fontWeight: '600',
    },
    shareButton: {
        flex: 1,
        backgroundColor: '#f0f0f0',
        paddingVertical: 10,
        paddingHorizontal: 20,
        borderRadius: 8,
        alignItems: 'center',
    },
    shareButtonText: {
        color: '#333',
        fontSize: 15,
        fontWeight: '600',
    },
});

export default ProfileHeader;