import React from 'react';
import {
    View,
    Text,
    StyleSheet,
    TextInput,
    TouchableOpacity,
    Animated,
    Pressable,
    KeyboardAvoidingView,
    Platform,
    ScrollView,
    Alert
} from 'react-native';
import { getAuth, createUserWithEmailAndPassword, sendEmailVerification, AuthError } from 'firebase/auth';
import { app } from '@/firebaseConfig';

// Props interface for the component
interface BottomSheetProps {
    setStatus: (status: boolean) => void;
}

const BottomSheet: React.FC<BottomSheetProps> = ({ setStatus }) => {
    const slide = React.useRef<Animated.Value>(new Animated.Value(300)).current;
    const [email, setEmail] = React.useState<string>('');
    const [password, setPassword] = React.useState<string>('');
    const [isLoading, setIsLoading] = React.useState<boolean>(false);
    const auth = getAuth(app);

    const handleRegister = async (): Promise<void> => {
        if(email === '' || password === ''){
            Alert.alert('Error', 'Email and password are required');
            return;
        }

        setIsLoading(true);

        try {
            // Create user account
            const userCredential = await createUserWithEmailAndPassword(auth, email, password);
            const user = userCredential.user;

            // Send email verification
            await sendEmailVerification(user);

        } catch (error) {
            let errorMessage: string = 'An error occurred during registration';

            const authError = error as AuthError;
            switch (authError.code) {
                case 'auth/email-already-in-use':
                    errorMessage = 'This email is already registered';
                    break;
                case 'auth/weak-password':
                    errorMessage = 'Password should be at least 6 characters';
                    break;
                case 'auth/invalid-email':
                    errorMessage = 'Please enter a valid email address';
                    break;
                default:
                    errorMessage = authError.message;
            }

            Alert.alert('Registration Failed', errorMessage);
        } finally {
            setIsLoading(false);
        }
    };

    const slideUp = (): void => {
        // Will change slide up the bottom sheet
        Animated.timing(slide, {
            toValue: 0,
            duration: 800,
            useNativeDriver: true,
        }).start();
    };

    const slideDown = (): void => {
        // Will slide down the bottom sheet
        Animated.timing(slide, {
            toValue: 300,
            duration: 800,
            useNativeDriver: true,
        }).start();
    };

    React.useEffect(() => {
        slideUp();
    }, []); // Added empty dependency array

    const closeModal = (): void => {
        slideDown();

        setTimeout(() => {
            setStatus(false);
        }, 800);
    };

    return(
        <KeyboardAvoidingView
            style={styles.backdrop}
            behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
            keyboardVerticalOffset={0}
        >
            <Pressable onPress={closeModal} style={styles.backdrop}>
                <View style={styles.bottomSheetContainer}>
                    <Animated.View style={[styles.bottomSheet, { transform: [{ translateY: slide }] }]}>
                        <ScrollView
                            contentContainerStyle={styles.scrollContent}
                            keyboardShouldPersistTaps="handled"
                            showsVerticalScrollIndicator={false}
                        >
                            <Text style={styles.title}>SignUp</Text>
                            <View style={styles.formContainer}>
                                <TextInput
                                    placeholder='Enter Email'
                                    style={styles.input}
                                    onChangeText={setEmail}
                                    keyboardType="email-address"
                                    autoCapitalize="none"
                                    autoCorrect={false}
                                    editable={!isLoading}
                                />

                                <TextInput
                                    placeholder='Enter Password'
                                    style={styles.input}
                                    secureTextEntry={true}
                                    onChangeText={setPassword}
                                    autoCapitalize="none"
                                    autoCorrect={false}
                                    editable={!isLoading}
                                />

                                <TouchableOpacity
                                    onPress={handleRegister}
                                    style={[styles.button, isLoading && styles.buttonDisabled]}
                                    disabled={isLoading}
                                >
                                    <Text style={styles.buttonText}>
                                        {isLoading ? 'Creating Account...' : 'Register'}
                                    </Text>
                                </TouchableOpacity>
                            </View>
                        </ScrollView>
                    </Animated.View>
                </View>
            </Pressable>
        </KeyboardAvoidingView>
    );
};

export default BottomSheet;

const styles = StyleSheet.create({
    backdrop: {
        position: 'absolute',
        flex: 1,
        top: 0,
        left: 0,
        backgroundColor: 'rgba(0,0,0,0.5)',
        width: '100%',
        height: '100%',
        justifyContent: 'flex-end'
    },
    bottomSheetContainer: {
        width: '100%',
        height: '40%',
        justifyContent: 'flex-end',
    },
    bottomSheet: {
        width: '100%',
        height: '100%',
        backgroundColor: 'white',
        borderTopRightRadius: 20,
        borderTopLeftRadius: 20,
        paddingHorizontal: 20,
        paddingVertical: 20
    },
    scrollContent: {
        flexGrow: 1,
        justifyContent: 'flex-start',
    },
    title: {
        fontSize: 25,
        fontWeight: 'bold',
        textAlign: 'center',
        marginBottom: 10
    },
    formContainer: {
        marginTop: 20,
        flex: 1
    },
    input: {
        width: '100%',
        height: 45,
        borderRadius: 10,
        borderWidth: 1,
        borderColor: '#bcbcbc',
        paddingHorizontal: 15,
        marginBottom: 15
    },
    button: {
        paddingHorizontal: 30,
        paddingVertical: 12,
        borderRadius: 10,
        backgroundColor: '#10B981',
        alignItems: 'center',
        marginTop: 15
    },
    buttonText: {
        fontSize: 18,
        fontWeight: 'bold',
        color: 'white'
    },
    buttonDisabled: {
        opacity: 0.6,
    }
});