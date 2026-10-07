import React from 'react';
import {View, Button} from 'react-native';

export default function HomeScreen({navigation}) {
    return (
        <View style={{flex: 1, justifyContent: 'center', padding: 20}}>
            <Button title= "Calculadora IMC" onPress={() => navigation.navigate('IMC')} />
            <Button title= "Conversor Divisas" onPress={() => navigation.navigate('Currency')} />
            <Button title= "Calculadora Propina" onPress={() => navigation.navigate('Tip')} />

        </View>
    );
}   