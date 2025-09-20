import {View, Text, StyleSheet} from 'react-native'
import React, {useEffect} from 'react'

const PublicText = ({data}) => {
    // Format the date for display
    const formatDate = (dateString) => {
        const date = new Date(dateString);
        return date.toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'short',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
    };

    // Get upvote count
    const upvoteCount = data?.upvotes?.length || 0;

    // Get comment count
    const commentCount = data?.commentIDs?.length || 0;

    return (
        <View style={styles.container}>
            {/* Main content */}
            <Text style={styles.content}>{data?.content}</Text>

            {/* Post metadata */}
            <View style={styles.metaContainer}>
                <Text style={styles.metaText}>
                    {data?.createdAt && formatDate(data.createdAt)}
                </Text>

                {/* Post type indicator */}
                {data?.postType && (
                    <Text style={styles.postType}>
                        {data.postType.charAt(0).toUpperCase() + data.postType.slice(1)}
                    </Text>
                )}
            </View>

            {/* Interaction stats */}
            <View style={styles.statsContainer}>
                <Text style={styles.statText}>
                    ↑ {upvoteCount} {upvoteCount === 1 ? 'upvote' : 'upvotes'}
                </Text>
                <Text style={styles.statText}>
                    💬 {commentCount} {commentCount === 1 ? 'comment' : 'comments'}
                </Text>
            </View>

            {/* Author ID (you might want to replace this with actual user data) */}
            <Text style={styles.authorText}>
                Author: {data?.authorId?.substring(0, 8)}...
            </Text>
        </View>
    )
}

const styles = StyleSheet.create({
    container: {
        backgroundColor: '#fff',
        padding: 16,
        marginVertical: 8,
        marginHorizontal: 16,
        borderRadius: 8,
        shadowColor: '#000',
        shadowOffset: {
            width: 0,
            height: 2,
        },
        shadowOpacity: 0.1,
        shadowRadius: 3.84,
        elevation: 5,
    },
    content: {
        fontSize: 16,
        lineHeight: 24,
        color: '#333',
        marginBottom: 12,
    },
    metaContainer: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 8,
    },
    metaText: {
        fontSize: 12,
        color: '#666',
    },
    postType: {
        fontSize: 12,
        color: '#007AFF',
        fontWeight: '500',
    },
    statsContainer: {
        flexDirection: 'row',
        gap: 16,
        marginBottom: 8,
    },
    statText: {
        fontSize: 12,
        color: '#666',
    },
    authorText: {
        fontSize: 11,
        color: '#999',
        fontStyle: 'italic',
    },
});

export default PublicText