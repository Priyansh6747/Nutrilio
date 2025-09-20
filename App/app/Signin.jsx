import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, TextInput, Alert } from 'react-native';
import { signInWithEmailAndPassword } from 'firebase/auth';
import { auth } from '../firebaseConfig';
import BottomSheet from '../Components/BottomSheet';

export default function Signin() {
    const [status, setStatus] = useState(false);
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [loading, setLoading] = useState(false);

    const handleLogin = async () => {
        if (email === '' || password === '') {
            Alert.alert('Error', 'Password and email are required');
            return;
        }

        setLoading(true);

        try {
            const userCredentials = await signInWithEmailAndPassword(auth, email, password);
            const user = userCredentials.user;

            console.log('User logged in:', {
                uid: user.uid,
                email: user.email,
                emailVerified: user.emailVerified,
                displayName: user.displayName
            });


        } catch (error) {
            console.log('Authentication failed!');
            console.log('Failed email:', email);
            console.log('Firebase error code:', error.code);
            console.log('Error message:', error.message);

            let userMessage = 'Login failed. Please try again.';

            switch (error.code) {
                case 'auth/user-not-found':
                    userMessage = 'No account found with this email.';
                    break;
                case 'auth/wrong-password':
                    userMessage = 'Incorrect password.';
                    break;
                case 'auth/invalid-email':
                    userMessage = 'Invalid email format.';
                    break;
                case 'auth/user-disabled':
                    userMessage = 'This account has been disabled.';
                    break;
                case 'auth/too-many-requests':
                    userMessage = 'Too many failed attempts. Please try again later.';
                    break;
                case 'auth/invalid-credential':
                    userMessage = 'Invalid email or password.';
                    break;
            }

            console.log('💬 User message:', userMessage);
            Alert.alert('Login Failed', userMessage);
        } finally {
            setLoading(false);
        }
    };

    return (
        <View style={styles.container}>
            <Text style={styles.title}>Login Here</Text>

            <View style={styles.inputContainer}>
                <TextInput
                    placeholder="Enter Email"
                    style={styles.input}
                    onChangeText={setEmail}
                    value={email}
                    keyboardType="email-address"
                    autoCapitalize="none"
                    editable={!loading}
                />

                <TextInput
                    placeholder="Enter Password"
                    style={styles.input}
                    secureTextEntry={true}
                    onChangeText={setPassword}
                    value={password}
                    editable={!loading}
                />
            </View>

            <TouchableOpacity
                onPress={handleLogin}
                style={[styles.button, loading && styles.buttonDisabled]}
                disabled={loading}
            >
                <Text style={styles.buttonText}>
                    {loading ? 'Signing In...' : 'Login'}
                </Text>
            </TouchableOpacity>

            <TouchableOpacity
                onPress={() => setStatus(true)}
                disabled={loading}
            >
                <Text style={styles.createAccountText}>Create Account</Text>
            </TouchableOpacity>

            {status && <BottomSheet setStatus={setStatus} />}
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: '#f0fdf4' // Light green background
    },
    title: {
        fontSize: 25,
        fontWeight: 'bold',
        marginBottom: 20,
        color: '#1f2937' // Dark gray
    },
    inputContainer: {
        marginTop: 20,
        width: '100%',
        paddingHorizontal: 25
    },
    input: {
        borderWidth: 1,
        borderColor: '#d1d5db', // Light gray border
        padding: 12,
        marginBottom: 15,
        borderRadius: 8,
        backgroundColor: 'white',
        fontSize: 16
    },
    button: {
        backgroundColor: '#10B981', // Primary green
        padding: 15,
        borderRadius: 8,
        alignItems: 'center',
        marginTop: 10,
        marginBottom: 20,
        width: '90%',
        shadowColor: '#10B981',
        shadowOffset: {
            width: 0,
            height: 2,
        },
        shadowOpacity: 0.2,
        shadowRadius: 4,
        elevation: 4,
    },
    buttonDisabled: {
        backgroundColor: '#9ca3af', // Disabled gray
        shadowOpacity: 0,
        elevation: 0,
    },
    buttonText: {
        fontSize: 18,
        fontWeight: 'bold',
        color: 'white'
    },
    createAccountText: {
        color: '#10B981', // Primary green
        fontSize: 16,
        fontWeight: '600'
    }
});