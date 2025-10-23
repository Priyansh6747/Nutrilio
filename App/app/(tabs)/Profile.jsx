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
import ServerConfig from "../../utils/Config";

const Profile = () => {
    const { user, logout } = useUser();
    const [loading, setLoading] = useState(true);
    const [profile, setProfile] = useState(null);
    const [editModalVisible, setEditModalVisible] = useState(false);
    const [editedProfile, setEditedProfile] = useState({});
    const [updating, setUpdating] = useState(false);

    const [dietaryPreferences, setDietaryPreferences] = useState({
        vegetarian: false,
        glutenFree: false,
        lowCarb: false,
        keto: false,
        dairyFree: false,
        paleo: false
    });

    const [notifications, setNotifications] = useState({
        mealReminders: true,
        weeklyReports: false,
        achievements: false
    });

    const fetchUser = async () => {
        try {
            const URL = `${ServerConfig.BaseURL}/api/v1/user/${user.uid}`;
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
            const URL = `${ServerConfig.BaseURL}/api/v1/user/${user.uid}`;
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
                <ActivityIndicator size="large" color="#0288D1" />
                <Text style={styles.loadingText}>Loading your profile...</Text>
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
            activeOpacity={0.7}
        >
            <Text style={[styles.dietaryTagText, active && styles.dietaryTagTextActive]}>
                {label}
            </Text>
            {active && <Ionicons name="checkmark-circle" size={16} color="#0288D1" style={styles.checkIcon} />}
        </TouchableOpacity>
    );

    return (
        <View style={styles.container}>
            <ScrollView
                style={styles.scrollView}
                showsVerticalScrollIndicator={false}
            >
                {/* Header with Gradient Effect */}
                <View style={styles.header}>
                    <View style={styles.headerContent}>
                        <Text style={styles.headerTitle}>Profile</Text>
                        <Text style={styles.headerSubtitle}>Manage your health journey</Text>
                    </View>
                </View>

                {/* Personal Information Card */}
                <View style={styles.section}>
                    <View style={styles.sectionHeader}>
                        <View style={styles.sectionTitleContainer}>
                            <Ionicons name="person-circle-outline" size={24} color="#0288D1" />
                            <Text style={styles.sectionTitle}>Personal Info</Text>
                        </View>
                        <TouchableOpacity
                            style={styles.editButton}
                            onPress={openEditModal}
                            activeOpacity={0.7}
                        >
                            <Ionicons name="pencil" size={16} color="#0288D1" />
                            <Text style={styles.editText}>Edit</Text>
                        </TouchableOpacity>
                    </View>

                    <View style={styles.card}>
                        {/* Profile Header */}
                        <View style={styles.profileHeader}>
                            <View style={styles.avatarContainer}>
                                <View style={styles.avatar}>
                                    <Ionicons name="person" size={32} color="#0288D1" />
                                </View>
                                <View style={styles.onlineBadge} />
                            </View>
                            <View style={styles.profileInfo}>
                                <Text style={styles.profileName}>
                                    {profile.nickname || profile.username}
                                </Text>
                                <Text style={styles.profileEmail}>{profile.username}</Text>
                            </View>
                        </View>

                        {/* Stats Grid */}
                        <View style={styles.statsContainer}>
                            <View style={styles.statBox}>
                                <Ionicons name="calendar-outline" size={20} color="#0288D1" />
                                <Text style={styles.statValue}>{profile.age}</Text>
                                <Text style={styles.statLabel}>Years</Text>
                            </View>
                            <View style={styles.statDivider} />
                            <View style={styles.statBox}>
                                <Ionicons name="scale-outline" size={20} color="#26A69A" />
                                <Text style={styles.statValue}>{profile.weight}</Text>
                                <Text style={styles.statLabel}>kg</Text>
                            </View>
                            <View style={styles.statDivider} />
                            <View style={styles.statBox}>
                                <Ionicons name="resize-outline" size={20} color="#4DD0E1" />
                                <Text style={styles.statValue}>{profile.height}</Text>
                                <Text style={styles.statLabel}>cm</Text>
                            </View>
                        </View>

                        {/* Gender Info */}
                        <View style={styles.genderInfo}>
                            <Ionicons
                                name={profile.gender === 'male' ? 'male' : profile.gender === 'female' ? 'female' : 'person'}
                                size={18}
                                color="#0288D1"
                            />
                            <Text style={styles.genderText}>
                                {profile.gender ? profile.gender.charAt(0).toUpperCase() + profile.gender.slice(1) : 'Not specified'}
                            </Text>
                        </View>
                    </View>
                </View>

                {/* Dietary Preferences */}
                <View style={styles.section}>
                    <View style={styles.sectionTitleContainer}>
                        <Ionicons name="nutrition-outline" size={24} color="#26A69A" />
                        <Text style={styles.sectionTitle}>Dietary Preferences</Text>
                    </View>
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

                {/* Notifications */}
                <View style={styles.section}>
                    <View style={styles.sectionTitleContainer}>
                        <Ionicons name="notifications-outline" size={24} color="#0288D1" />
                        <Text style={styles.sectionTitle}>Notifications</Text>
                    </View>
                    <View style={styles.card}>
                        <View style={styles.notificationItem}>
                            <View style={styles.notificationIconContainer}>
                                <Ionicons name="time-outline" size={20} color="#0288D1" />
                            </View>
                            <View style={styles.notificationInfo}>
                                <Text style={styles.notificationTitle}>Meal Reminders</Text>
                                <Text style={styles.notificationSubtitle}>Daily meal logging alerts</Text>
                            </View>
                            <Switch
                                value={notifications.mealReminders}
                                onValueChange={() => toggleNotification('mealReminders')}
                                trackColor={{ false: '#E3F2FD', true: '#81D4FA' }}
                                thumbColor={notifications.mealReminders ? '#0288D1' : '#f4f3f4'}
                                ios_backgroundColor="#E3F2FD"
                            />
                        </View>

                        <View style={styles.notificationItem}>
                            <View style={styles.notificationIconContainer}>
                                <Ionicons name="stats-chart-outline" size={20} color="#26A69A" />
                            </View>
                            <View style={styles.notificationInfo}>
                                <Text style={styles.notificationTitle}>Weekly Reports</Text>
                                <Text style={styles.notificationSubtitle}>Sunday nutrition summary</Text>
                            </View>
                            <Switch
                                value={notifications.weeklyReports}
                                onValueChange={() => toggleNotification('weeklyReports')}
                                trackColor={{ false: '#E3F2FD', true: '#81D4FA' }}
                                thumbColor={notifications.weeklyReports ? '#0288D1' : '#f4f3f4'}
                                ios_backgroundColor="#E3F2FD"
                            />
                        </View>

                        <View style={[styles.notificationItem, { borderBottomWidth: 0 }]}>
                            <View style={styles.notificationIconContainer}>
                                <Ionicons name="trophy-outline" size={20} color="#4DD0E1" />
                            </View>
                            <View style={styles.notificationInfo}>
                                <Text style={styles.notificationTitle}>Achievements</Text>
                                <Text style={styles.notificationSubtitle}>Milestone celebrations</Text>
                            </View>
                            <Switch
                                value={notifications.achievements}
                                onValueChange={() => toggleNotification('achievements')}
                                trackColor={{ false: '#E3F2FD', true: '#81D4FA' }}
                                thumbColor={notifications.achievements ? '#0288D1' : '#f4f3f4'}
                                ios_backgroundColor="#E3F2FD"
                            />
                        </View>
                    </View>
                </View>

                {/* Health Goals */}
                <View style={styles.section}>
                    <View style={styles.sectionTitleContainer}>
                        <Ionicons name="fitness-outline" size={24} color="#26A69A" />
                        <Text style={styles.sectionTitle}>Health Goals</Text>
                    </View>
                    <View style={styles.goalsRow}>
                        <View style={styles.goalCard}>
                            <Ionicons name="flag-outline" size={24} color="#0288D1" />
                            <Text style={styles.goalValue}>Maintain Weight</Text>
                            <Text style={styles.goalLabel}>Current Goal</Text>
                        </View>
                        <View style={styles.goalCard}>
                            <Ionicons name="walk-outline" size={24} color="#26A69A" />
                            <Text style={styles.goalValue}>Moderately Active</Text>
                            <Text style={styles.goalLabel}>Activity Level</Text>
                        </View>
                    </View>
                </View>

                {/* Logout Button */}
                <TouchableOpacity
                    style={styles.logoutButton}
                    onPress={() => logout()}
                    activeOpacity={0.8}
                >
                    <Ionicons name="log-out-outline" size={22} color="#E53935" />
                    <Text style={styles.logoutText}>Sign Out</Text>
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
                        <TouchableOpacity onPress={closeEditModal} style={styles.modalButton}>
                            <Text style={styles.modalCancel}>Cancel</Text>
                        </TouchableOpacity>
                        <Text style={styles.modalTitle}>Edit Profile</Text>
                        <TouchableOpacity
                            onPress={updateProfile}
                            disabled={updating}
                            style={styles.modalButton}
                        >
                            <Text style={[styles.modalSave, updating && styles.modalSaveDisabled]}>
                                {updating ? 'Saving...' : 'Save'}
                            </Text>
                        </TouchableOpacity>
                    </View>

                    <ScrollView style={styles.modalContent} showsVerticalScrollIndicator={false}>
                        <View style={styles.inputGroup}>
                            <Text style={styles.inputLabel}>Nickname</Text>
                            <TextInput
                                style={styles.input}
                                value={editedProfile.nickname}
                                onChangeText={(text) => setEditedProfile({...editedProfile, nickname: text})}
                                placeholder="Enter your nickname"
                                placeholderTextColor="#999"
                            />
                        </View>

                        <View style={styles.inputGroup}>
                            <Text style={styles.inputLabel}>Age</Text>
                            <TextInput
                                style={styles.input}
                                value={editedProfile.age?.toString()}
                                onChangeText={(text) => setEditedProfile({...editedProfile, age: text})}
                                placeholder="Enter your age"
                                placeholderTextColor="#999"
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
                                    activeOpacity={0.7}
                                >
                                    <Ionicons
                                        name="male"
                                        size={20}
                                        color={editedProfile.gender === 'male' ? '#fff' : '#999'}
                                    />
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
                                    activeOpacity={0.7}
                                >
                                    <Ionicons
                                        name="female"
                                        size={20}
                                        color={editedProfile.gender === 'female' ? '#fff' : '#999'}
                                    />
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
                                    placeholderTextColor="#999"
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
                                    placeholderTextColor="#999"
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
        backgroundColor: '#F0F9FF',
        marginBottom:80,
    },
    scrollView: {
        flex: 1,
    },
    loadingContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: '#F0F9FF',
    },
    loadingText: {
        marginTop: 16,
        fontSize: 16,
        color: '#0288D1',
        fontWeight: '500',
    },
    errorText: {
        fontSize: 16,
        color: '#E53935',
        textAlign: 'center',
        marginTop: 50,
        fontWeight: '500',
    },
    header: {
        paddingHorizontal: 20,
        paddingTop: 60,
        paddingBottom: 30,
        backgroundColor: '#0288D1',
        borderBottomLeftRadius: 30,
        borderBottomRightRadius: 30,
    },
    headerContent: {
        marginTop: 10,
    },
    headerTitle: {
        fontSize: 32,
        fontWeight: '700',
        color: '#fff',
        marginBottom: 8,
        letterSpacing: 0.5,
    },
    headerSubtitle: {
        fontSize: 16,
        color: '#E3F2FD',
        fontWeight: '400',
    },
    section: {
        marginTop: 24,
        paddingHorizontal: 20,
    },
    sectionHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 16,
    },
    sectionTitleContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 10,
        marginBottom: 16,
    },
    sectionTitle: {
        fontSize: 20,
        fontWeight: '700',
        color: '#263238',
        letterSpacing: 0.3,
    },
    editButton: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 16,
        paddingVertical: 8,
        backgroundColor: '#E3F2FD',
        borderRadius: 20,
        gap: 6,
    },
    editText: {
        fontSize: 14,
        color: '#0288D1',
        fontWeight: '600',
    },
    card: {
        backgroundColor: '#fff',
        borderRadius: 20,
        padding: 20,
        shadowColor: '#0288D1',
        shadowOffset: {
            width: 0,
            height: 4,
        },
        shadowOpacity: 0.1,
        shadowRadius: 12,
        elevation: 4,
    },
    profileHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 24,
    },
    avatarContainer: {
        position: 'relative',
        marginRight: 16,
    },
    avatar: {
        width: 70,
        height: 70,
        borderRadius: 35,
        backgroundColor: '#E3F2FD',
        justifyContent: 'center',
        alignItems: 'center',
        borderWidth: 3,
        borderColor: '#fff',
        shadowColor: '#0288D1',
        shadowOffset: {
            width: 0,
            height: 2,
        },
        shadowOpacity: 0.3,
        shadowRadius: 4,
        elevation: 3,
    },
    onlineBadge: {
        position: 'absolute',
        bottom: 2,
        right: 2,
        width: 18,
        height: 18,
        borderRadius: 9,
        backgroundColor: '#26A69A',
        borderWidth: 3,
        borderColor: '#fff',
    },
    profileInfo: {
        flex: 1,
        justifyContent: 'center',
    },
    profileName: {
        fontSize: 22,
        fontWeight: '700',
        color: '#263238',
        marginBottom: 4,
        letterSpacing: 0.3,
    },
    profileEmail: {
        fontSize: 14,
        color: '#78909C',
        fontWeight: '400',
    },
    statsContainer: {
        flexDirection: 'row',
        backgroundColor: '#F0F9FF',
        borderRadius: 16,
        padding: 16,
        marginBottom: 16,
    },
    statBox: {
        flex: 1,
        alignItems: 'center',
    },
    statDivider: {
        width: 1,
        backgroundColor: '#B3E5FC',
        marginHorizontal: 8,
    },
    statValue: {
        fontSize: 24,
        fontWeight: '700',
        color: '#263238',
        marginTop: 8,
        marginBottom: 4,
    },
    statLabel: {
        fontSize: 12,
        color: '#78909C',
        fontWeight: '500',
        textTransform: 'uppercase',
        letterSpacing: 0.5,
    },
    genderInfo: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingVertical: 12,
        paddingHorizontal: 16,
        backgroundColor: '#F0F9FF',
        borderRadius: 12,
        gap: 8,
    },
    genderText: {
        fontSize: 15,
        color: '#546E7A',
        fontWeight: '500',
    },
    dietaryContainer: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: 10,
    },
    dietaryTag: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 16,
        paddingVertical: 10,
        borderRadius: 24,
        backgroundColor: '#F0F9FF',
        borderWidth: 2,
        borderColor: '#B3E5FC',
        gap: 6,
    },
    dietaryTagActive: {
        backgroundColor: '#E3F2FD',
        borderColor: '#0288D1',
    },
    dietaryTagText: {
        fontSize: 14,
        color: '#546E7A',
        fontWeight: '500',
    },
    dietaryTagTextActive: {
        color: '#0288D1',
        fontWeight: '600',
    },
    checkIcon: {
        marginLeft: 2,
    },
    notificationItem: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingVertical: 16,
        borderBottomWidth: 1,
        borderBottomColor: '#E3F2FD',
        gap: 12,
    },
    notificationIconContainer: {
        width: 40,
        height: 40,
        borderRadius: 12,
        backgroundColor: '#F0F9FF',
        justifyContent: 'center',
        alignItems: 'center',
    },
    notificationInfo: {
        flex: 1,
    },
    notificationTitle: {
        fontSize: 16,
        fontWeight: '600',
        color: '#263238',
        marginBottom: 4,
    },
    notificationSubtitle: {
        fontSize: 13,
        color: '#78909C',
        fontWeight: '400',
    },
    goalsRow: {
        flexDirection: 'row',
        gap: 12,
    },
    goalCard: {
        flex: 1,
        backgroundColor: '#fff',
        borderRadius: 16,
        padding: 20,
        alignItems: 'center',
        shadowColor: '#0288D1',
        shadowOffset: {
            width: 0,
            height: 2,
        },
        shadowOpacity: 0.08,
        shadowRadius: 8,
        elevation: 3,
        borderWidth: 1,
        borderColor: '#E3F2FD',
    },
    goalValue: {
        fontSize: 16,
        color: '#263238',
        fontWeight: '600',
        marginTop: 12,
        marginBottom: 4,
        textAlign: 'center',
    },
    goalLabel: {
        fontSize: 12,
        color: '#78909C',
        fontWeight: '500',
        textTransform: 'uppercase',
        letterSpacing: 0.5,
    },
    logoutButton: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        marginHorizontal: 20,
        marginTop: 32,
        marginBottom: 40,
        paddingVertical: 16,
        backgroundColor: '#fff',
        borderRadius: 16,
        borderWidth: 2,
        borderColor: '#FFCDD2',
        gap: 10,
        shadowColor: '#E53935',
        shadowOffset: {
            width: 0,
            height: 2,
        },
        shadowOpacity: 0.1,
        shadowRadius: 8,
        elevation: 2,
    },
    logoutText: {
        fontSize: 16,
        color: '#E53935',
        fontWeight: '700',
        letterSpacing: 0.3,
    },
    // Modal Styles
    modalContainer: {
        flex: 1,
        backgroundColor: '#F0F9FF',
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
        borderBottomColor: '#E3F2FD',
    },
    modalButton: {
        minWidth: 60,
    },
    modalTitle: {
        fontSize: 18,
        fontWeight: '700',
        color: '#263238',
        letterSpacing: 0.3,
    },
    modalCancel: {
        fontSize: 16,
        color: '#78909C',
        fontWeight: '500',
    },
    modalSave: {
        fontSize: 16,
        color: '#0288D1',
        fontWeight: '700',
        textAlign: 'right',
    },
    modalSaveDisabled: {
        color: '#B3E5FC',
    },
    modalContent: {
        flex: 1,
        paddingHorizontal: 20,
        paddingTop: 24,
    },
    inputGroup: {
        marginBottom: 24,
    },
    inputRow: {
        flexDirection: 'row',
    },
    inputLabel: {
        fontSize: 15,
        fontWeight: '600',
        color: '#263238',
        marginBottom: 10,
        letterSpacing: 0.2,
    },
    input: {
        backgroundColor: '#fff',
        borderRadius: 14,
        paddingHorizontal: 16,
        paddingVertical: 14,
        fontSize: 16,
        borderWidth: 2,
        borderColor: '#B3E5FC',
        color: '#263238',
    },
    genderContainer: {
        flexDirection: 'row',
        gap: 12,
    },
    genderButton: {
        flex: 1,
        flexDirection: 'row',
        justifyContent: 'center',
        alignItems: 'center',
        paddingVertical: 14,
        paddingHorizontal: 20,
        borderRadius: 14,
        backgroundColor: '#fff',
        borderWidth: 2,
        borderColor: '#B3E5FC',
        gap: 8,
    },
    genderButtonActive: {
        backgroundColor: '#0288D1',
        borderColor: '#0288D1',
    },
    genderButtonText: {
        fontSize: 16,
        color: '#78909C',
        fontWeight: '600',
    },
    genderButtonTextActive: {
        color: '#fff',
        fontWeight: '700',
    },
});

export default Profile;