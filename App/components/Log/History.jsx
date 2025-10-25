import {View, Text, ActivityIndicator, ScrollView, StyleSheet} from 'react-native'
import React, {useState, useEffect} from 'react'
import {useUser} from "../../utils/AuthContext";
import MealCard from "./MealCard";
import ServerConfig from "../../utils/Config";

const formatDate = (date) => {
    if (!(date instanceof Date)) date = new Date(date);
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
};

const History = ({selectedDate, refresh}) => {
    const {user} = useUser()
    const [meals, setMeals] = useState([])
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState(null)

    const isToday = () => {
        const today = new Date();
        return selectedDate.toDateString() === today.toDateString();
    };

    const fetchData = async () => {
        try {
            setLoading(true)
            setError(null)

            const URL = `${ServerConfig.BaseURL}/api/v1/log/meals/daily?username=${user.uid}&date=${formatDate(selectedDate)}`;

            const response = await fetch(URL)

            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`)
            }

            const data = await response.json()

            if (data.status === "success") {
                setMeals(data.meals || [])
            } else {
                throw new Error("Failed to fetch meals")
            }
        } catch (err) {
            console.error("Error fetching meals:", err)
            setError(err.message)
            setMeals([])
        } finally {
            setLoading(false)
        }
    }

    useEffect(() => {
        if (user?.uid && selectedDate) {
            fetchData()
        }
    }, [selectedDate, refresh, user?.uid])

    if (loading) {
        return (
            <View style={styles.centerContainer}>
                <ActivityIndicator size="large" color="#0000ff" />
                <Text style={styles.loadingText}>Loading meals...</Text>
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

    if (meals.length === 0) {
        return (
            <View style={styles.centerContainer}>
                <Text style={styles.emptyText}>No meals logged for this date</Text>
            </View>
        )
    }

    return (
        <ScrollView style={styles.container}>
            <Text style={styles.headerText}>
                Meals
            </Text>
            {meals.map((meal) => (
                <MealCard
                    key={meal.id}
                    data={meal}
                />
            ))}
        </ScrollView>
    )
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        padding: 16,
    },
    centerContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        padding: 20,
    },
    headerText: {
        fontSize: 20,
        fontWeight: 'bold',
        marginBottom: 8,
    },
    countText: {
        fontSize: 14,
        color: '#666',
        marginBottom: 16,
    },
    loadingText: {
        marginTop: 10,
        fontSize: 16,
        color: '#666',
    },
    errorText: {
        fontSize: 16,
        color: 'red',
        textAlign: 'center',
    },
    emptyText: {
        fontSize: 16,
        color: '#999',
        textAlign: 'center',
    },
})

export default History