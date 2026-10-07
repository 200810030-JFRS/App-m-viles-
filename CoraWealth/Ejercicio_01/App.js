import { StatusBar } from 'expo-status-bar';
import { StyleSheet, Text, View } from 'react-native';
import MiComponente from './componentes/MiComponente';
import Mensaje from './componentes/Mensaje';

export default function App() {
  //Logica del componente
  
  return (
    <View style={styles.container}>
      <Mensaje titulo="Hola desde una propiedad" numero="25"/>
      <Mensaje titulo="Bienvenido al curso de React Native" numero="30"/>
      <Text>Open up App.js to start working on your app!</Text>
      <StatusBar style="auto" />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#6e70a6',
    alignItems: 'center',
    justifyContent: 'center',
  },
});
