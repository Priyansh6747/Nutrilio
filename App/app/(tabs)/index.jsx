import {View, Text, ScrollView , StyleSheet} from 'react-native'
import React from 'react'
import Heading from "../../Components/Home/Heading";
import WeeklyNutrition from "../../Components/Home/WeeklyNutrition";
import TopNutrient from "../../Components/Home/TopNutrient";
import NutrientTimeline from "../../Components/Home/NutrientTimeline";
import NutrientDistribution from "../../Components/Home/NutrientDistribution";
import FoodRecomendation from "../../Components/Home/FoodRecomendation";
import EngagementChart from "../../Components/Home/EngagementChart";

const Index = () => {
    return (
        <View style={styles.container}>
            <Heading/>
            <ScrollView style={styles.scrollView}>
                <WeeklyNutrition/>
                <TopNutrient/>
                <NutrientTimeline/>
                <NutrientDistribution/>
                <FoodRecomendation/>
                <EngagementChart/>
            </ScrollView>
        </View>
    )
}
export default Index

const styles = StyleSheet.create({
    container: {
        flex: 1,
        marginBottom:90,
        paddingTop:20
    },
    scrollView: {
        flex: 1,
    }
})