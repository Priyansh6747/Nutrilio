import {Stack, Tabs} from 'expo-router';
import { View, Text , StyleSheet } from 'react-native';
import React from 'react';
import {Ionicons} from "@expo/vector-icons";

export default function RootLayout() {
    return (
        <Tabs
            screenOptions={{
                headerShown: false,
                tabBarStyle: styles.navBar,
                tabBarShowLabel: false,
                tabBarItemStyle: styles.navBarItem,
                tabBarActiveTintColor: "#ff7600",
            }}
        >
            <Tabs.Screen
                name="index"
                options={{
                    title: "Home",
                    tabBarIcon: ({ color, size, focused}) => (
                        <Ionicons name={focused ? "home" : "home-outline"} size={size} color={color} />
                    ),
                }}
            />
            <Tabs.Screen
                name="Explore"
                options={{
                    title: "Explore",
                    tabBarIcon: ({ color, size, focused}) => (
                        <Ionicons name={focused ? "search" : "search-outline"} size={size} color={color} />
                    ),
                }}
            />
            <Tabs.Screen
                name="Create"
                options={{
                    title: "Create",
                    tabBarIcon: ({ color, size, focused }) => (
                        <Ionicons name={focused ? "add-circle" : "add-circle-outline"} size={size} color={color} />
                    ),
                }}
            />
            <Tabs.Screen
                name="World"
                options={{
                    title: "World",
                    tabBarIcon: ({ color, size, focused }) => (
                        <Ionicons name={focused ? "globe" : "globe-outline"} size={size} color={color} />
                    ),
                }}
            />
            <Tabs.Screen
                name="Profile"
                options={{
                    title: "Profile",
                    tabBarIcon: ({ color, size, focused }) => (
                        <Ionicons name={focused ? "person" : "person-outline"} size={size} color={color} />
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
        height: '5%',
        width: '90%',
        bottom: 30,
        marginLeft: '5%',
        borderRadius: 25,
        shadowColor: '#000',
        shadowOffset: {
            width: 0,
            height: 2,
        },
        shadowOpacity: 0.32,
        shadowRadius: 3.15,
        elevation: 5,
        paddingTop: 5,
    },
    navBarItem: {
        height: '100%',
        justifyContent: 'center',
        alignItems: 'center',
    },
});