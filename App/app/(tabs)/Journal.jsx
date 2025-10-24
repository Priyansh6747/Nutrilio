import { ScrollView, StyleSheet, View } from 'react-native';
import React, { useState } from 'react';
import DateNav from "../../Components/Water/DateNav";
import Dashboard from "../../Components/Water/Dashboard";
import HydrationHistory from "../../Components/Water/HydrationHIstory";
import WeeklyTrends from "../../Components/Water/WeeklyTrends";
import AddDrink from "../../Components/Water/AddDrink";
import Streak from "../../Components/Water/Streak";

const Journal = () => {
    const [selectedDate, setSelectedDate] = useState(new Date());
    const [refreshKey, setRefreshKey] = useState(0);

    const handleDateChange = (newDate) => {
        setSelectedDate(newDate);
    };

    const handleRefresh = () => {
        // Increment refresh key to trigger re-render of all components
        setRefreshKey(prev => prev + 1);
    };

    const isToday = () => {
        const today = new Date();
        return selectedDate.toDateString() === today.toDateString();
    };

    return (
        <View style={styles.wrapper}>
            <View style={styles.streakContainer}>
                <Streak key={`streak-${refreshKey}`} />
            </View>

            <ScrollView
                style={styles.container}
                contentContainerStyle={styles.contentContainer}
                showsVerticalScrollIndicator={false}
            >
                <DateNav
                    selectedDate={selectedDate}
                    onDateChange={handleDateChange}
                />

                <Dashboard
                    selectedDate={selectedDate}
                    key={`dashboard-${refreshKey}-${selectedDate.toDateString()}`}
                />

                {isToday() && (
                    <AddDrink
                        selectedDate={selectedDate}
                        onDateChange={handleDateChange}
                        onDrinkAdded={handleRefresh}
                    />
                )}

                <HydrationHistory
                    selectedDate={selectedDate}
                    key={`history-${refreshKey}-${selectedDate.toDateString()}`}
                />

                <WeeklyTrends
                    selectedDate={selectedDate}
                    key={`trends-${refreshKey}-${selectedDate.toDateString()}`}
                />
            </ScrollView>
        </View>
    );
};

const styles = StyleSheet.create({
    wrapper: {
        flex: 1,
        backgroundColor: '#f8fafc',
    },
    streakContainer: {
        position: 'absolute',
        top: 100,
        right: 40,
        zIndex: 1000,
    },
    container: {
        flex: 1,
        paddingTop: 20,
        backgroundColor: '#f8fafc',
        marginBottom: 80,
    },
    contentContainer: {
        padding: 16,
        gap: 16,
        paddingBottom: 32,
    },
});

export default Journal;