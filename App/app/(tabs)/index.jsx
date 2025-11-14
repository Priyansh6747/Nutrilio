import {View, Text, ScrollView, StyleSheet, ActivityIndicator} from 'react-native'
import React, {useState, useEffect} from 'react'
import Heading from "../../Components/Home/Heading";
import WeeklyNutrition from "../../Components/Home/WeeklyNutrition";
import TopNutrient from "../../Components/Home/TopNutrient";
import NutrientTimeline from "../../Components/Home/NutrientTimeline";
import NutrientDistribution from "../../Components/Home/NutrientDistribution";
import EngagementChart from "../../Components/Home/EngagementChart";

const Index = () => {
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        // Simulate component loading time
        const timer = setTimeout(() => {
            setIsLoading(false);
        }, 2000); // 1.5 seconds to match your loading time

        return () => clearTimeout(timer);
    }, []);

    if (isLoading) {
        return (
            <View style={styles.loaderContainer}>
                <ActivityIndicator size="large" color="#4CAF50" />
                <Text style={styles.loaderText}>Loading Dashboard...</Text>
            </View>
        );
    }

    return (
        <View style={styles.container}>
            <Heading/>
            <ScrollView style={styles.scrollView}>
                <WeeklyNutrition/>
                <TopNutrient/>
                <NutrientTimeline/>
                <NutrientDistribution/>
                <EngagementChart/>
            </ScrollView>
        </View>
    )
}

export default Index

const styles = StyleSheet.create({
    container: {
        flex: 1,
        marginBottom: 90,
        paddingTop: 20
    },
    scrollView: {
        flex: 1,
    },
    loaderContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: '#fff',
    },
    loaderText: {
        marginTop: 12,
        fontSize: 16,
        color: '#666',
        fontWeight: '500',
    }
})