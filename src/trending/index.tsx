import { useState, useEffect } from "react";
import { FlatList } from "react-native";
import { CardHorizontalFood } from "./food";


export function TrendingFoods() {
 return (
    <FlatList 
        data={foods}
        renderItem={ ( {item}) => <CardHorizontalFood /> }
    />
 );
}