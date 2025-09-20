import React, { useEffect, useState } from 'react';
import {
    View,
    Text,
    StyleSheet,
    ScrollView,
    ActivityIndicator,
    TouchableOpacity,
    Modal,
    TextInput,
    Switch,
    Alert
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useUser } from "../../utils/AuthContext";
import BaseURL from '../../utils/Config'

const Profile = () => {
    const { user, logout } = useUser();
    const [loading, setLoading] = useState(true);
    const [profile, setProfile] = useState(null);
    const [editModalVisible, setEditModalVisible] = useState(false);
    const [editedProfile, setEditedProfile] = useState({});
    const [updating, setUpdating] = useState(false);

    // Dietary preferences state
    const [dietaryPreferences, setDietaryPreferences] = useState({
        vegetarian: false,
        glutenFree: false,
        lowCarb: false,
        keto: false,
        dairyFree: false,
        paleo: false
    });

    // Notification preferences state
    const [notifications, setNotifications] = useState({
        mealReminders: true,
        weeklyReports: false,
        achievements: false
    });

    const fetchUser = async () => {
        try {
            const URL = `${BaseURL}/api/v1/user/${user.uid}`;
            const response = await fetch(URL);
            if (!response.ok)
                throw new Error(response.statusText);
            const data = await response.json();
            setProfile(data);
            setEditedProfile(data);
        } catch (error) {
            Alert.alert('Error', 'Failed to load profile');
        } finally {
            setLoading(false);
        }
    }

    const updateProfile = async () => {
        setUpdating(true);
        try {
            const URL = `${BaseURL}/api/v1/user/${user.uid}`;
            const response = await fetch(URL, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    age: parseInt(editedProfile.age),
                    gender: editedProfile.gender,
                    nickname: editedProfile.nickname,
                    username: editedProfile.username,
                    weight: parseFloat(editedProfile.weight),
                    height: parseFloat(editedProfile.height)
                })
            });

            if (!response.ok) {
                throw new Error('Failed to update profile');
            }

            const updatedData = await response.json();
            setProfile(updatedData);
            setEditModalVisible(false);
            Alert.alert('Success', 'Profile updated successfully');
        } catch (error) {
            Alert.alert('Error', 'Failed to update profile');
        } finally {
            setUpdating(false);
        }
    };

    const openEditModal = () => {
        setEditedProfile({...profile});
        setEditModalVisible(true);
    };

    const closeEditModal = () => {
        setEditModalVisible(false);
        setEditedProfile(profile);
    };

    const toggleDietaryPreference = (preference) => {
        setDietaryPreferences(prev => ({
            ...prev,
            [preference]: !prev[preference]
        }));
    };

    const toggleNotification = (notification) => {
        setNotifications(prev => ({
            ...prev,
            [notification]: !prev[notification]
        }));
    };

    useEffect(() => {
        if (!user?.uid) return;
        fetchUser();
    }, []);

    if (loading) {
        return (
            <View style={styles.loadingContainer}>
                <ActivityIndicator size="large" color="#4CAF50" />
                <Text style={styles.loadingText}>Loading...</Text>
            </View>
        )
    }

    if (!profile) {
        return (
            <View style={styles.container}>
                <Text style={styles.errorText}>Failed to load profile</Text>
            </View>
        )
    }

    const renderDietaryTag = (key, label, active) => (
        <TouchableOpacity
            key={key}
            style={[styles.dietaryTag, active && styles.dietaryTagActive]}
            onPress={() => toggleDietaryPreference(key)}
        >
            <Text style={[styles.dietaryTagText, active && styles.dietaryTagTextActive]}>
                {label}
            </Text>
        </TouchableOpacity>
    );

    return (
        <View style={styles.container}>
            <ScrollView style={styles.scrollView}>
                {/* Header */}
                <View style={styles.header}>
                    <Text style={styles.headerTitle}>Profile & Settings</Text>
                    <Text style={styles.headerSubtitle}>Manage your account and preferences</Text>
                </View>

                {/* Personal Information Section */}
                <View style={styles.section}>
                    <View style={styles.sectionHeader}>
                        <Text style={styles.sectionTitle}>Personal Information</Text>
                        <TouchableOpacity
                            style={styles.editButton}
                            onPress={openEditModal}
                        >
                            <Ionicons name="pencil" size={16} color="#666" />
                            <Text style={styles.editText}>Edit</Text>
                        </TouchableOpacity>
                    </View>

                    <View style={styles.card}>
                        {/* Profile Avatar and Name */}
                        <View style={styles.profileRow}>
                            <View style={styles.avatar}>
                                <Ionicons name="person" size={24} color="#4CAF50" />
                            </View>
                            <View style={styles.profileInfo}>
                                <Text style={styles.profileName}>
                                    {profile.nickname || profile.username}
                                </Text>
                                <Text style={styles.profileEmail}>
                                    {profile.username}@email.com
                                </Text>
                            </View>
                        </View>

                        {/* Personal Details Grid */}
                        <View style={styles.detailsGrid}>
                            <View style={styles.detailItem}>
                                <Text style={styles.detailLabel}>Age</Text>
                                <Text style={styles.detailValue}>{profile.age}</Text>
                            </View>
                            <View style={styles.detailItem}>
                                <Text style={styles.detailLabel}>Gender</Text>
                                <Text style={styles.detailValue}>
                                    {profile.gender ? profile.gender.charAt(0).toUpperCase() + profile.gender.slice(1) : 'Not specified'}
                                </Text>
                            </View>
                            <View style={styles.detailItem}>
                                <Text style={styles.detailLabel}>Weight (kg)</Text>
                                <Text style={styles.detailValue}>{profile.weight}</Text>
                            </View>
                            <View style={styles.detailItem}>
                                <Text style={styles.detailLabel}>Height (cm)</Text>
                                <Text style={styles.detailValue}>{profile.height}</Text>
                            </View>
                        </View>
                    </View>
                </View>

                {/* Dietary Preferences Section */}
                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>Dietary Preferences</Text>
                    <View style={styles.card}>
                        <View style={styles.dietaryContainer}>
                            {renderDietaryTag('vegetarian', 'Vegetarian', dietaryPreferences.vegetarian)}
                            {renderDietaryTag('glutenFree', 'Gluten-Free', dietaryPreferences.glutenFree)}
                            {renderDietaryTag('lowCarb', 'Low-Carb', dietaryPreferences.lowCarb)}
                            {renderDietaryTag('keto', 'Keto', dietaryPreferences.keto)}
                            {renderDietaryTag('dairyFree', 'Dairy-Free', dietaryPreferences.dairyFree)}
                            {renderDietaryTag('paleo', 'Paleo', dietaryPreferences.paleo)}
                        </View>
                    </View>
                </View>

                {/* Notifications Section */}
                <View style={styles.section}>
                    <View style={styles.notificationHeader}>
                        <Ionicons name="notifications-outline" size={20} color="#4CAF50" />
                        <Text style={styles.sectionTitle}>Notifications</Text>
                    </View>
                    <View style={styles.card}>
                        <View style={styles.notificationItem}>
                            <View style={styles.notificationInfo}>
                                <Text style={styles.notificationTitle}>Meal Reminders</Text>
                                <Text style={styles.notificationSubtitle}>Get reminded to log your meals</Text>
                            </View>
                            <Switch
                                value={notifications.mealReminders}
                                onValueChange={() => toggleNotification('mealReminders')}
                                trackColor={{ false: '#e0e0e0', true: '#4CAF50' }}
                                thumbColor={notifications.mealReminders ? '#fff' : '#f4f3f4'}
                            />
                        </View>

                        <View style={styles.notificationItem}>
                            <View style={styles.notificationInfo}>
                                <Text style={styles.notificationTitle}>Weekly Reports</Text>
                                <Text style={styles.notificationSubtitle}>Nutrition summary every Sunday</Text>
                            </View>
                            <Switch
                                value={notifications.weeklyReports}
                                onValueChange={() => toggleNotification('weeklyReports')}
                                trackColor={{ false: '#e0e0e0', true: '#4CAF50' }}
                                thumbColor={notifications.weeklyReports ? '#fff' : '#f4f3f4'}
                            />
                        </View>

                        <View style={[styles.notificationItem, { borderBottomWidth: 0 }]}>
                            <View style={styles.notificationInfo}>
                                <Text style={styles.notificationTitle}>Achievements</Text>
                                <Text style={styles.notificationSubtitle}>Celebrate your milestones</Text>
                            </View>
                            <Switch
                                value={notifications.achievements}
                                onValueChange={() => toggleNotification('achievements')}
                                trackColor={{ false: '#e0e0e0', true: '#4CAF50' }}
                                thumbColor={notifications.achievements ? '#fff' : '#f4f3f4'}
                            />
                        </View>
                    </View>
                </View>

                {/* Health Goals Section */}
                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>Health Goals</Text>

                    <View style={styles.goalsRow}>
                        <View style={styles.goalCard}>
                            <Text style={styles.goalLabel}>Current Goal</Text>
                            <Text style={styles.goalValue}>Maintain Weight</Text>
                        </View>
                        <View style={styles.goalCard}>
                            <Text style={styles.goalLabel}>Activity Level</Text>
                            <Text style={styles.goalValue}>Moderately Active</Text>
                        </View>
                    </View>
                </View>

                {/* Logout Button */}
                <TouchableOpacity
                    style={styles.logoutButton}
                    onPress={() => logout()}
                >
                    <Ionicons name="log-out-outline" size={20} color="#ff4757" />
                    <Text style={styles.logoutText}>Logout</Text>
                </TouchableOpacity>
            </ScrollView>

            {/* Edit Profile Modal */}
            <Modal
                visible={editModalVisible}
                animationType="slide"
                presentationStyle="pageSheet"
                onRequestClose={closeEditModal}
            >
                <View style={styles.modalContainer}>
                    <View style={styles.modalHeader}>
                        <TouchableOpacity onPress={closeEditModal}>
                            <Text style={styles.modalCancel}>Cancel</Text>
                        </TouchableOpacity>
                        <Text style={styles.modalTitle}>Edit Profile</Text>
                        <TouchableOpacity
                            onPress={updateProfile}
                            disabled={updating}
                        >
                            <Text style={[styles.modalSave, updating && styles.modalSaveDisabled]}>
                                {updating ? 'Saving...' : 'Save'}
                            </Text>
                        </TouchableOpacity>
                    </View>

                    <ScrollView style={styles.modalContent}>
                        <View style={styles.inputGroup}>
                            <Text style={styles.inputLabel}>Nickname</Text>
                            <TextInput
                                style={styles.input}
                                value={editedProfile.nickname}
                                onChangeText={(text) => setEditedProfile({...editedProfile, nickname: text})}
                                placeholder="Enter nickname"
                            />
                        </View>

                        <View style={styles.inputGroup}>
                            <Text style={styles.inputLabel}>Age</Text>
                            <TextInput
                                style={styles.input}
                                value={editedProfile.age?.toString()}
                                onChangeText={(text) => setEditedProfile({...editedProfile, age: text})}
                                placeholder="Enter age"
                                keyboardType="numeric"
                            />
                        </View>

                        <View style={styles.inputGroup}>
                            <Text style={styles.inputLabel}>Gender</Text>
                            <View style={styles.genderContainer}>
                                <TouchableOpacity
                                    style={[
                                        styles.genderButton,
                                        editedProfile.gender === 'male' && styles.genderButtonActive
                                    ]}
                                    onPress={() => setEditedProfile({...editedProfile, gender: 'male'})}
                                >
                                    <Text style={[
                                        styles.genderButtonText,
                                        editedProfile.gender === 'male' && styles.genderButtonTextActive
                                    ]}>Male</Text>
                                </TouchableOpacity>
                                <TouchableOpacity
                                    style={[
                                        styles.genderButton,
                                        editedProfile.gender === 'female' && styles.genderButtonActive
                                    ]}
                                    onPress={() => setEditedProfile({...editedProfile, gender: 'female'})}
                                >
                                    <Text style={[
                                        styles.genderButtonText,
                                        editedProfile.gender === 'female' && styles.genderButtonTextActive
                                    ]}>Female</Text>
                                </TouchableOpacity>
                            </View>
                        </View>

                        <View style={styles.inputRow}>
                            <View style={[styles.inputGroup, { flex: 1, marginRight: 10 }]}>
                                <Text style={styles.inputLabel}>Weight (kg)</Text>
                                <TextInput
                                    style={styles.input}
                                    value={editedProfile.weight?.toString()}
                                    onChangeText={(text) => setEditedProfile({...editedProfile, weight: text})}
                                    placeholder="Weight"
                                    keyboardType="numeric"
                                />
                            </View>
                            <View style={[styles.inputGroup, { flex: 1, marginLeft: 10 }]}>
                                <Text style={styles.inputLabel}>Height (cm)</Text>
                                <TextInput
                                    style={styles.input}
                                    value={editedProfile.height?.toString()}
                                    onChangeText={(text) => setEditedProfile({...editedProfile, height: text})}
                                    placeholder="Height"
                                    keyboardType="numeric"
                                />
                            </View>
                        </View>
                    </ScrollView>
                </View>
            </Modal>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#f5f7fa',
    },
    scrollView: {
        flex: 1,
    },
    loadingContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: '#f5f7fa',
    },
    loadingText: {
        marginTop: 10,
        fontSize: 16,
        color: '#666',
    },
    errorText: {
        fontSize: 16,
        color: '#ff4757',
        textAlign: 'center',
        marginTop: 50,
    },
    header: {
        paddingHorizontal: 20,
        paddingTop: 60,
        paddingBottom: 20,
        backgroundColor: '#fff',
    },
    headerTitle: {
        fontSize: 28,
        fontWeight: 'bold',
        color: '#2d3436',
        marginBottom: 5,
    },
    headerSubtitle: {
        fontSize: 16,
        color: '#636e72',
    },
    section: {
        marginTop: 20,
        paddingHorizontal: 20,
    },
    sectionHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 15,
    },
    sectionTitle: {
        fontSize: 20,
        fontWeight: '600',
        color: '#2d3436',
    },
    editButton: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 12,
        paddingVertical: 6,
        backgroundColor: '#f8f9fa',
        borderRadius: 20,
    },
    editText: {
        marginLeft: 5,
        fontSize: 14,
        color: '#666',
    },
    card: {
        backgroundColor: '#fff',
        borderRadius: 15,
        padding: 20,
        shadowColor: '#000',
        shadowOffset: {
            width: 0,
            height: 2,
        },
        shadowOpacity: 0.1,
        shadowRadius: 8,
        elevation: 3,
    },
    profileRow: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 25,
    },
    avatar: {
        width: 50,
        height: 50,
        borderRadius: 25,
        backgroundColor: '#e8f5e8',
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 15,
    },
    profileInfo: {
        flex: 1,
    },
    profileName: {
        fontSize: 18,
        fontWeight: '600',
        color: '#2d3436',
        marginBottom: 2,
    },
    profileEmail: {
        fontSize: 14,
        color: '#636e72',
    },
    detailsGrid: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        justifyContent: 'space-between',
    },
    detailItem: {
        width: '48%',
        marginBottom: 20,
    },
    detailLabel: {
        fontSize: 14,
        color: '#636e72',
        marginBottom: 5,
    },
    detailValue: {
        fontSize: 16,
        fontWeight: '500',
        color: '#2d3436',
    },
    dietaryContainer: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: 10,
    },
    dietaryTag: {
        paddingHorizontal: 16,
        paddingVertical: 8,
        borderRadius: 20,
        backgroundColor: '#f8f9fa',
        borderWidth: 1,
        borderColor: '#e0e0e0',
    },
    dietaryTagActive: {
        backgroundColor: '#e8f5e8',
        borderColor: '#4CAF50',
    },
    dietaryTagText: {
        fontSize: 14,
        color: '#666',
        fontWeight: '500',
    },
    dietaryTagTextActive: {
        color: '#4CAF50',
        fontWeight: '600',
    },
    notificationHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 15,
    },
    notificationItem: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingVertical: 15,
        borderBottomWidth: 1,
        borderBottomColor: '#f0f0f0',
    },
    notificationInfo: {
        flex: 1,
    },
    notificationTitle: {
        fontSize: 16,
        fontWeight: '500',
        color: '#2d3436',
        marginBottom: 2,
    },
    notificationSubtitle: {
        fontSize: 14,
        color: '#636e72',
    },
    goalsRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
    },
    goalCard: {
        flex: 1,
        backgroundColor: '#e8f5e8',
        borderRadius: 12,
        padding: 15,
        marginHorizontal: 5,
    },
    goalLabel: {
        fontSize: 14,
        color: '#4CAF50',
        fontWeight: '600',
        marginBottom: 5,
    },
    goalValue: {
        fontSize: 16,
        color: '#2d3436',
        fontWeight: '500',
    },
    logoutButton: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        marginHorizontal: 20,
        marginTop: 30,
        marginBottom: 40,
        paddingVertical: 15,
        backgroundColor: '#fff',
        borderRadius: 12,
        borderWidth: 1,
        borderColor: '#ff4757',
        shadowColor: '#000',
        shadowOffset: {
            width: 0,
            height: 2,
        },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 2,
    },
    logoutText: {
        marginLeft: 8,
        fontSize: 16,
        color: '#ff4757',
        fontWeight: '600',
    },
    // Modal Styles
    modalContainer: {
        flex: 1,
        backgroundColor: '#f5f7fa',
    },
    modalHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingHorizontal: 20,
        paddingTop: 60,
        paddingBottom: 20,
        backgroundColor: '#fff',
        borderBottomWidth: 1,
        borderBottomColor: '#e0e0e0',
    },
    modalTitle: {
        fontSize: 18,
        fontWeight: '600',
        color: '#2d3436',
    },
    modalCancel: {
        fontSize: 16,
        color: '#666',
    },
    modalSave: {
        fontSize: 16,
        color: '#4CAF50',
        fontWeight: '600',
    },
    modalSaveDisabled: {
        color: '#ccc',
    },
    modalContent: {
        flex: 1,
        paddingHorizontal: 20,
        paddingTop: 20,
    },
    inputGroup: {
        marginBottom: 20,
    },
    inputRow: {
        flexDirection: 'row',
    },
    inputLabel: {
        fontSize: 16,
        fontWeight: '500',
        color: '#2d3436',
        marginBottom: 8,
    },
    input: {
        backgroundColor: '#fff',
        borderRadius: 12,
        paddingHorizontal: 16,
        paddingVertical: 12,
        fontSize: 16,
        borderWidth: 1,
        borderColor: '#e0e0e0',
    },
    genderContainer: {
        flexDirection: 'row',
        gap: 10,
    },
    genderButton: {
        flex: 1,
        paddingVertical: 12,
        paddingHorizontal: 20,
        borderRadius: 12,
        backgroundColor: '#fff',
        borderWidth: 1,
        borderColor: '#e0e0e0',
        alignItems: 'center',
    },
    genderButtonActive: {
        backgroundColor: '#4CAF50',
        borderColor: '#4CAF50',
    },
    genderButtonText: {
        fontSize: 16,
        color: '#666',
        fontWeight: '500',
    },
    genderButtonTextActive: {
        color: '#fff',
        fontWeight: '600',
    },
});

export default Profile;