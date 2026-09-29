import { StatusBar } from 'expo-status-bar';
import { StyleSheet, Text, View } from 'react-native';
import AccelerometerSensor from './components/AccelerometesSensor';
import DadosAcelerometro from './components/DadosAcelerometro';
import GyroscopeSensor from './components/GyroscopeSensor';
import BolitaInclinacion from './components/BolitaInclinacion';
import MagnetometerSensor from './components/MagnetometerSensor.js';
import Brujula from './components/Brujula.js';
import PedometerSensor from './components/PedometerSensor.js';
export default function App() {
  return (
    <View style={styles.container}>
      <PedometerSensor/>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    alignItems: 'center',
    justifyContent: 'center',
  },
});
