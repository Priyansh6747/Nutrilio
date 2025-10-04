import { Stack } from 'expo-router';
import { UserProvider, useUser } from '../utils/AuthContext';
import Loader from '../Components/Loader'
import {Text, View} from "react-native";

function RootLayoutContent() {
    const {
        isLoading,
        canAccessTabs,
        canAccessOnboarding,
        canAccessVerifyEmail,
        shouldShowSignin
    } = useUser();

    if (isLoading) {
         return <Loader/>
    }

    return (
        <Stack screenOptions={{ headerShown: false }}>
            <Stack.Protected guard={canAccessTabs}>
                <Stack.Screen name="(tabs)" />
            </Stack.Protected>
            <Stack.Protected guard={canAccessOnboarding}>
                <Stack.Screen name="Onboarding" />
            </Stack.Protected>
            <Stack.Protected guard={canAccessVerifyEmail}>
                <Stack.Screen name="verifyemail" />
            </Stack.Protected>
            <Stack.Protected guard={shouldShowSignin}>
                <Stack.Screen name="Signin" />
            </Stack.Protected>
        </Stack>
    );
}

export default function RootLayout() {
    return (
        <UserProvider>
            <RootLayoutContent />
        </UserProvider>
    );
}
