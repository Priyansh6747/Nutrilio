import {Stack, Tabs} from 'expo-router';
import { View, Text , StyleSheet, Platform } from 'react-native';
import React from 'react';
import {Ionicons} from "@expo/vector-icons";
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import MaskedView from '@react-native-masked-view/masked-view';

const GradientIcon = ({ name, size, focused }) => {
    if (!focused) {
        return <Ionicons name={name} size={size} color="rgba(100, 116, 139, 0.6)" />;
    }

    return (
        <MaskedView
            maskElement={<Ionicons name={name} size={size} color="#000" />}
        >
            <LinearGradient
                colors={['#0ea5e9', '#06b6d4', '#14b8a6']}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
                style={{ width: size, height: size }}
            />
        </MaskedView>
    );
};

export default function RootLayout() {
    const insets = useSafeAreaInsets();

    return (
        <Tabs
            screenOptions={{
                headerShown: false,
                tabBarStyle: {
                    ...styles.navBar,
                    height: 65 + insets.bottom,
                    paddingBottom: insets.bottom,
                },
                tabBarShowLabel: true,
                tabBarLabelStyle: styles.tabBarLabel,
                tabBarItemStyle: styles.navBarItem,
                tabBarActiveTintColor: "#0ea5e9",
                tabBarInactiveTintColor: "rgba(100, 116, 139, 0.6)",
            }}
        >
            <Tabs.Screen
                name="index"
                options={{
                    title: "Home",
                    tabBarIcon: ({ focused }) => (
                        <GradientIcon
                            name={focused ? "home" : "home-outline"}
                            size={24}
                            focused={focused}
                        />
                    ),
                }}
            />
            <Tabs.Screen
                name="Log"
                options={{
                    title: "Log Food",
                    tabBarIcon: ({ focused }) => (
                        <GradientIcon
                            name={focused ? "add-circle" : "add-circle-outline"}
                            size={24}
                            focused={focused}
                        />
                    ),
                }}
            />
            <Tabs.Screen
                name="Journal"
                options={{
                    title: "Water",
                    tabBarIcon: ({ focused }) => (
                        <GradientIcon
                            name={focused ? "water" : "water-outline"}
                            size={24}
                            focused={focused}
                        />
                    ),
                }}
            />
            <Tabs.Screen
                name="Profile"
                options={{
                    title: "Profile",
                    tabBarIcon: ({ focused }) => (
                        <GradientIcon
                            name={focused ? "person" : "person-outline"}
                            size={24}
                            focused={focused}
                        />
                    ),
                }}
            />
        </Tabs>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    navBar: {
        position: 'absolute',
        backgroundColor: 'rgba(255, 255, 255, 0.85)',
        borderTopWidth: 1,
        borderTopColor: 'rgba(226, 232, 240, 0.8)',
        paddingTop: 10,
        backdropFilter: 'blur(10px)',
    },
    navBarItem: {
        justifyContent: 'center',
        alignItems: 'center',
    },
    tabBarLabel: {
        fontSize: 11,
        fontWeight: '600',
        marginTop: 4,
    },
});