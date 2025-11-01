import { View, Text, TextInput, TouchableOpacity, FlatList, KeyboardAvoidingView, Platform, Alert, StyleSheet } from 'react-native';
import React, { useState, useRef, useEffect } from 'react';
import { LinearGradient } from 'expo-linear-gradient';
import {useUser} from "../utils/AuthContext";
import Config from "../utils/Config";

const AivraChatbot = () => {
    const {user} = useUser()
    const [messages, setMessages] = useState([]);
    const [inputText, setInputText] = useState('');
    const [loading, setLoading] = useState(false);
    const flatListRef = useRef(null);

    // Load chat history on component mount
    useEffect(() => {
        loadChatHistory();
    }, []);

    const loadChatHistory = async () => {
        try {
            const URL = Config.BaseURL + '/api/v1/history/retrieve';
            const res = await fetch(URL, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    "user_id": user.uid,
                    "limit": 20
                }),
            });

            if (res.status === 200) {
                const data = await res.json();
                const formattedMessages = data.messages.map((msg, index) => ({
                    id: Date.now() + index,
                    text: msg.content,
                    isUser: msg.role === 'HumanMessage',
                    timestamp: new Date()
                }));
                setMessages(formattedMessages);
            }
        } catch (error) {
            console.error('Error loading chat history:', error);
        }
    };

    const handleQuery = async (query) => {
        const URL = Config.BaseURL + '/api/v1/query/simple';
        try {
            const res = await fetch(URL, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    "query": query,
                    "user_id": user.uid,
                    "verbose": false
                }),
            });

            if (res.status !== 200) {
                throw new Error(`API Error: ${res.statusText}`);
            }

            const ans = await res.json();
            return ans.answer;
        } catch (error) {
            console.error('Error in handleQuery:', error);
            throw error;
        }
    };

    const sendMessage = async () => {
        if (!inputText.trim() || loading) return;

        const userMessage = {
            id: Date.now(),
            text: inputText.trim(),
            isUser: true,
            timestamp: new Date()
        };

        const queryText = inputText.trim();
        setMessages(prev => [...prev, userMessage]);
        setInputText('');
        setLoading(true);

        try {
            const botResponse = await handleQuery(queryText);

            const botMessage = {
                id: Date.now() + 1,
                text: botResponse,
                isUser: false,
                timestamp: new Date()
            };

            setMessages(prev => [...prev, botMessage]);
        } catch (error) {
            const errorMessage = {
                id: Date.now() + 1,
                text: "I apologize, but I'm having trouble connecting right now. Please try again in a moment.",
                isUser: false,
                timestamp: new Date()
            };
            setMessages(prev => [...prev, errorMessage]);
            console.error('Error sending message:', error);
        } finally {
            setLoading(false);
        }
    };

    const clearChat = () => {
        Alert.alert(
            "Clear Conversation",
            "Are you sure you want to clear all messages?",
            [
                {
                    text: "Cancel",
                    style: "cancel"
                },
                {
                    text: "Clear",
                    style: "destructive",
                    onPress: async () => {
                        try {
                            const URL = Config.BaseURL + '/api/v1/history/clear';
                            await fetch(URL, {
                                method: 'POST',
                                headers: {
                                    'Content-Type': 'application/json',
                                },
                                body: JSON.stringify({
                                    "user_id": user.uid
                                }),
                            });
                            setMessages([]);
                        } catch (error) {
                            console.error('Error clearing chat:', error);
                            Alert.alert('Error', 'Failed to clear chat history');
                        }
                    }
                }
            ]
        );
    };

    const renderMessage = ({ item }) => (
        <View style={[
            styles.messageContainer,
            item.isUser ? styles.userMessageContainer : styles.botMessageContainer
        ]}>
            {!item.isUser && (
                <View style={styles.avatarContainer}>
                    <LinearGradient
                        colors={['#00c4ff', '#38914a']}
                        start={{ x: 0, y: 0 }}
                        end={{ x: 1, y: 1 }}
                        style={styles.avatar}
                    >
                        <View style={styles.avatarInner} />
                    </LinearGradient>
                </View>
            )}
            <View style={[
                styles.messageBubble,
                item.isUser ? styles.userMessage : styles.botMessage
            ]}>
                <Text style={[
                    styles.messageText,
                    item.isUser ? styles.userMessageText : styles.botMessageText
                ]}>
                    {item.text}
                </Text>
            </View>
        </View>
    );

    const suggestions = [
        'Guide me through mindful breathing',
        'Analyze my wellness patterns',
        'Create a balanced routine',
        'Interpret my biomarkers'
    ];

    return (
        <View style={styles.container}>
            <LinearGradient
                colors={['#f8fafc', '#fafaf9', '#fafafa']}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
                style={styles.gradientBackground}
            >
                <KeyboardAvoidingView
                    style={styles.keyboardView}
                    behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
                    keyboardVerticalOffset={0}
                >
                    {/* Header */}
                    <View style={styles.header}>
                        <View style={styles.headerLeft}>
                            <LinearGradient
                                colors={['#00c4ff', '#38914a']}
                                start={{ x: 0, y: 0 }}
                                end={{ x: 1, y: 1 }}
                                style={styles.headerIconContainer}
                            >
                                <View style={styles.headerIconInner} />
                            </LinearGradient>
                            <Text style={styles.headerTitle}>AivraAi</Text>
                        </View>
                        <TouchableOpacity onPress={clearChat} style={styles.menuButton}>
                            <Text style={styles.menuButtonText}>⋮</Text>
                        </TouchableOpacity>
                    </View>

                    {/* Messages List */}
                    <View style={styles.messagesList}>
                        <FlatList
                            ref={flatListRef}
                            data={messages}
                            renderItem={renderMessage}
                            keyExtractor={(item) => item.id.toString()}
                            onContentSizeChange={() => flatListRef.current?.scrollToEnd()}
                            contentContainerStyle={styles.messagesContent}
                            ListEmptyComponent={
                                <View style={styles.emptyContainer}>
                                    <View style={styles.emptyAvatarWrapper}>
                                        <LinearGradient
                                            colors={['rgba(0, 196, 255, 0.15)', 'rgba(56, 145, 74, 0.15)']}
                                            start={{ x: 0, y: 0 }}
                                            end={{ x: 1, y: 1 }}
                                            style={styles.emptyAvatarOuter}
                                        >
                                            <LinearGradient
                                                colors={['#00c4ff', '#38914a']}
                                                start={{ x: 0, y: 0 }}
                                                end={{ x: 1, y: 1 }}
                                                style={styles.emptyAvatar}
                                            >
                                                <View style={styles.emptyAvatarInner} />
                                            </LinearGradient>
                                        </LinearGradient>
                                    </View>

                                    <Text style={styles.emptyTitle}>good evening</Text>
                                    <Text style={styles.emptySubtitle}>how may i assist you?</Text>
                                    <Text style={styles.promptGuide}>choose a pathway below or express your intention to begin our conversation</Text>

                                    <View style={styles.suggestionsContainer}>
                                        {suggestions.map((suggestion, index) => (
                                            <TouchableOpacity
                                                key={index}
                                                style={styles.suggestionCard}
                                                onPress={() => setInputText(suggestion)}
                                                activeOpacity={0.7}
                                            >
                                                <Text style={styles.suggestionText}>{suggestion}</Text>
                                            </TouchableOpacity>
                                        ))}
                                    </View>

                                    <TouchableOpacity style={styles.refreshButton} activeOpacity={0.7}>
                                        <Text style={styles.refreshIcon}>↻</Text>
                                        <Text style={styles.refreshText}>refresh pathways</Text>
                                    </TouchableOpacity>
                                </View>
                            }
                        />
                    </View>

                    {/* Input Area */}
                    <View style={styles.inputContainer}>
                        <View style={styles.inputWrapper}>
                            <TextInput
                                style={styles.textInput}
                                value={inputText}
                                onChangeText={setInputText}
                                placeholder="share your thoughts with aivraai..."
                                placeholderTextColor="#a8a29e"
                                multiline
                                maxLength={500}
                                editable={!loading}
                            />
                            <View style={styles.inputFooter}>
                                <View style={styles.inputActions}>
                                    <TouchableOpacity style={styles.iconButton} activeOpacity={0.7}>
                                        <Text style={styles.sparkleIcon}>✦</Text>
                                        <Text style={styles.mindfulText}>mindful</Text>
                                    </TouchableOpacity>
                                    <TouchableOpacity style={styles.iconButton} activeOpacity={0.7}>
                                        <Text style={styles.iconButtonText}>📷</Text>
                                    </TouchableOpacity>
                                    <TouchableOpacity style={styles.iconButton} activeOpacity={0.7}>
                                        <Text style={styles.iconButtonText}>📎</Text>
                                    </TouchableOpacity>
                                </View>
                                {loading && (
                                    <View style={styles.loadingDots}>
                                        <View style={[styles.dot, styles.dot1]} />
                                        <View style={[styles.dot, styles.dot2]} />
                                        <View style={[styles.dot, styles.dot3]} />
                                    </View>
                                )}
                            </View>
                        </View>
                        {inputText.trim().length > 0 && !loading && (
                            <TouchableOpacity
                                style={styles.sendButtonWrapper}
                                onPress={sendMessage}
                                activeOpacity={0.8}
                            >
                                <LinearGradient
                                    colors={['#00c4ff', '#38914a']}
                                    start={{ x: 0, y: 0 }}
                                    end={{ x: 1, y: 1 }}
                                    style={styles.sendButton}
                                >
                                    <Text style={styles.sendButtonIcon}>➤</Text>
                                </LinearGradient>
                            </TouchableOpacity>
                        )}
                    </View>
                    <Text style={styles.disclaimer}>responses are synthesized with care—verify as needed</Text>
                </KeyboardAvoidingView>
            </LinearGradient>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#f8fafc',
    },
    gradientBackground: {
        flex: 1,
    },
    keyboardView: {
        flex: 1,
    },
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingHorizontal: 20,
        paddingTop: 60,
        paddingBottom: 16,
        backgroundColor: 'transparent',
        borderBottomWidth: 0.5,
        borderBottomColor: 'rgba(120, 113, 108, 0.15)',
    },
    headerLeft: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    headerIconContainer: {
        width: 32,
        height: 32,
        borderRadius: 10,
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 12,
    },
    headerIconInner: {
        width: 12,
        height: 12,
        borderRadius: 6,
        backgroundColor: 'rgba(255,255,255,0.35)',
    },
    headerTitle: {
        fontSize: 18,
        fontWeight: '300',
        color: '#44403c',
        letterSpacing: 1,
    },
    menuButton: {
        width: 32,
        height: 32,
        justifyContent: 'center',
        alignItems: 'center',
    },
    menuButtonText: {
        fontSize: 20,
        color: '#78716c',
        fontWeight: '400',
    },
    messagesList: {
        flex: 1,
        backgroundColor: 'transparent',
    },
    messagesContent: {
        paddingHorizontal: 16,
        paddingTop: 20,
        flexGrow: 1,
    },
    emptyContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        paddingHorizontal: 24,
        paddingTop: 60,
    },
    emptyAvatarWrapper: {
        marginBottom: 32,
    },
    emptyAvatarOuter: {
        width: 96,
        height: 96,
        borderRadius: 48,
        justifyContent: 'center',
        alignItems: 'center',
        borderWidth: 0.5,
        borderColor: 'rgba(0, 196, 255, 0.2)',
    },
    emptyAvatar: {
        width: 48,
        height: 48,
        borderRadius: 24,
        justifyContent: 'center',
        alignItems: 'center',
    },
    emptyAvatarInner: {
        width: 20,
        height: 20,
        borderRadius: 10,
        backgroundColor: 'rgba(255,255,255,0.35)',
    },
    emptyTitle: {
        fontSize: 28,
        fontWeight: '300',
        color: '#44403c',
        marginBottom: 4,
        textAlign: 'center',
    },
    emptySubtitle: {
        fontSize: 22,
        fontWeight: '200',
        color: '#78716c',
        marginBottom: 20,
        textAlign: 'center',
    },
    promptGuide: {
        fontSize: 13,
        color: '#78716c',
        textAlign: 'center',
        marginBottom: 28,
        paddingHorizontal: 20,
        lineHeight: 20,
        fontWeight: '300',
    },
    suggestionsContainer: {
        width: '100%',
        marginBottom: 24,
    },
    suggestionCard: {
        backgroundColor: 'rgba(255, 255, 255, 0.7)',
        paddingVertical: 16,
        paddingHorizontal: 20,
        borderRadius: 16,
        marginBottom: 10,
        borderWidth: 0.5,
        borderColor: 'rgba(120, 113, 108, 0.2)',
    },
    suggestionText: {
        fontSize: 14,
        color: '#44403c',
        fontWeight: '300',
    },
    refreshButton: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingVertical: 8,
    },
    refreshIcon: {
        fontSize: 16,
        color: '#00c4ff',
        marginRight: 6,
    },
    refreshText: {
        fontSize: 14,
        color: '#00c4ff',
        fontWeight: '300',
    },
    messageContainer: {
        marginVertical: 8,
        flexDirection: 'row',
        alignItems: 'flex-start',
    },
    userMessageContainer: {
        justifyContent: 'flex-end',
        paddingLeft: 50,
    },
    botMessageContainer: {
        justifyContent: 'flex-start',
        paddingRight: 50,
    },
    avatarContainer: {
        marginRight: 10,
        marginTop: 2,
    },
    avatar: {
        width: 36,
        height: 36,
        borderRadius: 18,
        justifyContent: 'center',
        alignItems: 'center',
        borderWidth: 0.5,
        borderColor: 'rgba(0, 196, 255, 0.2)',
    },
    avatarInner: {
        width: 16,
        height: 16,
        borderRadius: 8,
        backgroundColor: 'rgba(255,255,255,0.35)',
    },
    messageBubble: {
        paddingVertical: 14,
        paddingHorizontal: 18,
        borderRadius: 18,
        maxWidth: '100%',
    },
    userMessage: {
        backgroundColor: 'rgba(209, 250, 229, 0.6)',
        alignSelf: 'flex-end',
        borderBottomRightRadius: 4,
        borderWidth: 0.5,
        borderColor: 'rgba(0, 196, 255, 0.15)',
    },
    botMessage: {
        backgroundColor: 'rgba(255, 255, 255, 0.7)',
        alignSelf: 'flex-start',
        borderBottomLeftRadius: 4,
        borderWidth: 0.5,
        borderColor: 'rgba(120, 113, 108, 0.2)',
    },
    messageText: {
        fontSize: 14,
        lineHeight: 21,
        fontWeight: '300',
    },
    userMessageText: {
        color: '#1c1917',
    },
    botMessageText: {
        color: '#1c1917',
    },
    inputContainer: {
        flexDirection: 'row',
        paddingHorizontal: 16,
        paddingTop: 12,
        paddingBottom: 6,
        backgroundColor: 'transparent',
        alignItems: 'flex-end',
        gap: 8,
    },
    inputWrapper: {
        flex: 1,
        backgroundColor: 'rgba(255, 255, 255, 0.8)',
        borderRadius: 20,
        paddingHorizontal: 16,
        paddingTop: 12,
        paddingBottom: 8,
        borderWidth: 0.5,
        borderColor: 'rgba(120, 113, 108, 0.2)',
    },
    textInput: {
        fontSize: 14,
        color: '#1c1917',
        maxHeight: 100,
        minHeight: 20,
        paddingTop: 0,
        paddingBottom: 8,
        fontWeight: '300',
    },
    inputFooter: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingTop: 6,
        borderTopWidth: 0.5,
        borderTopColor: 'rgba(120, 113, 108, 0.15)',
    },
    inputActions: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    iconButton: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingVertical: 6,
        paddingHorizontal: 8,
        marginRight: 4,
        borderRadius: 8,
    },
    sparkleIcon: {
        fontSize: 12,
        color: '#00c4ff',
        marginRight: 4,
    },
    mindfulText: {
        fontSize: 12,
        color: '#00c4ff',
        fontWeight: '300',
    },
    iconButtonText: {
        fontSize: 16,
    },
    loadingDots: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 4,
    },
    dot: {
        width: 4,
        height: 4,
        borderRadius: 2,
        backgroundColor: '#047857',
    },
    dot1: {
        opacity: 0.4,
    },
    dot2: {
        opacity: 0.6,
    },
    dot3: {
        opacity: 0.8,
    },
    sendButtonWrapper: {
        marginBottom: 8,
    },
    sendButton: {
        width: 44,
        height: 44,
        borderRadius: 22,
        justifyContent: 'center',
        alignItems: 'center',
    },
    sendButtonIcon: {
        fontSize: 18,
        color: '#fff',
    },
    disclaimer: {
        fontSize: 11,
        color: '#a8a29e',
        textAlign: 'center',
        paddingBottom: 12,
        backgroundColor: 'transparent',
        fontWeight: '300',
    },
});

export default AivraChatbot;