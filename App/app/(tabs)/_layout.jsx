import {Stack, Tabs} from 'expo-router';
import { View, Text , StyleSheet, Platform } from 'react-native';
import React from 'react';
import {Ionicons} from "@expo/vector-icons";
import { useSafeAreaInsets } from 'react-native-safe-area-context';

export default function RootLayout() {
    const insets = useSafeAreaInsets();

    return (
        <Tabs
            screenOptions={{
                headerShown: false,
                tabBarStyle: {
                    ...styles.navBar,
                    height: 60 + insets.bottom, // Dynamic height based on device
                    paddingBottom: insets.bottom, // Add padding for nav bar
                },
                tabBarShowLabel: true,
                tabBarLabelStyle: styles.tabBarLabel,
                tabBarItemStyle: styles.navBarItem,
                tabBarActiveTintColor: "#4CAF50", // Green color for active items
                tabBarInactiveTintColor: "#9E9E9E", // Gray color for inactive items
            }}
        >
            <Tabs.Screen
                name="index"
                options={{
                    title: "Home",
                    tabBarIcon: ({ color, size, focused}) => (
                        <Ionicons name={focused ? "home" : "home-outline"} size={24} color={color} />
                    ),
                }}
            />
            <Tabs.Screen
                name="Log"
                options={{
                    title: "Log Food",
                    tabBarIcon: ({ color, size, focused}) => (
                        <Ionicons name={focused ? "add-circle" : "add-circle-outline"} size={24} color={color} />
                    ),
                }}
            />
            <Tabs.Screen
                name="Journal"
                options={{
                    title: "Journal",
                    tabBarIcon: ({ color, size, focused }) => (
                        <Ionicons name={focused ? "clipboard" : "clipboard-outline"} size={24} color={color} />
                    ),
                }}
            />
            <Tabs.Screen
                name="Profile"
                options={{
                    title: "Profile",
                    tabBarIcon: ({ color, size, focused }) => (
                        <Ionicons name={focused ? "person" : "person-outline"} size={24} color={color} />
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
        backgroundColor: '#FFFFFF',
        borderTopWidth: 1,
        borderTopColor: '#E0E0E0',
        paddingTop: 10,
    },
    navBarItem: {
        justifyContent: 'center',
        alignItems: 'center',
    },
    tabBarLabel: {
        fontSize: 12,
        fontWeight: '500',
        marginTop: 4,
    },
});