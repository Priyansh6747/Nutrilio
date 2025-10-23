import { View, ScrollView, StyleSheet } from 'react-native';
import React, {useEffect, useState} from 'react';
import DateNav from "../../Components/Water/DateNav";
import Dashboard from "../../Components/Water/Dashboard";
import HydrationStats from "../../Components/Water/HydrationStats";
import HydrationHistory from "../../Components/Water/HydrationHIstory";
import WeeklyTrends from "../../Components/Water/WeeklyTrends";
import ServerConfig from "../../utils/Config";
import {useUser} from "../../utils/AuthContext";
import AddDrink from "../../Components/Water/AddDrink";

const Journal = () => {
    const {user} = useUser()
    const [selectedDate, setSelectedDate] = useState(new Date());

    const handleDateChange = (newDate) => {
        setSelectedDate(newDate);
    };

    const isToday = () => {
        const today = new Date();
        return selectedDate.toDateString() === today.toDateString();
    };

    return (
        <ScrollView
            style={styles.container}
            contentContainerStyle={styles.contentContainer}
            showsVerticalScrollIndicator={false}
        >
            <DateNav
                selectedDate={selectedDate}
                onDateChange={handleDateChange}
            />

            <Dashboard selectedDate={selectedDate} />

            {isToday() && (
                <AddDrink selectedDate={selectedDate} onDateChange={handleDateChange}/>
            )}

            <HydrationStats selectedDate={selectedDate} />

            <HydrationHistory selectedDate={selectedDate} />

            <WeeklyTrends selectedDate={selectedDate} />
        </ScrollView>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        paddingTop: 20,
        backgroundColor: '#f8fafc',
        marginBottom:80,
    },
    contentContainer: {
        padding: 16,
        gap: 16,
        paddingBottom: 32,
    },
});

export default Journal;