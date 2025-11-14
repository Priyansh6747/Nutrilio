import { View, Text, TextInput, TouchableOpacity, FlatList, KeyboardAvoidingView, Platform, Alert, StyleSheet, Animated } from 'react-native';
import React, { useState, useRef, useEffect } from 'react';
import { LinearGradient } from 'expo-linear-gradient';
import Markdown from 'react-native-markdown-display';
import {useUser} from "../utils/AuthContext";
import Config from "../utils/Config";

const AivraChatbot = () => {
    const {user} = useUser()
    const [messages, setMessages] = useState([]);
    const [inputText, setInputText] = useState('');
    const [loading, setLoading] = useState(false);
    const [streamingText, setStreamingText] = useState('');
    const [isStreaming, setIsStreaming] = useState(false);
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

    // Simulate streaming effect for better UX
    const streamResponse = (text) => {
        return new Promise((resolve) => {
            setIsStreaming(true);
            setStreamingText('');
            
            let index = 0;
            const words = text.split(' ');
            
            const interval = setInterval(() => {
                if (index < words.length) {
                    setStreamingText(prev => prev + (index > 0 ? ' ' : '') + words[index]);
                    index++;
                    // Auto-scroll during streaming
                    setTimeout(() => flatListRef.current?.scrollToEnd({ animated: true }), 50);
                } else {
                    clearInterval(interval);
                    setIsStreaming(false);
                    resolve();
                }
            }, 50); // Adjust speed here (lower = faster)
        });
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

            // Start streaming animation
            await streamResponse(botResponse);

            const botMessage = {
                id: Date.now() + 1,
                text: botResponse,
                isUser: false,
                timestamp: new Date()
            };

            setMessages(prev => [...prev, botMessage]);
            setStreamingText('');
        } catch (error) {
            const errorMessage = {
                id: Date.now() + 1,
                text: "I apologize, but I'm having trouble connecting right now. Please try again in a moment.",
                isUser: false,
                timestamp: new Date()
            };
            setMessages(prev => [...prev, errorMessage]);
            setIsStreaming(false);
            setStreamingText('');
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

    const TypingIndicator = () => {
        const dot1 = useRef(new Animated.Value(0)).current;
        const dot2 = useRef(new Animated.Value(0)).current;
        const dot3 = useRef(new Animated.Value(0)).current;

        useEffect(() => {
            const animate = (dot, delay) => {
                Animated.loop(
                    Animated.sequence([
                        Animated.delay(delay),
                        Animated.timing(dot, {
                            toValue: 1,
                            duration: 400,
                            useNativeDriver: true,
                        }),
                        Animated.timing(dot, {
                            toValue: 0,
                            duration: 400,
                            useNativeDriver: true,
                        }),
                    ])
                ).start();
            };

            animate(dot1, 0);
            animate(dot2, 150);
            animate(dot3, 300);
        }, []);

        return (
            <View style={styles.typingContainer}>
                <Animated.View style={[styles.typingDot, { opacity: dot1 }]} />
                <Animated.View style={[styles.typingDot, { opacity: dot2 }]} />
                <Animated.View style={[styles.typingDot, { opacity: dot3 }]} />
            </View>
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
                {item.isUser ? (
                    <Text style={[styles.messageText, styles.userMessageText]}>
                        {item.text}
                    </Text>
                ) : (
                    <Markdown style={markdownStyles}>
                        {item.text}
                    </Markdown>
                )}
            </View>
        </View>
    );

    const renderStreamingMessage = () => {
        if (!isStreaming || !streamingText) return null;

        return (
            <View style={[styles.messageContainer, styles.botMessageContainer]}>
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
                <View style={[styles.messageBubble, styles.botMessage, styles.streamingBubble]}>
                    <Markdown style={markdownStyles}>
                        {streamingText}
                    </Markdown>
                    <View style={styles.cursorBlink} />
                </View>
            </View>
        );
    };

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
                            onContentSizeChange={() => flatListRef.current?.scrollToEnd({ animated: true })}
                            contentContainerStyle={styles.messagesContent}
                            ListFooterComponent={
                                <>
                                    {renderStreamingMessage()}
                                    {loading && !isStreaming && (
                                        <View style={[styles.messageContainer, styles.botMessageContainer]}>
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
                                            <View style={[styles.messageBubble, styles.botMessage]}>
                                                <TypingIndicator />
                                            </View>
                                        </View>
                                    )}
                                </>
                            }
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
                                {loading && !isStreaming && (
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

const markdownStyles = {
    body: {
        color: '#1c1917',
        fontSize: 14,
        lineHeight: 21,
        fontWeight: '300',
    },
    paragraph: {
        marginTop: 0,
        marginBottom: 8,
    },
    strong: {
        fontWeight: '600',
        color: '#0f172a',
    },
    em: {
        fontStyle: 'italic',
    },
    code_inline: {
        backgroundColor: 'rgba(100, 116, 139, 0.1)',
        color: '#0f172a',
        paddingHorizontal: 6,
        paddingVertical: 2,
        borderRadius: 4,
        fontSize: 13,
        fontFamily: Platform.OS === 'ios' ? 'Menlo' : 'monospace',
    },
    code_block: {
        backgroundColor: 'rgba(100, 116, 139, 0.1)',
        color: '#0f172a',
        padding: 12,
        borderRadius: 8,
        fontSize: 13,
        fontFamily: Platform.OS === 'ios' ? 'Menlo' : 'monospace',
        marginVertical: 8,
    },
    fence: {
        backgroundColor: 'rgba(100, 116, 139, 0.1)',
        color: '#0f172a',
        padding: 12,
        borderRadius: 8,
        fontSize: 13,
        fontFamily: Platform.OS === 'ios' ? 'Menlo' : 'monospace',
        marginVertical: 8,
    },
    bullet_list: {
        marginBottom: 8,
    },
    ordered_list: {
        marginBottom: 8,
    },
    list_item: {
        flexDirection: 'row',
        marginBottom: 4,
    },
    bullet_list_icon: {
        color: '#00c4ff',
        fontSize: 14,
        lineHeight: 21,
        marginRight: 8,
    },
    ordered_list_icon: {
        color: '#00c4ff',
        fontSize: 14,
        lineHeight: 21,
        marginRight: 8,
    },
    blockquote: {
        backgroundColor: 'rgba(0, 196, 255, 0.05)',
        borderLeftWidth: 3,
        borderLeftColor: '#00c4ff',
        paddingLeft: 12,
        paddingVertical: 8,
        marginVertical: 8,
    },
    heading1: {
        fontSize: 20,
        fontWeight: '600',
        color: '#0f172a',
        marginTop: 12,
        marginBottom: 8,
    },
    heading2: {
        fontSize: 18,
        fontWeight: '600',
        color: '#0f172a',
        marginTop: 10,
        marginBottom: 6,
    },
    heading3: {
        fontSize: 16,
        fontWeight: '600',
        color: '#0f172a',
        marginTop: 8,
        marginBottom: 4,
    },
    link: {
        color: '#00c4ff',
        textDecorationLine: 'underline',
    },
    hr: {
        backgroundColor: 'rgba(120, 113, 108, 0.2)',
        height: 1,
        marginVertical: 12,
    },
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
        paddingBottom: 20,
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
    streamingBubble: {
        borderWidth: 1,
        borderColor: 'rgba(0, 196, 255, 0.3)',
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
    typingContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 6,
        paddingVertical: 4,
    },
    typingDot: {
        width: 8,
        height: 8,
        borderRadius: 4,
        backgroundColor: '#00c4ff',
    },
    cursorBlink: {
        width: 2,
        height: 16,
        backgroundColor: '#00c4ff',
        marginLeft: 2,
        opacity: 0.8,
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