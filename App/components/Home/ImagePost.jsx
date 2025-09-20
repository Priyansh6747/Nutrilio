import {View, Text, Image, TouchableOpacity, StyleSheet} from 'react-native'
import React, {useEffect, useState} from 'react'

const ImagePost = ({data}) => {
    const [imageLoaded, setImageLoaded] = useState(false);
    const [upvoted, setUpvoted] = useState(false);

    useEffect(() => {
        // Check if current user has upvoted this post
        // You can replace 'currentUserId' with actual current user ID
        const currentUserId = 'currentUser';
        setUpvoted(data.upvotes?.includes(currentUserId));
    }, [data.upvotes]);

    const formatDate = (dateString) => {
        const date = new Date(dateString);
        const now = new Date();
        const diffInHours = Math.floor((now - date) / (1000 * 60 * 60));

        if (diffInHours < 1) return 'Just now';
        if (diffInHours < 24) return `${diffInHours}h ago`;
        if (diffInHours < 168) return `${Math.floor(diffInHours / 24)}d ago`;
        return date.toLocaleDateString();
    };

    const handleUpvote = () => {
        setUpvoted(!upvoted);
        // Here you would typically call an API to update the upvote
        console.log('Upvote toggled');
    };

    const handleComment = () => {
        // Handle comment action
        console.log('Comment pressed');
    };

    const handleShare = () => {
        // Handle share action
        console.log('Share pressed');
    };

    return (
        <View style={styles.container}>
            {/* Header */}
            <View style={styles.header}>
                <View style={styles.authorInfo}>
                    <View style={styles.avatar}>
                        <Text style={styles.avatarText}>
                            {data.authorId?.charAt(0)?.toUpperCase() || 'U'}
                        </Text>
                    </View>
                    <View style={styles.authorDetails}>
                        <Text style={styles.authorName}>{data.authorId}</Text>
                        <Text style={styles.timestamp}>{formatDate(data.createdAt)}</Text>
                    </View>
                </View>
                <View style={styles.postType}>
                    <Text style={styles.postTypeText}>{data.postType}</Text>
                </View>
            </View>

            {/* Caption */}
            {data.caption && (
                <View style={styles.captionContainer}>
                    <Text style={styles.caption}>{data.caption}</Text>
                </View>
            )}

            {/* Image */}
            {data.mediaUrl && (
                <View style={styles.imageContainer}>
                    <Image
                        source={{ uri: data.mediaUrl }}
                        style={styles.image}
                        onLoad={() => setImageLoaded(true)}
                        onError={() => setImageLoaded(false)}
                        resizeMode="cover"
                    />
                    {!imageLoaded && (
                        <View style={styles.imagePlaceholder}>
                            <Text style={styles.placeholderText}>Loading...</Text>
                        </View>
                    )}
                </View>
            )}

            {/* Content */}
            {data.content && (
                <View style={styles.contentContainer}>
                    <Text style={styles.content}>{data.content}</Text>
                </View>
            )}

            {/* Actions */}
            <View style={styles.actionsContainer}>
                <TouchableOpacity
                    style={[styles.actionButton, upvoted && styles.upvotedButton]}
                    onPress={handleUpvote}
                >
                    <Text style={[styles.actionText, upvoted && styles.upvotedText]}>
                        ↑ {data.upvotes?.length || 0}
                    </Text>
                </TouchableOpacity>

                <TouchableOpacity style={styles.actionButton} onPress={handleComment}>
                    <Text style={styles.actionText}>
                        💬 {data.commentIDs?.length || 0}
                    </Text>
                </TouchableOpacity>

                <TouchableOpacity style={styles.actionButton} onPress={handleShare}>
                    <Text style={styles.actionText}>↗️ Share</Text>
                </TouchableOpacity>
            </View>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        backgroundColor: '#fff',
        marginVertical: 8,
        borderRadius: 12,
        shadowColor: '#000',
        shadowOffset: {
            width: 0,
            height: 2,
        },
        shadowOpacity: 0.1,
        shadowRadius: 3.84,
        elevation: 5,
    },
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        padding: 16,
        paddingBottom: 8,
    },
    authorInfo: {
        flexDirection: 'row',
        alignItems: 'center',
        flex: 1,
    },
    avatar: {
        width: 40,
        height: 40,
        borderRadius: 20,
        backgroundColor: '#007AFF',
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 12,
    },
    avatarText: {
        color: '#fff',
        fontWeight: 'bold',
        fontSize: 16,
    },
    authorDetails: {
        flex: 1,
    },
    authorName: {
        fontSize: 16,
        fontWeight: '600',
        color: '#333',
    },
    timestamp: {
        fontSize: 12,
        color: '#666',
        marginTop: 2,
    },
    postType: {
        backgroundColor: '#f0f0f0',
        paddingHorizontal: 8,
        paddingVertical: 4,
        borderRadius: 12,
    },
    postTypeText: {
        fontSize: 12,
        color: '#666',
        textTransform: 'capitalize',
    },
    captionContainer: {
        paddingHorizontal: 16,
        paddingBottom: 8,
    },
    caption: {
        fontSize: 16,
        color: '#333',
        lineHeight: 22,
    },
    imageContainer: {
        position: 'relative',
        marginHorizontal: 16,
        borderRadius: 8,
        overflow: 'hidden',
        backgroundColor: '#f5f5f5',
    },
    image: {
        width: '100%',
        height: 300,
    },
    imagePlaceholder: {
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: '#f5f5f5',
    },
    placeholderText: {
        color: '#999',
        fontSize: 14,
    },
    contentContainer: {
        paddingHorizontal: 16,
        paddingTop: 12,
    },
    content: {
        fontSize: 15,
        color: '#333',
        lineHeight: 20,
    },
    actionsContainer: {
        flexDirection: 'row',
        justifyContent: 'space-around',
        alignItems: 'center',
        paddingHorizontal: 16,
        paddingVertical: 12,
        borderTopWidth: 1,
        borderTopColor: '#f0f0f0',
        marginTop: 12,
    },
    actionButton: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingVertical: 8,
        paddingHorizontal: 16,
        borderRadius: 20,
        backgroundColor: '#f8f9fa',
    },
    actionText: {
        fontSize: 14,
        color: '#666',
        fontWeight: '500',
    },
    upvotedButton: {
        backgroundColor: '#007AFF20',
    },
    upvotedText: {
        color: '#007AFF',
    },
});

export default ImagePost;