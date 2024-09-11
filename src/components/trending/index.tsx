import { useState, useEffect } from "react";
import { FlatList } from "react-native";
import { CardFood } from "./food";

interface FoodProps{
    id: string;
    name: string;
    price: number;
    time: string;
    delivery: number;
    rating: number;
    image: string;
    restaurants: string;
}
export function TrendingFoods() {
    const [ foods, setFoods ] = useState<FoodProps[]>([])

    useEffect(() => {
        async function getFoods(){
            const response = await fetch("http://192.168.0.20:3000/foods")
            const data = await response.json()
            setFoods(data);
        }

        getFoods();
    }, [])

    return (
   <FlatList 
        data={foods}
        renderItem={ ({ item }) => < CardFood food={item} /> }
        horizontal={true}
   />
 );
}