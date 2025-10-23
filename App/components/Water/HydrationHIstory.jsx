import {View, Text, ActivityIndicator, StyleSheet} from 'react-native'
import React, {useState, useEffect} from 'react'
import DrinkCard from "./DrinkCard";
import ServerConfig from "../../utils/Config";
import {useUser} from "../../utils/AuthContext";

const HydrationHistory = ({selectedDate}) => {
    const baseURL = ServerConfig.BaseURL;
    const {user} = useUser()
    const username = user.uid

    const [drinks, setDrinks] = useState([])
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState(null)

    // Format date to YYYY-MM-DD
    const formatDate = (date) => {
        const d = date || new Date()
        return d.toISOString().split('T')[0]
    }
    const isToday = () => {
        const today = new Date();
        return selectedDate.toDateString() === today.toDateString();
    };

    const fetchWaterIntakes = async () => {
        try {
            setLoading(true)
            setError(null)

            const date = formatDate(selectedDate)
            const URL = `${baseURL}/api/v1/water/water/intake/${username}/date/${date}`;
            const response = await fetch(URL)

            if (!response.ok) {
                throw new Error('Failed to fetch water intakes')
            }

            const data = await response.json()
            setDrinks(data)
        } catch (err) {
            setError(err.message)
            console.error('Error fetching water intakes:', err)
        } finally {
            setLoading(false)
        }
    }

    useEffect(() => {
        if (username) {
            fetchWaterIntakes()
        }
    }, [username, selectedDate])

    if (loading) {
        return (
            <View style={styles.centerContainer}>
                <ActivityIndicator size="large" color="#0000ff" />
            </View>
        )
    }

    if (error) {
        return (
            <View style={styles.centerContainer}>
                <Text style={styles.errorText}>Error: {error}</Text>
            </View>
        )
    }

    return (
        <View style={styles.container}>
            <View style={styles.headerContainer}>
                <Text style={styles.headerTitle}>{isToday()?"Recent Drinks":"Activity"}</Text>
                <Text style={styles.headerSubtitle}>Track your hydration journey</Text>
            </View>

            {drinks.length === 0 ? (
                <View style={styles.emptyContainer}>
                    <Text style={styles.emptyText}>No water intake recorded for this date</Text>
                </View>
            ) : (
                <View style={styles.listContent}>
                    {drinks.map((item) => (
                        <DrinkCard
                            key={item.id}
                            id={item.id}
                            amount={item.amount}
                            timestamp={item.timestamp}
                            onDelete={fetchWaterIntakes}
                        />
                    ))}
                </View>
            )}
        </View>
    )
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    headerContainer: {
        paddingHorizontal: 20,
        paddingTop: 24,
        paddingBottom: 16,
        backgroundColor: '#f8f9fa',
        borderBottomWidth: 1,
        borderBottomColor: '#e9ecef',
    },
    headerTitle: {
        fontSize: 28,
        fontWeight: 'bold',
        color: '#212529',
        marginBottom: 4,
    },
    headerSubtitle: {
        fontSize: 14,
        color: '#6c757d',
        fontWeight: '400',
    },
    centerContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        padding: 20,
    },
    listContent: {
        padding: 16,
    },
    emptyContainer: {
        paddingVertical: 40,
        alignItems: 'center',
    },
    errorText: {
        color: 'red',
        fontSize: 16,
    },
    emptyText: {
        color: '#666',
        fontSize: 16,
    },
})

export default HydrationHistory