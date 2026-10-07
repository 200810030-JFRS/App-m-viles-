import { StatusBar } from 'expo-status-bar';
import { StyleSheet, Text, View } from 'react-native';
import  Banner  from "./componentes/Banner";
import RepText from './componentes/ReplicaTexto';

export default function App() {
  return (
    <View style={styles.container}>
      <RepText/>
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
