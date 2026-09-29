import { StatusBar } from 'expo-status-bar';
import { useState } from 'react';
import { StyleSheet, Text, View, Modal, Button } from 'react-native';

export default function App2() {
  const [modal, setModal] = useState (false)
  return (
    <View style={styles.container}>
      <Modal
       //configuración del modal
       animationType='fade'
       transparent={true}
       visible={modal}
       >
        <View style={styles.containerModal}>
          <View style={styles.viewModal}>
            <Text>Esto esta dentro del modal</Text>
            <Button
              title = "Cerrar Modal"
              onPress={() => setModal (!modal)}
            />
          
          </View>
        </View>
      </Modal>
      <Text>Este texto esta fuera del modal</Text>

      <Button
        title = "Mostrar Modal"
        onPress={() => setModal (!modal)}/>
      <StatusBar style="auto" />
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
  containerModal:{
    flex: 1,
    alignItems: 'stretch',
    justifyContent: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.5)'
  },
  viewModal:{
    flex: 1,
    backgroundColor: '#ffff',
    alignItems: 'center',
    justifyContent: 'center',
    marginHorizontal: 20,
    marginVertical: 20
  },
});
