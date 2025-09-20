import React, { useEffect, useState } from 'react';
import {
    View,
    Text,
    StyleSheet,
    ScrollView,
    ActivityIndicator,
    TouchableOpacity
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useUser } from "../../utils/AuthContext";
import Config from "../../utils/Config";

// Import the components
import ProfileHeader from '../../Components/Profile/ProfileHeader'
import InterestsSection from '../../Components/Profile/Interest';
import PostsSection from '../../Components/Profile/PostSection';
import EditProfileModal from '../../Components/Profile/EditProfileModal';

const Profile = () => {
    const { user, logout} = useUser();
    const [loading, setLoading] = useState(true);
    const [Profile, setProfile] = useState(null);
    const [editModalVisible, setEditModalVisible] = useState(false);

    const fetchUser = async () => {
        try {
            let URL = Config.BaseURL + '/api/v1/user/' + user.uid + '/profile';
            const response = await fetch(URL);
            if (!response.ok)
                throw new Error(response.statusText);
            const data = await response.json();
            setProfile(data);
        } catch (error) {
            alert(error);
        } finally {
            setLoading(false);
        }
    }

    const openEditModal = () => {
        setEditModalVisible(true);
    };

    const closeEditModal = () => {
        setEditModalVisible(false);
    };

    useEffect(() => {
        if (!user?.uid) return;
        fetchUser();
    }, []);

    if (loading) {
        return (
            <View style={styles.loadingContainer}>
                <ActivityIndicator size="large" color="#ff7600" />
                <Text style={styles.loadingText}>Loading...</Text>
            </View>
        )
    }

    if (!Profile) {
        return (
            <View style={styles.container}>
                <Text style={styles.errorText}>Failed to load profile</Text>
            </View>
        )
    }

    return (
        <>
            <View style={styles.container}>
                <TouchableOpacity
                    style={styles.logoutButton}
                    onPress={() => logout()}
                >
                    <Ionicons name="log-out-outline" size={24} color="#ff7600" />
                </TouchableOpacity>

                <ScrollView style={styles.scrollView}>
                    <ProfileHeader
                        profile={Profile}
                        onEditPress={openEditModal}
                        onLogout={logout}
                    />

                    <InterestsSection
                        interests={Profile.profile?.interest}
                    />

                    <PostsSection
                        profile={Profile}
                    />
                </ScrollView>
            </View>

            <EditProfileModal
                visible={editModalVisible}
                onClose={closeEditModal}
                profile={Profile}
                user={user}
                onProfileUpdate={fetchUser}
            />
        </>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#f8f9fa',
        position: 'relative',
    },
    scrollView: {
        flex: 1,
    },
    logoutButton: {
        position: 'absolute',
        top: 30,
        right: 10,
        zIndex: 1000,
        padding: 8,
        borderRadius: 20,
        backgroundColor: 'rgba(255, 255, 255, 0.9)',
        shadowColor: '#000',
        shadowOffset: {
            width: 0,
            height: 3,
        },
        shadowOpacity: 0.1,
        shadowRadius: 3,
        elevation: 3,
    },
    loadingContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: '#f8f9fa',
    },
    loadingText: {
        marginTop: 10,
        fontSize: 16,
        color: '#666',
    },
    errorText: {
        fontSize: 16,
        color: '#ff0000',
        textAlign: 'center',
        marginTop: 50,
    },
});

export default Profile;