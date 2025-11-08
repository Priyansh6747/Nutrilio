import {View, Text, ScrollView , StyleSheet} from 'react-native'
import React, {Component} from 'react'
import FoodRecomendation from "../../Components/Home/FoodRecomendation";
import InsightComponent from "../../Components/Home/Insights";
const Insights = ()=>{
    return (
        <ScrollView style={styles.container}>
            <InsightComponent/>
            <FoodRecomendation/>
        </ScrollView>
    )
}

export default Insights

const styles = StyleSheet.create({
    container: {
        flex: 1,
        marginBottom: 90,
    }
})