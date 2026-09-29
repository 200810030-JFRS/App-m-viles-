import { Dimensions, StyleSheet, Text, View } from 'react-native';
import React, {useState, useEffect} from 'react';
import * as Location from 'expo-location';
import MapView, { Marker } from 'react-native-maps';
import Constants from 'expo-constants';


export default function App() {
  return (
    <View style={styles.container}>
      <MapView style={styles.mapa}/>
    </View>
  );
}

const styles = StyleSheet.create({
  
  mapa:{
    width:Dimensions.get('window').width,
    height:Dimensions.get('window').height,
  },
  
  container: {
    flex: 1,
    backgroundColor: '#fff',
    alignItems: 'center',
    justifyContent: 'center',
  },
});