import React from 'react';
import {
    View,
    Text,
    StyleSheet,
    TouchableOpacity
} from 'react-native';

const PostsSection = ({ profile }) => {
    const publicPostCount = profile.public_post?.length || 0;
    const privatePostCount = profile.private_post?.length || 0;
    const totalPosts = publicPostCount + privatePostCount;

    return (
        <View style={styles.postsSection}>
            <View style={styles.postsHeader}>
                <Text style={styles.sectionTitle}>Posts</Text>
                <View style={styles.postTypeToggle}>
                    <TouchableOpacity style={styles.toggleButton}>
                        <Text style={styles.toggleText}>All</Text>
                    </TouchableOpacity>
                    <TouchableOpacity style={styles.toggleButton}>
                        <Text style={styles.toggleText}>Public</Text>
                    </TouchableOpacity>
                    <TouchableOpacity style={styles.toggleButton}>
                        <Text style={styles.toggleText}>Private</Text>
                    </TouchableOpacity>
                </View>
            </View>

            <View style={styles.postStats}>
                <View style={styles.postStatCard}>
                    <Text style={styles.postStatNumber}>
                        {publicPostCount}
                    </Text>
                    <Text style={styles.postStatLabel}>Public Posts</Text>
                </View>
                <View style={styles.postStatCard}>
                    <Text style={styles.postStatNumber}>
                        {privatePostCount}
                    </Text>
                    <Text style={styles.postStatLabel}>Private Posts</Text>
                </View>
            </View>

            {/* Empty state for posts */}
            {totalPosts === 0 && (
                <View style={styles.emptyPostsContainer}>
                    <View style={styles.emptyPostsIcon}>
                        <Text style={styles.emptyPostsIconText}>📝</Text>
                    </View>
                    <Text style={styles.emptyPostsTitle}>No Posts Yet</Text>
                    <Text style={styles.emptyPostsSubtitle}>
                        Your posts will appear here once you start sharing.
                    </Text>
                    <TouchableOpacity style={styles.createPostButton}>
                        <Text style={styles.createPostButtonText}>Create Your First Post</Text>
                    </TouchableOpacity>
                </View>
            )}
        </View>
    );
};

const styles = StyleSheet.create({
    postsSection: {
        backgroundColor: '#fff',
        marginTop: 8,
        paddingHorizontal: 20,
        paddingVertical: 20,
    },
    postsHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 15,
    },
    sectionTitle: {
        fontSize: 18,
        fontWeight: 'bold',
        color: '#333',
    },
    postTypeToggle: {
        flexDirection: 'row',
        backgroundColor: '#f5f5f5',
        borderRadius: 8,
        padding: 2,
    },
    toggleButton: {
        paddingHorizontal: 12,
        paddingVertical: 6,
        borderRadius: 6,
    },
    toggleText: {
        fontSize: 12,
        color: '#666',
        fontWeight: '500',
    },
    postStats: {
        flexDirection: 'row',
        gap: 15,
        marginBottom: 20,
    },
    postStatCard: {
        flex: 1,
        backgroundColor: '#f8f9fa',
        padding: 20,
        borderRadius: 12,
        alignItems: 'center',
        borderWidth: 1,
        borderColor: '#f0f0f0',
    },
    postStatNumber: {
        fontSize: 24,
        fontWeight: 'bold',
        color: '#ff7600',
        marginBottom: 4,
    },
    postStatLabel: {
        fontSize: 14,
        color: '#666',
    },
    emptyPostsContainer: {
        alignItems: 'center',
        paddingVertical: 40,
    },
    emptyPostsIcon: {
        width: 80,
        height: 80,
        borderRadius: 40,
        backgroundColor: '#f8f9fa',
        borderWidth: 2,
        borderColor: '#e9ecef',
        alignItems: 'center',
        justifyContent: 'center',
        marginBottom: 20,
    },
    emptyPostsIconText: {
        fontSize: 32,
    },
    emptyPostsTitle: {
        fontSize: 20,
        fontWeight: '600',
        color: '#333',
        marginBottom: 8,
    },
    emptyPostsSubtitle: {
        fontSize: 14,
        color: '#666',
        textAlign: 'center',
        marginBottom: 20,
        lineHeight: 20,
    },
    createPostButton: {
        backgroundColor: '#ff7600',
        paddingHorizontal: 24,
        paddingVertical: 12,
        borderRadius: 8,
    },
    createPostButtonText: {
        color: '#fff',
        fontSize: 15,
        fontWeight: '600',
    },
});

export default PostsSection;